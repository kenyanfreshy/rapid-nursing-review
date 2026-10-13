# No sideways overflow or visible scroll bar on any page, at phone, tablet and desktop sizes, light and dark themes.
from playwright.sync_api import sync_playwright
U='http://127.0.0.1:4173/'
pages=['dashboard','practice','book','plan','progress','bookmarks']
with sync_playwright() as p:
    b=p.chromium.launch(); bad=[]
    for w,h,mob in [(375,812,True),(440,956,True),(820,1180,True),(1280,800,False),(1440,900,False)]:
        for ui in ('vivid','daylight'):
            pg=b.new_page(viewport={'width':w,'height':h},is_mobile=mob,has_touch=mob)
            pg.goto(U); pg.evaluate(f"localStorage.clear();localStorage.setItem('rapid-nursing-review-v1',JSON.stringify({{attempts:[],bookmarks:[],history:[],ui:'{ui}'}}))"); pg.reload(); pg.wait_for_timeout(400)
            for r in pages:
                pg.goto(U+'#'+r); pg.wait_for_timeout(200)
                d=pg.evaluate("(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,bar:window.innerWidth-document.documentElement.clientWidth}))()")
                if d['sw']>d['cw'] or d['bar']>0: bad.append((w,ui,r,d))
            pg.close()
    print('pages checked:',5*2*len(pages),'| sideways overflow or visible bar:',bad or 'none')
    b.close()
