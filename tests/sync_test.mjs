// Progress merge (dist/sync.js): nothing is lost, and the result is the same whichever device syncs first.
//   node tests/sync_test.mjs
import { mergeState, syncable, LOCAL_ONLY } from '../dist/sync.js';

let pass = 0, fail = 0;
const ok = (cond, name, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ' ' + extra}`); };
const synced = s => JSON.stringify(syncable(s));

const att = (sid, qid, at, extra = {}) => ({ id: `${sid}:${qid}`, session: sid, qid, selected: 0, correct: true, score: 1, day: at.slice(0, 10), at, ...extra });
const base = () => ({
  schema: 2, ui: 'vivid', previewPro: false, quarantine: [], name: 'Student', edited: {},
  attempts: [], history: [], caseHistory: [], reports: [], bookmarks: [], readLessons: [], readSections: [], milestones: [],
  reminder: { on: false, time: '19:00', days: [1, 2, 3, 4, 5], title: '', notes: '', length: 30 },
  book: { open: false, page: 1, tab: 'contents', expanded: 'nclex', marks: [] }, plan: null, session: null, caseSession: null,
});

// Phone and computer studied separately.
const phone = { ...base(), ui: 'ocean', name: 'Jordan', edited: { name: '2026-10-10T10:00:00Z' },
  attempts: [att('s1', 'q1', '2026-10-10T10:00:00Z'), att('s1', 'q2', '2026-10-10T10:01:00Z')],
  history: [{ id: 's1', finished: '2026-10-10T10:05:00Z', label: 'A', mode: 'tutor', ids: ['q1', 'q2'], answers: {}, count: 2, correct: 2 }],
  bookmarks: ['q1'], readSections: ['cardio-basics'], book: { open: true, page: 44, tab: 'reader', expanded: 'cardio', marks: [44] },
  reports: [{ id: 'r1', qid: 'q1', reason: 'Typo', details: '', created: '2026-10-10T10:02:00Z', status: 'saved' }],
  plan: { title: 'Peds exam', courses: ['n:peds'], date: '2026-10-25', created: '2026-10-09', minutes: 30, topics: ['n:peds'], completed: ['2026-10-10'] },
  session: { id: 's3', ids: ['q9'], mode: 'tutor', label: 'x', index: 0, answers: {}, started: '2026-10-11T08:00:00Z' } };
const web = { ...base(), ui: 'vivid', name: 'Student',
  attempts: [att('s1', 'q2', '2026-10-10T10:01:00Z', { mistake: 'Missed cue' }), att('s2', 'q3', '2026-10-11T09:00:00Z')],
  history: [{ id: 's2', finished: '2026-10-11T09:10:00Z', label: 'B', mode: 'exam', ids: ['q3'], answers: {}, count: 1, correct: 1 }],
  bookmarks: ['q3'], readSections: ['resp-basics'], book: { open: false, page: 3, tab: 'contents', expanded: 'nclex', marks: [50] },
  reports: [{ id: 'r1', qid: 'q1', reason: 'Typo', details: '', created: '2026-10-10T10:02:00Z', status: 'sent' }],
  plan: { title: 'Peds exam', courses: ['n:peds'], date: '2026-10-25', created: '2026-10-09', minutes: 30, topics: ['n:peds'], completed: ['2026-10-11'] },
  edited: { plan: '2026-10-11T09:00:00Z' },
  session: { id: 's4', ids: ['q8'], mode: 'tutor', label: 'y', index: 0, answers: {}, started: '2026-10-12T08:00:00Z' } };

const a = mergeState(phone, web), b = mergeState(web, phone);
ok(synced(a) === synced(b), 'merge is order-independent (synced fields)', `\n${synced(a)}\n${synced(b)}`);
ok(a.attempts.length === 3, 'attempts: union without duplicates', a.attempts.length);
ok(a.attempts.find(x => x.id === 's1:q2')?.mistake === 'Missed cue', 'attempts: richer copy kept (mistake tag)');
ok(a.history.map(h => h.id).join() === 's1,s2', 'history: union by session, oldest first');
ok(a.bookmarks.join() === 'q1,q3' && a.readSections.length === 2, 'bookmarks and read sections: union');
ok(a.book.marks.join() === '44,50', 'book marks: union');
ok(a.book.page === 44 && a.ui === 'ocean' && b.ui === 'vivid' && b.book.page === 3, 'device settings stay local (theme, open page)');
ok(a.reports.length === 1 && a.reports[0].status === 'sent', 'reports: union, sent wins');
ok(a.name === 'Jordan' && b.name === 'Jordan', 'name: copy edited last wins');
ok(a.plan.completed.join() === '2026-10-10,2026-10-11', 'plan: same plan, completed days joined');
ok(a.session.id === 's4', 'session: most recently started');
ok(a.edited.name && a.edited.plan, 'edit times carried over');

// Idempotent: merging again with either side changes nothing.
ok(synced(mergeState(a, web)) === synced(a) && synced(mergeState(a, phone)) === synced(a), 'merge is idempotent');
// Merging with an empty server copy keeps everything.
ok(synced(mergeState(phone, {})) === synced({ ...phone, ...mergeState(phone, {}) }) && mergeState(phone, {}).attempts.length === 2, 'empty remote keeps local progress');

// A finished session must not come back from the other device.
const done = { ...base(), history: [{ id: 's4', finished: '2026-10-12T09:00:00Z', label: 'y', mode: 'tutor', ids: ['q8'], answers: {}, count: 1, correct: 1 }] };
ok(mergeState(done, web).session === null, 'session finished elsewhere is not resurrected');

// Plan replaced on one device (newer edit) wins over the old plan.
const newPlan = { ...base(), plan: { title: 'Med-surg final', courses: ['n:cardio'], date: '2026-11-02', created: '2026-10-12', minutes: 45, topics: ['n:cardio'], completed: [] }, edited: { plan: '2026-10-12T12:00:00Z' } };
ok(mergeState(web, newPlan).plan.title === 'Med-surg final' && mergeState(newPlan, web).plan.title === 'Med-surg final', 'plan: newer plan wins both ways');
// Plan removed on one device after the other device's last edit stays removed.
const removed = { ...base(), plan: null, edited: { plan: '2026-10-13T12:00:00Z' } };
ok(mergeState(web, removed).plan === null && mergeState(removed, web).plan === null, 'plan: removal (newer) wins both ways');

// Before sync existed there are no edit times: a real name beats the default either way.
const oldPhone = { ...base(), name: 'Jordan' }, oldWeb = { ...base(), name: 'Student' };
ok(mergeState(oldPhone, oldWeb).name === 'Jordan' && mergeState(oldWeb, oldPhone).name === 'Jordan', 'name: real name beats default without edit times');

// Older attempts without ids still merge by content.
const legacy = { ...base(), attempts: [{ qid: 'q1', correct: false, day: '2026-09-01' }] };
ok(mergeState(legacy, legacy).attempts.length === 1, 'legacy attempts de-duplicated');

// What travels to the server: no device-only fields.
const up = syncable(phone);
ok(LOCAL_ONLY.every(k => !(k in up)) && JSON.stringify(up.book) === '{"marks":[44]}', 'upload excludes device-only settings');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
