# iPhone bundle with a fake native bridge: finished sessions and NGN cases are reported to the native shell
# (which decides about the App Store rating sheet), and Settings has a "Rate the app" button on iOS only.
#   cd mobile && node scripts/build-web.mjs && cd .. && python3 tests/rating_bridge_test.py
from playwright.sync_api import sync_playwright
import os, sys
U = 'file://' + os.path.abspath('mobile/assets/web/index.html')
results = []
def check(c, name, extra=''):
    results.append(bool(c)); print(('PASS ' if c else 'FAIL ') + name + ('' if c else f'  {extra}'))
def answer_any(pg):
    m = pg.locator('#modal')
    if m.locator('[data-action=pick-cell]').count():
        for r in range(m.locator('table.matrix tbody tr').count()): m.locator(f'[data-action=pick-cell][data-row="{r}"][data-col="0"]').click()
    elif m.locator('[data-action=pick-order]').count():
        while m.locator('[data-action=pick-order]').count(): m.locator('[data-action=pick-order]').first.click()
    else:
        m.locator('[data-action=select-answer]').first.click()
BRIDGE = "window.__msgs=[];window.ReactNativeWebView={postMessage:m=>window.__msgs.push(JSON.parse(m))};window.__RNR_CONFIG__={appleSignIn:false};"
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    for os_name in ['ios', 'android']:
        c = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        c.add_init_script(BRIDGE + f"window.__RNR_OS__='{os_name}';"); pg = c.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(U); pg.wait_for_timeout(600)
        if os_name == 'ios':
            pg.goto(U + '#practice'); pg.wait_for_timeout(400)
            pg.click('main [data-action=quick]'); pg.wait_for_timeout(300)
            for _ in range(4):
                answer_any(pg); pg.click('[data-action=submit-answer]'); pg.wait_for_timeout(150)
                pg.locator('#modal [data-action=next], #modal [data-action=next-question], #modal [data-action=finish]').first.click(); pg.wait_for_timeout(200)
            m = [x for x in pg.evaluate('window.__msgs') if x['type'] == 'session-complete']
            check(m and m[-1]['kind'] == 'session' and m[-1]['total'] == 4 and 'points' in m[-1] and 'max' in m[-1], 'finished session reported to the native shell', m)
            pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
        pg.click('#top-initials'); pg.wait_for_selector('#modal')
        btn = pg.query_selector('[data-action=rate-app]')
        if os_name == 'ios':
            check(btn is not None, 'iOS: Settings shows "Rate the app"')
            btn.click(); pg.wait_for_timeout(150)
            check(any(x['type'] == 'rate-app' for x in pg.evaluate('window.__msgs')), 'tap asks the native shell to open the review')
        else:
            check(btn is None, 'Android (not launched yet): no Rate button')
        c.close()
    # Website: no native shell, no Rate button, nothing posted
    c = b.new_context(viewport={'width': 1280, 'height': 800}); pg = c.new_page(); pg.goto(U); pg.wait_for_timeout(500)
    pg.click('#top-initials'); pg.wait_for_selector('#modal')
    check(pg.query_selector('[data-action=rate-app]') is None, 'no Rate button outside the iPhone app')
    check(not errs, 'no page errors', errs[:3])
    b.close()
print(f'\n{sum(results)} passed, {len(results) - sum(results)} failed'); sys.exit(0 if all(results) else 1)
