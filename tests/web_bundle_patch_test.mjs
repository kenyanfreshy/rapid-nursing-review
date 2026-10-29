// iOS line only (branch purchase-audit-2026-10-ios). Verifies the narrowly patched web bundle:
//
//   node tests/web_bundle_patch_test.mjs
//
// The committed mobile/assets/web/index.html on web-sync (d702444) was already older than ../dist when the audit
// started (it lacks the 2026-10-22 "Encouragement and celebrations" and "Meet your tutor: NurseBound design"
// source changes). To avoid shipping those unreleased features, the audit edited the committed bundle directly
// instead of regenerating it. This test proves that edit is exactly the audit's source change and nothing else:
//
//   A = committed bundle at the base commit       → committed bundle now          (what the patch changed)
//   B = fresh build of ../dist at the base commit → fresh build of ../dist now     (what the source change changes)
//   A and B must be the same set of changed lines, the patch must only touch purchase/trial wording, and
//   WEB_VERSION must be the hash build-web.mjs computes for the committed files.
// Needs git with the base commit available.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const BASE = process.env.BASE_COMMIT || 'd702444';
const git = (...a) => execFileSync('git', ['-C', ROOT, ...a], { encoding: 'utf8', maxBuffer: 1 << 28 });
let pass = 0, fail = 0;
const check = (n, ok) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n); };
const norm = (s) => s.replace(/RNR-WEB-BUILD sync-v1 \d{4}-\d{2}-\d{2}/, 'RNR-WEB-BUILD sync-v1 DATE');

// Changed lines between two texts (multiset difference, order-insensitive), as "-line" / "+line".
function delta(x, y) {
  const count = (arr) => arr.reduce((m, l) => m.set(l, (m.get(l) || 0) + 1), new Map());
  const cx = count(x.split('\n')), cy = count(y.split('\n')); const out = [];
  for (const [l, n] of cx) for (let i = 0; i < n - (cy.get(l) || 0); i++) out.push('-' + l);
  for (const [l, n] of cy) for (let i = 0; i < n - (cx.get(l) || 0); i++) out.push('+' + l);
  return out.sort();
}
function freshBuild(commit) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnr-wb-'));
  git('worktree', 'add', '-q', '--detach', dir, commit);
  try {
    // Use the CURRENT build script for both builds (the base commit's has no WEB_OUT), building from that commit's dist.
    const out = path.join(dir, 'out');
    fs.copyFileSync(path.join(ROOT, 'mobile/scripts/build-web.mjs'), path.join(dir, 'mobile/scripts/build-web.mjs'));
    execFileSync(process.execPath, [path.join(dir, 'mobile/scripts/build-web.mjs')], { env: { ...process.env, WEB_OUT: out }, stdio: 'ignore' });
    return norm(fs.readFileSync(path.join(out, 'index.html'), 'utf8'));
  } finally { git('worktree', 'remove', '--force', dir); }
}

const baseCommitted = norm(git('show', `${BASE}:mobile/assets/web/index.html`));
const nowCommitted = norm(fs.readFileSync(path.join(ROOT, 'mobile/assets/web/index.html'), 'utf8'));
const A = delta(baseCommitted, nowCommitted);
const B = delta(freshBuild(BASE), freshBuild('HEAD'));
check(`the bundle patch changes ${A.length} lines`, A.length > 0);
check('the bundle patch is exactly the change that rebuilding from the audit source change produces', JSON.stringify(A) === JSON.stringify(B));

const added = A.filter((l) => l.startsWith('+')).join('\n'), removed = A.filter((l) => l.startsWith('-')).join('\n');
check('removed: the fixed "2 weeks free" trial promises', /2 weeks free|2-Week Free Trial|Try it free for/.test(removed));
// (The one added line that mentions the old wording is the regex that recognises and strips it: `const lead = /^(2 weeks free, then )?…`.)
const shown = added.split('\n').filter((l) => !/^\+\s*const lead = \//.test(l)).join('\n').replace(/any free trial come only from the native paywall/g, '');
check('added lines contain no trial promise (other than the regex that strips the old wording)', !/2 weeks free|2-Week Free Trial|Try it free for|free trial for/i.test(shown));
const touched = A.map((l) => l.slice(1)).join('\n');
check('nothing outside purchase/paywall wording was touched (no Oct-22 features: cheer, tutor courses, author section)', !/cheer|tc-course|AK_APPS|AK_BOOKS|coursesFold|akFolds/.test(touched));

const src = fs.readFileSync(path.join(ROOT, 'mobile/assets/web/manifest.js'), 'utf8');
const ver = src.match(/WEB_VERSION = '([0-9a-f]{12})'/)[1];
const files = [...src.matchAll(/^  '([^']+)': require\('\.\/\1'\),$/gm)].map((m) => m[1]);
const h = (await import('node:crypto')).createHash('sha256');
for (const f of files) h.update(f).update(fs.readFileSync(path.join(ROOT, 'mobile/assets/web', f)));
check(`WEB_VERSION ${ver} equals build-web.mjs's hash of the committed files`, h.digest('hex').slice(0, 12) === ver);
check('WEB_VERSION changed from the base (installed apps re-copy the bundle)', ver !== git('show', `${BASE}:mobile/assets/web/manifest.js`).match(/WEB_VERSION = '([0-9a-f]{12})'/)[1]);
const pagesChanged = git('diff', '--name-only', BASE, 'HEAD', '--', 'mobile/assets/web/pages').trim();
check('no page images changed', pagesChanged === '');

console.log(`\n${pass}/${pass + fail} checks passed`);
process.exit(fail ? 1 : 0);
