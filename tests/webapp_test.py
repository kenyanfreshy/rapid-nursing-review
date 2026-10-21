# Web app (build/webapp) with a mocked Supabase: sign-in gate, subscription check, private question
# bank, protected book pages, sync, reports, sign out and account deletion. No real server is used.
#   node scripts/build-webapp.mjs && python3 tests/webapp_test.py
import json, os, re, sys, threading, functools, http.server, socketserver, hashlib, base64
from urllib.parse import unquote, parse_qs, urlparse
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB, PRIV = os.path.join(ROOT, 'build/webapp'), os.path.join(ROOT, 'build/webapp-private')
SB = 'https://test.supabase.co'
USER = {'id': '6f1c2d3e-4b5a-4c6d-8e7f-001122334455', 'email': 'jordan@example.com'}
results = []
def check(cond, name, extra=''):
    results.append(bool(cond)); print(('PASS ' if cond else 'FAIL ') + name + ('' if cond else f'  {extra}'))

# ---- serve build/webapp at /app/ ----
site = os.path.join(ROOT, 'build/_site'); os.makedirs(site, exist_ok=True)
link = os.path.join(site, 'app')
if not os.path.islink(link): os.symlink(PUB, link)
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))   # any free port
PORT = srv.server_address[1]
APP = f'http://127.0.0.1:{PORT}/app/'
threading.Thread(target=srv.serve_forever, daemon=True).start()

# ---- the public folder must hold no content ----
public_text = ''.join(open(os.path.join(dp, f), errors='ignore').read() for dp, _, fs in os.walk(PUB) for f in fs if f.endswith(('.html', '.js')))
check('Ten-nes-see' not in public_text and '"nclexBank"' not in public_text, 'public files contain no questions')
check(not any(re.match(r'p\d{3}\.webp$', f) for f in os.listdir(os.path.join(PUB, 'pages'))), 'public files contain no book pages')
content = open(os.path.join(PRIV, 'content/content.json'), 'rb').read()

class Mock:
    def __init__(self, active=True, remote=None, conflict_once=False):
        self.active, self.remote, self.version, self.conflict_once = active, remote, (1 if remote else 0), conflict_once
        self.calls, self.saved, self.reports, self.deleted, self.pages, self.resets = [], [], [], False, [], 0
        self.challenge = None
    def route(self, route):
        req = route.request; url = req.url; path = url[len(SB):]; auth = req.headers.get('authorization', '')
        self.calls.append(f'{req.method} {path.split("?")[0]}')
        hdr = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
        if req.method == 'OPTIONS': return route.fulfill(status=200, headers={**hdr, 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*'})
        signed = auth == 'Bearer AT1'
        if path.startswith('/auth/v1/authorize'):
            q = parse_qs(urlparse(url).query)
            self.challenge = (q.get('code_challenge') or [None])[0]
            if q.get('code_challenge_method') != ['s256'] or not self.challenge: return route.fulfill(status=400, headers=hdr, body='{"error":"pkce required"}')
            return route.fulfill(status=302, headers={'Location': q['redirect_to'][0] + '?code=AUTHCODE1'})
        if path.startswith('/auth/v1/token?grant_type=pkce'):
            b = json.loads(req.post_data)
            ok = b.get('auth_code') == 'AUTHCODE1' and base64.urlsafe_b64encode(hashlib.sha256(b.get('code_verifier', '').encode()).digest()).rstrip(b'=').decode() == self.challenge
            if not ok: return route.fulfill(status=400, headers=hdr, body=json.dumps({'error_description': 'bad verifier'}))
            return route.fulfill(status=200, headers=hdr, body=json.dumps({'access_token': 'AT1', 'refresh_token': 'RT1', 'expires_in': 3600, 'user': USER}))
        if path.startswith('/auth/v1/user'): return route.fulfill(status=200 if signed else 401, headers=hdr, body=json.dumps(USER))
        if path.startswith('/auth/v1/logout'): return route.fulfill(status=204, headers=hdr, body='')
        if not signed: return route.fulfill(status=401, headers=hdr, body=json.dumps({'message': 'JWT missing'}))
        if path.startswith('/functions/v1/entitlement'):
            return route.fulfill(status=200, headers=hdr, body=json.dumps({'active': self.active, 'productId': 'com.alexkorir.rapidnursingreview.pro.quarterly' if self.active else None, 'expiresAt': None, 'store': 'app_store'}))
        if path.startswith('/storage/v1/object/authenticated/content/content.json'):
            if not self.active: return route.fulfill(status=400, headers=hdr, body=json.dumps({'error': 'not found'}))
            return route.fulfill(status=200, headers=hdr, body=content)
        if path.startswith('/functions/v1/book-page'):
            p = int(re.search(r'page=(\d+)', path).group(1)); self.pages.append(p)
            return route.fulfill(status=200, headers={**hdr, 'Content-Type': 'image/webp', 'Cache-Control': 'no-store'}, body=open(os.path.join(PRIV, f'book/rnr/pages/p{p:03d}.webp'), 'rb').read())
        if path.startswith('/rest/v1/progress'):
            rows = [{'state': self.remote, 'version': self.version}] if self.remote else []
            return route.fulfill(status=200, headers=hdr, body=json.dumps(rows))
        if path.startswith('/rest/v1/rpc/save_progress'):
            body = json.loads(req.post_data)
            if self.conflict_once:
                self.conflict_once = False; self.version += 1
                return route.fulfill(status=409, headers=hdr, body=json.dumps({'code': 'PT409', 'message': 'version_conflict'}))
            if body['p_base_version'] != self.version: return route.fulfill(status=409, headers=hdr, body=json.dumps({'message': 'version_conflict'}))
            self.version += 1; self.remote = body['p_state']; self.saved.append(body['p_state'])
            return route.fulfill(status=200, headers=hdr, body=json.dumps(self.version))
        if path.startswith('/rest/v1/issue_reports'):
            self.reports += json.loads(req.post_data); return route.fulfill(status=201, headers=hdr, body='')
        if path.startswith('/functions/v1/delete-account'):
            self.deleted = True; return route.fulfill(status=200, headers=hdr, body='{"deleted":true,"appleRevoked":false}')
        if path.startswith('/rest/v1/rpc/reset_progress'):
            self.resets += 1; self.remote = None; self.version = 0; return route.fulfill(status=204, headers=hdr, body='')
        return route.fulfill(status=404, headers=hdr, body=json.dumps({'message': 'unmocked ' + path}))

CONFIG = "window.__RNR_CONFIG__={supabaseUrl:'%s',supabaseKey:'sb_publishable_test',appleSignIn:true};" % SB
def page_for(browser, mock, config=True):
    ctx = browser.new_context(viewport={'width': 1280, 'height': 860})
    if config: ctx.add_init_script(CONFIG)
    ctx.route(SB + '/**', mock.route)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    bad = []
    pg.on('request', lambda r: bad.append(r.url) if re.search(r'/pages/p\d{3}\.webp', r.url) else None)
    return ctx, pg, errs, bad

def app_ready(pg):
    pg.wait_for_function("!document.querySelector('#rnr-gate') && document.querySelector('#main') && document.querySelector('#main').children.length>0", timeout=15000)

def sign_in(pg):
    pg.goto(APP); pg.wait_for_selector('#wg-apple', timeout=10000); pg.click('#wg-apple')

with sync_playwright() as p:
    b = p.chromium.launch()

    # Not connected to a server yet (REPLACE_ME config): clear message, nothing requested.
    m = Mock(); ctx, pg, errs, _ = page_for(b, m, config=False)
    ctx.add_init_script("window.__RNR_CONFIG__={supabaseUrl:'https://REPLACE_ME.supabase.co',supabaseKey:'REPLACE_ME'};")
    pg.goto(APP); pg.wait_for_timeout(500)
    check("isn't connected to its server" in pg.inner_text('#rnr-gate'), 'unconfigured build says it is not connected')
    check(not m.calls, 'unconfigured build makes no server calls'); ctx.close()

    # A link carrying someone else's tokens in the fragment must not sign the visitor in.
    m = Mock(); ctx, pg, errs, _ = page_for(b, m)
    pg.goto(APP + '#access_token=AT1&refresh_token=RT1&expires_in=3600&token_type=bearer'); pg.wait_for_selector('#wg-apple', timeout=10000)
    check(pg.evaluate("localStorage.getItem('rnr.session.v1')") is None and '#access_token' not in pg.url, 'tokens in a crafted link are ignored (PKCE only)')
    ctx.close()

    # Subscriber: sign in → subscription check → question bank → the app.
    m = Mock(remote={'attempts': [{'id': 'phone:cardio-basics-q1', 'session': 'phone', 'qid': 'cardio-basics-q1', 'selected': 0, 'correct': True, 'score': 1, 'day': '2026-10-16', 'at': '2026-10-16T17:00:00.000Z'}],
                     'bookmarks': ['cardio-basics-q1'], 'name': 'Jordan', 'edited': {'name': '2026-10-16T17:00:00.000Z'}, 'history': [], 'reports': [], 'book': {'marks': [44]}})
    ctx, pg, errs, bad = page_for(b, m)
    sign_in(pg)
    app_ready(pg)
    check(not pg.query_selector('#rnr-gate'), 'gate removed after sign-in')
    check(m.calls.index('POST /functions/v1/entitlement') < m.calls.index('GET /storage/v1/object/authenticated/content/content.json'), 'subscription checked before the question bank is requested')
    check(pg.evaluate('window.__RNR_PRO__===true && window.__RNR_WEB__===true'), 'web app runs as Pro')
    check(pg.evaluate("localStorage.getItem('rnr.session.v1')!==null"), 'session kept for this browser')
    pg.wait_for_timeout(1500)
    st = pg.evaluate("JSON.parse(localStorage.getItem('rapid-nursing-review-v1')||'{}')")
    check(any(a.get('id') == 'phone:cardio-basics-q1' for a in st.get('attempts', [])), 'progress from the phone merged on launch')
    check(st.get('name') == 'Jordan', 'name from the phone (edited last) applied')
    check(len(m.saved) >= 1, 'merged progress saved back to the account')
    check('ui' not in (m.saved[-1] if m.saved else {}) and 'quarantine' not in (m.saved[-1] if m.saved else {}), 'device-only settings not uploaded')

    # No selling on the web: the paywall explains where to subscribe, with no prices or buy buttons.
    # (reload re-runs the gate; Pro comes back from the server check)
    pg.evaluate("window.__RNR_PRO__=false"); pg.goto(APP + '#practice'); pg.reload()
    pg.wait_for_selector('#main .topic-tile', timeout=15000)
    check(pg.evaluate('window.__RNR_PRO__') is True, 'Pro restored from the server check after reload')

    # Protected book pages: drawn on a canvas, fetched one page at a time, never as pages/pNNN.webp.
    pg.click('[data-action="toggle-book"]'); pg.wait_for_timeout(500)
    pg.evaluate("document.querySelector('#book-panel [data-action=\"open-page\"], #book-panel [data-action=\"read\"], #book-panel [data-action=\"tab\"][data-tab=\"reader\"]')?.click()")
    pg.wait_for_timeout(500)
    pg.evaluate("(()=>{const b=[...document.querySelectorAll('#book-panel button,#book-panel [data-action]')].find(x=>/reader/i.test(x.textContent));b&&b.click();})()")
    pg.wait_for_function("document.querySelector('canvas.rnr-page')", timeout=10000)
    pg.wait_for_timeout(1500)
    check(m.pages, 'book page requested from the book-page function', m.pages)
    check(not bad, 'no direct requests for book page images', bad[:3])
    check(not pg.query_selector('#book-panel img[src*="pages/p"]'), 'no <img> of a book page in the reader')
    drawn = pg.evaluate("(()=>{const c=document.querySelector('canvas.rnr-page');const d=c.getContext('2d').getImageData(450,300,1,1).data;return d[3]>0})()")
    check(drawn, 'page drawn on the canvas')
    pg.evaluate("(()=>{const b=document.querySelector('#book-panel [data-action=close-book], #book-panel .bp-close, [data-action=close-book]');b&&b.click();})()"); pg.wait_for_timeout(400)

    # Settings: "Your account" card with sync, sign out and delete (no web URL pitch on the web).
    pg.evaluate("document.querySelector('[data-action=settings]').click()"); pg.wait_for_selector('#sync-card .sync-row')
    card = pg.inner_text('#sync-card')
    check('your account' in card.lower() and 'Sync now' in card and 'Sign out' in card and 'Delete account' in card, 'account card shows sync, sign out and delete', card)
    first = pg.evaluate("document.querySelector('#modal .sync-card')===document.querySelector('#modal section, #modal .theme-card')")
    check(first, 'account card is the first card in Settings')

    # Reports reach the review queue once signed in.
    pg.evaluate("""(()=>{const s=JSON.parse(localStorage.getItem('rapid-nursing-review-v1'));s.reports.push({id:'rep-1',qid:'cardio-basics-q1',reason:'Typo',details:'S4 spelled wrong',created:new Date().toISOString(),status:'saved'});localStorage.setItem('rapid-nursing-review-v1',JSON.stringify(s));})()""")
    pg.reload(); app_ready(pg); pg.wait_for_timeout(1500)
    check(any(r.get('id') == 'rep-1' for r in m.reports), 'question report sent to the review queue', m.reports)

    # Reset while signed in clears the synced copy too, so the old progress doesn't come back.
    pg.evaluate("document.querySelector('[data-action=settings]').click()"); pg.wait_for_selector('#sync-card')
    pg.evaluate("document.querySelector('[data-action=confirm-reset]').click()"); pg.wait_for_selector('#modal [data-action=reset]')
    pg.click('#modal [data-action=reset]'); pg.wait_for_timeout(5500)
    st = pg.evaluate("JSON.parse(localStorage.getItem('rapid-nursing-review-v1'))")
    check(m.resets == 1 and not st['attempts'] and not st['bookmarks'], 'reset while signed in clears the synced copy and stays reset', (m.resets, len(st['attempts'])))

    # Delete account: needs DELETE typed, then the server deletes it and the gate comes back.
    pg.evaluate("document.querySelector('[data-action=settings]').click()"); pg.wait_for_selector('#sync-card')
    pg.click('[data-action="acct-delete"]'); pg.wait_for_selector('#del-confirm')
    check(pg.is_disabled('[data-action="acct-delete-confirm"]'), 'delete stays disabled until DELETE is typed')
    pg.fill('#del-confirm', 'DELETE'); pg.click('[data-action="acct-delete-confirm"]')
    pg.wait_for_selector('#wg-apple', timeout=10000)
    check(m.deleted, 'account deleted on the server')
    check(pg.evaluate("localStorage.getItem('rnr.session.v1')") is None, 'signed out after deletion')
    check(not errs, 'no page errors (subscriber)', errs[:3]); ctx.close()

    # Version conflict: another device saved first → merge again and save.
    m = Mock(remote={'attempts': [], 'name': 'Student'}, conflict_once=True); ctx, pg, errs, _ = page_for(b, m)
    sign_in(pg); app_ready(pg); pg.wait_for_timeout(1500)
    check(m.calls.count('POST /rest/v1/rpc/save_progress') >= 2 and m.saved, 'version conflict merged and retried')
    ctx.close()

    # Not a subscriber: clear steps, no question bank download, no purchase on the web.
    m = Mock(active=False); ctx, pg, errs, _ = page_for(b, m)
    sign_in(pg); pg.wait_for_selector('#wg-again', timeout=10000)
    txt = pg.inner_text('#rnr-gate')
    check("couldn't find an active" in txt and 'Settings → Sync and web access' in txt and 'Restore Purchases' in txt, 'non-subscriber sees how to subscribe and link the account in the app')
    check(not any('content.json' in c for c in m.calls), 'non-subscriber never requests the question bank')
    check(not re.search(r'\$\d|buy|purchase now|subscribe now', txt, re.I), 'no prices or buy buttons on the web')
    pg.click('#wg-out'); pg.wait_for_selector('#wg-apple')
    check(pg.evaluate("localStorage.getItem('rnr.session.v1')") is None, 'sign out from the gate')
    ctx.close()

    # Network failure at the subscription check: the message names the step.
    m = Mock(); ctx, pg, errs, _ = page_for(b, m)
    sign_in(pg); app_ready(pg)
    ctx.unroute(SB + '/**'); ctx.route(SB + '/**', m.route); ctx.route(SB + '/functions/v1/entitlement', lambda r: r.abort())  # later routes win
    pg.reload(); pg.wait_for_selector('.wg-err', timeout=10000)
    check("Couldn't reach the subscription check" in pg.inner_text('.wg-err'), 'network errors name the failed step', pg.inner_text('.wg-err'))
    ctx.close()
    b.close()

srv.shutdown()
print(f'\n{sum(results)} passed, {len(results) - sum(results)} failed')
sys.exit(0 if all(results) else 1)
