# iPhone bundle (mobile/assets/web/index.html, file:// like the WebView) with a fake native bridge and a
# mocked Supabase: the optional "Sync and web access" card, Sign in with Apple through the native shell,
# RevenueCat account link, sync, and screenshot protection while a book page is open.
#   cd mobile && node scripts/build-web.mjs && cd .. && python3 tests/phone_sync_test.py
from playwright.sync_api import sync_playwright
import json, os, re, sys
U = 'file://' + os.path.abspath('mobile/assets/web/index.html')
SB = 'https://test.supabase.co'
USER = {'id': '6f1c2d3e-4b5a-4c6d-8e7f-001122334455', 'email': 'abc@privaterelay.appleid.com'}
results = []
def check(cond, name, extra=''):
    results.append(bool(cond)); print(('PASS ' if cond else 'FAIL ') + name + ('' if cond else f'  {extra}'))
BRIDGE = "window.__msgs=[];window.ReactNativeWebView={postMessage:m=>window.__msgs.push(JSON.parse(m))};"
CONFIG = "window.__RNR_CONFIG__={supabaseUrl:'%s',supabaseKey:'sb_publishable_test',appleSignIn:true};" % SB
calls, saved, tokens, deletes = [], [], [], []
def route(r):
    path = r.request.url[len(SB):]; calls.append(f'{r.request.method} {path.split("?")[0]}')
    h = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    if r.request.method == 'OPTIONS': return r.fulfill(status=200, headers={**h, 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*'})
    if path.startswith('/auth/v1/token?grant_type=id_token'):
        tokens.append(json.loads(r.request.post_data))
        return r.fulfill(status=200, headers=h, body=json.dumps({'access_token': 'AT1', 'refresh_token': 'RT1', 'expires_in': 3600, 'user': USER}))
    if r.request.headers.get('authorization') != 'Bearer AT1': return r.fulfill(status=401, headers=h, body='{"message":"no"}')
    if path.startswith('/rest/v1/progress'): return r.fulfill(status=200, headers=h, body='[]')
    if path.startswith('/rest/v1/rpc/save_progress'):
        saved.append(json.loads(r.request.post_data)); return r.fulfill(status=200, headers=h, body=str(len(saved)))
    if path.startswith('/auth/v1/logout'): return r.fulfill(status=204, headers=h, body='')
    if path.startswith('/functions/v1/delete-account'):
        deletes.append(json.loads(r.request.post_data)); return r.fulfill(status=200, headers=h, body='{"deleted":true,"appleRevoked":true}')
    return r.fulfill(status=404, headers=h, body='{}')

with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    # 1. Shipped config (REPLACE_ME / appleSignIn false): no card, no network, app unchanged.
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    ctx.add_init_script(BRIDGE + "window.__RNR_CONFIG__={appleSignIn:false};"); ctx.route(SB + '/**', route); ctx.route('https://*.supabase.co/**', route)
    pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    net = []; pg.on('request', lambda r: net.append(r.url) if 'supabase' in r.url else None)
    pg.goto(U); pg.wait_for_timeout(600); pg.click('#top-initials'); pg.wait_for_timeout(300)
    check(not pg.query_selector('#sync-card'), 'with appleSignIn off (until the Apple provider is live) the card is hidden')
    check(not net, 'no server requests without an account', net[:3])
    ctx.close()

    # 2. Backend configured: optional card at the top of Settings.
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    ctx.add_init_script(BRIDGE + CONFIG); ctx.route(SB + '/**', route)
    pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(U); pg.wait_for_timeout(600); pg.click('#top-initials'); pg.wait_for_selector('#sync-card')
    card = pg.evaluate("document.querySelector('#sync-card').innerText")
    check('sync and web access' in card.lower() and 'Optional' in card and 'nclexrapidnursingreview.com/app' in card, 'card explains sync and the web address', card)
    check(pg.evaluate("document.querySelector('#modal .theme-card, #modal section')?.id==='sync-card'"), 'card is at the very top of Settings')
    check(not calls, 'nothing sent to the server before signing in', calls)

    # Cancelled Apple sheet: no error, still signed out.
    pg.click('[data-action="acct-signin"]'); pg.wait_for_timeout(200)
    check(any(m['type'] == 'apple-signin' for m in pg.evaluate('window.__msgs')), 'tap asks the native shell for Sign in with Apple')
    pg.evaluate("window.__rnrAppleResult({ok:false,cancelled:true})"); pg.wait_for_timeout(300)
    check(not pg.query_selector('#sync-card .sync-err') and pg.query_selector('[data-action="acct-signin"]'), 'cancelling shows no error')

    # Signed in: identity token + raw nonce exchanged, RevenueCat link requested, progress synced.
    pg.click('[data-action="acct-signin"]'); pg.wait_for_timeout(200)
    pg.evaluate("window.__rnrAppleResult({ok:true,identityToken:'eyJ.apple.token',rawNonce:'raw-nonce-123'})")
    pg.wait_for_selector('#sync-card [data-action="acct-sync"]', timeout=5000); pg.wait_for_timeout(500)
    check(tokens and tokens[0] == {'provider': 'apple', 'id_token': 'eyJ.apple.token', 'nonce': 'raw-nonce-123'}, 'identity token and raw nonce sent to Supabase', tokens)
    acct = [m for m in pg.evaluate('window.__msgs') if m['type'] == 'account']
    check(acct and acct[-1]['userId'] == USER['id'], 'native shell told to link RevenueCat to the account id', acct)
    check(saved and 'attempts' in saved[0]['p_state'] and saved[0]['p_base_version'] == 0, 'progress uploaded on first sign-in')
    card = pg.evaluate("document.querySelector('#sync-card').innerText")
    check('privaterelay' not in card and 'Last synced' in card and 'Delete account' in card, 'signed-in card hides the relay address and offers sync and delete', card)

    # Answering a question syncs again (debounced) without blocking the app.
    n = len(saved); pg.click('[data-action=close-modal]')
    pg.evaluate("window.__rnrResume()"); pg.wait_for_timeout(1200)
    check(len(saved) > n, 'syncs again when the app returns to the foreground')

    # Book page on screen → block screenshots; closed → allow them again.
    pg.click('.book-toggle'); pg.click('#book-panel [data-action=toc-expand][data-id=endo]'); pg.click('#book-panel [data-action=read-section][data-id=endo-dm]'); pg.wait_for_timeout(500)
    bv = [m for m in pg.evaluate('window.__msgs') if m['type'] == 'book-visible']
    check(bv and bv[-1]['on'] is True, 'book page open → screenshot protection on', bv)
    pg.click('#book-panel [data-action=close-book]'); pg.wait_for_timeout(300)
    bv = [m for m in pg.evaluate('window.__msgs') if m['type'] == 'book-visible']
    check(bv and bv[-1]['on'] is False, 'book closed → screenshot protection off', bv)

    # Delete account on the phone: Apple is asked again, and its authorization code goes to the server for revocation.
    pg.click('#top-initials'); pg.wait_for_selector('#sync-card'); pg.click('[data-action="acct-delete"]'); pg.fill('#del-confirm', 'DELETE')
    pg.click('[data-action="acct-delete-confirm"]'); pg.wait_for_timeout(200)
    pg.evaluate("window.__rnrAppleResult({ok:false,cancelled:true})"); pg.wait_for_timeout(300)
    check(not deletes and pg.query_selector('#del-confirm'), 'cancelling the Apple sheet cancels the deletion')
    pg.fill('#del-confirm', 'DELETE'); pg.click('[data-action="acct-delete-confirm"]'); pg.wait_for_timeout(200)
    pg.evaluate("window.__rnrAppleResult({ok:true,identityToken:'t',rawNonce:'n',authorizationCode:'apple-code-1'})"); pg.wait_for_timeout(600)
    check(deletes and deletes[0].get('appleAuthorizationCode') == 'apple-code-1', 'deletion sends the Apple code for token revocation', deletes)
    check(pg.evaluate("localStorage.getItem('rnr.session.v1')") is None, 'signed out after deletion')
    # Sign in again for the sign-out check.
    pg.click('#top-initials'); pg.wait_for_selector('[data-action="acct-signin"]'); pg.click('[data-action="acct-signin"]'); pg.wait_for_timeout(200)
    pg.evaluate("window.__rnrAppleResult({ok:true,identityToken:'eyJ.apple.token',rawNonce:'raw-nonce-123'})"); pg.wait_for_selector('#sync-card [data-action="acct-signout"]', timeout=5000)
    pg.click('[data-action=close-modal]')

    # Sign out keeps local progress.
    pg.click('#top-initials'); pg.wait_for_selector('#sync-card'); pg.click('[data-action="acct-signout"]'); pg.wait_for_timeout(400)
    check(pg.query_selector('[data-action="acct-signin"]') and pg.evaluate("JSON.parse(localStorage.getItem('rapid-nursing-review-v1')).attempts.length>=0"), 'sign out returns to the optional card, progress stays')
    check(not errs, 'no page errors', errs[:3])
    b.close()

print(f'\n{sum(results)} passed, {len(results) - sum(results)} failed')
sys.exit(0 if all(results) else 1)
