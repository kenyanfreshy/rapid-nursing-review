// "Get the app" prompt for the free NCLEX challenge at /quiz/.
// The challenge (web/quiz/challenge-original.html, built by the marketing bot) shows its results screen after
// 3 questions. When that screen appears, this opens a bottom sheet pointing to the iPhone app; Pro also unlocks the
// web app. It only reads the page; it never changes the quiz itself.
(function () {
  'use strict';
  var APP = window.__RNR_APP_STORE__ || 'https://nclexrapidnursingreview.com/';
  var SHOWN = 'rnr-quiz-prompt-shown';
  var css = '\
#rnr-ap{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:flex-end;justify-content:center;background:rgba(3,7,18,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:rnrApFade .25s ease-out}\
#rnr-ap .sheet{width:100%;max-width:520px;margin:0 12px calc(12px + env(safe-area-inset-bottom,0px));background:#111A2E;color:#E2E8F0;border:1px solid rgba(0,229,163,.35);border-radius:28px;padding:26px 22px 20px;box-shadow:0 30px 80px rgba(0,0,0,.55);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;animation:rnrApUp .35s cubic-bezier(.2,.9,.3,1.2)}\
#rnr-ap .top{display:flex;gap:14px;align-items:center}\
#rnr-ap img{width:58px;height:58px;border-radius:14px;box-shadow:0 6px 18px rgba(0,0,0,.4);flex-shrink:0}\
#rnr-ap .eyebrow{font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#00E5A3}\
#rnr-ap h2{margin:4px 0 0;font-size:21px;line-height:1.25;font-weight:900;color:#fff}\
#rnr-ap p{margin:14px 0 0;color:#B6C2D6}\
#rnr-ap ul{margin:12px 0 0;padding:0;list-style:none;display:grid;gap:7px}\
#rnr-ap li{display:flex;gap:10px;align-items:flex-start;color:#E2E8F0}\
#rnr-ap li:before{content:"";width:8px;height:8px;margin-top:8px;border-radius:50%;background:linear-gradient(90deg,#00E5A3,#00C2FF);flex-shrink:0}\
#rnr-ap .btns{display:grid;gap:10px;margin-top:20px}\
#rnr-ap a.go{display:flex;align-items:center;justify-content:center;gap:10px;background:linear-gradient(90deg,#00E5A3,#00C2FF);color:#04221F;font-weight:900;font-size:16px;text-decoration:none;border-radius:16px;padding:15px}\
#rnr-ap a.go svg{width:20px;height:20px}\
#rnr-ap button{background:none;border:0;color:#94A3B8;font:700 14px/1 inherit;padding:10px;cursor:pointer}\
#rnr-ap .web{display:block;text-align:center;margin-top:4px;font-size:13px;color:#94A3B8}\
#rnr-ap .web a{color:#00C2FF}\
@keyframes rnrApFade{from{opacity:0}to{opacity:1}}@keyframes rnrApUp{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}\
@media (prefers-reduced-motion:reduce){#rnr-ap,#rnr-ap .sheet{animation:none}}';
  var apple = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.75.73 1.05 1.6 2.24 2.73 2.2 1.1-.05 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.32-3.52zM14.2 6.13c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.31-.56.65-1.05 1.69-.92 2.68.97.08 1.96-.49 2.56-1.23z"/></svg>';
  function open() {
    if (document.getElementById('rnr-ap')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var d = document.createElement('div'); d.id = 'rnr-ap'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'rnr-ap-h');
    d.innerHTML = '<div class="sheet"><div class="top"><img src="/app/apple-touch-icon.png" alt=""><div><div class="eyebrow">Nice work. Keep going</div><h2 id="rnr-ap-h">That was 3 of 3,200 questions</h2></div></div>' +
      '<p>Get the Rapid Nursing Review app on your iPhone. It is free to download, and Pro opens everything:</p>' +
      '<ul><li>3,200 NCLEX-style questions with a rationale for every answer</li><li>30 Next Generation NCLEX case studies</li><li>The complete book, page by page, offline</li><li>Pro also works on your computer at nclexrapidnursingreview.com/app, with progress synced to your iPhone</li></ul>' +
      '<div class="btns"><a class="go" href="' + APP + '" target="_blank" rel="noopener">' + apple + 'Get it on the App Store</a><button type="button" data-close>Maybe later</button></div>' +
      '<span class="web">Already have Pro? <a href="/app/">Open the web app</a></span></div>';
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', esc);
    document.body.appendChild(d);
    var go = d.querySelector('a.go'); if (go) go.focus({ preventScroll: true });
  }
  function esc(e) { if (e.key === 'Escape') close(); }
  function close() { var d = document.getElementById('rnr-ap'); if (d) d.remove(); document.removeEventListener('keydown', esc); }
  // Results screen = the "Pass Readiness Score" card. Show once per results screen (a new drill shows it again).
  var onResults = false;
  function check() {
    var now = /Pass Readiness Score/i.test(document.body ? document.body.innerText || '' : '');
    if (now && !onResults) { onResults = true; try { sessionStorage.setItem(SHOWN, String(Date.now())); } catch (e) {} setTimeout(open, 1600); }
    if (!now) onResults = false;
  }
  var pending = 0;
  new MutationObserver(function () { if (!pending) pending = setTimeout(function () { pending = 0; check(); }, 250); })
    .observe(document.documentElement, { childList: true, subtree: true });
  window.__rnrQuizPrompt = { open: open, close: close };
})();
