// App Review Guideline 2.3.10: the iOS binary must not name other platforms' stores. Critical Care Certified 1.0.0 (15)
// was rejected on 2026-10-30 for Google Play wording. This check reproduces what ships: every JavaScript source the
// iOS bundle can contain is run through the app's own iOS production transform (babel-preset-expo with
// platform "ios": Platform.OS is inlined, then Metro's terser minifier removes the other platforms' branches) and
// scanned for other-store wording. Platform files are resolved like Metro: x.ios.js / x.native.js replace x.js on
// iOS; x.web.js / x.android.js are never in the iOS bundle. Optional --web <file>: an HTML bundle shipped inside
// the app (comments ignored: no one can see them; strings and markup are checked).
//
//   node tools/ios-wording-check.mjs                 run from the app folder (needs its node_modules)
//   node tools/ios-wording-check.mjs --modules <dir> resolve the toolchain from another install (tests)
//   node tools/ios-wording-check.mjs --src <dir>     check sources in another folder (tests)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

export const OTHER_STORE_WORDING = /Google Play|Play Store|play\.google\.com|Android|Chromebook|Google account|Sign in with Google|Google product/g;

const CONFIG = { roots: ["index.js", "App.js", "Paywall.js", "pro.js", "membership.js", "rating"], skip: [/\/node_modules\//, /\.test\.js$/], web: ["assets/web/index.html"] };

/** The files Metro can put in the iOS bundle from these folders. */
export function iosSourceFiles(base, roots = CONFIG.roots, skip = CONFIG.skip) {
  const all = [];
  const walk = (d) => { if (!fs.existsSync(d)) return; for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(js|jsx|ts|tsx)$/.test(f)) all.push(p); } };
  for (const r of roots) { const p = path.join(base, r); fs.existsSync(p) && fs.statSync(p).isFile() ? all.push(p) : walk(p); }
  const set = new Set(all);
  return all.filter((p) => {
    if (skip.some((rx) => rx.test(p))) return false;
    if (/\.(web|android)\.(js|jsx|ts|tsx)$/.test(p)) return false;                // never in the iOS bundle
    const m = p.match(/^(.*)\.(js|jsx|ts|tsx)$/); if (/\.(ios|native)$/.test(m[1])) return true;
    return !["ios", "native"].some((k) => ["js", "jsx", "ts", "tsx"].some((e) => set.has(`${m[1]}.${k}.${e}`)));   // replaced on iOS
  });
}

export async function checkIos({ appDir, srcDir = appDir, modulesDir = appDir, roots, skip, web = [] }) {
  const req = createRequire(path.join(modulesDir, "package.json"));
  const babel = req("@babel/core");
  const preset = (() => { try { return req.resolve("babel-preset-expo"); } catch { return createRequire(req.resolve("expo/package.json")).resolve("babel-preset-expo"); } })();
  const minifier = req("metro-minify-terser"); const minify = minifier.default || minifier;
  const findings = [];
  for (const f of iosSourceFiles(srcDir, roots, skip)) {
    const res = babel.transformSync(fs.readFileSync(f, "utf8"), { filename: path.join(appDir, path.relative(srcDir, f)), cwd: appDir, babelrc: false, configFile: false,
      presets: [[preset, {}]], caller: { name: "metro", bundler: "metro", platform: "ios", isDev: false, isServer: false, supportsStaticESM: false }, envName: "production", sourceType: "module" });
    // Metro wraps each module in a function before minifying it.
    const out = await minify({ code: `__d(function(global,r,i,a,module,exports,d){${res.code}\n});`, map: null, filename: f, reserved: [], config: { compress: { reduce_funcs: false } } });
    for (const m of out.code.matchAll(OTHER_STORE_WORDING)) findings.push({ file: path.relative(srcDir, f), term: m[0], context: out.code.slice(Math.max(0, m.index - 80), m.index + m[0].length + 50) });
  }
  for (const w of web) {
    const html = fs.readFileSync(w, "utf8");
    // Scripts without comments (babel's generator), then the rest of the page.
    const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => { try { return babel.transformSync(m[1], { babelrc: false, configFile: false, comments: false, compact: false, sourceType: "script" }).code; } catch { return m[1]; } });
    const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");
    for (const [what, text] of [["scripts", scripts.join("\n")], ["markup", markup]]) for (const m of text.matchAll(OTHER_STORE_WORDING)) findings.push({ file: `${path.basename(w)} (${what})`, term: m[0], context: text.slice(Math.max(0, m.index - 80), m.index + m[0].length + 50) });
  }
  return findings;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");   // the folder with app.json
  const findings = await checkIos({ appDir, srcDir: arg("--src") ? path.resolve(arg("--src")) : appDir, modulesDir: arg("--modules") ? path.resolve(arg("--modules")) : appDir, web: (CONFIG.web || []).map((w) => path.join(arg("--src") ? path.resolve(arg("--src")) : appDir, w)) });
  if (findings.length) {
    console.log(`ios-wording-check: ${findings.length} other-store reference(s) would ship in the iOS binary (App Review Guideline 2.3.10):`);
    for (const f of findings.slice(0, 20)) console.log(`  ${f.file}: "${f.term}" … ${f.context.replace(/\s+/g, " ")}`);
    process.exit(1);
  }
  console.log("ios-wording-check: no other platform's store in the iOS bundle");
}
