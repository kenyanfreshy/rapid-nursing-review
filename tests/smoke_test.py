# Browser smoke test. Serve the app first:
#   python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
# then run: pip install playwright && playwright install chromium && python3 tests/smoke_test.py
from playwright.sync_api import sync_playwright
import json
U='http://127.0.0.1:4173/';K='rapid-nursing-review-v1'
def setls(pg,obj,raw=False): pg.evaluate("([k,v])=>{localStorage.clear();localStorage.setItem(k,v)}",[K,obj if raw else json.dumps(obj)]); pg.reload(); pg.wait_for_timeout(400)
get=lambda pg: pg.evaluate(f"JSON.parse(localStorage.getItem('{K}'))")
res=[]
def check(name,ok,info=''): res.append(('PASS' if ok else 'FAIL',name,info))
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(300)
    # 1 accuracy: quick session, pick A each (3/4 correct)
    pg.click('[data-action=quick]')
    for _ in range(4):
        pg.click('[data-choice="0"]'); pg.reload(); pg.wait_for_timeout(250)
        if pg.is_visible('[data-action=resume]'): pg.click('[data-action=resume]')
        pg.click('[data-action=submit-answer]'); pg.click('[data-action=next]')
    st=get(pg); check('no duplicate attempts across reloads',len(st['attempts'])==4,len(st['attempts']))
    pg.click('[data-action=close-modal]'); pg.goto(U+'#dashboard'); pg.wait_for_timeout(300)
    acc=pg.locator('.stat').nth(1).locator('.big-number').inner_text(); exp=f"{round(sum(a['correct'] for a in st['attempts'])/len(st['attempts'])*100)}%"; check('dashboard accuracy matches saved answers',acc==exp,(acc,exp))
    check('saved with schema 2',get(pg)['schema']==2)
    # 2 plan edit keeps history
    from datetime import date,timedelta
    t=date.today(); d=lambda n:(t+timedelta(n)).isoformat()
    plan={'title':'Pharm 1','course':'cardio','date':d(5),'minutes':20,'topics':['Heart failure'],'created':d(-2),'completed':[d(-2),d(-1)]}
    setls(pg,{'attempts':[],'bookmarks':[],'history':[],'plan':plan}); pg.goto(U+'#plan'); pg.wait_for_timeout(300)
    pg.click('[data-action=edit-plan]'); pg.select_option('select[name=minutes]','30'); pg.click('#plan-form button[type=submit]'); pg.wait_for_timeout(300)
    p2=get(pg)['plan']; check('plan edit keeps checked days',p2['completed']==[d(-2),d(-1)] and p2['created']==d(-2) and p2['minutes']==30,p2['completed'])
    pg.click('[data-action=edit-plan]'); pg.fill('input[name=date]',d(1)); pg.click('#plan-form button[type=submit]'); pg.wait_for_timeout(300)
    check('shorter plan still keeps past checks',get(pg)['plan']['completed']==[d(-2),d(-1)])
    pg.click('[data-action=edit-plan]'); pg.fill('input[name=title]',''); pg.fill('input[name=title]','  '); pg.evaluate("document.querySelector('#plan-form').requestSubmit()"); pg.wait_for_timeout(200)
    check('blank title does not overwrite plan',get(pg)['plan']['title']=='Pharm 1')
    pg.keyboard.press('Escape')
    # 3 malformed plan / unknown question / bad session
    setls(pg,{'attempts':[{'qid':'zz9','correct':False,'day':d(0)},{'qid':'p1','correct':False,'day':d(0)}],'bookmarks':['p1','nope'],'history':[],'plan':{'title':'x'},'session':{'ids':['f1'],'mode':'exam'}})
    pg.goto(U+'#dashboard'); pg.wait_for_timeout(300)
    st=get(pg)
    check('malformed data: dashboard renders',pg.locator('#main h1').count()==1)
    check('bad records quarantined, good kept',len(st['quarantine'])==4 and len(st['attempts'])==1 and st['bookmarks']==['p1'] and st['plan'] is None and st['session'] is None,[q['kind'] for q in st['quarantine']])
    check('notice shown',pg.locator('.storage-warning').count()==1)
    for r in ['#practice','#plan','#progress','#bookmarks','#lessons']:
        pg.goto(U+r); pg.wait_for_timeout(150)
    # 4 corrupt JSON backed up
    setls(pg,'{not json',raw=True)
    keys=pg.evaluate("Object.keys(localStorage)")
    check('corrupt JSON backed up, app renders',any('unreadable' in k for k in keys) and pg.locator('#main h1').count()==1,keys)
    # 5 legacy v1 data (no schema) migrates intact
    legacy={'name':'Sam','bookmarks':['m1'],'attempts':[{'id':'s:m1','session':'s','qid':'m1','selected':0,'correct':True,'day':d(0),'at':t.isoformat()+'T10:00:00Z'}],'history':[],'reports':[],'readLessons':['hands'],'plan':None,'session':None}
    setls(pg,legacy); st=get(pg)
    check('v1 data migrates with nothing lost',st['schema']==2 and st['name']=='Sam' and len(st['attempts'])==1 and st['readLessons']==['hands'] and st['quarantine']==[] and pg.locator('.storage-warning').count()==0)
    # 6 timed exam still works
    pg.evaluate("localStorage.clear()"); pg.goto(U+'#dashboard'); pg.reload(); pg.wait_for_timeout(300)
    pg.click('[data-action=quick]'); pg.click('[data-choice="1"]'); pg.click('[data-action=submit-answer]')
    check('tutor still reveals rationale',pg.locator('.rationale').count()==1)
    check('no page errors',not errs,errs)
    b.close()
for r in res: print(*r)
