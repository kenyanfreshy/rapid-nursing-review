# Bottom bar labels are never clipped on any iPhone width, with the app font or the system font.
from playwright.sync_api import sync_playwright
import sys
S=sys.argv[1];U='http://127.0.0.1:4173/'
with sync_playwright() as p:
    b=p.chromium.launch(); bad=[]
    for w in (320,375,390,393,402,430,440):
        for font in ('app','system'):
            pg=b.new_page(viewport={'width':w,'height':800},is_mobile=True,has_touch=True)
            pg.goto(U+'#bookmarks'); pg.wait_for_timeout(500)
            if font=='system': pg.add_style_tag(content='.tab,.tab *{font-family:-apple-system,"Helvetica Neue",Arial,sans-serif!important}'); pg.wait_for_timeout(100)
            r=pg.evaluate("""[...document.querySelectorAll('.tab')].map(t=>{const l=t.querySelector('.tab-label');const tr=t.getBoundingClientRect(),lr=l.getBoundingClientRect();return {label:l.textContent,fits:lr.left>=tr.left-0.5&&lr.right<=tr.right+0.5&&l.scrollWidth<=l.clientWidth+0.5,w:Math.round(lr.width),cell:Math.round(tr.width)}})""")
            for t in r:
                if not t['fits']: bad.append((w,font,t))
            if w==375 and font=='system': pg.screenshot(path=f'{S}/tabs-375.png',clip={'x':0,'y':720,'width':375,'height':80})
            pg.close()
    print('labels clipped:', bad or 'none'); b.close()
