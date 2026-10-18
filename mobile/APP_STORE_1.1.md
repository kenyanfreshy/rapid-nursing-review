# App Store Connect: version 1.1.0 (Sign in with Apple, sync and web access)

Paste-ready text. Submit only after the steps in `WEB_APP_SETUP.md` are done and the web app works.

## What's New in This Version

```
• Sync and web access (optional): Sign in with Apple in Settings to keep your progress in sync and to study on your Mac or any computer at nclexrapidnursingreview.com/app with your Pro subscription.
• Everything still works offline without an account.
• Delete your account anytime in Settings.
• Book pages are now protected from screenshots and screen recording while they're open.
```

## Description: add this paragraph (before the subscription details)

```
STUDY ON YOUR COMPUTER TOO
Pro subscribers can also study in a web browser on a Mac or any computer at nclexrapidnursingreview.com/app. Sign in with Apple once in Settings → Sync and web access, and your answers, sessions, bookmarks and study plan sync between your iPhone and your computer. Signing in is optional: without it, everything stays on your iPhone and works offline.
```

## URLs (App Information)

- Privacy Policy URL: `https://nclexrapidnursingreview.com/privacy.html`
- Support URL: `https://nclexrapidnursingreview.com/support.html`
- Marketing URL (optional): `https://nclexrapidnursingreview.com/`
- Terms of Use: Apple's standard EULA (unchanged); also linked at `https://nclexrapidnursingreview.com/terms.html`

## App Privacy (Data Types): update before submitting

Change the answers so they cover the optional account. For every type below, answer **Used for: App Functionality**,
**Linked to the user's identity: Yes**, **Used for tracking: No**.

| Category | Data type | Why |
|---|---|---|
| Contact Info | **Email Address** | Apple shares an email or private relay address at sign-in |
| Contact Info | **Name** | Apple may share a name at sign-in; the learner can also enter a first name, which syncs |
| Identifiers | **User ID** | Supabase account ID; also the RevenueCat app user ID after sign-in |
| User Content | **Other User Content** | Synced study progress (answers, sessions, bookmarks, study plan) |
| User Content | **Customer Support** | Question reports sent to the author |
| Purchases | **Purchase History** | RevenueCat, to unlock Pro on the phone and confirm it on the web |

Everything else: **Not collected**. No tracking, no advertising, no third-party analytics.

## App Review Information: Notes

```
Sign in with Apple is OPTIONAL. The app works fully without an account, offline, as before.

Where it is: Settings (top-right avatar) → the first card, "Sync and web access" → Sign in with Apple.
What it does: syncs study progress between the user's devices and lets existing Pro subscribers use the same content in a web browser at https://nclexrapidnursingreview.com/app/ with the same Apple ID.

Purchases never require an account. Pro is sold only in the app through In-App Purchase. The web app sells nothing, shows no prices and has no links to outside payment; a web visitor without an active subscription is told to subscribe in the iPhone app.

Account deletion (Guideline 5.1.1(v)): Settings → Sync and web access → Delete account → type DELETE → Delete account. This permanently deletes the account and its synced data on our server. It is also available in the web app.

To test the web version: buy any Pro plan with the sandbox account in the app, tap Sign in with Apple in Settings, then open https://nclexrapidnursingreview.com/app/ in Safari on a Mac and sign in with the same Apple ID. Progress made on either device appears on the other after a few seconds (or tap Sync now).

Screenshots and screen recording are blocked only while a book page is open (to protect the author's book); they work everywhere else in the app.

Contact: Alex K. Korir, alexkorirbooks@gmail.com
```

## In-App Purchases

No changes: the same four products (monthly, 3-month, annual, lifetime) and entitlement `pro`.
