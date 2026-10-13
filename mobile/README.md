# Rapid Nursing Review — iOS and Android app (Expo + EAS)

This is the App Store / Google Play version of the study app. It is a small Expo app whose one screen is a WebView running the same study app as `../dist`, bundled for offline use:

- On first launch (and after each update) the app copies the bundled study app and the book pages into its private storage, then opens them from there. After that everything works with no network: book reader, 276 quiz questions, study plan, bookmarks.
- Progress is saved twice: in the WebView and in native storage (AsyncStorage), so it survives the system clearing web data.
- "Export progress" opens the phone's share sheet. Links to outside sources open in the browser. The Android back button steps back through the app's pages.

## One-time setup (your terminal)

You need Node.js 20 or newer, an [Expo account](https://expo.dev/signup), and for publishing an Apple Developer account ($99/year) and a Google Play Console account ($25 once). EAS builds iOS in the cloud, so you do not need a Mac.

```bash
cd mobile
npm install
npx expo install --fix        # aligns every package with the installed Expo SDK
npx expo-doctor               # should report no problems
npm install -g eas-cli
eas login
eas init                      # links the project to your Expo account (adds projectId to app.json)
```

`package.json` is pinned to Expo SDK 54, the latest version this workspace could confirm. To move to the newest SDK: `npx expo install expo@latest && npx expo install --fix`.

**Before the first build, decide the app identifiers.** `app.json` uses `com.alexkorir.rapidnursingreview` for both the iOS bundle identifier and the Android package. These cannot be changed after the app is published, so change them now if you publish under a company name.

## Every build

```bash
npm run build:web             # packs ../dist into assets/web (run after any change to the web app)
eas build -p android --profile preview      # installable APK to test on an Android phone
eas build -p ios --profile preview          # internal iOS build (register your iPhone when prompted)
eas build -p all --profile production       # store builds: .aab for Google Play, .ipa for the App Store
eas submit -p ios                           # upload the latest iOS build to App Store Connect
eas submit -p android                       # upload the latest Android build to Google Play
```

EAS uploads this `mobile` folder only, so `assets/web` must exist (and be committed if you use git) before you run `eas build`. Version numbers are managed by EAS (`appVersionSource: remote`, `autoIncrement` on production builds); the user-facing version is `version` in `app.json`.

## Full book or preview (KDP Select)

```bash
npm run build:web             # full book: all 196 pages ship inside the app
npm run build:web:preview     # preview: opening pages + first page of each chapter only
```

If the Kindle edition is enrolled in **KDP Select**, Amazon's exclusivity terms cover the digital book, and shipping the full book inside a free app may conflict with them. In preview mode the locked page images are left out of the app package entirely, not just hidden. The quizzes, explanations and page references work in both modes.

## Store checklist

Both stores
- [ ] Privacy policy URL (required by both). The app collects no personal data: everything stays on the device, and there are no accounts, analytics or ads.
- [ ] Support URL or email.
- [ ] Screenshots: iPhone 6.9" and iPad 13" (the app supports iPad), Android phone (and 7"/10" tablet if you list tablet support).
- [ ] Short description that matches what ships: the book, section quizzes with explanations, study plan. Don't claim NCLEX pass rates or readiness prediction.
- [ ] An educational disclaimer in the description and the About screen (not medical advice; for study use).
- [ ] Have the 264 drafted questions reviewed (you as the author, or a reviewer) before release. The app labels them "awaiting author review"; update that wording in `../dist/app.js` once they're approved.

Apple App Store Connect
- [ ] App record with the same bundle identifier as `app.json`.
- [ ] App Privacy: "Data Not Collected".
- [ ] Age rating questionnaire (medical/treatment information: infrequent/mild, informational).
- [ ] Category: Education (secondary: Medical).
- [ ] Encryption: already declared as not using non-exempt encryption in `app.json`.

Google Play Console
- [ ] Data safety form: no data collected or shared.
- [ ] Content rating questionnaire, target audience 18+.
- [ ] New personal developer accounts must run a closed test with at least 12 testers for 14 days before production access is granted. Plan for this; organization accounts are exempt.

## Files

- `App.js` — the native shell (copy files, WebView, storage, share sheet, back button). Written without JSX so it can be syntax-checked with plain Node.
- `scripts/build-web.mjs` — builds `assets/web` from `../dist`: inlines CSS and JavaScript into one `index.html` (module scripts don't load from `file://` in WebViews) and copies the page images.
- `assets/icon.png`, `adaptive-icon*.png`, `splash-icon.png` — the app icon and splash, using the book cover's charcoal and yellow with the app's pulse mark.
- `metro.config.js` — lets Metro bundle `index.html` as an asset.

## What has and hasn't been verified

Verified in this workspace: the offline bundle loads from a `file://` path in Chromium (as Android's WebView does) and passes `../tests/mobile_bundle_test.py`: it renders, restores progress from the native copy, saves answers through the native bridge, loads book pages and the cover, sends exports to native, and fits a 390 px phone screen. `App.js`, `index.js`, `metro.config.js` and the build script pass syntax checks.

Not verified: the npm registry was blocked from the workspace, so `npm install`, `expo-doctor` and an actual EAS build have not been run. Run the setup steps above, then a `preview` build on a real phone, before submitting.
