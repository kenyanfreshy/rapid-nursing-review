"""Staged import of the corrected question-bank workbook (October 2026 review).

    python3 content/import_corrected.py      # applies content/review/import-plan.json, then rebuild:
    python3 content/build_nclex_js.py && python3 content/build_book_js.py

What it applies (NurseBound bank, Rapid Nursing Review v4 bank and NGN cases only):
  * reviewed text edits: stem, options/rows, rationales, takeaway, clinical-judgment step;
  * answer-key and question-type changes that were checked clinically one by one;
  * verified APA 7 references (each link opened or confirmed through Crossref, NCBI or the DailyMed API),
    written to content/nclex/refs.json under "v-" keys and attached to each item.
What it leaves alone:
  * every book-linked question (held for the author's approval list);
  * NGN case option and answer changes (held for review; case stems, rationales and profiles are applied);
  * the items listed under "held" in the plan, with the reason.
Every change is logged to content/review/import-log.json.
"""
import json, os, re, sys
from apply_review import files, items_of, to_client

HERE = os.path.dirname(os.path.abspath(__file__))
PLAN = os.path.join(HERE, 'review', sys.argv[1] if len(sys.argv) > 1 else 'import-plan.json')
LOG = os.path.join(HERE, 'review', (sys.argv[1] if len(sys.argv) > 1 else 'import-plan.json').replace('plan', 'log'))
KIND_KEYS = ('options', 'answer', 'cols', 'rows', 'steps', 'passage', 'blanks', 'condition', 'actions', 'params')
REFS = os.path.join(HERE, 'nclex', 'refs.json')


def set_takeaway(q, text):
    m = re.match(r'^Clue:\s*(.*?)(?:\s*·\s*Priority:\s*(.*))?$', text)
    if m and not q.get('takeaway'):
        q['clue'] = m.group(1).strip()
        if m.group(2): q['priority'] = m.group(2).strip()
    else:
        q['takeaway'] = text


def main():
    plan = json.load(open(PLAN, encoding='utf-8'))
    refs = json.load(open(REFS, encoding='utf-8'))
    refs = {k: v for k, v in refs.items() if not k.startswith('v-')}
    refs.update(plan['refs'])
    want = {x['id']: x for x in plan['items']}
    log, seen, used = [], set(), set()
    for path, load, save in files():
        data = load(); changed = False
        for q in items_of(data):
            used.update(k for k in q.get('refs') or [] if isinstance(k, str))
            x = want.get(q.get('id'))
            if not x: continue
            seen.add(q['id']); st = x['set']; did = []
            if x['kind'] == 'question':
                for k, v in st.items():
                    if k == 'takeaway': set_takeaway(q, v)
                    else: q[k] = v
                    did.append(k)
                if q.get('type') in ('mcq', 'sata', 'order'):
                    q.pop('rows', None); q.pop('columns', None)
                if q.get('type') == 'mcq' and isinstance(q.get('correct'), list): q['correct'] = q['correct'][0]
            else:
                for i, new in (st.get('replace') or {}).items():
                    it = q['items'][int(i)]
                    for k in KIND_KEYS: it.pop(k, None)
                    it.update(new); did.append(f'items.{i}.answer')
                for i, ch in st['items'].items():
                    it = q['items'][int(i)]
                    for k, v in ch.items(): it[k] = v; did.append(f'items.{i}.{k}')
                if st.get('profile'): q['profile'] = st['profile']; did.append('profile')
                if st.get('refs'): q['refs'] = st['refs']; did.append('refs')
            used.update(st.get('refs') or [])
            # keep NCLEX wording on anything we wrote
            for k in ('stem', 'takeaway', 'clue', 'priority', 'profile'):
                if isinstance(q.get(k), str): q[k] = to_client(q[k])[0]
            for k in ('options', 'rationales', 'rows'):
                if isinstance(q.get(k), list): q[k] = [to_client(s)[0] if isinstance(s, str) else s for s in q[k]]
            if did:
                changed = True
                log.append({'id': q['id'], 'file': os.path.relpath(path, HERE), 'fields': did, 'note': x.get('note', ''), 'flag': x.get('flag', '')})
        if changed: save(data)
    missing = sorted(set(want) - seen)
    if missing: raise SystemExit(f'{len(missing)} plan items not found, e.g. {missing[:5]}')
    refs = {k: v for k, v in refs.items() if not k.startswith('v-') or k in used}
    json.dump(refs, open(REFS, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump({'applied': log, 'held': plan['held']}, open(LOG, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f"applied {len(log)} items, {sum(k.startswith('v-') for k in refs)} verified references kept, held {len(plan['held'])}")


if __name__ == '__main__':
    main()
