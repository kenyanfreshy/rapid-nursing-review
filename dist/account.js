// Optional account (Sign in with Apple) + progress sync, on Supabase.
// Same design as Critical Care Certified: Supabase Auth (Apple provider) + Postgres with
// row-level security, reached with plain fetch (no SDK). Schema: backend/supabase.sql.
//
// iPhone: the native shell runs Apple's sign-in sheet (expo-apple-authentication with a
//   SHA-256 nonce) and hands back the identity token, exchanged here at
//   /auth/v1/token?grant_type=id_token. The shell then calls Purchases.logIn(<user id>) so the
//   RevenueCat subscription is attached to the account.
// Web: Supabase's Apple OAuth redirect with PKCE: only this browser, which made the code verifier,
//   can exchange the returned ?code= for a session (tokens put in a link by someone else are ignored).
// Nobody has to sign in: without an account everything stays on the device, as before.
import { RNR_CONFIG } from './config.js';
import { mergeState, syncable } from './sync.js';

export const Account = (() => {
  const cfg = () => ({ ...RNR_CONFIG, ...(window.__RNR_CONFIG__ || {}) });
  const configured = () => {
    const c = cfg();
    return !!(c.supabaseUrl && c.supabaseKey && !/REPLACE_ME/.test(c.supabaseUrl + c.supabaseKey));
  };
  const isWeb = () => !!window.__RNR_WEB__;
  const bridge = () => window.ReactNativeWebView;
  // The card shows on the phone only once the Apple provider is live (config.appleSignIn).
  // Sign in with Apple is iPhone-only in the app: on Android the card stays hidden until Google sign-in is added.
  const enabled = () => configured() && (isWeb() || (cfg().appleSignIn === true && (window.__RNR_OS__ || 'ios') === 'ios'));
  const base = () => cfg().supabaseUrl.replace(/\/$/, '');

  const SESSION_KEY = 'rnr.session.v1', SYNCED_KEY = 'rnr.lastSynced.v1';
  const read = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
  const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  let status = { session: read(SESSION_KEY, null), syncing: false, lastError: null, lastSyncedAt: read(SYNCED_KEY, null) };
  const listeners = new Set();
  const set = p => { status = { ...status, ...p }; listeners.forEach(l => { try { l(status); } catch {} }); };
  const onChange = fn => { listeners.add(fn); return () => listeners.delete(fn); };

  function tellNative(userId) {
    try { bridge()?.postMessage(JSON.stringify({ type: 'account', userId: userId || null })); } catch {}
  }
  function saveSession(s) {
    write(SESSION_KEY, s);
    if (!s) write(SYNCED_KEY, null);
    set({ session: s, ...(s ? {} : { lastSyncedAt: null, lastError: null }) });
    tellNative(s?.userId);
  }

  // Every failure says which step failed, so problems can be diagnosed from a screenshot.
  const stepOf = path => path.includes('/functions/v1/entitlement') ? 'the subscription check'
    : path.includes('/functions/v1/book-page') ? 'the book page'
    : path.includes('/storage/') ? 'the question bank'
    : path.includes('/auth/') ? 'sign-in'
    : path.includes('save_progress') || path.includes('/progress') ? 'progress sync'
    : path.includes('delete-account') ? 'account deletion'
    : path.includes('reset_progress') ? 'resetting synced progress'
    : 'the server';

  async function call(path, init = {}) {
    const headers = { apikey: cfg().supabaseKey, 'Content-Type': 'application/json', ...(init.headers || {}) };
    if (init.auth) {
      const s = await validSession();
      if (!s) throw new Error('Please sign in again.');
      headers.Authorization = `Bearer ${s.accessToken}`;
    }
    let res;
    try { res = await fetch(base() + path, { method: init.method || 'GET', body: init.body, headers, cache: 'no-store' }); }
    catch (e) { throw new Error(`Couldn't reach ${stepOf(path)}. Check your connection and try again. (${e?.message || e})`); }
    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    if (!res.ok) {
      const msg = body?.error_description || body?.msg || body?.message || body?.error || `${stepOf(path)} failed (${res.status})`;
      const err = new Error(typeof msg === 'string' ? msg : `${stepOf(path)} failed (${res.status})`);
      err.status = res.status; err.body = body; throw err;
    }
    return body;
  }

  const fromAuth = b => ({
    accessToken: b.access_token, refreshToken: b.refresh_token,
    expiresAt: Date.now() + (b.expires_in || 3600) * 1000,
    userId: b.user.id, email: b.user.email || '',
  });
  let refreshing = null;
  async function validSession() {
    const s = status.session;
    if (!s) return null;
    if (s.expiresAt - Date.now() > 60_000) return s;
    refreshing = refreshing || (async () => {
      try {
        const b = await call('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: s.refreshToken }) });
        const n = fromAuth(b); saveSession(n); return n;
      } catch (e) {
        if (e.status === 400 || e.status === 401) saveSession(null);
        return null;
      } finally { setTimeout(() => { refreshing = null; }, 0); }
    })();
    return refreshing;
  }

  // ---- Sign in with Apple ----
  let applePending = null;
  window.__rnrAppleResult = r => { const p = applePending; applePending = null; p?.(r || { ok: false }); };
  function nativeApple() {
    return new Promise(resolve => {
      applePending = resolve;
      setTimeout(() => { if (applePending === resolve) { applePending = null; resolve({ ok: false, error: "Sign in with Apple didn't answer. Try again." }); } }, 180000);
      bridge().postMessage(JSON.stringify({ type: 'apple-signin' }));
    });
  }
  async function signInWithApple() {
    if (bridge()) {
      const r = await nativeApple();
      if (!r?.ok) { if (r?.cancelled) return false; throw new Error(r?.error || "Sign in with Apple didn't finish."); }
      const b = await call('/auth/v1/token?grant_type=id_token', { method: 'POST', body: JSON.stringify({ provider: 'apple', id_token: r.identityToken, nonce: r.rawNonce }) });
      saveSession(fromAuth(b));
      return true;
    }
    const verifier = randomString(64);
    try { sessionStorage.setItem(PKCE_KEY, verifier); } catch { throw new Error('This browser blocks storage, so sign-in can’t finish. Allow site data for this page and try again.'); }
    const challenge = await sha256url(verifier);
    const back = location.origin + location.pathname;
    location.href = `${base()}/auth/v1/authorize?provider=apple&redirect_to=${encodeURIComponent(back)}&code_challenge=${challenge}&code_challenge_method=s256`;
    return false;
  }
  const PKCE_KEY = 'rnr.pkce.v1';
  function randomString(n) {
    const a = new Uint8Array(n); crypto.getRandomValues(a);
    return Array.from(a, b => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~'[b % 66]).join('');
  }
  async function sha256url(text) {
    const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
    let b = ''; for (const x of d) b += String.fromCharCode(x);
    return btoa(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  // Back from Apple: exchange ?code= with the verifier this browser kept. Tokens in the URL fragment
  // are never accepted (that would let a crafted link sign someone into another account).
  async function consumeAuthRedirect() {
    const q = new URLSearchParams(location.search), h = new URLSearchParams(location.hash.replace(/^#/, ''));
    const clean = () => history.replaceState(null, '', location.pathname);
    const errText = q.get('error_description') || q.get('error') || h.get('error_description') || h.get('error');
    if (errText) { clean(); throw new Error(`Sign-in didn't finish: ${errText}`); }
    if (h.get('access_token')) clean();          // ignore implicit-flow tokens in links
    const code = q.get('code');
    if (!code) return false;
    let verifier = null;
    try { verifier = sessionStorage.getItem(PKCE_KEY); sessionStorage.removeItem(PKCE_KEY); } catch {}
    clean();
    if (!verifier) throw new Error('Sign-in started in another tab or browser. Tap Sign in with Apple again here.');
    const b = await call('/auth/v1/token?grant_type=pkce', { method: 'POST', body: JSON.stringify({ auth_code: code, code_verifier: verifier }) });
    saveSession(fromAuth(b));
    return true;
  }
  async function signOut() {
    try { await call('/auth/v1/logout', { method: 'POST', auth: true }); } catch {}
    saveSession(null);
  }
  // Deletes the account on the server (Edge Function `delete-account`, Auth admin API). On the iPhone,
  // Apple is asked once more for an authorization code so the server can revoke the Sign in with Apple
  // token too. Cancelling that sheet cancels the deletion.
  async function deleteAccount() {
    let appleAuthorizationCode = null;
    if (bridge()) {
      const r = await nativeApple();
      if (!r?.ok) { if (r?.cancelled) { const e = new Error('Deletion cancelled.'); e.cancelled = true; throw e; } }
      else appleAuthorizationCode = r.authorizationCode || null;
    }
    await call('/functions/v1/delete-account', { method: 'POST', auth: true, body: JSON.stringify({ appleAuthorizationCode }) });
    saveSession(null);
  }
  // "Reset data" while signed in: clear the synced copy too, so the next sync doesn't bring it back.
  async function resetSynced() {
    if (!status.session) return;
    await call('/rest/v1/rpc/reset_progress', { method: 'POST', auth: true, body: '{}' });
  }

  // ---- Web: Pro check and private content ----
  const checkWebAccess = () => call('/functions/v1/entitlement', { method: 'POST', auth: true, body: '{}' });
  const privateJson = (bucket, path) => call(`/storage/v1/object/authenticated/${bucket}/${path}`, { auth: true });
  async function bookPage(page) {
    const s = await validSession();
    if (!s) throw new Error('Please sign in again.');
    let res;
    try {
      res = await fetch(`${base()}/functions/v1/book-page?page=${encodeURIComponent(page)}`, { headers: { apikey: cfg().supabaseKey, Authorization: `Bearer ${s.accessToken}` }, cache: 'no-store' });
    } catch (e) { throw new Error(`Couldn't reach the book page. Check your connection. (${e?.message || e})`); }
    if (!res.ok) { let m = `Couldn't load page ${page} (${res.status}).`; try { m = (await res.json()).error || m; } catch {} throw new Error(m); }
    return res.blob();
  }

  // ---- Progress sync: GET → merge → save with version check (409 → merge again) ----
  async function syncNow(get, replace) {
    if (!configured() || !status.session || status.syncing) return false;
    set({ syncing: true, lastError: null });
    try {
      for (let attempt = 0; attempt < 4; attempt++) {
        const rows = await call(`/rest/v1/progress?select=state,version&user_id=eq.${status.session.userId}`, { auth: true });
        const remote = Array.isArray(rows) ? rows[0] : null;
        const baseVersion = remote?.version || 0;
        const merged = remote?.state ? mergeState(get(), remote.state) : get();
        try {
          await call('/rest/v1/rpc/save_progress', { method: 'POST', auth: true, body: JSON.stringify({ p_state: syncable(merged), p_base_version: baseVersion }) });
          replace(merged);
          const at = Date.now(); write(SYNCED_KEY, at); set({ lastSyncedAt: at });
          return true;
        } catch (e) {
          if (e.status === 409 || /version_conflict/.test(e.message)) continue;   // another device saved first
          throw e;
        }
      }
      throw new Error('Sync kept conflicting with another device. It will retry automatically.');
    } catch (e) {
      set({ lastError: navigator.onLine === false ? "You're offline. Changes will sync when you reconnect." : e.message });
      return false;
    } finally {
      set({ syncing: false });
    }
  }

  // "Report a problem" entries go to the review queue once the learner is signed in.
  async function sendReports(reports) {
    const q = (reports || []).filter(r => r && r.status !== 'sent');
    if (!q.length || !status.session) return [];
    await call('/rest/v1/issue_reports', { method: 'POST', auth: true, headers: { Prefer: 'return=minimal,resolution=ignore-duplicates' },
      body: JSON.stringify(q.map(r => ({ id: String(r.id || `${r.created}|${r.qid}`).slice(0, 80), question_id: r.qid || null, reason: String(r.reason || '').slice(0, 80), details: String(r.details || '').slice(0, 2000), created_at: r.created }))) });
    return q.map(r => r.id);
  }

  // Phone: remind the shell which RevenueCat user to use (logIn is idempotent).
  if (status.session) setTimeout(() => tellNative(status.session.userId), 0);

  return {
    configured, enabled, isWeb, onChange, get status() { return status; },
    signInWithApple, consumeAuthRedirect, signOut, deleteAccount, resetSynced,
    checkWebAccess, privateJson, bookPage, syncNow, sendReports,
    webAppUrl: () => cfg().webAppUrl,
  };
})();
