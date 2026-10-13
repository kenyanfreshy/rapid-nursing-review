Set up in-app purchases for my iOS app in this RevenueCat project so my in-app paywall works. Walk me through anything you can't do for me.

APP
- App name: Rapid Nursing Review (NCLEX-RN study app)
- Platform: Apple App Store (iPhone and iPad) only
- Bundle ID: com.alexkorir.rapidnursingreview
- The app uses react-native-purchases (RevenueCat SDK) with the public Apple SDK key (appl_…). It shows its OWN custom paywall, built from the current offering's packages, so I need the offering and packages set up exactly as below. A RevenueCat Paywalls template is optional.

PRODUCTS (App Store Connect → subscription group "Rapid Nursing Review Pro", plus one non-consumable)
1. Monthly — auto-renewable subscription, 1 month, $9.99 USD
   Product ID: com.alexkorir.rapidnursingreview.pro.monthly
   Display name: Pro Monthly
2. 3-Month Pass (MOST POPULAR, pre-selected) — auto-renewable subscription, 3 months, $49.99 USD
   Product ID: com.alexkorir.rapidnursingreview.pro.quarterly
   Display name: Pro 3-Month Pass
3. Annual / Complete Pass — auto-renewable subscription, 1 year, $89.99 USD
   Product ID: com.alexkorir.rapidnursingreview.pro.annual
   Display name: Pro Annual
4. Lifetime Access — non-consumable in-app purchase, one-time, $119.00 USD
   Product ID: com.alexkorir.rapidnursingreview.pro.lifetime
   Display name: Pro Lifetime
Subscription group level order (highest first): Annual, 3-Month, Monthly. Each subscription (monthly, 3-month, annual) has a 2-week FREE TRIAL introductory offer (Free, 2 weeks, all territories). Lifetime has no trial.

ENTITLEMENT
- Identifier: pro  (display name "Rapid Nursing Review Pro")
- Attach all 4 products above. Any one of them unlocks everything.

OFFERING
- Identifier: default — mark it as the CURRENT offering
- Packages (use these exact package types; the app reads them):
  - $rc_monthly     → com.alexkorir.rapidnursingreview.pro.monthly
  - $rc_three_month → com.alexkorir.rapidnursingreview.pro.quarterly
  - $rc_annual      → com.alexkorir.rapidnursingreview.pro.annual
  - $rc_lifetime    → com.alexkorir.rapidnursingreview.pro.lifetime
- Display order on the paywall: 3-Month (Most popular), Monthly, Annual, Lifetime.

PAYWALL COPY (if you also build a RevenueCat paywall)
- Title: Prepare to Pass the NCLEX-RN on Your First Attempt
- Features: All 3,200 NCLEX-style questions · 982 NGN-format items · 30 NGN case studies · NCLEX blueprint exam · Timed exam mode · The complete book · Answers linked to the book
- Plan lines: 3-Month Pass "A full 90-day NCLEX study plan"; Monthly "Cancel anytime"; Annual "$7.50/mo · covers a delayed ATT or credentialing wait" (Save ~25%); Lifetime "One payment · keep it as your bedside reference"
- Button: Unlock Pro Access
- Links: Restore Purchases · Privacy Policy (https://github.com/kenyanfreshy/rapid-nursing-review-public/blob/main/PRIVACY.md) · Terms of Use (Apple standard EULA: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/)

APPLE CONNECTION — please check and tell me what's missing
- App Store Connect In-App Purchase key (.p8, Key ID, Issuer ID) uploaded to RevenueCat
- App Store Server Notifications URL from RevenueCat added in App Store Connect (production and sandbox)
- Paid Apps agreement active; all 4 products "Ready to Submit" with review screenshot and metadata
- Then give me the public Apple SDK key (starts with appl_) to put in my app. Never the secret sk_ key.

TESTING
- I test in TestFlight (Apple sandbox). Confirm the current offering returns all 4 packages and that buying any of them grants the "pro" entitlement.
