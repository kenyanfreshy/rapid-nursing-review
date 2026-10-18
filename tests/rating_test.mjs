// Rules of mobile/rating/nclexRatingService.js (no React Native needed).   node tests/rating_test.mjs
import fs from 'node:fs';
const src = fs.readFileSync(new URL('../mobile/rating/nclexRatingService.js', import.meta.url), 'utf8');
const { createRatingService, RATING_CONFIG } = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
const DAY = 86400000;
let pass = 0, fail = 0;
const check = (c, name, extra = '') => { c ? pass++ : fail++; console.log((c ? 'PASS ' : 'FAIL ') + name + (c ? '' : '  ' + JSON.stringify(extra))); };
function make({ platform = 'ios', available = true, version = '1.1.0', t0 = Date.UTC(2026, 9, 1) } = {}) {
  const mem = new Map(); let t = t0; const calls = { review: 0, urls: [] };
  const storage = { getItem: async k => (mem.has(k) ? mem.get(k) : null), setItem: async (k, v) => mem.set(k, v), removeItem: async k => mem.delete(k) };
  const review = { isAvailableAsync: async () => available, requestReview: async () => { calls.review++; }, storeUrl: () => 'https://apps.apple.com/app/id0' };
  const linking = { openURL: async u => { calls.urls.push(u); } };
  const svc = createRatingService({ storage, now: () => t, platform, appVersion: version, review, linking });
  return { svc, calls, mem, adv: d => { t += d * DAY; }, setT: x => { t = x; } };
}
const good = { kind: 'session', correct: 8, total: 10, points: 8, max: 10 };
const weak = { kind: 'session', correct: 5, total: 10, points: 5, max: 10 };
const quick = { kind: 'session', correct: 3, total: 4, points: 3, max: 4 };

{ const h = make(); await h.svc.init(); const r = await h.svc.onSessionComplete(good);
  check(!r.prompted && r.reason === 'too-few-sessions', 'first session never prompts', r); }
{ const h = make(); await h.svc.init(); for (let i = 0; i < 2; i++) await h.svc.onSessionComplete(good); const r = await h.svc.onSessionComplete(good);
  check(!r.prompted && r.reason === 'too-new', 'not in the first 2 days after install', r);
  h.adv(2); const r2 = await h.svc.onSessionComplete(good);
  check(r2.prompted && r2.reason === 'score' && h.calls.review === 1, '≥75% on ≥5 questions after 2 days → native sheet', r2); }
{ const h = make(); await h.svc.init(); h.adv(3); for (let i = 0; i < 3; i++) await h.svc.onSessionComplete(weak); const r = await h.svc.onSessionComplete(weak);
  check(!r.prompted && r.reason === 'score-below-pass', '50% session does not prompt', r); }
{ const h = make(); await h.svc.init(); h.adv(3); const out = []; for (let i = 0; i < 5; i++) out.push(await h.svc.onSessionComplete(quick));
  check(out.slice(0, 4).every(r => !r.prompted) && out[4].prompted && out[4].reason === 'streak', '5 quick modules in a row → prompt on the 5th', out); }
{ const h = make(); await h.svc.init(); h.adv(3); for (let i = 0; i < 4; i++) await h.svc.onSessionComplete(quick); await h.svc.onSessionComplete({ ...quick, points: 1, correct: 1 });
  const r = await h.svc.onSessionComplete(quick); check(!r.prompted, 'a poor module breaks the streak', r); }
{ const h = make(); await h.svc.init(); h.adv(3); await h.svc.onSessionComplete(weak); await h.svc.onSessionComplete(weak);
  const r = await h.svc.onSessionComplete({ kind: 'case', correct: 10, total: 6, points: 10, max: 12 }); check(r.prompted && r.reason === 'case', 'NGN case ≥75% → prompt', r); }
{ // spacing
  const h = make(); await h.svc.init(); h.adv(3); await h.svc.onSessionComplete(weak); await h.svc.onSessionComplete(weak);
  const r1 = await h.svc.onSessionComplete(good);
  h.adv(30); const r2 = await h.svc.onSessionComplete(good); check(!r2.prompted && ['too-soon', 'asked-this-version'].includes(r2.reason), 'same version / 30 days later → no prompt', r2);
  check(r1.prompted, 'first eligible session prompts', r1);
}
{ // the 3-per-365-days cap with a fixed clock
  const mem = new Map(); let t = Date.UTC(2026, 0, 1); let ver = 1;
  const st = { getItem: async k => mem.get(k) ?? null, setItem: async (k, v) => mem.set(k, v), removeItem: async k => mem.delete(k) };
  const svc = () => createRatingService({ storage: st, now: () => t, platform: 'ios', appVersion: '1.' + ver, review: { isAvailableAsync: async () => true, requestReview: async () => {} } });
  await svc().init(); t += 3 * DAY; await svc().onSessionComplete(weak); await svc().onSessionComplete(weak);
  const got = [];
  for (const step of [91, 91, 91, 92, 0]) { ver++; got.push((await svc().onSessionComplete(good)).prompted); t += step * DAY; }
  // prompts at day 3, 94, 185; day 276 would be the 4th within 365 days → capped; day 368 the first has aged out → allowed
  check(JSON.stringify(got) === JSON.stringify([true, true, true, false, true]), 'max 3 requests in any 365 days, ≥90 days apart', got);
}
{ const h = make({ available: false }); await h.svc.init(); h.adv(3); await h.svc.onSessionComplete(weak); await h.svc.onSessionComplete(weak);
  const r = await h.svc.onSessionComplete(good); const s = await h.svc.load();
  check(!r.prompted && r.reason === 'review-unavailable' && s.prompts.length === 0 && h.calls.urls.length === 0, 'native sheet unavailable → nothing shown, nothing counted, no automatic store redirect', r); }
{ const h = make({ platform: 'android' }); await h.svc.init(); h.adv(3); await h.svc.onSessionComplete(weak); await h.svc.onSessionComplete(weak);
  const r = await h.svc.onSessionComplete(good); check(!r.prompted && r.reason === 'platform-off', 'Android stays off until enabled', r); }
{ const h = make(); const w = await h.svc.openWriteReview();
  check(w === 'native-sheet' && h.calls.review === 1, 'Rate button without an App Store ID → native sheet', w);
  const h2 = make({ available: false }); const w2 = await h2.svc.openWriteReview();
  check(w2 === 'store-url' && h2.calls.urls[0].includes('apps.apple.com'), 'native sheet unavailable → store page', w2); }
{ const h = make(); h.mem.set('rnr.rating.v1', '{not json'); const r = await h.svc.onSessionComplete(good);
  check(r && r.prompted === false, 'corrupt saved data is ignored', r); }
check(RATING_CONFIG.MAX_PER_YEAR === 3 && RATING_CONFIG.PASS_SCORE === 0.75, 'defaults: 75% pass, 3 per year');
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
