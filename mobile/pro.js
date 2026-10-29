// Rapid Nursing Review Pro: Apple In-App Purchase and Google Play Billing through RevenueCat.
// Ported from NurseBound's src/pro.js. Prices always come from the stores, so each country sees its own
// price and currency; set $9.99/month, $49.99 per 3 months, $89.99/year and $119.00 lifetime in App Store Connect and Play Console
// (see PRICING.md). Nothing here hard-codes a price.
//
// Written with React.createElement instead of JSX so it can be checked with `node --check`.
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { readMembership as readFrom, createResponseGate, chooseKey, classifyPurchaseError, uncertainPurchaseMessage, purchaseVerified, planChangeFor, productChangeInfoFor, alreadyActiveMessage, REPLACEMENT_NOT_FOUND_MESSAGE } from './membership';

let Purchases = null, ERR = {};
try { const m = require('react-native-purchases'); Purchases = m.default; ERR = m.PURCHASES_ERROR_CODE || {}; } catch (e) { Purchases = null; }

const h = React.createElement;
// RevenueCat is configured once per app process (a remounted provider must not configure it again).
let configuredOnce = false;
// Last known membership, so a paying member who opens the app offline isn't locked out.
const CACHE_KEY = 'rnr.pro.v1';
const extra = (Constants.expoConfig && Constants.expoConfig.extra) || {};
export const ENTITLEMENT = extra.entitlementId || 'pro';
export const ANDROID_PACKAGE = (Constants.expoConfig && Constants.expoConfig.android && Constants.expoConfig.android.package) || 'com.alexkorir.rapidnursingreview';
export const LINKS = {
  privacy: extra.privacyPolicyUrl || 'https://nclexrapidnursingreview.com/privacy.html',
  // iOS: Apple's Standard EULA. Android: our public Terms page (it links the Google Play Terms of Service).
  terms: Platform.OS === 'ios' ? (extra.termsUrl || 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/') : 'https://nclexrapidnursingreview.com/terms.html',
  supportPage: 'https://nclexrapidnursingreview.com/support.html',
};
const STORE_NAME = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

// Shown in the paywall's scrolling feature strip. Only things that really are Pro.
export const PRO_FEATURES = [
  ['check', 'All 3,200 NCLEX-style questions'],
  ['layers', '982 NGN-format items'],
  ['spark', '30 NGN case studies'],
  ['target', 'NCLEX blueprint exam'],
  ['clock', 'Timed exam mode'],
  ['book', 'The complete book'],
  ['link', 'Answers linked to the book'],
];

const ProCtx = createContext({ isPro: false, ready: false, packages: [], storeAvailable: false, membership: null });
export const usePro = () => useContext(ProCtx);

/** The facts the paywall shows about a membership, from RevenueCat's CustomerInfo (logic in ./membership.js). */
function readMembership(info) {
  return readFrom(info, { entitlementId: ENTITLEMENT });
}

export function ProProvider({ children }) {
  const [membership, setMembership] = useState(null);
  const [ready, setReady] = useState(false);
  const [packages, setPackages] = useState([]);
  const [devUnlock, setDevUnlock] = useState(false);
  const [storeAvailable, setStoreAvailable] = useState(false);
  const [keyMissing, setKeyMissing] = useState(false);   // build has no RevenueCat key yet (app.json placeholders)
  const [error, setError] = useState('');
  const [errorDetail, setErrorDetail] = useState('');
  const removeListener = useRef(null);
  const configured = useRef(false);
  const pendingUser = useRef(undefined);   // account id waiting for RevenueCat to finish configuring
  const gate = useRef(createResponseGate()).current;
  const lastInfo = useRef(null);           // latest CustomerInfo applied (pre-purchase snapshot)
  const linkQueue = useRef(Promise.resolve());
  const linkGen = useRef(0);

  // `ticket` is taken when a request starts; a late answer to an older request (e.g. the startup read
  // finishing after a purchase or sign-in) is dropped instead of overwriting newer state.
  const apply = (info, ticket = gate.ticket()) => {
    if (!info || !gate.accept(ticket)) return false;
    lastInfo.current = info;
    const m = readMembership(info);
    setMembership(m);
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(m)).catch(() => {});
    return true;
  };

  const loadOfferings = useCallback(async () => {
    if (!Purchases) return;
    try {
      setError(''); setErrorDetail('');
      const offerings = await Purchases.getOfferings();
      const cur = offerings && offerings.current;
      setPackages(cur ? cur.availablePackages : []);
      if (!cur || !cur.availablePackages.length) { setError('No plans are available from the store right now.'); setErrorDetail(__DEV__ ? (cur ? 'Current offering has no packages' : 'No current offering') : ''); }
    } catch (e) {
      // Code 23 = store/RevenueCat setup problem (e.g. products not created yet), not the shopper's connection.
      setError(e && (e.code === 23 || e.code === '23') ? "Plans aren't available right now. Please try again later." : "Couldn't load plans from the store. Check your connection and try again.");
      setErrorDetail(e ? (__DEV__ ? [e.code != null ? `Code ${e.code}` : '', e.readableErrorCode || '', e.message || ''].filter(Boolean).join(' · ').slice(0, 300) : e.code != null ? `Error code ${e.code}` : '') : '');
    }
  }, []);

  useEffect(() => {
    let unmounted = false;
    (async () => {
      // 1. Last known status straight away (offline-safe). Expired cached subscriptions don't count.
      try {
        const c = JSON.parse(await AsyncStorage.getItem(CACHE_KEY));
        if (c && (c.lifetime || (c.expires && new Date(c.expires) > new Date()))) setMembership(c);
      } catch (e) {}
      // 2. Ask the store. Development builds can use RevenueCat's Test Store when app.json sets "useTestStore": true.
      // A missing, Test Store or other-platform key leaves the store disconnected rather than misconfigured.
      const { key, problem } = chooseKey({ os: Platform.OS, dev: __DEV__, extra });
      if (!Purchases || !key) {
        if (problem && problem !== 'missing') setErrorDetail(__DEV__ ? `RevenueCat key rejected: ${problem}` : '');
        if (!unmounted) { setKeyMissing(!!Purchases); setReady(true); }
        return;
      }
      try {
        if (!configuredOnce) {
          if (Purchases.setLogLevel && Purchases.LOG_LEVEL) Purchases.setLogLevel(__DEV__ ? Purchases.LOG_LEVEL.DEBUG : Purchases.LOG_LEVEL.WARN);
          Purchases.configure({ apiKey: key });
          configuredOnce = true;
        }
        if (unmounted) return;
        setStoreAvailable(true);
        const listener = info => apply(info);   // renewals, expiries, refunds, Ask to Buy approvals
        Purchases.addCustomerInfoUpdateListener(listener);
        removeListener.current = () => { try { Purchases.removeCustomerInfoUpdateListener(listener); } catch (e) {} };
        const ticket = gate.ticket();
        const first = await Purchases.getCustomerInfo();
        if (unmounted) return;
        apply(first, ticket);
        configured.current = true;
        if (pendingUser.current !== undefined) { const u = pendingUser.current; pendingUser.current = undefined; linkAccount(u); }
      } catch (e) { if (!unmounted) setError("Couldn't reach the store. Check your connection and try again."); }
      if (unmounted) return;
      await loadOfferings();
      if (!unmounted) setReady(true);
    })();
    // Cleanup can run before the async setup finishes: `unmounted` stops state updates, and the listener is
    // removed here or, if setup hasn't reached it yet, never added.
    return () => { unmounted = true; if (removeListener.current) removeListener.current(); };
  }, []);

  // Sign in with Apple (Settings → Sync and web access) gives the learner a Supabase account id.
  // Purchases.logIn(<that id>) attaches this phone's purchases to it in RevenueCat, so the web app's
  // server check (supabase/functions/entitlement) finds the subscription. RevenueCat moves purchases
  // made before sign-in onto the account. Signing out does NOT log out of RevenueCat: the learner keeps
  // Pro on this phone, and buying never needs an account.
  // Sign-ins run one at a time, in order; one replaced by a newer sign-in stops and its result is never shown.
  function linkAccount(userId) {
    if (!Purchases || !userId || typeof userId !== 'string') return Promise.resolve();
    if (!configured.current) { pendingUser.current = userId; return Promise.resolve(); }
    const gen = ++linkGen.current;
    const stale = () => gen !== linkGen.current;
    linkQueue.current = linkQueue.current.then(async () => {
      if (stale()) return;
      try {
        const current = await Purchases.getAppUserID();
        if (stale() || current === userId) return;
        const { customerInfo } = await Purchases.logIn(userId);
        if (!stale()) apply(customerInfo);
      } catch (e) {}
    });
    return linkQueue.current;
  }

  const restoreInner = async () => {
    const info = await Purchases.restorePurchases(); apply(info);   // restore's answer is the newest state
    const active = !!readMembership(info);
    return { ok: active, message: active ? 'Your Pro membership is restored.' : 'We didn\'t find a Pro purchase on this ' + (Platform.OS === 'ios' ? 'Apple ID.' : 'Google account.') };
  };

  const buy = useCallback(async pkg => {
    if (!Purchases || !storeAvailable) return { ok: false, message: `Purchases need the ${STORE_NAME} version of the app.` };
    // What was in effect when the user tapped buy, so a failed attempt can't be mistaken for success
    // (e.g. a subscriber whose lifetime purchase fails still has Pro).
    let before = lastInfo.current;
    const startedAt = Date.now();
    // Google Play: a subscription purchase must name the plan it replaces (rnr_pro's other base plans are
    // refused as already owned). Read the current state first and never start a second subscription for someone
    // who already has Pro. The lifetime pass is a one-time product: never a replacement, and buying it leaves a
    // running subscription untouched (membership.overlap tells the learner).
    let change = null;
    if (Platform.OS === 'android') {
      let current;
      try { const ticket = gate.ticket(); current = await Purchases.getCustomerInfo(); apply(current, ticket); }
      catch (_) { return { ok: false, message: 'We couldn\'t check your current Google Play subscription, so nothing was bought. Check your connection and try again.' }; }
      before = current;
      const plan = planChangeFor(current, pkg, { entitlementId: ENTITLEMENT });
      if (plan.kind === 'same-plan' || plan.kind === 'entitled') return { ok: false, alreadyActive: true, membership: readMembership(current), message: alreadyActiveMessage(plan) };
      change = productChangeInfoFor(plan);
    }
    const verified = info => purchaseVerified(info, pkg, { entitlementId: ENTITLEMENT, startedAt, before });
    try {
      // Third argument: productChangeInfo (the second, upgradeInfo, is deprecated). null = a new purchase.
      const { customerInfo } = await Purchases.purchasePackage(pkg, null, change);
      apply(customerInfo);
      if (verified(customerInfo)) return { ok: true, membership: readMembership(customerInfo) };
      return { ok: false, message: `${STORE_NAME} accepted the purchase, but it isn't confirmed yet. It usually appears within a minute; tap Restore Purchases if it doesn't.` };
    } catch (e) {
      const c = classifyPurchaseError(e, ERR);
      if (c.kind === 'cancelled') return { ok: false, cancelled: true };
      if (c.kind === 'pending') return { ok: false, pending: true, message: c.message };
      if (c.kind === 'already-owned') {
        try {
          const restored = await Purchases.restorePurchases(); apply(restored);
          if (purchaseVerified(restored, pkg, { entitlementId: ENTITLEMENT })) return { ok: true, membership: readMembership(restored), message: 'You already own this plan; it\'s restored on this account.' };
        } catch (_) { /* fall through */ }
        return { ok: false, message: `${STORE_NAME} says you already own this plan, but it isn't showing on this account yet. Tap Restore Purchases, or check you're signed in with the account you bought it on.` };
      }
      if (c.kind === 'not-allowed') return { ok: false, message: c.message };
      // Replacing a plan bought with another Google account: RevenueCat finds no purchase to replace and nothing is charged.
      if (change && e && e.code != null && e.code === ERR.PURCHASE_INVALID_ERROR) return { ok: false, message: REPLACEMENT_NOT_FOUND_MESSAGE };
      // Store or network trouble, an unavailable product, unknown errors: the payment may or may not have
      // happened. Re-read CustomerInfo before saying anything, and never claim that no charge happened.
      try {
        const ticket = gate.ticket();
        const latest = await Purchases.getCustomerInfo();
        apply(latest, ticket);
        if (verified(latest)) return { ok: true, membership: readMembership(latest) };
      } catch (_) { /* still unknown */ }
      if (c.kind === 'not-available') return { ok: false, message: `This plan isn't available from ${STORE_NAME} right now. Please pick another plan, or tap Restore Purchases if you were charged.` };
      return { ok: false, message: uncertainPurchaseMessage(STORE_NAME) };
    }
  }, [storeAvailable]);

  const restore = useCallback(async () => {
    if (!Purchases || !storeAvailable) return { ok: false, message: `Restoring needs the ${STORE_NAME} version of the app.` };
    try { return await restoreInner(); } catch (e) { return { ok: false, message: 'Couldn\'t restore right now. Please try again.' }; }
  }, [storeAvailable]);

  /** Opens the store's own subscription management (cancel, change plan). */
  const manage = useCallback(async () => {
    try {
      if (Platform.OS === 'ios' && Purchases && storeAvailable && Purchases.showManageSubscriptions) { await Purchases.showManageSubscriptions(); return; }
    } catch (e) {}
    const url = (membership && membership.manageUrl) || (Platform.OS === 'ios' ? 'https://apps.apple.com/account/subscriptions' : `https://play.google.com/store/account/subscriptions?package=${ANDROID_PACKAGE}`);
    Linking.openURL(url).catch(() => {});
  }, [membership, storeAvailable]);

  const isPro = !!membership || (__DEV__ && devUnlock);
  /** Apply CustomerInfo another part of the app got from RevenueCat. */
  const ingest = useCallback(info => { if (info) apply(info); }, []);
  const value = { isPro, membership, ingest, ready, packages, buy, restore, manage, linkAccount, reload: loadOfferings, storeAvailable, keyMissing, error, errorDetail, devUnlock, setDevUnlock };
  return h(ProCtx.Provider, { value }, children);
}
