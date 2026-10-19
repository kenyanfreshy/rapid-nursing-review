// Conflict-safe merge of two copies of a learner's progress: this device's copy and the
// account copy from the server (Sign in with Apple → "Sync and web access").
//
// Rules, chosen so nothing a learner did is lost and the result does not depend on which
// device syncs first:
//   attempts        union by attempt id (session:question), sorted by time
//   history         union by session id (finished practice sessions)
//   caseHistory     union by case + finish time
//   reports         union by report id (a "sent" mark on either copy wins)
//   bookmarks, readLessons, readSections, milestones, book marks   union
//   plan            the copy edited last (edited.plan); completed days are joined when it is the same plan
//   name, reminder  the copy edited last (edited.name / edited.reminder)
//   session         the unfinished practice session started most recently
//   caseSession     the unfinished NGN case most recently worked on
//   lastOpen        the later day
// Device-only settings are never synced: color theme, open book panel, page, tab, notices,
// the quarantine of unreadable records and the web-preview Pro switch.
// Pro access is never synced either: it always comes from the store (phone) or the
// server's RevenueCat check (web).

// Everything is wrapped so these helpers don't clash with app.js names when the phone bundle
// joins all files into one script.
export const { mergeState, syncable, LOCAL_ONLY } = (() => {
  // Fields that stay on each device.
  const LOCAL_ONLY = ['ui', 'previewPro', 'quarantine', 'lastWelcome'];

  const arr = v => (Array.isArray(v) ? v : []);
  const obj = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : null);
  const time = v => { const t = Date.parse(v || ''); return Number.isFinite(t) ? t : 0; };
  const sortStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  // Same record on both devices (e.g. an attempt later tagged with a "mistake" reflection on one
  // of them): keep the richer copy, with a stable tie-break so the order of devices never matters.
  function richer(x, y) {
    const kx = Object.keys(x).length, ky = Object.keys(y).length;
    if (kx !== ky) return kx > ky ? x : y;
    return sortStr(JSON.stringify(x), JSON.stringify(y)) >= 0 ? x : y;
  }
  function unionBy(a, b, key, pick = richer) {
    const m = new Map();
    for (const x of [...arr(a), ...arr(b)]) {
      if (!obj(x)) continue;
      const k = key(x);
      m.set(k, m.has(k) ? pick(m.get(k), x) : x);
    }
    return [...m.values()];
  }
  const unionSet = (a, b) => [...new Set([...arr(a), ...arr(b)])].sort((x, y) => (typeof x === 'number' && typeof y === 'number' ? x - y : sortStr(String(x), String(y))));

  // Older attempts (before attempt ids) are keyed by their content.
  const attemptKey = a => a.id || `${a.qid}|${a.at || a.day}|${JSON.stringify(a.selected ?? null)}`;
  const attemptTime = a => time(a.at) || time(a.day);

  // "Edited last" with a stable tie-break so both orders give the same answer.
  // With no edit times (progress saved before sync existed), a real value beats the default.
  function newer(aVal, aAt, bVal, bAt, isDefault = () => false) {
    const ta = time(aAt), tb = time(bAt);
    if (ta !== tb) return ta > tb ? 'a' : 'b';
    const da = aVal == null || isDefault(aVal), db = bVal == null || isDefault(bVal);
    if (da !== db) return da ? 'b' : 'a';
    return sortStr(JSON.stringify(aVal ?? null), JSON.stringify(bVal ?? null)) >= 0 ? 'a' : 'b';
  }

  function mergePlan(a, b, ea, eb) {
    if (!a && !b) return null;
    // A plan removed on one device stays removed only if that removal is the newer edit.
    const w = newer(a, ea, b, eb);
    const win = w === 'a' ? a : b, lose = w === 'a' ? b : a;
    if (!win) return null;
    if (lose && lose.title === win.title && lose.created === win.created) {
      return { ...win, completed: unionSet(win.completed, lose.completed) };
    }
    return win;
  }

  const sessionStart = s => time(s && s.started);
  function pickSession(a, b) {
    if (!a || !b) return a || b || null;
    const ta = sessionStart(a), tb = sessionStart(b);
    if (ta !== tb) return ta > tb ? a : b;
    // Same session on both devices: keep the one further along.
    const na = Object.keys(a.answers || {}).length + (a.index || 0), nb = Object.keys(b.answers || {}).length + (b.index || 0);
    if (na !== nb) return na > nb ? a : b;
    return sortStr(String(a.id), String(b.id)) <= 0 ? a : b;
  }
  function pickCase(a, b) {
    if (!a || !b) return a || b || null;
    const na = Object.keys(a.submitted || {}).length + (a.index || 0), nb = Object.keys(b.submitted || {}).length + (b.index || 0);
    if (a.caseId === b.caseId && na !== nb) return na > nb ? a : b;
    const ta = time(a.updated || a.started), tb = time(b.updated || b.started);
    if (ta !== tb) return ta > tb ? a : b;
    return sortStr(JSON.stringify(a), JSON.stringify(b)) >= 0 ? a : b;
  }

  // The part of the state that travels to the server.
  function syncable(state) {
    const out = {};
    for (const [k, v] of Object.entries(state || {})) if (!LOCAL_ONLY.includes(k)) out[k] = v;
    out.book = { marks: arr(state?.book?.marks) };
    return out;
  }

  // merge(local, remote) → the new local state. Local-only settings come from `local`.
  function mergeState(local, remote) {
    const L = obj(local) || {}, R = obj(remote) || {};
    const eL = obj(L.edited) || {}, eR = obj(R.edited) || {};
    const edited = {};
    for (const k of ['name', 'plan', 'reminder']) {
      const t = time(eL[k]) >= time(eR[k]) ? eL[k] : eR[k];
      if (t) edited[k] = t;
    }
    const nameW = newer(L.name, eL.name, R.name, eR.name, n => !String(n).trim() || n === 'Student');
    const remW = newer(L.reminder, eL.reminder, R.reminder, eR.reminder, r => !r.on && !r.title && !r.notes);

    const attempts = unionBy(L.attempts, R.attempts, attemptKey)
      .sort((x, y) => attemptTime(x) - attemptTime(y) || sortStr(attemptKey(x), attemptKey(y)));
    const history = unionBy(L.history, R.history, h => h.id)
      .sort((x, y) => time(x.finished) - time(y.finished) || sortStr(String(x.id), String(y.id)));
    const caseHistory = unionBy(L.caseHistory, R.caseHistory, h => `${h.caseId}|${h.finished}`)
      .sort((x, y) => time(x.finished) - time(y.finished) || sortStr(String(x.caseId), String(y.caseId)));
    const reports = unionBy(L.reports, R.reports, r => r.id || `${r.created}|${r.qid}|${r.reason}`,
      (x, y) => (x.status === 'sent') !== (y.status === 'sent') ? (x.status === 'sent' ? x : y) : richer(x, y))
      .sort((x, y) => time(x.created) - time(y.created) || sortStr(String(x.id), String(y.id)));

    const lastOpen = [L.lastOpen, R.lastOpen].filter(Boolean).sort().pop();
    const out = {
      ...L,
      name: nameW === 'a' ? (L.name ?? R.name) : (R.name ?? L.name),
      reminder: remW === 'a' ? (L.reminder ?? R.reminder) : (R.reminder ?? L.reminder),
      plan: mergePlan(L.plan ?? null, R.plan ?? null, eL.plan, eR.plan),
      attempts, history, caseHistory, reports,
      bookmarks: unionSet(L.bookmarks, R.bookmarks),
      readLessons: unionSet(L.readLessons, R.readLessons),
      readSections: unionSet(L.readSections, R.readSections),
      milestones: unionSet(L.milestones, R.milestones),
      book: { ...(obj(L.book) || {}), marks: unionSet(L.book?.marks, R.book?.marks) },
      session: pickSession(L.session ?? null, R.session ?? null),
      caseSession: pickCase(L.caseSession ?? null, R.caseSession ?? null),
      edited,
    };
    if (lastOpen) out.lastOpen = lastOpen;
    // A session that this device already finished must not come back from the other copy.
    if (out.session && history.some(h => h.id === out.session.id)) out.session = null;
    return out;
  }
  return { mergeState, syncable, LOCAL_ONLY };
})();
