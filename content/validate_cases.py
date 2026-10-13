"""Validate the book-linked NGN case studies in content/cases/*.json.
    python3 content/validate_cases.py            every file
Each file holds a JSON list of cases in the same shape as content/nclex/ngn.json, plus:
  "source": "book", "chapter": <chapter id>, "section": <section id>, "pages": [printed pages that prove the answers]
and every item also carries "page": <the one printed page that proves that item's answer>.
"""
import json, os, sys, glob
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from structure import CHAPTERS
CATS = {'moc', 'safety', 'hpm', 'psych', 'bcc', 'pharm', 'rrp', 'pa'}
STEPS = ['recognizeCues', 'analyzeCues', 'prioritizeHypotheses', 'generateSolutions', 'takeAction', 'evaluateOutcomes']
LABEL = {'recognizeCues': 'Recognize Cues', 'analyzeCues': 'Analyze Cues', 'prioritizeHypotheses': 'Prioritize Hypotheses', 'generateSolutions': 'Generate Solutions', 'takeAction': 'Take Action', 'evaluateOutcomes': 'Evaluate Outcomes'}
CH = {c['id']: c for c in CHAPTERS}
old = {c['id'] for c in json.load(open(os.path.join(HERE, 'nclex', 'ngn.json')))}

def ids(opts): return [o[0] for o in opts]

def item_errs(it, chap):
    e = []; k = it.get('kind'); p = it.get('id', '?')
    for f in ('id', 'step', 'kind', 'stem', 'rationale', 'stepLabel'):
        if not isinstance(it.get(f), str) or not it[f].strip(): e.append(f'{p}: missing {f}')
    if it.get('step') not in STEPS: e.append(f'{p}: bad step')
    elif it.get('stepLabel') != LABEL[it['step']]: e.append(f'{p}: stepLabel must be {LABEL[it["step"]]}')
    pg = it.get('page')
    if not (isinstance(pg, int) and chap['pages'][0] <= pg <= chap['pages'][1]): e.append(f'{p}: page {pg} outside chapter pages {chap["pages"]}')
    if k == 'single':
        if it.get('answer') not in ids(it.get('options', [])) or len(it.get('options', [])) < 4: e.append(f'{p}: single needs >=4 options and answer among them')
    elif k == 'multi':
        a = it.get('answer'); o = ids(it.get('options', []))
        if not (isinstance(a, list) and 2 <= len(a) < len(o) and set(a) <= set(o)) or len(o) < 5: e.append(f'{p}: multi needs >=5 options and 2..n-1 answers among them')
        if not it.get('stem', '').rstrip().endswith('Select all that apply.'): e.append(f'{p}: multi stem must end with "Select all that apply."')
    elif k == 'highlight':
        o = [x[1] for x in it.get('passage', []) if len(x) > 1]; a = it.get('answer')
        if not (isinstance(a, list) and a and set(a) <= set(o) and len(a) < len(o)): e.append(f'{p}: highlight answers must be passage ids')
    elif k == 'matrix':
        cols = it.get('cols', []); rows = it.get('rows', [])
        if not (2 <= len(cols) <= 3 and 3 <= len(rows) <= 6 and all(len(r) == 3 and r[2] in cols for r in rows)): e.append(f'{p}: matrix needs 2-3 cols, 3-6 rows [id,text,answerCol]')
    elif k == 'order':
        s = ids(it.get('steps', [])); a = it.get('answer')
        if not (isinstance(a, list) and sorted(a) == sorted(s) and len(s) >= 3): e.append(f'{p}: order answer must be a permutation of >=3 step ids')
    elif k == 'cloze':
        b = it.get('blanks', [])
        if not b or not all(x.get('answer') in x.get('opts', []) and x.get('id') and isinstance(x.get('pre'), str) for x in b): e.append(f'{p}: cloze blanks need id, pre, opts, answer in opts')
    elif k == 'bowtie':
        c = it.get('condition', {}); a = it.get('actions', {}); m = it.get('params', {})
        if c.get('answer') not in ids(c.get('opts', [])): e.append(f'{p}: bowtie condition answer')
        for g in (a, m):
            if not (isinstance(g.get('answer'), list) and len(g['answer']) == 2 and set(g['answer']) <= set(ids(g.get('opts', [])))): e.append(f'{p}: bowtie actions/params need exactly 2 answers')
    else: e.append(f'{p}: unknown kind {k}')
    return e

def main():
    files = sorted(glob.glob(os.path.join(HERE, 'cases', '*.json'))); allc = []; bad = 0
    for f in files:
        for c in json.load(open(f, encoding='utf-8')):
            e = []; cid = c.get('id', '?')
            if not str(cid).startswith('ngn:book-'): e.append('id must start with ngn:book-')
            if cid in old or cid in {x['id'] for x in allc}: e.append('duplicate id')
            for f2 in ('title', 'sub', 'area', 'profile'):
                if not isinstance(c.get(f2), str) or not c[f2].strip(): e.append(f'missing {f2}')
            if c.get('clientNeed') not in CATS: e.append('bad clientNeed')
            if c.get('source') != 'book': e.append('source must be "book"')
            chap = CH.get(c.get('chapter'))
            if not chap: e.append('unknown chapter'); chap = {'pages': [0, 0], 'sections': []}
            if c.get('section') not in {s[0] for s in chap['sections']}: e.append('section not in chapter')
            ehr = c.get('ehr')
            if not (isinstance(ehr, dict) and len(ehr) >= 3 and all(isinstance(v, list) and v and all(len(r) == 2 for r in v) for v in ehr.values())): e.append('ehr needs >=3 tabs of [label, text] rows')
            items = c.get('items', [])
            if len(items) != 6: e.append('needs exactly 6 items')
            if [i.get('step') for i in items] != STEPS: e.append('items must follow the 6 CJMM steps in order')
            if len({i.get('id') for i in items}) != len(items): e.append('duplicate item ids')
            if len({i.get('kind') for i in items}) < 3: e.append('use at least 3 different item kinds')
            for it in items: e += item_errs(it, chap)
            allc.append(c); bad += len(e)
            print(f"{cid:34} {os.path.basename(f):18} {'VALID' if not e else ''}"); [print('   ', x) for x in e]
    print(f'\n{len(allc)} book cases, {bad} problems'); sys.exit(1 if bad else 0)
main()
