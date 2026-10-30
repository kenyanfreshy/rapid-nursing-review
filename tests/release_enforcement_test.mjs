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
// Key-check fixtures: the replacement-mode approval is tested on its own (below), so here it is marked approved
// (TEST FIXTURE, not the owner's approval) and its source path made absolute for the temp folder.
const PRM_FIXTURE = registry.playReplacementMode && { ...registry.playReplacementMode, approved: true, source: resolve(dirname(registryPath), registry.playReplacementMode.source) };
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
  writeFileSync(p, JSON.stringify({ ...registry, appJson: resolve(dirname(registryPath), registry.appJson), playReplacementMode: PRM_FIXTURE,
    expected: { ...registry.expected, [platform]: { fingerprint: fingerprint(key), source: "TEST FIXTURE (not real evidence)", confirmed: true } } }));
  return p;
}
// The repo's registry is now confirmed from the RevenueCat dashboard, so the "stops" checks use a copy of it with
// every identity marked unconfirmed, and a copy of app.json with one key turned back into a placeholder.
function unconfirmedRegistry(appJson = resolve(dirname(registryPath), registry.appJson)) {
  const dir = mkdtempSync(join(tmpdir(), "rc-unc-")), p = join(dir, "revenuecat-keys.json");
  const expected = Object.fromEntries(Object.entries(registry.expected).map(([k, v]) => [k, v && { ...v, confirmed: false }]));
  writeFileSync(p, JSON.stringify({ ...registry, appJson, expected }));
  return p;
}
function placeholderRegistry(platform) {
  const appJsonPath = resolve(dirname(registryPath), registry.appJson), app = JSON.parse(readFileSync(appJsonPath, "utf8"));
  app.expo.extra[platform === "ios" ? "revenueCatAppleKey" : "revenueCatGoogleKey"] = platform === "ios" ? "appl_xxxxxxxxxx" : "goog_xxxxxxxxxx";
  const dir = mkdtempSync(join(tmpdir(), "rc-ph-")); writeFileSync(join(dir, "app.json"), JSON.stringify(app));
  const p = join(dir, "revenuecat-keys.json"); writeFileSync(p, JSON.stringify({ ...registry, appJson: join(dir, "app.json") }));
  return p;
}
const UNC = unconfirmedRegistry();
const run = (args, env, sb) => spawnSync(NPM, args, { cwd: PKG_DIR, encoding: "utf8", env: { ...process.env, ...env, PATH: `${sb.bin}:${process.env.PATH}` } });
const scripts = JSON.parse(readFileSync(join(PKG_DIR, "package.json"), "utf8")).scripts;

for (const platform of Object.values(PLATFORMS).filter(Boolean)) {
  const script = `build:${platform}`;
  if (!scripts[script]) { check(`${script} script exists`, false, "missing"); continue; }
  check(`${script} runs the release check before eas build`, /check-release\.mjs --platform \w+ --production &&/.test(scripts[script]) && scripts[script].indexOf("check-release") < scripts[script].indexOf("eas build"));
  let sb = sandbox(); let r = run(["run", "-s", script], { RC_KEY_REGISTRY: UNC }, sb);
  check(`${script}: with identity unconfirmed the check fails and eas build is NEVER called`, r.status !== 0 && !/eas build/.test(sb.calls()), (r.stdout + r.stderr).slice(-300));
  r = run(["run", "-s", "eas-build-pre-install"], { EAS_BUILD_PROFILE: "production", EAS_BUILD_PLATFORM: platform, RC_KEY_REGISTRY: UNC }, sandbox());
  check(`EAS hook (profile production, ${platform}): exits non-zero with identity unconfirmed`, r.status !== 0, r.stdout.slice(-200));
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
  r = run(["run", "-s", "eas-build-pre-install"], { EAS_BUILD_PROFILE: "store-2026", EAS_BUILD_PLATFORM: p, RC_KEY_REGISTRY: UNC }, sandbox());
  check("unknown/renamed EAS profile is treated as production (fails closed)", r.status !== 0);
  r = run(["run", "-s", "eas-build-pre-install"], { EAS_BUILD_PROFILE: "preview", EAS_BUILD_PLATFORM: p, RC_KEY_REGISTRY: UNC }, sandbox());
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
  const p = PLATFORMS.missingKey, reg = placeholderRegistry(p);
  const r = run(["run", "-s", "eas-build-pre-install"], { EAS_BUILD_PROFILE: "production", EAS_BUILD_PLATFORM: p, RC_KEY_REGISTRY: reg }, sandbox());
  check(`missing/placeholder ${p} key stops the production build even with other identities confirmed`, r.status !== 0 && /placeholder/.test(r.stdout));
}
// The repo's real registry: every listed platform's identity is confirmed, so the key check passes on its own.
for (const p of registry.platforms) {
  const r = spawnSync(process.execPath, [CHECK, "--platform", p, "--production"], { cwd: dirname(CHECK), encoding: "utf8", env: { ...process.env, RC_KEY_REGISTRY: "" } });
  if (p === "android") {
    // Keys pass; the only stop is the Google Play replacement mode awaiting the owner's approval.
    const errs = (r.stdout.match(/^ERROR \[android\]: .*/gm) || []);
    check("real registry: android key check passes with dashboard-confirmed identity", /verified: matches/.test(r.stdout + r.stderr) || errs.every((e) => /replacement mode/.test(e)), (r.stdout + r.stderr).slice(-300));
    check("real registry: android production build stops only on the unapproved Play replacement mode", r.status === 1 && errs.length === 1 && /pending owner approval/.test(errs[0]), (r.stdout + r.stderr).slice(-400));
  } else check(`real registry: ${p} key check passes with dashboard-confirmed identity`, r.status === 0 && /verified: matches/.test(r.stdout), (r.stdout + r.stderr).slice(-300));
}

// ---- Google Play replacement mode: a billing policy, approved by the owner before production ----
{
  const { checkPlayReplacement } = await import(CHECK);
  const regDir = dirname(registryPath), pol = registry.playReplacementMode || {};
  const codeMode = (/PLAY_REPLACEMENT_MODE\s*=\s*["']([A-Z_]+)["']/.exec(readFileSync(resolve(regDir, pol.source), "utf8")) || [])[1];
  check(`Play replacement mode ${pol.mode} recorded, matches the code, not approved`, !!pol.mode && codeMode === pol.mode && pol.approved === false);
  let r = checkPlayReplacement(registry, regDir, { production: true });
  check("production: unapproved mode is an error", r.errors.length === 1 && /pending owner approval/.test(r.errors[0]));
  r = checkPlayReplacement(registry, regDir, { production: false });
  check("preview: unapproved mode only warns (internal tests can run)", r.errors.length === 0 && r.warnings.length === 1);
  r = checkPlayReplacement({ ...registry, playReplacementMode: { ...pol, approved: true } }, regDir, { production: true });
  check("production: approved mode that matches the code passes", r.errors.length === 0);
  r = checkPlayReplacement({ ...registry, playReplacementMode: { ...pol, mode: "DEFERRED", approved: true } }, regDir, { production: true });
  check("code and registry disagree on the mode: error even when approved", r.errors.length === 1 && new RegExp(`passes Google Play replacement mode ${pol.mode}, but the registry records DEFERRED`).test(r.errors[0]));
  r = checkPlayReplacement({ ...registry, playReplacementMode: undefined }, regDir, { production: true });
  check("production: no recorded mode is an error", r.errors.length === 1);
}
console.log(`\n${pass}/${pass + fail} checks passed`);
process.exit(fail ? 1 : 0);
