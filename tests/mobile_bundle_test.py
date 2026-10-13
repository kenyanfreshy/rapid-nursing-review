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
    pg.click('#book-panel [data-action=section-quiz]'); pg.click('[data-choice="2"]'); pg.click('[data-action=submit-answer]')
    last=[m for m in pg.evaluate('window.__msgs') if m['type']=='save'][-1]
    check('answer saved through native bridge',len(json.loads(last['data'])['attempts'])==2)
    pg.click('[data-action=close-modal]'); pg.click('#book-panel [data-action=close-book]'); pg.click('#top-initials'); pg.click('#modal [data-action=export]'); pg.wait_for_timeout(200)
    ex=[m for m in pg.evaluate('window.__msgs') if m['type']=='export']
    check('export goes to native share',len(ex)==1 and ex[0]['filename'].endswith('.json') and '"attempts"' in ex[0]['data'])
    check('no horizontal scroll on phone',pg.evaluate('document.documentElement.scrollWidth<=window.innerWidth'))
    pg.screenshot(path=os.environ.get('SHOT','/tmp/m.png'))
    check('no page errors',not errs,errs)
    b.close()
for r in res: print(*r)
