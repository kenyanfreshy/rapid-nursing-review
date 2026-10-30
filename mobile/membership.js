// Rapid Nursing Review: pure membership logic (ported from NurseBound src/membership.js, same tests).
// Turns RevenueCat CustomerInfo into what the app shows and unlocks. No React Native imports, so
// tests/purchases_test.mjs runs it in Node.
//
// Fields read from CustomerInfo (react-native-purchases 10.x / purchases-typescript-internal 19.x):
//   entitlements.active[id] → identifier, productIdentifier, expirationDate (null = non-expiring),
//                             willRenew, periodType, isSandbox, store
//   activeSubscriptions      → product ids of unexpired subscriptions (includes canceled ones until they end)
//   allExpirationDates       → product id → expiry
//   subscriptionsByProductIdentifier → id → { isActive, willRenew, expiresDate, refundedAt, gracePeriodExpiresDate, store }
//     (present in purchases-typescript-internal 19.11 / react-native-purchases 10.13, read from installed d.ts;
//     treated as optional so older SDKs fall back to activeSubscriptions + allExpirationDates).

/** Other names the Pro entitlement could have. Any active one still unlocks Pro so existing members keep access. */
export const ENTITLEMENT_ALIASES = ["pro"];

// Google Play subscription ids can arrive as "subscriptionId:basePlanId".
const baseId = (id) => String(id || "").split(":")[0];
const isFuture = (iso, now) => { const t = Date.parse(iso || ""); return Number.isFinite(t) && t > now; };

/** The active entitlement that grants Pro, or null. Prefers the configured id, then known aliases, then any active one. */
export function pickEntitlement(info, entitlementId) {
  const active = (info && info.entitlements && info.entitlements.active) || {};
  return active[entitlementId] || ENTITLEMENT_ALIASES.map((a) => active[a]).find(Boolean) || Object.values(active)[0] || null;
}

/**
 * Unexpired recurring subscriptions, read independently of the entitlement (which reports only one product).
 * willRenew is true/false when the SDK says so, and null when this SDK version doesn't expose it.
 */
export function activeSubscriptions(info, now = Date.now()) {
  if (!info) return [];
  const ids = Array.isArray(info.activeSubscriptions) ? info.activeSubscriptions : [];
  const by = info.subscriptionsByProductIdentifier && typeof info.subscriptionsByProductIdentifier === "object" ? info.subscriptionsByProductIdentifier : null;
  const exp = info.allExpirationDates || {};
  const out = [];
  for (const id of ids) {
    const s = by ? (by[id] || by[baseId(id)] || null) : null;
    // PurchasesSubscriptionInfo (purchases-typescript-internal 19.x): isActive is the SDK's own answer
    // (covers grace periods); refundedAt marks a refund. Use them when present.
    if (s && (s.isActive === false || s.refundedAt)) continue;
    const expires = (s && s.expiresDate) || exp[id] || exp[baseId(id)] || null;
    if (expires && !isFuture(expires, now) && !(s && s.isActive === true)) continue;   // stale list entry
    out.push({ productId: id, expires, willRenew: s && typeof s.willRenew === "boolean" ? s.willRenew : null, store: (s && s.store) || null });
  }
  return out;
}

/**
 * What we show about a membership. Access and the lifetime pass both come only from RevenueCat's active
 * entitlement: an entitlement with no expiry date is the pass. Purchase history is never used, because a refunded
 * or revoked pass can stay in the history while RevenueCat has already taken the access away.
 * `overlap` is set when someone with the pass also has a recurring subscription that hasn't ended. Buying the pass
 * doesn't cancel a subscription, so the app tells them it may still bill them.
 */
export function readMembership(info, { entitlementId = "pro", now = Date.now() } = {}) {
  const ent = pickEntitlement(info, entitlementId);
  if (!ent) return null;
  const lifetime = !ent.expirationDate;
  const subs = activeSubscriptions(info, now);
  let overlap = null;
  if (lifetime && subs.length) {
    const known = subs.map((s) => s.willRenew).filter((v) => v !== null);
    overlap = {
      productIds: subs.map((s) => s.productId),
      // true if any is known to renew; false only if every one is known not to; null if the SDK can't tell.
      willRenew: known.some(Boolean) ? true : known.length === subs.length ? false : null,
      expires: subs.map((s) => s.expires).filter(Boolean).sort().pop() || null,
    };
  }
  return {
    productId: ent.productIdentifier || "",
    expires: ent.expirationDate || null,            // null = lifetime
    willRenew: !!ent.willRenew,
    trial: ent.periodType === "TRIAL",
    lifetime,
    overlap,
    sandbox: !!ent.isSandbox,
    store: ent.store || null,
    manageUrl: (info && info.managementURL) || null,
  };
}

/**
 * Decides whether a CustomerInfo response may replace what is shown. Each request takes a ticket when it
 * starts; an answer is applied only if no newer answer has been applied since. This stops a slow startup
 * read from overwriting a purchase, restore, sign-in or listener update that finished first.
 */
export function createResponseGate() {
  let issued = 0, applied = 0;
  return {
    ticket: () => ++issued,
    accept(ticket) { if (ticket < applied) return false; applied = ticket; return true; },
  };
}

/**
 * Which RevenueCat key a build may use. Store builds never use a Test Store key or another platform's key,
 * so a mis-pasted key fails safely ("store not connected") instead of selling against the wrong store.
 */
export function chooseKey({ os, dev, extra }) {
  const x = extra || {};
  const storeKey = os === "ios" ? x.revenueCatAppleKey : x.revenueCatGoogleKey;
  const key = dev && x.useTestStore === true && x.revenueCatTestKey ? x.revenueCatTestKey : storeKey;
  if (!key || /REPLACE_ME/.test(key)) return { key: null, problem: "missing" };
  if (dev && key === x.revenueCatTestKey) return { key, problem: null };
  if (/^test_/.test(key)) return { key: null, problem: "test-store-key-in-store-build" };
  const want = os === "ios" ? /^appl_/ : /^(goog_|amzn_)/;
  if (!want.test(key)) return { key: null, problem: "wrong-platform-key" };
  return { key, problem: null };
}

/**
 * Classifies a failed purchasePackage() call. The app only says "you haven't been charged" for failures that
 * happen before the store could create a transaction, and none of RevenueCat's purchase errors guarantee that
 * (a store or network error can arrive after the payment went through). So for every error other than a
 * cancel, a pending payment or "already owned", the caller re-reads CustomerInfo before saying anything, and
 * the message never claims no charge happened.
 *   kind: "cancelled" | "pending" | "already-owned" | "not-available" | "not-allowed" | "uncertain"
 */
export function classifyPurchaseError(e, ERR = {}) {
  const code = e && e.code;
  if (e && (e.userCancelled || (code != null && code === ERR.PURCHASE_CANCELLED_ERROR))) return { kind: "cancelled" };
  if (code != null && code === ERR.PAYMENT_PENDING_ERROR) return { kind: "pending", message: "Your purchase is waiting for approval (for example, Ask to Buy or a pending payment). Pro unlocks automatically once it's approved." };
  if (code != null && code === ERR.PRODUCT_ALREADY_PURCHASED_ERROR) return { kind: "already-owned" };
  if (code != null && code === ERR.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR) return { kind: "not-available" };
  if (code != null && code === ERR.PURCHASE_NOT_ALLOWED_ERROR) return { kind: "not-allowed", message: "Purchases aren't allowed on this device or account. Check Screen Time or your parental settings." };
  return { kind: "uncertain" };
}

/** Shown after reconciling, when Pro still isn't active and the outcome of the purchase is unknown. */
export function uncertainPurchaseMessage(store) {
  return `We couldn't confirm this purchase with ${store}. If you were charged, Pro unlocks automatically once ${store} confirms it, or tap Restore Purchases. If you weren't charged, please try again.`;
}

/**
 * Did the purchase of `pkg` itself take effect? Existing Pro is not proof: a subscriber who tries to buy the
 * lifetime pass already has Pro. All of these must hold:
 *  - Pro is active (an active entitlement; purchase history never grants anything on its own);
 *  - the plan is in effect now: lifetime package → the entitlement is non-expiring, or a transaction for that
 *    product dated after the attempt started exists (covers RevenueCat reporting the subscription's date on
 *    the shared entitlement); subscription package → that product is an active subscription (a Google Play id
 *    may carry ":basePlan"; two different base plans never match each other);
 *  - it was NOT already in effect before the attempt (`before`, from the CustomerInfo held when the user
 *    tapped buy), because then the state after a failed attempt would look the same.
 * Only used to decide whether to show success; access always comes from readMembership().
 */
export function planInEffect(info, pkg, { entitlementId = "pro", now = Date.now(), startedAt = null } = {}) {
  const m = readMembership(info, { entitlementId, now });
  if (!m || !pkg || !pkg.product) return false;
  const want = pkg.product.identifier;
  if (pkg.packageType === "LIFETIME") {
    if (m.lifetime === true) return true;
    if (startedAt == null) return false;
    const txns = Array.isArray(info.nonSubscriptionTransactions) ? info.nonSubscriptionTransactions : [];
    const SKEW = 5 * 60 * 1000;   // device vs store clock
    return txns.some((t) => t && t.productIdentifier === want && Date.parse(t.purchaseDate || "") >= startedAt - SKEW);
  }
  const hasPlan = (id) => String(id).includes(":");
  return activeSubscriptions(info, now).some((s) => s.productId === want || (hasPlan(s.productId) !== hasPlan(want) && baseId(s.productId) === baseId(want)));
}

export function purchaseVerified(info, pkg, { entitlementId = "pro", now = Date.now(), startedAt = null, before = null } = {}) {
  if (before && planInEffect(before, pkg, { entitlementId, now })) return false;   // can't attribute it to this attempt
  return planInEffect(info, pkg, { entitlementId, now, startedAt });
}

// ---------- Google Play plan changes (Android only) ----------
// This app sells ONE Play subscription with several base plans. Google Play Billing ("Resubscribe or switch plans
// within the same subscription", developer.android.com/google/play/billing/subs): a switch between base plans of the
// same subscription can be a regular purchase with no SubscriptionUpdateParams; Play then applies the default set in
// Play Console (Charge immediately = CHARGE_FULL_PRICE, or Charge at the next billing date = WITHOUT_PRORATION).
// Only those two modes are valid for such a switch: WITH_TIME_PRORATION (or any other) makes the purchase fail with an
// error. So a base-plan switch passes NO productChangeInfo and the billing terms are the Play Console setting's.
// The App Store needs none of this: StoreKit switches plans within one subscription group by itself.

/** Recorded in the release registry (playReplacementMode.mode): base-plan switches use the Play Console default. */
export const PLAY_REPLACEMENT_MODE = "PLAY_CONSOLE_DEFAULT";

const STORE_LABELS = { APP_STORE: "the App Store", MAC_APP_STORE: "the Mac App Store", PLAY_STORE: "Google Play", STRIPE: "the web", RC_BILLING: "the web", PROMOTIONAL: "a promotional grant", AMAZON: "the Amazon Appstore" };

/** Unexpired Google Play subscriptions in `info`, the one that renews first, then the latest-expiring. */
export function playSubscriptions(info, { entitlementId, now = Date.now() } = {}) {
  const by = info && info.subscriptionsByProductIdentifier && typeof info.subscriptionsByProductIdentifier === "object" ? info.subscriptionsByProductIdentifier : null;
  const ent = pickEntitlement(info, entitlementId);
  return activeSubscriptions(info, now).map((s) => {
    const sub = by ? (by[s.productId] || by[baseId(s.productId)] || null) : null;
    // Store: the SDK's answer; else the entitlement's when it reports this product; else a Play-style "id:basePlan".
    const store = s.store || (ent && ent.productIdentifier && baseId(ent.productIdentifier) === baseId(s.productId) ? ent.store : null) || (String(s.productId).includes(":") ? "PLAY_STORE" : null);
    const plan = String(s.productId).includes(":") ? String(s.productId).split(":")[1] : (sub && sub.productPlanIdentifier) || null;
    return { ...s, store, plan };
  }).filter((s) => s.store === "PLAY_STORE")
    .sort((a, b) => (b.willRenew === true) - (a.willRenew === true) || (Date.parse(b.expires || "") || 0) - (Date.parse(a.expires || "") || 0));
}

/**
 * What buying `pkg` on Google Play should do, from CustomerInfo read just before the purchase:
 *   { kind: "new" }                               nothing active on Google Play (one-time products such as the lifetime
 *                                                 pass always: they never replace and never cancel a subscription)
 *   { kind: "same-plan", productId }              that base plan is already active on Google Play: don't buy it again
 *   { kind: "switch-base-plan", from }            another base plan of the same subscription is active: a regular purchase;
 *                                                 Google Play replaces it under the Play Console default
 *   { kind: "other-subscription", from }          a different Play subscription is active (none exists in this catalog):
 *                                                 not bought, because replacing it needs a mode nobody has approved
 *   { kind: "entitled", store }                   Pro is already active without a Google Play subscription (App Store,
 *                                                 lifetime pass, promotional): a subscription would be a second charge
 */
export function planChangeFor(info, pkg, { entitlementId, now = Date.now() } = {}) {
  if (!pkg || !pkg.product || pkg.packageType === "LIFETIME" || pkg.product.productCategory === "NON_SUBSCRIPTION") return { kind: "new" };
  const want = String(pkg.product.identifier || "");
  const cur = playSubscriptions(info, { entitlementId, now })[0];
  if (!cur) {
    const m = readMembership(info, { entitlementId, now });
    if (!m) return { kind: "new" };
    const ent = pickEntitlement(info, entitlementId);
    return { kind: "entitled", store: (ent && ent.store) || null };
  }
  const wantPlan = want.includes(":") ? want.split(":")[1] : null;
  if (baseId(cur.productId) !== baseId(want)) return { kind: "other-subscription", from: cur.productId };
  // Same subscription id: the same plan unless both base plans are known and differ.
  if (cur.plan === null || wantPlan === null || cur.plan === wantPlan) return { kind: "same-plan", productId: cur.productId };
  return { kind: "switch-base-plan", from: cur.productId };
}

/** The productChangeInfo argument for purchasePackage (third parameter). Always null here: see the note above. */
export function productChangeInfoFor(_plan) {
  return null;
}

/** Shown when the purchase is not started because the customer already has access ("same-plan" / "entitled"). */
export function alreadyActiveMessage(plan) {
  if (plan && plan.kind === "other-subscription") return "You have a different Google Play subscription for this app, so nothing was bought. Change or cancel it in Google Play first.";
  if (plan && plan.kind === "same-plan") return "You already have this plan on Google Play, so nothing was bought. It's active on this account now.";
  const where = plan && plan.store && STORE_LABELS[plan.store];
  return `You already have Pro on this account${where ? ` through ${where}` : ""}, so nothing was bought.`;
}

/** Kept for pro.js: only reachable if a replacement is ever passed (RevenueCat PURCHASE_INVALID_ERROR). */
export const REPLACEMENT_NOT_FOUND_MESSAGE = "Google Play couldn't find your current subscription on this Google account, so nothing was bought. If you subscribed with a different Google account, switch to it in the Play Store and try again.";

// ---------- Ownership check before a Google Play purchase ----------
// The plan to replace must come from THIS customer's current state:
//  - fresh: getCustomerInfo() serves a cached answer for up to 5 minutes in the foreground (purchases-android
//    10.26 CustomerInfoHelper CACHED_OR_FETCHED, CACHE_REFRESH_PERIOD_IN_FOREGROUND); invalidateCustomerInfoCache()
//    first forces a fetch, and a failed fetch stops the purchase;
//  - same customer: no purchase while a sign-in / sign-out is queued or running, or when the RevenueCat app user
//    changed during the check. Google Play itself only finds an old purchase on the device's current Google account
//    (findPurchaseInPurchaseHistory), so a replacement can never reach a subscription bought with another Google account.

/**
 * Coordinates RevenueCat identity changes (sign-in / sign-out) with Google Play purchases, both ways:
 *  - begin() when an identity change is queued, call the returned end() when it is finished; a purchase never starts
 *    while one is pending (busy) and is abandoned if one starts during its ownership check (epoch moves);
 *  - startPurchase() when a purchase begins (before its ownership check), call the returned release() when the store
 *    has answered; an identity change waits (whenNoPurchase) until no purchase is running, so a sign-in can never land
 *    between the check and the store's answer: the purchase belongs to the account that started it.
 */
export function createIdentityTracker() {
  let epoch = 0, busy = 0, purchases = 0, waiters = [];
  return {
    begin() { epoch++; busy++; let done = false; return () => { if (!done) { done = true; busy--; epoch++; } }; },
    epoch: () => epoch,
    busy: () => busy > 0,
    startPurchase() {
      purchases++; let done = false;
      return () => { if (done) return; done = true; purchases--; if (!purchases) { const w = waiters; waiters = []; w.forEach((f) => f()); } };
    },
    purchasing: () => purchases > 0,
    whenNoPurchase: () => (purchases ? new Promise((r) => waiters.push(r)) : Promise.resolve()),
  };
}

/** Runs one queued identity change: waits for running purchases, then skips it if a newer change replaced it. */
export async function runIdentityChange(identity, stale, change) {
  await identity.whenNoPurchase();
  if (stale()) return undefined;
  return change();
}

/** Shared by the sign-in code and buy(). */
export const purchaseIdentity = createIdentityTracker();

export const ACCOUNT_CHANGING_MESSAGE = "Your account is switching right now, so nothing was bought. Wait a moment and try again.";
export const OWNERSHIP_UNREADABLE_MESSAGE = "We couldn't check your current Google Play subscription, so nothing was bought. Check your connection and try again.";

/**
 * Runs before every Google Play purchase. `P` is react-native-purchases' default export.
 * Returns { proceed: true, info, plan, change, stillCurrent } or { proceed: false, reason, message, info? }.
 *   reason: "identity-changing" | "identity-changed" | "unreadable" | "same-plan" | "entitled"
 * `info` is returned only when it belongs to the signed-in customer (safe to show). Call stillCurrent() right before
 * purchasePackage: false means an account change started in between, and the purchase must not start.
 */
export async function checkBeforePlayPurchase(P, pkg, { entitlementId, identity = purchaseIdentity, now } = {}) {
  if (identity.busy()) return { proceed: false, reason: "identity-changing", message: ACCOUNT_CHANGING_MESSAGE };
  const start = identity.epoch();
  const stillCurrent = () => !identity.busy() && identity.epoch() === start;
  let info;
  try {
    const who = await P.getAppUserID();
    if (typeof P.invalidateCustomerInfoCache === "function") await P.invalidateCustomerInfoCache();
    info = await P.getCustomerInfo();
    if (!info || (await P.getAppUserID()) !== who || !stillCurrent()) return { proceed: false, reason: "identity-changed", message: ACCOUNT_CHANGING_MESSAGE };
  } catch (_) {
    return { proceed: false, reason: "unreadable", message: OWNERSHIP_UNREADABLE_MESSAGE };
  }
  const plan = planChangeFor(info, pkg, { entitlementId, now: now == null ? Date.now() : now });
  if (plan.kind === "same-plan" || plan.kind === "entitled" || plan.kind === "other-subscription") return { proceed: false, reason: plan.kind, info, plan, message: alreadyActiveMessage(plan) };
  return { proceed: true, info, plan, change: productChangeInfoFor(plan), stillCurrent };
}
