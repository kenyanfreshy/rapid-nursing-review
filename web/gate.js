// Web app entry (https://nclexrapidnursingreview.com/app/). The public page holds no questions and
// no book: it signs the learner in with Apple, asks the server (entitlement → RevenueCat) whether
// that account has an active Rapid Nursing Review Pro subscription bought in the iPhone app, then
// downloads the question bank from private storage and starts the same app the phone runs.
// No purchase happens here and there are no links to outside payment.
import { Account } from '../dist/account.js';

export const Gate = (() => {
  const APPLE = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M16.37 12.8c-.02-2.1 1.72-3.12 1.8-3.17-.98-1.43-2.5-1.63-3.04-1.65-1.29-.13-2.52.76-3.18.76-.66 0-1.67-.74-2.75-.72-1.41.02-2.72.82-3.45 2.09-1.47 2.55-.38 6.33 1.06 8.4.7 1.01 1.54 2.15 2.63 2.11 1.06-.04 1.46-.68 2.73-.68 1.28 0 1.64.68 2.75.66 1.14-.02 1.86-1.03 2.55-2.05.8-1.17 1.13-2.31 1.15-2.37-.03-.01-2.21-.85-2.25-3.38zM14.3 6.62c.58-.71.98-1.69.87-2.67-.84.03-1.86.56-2.46 1.27-.54.62-1.01 1.62-.89 2.58.94.07 1.9-.48 2.48-1.18z"/></svg>';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const el = () => document.getElementById('rnr-gate');

  function screen(inner) {
    el().innerHTML = `<div class="wg-card"><img class="wg-cover" src="pages/cover.webp" alt="Rapid Nursing Review: All Body Systems at a Glance, book cover" width="96" height="144">
      <h1>Rapid Nursing Review</h1><p class="wg-sub">NCLEX-RN® Review · Web</p>${inner}
      <p class="wg-fine"><a href="../privacy.html">Privacy</a> · <a href="../terms.html">Terms</a> · <a href="../support.html">Support</a> · <a href="mailto:alexkorirbooks@gmail.com">alexkorirbooks@gmail.com</a></p>
      <p class="wg-fine">NCLEX® is a registered trademark of NCSBN, which does not sponsor or endorse this app.</p></div>`;
  }
  function signInScreen(err) {
    screen(`<p>For Rapid Nursing Review Pro subscribers. Sign in with the same Apple ID you use in the iPhone app and pick up where you left off.</p>
      ${err ? `<p class="wg-err" role="alert">${esc(err)}</p>` : ''}
      <button class="apple-btn" id="wg-apple" type="button">${APPLE}<span>Sign in with Apple</span></button>
      <p class="wg-help">First time? In the iPhone app, open <b>Settings → Sync and web access</b> and tap <b>Sign in with Apple</b> once. That links your subscription and progress to your Apple ID.</p>`);
    document.getElementById('wg-apple').onclick = () => Account.signInWithApple().catch(e => signInScreen(e.message));
  }
  function noAccessScreen() {
    screen(`<p class="wg-err" role="alert">We couldn't find an active Rapid Nursing Review Pro subscription for this Apple ID.</p>
      <ol class="wg-steps"><li>On your iPhone, open Rapid Nursing Review and subscribe, or tap Restore Purchases.</li>
      <li>In the app, open <b>Settings → Sync and web access</b> and tap <b>Sign in with Apple</b> with this same Apple ID.</li>
      <li>Come back here and tap Check again.</li></ol>
      <div class="wg-row"><button class="btn" id="wg-again" type="button">Check again</button><button class="btn secondary" id="wg-out" type="button">Sign out</button></div>`);
    document.getElementById('wg-again').onclick = () => start();
    document.getElementById('wg-out').onclick = async () => { await Account.signOut(); signInScreen(); };
  }
  function errorScreen(msg) {
    screen(`<p class="wg-err" role="alert">${esc(msg || 'Something went wrong.')}</p>
      <div class="wg-row"><button class="btn" id="wg-again" type="button">Try again</button><button class="btn secondary" id="wg-out" type="button">Sign out</button></div>`);
    document.getElementById('wg-again').onclick = () => start();
    document.getElementById('wg-out').onclick = async () => { await Account.signOut(); signInScreen(); };
  }
  const wait = text => screen(`<p class="wg-wait" role="status">${esc(text)}</p>`);

  function bootApp(content, access) {
    const s = Account.status.session;
    const pages = Number(content?.book?.pages) || 196;
    // Book text stays on the server; search on the web looks at section titles only.
    window.__RNR_CONTENT__ = { ...content, pageText: Array.from({ length: pages }, () => '') };
    window.__RNR_PRO__ = true;
    window.__RNR_WEB_ACCESS__ = access;
    window.__RNR_ACCOUNT__ = Account;
    window.__RNR_ACCOUNT_LABEL__ = s.email && !/privaterelay/i.test(s.email) ? s.email : `account ${s.userId.slice(0, 8)}`;
    const tag = document.createElement('script');
    tag.src = window.__RNR_APP_JS__;
    tag.onload = () => { document.body.classList.remove('gate-on'); el().remove(); };
    tag.onerror = () => errorScreen("Couldn't load the app. Reload the page to try again.");
    document.body.appendChild(tag);
  }

  async function start() {
    if (!Account.configured()) { screen(`<p class="wg-err" role="alert">The web app isn't connected to its server yet.</p>`); return; }
    wait('Checking your subscription…');
    try {
      await Account.consumeAuthRedirect();
      if (!Account.status.session) return signInScreen();
      const access = await Account.checkWebAccess();
      if (!access?.active) return noAccessScreen();
      wait('Loading your questions…');
      const content = await Account.privateJson('content', 'content.json');
      if (!content?.bookQuestions || !content?.nclexBank) throw new Error("The question bank didn't download completely. Reload the page to try again.");
      bootApp(content, access);
    } catch (e) {
      if (!Account.status.session) return signInScreen(e.message);
      errorScreen(e.message);
    }
  }
  return { start };
})();
