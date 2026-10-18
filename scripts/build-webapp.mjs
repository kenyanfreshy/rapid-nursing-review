// Builds the web app (https://nclexrapidnursingreview.com/app/) from the same code the phone runs.
//
//   node scripts/build-webapp.mjs
//
// Output (both folders are git-ignored):
//   build/webapp/            PUBLIC. Goes to the website repo under app/. Contains NO questions and NO
//                            book pages: index.html (sign-in gate) + app.<hash>.js (the app code) +
//                            the cover, logos and tutor photo.
//   build/webapp-private/    PRIVATE. Upload to Supabase Storage (never to GitHub):
//                              content/content.json        → bucket `content` (Pro accounts only)
//                              book/rnr/pages/pNNN.webp    → bucket `book` (read only by book-page)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const pub = path.join(root, 'build', 'webapp');
const priv = path.join(root, 'build', 'webapp-private');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

// Same as mobile/scripts/build-web.mjs: ES modules → plain statements.
const unmodule = src => src
  .split('\n')
  .filter(line => !/^\s*import\s.*from\s+['"]/.test(line) && !/^\s*export\s*\{.*\}\s*from\s+['"]/.test(line))
  .join('\n')
  .replace(/^export const /gm, 'const ');
const noModules = (name, src) => { if (/^\s*(import|export)\s/m.test(src)) throw new Error(`${name}: import/export left after unmodule`); return src; };

// ---- private content: both question banks, read from the generated modules ----
const book = await import(pathToFileURL(path.join(dist, 'book.js')).href);
const nclex = await import(pathToFileURL(path.join(dist, 'nclex.js')).href);
const content = {
  BOOK_ACCESS: 'full',
  book: book.book, clientNeeds: book.clientNeeds, chapters: book.chapters, bookQuestions: book.bookQuestions,
  nclexTopics: nclex.nclexTopics, nclexBank: nclex.nclexBank, ngnCases: nclex.ngnCases, nclexRefs: nclex.nclexRefs,
};
for (const [k, v] of Object.entries(content)) if (v == null) throw new Error(`content.json: ${k} is missing`);

// ---- the app bundle (public, no content) ----
const CONTENT_NAMES = Object.keys(content).filter(k => k !== 'BOOK_ACCESS');
let appJs = unmodule(read('dist/app.js')).replace('const PREVIEW_UNLOCK = true;', 'const PREVIEW_UNLOCK = false;');
if (!appJs.includes('const PREVIEW_UNLOCK = false;')) throw new Error('PREVIEW_UNLOCK flag not found in app.js');
const appBundle = `window.__RNR_WEB__=true;
(function(){
'use strict';
const {${CONTENT_NAMES.join(',')},pageText}=window.__RNR_CONTENT__;
const BOOK_ACCESS='full';
${noModules('data.js', unmodule(read('dist/data.js')))}
const lessons=retiredLessons;
${noModules('config.js', unmodule(read('dist/config.js')))}
${noModules('sync.js', unmodule(read('dist/sync.js')))}
// One account instance for the whole page: the gate's (a second copy would refresh tokens twice).
const Account=window.__RNR_ACCOUNT__;
${noModules('app.js', appJs)}
})();`;
for (const leak of ['"stem":', 'bookQuestions=[', 'nclexBank=[']) if (appBundle.includes(leak)) throw new Error(`app bundle contains content (${leak})`);
const appName = `app.${crypto.createHash('sha256').update(appBundle).digest('hex').slice(0, 10)}.js`;

// ---- the gate (inline in index.html) ----
const gateJs = `(function(){
'use strict';
${noModules('config.js', unmodule(read('dist/config.js')))}
${noModules('sync.js', unmodule(read('dist/sync.js')))}
${noModules('account.js', unmodule(read('dist/account.js')))}
window.__RNR_WEB__=true;window.__RNR_ACCOUNT__=Account;
${noModules('web/reader.js', unmodule(read('web/reader.js')))}
${noModules('web/gate.js', unmodule(read('web/gate.js')))}
WebReader.start();Gate.start();
})();`;

// ---- index.html: the app's own shell (hidden) + the gate on top ----
const html = read('dist/index.html');
const css = read('dist/styles.css'), themeCss = read('dist/nb-theme.css'), gateCss = read('web/gate.css');
const marker = `RNR-WEBAPP-BUILD ${new Date().toISOString().slice(0, 10)} ${appName}`;
let page = html
  .replace('<title>Rapid Nursing Review</title>', '<title>Rapid Nursing Review · Web</title>\n  <meta name="robots" content="noindex">')
  .replace(/<link rel="stylesheet" href="\.\/styles\.css">/, () => `<style>\n${css}\n${gateCss}\n</style>`)
  .replace(/<link rel="stylesheet" href="\.\/nb-theme\.css" id="nb-theme">/, () => `<style id="nb-theme">\n${themeCss}\n</style>`)
  .replace('<body>', `<body class="gate-on">\n<!-- ${marker} -->\n<div id="rnr-gate" role="main"></div>`)
  .replace(/<script type="module" src="\.\/app\.js"><\/script>/, () =>
    `<script>window.__RNR_APP_JS__=${JSON.stringify(appName)};</script>\n<script>\n${gateJs.replace(/<\/script/gi, '<\\/script')}\n</script>`);
if (page.includes('type="module"') || !page.includes('id="rnr-gate"') || page.includes('nb-theme.css">')) throw new Error('dist/index.html did not match the expected shell; update build-webapp.mjs');
// The footer says "Saved on this device"; on the web progress lives in the account.
page = page.replace('<span class="footer-dot">•</span> Saved on this device', '<span class="footer-dot">•</span> Synced with your account');

fs.rmSync(pub, { recursive: true, force: true });
fs.rmSync(priv, { recursive: true, force: true });
fs.mkdirSync(path.join(pub, 'pages'), { recursive: true });
fs.writeFileSync(path.join(pub, 'index.html'), page);
fs.writeFileSync(path.join(pub, appName), appBundle);
for (const f of ['favicon.png', 'apple-touch-icon.png']) fs.copyFileSync(path.join(dist, f), path.join(pub, f));
// Public images only: cover, logos, tutor photo. Book pages (pNNN.webp) never go in the public folder.
for (const f of fs.readdirSync(path.join(dist, 'pages'))) if (!/^p\d{3}\.webp$/.test(f)) fs.copyFileSync(path.join(dist, 'pages', f), path.join(pub, 'pages', f));

fs.mkdirSync(path.join(priv, 'content'), { recursive: true });
fs.mkdirSync(path.join(priv, 'book', 'rnr', 'pages'), { recursive: true });
fs.writeFileSync(path.join(priv, 'content', 'content.json'), JSON.stringify(content));
let pages = 0;
for (const f of fs.readdirSync(path.join(dist, 'pages')).sort()) if (/^p\d{3}\.webp$/.test(f)) { fs.copyFileSync(path.join(dist, 'pages', f), path.join(priv, 'book', 'rnr', 'pages', f)); pages++; }

// Last check: nothing private in the public folder.
for (const f of fs.readdirSync(pub, { recursive: true })) {
  if (/^pages\/p\d{3}\.webp$/.test(f) || /content\.json$/.test(f)) throw new Error(`private file in the public folder: ${f}`);
}
const kb = f => Math.round(fs.statSync(f).size / 1024);
console.log(`Public  build/webapp: index.html (${kb(path.join(pub, 'index.html'))} KB), ${appName} (${kb(path.join(pub, appName))} KB), ${fs.readdirSync(path.join(pub, 'pages')).length} images`);
console.log(`Private build/webapp-private: content/content.json (${kb(path.join(priv, 'content', 'content.json'))} KB), ${pages} book pages`);
console.log(`Marker: ${marker}`);
