"""Give every NurseBound bank question and every NGN case without references its own sources.

For each item this picks, from content/nclex/refs.json only (never an invented citation):
  1. the specific guideline its text is about (sepsis -> Surviving Sepsis 2021, isolation -> CDC, delegation -> NCSBN/ANA, ...)
  2. the matching open textbook for its NCLEX topic (OpenStax medical-surgical, pharmacology, fundamentals, psych, maternal-newborn)
and, when the stem names a condition the book covers, the matching book section (pages) as related reading.

Output: content/nclex/bank_refs.json  {id: {"refs": [...], "bookSection": "<section id>"}}
        content/verification/refs-auto.json  (what was assigned, for the author's review)
Run:    python3 content/assign_refs.py && python3 content/build_nclex_js.py
"""
import glob, json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
REFS = json.load(open(os.path.join(HERE, 'nclex', 'refs.json'), encoding='utf-8'))

# Specific guidelines, most specific first. (key, pattern on the item's own text)
SPECIFIC = [
    ('sepsis-2021', r'\bseps(is|tic)\b|septic shock|lactate'),
    ('aha-resuscitation', r'cardiac arrest|\bCPR\b|defibrillat|pulseless|\bACLS\b|ventricular fibrillation|asystole|compressions'),
    ('npiap', r'pressure (injur|ulcer)|stage (1|2|3|4|I|II|III|IV) (pressure|ulcer)|Braden'),
    ('aba-abls', r'\bburns?\b|TBSA|Parkland|escharotomy'),
    ('acog-preeclampsia', r'pre-?eclampsia|eclampsia|HELLP|magnesium sulfate'),
    ('aap-bronchiolitis', r'bronchiolitis|\bRSV\b'),
    ('aap-safesleep', r'safe sleep|\bSIDS\b|SUID|sudden infant'),
    ('aap-neonatal-glucose', r'(newborn|neonat|infant)[^.]{0,60}(glucose|hypoglyc)|(glucose|hypoglyc)[^.]{0,60}(newborn|neonat)'),
    ('cdc-tb', r'tubercul|\bTB\b|isoniazid|rifampin|PPD|IGRA'),
    ('cdc-isolation', r'isolation|airborne|droplet|contact precaution|\bPPE\b|N95|C\.? ?diff|MRSA|VRE|negative.pressure|transmission'),
    ('cdc-handhygiene', r'hand hygiene|hand.?wash|alcohol-based|hand rub'),
    ('cdc-immunization', r'vaccin|immuniz|\bMMR\b|varicella|hepatitis B vaccine|influenza vaccine|DTaP|Tdap'),
    ('ncsbn-delegation', r'delegat|assistive personnel|\bUAP\b|\bLPN\b|\bLVN\b|nursing assistant|\bCNA\b|assign(ment|s)? (to|the)'),
    ('ncsbn-boundaries', r'boundar|social media|gift from|personal relationship'),
    ('ana-ethics', r'ethic|autonomy|beneficence|advocate|informed consent|confidential|HIPAA|advance directive|whistle'),
    ('lifeline-988', r'suicid|self-harm|kill (him|her|them)self'),
    ('samhsa', r'substance|alcohol withdrawal|opioid use disorder|naloxone|methadone|buprenorphine|delirium tremens|CIWA'),
    ('ismp-highalert', r'insulin|heparin|warfarin|potassium chloride|\bKCl\b|opioid|morphine|hydromorphone|fentanyl|chemotherap|magnesium sulfate|high-alert|look-alike'),
    ('ags-beers', r'(older|elderly|aged? (7|8|9)\d)[^.]{0,80}(medic|drug|diphenhydramine|benzodiazepine|sedat)|Beers'),
    ('tjc-npsg', r'two (patient |client )?identifiers|patient identif|client identif|time-?out|wrong.site|fall (risk|prevent)|alarm fatigue|restraint'),
    ('medline-pregnancy', r'pregnan|prenatal|gestation'),
]
# Open textbook for the item's NCLEX topic (by topic name in bank.json).
TEXTBOOK = {
    'Pharmacology': 'openstax-pharm', 'Fundamentals & Safety': 'openstax-fund', 'Mental Health': 'openstax-psych',
    'Ethics & Professional Practice': 'ana-ethics', 'Pediatrics': 'medline-children', 'Leadership & Delegation': 'ncsbn-delegation',
    'Maternal & Newborn': 'openstax-maternal',
}
DEFAULT_TEXTBOOK = 'openstax-medsurg'
DRUG = re.compile(r'\b\w+(olol|pril|sartan|statin|azole|mycin|cillin|floxacin|dipine|oxetine|azepam|pam|done|tidine|prazole|semide|thiazide|parin|mab|nib|vir)\b|\bmg\b|dose|administer|medication|prescri', re.I)

# Book sections the bank's stems can point to (section id -> pattern). Generic sections are left out.
BOOK = {
    'resp-ards': r'\bARDS\b|acute respiratory distress', 'resp-pe': r'pulmonary embol', 'resp-pneumonia': r'pneumonia',
    'resp-aspiration': r'aspirat', 'resp-copd': r'\bCOPD\b|chronic obstructive', 'resp-asthma': r'asthma',
    'resp-effusion': r'pleural effusion', 'resp-emphysema': r'emphysema', 'resp-fibrosis': r'pulmonary fibrosis',
    'resp-pneumothorax': r'pneumothorax|chest tube', 'resp-tb': r'tubercul|\bTB\b',
    'cardio-tamponade': r'tamponade', 'cardio-acs': r'myocardial infarction|\bSTEMI\b|\bMI\b|acute coronary|angina|troponin',
    'cardio-cardiomyopathy': r'cardiomyopathy', 'cardio-hf': r'heart failure', 'cardio-pah': r'pulmonary (arterial )?hypertension',
    'cardio-htn': r'hypertensive (crisis|urgency|emergency)', 'cardio-inflammatory': r'endocarditis|pericarditis|myocarditis',
    'cardio-occlusion': r'\bDVT\b|deep vein|arterial occlusion|peripheral arterial', 'cardio-postpci': r'\bPCI\b|cardiac cath|\bCABG\b',
    'gi-gerd': r'\bGERD\b|reflux', 'gi-pancreatitis': r'pancreatitis', 'gi-pud': r'peptic ulcer|\bPUD\b|duodenal ulcer|gastric ulcer',
    'gi-gastritis': r'gastritis', 'gi-cirrhosis': r'cirrho|ascites|varices|hepatic encephalopathy', 'gi-gallbladder': r'cholecyst|gallstone',
    'gi-crohn': r'crohn', 'gi-uc': r'ulcerative colitis', 'gi-diverticular': r'diverticul', 'gi-appendicitis': r'appendic',
    'endo-dm': r'diabet|\bDKA\b|hypoglyc|insulin', 'endo-hypothyroid': r'hypothyroid|myxedema', 'endo-hyperthyroid': r'hyperthyroid|graves|thyroid storm',
    'endo-addison': r'addison|adrenal insufficiency|adrenal crisis', 'endo-cushing': r'cushing', 'endo-pheo': r'pheochromocytoma',
    'endo-siadh': r'\bSIADH\b', 'endo-di': r'diabetes insipidus', 'endo-acromegaly': r'acromegaly',
    'endo-hyperpara': r'hyperparathyroid', 'endo-hypopara': r'hypoparathyroid|thyroidectomy',
    'gu-aki': r'acute kidney|\bAKI\b|oliguri', 'gu-uti': r'urinary tract infection|\bUTI\b|cystitis', 'gu-pyelo': r'pyelonephritis',
    'gu-gn': r'glomerulonephritis', 'gu-calculi': r'kidney stone|renal calcul|nephrolithiasis', 'gu-bph': r'\bBPH\b|prostatic hyperplasia|TURP',
    'gu-prostate': r'prostate cancer', 'gu-incontinence': r'incontinence|urinary retention',
    'neuro-stroke': r'stroke|\bTIA\b|\bCVA\b|tPA|alteplase', 'neuro-icp': r'intracranial pressure|\bICP\b|Cushing.s triad',
    'neuro-seizures': r'seizure|epilep|status epilepticus', 'neuro-meningitis': r'meningitis', 'neuro-encephalitis': r'encephalitis',
    'neuro-tbi': r'brain injury|\bTBI\b|spinal cord injury|autonomic dysreflexia', 'neuro-alzheimer': r'alzheimer|dementia',
    'neuro-parkinson': r'parkinson', 'neuro-ms': r'multiple sclerosis', 'neuro-als': r'\bALS\b|amyotrophic', 'neuro-gbs': r'guillain',
    'neuro-mg': r'myasthenia', 'neuro-cranial': r'bell.s palsy|trigeminal',
    'heme-ida': r'iron.deficiency', 'heme-sickle': r'sickle cell', 'heme-leukemia': r'leukemia', 'heme-hemophilia': r'hemophilia',
    'heme-dic': r'\bDIC\b|disseminated intravascular', 'heme-transfusion': r'transfusion', 'heme-polycythemia': r'polycythemia',
    'heme-itp': r'\bITP\b|thrombocytopeni', 'heme-anaphylaxis': r'anaphyla', 'heme-lupus': r'lupus|\bSLE\b',
    'heme-ra': r'rheumatoid', 'integ-burns': r'\bburns?\b', 'integ-pressure': r'pressure (injur|ulcer)',
    'integ-skin': r'cellulitis|melanoma|skin cancer|wound', 'msk-fractures': r'fracture|compartment syndrome|traction|\bcast\b',
    'msk-bone': r'osteoporosis|osteoarthritis|gout', 'msk-osteomyelitis': r'osteomyelitis|amputat|hip replacement|knee replacement|arthroplasty',
    'msk-spinal': r'herniated|sprain|strain|low back',
}

def sections():
    out = subprocess.run(['node', '-e', "import('./dist/data.js').then(d=>console.log(JSON.stringify(d.sections.map(s=>({id:s.id,title:s.title,start:s.start,end:s.end})))))"],
                         cwd=ROOT, capture_output=True, text=True, check=True).stdout
    return {s['id']: s for s in json.loads(out)}

def text_of(q):
    """The item's own subject: stem, the keyed option(s) and the takeaway (distractors and their rationales are left out)."""
    opts, c = q.get('options') or [], q.get('correct')
    keyed = [opts[i] for i in (c if isinstance(c, list) else [c]) if isinstance(i, int) and i < len(opts)] if opts else []
    rows = q.get('rows') or []
    parts = [q.get('stem', ''), ' '.join(map(str, keyed)), ' '.join(map(str, rows)), q.get('takeaway') or '']
    return ' '.join(p for p in parts if isinstance(p, str))

def pick(topic, text, stem, need_pharm):
    refs = [k for k, pat in SPECIFIC if re.search(pat, text, re.I)]
    book = TEXTBOOK.get(topic, DEFAULT_TEXTBOOK)
    out = refs[:2]
    if book not in out: out.append(book)
    if need_pharm and 'dailymed' not in out and len(out) < 3: out.append('dailymed')
    assert all(k in REFS for k in out), out
    return out[:3]

def book_section(stem, secs):
    hits = []
    for sid, pat in BOOK.items():
        if sid not in secs: continue
        m = re.search(pat, stem, re.I)
        if m: hits.append((m.start(), sid))
    return min(hits)[1] if hits else None

def main():
    secs = sections()
    missing = [k for k in BOOK if k not in secs]
    bank = json.load(open(os.path.join(HERE, 'nclex', 'bank.json'), encoding='utf-8'))
    out, log = {}, []
    for q in bank:
        t = text_of(q)
        need_pharm = q.get('clientNeed') == 'pharm' or bool(DRUG.search(q.get('stem', '')))
        r = pick(q['topic'], t, q.get('stem', ''), need_pharm)
        s = book_section(q.get('stem', ''), secs)
        out[q['id']] = {'refs': r, **({'bookSection': s} if s else {})}
        log.append({'id': q['id'], 'topic': q['topic'], 'refs': r, 'bookSection': s})
    cases = json.load(open(os.path.join(HERE, 'nclex', 'ngn.json'), encoding='utf-8'))
    for f in sorted(glob.glob(os.path.join(HERE, 'cases', '*.json'))):
        cases += json.load(open(f, encoding='utf-8'))
    for c in cases:
        if c.get('refs'): continue
        t = json.dumps(c, ensure_ascii=False)
        area = {'cardio': 'Cardiovascular', 'resp': 'Respiratory'}.get(c.get('area'), c.get('area') or '')
        r = pick(area if area in TEXTBOOK else 'x', t, t, bool(DRUG.search(t)))
        s = book_section(c.get('title', '') + ' ' + c.get('sub', ''), secs)
        out[c['id']] = {'refs': r, **({'bookSection': s} if s else {})}
        log.append({'id': c['id'], 'case': c.get('title'), 'refs': r, 'bookSection': s})
    json.dump(out, open(os.path.join(HERE, 'nclex', 'bank_refs.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    os.makedirs(os.path.join(HERE, 'verification'), exist_ok=True)
    json.dump({'note': 'References assigned by content/assign_refs.py from refs.json (topic textbook + guideline matched to the item text). Book sections are related reading matched to the stem. Author review pending.',
               'items': log}, open(os.path.join(HERE, 'verification', 'refs-auto.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    n_book = sum(1 for v in out.values() if 'bookSection' in v)
    from collections import Counter
    cnt = Counter(k for v in out.values() for k in v['refs'])
    print(f'{len(out)} items given references ({len(bank)} questions, {len(out) - len(bank)} cases); {n_book} also linked to a book section')
    print('unknown section ids:', missing)
    print(cnt.most_common())

if __name__ == '__main__':
    main()
