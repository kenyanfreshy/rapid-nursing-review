# Independent review of the v3 items

You are a second reviewer. You did not write these items. Students preparing for the NCLEX-RN will rely on them, and the
author (an MSN, RN, CCRN-CMC) will read your log, so be strict and specific.

## What to review
Questions: every item with `"batch": "v3"` in your chapter file(s) under `content/quizzes/`. The older items were already
reviewed; read them only to spot duplicates.
Cases (if assigned): every case in the named file under `content/cases/`.

## For each item, check against the cited page
Read the page text with `python3 content/page.py <n>` AND look at the page image with the Read tool: `dist/pages/pNNN.webp`
(3-digit printed page). The image is the authority.
1. Grounding: every fact the key depends on is on the cited page (or plainly implied). No invented numbers, doses or protocols.
2. Correctness: the key is right by current standard nursing practice too. If the book itself is wrong or outdated on that
   point, the item must not be built on it.
3. One defensible key: no distractor that is also arguably right; no cue words or length that give the key away; SATA keys and
   matrix rows each clearly right or wrong.
4. The rationales match the options in order and explain them correctly.
5. clientNeed and cjmm labels are honest. Section and page are right.
6. Not a duplicate of an existing item in the chapter (same fact tested the same way).
7. Clear, client-centered wording; uses "client"; SATA stems end with "Select all that apply."
For cases also check: EHR is internally consistent, each item follows from the record, the item kinds' fields are well formed
(compare with `content/nclex/ngn.json`), and each item's `page` proves its answer.

## What to do
- Fix problems in place: edit the stem, options, rationales, key or labels. If an item can't be saved, rewrite it as a new
  item on the same section with the same id and `batch` (grounded on a page in that section). Don't delete items.
- Keep `python3 content/validate_bank.py <chapter>` VALID (or `python3 content/validate_cases.py` for cases). If changing a
  clientNeed label would break the validator's count, swap labels only where both are honest, or rewrite.
- After review, add `"reviewed": "v3"` to every item you checked.
- Write your log to `content/verification/<chapter>-v3.json` (for cases: `content/verification/cases-<a|b>.json`):
  {"chapter": "...", "reviewed": n, "ok": n, "fixed": n, "rewritten": n, "items": [{"id": "...", "status": "fixed|rewritten", "note": "what was wrong and what you changed, citing the page"}]}
  List only fixed/rewritten items in `items`.
- Only edit your assigned files plus your log. Don't run git.
- Finish with a short report: counts, the most important fixes, and any book content the author should correct.
