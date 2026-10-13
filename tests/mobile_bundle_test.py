# Loads mobile/assets/web/index.html from file:// (as the WebView does) with a fake native bridge.
from playwright.sync_api import sync_playwright
import json,os
U='file://'+os.path.abspath('mobile/assets/web/index.html')
res=[]
def check(n,ok,info=''): res.append(('PASS' if ok else 'FAIL',n,info))
BRIDGE="""window.__msgs=[];window.ReactNativeWebView={postMessage:m=>window.__msgs.push(JSON.parse(m))};"""
with sync_playwright() as p:
    b=p.chromium.launch(); errs=[]
    ctx=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    saved={'name':'Ama','attempts':[{'qid':'p1','correct':True,'day':'2026-10-11'}],'bookmarks':['endo-dm-q1'],'history':[]}
    ctx.add_init_script(BRIDGE+f"window.__RNR_SAVED__={json.dumps(json.dumps(saved))};")
    pg=ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(U); pg.wait_for_timeout(700)
    check('renders from file:// without module errors','Ama' in pg.inner_text('main'),pg.inner_text('main')[:80])
    check('restores progress from native copy',pg.locator('.stat .big-number').first.inner_text()=='1')
    msgs=pg.evaluate('window.__msgs'); check('migrated state saved to native',any(m['type']=='save' for m in msgs))
    pg.click('.book-toggle'); pg.click('#book-panel [data-action=toc-expand][data-id=endo]'); pg.click('#book-panel [data-action=read-section][data-id=endo-dm]'); pg.wait_for_timeout(500)
    check('book page image loads from bundled files',pg.evaluate("document.querySelector('#book-panel .page-frame img').naturalWidth")>0)
    check('cover loads',pg.evaluate("document.querySelector('.bp-cover').naturalWidth")>0)
    pg.click('#book-panel [data-action=section-quiz]'); m=pg.locator('#modal')
    if m.locator('[data-action=pick-cell]').count():
        [m.locator(f'[data-action=pick-cell][data-row="{r}"][data-col="0"]').click() for r in range(m.locator('table.matrix tbody tr').count())]
    elif m.locator('[data-action=pick-order]').count():
        [m.locator('[data-action=pick-order]').first.click() for _ in range(m.locator('[data-action=pick-order]').count())]
    else: m.locator('[data-action=select-answer]').first.click()
    pg.click('[data-action=submit-answer]')
    last=[m for m in pg.evaluate('window.__msgs') if m['type']=='save'][-1]
    check('answer saved through native bridge',len(json.loads(last['data'])['attempts'])==2)
    pg.click('[data-action=close-modal]'); pg.click('#book-panel [data-action=close-book]'); pg.click('#top-initials'); pg.click('#modal [data-action=export]'); pg.wait_for_timeout(200)
    ex=[m for m in pg.evaluate('window.__msgs') if m['type']=='export']
    check('export goes to native share',len(ex)==1 and ex[0]['filename'].endswith('.json') and '"attempts"' in ex[0]['data'])
    # Pro bridge: locked content asks the native app for its paywall; a purchase reported back unlocks it.
    pg.click('#modal [data-action=close-modal]') if pg.evaluate("document.querySelector('#modal').open") else None
    pg.goto(pg.url.split('#')[0] + '#practice'); pg.wait_for_timeout(300)
    check('free plan in the app (no preview unlock)', pg.locator('.free-banner').count() == 1 and pg.locator('[data-action=pw-preview]').count() == 0)
    pg.click('[data-action=start-blueprint]'); pg.wait_for_timeout(200)
    pw=[m for m in pg.evaluate('window.__msgs') if m['type']=='paywall']
    check('locked item opens the native paywall', len(pw) == 1 and 'blueprint' in pw[0]['reason'] and not pg.evaluate("document.querySelector('#modal').open"))
    pg.evaluate('window.__rnrSetPro(true)'); pg.wait_for_timeout(300)
    check('native purchase unlocks Pro', pg.locator('.free-banner').count() == 0)
    pg.click('[data-action=start-blueprint]'); pg.wait_for_timeout(300)
    check('unfinished quiz is offered first', 'session in progress' in pg.inner_text('#modal'))
    pg.click('#modal [data-action=finish]'); pg.wait_for_timeout(200); pg.click('#modal [data-action=close-modal]')
    pg.click('[data-action=start-blueprint]'); pg.wait_for_timeout(300)
    check('blueprint exam starts after purchase', pg.evaluate("document.querySelector('#modal').open") and 'Question 1 of 75' in pg.inner_text('#modal'))
    check('no horizontal scroll on phone',pg.evaluate('document.documentElement.scrollWidth<=window.innerWidth'))
    pg.screenshot(path=os.environ.get('SHOT','/tmp/m.png'))
    pg.goto(pg.url.split('#')[0] + '#dashboard'); pg.wait_for_timeout(400); pg.click('#top-initials'); pg.wait_for_timeout(400)
    imgs = pg.evaluate("[...document.querySelectorAll('.topbar-logo, .tutor-avatar.photo, .sidebar img')].map(i => [i.getAttribute('src'), i.complete && i.naturalWidth > 0])")
    check('app images load in the bundle (top-bar logo, tutor photo)', imgs and all(ok for _, ok in imgs) and any('tutor' in s for s, _ in imgs) and any('logo' in s for s, _ in imgs), imgs)
    check('no page errors',not errs,errs)
    b.close()
for r in res: print(*r)
