import { courses, sections, questions, retiredLessons as lessons, sources, book, BOOK_ACCESS, pageText, clientNeeds, nclexTopics, ngnCases, nclexRefs } from './data.js';
import { Account } from './account.js';

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
 star:'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
 expand:'M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5',
 shrink:'M9 4v5H4 M15 4v5h5 M9 20v-5H4 M15 20v-5h5',
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
 lock:'M6 11h12v10H6z M8 11V7a4 4 0 0 1 8 0v4',
 mail:'M3 5h18v14H3z M3 6l9 7 9-7',
 chat:'M4 20l1.5-4A8 8 0 1 1 8 19z',
 share:'M12 3v12 M7 8l5-5 5 5 M5 13v7h14v-7'
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
const legal=()=>`<section class="legal-box" aria-labelledby="disc-title"><h4 id="disc-title">${icon('shield')}Disclaimer</h4><p>${DISCLAIMER}</p><p>Rapid Nursing Review is for education and exam preparation only. It is not medical advice and does not guarantee exam results.</p></section>`;
let storageOK=true, filter='all', setupMode='tutor', quizVisible=false, toastTimer, showAllDays=false;
const freshState=()=>({schema:2,ui:'vivid',textSize:'default',caseSession:null,caseHistory:[],previewPro:false,name:'Student',bookmarks:[],attempts:[],history:[],reports:[],readLessons:[],readSections:[],milestones:[],reminder:{on:false,time:'19:00',days:[1,2,3,4,5],title:'',notes:'',length:30},book:{open:null,page:1,tab:'contents',expanded:'nclex',marks:[]},plan:null,session:null,quarantine:[],edited:{}});
// ---- Saved-data loading, validation and migration ----------------------
// SCHEMA 1: original prototype (no version field). SCHEMA 2: adds `schema`
// and `quarantine`. Records that cannot be read safely are moved into
// `quarantine` instead of being deleted, so they stay in the JSON export.
const SCHEMA=2;
// App color themes. Vivid, Ocean and Sunrise are NurseBound's palettes (dark); Daylight is the bright light theme.
const UI_THEMES=[['vivid','Vivid',[['#0891b2','#10b981'],['#ea580c','#e11d48'],['#9333ea','#db2777'],['#059669','#0284c7']],1],['ocean','Ocean',[['#0e7490','#0891b2'],['#0f766e','#0284c7'],['#4338ca','#0369a1'],['#047857','#0e7490']],1],['sunrise','Sunrise',[['#d97706','#ea580c'],['#dc2626','#ea580c'],['#be185d','#9333ea'],['#b45309','#dc2626']],1],['midnight','Midnight',[['#0891b2','#10b981'],['#ea580c','#e11d48'],['#9333ea','#db2777'],['#059669','#0284c7']],1],['daylight','Light',[['#2563eb','#0891b2'],['#ea580c','#f59e0b'],['#7c3aed','#db2777'],['#059669','#10b981']],0],['system','System',[['#f8fafc','#e2e8f0'],['#2563eb','#0891b2'],['#0d1324','#1e2541'],['#0891b2','#10b981']],0]];   // Light = the bright theme; System follows the device's light/dark setting (Vivid when dark)   // the four NurseBound themes; Midnight = Vivid colors on a deeper, always-dark background
const darkMQ=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;
const resolvedUi=()=>{const ui=state.ui||'vivid';return ui==='system'?(darkMQ&&!darkMQ.matches?'daylight':'vivid'):ui;};
try{darkMQ?.addEventListener('change',()=>{if(state.ui==='system'){applyUi();render();}});}catch{}
// Display & accessibility: text size for questions, rationales, the book and every page (the top bar and menus stay put).
const TEXT_SIZES=[['default','Default','Aa'],['large','Large','Aa'],['xl','Extra large','Aa']];
function applyUi(){document.documentElement.dataset.text=state.textSize||'default';const ui=resolvedUi(),light=ui==='daylight';document.documentElement.dataset.uiChoice=state.ui||'vivid';document.documentElement.dataset.ui=ui;const el=document.getElementById('nb-theme');if(el){el.disabled=light;if(el.sheet)el.sheet.disabled=light;}document.querySelector('meta[name=theme-color]')?.setAttribute('content',light?'#ffffff':ui==='midnight'?'#03050c':'#080b16');;try{const bg=getComputedStyle(document.documentElement).backgroundColor;window.ReactNativeWebView?.postMessage(JSON.stringify({type:'ui',light,bg}));}catch{}}
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
// Plan courses: NCLEX topic areas (Pediatrics, Maternal & Newborn, ...) and book chapters. A plan can mix several.
// Keys: 'n:<nclex topic id>' and 'b:<chapter id>'. Topic keys: 'n:<id>' (the whole area) or 'b:<chapter id>::<section>'.
const PLAN_GROUPS = [['n', 'NCLEX topics'], ['b', 'Book chapters']];
function planCourses() {
  return [...nclexTopics.map(t => ({ key: `n:${t.id}`, group: 'n', name: t.name, color: t.color, topics: [`n:${t.id}`] })),
    ...courses.map(c => ({ key: `b:${c.id}`, group: 'b', name: c.name, topics: c.topics.map(t => `b:${c.id}::${t}`) }))];
}
const planCourseOf = key => planCourses().find(c => c.key === key);
function planTopicInfo(tk) {
  if (typeof tk !== 'string') return null;
  if (tk.startsWith('n:')) { const t = nclexTopics.find(x => x.id === tk.slice(2)); return t ? { key: tk, course: tk, kind: 'n', id: t.id, name: t.name, courseName: 'NCLEX topic' } : null; }
  const m = /^b:([^:]+)::(.+)$/.exec(tk); if (!m) return null; const c = courseOf(m[1]);
  return c && c.topics.includes(m[2]) ? { key: tk, course: `b:${c.id}`, kind: 'b', id: c.id, name: m[2], courseName: c.name } : null;
}
const planTopicName = tk => planTopicInfo(tk)?.name || '';
function planCourseNames(p, max = 3) { const n = p.courses.map(k => planCourseOf(k)?.name).filter(Boolean); return n.length > max ? `${n.slice(0, max).join(', ')} +${n.length - max} more` : n.join(', '); }
function cleanPlan(p){
  if(!isObj(p))return null;
  if(!isStr(p.title)||!p.title.trim()||!isDay(p.date)||!isDay(p.created))return null;
  const minutes=Number(p.minutes);if(!Number.isFinite(minutes)||minutes<=0)return null;
  let keys,topics;
  if(Array.isArray(p.courses)){keys=[...new Set(p.courses.filter(k=>isStr(k)&&planCourseOf(k)))];topics=Array.isArray(p.topics)?[...new Set(p.topics.filter(t=>{const i=planTopicInfo(t);return i&&keys.includes(i.course);}))]:[];}
  else{const course=courseOf(p.course);if(!course)return null;keys=[`b:${course.id}`];topics=Array.isArray(p.topics)?p.topics.filter(t=>isStr(t)&&course.topics.includes(t)).map(t=>`b:${course.id}::${t}`):[];}   // plans saved before multi-course
  if(!keys.length||!topics.length)return null;
  const completed=Array.isArray(p.completed)?[...new Set(p.completed.filter(isDay))]:[];
  return {title:p.title.trim().slice(0,80),courses:keys,date:p.date,created:p.created,minutes,topics,completed};
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
  s.ui=UI_THEMES.some(t=>t[0]===saved.ui)?saved.ui:'vivid';s.textSize=TEXT_SIZES.some(t=>t[0]===saved.textSize)?saved.textSize:'default';
  s.milestones=Array.isArray(saved.milestones)?[...new Set(saved.milestones.filter(isStr))]:[];
  {const r=isObj(saved.reminder)?saved.reminder:{};s.reminder={on:r.on===true,time:isStr(r.time)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(r.time)?r.time:'19:00',days:Array.isArray(r.days)?[...new Set(r.days.filter(d=>Number.isInteger(d)&&d>=0&&d<=6))].sort():[1,2,3,4,5],title:isStr(r.title)?r.title.slice(0,80):'',notes:isStr(r.notes)?r.notes.slice(0,500):'',length:[15,20,30,45,60,90,120].includes(r.length)?r.length:30};}
  if(isDay(saved.lastOpen))s.lastOpen=saved.lastOpen;
  if(Number.isFinite(saved.lastWelcome))s.lastWelcome=saved.lastWelcome;
  s.caseHistory=keep(saved.caseHistory,h=>isObj(h)&&isStr(h.caseId)&&ngnCases.some(c=>c.id===h.caseId)&&isTime(h.finished)&&Number.isFinite(h.points)&&Number.isFinite(h.max)?h:null,'caseHistory');
  if(saved.caseSession!=null){const cs=saved.caseSession,c=isObj(cs)&&ngnCases.find(x=>x.id===cs.caseId);s.caseSession=c&&Number.isInteger(cs.index)&&cs.index>=0&&cs.index<c.items.length&&isObj(cs.answers)&&isObj(cs.submitted)?cs:null;if(!s.caseSession)bad.push({kind:'caseSession',value:cs});}
  if(saved.plan!=null){s.plan=cleanPlan(saved.plan);if(!s.plan)bad.push({kind:'plan',value:saved.plan});}
  if(saved.session!=null){s.session=cleanSession(saved.session);if(!s.session)bad.push({kind:'session',value:saved.session});}
  // When name, plan and reminder were last changed (for sync: the copy edited last wins).
  if(isObj(saved.edited))s.edited=Object.fromEntries(Object.entries(saved.edited).filter(([k,v])=>['name','plan','reminder'].includes(k)&&isTime(v)));
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
const PLATFORM=window.__RNR_PLATFORM__||(native?'ios':'web'), ANDROID=PLATFORM==='android';   // set by the Android/iOS shell
const TERMS_URL=ANDROID?'https://nclexrapidnursingreview.com/terms.html':'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
function save(){stampEdits();const ok=writeLocal();scheduleSync();return ok;}
function writeLocal(){const json=JSON.stringify(state);try{native?.postMessage(JSON.stringify({type:'save',data:json}));}catch{}try{localStorage.setItem(STORAGE,json);return true;}catch{if(native)return true;storageOK=false;toast('Storage is unavailable. Export your progress before leaving.');return false;}}
// ---- Sync and web access (optional Sign in with Apple; see account.js) ----
// Nothing here runs unless the learner signs in. Without an account the app is unchanged.
const EDIT_KEYS=['name','plan','reminder'];
const snapEdits=s=>Object.fromEntries(EDIT_KEYS.map(k=>[k,JSON.stringify(s[k]??null)]));
let editSnap=snapEdits(state), syncTimer=null, acctBusy=false, acctErr='';
function stampEdits(){const cur=snapEdits(state),now=new Date().toISOString();for(const k of EDIT_KEYS)if(cur[k]!==editSnap[k])state.edited={...(state.edited||{}),[k]:now};editSnap=cur;}
function scheduleSync(ms=4000){if(!Account.enabled()||!Account.status.session)return;clearTimeout(syncTimer);syncTimer=setTimeout(runSync,ms);}
async function runSync(){
  if(!Account.enabled()||!Account.status.session)return;
  clearTimeout(syncTimer);
  await Account.syncNow(()=>state,merged=>{
    const keepLocal=modal.open&&(quizVisible||modal.classList.contains('exam')||modal.classList.contains('case'));
    const clean=normalizeState(merged).state;
    if(keepLocal){clean.session=state.session;clean.caseSession=state.caseSession;}
    state=clean;editSnap=snapEdits(state);writeLocal();
    if(!modal.open)render();
  });
  try{const sent=await Account.sendReports(state.reports);if(sent.length){state.reports=state.reports.map(r=>sent.includes(r.id)?{...r,status:'sent'}:r);writeLocal();}}catch{}
}
const APPLE_LOGO='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M16.37 12.8c-.02-2.1 1.72-3.12 1.8-3.17-.98-1.43-2.5-1.63-3.04-1.65-1.29-.13-2.52.76-3.18.76-.66 0-1.67-.74-2.75-.72-1.41.02-2.72.82-3.45 2.09-1.47 2.55-.38 6.33 1.06 8.4.7 1.01 1.54 2.15 2.63 2.11 1.06-.04 1.46-.68 2.73-.68 1.28 0 1.64.68 2.75.66 1.14-.02 1.86-1.03 2.55-2.05.8-1.17 1.13-2.31 1.15-2.37-.03-.01-2.21-.85-2.25-3.38zM14.3 6.62c.58-.71.98-1.69.87-2.67-.84.03-1.86.56-2.46 1.27-.54.62-1.01 1.62-.89 2.58.94.07 1.9-.48 2.48-1.18z"/></svg>';
function accountCard(){
  if(!Account.enabled())return '';
  const st=Account.status,web=Account.isWeb(),host=String(Account.webAppUrl()).replace(/^https:\/\//,'').replace(/\/$/,'');
  const err=acctErr||st.lastError;
  const errHtml=err?`<p class="sync-err" role="alert">${escape(err)}</p>`:'';
  if(!st.session)return `<section class="theme-card sync-card" id="sync-card"><p class="theme-eyebrow">Sync and web access</p><p class="sync-copy">Optional. Sign in with Apple to keep your progress in sync and to study on your Mac or any computer at <b>${escape(host)}</b> with your Pro subscription. Without it, everything stays on this device and works offline, as it does now.</p>${errHtml}<button class="apple-btn" data-action="acct-signin" ${acctBusy?'disabled':''}>${APPLE_LOGO}<span>${acctBusy?'Signing in…':'Sign in with Apple'}</span></button></section>`;
  const email=st.session.email&&!/privaterelay/i.test(st.session.email)?` · ${escape(st.session.email)}`:'';
  const last=st.lastSyncedAt?new Date(st.lastSyncedAt).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'Not yet';
  return `<section class="theme-card sync-card" id="sync-card"><p class="theme-eyebrow">${web?'Your account':'Sync and web access'}</p><dl class="sync-kv"><dt>Signed in</dt><dd>with Apple${email}</dd><dt>Last synced</dt><dd>${last}${st.syncing?' · syncing…':''}</dd></dl>${web?'':`<p class="sync-copy">Study on your Mac or any computer at <b>${escape(host)}</b> with this Apple ID. Your progress follows you.</p>`}${errHtml}<div class="sync-row"><button class="secondary" data-action="acct-sync" ${st.syncing?'disabled':''}>${icon('refresh')}Sync now</button><button class="secondary" data-action="acct-signout">Sign out</button><button class="text-link danger" data-action="acct-delete">Delete account</button></div></section>`;
}
function refreshAccountCard(){const el=document.querySelector('#sync-card');if(el)el.outerHTML=accountCard();}
Account.onChange(()=>refreshAccountCard());
function showDeleteAccount(){modalShell('Delete your account?','This can’t be undone.',`<p class="about-copy">This permanently deletes your Rapid Nursing Review account and the progress synced with it. Progress saved on this device stays until you reset it.</p><p class="about-copy">Your subscription is billed by Apple. Deleting the account doesn’t cancel it: cancel it in your App Store account if you want to stop it.</p><label class="field">Type DELETE to confirm<input id="del-confirm" autocomplete="off" autocapitalize="characters" spellcheck="false"></label>${acctErr?`<p class="sync-err" role="alert">${escape(acctErr)}</p>`:''}<div class="modal-footer"><a class="secondary" href="https://apps.apple.com/account/subscriptions" target="_blank" rel="noopener noreferrer">Manage subscription</a><button class="primary danger-btn" data-action="acct-delete-confirm" disabled>Delete account</button></div>`);}
document.addEventListener('input',e=>{if(e.target.id==='del-confirm'){const b=document.querySelector('[data-action="acct-delete-confirm"]');if(b)b.disabled=e.target.value.trim()!=='DELETE';}});
async function accountAction(action){
  if(acctBusy)return;
  const run=async(fn)=>{acctBusy=true;acctErr='';refreshAccountCard();try{await fn();}catch(err){acctErr=err?.message||String(err);}finally{acctBusy=false;refreshAccountCard();}};
  if(action==='acct-signin')return run(async()=>{if(await Account.signInWithApple()){toast('Signed in. Your progress is syncing.');await runSync();refreshAccountCard();}});
  if(action==='acct-sync'){acctErr='';return runSync().then(refreshAccountCard);}
  if(action==='acct-signout')return run(async()=>{await Account.signOut();toast('Signed out. Your progress stays on this device.');if(Account.isWeb())location.reload();});
  if(action==='acct-delete'){acctErr='';showDeleteAccount();return;}
  if(action==='acct-delete-confirm'){if(document.querySelector('#del-confirm')?.value.trim()!=='DELETE')return;await run(async()=>{try{await Account.deleteAccount();}catch(err){if(err.cancelled){acctErr='';return;}throw err;}closeModal();toast('Your account was deleted.');if(Account.isWeb())location.reload();});if(acctErr)showDeleteAccount();}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action^="acct-"]');if(b){e.preventDefault();accountAction(b.dataset.action);}});
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
const PRO_PRICES = { monthly: '$19.99', quarter: '$49.99', annual: '$89.99', lifetime: '$119.00' };
// Every subscription starts with a 2-week free trial (an Apple introductory offer). Lifetime has no trial.
const TRIAL = { words: '2 weeks', adj: '2-Week' };
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
  return `<section class="pro-gate"><span class="pg-lock">${icon('lock')}</span><span class="pg-eyebrow">Pro feature</span><h3>${feature}</h3>${desc ? `<p>${desc}</p>` : ''}<p class="pg-price"><b>${TRIAL.words} free</b>, then from <b>${PRO_PRICES.monthly}</b> a month · ${PRO_PRICES.quarter} for 3 months · ${PRO_PRICES.annual}/year · ${PRO_PRICES.lifetime} once</p><button class="pg-btn" data-action="paywall" data-reason="${reason}">${icon('crown')}See Pro</button></section>`;
}
function renderUpgrade() {
  const el = document.querySelector('#upgrade'); if (!el) return;
  el.outerHTML = isPro() ? `<button id="upgrade" class="pro-member" data-action="settings-plan" aria-label="Pro member. Open your plan in Settings">${icon('crown')}Pro</button>` : `<button id="upgrade" class="upgrade-pill" data-action="paywall" data-reason="all" aria-label="Upgrade to Pro">${icon('crown')}<span>Upgrade</span></button>`;
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
// Bank counts shown on the paywall, Question Bank card, Overview and About. NGN formats = select-all, matrix and ordered response.
const N = (() => { const ngn = active.filter(q => q.type === 'sata' || q.type === 'matrix' || q.type === 'order').length; return { total: active.length, ngn, cases: ngnCases.length, caseItems: ngnCases.reduce((n, c) => n + c.items.length, 0), fmt: n => n.toLocaleString() }; })();
const countsLine = () => `${N.fmt(N.total)} NCLEX-style questions (${N.fmt(N.ngn)} in NGN formats) · ${N.cases} NGN case studies`;
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
function pageImg(p){return window.__rnrWebPageSrc?window.__rnrWebPageSrc(p):`pages/p${String(p).padStart(3,'0')}.webp`;}
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
// Enlarge: the book panel fills the window on a computer (phones and iPads already show it full screen). Remembered on this device.
let bookWide=(()=>{try{return localStorage.getItem('rnr.bookWide')==='1';}catch{return false;}})();
function renderBookPanel(){
  const panel=document.querySelector('#book-panel'),open=bookIsOpen();
  document.body.classList.toggle('book-open',open);document.body.classList.toggle('book-wide',open&&bookWide);
  panel.hidden=!open;document.querySelector('#book-backdrop').hidden=!open;
  document.querySelectorAll('[data-action="toggle-book"]').forEach(x=>x.setAttribute('aria-expanded',String(open)));
  if(!open){panel.innerHTML='';return;}
  const body=panel.querySelector('.bp-body'),sameTab=panel.dataset.tab===state.book.tab,scroll=body?body.scrollTop:0;
  panel.dataset.tab=state.book.tab;
  panel.innerHTML=`<div class="bp-head"><img class="bp-cover" src="pages/cover.webp" alt="Cover of Rapid Nursing Review: All Body Systems at a Glance"><div class="bp-meta"><h2>Rapid Nursing Review</h2><p class="bp-sub">All Body Systems at a Glance</p><p class="bp-author">${(([n,...c])=>`<span class="bp-name">${escape(n.trim())}</span>${c.length?`<span class="bp-creds">${escape(c.join(',').trim())}</span>`:''}`)(book.author.split(','))}</p></div><button class="icon-button" data-action="close-book" aria-label="Close the book">${icon('close')}</button></div><div class="bp-tabs" role="tablist" aria-label="Book views">${[['contents','Contents'],['reader','Reader']].map(([id,l])=>`<button class="bp-tab" role="tab" aria-selected="${state.book.tab===id}" data-action="book-tab" data-tab="${id}">${l}</button>`).join('')}<button class="bp-enlarge" data-action="book-wide" aria-pressed="${bookWide}">${icon(bookWide?'shrink':'expand')}${bookWide?'Smaller':'Enlarge'}</button></div><div class="bp-body" tabindex="-1">${state.book.tab==='reader'?readerView():contentsView()}</div>`;
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
function examCard(){const p=state.plan;if(!p)return `<aside class="exam-card"><div class="exam-top">${icon('calendar')}YOUR NEXT EXAM</div><h3>A goal to work toward.</h3><p>Choose your exam date. We’ll turn your topics into a little daily plan.</p><div class="exam-count"><strong>01</strong><span>plan. One less thing to worry about.</span></div>${secondary('Set up my study plan','edit-plan','','arrow')}</aside>`;const days=dayDistance(new Date(),parseDay(p.date));return `<aside class="exam-card"><div class="exam-top">${icon('calendar')}YOUR NEXT EXAM</div><h3>${escape(p.title)}</h3><p>${readableDate(parseDay(p.date),{weekday:'long',month:'long',day:'numeric'})} · ${escape(planCourseNames(p,2))}</p><div class="exam-count"><strong>${Math.max(0,days)}</strong><span>${days<0?'days · exam date has passed':days===0?'days · today’s the day!':'days to make it click'}</span></div>${secondary('View my study plan','plan','','arrow')}</aside>`;}

function activityChart(){
  // HUD-style week view: neon bars with a glow, a dashed daily-goal line, today highlighted, and four quick stats.
  const days=Array.from({length:7},(_,i)=>addDays(new Date(),i-6)),counts=days.map(d=>state.attempts.filter(a=>a.day===dayKey(d)).length);
  const goal=state.plan?.minutes?Math.max(5,Math.round(state.plan.minutes)):20,max=Math.max(goal,5,...counts),total=counts.reduce((a,b)=>a+b,0);
  const active=counts.filter(Boolean).length,best=Math.max(...counts),avg=Math.round(total/7),pct=n=>Math.max(n?6:2,Math.round(n/max*100));
  const stat=(v,l)=>`<div class="wk-stat"><b>${v}</b><span>${l}</span></div>`;
  return `<div class="wk-hud" role="img" aria-label="Questions answered in the past 7 days: ${days.map((d,i)=>`${readableDate(d)}: ${counts[i]}`).join(', ')}. Daily goal ${goal}.">
<div class="wk-stats">${stat(total,'this week')}${stat(avg,'daily avg')}${stat(best,'best day')}${stat(`${active}/7`,'active days')}</div>
<div class="wk-plot"><div class="wk-grid"><i></i><i></i><i></i><i></i></div><div class="wk-goal" style="bottom:${Math.round(goal/max*100)}%"><span>goal ${goal}</span></div>
${counts.map((n,i)=>`<div class="wk-col${i===6?' today':''}${n>=goal?' hit':''}"><span class="wk-n">${n||''}</span><div class="wk-bar" style="height:${pct(n)}%"></div></div>`).join('')}</div>
<div class="wk-days">${days.map((d,i)=>`<span class="${i===6?'today':''}"><b>${readableDate(d,{weekday:'short'}).slice(0,2)}</b>${d.getDate()}</span>`).join('')}</div>
<p class="wk-note">${total?(counts[6]>=goal?'Goal hit today. That is how readiness is built.':`${Math.max(0,goal-counts[6])} more today to hit your goal of ${goal}.`):'Your first session is the start of something good.'}</p></div>`;}
// "Mission control" progress ring on the overview (same design as Critical Care Certified): readiness (latest-answer
// accuracy), bank covered and today's goal as three glowing rings around a live score, with a turning orbit.
function progressRing(){
  const lat=latestAttempts(),bank=isPro()?N.total:freeIds.size,seen=new Set(state.attempts.map(a=>a.qid)).size;
  const readiness=lat.length?lat.filter(a=>a.correct).length/lat.length:null,coverage=bank?Math.min(1,seen/bank):0;
  const goal=state.plan?.minutes?Math.max(5,Math.round(state.plan.minutes)):20,todayN=state.attempts.filter(a=>a.day===dayKey()).length,today=Math.min(1,todayN/goal);
  const score=readiness===null?null:Math.round(readiness*100),days=streak();
  const arc=(r,v,id,delay)=>{const len=2*Math.PI*r,x=Math.max(0,Math.min(1,v||0));return `<circle cx="110" cy="110" r="${r}" class="pr-track" stroke-width="12"/>${x>0?`<circle cx="110" cy="110" r="${r}" class="pr-arc" stroke="url(#${id})" stroke-width="12" filter="url(#pr-glow)" stroke-dasharray="${len*x} ${len}" style="--len:${len};--delay:${delay}ms" transform="rotate(-90 110 110)"/>`:''}${x>.02?`<circle class="pr-dot" r="4.5" cx="${110+r*Math.sin(2*Math.PI*x)}" cy="${110-r*Math.cos(2*Math.PI*x)}"/>`:''}`;};
  const ticks=Array.from({length:60},(_,i)=>{const a=i/60*2*Math.PI,r2=i%5?107:110;return `<line x1="${110+104*Math.sin(a)}" y1="${110-104*Math.cos(a)}" x2="${110+r2*Math.sin(a)}" y2="${110-r2*Math.cos(a)}"/>`;}).join('');
  const line=!lat.length?'Answer your first questions to light up the rings.':today>=1?'Daily goal complete. That is how first-try passes are made.':score>=75?'You are in the passing zone. Keep the streak alive.':score>=60?'Climbing fast. A few more sessions to the passing zone.':'Every question you miss now is one you will get right on test day.';
  const rows=[['pr-c1','Readiness',score===null?'—':score+'%',lat.length?`latest answer on ${N.fmt(lat.length)} questions`:'accuracy on your latest answers'],['pr-c2','Bank covered',Math.round(coverage*100)+'%',`${N.fmt(seen)} of ${N.fmt(bank)} questions`],['pr-c3','Today',`${todayN}/${goal}`,today>=1?'goal reached':`${goal-todayN} to go`]];
  return `<section class="pr-card" aria-labelledby="pr-h"><div class="pr-grid" aria-hidden="true"></div><div class="pr-ring"><svg viewBox="0 0 220 220" role="img" aria-label="Readiness ${score===null?'not yet measured':score+' percent'}, ${Math.round(coverage*100)} percent of the bank covered, ${todayN} of ${goal} questions today"><defs><linearGradient id="pr-g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#a855f7"/></linearGradient><linearGradient id="pr-g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#f43f5e"/></linearGradient><linearGradient id="pr-g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#06b6d4"/></linearGradient><filter id="pr-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g class="pr-ticks">${ticks}</g><circle class="pr-orbit" cx="110" cy="110" r="44"/>${arc(92,readiness,'pr-g1',0)}${arc(74,coverage,'pr-g2',150)}${arc(56,today,'pr-g3',300)}</svg><div class="pr-center"><span class="pr-score">${score===null?'—':score}<small>${score===null?'':'%'}</small></span><span class="pr-label">Readiness</span></div></div><div class="pr-side"><p class="pr-eyebrow">Mission control</p><h2 id="pr-h">Your NCLEX readiness</h2><ul class="pr-legend">${rows.map(([c,k,v,sub])=>`<li class="${c}"><i></i><span><strong>${k}</strong><small>${sub}</small></span><b>${v}</b></li>`).join('')}</ul><div class="pr-streak"><span class="pr-flame">${icon('spark')}</span><span><strong>${days}</strong> day${days===1?'':'s'} in a row</span></div><p class="pr-line">${line}</p><button class="pr-go" data-action="quick">${icon('play')}${today>=1?'Go beyond today’s goal':'Power up: start a quick practice'}</button></div></section>`;
}
function dashboard(){const resume=state.session;const weak=missed();const map=latestMap();const weakSecs=[...new Set(weak.map(id=>qOf(id)?.section).filter(Boolean))].map(sectionOf).filter(Boolean).slice(0,3);const cur=sectionAtPage(state.book.page)||sections[0];return `${heading(`${firstName() ? `Let’s make it click, ${escape(firstName())}.` : 'Let’s make it click, future nurse.'}`,`You belong here. A little focused practice today, a more confident you tomorrow.`)}${progressRing()}<div class="motivate-row single">${motivationCard()}</div>${isPro() ? '' : `<section class="pro-upsell"><div class="pu-text"><span class="pu-eyebrow">${icon('crown')}Rapid Nursing Review Pro</span><h3>Unlock all ${N.fmt(N.total)} NCLEX-style questions, ${N.cases} NGN case studies and the full book.</h3><p>You’re on the free plan: ${freeIds.size} questions, 1 case study and the preview pages. Try it free for ${TRIAL.words}, then from ${PRO_PRICES.monthly}/month.</p></div><button class="pg-btn" data-action="paywall" data-reason="all">${icon('crown')}See Pro</button></section>`}${statCards()}<div class="hero-row"><section class="focus-card"><div class="focus-label">${icon('spark')}${resume?'PICK UP WHERE YOU LEFT OFF':'A GOOD PLACE TO START'}</div><h2>${resume?'Your next question<br>is waiting for you.':'Understand the why.<br>Remember the answer.'}</h2><p>${resume?'Your answers are saved. Continue your session and keep your momentum.':'Read a section of the book, then test yourself on it. Every answer links back to the page it came from.'}</p><div class="focus-bottom">${primary(resume?'Resume practice':'Start a quick practice',resume?'resume':'quick','',true)}<span class="focus-meta">${icon('clock')}${resume?`${resume.ids.length} questions · ${resume.mode} mode`:'4 questions · tutor mode'}</span></div><div class="orbital" aria-hidden="true"><div class="orbit"></div><span class="star">✧</span><span class="orbit-dot"></span><span class="orbit-dot second"></span></div></section>${examCard()}</div><div class="section-title"><div><h2>The book, chapter by chapter</h2><p>Each chapter of <cite>Rapid Nursing Review</cite> is a course. Each section has its own quiz.</p></div>${textLink('See all sections','book')}</div>${courseCards()}<div class="bottom-grid"><section class="panel"><div class="section-title"><h2>${weakSecs.length?'Re-read what you missed':'Continue the book'}</h2>${textLink('Open the book','toggle-book')}</div><div class="chapter-list">${(weakSecs.length?weakSecs:[cur]).map(s=>sectionRow(s,map)).join('')}</div>${weak.length?`<div class="spacer">${textLink(`Revisit ${weak.length} missed question${weak.length>1?'s':''}`,'review')}</div>`:''}</section><section class="panel"><div class="section-title"><h2>Your study rhythm</h2><span class="subtle-pill">Last 7 days</span></div>${activityChart()}</section></div>${legal()}`;}
function filters(){return `<div class="filter-row" role="group" aria-label="Filter by chapter">${[{id:'all',name:'All chapters'},...courses.map(c=>({id:c.id,color:c.color,name:`${/^\d+$/.test(c.num)?c.num+' · ':''}${c.short}`}))].map(c=>`<button class="filter${filter===c.id?' active':''}" style="--cc:${c.color||'#2b2f33'}" data-action="filter" data-filter="${c.id}" aria-pressed="${filter===c.id}">${c.name}</button>`).join('')}</div>`;}

function progressPage(){const s=stats();return `${heading('See how far you’ve come.','Your progress reflects practice on this device.',secondary('Share progress','share-progress','','share')+secondary('Export progress','export','','download'))}${statCards()}<div class="bottom-grid"><div class="panel"><div class="section-title"><h2>Practice by course</h2></div>${courses.map(c=>{const a=state.attempts.filter(x=>qOf(x.qid)?.course===c.id),acc=a.length?Math.round(a.filter(x=>x.correct).length/a.length*100):null;return `<div style="margin:19px 0"><div class="course-progress-label" style="font-size:12px"><span>${c.name}</span><span>${acc===null?'No answers yet':`${acc}% · ${a.length} answers`}</span></div><div class="progress-track" style="height:6px"><div class="progress-fill" style="width:${acc||0}%"></div></div></div>`;}).join('')}<p class="dialog-note">Repeated questions count as practice attempts. These scores do not predict exam readiness or NCLEX outcomes.</p></div><div class="panel"><div class="section-title"><h2>Last 7 days</h2></div>${activityChart()}</div></div><section class="panel spacer"><div class="section-title"><div><h2>By NCLEX client need</h2><p>2026 NCLEX-RN test plan categories, latest answer per question.</p></div></div><div class="need-list">${(()=>{const lat=latestAttempts();return clientNeeds.map(c=>{const a=lat.filter(x=>qOf(x.qid)?.clientNeed===c.id),r=a.filter(x=>x.correct).length;return `<div class="need-row"><span>${escape(c.name)} <small>(NCLEX ${c.target_pct-3}–${c.target_pct+3}%)</small></span><span>${a.length?`${Math.round(r/a.length*100)}% · ${a.length}`:'No answers yet'}</span><div class="progress-track"><div class="progress-fill" style="width:${a.length?r/a.length*100:0}%"></div></div></div>`;}).join('');})()}</div>${state.caseHistory.length?`<h3 class="need-title">NGN case studies</h3>${state.caseHistory.slice().reverse().map(h=>`<div class="history-row"><div><h3>${escape(caseOf(h.caseId).title)}</h3><p>${readableDate(new Date(h.finished),{month:'short',day:'numeric'})}</p></div><span class="history-score">${h.points} / ${h.max}</span></div>`).join('')}`:''}</section><section class="panel spacer"><div class="section-title"><h2>Completed sessions</h2><span class="subtle-pill">${state.history.length} sessions</span></div>${state.history.length?state.history.slice().reverse().map(h=>`<div class="history-row"><span class="course-icon sage">${icon('check')}</span><div><h3>${escape(h.label)}</h3><p>${readableDate(new Date(h.finished),{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})} · ${h.mode==='exam'?'Timed exam':'Tutor mode'} · ${h.count} questions</p></div><span class="history-score">${h.correct} / ${h.count}</span>${textLink('Review','history',`data-id="${h.id}"`)}</div>`).join(''):`<p class="dialog-note">Finish your first session to see it here.</p><div class="spacer">${primary('Start your first practice','quick')}</div>`}</section>${s.total?`<section class="panel spacer"><h2>What’s behind your mistakes?</h2><p class="dialog-note">Self-reflections you selected while reviewing a question.</p><div class="filter-row spacer">${['Knowledge gap','Missed cue','Prioritization','Calculation'].map(m=>`<span class="subtle-pill">${m}: ${state.attempts.filter(a=>a.mistake===m).length}</span>`).join('')}</div>${missed().length?secondary('Review missed questions','review','','refresh'):''}</section>`:''}`;}
function bookmarksPage(){const qs=state.bookmarks.map(qOf).filter(Boolean);return `${heading('Keep the useful ones close.','A personal collection of questions to revisit.')}${qs.length?qs.map(q=>`<article class="bookmark-card"><span class="tag">${escape(qWhere(q))}</span><h3>${escape(q.stem)}</h3><div class="bookmark-actions">${secondary('Practice question','single',`data-id="${q.id}"`,'practice')}${secondary('Remove bookmark','bookmark',`data-id="${q.id}"`,'bookmark')}</div></article>`).join(''):`<div class="empty-state"><span class="course-icon sage">${icon('bookmark')}</span><h2>Good questions deserve a second look.</h2><p>Bookmark a question during practice. It will be right here when you need it.</p>${primary('Find your first question','practice')}</div>`}`;}
function bookPage(){const visible=courses.filter(c=>filter==='all'||c.id===filter);const map=latestMap();return `${heading('The book, section by section.',`<cite>Rapid Nursing Review: All Body Systems at a Glance</cite> · ${escape(book.author)}`,secondary('Open the reader','toggle-book','','book'))}${filters()}${visible.map(c=>chapterBlock(c,map)).join('')}<p class="dialog-note">${book.pages} pages · ${sections.length} sections · ${active.length} quiz questions. Quiz questions are written from the book and reviewed by the author.</p>`;}
function planTopicFor(p,i){const by=p.courses.map(k=>p.topics.filter(t=>planTopicInfo(t)?.course===k)).filter(a=>a.length);if(!by.length)return p.topics[i%p.topics.length];const a=by[i%by.length];return a[Math.floor(i/by.length)%a.length];}   // courses take turns, each cycling through its own topics
function planDays(){const p=state.plan;if(!p)return[];const distance=dayDistance(parseDay(p.created),parseDay(p.date));return Array.from({length:Math.max(1,distance+1)},(_,i)=>{const day=dayKey(addDays(parseDay(p.created),i));const final=i===distance,topic=planTopicFor(p,i);return {day,topic,final};});}
function planPage(){const p=state.plan;const top=`<div class="plan-motivate">${motivationCard()}${reminderStrip()}</div>`;if(!p)return `${heading('Give your exam a little structure.','Turn your date, topics, and available time into a daily plan.')}${top}<div class="empty-state"><span class="course-icon sage">${icon('calendar')}</span><h2>A plan that fits your next exam.</h2><p>Choose a course and topics. Tell us your exam date and how much time you have each day.</p>${primary('Build my study plan','edit-plan')}</div>`;const all=planDays();const days=showAllDays?all:all.slice(0,14);return `${heading('A little closer, every day.','Your course exam, broken into manageable steps.',secondary('Edit plan','edit-plan','','edit'))}${top}<div class="plan-summary"><div class="panel"><span class="eyebrow">YOUR NEXT EXAM</span><h2>${escape(p.title)}</h2><p>${readableDate(parseDay(p.date),{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p><p class="plan-courses">${escape(planCourseNames(p,4))}</p></div><div class="panel"><span class="eyebrow">TIME YOU’VE SET ASIDE</span><h2>${p.minutes} minutes a day</h2><p>${p.topics.length} topic${p.topics.length===1?'':'s'} across ${p.courses.length} course${p.courses.length===1?'':'s'}: ${p.topics.slice(0,6).map(t=>escape(planTopicName(t))).join(' · ')}${p.topics.length>6?' …':''}</p></div></div><div class="notice">${p.completed.length} of ${all.length} study days checked off. Repeat practice builds familiarity; use fresh, clinically reviewed questions to assess learning.</div><div class="panel"><div class="section-title"><h2>Your daily plan</h2><span class="subtle-pill">${showAllDays?'All scheduled days':'First 14 days'}</span></div>${days.map(d=>{const complete=p.completed.includes(d.day);return `<div class="plan-day${complete?' day-complete':''}"><button class="check-day${complete?' checked':''}" data-action="check-day" data-day="${d.day}" aria-label="${complete?'Mark incomplete':'Mark complete'}: ${d.day}" aria-pressed="${complete}">${complete?'✓':''}</button><span class="day-date">${readableDate(parseDay(d.day),{month:'short'})}<strong>${parseDay(d.day).getDate()}</strong></span><div>${d.final?'':`<span class="day-course">${escape(planTopicInfo(d.topic)?.courseName||'')}</span>`}<h3>${d.final?'Exam day: a light concept review':escape(planTopicName(d.topic))}</h3><p>${d.final?'Review key clues and make room to rest.':`${Math.round(p.minutes*.4)} min concept review · ${Math.round(p.minutes*.4)} min practice · ${p.minutes-Math.round(p.minutes*.4)*2} min reflection`}</p></div>${(()=>{const t=planTopicInfo(d.topic);return d.final?secondary('The book','book'):t.kind==='n'?secondary('Practice','plan-nclex','data-id="'+t.id+'"'):secondary('Practice','setup',`data-course="${t.id}" data-topic="${escape(t.name)}"`);})()}</div>`;}).join('')}${all.length>14&&!showAllDays?`<div class="spacer">${secondary(`Show all ${all.length} days`,'all-days')}</div>`:''}</div>`;}
function render(){const page=route();const navs=[['dashboard','Overview','dashboard'],['practice','Practice questions','practice'],['book','The book','book'],['plan','Study plan','calendar'],['progress','My progress','chart'],['bookmarks','Bookmarks','bookmark']];const navColors={dashboard:['#2563eb','#93C5FD'],practice:['#ea580c','#FDBA74'],book:['#16a34a','#6EE7B7'],plan:['#9333ea','#C4B5FD'],progress:['#0891b2','#67E8F9'],bookmarks:['#db2777','#FDA4AF']};document.querySelector('#nav').innerHTML=navs.map(([id,title,ic])=>`<a class="nav-link${id===page?' active':''}" style="--nl:${navColors[id][0]};--nd:${navColors[id][1]}" href="#${id}" ${id===page?'aria-current="page"':''}>${icon(ic)}${title}${id==='bookmarks'&&state.bookmarks.length?`<span class="nav-count">${state.bookmarks.length}</span>`:''}</a>`).join('');document.querySelector('#breadcrumb').textContent=navs.find(n=>n[0]===page)[1];document.querySelector('#profile-name').textContent=state.name;document.querySelector('#profile-initials').textContent=initials(state.name);document.querySelector('#top-initials').textContent=initials(state.name);main.innerHTML=(!storageOK?'<div class="storage-warning">Browser storage is unavailable. Export your progress before closing this page.</div>':'')+(loadNotice?`<div class="storage-warning" role="status">${escape(loadNotice)} <button class="text-link" data-action="dismiss-notice">Dismiss</button></div>`:'')+({dashboard,practice:practicePage,plan:planPage,progress:progressPage,bookmarks:bookmarksPage,book:bookPage}[page])();const tabs=[['plan','Plan','calendar','#6D28D9','#C4B5FD'],['book','Book','book','#065F46','#6EE7B7'],['practice','Practice','practice','#9A3412','#FDBA74'],['progress','Progress','chart','#155E75','#67E8F9'],['bookmarks','Bookmarks','bookmark','#BE123C','#FDA4AF']];document.querySelector('#tabbar').innerHTML=tabs.map(([id,label,ic,l,dk])=>`<a class="tab" style="--tl:${l};--td:${dk}" href="#${id}" ${id===page?'aria-current="page"':''} aria-label="${navs.find(n=>n[0]===id)[1]}"><span class="tab-ic">${icon(ic)}</span><span class="tab-label">${label}</span></a>`).join('');hydrateIcons();renderBookPanel();renderUpgrade();fitTileNames();}
// Exam focus (web): questions and case studies fill the whole window, and the browser goes full screen when it allows,
// so nothing behind the exam distracts. If the learner leaves full screen (Esc), we don't push it again until the next session.
let focusDismissed=false,focusAsked=false;
function examFocus(on){
  if(native)return;
  document.body.classList.toggle('exam-focus',!!on);
  const fsEl=document.fullscreenElement||document.webkitFullscreenElement;
  if(on&&!fsEl&&!focusDismissed&&!focusAsked&&document.fullscreenEnabled){focusAsked=true;document.documentElement.requestFullscreen?.({navigationUI:'hide'}).catch(()=>{});}
  if(!on){focusDismissed=false;focusAsked=false;if(fsEl)(document.exitFullscreen||document.webkitExitFullscreen)?.call(document)?.catch?.(()=>{});}
}
document.addEventListener('fullscreenchange',()=>{
  if(!document.fullscreenElement){if(document.body.classList.contains('exam-focus'))focusDismissed=true;return;}
  // The full-screen page joins the browser's top layer above the open exam dialog: reopen the dialog so it sits on top again.
  if(modal.open){const sc=modal.scrollTop,f=document.activeElement;modal.close();modal.showModal();modal.scrollTop=sc;if(f&&modal.contains(f))f.focus({preventScroll:true});}
});
function modalShell(title,subtitle,body,cls=''){examFocus(quizVisible);const prev=document.activeElement,sel=prev&&modal.contains(prev)&&prev.dataset&&prev.dataset.action?`[data-action="${prev.dataset.action}"]`+['choice','row','col','v','group','tab','pool','mode','view','id'].filter(k=>prev.dataset[k]!=null).map(k=>`[data-${k}="${CSS.escape(prev.dataset[k])}"]`).join(''):null;modal.className=cls;modal.innerHTML=`<div class="modal-header"><div><h2 id="modal-title">${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</div><button class="icon-button" data-action="close-modal" aria-label="Close dialog">${icon('close')}</button></div><div class="modal-body">${body}</div>`;if(!modal.open)modal.showModal();const again=sel&&modal.querySelector(sel);if(again&&!again.disabled)again.focus();else if(sel)(modal.querySelector('.rationale h3')?modal.querySelector('.modal-footer .primary'):modal.querySelector('.modal-footer .primary:not([disabled])'))?.focus();}
function closeModal(){quizVisible=false;examFocus(false);modal.close();render();}
function openSetup(course='all',topic='all'){if(state.session){modalShell('You have a session in progress.','Your answers are saved on this device.',`<p class="about-copy">Continue your ${state.session.mode==='exam'?'timed exam':'tutor session'}, or finish it now before starting a new one.</p><div class="modal-footer">${secondary('Finish current session','finish')}${primary('Resume session','resume')}</div>`);return;}setupMode='tutor';modalShell('Make this practice yours.','A focused session for what you want to understand.',`<form id="practice-form"><div class="form-grid"><label class="field">Chapter<select id="practice-course">${[{id:'all',name:'All chapters'},...courses].map(c=>`<option value="${c.id}" ${course===c.id?'selected':''}>${c.name}</option>`).join('')}</select></label><label class="field">Section<select id="practice-topic"></select></label><div class="field full"><span>How do you want to practice?</span><div class="mode-pick"><button type="button" class="mode-option active" data-action="mode" data-mode="tutor"><strong>${icon('book')}Tutor mode</strong><p>Understand each answer as you go.</p></button><button type="button" class="mode-option" data-action="mode" data-mode="exam"><strong>${icon('clock')}Timed exam</strong><p>See explanations after you finish.</p></button></div></div><label class="field">Questions<select id="practice-count"></select></label><label class="field" id="time-field" style="display:none">Time limit<select id="practice-time"><option value="5">5 minutes</option><option value="10" selected>10 minutes</option><option value="20">20 minutes</option></select></label></div><p class="dialog-note">${active.length} questions organized by the book’s chapters and sections. Written from the book and reviewed by the author. Progress saves in this browser.</p><div class="modal-footer"><button class="primary" type="submit">Start practice ${icon('arrow')}</button></div></form>`);updateSetupTopics(topic);}
function updateSetupTopics(topic='all'){const course=document.querySelector('#practice-course').value;const topics=course==='all'?courses.flatMap(c=>c.topics):courseOf(course).topics;document.querySelector('#practice-topic').innerHTML=`<option value="all">All sections</option>`+topics.map(t=>`<option value="${t}" ${topic===t?'selected':''}>${t}</option>`).join('');updateSetupCounts();}
function setupQuestions(){const c=document.querySelector('#practice-course').value,t=document.querySelector('#practice-topic').value;return active.filter(q=>q.source==='book'&&allowedQ(q)&&(c==='all'||q.course===c)&&(t==='all'||q.topic===t));}
function updateSetupCounts(){const n=setupQuestions().length;const counts=[...new Set([Math.min(4,n),Math.min(8,n),n])];document.querySelector('#practice-count').innerHTML=counts.map(i=>`<option value="${i}">${i} question${i===1?'':'s'}</option>`).join('');}
function startSession(ids,mode='tutor',minutes=10,label='Mixed course practice'){if(state.session){openSetup();return;}state.session={id:crypto.randomUUID(),ids,mode,label,index:0,answers:{},started:new Date().toISOString(),deadline:mode==='exam'?Date.now()+minutes*60000:null};save();showQuiz();}
function selectedQuestion(){return qOf(state.session?.ids[state.session.index]);}





function nextQuestion(){const s=state.session;if(!s?.answers[s.ids[s.index]]?.submitted)return;if(s.index===s.ids.length-1){finishSession();return;}s.index++;save();showQuiz();}
function timerText(deadline){const n=Math.max(0,Math.ceil((deadline-Date.now())/1000));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')} LEFT`;}



function showLesson(id){const l=lessons.find(x=>x.id===id);if(!l)return;quizVisible=false;modalShell(l.title,`${courseOf(l.course).name} · ${l.read} read`, `<p class="lesson-content">${l.text}</p><div class="takeaway"><small>MAKE IT STICK</small><p>${l.takeaway}</p></div><a class="source-link" href="${sources[l.source].url}" target="_blank" rel="noopener noreferrer">${sources[l.source].name} ↗</a><p class="dialog-note">Source checked Oct 12, 2026</p><div class="modal-footer">${secondary(state.readLessons.includes(id)?'Marked as read':'Mark as read','read-lesson',`data-id="${id}"`,'check')}${primary('Practice this concept','lesson-practice',`data-id="${id}"`)}</div>`);}
function openPlan(){const p=state.plan;const date=p?.date||dayKey(addDays(new Date(),7));const sel=p?.courses||[];const all=planCourses();
modalShell('A plan for your next exam.','A few details. A manageable path forward.',`<form id="plan-form"><div class="form-grid"><label class="field full">Exam name<input name="title" value="${escape(p?.title||'')}" placeholder="e.g. Pediatrics & Maternal Exam" maxlength="80" required></label>
<div class="field full"><span id="plan-courses-title">Courses</span><details class="multi-select" id="plan-courses"${sel.length?'':' open'}><summary aria-labelledby="plan-courses-title plan-courses-label"><span id="plan-courses-label"></span></summary><div class="ms-panel">${PLAN_GROUPS.map(([g,label])=>`<fieldset class="ms-group"><legend>${label}</legend>${all.filter(c=>c.group===g).map(c=>`<label class="ms-option"><input type="checkbox" name="courses" value="${c.key}" ${sel.includes(c.key)?'checked':''}><span>${escape(c.name)}</span></label>`).join('')}</fieldset>`).join('')}</div></details><span class="field-hint">Tap to open, then choose one or more courses. Your days rotate between them.</span></div>
<label class="field">Exam date<input type="date" name="date" value="${date}" min="${dayKey()}" max="${dayKey(addDays(new Date(),90))}" required></label><label class="field">Minutes available each day<select name="minutes">${[10,15,20,30,45,60,90,120].map(n=>`<option value="${n}" ${n===(p?.minutes||20)?'selected':''}>${n} minutes</option>`).join('')}</select></label><div class="field full"><span>Topics to focus on</span><div id="plan-topics"></div><span class="field-hint">Every topic in a course you add starts checked. Uncheck any you don’t need.</span></div></div><div class="modal-footer"><button type="submit" class="primary">${p?'Save changes':'Build my plan'} ${icon('arrow')}</button></div></form>`);updatePlanTopics(p?.topics);}
function planCoursesChecked(){return [...document.querySelectorAll('#plan-courses input[name=courses]:checked')].map(i=>i.value);}
function updatePlanTopics(selected){
  const keys=planCoursesChecked(),box=document.querySelector('#plan-topics');if(!box)return;
  const prev=selected||[...box.querySelectorAll('input[name=topics]')].map(i=>i.checked?i.value:null).filter(Boolean),shown=new Set([...box.querySelectorAll('input[name=topics]')].map(i=>i.value));
  const lab=document.querySelector('#plan-courses-label');if(lab){const n=keys.map(k=>planCourseOf(k)?.name);lab.textContent=!n.length?'Choose courses':n.length<=2?n.join(', '):`${n.slice(0,2).join(', ')} +${n.length-2} more`;lab.classList.toggle('placeholder',!n.length);}
  box.innerHTML=keys.length?keys.map(k=>{const c=planCourseOf(k);return `<div class="pt-group"><p class="pt-title">${escape(c.name)}${c.group==='n'?' <span>NCLEX topic</span>':''}</p><div class="checkboxes">${c.topics.map(t=>{const on=selected?prev.includes(t):(shown.has(t)?prev.includes(t):true);return `<label class="check-label"><input name="topics" type="checkbox" value="${escape(t)}" ${on?'checked':''}>${escape(c.group==='n'?`All ${c.name} questions`:planTopicName(t))}</label>`;}).join('')}</div></div>`;}).join(''):'<p class="field-hint">Choose a course above to see its topics.</p>';
}

function showSearch(){modalShell('Find your next connection.','Search book sections, pages and practice questions.',`<input id="search-input" type="search" placeholder="Try “warfarin” or “DKA”" aria-label="Search the book and questions" autocomplete="off"><div id="search-results" class="search-results" aria-live="polite"></div>`);searchLibrary('');document.querySelector('#search-input').focus();}
function searchLibrary(term){term=term.toLowerCase().trim();const ss=sections.filter(s=>`${s.title} ${courseOf(s.course).name}`.toLowerCase().includes(term));const pages=term.length>2?pageText.map((t,i)=>i+1).filter(p=>readerAllows(p)&&pageText[p-1].toLowerCase().includes(term)):[];const qs=term.length>1?active.filter(q=>`${q.stem} ${q.topic}`.toLowerCase().includes(term)):[];document.querySelector('#search-results').innerHTML=ss.slice(0,6).map(s=>{const c=courseOf(s.course);return `<button class="search-item" data-action="read-section" data-id="${s.id}">${chapterNum(c)}<span><strong>${escape(s.title)}</strong><p>${c.name} · ${pageRange(s)} · ${sectionQs(s.id).length} questions</p></span></button>`;}).join('')+(pages.length?`<button class="search-item" data-action="book-search" data-q="${escape(term)}"><span class="sec-pages">${pages.length} pp.</span><span><strong>Search inside the book</strong><p>${pages.length} page${pages.length===1?'':'s'} mention “${escape(term)}”</p></span></button>`:'')+qs.slice(0,6).map(q=>`<button class="search-item" data-action="single" data-id="${q.id}"><span class="toc-num" style="background:${topicOf(q.nclexTopic)?.color||'#3a3f45'}">${allowedQ(q)?'Q':'🔒'}</span><span><strong>${escape(qWhere(q))}</strong><p>${escape(q.stem)}</p></span></button>`).join('')+(!ss.length&&!qs.length&&!pages.length?'<p class="dialog-note">No matches. Try a body system, a condition or a drug name.</p>':'');}
function showAbout(){modalShell(TAGLINE,'Rapid Nursing Review, the study app.',`<div style="display:flex;gap:16px;align-items:center;margin-bottom:16px"><img src="pages/cover.webp" alt="Book cover" style="width:72px;border-radius:4px;box-shadow:0 4px 14px #0003"><p class="about-copy" style="margin:0">This app follows <cite>Rapid Nursing Review: All Body Systems at a Glance</cite> by ${escape(book.author)}. Each chapter of the book is a course, and each section has its own reading pages and quiz.</p></div><ul class="about-list"><li><strong>${countsLine()}</strong>, each with a full rationale, a takeaway and its sources.</li><li>${courses.length} parts: NCLEX must-know content, nine body-system chapters and the fluid & electrolytes bonus.</li><li>${sections.length} sections with ${active.length} questions, each with a rationale for every option and a link to the book page.</li><li>The full book reader with search and page bookmarks, on the right side.</li><li>Saved sessions, bookmarks, question reports and an exam-date plan.</li></ul><div class="notice">The quiz questions are written from the book and reviewed by the author. Scores are not a validated readiness assessment.</div><p class="about-copy">${Account.status.session?'Your progress is saved on this device and syncs with your account. Question reports you file are sent to the author for review.':'Progress is stored on this device. Signing in is optional (Settings → Sync and web access); without it, progress and question reports stay on this device and can be exported.'}</p><p class="legal-links"><a href="https://nclexrapidnursingreview.com/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a> · <a href="${TERMS_URL}" target="_blank" rel="noopener noreferrer">Terms of Use${ANDROID?'':' (EULA)'}</a> · <a href="https://nclexrapidnursingreview.com/support.html" target="_blank" rel="noopener noreferrer">Support</a></p>${legal()}<div class="modal-footer">${secondary('Open the book','toggle-book','','book')}${primary('Explore practice','practice')}</div>`);}
// ---- Study reminder (Settings): a time (clock) and weekdays (calendar). The phone app schedules a local notification;
// "Add to Calendar" saves a repeating calendar event; the Plan page shows it under Today's motivation. ----
const REM_LENGTHS = [15, 20, 30, 45, 60, 90, 120], REM_TITLE = 'Study: Rapid Nursing Review';
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], WD1 = ['S', 'M', 'T', 'W', 'T', 'F', 'S'], ICS_DAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const fmtTime = t => { const [h, m] = t.split(':').map(Number); return new Date(2000, 0, 1, h, m).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); };
function daysText(days) {
  const k = days.join(','); if (k === '0,1,2,3,4,5,6') return 'Every day'; if (k === '1,2,3,4,5') return 'Weekdays'; if (k === '0,6') return 'Weekends';
  return days.map(d => WD[d]).join(', ') || 'No days chosen';
}
function nextReminder(r = state.reminder) {
  if (!r.on || !r.days.length) return null;
  const [h, m] = r.time.split(':').map(Number), now = new Date();
  for (let i = 0; i < 8; i++) { const d = addDays(now, i); d.setHours(h, m, 0, 0); if (r.days.includes(d.getDay()) && d > now) return d; }
  return null;
}
function reminderStatus() {
  const r = state.reminder; if (!r.on || !r.days.length) return { kind: 'off' };
  const [h, m] = r.time.split(':').map(Number), now = new Date(), today = new Date(); today.setHours(h, m, 0, 0);
  const studiedToday = state.attempts.some(a => a.day === dayKey());
  if (r.days.includes(now.getDay()) && now >= today) return studiedToday ? { kind: 'done' } : { kind: 'due' };
  return { kind: 'next', at: nextReminder() };
}
function syncReminder() { try { native?.postMessage(JSON.stringify({ type: 'reminder', ...state.reminder, body: todaysMotivation() })); } catch {} }
// ---- References from the book (Rapid Nursing Review: All Body Systems at a Glance, pp. 186-194), as printed ----
const BOOK_REFS = [{"chapter": "General references", "refs": ["Juarez, P. (2022). Adult CCRN exam premium: Study guide for the latest exam blueprint, includes 3 practice tests, comprehensive review, and online study prep (3rd ed.). Barrons Educational Services.", "Silvestri, L. A., & Silvestri, A. E. (2022). Saunders comprehensive review for the NCLEX-RN® examination (9th ed.). Saunders."]}, {"chapter": "Chapter 1: Respiratory System", "refs": ["Hallifax, R., McKeown, E., Sivakumar, P., Fairbairn, I., Peter, C., Leitch, A., Knight, M., Stanton, A., Ijaz, A., Marciniak, S., Cameron, J., Bhatta, A., Blyth, K., Reddy, R., Harris, M., Maddekar, N., Walker, S., West, A., Laskawiec-Szkonter, M., Rahman, N. (2020). Ambulatory management of primary spontaneous pneumothorax: An open-label, randomized controlled trial. The Lancet, 396, 39–49.", "Jeganathan, N., Smith, R., & Sathananthan, M. (2021). Mortality trends of idiopathic pulmonary fibrosis in the United States from 2004 through 2017. Chest, 159, 228–238.", "Juarez, P. (2022). Adult CCRN exam premium: Study guide for the latest exam blueprint, includes 3 practice tests, comprehensive review, and online study prep (3rd ed.). Barrons Educational Services.", "Leung, C., Huang, H., Rahman, M., Nomura, S., Abe, S., Saito, E., & Shibuya, K. (2020). Cancer incidence attributable to tuberculosis in 2015: Global, regional, and national estimates. BMC Cancer, 20, 412.", "Lim, E., Sousa, I., Shah, P., Diggle, P., & Goldstraw, P. (2020). Lung volume reduction surgery: Reinterpreted with longitudinal data analyses methodology. Annals of Thoracic Surgery, 109, 1496–1502.", "Martin, K., Molsberry, R., Cuttica, M., Desai, K., Schimmel, D., & Khan, S. (2020). Time trends in pulmonary embolism mortality rates in the United States, 1999–2018. Journal of the American Heart Association, 9. Advance online publication. https://doi.org/10.1161/JAHA.120.016784", "Yamagata, A., Ito, A., Nakanishi, Y., & Ishida, T. (2020). Prognostic factors in nursing and healthcare-associated pneumonia. Journal of Infection and Chemotherapy, 26, 563–569.", "Wang, L., Timmer, S., & Rosenman, K. (2020). Assessment of a university-based outpatient asthma education program for children. Journal of Pediatric Health Care, 34, 128-135."]}, {"chapter": "Chapter 2: Cardiovascular System", "refs": ["Calanca, L., Lanzi, S., Ney, B., Berchtold, A., & Mazzolai, L. (2020). Multimodal supervised exercise significantly improves walking performance without changing hemodynamic parameters in patients with symptomatic lower extremity peripheral artery disease. Vascular and Endovascular Surgery, 54, 605–611.", "Dabbagh, M., Aurora, L., D’Souza, P., Weinmann, A., Bhargava, P., & Basir, M. (2020). Cardiac tamponade secondary to COVID-19. Journal of the American College of Cardiology Case Reports, 2, 1326–1330.", "Juarez, P. (2022). Adult CCRN exam premium: Study guide for the latest exam blueprint, includes 3 practice tests, comprehensive review, and online study prep (3rd ed.). Barrons Educational Services.", "Medrek, S., Sahay, S., Zhao, C., Selej, M., & Frost, A. (2020). Impact of race on survival in pulmonary arterial hypertension: Results from the REVEAL registry. Journal of Heart and Lung Transplantation, 39, 321–330.", "Olsen, J., Tjoeng, Y., Friedland-Little, J., & Chan, T. (2021). Racial disparities in hospital mortality among pediatric cardiomyopathy and myocarditis patients. Pediatric Cardiology, 16, 59–71."]}, {"chapter": "Chapter 3: Gastrointestinal System", "refs": ["Barnes, E., Jiang, Y., Kappelman, M., Long, M., Sandler, R., Kinlaw, A., & Herfarth, H. (2020). Decreasing colectomy rate for ulcerative colitis in the United States between 2007 and 2016: A time trend analysis. Inflammatory Bowel Diseases, 26, 1225–1231.", "Bosch, J., Gracia-Sancho, J., & Abraldes, J. (2020). Cirrhosis as new indication for statins. Gut, 69, 953–962.", "Chouairi, F., McCarty, T., Hathorn, K., Sharma, P., Aslanian, H., Jamidar, P., Thompson, C., & Muniraj, T. (2021). Evaluation of socioeconomic and healthcare disparities on same admission cholecystectomy after endoscopic retrograde cholangiopancreatography among patients with acute gallstone pancreatitis. Surgical Endoscopy. Advance online publication.", "Chouairi, F., McCarty, T., Hathorn, K., Sharma, P., Aslanian, H., Jamidar, P., Thompson, C., & Muniraj, T. (2022). Evaluation of socioeconomic and healthcare disparities on same admission cholecystectomy after endoscopic retrograde cholangiopancreatography among patients with acute gallstone pancreatitis. Surgical Endoscopy, 36, 274–281.", "Patel, S., Hendren, S., Zaborowski, A., & Winter, D. (2020). Evidence-based reviews in surgery: Long-term outcome of surgery versus conservative management for recurrent and ongoing complaints after an episode of diverticulitis: Five-year follow- up results of a multicenter randomized controlled trial (DIRECT-Trial). Annals of Surgery, 272, 284–287.", "Patkova, B., Svenningsson, A., Almstrom, M., Eaton, S., Wester, T., & Svensson, J. (2020). Nonoperative treatment versus appendectomy for acute nonperforated appendicitis in children: Five-year follow-up of a randomized controlled pilot trial. Annals of Surgery, 271, 1030–1035.", "Sandall, A., Wall, C., & Lomer, M. (2020). Nutrition assessment in Crohn’s disease using anthropometric, biochemical, and dietary indexes: A narrative review. Journal of the Academy of Nutrition and Dietetics, 120(4), 624–640.", "Wijarnpreecha, K., Panjawatanan, P., Leelasinjaroen, P., & Ungprasert, P. (2020). Statins and risk of peptic ulcer disease: A systematic review and meta-analysis. Arab Journal of Gastroenterology, 21, 135–138.", "Yadlapati, R., & Pandolfino, J. (2020). Personalized approach in the work-up and management of gastroesophageal reflux disease. Gastrointestinal Endoscopy Clinics of North America, 30, 227–238."]}, {"chapter": "Chapter 4: Endocrine System", "refs": ["Ma, W., Mao, Y., Zhuo, R., Dai, J., Fang, C., Wang, C., Zhao, J., He, W., Zhu, Y., Xu, D., & Sun, F. (2020). Surgical outcomes of a randomized controlled trial compared robotic versus laparoscopic adrenalectomy for pheochromocytoma. European Journal of Surgical Oncology, 46, 1843–1847.", "Mallick, R., Xie, R., Kirklin, J., Chen, H., & Balentine, C. (2021). Race and gender disparities in access to parathyroidectomy: A need to change processes for diagnosis and referral to surgeons. Annals of Surgical Oncology, 28, 476–483.", "Margulies, S., Corrigan, K., Bathgate, S., & Macri, C. (2020). Addison’s disease in pregnancy: Case report, management, and review of literature. Journal of Neonatal– Prenatal Medicine, 13, 275–278.", "Mentrasti, G., Scortichini, L., Torniai, M., Giamperi, R., Morgese, F., Rinaldi, S., & Berardi, R. (2020). Syndrome of inappropriate antidiuretic hormone secretion (SIADH): Optimal management. Therapeutics and Clinical Risk Management, 16, 663–672.", "Palen-Tytko, J., Przybylik-Mazurek, E., Rzepka, E., Pach, D., Sowa-Staszczak, A., Gillis-Januszewska, A., & Hubalewska-Dydejczyk, A. (2020). Ectopic ACTH syndrome of different origin: Diagnostic approach and clinical outcome: Experience of one clinical centre. PLOS ONE, 15(11), e0242679.", "Pan, Y., Xie, Q., Zhang, Z., Dai, Y., Lin, L., Quan, M., Guo, X., Shen, M., & Zhao, S. (2020). Association between overt hyperthyroidism and risk of sexual dysfunction in both sexes: A systematic review and meta-analysis. Journal of Sexual Medicine, 17, 2198–2207.", "Parolin, M., Dassie, F., Alessio, L., Wennberg, A., Rossato, M., Vettor, R., Maffei, L., & Pagano, C. (2020). Obstructive sleep apnea in acromegaly and the effect of treatment: A systemic review and meta-analyses. Journal of Clinical Endocrinology & Metabolism, 105, e24–e32.", "Refardt, J., Winzeler, B., & Christ-Crain, M. (2020). Diabetes insipidus: An update. Endocrinology & Metabolism Clinics of North America, 49, 517–531.", "Rosenstock, J., Bajaj, H., Janež, A., Silver, R., Begtrup, K., Hansen, M., Jia, T., & Goldenberg, R. (2020). Once- weekly insulin for type 2 diabetes without previous insulin treatment. New England Journal of Medicine, 383, 2107–2116.", "Sardella, A., Bellone, F., Morabito, N., Minisola, S., Basile, G., Corica, F., & Catalano, A. (2021). The association between hypoparathyroidism and cognitive impairment: A systematic review. Journal of Endocrinological Investigation, 44, 905–919.", "Thavaraputta, S., Dennis, J., Laoveeravat, P., Nugent, K., & Rivas, A. (2019). Hypothyroidism and its association with sleep apnea among adults in the United States: NHANES 2007–2008. Journal of Clinical Endocrinology and Metabolism, 104, 4990–4997."]}, {"chapter": "Chapter 5: Renal / Genitourinary System", "refs": ["Carlsson, S., & Vickers, A. (2020). Screening for prostate cancer. Medical Clinics of North America, 104, 1051–1062.", "Haas, C., Li, G., Hyams, E., & Shad, O. (2020). Delayed decompression of obstructing stones with urinary tract infection is associated with increased odds of death. Journal of Urology, 204, 1256–1262. Hoffmann, T., Peiris, R., Del", "Mar, C., Cleo, G., & Glasziou, P. (2020). Natural history of uncomplicated urinary tract infection without antibiotics: A systematic review. British Journal of General Practice, 10, e714–e722.", "Kim, B., Myung, R., Kim, G., Lee, M., Kim, J., & Pai, H. (2020). Diabetes mellitus increases mortality in acute pyelonephritis patients: A population study based on the National Health Insurance Claim Data of South Korea for 2010–2014. Infection, 48, 435–443.", "Moran, S., Barbour, S., Dipchand, C., Garland, C., Hladunewich, M., Jauhal, A., Kappel, J., Levin, A., Pandeya, S., Reich, H., Thanabalasingam, S., Thomas, D., Ma, J., & White, C. (2021). Management of patients with glomerulonephritis during the COVID-19 pandemic: Recommendations from the Canadian Society of Nephrology COVID-19 Rapid Response Team. Canadian Journal of Kidney Health and Disease, 7, 1–8.", "Srinivasan, A., & Wang, R. (2020). An update on minimally invasive surgery for benign prostatic hyperplasia: Techniques, risks, and efficacy. The World Journal of Men’s Health, 38, 402–411."]}, {"chapter": "Chapter 6: Neurologic System", "refs": ["Alanazy, M., Binabbad, R., Alromaih, N., Almansour, R., Alanazi, S., Alhamdi, M., Alazwary, J., & Mualqil, T. (2020). Severity and depression can impact quality of life in patients with myasthenia gravis. Muscle & Nerve, 61, 69–73.", "Ellis, D., Zaoutis, T., Thibault, D., Crispo, J., Abraham, D., & Willis, A. (2020). Readmissions after hospital care for meningitis in the United States. American Journal of Infection Control, 48, 798–804.", "Jothi, A., Ramamoorthy, L., & Nair, P. (2020). The effect of comprehensive video assisted epilepsy education on drug adherence and self-care in people with epilepsy. Journal of Neurosciences in Rural Practice, 11, 538–544.", "Kim, G., Gautier, O., Tassoni-Tsuchida, E., Ma, X., & Gitler, A. (2020). ALS genetics: Gains, losses, and implications for future therapies. Neuron, 108, 822–842.", "Kim, Y., Twardzik, E., Judd, S., & Colabianchi, N. (2021). Neighborhood socioeconomic status and stroke incidence: A systematic review. Neurology. Advance online publication. Krysko, K., Graves, J., Dobson, R., Altintas, A., Amato, M., Bernard, J., Bonavita, S., Bove, R., Cavalla, P., Clerico, M., Corona, T., Doshi, A., Fragoso, Y., Jacobs, D., Jokubaitis, V., Landi, D., Llamosa, G., Longbrake, E., Maillart, E., . . .", "Hellwig, K. (2020). Sex effects across the lifespan in women with multiple sclerosis. Therapeutic Advances in Neurological Disorders, 13, 1–30.", "McKnight, C., Kelly, A., Petrou, M., Nidecker, A., Lorincz, M., Altaee, D., Gebarski, S., & Foerster, B. (2017). A simplified approach to encephalitis and its mimics: Key clinical decision points in the setting of specific imaging abnormalities. Academic Radiology, 24, 667–676.", "Sedaghat, Z., & Karimi, N. (2020). Guillain-Barré syndrome associated with COVID-19 infection: A case report. Journal of Clinical Neuroscience, 76, 233–235.", "Tan, S., Williams, A., Tan, E., Clark, R., & Morris, M. (2020). Parkinson’s disease caregiver strain in Singapore. Frontiers in Neurology, 11, 1–10.", "Wang, F., Tang, Q., Zhang, L., Yang, J., Li, Y., Peng, H., & Wang, S. (2020). Effects of mindfulness-based interventions on dementia patients: A meta- analysis. Western Journal of Nursing Research, 42, 1163–1173."]}, {"chapter": "Chapter 7: Hematology / Immunology", "refs": ["Castellano-Rioja, E., Giménez-Espert, M., & Soto-Rubio, A. (2020). Lupus erythematosus quality of life questionnaire (LEQoL): Development and psychometric properties. International Journal of Environmental Research and Public Health. Advance online publication. https://doi.org/10.3390/ijerph17228642", "Cisnero, G., & Thein, S. (2020). Recent advances in the treatment of sickle cell disease. Frontiers in Physiology.Advance online publication. https://doi.org/10.3389/fphys.2020.00435 Grace, R., Shimano, K., Bhat, R., Neunert, C., Bussel, J., Klaassen, R., Lambert, M., Rothman, J., Breakey, V., Hege, K., Bennett, C., Rose, M., Haley, K., Buchanan, G., Geddis, A., Lorenzana, A., Jeng, M., Pastore, Y., Crary, S., . . .", "Despotovic, J. (2019). Second-line in children with immune thrombocytopenia: Effect on platelet count and patient- centered outcomes. American Journal of Hematology, 94, 741–750.", "Ikezoe, T. (2021). Advances in the diagnosis and treatment of disseminated intravascular coagulation in haematological malignancies. International Journal of Hematology, 113, 34–44.", "Li, N., Zhao, G., Wu, W., Zhang, M., Liu, W., Chen, Q., & Wang, X. (2020). The efficacy and safety of vitamin C for iron supplementation in adult patients with iron deficiency anemia: A randomized clinical trial. JAMA Network Open, 3, 1–9.", "Liao, W., & Liu, Y. (2021). Treatment outcomes in children with acute lymphoblastic leukemia with versus without coexisting Down’s syndrome: A systematic review and meta-analysis. Medicine, 99, e221015.", "Navarro-Millan, I., Rajan, M., Lui, G., Kern, L., Pinheiro, L., Safford, M., Sattui, S., & Curtis, J. (2020). Racial and ethnic differences in medication use among beneficiaries of social security disability insurance with rheumatoid arthritis. Seminars in Arthritis and Rheumatism, 50, 988–995.", "Palandri, F., Mora, B., Gangat, N., & Catani, L. (2021). Is there a gender effect in polycythemia vera? Annals of Hematology, 100, 11–25.", "Shima, M., Nogami, K., Nagami, S., Yoshida, S., Yoneyama, K., Ishiguro, A., Suzuki, T., & Taki, M. (2019). A multicenter, open-label study of emicizumab given every 2 or 4 weeks in children with severe haemophilia A without inhibitors. Haemophilia, 25, 979–987.", "Shmookler, A., & Flanagan, M. (2020). Educational case: Febrile nonhemolytic transfusion reaction. Academic Pathology. Advance online publication. https://doi.org/10.1177/2374289520934097", "Turner, P., Campbell, D., Motosue, M., & Campbell, R. (2020). Global trends in anaphylaxis epidemiology and clinical implications. Journal of Allergy and Clinical Immunology: In Practice, 8, 1169–1176."]}, {"chapter": "Chapter 8: Integumentary System", "refs": ["Cooper, K., & Gosnell, K. (2022). Adult health nursing (9th ed.). Elsevier.", "Silvestri, L. A., & Silvestri, A. E. (2022). Saunders comprehensive review for the NCLEX-RN® examination (9th ed.). Saunders."]}, {"chapter": "Chapter 9: Musculoskeletal System", "refs": ["Hoogervorst, P., Shearer, D., & Miclau, T. (2020). The burden of high-energy musculoskeletal trauma in high-income countries. World Journal of Surgery, 44, 1033-1038.", "Navarro-Millan, I., Rajan, M., Lui, G., Kern, L., Pinheiro, L., Safford, M., Sattui, S., & Curtis, J. (2020). Racial and ethnic differences in medication use among beneficiaries of social security disability insurance with rheumatoid arthritis. Seminars in Arthritis and Rheumatism, 50, 988-995", "Singh, J., & Cleveland, J. (2021). Hospitalized infections in people with osteoarthritis: A national U.S. study. Journal of Rheumatology, 48, 933-939.", "Silvestri, L. A., & Silvestri, A. E. (2022). Saunders comprehensive review for the NCLEX-RN® examination (9th ed.). Saunders."]}, {"chapter": "Bonus: Fluid and Electrolytes", "refs": ["Juarez, P. (2022). Adult CCRN exam premium: Study guide for the latest exam blueprint, includes 3 practice tests, comprehensive review, and online study prep (3rd ed.). Barrons Educational Services.", "Silvestri, L. A., & Silvestri, A. E. (2022). Saunders comprehensive review for the NCLEX-RN® examination (9th ed.). Saunders."]}];
const BOOK_REF_COUNT = new Set(BOOK_REFS.flatMap(g => g.refs)).size;
function refsCard() {
  const link = t => escape(t).replace(/https:\/\/doi\.org\/[^\s<]+/g, u => `<a href="${u}" target="_blank" rel="noopener noreferrer">${u}</a>`);
  return `<section class="reminder-card refs-card"><details class="refs-all"><summary><span class="rc-icon">${icon('library')}</span><span class="refs-head"><span class="theme-eyebrow">References</span><span class="rc-sub">${BOOK_REF_COUNT} sources cited in the Rapid Nursing Review book</span></span><span class="refs-count" aria-label="${BOOK_REF_COUNT} references">${BOOK_REF_COUNT}</span></summary>
  <div class="refs-list">${BOOK_REFS.map(g => `<details class="refs-ch"><summary><span>${escape(g.chapter)}</span><span class="refs-n">${g.refs.length}</span></summary><ol>${g.refs.map(r => `<li>${link(r)}</li>`).join('')}</ol></details>`).join('')}
  <p class="theme-note">Listed as printed in the book, pages 186–194. Some sources appear under more than one chapter.</p></div></details></section>`;
}
function reminderSettings() {
  const r = state.reminder;
  return `<section class="reminder-card" id="study-reminder" tabindex="-1"><div class="rc-head"><span class="rc-icon">${icon('clock')}</span><div><p class="theme-eyebrow">Study reminder</p><p class="rc-sub">${r.on ? `${daysText(r.days)} at ${fmtTime(r.time)}` : 'Pick a time and days that fit your schedule.'}</p></div><label class="switch"><input type="checkbox" id="rem-on" ${r.on ? 'checked' : ''} aria-label="Study reminder on"><span></span></label></div>
  <div class="rc-row"><label class="rc-time">${icon('clock')}<span>Time</span><input type="time" id="rem-time" value="${r.time}" aria-label="Reminder time"></label></div>
  <div class="rc-days" role="group" aria-label="Reminder days">${WD1.map((l, i) => `<button class="rc-day${r.days.includes(i) ? ' on' : ''}" data-action="rem-day" data-day="${i}" aria-pressed="${r.days.includes(i)}" aria-label="${WD[i]}">${l}</button>`).join('')}</div>
  <p class="theme-note">${native ? 'You\'ll get a notification at this time on the days you pick.' : 'In the phone app this sends a notification.'}</p>
  <div class="rc-event"><p class="rc-label">${icon('calendar')}Your calendar event</p>
  <label class="rc-field"><span>Title</span><input type="text" id="rem-title" maxlength="80" value="${escape(r.title)}" placeholder="${REM_TITLE}" autocomplete="off"></label>
  <label class="rc-field"><span>Length</span><select id="rem-length">${REM_LENGTHS.map(n => `<option value="${n}" ${n === r.length ? 'selected' : ''}>${n < 60 ? `${n} minutes` : n === 60 ? '1 hour' : `${n / 60} hours`}</option>`).join('')}</select></label>
  <label class="rc-field"><span>Notes</span><textarea id="rem-notes" rows="3" maxlength="500" placeholder="What will you study? e.g. Cardiac meds, 25 questions, review my missed items">${escape(r.notes)}</textarea></label>
  <p class="rc-preview" id="rem-preview">${escape(calTitle())} · ${daysText(r.days.length ? r.days : [1, 2, 3, 4, 5])} at ${fmtTime(r.time)} · ${r.length} min</p>
  <div class="rc-actions"><button class="primary" data-action="rem-calendar">${icon('calendar')}${native ? 'Add to My Calendar' : 'Add to Calendar (.ics)'}</button>${ANDROID || !native ? `<a class="secondary" id="rem-gcal" href="${googleCalUrl()}" target="_blank" rel="noopener noreferrer">${icon('calendar')}Google Calendar</a>` : ''}</div>
  <p class="theme-note">${native ? (ANDROID ? 'Opens your phone\'s calendar with these details filled in. You can still edit them, then choose which calendar to save to (Google, Outlook or another account on your phone). Or open Google Calendar directly.' : 'Opens your iPhone calendar with these details filled in. You can still edit them, then choose which calendar to save to (iCloud, Outlook or another account on your device).') : 'Download the .ics file for Apple Calendar or Outlook, or open Google Calendar with these details filled in.'}</p></div></section>`;
}
function openReminderSettings() { openSettingsAt('#study-reminder'); }
function openSettingsAt(sel) {
  showSettings();
  requestAnimationFrame(() => { const el = document.querySelector(sel); if (!el) return;
    el.scrollIntoView({ block: 'start', behavior: 'smooth' }); el.focus({ preventScroll: true });
    el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1600); });
}
function reminderStrip() {
  const st = reminderStatus();
  if (st.kind === 'off') return `<div class="rem-strip off">${icon('clock')}<span>Set a study reminder so you never miss a session.</span><button class="mini" data-action="settings-reminder">Set reminder</button></div>`;
  if (st.kind === 'due') return `<div class="rem-strip due" role="status">${icon('bell')}<span><b>It's study time!</b> Your ${fmtTime(state.reminder.time)} session is ready.</span><button class="mini solid" data-action="quick">Start</button></div>`;
  if (st.kind === 'done') return `<div class="rem-strip done">${icon('check')}<span>You studied today. Next reminder: ${(() => { const n = nextReminder(); return n ? `${WD[n.getDay()]} at ${fmtTime(state.reminder.time)}` : '—'; })()}</span><button class="mini" data-action="settings-reminder">Edit</button></div>`;
  const n = st.at, isToday = n && dayKey(n) === dayKey(), isTom = n && dayKey(n) === dayKey(addDays(new Date(), 1));
  return `<div class="rem-strip">${icon('clock')}<span>Next study session: <b>${isToday ? 'today' : isTom ? 'tomorrow' : WD[n.getDay()]} at ${fmtTime(state.reminder.time)}</b> · ${daysText(state.reminder.days)}</span><button class="mini" data-action="settings-reminder">Edit</button></div>`;
}
const calTitle = () => (state.reminder.title || '').trim() || REM_TITLE;
const calNotes = () => [(state.reminder.notes || '').trim(), 'Open Rapid Nursing Review and do a focused study session. One more question today.'].filter(Boolean).join('\n\n');
function calTimes() {
  const r = state.reminder, [h, m] = r.time.split(':').map(Number), start = nextReminder({ ...r, on: true, days: r.days.length ? r.days : [1, 2, 3, 4, 5] }) || new Date();
  start.setHours(h, m, 0, 0); return { start, end: new Date(start.getTime() + (r.length || 30) * 60000), days: r.days.length ? r.days : [1, 2, 3, 4, 5] };
}
const icsDate = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
const icsText = t => t.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
function calendarIcs() {
  const { start, end, days } = calTimes(), stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Rapid Nursing Review//Study reminder//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:rnr-study-${Date.now()}@rapidnursingreview`, `DTSTAMP:${stamp}`, `DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${days.map(d => ICS_DAY[d]).join(',')}`,
    `SUMMARY:${icsText(calTitle())}`, `DESCRIPTION:${icsText(calNotes())}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Time to study', 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}
function googleCalUrl() {
  const { start, end, days } = calTimes(); let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch {}
  const q = new URLSearchParams({ action: 'TEMPLATE', text: calTitle(), details: calNotes(), dates: `${icsDate(start)}/${icsDate(end)}`, recur: `RRULE:FREQ=WEEKLY;BYDAY=${days.map(d => ICS_DAY[d]).join(',')}` });
  if (tz) q.set('ctz', tz);
  return `https://calendar.google.com/calendar/render?${q}`;
}
function addToCalendar() {
  const ics = calendarIcs();
  if (native) {
    const { start, end, days } = calTimes(); let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch {}
    native.postMessage(JSON.stringify({ type: 'calendar', filename: 'rapid-nursing-review-study.ics', data: ics, event: { title: calTitle(), notes: calNotes(), start: start.toISOString(), end: end.toISOString(), days, timeZone: tz } }));
    return;
  }
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })), a = document.createElement('a');
  a.href = url; a.download = 'rapid-nursing-review-study.ics'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Calendar event saved. Open it to add it to Apple Calendar or Outlook.');
}
window.__rnrCalendarResult = action => { if (action === 'saved') toast('Added to your calendar.'); else if (action === 'shared') toast('Choose Calendar to add your study event.'); };
function refreshCalPreview() {
  const r = state.reminder, p = document.querySelector('#rem-preview'), g = document.querySelector('#rem-gcal');
  if (p) p.textContent = `${calTitle()} · ${daysText(r.days.length ? r.days : [1, 2, 3, 4, 5])} at ${fmtTime(r.time)} · ${r.length} min`;
  if (g) g.href = googleCalUrl();
}
// ---- Share my progress: email, WhatsApp, X, or the phone's share sheet (Instagram, Facebook, Messages...) ----
function progressMessage() {
  const s = stats(), st = streak(), name = firstName();
  const parts = [`${s.total.toLocaleString()} NCLEX-style question${s.total === 1 ? '' : 's'} answered`];
  if (s.accuracy != null) parts.push(`${s.accuracy}% correct`);
  if (st >= 1) parts.push(`${st}-day study streak`);
  if (state.caseHistory.length) parts.push(`${new Set(state.caseHistory.map(h => h.caseId)).size} NGN case stud${state.caseHistory.length === 1 ? 'y' : 'ies'} done`);
  const tags = 'Learn. Test. Understand. #NCLEX #NursingStudent #FutureNurse';
  if (!s.total) return `${name ? name + ' here! ' : ''}I just started my NCLEX-RN prep with Rapid Nursing Review: ${N.fmt(N.total)} NCLEX-style questions and ${N.cases} NGN case studies. ${tags}`;
  return `${name ? name + ' here! ' : ''}My NCLEX-RN prep with Rapid Nursing Review: ${parts.join(' · ')}. ${tags}`;
}
function shareCard() {
  const msg = progressMessage(), enc = encodeURIComponent(msg);
  return `<section class="share-card"><p class="theme-eyebrow">Share my progress</p><p class="share-preview">“${escape(msg)}”</p><div class="share-row">
  <button class="share-btn email" data-action="share-email">${icon('mail')}Email</button>
  <a class="share-btn wa" href="https://wa.me/?text=${enc}" target="_blank" rel="noopener noreferrer">${icon('chat')}WhatsApp</a>
  <a class="share-btn x" href="https://x.com/intent/post?text=${enc}" target="_blank" rel="noopener noreferrer"><b>𝕏</b>Post</a>
  <button class="share-btn more" data-action="share-more">${icon('share')}More…</button></div>
  <p class="theme-note">“More…” opens your phone's share sheet for Instagram, Facebook, Messages and other apps.</p></section>`;
}
function shareProgress(mode) {
  const msg = progressMessage(), subject = 'My NCLEX-RN study progress';
  if (native) { native.postMessage(JSON.stringify({ type: 'share', mode, subject, message: msg })); return; }
  if (mode === 'email') { location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`; return; }
  if (navigator.share) { navigator.share({ title: subject, text: msg }).catch(() => {}); return; }
  navigator.clipboard?.writeText(msg).then(() => toast('Copied. Paste it into any app to share.'), () => toast('Select and copy the message to share it.'));
}
function showSettings(){modalShell('Your study space.','A few personal touches and your saved data.',`${accountCard()}${tutorCard()}<form id="profile-form"><label class="field">What should we call you?<input name="name" value="${escape(state.name)}" maxlength="30" required></label><div class="modal-footer"><button type="submit" class="primary">Save name ${icon('check')}</button></div></form><section class="theme-card"><p class="theme-eyebrow">Theme</p><div class="ui-swatches" role="radiogroup" aria-label="App colors">${UI_THEMES.map(([id,label,strips,dark])=>`<button class="ui-swatch${dark?' is-dark':''}${id==='system'?' is-system':''}" role="radio" aria-checked="${state.ui===id}" aria-label="${label} theme" data-action="set-ui" data-ui="${id}"><span class="sw-strips">${strips.map(([a,b])=>`<span style="background:linear-gradient(90deg,${a},${b})"></span>`).join('')}</span><span class="sw-name"><span>${label}</span>${state.ui===id?`<span class="sw-check">${icon('check')}</span>`:''}</span></button>`).join('')}</div><p class="theme-note">System follows your device's light or dark setting. Exams always stay white.</p></section><section class="theme-card" id="display-settings"><p class="theme-eyebrow">Display &amp; accessibility</p><p class="ts-label" id="ts-label">Text size</p><div class="ts-pick" role="radiogroup" aria-labelledby="ts-label">${TEXT_SIZES.map(([id,label,sample],i)=>`<button class="ts-opt" role="radio" aria-checked="${(state.textSize||'default')===id}" data-action="set-text" data-size="${id}"><span class="ts-sample" style="font-size:${[16,20,25][i]}px">${sample}</span><span>${label}</span></button>`).join('')}</div><p class="theme-note">Makes questions, answers, rationales and the book easier to read.</p></section>${reminderSettings()}${shareCard()}${refsCard()}<div class="setting-row plan-row" id="your-plan" tabindex="-1"><div><strong>Your plan</strong><p>${isPro()?(window.__RNR_PRO__?'Rapid Nursing Review Pro':'Pro (web preview)'):'Free plan'}</p></div><div class="plan-row-actions">${secondary('See Pro plans','paywall','','crown')}${isPro()&&window.__RNR_PRO__?'<a class="secondary" href="https://apps.apple.com/account/subscriptions" target="_blank" rel="noopener noreferrer">Manage subscription</a>':''}</div></div><div class="setting-row"><div><strong>Your progress belongs to you.</strong><p>Export answers, sessions, reports, and your plan.</p></div>${secondary('Export','export','','download')}</div><div class="setting-row"><div><strong>Question reports</strong><p>${state.reports.length} saved · ${Account.status.session?`${state.reports.filter(r=>r.status==='sent').length} sent to the author for review`:'Sign in with Apple to send them to the author'}</p></div>${secondary('View','reports')}</div>${native&&(window.__RNR_OS__||'ios')==='ios'?`<div class="setting-row"><div><strong>Enjoying Rapid Nursing Review?</strong><p>A rating on the App Store helps other nursing students find it.</p></div><button class="secondary" data-action="rate-app">${icon('star')}Rate the app</button></div>`:''}<div class="setting-row"><div><strong>About Rapid Nursing Review</strong><p>What's inside, sources and the book.</p></div>${secondary('About','about')}</div><div class="setting-row"><div><strong>Start fresh</strong><p>Reset study data on this device.</p></div><button class="text-link danger" data-action="confirm-reset">Reset data</button></div>${legal()}`);}
function exportData(){const payload=JSON.stringify({app:'Rapid Nursing Review',exported:new Date().toISOString(),...state},null,2);if(native){native.postMessage(JSON.stringify({type:'export',filename:`rapid-nursing-review-${dayKey()}.json`,data:payload}));return;}const blob=new Blob([payload],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`rapid-nursing-review-${dayKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Your progress export is ready.');}
function openReport(id){const q=qOf(id);if(!q)return;quizVisible=false;modalShell('Help make this question better.',(Account.status.session?'This report goes to the author for review.':'This report will be saved on this device for review.'),`<p class="about-copy">${q.stem}</p><form id="report-form" data-id="${id}"><label class="field">What needs a closer look?<select name="reason"><option>Answer or rationale concern</option><option>Unclear wording</option><option>Reference concern</option><option>Other feedback</option></select></label><label class="field spacer">Details<textarea name="details" placeholder="Describe the concern so a reviewer can check it." required maxlength="1500"></textarea></label><p class="dialog-note">${Account.status.session?'Reports are sent to the author for review with your account.':'Reports stay on this device. Sign in with Apple in Settings to send them to the author, or export them from your profile.'}</p><div class="modal-footer">${state.session?secondary('Back to question','resume'):secondary('Cancel','close-modal')}<button type="submit" class="primary">Save report ${icon('flag')}</button></div></form>`);}
function showReports(){modalShell('Your saved question reports.',`${state.reports.length} reports · Stored on this device`,`${state.reports.length?state.reports.slice().reverse().map(r=>`<article class="bookmark-card"><span class="tag">${qOf(r.qid)?.topic||'Question'}</span><h3>${escape(r.reason)}</h3><p class="about-copy">${escape(r.details)}</p><small>${readableDate(new Date(r.created))} · Saved on this device</small></article>`).join(''):'<p class="about-copy">No reports yet. Use “Report question” during practice to record a concern.</p>'}<div class="modal-footer">${secondary('Export reports & progress','export','','download')}</div>`);}
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
  return `<section class="rationale">${head}${takeaway}${all}${q.note ? `<p class="review-note"><strong>Reviewer note:</strong> ${escape(q.note)}</p>` : ''}${sourcesBlock(q)}<div class="nb-actions">${secondary('Explain it simply', 'simplify', `data-id="${q.id}"`)}</div><div id="simple-${cssId(q.id)}"></div>${p !== m && !review ? `<p class="dialog-note">What made this one tricky? (Your reflection, optional)</p><div class="mistake-picks">${['Knowledge gap', 'Missed cue', 'Prioritization', 'Calculation'].map(x => `<button data-action="mistake" data-mistake="${x}" class="${a.mistake === x ? 'active' : ''}">${x}</button>`).join('')}</div>` : ''}</section>`;
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
  try { native?.postMessage(JSON.stringify({ type: 'session-complete', kind: 'session', correct: t.full, total: h.ids.length, points: t.pts, max: t.max })); } catch {}
  const pct = t.max ? t.pts / t.max : 0;
  // Confetti pop-up for a perfect score (5+ questions) or 90%+ on a full-length exam; same words as the results banner.
  const big = h.ids.length >= 5 && (pct === 1 || (h.ids.length >= 75 && pct >= 0.9));
  if (big && h._cheer) celebrate({ eyebrow: 'Milestone', title: h._cheer.title, body: `${firstName() ? firstName() + ', ' : ''}${h._cheer.msg}`, icon: 'trophy', colors: pct === 1 ? ['#f59e0b', '#e11d48'] : ['#059669', '#7c3aed'] });
  checkMilestones();
}
function showResults(h) {
  const upsell = isPro() ? '' : proGate('Keep the momentum', `You’ve answered ${new Set(state.attempts.map(a => a.qid)).size} of ${freeIds.size} free questions. Pro unlocks all ${active.length.toLocaleString()}, timed exams, the blueprint exam and every NGN case.`, 'all');
  const t = sessionTotals(h), notAnswered = h.ids.filter(id => !h.answers[id]?.submitted).length;
  const needRows = Object.entries(t.needs).sort((a, b) => b[1].total - a[1].total).map(([k, v]) => `<div class="need-row"><span>${escape(needName(k))}</span><span>${v.right}/${v.total}</span><div class="progress-track"><div class="progress-fill" style="width:${v.right / v.total * 100}%"></div></div></div>`).join('');
  modalShell(h.expired ? 'Time’s up. Let’s learn from it.' : 'Every question moved you forward.', `${escape(h.label)} · ${h.mode === 'exam' ? 'Timed exam' : 'Tutor mode'}`, `<div class="result-score">${Math.round(t.full / h.count * 100)}<span style="font-size:30px">%</span></div><p class="result-label">${t.full} of ${h.count} fully correct · ${t.pts} of ${t.max} points${notAnswered ? ` · ${notAnswered} unanswered (no credit)` : ''}</p>${resultCheer(h, t)}${h.ids.length >= 10 ? `<h3 class="need-title">By NCLEX client need</h3><div class="need-list">${needRows}</div>` : ''}${h.ids.map(id => { const q = qOf(id), a = h.answers[id], ok = a?.submitted && fullCredit(q, a.selected); return `<div class="result-item"><span class="${ok ? 'ok' : 'redo'}">${ok ? '✓' : '↻'}</span><span>${escape(q.topic)}${!a?.submitted ? ' · Unanswered' : ''}</span><button data-action="review-answer" data-id="${id}" data-history="${h.id}">See explanation →</button></div>`; }).join('')}<p class="dialog-note">Partial credit follows NCLEX scoring rules for select-all, matrix and ordered items. This is a practice score, not a prediction of your NCLEX result.</p>${upsell}<div class="modal-footer">${secondary('See my progress', 'progress')}${primary('Practice again', 'practice')}</div>`, 'exam');
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
  const head = '<div class="practice-head">' + heading('Make every question count.', `${countsLine()}. ${N.fmt(bookN)} link to the book.`, secondary('Custom practice', 'setup', '', 'edit')) + '</div>';
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
  // Compact cards: icon, title and Start; the chevron opens the description (remembered per card on this device).
  const tcOpen = (() => { try { return new Set(JSON.parse(localStorage.getItem('rnr.tcOpen') || '[]')); } catch { return new Set(); } })();
  const card = (key, eyebrow, ic, grad, title, pro, text, meta, action, attrs = '', extra = '') => { const open = tcOpen.has(key); return `<article class="test-card${open ? ' open' : ''}" data-tc="${key}"><div class="tc-row"><span class="icon-tile" style="background:var(${grad})">${icon(ic)}</span><div class="tc-title"><span class="tc-eyebrow">${eyebrow}${pro && proPill ? ' · <span class="tc-pro">PRO</span>' : ''}</span><h3>${title}</h3></div><button class="primary tc-start" data-action="${action}" ${attrs}>${icon('play')}Start</button><button class="tc-more" data-action="tc-toggle" aria-expanded="${open}" aria-label="Details: ${title}">${icon('chevron')}</button></div><div class="tc-body"><p>${text}</p>${extra}<span class="tc-meta">${meta}</span></div></article>`; };
  const casePill = c => `<button class="case-pill" data-action="start-case" data-id="${c.id}">${allowedCase(c) ? '' : '<span class="lock" aria-label="Pro">🔒</span>'}<span>${escape(c.title)}</span>${doneCases.has(c.id) ? ' ✓' : ''}</button>`;
  const casePills = `<div class="case-pills">${casePill(ngnCases[0])}</div><details class="more-cases"><summary>${ngnCases.length - 1} more case studies</summary><div class="case-pills">${ngnCases.slice(1).map(casePill).join('')}</div></details>`;
  const features = `<div class="test-grid">${card('blueprint', 'Test 1', 'target', '--g-nclex', 'NCLEX Blueprint Exam', true, `75 timed questions weighted to the 2026 NCLEX-RN client needs, with a category breakdown.`, lastBp ? `Last: ${lastBp.correct}/${lastBp.count} · ${readableDate(new Date(lastBp.finished))}` : 'Not taken yet', 'start-blueprint')}${card('cases', 'Practice', 'stethoscope', '--g-imm', 'NGN Case Studies', true, 'Pick one case study and work through its six clinical-judgment steps.', `${ngnCases.length} cases · ${doneCases.size} done`, 'choose-case', '', casePills)}${card('missed', 'Review', 'layers', '--g-bedside', 'Missed Questions', false, 'Every question you got wrong comes back until you get it right.', `${missed().length} to review`, 'review')}${card('quick', 'Quick', 'spark', '--g-home', 'Quick Practice', false, 'Four questions from four different NCLEX topics, in tutor mode.', 'About 5 minutes', 'quick')}</div>`;
  const allCounts = isPro() ? null : active.reduce((m, q) => (m[q.nclexTopic] = (m[q.nclexTopic] || 0) + 1, m), {});
  const tiles = nclexTopics.map((t, i) => { const on = pick.topics.includes(t.id), c = counts[t.id] || 0, lockT = allCounts && allCounts[t.id] > c; return `<button class="topic-tile${on ? ' on' : ''}" style="--tc:${t.color}" data-action="toggle-topic" data-id="${t.id}" aria-pressed="${on}"><span class="bar"></span>${on ? `<span class="tick">${icon('check')}</span>` : ''}<span class="name">${escape(t.name)}</span><span class="count">${allCounts ? allCounts[t.id] || 0 : c}</span></button>`; }).join('');
  const seen = Object.keys(map0).length, mastered = Object.values(map0).filter(a => a.correct).length, toReview = seen - mastered;
  const qb = `<div class="qb-head"><span class="qb-icon">${icon('library')}</span><div class="qb-title"><h2>Question Bank</h2><p>${N.fmt(N.total)} NCLEX-style questions (${N.fmt(N.ngn)} in NGN formats) and ${N.cases} NGN case studies, with full rationales, organized by the NCSBN Client Needs categories.</p></div><button class="qb-custom" data-action="setup" aria-label="Custom practice">${icon('edit')}</button></div><div class="qb-stats">${[['Seen', seen], ['Mastered', mastered], ['To review', toReview]].map(([k, v]) => `<div class="qb-stat"><strong>${v.toLocaleString()}</strong><span>${k}</span></div>`).join('')}</div><div class="qb-bar" role="progressbar" aria-label="Questions seen" aria-valuemin="0" aria-valuemax="${active.length}" aria-valuenow="${seen}"><div style="width:${active.length ? seen / active.length * 100 : 0}%"></div></div>`;
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
  modalShell(escape(c.title), `NGN case study · ${escape(c.sub)}`, `<p class="case-profile">${escape(c.profile)}</p><div class="ehr"><div class="ehr-tabs" role="tablist" aria-label="Client record">${tabs.map(t => `<button role="tab" aria-selected="${t === caseTab}" data-action="case-tab" data-tab="${escape(t)}">${escape(t)}</button>`).join('')}</div><div class="ehr-body" role="tabpanel">${c.ehr[caseTab].map(([when, text]) => `<p><strong>${escape(when)}</strong> ${escape(text)}</p>`).join('')}</div></div><div class="quiz-header"><span>ITEM ${cs.index + 1} OF ${c.items.length} · ${escape(it.stepLabel.toUpperCase())}</span><span>NGN · ${it.kind.toUpperCase()}</span></div><div class="steps-dots" aria-hidden="true">${c.items.map((x, i) => `<span class="${i < cs.index || cs.submitted[x.id] ? 'done' : i === cs.index ? 'now' : ''}"></span>`).join('')}</div>${trend}<p class="question-stem">${escape(it.stem)}</p>${ngnBody(it, a, done)}${done ? `<section class="rationale"><h3>${p === m ? '✓ Full credit' : `${p} of ${m} points`}</h3><p>${escape(it.rationale)}</p>${it.page ? `<p class="case-cite">Rapid Nursing Review, p. ${it.page}</p>` : ''}</section>${refsBlock({ ...c, id: c.id + '-' + it.id, topic: c.title }, 'Sources for this case study')}` : ''}<div class="modal-footer">${secondary('Save & pause', 'close-modal')}${done ? primary(cs.index === c.items.length - 1 ? 'Finish case' : 'Next item', 'case-next') : `<button class="primary" data-action="case-submit" ${ngnComplete(it, a) ? '' : 'disabled'}>Check answer ${icon('arrow')}</button>`}</div>`, 'exam');
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
  try { native?.postMessage(JSON.stringify({ type: 'session-complete', kind: 'case', correct: points, total: c.items.length, points, max })); } catch {}
  setTimeout(() => { if (points / max >= 0.8) celebrate({ eyebrow: 'Case study complete', title: points === max ? 'Full marks on a case!' : 'Clinical judgment, unlocked', body: `${points} of ${max} points on ${c.title}. You thought like a nurse at every step.`, icon: 'stethoscope', colors: ['#9333ea', '#db2777'] }); if (state.caseHistory.length === 1) celebrate({ title: 'First NGN case done', body: 'Your first unfolding case study is complete. The NCLEX will feel familiar now.', icon: 'stethoscope', colors: ['#0891b2', '#10b981'] }); }, 0);
  modalShell('Case complete.', escape(c.title), `<div class="result-score">${Math.round(points / max * 100)}<span style="font-size:30px">%</span></div><p class="result-label">${points} of ${max} points across ${c.items.length} items</p>${c.refs?.length ? `<details class="nb-sources"><summary>${icon('book')}Sources &amp; references (APA)</summary><ul class="nb-ref">${c.refs.map(k => nclexRefs[k]).filter(Boolean).map(([cite, url]) => `<li><p class="apa">${cite} ${url}</p><a href="${url}" target="_blank" rel="noopener noreferrer">Open source ↗</a></li>`).join('')}</ul></details>` : ''}${c.items.map(it => `<div class="result-item"><span>${escape(it.stepLabel)}</span><span style="margin-left:auto">${items[it.id][0]} / ${items[it.id][1]}</span></div>`).join('')}<p class="dialog-note">Scored with NGN rules: partial credit for select-all, highlight, matrix, cloze, ordering and bowtie items.</p><div class="modal-footer">${secondary('Close', 'close-modal')}${primary('More practice', 'practice')}</div>`, 'exam');
}

// ---- Paywall (NurseBound design). In the app, the native paywall opens instead. ----
let paywallPlan = 'quarter';
function updatePaywallPlan() {
  for (const b of modal.querySelectorAll('.plan')) { const on = b.dataset.id === paywallPlan; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); }
  const per = { quarter: '3 months', annual: 'year', monthly: 'month' }[paywallPlan], price = PRO_PRICES[paywallPlan];
  const cta = modal.querySelector('.pw-cta span'); if (cta) cta.textContent = per ? `${TRIAL.words} free, then ${price}/${per} · cancel anytime` : `${price} once · no subscription`;
  const ctaT = modal.querySelector('.pw-cta strong'); if (ctaT) ctaT.textContent = per ? `Start ${TRIAL.adj} Free Trial` : 'Unlock Pro Access';
  const lead = /^2 weeks free, then \$[\d.]+\/[^,]+, renewing automatically\. Cancel at least 24 hours before the trial ends and you won't be charged\. /;
  const terms = modal.querySelector('.pw-terms'); if (terms) terms.textContent = (per ? `${TRIAL.words} free, then ${price}/${per}, renewing automatically. Cancel at least 24 hours before the trial ends and you won't be charged. ` : '') + terms.textContent.replace(lead, '');
}
function showPaywall(reason = '') {
  // The web app sells nothing: Pro is bought only in the iPhone app (App Store rules).
  if (window.__RNR_WEB__) { modalShell('Rapid Nursing Review Pro', 'Subscribe in the iPhone app.', `<p class="about-copy">${reason ? escape(reason) + ' ' : ''}Pro is available in the Rapid Nursing Review iPhone app. Subscribe there, then open <b>Settings → Sync and web access</b> and tap <b>Sign in with Apple</b> with this Apple ID. Reload this page afterwards.</p><div class="modal-footer">${primary('OK', 'close-modal')}</div>`); return; }
  if (native) { native.postMessage(JSON.stringify({ type: 'paywall', reason })); return; }
  // Monthly $19.99 · 3-month pass $49.99 (most popular) · annual $89.99 · lifetime $119.00. Savings are against paying monthly.
  const save12 = Math.round((1 - 89.99 / (19.99 * 12)) * 100), save3 = Math.round((1 - 49.99 / (19.99 * 3)) * 100);
  const plans = [
    { id: 'quarter', label: '3-MONTH PASS', badge: 'MOST POPULAR', price: PRO_PRICES.quarter, unit: '/3 mo', lines: [`${TRIAL.words} free`, 'A full 90-day NCLEX study plan'], saveText: `Save ~${save3}%` },
    { id: 'monthly', label: 'MONTHLY', price: PRO_PRICES.monthly, unit: '/mo', lines: [`${TRIAL.words} free`, 'Cancel anytime'] },
    { id: 'annual', label: 'ANNUAL · COMPLETE PASS', price: PRO_PRICES.annual, unit: '/yr', lines: [`${TRIAL.words} free`, '$7.50/mo · covers a delayed ATT or credentialing wait'], saveText: `Save ~${save12}%`, wide: true },
    { id: 'lifetime', label: 'LIFETIME ACCESS', badge: 'PAY ONCE', price: PRO_PRICES.lifetime, unit: '', lines: ['One payment · keep it as your bedside reference'], wide: true },
  ];
  const card = p => `<button class="plan${paywallPlan === p.id ? ' on' : ''}${p.wide ? ' wide' : ''}" data-action="pw-plan" data-id="${p.id}" role="radio" aria-checked="${paywallPlan === p.id}"><span class="plan-top"><span>${p.badge ? `<span class="pw-badge">${p.badge}</span>` : ''}<span class="plan-label">${p.label}</span></span><span class="radio"></span></span><span class="plan-price"><strong>${p.price}</strong>${p.unit ? `<span>${p.unit}</span>` : ''}</span>${p.lines.map(l => `<span class="plan-line">${l}</span>`).join('')}${p.saveText ? `<span class="plan-save">${p.saveText}</span>` : ''}</button>`;
  const chosen = plans.find(p => p.id === paywallPlan);
  const per = { quarter: '3 months', annual: 'year', monthly: 'month' }[paywallPlan];
  const features = [[`All ${N.fmt(N.total)} NCLEX-style questions`, 'check'], [`${N.fmt(N.ngn)} NGN-format items`, 'layers'], [`${N.cases} NGN case studies`, 'spark'], ['NCLEX blueprint exam', 'target'], ['Timed exam mode', 'clock'], ['The complete book', 'book'], ['Answers linked to the book', 'bookmark']];
  modal.className = 'paywall';
  const prev = document.activeElement;
  modal.innerHTML = `<div class="pw"><button class="pw-close" data-action="close-modal" aria-label="Close">${icon('close')}</button><div class="pw-head"><img src="pages/cover.webp" alt="" class="pw-icon"><div><p class="pw-eyebrow">RAPID NURSING REVIEW PRO</p><h2 id="modal-title">Prepare to Pass the NCLEX-RN on Your First Attempt</h2></div></div>${reason ? `<p class="pw-reason">${escape(reason)}</p>` : ''}<div class="pw-marquee" aria-label="Pro includes: ${features.map(f => f[0]).join(', ')}"><div class="pw-track">${[0, 1].map(k => `<div class="pw-chips" ${k ? 'aria-hidden="true"' : ''}>${features.map(([t, ic]) => `<span class="pw-chip">${icon(ic)}${t}</span>`).join('')}</div>`).join('')}</div></div><div class="pw-plans" role="radiogroup" aria-label="Plans"><div class="pw-row">${card(plans[0])}${card(plans[1])}</div>${card(plans[2])}${card(plans[3])}</div><button class="pw-cta" data-action="pw-buy"><strong>${per ? `Start ${TRIAL.adj} Free Trial` : 'Unlock Pro Access'}</strong><span>${per ? `${TRIAL.words} free, then ${chosen.price}/${per} · cancel anytime` : `${chosen.price} once · no subscription`}</span></button><div class="pw-links"><button data-action="pw-restore">Restore Purchases</button><span>·</span><button data-action="pw-manage">Manage Subscription</button></div><p class="pw-terms">${per ? `${TRIAL.words} free, then ${chosen.price}/${per}, renewing automatically. Cancel at least 24 hours before the trial ends and you won't be charged. ` : ''}Payment is charged to your ${ANDROID ? 'Google Play account' : native ? 'Apple ID account' : 'Apple ID or Google Play account'} at confirmation of purchase (for a free trial, when the trial ends). Subscriptions renew automatically unless canceled at least 24 hours before the end of the current period. Cancel anytime in your account settings. Lifetime access is a one-time purchase. Rapid Nursing Review is for education only; it is not medical advice.</p>${legal()}<p class="pw-terms">U.S. prices shown. In the app, the App Store or Google Play shows the price for your country.</p><div class="pw-links small"><a href="https://nclexrapidnursingreview.com/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a><span>·</span><a href="${TERMS_URL}" target="_blank" rel="noopener noreferrer">Terms of Use${ANDROID?'':' (EULA)'}</a></div>${PREVIEW_UNLOCK ? `<div class="pw-links small"><button data-action="pw-preview">${state.previewPro ? 'Preview: lock Pro again' : 'Preview: unlock Pro on this device'}</button></div>` : ''}</div>`;
  if (!modal.open) modal.showModal();
  const again = prev?.dataset?.action ? modal.querySelector(`[data-action="${prev.dataset.action}"]${prev.dataset.id ? `[data-id="${prev.dataset.id}"]` : ''}`) : null;
  (again || modal.querySelector('.plan.on'))?.focus();
}

document.addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(!button)return;const d=button.dataset;switch(d.action){
 case 'practice':case 'plan':case 'progress':case 'lessons':case 'book':closeModal();navigate(d.action==='lessons'?'book':d.action);break;
 case 'toggle-book':if(modal.open)closeModal();if(bookIsOpen()){state.book.open=false;save();renderBookPanel();}else openBook(null,state.book.tab);break;
 case 'close-book':state.book.open=false;save();renderBookPanel();document.querySelector('.book-toggle')?.focus();break;
 case 'book-wide':bookWide=!bookWide;try{localStorage.setItem('rnr.bookWide',bookWide?'1':'0');}catch{}renderBookPanel();break;
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
 case 'plan-nclex':{const t=nclexTopics.find(x=>x.id===d.id);if(!t)break;pick.view='topics';pick.topics=[t.id];if(modal.open)closeModal();navigate('practice');toast(`${t.name} is selected. Pick your questions and start.`);break;}
 case 'quick':quick();break;
 case 'resume':if(state.session)showQuiz();else if(state.caseSession)showCase();break;
 case 'resume-case':showCase();break;
 case 'new-practice':closeModal();openSetup();break;
 case 'rate-app':try{native?.postMessage(JSON.stringify({type:'rate-app'}));}catch{}break;
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
 case 'settings-reminder':openReminderSettings();break;
 case 'settings-plan':openSettingsAt('#your-plan');break;
 case 'export':exportData();break;
 case 'report':openReport(d.id);break;
 case 'reports':showReports();break;
 case 'notifications':modalShell('Your study reminders.','A little focus for today.',`<div class="takeaway"><small>TODAY’S NEXT STEP</small><p>${state.session?'Continue your saved session.':state.plan?`Set aside ${state.plan.minutes} minutes for ${escape(planTopicName((planDays().find(x=>x.day===dayKey())||{}).topic||state.plan.topics[0]))}.`:'Try four questions and learn from the explanations.'}</p></div><p class="dialog-note">These are in-app suggestions. This pilot does not send notifications.</p><div class="modal-footer">${primary(state.session?'Resume practice':'Start practice',state.session?'resume':'quick')}</div>`);break;
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
 case 'choose-case':{const done=new Set(state.caseHistory.map(h=>h.caseId));modalShell('NGN case studies','Pick a case. Each has a client chart and six clinical-judgment items.',(()=>{const row=c=>`<button class="search-item" data-action="start-case" data-id="${c.id}"><span class="icon-tile" style="background:var(--g-imm,linear-gradient(135deg,#9333ea,#db2777))">${icon(allowedCase(c)?'stethoscope':'crown')}</span><span><strong>${escape(c.title)}</strong><p>${escape(c.sub)}${done.has(c.id)?' · Done ✓':''}${allowedCase(c)?'':' · Pro'}</p></span></button>`;return `<div class="case-choose">${row(ngnCases[0])}<details class="more-cases"><summary>${ngnCases.length-1} more case studies</summary>${ngnCases.slice(1).map(row).join('')}</details></div>`;})());break;}
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
 case 'pw-plan':paywallPlan=d.id;updatePaywallPlan();break;
 case 'pw-buy':toast('Subscriptions are purchased in the Rapid Nursing Review app for iPhone, iPad and Android.');break;
 case 'pw-restore':case 'pw-manage':toast('Restore and manage your plan in the iPhone, iPad or Android app.');break;
 case 'pw-preview':state.previewPro=!state.previewPro;save();closeModal();toast(state.previewPro?'Preview: Pro is unlocked on this device.':'Preview: back to the free plan.');break;
 case 'rem-day':{const n=Number(d.day),r=state.reminder;r.days=r.days.includes(n)?r.days.filter(x=>x!==n):[...r.days,n].sort();if(r.days.length&&!r.on)r.on=true;save();syncReminder();showSettings();document.querySelector(`[data-action="rem-day"][data-day="${n}"]`)?.focus();render();break;}
 case 'rem-calendar':addToCalendar();break;
 case 'share-email':shareProgress('email');break;
 case 'share-more':shareProgress('more');break;
 case 'share-progress':showSettings();setTimeout(()=>document.querySelector('#modal .share-card')?.scrollIntoView({block:'center'}),50);break;
 case 'set-text':state.textSize=d.size;save();applyUi();showSettings();render();document.querySelector(`[data-action="set-text"][data-size="${d.size}"]`)?.focus();break;
 case 'set-ui':state.ui=d.ui;save();applyUi();showSettings();render();document.querySelector(`[data-action="set-ui"][data-ui="${d.ui}"]`)?.focus();break;
 case 'open-more':{const sb=document.querySelector('#sidebar'),open=sb.classList.toggle('open');document.querySelector('#menu').setAttribute('aria-expanded',String(open));render();if(open)sb.querySelector('.nav-link')?.focus();break;}
 case 'dismiss-notice':loadNotice='';render();break;
 case 'reset':{const signed=Account.enabled()&&Account.status.session;const finish=()=>{state=freshState();applyUi();loadNotice='';editSnap=snapEdits(state);save();closeModal();toast(signed?'Fresh start, here and in your account.':'Your study space is ready for a fresh start.');};if(signed){Account.resetSynced().then(finish,err=>toast(`Couldn’t reset your synced progress: ${err.message}`));}else finish();break;}
 }});
document.addEventListener('change',e=>{if(e.target.id==='rem-length'){const n=Number(e.target.value);if(REM_LENGTHS.includes(n)){state.reminder.length=n;save();refreshCalPreview();}return;}if(e.target.id==='rem-on'){state.reminder.on=e.target.checked;save();syncReminder();showSettings();render();return;}if(e.target.id==='rem-time'&&/^\d\d:\d\d$/.test(e.target.value)){state.reminder.time=e.target.value;state.reminder.on=true;save();syncReminder();showSettings();render();return;}if(e.target.id==='pick-need'){pick.need=e.target.value;render();return;}if(e.target.id==='pick-count'){pick.count=Number(e.target.value);render();return;}if(e.target.dataset.ngnBlank){const b=e.target.dataset.ngnBlank,v=e.target.value;updateCase(a=>({...(a||{}),[b]:v||undefined}));return;}if(e.target.id==='practice-course')updateSetupTopics();if(e.target.id==='practice-topic')updateSetupCounts();if(e.target.name==='courses'&&e.target.closest('#plan-courses'))updatePlanTopics();});
document.addEventListener('input',e=>{if(e.target.id==='rem-title'||e.target.id==='rem-notes'){state.reminder[e.target.id==='rem-title'?'title':'notes']=e.target.value.slice(0,e.target.id==='rem-title'?80:500);save();refreshCalPreview();return;}if(e.target.id==='search-input')searchLibrary(e.target.value);if(e.target.id==='book-search'){bookQuery=e.target.value;const q=bookQuery.trim().toLowerCase();document.querySelector('#book-results').innerHTML=q.length>1?bookResults(q):tocList(latestMap());}});
document.addEventListener('keydown',e=>{if(e.target.id==='page-jump'&&e.key==='Enter'){e.preventDefault();document.querySelector('[data-action="jump-page"]').click();return;}const panel=document.querySelector('#book-panel');if(modal.open||document.querySelector('#page-viewer').open)return;if(e.key==='Escape'&&bookIsOpen()&&window.innerWidth<=1280){state.book.open=false;save();renderBookPanel();return;}if(state.book.tab==='reader'&&panel.contains(document.activeElement)&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();openBook(state.book.page+(e.key==='ArrowRight'?1:-1));}});
document.querySelector('#page-viewer').addEventListener('click',e=>{if(e.target.id==='page-viewer')e.target.close();});
document.addEventListener('submit',e=>{if(!['practice-form','plan-form','profile-form','report-form'].includes(e.target.id))return;e.preventDefault();const form=e.target,data=new FormData(form);if(form.id==='practice-form'){const available=setupQuestions(),n=Number(document.querySelector('#practice-count').value);const c=document.querySelector('#practice-course').value,t=document.querySelector('#practice-topic').value;if(setupMode==='exam'&&!isPro()){showPaywall('Timed exams are part of Pro.');return;}startSession(shuffle(available).slice(0,n).map(q=>q.id),setupMode,Number(document.querySelector('#practice-time').value),t!=='all'?`${t} practice`:c==='all'?'Mixed course practice':`${courseOf(c).name} practice`);}else if(form.id==='plan-form'){const keys=data.getAll('courses');if(!keys.length){toast('Choose at least one course for your plan.');document.querySelector('#plan-courses')?.setAttribute('open','');return;}const topics=data.getAll('topics').filter(t=>keys.includes(planTopicInfo(t)?.course));if(!topics.length){toast('Choose at least one topic for your plan.');return;}const title=data.get('title').trim();if(!title){toast('Enter a name for your exam.');return;}const old=state.plan,date=data.get('date');const created=old&&old.created<=date?old.created:dayKey();state.plan={title,courses:keys,date,minutes:Number(data.get('minutes')),topics,created,completed:(old?.completed||[]).filter(d=>d>=created&&d<=date)};save();closeModal();navigate('plan');toast(old?'Your study plan is updated. Checked-off days are kept.':'Your daily study plan is ready.');}else if(form.id==='profile-form'){const name=data.get('name').trim();if(!name){toast('Enter a name.');return;}state.name=name;save();closeModal();toast('Your study space is updated.');}else{state.reports.push({id:crypto.randomUUID(),qid:form.dataset.id,reason:data.get('reason'),details:data.get('details').trim(),created:new Date().toISOString(),status:'saved'});save();toast('Report saved locally. Export it from your profile.');if(state.session)showQuiz();else closeModal();}});
modal.addEventListener('cancel',()=>{quizVisible=false;examFocus(false);render();});
modal.addEventListener('close',()=>{if(!quizVisible)examFocus(false);});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
document.addEventListener('click',e=>{const sb=document.querySelector('#sidebar');if(sb.classList.contains('open')&&!sb.contains(e.target)&&!e.target.closest('#menu')){sb.classList.remove('open');document.querySelector('#menu').setAttribute('aria-expanded','false');}});
document.querySelector('#menu').addEventListener('click',()=>{const open=document.querySelector('#sidebar').classList.toggle('open');document.querySelector('#menu').setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!quizVisible)showSearch();}});
window.addEventListener('hashchange',()=>{filter='all';document.querySelector('#sidebar').classList.remove('open');render();window.scrollTo({top:0});document.querySelector('#sidebar').classList.remove('open');document.querySelector('#menu').setAttribute('aria-expanded','false');});
setInterval(()=>{const s=state.session;if(!s||s.mode!=='exam')return;if(Date.now()>=s.deadline){finishSession(true);return;}const t=document.querySelector('#timer');if(t)t.textContent=timerText(s.deadline);},1000);

// ---- Tutor, daily motivation, references and celebrations ----------------------------------------
const TUTOR = { name: 'A. Korir', initials: 'AK', creds: [['MSN', 'Master of Science in Nursing: a graduate degree in nursing.'], ['RN', 'Registered Nurse.'], ['CCRN-CMC', 'Critical Care Registered Nurse certification (AACN) with the Cardiac Medicine subspecialty.']], bio: 'Critical care nurse, nurse author and app developer: creator of Rapid Nursing Review, NurseBound, Critical Care Certified and the VitalSync Health Tracker app. I built Rapid Nursing Review for nursing students and new graduates preparing for the NCLEX.', books: [['Rapid Nursing Review: All Body Systems at a Glance', ''], ['Critical Care Certified: Crush the Adult-CCRN with Confidence', ''], ['The Confident Nurse: From Classroom to Code Blue', ''], ['Living Well with Diabetes: A Patient’s Guide to Understanding, Treating, and Managing Diabetes Naturally and Medically', '']], store: 'https://www.amazon.com/stores/Alex-K-Korir/author/B0FCCVTDG3' };
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
  if (q.source === 'book') return `<details class="nb-sources" open><summary>${icon('book')}Sources &amp; references</summary><div class="nb-ref book"><p class="apa">${BOOK_APA}</p><div class="book-ref"><span class="pg">Book page ${q.page}</span><button class="mini" data-action="show-page" data-page="${q.page}" data-target="pg-${cssId(q.id)}" aria-expanded="false">View page ${q.page}</button><button class="mini" data-action="open-page" data-page="${q.page}">Open in the book</button></div><div id="pg-${cssId(q.id)}"></div><p class="nb-tiny">In-text: (Korir, 2025, p. ${q.page}). Checked against the cited page.</p></div></details>`;
  return refsBlock(q, q.source === 'rnrBank' ? 'Written for Rapid Nursing Review and checked by a second reviewer' : 'Sources checked for this question');
}
// APA reference list for a question or case, plus the related section of the book when there is one.
const sectionById2 = id => sections.find(x => x.id === id);
function inText(cite) {   // APA 7 in-text: "(OpenStax, 2024)", "(Siegel et al., 2007)", "(Adamkin & Committee on Fetus and Newborn, 2011)"
  const m = /^(.+?)\s*\((\d{4}|n\.d\.)\)/.exec(String(cite).replace(/<[^>]+>/g, '')); if (!m) return '';
  const who = m[1].trim().replace(/\.$/, '');
  const people = [...who.matchAll(/([A-Z][\w'’-]+), (?:[A-Z]\.\s?-?)+/g)].map(x => x[1]);
  let a = who;
  if (people.length && who.startsWith(people[0] + ',')) {
    const rest = who.split(/,?\s*&\s*/);
    a = people.length >= 3 ? `${people[0]} et al.` : people.length === 2 ? `${people[0]} & ${people[1]}` : rest.length > 1 ? `${people[0]} & ${rest[rest.length - 1]}` : people[0];
  }
  return `(${a}, ${m[2]})`;
}
function refsBlock(q, note) {
  const own = (q.refs || []).map(k => nclexRefs[k]).filter(Boolean);
  const list = (own.length ? own : refsFor(q)).map(([cite, url]) => `<li><p class="apa">${cite} ${url}</p><a href="${url}" target="_blank" rel="noopener noreferrer">Open source ↗</a></li>`).join('');
  const sec = q.bookSection && sectionById2(q.bookSection);
  const book = sec ? `<div class="nb-ref book related"><p class="nb-tiny strong">Related reading in the book</p><p class="apa">${BOOK_APA}</p><div class="book-ref"><span class="pg">${escape(sec.title)} · ${sec.start === sec.end ? `p. ${sec.start}` : `pp. ${sec.start}–${sec.end}`}</span><button class="mini" data-action="show-page" data-page="${sec.start}" data-target="pg-${cssId(q.id)}" aria-expanded="false">View page ${sec.start}</button><button class="mini" data-action="open-page" data-page="${sec.start}">Open in the book</button></div><div id="pg-${cssId(q.id)}"></div></div>` : '';
  const cites = [...new Set(own.map(([c]) => inText(c)).filter(Boolean))];
  return `<details class="nb-sources"><summary>${icon('book')}Sources &amp; references (APA)</summary><ul class="nb-ref">${list}</ul>${book}<p class="nb-tiny">${cites.length ? `In-text: ${cites.join('; ')}. ` : ''}${note}${q.topic ? ` · ${escape(q.topic)}` : ''}. Check the rationale against these sources; follow current guidelines and your facility’s policy.</p></details>`;
}

// Tutor card (dashboard) and the tutor intro shown at the start of a tutor session.
let tutorCred = null;
// "Meet your app developer · tutor · author" (same design as NurseBound): why the app exists, the apps and the books,
// each in a gold fold-out. Icons and covers are small inline images so they also work offline in the phone app.
const AK_ART = {"app_nursebound": "data:image/jpeg;base64,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", "app_rnr": "data:image/jpeg;base64,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", "app_ccrn": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCABYAFgDASIAAhEBAxEB/8QAHAAAAgMBAQEBAAAAAAAAAAAAAAUDBAYCAQcI/8QAOhAAAQMDAwEECAIJBQAAAAAAAQIDBAAFEQYSITEHE0FRFBUiMmFxgZGhsQgWQ1KSwdHh8CNCYpPx/8QAGgEAAgMBAQAAAAAAAAAAAAAABAUBAgYDB//EAC8RAAEDAwMCBAUEAwAAAAAAAAECAxEABCEFEjFRYQYTIkEjMnGBoRSxweFykfD/2gAMAwEAAhEDEQA/APzWBXQTXoTUgRRYFDE1ztrwirDbJWcAU2j6WmvtB0tpbSRkd4raT8h1qFuJQJUaItLN66XsYQVHsJpBiugjNM59jkW9aQ8jCVZ2qByDjrzTw9m9/btyJ6ojQaW33oT36N5TjPu5z05x1oZb6QJmmttpb28oUgyORHFZRKKnbaphbrK/OJLaRtTjcpRwBnpzV53TsllsrCUrAGTsOSPpQi3RMTWgttPc2eYEHb1jFJ0tV2lsVMpsoODQBXEqohLYFRlGKKkIoqs1YpFUFQ1oaQ4R7K84PyoaYKyBitG7blvQorKEEuJ3ZGOmeaZ2PTCFONOPKAUlWVII4A8M/bPypyp0ITJrzbT213r6Ldv5lGKk0zppmMwLhOT8W2z+Z/zj508k4Uy4cADGePwrt99ClBIcSgDhIUeg+NcNsSJNuMthl1xtIWNyRlICPeUfkCPlkfCkrzhcO5Ve/aZp7GlspYZGfc9T3/7FLJtvculvEdlpTr6nkpaQkZUpXkPjzWqfMNNqbtmYYlIjejqZELBCwnG0q3ZPP40Q2v1cjrMxnunu671bjgGYqtwKFpxnPAH3rOp19aF6jXNlw3pCFFRJJASXDwFbf3fHHWqJSpaYA4pZqD1s1cl1xQG4R9e/99qgjQlQIEeO4gtuFxZdB6g8D8vzpi/GZC17MI2KICknpzimV5gNSYUWXBc9IjuE9y9gJU9gDcop6gZyBnnil81p5psSQ04EuLbJITncFHgj6An6VWZJmnVopDdsnyyCAKQXi0B0KdQgJdSMqSBwseY+PmKzamSlWK35w8kJT3gUnlKlJI/E0guNuCXw4hGELPT90+I/zzqd0c0o1TTUhQda4PP1rPFvFFNn4QU6QgceFFR5gpUbRU4qoxNc7pTWSdxGST4Dw/zyrWWkSgzGttthP3C63BW1mKwMrXxlRJPCUgYyTwOax1sbL8hDYGSo4r7L+j+to3/UlyVj0hpMeI0SOUNK3LUB5ZIH2plrdyi0YLhExn8gD96wvhoLtgu7aHrwlJ6Egkn6gCPvUTnZD2mNRTJ9W2R04yYjdw/1flkp2E/Ws1bb49Dlrj+r5ZuiHzFTalMBbrkknPdKbJ6HGSrpwDVZHbPriFqt2++uZEpJluteqHFHuFIClJDYQkEgjAOQM5FbLsv1Q5rjtUuGqbnZ2bZco9qQygJSv28r2lz2wDnb7OfKlD7jlu2p19IKQJx16ZP5FPWtf1AHy1L3FXEgYn3x+xqvcuxvtLvMIPG32aMA0Uphu3Hc8B4AqCduR5ZxXyq16B1NdtbfqimAId6AWpTExfdhISncTuwQQRyCODW21b2t61g9oVynxr3Kbj264KjtW7cRHcbSQNikAclXn154pxpHtGuWue2OwXO5WRu1SY0KWwHEheXkbCQDvA93J/irom4uGWS6pIKdpVj2MTGTn7UmvHbi5dQX1kqwBxxPYVYtvY92k2ZnYu0WaawkJKmG7oELcwCMBRSMZz0zWftcTU2qNTv6Xttqbj3eKyt2VFuDvo4ZCVAbQQDn3wQehBzX1aVbtcO9qLV+j6kUxpxKUByAXlKDmEYUnu8bRlXOc/Gk9r1NDuf6Qs2Rb3m3VRrEYsh1vBCnEuJJGfEgED6Y8KVt6slYUqAqE7sTg9DnmmqNU1JkBAcjISJA9umK+baha1BpW+DT93gMMXRxTIYSh7c0+HVBKVBeOgOQeOCDVjV2nNSaLmRYmo4cBoz0OuMGLJ77lvG7PsjHCq+pa/t0LtJS09DUFXnTN0bwDgKICkLWg/8AFScKHxT86zP6Qk5UvUGlitW4JTL+xKK622qt3C22tsEhU9oEj34NFt6pqTriEOOSmQOBmTHT7Yr5c9ObRjGCSKKQ3FS40hbZ4KSRRTQW1Hq1QgxTXTcZbjxcSMlLalAfh/OtRY9TSdGX311GjOSoU1oMzY7fCgU8hafDcOePEE0r0WEL9IKTnaycZprDabVNcjOY2u5SknoFeH3orVQh1xTTglJEfzUeGtKTcaOIMEqJnpGP4p6zrTsxh3lWpItvf9cKKl4REd7zeRyQk+wFHnms0vtEvzeuRrBURXcqb9E9AK+fRuoTu6b8+15Z4qddrYSs94jocbMc58vj8qb2rR0e+aOudw2XBM1SpCrelggRwGAknvBjkrVvSnn/AG0us9HZUpQSCskR6jMJ6DiKE1m1Z0ppLt6uAVY2gDPU57f0amd1t2XzbwjUkmA8LugpcwuK5v3gcEpHsFQ8/hSIdq6bl2mwL7c2pEO1wWHmGGyguODen3lBOeVHHToAKu6Z03py+WqxB9u8i4Xx6ahEyO+nuIgaOUKW0UnKSMA8jxqhpjStrvb2jJckT83aRcW7guO7hKUsg93sODs6ck9RXdjw42Ad24ykpEqmAfYYxz3rM3mtW6SQlWUqz6QJic8mflPSrie1X0XtLfvTL893T0hluO6hTa/YIR76Wz4hQ8ByCarWnWmlLH2nztRxJEhFunQ17wIqwUPqUkqAGOh27s+ZNKnjHh6P0/esSnpNwVNRJ3Ky2nu1pDZAA9ngnPPNXpLOllaBhXVm33Vq7SZS4G924pLKHG0JUp0p2cpOThOePOoOhsiU5HoCTnkdTjnvRf6tlSW1tqKipZHyjCp/ywDmPpXls7RfVPaTddRxDIdslyeCH092Qoo2pAcCTzlKs/QmrPaJrO2a1u9mXaVyHRFQ+HC4wpsDdtx169DSluNH2lSSkp6ZHIV/emEG0tNDv3UjcfdR5DzP9KFFpbh5D6QdyRtHcRGcZMfSttbeGnW1J+JIkKOPeZxnA/3WT1FDKp6Cn9qhKvrjB/Kim1+S0h5ok8pCgB9aKM81UCKFu7JpNw4FdTXOgHAXpKCcEskD8f7U2lHLq1AgYOQaxVhuHoMjcc7FpKFY6jPiPkcGnBiTZwy5J7xo9FJ5Sfp4fWi79hRc3e1c/CWtMosRbcrBOO3M06VeUu+0qYgkDGSoZFLfT24i47jV4npciApjFp5WWASSQjwAOTn51AmwKV+3R/EP61YbsTLfLjgV9FH+QH40M2VIPpUacXq0XaQLllJAn5hMTg/il/re4MwFWuBcrkxAXuBjpkKCF7jyMDzJ5r2JcZ8N961xLnOiwX17HWGHihtfG3kDz8fOrk16LEQO6IW4k5SnAwFeBOOOPLJpRAa7yUSsEjao/XHH44piyXNpUomvONfesWnEoYQk5lUARPtxTWIq6x7QbYzerhHhOJUlcRtwhohXvDb5HnNUnIM1MdEYSXHYrbinkMb/AGErIwVAeZAApnDlRpiB3zncPHqT0UfMf+/erKoTnVCm3B8Dj86DU858qj2rW2ljYOoDzCE5M4Amep75rONuvRHMoUttflWjtWovSMMyEAO49kjgK/vUL0JS07XWSofKlq7W82+C3lCOFBa+Nv8AX6VxUAac29w7aqBBkdKk1QTllQ95QUT96K4vC/TXspB2JASnPl5/nRUJUAIpVfpU9cLcTwTWcakKT0Sn+EUyhy5KtxQR7Iz5faiitWkTg15Es7RIqVN3kgn2zz1+NTmVIMcPnuyknGCkE/OiiqhtPSqOvLMSarKnuHqlv/rFeC7OIICkpUkEcbQCBkcDy6UUUO6hMcVZptK1Qqq5uLhWQNu3wTgYA+FW41zWjGCB8hiiikjqBNeiab8JACKYIuyjgk8jofKvHLgpzqc0UUIUitAl5RFV1SQfL7UUUVISKqXVV//Z", "app_vitalsync": "data:image/jpeg;base64,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", "book_rnr": "data:image/jpeg;base64,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", "book_ccrn": "data:image/jpeg;base64,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", "book_confident": "data:image/jpeg;base64,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", "book_kenya": "data:image/jpeg;base64,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", "book_diabetes": "data:image/jpeg;base64,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"};
const AK_WHY = [
  "Nursing school hands you thousands of pages, and the NCLEX expects you to connect all of them under pressure. Most students don't need more content; they need the essentials, organized so they stick.",
  "Rapid Nursing Review puts my book, All Body Systems at a Glance, in your pocket: every body system at a glance, NCLEX-style questions linked to the page you just read, a rationale for every answer and a readiness ring that shows what to study next.",
  "I wrote every question and rationale to teach the reasoning behind safe care, so you walk into the NCLEX, and onto the unit, confident.",
];
const AK_APPS = [
  ['nursebound', 'NurseBound', 'For internationally educated nurses: NCLEX-RN prep, licensing roadmaps, English tests and visa tracking for the U.S., Canada, Australia and New Zealand.', 'https://nursebound.app'],
  ['rnr', 'Rapid Nursing Review', 'The book Rapid Nursing Review as an app: every body system at a glance, with NCLEX questions linked to each page.', 'https://nclexrapidnursingreview.com'],
  ['ccrn', 'Critical Care Certified', 'Adult CCRN exam prep for ICU nurses ready for their next step, built on the book Critical Care Certified.', 'https://ccrn.rapidnursingreview.com'],
  ['vitalsync', 'VitalSync Health Tracker', 'Log and chart your vitals, sleep, medications, immunizations, meals and appointments, with Apple Health sync. On the App Store.', 'https://apps.apple.com/app/id6774855397'],
];
const AK_HERE = 'rnr';
const amazonSearch = t => `https://www.amazon.com/s?k=${encodeURIComponent(t.split(':')[0] + ' Alex Korir')}&i=stripbooks`;
const AK_BOOKS = [
  ['rnr', 'Rapid Nursing Review: All Body Systems at a Glance', 'https://www.amazon.com/dp/B0FB2N2FB7'],
  ['ccrn', 'Critical Care Certified: Crush the CCRN-Adult with Confidence', ''],
  ['confident', 'The Confident Nurse: From Classroom to Code Blue', 'https://www.amazon.com/dp/B0FFM7DYB7'],
  ['kenya', 'The Double Burden of Disease in Kenya: Understanding Determinants, Enhancing Recognition, and Scaling Treatment and Prevention', ''],
  ['diabetes', 'Living Well with Diabetes: A Patient’s Guide to Understanding, Treating, and Managing Diabetes Naturally and Medically', 'https://www.amazon.com/dp/B0FBJZP52T'],
];
function akFolds(why) {
  const apps = AK_APPS.map(([k, n, d, u]) => { const here = k === AK_HERE; const inner = `<img class="ak-ic" src="${AK_ART['app_' + k]}" alt="${escape(n)} app icon" width="44" height="44"><span class="ak-txt"><b>${escape(n)}${here ? ' <em class="ak-here">You’re here</em>' : ''}</b><small>${escape(d)}</small></span>${here ? '' : '<i class="ak-go">↗</i>'}`; return here ? `<div class="ak-row here">${inner}</div>` : `<a class="ak-row" href="${u}" target="_blank" rel="noopener noreferrer">${inner}</a>`; }).join('');
  const books = AK_BOOKS.map(([k, t, u]) => `<a class="ak-row book" href="${u || amazonSearch(t)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(t)}, on Amazon"><img class="ak-cover" src="${AK_ART['book_' + k]}" alt="Cover of ${escape(t.split(':')[0])}" width="46" height="69"><span class="ak-txt"><b><i>${escape(t)}</i></b><small class="ak-amz">View on Amazon ↗</small></span></a>`).join('');
  return `<details class="tutor-more"><summary><span>${icon('heart')}${escape(why)}</span></summary><div class="ak-why">${AK_WHY.map(p => `<p>${escape(p)}</p>`).join('')}</div></details>`
    + `<details class="tutor-more"><summary><span>${icon('stethoscope')}Apps by ${TUTOR.name}</span></summary><div class="ak-list">${apps}</div></details>`
    + coursesFold()
    + `<details class="tutor-more"><summary><span>${icon('book')}Books by ${TUTOR.name}</span></summary><div class="ak-list">${books}<a class="tb-link" href="${TUTOR.store}" target="_blank" rel="noopener noreferrer">See all books on Amazon ↗</a></div></details>`;
}
function tutorCard() {
  return `<section class="tutor-card"><span class="tc-eyebrow">Meet your app developer · tutor · author</span><div class="tutor-row"><img class="tutor-avatar photo" src="pages/tutor.webp" alt="Photo of ${TUTOR.name}" width="58" height="58"><div><h3>${TUTOR.name}, ${TUTOR.creds.map(c => c[0].replace('-', '\u2011')).join(', ')}</h3><div class="cred-row">${TUTOR.creds.map(([c]) => `<button class="cred${tutorCred === c ? ' on' : ''}" data-action="tutor-cred" data-id="${c}" aria-expanded="${tutorCred === c}">${c}</button>`).join('')}</div></div></div>${tutorCred ? `<p class="cred-note">${TUTOR.creds.find(c => c[0] === tutorCred)[1]}</p>` : ''}<p class="tutor-bio">${TUTOR.bio}</p>${akFolds('Why I created Rapid Nursing Review')}</section>`;
}
function tutorIntro(s) {
  // Name the real topics in the session ("Cardiovascular & Respiratory", "Pediatrics, Maternal & Newborn and 2 more"), never a count like "2-topic".
  const names = [...new Set((s.ids || []).map(id => topicOf(qOf(id)?.nclexTopic)?.name).filter(Boolean))];
  const many = names.length > 1 ? (names.length === 2 ? `${names[0]} & ${names[1]}` : `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`) : '';
  let topic = String(s.label || '').replace(/\s*practice$/i, '');
  if (/^\d+-topic$/i.test(topic) || /^Mixed NCLEX$/i.test(topic)) topic = many || 'a mix of NCLEX topics';
  return `<div class="tutor-intro"><img class="tutor-avatar sm photo" src="pages/tutor.webp" alt="" width="42" height="42"><div><strong>Meet your tutor, ${TUTOR.name}${firstName() ? `. Hi ${escape(firstName())}!` : '.'}</strong><p>Today we will learn: <b>${escape(topic || 'NCLEX essentials')}</b>. Answer, check, and read the why. I’ll highlight the key points for you.</p></div></div>`;
}
function motivationCard() {
  const st = streak(), p = state.plan, days = p ? dayDistance(new Date(), parseDay(p.date)) : null;
  const personal = st >= 2 ? `${st}-day streak. Don’t break the chain today.` : days != null && days >= 0 ? `${days} day${days === 1 ? '' : 's'} until ${escape(p.title)}. You’ve got this.` : 'Start a streak today. Ten questions is enough.';
  return `<section class="motivation-card"><div class="mc-top">${icon('sun')}<span>Today’s motivation</span></div><p class="mc-quote">“${todaysMotivation()}”</p><p class="mc-personal">${icon('flame')}${personal}</p></section>`;
}

// "Knowledge Empowered By": free Harvard courses (Harvard Online Learning, pll.harvard.edu) with a share button.
const COURSES = [
  ["CS50's Introduction to Computer Science", 'Harvard University (edX / OpenCourseWare)', 'https://pll.harvard.edu/course/cs50-introduction-computer-science'],
  ["CS50's Introduction to Programming with Python", 'Harvard University', 'https://pll.harvard.edu/course/cs50s-introduction-programming-python'],
  ["CS50's Introduction to Artificial Intelligence with Python", 'Harvard University', 'https://pll.harvard.edu/course/cs50s-introduction-artificial-intelligence-python'],
];
const FREE_CATALOG = 'https://pll.harvard.edu/catalog/free';
const coursesText = () => `Free, world-class courses from Harvard University:\n${COURSES.map(c => `• ${c[0]}: ${c[2]}`).join('\n')}\nMore free courses: ${FREE_CATALOG}`;
function coursesFold() {
  return `<details class="tutor-more courses"><summary><span>${icon('grad')}Knowledge Empowered By</span></summary><div class="tc-courses"><div class="tc-c-head"><p>Continuous learning through free, world-class courses, including:</p><button class="tc-share" data-action="share-courses" aria-label="Share these free courses">${icon('share')}<span>Share</span></button></div>${COURSES.map(c => `<a class="tc-course" href="${c[2]}" target="_blank" rel="noopener noreferrer"><i>▸</i><span><b>${escape(c[0])}</b><small>${escape(c[1])}</small></span><em>↗</em></a>`).join('')}<p class="tc-tag">Free, open-access education: proof that world-class knowledge has no price barrier.</p><a class="tc-support" href="${FREE_CATALOG}" target="_blank" rel="noopener noreferrer"><span class="tc-globe">🌍</span><span><b>Support Open Education</b><small>Explore more free courses at pll.harvard.edu</small></span><em>↗</em></a></div></details>`;
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-action=share-courses]'); if (!b) return; e.preventDefault();
  const text = coursesText();
  try { if (navigator.share) { await navigator.share({ title: 'Free Harvard courses', text }); return; } } catch (err) { if (err && err.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(text); const s = b.querySelector('span'); if (s) { s.textContent = 'Copied'; setTimeout(() => { s.textContent = 'Share'; }, 2500); } } catch {}
});

// ---- Encouragement and celebration copy (same library as NurseBound) -------------------------------------
// Under 60%: encouragement. 80%+: a high-score banner. 100%: perfect. 90%+ on a full-length (75+ question) exam:
// a major-milestone pop-up. Edit these lists to change any wording.
const CHEER = {
  low: ["Ten questions, ten lessons. A low score here just shows you what to study next. Review the rationales and try another set.",
    "A rough quiz is a vital sign, not a diagnosis. You've found what needs attention. Take a breath and work through the rationales.",
    "Missing it here keeps it from happening on exam day. Read each rationale slowly. Your next set will feel different.",
    "Not your score yet, and that's fine. Mistakes made here can't hurt a patient. Review what you missed and try one more round.",
    "Clinical judgment is built one wrong answer at a time. You just added to yours. Check the rationales, then keep going.",
    "Every missed question is a lesson learned before it counts. Nursing isn't about getting everything right the first time; it's about learning, adapting and growing."],
  lowExam: ["Take a moment for yourself; you're doing heavy work. This test measures your current knowledge, not your capability as a future nurse. Every wrong answer you dissect today is clinical judgment you'll carry into your actual exam. Rest up, read your rationales, and remember why you started.",
    "You just finished a full exam, and that takes stamina. This score is a snapshot of today, not a ceiling. Rest tonight, then go through the rationales one section at a time.",
    "Disappointed is allowed. Done is not. Every rationale you study now turns into a right answer on test day.",
    "This test measured where you are, not who you'll become. Plenty of nurses who passed the NCLEX failed a practice exam first. Rest, review and rebuild."],
  weak: ["{category} is tough for almost everyone. That's why it's on the NCLEX. Focus here for a few days and watch it change.",
    "You've triaged your studying: {category} needs attention first. A focused 10-question set today is a great start.",
    "{category} isn't your weak spot. It's your next strength in progress.",
    "Think of {category} like a patient who needs closer monitoring. Check on it daily. Ten questions a day adds up fast."],
  high: ["Boom! 💥 You crushed that quiz. Your hard work is paying off. Keep that momentum going! 🩺",
    "Clinical judgment on point! 👏 You're building the exact knowledge you need to pass the NCLEX with confidence.",
    "That's how a safe nurse thinks. You read the stem, found the clue and chose the right action. Keep going!",
    "Strong work! Every question you get right here is one less you'll second-guess on exam day.",
    "You're not guessing anymore. You're reasoning. That's the clinical judgment the NCLEX is looking for.",
    "Proud of you! 🩺 You're turning hours of studying into real confidence at the bedside."],
  perfect: ["100%! Absolute perfection! 🎯 You completely mastered this topic today.",
    "Flawless performance! 💯 You answered every question correctly. Your future patients are going to be in excellent hands.",
    "Perfect score! You didn't just memorize this topic. You own it.",
    "Clean sweep! 🧹 Your clinical reasoning was spot on from the first question to the last.",
    "Perfect! Somewhere in your future, a patient is safer because of the work you just did."],
  exam: ["You just passed a full-length practice exam with flying colors! Scores like this don't happen by luck. They come from every early morning, late night and rationale you've reviewed. You're turning preparation into clinical intuition. Keep pushing, future nurse!",
    "90%+ on a full exam. Read that again. You have the knowledge, the stamina and the judgment. You're ready for what's next.",
    "You didn't just pass a practice exam. You showed yourself you're ready to care for real patients. So proud of you. 💙"],
  mastery: "Mastery unlocked in {category}! 🎯 What used to be a hard topic is now one of your strengths.",
};
const cheerPick = list => list[Math.floor(Math.random() * list.length)];
/** The banner shown at the top of a session's results (encouragement or celebration), or ''. */
function resultCheer(h, t) {
  const pct = t.max ? t.pts / t.max : 0, full = h.ids.length >= 75;
  const needs = Object.entries(t.needs || {}).filter(([, v]) => v.total >= 3).map(([k, v]) => [needName(k), v.right / v.total]);
  const worst = needs.filter(n => n[1] < 0.6).sort((a, b) => a[1] - b[1])[0], best = needs.filter(n => n[1] >= 0.9).sort((a, b) => b[1] - a[1])[0];
  let kind, title, msg, extra = '';
  if (pct < 0.6) { kind = 'low'; title = full ? 'You’re doing heavy work' : 'Keep going, future nurse'; msg = cheerPick(full ? CHEER.lowExam : CHEER.low); if (worst) extra = cheerPick(CHEER.weak).split('{category}').join(worst[0]); }
  else if (pct === 1 && h.ids.length >= 5) { kind = 'win'; title = '100% Mastery Unlocked! 🏆'; msg = cheerPick(CHEER.perfect); }
  else if (full && pct >= 0.9) { kind = 'win'; title = 'Major Milestone Reached! 🎓'; msg = cheerPick(CHEER.exam); }
  else if (pct >= 0.8) { kind = 'win'; title = 'Clinical judgment on point! 👏'; msg = cheerPick(CHEER.high); if (best) extra = CHEER.mastery.split('{category}').join(best[0]); }
  else return '';
  h._cheer = { kind, title, msg };
  return `<div class="cheer ${kind}" role="status"><strong>${escape(title)}</strong><p>${escape(msg)}</p>${extra ? `<p class="cheer-extra">${escape(extra)}</p>` : ''}</div>`;
}

// ---- Celebrations (confetti) ---------------------------------------------------------------------
document.addEventListener('click', e => { const b = e.target.closest('[data-action=tc-toggle]'); if (!b) return; const a = b.closest('.test-card'); const open = a.classList.toggle('open'); b.setAttribute('aria-expanded', String(open)); try { const set = new Set(JSON.parse(localStorage.getItem('rnr.tcOpen') || '[]')); open ? set.add(a.dataset.tc) : set.delete(a.dataset.tc); localStorage.setItem('rnr.tcOpen', JSON.stringify([...set])); } catch {} });
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
  ['q2500', s => s.total >= 2500, '2,500 questions!', 'Two and a half thousand. Unstoppable.', 'crown', ['#ca8a04', '#ea580c']],
  ['q3200', s => s.total >= 3200, '3,200 questions!', 'You practiced the whole bank. Legendary.', 'crown', ['#ca8a04', '#ea580c']],
  ['s3', () => streak() >= 3, '3-day streak 🔥', 'Small, steady doses work, for your patients and for your studying.', 'flame', ['#ea580c', '#db2777']],
  ['s7', () => streak() >= 7, '7 days in a row! 🔥', 'Discipline is what bridges the gap between nursing student and licensed nurse. Keep the streak alive!', 'flame', ['#dc2626', '#ea580c']],
  ['s14', () => streak() >= 14, '14 days straight!', 'You’re not just studying. You’re becoming the nurse who shows up, every shift.', 'flame', ['#9333ea', '#e11d48']],
  ['s30', () => streak() >= 30, '30 Days of Dedication! 🗓️', 'A whole month of consistent study. You’re building habits that will serve you throughout your nursing career.', 'crown', ['#059669', '#0284c7']],
  ['s50', () => streak() >= 50, '50-day streak! 🏅', 'That’s elite-level dedication. Future employers want exactly this kind of nurse.', 'crown', ['#ca8a04', '#ea580c']],
  ['s100', () => streak() >= 100, '100-day streak! 🏆', 'One hundred days of choosing your dream. Future RN, we salute you.', 'crown', ['#be185d', '#9333ea']],
  ['a10', () => state.attempts.filter(a => a.correct).length >= 10, '10 correct answers', 'Ten times you connected the clues. Keep it up.', 'check', ['#15803d', '#0d9488']],
  ['a100', () => state.attempts.filter(a => a.correct).length >= 100, '100 correct answers!', 'One hundred right answers. Confidence earned.', 'trophy', ['#15803d', '#0284c7']],
];
function checkMilestones() {
  const s = stats(); state.milestones ||= [];
  for (const [id, test, title, body, ic, colors] of MILESTONES) if (!state.milestones.includes(id) && test(s)) { state.milestones.push(id); save(); celebrate({ title, body: `${firstName() ? firstName() + ', ' + body.charAt(0).toLowerCase() + body.slice(1) : body}`, icon: ic, colors }); }
}
function welcome() {
  if (!fxOn() || !storageOK) return;
  const today = dayKey(new Date()), first = !state.lastOpen, now = Date.now();
  if (!first && state.lastWelcome && now - state.lastWelcome < 30 * 60000) return;
  state.lastWelcome = now;
  const name = firstName(), st = streak(), due = missed().length;
  state.lastOpen = today; save();
  if (first) { celebrate({ eyebrow: 'Welcome, future nurse', title: 'You belong here.', body: `This is your study space. Practice with ${N.fmt(N.total)} NCLEX-style questions and ${N.cases} NGN case studies, read the book page by page, and watch yourself grow. Today’s motivation: ${todaysMotivation()}`, icon: 'heart', colors: ['#ea580c', '#e11d48'], cta: 'Let’s begin', after: () => { if (!isPro()) showPaywall('welcome'); }, form: `<form id="fx-form" class="fx-form"><label for="fx-name">What should we call you?</label><input id="fx-name" maxlength="30" placeholder="Your first name" autocomplete="given-name"></form>` }); return; }
  const line = st >= 2 ? `You’re on a ${st}-day streak.` : due ? `${due} question${due === 1 ? '' : 's'} are waiting for a second try.` : 'Let’s make today count.';
  celebrate({ eyebrow: 'Welcome back', title: name ? `Welcome back, ${name}!` : 'Welcome back!', body: `${line} ${todaysMotivation()}`, icon: 'sun', colors: ['#f59e0b', '#ea580c'], cta: 'Let’s study' });
}

document.addEventListener('click', e => { const b = e.target.closest('[data-action=tutor-cred]'); if (b) { tutorCred = tutorCred === b.dataset.id ? null : b.dataset.id; render(); } });
applyUi();render();welcome();syncReminder();
// Book pages on the phone: while a page is on screen, the app asks iOS/Android to block screenshots
// and screen recording (expo-screen-capture in mobile/App.js). Everywhere else they work as usual.
if(native){let bookShown=false,bvTimer=null;const checkBook=()=>{const on=!!document.querySelector('#book-panel:not([hidden]) img[src*="pages/p"], #page-viewer[open] img[src*="pages/p"], .inline-page img[src*="pages/p"]');if(on!==bookShown){bookShown=on;try{native.postMessage(JSON.stringify({type:'book-visible',on}));}catch{}}};new MutationObserver(()=>{clearTimeout(bvTimer);bvTimer=setTimeout(checkBook,60);}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','open','src']});checkBook();}
// Sync on launch, when the app comes back to the foreground, and when the connection returns.
if(Account.enabled()&&Account.status.session)runSync();
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleSync(300);else if(Account.status.session)runSync();});
window.addEventListener('online',()=>scheduleSync(300));
window.__rnrResume=()=>scheduleSync(300);
setInterval(()=>{if(route()==='plan'&&!modal.open)render();},60000);
