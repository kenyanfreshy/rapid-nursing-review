#!/usr/bin/env node
// Release check for RevenueCat purchase configuration. Stops a store build whose RevenueCat key is missing,
// a Test Store key, meant for the other platform, known to belong to another app's RevenueCat project, or
// different from the fingerprint recorded for this app, or whose entitlement id is wrong. It never prints key
// values, only short SHA-256 fingerprints.
//
// What it can and can't prove: a key's fingerprint only identifies the key. Project identity is "verified" only
// when the registry holds a fingerprint marked confirmed:true, i.e. read from the RevenueCat dashboard (or API)
// by someone authorized. A fingerprint from another source is reported as such and never called verified.
// Production release paths REQUIRE confirmed project identity: with --production, or on EAS with any build
// profile other than "development"/"preview", a missing or unconfirmed fingerprint fails the check.
// RC_REQUIRE_CONFIRMED_FINGERPRINT=1 applies the same rule anywhere else.
//
//   node scripts/check-release.mjs                      # every platform listed in scripts/revenuecat-keys.json
//   node scripts/check-release.mjs --platform android   # one platform
//   node scripts/check-release.mjs --fingerprint        # print this app's key fingerprints (for the registry)
//
// Where it runs: as the EAS "eas-build-pre-install" npm hook on EAS Build (cloud and --local); EAS sets
// EAS_BUILD_PLATFORM and EAS_BUILD_PROFILE there. Hooks don't run in EAS custom builds, or in Xcode/Gradle
// builds made outside EAS, so run this command yourself before those.
//
// On EAS it runs as the "eas-build-pre-install" script: EAS_BUILD_PLATFORM picks the platform and
// EAS_BUILD_PROFILE decides how strict to be (production fails the build; preview warns; development skips).
// Exit code 1 = a problem that would ship a build that can't sell or restore correctly.
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REGISTRY = process.env.RC_KEY_REGISTRY || resolve(HERE, "revenuecat-keys.json");

export const fingerprint = (key) => createHash("sha256").update(String(key)).digest("hex").slice(0, 16);
const PREFIX = { ios: /^appl_/, android: /^(goog_|amzn_)/ };
const FIELD = { ios: "revenueCatAppleKey", android: "revenueCatGoogleKey" };

/** Registry entry → { fingerprint, source, confirmed } (a bare string is an unconfirmed fingerprint). */
export function expectedEntry(registry, platform) {
  const e = (registry.expected || {})[platform];
  if (!e) return null;
  if (typeof e === "string") return { fingerprint: e, source: "unrecorded source", confirmed: false };
  return e.fingerprint ? { fingerprint: e.fingerprint, source: e.source || "unrecorded source", confirmed: e.confirmed === true } : null;
}

/** Pure check over parsed config; returns { errors, warnings, identity } for one platform. */
export function checkPlatform(platform, extra, registry, registryName = "the key registry", opts = {}) {
  const errors = [], warnings = [];
  let identity = "not checked";
  const field = FIELD[platform];
  if (!field) return { errors: [`unknown platform "${platform}"`], warnings };
  const key = extra[field];
  const where = `app.json expo.extra.${field}`;
  if (extra.useTestStore === true) errors.push(`expo.extra.useTestStore is true: a store build would use RevenueCat's Test Store`);
  if (!key || typeof key !== "string" || /REPLACE_ME/i.test(key)) {
    errors.push(`${where} is missing or a placeholder: this ${platform} build can't load plans, buy or restore`);
  } else {
    const fp = fingerprint(key);
    if (/^test_/.test(key) || (extra.revenueCatTestKey && key === extra.revenueCatTestKey)) errors.push(`${where} is a Test Store key (fingerprint ${fp})`);
    else if (!PREFIX[platform].test(key)) errors.push(`${where} is not a ${platform === "ios" ? "Apple (appl_)" : "Google (goog_)"} public SDK key (prefix "${key.slice(0, 5)}", fingerprint ${fp})`);
    if (key.length < 20) errors.push(`${where} is too short to be a RevenueCat public key (${key.length} characters)`);
    for (const [app, fps] of Object.entries(registry.otherApps || {})) {
      if ((fps || []).includes(fp)) errors.push(`${where} (fingerprint ${fp}) is registered to another app ("${app}"): wrong RevenueCat project`);
    }
    const exp = expectedEntry(registry, platform);
    if (exp && exp.fingerprint !== fp) {
      errors.push(`${where} fingerprint ${fp} doesn't match the one recorded for this app (${exp.fingerprint}, ${exp.confirmed ? "confirmed" : "from " + exp.source}) in ${registryName}`);
      identity = "mismatch";
    } else if (exp && exp.confirmed) {
      identity = `verified: matches the fingerprint confirmed from ${exp.source}`;
    } else if (exp) {
      identity = `NOT verified: key matches the fingerprint reported by ${exp.source}, which hasn't been confirmed in RevenueCat`;
      (opts.requireConfirmed ? errors : warnings).push(`project identity not confirmed: ${platform} fingerprint ${fp} comes from ${exp.source}; confirm it in the RevenueCat dashboard and set "confirmed": true in ${registryName}`);
    } else {
      identity = "NOT verified: no expected fingerprint recorded";
      (opts.requireConfirmed ? errors : warnings).push(`project identity not verified: no expected ${platform} fingerprint in ${registryName}; confirm the key in the RevenueCat dashboard, then record "${fp}"`);
    }
  }
  // Entitlement ids the app unlocks with.
  const ent = registry.entitlement;
  if (ent) {
    const got = ent.field.split(".").reduce((o, k) => (o == null ? undefined : o[k]), extra);
    const list = (Array.isArray(got) ? got : [got]).filter((x) => typeof x === "string" && x);
    if (!list.length || list.some((x) => /REPLACE_ME/i.test(x))) errors.push(`expo.extra.${ent.field} is missing: no entitlement would unlock access`);
    else if (ent.expected && !ent.expected.some((x) => list.includes(x))) errors.push(`expo.extra.${ent.field} is ${JSON.stringify(got)}; expected one of ${JSON.stringify(ent.expected)}`);
  }
  return { errors, warnings, identity };
}

/**
 * Google Play plan changes: the replacement mode the app passes (PLAY_REPLACEMENT_MODE in its purchase code) is a
 * billing policy. It must match the registry's playReplacementMode.mode, and a production build needs the owner's
 * approval recorded there (approved: true). Preview builds only warn, so internal device tests can run first.
 */
export function checkPlayReplacement(registry, registryDir, opts = {}) {
  const errors = [], warnings = [];
  const pol = registry.playReplacementMode;
  if (!pol) { (opts.production ? errors : warnings).push("no playReplacementMode in the key registry: Google Play plan-change billing has no recorded approval"); return { errors, warnings }; }
  let src = "";
  try { src = readFileSync(resolve(registryDir, pol.source || ""), "utf8"); } catch { errors.push(`can't read ${pol.source} to check the Google Play replacement mode`); return { errors, warnings }; }
  const m = src.match(/PLAY_REPLACEMENT_MODE\s*=\s*["']([A-Z_]+)["']/);
  if (!m) errors.push(`${pol.source} defines no PLAY_REPLACEMENT_MODE`);
  else if (m[1] !== pol.mode) errors.push(`${pol.source} passes Google Play replacement mode ${m[1]}, but the registry records ${pol.mode}`);
  if (pol.approved !== true) (opts.production ? errors : warnings).push(`Google Play replacement mode ${pol.mode} is pending owner approval (billing policy for plan changes); record it as playReplacementMode.approved: true once approved`);
  return { errors, warnings };
}

function main() {
  const args = process.argv.slice(2);
  if (!existsSync(REGISTRY)) { console.error(`check-release: ${REGISTRY} not found`); process.exit(1); }
  const registry = JSON.parse(readFileSync(REGISTRY, "utf8"));
  const appJson = resolve(dirname(REGISTRY), registry.appJson || "../app.json");
  const extra = (JSON.parse(readFileSync(appJson, "utf8")).expo || {}).extra || {};
  if (args.includes("--fingerprint")) {
    for (const [p, f] of Object.entries(FIELD)) if (extra[f] && !/REPLACE_ME/.test(extra[f])) console.log(`${p}: ${fingerprint(extra[f])}`);
    return;
  }
  const i = args.indexOf("--platform");
  const profile = process.env.EAS_BUILD_PROFILE || "";
  if (profile === "development") { console.log("check-release: development build, skipped"); return; }
  const platforms = i >= 0 ? [args[i + 1]] : process.env.EAS_BUILD_PLATFORM ? [process.env.EAS_BUILD_PLATFORM] : registry.platforms || ["ios", "android"];
  // Production = an explicit --production, or an EAS profile that isn't development/preview (fail closed for
  // renamed or new store profiles).
  const production = args.includes("--production") || (!!profile && profile !== "preview");
  const requireConfirmed = production || process.env.RC_REQUIRE_CONFIRMED_FINGERPRINT === "1";
  if (production) console.log("check-release: production release path — confirmed RevenueCat project identity is required");
  let failed = false;
  for (const p of platforms) {
    const { errors, warnings, identity } = checkPlatform(p, extra, registry, relative(process.cwd(), REGISTRY), { requireConfirmed });
    if (p === "android") { const r = checkPlayReplacement(registry, dirname(REGISTRY), { production }); errors.push(...r.errors); warnings.push(...r.warnings); }
    for (const w of warnings) console.log(`warning [${p}]: ${w}`);
    for (const e of errors) console.log(`${profile === "preview" ? "warning" : "ERROR"} [${p}]: ${e}`);
    if (errors.length && profile !== "preview") failed = true;
    if (!errors.length) console.log(`ok [${p}]: no blocking problems (key present, ${p} key format, not Test Store, not another app's known key, entitlement id) for ${registry.app}. Project identity: ${identity}.${p === "android" ? ` Play replacement mode: ${(registry.playReplacementMode || {}).mode || "none"} (${(registry.playReplacementMode || {}).approved === true ? "approved" : "pending approval"}).` : ""}`);
  }
  if (failed) { console.log("\nRelease check failed. Fix the problems above before building for the store."); process.exit(1); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
