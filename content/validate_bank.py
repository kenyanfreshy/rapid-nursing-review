"""Validate a chapter's question file against QUESTION_SPEC.md and content/targets.json.

    python3 content/validate_bank.py <chapterId>      one chapter
    python3 content/validate_bank.py all              every chapter + bank-wide blueprint
"""
import json, os, re, sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from structure import CHAPTERS  # noqa: E402

T = json.load(open(os.path.join(HERE, 'targets.json')))
CATS = [c['id'] for c in T['categories']]
CJMM = {'recognizeCues', 'analyzeCues', 'prioritizeHypotheses', 'generateSolutions', 'takeAction', 'evaluateOutcomes'}
nonempty = lambda v: isinstance(v, str) and v.strip() != ''


def check(cid, quiet=False):
    chap = next(c for c in CHAPTERS if c['id'] == cid)
    secs = {s[0]: s for s in chap['sections']}
    tgt = T['chapters'][cid]
    data = json.load(open(os.path.join(HERE, 'quizzes', f'{cid}.json'), encoding='utf-8'))
    errs, ids = [], set()
    live = []
    for q in data.get('questions', []):
        k = q.get('id', '?')
        if k in ids: errs.append(f'{k}: duplicate id')
        ids.add(k)
        if q.get('retired'):
            if not nonempty(q.get('retiredReason')): errs.append(f'{k}: retired without retiredReason')
            continue
        live.append(q)
        s = secs.get(q.get('section'))
        if not s: errs.append(f'{k}: unknown section'); continue
        if not re.fullmatch(re.escape(s[0]) + r'-q\d+', k): errs.append(f'{k}: id must be <section>-q<n>')
        if not (isinstance(q.get('page'), int) and s[2] <= q['page'] <= s[3]): errs.append(f'{k}: page {q.get("page")} outside section pages {s[2]}-{s[3]}')
        for f in ('stem', 'clue', 'priority'):
            if not nonempty(q.get(f)): errs.append(f'{k}: missing {f}')
        if q.get('clientNeed') not in CATS: errs.append(f'{k}: clientNeed must be one of {CATS}')
        if q.get('cjmm') not in CJMM: errs.append(f'{k}: cjmm must be one of {sorted(CJMM)}')
        t = q.get('type')
        if t == 'mcq':
            if len(q.get('options', [])) != 4 or len(q.get('rationales', [])) != 4: errs.append(f'{k}: mcq needs 4 options and 4 rationales')
            if q.get('correct') not in range(4): errs.append(f'{k}: mcq correct must be 0-3')
        elif t == 'sata':
            o = q.get('options', [])
            if len(o) not in (5, 6) or len(q.get('rationales', [])) != len(o): errs.append(f'{k}: sata needs 5-6 options and matching rationales')
            c = q.get('correct')
            if not (isinstance(c, list) and 2 <= len(c) <= 4 and len(set(c)) == len(c) and all(isinstance(i, int) and 0 <= i < len(o) for i in c)): errs.append(f'{k}: sata correct must list 2-4 distinct option indexes')
            if not q.get('stem', '').rstrip().endswith('Select all that apply.'): errs.append(f'{k}: sata stem must end with "Select all that apply."')
        elif t == 'matrix':
            r, cols, c = q.get('rows', []), q.get('columns', []), q.get('correct')
            if not (3 <= len(r) <= 5 and 2 <= len(cols) <= 3): errs.append(f'{k}: matrix needs 3-5 rows and 2-3 columns')
            if not (isinstance(c, list) and len(c) == len(r) and all(isinstance(i, int) and 0 <= i < len(cols) for i in c)): errs.append(f'{k}: matrix correct needs one column index per row')
            if len(q.get('rationales', [])) != len(r): errs.append(f'{k}: matrix needs one rationale per row')
            if 'options' in q: errs.append(f'{k}: matrix must not have options')
        else:
            errs.append(f'{k}: type must be mcq, sata or matrix')
    # Existing ids must survive (kept live or explicitly retired).
    for sid in secs:
        for n in (1, 2, 3):
            if f'{sid}-q{n}' not in ids: errs.append(f'{sid}-q{n}: original question is missing (keep it, or mark retired with retiredReason)')
    per_sec = Counter(q['section'] for q in live if q.get('section') in secs)
    for sid, want in tgt['sections'].items():
        if per_sec.get(sid, 0) != want: errs.append(f'section {sid}: {per_sec.get(sid, 0)} live questions, target {want}')
    cats = Counter(q.get('clientNeed') for q in live)
    tol = 1 if tgt['total'] < 40 else 2
    for c in CATS:
        want = tgt['categories'][c]
        if abs(cats.get(c, 0) - want) > tol: errs.append(f'clientNeed {c}: {cats.get(c, 0)}, target {want} (±{tol})')
    types = Counter(q.get('type') for q in live)
    if not isinstance(data.get('concerns'), list): errs.append('concerns list missing')
    if not quiet:
        print(f'{cid}: {len(live)} live / target {tgt["total"]} · types {dict(types)} · clientNeed {dict(cats)}')
        print('\n'.join(errs) if errs else 'VALID')
    return live, errs


if __name__ == '__main__':
    arg = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if arg != 'all':
        _, e = check(arg); sys.exit(1 if e else 0)
    allq, bad = [], 0
    for c in CHAPTERS:
        live, e = check(c['id'], quiet=True); allq += live; bad += len(e)
        print(f"{c['id']:7} {len(live):4} {'VALID' if not e else str(len(e)) + ' problems'}")
    print(f'\nBank: {len(allq)} questions, {bad} problems')
    cats = Counter(q.get('clientNeed') for q in allq)
    for c in T['categories']:
        n = cats.get(c['id'], 0)
        print(f"  {c['name']:46} {n:4}  {n / max(1, len(allq)) * 100:5.1f}%  (NCLEX midpoint {c['target_pct']}%)")
    print('  types', dict(Counter(q['type'] for q in allq)), ' cjmm', dict(Counter(q.get('cjmm') for q in allq)))
