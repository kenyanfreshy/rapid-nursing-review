import { courses, sections, questions, retiredLessons as lessons, sources, book, BOOK_ACCESS, pageText, clientNeeds, nclexTopics, ngnCases } from './data.js';

const paths = {
 dashboard:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
 practice:'M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3 M16 2l6 6 M10 14l2-5 6-6 4 4-6 6-6 1z',
 calendar:'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M7 14h2 M12 14h2 M7 18h2',
 chart:'M4 3v18h17 M8 16v-5 M13 16V7 M18 16v-9',
 bookmark:'M6 3h12v18l-6-4-6 4V3z',
 book:'M3 4c3-1 6-1 9 1 3-2 6-2 9-1v16c-3-1-6-1-9 1-3-2-6-2-9-1V4z M12 5v16',
 search:'M21 21l-5-5 M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z',
 bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
 help:'M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4 M12 17h.01 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
 arrow:'M4 12h16 M14 6l6 6-6 6',
 chevron:'M9 6l6 6-6 6',
 shield:'M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4z M8 12l3 3 5-6',
 pill:'M9 4a6 6 0 0 1 8 8l-5 5a6 6 0 0 1-8-8l5-5z M7 7l9 9',
 heart:'M12 21S2 15 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 7-10 13-10 13z M3 12h5l2-4 3 8 2-4h6',
 clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2',
 spark:'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z',
 flame:'M12 2c1 5 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 3 1 4 2 4 2-3 2-5 1-10z',
 target:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M12 11v2',
 close:'M6 6l12 12 M18 6L6 18',
 check:'M5 12l4 4L19 6',
 flag:'M5 22V3c5-3 9 4 14 0v10c-5 4-9-3-14 0',
 menu:'M3 6h18 M3 12h18 M3 18h18',
 download:'M12 3v12 M7 10l5 5 5-5 M4 17v4h16v-4',
 edit:'M14 4l6 6 M4 20l5-1L21 7l-4-4L5 15l-1 5z',
 refresh:'M20 4v6h-6 M4 20v-6h6 M5 8a8 8 0 0 1 14-3 M19 16a8 8 0 0 1-14 3',
 play:'M7 4l13 8-13 8V4z',
 crown:'M3 8l4 4 5-7 5 7 4-4-2 11H5L3 8z',
 stethoscope:'M6 3v6a5 5 0 0 0 10 0V3 M11 14v2a5 5 0 0 0 10 0v-2 M21 12a2 2 0 1 0 0-.01',
 layers:'M12 3l9 5-9 5-9-5 9-5z M3 13l9 5 9-5 M3 17l9 5 9-5',
 lungs:'M12 3v8 M12 11l-3 2 M12 11l3 2 M9 6C5 6 3 12 3 17c0 2 1 3 3 3 2 0 3-1 3-3V6z M15 6c4 0 6 6 6 11 0 2-1 3-3 3-2 0-3-1-3-3V6z',
 stomach:'M9 3v5c0 2-4 3-4 8a5 5 0 0 0 10 2c1-2 3-2 4-1 1-4-1-7-4-7-2 0-3-1-3-3V3',
 gland:'M7 5c-3 1-4 5-2 8l3 5h8l3-5c2-3 1-7-2-8-2 0-3 1-5 3-2-2-3-3-5-3z M12 8v10',
 kidney:'M9 4C5 4 4 8 4 12s1 8 5 8c3 0 4-2 3-5-1-2 1-3 1-6 0-3-1-5-4-5z M13 12h4 M17 12v8',
 brain:'M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1z M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1',
 drop:'M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z',
 skin:'M3 14c3-2 6-2 9 0s6 2 9 0 M3 19c3-2 6-2 9 0s6 2 9 0 M8 4l1 5 M15 4l-1 5',
 bone:'M7 7l10 10 M5 9a2 2 0 1 1 2-4 2 2 0 1 1 4 2 M19 15a2 2 0 1 1-2 4 2 2 0 1 1-4-2',
 beaker:'M9 3h6 M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3 M7 15h10',
 sun:'M12 3v2 M12 19v2 M3 12h2 M19 12h2 M5.6 5.6l1.4 1.4 M17 17l1.4 1.4 M5.6 18.4L7 17 M17 7l1.4-1.4 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
 trophy:'M8 21h8 M12 17v4 M7 4h10v5a5 5 0 0 1-10 0V4z M7 6H4a3 3 0 0 0 3 4 M17 6h3a3 3 0 0 1-3 4',
 library:'M4 4v16 M8 4v16 M12 4v16 M15 5l4 15',
 bulb:'M9 18h6 M10 21h4 M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z',
 xcircle:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M9 9l6 6 M15 9l-6 6',
 checkcircle:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M8 12l3 3 5-6',
 grad:'M2 9l10-5 10 5-10 5-10-5z M6 11v5c3 2 9 2 12 0v-5 M22 9v6',
 back:'M20 12H4 M10 6l-6 6 6 6',
 lock:'M6 11h12v10H6z M8 11V7a4 4 0 0 1 8 0v4'
};
const icon = (name, cls='') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.book}"/></svg>`;
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dayKey = (date=new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const parseDay = day => new Date(`${day}T12:00:00`);
const addDays = (date,n) => { const d = new Date(date); d.setDate(d.getDate()+n); return d; };
const dayDistance = (a,b) => Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/86400000);
const readableDate = (date,options={month:'short',day:'numeric'}) => date.toLocaleDateString('en-US',options);
const courseOf = id => courses.find(c=>c.id===id);
const qOf = id => questions.find(q=>q.id===id);
const STORAGE='rapid-nursing-review-v1';
const DISCLAIMER='NCLEX® is a registered trademark of the National Council of State Boards of Nursing, Inc. (NCSBN). Rapid Nursing Review App is not sponsored or endorsed by NCSBN.';
const legal=()=>`<p class="legal-note">${DISCLAIMER}</p>`;
let storageOK=true, filter='all', setupMode='tutor', quizVisible=false, toastTimer, showAllDays=false;
const freshState=()=>({schema:2,ui:'vivid',caseSession:null,caseHistory:[],previewPro:false,name:'Student',bookmarks:[],attempts:[],history:[],reports:[],readLessons:[],readSections:[],milestones:[],book:{open:null,page:1,tab:'contents',expanded:'nclex',marks:[]},plan:null,session:null,quarantine:[]});
// ---- Saved-data loading, validation and migration ----------------------
// SCHEMA 1: original prototype (no version field). SCHEMA 2: adds `schema`
// and `quarantine`. Records that cannot be read safely are moved into
// `quarantine` instead of being deleted, so they stay in the JSON export.
const SCHEMA=2;
// App color themes. Vivid, Ocean and Sunrise are NurseBound's palettes (dark); Daylight is the bright light theme.
const UI_THEMES=[['vivid','Vivid',[['#0891b2','#10b981'],['#ea580c','#e11d48'],['#9333ea','#db2777'],['#059669','#0284c7']],1],['ocean','Ocean',[['#0e7490','#0891b2'],['#0f766e','#0284c7'],['#4338ca','#0369a1'],['#047857','#0e7490']],1],['sunrise','Sunrise',[['#d97706','#ea580c'],['#dc2626','#ea580c'],['#be185d','#9333ea'],['#b45309','#dc2626']],1],['daylight','Daylight',[['#0891b2','#10b981'],['#ea580c','#e11d48'],['#9333ea','#db2777'],['#059669','#0284c7']],0]];
function applyUi(){const ui=state.ui||'vivid',light=ui==='daylight';document.documentElement.dataset.ui=ui;const el=document.getElementById('nb-theme');if(el){el.disabled=light;if(el.sheet)el.sheet.disabled=light;}document.querySelector('meta[name=theme-color]')?.setAttribute('content',light?'#ffffff':'#080b16');}
const isObj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const isStr=v=>typeof v==='string';
const isDay=v=>isStr(v)&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(parseDay(v));
const isTime=v=>isStr(v)&&!isNaN(Date.parse(v));
const lessonIds=new Set(lessons.map(l=>l.id));
function cleanAnswers(ids,answers){
  if(!isObj(answers))return null;
  const out={};
  for(const [id,a] of Object.entries(answers)){
    const q=qOf(id);
    if(!ids.includes(id)||!q||!isObj(a))return null;
    if(!validSelection(q,a.selected))return null;
    out[id]={...a,selected:a.selected??null,submitted:a.submitted===true};
  }
  return out;
}
function cleanSessionLike(s){
  if(!isObj(s)||!isStr(s.id)||!Array.isArray(s.ids)||!s.ids.length||s.ids.some(id=>!isStr(id)||!qOf(id)))return null;
  const answers=cleanAnswers(s.ids,s.answers);if(!answers)return null;
  const mode=s.mode==='exam'?'exam':s.mode==='tutor'?'tutor':null;if(!mode)return null;
  return {...s,mode,answers,label:isStr(s.label)?s.label:'Practice session'};
}
function cleanSession(s){
  const c=cleanSessionLike(s);if(!c)return null;
  if(!Number.isInteger(c.index)||c.index<0||c.index>=c.ids.length)return null;
  if(c.mode==='exam'&&!Number.isFinite(c.deadline))return null;
  return c;
}
function cleanHistory(h){
  const c=cleanSessionLike(h);if(!c||!isTime(h.finished))return null;
  const correct=Object.entries(c.answers).filter(([id,a])=>a.submitted&&fullCredit(qOf(id),a.selected)).length;
  return {...c,count:c.ids.length,correct,expired:h.expired===true};
}
function cleanPlan(p){
  if(!isObj(p))return null;
  const course=courseOf(p.course);
  if(!course||!isStr(p.title)||!p.title.trim()||!isDay(p.date)||!isDay(p.created))return null;
  const minutes=Number(p.minutes);if(!Number.isFinite(minutes)||minutes<=0)return null;
  const topics=Array.isArray(p.topics)?p.topics.filter(t=>course.topics.includes(t)):[];
  if(!topics.length)return null;
  const completed=Array.isArray(p.completed)?[...new Set(p.completed.filter(isDay))]:[];
  return {title:p.title.trim().slice(0,80),course:course.id,date:p.date,created:p.created,minutes,topics,completed};
}
function normalizeState(saved){
  const s=freshState(),bad=[];
  const keep=(list,clean,label)=>{
    if(!Array.isArray(list)){if(list!=null)bad.push({kind:label,value:list});return [];}
    return list.flatMap(item=>{const c=clean(item);if(c)return [c];bad.push({kind:label,value:item});return [];});
  };
  if(isStr(saved.name)&&saved.name.trim())s.name=saved.name.trim().slice(0,30);
  s.attempts=keep(saved.attempts,a=>isObj(a)&&isStr(a.qid)&&qOf(a.qid)&&typeof a.correct==='boolean'&&isDay(a.day)?a:null,'attempt');
  s.history=keep(saved.history,cleanHistory,'history');
  s.reports=keep(saved.reports,r=>isObj(r)&&isStr(r.reason)&&isStr(r.details)&&isTime(r.created)?r:null,'report');
  s.bookmarks=[...new Set(keep(saved.bookmarks,id=>isStr(id)&&qOf(id)?id:null,'bookmark'))];
  s.readLessons=[...new Set(keep(saved.readLessons,id=>isStr(id)&&lessonIds.has(id)?id:null,'readLesson'))];
  s.readSections=[...new Set(keep(saved.readSections,id=>isStr(id)&&sections.some(x=>x.id===id)?id:null,'readSection'))];
  const b=isObj(saved.book)?saved.book:{};
  s.book={open:typeof b.open==='boolean'?b.open:null,page:Number.isInteger(b.page)&&b.page>=1&&b.page<=book.pages?b.page:1,tab:b.tab==='reader'?'reader':'contents',expanded:isStr(b.expanded)&&courseOf(b.expanded)?b.expanded:'nclex',marks:Array.isArray(b.marks)?[...new Set(b.marks.filter(p=>Number.isInteger(p)&&p>=1&&p<=book.pages))]:[]};
  s.previewPro=saved.previewPro===true;
  s.ui=UI_THEMES.some(t=>t[0]===saved.ui)?saved.ui:'vivid';
  s.milestones=Array.isArray(saved.milestones)?[...new Set(saved.milestones.filter(isStr))]:[];
  if(isDay(saved.lastOpen))s.lastOpen=saved.lastOpen;
  s.caseHistory=keep(saved.caseHistory,h=>isObj(h)&&isStr(h.caseId)&&ngnCases.some(c=>c.id===h.caseId)&&isTime(h.finished)&&Number.isFinite(h.points)&&Number.isFinite(h.max)?h:null,'caseHistory');
  if(saved.caseSession!=null){const cs=saved.caseSession,c=isObj(cs)&&ngnCases.find(x=>x.id===cs.caseId);s.caseSession=c&&Number.isInteger(cs.index)&&cs.index>=0&&cs.index<c.items.length&&isObj(cs.answers)&&isObj(cs.submitted)?cs:null;if(!s.caseSession)bad.push({kind:'caseSession',value:cs});}
  if(saved.plan!=null){s.plan=cleanPlan(saved.plan);if(!s.plan)bad.push({kind:'plan',value:saved.plan});}
  if(saved.session!=null){s.session=cleanSession(saved.session);if(!s.session)bad.push({kind:'session',value:saved.session});}
  s.quarantine=[...(Array.isArray(saved.quarantine)?saved.quarantine:[]),...bad.map(b=>({...b,at:new Date().toISOString(),fromSchema:saved.schema??1}))];
  return {state:s,dropped:bad.length};
}
let state=freshState(), loadNotice='';
(function loadState(){
  let raw;
  try{raw=localStorage.getItem(STORAGE);}catch{if(!window.__RNR_SAVED__){storageOK=false;return;}}
  // Mobile app: fall back to the copy kept in native storage.
  if(raw==null&&typeof window.__RNR_SAVED__==='string')raw=window.__RNR_SAVED__;
  if(raw==null)return;
  let saved;
  try{saved=JSON.parse(raw);}catch{saved=null;}
  if(!isObj(saved)){
    // Unreadable data: keep a backup copy instead of overwriting it on the next save.
    try{localStorage.setItem(`${STORAGE}-unreadable-${Date.now()}`,raw);}catch{}
    loadNotice='Your saved study data could not be read. A backup copy was kept in this browser and a fresh study space was started.';
    return;
  }
  const {state:clean,dropped}=normalizeState(saved);
  state=clean;
  if(dropped)loadNotice=`${dropped} saved item${dropped===1?'':'s'} could not be read and ${dropped===1?'was':'were'} set aside. ${dropped===1?'It is':'They are'} still included in your progress export.`;
  if(dropped||saved.schema!==SCHEMA){const json=JSON.stringify(state);try{window.ReactNativeWebView?.postMessage(JSON.stringify({type:'save',data:json}));}catch{}try{localStorage.setItem(STORAGE,json);}catch{if(!window.ReactNativeWebView)storageOK=false;}}
})();
// In the mobile app (window.ReactNativeWebView), every save is also mirrored to native storage.
const native=window.ReactNativeWebView;
function save(){const json=JSON.stringify(state);try{native?.postMessage(JSON.stringify({type:'save',data:json}));}catch{}try{localStorage.setItem(STORAGE,json);return true;}catch{if(native)return true;storageOK=false;toast('Storage is unavailable. Export your progress before leaving.');return false;}}
const main=document.querySelector('#main'), modal=document.querySelector('#modal');
const latestAttempts = () => Object.values(state.attempts.reduce((all,a)=>(all[a.qid]=a,all),{}));
const missed = () => latestAttempts().filter(a=>!a.correct).map(a=>a.qid);
// ---- Question types and scoring ------------------------------------------
// mcq     one option index                       1 point
// sata    option indexes ("select all")          +/− scoring like NCLEX extended multiple response, never below 0
// matrix  one column index per row               1 point per row
// order   option indexes in sequence             1 point per position
function isArr(v) { return Array.isArray(v); }
const LETTERS = 'ABCDEFGH';
const TYPE_LABEL = { mcq: 'Single answer', sata: 'Select all that apply', matrix: 'Matrix', order: 'Ordered response' };
const STEP_LABEL = { recognizeCues: 'Recognize cues', analyzeCues: 'Analyze cues', prioritizeHypotheses: 'Prioritize hypotheses', generateSolutions: 'Generate solutions', takeAction: 'Take action', evaluateOutcomes: 'Evaluate outcomes' };
const needName = id => clientNeeds.find(c => c.id === id)?.name || '';
const topicOf = id => nclexTopics.find(t => t.id === id);
function blankAnswer(q) { return q.type === 'mcq' ? null : q.type === 'matrix' ? q.rows.map(() => null) : []; }
function isComplete(q, sel) {
  if (sel == null) return false;
  if (q.type === 'mcq') return Number.isInteger(sel) && sel >= 0;
  if (!isArr(sel)) return false;
  if (q.type === 'sata') return sel.length > 0;
  if (q.type === 'matrix') return sel.length === q.rows.length && sel.every(Number.isInteger);
  if (q.type === 'order') return sel.length === q.options.length;
  return false;
}
function scoreQ(q, sel) {
  if (q.type === 'mcq') return [sel === q.correct ? 1 : 0, 1];
  const s = isArr(sel) ? sel : [];
  if (q.type === 'sata') { const plus = s.filter(i => q.correct.includes(i)).length; return [Math.max(0, plus - (s.length - plus)), q.correct.length]; }
  if (q.type === 'matrix') return [q.correct.filter((c, i) => s[i] === c).length, q.rows.length];
  if (q.type === 'order') return [q.correct.filter((c, i) => s[i] === c).length, q.correct.length];
  return [0, 1];
}
function fullCredit(q, sel) { const [p, m] = scoreQ(q, sel); return p === m; }
function validSelection(q, v) {
  if (v == null) return true;
  const n = q.type === 'matrix' ? q.columns.length : (q.options || []).length;
  if (q.type === 'mcq') return Number.isInteger(v) && v >= -1 && v < n;
  if (!isArr(v)) return false;
  if (q.type === 'matrix') return v.length === q.rows.length && v.every(x => x === null || (Number.isInteger(x) && x >= 0 && x < n));
  return v.every(x => Number.isInteger(x) && x >= 0 && x < n) && new Set(v).size === v.length;
}
/** Where a question comes from, for headers: "Respiratory System · Pneumonia" or "NCLEX · Pediatrics". */
function qWhere(q) { return q.source === 'book' || q.origin === 'pilot' ? `${courseOf(q.course)?.name || 'Rapid Nursing Review'} · ${q.topic}` : `NCLEX · ${q.topic}`; }

// ---- Free vs Pro -----------------------------------------------------------
// Free: NCLEX Must-Know chapter, the first section of every book chapter, 10 questions per NCLEX topic,
// the first NGN case, the book's preview pages and tutor mode. Pro: everything, timed exams, the blueprint exam
// and the full book reader. PREVIEW_UNLOCK lets the web preview try Pro; the mobile build turns it off.
const PREVIEW_UNLOCK = true;
const FREE_PER_TOPIC = 10;
const PRO_PRICES = { monthly: '$9.99', quarter: '$49.99', annual: '$89.99', lifetime: '$119.00' };
const freeIds = (() => {
  const ids = new Set();
  const firstSection = Object.fromEntries(courses.map(c => [c.id, c.sections[0].id]));
  const perTopic = {};
  for (const q of questions) {
    if (q.retired) continue;
    if (q.source === 'book') { if (q.course === 'nclex' || q.section === firstSection[q.course]) ids.add(q.id); continue; }
    const k = q.nclexTopic; perTopic[k] = (perTopic[k] || 0) + 1;
    if (perTopic[k] <= FREE_PER_TOPIC) ids.add(q.id);
  }
  return ids;
})();
function isPro() { return !!window.__RNR_PRO__ || (PREVIEW_UNLOCK && state.previewPro === true); }
const allowedQ = q => isPro() || freeIds.has(q.id);
const allowedCase = c => isPro() || c.id === ngnCases[0].id;
const readerAllows = p => pageAllowed(p) && (isPro() || book.previewPages.includes(p));
// Visible gating (NurseBound style): Upgrade pill, PRO badges, lock icons and "Pro feature" cards.
const proBadge = () => isPro() ? '' : `<span class="pro-pill">${icon('crown')}PRO</span>`;
function proGate(feature, desc, reason = 'all') {
  return `<section class="pro-gate"><span class="pg-lock">${icon('lock')}</span><span class="pg-eyebrow">Pro feature</span><h3>${feature}</h3>${desc ? `<p>${desc}</p>` : ''}<p class="pg-price">From <b>${PRO_PRICES.monthly}</b> a month · ${PRO_PRICES.quarter} for 3 months · ${PRO_PRICES.annual}/year · ${PRO_PRICES.lifetime} once</p><button class="pg-btn" data-action="paywall" data-reason="${reason}">${icon('crown')}See Pro</button></section>`;
}
function renderUpgrade() {
  const el = document.querySelector('#upgrade'); if (!el) return;
  el.outerHTML = isPro() ? `<span id="upgrade" class="pro-member" aria-label="Pro member">${icon('crown')}Pro</span>` : `<button id="upgrade" class="upgrade-pill" data-action="paywall" data-reason="all" aria-label="Upgrade to Pro">${icon('crown')}<span>Upgrade</span></button>`;
}
// Topic names shrink to fit their tile (like NurseBound's adjustsFontSizeToFit, down to 75%) so they never run under the count.
function fitTileNames() {
  for (const n of document.querySelectorAll('.topic-tile .name')) {
    n.style.fontSize = '';
    let fs = parseFloat(getComputedStyle(n).fontSize), min = fs * 0.75;
    while ((n.scrollWidth > n.clientWidth + 0.5 || n.scrollHeight > 2 * parseFloat(getComputedStyle(n).lineHeight) + 1) && fs > min) { fs -= 0.5; n.style.fontSize = fs + 'px'; }
  }
}
let fitTimer; addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitTileNames, 120); });
document.fonts?.ready?.then(() => fitTileNames());
window.__rnrSetPro = v => { window.__RNR_PRO__ = !!v; if (modal.open && modal.classList.contains('paywall')) closeModal(); else render(); };

// ---- NGN case studies (ported from NurseBound's scoring) --------------------
const caseOf = id => ngnCases.find(c => c.id === id);
let caseTab = null;
function ngnMax(it) { return it.kind === 'bowtie' ? 5 : it.kind === 'single' ? 1 : it.kind === 'cloze' ? it.blanks.length : it.kind === 'matrix' ? it.rows.length : it.answer.length; }
function scoreNgn(it, a) {
  const max = ngnMax(it);
  if (a == null) return [0, max];
  if (it.kind === 'bowtie') return [(a.condition === it.condition.answer ? 1 : 0) + (a.actions || []).filter(x => it.actions.answer.includes(x)).length + (a.params || []).filter(x => it.params.answer.includes(x)).length, 5];
  if (it.kind === 'single') return [a === it.answer ? 1 : 0, max];
  if (it.kind === 'cloze') return [it.blanks.filter(b => a[b.id] === b.answer).length, max];
  if (it.kind === 'matrix') return [it.rows.filter(([id, , ans]) => a[id] === ans).length, max];
  if (it.kind === 'order') return [it.answer.filter((id, n) => a[n] === id).length, max];
  const plus = a.filter(x => it.answer.includes(x)).length;          // multi / highlight: +/−, never below 0
  return [Math.max(0, plus - (a.length - plus)), max];
}
function ngnComplete(it, a) {
  if (a == null) return false;
  if (it.kind === 'single') return typeof a === 'string';
  if (it.kind === 'multi' || it.kind === 'highlight') return isArr(a) && a.length > 0;
  if (it.kind === 'order') return isArr(a) && a.length === it.answer.length;
  if (it.kind === 'matrix') return it.rows.every(([id]) => a[id]);
  if (it.kind === 'cloze') return it.blanks.every(b => a[b.id]);
  if (it.kind === 'bowtie') return !!a.condition && (a.actions || []).length === it.actions.answer.length && (a.params || []).length === it.params.answer.length;
  return false;
}

// The app's tagline: three evenly spaced words, each in its own color.
const TAGLINE='<span class="tagline"><span>Learn.</span><span>Test.</span><span>Understand.</span></span>';
// ---- Book structure helpers ---------------------------------------------
const active = questions.filter(q=>!q.retired);
const sectionOf = id => sections.find(s=>s.id===id);
const sectionQs = id => active.filter(q=>q.section===id);
const pageRange = s => s.start===s.end?`p. ${s.start}`:`pp. ${s.start}–${s.end}`;
const latestMap = () => state.attempts.reduce((m,a)=>(m[a.qid]=a,m),{});
const shuffle = list => {const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const initials = name => (name.trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2)||'RN').toUpperCase();
const chapterNum = c => `<span class="toc-num" style="background:${c.color}">${c.num}</span>`;
function sectionAtPage(p){return sections.filter(s=>s.start<=p&&p<=s.end).pop()||null;}
function chapterAtPage(p){return courses.find(c=>c.pages[0]<=p&&p<=c.pages[1])||null;}
function pageAllowed(p){return BOOK_ACCESS==='full'||book.previewPages.includes(p);}
function pageImg(p){return `pages/p${String(p).padStart(3,'0')}.webp`;}
function placeLabel(p){const c=chapterAtPage(p);if(c)return c.name;if(p<4)return 'Front matter';if(p===book.toc)return 'Table of contents';if(p>=book.references[0]&&p<=book.references[1])return 'References';if(p===book.about)return 'About the author';return 'Rapid Nursing Review';}

function sectionRow(s,map){
  const qs=sectionQs(s.id),locked=!isPro()&&qs.length&&!qs.some(allowedQ),answered=qs.filter(q=>map[q.id]),right=answered.filter(q=>map[q.id].correct),read=state.readSections.includes(s.id);
  return `<div class="section-row" style="--sc:${s.color}"><span class="sec-pages">${pageRange(s)}</span><div><h3>${escape(s.title)}${locked?' <span class="pro-chip">PRO</span>':''}</h3><p>${qs.length} question${qs.length===1?'':'s'}${answered.length?` · <span class="done">${right.length}/${qs.length} correct</span>`:''}${read?' · <span class="done">Read ✓</span>':''}</p></div><div class="sec-actions"><button class="mini" data-action="read-section" data-id="${s.id}" aria-label="Read ${escape(s.title)}, ${pageRange(s)}">Read</button>${qs.length?`<button class="mini solid sec-quiz${locked?' locked':''}" data-action="section-quiz" data-id="${s.id}" aria-label="Quiz: ${escape(s.title)}${locked?' (Pro)':''}">${locked?icon('lock'):''}Quiz</button>`:''}</div></div>`;
}
function chapterBlock(c,map){
  return `<section class="chapter-block" style="--cc:${c.color}" aria-labelledby="ch-${c.id}"><div class="chapter-head">${chapterNum(c)}<div><h2 id="ch-${c.id}">${c.name}</h2><p>${escape(c.subtitle)} · pp. ${c.pages[0]}–${c.pages[1]}</p></div><div class="title-actions">${secondary('Chapter quiz','setup',`data-course="${c.id}"`)}</div></div><div class="chapter-list">${c.sections.map(s=>sectionRow(s,map)).join('')}</div></section>`;
}

// ---- Right-side book panel ---------------------------------------------
let bookQuery='';
function bookIsOpen(){return state.book.open===null?window.innerWidth>1280:state.book.open;}
function renderBookPanel(){
  const panel=document.querySelector('#book-panel'),open=bookIsOpen();
  document.body.classList.toggle('book-open',open);
  panel.hidden=!open;document.querySelector('#book-backdrop').hidden=!open;
  document.querySelectorAll('[data-action="toggle-book"]').forEach(x=>x.setAttribute('aria-expanded',String(open)));
  if(!open){panel.innerHTML='';return;}
  const body=panel.querySelector('.bp-body'),sameTab=panel.dataset.tab===state.book.tab,scroll=body?body.scrollTop:0;
  panel.dataset.tab=state.book.tab;
  panel.innerHTML=`<div class="bp-head"><img class="bp-cover" src="pages/cover.webp" alt="Cover of Rapid Nursing Review: All Body Systems at a Glance"><div><h2>Rapid Nursing Review</h2><p>All Body Systems at a Glance<br>${escape(book.author)}</p></div><button class="icon-button" data-action="close-book" aria-label="Close the book">${icon('close')}</button></div><div class="bp-tabs" role="tablist" aria-label="Book views">${[['contents','Contents'],['reader','Reader']].map(([id,l])=>`<button class="bp-tab" role="tab" aria-selected="${state.book.tab===id}" data-action="book-tab" data-tab="${id}">${l}</button>`).join('')}</div><div class="bp-body" tabindex="-1">${state.book.tab==='reader'?readerView():contentsView()}</div>`;
  if(sameTab&&state.book.tab==='contents')panel.querySelector('.bp-body').scrollTop=scroll;
}
function contentsView(){
  const q=bookQuery.trim().toLowerCase();
  return `<div class="bp-search"><input id="book-search" type="search" placeholder="Search the book" aria-label="Search the book" autocomplete="off" value="${escape(bookQuery)}"></div><div id="book-results">${q.length>1?bookResults(q):tocList(latestMap())}</div>`;
}
function tocList(map){
  return `<div class="sec-actions" style="margin-bottom:12px;flex-wrap:wrap"><button class="mini" data-action="goto-page" data-page="${book.toc}">Book table of contents · p. ${book.toc}</button></div>${courses.map(c=>{const open=state.book.expanded===c.id;return `<div class="toc-chapter" style="--cc:${c.color}" data-open="${open}"><button data-action="toc-expand" data-id="${c.id}" aria-expanded="${open}">${chapterNum(c)}<span><strong>${c.name}</strong><small>pp. ${c.pages[0]}–${c.pages[1]} · ${c.sections.length} section${c.sections.length===1?'':'s'}</small></span><span class="toc-caret">${icon('chevron')}</span></button>${open?`<div class="toc-sections">${c.sections.map(s=>sectionRow(s,map)).join('')}</div>`:''}</div>`;}).join('')}<div class="sec-actions" style="margin-top:12px;flex-wrap:wrap"><button class="mini" data-action="goto-page" data-page="${book.references[0]}">References · pp. ${book.references[0]}–${book.references[1]}</button><button class="mini" data-action="goto-page" data-page="${book.about}">About the author · p. ${book.about}</button></div>`;
}
function bookResults(q){
  const secs=sections.filter(s=>s.title.toLowerCase().includes(q)),map=latestMap();
  const hits=pageText.map((t,i)=>i+1).filter(p=>readerAllows(p)&&pageText[p-1].toLowerCase().includes(q));
  return `${secs.length?`<div class="toc-chapter"><div class="toc-sections">${secs.map(s=>sectionRow(s,map)).join('')}</div></div>`:''}<p class="dialog-note" role="status">${hits.length} page${hits.length===1?'':'s'} mention “${escape(q)}”${hits.length>40?' · showing the first 40':''}</p>${hits.slice(0,40).map(p=>{const t=pageText[p-1],i=t.toLowerCase().indexOf(q),snip=t.slice(Math.max(0,i-45),i+q.length+70);const s=sectionAtPage(p);return `<button class="search-item" data-action="goto-page" data-page="${p}"><span class="sec-pages">p. ${p}</span><span><strong>${escape(s?.title||placeLabel(p))}</strong><p>…${escape(snip)}…</p></span></button>`;}).join('')}`;
}
function readerView(){
  const p=state.book.page,s=sectionAtPage(p),c=chapterAtPage(p),marked=state.book.marks.includes(p),qs=s?sectionQs(s.id):[];
  return `<div class="reader-nav"><button class="mini" data-action="page-step" data-step="-1" ${p<=1?'disabled':''} aria-label="Previous page">‹ Prev</button><div class="where" aria-live="polite"><strong>${escape(placeLabel(p))}</strong>Page ${p} of ${book.pages}</div><button class="mini" data-action="page-step" data-step="1" ${p>=book.pages?'disabled':''} aria-label="Next page">Next ›</button></div><div class="page-frame">${readerAllows(p)?`<img src="${pageImg(p)}" alt="Book page ${p}${s?`, ${escape(s.title)}`:''}" data-action="zoom-page" data-page="${p}">`:(pageAllowed(p)?`<div class="page-locked"><div><strong>Page ${p} is part of Pro</strong>The free plan includes the opening pages and the first page of each chapter.<br><button class="mini solid" data-action="paywall" data-reason="The complete book reader is part of Pro." style="margin-top:10px">See Pro plans</button></div></div>`:`<div class="page-locked"><div><strong>Page ${p} is in the full book</strong>This preview includes the opening pages and the first page of each chapter.</div></div>`)}</div><div class="reader-tools"><label class="sr-only" for="page-jump">Go to page</label><input id="page-jump" type="number" inputmode="numeric" min="1" max="${book.pages}" value="${p}"><button class="mini" data-action="jump-page">Go</button><button class="mini" data-action="mark-page" aria-pressed="${marked}">${marked?'★ Bookmarked':'☆ Bookmark page'}</button>${readerAllows(p)?`<button class="mini" data-action="zoom-page" data-page="${p}">Enlarge</button>`:''}</div>${s?`<div class="reader-section" style="--cc:${s.color}"><small>${escape(c.name)} · ${pageRange(s)}</small><h3>${escape(s.title)}</h3><div class="sec-actions"><button class="mini" data-action="mark-read" data-id="${s.id}" aria-pressed="${state.readSections.includes(s.id)}">${state.readSections.includes(s.id)?'Read ✓':'Mark section read'}</button>${qs.length?`<button class="mini solid" data-action="section-quiz" data-id="${s.id}">Take the quiz (${qs.length})</button>`:''}</div></div>`:''}${state.book.marks.length?`<div class="reader-section"><small>Your bookmarked pages</small><div class="marks">${state.book.marks.slice().sort((a,b)=>a-b).map(m=>`<button class="mini" data-action="goto-page" data-page="${m}">p. ${m}</button>`).join('')}</div></div>`:''}`;
}
function openBook(page,tab='reader'){
  if(page)state.book.page=Math.min(book.pages,Math.max(1,page));
  state.book.open=true;state.book.tab=tab;save();renderBookPanel();
  document.querySelector('#book-panel .bp-body')?.focus({preventScroll:true});
}
function showPageViewer(p){
  const v=document.querySelector('#page-viewer');if(!pageAllowed(p)||(!readerAllows(p)&&v.dataset.cited!==String(p)&&!document.querySelector(`.inline-page img[data-page="${p}"]`)))return;
  v.dataset.page=p;
  v.innerHTML=`<div class="pv-bar"><button data-action="viewer-step" data-step="-1" ${p<=1?'disabled':''}>‹ Prev</button><span>Page ${p} · ${escape(placeLabel(p))}</span><span style="display:flex;gap:6px"><button data-action="viewer-step" data-step="1" ${p>=book.pages?'disabled':''}>Next ›</button><button data-action="close-viewer" aria-label="Close page view">Close</button></span></div><img src="${pageImg(p)}" alt="Book page ${p}">`;
  if(!v.open)v.showModal();
}

function stats(){const total=state.attempts.length;return {total,correct:state.attempts.filter(a=>a.correct).length,unique:new Set(state.attempts.map(a=>a.qid)).size,accuracy:total?Math.round(state.attempts.filter(a=>a.correct).length/total*100):null};}
function streak(){const days=new Set(state.attempts.map(a=>a.day));let d=new Date(),n=0;if(!days.has(dayKey(d)))d=addDays(d,-1);while(days.has(dayKey(d))){n++;d=addDays(d,-1);}return n;}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),4200);}
function hydrateIcons(){document.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});}
function route(){const h=location.hash.slice(1);if(h==='lessons')return 'book';return ['dashboard','practice','plan','progress','bookmarks','book'].includes(h)?h:'dashboard';}
function navigate(page){if(route()===page){render();}else location.hash=page;document.querySelector('#sidebar').classList.remove('open');document.querySelector('#menu').setAttribute('aria-expanded','false');}
const textLink = (text,action,attrs='') => `<button class="text-link" data-action="${action}" ${attrs}>${text} ${icon('arrow')}</button>`;
const primary = (text,action,attrs='',light=false) => `<button class="primary${light?' light':''}" data-action="${action}" ${attrs}>${text} ${icon('arrow')}</button>`;
const secondary = (text,action,attrs='',ic='') => `<button class="secondary" data-action="${action}" ${attrs}>${ic?icon(ic):''}${text}</button>`;
function heading(title,subtitle,actions=''){return `<div class="page-heading${actions?' with-actions':''}"><div><div class="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h1>${title}</h1><p>${subtitle}</p></div>${actions?`<div class="title-actions">${actions}</div>`:`<div class="date-chip">${icon('calendar')}${readableDate(new Date(),{weekday:'short',month:'short',day:'numeric',year:'numeric'})}</div>`}</div>`;}
function statCards(){const s=stats();return `<div class="stats">${[
 ['Questions practiced',s.total,'Every answer is a step forward','book'],['Practice accuracy',s.accuracy===null?'—':`${s.accuracy}%`,s.total?'Across your answered questions':'Your first session starts the story','target'],['Study streak',`${streak()}<span style="font-size:13px;letter-spacing:0;font-weight:500"> days</span>`,'A little consistency goes a long way','flame'],['Ready to revisit',missed().length,missed().length?'Let’s make those concepts click':'Your missed questions will appear here','refresh']
 ].map(([label,value,foot,ic])=>`<div class="stat"><div class="stat-top">${label}<span class="stat-icon">${icon(ic)}</span></div><div class="big-number">${value}</div><div class="stat-foot">${foot}</div></div>`).join('')}</div>`;}
function courseCards(){const map=latestMap();return `<div class="course-grid chapters">${courses.map(c=>{const qs=active.filter(q=>q.course===c.id),done=qs.filter(q=>map[q.id]).length;return `<article class="course-card" style="--cc:${c.color}"><div class="course-body"><div class="course-top">${chapterNum(c)}<span class="course-count">pp. ${c.pages[0]}–${c.pages[1]}</span></div><h3>${c.name}</h3><p>${c.sections.length} section${c.sections.length===1?'':'s'} · ${qs.length} questions</p><div class="course-progress-label"><span>Questions tried</span><span>${done} / ${qs.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${qs.length?done/qs.length*100:0}%;background:${c.color}"></div></div></div><div class="course-bottom"><button data-action="open-chapter" data-id="${c.id}">${icon('book')} Read</button><button data-action="setup" data-course="${c.id}">Practice ${icon('arrow')}</button></div></article>`;}).join('')}</div>`;}
function examCard(){const p=state.plan;if(!p)return `<aside class="exam-card"><div class="exam-top">${icon('calendar')}YOUR NEXT EXAM</div><h3>A goal to work toward.</h3><p>Choose your exam date. We’ll turn your topics into a little daily plan.</p><div class="exam-count"><strong>01</strong><span>plan. One less thing to worry about.</span></div>${secondary('Set up my study plan','edit-plan','','arrow')}</aside>`;const days=dayDistance(new Date(),parseDay(p.date));return `<aside class="exam-card"><div class="exam-top">${icon('calendar')}YOUR NEXT EXAM</div><h3>${escape(p.title)}</h3><p>${readableDate(parseDay(p.date),{weekday:'long',month:'long',day:'numeric'})} · ${courseOf(p.course).name}</p><div class="exam-count"><strong>${Math.max(0,days)}</strong><span>${days<0?'days · exam date has passed':days===0?'days · today’s the day!':'days to make it click'}</span></div>${secondary('View my study plan','plan','','arrow')}</aside>`;}

function activityChart(){const days=Array.from({length:7},(_,i)=>addDays(new Date(),i-6));const counts=days.map(d=>state.attempts.filter(a=>a.day===dayKey(d)).length);const max=Math.max(5,...counts);return `<div class="chart" role="img" aria-label="Questions answered in the past 7 days: ${days.map((d,i)=>`${readableDate(d)}: ${counts[i]}`).join(', ')}">${counts.map((n,i)=>`<div class="bar-col${i===6?' today':''}"><span>${n||''}</span><div class="bar" style="height:${Math.max(3,n/max*95)}px"></div></div>`).join('')}</div><div class="chart-labels">${days.map(d=>`<span>${readableDate(d,{weekday:'short'}).slice(0,1)}</span>`).join('')}</div><p class="chart-empty">${counts.some(Boolean)?`${counts.reduce((a,b)=>a+b,0)} questions practiced this week. Keep showing up.`:'Your first session is the start of something good.'}</p>`;}
function dashboard(){const resume=state.session;const weak=missed();const map=latestMap();const weakSecs=[...new Set(weak.map(id=>qOf(id)?.section).filter(Boolean))].map(sectionOf).filter(Boolean).slice(0,3);const cur=sectionAtPage(state.book.page)||sections[0];return `${heading(`${firstName() ? `Let’s make it click, ${escape(firstName())}.` : 'Let’s make it click, future nurse.'}`,`You belong here. A little focused practice today, a more confident you tomorrow.`)}<div class="motivate-row">${motivationCard()}${tutorCard()}</div>${isPro() ? '' : `<section class="pro-upsell"><div class="pu-text"><span class="pu-eyebrow">${icon('crown')}Rapid Nursing Review Pro</span><h3>Unlock all ${active.length.toLocaleString()} questions, ${ngnCases.length} NGN cases and the full book.</h3><p>You’re on the free plan: ${freeIds.size} questions, 1 case study and the preview pages. From ${PRO_PRICES.monthly}/month.</p></div><button class="pg-btn" data-action="paywall" data-reason="all">${icon('crown')}See Pro</button></section>`}${statCards()}<div class="hero-row"><section class="focus-card"><div class="focus-label">${icon('spark')}${resume?'PICK UP WHERE YOU LEFT OFF':'A GOOD PLACE TO START'}</div><h2>${resume?'Your next question<br>is waiting for you.':'Understand the why.<br>Remember the answer.'}</h2><p>${resume?'Your answers are saved. Continue your session and keep your momentum.':'Read a section of the book, then test yourself on it. Every answer links back to the page it came from.'}</p><div class="focus-bottom">${primary(resume?'Resume practice':'Start a quick practice',resume?'resume':'quick','',true)}<span class="focus-meta">${icon('clock')}${resume?`${resume.ids.length} questions · ${resume.mode} mode`:'4 questions · tutor mode'}</span></div><div class="orbital" aria-hidden="true"><div class="orbit"></div><span class="star">✧</span><span class="orbit-dot"></span><span class="orbit-dot second"></span></div></section>${examCard()}</div><div class="section-title"><div><h2>The book, chapter by chapter</h2><p>Each chapter of <cite>Rapid Nursing Review</cite> is a course. Each section has its own quiz.</p></div>${textLink('See all sections','book')}</div>${courseCards()}<div class="bottom-grid"><section class="panel"><div class="section-title"><h2>${weakSecs.length?'Re-read what you missed':'Continue the book'}</h2>${textLink('Open the book','toggle-book')}</div><div class="chapter-list">${(weakSecs.length?weakSecs:[cur]).map(s=>sectionRow(s,map)).join('')}</div>${weak.length?`<div class="spacer">${textLink(`Revisit ${weak.length} missed question${weak.length>1?'s':''}`,'review')}</div>`:''}</section><section class="panel"><div class="section-title"><h2>Your study rhythm</h2><span class="subtle-pill">Last 7 days</span></div>${activityChart()}</section></div>${legal()}`;}
function filters(){return `<div class="filter-row" role="group" aria-label="Filter by chapter">${[{id:'all',name:'All chapters'},...courses.map(c=>({id:c.id,color:c.color,name:`${/^\d+$/.test(c.num)?c.num+' · ':''}${c.short}`}))].map(c=>`<button class="filter${filter===c.id?' active':''}" style="--cc:${c.color||'#2b2f33'}" data-action="filter" data-filter="${c.id}" aria-pressed="${filter===c.id}">${c.name}</button>`).join('')}</div>`;}

function progressPage(){const s=stats();return `${heading('See how far you’ve come.','Your progress reflects practice on this device.',secondary('Export progress','export','','download'))}${statCards()}<div class="bottom-grid"><div class="panel"><div class="section-title"><h2>Practice by course</h2></div>${courses.map(c=>{const a=state.attempts.filter(x=>qOf(x.qid)?.course===c.id),acc=a.length?Math.round(a.filter(x=>x.correct).length/a.length*100):null;return `<div style="margin:19px 0"><div class="course-progress-label" style="font-size:12px"><span>${c.name}</span><span>${acc===null?'No answers yet':`${acc}% · ${a.length} answers`}</span></div><div class="progress-track" style="height:6px"><div class="progress-fill" style="width:${acc||0}%"></div></div></div>`;}).join('')}<p class="dialog-note">Repeated questions count as practice attempts. These scores do not predict exam readiness or NCLEX outcomes.</p></div><div class="panel"><div class="section-title"><h2>Last 7 days</h2></div>${activityChart()}</div></div><section class="panel spacer"><div class="section-title"><div><h2>By NCLEX client need</h2><p>2026 NCLEX-RN test plan categories, latest answer per question.</p></div></div><div class="need-list">${(()=>{const lat=latestAttempts();return clientNeeds.map(c=>{const a=lat.filter(x=>qOf(x.qid)?.clientNeed===c.id),r=a.filter(x=>x.correct).length;return `<div class="need-row"><span>${escape(c.name)} <small>(NCLEX ${c.target_pct-3}–${c.target_pct+3}%)</small></span><span>${a.length?`${Math.round(r/a.length*100)}% · ${a.length}`:'No answers yet'}</span><div class="progress-track"><div class="progress-fill" style="width:${a.length?r/a.length*100:0}%"></div></div></div>`;}).join('');})()}</div>${state.caseHistory.length?`<h3 class="need-title">NGN case studies</h3>${state.caseHistory.slice().reverse().map(h=>`<div class="history-row"><div><h3>${escape(caseOf(h.caseId).title)}</h3><p>${readableDate(new Date(h.finished),{month:'short',day:'numeric'})}</p></div><span class="history-score">${h.points} / ${h.max}</span></div>`).join('')}`:''}</section><section class="panel spacer"><div class="section-title"><h2>Completed sessions</h2><span class="subtle-pill">${state.history.length} sessions</span></div>${state.history.length?state.history.slice().reverse().map(h=>`<div class="history-row"><span class="course-icon sage">${icon('check')}</span><div><h3>${escape(h.label)}</h3><p>${readableDate(new Date(h.finished),{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})} · ${h.mode==='exam'?'Timed exam':'Tutor mode'} · ${h.count} questions</p></div><span class="history-score">${h.correct} / ${h.count}</span>${textLink('Review','history',`data-id="${h.id}"`)}</div>`).join(''):`<p class="dialog-note">Finish your first session to see it here.</p><div class="spacer">${primary('Start your first practice','quick')}</div>`}</section>${s.total?`<section class="panel spacer"><h2>What’s behind your mistakes?</h2><p class="dialog-note">Self-reflections you selected while reviewing a question.</p><div class="filter-row spacer">${['Knowledge gap','Missed cue','Prioritization','Calculation'].map(m=>`<span class="subtle-pill">${m}: ${state.attempts.filter(a=>a.mistake===m).length}</span>`).join('')}</div>${missed().length?secondary('Review missed questions','review','','refresh'):''}</section>`:''}`;}
function bookmarksPage(){const qs=state.bookmarks.map(qOf).filter(Boolean);return `${heading('Keep the useful ones close.','A personal collection of questions to revisit.')}${qs.length?qs.map(q=>`<article class="bookmark-card"><span class="tag">${escape(qWhere(q))}</span><h3>${escape(q.stem)}</h3><div class="bookmark-actions">${secondary('Practice question','single',`data-id="${q.id}"`,'practice')}${secondary('Remove bookmark','bookmark',`data-id="${q.id}"`,'bookmark')}</div></article>`).join(''):`<div class="empty-state"><span class="course-icon sage">${icon('bookmark')}</span><h2>Good questions deserve a second look.</h2><p>Bookmark a question during practice. It will be right here when you need it.</p>${primary('Find your first question','practice')}</div>`}`;}
function bookPage(){const visible=courses.filter(c=>filter==='all'||c.id===filter);const map=latestMap();return `${heading('The book, section by section.',`<cite>Rapid Nursing Review: All Body Systems at a Glance</cite> · ${escape(book.author)}`,secondary('Open the reader','toggle-book','','book'))}${filters()}${visible.map(c=>chapterBlock(c,map)).join('')}<p class="dialog-note">${book.pages} pages · ${sections.length} sections · ${active.length} quiz questions. Quiz questions were drafted from the book and are awaiting the author’s review.</p>`;}
function planDays(){const p=state.plan;if(!p)return[];const distance=dayDistance(parseDay(p.created),parseDay(p.date));return Array.from({length:Math.max(1,distance+1)},(_,i)=>{const day=dayKey(addDays(parseDay(p.created),i));const final=i===distance,topic=p.topics[i%p.topics.length];return {day,topic,final};});}
function planPage(){const p=state.plan;if(!p)return `${heading('Give your exam a little structure.','Turn your date, topics, and available time into a daily plan.')}<div class="empty-state"><span class="course-icon sage">${icon('calendar')}</span><h2>A plan that fits your next exam.</h2><p>Choose a course and topics. Tell us your exam date and how much time you have each day.</p>${primary('Build my study plan','edit-plan')}</div>`;const all=planDays();const days=showAllDays?all:all.slice(0,14);return `${heading('A little closer, every day.','Your course exam, broken into manageable steps.',secondary('Edit plan','edit-plan','','edit'))}<div class="plan-summary"><div class="panel"><span class="eyebrow">YOUR NEXT EXAM</span><h2>${escape(p.title)}</h2><p>${readableDate(parseDay(p.date),{weekday:'long',month:'long',day:'numeric',year:'numeric'})} · ${courseOf(p.course).name}</p></div><div class="panel"><span class="eyebrow">TIME YOU’VE SET ASIDE</span><h2>${p.minutes} minutes a day</h2><p>${p.topics.map(escape).join(' · ')}</p></div></div><div class="notice">${p.completed.length} of ${all.length} study days checked off. Repeat practice builds familiarity; use fresh, clinically reviewed questions to assess learning.</div><div class="panel"><div class="section-title"><h2>Your daily plan</h2><span class="subtle-pill">${showAllDays?'All scheduled days':'First 14 days'}</span></div>${days.map(d=>{const complete=p.completed.includes(d.day);return `<div class="plan-day${complete?' day-complete':''}"><button class="check-day${complete?' checked':''}" data-action="check-day" data-day="${d.day}" aria-label="${complete?'Mark incomplete':'Mark complete'}: ${d.day}" aria-pressed="${complete}">${complete?'✓':''}</button><span class="day-date">${readableDate(parseDay(d.day),{month:'short'})}<strong>${parseDay(d.day).getDate()}</strong></span><div><h3>${d.final?'Exam day: a light concept review':escape(d.topic)}</h3><p>${d.final?'Review key clues and make room to rest.':`${Math.round(p.minutes*.4)} min concept review · ${Math.round(p.minutes*.4)} min practice · ${p.minutes-Math.round(p.minutes*.4)*2} min reflection`}</p></div>${secondary(d.final?'The book':'Practice',d.final?'book':'setup',`data-course="${p.course}" data-topic="${d.topic}"`)}</div>`;}).join('')}${all.length>14&&!showAllDays?`<div class="spacer">${secondary(`Show all ${all.length} days`,'all-days')}</div>`:''}</div>`;}
function render(){const page=route();const navs=[['dashboard','Overview','dashboard'],['practice','Practice questions','practice'],['book','The book','book'],['plan','Study plan','calendar'],['progress','My progress','chart'],['bookmarks','Bookmarks','bookmark']];const navColors={dashboard:['#2563eb','#93C5FD'],practice:['#ea580c','#FDBA74'],book:['#16a34a','#6EE7B7'],plan:['#9333ea','#C4B5FD'],progress:['#0891b2','#67E8F9'],bookmarks:['#db2777','#FDA4AF']};document.querySelector('#nav').innerHTML=navs.map(([id,title,ic])=>`<a class="nav-link${id===page?' active':''}" style="--nl:${navColors[id][0]};--nd:${navColors[id][1]}" href="#${id}" ${id===page?'aria-current="page"':''}>${icon(ic)}${title}${id==='bookmarks'&&state.bookmarks.length?`<span class="nav-count">${state.bookmarks.length}</span>`:''}</a>`).join('');document.querySelector('#breadcrumb').textContent=navs.find(n=>n[0]===page)[1];document.querySelector('#profile-name').textContent=state.name;document.querySelector('#profile-initials').textContent=initials(state.name);document.querySelector('#top-initials').textContent=initials(state.name);main.innerHTML=(!storageOK?'<div class="storage-warning">Browser storage is unavailable. Export your progress before closing this page.</div>':'')+(loadNotice?`<div class="storage-warning" role="status">${escape(loadNotice)} <button class="text-link" data-action="dismiss-notice">Dismiss</button></div>`:'')+({dashboard,practice:practicePage,plan:planPage,progress:progressPage,bookmarks:bookmarksPage,book:bookPage}[page])();const tabs=[['plan','Plan','calendar','#6D28D9','#C4B5FD'],['book','Book','book','#065F46','#6EE7B7'],['practice','Practice','practice','#9A3412','#FDBA74'],['progress','Progress','chart','#155E75','#67E8F9'],['bookmarks','Bookmarks','bookmark','#BE123C','#FDA4AF']];document.querySelector('#tabbar').innerHTML=tabs.map(([id,label,ic,l,dk])=>`<a class="tab" style="--tl:${l};--td:${dk}" href="#${id}" ${id===page?'aria-current="page"':''} aria-label="${navs.find(n=>n[0]===id)[1]}"><span class="tab-ic">${icon(ic)}</span><span class="tab-label">${label}</span></a>`).join('');hydrateIcons();renderBookPanel();renderUpgrade();fitTileNames();}
function modalShell(title,subtitle,body,cls=''){const prev=document.activeElement,sel=prev&&modal.contains(prev)&&prev.dataset&&prev.dataset.action?`[data-action="${prev.dataset.action}"]`+['choice','row','col','v','group','tab','pool','mode','view','id'].filter(k=>prev.dataset[k]!=null).map(k=>`[data-${k}="${CSS.escape(prev.dataset[k])}"]`).join(''):null;modal.className=cls;modal.innerHTML=`<div class="modal-header"><div><h2 id="modal-title">${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</div><button class="icon-button" data-action="close-modal" aria-label="Close dialog">${icon('close')}</button></div><div class="modal-body">${body}</div>`;if(!modal.open)modal.showModal();const again=sel&&modal.querySelector(sel);if(again&&!again.disabled)again.focus();else if(sel)(modal.querySelector('.rationale h3')?modal.querySelector('.modal-footer .primary'):modal.querySelector('.modal-footer .primary:not([disabled])'))?.focus();}
function closeModal(){quizVisible=false;modal.close();render();}
function openSetup(course='all',topic='all'){if(state.session){modalShell('You have a session in progress.','Your answers are saved on this device.',`<p class="about-copy">Continue your ${state.session.mode==='exam'?'timed exam':'tutor session'}, or finish it now before starting a new one.</p><div class="modal-footer">${secondary('Finish current session','finish')}${primary('Resume session','resume')}</div>`);return;}setupMode='tutor';modalShell('Make this practice yours.','A focused session for what you want to understand.',`<form id="practice-form"><div class="form-grid"><label class="field">Chapter<select id="practice-course">${[{id:'all',name:'All chapters'},...courses].map(c=>`<option value="${c.id}" ${course===c.id?'selected':''}>${c.name}</option>`).join('')}</select></label><label class="field">Section<select id="practice-topic"></select></label><div class="field full"><span>How do you want to practice?</span><div class="mode-pick"><button type="button" class="mode-option active" data-action="mode" data-mode="tutor"><strong>${icon('book')}Tutor mode</strong><p>Understand each answer as you go.</p></button><button type="button" class="mode-option" data-action="mode" data-mode="exam"><strong>${icon('clock')}Timed exam</strong><p>See explanations after you finish.</p></button></div></div><label class="field">Questions<select id="practice-count"></select></label><label class="field" id="time-field" style="display:none">Time limit<select id="practice-time"><option value="5">5 minutes</option><option value="10" selected>10 minutes</option><option value="20">20 minutes</option></select></label></div><p class="dialog-note">${active.length} questions organized by the book’s chapters and sections. Drafted from the book and awaiting the author’s review. Progress saves in this browser.</p><div class="modal-footer"><button class="primary" type="submit">Start practice ${icon('arrow')}</button></div></form>`);updateSetupTopics(topic);}
function updateSetupTopics(topic='all'){const course=document.querySelector('#practice-course').value;const topics=course==='all'?courses.flatMap(c=>c.topics):courseOf(course).topics;document.querySelector('#practice-topic').innerHTML=`<option value="all">All sections</option>`+topics.map(t=>`<option value="${t}" ${topic===t?'selected':''}>${t}</option>`).join('');updateSetupCounts();}
function setupQuestions(){const c=document.querySelector('#practice-course').value,t=document.querySelector('#practice-topic').value;return active.filter(q=>q.source==='book'&&allowedQ(q)&&(c==='all'||q.course===c)&&(t==='all'||q.topic===t));}
function updateSetupCounts(){const n=setupQuestions().length;const counts=[...new Set([Math.min(4,n),Math.min(8,n),n])];document.querySelector('#practice-count').innerHTML=counts.map(i=>`<option value="${i}">${i} question${i===1?'':'s'}</option>`).join('');}
function startSession(ids,mode='tutor',minutes=10,label='Mixed course practice'){if(state.session){openSetup();return;}state.session={id:crypto.randomUUID(),ids,mode,label,index:0,answers:{},started:new Date().toISOString(),deadline:mode==='exam'?Date.now()+minutes*60000:null};save();showQuiz();}
function selectedQuestion(){return qOf(state.session?.ids[state.session.index]);}





function nextQuestion(){const s=state.session;if(!s?.answers[s.ids[s.index]]?.submitted)return;if(s.index===s.ids.length-1){finishSession();return;}s.index++;save();showQuiz();}
function timerText(deadline){const n=Math.max(0,Math.ceil((deadline-Date.now())/1000));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')} LEFT`;}



function showLesson(id){const l=lessons.find(x=>x.id===id);if(!l)return;quizVisible=false;modalShell(l.title,`${courseOf(l.course).name} · ${l.read} read`, `<p class="lesson-content">${l.text}</p><div class="takeaway"><small>MAKE IT STICK</small><p>${l.takeaway}</p></div><a class="source-link" href="${sources[l.source].url}" target="_blank" rel="noopener noreferrer">${sources[l.source].name} ↗</a><p class="dialog-note">Source checked Oct 12, 2026 · Clinical review pending</p><div class="modal-footer">${secondary(state.readLessons.includes(id)?'Marked as read':'Mark as read','read-lesson',`data-id="${id}"`,'check')}${primary('Practice this concept','lesson-practice',`data-id="${id}"`)}</div>`);}
function openPlan(){const p=state.plan;const date=p?.date||dayKey(addDays(new Date(),7));modalShell('A plan for your next exam.','A few details. A manageable path forward.',`<form id="plan-form"><div class="form-grid"><label class="field full">Exam name<input name="title" value="${escape(p?.title||'')}" placeholder="e.g. Pharmacology Exam 1" maxlength="80" required></label><label class="field">Course<select name="course" id="plan-course">${courses.map(c=>`<option value="${c.id}" ${c.id===(p?.course||'resp')?'selected':''}>${c.name}</option>`).join('')}</select></label><label class="field">Exam date<input type="date" name="date" value="${date}" min="${dayKey()}" max="${dayKey(addDays(new Date(),90))}" required></label><label class="field full">Minutes available each day<select name="minutes">${[10,15,20,30,45,60,90,120].map(n=>`<option value="${n}" ${n===(p?.minutes||20)?'selected':''}>${n} minutes</option>`).join('')}</select></label><div class="field full"><span>Topics to focus on</span><div id="plan-topics" class="checkboxes"></div><span class="field-hint">Choose at least one topic from the sample library.</span></div></div><div class="modal-footer"><button type="submit" class="primary">${p?'Save changes':'Build my plan'} ${icon('arrow')}</button></div></form>`);updatePlanTopics(p?.topics);}
function updatePlanTopics(selected){const c=courseOf(document.querySelector('#plan-course').value);document.querySelector('#plan-topics').innerHTML=c.topics.map(t=>`<label class="check-label"><input name="topics" type="checkbox" value="${t}" ${!selected||selected.includes(t)?'checked':''}>${t}</label>`).join('');}
function showSearch(){modalShell('Find your next connection.','Search book sections, pages and practice questions.',`<input id="search-input" type="search" placeholder="Try “warfarin” or “DKA”" aria-label="Search the book and questions" autocomplete="off"><div id="search-results" class="search-results" aria-live="polite"></div>`);searchLibrary('');document.querySelector('#search-input').focus();}
function searchLibrary(term){term=term.toLowerCase().trim();const ss=sections.filter(s=>`${s.title} ${courseOf(s.course).name}`.toLowerCase().includes(term));const pages=term.length>2?pageText.map((t,i)=>i+1).filter(p=>readerAllows(p)&&pageText[p-1].toLowerCase().includes(term)):[];const qs=term.length>1?active.filter(q=>`${q.stem} ${q.topic}`.toLowerCase().includes(term)):[];document.querySelector('#search-results').innerHTML=ss.slice(0,6).map(s=>{const c=courseOf(s.course);return `<button class="search-item" data-action="read-section" data-id="${s.id}">${chapterNum(c)}<span><strong>${escape(s.title)}</strong><p>${c.name} · ${pageRange(s)} · ${sectionQs(s.id).length} questions</p></span></button>`;}).join('')+(pages.length?`<button class="search-item" data-action="book-search" data-q="${escape(term)}"><span class="sec-pages">${pages.length} pp.</span><span><strong>Search inside the book</strong><p>${pages.length} page${pages.length===1?'':'s'} mention “${escape(term)}”</p></span></button>`:'')+qs.slice(0,6).map(q=>`<button class="search-item" data-action="single" data-id="${q.id}"><span class="toc-num" style="background:${topicOf(q.nclexTopic)?.color||'#3a3f45'}">${allowedQ(q)?'Q':'🔒'}</span><span><strong>${escape(qWhere(q))}</strong><p>${escape(q.stem)}</p></span></button>`).join('')+(!ss.length&&!qs.length&&!pages.length?'<p class="dialog-note">No matches. Try a body system, a condition or a drug name.</p>':'');}
function showAbout(){modalShell(TAGLINE,'Rapid Nursing Review, the study app.',`<div style="display:flex;gap:16px;align-items:center;margin-bottom:16px"><img src="pages/cover.webp" alt="Book cover" style="width:72px;border-radius:4px;box-shadow:0 4px 14px #0003"><p class="about-copy" style="margin:0">This app follows <cite>Rapid Nursing Review: All Body Systems at a Glance</cite> by ${escape(book.author)}. Each chapter of the book is a course, and each section has its own reading pages and quiz.</p></div><ul class="about-list"><li>${courses.length} parts: NCLEX must-know content, nine body-system chapters and the fluid & electrolytes bonus.</li><li>${sections.length} sections with ${active.length} questions, each with a rationale for every option and a link to the book page.</li><li>The full book reader with search and page bookmarks, on the right side.</li><li>Saved sessions, bookmarks, question reports and an exam-date plan.</li></ul><div class="notice">The quiz questions were drafted from the book and are awaiting the author’s review. Scores are not a validated readiness assessment.</div><p class="about-copy">Progress is stored only on this device. There is no account sync, payment or live AI tutor yet. Reports stay on this device and can be exported for review.</p>${legal()}<div class="modal-footer">${secondary('Open the book','toggle-book','','book')}${primary('Explore practice','practice')}</div>`);}
function showSettings(){modalShell('Your study space.','A few personal touches and your saved data.',`<form id="profile-form"><label class="field">What should we call you?<input name="name" value="${escape(state.name)}" maxlength="30" required></label><div class="modal-footer"><button type="submit" class="primary">Save name ${icon('check')}</button></div></form><section class="theme-card"><p class="theme-eyebrow">Theme</p><div class="ui-swatches" role="radiogroup" aria-label="App colors">${UI_THEMES.map(([id,label,strips,dark])=>`<button class="ui-swatch${dark?' is-dark':''}" role="radio" aria-checked="${state.ui===id}" aria-label="${label} theme" data-action="set-ui" data-ui="${id}"><span class="sw-strips">${strips.map(([a,b])=>`<span style="background:linear-gradient(90deg,${a},${b})"></span>`).join('')}</span><span class="sw-name"><span>${label}</span>${state.ui===id?`<span class="sw-check">${icon('check')}</span>`:''}</span></button>`).join('')}</div><p class="theme-note">Exams always stay white.</p></section><div class="setting-row"><div><strong>Your plan</strong><p>${isPro()?(window.__RNR_PRO__?'Rapid Nursing Review Pro':'Pro (web preview)'):'Free plan'}</p></div>${isPro()&&window.__RNR_PRO__?'':secondary('See Pro plans','paywall')}</div><div class="setting-row"><div><strong>Your progress belongs to you.</strong><p>Export answers, sessions, reports, and your plan.</p></div>${secondary('Export','export','','download')}</div><div class="setting-row"><div><strong>Question reports</strong><p>${state.reports.length} saved locally · Not sent to a reviewer</p></div>${secondary('View','reports')}</div><div class="setting-row"><div><strong>About Rapid Nursing Review</strong><p>What's inside, sources and the book.</p></div>${secondary('About','about')}</div><div class="setting-row"><div><strong>Start fresh</strong><p>Reset study data on this device.</p></div><button class="text-link danger" data-action="confirm-reset">Reset data</button></div>${legal()}`);}
function exportData(){const payload=JSON.stringify({app:'Rapid Nursing Review',exported:new Date().toISOString(),...state},null,2);if(native){native.postMessage(JSON.stringify({type:'export',filename:`rapid-nursing-review-${dayKey()}.json`,data:payload}));return;}const blob=new Blob([payload],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`rapid-nursing-review-${dayKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Your progress export is ready.');}
function openReport(id){const q=qOf(id);if(!q)return;quizVisible=false;modalShell('Help make this question better.','This report will be saved locally for clinical review.',`<p class="about-copy">${q.stem}</p><form id="report-form" data-id="${id}"><label class="field">What needs a closer look?<select name="reason"><option>Answer or rationale concern</option><option>Unclear wording</option><option>Reference concern</option><option>Other feedback</option></select></label><label class="field spacer">Details<textarea name="details" placeholder="Describe the concern so a reviewer can check it." required maxlength="1500"></textarea></label><p class="dialog-note">Reports are not transmitted. Export them from your profile to share with a clinical reviewer.</p><div class="modal-footer">${state.session?secondary('Back to question','resume'):secondary('Cancel','close-modal')}<button type="submit" class="primary">Save report ${icon('flag')}</button></div></form>`);}
function showReports(){modalShell('Your saved question reports.',`${state.reports.length} reports · Stored on this device`,`${state.reports.length?state.reports.slice().reverse().map(r=>`<article class="bookmark-card"><span class="tag">${qOf(r.qid)?.topic||'Question'}</span><h3>${escape(r.reason)}</h3><p class="about-copy">${escape(r.details)}</p><small>${readableDate(new Date(r.created))} · Clinical review pending</small></article>`).join(''):'<p class="about-copy">No reports yet. Use “Report question” during practice to record a concern.</p>'}<div class="modal-footer">${secondary('Export reports & progress','export','','download')}</div>`);}
function quick(){const picks=[],seen=new Set();for(const q of shuffle(active.filter(allowedQ))){if(!seen.has(q.nclexTopic)){seen.add(q.nclexTopic);picks.push(q.id);}if(picks.length===4)break;}startSession(picks,'tutor',10,'Quick mixed practice');}
function toggleBookmark(id){if(!qOf(id))return;state.bookmarks=state.bookmarks.includes(id)?state.bookmarks.filter(x=>x!==id):[...state.bookmarks,id];save();if(quizVisible&&state.session)showQuiz();else render();toast(state.bookmarks.includes(id)?'Question saved to your bookmarks.':'Bookmark removed.');}

// ---- Question screens --------------------------------------------------------
function answerBody(q, a, revealed) {
  const sel = a?.selected, locked = !!a?.submitted;
  if (q.type === 'matrix') {
    const s = isArr(sel) ? sel : [];
    return `<div class="matrix-wrap"><table class="matrix"><thead><tr><th scope="col"><span class="sr-only">Finding</span></th>${q.columns.map(c => `<th scope="col">${escape(c)}</th>`).join('')}</tr></thead><tbody>${q.rows.map((r, i) => `<tr><th scope="row">${escape(r)}</th>${q.columns.map((c, j) => { const on = s[i] === j, key = revealed && q.correct[i] === j, wrong = revealed && on && !key; return `<td><button class="cell${on ? ' on' : ''}${key ? ' key' : ''}${wrong ? ' wrong' : ''}" data-action="pick-cell" data-row="${i}" data-col="${j}" role="radio" aria-checked="${on}" aria-label="${escape(r)}: ${escape(c)}" ${locked ? 'disabled' : ''}>${key ? '✓' : wrong ? '✗' : on ? '●' : ''}</button></td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  if (q.type === 'order') {
    const s = isArr(sel) ? sel : [];
    const placed = s.map((i, n) => { const ok = revealed && q.correct[n] === i; return `<li><button class="answer order-item${revealed ? (ok ? ' correct' : ' incorrect') : ''}" data-action="unpick-order" data-choice="${i}" ${locked ? 'disabled' : ''} aria-label="Step ${n + 1}: ${escape(q.options[i])}. ${locked ? '' : 'Tap to remove.'}"><span class="answer-letter">${n + 1}</span><span class="opt-body"><span>${escape(q.options[i])}</span>${revealed ? `<span class="why">Correct position: ${q.correct.indexOf(i) + 1}. ${escape(q.rationales[i] || '')}</span>` : ''}</span></button></li>`; }).join('');
    const left = q.options.map((o, i) => s.includes(i) ? '' : `<button class="answer" data-action="pick-order" data-choice="${i}" ${locked ? 'disabled' : ''}><span class="answer-letter">+</span><span>${escape(o)}</span></button>`).join('');
    return `<p class="type-hint">Tap the options in the correct order. Tap a placed step to take it back.</p><ol class="order-list" aria-label="Your order">${placed || '<li class="order-empty">Your order will appear here.</li>'}</ol><div class="answer-options">${left}</div>`;
  }
  const multi = q.type === 'sata';
  return `${multi ? `<span class="nb-chip acc2">${icon('checkcircle')}Select all that apply</span>` : ''}<div class="answer-options" role="${multi ? 'group' : 'radiogroup'}">${q.options.map((o, i) => {
    const on = multi ? (isArr(sel) && sel.includes(i)) : sel === i;
    const key = revealed && (multi ? q.correct.includes(i) : q.correct === i), wrong = revealed && on && !key;
    const r = q.rationales?.[i] || '';
    const why = !revealed || !r ? '' : multi ? (key ? (on ? 'Correct choice: ' : 'Missed, should be selected: ') : on ? 'Should not be selected: ' : '') : key ? 'Why it’s right: ' : on ? 'Why it’s wrong: ' : '';
    return `<button class="answer${multi ? ' multi' : ''}${on ? ' selected' : ''}${key ? ' correct' : ''}${wrong ? ' incorrect' : ''}" data-action="select-answer" data-choice="${i}" ${locked ? 'disabled' : ''} role="${multi ? 'checkbox' : 'radio'}" aria-checked="${on}"><span class="answer-letter">${multi ? (on ? '✓' : '') : LETTERS[i]}</span><span class="opt-body"><span>${escape(o)}</span>${why ? `<span class="why${key ? ' hl' : ''}"><b>${why}</b>${escape(r)}</span>` : ''}</span>${key ? `<span class="mark" aria-label="Correct answer">${icon('check')}</span>` : ''}</button>`;
  }).join('')}</div>`;
}
function tagLine(q) {
  return `<p class="q-tags">${[needName(q.clientNeed), q.cjmm ? STEP_LABEL[q.cjmm] : '', TYPE_LABEL[q.type]].filter(Boolean).map(escape).join(' · ')}</p>`;
}
function explanationList(q) {
  if (q.type === 'matrix') return `<div class="rationale-list">${q.rows.map((r, i) => `<div><strong>${escape(r)} → ${escape(q.columns[q.correct[i]])}</strong><br>${escape(q.rationales[i])}</div>`).join('')}</div>`;
  const keyed = i => q.type === 'sata' ? q.correct.includes(i) : q.type === 'mcq' ? q.correct === i : false;
  const order = q.type === 'order' ? `<p><strong>Correct order:</strong> ${q.correct.map((i, n) => `${n + 1}. ${escape(q.options[i])}`).join(' &nbsp; ')}</p>` : '';
  return `${order}<div class="rationale-list">${q.options.map((o, i) => `<div><strong>${q.type === 'order' ? `Step ${q.correct.indexOf(i) + 1}` : LETTERS[i]}. ${escape(o)}${keyed(i) ? ' ✓' : ''}</strong><br>${keyed(i) ? `<mark>${escape(q.rationales[i])}</mark>` : escape(q.rationales[i])}</div>`).join('')}</div>`;
}
function answerText(q) {
  if (q.type === 'mcq') return `${LETTERS[q.correct]}. ${q.options[q.correct]}`;
  if (q.type === 'sata') return q.correct.map(i => LETTERS[i]).join(', ');
  if (q.type === 'order') return q.correct.map((i, n) => `${n + 1}. ${q.options[i]}`).join(' → ');
  return 'shown in the key below';
}
const hashPick = (list, id) => list[[...String(id)].reduce((n, c) => n + c.charCodeAt(0), 0) % list.length];
function rationale(q, a, review = false) {
  const sel = a?.selected, has = sel != null && sel !== -1 && !(isArr(sel) && !sel.length);
  const [p, m] = has ? scoreQ(q, sel) : [0, scoreQ(q, null)[1]];
  const ok = p === m;
  const pts = q.type === 'sata' || q.type === 'matrix' ? ` (${p}/${m} pts)` : '';
  const head = `<div class="nb-result ${ok ? 'ok' : 'no'}">${icon(ok ? 'checkcircle' : 'xcircle')}<div><strong>${ok ? 'Correct' : has ? `Not quite. The correct answer is ${escape(answerText(q))}` : `Not answered. The correct answer is ${escape(answerText(q))}`}${pts}</strong>${review ? '' : `<span>${hashPick(ok ? CHEER_OK : CHEER_NO, q.id)}</span>`}</div></div>`;
  const points = [q.clue ? ['Key clue', q.clue] : null, q.priority && q.takeaway ? ['Nursing priority', q.priority] : null].filter(Boolean);
  if (!points.length) { const r = q.type === 'mcq' ? q.rationales[q.correct] : q.type === 'sata' ? q.rationales[q.correct[0]] : ''; if (r) points.push(['Key point', String(r).split(/(?<=\.)\s/)[0]]); }
  const keyPts = points.length ? `<div class="nb-keypoints"><h4>${icon('spark')}Key points</h4><ul>${points.map(([k, v]) => `<li><b>${k}:</b> <mark>${escape(v)}</mark></li>`).join('')}</ul></div>` : '';
  const take = q.takeaway || q.priority;
  const takeaway = take ? `<div class="nb-note takeaway">${icon('bulb')}<div><strong>Takeaway</strong><p>${escape(take)}</p></div></div>` : '';
  const all = `<details class="nb-all"${q.type === 'matrix' ? ' open' : ''}><summary>${q.type === 'matrix' ? 'Answer key and rationales' : 'All answer explanations'}</summary>${tagLine(q)}${explanationList(q)}</details>`;
  return `<section class="rationale">${head}${keyPts}${takeaway}${all}${q.note ? `<p class="review-note"><strong>Reviewer note:</strong> ${escape(q.note)}</p>` : ''}${sourcesBlock(q)}<div class="nb-actions">${secondary('Explain it simply', 'simplify', `data-id="${q.id}"`)}</div><div id="simple-${cssId(q.id)}"></div>${p !== m && !review ? `<p class="dialog-note">What made this one tricky? (Your reflection, optional)</p><div class="mistake-picks">${['Knowledge gap', 'Missed cue', 'Prioritization', 'Calculation'].map(x => `<button data-action="mistake" data-mistake="${x}" class="${a.mistake === x ? 'active' : ''}">${x}</button>`).join('')}</div>` : ''}</section>`;
}
const cssId = id => String(id).replace(/[^\w-]/g, '_');
function simpleText(q) {
  const first = t => String(t).split(/(?<=\.)\s/)[0];
  if (q.type === 'mcq') return `The answer is <strong>${escape(q.options[q.correct])}</strong>: ${escape(first(q.rationales[q.correct]))}`;
  if (q.type === 'sata') return `The keyed answers are <strong>${q.correct.map(i => LETTERS[i]).join(', ')}</strong>. ${escape(first(q.rationales[q.correct[0]]))}`;
  if (q.type === 'order') return `Order: ${q.correct.map((i, n) => `${n + 1}. ${escape(q.options[i])}`).join(' → ')}`;
  return q.rows.map((r, i) => `${escape(r)}: <strong>${escape(q.columns[q.correct[i]])}</strong>`).join('<br>');
}
function showQuiz() {
  const s = state.session; if (!s) return; quizVisible = true;
  const q = selectedQuestion(); const a = s.answers[q.id], submitted = !!a?.submitted, revealed = submitted && s.mode === 'tutor';
  const top = `<div class="nb-qhead"><span class="nb-chip acc">${escape(needName(q.clientNeed) || 'NCLEX')}</span><span class="nb-qcount">${s.mode === 'exam' ? `<span id="timer" class="nb-chip ${s.deadline - Date.now() < 60000 ? 'crit' : 'acc2'}">${icon('clock')}${timerText(s.deadline)}</span>` : '<span id="timer" class="sr-only">Tutor mode</span>'}Question ${s.index + 1} of ${s.ids.length}</span></div><div class="quiz-progress nb-bar"><div style="width:${s.index / s.ids.length * 100}%"></div></div><div class="nb-chiprow"><span class="nb-chip mute">${escape(q.topic || qWhere(q))}</span>${q.source === 'book' ? `<span class="nb-chip book">Book p. ${q.page}</span>` : ''}</div>`;
  const intro = s.mode === 'tutor' && s.index === 0 && !submitted ? tutorIntro(s) : '';
  modalShell(s.mode === 'tutor' ? 'Tutor mode' : escape(s.label), qWhere(q), `${intro}${top}<div class="nb-qcard"><p class="question-stem">${escape(q.stem)}</p>${answerBody(q, a, revealed)}</div>${revealed ? rationale(q, a) : ''}<div class="quiz-toolbar"><button data-action="bookmark" data-id="${q.id}">${icon('bookmark')}${state.bookmarks.includes(q.id) ? 'Bookmarked' : 'Bookmark'}</button><button data-action="report" data-id="${q.id}">${icon('flag')}Report</button><span class="save-label">${storageOK ? '✓ Saved on this device' : 'Storage unavailable'}</span></div><div class="modal-footer">${secondary(s.mode === 'exam' ? 'Save & leave' : 'Save & pause', 'close-modal')}${submitted ? primary(s.index === s.ids.length - 1 ? 'Finish session' : 'Next', 'next') : `<button class="primary" data-action="submit-answer" ${isComplete(q, a?.selected) ? '' : 'disabled'}>${s.mode === 'exam' ? 'Save answer' : 'Check Answer'} ${icon('check')}</button>`}</div>`, 'exam');
  if (s.mode === 'exam' && Date.now() >= s.deadline) finishSession(true);
}
function updateSelection(fn) {
  const s = state.session, q = selectedQuestion(); if (!s || s.answers[q.id]?.submitted) return;
  const cur = s.answers[q.id]?.selected ?? blankAnswer(q);
  s.answers[q.id] = { selected: fn(isArr(cur) ? [...cur] : cur, q), submitted: false }; save(); showQuiz();
}
function selectAnswer(choice) { updateSelection((cur, q) => q.type === 'sata' ? (cur.includes(choice) ? cur.filter(x => x !== choice) : [...cur, choice]) : choice); }
function submitAnswer() {
  const s = state.session, q = selectedQuestion(), a = s?.answers[q.id];
  if (!a || !isComplete(q, a.selected) || a.submitted) return;
  if (s.mode === 'exam' && Date.now() >= s.deadline) { finishSession(true); return; }
  a.submitted = true;
  state.attempts.push({ id: `${s.id}:${q.id}`, session: s.id, qid: q.id, selected: a.selected, correct: fullCredit(q, a.selected), score: scoreQ(q, a.selected), day: dayKey(), at: new Date().toISOString() });
  save(); if (s.mode === 'exam') nextQuestion(); else showQuiz();
  checkMilestones();
}
function sessionTotals(h) {
  let full = 0, pts = 0, max = 0; const needs = {};
  for (const id of h.ids) {
    const q = qOf(id), a = h.answers[id], [p, m] = a?.submitted ? scoreQ(q, a.selected) : [0, scoreQ(q, null)[1]];
    pts += p; max += m; if (a?.submitted && p === m) full++;
    const n = needs[q.clientNeed] ||= { right: 0, total: 0 }; n.total++; if (a?.submitted && p === m) n.right++;
  }
  return { full, pts, max, needs };
}
function finishSession(expired = false) {
  const s = state.session; if (!s) return;
  const t = sessionTotals(s);
  const h = { ...s, finished: new Date().toISOString(), correct: t.full, count: s.ids.length, points: t.pts, maxPoints: t.max, expired };
  state.history.push(h); state.session = null; quizVisible = false; save(); render(); showResults(h);
  const pct = t.max ? t.pts / t.max : 0;
  if (h.ids.length >= 5 && pct >= 0.8) celebrate({ eyebrow: 'Session complete', title: pct === 1 ? 'Perfect session!' : 'Strong session!', body: `${firstName() ? firstName() + ', you' : 'You'} scored ${Math.round(pct * 100)}% on ${h.ids.length} questions. That is exam-ready thinking.`, icon: 'trophy', colors: ['#ea580c', '#e11d48'] });
  checkMilestones();
}
function showResults(h) {
  const upsell = isPro() ? '' : proGate('Keep the momentum', `You’ve answered ${new Set(state.attempts.map(a => a.qid)).size} of ${freeIds.size} free questions. Pro unlocks all ${active.length.toLocaleString()}, timed exams, the blueprint exam and every NGN case.`, 'all');
  const t = sessionTotals(h), notAnswered = h.ids.filter(id => !h.answers[id]?.submitted).length;
  const needRows = Object.entries(t.needs).sort((a, b) => b[1].total - a[1].total).map(([k, v]) => `<div class="need-row"><span>${escape(needName(k))}</span><span>${v.right}/${v.total}</span><div class="progress-track"><div class="progress-fill" style="width:${v.right / v.total * 100}%"></div></div></div>`).join('');
  modalShell(h.expired ? 'Time’s up. Let’s learn from it.' : 'Every question moved you forward.', `${escape(h.label)} · ${h.mode === 'exam' ? 'Timed exam' : 'Tutor mode'}`, `<div class="result-score">${Math.round(t.full / h.count * 100)}<span style="font-size:30px">%</span></div><p class="result-label">${t.full} of ${h.count} fully correct · ${t.pts} of ${t.max} points${notAnswered ? ` · ${notAnswered} unanswered (no credit)` : ''}</p>${h.ids.length >= 10 ? `<h3 class="need-title">By NCLEX client need</h3><div class="need-list">${needRows}</div>` : ''}${h.ids.map(id => { const q = qOf(id), a = h.answers[id], ok = a?.submitted && fullCredit(q, a.selected); return `<div class="result-item"><span class="${ok ? 'ok' : 'redo'}">${ok ? '✓' : '↻'}</span><span>${escape(q.topic)}${!a?.submitted ? ' · Unanswered' : ''}</span><button data-action="review-answer" data-id="${id}" data-history="${h.id}">See explanation →</button></div>`; }).join('')}<p class="dialog-note">Partial credit follows NCLEX scoring rules for select-all, matrix and ordered items. This is a practice score, not a prediction of your NCLEX result.</p>${upsell}<div class="modal-footer">${secondary('See my progress', 'progress')}${primary('Practice again', 'practice')}</div>`, 'exam');
}
function showReview(id, historyId) {
  const h = state.history.find(x => x.id === historyId), q = qOf(id); if (!q || !h) return;
  const a = h.answers[id]?.submitted ? h.answers[id] : { selected: -1 };
  modalShell('Understand the deciding clue.', qWhere(q), `<div class="nb-qcard"><p class="question-stem">${escape(q.stem)}</p>${answerBody(q, { selected: a.selected === -1 ? blankAnswer(q) : a.selected, submitted: true }, true)}</div>${rationale(q, a, true)}<div class="modal-footer">${secondary('Back to results', 'history', `data-id="${h.id}"`)}</div>`, 'exam');
}

// ---- NCLEX topic picker (NurseBound style), blueprint exam ------------------
const pick = { view: 'topics', pool: 'all', topics: [], need: 'all', count: 10, mode: 'tutor' };
function pickPool() {
  const map = latestMap(), miss = new Set(missed());
  return active.filter(q => allowedQ(q) && (pick.pool === 'all' || (pick.pool === 'unseen' ? !map[q.id] : miss.has(q.id))) && (pick.need === 'all' || q.clientNeed === pick.need));
}
function pickedQs() { const pool = pickPool(); return pick.topics.length ? pool.filter(q => pick.topics.includes(q.nclexTopic)) : pool; }
function practicePage() {
  const bookN = active.filter(q => q.source === 'book').length, bankN = active.length - bookN;
  const head = '<div class="practice-head">' + heading('Make every question count.', `${active.length.toLocaleString()} NCLEX-style questions (${bookN} linked to the book, ${bankN.toLocaleString()} from the NCLEX bank) and ${ngnCases.length} NGN case studies.`, secondary('Custom practice', 'setup', '', 'edit')) + '</div>';
  const seg = `<div class="segmented view-seg" role="tablist" aria-label="Practice by">${[['topics', 'NCLEX topics'], ['chapters', 'Book chapters']].map(([id, l]) => `<button role="tab" aria-selected="${pick.view === id}" data-action="pick-view" data-view="${id}">${l}</button>`).join('')}</div>`;
  const resume = state.session ? `<div class="notice">You have a saved ${state.session.mode} session. ${textLink('Continue your session', 'resume')}</div>` : state.caseSession ? `<div class="notice">You have an NGN case in progress. ${textLink('Continue the case', 'resume-case')}</div>` : '';
  if (pick.view === 'chapters') { const map = latestMap(); return `${head}${resume}${seg}${freeBanner()}${filters()}${courses.filter(c => filter === 'all' || c.id === filter).map(c => chapterBlock(c, map)).join('')}`; }
  const map0 = latestMap();
  const pool = pickPool(), chosen = pickedQs(), counts = pool.reduce((m, q) => (m[q.nclexTopic] = (m[q.nclexTopic] || 0) + 1, m), {});
  const opts = [...new Set([10, 25, 50, 75].filter(n => n < chosen.length).concat(chosen.length ? [Math.min(chosen.length, 150)] : []))];
  const n = Math.min(pick.count, chosen.length) || 0;
  // NurseBound test cards: mono eyebrow, gradient icon tile, display title, gold PRO pill, mono meta, gradient Start.
  const lastBp = state.history.filter(h => h.label === 'NCLEX blueprint exam').pop();
  const doneCases = new Set(state.caseHistory.map(h => h.caseId));
  const nextCase = (ngnCases.find(c => allowedCase(c) && !doneCases.has(c.id)) || ngnCases.find(allowedCase) || ngnCases[0]).id;
  const proPill = isPro() ? '' : `<span class="pro-pill">${icon('crown')}PRO</span>`;
  const card = (eyebrow, ic, grad, title, pro, text, meta, action, attrs = '', extra = '') => `<article class="test-card"><div class="tc-top"><span class="tc-eyebrow">${eyebrow}</span><span class="icon-tile" style="background:var(${grad})">${icon(ic)}</span></div><h3>${title}</h3>${pro ? proPill : ''}<p>${text}</p>${extra}<span class="tc-meta">${meta}</span><button class="primary" data-action="${action}" ${attrs}>${icon('play')}Start</button></article>`;
  const features = `<div class="test-grid">${card('Test 1', 'target', '--g-nclex', 'NCLEX Blueprint Exam', true, `75 timed questions weighted to the 2026 NCLEX-RN client needs, with a category breakdown.`, lastBp ? `Last: ${lastBp.correct}/${lastBp.count} · ${readableDate(new Date(lastBp.finished))}` : 'Not taken yet', 'start-blueprint')}${card('Practice', 'stethoscope', '--g-imm', 'NGN Case Studies', true, 'Pick one case study and work through its six clinical-judgment steps.', `${ngnCases.length} cases · ${doneCases.size} done`, 'choose-case', '', `<div class="case-pills" hidden>${ngnCases.map(c => `<button class="case-pill" data-action="start-case" data-id="${c.id}">${allowedCase(c) ? '' : '<span class="lock" aria-label="Pro">🔒</span>'}<span>${escape(c.title)}</span>${doneCases.has(c.id) ? ' ✓' : ''}</button>`).join('')}</div>`)}${card('Review', 'layers', '--g-bedside', 'Missed Questions', false, 'Every question you got wrong comes back until you get it right.', `${missed().length} to review`, 'review')}${card('Quick', 'spark', '--g-home', 'Quick Practice', false, 'Four questions from four different NCLEX topics, in tutor mode.', 'About 5 minutes', 'quick')}</div>`;
  const allCounts = isPro() ? null : active.reduce((m, q) => (m[q.nclexTopic] = (m[q.nclexTopic] || 0) + 1, m), {});
  const tiles = nclexTopics.map((t, i) => { const on = pick.topics.includes(t.id), c = counts[t.id] || 0, lockT = allCounts && allCounts[t.id] > c; return `<button class="topic-tile${on ? ' on' : ''}" style="--tc:${t.color}" data-action="toggle-topic" data-id="${t.id}" aria-pressed="${on}"><span class="bar"></span>${on ? `<span class="tick">${icon('check')}</span>` : ''}<span class="name">${escape(t.name)}</span><span class="count">${allCounts ? allCounts[t.id] || 0 : c}</span></button>`; }).join('');
  const seen = Object.keys(map0).length, mastered = Object.values(map0).filter(a => a.correct).length, toReview = seen - mastered;
  const qb = `<div class="qb-head"><span class="qb-icon">${icon('library')}</span><div class="qb-title"><h2>Question Bank</h2><p>${active.length.toLocaleString()} NCLEX-RN questions with full rationales, organized by the NCSBN Client Needs categories.</p></div><button class="qb-custom" data-action="setup" aria-label="Custom practice">${icon('edit')}</button></div><div class="qb-stats">${[['Seen', seen], ['Mastered', mastered], ['To review', toReview]].map(([k, v]) => `<div class="qb-stat"><strong>${v.toLocaleString()}</strong><span>${k}</span></div>`).join('')}</div><div class="qb-bar" role="progressbar" aria-label="Questions seen" aria-valuemin="0" aria-valuemax="${active.length}" aria-valuenow="${seen}"><div style="width:${active.length ? seen / active.length * 100 : 0}%"></div></div>`;
  return `${head}${resume}${seg}<div class="practice-flow"><div class="pf-extras">${features}${freeBanner()}</div><section class="picker qb-card">${qb}<div class="segmented pool" role="radiogroup" aria-label="Which questions">${[['all', 'All Questions'], ['unseen', 'Unseen'], ['missed', 'Missed']].map(([id, l]) => `<button role="radio" aria-checked="${pick.pool === id}" data-action="pick-pool" data-pool="${id}">${l}</button>`).join('')}</div><div class="picker-head"><span class="eyebrow">Topics (${pick.topics.length ? pick.topics.length + ' selected' : 'all'})</span>${pick.topics.length ? '<button class="qb-clear" data-action="clear-topics">Clear</button>' : ''}</div><div class="topic-grid">${tiles}</div><div class="picker-controls"><label class="field"><span class="field-label">Client need</span><select id="pick-need">${[['all', 'All client needs'], ...clientNeeds.map(c => [c.id, c.name])].map(([id, l]) => `<option value="${id}" ${pick.need === id ? 'selected' : ''}>${escape(l)}</option>`).join('')}</select></label><label class="field"><span class="field-label">Questions</span><select id="pick-count">${opts.map(o => `<option value="${o}" ${o === n ? 'selected' : ''}>${o}</option>`).join('') || '<option>0</option>'}</select></label><div class="field mode-field"><span class="field-label">Mode</span><div class="segmented mode" role="radiogroup" aria-label="Mode">${[['tutor', 'Tutor'], ['exam', 'Exam']].map(([id, l]) => `<button role="radio" aria-checked="${pick.mode === id}" data-action="pick-mode" data-mode="${id}">${id === 'exam' && !isPro() ? `<span class="mode-crown" aria-label="Pro">${icon('crown')}</span>` : ''}${l}</button>`).join('')}</div></div></div><div class="picker-foot"><span>${chosen.length.toLocaleString()} ${isPro() ? 'available' : 'free'}${isPro() ? '' : ` · <button class="unlock-link" data-action="paywall" data-reason="all">${icon('lock')}Unlock all ${active.length.toLocaleString()}</button>`}</span><button class="primary start" data-action="start-pick" ${n ? '' : 'disabled'}>Start ${n} ${icon('arrow')}</button></div></section></div>`;
}
function freeBanner() {
  if (isPro()) return '';
  return `<div class="free-banner"><div><strong>Free plan</strong><span>${freeIds.size} of ${active.length.toLocaleString()} questions, 1 of ${ngnCases.length} NGN cases and the book’s preview pages.</span></div><button class="primary light" data-action="paywall" data-reason="all">See Pro plans</button></div>`;
}
function startPick() {
  if (pick.mode === 'exam' && !isPro()) { showPaywall('Timed exams are part of Pro.'); return; }
  const qs = shuffle(pickedQs()).slice(0, Math.min(pick.count, pickedQs().length)); if (!qs.length) return;
  const names = pick.topics.map(id => topicOf(id).name);
  startSession(qs.map(q => q.id), pick.mode, Math.max(5, Math.round(qs.length * 1.5)), names.length === 1 ? `${names[0]} practice` : names.length ? `${names.length}-topic practice` : 'Mixed NCLEX practice');
}
function blueprintIds(n = 75) {
  const pool = active.filter(allowedQ), byNeed = {};
  for (const q of shuffle(pool)) (byNeed[q.clientNeed] ||= []).push(q.id);
  const raw = clientNeeds.map(c => n * c.target_pct / 100), base = raw.map(Math.floor);
  raw.map((r, i) => [r - base[i], i]).sort((a, b) => b[0] - a[0]).slice(0, n - base.reduce((a, b) => a + b, 0)).forEach(([, i]) => base[i]++);
  const ids = clientNeeds.flatMap((c, i) => (byNeed[c.id] || []).slice(0, base[i]));
  const rest = shuffle(pool.map(q => q.id).filter(id => !ids.includes(id)));
  return shuffle([...ids, ...rest.slice(0, n - ids.length)]);
}

// ---- NGN case runner ----------------------------------------------------------
function startCase(id) {
  const c = caseOf(id); if (!c) return;
  if (!allowedCase(c)) { showPaywall(`All ${ngnCases.length} NGN case studies are part of Pro.`); return; }
  if (state.caseSession && state.caseSession.caseId !== id) { modalShell('You have a case in progress.', escape(caseOf(state.caseSession.caseId).title), `<p class="about-copy">Finish or continue it before starting another case.</p><div class="modal-footer">${secondary('Finish that case', 'finish-case')}${primary('Continue it', 'resume-case')}</div>`, 'exam'); return; }
  if (!state.caseSession) { state.caseSession = { caseId: id, index: 0, answers: {}, submitted: {}, started: new Date().toISOString() }; save(); }
  caseTab = Object.keys(c.ehr)[0]; showCase();
}
function ngnBody(it, a, done) {
  const on = (v) => isArr(a) && a.includes(v);
  const mark = (ok, chosen) => done ? (ok ? ' correct' : chosen ? ' incorrect' : '') : '';
  if (it.kind === 'single' || it.kind === 'multi') return `${it.kind === 'multi' ? '<p class="type-hint">Select all that apply.</p>' : ''}<div class="answer-options">${it.options.map(([id, t]) => { const chosen = it.kind === 'single' ? a === id : on(id), key = it.kind === 'single' ? it.answer === id : it.answer.includes(id); return `<button class="answer${it.kind === 'multi' ? ' multi' : ''}${chosen ? ' selected' : ''}${mark(key, chosen)}" data-action="ngn-pick" data-v="${id}" ${done ? 'disabled' : ''} role="${it.kind === 'multi' ? 'checkbox' : 'radio'}" aria-checked="${chosen}"><span class="answer-letter">${it.kind === 'multi' ? (chosen ? '✓' : '') : id.toUpperCase()}</span><span>${escape(t)}</span></button>`; }).join('')}</div>`;
  if (it.kind === 'highlight') return `<p class="type-hint">Tap each finding to highlight it. Tap again to remove.</p><p class="hl-passage">${it.passage.map(([t, id]) => id ? `<button class="hl${on(id) ? ' on' : ''}${mark(it.answer.includes(id), on(id))}" data-action="ngn-pick" data-v="${id}" ${done ? 'disabled' : ''} aria-pressed="${on(id)}">${escape(t)}</button>` : escape(t)).join('')}</p>`;
  if (it.kind === 'matrix') { const m = a || {}; return `<div class="matrix-wrap"><table class="matrix"><thead><tr><th scope="col"><span class="sr-only">Item</span></th>${it.cols.map(c => `<th scope="col">${escape(c)}</th>`).join('')}</tr></thead><tbody>${it.rows.map(([id, t, ans]) => `<tr><th scope="row">${escape(t)}</th>${it.cols.map(c => { const chosen = m[id] === c, key = done && ans === c, wrong = done && chosen && ans !== c; return `<td><button class="cell${chosen ? ' on' : ''}${key ? ' key' : ''}${wrong ? ' wrong' : ''}" data-action="ngn-cell" data-row="${id}" data-col="${escape(c)}" role="radio" aria-checked="${chosen}" aria-label="${escape(t)}: ${escape(c)}" ${done ? 'disabled' : ''}>${key ? '✓' : wrong ? '✗' : chosen ? '●' : ''}</button></td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`; }
  if (it.kind === 'cloze') { const m = a || {}; return `<p class="cloze">${it.blanks.map(b => `${escape(b.pre)} <label class="sr-only" for="cz-${b.id}">Blank</label><select id="cz-${b.id}" class="cloze-select${done ? (m[b.id] === b.answer ? ' correct' : ' incorrect') : ''}" data-ngn-blank="${b.id}" ${done ? 'disabled' : ''}><option value="">Select…</option>${b.opts.map(o => `<option ${m[b.id] === o ? 'selected' : ''}>${escape(o)}</option>`).join('')}</select>${done && m[b.id] !== b.answer ? ` <span class="cloze-key">(${escape(b.answer)})</span>` : ''}`).join(' ')}.</p>`; }
  if (it.kind === 'order') { const s = isArr(a) ? a : []; const txt = Object.fromEntries(it.steps); return `<p class="type-hint">Tap the actions in order. Tap a placed step to take it back.</p><ol class="order-list">${s.map((id, n) => `<li><button class="answer order-item${done ? (it.answer[n] === id ? ' correct' : ' incorrect') : ''}" data-action="ngn-unorder" data-v="${id}" ${done ? 'disabled' : ''}><span class="answer-letter">${n + 1}</span><span>${escape(txt[id])}</span></button></li>`).join('') || '<li class="order-empty">Your order will appear here.</li>'}</ol><div class="answer-options">${it.steps.filter(([id]) => !s.includes(id)).map(([id, t]) => `<button class="answer" data-action="ngn-order" data-v="${id}" ${done ? 'disabled' : ''}><span class="answer-letter">+</span><span>${escape(t)}</span></button>`).join('')}</div>`; }
  if (it.kind === 'bowtie') {
    const m = a || { actions: [], params: [] };
    const group = (g, title, max) => `<div class="bow-col"><h4>${title}${max > 1 ? ` <small>(choose ${max})</small>` : ''}</h4>${it[g].opts.map(([id, t]) => { const chosen = g === 'condition' ? m.condition === id : (m[g] || []).includes(id); const key = g === 'condition' ? it.condition.answer === id : it[g].answer.includes(id); return `<button class="answer bow${chosen ? ' selected' : ''}${mark(key, chosen)}" data-action="ngn-bow" data-group="${g}" data-v="${id}" ${done ? 'disabled' : ''} aria-pressed="${chosen}"><span>${escape(t)}</span></button>`; }).join('')}</div>`;
    return `<div class="bowtie">${group('actions', 'Actions to take', it.actions.answer.length)}${group('condition', 'Condition most likely', 1)}${group('params', 'Parameters to monitor', it.params.answer.length)}</div>`;
  }
  return '';
}
function showCase() {
  const cs = state.caseSession; if (!cs) return; quizVisible = true;
  const c = caseOf(cs.caseId), it = c.items[cs.index], a = cs.answers[it.id], done = !!cs.submitted[it.id];
  const tabs = Object.keys(c.ehr); if (!tabs.includes(caseTab)) caseTab = tabs[0];
  const [p, m] = scoreNgn(it, a);
  const trend = it.trend ? `<div class="matrix-wrap"><table class="trend"><thead><tr>${it.trend.cols.map(x => `<th scope="col">${escape(x)}</th>`).join('')}</tr></thead><tbody>${it.trend.rows.map(r => `<tr>${r.map(x => `<td>${escape(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
  modalShell(escape(c.title), `NGN case study · ${escape(c.sub)}`, `<p class="case-profile">${escape(c.profile)}</p><div class="ehr"><div class="ehr-tabs" role="tablist" aria-label="Client record">${tabs.map(t => `<button role="tab" aria-selected="${t === caseTab}" data-action="case-tab" data-tab="${escape(t)}">${escape(t)}</button>`).join('')}</div><div class="ehr-body" role="tabpanel">${c.ehr[caseTab].map(([when, text]) => `<p><strong>${escape(when)}</strong> ${escape(text)}</p>`).join('')}</div></div><div class="quiz-header"><span>ITEM ${cs.index + 1} OF ${c.items.length} · ${escape(it.stepLabel.toUpperCase())}</span><span>NGN · ${it.kind.toUpperCase()}</span></div><div class="steps-dots" aria-hidden="true">${c.items.map((x, i) => `<span class="${i < cs.index || cs.submitted[x.id] ? 'done' : i === cs.index ? 'now' : ''}"></span>`).join('')}</div>${trend}<p class="question-stem">${escape(it.stem)}</p>${ngnBody(it, a, done)}${done ? `<section class="rationale"><h3>${p === m ? '✓ Full credit' : `${p} of ${m} points`}</h3><p>${escape(it.rationale)}</p>${it.page ? `<p class="case-cite">Rapid Nursing Review, p. ${it.page}</p>` : ''}</section>` : ''}<div class="modal-footer">${secondary('Save & pause', 'close-modal')}${done ? primary(cs.index === c.items.length - 1 ? 'Finish case' : 'Next item', 'case-next') : `<button class="primary" data-action="case-submit" ${ngnComplete(it, a) ? '' : 'disabled'}>Check answer ${icon('arrow')}</button>`}</div>`, 'exam');
}
function updateCase(fn) {
  const cs = state.caseSession; if (!cs) return; const it = caseOf(cs.caseId).items[cs.index]; if (cs.submitted[it.id]) return;
  cs.answers[it.id] = fn(cs.answers[it.id], it); save(); showCase();
}
function finishCase() {
  const cs = state.caseSession; if (!cs) return; const c = caseOf(cs.caseId);
  const items = Object.fromEntries(c.items.map(it => [it.id, scoreNgn(it, cs.submitted[it.id] ? cs.answers[it.id] : null)]));
  const points = Object.values(items).reduce((s, [p]) => s + p, 0), max = Object.values(items).reduce((s, [, m]) => s + m, 0);
  state.caseHistory.push({ caseId: c.id, finished: new Date().toISOString(), points, max, items }); state.caseSession = null; quizVisible = false; save(); render();
  setTimeout(() => { if (points / max >= 0.8) celebrate({ eyebrow: 'Case study complete', title: points === max ? 'Full marks on a case!' : 'Clinical judgment, unlocked', body: `${points} of ${max} points on ${c.title}. You thought like a nurse at every step.`, icon: 'stethoscope', colors: ['#9333ea', '#db2777'] }); if (state.caseHistory.length === 1) celebrate({ title: 'First NGN case done', body: 'Your first unfolding case study is complete. The NCLEX will feel familiar now.', icon: 'stethoscope', colors: ['#0891b2', '#10b981'] }); }, 0);
  modalShell('Case complete.', escape(c.title), `<div class="result-score">${Math.round(points / max * 100)}<span style="font-size:30px">%</span></div><p class="result-label">${points} of ${max} points across ${c.items.length} items</p>${c.items.map(it => `<div class="result-item"><span>${escape(it.stepLabel)}</span><span style="margin-left:auto">${items[it.id][0]} / ${items[it.id][1]}</span></div>`).join('')}<p class="dialog-note">Scored with NGN rules: partial credit for select-all, highlight, matrix, cloze, ordering and bowtie items.</p><div class="modal-footer">${secondary('Close', 'close-modal')}${primary('More practice', 'practice')}</div>`, 'exam');
}

// ---- Paywall (NurseBound design). In the app, the native paywall opens instead. ----
let paywallPlan = 'quarter';
function showPaywall(reason = '') {
  if (native) { native.postMessage(JSON.stringify({ type: 'paywall', reason })); return; }
  // Monthly $9.99 · 3-month pass $49.99 (most popular) · annual $89.99 · lifetime $119.00. Savings are against paying monthly.
  const save12 = Math.round((1 - 89.99 / (9.99 * 12)) * 100);
  const plans = [
    { id: 'quarter', label: '3-MONTH PASS', badge: 'MOST POPULAR', price: PRO_PRICES.quarter, unit: '/3 mo', lines: ['A full 90-day NCLEX study plan'] },
    { id: 'monthly', label: 'MONTHLY', price: PRO_PRICES.monthly, unit: '/mo', lines: ['Cancel anytime'] },
    { id: 'annual', label: 'ANNUAL · COMPLETE PASS', price: PRO_PRICES.annual, unit: '/yr', lines: ['$7.50/mo · covers a delayed ATT or credentialing wait'], saveText: `Save ~${save12}%`, wide: true },
    { id: 'lifetime', label: 'LIFETIME ACCESS', badge: 'PAY ONCE', price: PRO_PRICES.lifetime, unit: '', lines: ['One payment · keep it as your bedside reference'], wide: true },
  ];
  const card = p => `<button class="plan${paywallPlan === p.id ? ' on' : ''}${p.wide ? ' wide' : ''}" data-action="pw-plan" data-id="${p.id}" role="radio" aria-checked="${paywallPlan === p.id}"><span class="plan-top"><span>${p.badge ? `<span class="pw-badge">${p.badge}</span>` : ''}<span class="plan-label">${p.label}</span></span><span class="radio"></span></span><span class="plan-price"><strong>${p.price}</strong>${p.unit ? `<span>${p.unit}</span>` : ''}</span>${p.lines.map(l => `<span class="plan-line">${l}</span>`).join('')}${p.saveText ? `<span class="plan-save">${p.saveText}</span>` : ''}</button>`;
  const chosen = plans.find(p => p.id === paywallPlan);
  const per = { quarter: '3 months', annual: 'year', monthly: 'month' }[paywallPlan];
  const features = [['All 2,500 NCLEX questions', 'check'], [`${ngnCases.length} NGN case studies`, 'spark'], ['NCLEX blueprint exam', 'target'], ['Timed exam mode', 'clock'], ['The complete book', 'book'], ['Answers linked to the book', 'bookmark']];
  modal.className = 'paywall';
  const prev = document.activeElement;
  modal.innerHTML = `<div class="pw"><button class="pw-close" data-action="close-modal" aria-label="Close">${icon('close')}</button><div class="pw-head"><img src="pages/cover.webp" alt="" class="pw-icon"><div><p class="pw-eyebrow">RAPID NURSING REVIEW PRO</p><h2 id="modal-title">Prepare to Pass the NCLEX-RN on Your First Attempt</h2></div></div>${reason ? `<p class="pw-reason">${escape(reason)}</p>` : ''}<div class="pw-marquee" aria-label="Pro includes: ${features.map(f => f[0]).join(', ')}"><div class="pw-track">${[0, 1].map(k => `<div class="pw-chips" ${k ? 'aria-hidden="true"' : ''}>${features.map(([t, ic]) => `<span class="pw-chip">${icon(ic)}${t}</span>`).join('')}</div>`).join('')}</div></div><div class="pw-plans" role="radiogroup" aria-label="Plans"><div class="pw-row">${card(plans[0])}${card(plans[1])}</div>${card(plans[2])}${card(plans[3])}</div><button class="pw-cta" data-action="pw-buy"><strong>Unlock Pro Access</strong><span>${chosen.price}${per ? '/' + per + ' · cancel anytime' : ' once · no subscription'}</span></button><div class="pw-links"><button data-action="pw-restore">Restore Purchases</button><span>·</span><button data-action="pw-manage">Manage Subscription</button></div><p class="pw-terms">${per ? `${chosen.price}/${per}, renewing automatically. ` : ''}Payment is charged to your Apple ID or Google Play account at confirmation of purchase. Subscriptions renew automatically unless canceled at least 24 hours before the end of the current period. Cancel anytime in your account settings. Lifetime access is a one-time purchase. Rapid Nursing Review is for education only; it is not medical advice. ${DISCLAIMER}</p><p class="pw-terms">U.S. prices shown. In the app, the App Store or Google Play shows the price for your country.</p><div class="pw-links small"><a href="https://github.com/kenyanfreshy/rapid-nursing-review/blob/main/docs/PRIVACY.md" target="_blank" rel="noopener noreferrer">Privacy Policy</a><span>·</span><a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" rel="noopener noreferrer">Terms of Use (EULA)</a></div>${PREVIEW_UNLOCK ? `<div class="pw-links small"><button data-action="pw-preview">${state.previewPro ? 'Preview: lock Pro again' : 'Preview: unlock Pro on this device'}</button></div>` : ''}</div>`;
  if (!modal.open) modal.showModal();
  const again = prev?.dataset?.action ? modal.querySelector(`[data-action="${prev.dataset.action}"]${prev.dataset.id ? `[data-id="${prev.dataset.id}"]` : ''}`) : null;
  (again || modal.querySelector('.plan.on'))?.focus();
}

document.addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(!button)return;const d=button.dataset;switch(d.action){
 case 'practice':case 'plan':case 'progress':case 'lessons':case 'book':closeModal();navigate(d.action==='lessons'?'book':d.action);break;
 case 'toggle-book':if(modal.open)closeModal();if(bookIsOpen()){state.book.open=false;save();renderBookPanel();}else openBook(null,state.book.tab);break;
 case 'close-book':state.book.open=false;save();renderBookPanel();document.querySelector('.book-toggle')?.focus();break;
 case 'book-tab':state.book.tab=d.tab;save();renderBookPanel();break;
 case 'toc-expand':state.book.expanded=state.book.expanded===d.id?'':d.id;save();renderBookPanel();break;
 case 'read-section':{const s=sectionOf(d.id);if(!s)break;if(modal.open)closeModal();state.book.expanded=s.course;openBook(s.start);break;}
 case 'open-chapter':{const c=courseOf(d.id);state.book.expanded=c.id;openBook(c.opener);break;}
 case 'section-quiz':{const s=sectionOf(d.id),ids=sectionQs(d.id).filter(allowedQ).map(q=>q.id);if(!ids.length){showPaywall(`The ${s.title} quiz is part of Pro.`);break;}startSession(ids,'tutor',10,`${s.title} quiz`);break;}
 case 'goto-page':openBook(Number(d.page));break;
 case 'open-page':if(modal.open)closeModal();openBook(Number(d.page));break;
 case 'page-step':openBook(state.book.page+Number(d.step));break;
 case 'jump-page':{const n=Number(document.querySelector('#page-jump').value);if(Number.isInteger(n)&&n>=1&&n<=book.pages)openBook(n);else toast(`Enter a page from 1 to ${book.pages}.`);break;}
 case 'mark-page':{const p=state.book.page;state.book.marks=state.book.marks.includes(p)?state.book.marks.filter(x=>x!==p):[...state.book.marks,p];save();renderBookPanel();toast(state.book.marks.includes(p)?`Page ${p} bookmarked.`:`Bookmark removed from page ${p}.`);break;}
 case 'mark-read':state.readSections=state.readSections.includes(d.id)?state.readSections.filter(x=>x!==d.id):[...state.readSections,d.id];save();render();break;
 case 'zoom-page':showPageViewer(Number(d.page));break;
 case 'viewer-step':showPageViewer(Number(document.querySelector('#page-viewer').dataset.page)+Number(d.step));break;
 case 'close-viewer':document.querySelector('#page-viewer').close();break;
 case 'show-page':{const box=document.querySelector(`#${d.target}`);const on=!box.innerHTML;box.innerHTML=on?`<div class="inline-page"><img src="${pageImg(Number(d.page))}" alt="Book page ${d.page}" data-action="zoom-page" data-page="${d.page}"></div>`:'';button.setAttribute('aria-expanded',String(on));button.textContent=on?'Hide page':'View page';break;}
 case 'book-search':closeModal();bookQuery=d.q;state.book.tab='contents';openBook(null,'contents');break;
 case 'setup':openSetup(d.course||'all',d.topic||'all');break;
 case 'quick':quick();break;
 case 'resume':if(state.session)showQuiz();else if(state.caseSession)showCase();break;
 case 'resume-case':showCase();break;
 case 'new-practice':closeModal();openSetup();break;
 case 'finish':finishSession();break;
 case 'filter':filter=d.filter;render();break;
 case 'close-modal':closeModal();break;
 case 'select-answer':selectAnswer(Number(d.choice));break;
 case 'submit-answer':submitAnswer();break;
 case 'next':nextQuestion();break;
 case 'mode':setupMode=d.mode;document.querySelectorAll('.mode-option').forEach(x=>x.classList.toggle('active',x.dataset.mode===setupMode));document.querySelector('#time-field').style.display=setupMode==='exam'?'flex':'none';break;
 case 'bookmark':toggleBookmark(d.id);break;
 case 'review':{const ids=missed().filter(id=>allowedQ(qOf(id)));if(!ids.length){toast('No missed questions to review yet.');break;}startSession(ids,'tutor',10,'Missed question review');break;}
 case 'single':{const q=qOf(d.id);if(!q||q.retired){toast('This question has been retired.');break;}if(!allowedQ(q)){showPaywall('This question is part of Pro.');break;}startSession([d.id],'tutor',10,`${q.topic} practice`);break;}
 case 'lesson':showLesson(d.id);break;
 case 'read-lesson':if(!state.readLessons.includes(d.id))state.readLessons.push(d.id);save();showLesson(d.id);render();toast('Lesson marked as read.');break;
 case 'lesson-practice':{const l=lessons.find(x=>x.id===d.id);startSession(questions.filter(q=>q.topic===l.topic).map(q=>q.id),'tutor',10,`${l.topic} practice`);break;}
 case 'history':{const h=state.history.find(x=>x.id===d.id);if(h)showResults(h);break;}
 case 'review-answer':showReview(d.id,d.history);break;
 case 'simplify':{const q=qOf(d.id);document.querySelector(`#simple-${cssId(q.id)}`).innerHTML=`<div class="simple-explanation">${q.clue?`Look for: <strong>${escape(q.clue)}</strong><br>`:''}${simpleText(q)}<br><small>A shorter explanation from this question’s rationale.</small></div>`;break;}
 case 'mistake':{const s=state.session,q=selectedQuestion();if(!s)return;s.answers[q.id].mistake=d.mistake;const a=state.attempts.find(x=>x.id===`${s.id}:${q.id}`);if(a)a.mistake=d.mistake;save();showQuiz();break;}
 case 'edit-plan':openPlan();break;
 case 'check-day':{const p=state.plan;p.completed=p.completed.includes(d.day)?p.completed.filter(x=>x!==d.day):[...p.completed,d.day];save();render();break;}
 case 'all-days':showAllDays=true;render();break;
 case 'search':showSearch();break;
 case 'about':showAbout();break;
 case 'settings':showSettings();break;
 case 'export':exportData();break;
 case 'report':openReport(d.id);break;
 case 'reports':showReports();break;
 case 'notifications':modalShell('Your study reminders.','A little focus for today.',`<div class="takeaway"><small>TODAY’S NEXT STEP</small><p>${state.session?'Continue your saved session.':state.plan?`Set aside ${state.plan.minutes} minutes for ${escape(state.plan.topics[0])}.`:'Try four questions and learn from the explanations.'}</p></div><p class="dialog-note">These are in-app suggestions. This pilot does not send notifications.</p><div class="modal-footer">${primary(state.session?'Resume practice':'Start practice',state.session?'resume':'quick')}</div>`);break;
 case 'confirm-reset':modalShell('Reset your local study data?','This clears answers, bookmarks, reports, and your plan.',`<p class="about-copy">Export your progress first if you want to keep a copy. This cannot be undone within the app.</p><div class="modal-footer">${secondary('Cancel','settings')}${secondary('Export first','export','','download')}<button class="primary" data-action="reset">Reset data</button></div>`);break;
 case 'pick-cell':updateSelection(cur=>{cur[Number(d.row)]=Number(d.col);return cur;});break;
 case 'pick-order':updateSelection(cur=>cur.includes(Number(d.choice))?cur:[...cur,Number(d.choice)]);break;
 case 'unpick-order':updateSelection(cur=>cur.filter(x=>x!==Number(d.choice)));break;
 case 'pick-view':pick.view=d.view;render();break;
 case 'pick-pool':pick.pool=d.pool;render();break;
 case 'toggle-topic':pick.topics=pick.topics.includes(d.id)?pick.topics.filter(x=>x!==d.id):[...pick.topics,d.id];render();document.querySelector(`[data-action="toggle-topic"][data-id="${d.id}"]`)?.focus();break;
 case 'clear-topics':pick.topics=[];render();break;
 case 'pick-mode':if(d.mode==='exam'&&!isPro()){showPaywall('Timed exams are part of Pro.');break;}pick.mode=d.mode;render();break;
 case 'start-pick':startPick();break;
 case 'start-blueprint':if(!isPro()){showPaywall('The NCLEX blueprint exam is part of Pro.');break;}if(state.session){openSetup();break;}{const ids=blueprintIds(75);startSession(ids,'exam',Math.round(ids.length*1.6),'NCLEX blueprint exam');}break;
 case 'start-case':startCase(d.id);break;
 case 'choose-case':{const done=new Set(state.caseHistory.map(h=>h.caseId));modalShell('NGN case studies','Pick a case. Each has a client chart and six clinical-judgment items.',`<div class="case-choose">${ngnCases.map(c=>`<button class="search-item" data-action="start-case" data-id="${c.id}"><span class="icon-tile" style="background:var(--g-imm,linear-gradient(135deg,#9333ea,#db2777))">${icon(allowedCase(c)?'stethoscope':'crown')}</span><span><strong>${escape(c.title)}</strong><p>${escape(c.sub)}${done.has(c.id)?' · Done ✓':''}${allowedCase(c)?'':' · Pro'}</p></span></button>`).join('')}</div>`);break;}
 case 'finish-case':finishCase();break;
 case 'case-tab':caseTab=d.tab;showCase();break;
 case 'ngn-pick':updateCase((a,it)=>it.kind==='single'?d.v:(isArr(a)?(a.includes(d.v)?a.filter(x=>x!==d.v):[...a,d.v]):[d.v]));break;
 case 'ngn-cell':updateCase(a=>({...(a||{}),[d.row]:d.col}));break;
 case 'ngn-order':updateCase(a=>[...(isArr(a)?a:[]),d.v]);break;
 case 'ngn-unorder':updateCase(a=>(a||[]).filter(x=>x!==d.v));break;
 case 'ngn-bow':updateCase((a,it)=>{const m={condition:null,actions:[],params:[],...(a||{})};if(d.group==='condition')m.condition=d.v;else{const max=it[d.group].answer.length,cur=m[d.group]||[];m[d.group]=cur.includes(d.v)?cur.filter(x=>x!==d.v):[...cur,d.v].slice(-max);}return m;});break;
 case 'case-submit':{const cs=state.caseSession,it=caseOf(cs.caseId).items[cs.index];if(!ngnComplete(it,cs.answers[it.id]))break;cs.submitted[it.id]=true;save();showCase();break;}
 case 'case-next':{const cs=state.caseSession,c=caseOf(cs.caseId);if(cs.index>=c.items.length-1)finishCase();else{cs.index++;save();showCase();}break;}
 case 'paywall':showPaywall(d.reason==='all'?'':d.reason||'');break;
 case 'pw-plan':paywallPlan=d.id;showPaywall();break;
 case 'pw-buy':toast('Subscriptions are purchased in the Rapid Nursing Review app for iPhone and Android.');break;
 case 'pw-restore':case 'pw-manage':toast('Restore and manage your plan in the iPhone or Android app.');break;
 case 'pw-preview':state.previewPro=!state.previewPro;save();closeModal();toast(state.previewPro?'Preview: Pro is unlocked on this device.':'Preview: back to the free plan.');break;
 case 'set-ui':state.ui=d.ui;save();applyUi();showSettings();render();document.querySelector(`[data-action="set-ui"][data-ui="${d.ui}"]`)?.focus();break;
 case 'open-more':{const sb=document.querySelector('#sidebar'),open=sb.classList.toggle('open');document.querySelector('#menu').setAttribute('aria-expanded',String(open));render();if(open)sb.querySelector('.nav-link')?.focus();break;}
 case 'dismiss-notice':loadNotice='';render();break;
 case 'reset':state=freshState();applyUi();loadNotice='';save();closeModal();toast('Your study space is ready for a fresh start.');break;
 }});
document.addEventListener('change',e=>{if(e.target.id==='pick-need'){pick.need=e.target.value;render();return;}if(e.target.id==='pick-count'){pick.count=Number(e.target.value);render();return;}if(e.target.dataset.ngnBlank){const b=e.target.dataset.ngnBlank,v=e.target.value;updateCase(a=>({...(a||{}),[b]:v||undefined}));return;}if(e.target.id==='practice-course')updateSetupTopics();if(e.target.id==='practice-topic')updateSetupCounts();if(e.target.id==='plan-course')updatePlanTopics();});
document.addEventListener('input',e=>{if(e.target.id==='search-input')searchLibrary(e.target.value);if(e.target.id==='book-search'){bookQuery=e.target.value;const q=bookQuery.trim().toLowerCase();document.querySelector('#book-results').innerHTML=q.length>1?bookResults(q):tocList(latestMap());}});
document.addEventListener('keydown',e=>{if(e.target.id==='page-jump'&&e.key==='Enter'){e.preventDefault();document.querySelector('[data-action="jump-page"]').click();return;}const panel=document.querySelector('#book-panel');if(modal.open||document.querySelector('#page-viewer').open)return;if(e.key==='Escape'&&bookIsOpen()&&window.innerWidth<=1280){state.book.open=false;save();renderBookPanel();return;}if(state.book.tab==='reader'&&panel.contains(document.activeElement)&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();openBook(state.book.page+(e.key==='ArrowRight'?1:-1));}});
document.querySelector('#page-viewer').addEventListener('click',e=>{if(e.target.id==='page-viewer')e.target.close();});
document.addEventListener('submit',e=>{if(!['practice-form','plan-form','profile-form','report-form'].includes(e.target.id))return;e.preventDefault();const form=e.target,data=new FormData(form);if(form.id==='practice-form'){const available=setupQuestions(),n=Number(document.querySelector('#practice-count').value);const c=document.querySelector('#practice-course').value,t=document.querySelector('#practice-topic').value;if(setupMode==='exam'&&!isPro()){showPaywall('Timed exams are part of Pro.');return;}startSession(shuffle(available).slice(0,n).map(q=>q.id),setupMode,Number(document.querySelector('#practice-time').value),t!=='all'?`${t} practice`:c==='all'?'Mixed course practice':`${courseOf(c).name} practice`);}else if(form.id==='plan-form'){const topics=data.getAll('topics');if(!topics.length){toast('Choose at least one topic for your plan.');return;}const title=data.get('title').trim();if(!title){toast('Enter a name for your exam.');return;}const old=state.plan,date=data.get('date');const created=old&&old.created<=date?old.created:dayKey();state.plan={title,course:data.get('course'),date,minutes:Number(data.get('minutes')),topics,created,completed:(old?.completed||[]).filter(d=>d>=created&&d<=date)};save();closeModal();navigate('plan');toast(old?'Your study plan is updated. Checked-off days are kept.':'Your daily study plan is ready.');}else if(form.id==='profile-form'){const name=data.get('name').trim();if(!name){toast('Enter a name.');return;}state.name=name;save();closeModal();toast('Your study space is updated.');}else{state.reports.push({id:crypto.randomUUID(),qid:form.dataset.id,reason:data.get('reason'),details:data.get('details').trim(),created:new Date().toISOString(),status:'pending clinical review'});save();toast('Report saved locally. Export it from your profile.');if(state.session)showQuiz();else closeModal();}});
modal.addEventListener('cancel',()=>{quizVisible=false;render();});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
document.addEventListener('click',e=>{const sb=document.querySelector('#sidebar');if(sb.classList.contains('open')&&!sb.contains(e.target)&&!e.target.closest('#menu')){sb.classList.remove('open');document.querySelector('#menu').setAttribute('aria-expanded','false');}});
document.querySelector('#menu').addEventListener('click',()=>{const open=document.querySelector('#sidebar').classList.toggle('open');document.querySelector('#menu').setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!quizVisible)showSearch();}});
window.addEventListener('hashchange',()=>{filter='all';document.querySelector('#sidebar').classList.remove('open');render();window.scrollTo({top:0});document.querySelector('#sidebar').classList.remove('open');document.querySelector('#menu').setAttribute('aria-expanded','false');});
setInterval(()=>{const s=state.session;if(!s||s.mode!=='exam')return;if(Date.now()>=s.deadline){finishSession(true);return;}const t=document.querySelector('#timer');if(t)t.textContent=timerText(s.deadline);},1000);

// ---- Tutor, daily motivation, references and celebrations ----------------------------------------
const TUTOR = { name: 'A. Korir', initials: 'AK', creds: [['MSN', 'Master of Science in Nursing: a graduate degree in nursing.'], ['RN', 'Registered Nurse.'], ['CCRN-CMC', 'Critical Care Registered Nurse certification (AACN) with the Cardiac Medicine subspecialty.']], bio: 'Author of Rapid Nursing Review: All Body Systems at a Glance and the creator of this app. Every book-linked question was written to help you think like a nurse, not just memorize facts.' };
// Original lines written for this app (no quotes attributed to real people).
const MOTIVATION = [
  'You did not come this far to only come this far. One more question today.',
  'Every rationale you read is a patient you will one day keep safe.',
  'Nursing school is hard because the work matters. You are built for work that matters.',
  'Progress, not perfection. Ten good questions beat zero perfect ones.',
  'The NCLEX tests judgment. Judgment is built one question at a time, like you are doing now.',
  'Tired is allowed. Quitting is not on today’s plan.',
  'A wrong answer here is a free lesson. The real lesson is the why.',
  'Future you, in scrubs, with a badge that says RN, is thanking you for today.',
  'Small study sessions done daily become big confidence on exam day.',
  'You belong in this profession. Your patients are waiting for you.',
  'Airway, breathing, circulation, and a little bit of courage.',
  'Read the stem, find the clue, trust your training.',
  'You are not behind. You are exactly where your next question is.',
  'Consistency is a clinical skill. So is showing up today.',
  'Hard topics become easy topics when you meet them often.',
  'The nurse you are becoming is calm, prepared and kind. Keep going.',
  'Your streak is a promise you keep to yourself.',
  'Every expert nurse once missed the question you just missed.',
  'Focus on the next right answer, then the next one.',
  'You are studying for more than a test. You are studying for a person in a bed who will trust you.',
  'Prioritize like a nurse: what matters most right now? Today, it is one focused session.',
  'Confidence is not a feeling you wait for. It is a result you practice into.',
  'You have survived every hard day so far. Today is not different.',
  'Learn it once with understanding and you will not have to cram it twice.',
  'Breathe in, read slowly, choose with purpose.',
  'Your classmates, your family and your future patients are cheering for you.',
  'A little better than yesterday is a great day.',
  'Mistakes show you exactly where to grow. That is a gift.',
  'You are allowed to be proud of how hard you are working.',
  'Show up for twenty minutes. Momentum will do the rest.',
];
const CHEER_OK = ['Nailed it. That is clinical judgment.', 'Yes! You caught the deciding clue.', 'Exactly right. Your future patients are in good hands.', 'Correct. Keep that momentum going.', 'That is how a nurse thinks. Well done.', 'Strong answer. On to the next one.'];
const CHEER_NO = ['Not yet, and that is how learning sticks. Read the why below.', 'Close. The key clue is highlighted below.', 'Every miss today is a point earned on exam day.', 'Good attempt. Let’s connect the missing clue.', 'This one comes back until it clicks. You will get it.'];
const dayIndex = () => Math.floor((new Date(dayKey(new Date())) - new Date('2026-01-01')) / 864e5);
const todaysMotivation = () => MOTIVATION[((dayIndex() % MOTIVATION.length) + MOTIVATION.length) % MOTIVATION.length];
const pickOne = list => list[Math.floor(Math.random() * list.length)];
const firstName = () => (state.name && state.name !== 'Student' ? state.name.split(/\s+/)[0] : '');

// APA 7 references. The book-linked questions cite the book page; the NCLEX bank questions list sources to check them against.
const BOOK_APA = 'Korir, A. K. (2025). <i>Rapid nursing review: All body systems at a glance</i>. Independently published.';
const REFS = {
  plan: ['National Council of State Boards of Nursing. (2026). <i>2026 NCLEX-RN test plan</i>. https://www.nclex.com', 'https://www.nclex.com'],
  medsurg: ['OpenStax. (2024). <i>Medical-surgical nursing</i>. Rice University. https://openstax.org/details/books/medical-surgical-nursing', 'https://openstax.org/details/books/medical-surgical-nursing'],
  pharm: ['OpenStax. (2024). <i>Pharmacology for nurses</i>. Rice University. https://openstax.org/details/books/pharmacology', 'https://openstax.org/details/books/pharmacology'],
  fund: ['OpenStax. (2024). <i>Fundamentals of nursing</i>. Rice University. https://openstax.org/details/books/fundamentals-nursing', 'https://openstax.org/details/books/fundamentals-nursing'],
  psych: ['OpenStax. (2024). <i>Psychiatric-mental health nursing</i>. Rice University. https://openstax.org/details/books/psychiatric-mental-health', 'https://openstax.org/details/books/psychiatric-mental-health'],
  mat: ['OpenStax. (2024). <i>Maternal-newborn nursing</i>. Rice University. https://openstax.org/details/books/maternal-newborn-nursing', 'https://openstax.org/details/books/maternal-newborn-nursing'],
  peds: ['National Library of Medicine. (n.d.). <i>Children’s health</i>. MedlinePlus. https://medlineplus.gov/childrenshealth.html', 'https://medlineplus.gov/childrenshealth.html'],
  deleg: ['National Council of State Boards of Nursing & American Nurses Association. (2019). <i>National guidelines for nursing delegation</i>. https://www.ncsbn.org', 'https://www.ncsbn.org'],
  cdc: ['Siegel, J. D., Rhinehart, E., Jackson, M., Chiarello, L., & Healthcare Infection Control Practices Advisory Committee. (2007). <i>2007 guideline for isolation precautions: Preventing transmission of infectious agents in healthcare settings</i>. Centers for Disease Control and Prevention. https://www.cdc.gov/infection-control', 'https://www.cdc.gov/infection-control'],
  dailymed: ['National Library of Medicine. (n.d.). <i>DailyMed</i>. U.S. Department of Health and Human Services. https://dailymed.nlm.nih.gov', 'https://dailymed.nlm.nih.gov'],
};
const TOPIC_REFS = { pharmacology: ['pharm', 'dailymed'], fundamentals: ['fund', 'cdc'], mental: ['psych'], ethics: ['fund'], peds: ['peds'], leadership: ['deleg', 'fund'], maternal: ['mat'], immuno: ['medsurg', 'cdc'] };
function refsFor(q) {
  const keys = [...(TOPIC_REFS[q.nclexTopic] || ['medsurg'])];
  if (q.clientNeed === 'pharm' && !keys.includes('pharm')) keys.push('pharm');
  if (q.clientNeed === 'moc' && !keys.includes('deleg')) keys.push('deleg');
  keys.push('plan');
  return [...new Set(keys)].slice(0, 3).map(k => REFS[k]);
}
function sourcesBlock(q) {
  if (q.source === 'book') return `<details class="nb-sources" open><summary>${icon('book')}Sources &amp; references</summary><div class="nb-ref book"><p class="apa">${BOOK_APA}</p><div class="book-ref"><span class="pg">Book page ${q.page}</span><button class="mini" data-action="show-page" data-page="${q.page}" data-target="pg-${cssId(q.id)}" aria-expanded="false">View page ${q.page}</button><button class="mini" data-action="open-page" data-page="${q.page}">Open in the book</button></div><div id="pg-${cssId(q.id)}"></div><p class="nb-tiny">In-text: (Korir, 2025, p. ${q.page}). Checked against the cited page · awaiting author review.</p></div></details>`;
  const list = refsFor(q).map(([cite, url]) => `<li><p class="apa">${cite}</p><a href="${url}" target="_blank" rel="noopener noreferrer">Open source ↗</a></li>`).join('');
  return `<details class="nb-sources"><summary>${icon('book')}Sources &amp; references (APA)</summary><ul class="nb-ref">${list}</ul><p class="nb-tiny">This question is from the NCLEX bank${q.topic ? ` · ${escape(q.topic)}` : ''}. Check the rationale against these sources; follow current guidelines and your facility’s policy.</p></details>`;
}

// Tutor card (dashboard) and the tutor intro shown at the start of a tutor session.
let tutorCred = null;
function tutorCard() {
  return `<section class="tutor-card"><span class="tc-eyebrow">Meet your tutor</span><div class="tutor-row"><span class="tutor-avatar">${TUTOR.initials}</span><div><h3>${TUTOR.name}, ${TUTOR.creds.map(c => c[0]).join(', ')}</h3><div class="cred-row">${TUTOR.creds.map(([c]) => `<button class="cred${tutorCred === c ? ' on' : ''}" data-action="tutor-cred" data-id="${c}" aria-expanded="${tutorCred === c}">${c}</button>`).join('')}</div></div></div>${tutorCred ? `<p class="cred-note">${TUTOR.creds.find(c => c[0] === tutorCred)[1]}</p>` : ''}<p>${TUTOR.bio}</p></section>`;
}
function tutorIntro(s) {
  const topic = String(s.label || '').replace(/\s*practice$/i, '').replace(/^Mixed NCLEX$/i, 'a mix of NCLEX topics');
  return `<div class="tutor-intro"><span class="tutor-avatar sm">${TUTOR.initials}</span><div><strong>Meet your tutor, ${TUTOR.name}${firstName() ? `. Hi ${escape(firstName())}!` : '.'}</strong><p>Today we will learn: <b>${escape(topic || 'NCLEX essentials')}</b>. Answer, check, and read the why. I’ll highlight the key points for you.</p></div></div>`;
}
function motivationCard() {
  const st = streak(), p = state.plan, days = p ? dayDistance(new Date(), parseDay(p.date)) : null;
  const personal = st >= 2 ? `${st}-day streak. Don’t break the chain today.` : days != null && days >= 0 ? `${days} day${days === 1 ? '' : 's'} until ${escape(p.title)}. You’ve got this.` : 'Start a streak today. Ten questions is enough.';
  return `<section class="motivation-card"><div class="mc-top">${icon('sun')}<span>Today’s motivation</span></div><p class="mc-quote">“${todaysMotivation()}”</p><p class="mc-personal">${icon('flame')}${personal}</p></section>`;
}

// ---- Celebrations (confetti) ---------------------------------------------------------------------
const fxOn = () => !navigator.webdriver || (() => { try { return localStorage.getItem('rnr-fx') === '1'; } catch { return false; } })();
const reducedMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const fxQueue = [];
function celebrate(item) { if (!fxOn()) return; fxQueue.push(item); if (fxQueue.length === 1) showFx(); }
function showFx() {
  const item = fxQueue[0]; if (!item) return;
  let d = document.querySelector('#fx'); if (!d) { d = document.createElement('dialog'); d.id = 'fx'; d.setAttribute('aria-labelledby', 'fx-title'); document.body.appendChild(d); }
  const colors = ['#0891b2', '#10b981', '#f59e0b', '#e11d48', '#9333ea', '#4f46e5', '#ea580c'];
  const confetti = reducedMotion() ? '' : `<div class="confetti" aria-hidden="true">${Array.from({ length: 70 }, (_, i) => `<i style="left:${Math.random() * 100}%;background:${colors[i % 7]};width:${6 + Math.random() * 6}px;animation-delay:${Math.random() * .4}s;--r:${Math.random() * 360}deg;--d:${60 + (i % 5) * 8}vh"></i>`).join('')}</div>`;
  d.innerHTML = `${confetti}<div class="fx-card"><span class="fx-eyebrow">${escape(item.eyebrow || 'Milestone unlocked')}</span><span class="fx-medal" style="background:linear-gradient(135deg,${item.colors ? item.colors.join(',') : '#2563eb,#c026d3'})">${icon(item.icon || 'trophy')}</span><h2 id="fx-title">${escape(item.title)}</h2><p>${escape(item.body)}</p>${item.form || ''}<button class="fx-go" data-fx="close">${escape(item.cta || 'Keep going')} ${icon('arrow')}</button></div>`;
  if (!d.open) d.showModal();
  d.querySelector('[data-fx=close]').focus();
}
function closeFx() {
  const d = document.querySelector('#fx'); const name = d?.querySelector('#fx-name');
  if (name && name.value.trim()) { state.name = name.value.trim().slice(0, 30); save(); render(); }
  const done = fxQueue.shift(); if (fxQueue.length) showFx(); else d?.close();
  if (done?.after) setTimeout(done.after, 250);
}
document.addEventListener('click', e => { if (e.target.closest('[data-fx=close]')) closeFx(); });
document.addEventListener('submit', e => { if (e.target.id === 'fx-form') { e.preventDefault(); closeFx(); } });
const MILESTONES = [
  ['q1', s => s.total >= 1, 'First question answered!', 'Every RN started with one question. You just started yours.', 'spark', ['#0891b2', '#10b981']],
  ['q10', s => s.total >= 10, '10 questions done', 'Double digits. Your brain is warming up.', 'target', ['#2563eb', '#c026d3']],
  ['q25', s => s.total >= 25, '25 questions', 'A quarter-century of clinical reasoning. Keep stacking.', 'target', ['#ea580c', '#e11d48']],
  ['q50', s => s.total >= 50, '50 questions!', 'Half a hundred. This is what commitment looks like.', 'trophy', ['#9333ea', '#db2777']],
  ['q100', s => s.total >= 100, '100 questions!', 'Triple digits. You are building real NCLEX stamina.', 'trophy', ['#059669', '#0284c7']],
  ['q250', s => s.total >= 250, '250 questions', 'You are outworking the doubt. Proud of you.', 'trophy', ['#d97706', '#ea580c']],
  ['q500', s => s.total >= 500, '500 questions!', 'Five hundred reasons to believe in yourself.', 'crown', ['#be185d', '#9333ea']],
  ['q1000', s => s.total >= 1000, '1,000 questions!', 'A thousand questions. You are exam-ready material.', 'crown', ['#0e7490', '#4f46e5']],
  ['q2500', s => s.total >= 2500, '2,500 questions!', 'You practiced the whole bank. Legendary.', 'crown', ['#ca8a04', '#ea580c']],
  ['s3', () => streak() >= 3, '3-day streak', 'Three days in a row. A habit is forming.', 'flame', ['#ea580c', '#db2777']],
  ['s7', () => streak() >= 7, '7-day streak!', 'A full week of showing up. That is a nurse’s discipline.', 'flame', ['#dc2626', '#ea580c']],
  ['s14', () => streak() >= 14, '14-day streak!', 'Two weeks strong. Nothing can stop this momentum.', 'flame', ['#9333ea', '#e11d48']],
  ['s30', () => streak() >= 30, '30-day streak!', 'A whole month. You are unstoppable.', 'crown', ['#059669', '#0284c7']],
  ['a10', () => state.attempts.filter(a => a.correct).length >= 10, '10 correct answers', 'Ten times you connected the clues. Keep it up.', 'check', ['#15803d', '#0d9488']],
  ['a100', () => state.attempts.filter(a => a.correct).length >= 100, '100 correct answers!', 'One hundred right answers. Confidence earned.', 'trophy', ['#15803d', '#0284c7']],
];
function checkMilestones() {
  const s = stats(); state.milestones ||= [];
  for (const [id, test, title, body, ic, colors] of MILESTONES) if (!state.milestones.includes(id) && test(s)) { state.milestones.push(id); save(); celebrate({ title, body: `${firstName() ? firstName() + ', ' + body.charAt(0).toLowerCase() + body.slice(1) : body}`, icon: ic, colors }); }
}
function welcome() {
  if (!fxOn()) return;
  const today = dayKey(new Date()), first = !state.lastOpen;
  const name = firstName(), st = streak(), due = missed().length;
  state.lastOpen = today; save();
  if (first) { celebrate({ eyebrow: 'Welcome, future nurse', title: 'You belong here.', body: `This is your study space. Practice with 2,500 NCLEX questions, read the book page by page, and watch yourself grow. Today’s motivation: ${todaysMotivation()}`, icon: 'heart', colors: ['#ea580c', '#e11d48'], cta: 'Let’s begin', after: () => { if (!isPro()) showPaywall('welcome'); }, form: `<form id="fx-form" class="fx-form"><label for="fx-name">What should we call you?</label><input id="fx-name" maxlength="30" placeholder="Your first name" autocomplete="given-name"></form>` }); return; }
  const line = st >= 2 ? `You’re on a ${st}-day streak.` : due ? `${due} question${due === 1 ? '' : 's'} are waiting for a second try.` : 'Let’s make today count.';
  celebrate({ eyebrow: 'Welcome back', title: name ? `Welcome back, ${name}!` : 'Welcome back!', body: `${line} ${todaysMotivation()}`, icon: 'sun', colors: ['#f59e0b', '#ea580c'], cta: 'Let’s study' });
}

document.addEventListener('click', e => { const b = e.target.closest('[data-action=tutor-cred]'); if (b) { tutorCred = tutorCred === b.dataset.id ? null : b.dataset.id; render(); } });
applyUi();render();welcome();
