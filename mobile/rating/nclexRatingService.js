// Native "Rate this app" prompt (iOS: SKStoreReviewController via expo-store-review), shown only after a good
// study moment and never more often than Apple allows. Android (Google Play In-App Review) is ready behind
// PROVIDERS.android.enabled.
//
// Rules (all must hold):
//   • a "moment": a session of ≥ MIN_QUESTIONS answered at ≥ PASS_SCORE, an NGN case at ≥ PASS_SCORE,
//     or STREAK_MODULES completed sessions in a row at ≥ STREAK_FLOOR (short Quick Practice rounds count here);
//   • the app has been installed ≥ MIN_DAYS_INSTALLED days and the learner has finished ≥ MIN_SESSIONS sessions;
//   • fewer than MAX_PER_YEAR requests in the last 365 days (Apple shows the sheet at most 3 times a year anyway),
//     and ≥ MIN_DAYS_BETWEEN days since the last one;
//   • not already asked on this app version.
// The system still decides whether the sheet appears and never says whether it did, so we count requests.
//
// The service has no React Native imports: storage, clock, platform and the review API are passed in, so the
// rules run under Node in tests/rating_test.mjs.

export const RATING_CONFIG = {
  PASS_SCORE: 0.75,
  MIN_QUESTIONS: 5,
  STREAK_MODULES: 5,
  STREAK_FLOOR: 0.5,
  MIN_SESSIONS: 3,
  MIN_DAYS_INSTALLED: 2,
  MAX_PER_YEAR: 3,
  MIN_DAYS_BETWEEN: 90,
  PROMPT_DELAY_MS: 2500, // let the results screen and any celebration show first
};

// App Store numeric Apple ID (App Store Connect → App Information → Apple ID).
// The "Rate the app" button opens its Write a Review page; without an ID it falls back to the native sheet.
export const APP_STORE_ID = '6822172335';
export const PLAY_PACKAGE = 'com.alexkorir.rapidnursingreview';

export const PROVIDERS = {
  ios: {
    enabled: true,
    writeReviewUrl: () => (APP_STORE_ID ? `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review` : ''),
  },
  // iOS line: no Android provider here, so this binary names no other store (App Review Guideline 2.3.10).
  // The Android line (android-play) configures it for the Google Play launch.
  android: { enabled: false, writeReviewUrl: () => '' },
};

const KEY = 'rnr.rating.v1';
const DAY = 86400000;

export function createRatingService({ storage, now = () => Date.now(), platform, appVersion = '', review, linking, config = {}, log = () => {} }) {
  const C = { ...RATING_CONFIG, ...config };
  const provider = PROVIDERS[platform] || { enabled: false, writeReviewUrl: () => '' };

  async function load() {
    let s = null;
    try { s = JSON.parse((await storage.getItem(KEY)) || 'null'); } catch { s = null; }
    if (!s || typeof s !== 'object') s = {};
    return {
      installedAt: Number(s.installedAt) || now(),
      sessions: Number(s.sessions) || 0,
      streak: Number(s.streak) || 0,
      prompts: Array.isArray(s.prompts) ? s.prompts.filter(Number.isFinite) : [],
      lastVersion: typeof s.lastVersion === 'string' ? s.lastVersion : '',
    };
  }
  async function store(s) { try { await storage.setItem(KEY, JSON.stringify(s)); } catch { /* best effort */ } }

  // Pure decision for one finished session. result: { correct, total, points?, max?, kind: 'session' | 'case' }
  function isMoment(result, s) {
    const total = Math.max(0, Number(result.total) || 0);
    const max = Number(result.max) || total;
    const pts = Number.isFinite(Number(result.points)) ? Number(result.points) : Number(result.correct) || 0;
    const score = max ? pts / max : 0;
    if (result.kind === 'case' && score >= C.PASS_SCORE) return { ok: true, why: 'case', score };
    if (total >= C.MIN_QUESTIONS && score >= C.PASS_SCORE) return { ok: true, why: 'score', score };
    if (s.streak >= C.STREAK_MODULES) return { ok: true, why: 'streak', score };
    return { ok: false, why: total < C.MIN_QUESTIONS ? 'short-session' : 'score-below-pass', score };
  }

  function gate(s, t) {
    if (!provider.enabled) return 'platform-off';
    if (s.sessions < C.MIN_SESSIONS) return 'too-few-sessions';
    if (t - s.installedAt < C.MIN_DAYS_INSTALLED * DAY) return 'too-new';
    const year = s.prompts.filter(p => t - p < 365 * DAY);
    if (year.length >= C.MAX_PER_YEAR) return 'yearly-cap';
    const last = Math.max(0, ...s.prompts);
    if (last && t - last < C.MIN_DAYS_BETWEEN * DAY) return 'too-soon';
    if (appVersion && s.lastVersion === appVersion) return 'asked-this-version';
    return '';
  }

  // Call after every finished session or case. Returns { prompted, reason }.
  async function onSessionComplete(result) {
    const s = await load(), t = now();
    const total = Number(result.total) || 0, max = Number(result.max) || total;
    const pts = Number.isFinite(Number(result.points)) ? Number(result.points) : Number(result.correct) || 0;
    s.sessions += 1;
    s.streak = max && pts / max >= C.STREAK_FLOOR ? s.streak + 1 : 0;
    const m = isMoment(result, s);
    let reason = m.ok ? gate(s, t) : m.why;
    let prompted = false;
    if (!reason) {
      try {
        if (review && (await review.isAvailableAsync())) {
          await review.requestReview();
          s.prompts = [...s.prompts.filter(p => t - p < 365 * DAY), t];
          s.lastVersion = appVersion;
          s.streak = 0;
          prompted = true;
          reason = m.why;
        } else reason = 'review-unavailable';
      } catch (e) { reason = 'review-error'; log('rating', e); }
    }
    await store(s);
    return { prompted, reason };
  }

  // A "Rate Rapid Nursing Review" button the learner tapped. Apple allows the write-review link here
  // (user-initiated); the automatic path above only ever uses the native sheet (Guideline 5.6.1).
  async function openWriteReview() {
    const url = provider.writeReviewUrl();
    if (url && linking) { try { await linking.openURL(url); return 'store-page'; } catch { /* fall through */ } }
    try {
      if (review && (await review.isAvailableAsync())) { await review.requestReview(); return 'native-sheet'; }
      const storeUrl = review?.storeUrl?.();
      if (storeUrl && linking) { await linking.openURL(storeUrl); return 'store-url'; }
    } catch (e) { log('rating', e); }
    return 'unavailable';
  }

  // Call once at app start: remembers the first-launch date used by MIN_DAYS_INSTALLED.
  async function init() {
    let raw = null; try { raw = await storage.getItem(KEY); } catch { raw = null; }
    if (!raw) await store(await load());
  }

  return { init, onSessionComplete, openWriteReview, load, reset: () => storage.removeItem(KEY), config: C, KEY };
}
