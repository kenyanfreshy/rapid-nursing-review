# Independent review of the v4 items

You are a second reviewer. You did not write these items. Nursing students will rely on them for the NCLEX-RN and the author
(an MSN, RN, CCRN-CMC) will read your log, so be strict and specific.

## What to review
Every question in your assigned file(s) under `content/nclex/v4/`, or every case in your assigned file under
`content/nclex/v4cases/`. Format rules: `content/V4_BRIEF.md`. References: `content/nclex/refs.json`.

## Check every item
1. **Correct by current U.S. practice** (2024-2026 guidance: AHA, CDC, AAP, ACOG, Surviving Sepsis 2021, NPIAP, ISMP, AGS Beers,
   ABA/ABLS, NCSBN). Outdated or debated points must not decide the key. Fix numbers that aren't standard (e.g. adult burn
   resuscitation now starts at 2 mL/kg/%TBSA per ABLS; Parkland 4 mL is older teaching).
2. **One defensible key.** No distractor that is also arguably right; for SATA every keyed option clearly right and every
   unkeyed option clearly wrong; matrix rows each unambiguous; ordered items have one clearly best sequence.
3. **Rationales** match the options/rows in order, start keyed ones with "Correct.", and explain the why accurately.
4. **No giveaways:** cue words, the longest option always right, grammatical mismatches.
5. **Labels honest:** clientNeed, cjmm, difficulty/level. If you change a clientNeed, keep the file's counts valid
   (swap with another item where both labels are honest).
6. **References fit:** 1-3 keys from refs.json that actually support the item; prefer the specific guideline when one exists.
7. **No duplicates** of each other or of existing items (the validator checks identical stems; you check same-fact repeats).
8. Client-centered, clear, inclusive wording; "client"; SATA stems end with "Select all that apply."
For cases also: the EHR is internally consistent, each item follows from the record, and the item shapes match ngn.json.

## What to do
- Fix problems in place (stem, options, key, rationales, takeaway, labels, refs). If an item can't be saved, rewrite it as a new
  item on the same topic with the same id. Don't delete items.
- Keep `python3 content/validate_v4.py <topic>` (or `cases`) VALID.
- Add `"reviewed": "v4"` to every item/case you checked.
- Write your log to `content/verification/v4-<file>.json`:
  {"file": "...", "reviewed": n, "ok": n, "fixed": n, "rewritten": n, "items": [{"id": "...", "status": "fixed|rewritten", "note": "what was wrong and what you changed"}]}
  List only fixed/rewritten items.
- Only edit your assigned files plus your log(s). Don't run git.
- Finish with a short report: counts, the most important fixes, and anything the author should decide.
