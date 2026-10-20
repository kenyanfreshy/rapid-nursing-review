// Rapid Nursing Review — native shell.
// The study app itself is the offline web bundle in assets/web (built from ../dist by
// scripts/build-web.mjs). On first launch, and after each app update, those files are copied
// into the app's private document folder and opened in a WebView from there, so everything
// (book pages, quizzes, progress) works without a network connection.
//
// Written with React.createElement instead of JSX so it can be checked with `node --check`.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, BackHandler, Linking, Modal, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WEB_FILES, WEB_VERSION } from './assets/web/manifest';
import { ProProvider, usePro } from './pro';
import Paywall from './Paywall';
import { rating } from './rating';

const h = React.createElement;
const STORAGE_KEY = 'rapid-nursing-review-v1';
const WEB_ROOT = `${FileSystem.documentDirectory}web/`;
const WEB_DIR = `${WEB_ROOT}${WEB_VERSION}/`;
const COLORS = { ink: '#eef1fa', green: '#22d3ee', paper: '#080b16', muted: '#9aa3bd' };   // dark NurseBound theme, so loading matches the app

SplashScreen.preventAutoHideAsync().catch(() => {});

// Copy the bundled web files into WEB_DIR once per app version.
async function prepareWebFiles(onProgress) {
  const marker = `${WEB_DIR}.complete`;
  if ((await FileSystem.getInfoAsync(marker)).exists) return;
  await FileSystem.deleteAsync(WEB_ROOT, { idempotent: true });
  await FileSystem.makeDirectoryAsync(`${WEB_DIR}pages`, { intermediates: true });
  const entries = Object.entries(WEB_FILES);
  let done = 0;
  for (let i = 0; i < entries.length; i += 8) {
    await Promise.all(entries.slice(i, i + 8).map(async ([relPath, moduleId]) => {
      const asset = Asset.fromModule(moduleId);
      await asset.downloadAsync();
      await FileSystem.copyAsync({ from: asset.localUri || asset.uri, to: WEB_DIR + relPath });
      done += 1;
    }));
    onProgress(done / entries.length);
  }
  await FileSystem.writeAsStringAsync(marker, WEB_VERSION);
}

// Study reminders: weekly local notifications at the time and days the student picks in Settings.
let Notifications = null;
try { Notifications = require('expo-notifications'); } catch (e) { Notifications = null; }
if (Notifications) {
  Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
}
let lastReminder = '';
async function scheduleReminder({ on, time, days, body }) {
  if (!Notifications) return;
  const key = JSON.stringify([on, time, days]);
  if (key === lastReminder) return;                        // unchanged: keep the existing schedule
  lastReminder = key;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!on || !Array.isArray(days) || !days.length || !/^\d\d:\d\d$/.test(time || '')) return;
  let perm = await Notifications.getPermissionsAsync();
  if (!perm.granted && perm.canAskAgain !== false) perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return;
  const [hour, minute] = time.split(':').map(Number);
  for (const d of days) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Time to study', body: (typeof body === 'string' && body) || 'Your Rapid Nursing Review session is ready. One more question today.' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: d + 1, hour, minute },   // weekday: 1 = Sunday
    });
  }
}

let Calendar = null;
try { Calendar = require('expo-calendar'); } catch (e) { Calendar = null; }

/** Open the iPhone's own "New Event" screen with the user's study event filled in (title, notes, time, weekly days, alert).
 *  The user can edit anything there and pick which of their calendars (iCloud, Gmail, Outlook...) to save it to.
 *  Falls back to the .ics share sheet if the calendar module isn't available. Returns 'saved', 'canceled' or 'shared'. */
async function addCalendarEvent(ev, filename, ics) {
  if (Calendar?.createEventInCalendarAsync && ev && typeof ev.title === 'string') {
    const startDate = new Date(ev.start), endDate = new Date(ev.end);
    if (!isNaN(startDate) && !isNaN(endDate)) {
      const days = Array.isArray(ev.days) ? ev.days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6) : [];
      const data = {
        title: ev.title.slice(0, 80), notes: typeof ev.notes === 'string' ? ev.notes.slice(0, 800) : '', startDate, endDate,
        timeZone: typeof ev.timeZone === 'string' && ev.timeZone ? ev.timeZone : undefined,
        alarms: [{ relativeOffset: 0 }],
        recurrenceRule: { frequency: 'weekly', ...(days.length ? { daysOfTheWeek: days.map((d) => ({ dayOfTheWeek: d + 1 })) } : {}) },   // 1 = Sunday
      };
      try { return (await Calendar.createEventInCalendarAsync(data))?.action || 'done'; }
      catch (e) {
        try {
          const { status } = await Calendar.requestCalendarPermissionsAsync();
          if (status === 'granted') return (await Calendar.createEventInCalendarAsync(data))?.action || 'done';
        } catch (e2) {}
      }
    }
  }
  if (typeof ics === 'string') { await shareCalendar(filename, ics); return 'shared'; }
  return 'canceled';
}

/** Save the repeating study event and open the share sheet, where "Add to Calendar" / Calendar is offered. */
async function shareCalendar(filename, data) {
  const uri = `${FileSystem.cacheDirectory}${filename.replace(/[^\w.-]/g, '_')}`;
  await FileSystem.writeAsStringAsync(uri, data);
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'text/calendar', dialogTitle: 'Add your study reminder to Calendar', UTI: 'com.apple.ical.ics' });
}

async function shareExport(filename, data) {
  const uri = `${FileSystem.cacheDirectory}${filename.replace(/[^\w.-]/g, '_')}`;
  await FileSystem.writeAsStringAsync(uri, data);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Export your study progress', UTI: 'public.json' });
  }
}

// Sign in with Apple, iOS only. A random nonce is hashed with SHA-256 for Apple; the raw value goes to
// Supabase with the identity token so Supabase can check it. Returns a plain object for the web layer.
async function appleSignIn() {
  try {
    const Apple = require('expo-apple-authentication');
    const Crypto = require('expo-crypto');
    if (Platform.OS !== 'ios' || !(await Apple.isAvailableAsync())) return { ok: false, error: 'Sign in with Apple is not available on this device.' };
    const rawNonce = Crypto.randomUUID() + Crypto.randomUUID();
    const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
    const cred = await Apple.signInAsync({ requestedScopes: [Apple.AppleAuthenticationScope.FULL_NAME, Apple.AppleAuthenticationScope.EMAIL], nonce: hashed });
    if (!cred.identityToken) return { ok: false, error: 'Apple did not return a sign-in token. Try again.' };
    return { ok: true, identityToken: cred.identityToken, rawNonce, authorizationCode: cred.authorizationCode || null, givenName: cred.fullName?.givenName || null };
  } catch (e) {
    return { ok: false, cancelled: e?.code === 'ERR_REQUEST_CANCELED', error: String(e?.message || e) };
  }
}

// Screenshot and screen-recording protection for the book pages only (expo-screen-capture).
// iOS 13+: screenshots and recordings of the app come out blank; Android: FLAG_SECURE.
let ScreenCapture = null;
try { ScreenCapture = require('expo-screen-capture'); } catch (e) { ScreenCapture = null; }
// If the paywall ever throws while drawing (for example on store data we didn't expect), show a short message with
// the error instead of letting the whole app close, and keep the details so they can be reported.
class PaywallGuard extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { try { console.error('Paywall error', err, info && info.componentStack); } catch (e) {} }
  render() {
    if (!this.state.err) return this.props.children;
    const msg = String((this.state.err && (this.state.err.message || this.state.err)) || 'Unknown error').slice(0, 300);
    return h(View, { style: { flex: 1, backgroundColor: '#0B0F19', padding: 24, justifyContent: 'center', gap: 14 } },
      h(Text, { style: { color: '#F1F5F9', fontSize: 20, fontWeight: '800' } }, 'The plans screen hit a problem'),
      h(Text, { style: { color: '#A9B4C8', fontSize: 15, lineHeight: 21 } }, 'Nothing was charged. Close this and try again. If it keeps happening, email alexkorirbooks@gmail.com with the details below.'),
      h(Text, { selectable: true, style: { color: '#7C879C', fontSize: 12 } }, `Details: ${msg}`),
      h(Pressable, { onPress: this.props.onClose, accessibilityRole: 'button', style: { marginTop: 8, borderRadius: 16, paddingVertical: 14, alignItems: 'center', backgroundColor: '#22D3EE' } },
        h(Text, { style: { color: '#04131A', fontSize: 17, fontWeight: '800' } }, 'Close')));
  }
}

function setBookProtection(on) {
  if (!ScreenCapture) return;
  (on ? ScreenCapture.preventScreenCaptureAsync('book') : ScreenCapture.allowScreenCaptureAsync('book')).catch(() => {});
}

function Study() {
  const insets = useSafeAreaInsets();
  const webRef = useRef(null);
  const canGoBack = useRef(false);
  const saveTimer = useRef(null);
  const [saved, setSaved] = useState(undefined);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [paywall, setPaywall] = useState(null);   // { reason } while the native paywall is open
  const [ui, setUi] = useState({ light: false, bg: COLORS.paper });   // page theme: status bar text and edge color
  const { isPro, linkAccount } = usePro();

  const load = useCallback(async () => {
    setError(null);
    try {
      const [savedState] = await Promise.all([AsyncStorage.getItem(STORAGE_KEY), prepareWebFiles(setProgress)]);
      setSaved(savedState);
      setReady(true);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { rating.init().catch(() => {}); }, []);

  // Tell the study app whenever Pro status changes (purchase, restore, renewal, expiry).
  useEffect(() => {
    if (ready && webRef.current) webRef.current.injectJavaScript(`window.__rnrSetPro && window.__rnrSetPro(${isPro ? 'true' : 'false'});true;`);
  }, [isPro, ready]);

  // Back in the foreground: let the study app sync progress if the learner signed in.
  useEffect(() => {
    const sub = AppState.addEventListener('change', st => {
      if (st === 'active' && ready) webRef.current?.injectJavaScript('window.__rnrResume && window.__rnrResume();true;');
    });
    return () => sub.remove();
  }, [ready]);

  // Android back button: go back inside the app's own pages before leaving the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack.current && webRef.current) { webRef.current.goBack(); return true; }
      return false;
    });
    return () => sub.remove();
  }, []);

  const onMessage = useCallback(event => {
    let msg;
    try { msg = JSON.parse(event.nativeEvent.data); } catch { return; }
    if (msg.type === 'save' && typeof msg.data === 'string') {
      // Debounce writes; the latest state wins.
      clearTimeout(saveTimer.current);
      const data = msg.data;
      saveTimer.current = setTimeout(() => { AsyncStorage.setItem(STORAGE_KEY, data).catch(() => {}); }, 250);
    } else if (msg.type === 'paywall') {
      setPaywall({ reason: typeof msg.reason === 'string' ? msg.reason.slice(0, 160) : '' });
    } else if (msg.type === 'reminder') {
      scheduleReminder(msg).catch(() => {});
    } else if (msg.type === 'calendar' && typeof msg.data === 'string') {
      addCalendarEvent(msg.event, msg.filename || 'study-reminder.ics', msg.data)
        .then((action) => webRef.current?.injectJavaScript(`window.__rnrCalendarResult && window.__rnrCalendarResult(${JSON.stringify(String(action))});true;`))
        .catch(() => {});
    } else if (msg.type === 'mail' && typeof msg.to === 'string' && /^[^@\s]+@[^@\s]+$/.test(msg.to)) {
      Linking.openURL(`mailto:${msg.to}?subject=${encodeURIComponent(String(msg.subject || '').slice(0, 120))}`).catch(() => {});
    } else if (msg.type === 'share' && typeof msg.message === 'string') {
      const text = msg.message.slice(0, 600), subject = typeof msg.subject === 'string' ? msg.subject.slice(0, 120) : 'My study progress';
      if (msg.mode === 'email') Linking.openURL(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`).catch(() => Share.share({ message: text }).catch(() => {}));
      else Share.share({ message: text }).catch(() => {});
    } else if (msg.type === 'ui') {
      setUi({ light: !!msg.light, bg: typeof msg.bg === 'string' && /^(#|rgb)/.test(msg.bg) ? msg.bg : COLORS.paper });
    } else if (msg.type === 'book-visible') {
      // A book page is on screen: block screenshots (iOS 13+, Android) and screen recording / mirroring.
      setBookProtection(!!msg.on);
    } else if (msg.type === 'apple-signin') {
      // Sign in with Apple (iOS). The web layer exchanges the identity token with Supabase.
      appleSignIn().then(r => webRef.current?.injectJavaScript(`window.__rnrAppleResult && window.__rnrAppleResult(${JSON.stringify(r)});true;`));
    } else if (msg.type === 'account') {
      // Signed in: attach purchases to the account id in RevenueCat (signed out: nothing to undo).
      if (typeof msg.userId === 'string' && /^[0-9a-f-]{36}$/i.test(msg.userId)) linkAccount(msg.userId);
    } else if (msg.type === 'session-complete') {
      // A session or NGN case just finished: maybe ask for an App Store rating (rules in rating/nclexRatingService.js).
      const r = { kind: msg.kind === 'case' ? 'case' : 'session', correct: Number(msg.correct) || 0, total: Number(msg.total) || 0, points: Number(msg.points), max: Number(msg.max) };
      setTimeout(() => { rating.onSessionComplete(r).catch(() => {}); }, rating.config.PROMPT_DELAY_MS);
    } else if (msg.type === 'rate-app') {
      rating.openWriteReview().catch(() => {});
    } else if (msg.type === 'export' && typeof msg.data === 'string') {
      shareExport(msg.filename || 'rapid-nursing-review.json', msg.data).catch(() => {});
    }
  }, [linkAccount]);

  // Keep the app on its local files; open web links (sources, references) in the browser.
  const onShouldStart = useCallback(req => {
    if (/^(https?|mailto|tel|sms):/i.test(req.url)) { Linking.openURL(req.url).catch(() => {}); return false; }
    return true;
  }, []);

  const pad = { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right };

  if (error) {
    return h(View, { style: [styles.center, pad] },
      h(Text, { style: styles.title }, 'The study space could not open'),
      h(Text, { style: styles.body }, 'Your saved progress is safe. Try again, and restart the app if this keeps happening.'),
      h(Text, { style: styles.detail }, error),
      h(Pressable, { onPress: load, style: styles.button, accessibilityRole: 'button' }, h(Text, { style: styles.buttonText }, 'Try again')));
  }
  if (!ready) {
    return h(View, { style: [styles.center, pad] },
      h(ActivityIndicator, { color: COLORS.green }),
      h(Text, { style: styles.body }, progress > 0 ? `Preparing your book… ${Math.round(progress * 100)}%` : 'Opening your study space…'));
  }

  // Runs before the page script: hands the web app its native copy of saved progress.
  const boot = `window.__RNR_SAVED__=${JSON.stringify(saved ?? null)};window.__RNR_PRO__=${isPro ? 'true' : 'false'};window.__RNR_OS__=${JSON.stringify(Platform.OS)};true;`;
  // Edge to edge: the page fills the whole screen, under the status bar and home indicator, so its colors follow the
  // phone's rounded corners. The page pads its own top bar and tab bar with env(safe-area-inset-*).
  return h(View, { style: [styles.fill, { backgroundColor: ui.bg }] },
    h(StatusBar, { style: ui.light ? 'dark' : 'light' }),
    h(WebView, {
      contentInsetAdjustmentBehavior: 'never',
      automaticallyAdjustContentInsets: false,
      ref: webRef,
      source: { uri: `${WEB_DIR}index.html` },
      originWhitelist: ['*'],
      allowFileAccess: true,
      allowFileAccessFromFileURLs: true,
      allowingReadAccessToURL: WEB_ROOT,
      javaScriptEnabled: true,
      domStorageEnabled: true,
      injectedJavaScriptBeforeContentLoaded: boot,
      onMessage,
      onShouldStartLoadWithRequest: onShouldStart,
      onNavigationStateChange: nav => { canGoBack.current = nav.canGoBack; },
      setSupportMultipleWindows: false,
      allowsBackForwardNavigationGestures: true,
      textZoom: 100,
      overScrollMode: 'never',
      style: [styles.fill, { backgroundColor: ui.bg }],
      onContentProcessDidTerminate: () => webRef.current?.reload(),
      onRenderProcessGone: () => { webRef.current?.reload(); return true; },
    }),
    h(Modal, { visible: !!paywall, animationType: 'slide', presentationStyle: 'fullScreen', onRequestClose: () => setPaywall(null) },
      h(PaywallGuard, { onClose: () => setPaywall(null) }, h(Paywall, { reason: paywall?.reason, onClose: () => setPaywall(null) }))));
}

export default function App() {
  return h(SafeAreaProvider, null, h(ProProvider, null, h(StatusBar, { style: 'light' }), h(Study)));
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: COLORS.paper },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 28, backgroundColor: COLORS.paper },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.ink, textAlign: 'center' },
  body: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
  detail: { fontSize: 11, color: COLORS.muted, textAlign: 'center', fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) },
  button: { backgroundColor: COLORS.green, paddingVertical: 12, paddingHorizontal: 22, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 14 },
});
