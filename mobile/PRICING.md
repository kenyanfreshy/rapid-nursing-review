# Rapid Nursing Review Pro: prices, store products and RevenueCat

**How it works:** you set each price in App Store Connect and Play Console. The app shows whatever price and
currency the store gives each shopper (through RevenueCat), so no price is written in the app's code and every
country sees its own local price. The app never links to an outside payment page.

## Plans

| Plan | Price (U.S.) | Apple product ID | Google Play | Shown on the paywall |
|---|---|---|---|---|
| Pro 3-month pass (auto-renewing, 3 months) | **$49.99 / 3 months** | `com.alexkorir.rapidnursingreview.pro.quarterly` | subscription `rnr_pro`, base plan `quarterly` | first and pre-selected, "Most popular", "Save ~17%" vs monthly |
| Pro monthly (auto-renewing, 1 month) | **$19.99/month** | `com.alexkorir.rapidnursingreview.pro.monthly` | subscription `rnr_pro`, base plan `monthly` | next to the 3-month pass, "Cancel anytime" |
| Pro annual / complete pass (auto-renewing, 1 year) | **$89.99/year** | `com.alexkorir.rapidnursingreview.pro.annual` | subscription `rnr_pro`, base plan `annual` | full width, "Save ~62%" vs monthly |
| Lifetime access (one-time) | **$119.00** | `com.alexkorir.rapidnursingreview.pro.lifetime` (Non-Consumable) | in-app product `rnr_pro_lifetime` | full width, "Pay once" |

All four unlock the RevenueCat entitlement **`pro`**. The paywall works out "Save ~X%" from the real store prices and only
shows it when it's a real saving: $49.99 vs 3 × $19.99 = $59.97 is about 17%; $89.99/year vs 12 × $19.99 = $239.88 is about 62%.

**Price ladder (October 2026):** monthly was raised from $9.99 to $19.99 so every longer plan costs less per month:
monthly $19.99 > 3-month $16.66/mo > annual $7.50/mo. At $9.99 monthly, three months ($29.97) cost less than the $49.99 pass.

**Why these prices (positioning, kept out of the app itself):**
- **Monthly $19.99:** the flexible "try it" option; still well under the big NCLEX question banks' entry price, and it makes the 3-month pass the better buy.
- **3-month pass $49.99 (most popular):** matches the standard 90-day NCLEX study runway.
- **Annual $89.99:** for candidates whose credentialing or Authorization to Test (ATT) window is delayed.
- **Lifetime $119.00:** a price anchor that carries into new-grad bedside reference use.

The app doesn't name competitors on the paywall; keep comparisons to your own marketing, where you can check the
competitor's current price first.

**Free trial:** every subscription (monthly, 3-month, annual) has a **2-week free trial** set up as an Apple introductory offer (Subscription → Subscription Prices → Introductory Offers → Free, 2 weeks, all countries). Lifetime has no trial. Apple gives one trial per subscription group per Apple ID. The paywall reads the offer from Apple and,
the paywall shows it automatically, only to shoppers the store says are eligible, with the price that follows it.

**Other countries:** enter the U.S. price and let each store convert it, then adjust any country that looks too high.

## What Pro unlocks

| Free | Pro |
|---|---|
| NCLEX Must-Know chapter, the first section of every book chapter, 10 questions per NCLEX topic (about 400 questions) | All 3,200 questions (982 in NGN formats) |
| 1 NGN case study | All 30 NGN case studies |
| Tutor mode | Tutor mode, timed exams and the 75-question NCLEX blueprint exam |
| The book's opening pages and the first page of each chapter | The complete book reader |
| Progress, study plan, bookmarks, missed-question review (of free questions) | Everything, across the full bank |

The free and Pro rules live in one place: the "Free vs Pro" block near the top of `dist/app.js`.

## App Store Connect (iPhone)

1. Create the app with bundle ID `com.alexkorir.rapidnursingreview`.
2. **Monetization → Subscriptions:** create a subscription group named "Rapid Nursing Review Pro", then three subscriptions:
   `com.alexkorir.rapidnursingreview.pro.annual` (1 year), `com.alexkorir.rapidnursingreview.pro.quarterly` (3 months) and
   `com.alexkorir.rapidnursingreview.pro.monthly` (1 month). Order the levels annual, then 3-month, then monthly. Give each a
   display name ("Pro annual", "Pro 3-month pass", "Pro monthly"), a description and a review screenshot of the paywall.
3. **Subscription Prices → Add pricing:** United States $89.99 (annual), $49.99 (3-month) and $19.99 (monthly). Apple fills in other countries.
4. **In-App Purchases → Non-Consumable** `com.alexkorir.rapidnursingreview.pro.lifetime` at $119.00.
5. Add all four to the app version you submit (**App Store → your version → In-App Purchases and Subscriptions**).
6. **App Information:** add the Privacy Policy URL (`docs/PRIVACY.md` in this repo, or your own site) and keep Apple's
   standard EULA as the Terms of Use.
7. **App Privacy:** RevenueCat handles purchases, so declare **Purchases → Purchase History** and **Identifiers → User ID**,
   both used for **App Functionality**, not linked to the user's identity, not used for tracking. Everything else: not collected.

## Google Play Console (Android)

1. Create the app with package `com.alexkorir.rapidnursingreview`.
2. **Monetize → Products → Subscriptions:** create `rnr_pro` with three base plans: `quarterly` (auto-renewing, 3 months,
   $49.99), `monthly` (auto-renewing, 1 month, $9.99) and `annual` (auto-renewing, 1 year, $89.99). Activate all three.
3. **In-app products:** `rnr_pro_lifetime` at $119.00. Activate it.
4. **Data safety:** purchase history and an app user ID are collected for app functionality (by Google Play billing and
   RevenueCat), not shared, not used for ads.
5. Google only lets you create products after an app bundle has been uploaded once. Upload the first production build
   (`eas build -p android --profile production`) to an internal testing track, then create the products.

## RevenueCat

1. Create a project "Rapid Nursing Review" and add two apps: **App Store** (bundle ID above, plus an App Store Connect
   In-App Purchase key) and **Play Store** (package name above, plus a Google service-account JSON with financial access).
2. **Products:** import the four Apple and four Google products.
3. **Entitlement** `pro`: attach all eight products.
4. **Offering** `default` (mark it Current) with four packages (use these exact package types; the paywall reads them):
   - **3 Month** (`$rc_three_month`) → `com.alexkorir.rapidnursingreview.pro.quarterly` / `rnr_pro:quarterly`
   - **Monthly** (`$rc_monthly`) → `com.alexkorir.rapidnursingreview.pro.monthly` / `rnr_pro:monthly`
   - **Annual** (`$rc_annual`) → `com.alexkorir.rapidnursingreview.pro.annual` / `rnr_pro:annual`
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

- Apple Small Business Program (under US$1M a year): Apple keeps 15%, so $19.99 monthly nets about $16.99, the $49.99
  3-month pass about $42.49, $89.99 annual about $76.49 and the $119.00 lifetime about $101.15. Google Play keeps 15% on subscriptions and on the first US$1M of other sales.
- The full book ships inside the app for Pro members. If the Kindle edition is in KDP Select, check its exclusivity
  terms first; `npm run build:web:preview` builds an app that contains only the preview pages.
