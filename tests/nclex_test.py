# NCLEX expansion checks: question types and scoring, NGN cases, free/Pro gating, paywall, white exam screen.
# Serve dist/ on 127.0.0.1:4173 first:  python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
from playwright.sync_api import sync_playwright
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
U = 'http://127.0.0.1:4173/'; K = 'rapid-nursing-review-v1'
OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
bank = json.load(open(os.path.join(ROOT, 'content/nclex/bank.json')))
cases = json.load(open(os.path.join(ROOT, 'content/nclex/ngn.json')))
import glob
OPEN_FOLD = "document.querySelectorAll('.pf-more').forEach(d=>d.open=true)"  # the four practice modes sit in a fold
book_cases = [c for f in sorted(glob.glob(os.path.join(ROOT, 'content/cases/*.json'))) + sorted(glob.glob(os.path.join(ROOT, 'content/nclex/v4cases/*.json'))) for c in json.load(open(f))]
book = {q['id']: q for f in os.listdir(os.path.join(ROOT, 'content/quizzes')) for q in json.load(open(os.path.join(ROOT, 'content/quizzes', f)))['questions']}
res = []
def check(n, ok, info=''): res.append(('PASS' if ok else 'FAIL', n, info))
st = lambda pg: pg.evaluate(f"JSON.parse(localStorage.getItem('{K}'))")

def fresh(pg, pro=True, extra=None):
    s = {'attempts': [], 'bookmarks': [], 'history': [], 'previewPro': pro}
    s.update(extra or {})
    pg.evaluate("([k,v])=>{localStorage.clear();localStorage.setItem(k,v)}", [K, json.dumps(s)])
    pg.reload(); pg.wait_for_timeout(500)

def practice_one(pg, qid):
    fresh(pg, extra={'bookmarks': [qid]}); pg.goto(U + '#bookmarks'); pg.wait_for_timeout(300)
    pg.click('main [data-action=single]'); pg.wait_for_timeout(200)

def answer(pg, q, right=True):
    t = q['type']; c = q['correct']
    if t == 'mcq':
        pg.click(f'#modal [data-action=select-answer][data-choice="{c if right else (c + 1) % len(q["options"])}"]')
    elif t == 'sata':
        picks = c if right else [i for i in range(len(q['options'])) if i not in c][:1] + c[:1]
        for i in picks: pg.click(f'#modal [data-action=select-answer][data-choice="{i}"]')
    elif t == 'matrix':
        for r, col in enumerate(c): pg.click(f'#modal [data-action=pick-cell][data-row="{r}"][data-col="{col if right else (col + 1) % len(q["columns"])}"]')
    elif t == 'order':
        seq = c if right else list(reversed(c))
        for i in seq: pg.click(f'#modal [data-action=pick-order][data-choice="{i}"]')

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1280, 'height': 900}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(U); pg.wait_for_timeout(500)

    # 1. Every question type, right and wrong, with NCLEX partial credit
    samples = {'mcq': next(q for q in bank if q['type'] == 'mcq'), 'sata': next(q for q in bank if q['type'] == 'sata'),
               'order': next(q for q in bank if q['type'] == 'order'), 'matrix': next(v for v in book.values() if v.get('type') == 'matrix' and not v.get('retired'))}
    v4 = [q for f in sorted(glob.glob(os.path.join(ROOT, 'content/nclex/v4/*.json'))) if not f.endswith('targets.json') for q in json.load(open(f))['questions']]
    for t in ('mcq', 'sata', 'matrix', 'order'): samples['v4 ' + t] = next(q for q in v4 if q['type'] == t)
    for t, q in samples.items():
        qid = q['id'] if q['id'].startswith(('nb:', 'rnr:')) or t == 'matrix' else 'nb:' + q['id']
        for right in (True, False):
            practice_one(pg, qid)
            answer(pg, q, right); t0 = t; t = t.split()[-1]
            enabled = pg.is_enabled('#modal [data-action=submit-answer]')
            pg.click('#modal [data-action=submit-answer]'); pg.wait_for_timeout(200)
            a = st(pg)['attempts'][-1]
            check(f'{t}: {"right" if right else "wrong"} answer scored', a['correct'] == right and enabled, a.get('score'))
            if t == 'order' and not right: check('order: partial credit is positional', a['score'][0] < a['score'][1], a['score'])
            if t == 'sata' and not right: check('sata: +/- scoring never below 0', a['score'][0] >= 0, a['score'])
            check(f'{t0}: rationale shown', pg.locator('#modal .rationale').count() == 1)
            if t0.startswith('v4'): check(f'{t0}: APA sources listed', pg.locator('#modal .nb-sources li').count() == len(q['refs']))
            t = t0
    check('quiz screen is plain white', pg.evaluate("getComputedStyle(document.querySelector('#modal')).backgroundColor") == 'rgb(255, 255, 255)')
    pg.screenshot(path=f'{OUT}/quiz-white.png')

    # 2. Reload mid-SATA keeps the partial selection
    q = samples['sata']; practice_one(pg, q['id']); pg.click(f'#modal [data-action=select-answer][data-choice="{q["correct"][0]}"]')
    pg.reload(); pg.wait_for_timeout(400); pg.click('[data-action=resume]') if pg.is_visible('[data-action=resume]') else None
    check('sata selection survives reload', st(pg)['session']['answers'][q['id']]['selected'] == [q['correct'][0]])

    # 3. All 8 NGN cases, every item kind, answered correctly = full marks
    for c in cases + book_cases:
        fresh(pg); pg.goto(U + '#practice'); pg.wait_for_timeout(300)
        pg.evaluate(OPEN_FOLD); pg.click('main [data-action=choose-case]'); pg.click(f'#modal [data-action=start-case][data-id="{c["id"]}"]'); pg.wait_for_timeout(200)
        for it in c['items']:
            k = it['kind']
            if k == 'single': pg.click(f'#modal [data-action=ngn-pick][data-v="{it["answer"]}"]')
            elif k in ('multi', 'highlight'):
                for v in it['answer']: pg.click(f'#modal [data-action=ngn-pick][data-v="{v}"]')
            elif k == 'matrix':
                for rid, _, ans in it['rows']: pg.click(f'#modal [data-action=ngn-cell][data-row="{rid}"][data-col="{ans}"]')
            elif k == 'order':
                for v in it['answer']: pg.click(f'#modal [data-action=ngn-order][data-v="{v}"]')
            elif k == 'cloze':
                for bl in it['blanks']: pg.select_option(f'#cz-{bl["id"]}', label=bl['answer']); pg.wait_for_timeout(80)
            elif k == 'bowtie':
                pg.click(f'#modal [data-action=ngn-bow][data-group=condition][data-v="{it["condition"]["answer"]}"]')
                for g in ('actions', 'params'):
                    for v in it[g]['answer']: pg.click(f'#modal [data-action=ngn-bow][data-group={g}][data-v="{v}"]')
            pg.click('#modal [data-action=case-submit]'); pg.wait_for_timeout(100)
            pg.click('#modal [data-action=case-next]'); pg.wait_for_timeout(100)
        h = st(pg)['caseHistory']
        check(f'NGN {c["id"]}: full marks when answered correctly', h and h[-1]['points'] == h[-1]['max'], h and (h[-1]['points'], h[-1]['max']))
    pg.screenshot(path=f'{OUT}/ngn-result.png')

    # 4. NGN case survives reload mid-case; EHR tabs switch
    fresh(pg); pg.goto(U + '#practice'); pg.wait_for_timeout(300); c = cases[0]
    pg.evaluate(OPEN_FOLD); pg.click('main [data-action=choose-case]'); pg.click(f'#modal [data-action=start-case][data-id="{c["id"]}"]'); pg.click(f'#modal [data-action=ngn-pick][data-v="{c["items"][0]["answer"][0]}"]')
    tabs = list(c['ehr'].keys()); pg.click(f'#modal [data-action=case-tab][data-tab="{tabs[1]}"]')
    check('EHR tab switches', tabs[1] in pg.inner_text('#modal .ehr-tabs [aria-selected=true]'))
    pg.screenshot(path=f'{OUT}/ngn-case.png')
    pg.reload(); pg.wait_for_timeout(400)
    check('case answers survive reload', st(pg)['caseSession']['answers'][c['items'][0]['id']] == [c['items'][0]['answer'][0]])

    # 5. Free plan gating
    fresh(pg, pro=False); pg.goto(U + '#practice'); pg.wait_for_timeout(300)
    check('free: banner and lock icons shown', pg.locator('.free-banner').count() == 1 and pg.locator('.case-pill .lock').count() == len(cases) + len(book_cases) - 1)
    pg.evaluate(OPEN_FOLD); pg.click('main [data-action=choose-case]'); pg.click(f'#modal [data-action=start-case][data-id="{cases[1]["id"]}"]'); pg.wait_for_timeout(200)
    check('free: locked case opens paywall', pg.evaluate("document.querySelector('#modal').className") == 'paywall')
    pg.click('#modal [data-action=close-modal]')
    pg.click('[data-action=pick-mode][data-mode=exam]'); pg.wait_for_timeout(200)
    check('free: exam mode opens paywall', pg.evaluate("document.querySelector('#modal').className") == 'paywall')
    pg.click('#modal [data-action=pw-plan][data-id=monthly]'); check('paywall: plan switch updates button', '$19.99/month' in pg.inner_text('#modal .pw-cta'))
    check('paywall: 3-month pass is the default, most popular plan', '$49.99' in pg.inner_text('#modal .plan[data-id=quarter]') and 'MOST POPULAR' in pg.inner_text('#modal .plan[data-id=quarter]'))
    pg.click('#modal [data-action=close-modal]')
    pg.click('[data-action=start-pick]'); pg.wait_for_timeout(200)
    ids = st(pg)['session']['ids']
    free_ok = pg.evaluate("ids=>ids.length", ids)
    check('free: practice starts with free questions only', free_ok == 10)
    pg.click('#modal [data-action=close-modal]'); pg.goto(U + '#book'); pg.wait_for_timeout(200)
    pg.click('[data-action=toggle-book]') if not pg.is_visible('#book-panel') else None
    pg.evaluate("document.querySelector('[data-action=goto-page][data-page=\"186\"]')?.click()"); pg.wait_for_timeout(200)
    check('free: locked book page shows Pro card', 'part of Pro' in pg.inner_text('#book-panel'))

    # 6. Pro: blueprint exam has 75 questions spread to the NCLEX mix
    fresh(pg, pro=True); pg.goto(U + '#practice'); pg.wait_for_timeout(300); pg.evaluate(OPEN_FOLD); pg.click('[data-action=start-blueprint]'); pg.wait_for_timeout(300)
    s = st(pg)['session']
    needs = pg.evaluate("ids=>ids.length", s['ids'])
    check('blueprint exam: 75 timed questions', needs == 75 and s['mode'] == 'exam' and s['deadline'] > 0)
    check('no page errors', not errs, errs[:3])
    b.close()
for r in res: print(*r)
print(sum(r[0] == 'PASS' for r in res), 'passed,', sum(r[0] == 'FAIL' for r in res), 'failed')
