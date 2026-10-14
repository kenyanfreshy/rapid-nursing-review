"""Apply reviewed fixes to the question sources, and keep NCLEX wording ("client", not "patient").

    python3 content/apply_review.py            # applies content/review/fixes.json + the wording pass, then rebuild:
    python3 content/build_nclex_js.py && python3 content/build_book_js.py

content/review/fixes.json: [{"id": ..., "set": {"stem": ..., "options.2": ..., "rationales.2": ..., "takeaway": ..., "refs": [...]},
                             "source": "Gemini batch 28", "verdict": "accepted", "note": ...}]
Every applied change is logged to content/review/applied.json. Edits are made to the source JSON files themselves.
"""
import glob, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
REVIEW = os.path.join(HERE, 'review')
TEXT_FIELDS = ('stem', 'options', 'rows', 'rationales', 'takeaway', 'clue', 'priority', 'rationale', 'profile', 'sub', 'title', 'steps', 'passage', 'blanks', 'ehr', 'condition', 'actions', 'params', 'cols', 'items', 'opts', 'pre', 'answer')
KEEP = re.compile(r'patient[- ]controlled|Patient Safety|patient portal|patient care technician', re.I)


def to_client(s):
    """patient -> client (keeping case and plurals), except fixed terms such as patient-controlled analgesia."""
    if not isinstance(s, str) or 'atient' not in s: return s, 0
    n = 0
    def rep(m):
        nonlocal n
        start = m.start()
        if KEEP.match(s, start): return m.group(0)
        w = m.group(0); n += 1
        out = 'client' + w[len('patient'):]
        return out[0].upper() + out[1:] if w[0].isupper() else out
    return re.sub(r'\b[Pp]atient(s|\'s|s\'|’s)?\b', rep, s), n


def walk(x, key=None):
    """Apply to_client to every string under text fields; returns (new value, count)."""
    if isinstance(x, str): return to_client(x)
    if isinstance(x, list):
        out, n = [], 0
        for v in x:
            v2, k = walk(v); out.append(v2); n += k
        return out, n
    if isinstance(x, dict):
        out, n = {}, 0
        for k, v in x.items():
            if k in TEXT_FIELDS or isinstance(v, (dict, list)) and k not in ('refs', 'correct', 'completed'):
                v2, c = walk(v, k); out[k] = v2; n += c
            else: out[k] = v
        return out, n
    return x, 0


def files():
    """(path, loader, saver) for every question/case source file."""
    def plain(p):
        return p, (lambda: json.load(open(p, encoding='utf-8'))), (lambda d: json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1))
    out = [plain(os.path.join(HERE, 'nclex', 'bank.json')), plain(os.path.join(HERE, 'nclex', 'ngn.json'))]
    out += [plain(p) for p in sorted(glob.glob(os.path.join(HERE, 'nclex', 'v4', '*.json'))) if not p.endswith('targets.json')]
    out += [plain(p) for p in sorted(glob.glob(os.path.join(HERE, 'nclex', 'v4cases', '*.json')))]
    out += [plain(p) for p in sorted(glob.glob(os.path.join(HERE, 'cases', '*.json')))]
    out += [plain(p) for p in sorted(glob.glob(os.path.join(HERE, 'quizzes', '*.json')))]
    return out


def items_of(d):
    """The list of questions/cases inside a loaded source file."""
    if isinstance(d, list): return d
    return d.get('questions') or d.get('cases') or []


def set_field(q, path, value):
    parts = path.split('.')
    tgt = q
    for p in parts[:-1]: tgt = tgt[int(p)] if p.isdigit() else tgt[p]
    last = parts[-1]
    if last.isdigit(): tgt[int(last)] = value
    else: tgt[last] = value


def main():
    fixes = json.load(open(os.path.join(REVIEW, 'fixes.json'), encoding='utf-8')) if os.path.exists(os.path.join(REVIEW, 'fixes.json')) else []
    want = {f['id']: f for f in fixes if f.get('verdict') == 'accepted'}
    applied, wording, seen = [], 0, set()
    for path, load, save in files():
        d = load(); changed = False
        for q in items_of(d):
            f = want.get(q.get('id'))
            if f:
                for k, v in f['set'].items(): set_field(q, k, v)
                applied.append({'id': q['id'], 'file': os.path.relpath(path, HERE), 'set': f['set'], 'source': f.get('source'), 'note': f.get('note')})
                seen.add(q['id']); changed = True
            new, n = walk(q)
            if n:
                q.clear(); q.update(new); wording += n; changed = True
        if changed: save(d)
    missing = sorted(set(want) - seen)
    json.dump({'fixes': applied, 'patientToClient': wording, 'missingIds': missing},
              open(os.path.join(REVIEW, 'applied.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{len(applied)} fixes applied; {wording} "patient" -> "client" changes; missing ids: {missing}')


if __name__ == '__main__':
    main()
