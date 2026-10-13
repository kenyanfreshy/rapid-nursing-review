# Device fit: on every iPhone and iPad size, all 19 topics and Start fit above the tab bar, with no sideways scrolling.
# Serve dist/ on 127.0.0.1:4173, then: python3 tests/devices_test.py <screenshot-folder>
from playwright.sync_api import sync_playwright
import sys
S=sys.argv[1];U='http://127.0.0.1:4173/'
# app areas (points) after the status bar and home indicator / tab bar insets
devs=[('iPhone SE',375,647),('iPhone 16',393,759),('iPhone 16 Pro Max 6.9in',440,860),('iPad mini portrait',744,1093),('iPad Air portrait',820,1140),('iPad Pro 13in portrait',1032,1336),('iPad Air landscape',1180,780),('iPad Pro landscape',1376,992)]
with sync_playwright() as p:
    b=p.chromium.launch(); errs=[]
    for name,w,h in devs:
        pg=b.new_page(viewport={'width':w,'height':h},is_mobile=True,has_touch=True); pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(U+'#practice'); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(500)
        r=pg.evaluate("""(()=>{const t=[...document.querySelectorAll('.topic-tile')];const tb=document.querySelector('.tabbar');const bar=getComputedStyle(tb).display!=='none'?tb.getBoundingClientRect().top:innerHeight;const de=document.documentElement;return {layout:getComputedStyle(tb).display!=='none'?'bottom bar':'sidebar',cols:getComputedStyle(document.querySelector('.topic-grid')).gridTemplateColumns.split(' ').length,cards:getComputedStyle(document.querySelector('.test-grid')).gridTemplateColumns.split(' ').length,topicsFit:t[t.length-1].getBoundingClientRect().bottom<=bar,startFits:document.querySelector('[data-action=start-pick]').getBoundingClientRect().bottom<=bar,sideways:de.scrollWidth>de.clientWidth}})()""")
        print(f"{name:26} {w}x{h}: {r}")
        pg.screenshot(path=f"{S}/dev-{w}.png"); pg.close()
    print('errors',errs); b.close()
