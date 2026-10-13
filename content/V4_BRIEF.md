# v4 expansion: 700 new NCLEX-RN questions (bank 2,500 → 3,200)

You are writing NEW NCLEX-RN practice questions for the Rapid Nursing Review study app (author Alex K. Korir, MSN, RN,
CCRN-CMC). Nursing students will rely on these to pass the NCLEX-RN, and the author will review them. Accuracy beats speed.
These questions are NOT tied to the author's book; they fill the NCLEX topic areas the bank is thin on.

## Your file
Write `content/nclex/v4/<topic>.json` as `{"topic": "<topic id>", "questions": [ ... ]}` (`ensure_ascii=False, indent=1`).
Your targets (total count, type mix, client-need counts) are in `content/nclex/v4/targets.json` under your topic id.
`python3 content/validate_v4.py <topic>` checks the file; run it until it prints VALID. Save often (a short Python script that
loads, appends and dumps keeps the file valid).

## Fields on every question
- `id`: `rnr:<topic>-001`, `-002`, ... (3 digits)
- `source`: "rnrBank" · `origin`: "v4" · `batch`: "v4" · `topic`: the exact topic name in targets.json (e.g. "Maternal & Newborn")
- `clientNeed`: moc | safety | hpm | psych | bcc | pharm | rrp | pa (definitions in content/QUESTION_SPEC.md). Labels must be honest.
- `cjmm`: recognizeCues | analyzeCues | prioritizeHypotheses | generateSolutions | takeAction | evaluateOutcomes. Use all six.
- `difficulty`: 1 (recall/understand), 2 (apply), 3 (analyze/prioritize). Mostly 2 and 3. `level`: "Apply" or "Analyze".
- `stem`: a client-centered NCLEX scenario. Say "client" (or "infant", "child", "newborn" where needed). Use realistic,
  standard values and units (mm Hg, mg/dL, mEq/L, SpO₂ %, °C with °F where helpful).
- `takeaway`: one high-yield sentence the student should remember (not a restatement of the stem).
- `rationales`: one per option/row, same order. Say why each is right or wrong in plain language, starting with
  "Correct." for keyed options.
- `refs`: 1-3 keys from `content/nclex/refs.json` that support the content (OpenStax nursing texts, CDC, NCSBN, NPIAP, AAP,
  Surviving Sepsis, ISMP, Joint Commission, DailyMed...). Use ONLY those keys; never invent a citation.

## Types (match the app's existing NurseBound items in content/nclex/bank.json)
- `mcq`: `options` (exactly 4 strings), `correct` (0-3), 4 rationales. Spread correct positions evenly across 0-3.
- `sata`: stem ends with "Select all that apply."; 5-6 options; `correct` = list of 2-4 indexes (not always the first ones).
- `matrix` (NGN): no `options`; `rows` (3-5 findings/actions), `columns` (2-3 labels, e.g. ["Indicated", "Not indicated"],
  ["Expected", "Requires follow-up"], ["Effective", "Ineffective"]); `correct` = one column index per row (mix them);
  one rationale per row.
- `order` (ordered response): 4-6 `options` shown in a SCRAMBLED order; `correct` = option indexes in the right sequence
  (e.g. [2, 0, 3, 1]); one rationale per option explaining its place.

## Quality rules (NCLEX standard)
1. Current, mainstream U.S. nursing practice (2024-2026 references). No outdated practice. If a point is genuinely debated, don't test it.
2. One defensible key. Distractors are plausible but clearly wrong for a stated reason. No "all/none of the above", no
   absolute-word giveaways, options similar in length and grammar. No trick questions.
3. Doses, lab ranges and timings must be standard, widely taught values. If unsure of a number, test the concept without it.
4. Test nursing judgment (priorities, safety, assessment, teaching, delegation, evaluation), not trivia. Prioritization items
   use ABCs, Maslow, safety, acute vs chronic, and actual vs potential problems correctly.
5. Do NOT duplicate existing items. Before writing, read your topic's existing NurseBound items:
   `python3 -c "import json;[print(q['stem']) for q in json.load(open('content/nclex/bank.json')) if q['topic']=='<Topic Name>']"`
   A new item must test a different fact, client situation or judgment step. The validator rejects identical stems.
6. Cover the topic broadly (see the coverage list in your task). Vary client ages, settings and conditions.
7. Inclusive, respectful wording; no stereotypes. Use generic drug names.
8. Don't mention the NCLEX, other test-prep products, or the app in stems.

## Finish
Only touch your own file(s). Don't run git. End with a short report: counts by type and client need, the subtopics covered,
and anything you were unsure about (list item ids).
