# Question specification — Rapid Nursing Review question bank (v2, 600 items)

Every question is grounded in, and links to, one exact page of the book
"Rapid Nursing Review: All Body Systems at a Glance" (Alex K. Korir, MSN, RN, CCRN-CMC).
The bank as a whole, and each chapter, follows the 2026 NCLEX-RN test plan (NCSBN, effective April 1, 2026).

## File format: content/quizzes/<chapter>.json
{"chapter": "<id>", "questions": [ ... ], "concerns": [ {"page": n, "issue": "..."} ]}

## Fields on every question
- id: "<sectionId>-q<n>". Existing ids (q1..q3) MUST be kept. New ones continue the numbering (q4, q5, ...).
- section: the section id from content/structure.py.
- page: the ONE printed page whose content proves the answer. It must lie inside that section's page range.
- type: "mcq" | "sata" | "matrix"
- stem: plain text. Client-centered scenario where the book supports one ("A client with ... reports ..."). Use "client", as NCLEX does.
- clue: the deciding clinical cue in the stem (one sentence).
- priority: the nursing priority or principle tested (one sentence).
- clientNeed: one of moc, safety, hpm, psych, bcc, pharm, rrp, pa
    moc    Management of Care: prioritization, delegation and assignment, scope, advocacy, consent, ethics/legal, collaboration, continuity, SBAR/handoff, case management
    safety Safety and Infection Prevention and Control: precautions, isolation, error/injury prevention, fall/seizure precautions, safe equipment use, reporting
    hpm    Health Promotion and Maintenance: screening, risk factors, prevention, health teaching for wellness, lifestyle, early detection
    psych  Psychosocial Integrity: anxiety, coping, grief and loss, family support, therapeutic communication, end-of-life, body image, substance use, cognitive change support
    bcc    Basic Care and Comfort: positioning, mobility, nutrition and diet, elimination, rest, skin/hygiene, non-pharmacologic comfort
    pharm  Pharmacological and Parenteral Therapies: drug actions, adverse effects, contraindications, monitoring, IV fluids, blood products, dosage principles
    rrp    Reduction of Risk Potential: labs and diagnostics, monitoring for complications, procedure prep and care, vital-sign changes
    pa     Physiological Adaptation: acute illness management, emergencies, fluid/electrolyte imbalance, hemodynamics, pathophysiology-driven care
- cjmm: the Clinical Judgment Measurement Model step the item tests: recognizeCues, analyzeCues, prioritizeHypotheses, generateSolutions, takeAction, evaluateOutcomes. Spread these across the chapter.

## Item types
mcq (single best answer)
  options: exactly 4. correct: index 0-3. rationales: 4, same order.
sata (select all that apply; NCLEX "extended multiple response")
  stem ends with "Select all that apply."
  options: 5 or 6. correct: array of 2 to 4 indexes. rationales: one per option.
  Every keyed option must be stated or directly supported on the cited page; every unkeyed option must be clearly wrong per the book.
matrix (NCLEX "matrix multiple choice")
  stem tells the student what to do, e.g. "For each finding, indicate whether it is expected or unexpected for this client."
  rows: 3 to 5 findings or actions. columns: 2 or 3 labels (e.g. ["Indicated", "Not indicated"], ["Expected", "Unexpected"], ["Anticipated", "Not anticipated", "Contraindicated"]).
  correct: array with one column index per row. rationales: one per row.
  (no "options" field for matrix)

Mix inside each chapter: about 65% mcq, 22% sata, 13% matrix. Existing questions stay mcq unless they need rewriting anyway.

## Quality rules
1. Every fact the answer depends on must be stated on the cited page (or plainly implied by it). Never add numbers, drugs, doses or recommendations the book doesn't state. If general nursing knowledge is needed to make a distractor wrong, keep it basic and uncontroversial.
2. One defensible key. No "all/none of the above". No absolutes used as giveaways. Options similar in length and style.
3. Paraphrase in your own words; don't copy long passages.
4. Prioritization and delegation items (moc) should still be anchored in the book's clinical content (e.g., which of four clients described with book findings to see first).
5. Psychosocial items must come from what the book says (anxiety, coping, education, family support, end-of-life, cognitive changes). If a chapter can't honestly support its psych target, use the closest grounded category and say so in "concerns" as {"page": 0, "issue": "blueprint: ..."}.
6. Don't build questions on content you flag as questionable; list those in "concerns".
7. Vary correct positions (mcq indexes spread evenly; sata keys not always the first options).
