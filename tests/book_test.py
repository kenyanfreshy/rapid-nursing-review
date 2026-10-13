# Book panel and book-structured quiz checks. Serve dist/ on 127.0.0.1:4173 first.
from playwright.sync_api import sync_playwright
import json,sys
U='http://127.0.0.1:4173/';K='rapid-nursing-review-v1';OUT=sys.argv[1] if len(sys.argv)>1 else '.'
res=[]
def check(n,ok,info=''): res.append(('PASS' if ok else 'FAIL',n,info))
get=lambda pg: pg.evaluate(f"JSON.parse(localStorage.getItem('{K}'))")
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1440,'height':900}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear();localStorage.setItem('rapid-nursing-review-v1',JSON.stringify({attempts:[],bookmarks:[],history:[],previewPro:true}))"); pg.reload(); pg.wait_for_timeout(600)
    check('book panel open by default on wide screen',pg.is_visible('#book-panel'))
    check('11 chapters in panel contents',pg.locator('#book-panel .toc-chapter').count()==11)
    pg.screenshot(path=f'{OUT}/desktop-dashboard.png')
    # expand respiratory, read PE
    pg.click('#book-panel [data-action=toc-expand][data-id=resp]')
    check('respiratory shows 12 sections',pg.locator('#book-panel .toc-sections .section-row').count()==12)
    pg.click('#book-panel [data-action=read-section][data-id=resp-pe]'); pg.wait_for_timeout(400)
    check('reader opens at PE start page 18','Page 18 of 196' in pg.inner_text('#book-panel .where'))
    check('page image loads',pg.evaluate("document.querySelector('#book-panel .page-frame img').naturalWidth")>0)
    pg.click('#book-panel [data-action=page-step][data-step="1"]'); check('next page 19','Page 19' in pg.inner_text('#book-panel .where'))
    pg.click('#book-panel [data-action=mark-page]'); check('page bookmark saved',19 in get(pg)['book']['marks'])
    pg.screenshot(path=f'{OUT}/desktop-reader.png')
    # section quiz from panel
    pg.click('#book-panel [data-action=section-quiz]'); pg.wait_for_timeout(300)
    s=get(pg)['session']; check('section quiz has all 10 PE book questions (pilot questions retired)',s and len(s['ids'])==10 and all(i.startswith('resp-pe-') for i in s['ids']),s and s['ids'])
    pg.click('[data-choice="0"]'); pg.click('[data-action=submit-answer]')
    pg.screenshot(path=f'{OUT}/desktop-quiz-rationale.png')
    q0=s['ids'][0]
    if pg.locator('#modal [data-action=show-page]').count():
        pg.click('#modal [data-action=show-page]'); pg.wait_for_timeout(300)
        check('rationale shows the book page inline',pg.locator('#modal .inline-page img').count()==1)
        pg.click('#modal [data-action=open-page]'); pg.wait_for_timeout(300)
        check('open-in-book closes quiz and opens reader',not pg.evaluate("document.querySelector('#modal').open") and 'Page' in pg.inner_text('#book-panel .where'))
    check('session kept after jumping to book',get(pg)['session'] is not None)
    # book search
    pg.click('#book-panel [data-action=book-tab][data-tab=contents]'); pg.fill('#book-search','warfarin'); pg.wait_for_timeout(200)
    check('book search finds pages','mention' in pg.inner_text('#book-results') and pg.locator('#book-results .search-item').count()>=3)
    # practice page structure
    pg.goto(U+'#practice'); pg.wait_for_timeout(300); pg.click('[data-action=pick-view][data-view=chapters]'); pg.wait_for_timeout(200)
    check('practice page lists 11 chapters',pg.locator('main .chapter-block').count()==11)
    check('practice page lists all 88 sections',pg.locator('main .chapter-block .section-row').count()==88)
    pg.goto(U+'#book'); pg.wait_for_timeout(300)
    check('book page lists 88 sections',pg.locator('main .section-row').count()==88)
    pg.goto(U+'#lessons'); pg.wait_for_timeout(200); check('old #lessons route opens the book page',pg.locator('main .section-row').count()==88)
    # toggle closes, state persists
    pg.click('.book-toggle'); check('toggle closes panel',not pg.is_visible('#book-panel'))
    pg.reload(); pg.wait_for_timeout(400); check('closed state persists',not pg.is_visible('#book-panel'))
    # old pilot data with pharmacology plan and retired bookmarks
    old={'name':'Sam','previewPro':True,'bookmarks':['f3','p1'],'attempts':[{'qid':'p1','correct':False,'day':'2026-10-10'}],'history':[],'plan':{'title':'Pharm','course':'pharmacology','date':'2026-12-01','minutes':20,'topics':['Diuretics'],'created':'2026-10-10','completed':[]}}
    pg.evaluate("([k,v])=>localStorage.setItem(k,v)",[K,json.dumps(old)]); pg.reload(); pg.wait_for_timeout(400)
    st=get(pg); check('old plan set aside, bookmarks kept',st['plan'] is None and st['bookmarks']==['f3','p1'] and len(st['quarantine'])==1)
    pg.goto(U+'#bookmarks'); pg.wait_for_timeout(300); check('bookmarks page renders with retired question',pg.locator('main .bookmark-card').count()==2)
    pg.goto(U+'#dashboard'); pg.wait_for_timeout(300); check('dashboard shows missed section to re-read','Pulmonary embolism' in pg.inner_text('main'))
    # phone
    m=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True); m.on('pageerror',lambda e:errs.append(str(e)))
    m.goto(U); m.evaluate('localStorage.clear()'); m.reload(); m.wait_for_timeout(500)
    check('phone: panel closed by default',not m.is_visible('#book-panel'))
    m.screenshot(path=f'{OUT}/phone-dashboard.png')
    m.click('.book-toggle'); m.wait_for_timeout(300); check('phone: panel opens as overlay',m.is_visible('#book-panel') and m.is_visible('#book-backdrop'))
    m.click('#book-panel [data-action=toc-expand][data-id=cardio]'); m.screenshot(path=f'{OUT}/phone-contents.png')
    m.click('#book-panel [data-action=read-section][data-id=cardio-hf]'); m.wait_for_timeout(400); m.screenshot(path=f'{OUT}/phone-reader.png')
    check('phone: no horizontal scroll',m.evaluate('document.documentElement.scrollWidth<=window.innerWidth'))
    m.keyboard.press('Escape'); check('phone: Escape closes panel',not m.is_visible('#book-panel'))
    check('no page errors',not errs,errs)
    b.close()
for r in res: print(*r)
