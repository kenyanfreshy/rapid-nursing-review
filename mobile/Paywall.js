// Pro paywall, ported from NurseBound's app/paywall.js (same design: navy gradient with a heartbeat trace,
// scrolling feature strip, plan cards, one main button, Restore Purchases, renewal terms, Manage Subscription,
// Privacy · Terms). Prices, currencies and any free trial come from Apple or Google for the shopper's country.
// Store rules (App Store 3.1.1 / 3.1.2, Google Play Payments and Subscriptions):
//  • the amount billed and how often it's billed is the most prominent price text
//  • a trial is only promised to people the store says can get one, and always says what it costs afterwards
//  • "Save %" is worked out from real store prices (3-month vs 3 × monthly, annual vs 12 × monthly)
//  • auto-renewal terms, Restore Purchases, Manage Subscription, Privacy Policy and Terms of Use are all here
//
// Written with React.createElement instead of JSX so it can be checked with `node --check`.
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, Linking, Platform, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Ellipse, LinearGradient as SvgGrad, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { LINKS, PRO_FEATURES, usePro } from './pro';
import { StatusBar } from 'expo-status-bar';

let RC = {};
try { RC = require('react-native-purchases'); } catch (e) { RC = {}; }

const h = React.createElement;
const C = {
  bg: '#0B0F19', bg2: '#141238', card: 'rgba(255,255,255,0.045)', cardOn: 'rgba(6,182,212,0.12)',
  line: 'rgba(255,255,255,0.12)', ink: '#F1F5F9', muted: '#A9B4C8', faint: '#7C879C',
  cyan: '#22D3EE', cyanDeep: '#06B6D4', gold: '#FBBF24', navyInk: '#04131A',
};
const SANS = Platform.select({ ios: 'System', default: undefined });
const PERIOD = { MONTHLY: 'month', ANNUAL: 'year', WEEKLY: 'week', SIX_MONTH: '6 months', THREE_MONTH: '3 months', TWO_MONTH: '2 months', LIFETIME: null };
const SHORT = { MONTHLY: '/mo', ANNUAL: '/yr', WEEKLY: '/wk', SIX_MONTH: '/6 mo', THREE_MONTH: '/3 mo', TWO_MONTH: '/2 mo' };
const UNIT = { DAY: 'day', WEEK: 'week', MONTH: 'month', YEAR: 'year' };
// Plan order: 3-month pass (most popular, full width), lifetime (best long-term value, full width), then annual and monthly side by side.
const ORDER = { THREE_MONTH: 0, LIFETIME: 1, ANNUAL: 2, MONTHLY: 3, SIX_MONTH: 4, TWO_MONTH: 5, WEEKLY: 6 };
// The three benefits under the headline (counts match the app).
const BENEFITS = [['book', '3,200-question bank + the full Rapid Nursing Review book'], ['steth', '30 NGN case studies with real EHR tabs'], ['clock', 'Exam-date study plan, tutor mode & progress by client need']];
const ACCOUNT = Platform.OS === 'ios' ? 'Apple ID' : 'Google Play account';
const isoDay = s => (s ? new Date(s).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '');

// Small line icons (24×24 paths), drawn with react-native-svg.
const ICONS = {
  check: 'M5 12l4 4L19 6', spark: 'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z', target: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2', book: 'M3 4c3-1 6-1 9 1 3-2 6-2 9-1v16c-3-1-6-1-9 1-3-2-6-2-9-1V4z M12 5v16',
  link: 'M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1 M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1', close: 'M6 6l12 12 M18 6L6 18',
  layers: 'M12 3l9 5-9 5-9-5 9-5z M3 13l9 5 9-5 M3 17l9 5 9-5',
  steth: 'M6 3v6a4 4 0 0 0 8 0V3 M10 13v3a5 5 0 0 0 10 0v-2 M20 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  badge: 'M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H5v-4l-3-3 3-3V5h4z M8 12l3 3 5-6', store: 'M3 9l2-5h14l2 5 M4 9v11h16V9 M9 20v-6h6v6',
};
function Icon({ name, size = 16, color = C.cyan }) {
  return h(Svg, { width: size, height: size, viewBox: '0 0 24 24' }, h(Path, { d: ICONS[name] || ICONS.check, stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }));
}
const T = (style, children, props = {}) => h(Text, { style: [{ color: C.ink, fontFamily: SANS }, style], ...props }, children);
const Row = (style, ...kids) => h(View, { style: [{ flexDirection: 'row', alignItems: 'center' }, style] }, ...kids);

/** "2-week" (for buttons) and "2 weeks" (for sentences) from a store intro offer. */
function trialLength(intro) {
  let n = intro.periodNumberOfUnits || 1; let u = UNIT[intro.periodUnit] || 'day';
  if (u === 'day' && n % 7 === 0) { n = n / 7; u = 'week'; }
  return { adj: `${n}-${u}`, words: `${n} ${u}${n > 1 ? 's' : ''}` };
}
/** Free trial the store will actually give this shopper for a package, or null. */
function useTrials(packages) {
  const [eligible, setEligible] = useState({});
  const ids = packages.map(p => p.identifier).join('|');
  useEffect(() => {
    const subs = packages.filter(p => p.packageType !== 'LIFETIME' && p.product && p.product.introPrice);
    if (!subs.length) return;
    if (Platform.OS !== 'ios' || !RC.default || !RC.default.checkTrialOrIntroductoryPriceEligibility) {
      setEligible(Object.fromEntries(subs.map(p => [p.product.identifier, true]))); return;   // Play only returns eligible offers
    }
    const ELIGIBLE = (RC.INTRO_ELIGIBILITY_STATUS && RC.INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE) ?? 2;
    RC.default.checkTrialOrIntroductoryPriceEligibility(subs.map(p => p.product.identifier))
      .then(res => setEligible(Object.fromEntries(subs.map(p => [p.product.identifier, !!(res && res[p.product.identifier] && res[p.product.identifier].status === ELIGIBLE)]))))
      .catch(() => setEligible({}));
  }, [ids]);
  return pkg => {
    const intro = pkg && pkg.product && pkg.product.introPrice;
    if (!intro || pkg.packageType === 'LIFETIME' || !eligible[pkg.product.identifier]) return null;
    const L = trialLength(intro);
    return { free: !intro.price, length: L.adj, words: L.words, priceString: intro.priceString };
  };
}

/* ---------- background: navy gradient with a faint heartbeat trace ---------- */
function Backdrop() {
  const { width, height } = useWindowDimensions();
  const y = height * 0.52, w = width;
  const ecg = `M0 ${y} L${w * 0.22} ${y} L${w * 0.27} ${y - 18} L${w * 0.31} ${y + 10} L${w * 0.36} ${y} L${w * 0.5} ${y} L${w * 0.54} ${y - 26} L${w * 0.58} ${y - 210} L${w * 0.62} ${y + 60} L${w * 0.66} ${y} L${w * 0.78} ${y} L${w * 0.81} ${y - 30} L${w * 0.85} ${y} L${w} ${y}`;
  return h(Svg, { width, height, style: { position: 'absolute', top: 0, left: 0 }, pointerEvents: 'none' },
    h(Defs, null,
      h(SvgGrad, { id: 'pwbg', x1: '0', y1: '0', x2: '0.6', y2: '1' }, h(Stop, { offset: '0', stopColor: C.bg }), h(Stop, { offset: '1', stopColor: C.bg2 })),
      h(RadialGradient, { id: 'pwglow', cx: '0.5', cy: '0.12', r: '0.6' }, h(Stop, { offset: '0', stopColor: '#6366F1', stopOpacity: '0.32' }), h(Stop, { offset: '1', stopColor: '#6366F1', stopOpacity: '0' }))),
    h(Rect, { x: '0', y: '0', width, height, fill: 'url(#pwbg)' }),
    h(Ellipse, { cx: width / 2, cy: height * 0.12, rx: width * 0.9, ry: height * 0.3, fill: 'url(#pwglow)' }),
    h(Path, { d: ecg, stroke: C.cyan, strokeOpacity: 0.13, strokeWidth: 2, fill: 'none', strokeLinejoin: 'round' }));
}

function Radio({ on }) {
  return h(View, { style: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: on ? C.cyan : 'rgba(255,255,255,0.28)', alignItems: 'center', justifyContent: 'center' } },
    on ? h(View, { style: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.cyan } }) : null);
}
function Badge({ text, color = C.cyan }) {
  return h(View, { style: { alignSelf: 'flex-start', borderWidth: 1, borderColor: color, backgroundColor: 'rgba(6,182,212,0.12)', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 2 } },
    T({ color, fontSize: 10, fontWeight: '800', letterSpacing: 2 }, text));
}
function PlanCard({ label, badge, badgeColor, price, unit, lines, saveText, on, onPress, wide }) {
  return h(Pressable, {
    onPress, accessibilityRole: 'radio', accessibilityState: { checked: on },
    accessibilityLabel: [label, price + (unit || ''), ...(lines || []), saveText].filter(Boolean).join(', '),
    style: ({ pressed }) => ({ flex: wide ? undefined : 1, padding: 12, borderRadius: 18, gap: 3, borderWidth: on ? 2.5 : 1.5, borderColor: on ? C.cyan : C.line, backgroundColor: on ? C.cardOn : C.card,
      shadowColor: C.cyanDeep, shadowOpacity: on ? 0.45 : 0, shadowRadius: 16, shadowOffset: { width: 0, height: 0 }, transform: [{ scale: pressed ? 0.985 : 1 }] }),
  },
    Row({ justifyContent: 'space-between', alignItems: 'flex-start' },
      h(View, { style: { flex: 1, gap: 4 } }, badge ? h(Badge, { text: badge, color: badgeColor || C.cyan }) : null, T({ color: C.muted, fontSize: 12, letterSpacing: 2.4, fontWeight: '700' }, label)),
      h(Radio, { on })),
    Row({ alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 },
      T({ fontSize: wide ? 22 : 26, lineHeight: wide ? 28 : 32, fontWeight: '800' }, price, { numberOfLines: 1, adjustsFontSizeToFit: true }),
      unit ? T({ color: C.muted, fontSize: 15, paddingBottom: 4 }, unit) : null),
    ...(lines || []).map(l => T({ color: C.muted, fontSize: 13, lineHeight: 17 }, l, { key: l })),
    saveText ? T({ color: C.gold, fontSize: 13, fontWeight: '700' }, saveText) : null);
}

/** Auto-scrolling strip of the Pro features. Static (swipeable) when Reduce Motion is on. */
function Marquee() {
  const x = useRef(new Animated.Value(0)).current;
  const [w, setW] = useState(0); const [still, setStill] = useState(false);
  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(v => setStill(!!v)).catch(() => {}); }, []);
  useEffect(() => {
    if (!w || still) return;
    x.setValue(0);
    const loop = Animated.loop(Animated.timing(x, { toValue: -w, duration: w * 28, easing: Easing.linear, useNativeDriver: true }));
    loop.start(); return () => loop.stop();
  }, [w, still]);
  const chips = k => h(View, { key: k, style: { flexDirection: 'row' }, onLayout: k === 0 ? e => setW(e.nativeEvent.layout.width) : undefined },
    ...PRO_FEATURES.map(([ic, label]) => h(View, { key: label, style: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 7, marginRight: 8, borderRadius: 999, backgroundColor: 'rgba(6,182,212,0.12)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.35)' } },
      h(Icon, { name: ic, size: 14 }), T({ fontSize: 14, fontWeight: '600' }, label))));
  const label = `Pro includes: ${PRO_FEATURES.map(m => m[1]).join(', ')}`;
  if (still) return h(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, accessibilityLabel: label }, chips(0));
  return h(View, { style: { overflow: 'hidden', marginHorizontal: -20 }, accessible: true, accessibilityLabel: label },
    h(Animated.View, { style: { flexDirection: 'row', paddingLeft: 20, transform: [{ translateX: x }] } }, chips(0), chips(1)));
}

/** Placeholder plan cards while prices load from the store (no prices are ever hard-coded). */
function PlanSkeleton() {
  const a = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue: 0.8, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(a, { toValue: 0.35, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true })]));
    loop.start(); return () => loop.stop();
  }, []);
  const bar = (w, ht = 12) => h(View, { style: { width: w, height: ht, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.18)' } });
  const card = k => h(Animated.View, { key: k, style: { flex: 1, minHeight: 130, padding: 16, borderRadius: 20, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.card, gap: 12, opacity: a } }, bar('45%', 10), bar('70%', 30), bar('85%'), bar('60%'));
  return h(View, { accessible: true, accessibilityLabel: 'Loading plans and prices from the store' }, Row({ gap: 12, alignItems: 'stretch' }, card(1), card(2)));
}
function LinkText({ children, onPress, color = C.cyan, underline, size = 16 }) {
  return h(Pressable, { onPress, accessibilityRole: 'link', hitSlop: 8 },
    T({ color, fontSize: size, lineHeight: size + 6, textDecorationLine: underline ? 'underline' : 'none', fontWeight: underline ? '400' : '600' }, children));
}

/* ---------- screen ---------- */
export default function Paywall({ onClose, reason }) {
  const ins = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { isPro, membership, packages, buy, restore, manage, reload, storeAvailable, keyMissing, ready, error, errorDetail, devUnlock, setDevUnlock } = usePro();
  const trialFor = useTrials(packages);
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [welcome, setWelcome] = useState('');

  const source = packages.slice().sort((a, b) => (ORDER[a.packageType] ?? 8) - (ORDER[b.packageType] ?? 8));
  const subs = source.filter(p => p.packageType !== 'LIFETIME');
  const lifetime = source.find(p => p.packageType === 'LIFETIME');
  const annual = source.find(p => p.packageType === 'ANNUAL');
  const monthly = source.find(p => p.packageType === 'MONTHLY');
  const quarter = source.find(p => p.packageType === 'THREE_MONTH');
  const selId = sel || (quarter || annual || monthly || subs[0] || lifetime || {}).identifier;
  const chosen = source.find(p => p.identifier === selId) || null;
  const trial = chosen ? trialFor(chosen) : null;
  const per = chosen ? PERIOD[chosen.packageType] : null;
  // Real savings only: yearly vs 12 × monthly from the store's own prices.
  const yearlySave = annual && monthly && monthly.product.price > 0 ? Math.round((1 - annual.product.price / (monthly.product.price * 12)) * 100) : 0;
  const quarterSave = quarter && monthly && monthly.product.price > 0 ? Math.round((1 - quarter.product.price / (monthly.product.price * 3)) * 100) : 0;

  const purchase = async () => {
    if (!chosen || busy) return; setBusy(true); setMsg('');
    let r;
    try { r = await buy(chosen); } catch (e) { r = { ok: false, message: `The purchase didn't go through. You haven't been charged. (${(e && (e.code || e.message)) || 'unknown error'})` }; }
    setBusy(false);
    if (r.ok) setWelcome(trial ? `Your ${trial.words} free trial has started and all of Pro is unlocked.` : 'All of Pro is unlocked: every question, case study, exam and page of the book.');
    else if (!r.cancelled) setMsg(r.message);
  };
  const doRestore = async () => { setBusy(true); setMsg(''); let r; try { r = await restore(); } catch (e) { r = { ok: false, message: 'Couldn\'t restore right now. Please try again.' }; } setBusy(false); if (r.ok) setWelcome('Your Pro membership is restored.'); else setMsg(r.message); };
  const open = url => { if (url && !/REPLACE_ME/.test(url)) Linking.openURL(url).catch(() => {}); };

  const cardFor = (p, wide) => {
    const t = trialFor(p), life = p.packageType === 'LIFETIME', pPer = PERIOD[p.packageType], lines = [];
    // e.g. "2 weeks free, then $89.99/year": the full price stays the biggest text on the card (App Store 3.1.2).
    if (t) lines.push(t.free ? `${t.words} free, then ${p.product.priceString}${pPer ? '/' + pPer : ''}` : `${t.priceString} for ${t.words}, then ${p.product.priceString}${pPer ? '/' + pPer : ''}`);
    if (p.packageType === 'THREE_MONTH') lines.push(`${p.product.pricePerMonthString ? `Billed as ${p.product.pricePerMonthString}/mo · ` : ''}Matches the 90-day study runway`);
    if (p.packageType === 'ANNUAL') lines.push(`${p.product.pricePerMonthString ? `~${p.product.pricePerMonthString}/mo · ` : ''}Fits international credentialing timelines`);
    if (p.packageType === 'MONTHLY') lines.push('Flexible access, cancel anytime');
    if (life) lines.push('Pay once, own forever · no renewals');
    return h(PlanCard, { key: p.identifier, wide, on: selId === p.identifier, onPress: () => setSel(p.identifier),
      label: life ? 'LIFETIME ALL-ACCESS' : p.packageType === 'THREE_MONTH' ? '3-MONTH PASS' : p.packageType === 'ANNUAL' ? 'ANNUAL PASS' : p.packageType === 'MONTHLY' ? 'MONTHLY SPRINT' : (pPer || 'PLAN').toUpperCase(),
      badge: p.packageType === 'THREE_MONTH' ? 'MOST POPULAR' : life ? 'BEST LONG-TERM VALUE' : null, badgeColor: life ? C.gold : C.cyan,
      price: p.product.priceString, unit: life ? null : SHORT[p.packageType], lines,
      saveText: p.packageType === 'ANNUAL' && yearlySave > 0 ? `Save ~${yearlySave}%` : p.packageType === 'THREE_MONTH' && quarterSave > 0 ? `Save ~${quarterSave}%` : null });
  };

  const ctaTitle = !chosen ? '' : busy ? 'Please wait…' : trial ? (trial.free ? `Start ${trial.adj.replace(/^./, c => c.toUpperCase()).replace(/-(\w)/, (m, c) => '-' + c.toUpperCase())} Free Trial` : `Start for ${trial.priceString}`) : 'Unlock Complete Review Pass';
  const ctaSub = !chosen ? '' : trial ? `${trial.free ? `${trial.words} free` : `${trial.priceString} for ${trial.words}`}, then ${chosen.product.priceString}${per ? '/' + per : ''} · cancel anytime`
    : chosen.packageType === 'LIFETIME' ? `${chosen.product.priceString} once · no subscription` : `${chosen.product.priceString}${per ? '/' + per : ''} · cancel anytime`;
  const renewLine = chosen && chosen.packageType !== 'LIFETIME' ? (trial ? `${trial.words} free, then ${chosen.product.priceString}/${per}, renewing automatically.` : `${chosen.product.priceString}/${per}, renewing automatically.`) : null;

  let memberLine = 'All of Pro is unlocked.';
  if (isPro && membership) {
    if (membership.lifetime) memberLine = 'All-access pass · yours to keep, with no renewals.';
    else if (membership.trial && membership.willRenew) memberLine = `Free trial until ${isoDay(membership.expires)}, then it renews unless you cancel at least 24 hours before it ends.`;
    else if (membership.trial) memberLine = `Free trial until ${isoDay(membership.expires)}. You've canceled, so you won't be charged.`;
    else if (membership.willRenew) memberLine = `Renews on ${isoDay(membership.expires)}.`;
    else memberLine = `Canceled · Pro stays on until ${isoDay(membership.expires)}.`;
  }

  const tight = height < 740;   // iPhone SE / mini: tighter spacing so everything fits on one screen
  const box = { padding: 14, gap: 8, borderRadius: 18, borderWidth: 1, borderColor: C.line, backgroundColor: C.card };
  let plans;
  if (welcome) plans = h(View, { style: [box, { alignItems: 'center' }] }, Row({ gap: 8 }, h(Icon, { name: 'badge', size: 20 }), T({ fontSize: 18, fontWeight: '800' }, 'Welcome to Pro!')), T({ color: C.muted, fontSize: 15, textAlign: 'center' }, welcome));
  else if (isPro) plans = h(View, { style: [box, { alignItems: 'center' }] }, Row({ gap: 8 }, h(Icon, { name: 'badge', size: 20 }), T({ fontSize: 18, fontWeight: '800' }, "You're a Pro member")), T({ color: C.muted, fontSize: 15, textAlign: 'center' }, memberLine));
  else if (!ready) plans = h(PlanSkeleton);
  else if (!source.length) plans = h(View, { style: box },
    Row({ gap: 8 }, h(Icon, { name: 'store', size: 18, color: C.gold }), T({ fontSize: 16, fontWeight: '700' }, storeAvailable ? "Plans Didn't Load" : keyMissing ? 'Purchases Not Set Up Yet' : 'Store Not Connected')),
    T({ color: C.muted, fontSize: 13 }, storeAvailable ? (error || "We couldn't load plans from the store. Check your connection and try again.") : keyMissing ? 'This build has no RevenueCat key, so it can\'t reach the store. Add the public key (appl_… / goog_…) to app.json and build again.' : (Platform.OS === 'ios' ? 'Purchases work in the App Store version of the app.' : 'Purchases work in the Google Play version of the app.') + (__DEV__ ? ' Add your RevenueCat keys in app.json to test them.' : '')),
    storeAvailable && errorDetail ? T({ color: C.faint, fontSize: 11 }, `Details: ${errorDetail}`, { selectable: true }) : null,
    storeAvailable ? h(LinkText, { onPress: reload }, 'Try Again') : null);
  else {
    const pair = [annual, monthly].filter(Boolean), rest = subs.filter(p => p !== quarter && !pair.includes(p));
    plans = h(View, { style: { gap: 10 } },
      quarter ? cardFor(quarter, true) : null,
      lifetime ? cardFor(lifetime, true) : null,
      pair.length === 2 ? Row({ gap: 10, alignItems: 'stretch' }, ...pair.map(p => cardFor(p))) : pair.length === 1 ? cardFor(pair[0], true) : null,
      ...rest.map(p => cardFor(p, true)));
  }

  return h(View, { style: { flex: 1, backgroundColor: C.bg } },
    h(StatusBar, { style: 'light' }),
    h(Backdrop),
    h(ScrollView, { bounces: false, contentContainerStyle: { flexGrow: 1, justifyContent: 'space-between', paddingTop: ins.top + 10, paddingBottom: ins.bottom + 10, paddingHorizontal: 20, gap: tight ? 8 : 12 } },
      h(View, { style: { gap: tight ? 8 : 12 } },
        Row({ gap: 12, paddingRight: 48 },
          h(Image, { source: require('./assets/icon.png'), style: { width: tight ? 44 : 52, height: tight ? 44 : 52, borderRadius: 12 }, accessibilityLabel: 'Rapid Nursing Review app icon' }),
          h(View, { style: { flex: 1 } },
            T({ color: C.cyan, fontSize: 13, letterSpacing: 3.5, fontWeight: '800' }, 'RAPID NURSING REVIEW PRO'),
            T({ color: '#fff', fontSize: tight ? 19 : 21, lineHeight: tight ? 24 : 27, fontWeight: '800' }, 'Pass Your NCLEX-RN on the First Attempt.', { accessibilityRole: 'header' }))),
        T({ color: C.muted, fontSize: tight ? 13 : 14, lineHeight: tight ? 18 : 20 }, 'One retake costs $200 in Pearson VUE fees and months of delayed bedside earnings. Invest in complete exam readiness.'),
        h(View, { style: { gap: tight ? 6 : 8 } }, ...BENEFITS.map(([ic, text]) => Row({ key: ic, gap: 10 },
          h(View, { style: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(6,182,212,0.14)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.35)' } }, h(Icon, { name: ic, size: 16, color: ic === 'steth' ? C.gold : C.cyan })),
          T({ flex: 1, fontSize: tight ? 13.5 : 14.5, fontWeight: '600' }, text)))),
        reason ? T({ color: C.gold, fontSize: 14 }, reason) : null,
        plans),
      h(View, { style: { gap: tight ? 8 : 10 } },
        msg ? h(View, { style: { borderRadius: 14, padding: 10, backgroundColor: 'rgba(251,191,36,0.12)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.4)' } }, T({ fontSize: 14 }, msg)) : null,
        welcome || isPro ? h(Pressable, { onPress: onClose, accessibilityRole: 'button', style: { borderRadius: 20, paddingVertical: 14, alignItems: 'center', backgroundColor: C.cyan } }, T({ color: C.navyInk, fontSize: 19, fontWeight: '800' }, 'Start studying'))
          : chosen ? h(Pressable, { onPress: purchase, disabled: busy, accessibilityRole: 'button', accessibilityLabel: `${ctaTitle}. ${ctaSub}`,
            style: ({ pressed }) => ({ borderRadius: 20, paddingVertical: tight ? 11 : 14, paddingHorizontal: 18, alignItems: 'center', gap: 1, backgroundColor: C.cyan, opacity: busy ? 0.6 : 1,
              shadowColor: C.cyanDeep, shadowOpacity: 0.55, shadowRadius: 20, shadowOffset: { width: 0, height: 4 }, elevation: 6, transform: [{ scale: pressed ? 0.985 : 1 }] }) },
            T({ color: C.navyInk, fontSize: 19, lineHeight: 24, fontWeight: '800', textAlign: 'center' }, ctaTitle),
            T({ color: '#0B3B47', fontSize: 14, lineHeight: 19, textAlign: 'center' }, ctaSub)) : null,
        Row({ gap: 14, justifyContent: 'center' }, h(LinkText, { onPress: doRestore }, 'Restore Purchases'), T({ color: C.faint }, '·'), h(LinkText, { onPress: manage }, 'Manage Subscription')),
        // Apple 3.1.2 terms: billed amount, period, auto-renewal and how to cancel.
        T({ color: C.muted, textAlign: 'center', fontSize: 11.5, lineHeight: 15.5 },
          `${renewLine && !isPro ? renewLine + ' ' : ''}Payment is charged to your ${ACCOUNT} at confirmation of purchase${trial ? ' (for a free trial, when the trial ends)' : ''}. ${Platform.OS === 'ios' ? 'Subscription automatically renews unless canceled in your Apple ID Account Settings at least 24 hours before the end of the current period.' : 'Subscription automatically renews unless canceled in Google Play subscriptions at least 24 hours before the end of the current period.'} The all-access pass is a one-time purchase. Rapid Nursing Review is for education only; it is not medical advice.`),
        // Disclaimer tile: same title, font and gold color as the web app's Disclaimer box.
        h(View, { style: { borderWidth: 1, borderColor: 'rgba(245,158,11,0.5)', backgroundColor: 'rgba(245,158,11,0.10)', borderRadius: 16, padding: 14, gap: 6 } },
          T({ color: '#f59e0b', fontSize: 13, fontWeight: '800', letterSpacing: 1.2, fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) }, 'DISCLAIMER'),
          T({ color: C.ink, fontSize: 12.5, lineHeight: 18 }, 'NCLEX® is a registered trademark of the National Council of State Boards of Nursing, Inc. (NCSBN). Rapid Nursing Review App is not sponsored or endorsed by NCSBN.'),
          T({ color: C.ink, fontSize: 12.5, lineHeight: 18 }, 'Rapid Nursing Review is for education and exam preparation only. It is not medical advice and does not guarantee exam results.')),
        Row({ gap: 10, justifyContent: 'center' }, h(LinkText, { underline: true, color: C.muted, size: 13, onPress: () => open(LINKS.privacy) }, 'Privacy Policy'), T({ color: C.faint }, '·'), h(LinkText, { underline: true, color: C.muted, size: 13, onPress: () => open(LINKS.terms) }, 'Terms of Use (EULA)')),
        __DEV__ ? h(View, { style: { alignItems: 'center' } }, h(LinkText, { size: 13, color: C.faint, onPress: () => setDevUnlock(!devUnlock) }, devUnlock ? 'Dev: Lock Pro Again' : 'Dev: Unlock Pro for Testing')) : null)),
    h(Pressable, { onPress: onClose, accessibilityRole: 'button', accessibilityLabel: 'Close', hitSlop: 8,
      style: { position: 'absolute', top: ins.top + 8, right: 14, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' } },
      h(Icon, { name: 'close', size: 22, color: C.ink })));
}
