# Rapid Nursing Review Pro: prices, store products and RevenueCat

**How it works:** you set each price in App Store Connect and Play Console. The app shows whatever price and
currency the store gives each shopper (through RevenueCat), so no price is written in the app's code and every
country sees its own local price. The app never links to an outside payment page.

## Plans

| Plan | Price (U.S.) | Apple product ID | Google Play | Shown on the paywall |
|---|---|---|---|---|
| Pro annual (auto-renewing, 1 year) | **$49.99/year** | `com.alexkorir.rapidnursingreview.pro.annual` | subscription `rnr_pro`, base plan `annual` | first, "Best value", "Save ~17%" vs monthly |
| Pro monthly (auto-renewing, 1 month) | **$4.99/month** | `com.alexkorir.rapidnursingreview.pro.monthly` | subscription `rnr_pro`, base plan `monthly` | "Cancel anytime" |
| All-access pass (one-time) | **$99.99** | `com.alexkorir.rapidnursingreview.pro.lifetime` (Non-Consumable) | in-app product `rnr_pro_lifetime` | "Pay once · no renewal" |

All three unlock the RevenueCat entitlement **`pro`**. The paywall works out "Save ~X%" from the real store prices:
$49.99 vs 12 × $4.99 = $59.88 is about 17%. The one-time pass is priced above the annual plan, so it doesn't undercut it.

**Free trial (optional):** none is required. If you add an introductory offer to the subscriptions in the stores,
the paywall shows it automatically, only to shoppers the store says are eligible, with the price that follows it.

**Other countries:** enter the U.S. price and let each store convert it, then adjust any country that looks too high.

## What Pro unlocks

| Free | Pro |
|---|---|
| NCLEX Must-Know chapter, the first section of every book chapter, 10 questions per NCLEX topic (about 290 questions) | All 1,805 questions |
| 1 NGN case study | All 8 NGN case studies |
| Tutor mode | Tutor mode, timed exams and the 75-question NCLEX blueprint exam |
| The book's opening pages and the first page of each chapter | The complete book reader |
| Progress, study plan, bookmarks, missed-question review (of free questions) | Everything, across the full bank |

The free and Pro rules live in one place: the "Free vs Pro" block near the top of `dist/app.js`.

## App Store Connect (iPhone)

1. Create the app with bundle ID `com.alexkorir.rapidnursingreview`.
2. **Monetization → Subscriptions:** create a subscription group named "Rapid Nursing Review Pro", then two subscriptions:
   `com.alexkorir.rapidnursingreview.pro.annual` (1 year) and `com.alexkorir.rapidnursingreview.pro.monthly` (1 month).
   Put annual at the higher level in the group. Give each a display name ("Pro annual", "Pro monthly"), a description and a
   review screenshot of the paywall.
3. **Subscription Prices → Add pricing:** United States $49.99 (annual) and $4.99 (monthly). Apple fills in other countries.
4. **In-App Purchases → Non-Consumable** `com.alexkorir.rapidnursingreview.pro.lifetime` at $99.99.
5. Add all three to the app version you submit (**App Store → your version → In-App Purchases and Subscriptions**).
6. **App Information:** add the Privacy Policy URL (`docs/PRIVACY.md` in this repo, or your own site) and keep Apple's
   standard EULA as the Terms of Use.
7. **App Privacy:** RevenueCat handles purchases, so declare **Purchases → Purchase History** and **Identifiers → User ID**,
   both used for **App Functionality**, not linked to the user's identity, not used for tracking. Everything else: not collected.

## Google Play Console (Android)

1. Create the app with package `com.alexkorir.rapidnursingreview`.
2. **Monetize → Products → Subscriptions:** create `rnr_pro` with two base plans, `annual` (auto-renewing, 1 year, $49.99) and
   `monthly` (auto-renewing, 1 month, $4.99). Activate both.
3. **In-app products:** `rnr_pro_lifetime` at $99.99. Activate it.
4. **Data safety:** purchase history and an app user ID are collected for app functionality (by Google Play billing and
   RevenueCat), not shared, not used for ads.
5. Google only lets you create products after an app bundle has been uploaded once. Upload the first production build
   (`eas build -p android --profile production`) to an internal testing track, then create the products.

## RevenueCat

1. Create a project "Rapid Nursing Review" and add two apps: **App Store** (bundle ID above, plus an App Store Connect
   In-App Purchase key) and **Play Store** (package name above, plus a Google service-account JSON with financial access).
2. **Products:** import the three Apple and three Google products.
3. **Entitlement** `pro`: attach all six products.
4. **Offering** `default` (mark it Current) with three packages:
   - **Annual** (`$rc_annual`) → `com.alexkorir.rapidnursingreview.pro.annual` / `rnr_pro:annual`
   - **Monthly** (`$rc_monthly`) → `com.alexkorir.rapidnursingreview.pro.monthly` / `rnr_pro:monthly`
   - **Lifetime** (`$rc_lifetime`) → `com.alexkorir.rapidnursingreview.pro.lifetime` / `rnr_pro_lifetime`
5. **API keys:** copy the public Apple key (`appl_…`) and Google key (`goog_…`) into `mobile/app.json` →
   `expo.extra.revenueCatAppleKey` / `revenueCatGoogleKey`. These public SDK keys are safe to ship in the app;
   never put a RevenueCat secret key (`sk_…`) in the app.

These keys are separate from NurseBound's: each app has its own RevenueCat app and its own keys.

## Testing purchases

- RevenueCat needs a native build (not Expo Go). `eas build -p ios --profile development` or
  `eas build -p android --profile development` makes an installable test build.
- iPhone: sign in with a Sandbox Apple ID (Settings → App Store → Sandbox Account). Purchases are free and renew quickly.
- Android: add your Google account under Play Console → Settings → License testing.
- Development builds show "Dev: Unlock Pro for Testing" at the bottom of the paywall. It never appears in store builds.
- To try purchases without store setup, add a RevenueCat Test Store key as `revenueCatTestKey` and set `useTestStore: true`
  (development builds only).

## Business notes

- Apple Small Business Program (under US$1M a year): Apple keeps 15%, so $49.99 annual nets about $42.49 and $4.99 monthly
  about $4.24. Google Play keeps 15% on subscriptions and on the first US$1M of other sales.
- The full book ships inside the app for Pro members. If the Kindle edition is in KDP Select, check its exclusivity
  terms first; `npm run build:web:preview` builds an app that contains only the preview pages.
