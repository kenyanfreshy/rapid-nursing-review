# Topic names must never run under the question count on any iPhone width. Serve dist/ on 127.0.0.1:4173 first.
from playwright.sync_api import sync_playwright
U='http://127.0.0.1:4173/'
JS="""(()=>{const out=[];for(const t of document.querySelectorAll('.topic-tile')){const n=t.querySelector('.name'),c=t.querySelector('.count');const a=n.getBoundingClientRect(),b=c.getBoundingClientRect();if(n.scrollWidth>n.clientWidth+1||a.right>b.left+1)out.push([n.textContent,Math.round(n.scrollWidth),Math.round(n.clientWidth),getComputedStyle(n).fontSize]);}return out})()"""
with sync_playwright() as p:
    b=p.chromium.launch()
    for w in (375,393,402,430,440):
        pg=b.new_page(viewport={'width':w,'height':852},is_mobile=True,has_touch=True)
        pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload(); pg.goto(U+'#practice'); pg.wait_for_timeout(500)
        print(w,pg.evaluate(JS)); 
        if w==375: pg.screenshot(path='/tmp/claude-0/-home-claude/34ffd573-81d3-5f53-b692-61b15eefed9e/scratchpad/shots/ov-tiles.png')
        pg.close()
    b.close()
