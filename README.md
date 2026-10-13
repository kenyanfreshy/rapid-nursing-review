# Rapid Nursing Review — study app

An NCLEX-RN study app built on the book **Rapid Nursing Review: All Body Systems at a Glance** by Alex K. Korir,
MSN, RN, CCRN-CMC, and expanded with the NurseBound NCLEX bank to cover every NCLEX topic area.

## What's in it

- **2,500 NCLEX-style questions** in all 19 NCLEX topic areas:
  - **1,295 linked to the book** (600 original + 695 added in v3). Each one cites the exact page that proves the answer, is tagged with an NCLEX client need and a clinical-judgment step, and was checked against its page image by a second reviewer. About 16% are matrix (NGN) items.
  - **1,205 from the NurseBound bank**, which covers Mental Health, Pediatrics, Maternal & Newborn, Ethics, Leadership and the rest of the test plan.
- **Next Generation NCLEX:** select-all (+/− scoring), matrix and ordered-response items, plus **20 unfolding case studies** (8 from NurseBound and 12 built from the book, each item citing its book page). Each case has a client chart and six items (single, multi, highlight, matrix, cloze, ordering and bowtie), one per step of the clinical-judgment model, scored with NGN partial-credit rules.
- **Blueprint match:** the bank's client-need mix falls inside every 2026 NCLEX-RN test plan range (NCSBN, effective April 1, 2026). The **75-question blueprint exam** samples to the official midpoints and reports results by category.
- **Two ways to practice:**
  - **NCLEX topics:** a colorful topic picker (All / Unseen / Missed, with question counts, tutor or exam mode).
  - **Book chapters:** 11 parts and 88 sections, each with Read and Quiz buttons.
- **The book**, on a right-side panel: all 196 pages with search, bookmarks and enlarged pages. Every book question has "View page" and "Open in the book" links.
- **Free and Pro:**
  - **Free:** about 290 questions, 1 NGN case, tutor mode and the book's preview pages.
  - **Pro:** everything, at $9.99/month, $49.99 for 3 months (most popular), $89.99/year or $119.00 lifetime. It's sold through RevenueCat in the mobile app, with a paywall in NurseBound's design.
- Exam and quiz screens are plain white; navigation and topics are color-coded.
- From earlier work: autosave and resume, missed-question review, study plan, bookmarks, reports, JSON export, validated saved data, keyboard focus kept on answers.

## Run the web app

```bash
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
# open http://127.0.0.1:4173/
```

The web build is a preview: its paywall says purchases happen in the app and has a "Preview: unlock Pro" switch for
testing. The mobile build removes that switch (`mobile/scripts/build-web.mjs`).

## Project layout

- `dist/` — the web app (plain HTML, CSS and JavaScript modules; no build step).
  - `book.js` and `nclex.js` are generated.
  - `pages/` holds the 196 page images and the cover.
- `content/` — the question sources and the tools that build them:
  - book structure (`structure.py`) and the book question bank (`quizzes/*.json`)
  - specification (`QUESTION_SPEC.md`), NCLEX targets (`targets.json`) and validator (`validate_bank.py`)
  - review logs (`verification/`)
  - the NurseBound import (`import_nursebound.mjs`, `nclex/`) and the generators `build_book_js.py` and `build_nclex_js.py`
  - `BOOK_REVIEW_NOTES.md` (possible book errata)
- `mobile/` — the Expo app for the App Store and Google Play, built with EAS, with RevenueCat. Start with `mobile/README.md` and `mobile/PRICING.md`.
- `docs/PRIVACY.md` — privacy policy for the store listings.
- `tests/` — Playwright checks:
  - `smoke_test.py` — core flows and saved data
  - `book_test.py` — book panel and structure
  - `nclex_test.py` — question types, NGN cases, free/Pro, paywall
  - `mobile_bundle_test.py` — offline phone bundle and Pro bridge

## Editing content

```bash
python3 content/validate_bank.py all          # check the book bank against the spec and the NCLEX targets
python3 content/build_book_js.py              # regenerate dist/book.js
node content/import_nursebound.mjs <path-to-usrn-pathway-app> && python3 content/build_nclex_js.py   # refresh the NCLEX bank
cd mobile && npm run build:web                # update the phone app's bundle
```

Keep question IDs stable: saved answers, bookmarks and history refer to them.

## Status and limits

- The 1,295 book questions are labeled "awaiting author review" in the app until you approve them.
- `content/BOOK_REVIEW_NOTES.md` and `content/BOOK_CORRECTIONS_V3.md` list possible book errata to check.
- NurseBound questions carry NurseBound's own review notes where it had them; items with a disputed answer key were not imported.
- RevenueCat keys in `mobile/app.json` are placeholders until you create the RevenueCat app (see `mobile/PRICING.md`).
- The mobile app hasn't been built here (the npm registry was blocked in this workspace). Build with EAS and test purchases with sandbox accounts before submitting.

## Trademark notice

NCLEX® is a registered trademark of the National Council of State Boards of Nursing, Inc. (NCSBN). Rapid Nursing Review App is not sponsored or endorsed by NCSBN. The same notice appears in the app (Overview, About, Settings and both paywalls); add it to the end of the App Store and Google Play descriptions too.
