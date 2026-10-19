# Google Play Console checklist: Rapid Nursing Review

Branch: `android-play` · Package: `com.alexkorir.rapidnursingreview` (permanent; it must match `app.json`)

## 1. Create app
- App name: **Rapid Nursing Review**
- Default language: **English (United States) – en-US**
- App or game: **App** · Free or paid: **Free** (Pro is sold in-app; a free app can't be changed to paid later)
- Tick all three declarations (Developer Program Policies, Play App Signing, US export laws).

## 2. First build and upload (this has to happen before products can be created)
```bash
cd ~/rapid-nursing-review
git checkout android-play
cd mobile
npm install
node scripts/build-web.mjs
npx eas-cli@latest build --platform android --profile production
```
- If EAS asks to generate a new Android keystore, answer **Yes** (EAS stores it; Google Play App Signing holds the real signing key).
- Download the `.aab` from the EAS build page. In Play Console go to **Test and release → Testing → Internal testing → Create new release**,
  upload the `.aab`, release name `1.0.0 (1)`, and add a note such as "First internal build". Save and roll out to internal testing.
- Under **Internal testing → Testers**, create an email list containing your Gmail address, then open the opt-in link on your Android phone.

## 3. App content (Policy → App content)
| Section | Answer |
|---|---|
| Privacy policy | https://nclexrapidnursingreview.com/privacy.html |
| App access | **All functionality is available without any access restrictions.** There is no login. Pro is an in-app purchase, which Google reviewers test themselves. |
| Ads | **No, my app does not contain ads** |
| Content rating | Email: alexkorirbooks@gmail.com · Category: **Reference, News, or Educational**. Violence, sexuality, profanity, gambling: **No**. Drugs, alcohol or tobacco: answer **Yes** only if the questionnaire asks about *references* to them. The questions mention medications, alcohol withdrawal and overdose in a clinical teaching context, with no use shown and nothing that encourages it. Users interact or share content: **No**. Shares location: **No**. Digital purchases: **Yes**. |
| Target audience | **18 and over** only. "Appeal to children": **No**. |
| News app | **No** |
| Government app | **No** |
| Financial features | **My app doesn't provide any financial features** |
| Health | Choose **Medical reference and education** (nursing exam preparation). Don't tick any device, diagnosis or treatment features. |
| Advertising ID | **No**. The build blocks `AD_ID`. |
| Data safety | See section 4 |

## 4. Data safety
- Does your app collect or share any of the required user data types? **Yes**
- Is all user data encrypted in transit? **Yes**
- Do you provide a way for users to request that their data is deleted? **Yes**, by email to alexkorirbooks@gmail.com. Study data can also be deleted in the app (Settings → Reset data).
- Account creation: **My app does not allow users to create an account**

| Data type | Collected | Shared | Optional? | Purpose |
|---|---|---|---|---|
| Financial info → **Purchase history** | Yes | No | Required | App functionality |
| Device or other IDs (RevenueCat anonymous app user ID) | Yes | No | Required | App functionality |

Everything else: **not collected**. Study progress, bookmarks, the name a user enters, reminders and calendar events stay on the device and are never sent anywhere, so Google doesn't count them as collected.
RevenueCat and Google Play Billing act as service providers, which Google doesn't count as "sharing". Processed ephemerally: **No**.

## 5. Store listing (Grow users → Store presence → Main store listing)
- App name: **Rapid Nursing Review**
- Short description (80 max): `3,200 NCLEX-style questions and 30 NGN case studies with full rationales.`
- Full description: copy from `STORE_LISTING.md`. The NCLEX trademark line at the end must stay.
- App icon: `Google Play Assets/icon-512.png` (512×512)
- Feature graphic: `Google Play Assets/feature-graphic-1024x500.png`
- Phone screenshots: `Google Play Assets/phone/` (8 images, 1080×2160)
- 7-inch tablet screenshots: `Google Play Assets/tablet-7in/` · 10-inch tablet screenshots: `Google Play Assets/tablet-10in/`
- **Store settings:** category **Education**; tags: Education, Test preparation; contact email alexkorirbooks@gmail.com; website https://www.amazon.com/stores/Alex-K-Korir/author/B0FCCVTDG3

## 6. Products (Monetize with Play → Products), available once the first build is uploaded
**Subscriptions → Create subscription:** product ID `rnr_pro`, name "Rapid Nursing Review Pro". Add three base plans, set the U.S. price, let Google convert the other countries, then activate:

| Base plan ID | Type | Billing period | Price |
|---|---|---|---|
| `monthly` | Auto-renewing | 1 month | $19.99 |
| `quarterly` | Auto-renewing | 3 months | $49.99 |
| `annual` | Auto-renewing | 1 year | $89.99 |

On each base plan, **Add offer**: offer ID `trial-2w`, eligibility **New customer acquisition → Never had this subscription**, phase **Free trial, 2 weeks**. Activate it.

**One-time products → Create:** product ID `rnr_pro_lifetime`, name "Lifetime Access", $119.00. Activate it.

**Payments profile:** set up a merchant account (Settings → Payments profile) before you can sell anything. Also complete the tax and banking details.

## 7. RevenueCat (Android app)
1. In Google Cloud, create a service account and add it in Play Console under **Users and permissions** with *View financial data* and *Manage orders and subscriptions*. Download its JSON key. It can take up to 36 hours to start working.
2. In RevenueCat, open project **Rapid Nursing Review** and choose **Add app → Play Store**. Enter package `com.alexkorir.rapidnursingreview` and upload the JSON.
3. Import `rnr_pro:monthly`, `rnr_pro:quarterly`, `rnr_pro:annual` and `rnr_pro_lifetime`. Attach all four to entitlement **`pro`**, and add them to the **default** offering's packages next to the Apple products (`$rc_monthly`, `$rc_three_month`, `$rc_annual`, `$rc_lifetime`).
4. Copy the public **`goog_…`** key into `mobile/app.json` → `expo.extra.revenueCatGoogleKey`, then commit and rebuild. Never put an `sk_` secret key in the app.
5. Keep the service-account JSON out of git. If you want `eas submit`, save it as `mobile/google-play-service-account.json`; that path is already in `.gitignore`.

## 8. Testing and going live
- **License testing:** go to Settings → License testing and add your Gmail. Test purchases are then free, and subscriptions renew every few minutes.
- **New personal developer accounts:** before you can apply for production access, you need a **closed test with at least 12 testers opted in for 14 days in a row**. Create it under Testing → Closed testing, add a Google Group or email list, and share the opt-in link with classmates or colleagues.
- After the 14 days: go to Dashboard → **Apply for production**, answer the questions about the test, then create a production release from the same build and send it for review.
- Later builds: run `npx eas-cli@latest build -p android --profile production`, then `npx eas-cli@latest submit -p android --latest`. This uploads a draft to internal testing; promote it in Play Console.
