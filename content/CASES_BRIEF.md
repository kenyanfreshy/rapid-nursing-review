# Book-linked NGN case studies (v3)

You are writing Next Generation NCLEX unfolding case studies for the Rapid Nursing Review app, each built from one condition in
the book "Rapid Nursing Review: All Body Systems at a Glance" by Alex K. Korir, MSN, RN, CCRN-CMC. Students will rely on these
for the NCLEX and the author will review them, so accuracy beats speed.

## Format
- Study `content/nclex/ngn.json` (8 existing cases, written for the app's case runner). Your cases use the SAME shape, plus:
  `"source": "book"`, `"chapter": <chapter id>`, `"section": <section id>`, `"pages": [printed pages used]`, and on every item
  `"page": <the one printed page that proves that item's answer>`. Section ids and page ranges are in `content/structure.py`.
- `id`: `ngn:book-<short-slug>`. `clientNeed`/`area`: the case's main NCLEX client need (see QUESTION_SPEC.md for the codes).
- `ehr`: at least 3 tabs (e.g. Notes, Vitals, Labs, Orders), rows of `[label, text]`, realistic and internally consistent.
- Exactly 6 items, one per Clinical Judgment Measurement Model step in this order: recognizeCues, analyzeCues,
  prioritizeHypotheses, generateSolutions, takeAction, evaluateOutcomes. `stepLabel` is the title-case label used in ngn.json.
- Use at least 3 different item kinds per case, and across your 6 cases use every kind: single, multi, highlight, matrix,
  cloze, order, bowtie. Copy the exact field shapes from ngn.json for each kind. `multi` stems end with "Select all that apply."
- Rationales: explain why the key is right and why the main distractors are wrong, in plain language.

## Grounding
- `python3 content/page.py 69-71` prints a page's extracted text. Text extraction loses tables and arrows, so ALSO look at the
  page images with the Read tool: `dist/pages/p069.webp` (3-digit printed page). The image is the authority.
- Every finding the answer depends on, and every keyed action, must be supported by the cited page. Vital signs and lab values in
  the EHR may be realistic case details, but the reasoning that makes the key right must come from the book. Don't add drug doses
  or protocols the book doesn't state; when an order needs a dose, keep it generic ("as prescribed") or use what the book states.
- Don't duplicate the existing NurseBound cases (heart failure, urosepsis, compartment syndrome, post-op sepsis, DKA, postpartum
  hemorrhage, pediatric asthma, ischemic stroke).

## Working method
- Write your cases to the file named in your task as a JSON list (`ensure_ascii=False, indent=1`), saving after each case.
- Run `python3 content/validate_cases.py` until your file has no problems.
- Only touch your own file. Don't edit other files, and don't run git.
- Finish with a short report: case ids, item kinds used, pages cited, and any book content you found questionable.
