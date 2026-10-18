# Rapid Nursing Review: sync and web app setup (Apple first)

What this adds:
- **Settings → Sync and web access** on the iPhone, at the very top. It's optional: Sign in with Apple syncs progress, and
  without it the app works exactly as before.
- **https://nclexrapidnursingreview.com/app/**, the same app in a web browser, for Pro subscribers only. The web app sells
  nothing.
- **Book protection:**
  - On the iPhone, screenshots and screen recording are blocked while a book page is open.
  - On the web, pages come from the server one at a time and are drawn on a canvas watermarked with the account. Each
    account can open at most 120 pages per hour and 400 per day.

Addresses:
- `nclexrapidnursingreview.com` is the website: landing page, privacy, terms and support.
- `nclexrapidnursingreview.com/app/` is the web app.
- `ccrn.rapidnursingreview.com` is the CCRN site. Nothing here touches it.

## Security rules (always)

- **Never paste secret keys into chat or into a file in this repo.** Keep these out of the app and out of git:
  - the RevenueCat secret key (`sk_…`)
  - the Supabase secret / `service_role` key
  - the Apple `.p8` file
  - the Apple client secret (JWT)

  You type secrets only in Terminal with `read -s`, and they go straight into Supabase.
- Only public values go in the app: the RevenueCat `appl_…` key (already there), and the Supabase project URL and
  **publishable** key.
- `build/webapp-private/` holds the question bank and book pages. It's git-ignored. Upload it only to Supabase Storage.
- The app repo stays **private**. The website is published from its own branch, **`gh-pages`**, which holds only the
  website files (no questions, no book pages). Never point GitHub Pages at `main`: `main` contains the book pages.

---

## Who does what

**You do (accounts and dashboards):**
1. Supabase: create the project, run the SQL, set up Apple sign-in and the URLs.
2. Apple Developer: App ID capability, Services ID, Sign in with Apple key.
3. RevenueCat: copy the secret key (only into Terminal, step C).
4. GitHub: turn on Pages for the `gh-pages` branch of the app repo (needs GitHub Pro; see section 5).
5. Cloudflare: already done (DNS only for `@` and `www`).
6. App Store Connect: version 1.1.0 text, privacy labels and review notes (`mobile/APP_STORE_1.1.md`).

**Claude does:**
- All code, tests and builds (branch `web-sync`).
- Putting your Supabase URL and publishable key into `dist/config.js`, then rebuilding the phone and web bundles.
- Publishing the website files to the `gh-pages` branch of `kenyanfreshy/rapid-nursing-review` (website only).

---

## 1. Supabase project (supabase.com, in the browser)

1. **New project**, named `rapid-nursing-review`. This must be a new project, not the CCRN one. Region: US East (or
   nearest). Save the database password in your password manager.
2. **Project Settings → Data API:** confirm "Automatically expose new tables" is **off** (the SQL grants access
   explicitly).
3. **SQL Editor → New query:** paste all of `backend/supabase.sql` and click **Run**. Success: "Success. No rows returned".
4. **Project Settings → API Keys:** copy the **Project URL** (`https://<ref>.supabase.co`) and the **Publishable key**
   (`sb_publishable_…`) and send both to Claude. They're public by design. **Never** send the secret key.
5. **Authentication → URL Configuration:**
   - Site URL: `https://nclexrapidnursingreview.com/app/`
   - Redirect URLs: add `https://nclexrapidnursingreview.com/app/` and `https://nclexrapidnursingreview.com/app/**`

   Without these, sign-in returns to `localhost:3000`.

## 2. Apple Developer (developer.apple.com → Certificates, Identifiers & Profiles)

1. **Identifiers → App IDs → `com.alexkorir.rapidnursingreview`:** tick **Sign in with Apple** and Save. EAS also does
   this on the next build, but doing it now avoids surprises.
2. **Identifiers → + → Services IDs:**
   - Description: `Rapid Nursing Review Web`
   - Identifier: `com.alexkorir.rnr.web`
   - Register it, open it, tick **Sign in with Apple** and click **Configure**:
     - Primary App ID: `com.alexkorir.rapidnursingreview`
     - Domains: `<ref>.supabase.co`
     - Return URLs: `https://<ref>.supabase.co/auth/v1/callback`
   - Save, Continue, Save.
3. **Keys → +:**
   - Name: `RNR Sign in with Apple`
   - Tick **Sign in with Apple**, click Configure and pick the primary App ID above.
   - Register it and **download the .p8 file** (Apple allows this only once).
   - Note the **Key ID**, and your **Team ID** (top right of the page).
4. The Supabase Apple provider needs the secret made in **Terminal step D** below.

## 3. Terminal on your MacBook, one block at a time

Run every block from the folder named on its first line. If any step doesn't show what "Success" describes, stop and
send Claude a screenshot.

### Block A: get the code (first time only)
```bash
cd ~/Documents/"Rapid Nursing Review App"
git clone -b web-sync https://github.com/kenyanfreshy/rapid-nursing-review.git rnr-web-sync
cd rnr-web-sync
git log -1 --oneline
```
**Success:** the last line shows a commit on `web-sync`. If git asks for a password, run `brew install gh && gh auth login`
once, then repeat the block.

Later updates use this instead:
```bash
cd ~/Documents/"Rapid Nursing Review App"/rnr-web-sync && git pull
```

### Block B: sign in to Supabase and link the project
```bash
cd ~/Documents/"Rapid Nursing Review App"/rnr-web-sync
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```
Replace `YOUR_PROJECT_REF` with the `<ref>` part of your Project URL.

**Success:** "Finished supabase link." It may ask for the database password from step 1.1.

### Block C: the RevenueCat secret key (typed, never shown)
In RevenueCat, go to Project settings → API keys → **Secret API keys** and copy the key. Copy the real key, not the
masked `sk_••••` text.
```bash
cd ~/Documents/"Rapid Nursing Review App"/rnr-web-sync
read -s RC_KEY
npx supabase secrets set RC_SECRET_KEY="$RC_KEY" RC_ENTITLEMENT=pro
unset RC_KEY
npx supabase secrets list
```
After `read -s RC_KEY`, paste the key and press Return. Nothing appears on screen; that's expected.

**Success:** the list shows `RC_SECRET_KEY` and `RC_ENTITLEMENT`, with digests only, never the key itself.

### Block D: Apple client secret for the web (valid 180 days)
```bash
cd ~/Documents/"Rapid Nursing Review App"/rnr-web-sync
node backend/apple-secret.mjs YOUR_TEAM_ID YOUR_KEY_ID ~/Downloads/AuthKey_YOUR_KEY_ID.p8 com.alexkorir.rnr.web | pbcopy
```
**Success:** it prints "Apple client secret … valid until <date>", and the secret is now on your clipboard. It is not
shown on screen.

Then in Supabase, go to **Authentication → Sign In / Providers → Apple → Enable**:
- **Client IDs:** `com.alexkorir.rapidnursingreview,com.alexkorir.rnr.web`
- **Secret Key (for OAuth):** paste with ⌘V
- Save.

Then move the `.p8` file out of Downloads into a safe folder (not the repo).

**Set a calendar reminder for 5 months from today** to run Block D again. Apple's secret expires after 180 days; when it
does, web sign-in stops until you renew it. The iPhone sign-in isn't affected.

### Block E: deploy the two server functions
```bash
cd ~/Documents/"Rapid Nursing Review App"/rnr-web-sync
npx supabase functions deploy entitlement --no-verify-jwt
npx supabase functions deploy book-page --no-verify-jwt
```
**Success:** "Deployed Functions … entitlement" and "… book-page". The `--no-verify-jwt` flag is required: the functions
check sign-in themselves, and without the flag the browser only shows "Load failed".

### Block F: build the web app and upload the private files
```bash
cd ~/Documents/"Rapid Nursing Review App"/rnr-web-sync
node scripts/build-webapp.mjs
npx supabase storage cp build/webapp-private/content/content.json ss:///content/content.json --experimental
npx supabase storage cp -r build/webapp-private/book/rnr ss:///book/rnr --experimental
npx supabase storage ls ss:///book/rnr/pages/ --experimental | head -3
```
**Success:**
- The build prints `Private build/webapp-private: content/content.json (… KB), 196 book pages`.
- The last command lists `p001.webp`, `p002.webp`, `p003.webp`.
- If the list shows `rnr/` inside `rnr/` instead, tell Claude before going on.

## 4. Claude turns it on (after you send the Project URL and publishable key)

Claude:
- puts the two public values in `dist/config.js` and sets `appleSignIn: true` once Block D is done
- rebuilds `mobile/assets/web` (marker `RNR-WEB-BUILD sync-v1`) and the web app
- publishes the website to the `gh-pages` branch of `kenyanfreshy/rapid-nursing-review`

## 5. GitHub Pages (app repo, in the browser)

GitHub Pages on a **private** repo needs a paid GitHub plan (GitHub Pro, about $4/month). The website itself is still
public, which is what you want for the landing page, the policies and the sign-in page.

1. github.com/kenyanfreshy/rapid-nursing-review → **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: **gh-pages**, folder **/ (root)**. Never pick `main`: it contains the book pages.
   - Save.

   If GitHub shows "Upgrade or make this repository public", the account needs GitHub Pro first. Don't make the repo
   public.
2. **Custom domain:** `nclexrapidnursingreview.com`, then Save. Wait for the DNS check to turn green, then tick
   **Enforce HTTPS**. That can take up to an hour.
3. Recommended: go to your profile → **Settings → Pages → Add a domain** and verify `nclexrapidnursingreview.com` with
   the TXT record GitHub shows. Add that TXT record in Cloudflare.
4. **Check it works:**
   - Open `https://nclexrapidnursingreview.com/app/` in Safari. It shows the **Sign in with Apple** card.
   - Sign in with a sandbox or real subscriber Apple ID, then check that the app opens and that the book reader shows
     watermarked pages.
5. The old policy links in the live app (`rapid-nursing-review-public/…/PRIVACY.md`) keep working; that repo is untouched.

## 6. iPhone build 1.1.0

### Block G: add the native modules (once)
```bash
cd ~/Documents/"Rapid Nursing Review App"/rnr-web-sync/mobile
npx expo install expo-apple-authentication expo-crypto expo-screen-capture
grep -c "expo-apple-authentication\|expo-crypto\|expo-screen-capture" package.json
```
**Success:** the last line prints `3`.

### Block H: check before you build
```bash
cd ~/Documents/"Rapid Nursing Review App"/rnr-web-sync/mobile
node scripts/build-web.mjs
grep -c "RNR-WEB-BUILD sync-v1" assets/web/index.html
grep -c "REPLACE_ME" assets/web/index.html
npx eas project:info
```
**Success:**
- The first `grep` prints `1`.
- The second prints `0`. If it doesn't, Claude hasn't put the Supabase values in yet; stop.
- `project:info` shows **@ronnykip/rapid-nursing-review** with ID **ffa76c48-2211-4a0f-b275-c9631d8cc0b7**.

If EAS offers to create a new project, answer **No** and stop.

### Block I: build and submit
```bash
cd ~/Documents/"Rapid Nursing Review App"/rnr-web-sync/mobile
git add -A && git commit -m "1.1.0: native modules for Sign in with Apple" && git push
npx eas build --platform ios --profile production
npx eas submit --platform ios --latest
```
**Success:** the build finishes on expo.dev, and the submit step says the build was uploaded to App Store Connect.

## 7. App Store Connect

Use `mobile/APP_STORE_1.1.md`:
- What's New
- the description paragraph
- URLs
- the **App Privacy** changes (Email Address, Name, User ID, Other User Content, Customer Support, Purchases: App
  Functionality, linked to the user, not tracking)
- the **App Review notes** (sign-in is optional, where it is, how to delete the account, how to test the web version, no
  purchases on the web)

Also upload the new App Store screenshots, if you're sending them with this version.

## Troubleshooting

Errors on the web name the step that failed:

| Message | Fix |
|---|---|
| "Couldn't reach the subscription check" | Function not deployed (Block E) or network. |
| "Server setup: RC_SECRET_KEY is missing or has extra characters" | Repeat Block C with the full `sk_` key. |
| "We couldn't find an active … subscription" | On the iPhone: Restore Purchases, then Sign in with Apple in Settings with the same Apple ID. |
| Sign-in goes to `localhost:3000` | Step 1.5, the URL Configuration. |
| "Sign-in didn't finish: …" | Check the Services ID return URL, and that both Client IDs are in Supabase's Apple provider. |
| "Page not found. Were the book pages uploaded…" | Repeat Block F. |
