// Purchase-logic tests for Rapid Nursing Review (ported from NurseBound). Run from the repo root:
//   node tests/purchases_test.mjs
// Covers mobile/membership.js, mobile/scripts/check-release.mjs, and what the web layer / app bundle promise.
// The two non-.mjs modules are bundled with esbuild (ESBUILD=path to override). CustomerInfo objects use the
// field names of react-native-purchases 10.x; server objects use RevenueCat REST v1 field names.
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync } from "node:fs";

const ES = process.env.ESBUILD || "esbuild";
const dir = mkdtempSync(join(tmpdir(), "nb-tests-"));
const bundle = (src, name) => { const out = join(dir, name); execFileSync(ES, [src, "--bundle", "--format=esm", "--platform=node", `--outfile=${out}`, "--log-level=error"]); return import(out); };
const M = await bundle("mobile/membership.js", "membership.mjs");
const R = await import("../mobile/scripts/check-release.mjs");

let pass = 0, fail = 0;
const check = (name, ok) => { ok ? pass++ : fail++; console.log((ok ? "PASS " : "FAIL ") + name); };
const DAY = 864e5, now = Date.parse("2026-10-29T12:00:00Z"), iso = (t) => new Date(t).toISOString();

// ---------- app: CustomerInfo → membership ----------
const LIFE = "com.alexkorir.rapidnursingreview.pro.lifetime";   // Rico: iOS id; Android: rnr_pro_lifetime
const ent = (o) => ({ identifier: "pro", isActive: true, willRenew: false, periodType: "NORMAL", productIdentifier: LIFE, expirationDate: null, isSandbox: false, store: "PLAY_STORE", ...o });
const info = (o = {}) => ({ entitlements: { active: {}, all: {} }, activeSubscriptions: [], allExpirationDates: {}, nonSubscriptionTransactions: [], managementURL: null, ...o });
const read = (i) => M.readMembership(i, { entitlementId: "pro", now });

const lifetimeOnly = info({ entitlements: { active: { pro: ent() } }, nonSubscriptionTransactions: [{ productIdentifier: LIFE }] });
let m = read(lifetimeOnly);
check("lifetime purchase grants Pro", !!m && m.lifetime === true && m.expires === null && m.overlap === null);
check("lifetime restore on another device (same CustomerInfo) grants Pro", !!read(JSON.parse(JSON.stringify(lifetimeOnly))));

const subId = "rnr_pro:monthly";
const both = (subOver = {}, by) => info({
  entitlements: { active: { pro: ent() } },
  activeSubscriptions: [subId], allExpirationDates: { [subId]: iso(now + 20 * DAY) },
  nonSubscriptionTransactions: [{ productIdentifier: LIFE }],
  ...(by ? { subscriptionsByProductIdentifier: by } : {}), ...subOver,
});
m = read(both());
check("subscription then lifetime: pass shown and running subscription flagged", m.lifetime && m.overlap && m.overlap.productIds[0] === subId);
check("…renewal unknown on SDKs without subscriptionsByProductIdentifier (says 'may still renew')", m.overlap.willRenew === null);
m = read(both({}, { [subId]: { willRenew: true, expiresDate: iso(now + 20 * DAY), store: "PLAY_STORE" } }));
check("…renewal reported when the SDK says it will renew", m.overlap.willRenew === true);
m = read(both({}, { rnr_pro: { willRenew: false, expiresDate: iso(now + 20 * DAY) } }));
check("…canceled subscription read via Play base id key", m.overlap.willRenew === false && m.overlap.expires === iso(now + 20 * DAY));
m = read(both({}, { [subId]: { isActive: false, willRenew: true, expiresDate: iso(now + 20 * DAY) } }));
check("SDK says the subscription isn't active (isActive=false) → no overlap warning", m.lifetime && m.overlap === null);
m = read(both({}, { [subId]: { isActive: true, willRenew: false, expiresDate: iso(now + 20 * DAY), refundedAt: iso(now - DAY) } }));
check("refunded subscription (refundedAt) → no overlap warning", m.lifetime && m.overlap === null);
m = read(both({ allExpirationDates: { [subId]: iso(now - DAY) } }, { [subId]: { isActive: true, willRenew: true, expiresDate: iso(now - DAY), gracePeriodExpiresDate: iso(now + 5 * DAY) } }));
check("subscription in a billing grace period (isActive=true, expiry passed) still flagged as possibly billing", m.lifetime && m.overlap && m.overlap.willRenew === true);
m = read(both({ allExpirationDates: { [subId]: iso(now - DAY) } }));
check("subscription expired while lifetime remains: Pro stays, no overlap", m.lifetime && m.overlap === null);
m = read(both({ activeSubscriptions: [] }));
check("subscription refunded while lifetime remains: Pro stays, no overlap", m.lifetime && m.overlap === null);

const subEnt = ent({ productIdentifier: subId, expirationDate: iso(now + 20 * DAY), willRenew: true });
m = read(info({ entitlements: { active: { pro: subEnt } }, activeSubscriptions: [subId], nonSubscriptionTransactions: [{ productIdentifier: LIFE }] }));
check("lifetime refunded while subscription remains: Pro via subscription, NOT shown as pass", m && m.lifetime === false && m.expires && m.overlap === null);
check("…then subscription expires: no Pro even though the pass is in purchase history",
  read(info({ entitlements: { active: {} }, nonSubscriptionTransactions: [{ productIdentifier: LIFE }] })) === null);
check("purchase history alone never grants Pro", read(info({ nonSubscriptionTransactions: [{ productIdentifier: LIFE }], allPurchasedProductIdentifiers: [LIFE] })) === null);
check("another active entitlement still unlocks (existing customers keep access)", !!read(info({ entitlements: { active: { other_name: ent({ identifier: "other_name" }) } } })));
check("the inactive rapid_nursing_review_pro entitlement (Rico) grants nothing on its own", read(info({ entitlements: { active: {}, all: { rapid_nursing_review_pro: ent({ isActive: false }) } } })) === null);
m = read(info({ entitlements: { active: { pro: ent({ periodType: "TRIAL", expirationDate: iso(now + 10 * DAY), willRenew: true, productIdentifier: subId }) } } }));
check("trial membership reported as trial", m.trial && m.willRenew && !m.lifetime);

// ---------- stale responses ----------
const g = M.createResponseGate();
const startup = g.ticket();            // startup getCustomerInfo begins
const purchase = g.ticket();           // purchase finishes first
check("newer answer (purchase) applies", g.accept(purchase));
check("older startup answer arriving later is dropped", !g.accept(startup));
check("later listener update applies", g.accept(g.ticket()));
const signOut = g.ticket(); const lateSignIn = signOut - 1;
check("account switch: late answer for the previous account is dropped", g.accept(signOut) && !g.accept(lateSignIn));

// ---------- key selection at runtime ----------
const extra = { revenueCatAppleKey: "appl_" + "a".repeat(27), revenueCatGoogleKey: "goog_" + "b".repeat(27), revenueCatTestKey: "test_" + "c".repeat(27), useTestStore: false };
check("iOS store build uses the Apple key", M.chooseKey({ os: "ios", dev: false, extra }).key === extra.revenueCatAppleKey);
check("Android store build uses the Google key", M.chooseKey({ os: "android", dev: false, extra }).key === extra.revenueCatGoogleKey);
check("placeholder Google key → store disconnected", M.chooseKey({ os: "android", dev: false, extra: { ...extra, revenueCatGoogleKey: "goog_REPLACE_ME" } }).problem === "missing");
check("Test Store key in a store build is refused", M.chooseKey({ os: "android", dev: false, extra: { ...extra, revenueCatGoogleKey: extra.revenueCatTestKey } }).problem === "test-store-key-in-store-build");
check("useTestStore ignored outside dev builds", M.chooseKey({ os: "ios", dev: false, extra: { ...extra, useTestStore: true } }).key === extra.revenueCatAppleKey);
check("Apple key in the Android build is refused", M.chooseKey({ os: "android", dev: false, extra: { ...extra, revenueCatGoogleKey: extra.revenueCatAppleKey } }).problem === "wrong-platform-key");
check("dev build may use the Test Store when asked", M.chooseKey({ os: "android", dev: true, extra: { ...extra, useTestStore: true } }).key === extra.revenueCatTestKey);

// ---------- purchase errors: never claim "no charge" when it's uncertain ----------
const ERRC = { PURCHASE_CANCELLED_ERROR: "1", STORE_PROBLEM_ERROR: "2", PURCHASE_NOT_ALLOWED_ERROR: "3", PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR: "5", PRODUCT_ALREADY_PURCHASED_ERROR: "6", NETWORK_ERROR: "10", PAYMENT_PENDING_ERROR: "20" };
const kind = (e) => M.classifyPurchaseError(e, ERRC).kind;
check("purchase error: user cancel → cancelled", kind({ userCancelled: true }) === "cancelled" && kind({ code: "1" }) === "cancelled");
check("purchase error: pending payment → pending", kind({ code: "20" }) === "pending");
check("purchase error: already owned → restore", kind({ code: "6" }) === "already-owned");
check("purchase error: network drop → uncertain (reconcile first)", kind({ code: "10" }) === "uncertain");
check("purchase error: store problem → uncertain (was: 'You haven't been charged')", kind({ code: "2" }) === "uncertain");
check("purchase error: unknown error → uncertain", kind(new Error("boom")) === "uncertain" && kind(null) === "uncertain");
check("purchase error: product not available (e.g. missing Play Lifetime) → not-available", kind({ code: "5" }) === "not-available");
check("uncertain message points to Restore and never claims no charge", !/haven't been charged/i.test(M.uncertainPurchaseMessage("Google Play")) && /Restore Purchases/.test(M.uncertainPurchaseMessage("Google Play")));
check("mobile/pro.js no longer says \"you haven't been charged\" anywhere", !/haven't been charged/i.test(readFileSync("mobile/pro.js", "utf8")));

// ---------- purchase verification: the intended plan, not just "has Pro" ----------
const lifePkg = { packageType: "LIFETIME", product: { identifier: LIFE } };
const monthlyPkg = { packageType: "MONTHLY", product: { identifier: "rnr_pro:monthly" } };
const annualPkg = { packageType: "ANNUAL", product: { identifier: "rnr_pro:annual" } };
const iosMonthlyPkg = { packageType: "MONTHLY", product: { identifier: "com.alexkorir.rapidnursingreview.pro.monthly" } };
const subscriberOnly = info({ entitlements: { active: { pro: ent({ productIdentifier: subId, expirationDate: iso(now + 20 * DAY), willRenew: true }) } },
  activeSubscriptions: [subId], allExpirationDates: { [subId]: iso(now + 20 * DAY) } });
const V = (i, pkg) => M.purchaseVerified(i, pkg, { entitlementId: "pro", now });
check("active subscriber, lifetime purchase failed/uncertain: existing Pro is NOT success", !!read(subscriberOnly) && V(subscriberOnly, lifePkg) === false);
check("active subscriber, lifetime purchase verified once the entitlement is non-expiring", V(both(), lifePkg) === true);
check("subscription purchase verified by its own product id", V(subscriberOnly, monthlyPkg) === true);
check("a different base plan of the same Play subscription doesn't verify (monthly active ≠ annual bought)", V(subscriberOnly, annualPkg) === false);
check("iOS product id verifies against iOS active subscription", V(info({ entitlements: { active: { pro: ent({ productIdentifier: "com.alexkorir.rapidnursingreview.pro.monthly", expirationDate: iso(now + 9 * DAY) }) } }, activeSubscriptions: ["com.alexkorir.rapidnursingreview.pro.monthly"] }), iosMonthlyPkg) === true);
check("lifetime owner whose monthly purchase is uncertain: pass ownership is not proof of the monthly", V(lifetimeOnly, monthlyPkg) === false);
check("no Pro at all → nothing verified", V(info(), lifePkg) === false && V(info(), monthlyPkg) === false);
// Pre-attempt snapshot and timing (what the paywall holds when the user taps buy).
const start = now - 60 * 1000;
const subPlusLifeReportedAsSub = info({ entitlements: { active: { pro: ent({ productIdentifier: subId, expirationDate: iso(now + 20 * DAY), willRenew: true }) } },
  activeSubscriptions: [subId], allExpirationDates: { [subId]: iso(now + 20 * DAY) }, nonSubscriptionTransactions: [{ productIdentifier: LIFE, purchaseDate: iso(now) }] });
const W = (i, pkg, o) => M.purchaseVerified(i, pkg, { entitlementId: "pro", now, ...o });
check("subscriber → lifetime FAILED: post-attempt state = pre-attempt state → not success", W(subscriberOnly, lifePkg, { before: subscriberOnly, startedAt: start }) === false);
check("subscriber → lifetime UNCERTAIN, reconcile shows only the old pass transaction (before the attempt) → not success",
  W(info({ ...subscriberOnly, nonSubscriptionTransactions: [{ productIdentifier: LIFE, purchaseDate: iso(now - 400 * DAY) }] }), lifePkg, { before: subscriberOnly, startedAt: start }) === false);
check("subscriber → lifetime SUCCEEDED, RevenueCat still shows the subscription's date: new pass transaction after the attempt → success",
  W(subPlusLifeReportedAsSub, lifePkg, { before: subscriberOnly, startedAt: start }) === true);
check("subscriber → lifetime SUCCEEDED, entitlement now non-expiring → success", W(both(), lifePkg, { before: subscriberOnly, startedAt: start }) === true);
check("a pass transaction after the attempt never verifies without an active entitlement (refunded/revoked)",
  W(info({ nonSubscriptionTransactions: [{ productIdentifier: LIFE, purchaseDate: iso(now) }] }), lifePkg, { before: info(), startedAt: start }) === false);
check("plan already in effect before the attempt → can't attribute success to this attempt", W(both(), lifePkg, { before: both(), startedAt: start }) === false);
check("monthly bought while holding the pass: monthly now active and wasn't before → success", W(both(), { packageType: "MONTHLY", product: { identifier: subId } }, { before: lifetimeOnly, startedAt: start }) === true);
const pro = readFileSync("mobile/pro.js", "utf8");
check("pro.js: every success path is gated by purchase verification (purchase result, reconcile, already-owned)",
  (pro.match(/if \(verified\(/g) || []).length === 2 && (pro.match(/if \(purchaseVerified\(/g) || []).length === 1 && !/if \(m\) return \{ ok: true/.test(pro));

// ---------- release check ----------
const reg = { app: "Rapid Nursing Review", expected: { ios: R.fingerprint(extra.revenueCatAppleKey) }, otherApps: { other: [R.fingerprint("goog_" + "z".repeat(27))] }, entitlement: { field: "entitlementId", expected: ["pro"] } };
const ok = { ...extra, entitlementId: "pro" };
check("release: good iOS config passes", R.checkPlatform("ios", ok, reg).errors.length === 0);
check("release: placeholder Android key fails", R.checkPlatform("android", { ...ok, revenueCatGoogleKey: "goog_REPLACE_ME" }, reg).errors.some((e) => /placeholder/.test(e)));
check("release: Test Store key fails", R.checkPlatform("android", { ...ok, revenueCatGoogleKey: ok.revenueCatTestKey }, reg).errors.some((e) => /Test Store/.test(e)));
check("release: useTestStore true fails", R.checkPlatform("ios", { ...ok, useTestStore: true }, reg).errors.some((e) => /useTestStore/.test(e)));
check("release: wrong-platform key fails", R.checkPlatform("ios", { ...ok, revenueCatAppleKey: ok.revenueCatGoogleKey }, reg).errors.some((e) => /Apple/.test(e)));
check("release: another app's key fails", R.checkPlatform("android", { ...ok, revenueCatGoogleKey: "goog_" + "z".repeat(27) }, reg).errors.some((e) => /another app/.test(e)));
check("release: key differing from the recorded fingerprint fails", R.checkPlatform("ios", { ...ok, revenueCatAppleKey: "appl_" + "q".repeat(27) }, reg).errors.some((e) => /doesn't match/.test(e)));
check("release: wrong entitlement id fails", R.checkPlatform("ios", { ...ok, entitlementId: "rapid_nursing_review_pro" }, reg).errors.some((e) => /entitlementId/.test(e)));
const unconf = { ...reg, expected: { ios: { fingerprint: R.fingerprint(extra.revenueCatAppleKey), source: "an audit report", confirmed: false } } };
let rr = R.checkPlatform("ios", ok, unconf);
check("release: unconfirmed fingerprint match passes but is NOT called verified", rr.errors.length === 0 && /^NOT verified/.test(rr.identity) && rr.warnings.some((w) => /not confirmed/.test(w)));
rr = R.checkPlatform("ios", ok, { ...reg, expected: { ios: { fingerprint: R.fingerprint(extra.revenueCatAppleKey), source: "RevenueCat dashboard", confirmed: true } } });
check("release: confirmed fingerprint match is reported as verified", rr.errors.length === 0 && /^verified/.test(rr.identity));
rr = R.checkPlatform("ios", ok, { ...reg, expected: {} });
check("release: no fingerprint → identity NOT verified (warning only by default)", rr.errors.length === 0 && /^NOT verified/.test(rr.identity));
check("release: RC_REQUIRE_CONFIRMED_FINGERPRINT turns missing/unconfirmed identity into a failure",
  R.checkPlatform("ios", ok, { ...reg, expected: {} }, "reg", { requireConfirmed: true }).errors.length === 1 && R.checkPlatform("ios", ok, unconf, "reg", { requireConfirmed: true }).errors.length === 1);
const msgs = JSON.stringify(R.checkPlatform("ios", { ...ok, revenueCatAppleKey: "appl_" + "q".repeat(27) }, reg));
check("release: messages never contain the key value", !msgs.includes("q".repeat(27)));


// ---------- what the app promises (web layer and the bundle the app ships) ----------
const { readFileSync: rf, existsSync } = await import("node:fs");
const web = rf("dist/app.js", "utf8"), bundleHtml = rf("mobile/assets/web/index.html", "utf8");
const TRIAL_CLAIM = /2 weeks free|2-Week Free Trial|Try it free for|free trial, when the trial ends/;
check("web layer (dist/app.js) promises no trial", !TRIAL_CLAIM.test(web.replace(/^\s*const lead = .*$/m, "")));
check("shipped app bundle (mobile/assets/web/index.html) promises no trial", !TRIAL_CLAIM.test(bundleHtml.replace(/^\s*const lead = .*$/m, "")));
check("locked-card Pro gate shows no hard-coded price in the app bundle", /Monthly, 3-month, annual and lifetime plans\. See prices for your country\./.test(bundleHtml) && !/<b>\$\{PRO_PRICES\.monthly\}<\/b> a month/.test(bundleHtml));
const manifest = rf("mobile/assets/web/manifest.js", "utf8");
const { createHash } = await import("node:crypto");
const files = [...manifest.matchAll(/^  '([^']+)': require\(/gm)].map((m) => m[1]);
const hv = createHash("sha256"); for (const f of files) hv.update(f).update(rf("mobile/assets/web/" + f));
check("bundle WEB_VERSION matches its contents (installed apps re-copy the updated web files)", manifest.includes(`WEB_VERSION = '${hv.digest("hex").slice(0, 12)}'`));
const paywall = rf("mobile/Paywall.js", "utf8");
check("Paywall.js: no \"you haven't been charged\" claim", !/haven't been charged/i.test(paywall));
check("Paywall.js: trial welcome follows what the store started (membership.trial), not the offer shown", /r\.membership && r\.membership\.trial/.test(paywall));
check("Paywall.js: lifetime owners with a running subscription are told it may still bill them", /membership\.overlap/.test(paywall));
const proSrc = rf("mobile/pro.js", "utf8");
check("pro.js: sign-ins are serialized and stale ones dropped", /linkQueue\.current = linkQueue\.current\.then/.test(proSrc) && /if \(!stale\(\)\) apply\(customerInfo\)/.test(proSrc));

// ---------- Google Play plan changes (Android purchase path in mobile/pro.js) ----------
// rnr_pro has one Play subscription with several base plans: another base plan must be bought as a replacement
// (oldProductIdentifier = "rnr_pro", no base plan) or Google Play refuses it as already owned.
{
  const sub = (id, plan, o = {}) => ({ productIdentifier: id, productPlanIdentifier: plan, store: "PLAY_STORE", isActive: true, willRenew: true, expiresDate: iso(now + 20 * DAY), refundedAt: null, ...o });
  const pc = (subs, active) => ({ entitlements: { active: active || { pro: { identifier: "pro", isActive: true, willRenew: true, periodType: "NORMAL", productIdentifier: subs[0] ? `${subs[0].productIdentifier}:${subs[0].productPlanIdentifier}` : "x", expirationDate: iso(now + 20 * DAY), store: subs[0] ? subs[0].store : "PLAY_STORE" } } },
    activeSubscriptions: subs.map((x) => x.store === "PLAY_STORE" && x.productPlanIdentifier ? `${x.productIdentifier}:${x.productPlanIdentifier}` : x.productIdentifier), allExpirationDates: {},
    subscriptionsByProductIdentifier: Object.fromEntries(subs.map((x) => [x.productIdentifier, x])), nonSubscriptionTransactions: [] });
  const subPkg = (plan) => ({ packageType: "CUSTOM", product: { identifier: `rnr_pro:${plan}`, productCategory: "SUBSCRIPTION" } });
  const lifePkg = { packageType: "LIFETIME", product: { identifier: "rnr_pro_lifetime", productCategory: "NON_SUBSCRIPTION" } };
  const plan = (i, pkg) => M.planChangeFor(i, pkg, { entitlementId: "pro", now });
  const r = plan(pc([sub("rnr_pro", "monthly")]), subPkg("annual"));
  check("plan change: other base plan → replace rnr_pro (id without base plan)", r.kind === "replace" && r.oldProductIdentifier === "rnr_pro" && r.from === "rnr_pro:monthly");
  const ci = M.productChangeInfoFor(r);
  check("plan change: productChangeInfo names the old id and an explicit mode", ci && ci.oldProductIdentifier === "rnr_pro" && ci.replacementMode === "WITH_TIME_PRORATION" && M.PLAY_REPLACEMENT_MODE === "WITH_TIME_PRORATION");
  check("plan change: canceled-but-active plan is replaced too", plan(pc([sub("rnr_pro", "monthly", { willRenew: false })]), subPkg("annual")).kind === "replace");
  check("plan change: same base plan already active → not bought again", plan(pc([sub("rnr_pro", "monthly")]), subPkg("monthly")).kind === "same-plan");
  check("plan change: base plan unknown with the same id → treated as the same plan (no charge)", plan(pc([sub("rnr_pro", null)]), subPkg("annual")).kind === "same-plan");
  check("plan change: nothing active → plain new purchase, no change info", plan(pc([], {}), subPkg("monthly")).kind === "new" && M.productChangeInfoFor(plan(pc([], {}), subPkg("monthly"))) === null);
  check("plan change: lifetime while subscribed is a separate one-time purchase, never a replacement", plan(pc([sub("rnr_pro", "monthly")]), lifePkg).kind === "new");
  const life = { entitlements: { active: { pro: { identifier: "pro", isActive: true, willRenew: false, periodType: "NORMAL", productIdentifier: "rnr_pro_lifetime", expirationDate: null, store: "PLAY_STORE" } } }, activeSubscriptions: [], allExpirationDates: {}, nonSubscriptionTransactions: [{ productIdentifier: "rnr_pro_lifetime" }] };
  const lr = plan(life, subPkg("monthly"));
  check("plan change: lifetime owner tapping a subscription → nothing bought", lr.kind === "entitled" && /already have Pro/.test(M.alreadyActiveMessage(lr)));
  const apple = plan(pc([sub("com.alexkorir.rapidnursingreview.pro.monthly", null, { store: "APP_STORE" })]), subPkg("annual"));
  check("plan change: App Store subscription is not a Play plan → no second subscription", apple.kind === "entitled" && /through the App Store/.test(M.alreadyActiveMessage(apple)));
  check("plan change: refunded or inactive entries are ignored", plan(pc([sub("rnr_pro", "monthly", { refundedAt: iso(now - DAY) })], {}), subPkg("annual")).kind === "new" && plan(pc([sub("rnr_pro", "monthly", { isActive: false })], {}), subPkg("annual")).kind === "new");
  const old = { entitlements: { active: { pro: { identifier: "pro", isActive: true, willRenew: true, periodType: "NORMAL", productIdentifier: "rnr_pro:monthly", expirationDate: iso(now + 9 * DAY), store: "PLAY_STORE" } } }, activeSubscriptions: ["rnr_pro:monthly"], allExpirationDates: { "rnr_pro:monthly": iso(now + 9 * DAY) }, nonSubscriptionTransactions: [] };
  check("plan change: older SDK shape (no subscriptionsByProductIdentifier) still finds the Play plan", plan(old, subPkg("annual")).kind === "replace");
  check("plan change: same-plan message says nothing was bought", /nothing was bought/.test(M.alreadyActiveMessage({ kind: "same-plan" })));
  const ps = readFileSync("mobile/pro.js", "utf8");
  check("pro.js: Android purchase reads current state, then passes productChangeInfo as the 3rd argument",
    /if \(Platform\.OS === ["']android["']\)/.test(ps) && /planChangeFor\(current, pkg/.test(ps) && /Purchases\.purchasePackage\(pkg, null, change\)/.test(ps) && !/purchasePackage\(pkg\)/.test(ps));
  check("pro.js: same plan / already entitled / unreadable state return before any purchase",
    ps.indexOf("plan.kind === \"same-plan\" || plan.kind === \"entitled\"".replace(/"/g, ps.includes("'same-plan'") ? "'" : '"')) > 0 && ps.indexOf("so nothing was bought") < ps.indexOf("purchasePackage(pkg, null, change)"));
}

console.log(`\n${pass}/${pass + fail} checks passed`);
process.exit(fail ? 1 : 0);
