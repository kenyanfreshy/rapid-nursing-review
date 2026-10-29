// Checks the committed web bundle (mobile/assets/web) before a store build, without changing it.
//
//   node scripts/verify-web-bundle.mjs                 fail unless the committed bundle is exactly what
//                                                      `npm run build:web` would produce from ../dist now
//   node scripts/verify-web-bundle.mjs --accept-stale  (or RNR_ACCEPT_STALE_WEB_BUNDLE=1) allow a bundle that is older than ../dist (an explicit
//                                                      decision to ship the committed bundle, not current source)
//
// Always checked: manifest.js lists exactly the shipped files and WEB_VERSION is the hash build-web.mjs would
// compute for them (so a hand-patched index.html can't ship with a stale version, which would stop installed
// apps from re-copying the new files).
// Compared: a fresh build into a temporary folder (build-web.mjs with WEB_OUT), ignoring only the dated build
// marker. Differences are summarised so the owner can see which source changes are not in the bundle.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const committed = path.join(root, 'assets', 'web');
// The owner's decision to ship the committed bundle can also be given as RNR_ACCEPT_STALE_WEB_BUNDLE=1
// (so `npm run build:ios` can be used unchanged once that decision is made).
const acceptStale = process.argv.includes('--accept-stale') || process.env.RNR_ACCEPT_STALE_WEB_BUNDLE === '1';
const errors = [];

function readManifest(dir) {
  const src = fs.readFileSync(path.join(dir, 'manifest.js'), 'utf8');
  const version = (src.match(/WEB_VERSION = '([0-9a-f]{12})'/) || [])[1];
  const access = (src.match(/BOOK_ACCESS = '(\w+)'/) || [])[1];
  const files = [...src.matchAll(/^  '([^']+)': require\('\.\/\1'\),$/gm)].map((m) => m[1]);
  return { version, access, files };
}
const versionOf = (dir, files) => { const h = crypto.createHash('sha256'); for (const f of files) h.update(f).update(fs.readFileSync(path.join(dir, f))); return h.digest('hex').slice(0, 12); };

// 1. Integrity of what is committed
const m = readManifest(committed);
if (!m.version || !m.files.length) errors.push('assets/web/manifest.js is not in the format build-web.mjs writes');
else {
  const missing = m.files.filter((f) => !fs.existsSync(path.join(committed, f)));
  if (missing.length) errors.push(`manifest lists files that are missing: ${missing.slice(0, 5).join(', ')}`);
  else if (versionOf(committed, m.files) !== m.version) errors.push(`WEB_VERSION ${m.version} does not match the committed files (expected ${versionOf(committed, m.files)}); installed apps would not pick up the change`);
  const onDisk = ['index.html', ...fs.readdirSync(path.join(committed, 'pages')).map((f) => `pages/${f}`)].sort();
  if (onDisk.join() !== [...m.files].sort().join()) errors.push('assets/web contains files the manifest does not list (or the reverse)');
}

// 2. Compare with a fresh build from ../dist
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rnr-web-'));
try {
  execFileSync(process.execPath, [path.join(here, 'build-web.mjs')], { env: { ...process.env, WEB_OUT: tmp, ...(m.access === 'preview' ? { BOOK_ACCESS: 'preview' } : {}) }, stdio: 'ignore' });
  const norm = (s) => s.replace(/RNR-WEB-BUILD sync-v1 \d{4}-\d{2}-\d{2}/, 'RNR-WEB-BUILD sync-v1 DATE');
  const a = norm(fs.readFileSync(path.join(committed, 'index.html'), 'utf8')).split('\n');
  const b = norm(fs.readFileSync(path.join(tmp, 'index.html'), 'utf8')).split('\n');
  const fresh = readManifest(tmp);
  const pagesDiffer = fresh.files.join() !== m.files.join() || fresh.files.some((f) => f !== 'index.html' && !fs.readFileSync(path.join(tmp, f)).equals(fs.readFileSync(path.join(committed, f))));
  const sa = new Set(a), sb = new Set(b);
  const onlyCommitted = a.filter((l) => !sb.has(l)), onlySource = b.filter((l) => !sa.has(l));
  if (!onlyCommitted.length && !onlySource.length && !pagesDiffer) {
    console.log(`verify-web-bundle: committed bundle matches a fresh build from ../dist (version ${m.version})`);
  } else {
    const msg = `committed bundle differs from a fresh build of ../dist: ${onlySource.length} line(s) only in current source, ${onlyCommitted.length} only in the bundle${pagesDiffer ? ', page images differ' : ''}`;
    console.log('verify-web-bundle: ' + msg);
    for (const l of onlySource.slice(0, 12)) console.log('   + ' + l.trim().slice(0, 140));
    if (onlySource.length > 12) console.log(`   … ${onlySource.length - 12} more`);
    if (acceptStale) console.log('verify-web-bundle: --accept-stale given: shipping the COMMITTED bundle (current ../dist changes above are NOT included)');
    else errors.push(msg + '. Decide: run `npm run build:web` and commit it (ships everything in ../dist), or rerun with --accept-stale (ships the committed bundle as is).');
  }
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }

if (errors.length) { for (const e of errors) console.error('ERROR: ' + e); process.exit(1); }
