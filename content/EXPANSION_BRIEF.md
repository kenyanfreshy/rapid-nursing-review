# v3 expansion brief: 600 → 1,295 book questions (bank total 2,500)

You are adding NEW questions to one chapter file in `content/quizzes/<chapter>.json` of the Rapid Nursing Review app.
The book is "Rapid Nursing Review: All Body Systems at a Glance" by Alex K. Korir, MSN, RN, CCRN-CMC. The author will
review this work, and nursing students will rely on it for the NCLEX, so accuracy beats speed.

## Read first
1. `content/QUESTION_SPEC.md`: the item format and quality rules. Follow them exactly. The one change is the type mix (below).
2. `content/targets.json`, under `chapters.<your chapter>`: the NEW per-section counts and per-client-need counts for the whole
   chapter (existing + new). `python3 content/validate_bank.py <chapter>` tells you what is still missing.
3. The existing questions in your chapter file. Do NOT duplicate them. A new item must test a different fact, a different
   client situation, or a different clinical-judgment step. Rewording an existing item is a duplicate.

## Reading the book
- `python3 content/page.py 44` or `python3 content/page.py 44-48` prints the extracted text of printed pages.
- Text extraction loses tables, arrows and figure labels. When the text is jumbled, LOOK at the page image with the Read tool:
  `dist/pages/p044.webp` (3-digit printed page number). Do this for every page you build questions from; it is the authority.

## What to write
- Append new question objects to the `questions` array. Keep every existing question exactly as it is (do not edit, reorder or delete).
- Ids: continue each section's numbering from its highest existing number (`<sectionId>-q<n+1>`, ...).
- Add `"batch": "v3"` to every new question. Do not add a `checked` field.
- Type mix for the NEW items in your chapter: about 58% mcq, 22% sata, 20% matrix. (Matrix items are the NGN share.)
- Spread `cjmm` across all six steps; the bank is light on `evaluateOutcomes` and `prioritizeHypotheses`, so lean toward those.
- Spread mcq correct indexes evenly over 0-3; vary sata keys and matrix answers.
- Hit the per-section counts exactly and each client-need count within the validator's tolerance.
- Client needs must be honest: psych items come from what the book says about anxiety, coping, education, family support,
  end-of-life or cognitive change; moc items are prioritization/delegation/SBAR/consent built from the book's clinical findings.
  If a chapter truly cannot support a client-need count honestly, use the closest grounded category and add a `concerns`
  entry `{"page": 0, "issue": "blueprint: ..."}`. Don't invent content to hit a number.
- Every fact the key depends on must be on the cited page. Never add drug doses, numbers or recommendations the book doesn't state.
  If you notice content on a page that looks clinically questionable or outdated, don't build on it; add it to `concerns`.

## Working method
- Work section by section. Read the section's pages (text + images), then write that section's new items, then save.
- Write the file with a short Python script that loads the JSON, appends, and dumps with `ensure_ascii=False, indent=1`
  (keep the file valid JSON at every save).
- Run `python3 content/validate_bank.py <chapter>` until it prints VALID.
- Only touch your own chapter file. Don't edit any other file, and don't run git.

## Finish with a short report
Counts added per type and client need, any concerns you logged, and anything you could not do.
