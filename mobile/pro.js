// Rapid Nursing Review Pro: Apple In-App Purchase and Google Play Billing through RevenueCat.
// Ported from NurseBound's src/pro.js. Prices always come from the stores, so each country sees its own
// price and currency; set $19.99/month, $49.99 per 3 months, $89.99/year and $119.00 lifetime in App Store Connect and Play Console
// (see PRICING.md). Nothing here hard-codes a price.
//
// Written with React.createElement instead of JSX so it can be checked with `node --check`.
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

let Purchases = null, ERR = {};
try { const m = require('react-native-purchases'); Purchases = m.default; ERR = m.PURCHASES_ERROR_CODE || {}; } catch (e) { Purchases = null; }

const h = React.createElement;
// Last known membership, so a paying member who opens the app offline isn't locked out.
const CACHE_KEY = 'rnr.pro.v1';
const extra = (Constants.expoConfig && Constants.expoConfig.extra) || {};
export const ENTITLEMENT = extra.entitlementId || 'pro';
export const ANDROID_PACKAGE = (Constants.expoConfig && Constants.expoConfig.android && Constants.expoConfig.android.package) || 'com.alexkorir.rapidnursingreview';
export const LINKS = {
  privacy: extra.privacyPolicyUrl || 'https://github.com/kenyanfreshy/rapid-nursing-review-public/blob/main/PRIVACY.md',
  // iOS: Apple's Standard EULA. Android: our public Terms page (it links the Google Play Terms of Service).
  terms: Platform.OS === 'ios' ? (extra.termsUrl || 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/') : 'https://github.com/kenyanfreshy/rapid-nursing-review-public/blob/main/TERMS.md',
  support: extra.supportEmail || 'alexkorirbook@gmail.com',
  supportPage: 'https://github.com/kenyanfreshy/rapid-nursing-review-public/blob/main/SUPPORT.md',
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

/** The facts the paywall shows about a membership, from RevenueCat's CustomerInfo. */
function readMembership(info) {
  const active = (info && info.entitlements && info.entitlements.active) || {};
  const ent = active[ENTITLEMENT] || active.pro || Object.values(active)[0];
  if (!ent) return null;
  return {
    productId: ent.productIdentifier || '',
    expires: ent.expirationDate || null,         // null = lifetime
    willRenew: !!ent.willRenew,
    trial: ent.periodType === 'TRIAL',
    lifetime: !ent.expirationDate,
    manageUrl: (info && info.managementURL) || null,
  };
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

  const apply = info => {
    const m = readMembership(info);
    setMembership(m);
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(m)).catch(() => {});
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
    (async () => {
      // 1. Last known status straight away (offline-safe). Expired cached subscriptions don't count.
      try {
        const c = JSON.parse(await AsyncStorage.getItem(CACHE_KEY));
        if (c && (c.lifetime || (c.expires && new Date(c.expires) > new Date()))) setMembership(c);
      } catch (e) {}
      // 2. Ask the store. Development builds can use RevenueCat's Test Store when app.json sets "useTestStore": true.
      const storeKey = Platform.OS === 'ios' ? extra.revenueCatAppleKey : extra.revenueCatGoogleKey;
      const key = __DEV__ && extra.useTestStore === true && extra.revenueCatTestKey ? extra.revenueCatTestKey : storeKey;
      if (!Purchases || !key || /REPLACE_ME/.test(key)) { setKeyMissing(!!Purchases); setReady(true); return; }
      try {
        if (Purchases.setLogLevel && Purchases.LOG_LEVEL) Purchases.setLogLevel(__DEV__ ? Purchases.LOG_LEVEL.DEBUG : Purchases.LOG_LEVEL.WARN);
        Purchases.configure({ apiKey: key });
        setStoreAvailable(true);
        const listener = info => apply(info);   // renewals, expiries, refunds, Ask to Buy approvals
        Purchases.addCustomerInfoUpdateListener(listener);
        removeListener.current = () => { try { Purchases.removeCustomerInfoUpdateListener(listener); } catch (e) {} };
        apply(await Purchases.getCustomerInfo());
      } catch (e) { setError("Couldn't reach the store. Check your connection and try again."); }
      await loadOfferings();
      setReady(true);
    })();
    return () => { if (removeListener.current) removeListener.current(); };
  }, []);

  const restoreInner = async () => {
    const info = await Purchases.restorePurchases(); apply(info);
    const active = !!readMembership(info);
    return { ok: active, message: active ? 'Your Pro membership is restored.' : 'We didn\'t find a Pro purchase on this ' + (Platform.OS === 'ios' ? 'Apple ID.' : 'Google account.') };
  };

  const buy = useCallback(async pkg => {
    if (!Purchases || !storeAvailable) return { ok: false, message: `Purchases need the ${STORE_NAME} version of the app.` };
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      apply(customerInfo);
      const m = readMembership(customerInfo);
      return m ? { ok: true, membership: m } : { ok: false, message: 'The purchase went through, but Pro hasn\'t unlocked yet. Tap Restore Purchases in a moment.' };
    } catch (e) {
      if (e && (e.userCancelled || e.code === ERR.PURCHASE_CANCELLED_ERROR)) return { ok: false, cancelled: true };
      if (e && e.code === ERR.PAYMENT_PENDING_ERROR) return { ok: false, pending: true, message: 'Your purchase is waiting for approval (for example, Ask to Buy or a pending payment). Pro unlocks automatically once it\'s approved.' };
      if (e && e.code === ERR.PRODUCT_ALREADY_PURCHASED_ERROR) return restoreInner();
      if (e && e.code === ERR.STORE_PROBLEM_ERROR) return { ok: false, message: 'The store is having a problem. You haven\'t been charged. Please try again later.' };
      if (e && e.code === ERR.PURCHASE_NOT_ALLOWED_ERROR) return { ok: false, message: 'Purchases aren\'t allowed on this device or account. Check Screen Time or your parental settings.' };
      return { ok: false, message: 'The purchase didn\'t go through. You haven\'t been charged. Please try again.' };
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
  const value = { isPro, membership, ready, packages, buy, restore, manage, reload: loadOfferings, storeAvailable, keyMissing, error, errorDetail, devUnlock, setDevUnlock };
  return h(ProCtx.Provider, { value }, children);
}
