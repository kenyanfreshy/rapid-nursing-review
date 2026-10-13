"""Validate the v4 NCLEX bank expansion (questions in content/nclex/v4/<topic>.json, cases in content/nclex/v4cases/*.json).

    python3 content/validate_v4.py <topic>      one question file (e.g. maternal)
    python3 content/validate_v4.py all          every question file and every case file
    python3 content/validate_v4.py cases        case files only
"""
import json, os, re, sys, glob, collections

HERE = os.path.dirname(os.path.abspath(__file__))
V4 = os.path.join(HERE, 'nclex', 'v4')
TARGETS = json.load(open(os.path.join(V4, 'targets.json')))
REFS = json.load(open(os.path.join(HERE, 'nclex', 'refs.json')))
CATS = {'moc', 'safety', 'hpm', 'psych', 'bcc', 'pharm', 'rrp', 'pa'}
STEPS = ['recognizeCues', 'analyzeCues', 'prioritizeHypotheses', 'generateSolutions', 'takeAction', 'evaluateOutcomes']
LABEL = {'recognizeCues': 'Recognize Cues', 'analyzeCues': 'Analyze Cues', 'prioritizeHypotheses': 'Prioritize Hypotheses',
         'generateSolutions': 'Generate Solutions', 'takeAction': 'Take Action', 'evaluateOutcomes': 'Evaluate Outcomes'}
norm = lambda s: re.sub(r'[^a-z0-9]+', ' ', str(s).lower()).strip()


def existing_stems():
    """Stems already in the app (NurseBound bank + book questions + other v4 files) for duplicate checks."""
    out = {}
    for q in json.load(open(os.path.join(HERE, 'nclex', 'bank.json'))):
        out[norm(q['stem'])] = q['id']
    for f in glob.glob(os.path.join(HERE, 'quizzes', '*.json')):
        for q in json.load(open(f))['questions']:
            out[norm(q['stem'])] = q['id']
    return out


def check_questions(topic, others):
    path = os.path.join(V4, f'{topic}.json'); t = TARGETS[topic]; errs = []
    if not os.path.exists(path):
        return [f'{path} missing'], 0
    data = json.load(open(path))
    qs = data.get('questions', [])
    seen = set()
    for q in qs:
        p = q.get('id', '?')
        if not re.fullmatch(rf'rnr:{topic}-\d{{3}}', str(p)): errs.append(f'{p}: id must be rnr:{topic}-NNN')
        if p in seen: errs.append(f'{p}: duplicate id')
        seen.add(p)
        for f, v in (('source', 'rnrBank'), ('origin', 'v4'), ('batch', 'v4'), ('topic', t['topic'])):
            if q.get(f) != v: errs.append(f'{p}: {f} must be "{v}"')
        if q.get('clientNeed') not in CATS: errs.append(f'{p}: bad clientNeed')
        if q.get('cjmm') not in STEPS: errs.append(f'{p}: bad cjmm')
        if q.get('difficulty') not in (1, 2, 3): errs.append(f'{p}: difficulty 1-3')
        if q.get('level') not in ('Apply', 'Analyze'): errs.append(f'{p}: level Apply or Analyze')
        for f in ('stem', 'takeaway'):
            if not isinstance(q.get(f), str) or len(q[f].strip()) < 15: errs.append(f'{p}: missing {f}')
        refs = q.get('refs')
        if not (isinstance(refs, list) and 1 <= len(refs) <= 3 and all(r in REFS for r in refs)): errs.append(f'{p}: refs must be 1-3 keys from content/nclex/refs.json')
        ty = q.get('type'); r = q.get('rationales', []); c = q.get('correct')
        if ty == 'mcq':
            o = q.get('options', [])
            if len(o) != 4 or not isinstance(c, int) or not 0 <= c < 4 or len(r) != 4: errs.append(f'{p}: mcq needs 4 options, correct 0-3, 4 rationales')
        elif ty == 'sata':
            o = q.get('options', [])
            if not (5 <= len(o) <= 6 and isinstance(c, list) and 2 <= len(c) <= 4 and len(set(c)) == len(c) and all(isinstance(i, int) and 0 <= i < len(o) for i in c) and len(r) == len(o)):
                errs.append(f'{p}: sata needs 5-6 options, 2-4 keys, one rationale per option')
            if not str(q.get('stem', '')).rstrip().endswith('Select all that apply.'): errs.append(f'{p}: sata stem must end with "Select all that apply."')
        elif ty == 'matrix':
            rows, cols = q.get('rows', []), q.get('columns', [])
            if 'options' in q: errs.append(f'{p}: matrix has no options field')
            if not (3 <= len(rows) <= 5 and 2 <= len(cols) <= 3 and isinstance(c, list) and len(c) == len(rows) and all(isinstance(i, int) and 0 <= i < len(cols) for i in c) and len(r) == len(rows)):
                errs.append(f'{p}: matrix needs 3-5 rows, 2-3 columns, one correct column per row, one rationale per row')
            if isinstance(c, list) and len(set(c)) < 2: errs.append(f'{p}: matrix answers should not all be the same column')
        elif ty == 'order':
            o = q.get('options', [])
            if not (4 <= len(o) <= 6 and isinstance(c, list) and sorted(c) == list(range(len(o))) and len(r) == len(o)):
                errs.append(f'{p}: order needs 4-6 options, correct = permutation of option indexes (first step first), one rationale per option')
            if isinstance(c, list) and c == list(range(len(c))): errs.append(f'{p}: order key is already in display order; shuffle the options')
        else:
            errs.append(f'{p}: type must be mcq, sata, matrix or order')
        if 'options' in q and len({norm(x) for x in q['options']}) != len(q['options']): errs.append(f'{p}: duplicate options')
        n = norm(q.get('stem', ''))
        if n in others and others[n] != p: errs.append(f'{p}: same stem as {others[n]}')
        others[n] = p
    # counts
    ty = collections.Counter(q.get('type') for q in qs); cn = collections.Counter(q.get('clientNeed') for q in qs)
    if len(qs) != t['count']: errs.append(f'count {len(qs)} / target {t["count"]}')
    for k, v in t['types'].items():
        if abs(ty[k] - v) > max(1, round(v * 0.15)): errs.append(f'type {k}: {ty[k]} (target {v})')
    for k, v in t['clientNeeds'].items():
        if abs(cn[k] - v) > 1: errs.append(f'clientNeed {k}: {cn[k]} (target {v})')
    for k in cn:
        if k not in t['clientNeeds']: errs.append(f'clientNeed {k}: {cn[k]} not in this topic\'s targets')
    mc = collections.Counter(q['correct'] for q in qs if q.get('type') == 'mcq' and isinstance(q.get('correct'), int))
    if mc and max(mc.values()) - min(mc.get(i, 0) for i in range(4)) > max(3, round(sum(mc.values()) * 0.12)):
        errs.append(f'mcq correct positions uneven: {dict(sorted(mc.items()))}')
    steps = collections.Counter(q.get('cjmm') for q in qs)
    if qs and len(steps) < 5: errs.append(f'cjmm steps too narrow: {dict(steps)}')
    return errs, len(qs)


def ids(opts): return [o[0] for o in opts]


def check_cases():
    errs = []; allc = []
    old = {c['id'] for c in json.load(open(os.path.join(HERE, 'nclex', 'ngn.json')))}
    for f in glob.glob(os.path.join(HERE, 'cases', '*.json')): old |= {c['id'] for c in json.load(open(f))}
    kinds = collections.Counter()
    for f in sorted(glob.glob(os.path.join(HERE, 'nclex', 'v4cases', '*.json'))):
        for c in json.load(open(f)):
            cid = c.get('id', '?'); e = []
            if not str(cid).startswith('ngn:rnr-'): e.append('id must start with ngn:rnr-')
            if cid in old or cid in {x.get('id') for x in allc}: e.append('duplicate id')
            for k in ('title', 'sub', 'area', 'profile', 'topic'):
                if not isinstance(c.get(k), str) or not c[k].strip(): e.append(f'missing {k}')
            if c.get('source') != 'rnr': e.append('source must be "rnr"')
            if c.get('clientNeed') not in CATS: e.append('bad clientNeed')
            refs = c.get('refs')
            if not (isinstance(refs, list) and 1 <= len(refs) <= 3 and all(r in REFS for r in refs)): e.append('refs must be 1-3 keys from refs.json')
            ehr = c.get('ehr')
            if not (isinstance(ehr, dict) and len(ehr) >= 3 and all(isinstance(v, list) and v and all(len(r) == 2 for r in v) for v in ehr.values())): e.append('ehr needs >=3 tabs of [label, text] rows')
            items = c.get('items', [])
            if len(items) != 6 or [i.get('step') for i in items] != STEPS: e.append('exactly 6 items in CJMM step order')
            if len({i.get('kind') for i in items}) < 3: e.append('use at least 3 item kinds')
            for it in items:
                p = it.get('id', '?'); k = it.get('kind'); kinds[k] += 1
                for fld in ('id', 'step', 'kind', 'stem', 'rationale', 'stepLabel'):
                    if not isinstance(it.get(fld), str) or not it[fld].strip(): e.append(f'{p}: missing {fld}')
                if it.get('step') in LABEL and it.get('stepLabel') != LABEL[it['step']]: e.append(f'{p}: stepLabel must be {LABEL[it["step"]]}')
                if k == 'single':
                    if it.get('answer') not in ids(it.get('options', [])) or len(it.get('options', [])) < 4: e.append(f'{p}: single needs >=4 options')
                elif k == 'multi':
                    a = it.get('answer'); o = ids(it.get('options', []))
                    if not (isinstance(a, list) and 2 <= len(a) < len(o) and set(a) <= set(o)) or len(o) < 5: e.append(f'{p}: multi needs >=5 options, 2..n-1 answers')
                    if not it.get('stem', '').rstrip().endswith('Select all that apply.'): e.append(f'{p}: multi stem must end with "Select all that apply."')
                elif k == 'highlight':
                    o = [x[1] for x in it.get('passage', []) if len(x) > 1]; a = it.get('answer')
                    if not (isinstance(a, list) and a and set(a) <= set(o) and len(a) < len(o)): e.append(f'{p}: highlight answers must be passage ids')
                elif k == 'matrix':
                    cols = it.get('cols', []); rows = it.get('rows', [])
                    if not (2 <= len(cols) <= 3 and 3 <= len(rows) <= 6 and all(len(r) == 3 and r[2] in cols for r in rows)): e.append(f'{p}: matrix 2-3 cols, 3-6 rows [id,text,answerCol]')
                elif k == 'order':
                    s = ids(it.get('steps', [])); a = it.get('answer')
                    if not (isinstance(a, list) and sorted(a) == sorted(s) and len(s) >= 3): e.append(f'{p}: order answer must permute step ids')
                elif k == 'cloze':
                    b = it.get('blanks', [])
                    if not b or not all(x.get('answer') in x.get('opts', []) and x.get('id') and isinstance(x.get('pre'), str) for x in b): e.append(f'{p}: cloze blanks need id, pre, opts, answer in opts')
                elif k == 'bowtie':
                    cc = it.get('condition', {})
                    if cc.get('answer') not in ids(cc.get('opts', [])): e.append(f'{p}: bowtie condition answer')
                    for g in (it.get('actions', {}), it.get('params', {})):
                        if not (isinstance(g.get('answer'), list) and len(g['answer']) == 2 and set(g['answer']) <= set(ids(g.get('opts', [])))): e.append(f'{p}: bowtie actions/params need 2 answers')
                else: e.append(f'{p}: unknown kind {k}')
            allc.append(c)
            print(f'{cid:36} {os.path.basename(f):12} {"VALID" if not e else ""}'); [print('   ', x) for x in e]
            errs += e
    print(f'{len(allc)} v4 cases · kinds used: {dict(kinds)}')
    return errs


if __name__ == '__main__':
    arg = sys.argv[1] if len(sys.argv) > 1 else 'all'
    bad = 0
    if arg != 'cases':
        others = existing_stems(); total = 0
        for topic in (TARGETS if arg == 'all' else [arg]):
            e, n = check_questions(topic, others); total += n; bad += len(e)
            print(f'{topic:13} {n:3}/{TARGETS[topic]["count"]:3} {"VALID" if not e else ""}'); [print('   ', x) for x in e[:40]]
        print(f'{total} v4 questions')
    if arg in ('all', 'cases'):
        bad += len(check_cases())
    print('ALL VALID' if not bad else f'{bad} problems'); sys.exit(1 if bad else 0)
