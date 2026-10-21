// Builds the public website for https://nclexrapidnursingreview.com (GitHub Pages).
//
//   node scripts/build-webapp.mjs && node scripts/build-site.mjs
//
// Output: build/site/  → copy everything to the root of the website repo (kenyanfreshy/rapid-nursing-review-public)
//   index.html                landing page
//   privacy.html terms.html support.html   from docs/*.md (the .md copies stay for old links)
//   quiz/                     the free NCLEX challenge (from the marketing bot) + the "Get the app" prompt
//   app/                      the web app (build/webapp: sign-in gate + app code, NO questions or book pages)
//   CNAME, .nojekyll          GitHub Pages settings
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DOMAIN = 'nclexrapidnursingreview.com';
// The app's App Store listing (Apple ID 6822172335).
const APP_STORE_URL = process.env.APP_STORE_URL || 'https://apps.apple.com/app/id6822172335';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'build', 'site');
const webapp = path.join(root, 'build', 'webapp');
if (!fs.existsSync(path.join(webapp, 'index.html'))) throw new Error('Run node scripts/build-webapp.mjs first.');

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = s => esc(s)
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*(.+?)\*/g, '<em>$1</em>')
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  .replace(/(^|[\s(])(https:\/\/[^\s<)]+)/g, '$1<a href="$2">$2</a>');
function md(src) {
  const html = []; let list = null, para = [];
  const flushP = () => { if (para.length) { html.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const flushL = () => { if (list) { html.push(`<ul>${list.map(i => `<li>${inline(i)}</li>`).join('')}</ul>`); list = null; } };
  for (const raw of src.split('\n')) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushP(); flushL(); continue; }
    let m;
    if ((m = /^(#{1,3})\s+(.*)$/.exec(line))) { flushP(); flushL(); html.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); continue; }
    if (/^---+$/.test(line)) { flushP(); flushL(); html.push('<hr>'); continue; }
    if ((m = /^\s*[-*]\s+(.*)$/.exec(line))) { flushP(); (list = list || []).push(m[1]); continue; }
    if (list && /^\s{2,}\S/.test(raw)) { list[list.length - 1] += ' ' + line.trim(); continue; }
    flushL(); para.push(line.trim());
  }
  flushP(); flushL();
  return html.join('\n');
}
const CSS = `:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:0;font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;background:#f6f7fb;color:#151a2d}
a{color:#0e7490}main{max-width:760px;margin:0 auto;padding:32px 16px 64px}header.site{background:#080b16;color:#eef1fa}header.site .in{max-width:760px;margin:0 auto;padding:14px 16px;display:flex;gap:12px;align-items:center}
header.site a{color:#eef1fa;text-decoration:none;font-weight:700}header.site img{width:28px;height:auto;border-radius:3px}header.site nav{margin-left:auto;display:flex;gap:14px;font-size:14px}header.site nav a{font-weight:500;color:#cbd2e6}
h1{font-size:30px;line-height:1.2;letter-spacing:-.02em}h2{margin-top:32px;font-size:21px}footer{color:#5b6478;font-size:13px;border-top:1px solid #dde1ea;margin-top:40px;padding-top:16px}
.hero{display:grid;grid-template-columns:150px 1fr;gap:24px;align-items:center}.hero img{width:150px;height:auto;border-radius:8px;box-shadow:0 18px 40px rgba(8,11,22,.25)}
.btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}.btn{display:inline-flex;align-items:center;min-height:46px;padding:0 18px;border-radius:12px;background:#080b16;color:#fff;text-decoration:none;font-weight:700}.btn.alt{background:transparent;color:#151a2d;border:1px solid #c9cfdd}
.feat{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-top:28px}.feat div{background:#fff;border:1px solid #e1e5ef;border-radius:14px;padding:14px}.feat b{display:block}
@media (max-width:560px){.hero{grid-template-columns:1fr}.hero img{width:120px}header.site nav{gap:10px}}
@media (prefers-color-scheme:dark){body{background:#0b0f1d;color:#e6e9f3}a{color:#67e8f9}.btn.alt{color:#e6e9f3;border-color:#39415f}.feat div{background:#111527;border-color:#232a44}footer{border-color:#232a44;color:#9aa3bd}}`;
const page = (title, body, desc = 'Rapid Nursing Review: NCLEX-RN practice questions with a rationale for every answer, from the book Rapid Nursing Review: All Body Systems at a Glance.') => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="icon" type="image/png" href="/app/favicon.png"><link rel="apple-touch-icon" href="/app/apple-touch-icon.png">
<style>${CSS}</style></head><body>
<header class="site"><div class="in"><img src="/app/pages/logo.webp" alt=""><a href="/">Rapid Nursing Review</a><nav><a href="/quiz/">Free quiz</a><a href="/app/">Web app</a><a href="/support.html">Support</a><a href="/privacy.html">Privacy</a></nav></div></header>
<main>${body}
<footer>© ${new Date().getFullYear()} Alex K. Korir · <a href="/terms.html">Terms</a> · <a href="/privacy.html">Privacy</a><br>NCLEX® is a registered trademark of the National Council of State Boards of Nursing, Inc. (NCSBN). Rapid Nursing Review App is not sponsored or endorsed by NCSBN.</footer></main></body></html>\n`;

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync(webapp, path.join(out, 'app'), { recursive: true });

const landing = `<section class="hero"><img src="/app/pages/cover.webp" alt="Rapid Nursing Review: All Body Systems at a Glance, book cover" width="150" height="225">
<div><h1>Prepare to pass the NCLEX-RN on your first try</h1>
<p>3,200 NCLEX-style questions with a rationale for every answer, 30 Next Generation NCLEX case studies, a daily study plan and the complete book <em>Rapid Nursing Review: All Body Systems at a Glance</em> by Alex K. Korir, MSN, RN, CCRN-CMC.</p>
<div class="btns"><a class="btn" href="${APP_STORE_URL}">Get it on the App Store</a><a class="btn alt" href="/quiz/">Try the free NCLEX challenge</a><a class="btn alt" href="/app/">Open the web app (Pro)</a></div></div></section>
<div class="feat"><div><b>Book-linked rationales</b>Missed one? Open the exact textbook page.</div><div><b>Next Generation NCLEX</b>Bow-tie, matrix, select-all and cloze items in unfolding cases.</div><div><b>Study plan</b>Built to your exam date, with reminders and streaks.</div><div><b>iPhone and computer</b>Pro subscribers sign in with Apple and continue on any computer.</div></div>
<h2>Using the web app</h2><p>The web app is for Rapid Nursing Review Pro subscribers. Subscribe in the iPhone app, then open <strong>Settings → Sync and web access</strong> and tap <strong>Sign in with Apple</strong>. On your computer, go to <a href="/app/">${DOMAIN}/app</a> and sign in with the same Apple ID. Your progress follows you.</p>`;
fs.writeFileSync(path.join(out, 'index.html'), page('Rapid Nursing Review · NCLEX-RN review app', landing));
// ---- /quiz/: the free NCLEX challenge, moved from rapidnursingreview.netlify.app ----
{
  let q = fs.readFileSync(path.join(root, 'web', 'quiz', 'challenge-original.html'), 'utf8');
  const must = (cond, what) => { if (!cond) throw new Error(`quiz: ${what} not found in web/quiz/challenge-original.html; update build-site.mjs`); };
  q = q.replace(/<!--\s*This site is hosted on Netlify[\s\S]*?-->\s*/, '').replace(/<script[^>]*\/\.netlify\/scripts\/[^>]*><\/script>/g, '');
  must(q.includes('(0,Ap.jsx)(qc,{})'), 'the render call');
  const props = { appStoreUrl: APP_STORE_URL, privacyUrl: `https://${DOMAIN}/privacy.html`, launchWaitlist: false };
  q = q.replace('(0,Ap.jsx)(qc,{})', () => `(0,Ap.jsx)(qc,${JSON.stringify(props)})`);
  q = q.split('https://github.com/kenyanfreshy/rapid-nursing-review-public/blob/main/PRIVACY.md').join(`https://${DOMAIN}/privacy.html`);
  must(q.includes('<title>NCLEX Challenge Quiz</title>'), 'the title');
  q = q.replace('<title>NCLEX Challenge Quiz</title>', `<title>Free NCLEX-RN Challenge · Rapid Nursing Review</title><meta name="description" content="3 timed NCLEX-RN questions from the 3,200-question Rapid Nursing Review bank, with instant rationales. Free, no sign-up."><link rel="icon" type="image/png" href="/app/favicon.png"><link rel="apple-touch-icon" href="/app/apple-touch-icon.png"><link rel="canonical" href="https://${DOMAIN}/quiz/">`);
  const prompt = fs.readFileSync(path.join(root, 'web', 'quiz', 'app-prompt.js'), 'utf8');
  must(q.lastIndexOf('</body>') > 0, '</body>');
  const at = q.lastIndexOf('</body>');
  q = q.slice(0, at) + `<script>window.__RNR_APP_STORE__=${JSON.stringify(APP_STORE_URL)};</script>\n<script>\n${prompt}\n</script>\n` + q.slice(at);
  if (/netlify/i.test(q.replace(/rapidnursingreview\.netlify\.app/g, ''))) console.warn('quiz: page still mentions netlify');
  fs.mkdirSync(path.join(out, 'quiz'), { recursive: true });
  fs.writeFileSync(path.join(out, 'quiz', 'index.html'), q);
}

for (const [name, title] of [['PRIVACY', 'Privacy Policy'], ['TERMS', 'Terms of Use'], ['SUPPORT', 'Support']]) {
  const src = fs.readFileSync(path.join(root, 'docs', `${name}.md`), 'utf8');
  fs.writeFileSync(path.join(out, `${name.toLowerCase()}.html`), page(`${title} · Rapid Nursing Review`, md(src)));
  fs.writeFileSync(path.join(out, `${name}.md`), src.replace(/\]\((privacy|terms|support)\.html\)/g, (_, n) => `](${n.toUpperCase()}.md)`));
}
fs.writeFileSync(path.join(out, 'CNAME'), DOMAIN + '\n');
fs.writeFileSync(path.join(out, '.nojekyll'), '');
fs.writeFileSync(path.join(out, 'robots.txt'), 'User-agent: *\nDisallow: /app/\n');
for (const f of fs.readdirSync(out, { recursive: true })) if (/p\d{3}\.webp$|content\.json$/.test(f)) throw new Error(`private file in the site: ${f}`);
console.log(`Site build/site: ${fs.readdirSync(out).join(', ')}  (domain ${DOMAIN})`);
