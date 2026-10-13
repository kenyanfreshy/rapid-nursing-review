# App color themes (Settings → App colors) and the phone bottom bar.
# Serve dist/ on 127.0.0.1:4173 first.
from playwright.sync_api import sync_playwright
import sys
U = 'http://127.0.0.1:4173/'; OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
res = []
def check(n, ok, info=''): res.append(('PASS' if ok else 'FAIL', n, info))
bg = lambda pg: pg.evaluate("getComputedStyle(document.body).backgroundColor")
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    pg = b.new_page(viewport={'width': 440, 'height': 956}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(U); pg.evaluate('localStorage.clear()'); pg.reload(); pg.wait_for_timeout(700)
    check('default theme is Vivid (NurseBound dark)', pg.evaluate("document.documentElement.dataset.ui") == 'vivid' and bg(pg) == 'rgb(8, 11, 22)', bg(pg))
    # bottom bar: five pages; Overview lives in the menu drawer (and the logo)
    labels = pg.locator('.tabbar .tab .tab-label').all_inner_texts()
    check('bottom bar has the five pages', labels == ['Plan', 'Book', 'Practice', 'Progress', 'Bookmarks'], labels)
    check('menu button visible', pg.locator('#menu').is_visible())
    pg.click('#menu'); pg.wait_for_timeout(250)
    check('menu opens the drawer', pg.evaluate("document.querySelector('#sidebar').classList.contains('open')"))
    pg.screenshot(path=f'{OUT}/ui-menu.png')
    pg.mouse.click(420, 500); pg.wait_for_timeout(250)
    check('tap outside closes the drawer', not pg.evaluate("document.querySelector('#sidebar').classList.contains('open')"))
    pg.goto(U + '#practice'); pg.wait_for_timeout(200); pg.click('.topbar-home'); pg.wait_for_timeout(200)
    check('logo opens Overview', pg.evaluate('location.hash') == '#dashboard')
    for i, route in enumerate(['plan', 'book', 'practice', 'progress', 'bookmarks']):
        pg.locator('.tabbar .tab').nth(i).click(); pg.wait_for_timeout(150)
        ok = pg.evaluate('location.hash') == '#' + route and pg.locator('.tabbar .tab').nth(i).get_attribute('aria-current') == 'page'
        check(f'tab opens {route}', ok)
    check('top-right shortcuts kept', all(pg.locator(sel).is_visible() for sel in ['.search-trigger', '[data-action=notifications]', '.book-toggle', '#top-initials']))
    # theme picker in Settings
    pg.click('#top-initials'); pg.wait_for_timeout(200)
    check('settings shows four color choices', pg.locator('#modal .ui-swatch').count() == 4)
    pg.screenshot(path=f'{OUT}/ui-settings.png')
    for ui, label in [('ocean', 'Ocean'), ('sunrise', 'Sunrise'), ('daylight', 'Daylight'), ('vivid', 'Vivid')]:
        pg.click(f'#modal [data-action=set-ui][data-ui={ui}]'); pg.wait_for_timeout(150)
        check(f'{label}: applied and marked', pg.evaluate("document.documentElement.dataset.ui") == ui and pg.get_attribute(f'#modal [data-ui={ui}]', 'aria-checked') == 'true')
    pg.click('#modal [data-action=set-ui][data-ui=daylight]'); pg.wait_for_timeout(150)
    check('Daylight switches to the light theme', bg(pg) != 'rgb(8, 11, 22)' and pg.evaluate("document.getElementById('nb-theme').disabled") is True, bg(pg))
    pg.click('#modal [data-action=close-modal]'); pg.reload(); pg.wait_for_timeout(500)
    check('theme choice survives reload', pg.evaluate("document.documentElement.dataset.ui") == 'daylight')
    pg.goto(U + '#practice'); pg.wait_for_timeout(300); pg.screenshot(path=f'{OUT}/ui-daylight.png')
    # exams stay white in every theme
    for ui in ('daylight', 'ocean'):
        pg.evaluate(f"s=JSON.parse(localStorage.getItem('rapid-nursing-review-v1'));s.ui='{ui}';localStorage.setItem('rapid-nursing-review-v1',JSON.stringify(s))"); pg.reload(); pg.wait_for_timeout(400)
        pg.click('main [data-action=quick]'); pg.wait_for_timeout(200)
        check(f'{ui}: exam screen is white', pg.evaluate("getComputedStyle(document.querySelector('#modal')).backgroundColor") == 'rgb(255, 255, 255)')
        pg.click('#modal [data-action=close-modal]'); pg.evaluate("s=JSON.parse(localStorage.getItem('rapid-nursing-review-v1'));s.session=null;localStorage.setItem('rapid-nursing-review-v1',JSON.stringify(s))")
    pg.reload(); pg.wait_for_timeout(300); pg.goto(U + '#practice'); pg.wait_for_timeout(300); pg.screenshot(path=f'{OUT}/ui-ocean.png')
    # NurseBound topic tiles: 13px Figtree semibold names, 8px gaps, 12px radius, natural height (scrolls like NurseBound)
    pg.set_viewport_size({'width': 440, 'height': 956}); pg.goto(U + '#practice'); pg.wait_for_timeout(300)
    r = pg.evaluate("""(()=>{const t=document.querySelector('.topic-tile'),n=t.querySelector('.name'),g=getComputedStyle(document.querySelector('.topic-grid'));return {fs:getComputedStyle(n).fontSize,fw:getComputedStyle(n).fontWeight,gap:g.rowGap,rad:getComputedStyle(t).borderRadius}})()""")
    check('topic tiles use NurseBound spacing and type', r == {'fs': '13px', 'fw': '600', 'gap': '8px', 'rad': '12px'}, r)
    check('free plan: Upgrade pill in the top bar', pg.locator('.upgrade-pill').count() == 1)
    check('no page errors', not errs, errs[:3])
    b.close()
for r in res: print(*r)
print(sum(r[0] == 'PASS' for r in res), 'passed,', sum(r[0] == 'FAIL' for r in res), 'failed')
