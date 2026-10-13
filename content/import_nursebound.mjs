// Imports the NCLEX question bank and NGN case studies from the NurseBound app
// (github.com/kenyanfreshy/usrn-pathway-app) into Rapid Nursing Review's format.
//
//   node content/import_nursebound.mjs /path/to/usrn-pathway-app
//
// Writes content/nclex/bank.json and content/nclex/ngn.json. Only live items are imported
// (active, not retired). NurseBound ids are kept, prefixed "nb:", so saved progress stays stable
// across re-imports.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(process.argv[2] || path.join(here, '..', 'kenyanfreshy', 'usrn-pathway-app'));
const outDir = path.join(here, 'nclex');
fs.mkdirSync(outDir, { recursive: true });

const CAT = {
  'Management of Care': 'moc', 'Safety & Infection Control': 'safety', 'Safety and Infection Control': 'safety',
  'Safety and Infection Prevention and Control': 'safety', 'Health Promotion & Maintenance': 'hpm',
  'Psychosocial Integrity': 'psych', 'Basic Care & Comfort': 'bcc', 'Pharmacological & Parenteral Therapies': 'pharm',
  'Reduction of Risk Potential': 'rrp', 'Physiological Adaptation': 'pa',
};
const STEP = { 'Recognize Cues': 'recognizeCues', 'Analyze Cues': 'analyzeCues', 'Prioritize Hypotheses': 'prioritizeHypotheses',
  'Generate Solutions': 'generateSolutions', 'Take Action': 'takeAction', 'Evaluate Outcomes': 'evaluateOutcomes' };
const TYPE = { single: 'mcq', sata: 'sata', order: 'order' };

// ---- Question bank -------------------------------------------------------
const raw = JSON.parse(fs.readFileSync(path.join(repo, 'src/data/questions.json'), 'utf8'));
const problems = [];
const bank = [];
for (const q of raw) {
  if (!q.active || q.retired || q.bank !== 'NCLEX') continue;
  if (String(q.flag || '').startsWith('Debatable key')) continue; // a disputed answer key is not reliable enough to score
  const type = TYPE[q.type];
  const ids = q.options.map(o => o.id);
  const idx = id => ids.indexOf(id);
  let correct;
  if (type === 'mcq') correct = idx(q.answer);
  else correct = q.answer.map(idx);
  const clientNeed = CAT[q.cat];
  if (!type || !clientNeed || (Array.isArray(correct) ? correct.some(i => i < 0) : correct < 0)) { problems.push(q.id); continue; }
  bank.push({
    id: `nb:${q.id}`, source: 'nurseboundBank', origin: q.source, topic: q.topic, clientNeed, type,
    difficulty: q.difficulty, level: q.level || null,
    stem: q.stem, options: q.options.map(o => o.text), rationales: q.options.map(o => o.why), correct,
    takeaway: q.takeaway || '', note: q.flag || null,
  });
}

// ---- NGN case studies ----------------------------------------------------
// ngn.js imports "./ngn-more" without an extension, which Node's ESM loader can't resolve; load copies instead.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ngn-'));
for (const f of ['ngn.js', 'ngn-more.js']) {
  const src = fs.readFileSync(path.join(repo, 'src/data', f), 'utf8').replace(/from "\.\/ngn-more"/g, 'from "./ngn-more.js"');
  fs.writeFileSync(path.join(tmp, f), src);
}
fs.writeFileSync(path.join(tmp, 'package.json'), '{"type":"module"}');
const ngnMod = await import(pathToFileURL(path.join(tmp, 'ngn.js')).href);
const casesRaw = ngnMod.NGN_CASES || ngnMod.CASES || Object.values(ngnMod).find(v => Array.isArray(v) && v[0] && v[0].items);
if (!casesRaw) throw new Error('No NGN case array exported from ngn.js: ' + Object.keys(ngnMod).join(', '));
const cases = casesRaw.map(c => ({
  id: `ngn:${c.id}`, title: c.title, sub: c.sub || '', clientNeed: CAT[c.area] || 'pa', area: c.area || '',
  profile: c.profile, ehr: c.ehr,
  items: c.items.map(it => ({ ...it, step: STEP[it.step] || it.step, stepLabel: it.step })),
}));
const kinds = {};
for (const c of cases) for (const it of c.items) kinds[it.kind] = (kinds[it.kind] || 0) + 1;

fs.writeFileSync(path.join(outDir, 'bank.json'), JSON.stringify(bank, null, 1));
fs.writeFileSync(path.join(outDir, 'ngn.json'), JSON.stringify(cases, null, 1));
fs.writeFileSync(path.join(outDir, 'SOURCE.md'),
`# Imported content

From the NurseBound app (github.com/kenyanfreshy/usrn-pathway-app), imported ${new Date().toISOString().slice(0, 10)}.

- \`bank.json\`: ${bank.length} live NCLEX questions (active, not retired; items flagged "Debatable key" excluded).
- \`ngn.json\`: ${cases.length} Next Generation NCLEX unfolding case studies, ${cases.reduce((n, c) => n + c.items.length, 0)} items.

Re-run \`node content/import_nursebound.mjs <path-to-usrn-pathway-app>\` to refresh. Ids are kept (prefixed nb: / ngn:).
`);
const by = (k) => bank.reduce((m, q) => (m[q[k]] = (m[q[k]] || 0) + 1, m), {});
console.log(`bank: ${bank.length} questions`, by('type'));
console.log('topics', by('topic'));
console.log(`ngn: ${cases.length} cases, item kinds`, kinds);
if (problems.length) console.log('skipped (could not convert):', problems);
