# Rapid Nursing Review — study app

A course-focused study app built on the book **Rapid Nursing Review: All Body Systems at a Glance** by Alex K. Korir, MSN, RN, CCRN-CMC.

## What's in it

- **The book's structure is the app's structure.** 11 parts (NCLEX must-know content, nine body-system chapters and the fluid & electrolytes bonus) and 88 sections, each with its page range, a Read button and a Quiz button. This holds on the Practice page, The book page, the right-side panel, practice setup and the study plan.
- **Right-side book panel** with Contents and Reader views: every page of the book, chapter colors from the book's own table of contents, search across the full text, page bookmarks, an enlarged page view, "mark section read", and the section's quiz one tap away. It's docked on wide screens and opens as an overlay on phones and tablets.
- **276 questions**: 264 drafted from the book (3 per section) plus the 12 original pilot questions, which were placed in their matching book sections. Every book question explains each option, names the deciding clue and the nursing priority, and links to its page: "View page" shows it inline and "Open in the book" jumps the reader to it.
- From earlier work: tutor and timed modes, autosave and resume, missed-question review, bookmarks, study plan, reports, JSON export, and validated saved data.

## Run the web app

```bash
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
# open http://127.0.0.1:4173/
```

## Project layout

- `dist/` — the web app (plain HTML, CSS and JavaScript modules; no build step). `book.js` is generated; `pages/` holds the 196 page images and the cover.
- `content/` — the book's structure (`structure.py`), the quiz questions per chapter (`quizzes/*.json`), the extracted book text, `build_book_js.py` to regenerate `dist/book.js`, and **`BOOK_REVIEW_NOTES.md`**: possible errata found in the book.
- `mobile/` — the Expo app for the App Store and Google Play, built with EAS. See `mobile/README.md`.
- `tests/` — Playwright checks: `smoke_test.py` (core flows and saved-data handling), `book_test.py` (book panel and book structure), `mobile_bundle_test.py` (the offline mobile bundle).

## Editing content

1. Edit `content/quizzes/<chapter>.json` (or `content/structure.py` for sections and page ranges).
2. `python3 content/build_book_js.py`
3. `cd mobile && npm run build:web` to update the phone app's bundle.

Keep question IDs stable: saved answers, bookmarks and history refer to them.

## Status and limits

- The 264 book questions were drafted from the book's pages and are labeled "awaiting author review" in the app. Have them reviewed before publishing.
- `content/BOOK_REVIEW_NOTES.md` lists 145 possible issues logged while drafting questions (typos, numbering, internal contradictions, a few outdated items), plus a handful confirmed directly (the table of contents page numbers, duplicated pp. 58–59, the leftover draft on p. 98). Treat them as leads to check.
- `BOOK_ACCESS` (in `dist/book.js`, or `npm run build:web:preview` for the phone app) switches between the full book and a preview. Check your KDP Select terms before shipping the full book.
- Progress is stored on the device only: no accounts, sync or payments yet.
- Google Fonts need a network connection; offline, the app falls back to system fonts.
