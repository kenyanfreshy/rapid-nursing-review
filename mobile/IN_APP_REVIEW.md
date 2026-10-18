# In-app review (App Store rating sheet)

Rapid Nursing Review asks for an App Store rating with Apple's own sheet (`SKStoreReviewController`, through
`expo-store-review`), and only after a good study moment. Google Play is wired in and switched off until the Android
launch.

## How it works in this app

The study app runs inside a WebView, so the results screen is web code and the rating call is native:

```
dist/app.js  finishSession() / finishCase()
   └─ postMessage {type:'session-complete', kind, correct, total, points, max}
mobile/App.js  onMessage
   └─ after 2.5 s (results and any celebration show first)
      rating.onSessionComplete(result)          mobile/rating/index.js
         └─ rules + counters in AsyncStorage     mobile/rating/nclexRatingService.js
            └─ StoreReview.requestReview()       iOS sheet; Apple decides whether it appears
```

Settings → **Enjoying Rapid Nursing Review? → Rate the app** (iPhone app only) sends `{type:'rate-app'}`, which opens
the App Store "Write a Review" page, or the native sheet until the App Store ID is filled in.

## When the sheet is requested

All of these must hold (values in `RATING_CONFIG`):

| Rule | Value |
|---|---|
| A good moment: a session of at least 5 questions at 75% or better | `MIN_QUESTIONS` 5, `PASS_SCORE` 0.75 |
| …or an NGN case study at 75% or better | `PASS_SCORE` |
| …or 5 finished sessions in a row at 50% or better (short Quick Practice rounds count) | `STREAK_MODULES` 5, `STREAK_FLOOR` 0.5 |
| At least 3 finished sessions in total | `MIN_SESSIONS` 3 |
| First opened at least 2 days ago | `MIN_DAYS_INSTALLED` 2 |
| Fewer than 3 requests in the last 365 days | `MAX_PER_YEAR` 3 (Apple's own limit) |
| At least 90 days since the last request | `MIN_DAYS_BETWEEN` 90 |
| Not already requested on this app version | `appVersion` from `app.json` |

A request is counted only when `requestReview()` was actually called. If the sheet isn't available, nothing is counted.

**No automatic redirect to the App Store.** If the native sheet isn't available, the automatic path does nothing. The
`?action=write-review` link opens only when the learner taps **Rate the app** themselves. App Review Guideline 5.6.1
allows only Apple's own prompt for unprompted rating requests, and custom prompts or redirects risk rejection.

## Setup (once)

1. Install the module from the `mobile` folder:
   ```bash
   npx expo install expo-store-review
   ```
2. The numeric Apple ID (6822172335, App Store Connect → App Information → **Apple ID**) is set in
   `APP_STORE_ID` in `mobile/rating/nclexRatingService.js`, so **Rate the app** opens the Write a Review page.
3. Build as usual (`eas build`). The module is native, so a new build is needed; an over-the-air update isn't enough.

## Testing on iOS

| Build | What happens |
|---|---|
| **Debug / development build** (Xcode Run, simulator, `expo run:ios`, EAS development build) | The sheet **always** appears when requested, so you can check timing and the moments. Submitting does nothing: no rating is posted. |
| **TestFlight** | The sheet **never** appears. Apple disables it for TestFlight. `requestReview()` still returns normally, so the app counts the request. |
| **App Store (production)** | Apple decides. The sheet appears at most 3 times per 365 days per device, may not appear even when requested, and never appears if the user turned off **Settings → App Store → In-App Ratings & Reviews**. The app is never told whether it appeared. |

To walk through the rules in a debug build:
- Set `MIN_DAYS_INSTALLED: 0` and `MIN_SESSIONS: 1` temporarily, finish one session of 5+ questions at 75%+, and the
  sheet appears about 2.5 seconds after the results screen.
- To start over, delete and reinstall the app (the counters live in AsyncStorage under `rnr.rating.v1`).
- The rules are covered without a device by `node tests/rating_test.mjs`. The web-to-native messages and the Rate
  button are covered by `python3 tests/rating_bridge_test.py`.

## Android (later)

1. In `PROVIDERS.android`, set `enabled: true`.
2. In `dist/app.js`, show the Settings button on Android too (the `window.__RNR_OS__ === 'ios'` check in `showSettings`).
3. Test with an internal-testing track build installed from Google Play. Play's In-App Review shows only for builds
   installed from Play, and it has its own quota. Use internal app sharing to see the dialog repeatedly.
