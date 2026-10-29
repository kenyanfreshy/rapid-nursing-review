// Proves the release check actually STOPS release builds (not just prints). Run from the repo root:
//   node tests/release_enforcement_test.mjs
// `eas` (and an inner `npm run build:web`, if a build script has one) are replaced by recording stubs on
// PATH, so nothing is built or uploaded. What this can't prove: that EAS's servers abort a build when the
// eas-build-pre-install hook exits non-zero (Expo's docs don't state it); only an EAS build can show that.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Per-repo settings (the same file is copied into the CCRN repos with these three lines changed).
const PKG_DIR = join(REPO, "mobile");                       // folder whose package.json has the build scripts
const CHECK = join(REPO, "mobile/scripts/check-release.mjs");
const PLATFORMS = { good: "android", missingKey: null };  // "missingKey": a platform whose key is a placeholder (or null)

const { fingerprint } = await import(CHECK);
const registryPath = join(dirname(CHECK), "revenuecat-keys.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const extra = JSON.parse(readFileSync(resolve(dirname(registryPath), registry.appJson), "utf8")).expo.extra;
const NPM = execFileSync("sh", ["-c", "command -v npm"]).toString().trim();

let pass = 0, fail = 0;
const check = (n, ok, info = "") => { ok ? pass++ : fail++; console.log((ok ? "PASS " : "FAIL ") + n + (ok || !info ? "" : `\n     ${info}`)); };

function sandbox() {
  const bin = mkdtempSync(join(tmpdir(), "rc-bin-")), log = join(bin, "calls.log");
  writeFileSync(join(bin, "eas"), `#!/bin/sh\necho "eas $*" >> "${log}"\n`); chmodSync(join(bin, "eas"), 0o755);
  // Inner "npm run build:web" → recorded and skipped; anything else → the real npm.
  writeFileSync(join(bin, "npm"), `#!/bin/sh\nif [ "$1 $2" = "run build:web" ]; then echo "npm $*" >> "${log}"; exit 0; fi\nexec "${NPM}" "$@"\n`); chmodSync(join(bin, "npm"), 0o755);
  return { bin, log, calls: () => (existsSync(log) ? readFileSync(log, "utf8") : "") };
}
function confirmedRegistry(platform) {
  const key = platform === "ios" ? extra.revenueCatAppleKey : extra.revenueCatGoogleKey;
  const dir = mkdtempSync(join(tmpdir(), "rc-reg-")), p = join(dir, "revenuecat-keys.json");
  writeFileSync(p, JSON.stringify({ ...registry, appJson: resolve(dirname(registryPath), registry.appJson),
    expected: { ...registry.expected, [platform]: { fingerprint: fingerprint(key), source: "TEST FIXTURE (not real evidence)", confirmed: true } } }));
  return p;
}
const run = (args, env, sb) => spawnSync(NPM, args, { cwd: PKG_DIR, encoding: "utf8", env: { ...process.env, ...env, PATH: `${sb.bin}:${process.env.PATH}` } });
const scripts = JSON.parse(readFileSync(join(PKG_DIR, "package.json"), "utf8")).scripts;

for (const platform of Object.values(PLATFORMS).filter(Boolean)) {
  const script = `build:${platform}`;
  if (!scripts[script]) { check(`${script} script exists`, false, "missing"); continue; }
  check(`${script} runs the release check before eas build`, /check-release\.mjs --platform \w+ --production &&/.test(scripts[script]) && scripts[script].indexOf("check-release") < scripts[script].indexOf("eas build"));
  let sb = sandbox(); let r = run(["run", "-s", script], {}, sb);
  check(`${script}: with the repo's real registry the check fails and eas build is NEVER called`, r.status !== 0 && !/eas build/.test(sb.calls()), (r.stdout + r.stderr).slice(-300));
  r = run(["run", "-s", "eas-build-pre-install"], { EAS_BUILD_PROFILE: "production", EAS_BUILD_PLATFORM: platform }, sandbox());
  check(`EAS hook (profile production, ${platform}): exits non-zero with the repo's real registry`, r.status !== 0, r.stdout.slice(-200));
}

// Positive controls: the same paths pass only when a fingerprint is marked confirmed (a test fixture here).
{
  const p = PLATFORMS.good, reg = confirmedRegistry(p);
  // The web-bundle check runs after the RevenueCat check; accept the committed bundle here so the control
  // isolates the RevenueCat check (the bundle check has its own test below).
  let sb = sandbox(); let r = run(["run", "-s", `build:${p}`], { RC_KEY_REGISTRY: reg, RNR_ACCEPT_STALE_WEB_BUNDLE: "1" }, sb);
  check(`control: build:${p} with a confirmed fingerprint reaches "eas build --platform ${p} --profile production"`, r.status === 0 && sb.calls().includes(`eas build --platform ${p} --profile production`), (r.stdout + r.stderr).slice(-300));
  r = run(["run", "-s", "eas-build-pre-install"], { EAS_BUILD_PROFILE: "production", EAS_BUILD_PLATFORM: p, RC_KEY_REGISTRY: reg }, sandbox());
  check(`control: EAS hook (production, ${p}) passes with a confirmed fingerprint`, r.status === 0, r.stdout.slice(-200));
  r = run(["run", "-s", "eas-build-pre-install"], { EAS_BUILD_PROFILE: "store-2026", EAS_BUILD_PLATFORM: p }, sandbox());
  check("unknown/renamed EAS profile is treated as production (fails closed)", r.status !== 0);
  r = run(["run", "-s", "eas-build-pre-install"], { EAS_BUILD_PROFILE: "preview", EAS_BUILD_PLATFORM: p }, sandbox());
  check("preview profile: warns but doesn't stop internal test builds", r.status === 0 && /warning/.test(r.stdout));
}
// Web bundle: a stale committed bundle stops the store build unless the owner explicitly accepts it.
{
  const p = PLATFORMS.good, reg = confirmedRegistry(p), script = scripts[`build:${p}`];
  check(`build:${p} verifies the committed web bundle (does not silently regenerate it) before eas build`,
    /verify-web-bundle\.mjs &&/.test(script) && !/npm run build:web/.test(script) && script.indexOf("verify-web-bundle") < script.indexOf("eas build"));
  const stale = spawnSync(process.execPath, [join(PKG_DIR, "scripts/verify-web-bundle.mjs")], { cwd: PKG_DIR, encoding: "utf8" }).status !== 0;
  let sb = sandbox(); const r = run(["run", "-s", `build:${p}`], { RC_KEY_REGISTRY: reg }, sb);
  if (stale) check(`stale web bundle: build:${p} stops before eas build without the owner's decision`, r.status !== 0 && !/eas build/.test(sb.calls()));
  else check(`current web bundle: build:${p} reaches eas build`, r.status === 0 && /eas build/.test(sb.calls()));
}
if (PLATFORMS.missingKey) {
  const p = PLATFORMS.missingKey, reg = confirmedRegistry(PLATFORMS.good);
  const r = run(["run", "-s", "eas-build-pre-install"], { EAS_BUILD_PROFILE: "production", EAS_BUILD_PLATFORM: p, RC_KEY_REGISTRY: reg }, sandbox());
  check(`missing/placeholder ${p} key stops the production build even with other identities confirmed`, r.status !== 0 && /placeholder/.test(r.stdout));
}
console.log(`\n${pass}/${pass + fail} checks passed`);
process.exit(fail ? 1 : 0);
