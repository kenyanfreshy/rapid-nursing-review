import { courses, sections, questions, retiredLessons as lessons, sources, book, BOOK_ACCESS, pageText } from './data.js';

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
 lungs:'M12 3v8 M12 11l-3 2 M12 11l3 2 M9 6C5 6 3 12 3 17c0 2 1 3 3 3 2 0 3-1 3-3V6z M15 6c4 0 6 6 6 11 0 2-1 3-3 3-2 0-3-1-3-3V6z',
 stomach:'M9 3v5c0 2-4 3-4 8a5 5 0 0 0 10 2c1-2 3-2 4-1 1-4-1-7-4-7-2 0-3-1-3-3V3',
 gland:'M7 5c-3 1-4 5-2 8l3 5h8l3-5c2-3 1-7-2-8-2 0-3 1-5 3-2-2-3-3-5-3z M12 8v10',
 kidney:'M9 4C5 4 4 8 4 12s1 8 5 8c3 0 4-2 3-5-1-2 1-3 1-6 0-3-1-5-4-5z M13 12h4 M17 12v8',
 brain:'M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1z M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1',
 drop:'M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z',
 skin:'M3 14c3-2 6-2 9 0s6 2 9 0 M3 19c3-2 6-2 9 0s6 2 9 0 M8 4l1 5 M15 4l-1 5',
 bone:'M7 7l10 10 M5 9a2 2 0 1 1 2-4 2 2 0 1 1 4 2 M19 15a2 2 0 1 1-2 4 2 2 0 1 1-4-2',
 beaker:'M9 3h6 M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3 M7 15h10'
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
let storageOK=true, filter='all', setupMode='tutor', quizVisible=false, toastTimer, showAllDays=false;
const freshState=()=>({schema:2,name:'Student',bookmarks:[],attempts:[],history:[],reports:[],readLessons:[],readSections:[],book:{open:null,page:1,tab:'contents',expanded:'nclex',marks:[]},plan:null,session:null,quarantine:[]});
// ---- Saved-data loading, validation and migration ----------------------
// SCHEMA 1: original prototype (no version field). SCHEMA 2: adds `schema`
// and `quarantine`. Records that cannot be read safely are moved into
// `quarantine` instead of being deleted, so they stay in the JSON export.
const SCHEMA=2;
const isObj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const isStr=v=>typeof v==='string';
const isDay=v=>isStr(v)&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(parseDay(v));
const isTime=v=>isStr(v)&&!isNaN(Date.parse(v));
const lessonIds=new Set(lessons.map(l=>l.id));
const validChoice=(q,v)=>Number.isInteger(v)&&v>=0&&v<q.options.length;
function cleanAnswers(ids,answers){
  if(!isObj(answers))return null;
  const out={};
  for(const [id,a] of Object.entries(answers)){
    const q=qOf(id);
    if(!ids.includes(id)||!q||!isObj(a))return null;
    if(a.selected!=null&&!validChoice(q,a.selected)&&a.selected!==-1)return null;
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
  const correct=Object.entries(c.answers).filter(([id,a])=>a.submitted&&a.selected===qOf(id).correct).length;
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
  const qs=sectionQs(s.id),answered=qs.filter(q=>map[q.id]),right=answered.filter(q=>map[q.id].correct),read=state.readSections.includes(s.id);
  return `<div class="section-row"><span class="sec-pages">${pageRange(s)}</span><div><h3>${escape(s.title)}</h3><p>${qs.length} question${qs.length===1?'':'s'}${answered.length?` · <span class="done">${right.length}/${qs.length} correct</span>`:''}${read?' · <span class="done">Read ✓</span>':''}</p></div><div class="sec-actions"><button class="mini" data-action="read-section" data-id="${s.id}" aria-label="Read ${escape(s.title)}, ${pageRange(s)}">Read</button>${qs.length?`<button class="mini solid" data-action="section-quiz" data-id="${s.id}" aria-label="Quiz: ${escape(s.title)}">Quiz</button>`:''}</div></div>`;
}
function chapterBlock(c,map){
  return `<section class="chapter-block" aria-labelledby="ch-${c.id}"><div class="chapter-head">${chapterNum(c)}<div><h2 id="ch-${c.id}">${c.name}</h2><p>${escape(c.subtitle)} · pp. ${c.pages[0]}–${c.pages[1]}</p></div><div class="title-actions">${secondary('Chapter quiz','setup',`data-course="${c.id}"`)}</div></div><div class="chapter-list">${c.sections.map(s=>sectionRow(s,map)).join('')}</div></section>`;
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
  return `<div class="sec-actions" style="margin-bottom:12px;flex-wrap:wrap"><button class="mini" data-action="goto-page" data-page="${book.toc}">Book table of contents · p. ${book.toc}</button></div>${courses.map(c=>{const open=state.book.expanded===c.id;return `<div class="toc-chapter" data-open="${open}"><button data-action="toc-expand" data-id="${c.id}" aria-expanded="${open}">${chapterNum(c)}<span><strong>${c.name}</strong><small>pp. ${c.pages[0]}–${c.pages[1]} · ${c.sections.length} section${c.sections.length===1?'':'s'}</small></span><span class="toc-caret">${icon('chevron')}</span></button>${open?`<div class="toc-sections">${c.sections.map(s=>sectionRow(s,map)).join('')}</div>`:''}</div>`;}).join('')}<div class="sec-actions" style="margin-top:12px;flex-wrap:wrap"><button class="mini" data-action="goto-page" data-page="${book.references[0]}">References · pp. ${book.references[0]}–${book.references[1]}</button><button class="mini" data-action="goto-page" data-page="${book.about}">About the author · p. ${book.about}</button></div>`;
}
function bookResults(q){
  const secs=sections.filter(s=>s.title.toLowerCase().includes(q)),map=latestMap();
  const hits=pageText.map((t,i)=>i+1).filter(p=>pageAllowed(p)&&pageText[p-1].toLowerCase().includes(q));
  return `${secs.length?`<div class="toc-chapter"><div class="toc-sections">${secs.map(s=>sectionRow(s,map)).join('')}</div></div>`:''}<p class="dialog-note" role="status">${hits.length} page${hits.length===1?'':'s'} mention “${escape(q)}”${hits.length>40?' · showing the first 40':''}</p>${hits.slice(0,40).map(p=>{const t=pageText[p-1],i=t.toLowerCase().indexOf(q),snip=t.slice(Math.max(0,i-45),i+q.length+70);const s=sectionAtPage(p);return `<button class="search-item" data-action="goto-page" data-page="${p}"><span class="sec-pages">p. ${p}</span><span><strong>${escape(s?.title||placeLabel(p))}</strong><p>…${escape(snip)}…</p></span></button>`;}).join('')}`;
}
function readerView(){
  const p=state.book.page,s=sectionAtPage(p),c=chapterAtPage(p),marked=state.book.marks.includes(p),qs=s?sectionQs(s.id):[];
  return `<div class="reader-nav"><button class="mini" data-action="page-step" data-step="-1" ${p<=1?'disabled':''} aria-label="Previous page">‹ Prev</button><div class="where" aria-live="polite"><strong>${escape(placeLabel(p))}</strong>Page ${p} of ${book.pages}</div><button class="mini" data-action="page-step" data-step="1" ${p>=book.pages?'disabled':''} aria-label="Next page">Next ›</button></div><div class="page-frame">${pageAllowed(p)?`<img src="${pageImg(p)}" alt="Book page ${p}${s?`, ${escape(s.title)}`:''}" data-action="zoom-page" data-page="${p}">`:`<div class="page-locked"><div><strong>Page ${p} is in the full book</strong>This preview includes the opening pages and the first page of each chapter.</div></div>`}</div><div class="reader-tools"><label class="sr-only" for="page-jump">Go to page</label><input id="page-jump" type="number" inputmode="numeric" min="1" max="${book.pages}" value="${p}"><button class="mini" data-action="jump-page">Go</button><button class="mini" data-action="mark-page" aria-pressed="${marked}">${marked?'★ Bookmarked':'☆ Bookmark page'}</button>${pageAllowed(p)?`<button class="mini" data-action="zoom-page" data-page="${p}">Enlarge</button>`:''}</div>${s?`<div class="reader-section"><small>${escape(c.name)} · ${pageRange(s)}</small><h3>${escape(s.title)}</h3><div class="sec-actions"><button class="mini" data-action="mark-read" data-id="${s.id}" aria-pressed="${state.readSections.includes(s.id)}">${state.readSections.includes(s.id)?'Read ✓':'Mark section read'}</button>${qs.length?`<button class="mini solid" data-action="section-quiz" data-id="${s.id}">Take the quiz (${qs.length})</button>`:''}</div></div>`:''}${state.book.marks.length?`<div class="reader-section"><small>Your bookmarked pages</small><div class="marks">${state.book.marks.slice().sort((a,b)=>a-b).map(m=>`<button class="mini" data-action="goto-page" data-page="${m}">p. ${m}</button>`).join('')}</div></div>`:''}`;
}
function openBook(page,tab='reader'){
  if(page)state.book.page=Math.min(book.pages,Math.max(1,page));
  state.book.open=true;state.book.tab=tab;save();renderBookPanel();
  document.querySelector('#book-panel .bp-body')?.focus({preventScroll:true});
}
function showPageViewer(p){
  const v=document.querySelector('#page-viewer');if(!pageAllowed(p))return;
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
function courseCards(){const map=latestMap();return `<div class="course-grid chapters">${courses.map(c=>{const qs=active.filter(q=>q.course===c.id),done=qs.filter(q=>map[q.id]).length;return `<article class="course-card"><div class="course-body"><div class="course-top">${chapterNum(c)}<span class="course-count">pp. ${c.pages[0]}–${c.pages[1]}</span></div><h3>${c.name}</h3><p>${c.sections.length} section${c.sections.length===1?'':'s'} · ${qs.length} questions</p><div class="course-progress-label"><span>Questions tried</span><span>${done} / ${qs.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${qs.length?done/qs.length*100:0}%;background:${c.color}"></div></div></div><div class="course-bottom"><button data-action="open-chapter" data-id="${c.id}">${icon('book')} Read</button><button data-action="setup" data-course="${c.id}">Practice ${icon('arrow')}</button></div></article>`;}).join('')}</div>`;}
function examCard(){const p=state.plan;if(!p)return `<aside class="exam-card"><div class="exam-top">${icon('calendar')}YOUR NEXT EXAM</div><h3>A goal to work toward.</h3><p>Choose your exam date. We’ll turn your topics into a little daily plan.</p><div class="exam-count"><strong>01</strong><span>plan. One less thing to worry about.</span></div>${secondary('Set up my study plan','edit-plan','','arrow')}</aside>`;const days=dayDistance(new Date(),parseDay(p.date));return `<aside class="exam-card"><div class="exam-top">${icon('calendar')}YOUR NEXT EXAM</div><h3>${escape(p.title)}</h3><p>${readableDate(parseDay(p.date),{weekday:'long',month:'long',day:'numeric'})} · ${courseOf(p.course).name}</p><div class="exam-count"><strong>${Math.max(0,days)}</strong><span>${days<0?'days · exam date has passed':days===0?'days · today’s the day!':'days to make it click'}</span></div>${secondary('View my study plan','plan','','arrow')}</aside>`;}

function activityChart(){const days=Array.from({length:7},(_,i)=>addDays(new Date(),i-6));const counts=days.map(d=>state.attempts.filter(a=>a.day===dayKey(d)).length);const max=Math.max(5,...counts);return `<div class="chart" role="img" aria-label="Questions answered in the past 7 days: ${days.map((d,i)=>`${readableDate(d)}: ${counts[i]}`).join(', ')}">${counts.map((n,i)=>`<div class="bar-col${i===6?' today':''}"><span>${n||''}</span><div class="bar" style="height:${Math.max(3,n/max*95)}px"></div></div>`).join('')}</div><div class="chart-labels">${days.map(d=>`<span>${readableDate(d,{weekday:'short'}).slice(0,1)}</span>`).join('')}</div><p class="chart-empty">${counts.some(Boolean)?`${counts.reduce((a,b)=>a+b,0)} questions practiced this week. Keep showing up.`:'Your first session is the start of something good.'}</p>`;}
function dashboard(){const resume=state.session;const weak=missed();const map=latestMap();const weakSecs=[...new Set(weak.map(id=>qOf(id)?.section).filter(Boolean))].map(sectionOf).filter(Boolean).slice(0,3);const cur=sectionAtPage(state.book.page)||sections[0];return `${heading(`Let’s make it click, ${escape(state.name)}.`,`A little focused practice today. A more confident you tomorrow.`)}${statCards()}<div class="hero-row"><section class="focus-card"><div class="focus-label">${icon('spark')}${resume?'PICK UP WHERE YOU LEFT OFF':'A GOOD PLACE TO START'}</div><h2>${resume?'Your next question<br>is waiting for you.':'Understand the why.<br>Remember the answer.'}</h2><p>${resume?'Your answers are saved. Continue your session and keep your momentum.':'Read a section of the book, then test yourself on it. Every answer links back to the page it came from.'}</p><div class="focus-bottom">${primary(resume?'Resume practice':'Start a quick practice',resume?'resume':'quick','',true)}<span class="focus-meta">${icon('clock')}${resume?`${resume.ids.length} questions · ${resume.mode} mode`:'4 questions · tutor mode'}</span></div><div class="orbital" aria-hidden="true"><div class="orbit"></div><span class="star">✧</span><span class="orbit-dot"></span><span class="orbit-dot second"></span></div></section>${examCard()}</div><div class="section-title"><div><h2>The book, chapter by chapter</h2><p>Each chapter of <cite>Rapid Nursing Review</cite> is a course. Each section has its own quiz.</p></div>${textLink('See all sections','book')}</div>${courseCards()}<div class="bottom-grid"><section class="panel"><div class="section-title"><h2>${weakSecs.length?'Re-read what you missed':'Continue the book'}</h2>${textLink('Open the book','toggle-book')}</div><div class="chapter-list">${(weakSecs.length?weakSecs:[cur]).map(s=>sectionRow(s,map)).join('')}</div>${weak.length?`<div class="spacer">${textLink(`Revisit ${weak.length} missed question${weak.length>1?'s':''}`,'review')}</div>`:''}</section><section class="panel"><div class="section-title"><h2>Your study rhythm</h2><span class="subtle-pill">Last 7 days</span></div>${activityChart()}</section></div>`;}
function filters(){return `<div class="filter-row" role="group" aria-label="Filter by chapter">${[{id:'all',name:'All chapters'},...courses.map(c=>({id:c.id,name:`${/^\d+$/.test(c.num)?c.num+' · ':''}${c.short}`}))].map(c=>`<button class="filter${filter===c.id?' active':''}" data-action="filter" data-filter="${c.id}" aria-pressed="${filter===c.id}">${c.name}</button>`).join('')}</div>`;}
function practicePage(){const visible=courses.filter(c=>filter==='all'||c.id===filter);const map=latestMap();return `${heading('Make every question count.','Every quiz follows a section of the book. Read the pages, then test yourself.',secondary('Custom practice','setup','','edit'))}${state.session?`<div class="notice">You have a saved ${state.session.mode} session. ${textLink('Continue your session','resume')}</div>`:''}<div class="practice-hero"><div><h2>${missed().length?'Your mistakes have something to teach you.':'A few questions. A fresh perspective.'}</h2><p>${missed().length?`${missed().length} missed questions are ready for another look.`:'Start with four questions from different chapters in tutor mode.'}</p></div>${primary(missed().length?'Review missed questions':'Start mixed practice',missed().length?'review':'quick')}</div>${filters()}${visible.map(c=>chapterBlock(c,map)).join('')}`;}
function progressPage(){const s=stats();return `${heading('See how far you’ve come.','Your progress reflects practice on this device.',secondary('Export progress','export','','download'))}${statCards()}<div class="bottom-grid"><div class="panel"><div class="section-title"><h2>Practice by course</h2></div>${courses.map(c=>{const a=state.attempts.filter(x=>qOf(x.qid)?.course===c.id),acc=a.length?Math.round(a.filter(x=>x.correct).length/a.length*100):null;return `<div style="margin:19px 0"><div class="course-progress-label" style="font-size:12px"><span>${c.name}</span><span>${acc===null?'No answers yet':`${acc}% · ${a.length} answers`}</span></div><div class="progress-track" style="height:6px"><div class="progress-fill" style="width:${acc||0}%"></div></div></div>`;}).join('')}<p class="dialog-note">Repeated questions count as practice attempts. These scores do not predict exam readiness or NCLEX outcomes.</p></div><div class="panel"><div class="section-title"><h2>Last 7 days</h2></div>${activityChart()}</div></div><section class="panel spacer"><div class="section-title"><h2>Completed sessions</h2><span class="subtle-pill">${state.history.length} sessions</span></div>${state.history.length?state.history.slice().reverse().map(h=>`<div class="history-row"><span class="course-icon sage">${icon('check')}</span><div><h3>${escape(h.label)}</h3><p>${readableDate(new Date(h.finished),{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})} · ${h.mode==='exam'?'Timed exam':'Tutor mode'} · ${h.count} questions</p></div><span class="history-score">${h.correct} / ${h.count}</span>${textLink('Review','history',`data-id="${h.id}"`)}</div>`).join(''):`<p class="dialog-note">Finish your first session to see it here.</p><div class="spacer">${primary('Start your first practice','quick')}</div>`}</section>${s.total?`<section class="panel spacer"><h2>What’s behind your mistakes?</h2><p class="dialog-note">Self-reflections you selected while reviewing a question.</p><div class="filter-row spacer">${['Knowledge gap','Missed cue','Prioritization','Calculation'].map(m=>`<span class="subtle-pill">${m}: ${state.attempts.filter(a=>a.mistake===m).length}</span>`).join('')}</div>${missed().length?secondary('Review missed questions','review','','refresh'):''}</section>`:''}`;}
function bookmarksPage(){const qs=state.bookmarks.map(qOf).filter(Boolean);return `${heading('Keep the useful ones close.','A personal collection of questions to revisit.')}${qs.length?qs.map(q=>`<article class="bookmark-card"><span class="tag">${courseOf(q.course).name} · ${q.topic}</span><h3>${q.stem}</h3><div class="bookmark-actions">${secondary('Practice question','single',`data-id="${q.id}"`,'practice')}${secondary('Remove bookmark','bookmark',`data-id="${q.id}"`,'bookmark')}</div></article>`).join(''):`<div class="empty-state"><span class="course-icon sage">${icon('bookmark')}</span><h2>Good questions deserve a second look.</h2><p>Bookmark a question during practice. It will be right here when you need it.</p>${primary('Find your first question','practice')}</div>`}`;}
function bookPage(){const visible=courses.filter(c=>filter==='all'||c.id===filter);const map=latestMap();return `${heading('The book, section by section.',`<cite>Rapid Nursing Review: All Body Systems at a Glance</cite> · ${escape(book.author)}`,secondary('Open the reader','toggle-book','','book'))}${filters()}${visible.map(c=>chapterBlock(c,map)).join('')}<p class="dialog-note">${book.pages} pages · ${sections.length} sections · ${active.length} quiz questions. Quiz questions were drafted from the book and are awaiting the author’s review.</p>`;}
function planDays(){const p=state.plan;if(!p)return[];const distance=dayDistance(parseDay(p.created),parseDay(p.date));return Array.from({length:Math.max(1,distance+1)},(_,i)=>{const day=dayKey(addDays(parseDay(p.created),i));const final=i===distance,topic=p.topics[i%p.topics.length];return {day,topic,final};});}
function planPage(){const p=state.plan;if(!p)return `${heading('Give your exam a little structure.','Turn your date, topics, and available time into a daily plan.')}<div class="empty-state"><span class="course-icon sage">${icon('calendar')}</span><h2>A plan that fits your next exam.</h2><p>Choose a course and topics. Tell us your exam date and how much time you have each day.</p>${primary('Build my study plan','edit-plan')}</div>`;const all=planDays();const days=showAllDays?all:all.slice(0,14);return `${heading('A little closer, every day.','Your course exam, broken into manageable steps.',secondary('Edit plan','edit-plan','','edit'))}<div class="plan-summary"><div class="panel"><span class="eyebrow">YOUR NEXT EXAM</span><h2>${escape(p.title)}</h2><p>${readableDate(parseDay(p.date),{weekday:'long',month:'long',day:'numeric',year:'numeric'})} · ${courseOf(p.course).name}</p></div><div class="panel"><span class="eyebrow">TIME YOU’VE SET ASIDE</span><h2>${p.minutes} minutes a day</h2><p>${p.topics.map(escape).join(' · ')}</p></div></div><div class="notice">${p.completed.length} of ${all.length} study days checked off. Repeat practice builds familiarity; use fresh, clinically reviewed questions to assess learning.</div><div class="panel"><div class="section-title"><h2>Your daily plan</h2><span class="subtle-pill">${showAllDays?'All scheduled days':'First 14 days'}</span></div>${days.map(d=>{const complete=p.completed.includes(d.day);return `<div class="plan-day${complete?' day-complete':''}"><button class="check-day${complete?' checked':''}" data-action="check-day" data-day="${d.day}" aria-label="${complete?'Mark incomplete':'Mark complete'}: ${d.day}" aria-pressed="${complete}">${complete?'✓':''}</button><span class="day-date">${readableDate(parseDay(d.day),{month:'short'})}<strong>${parseDay(d.day).getDate()}</strong></span><div><h3>${d.final?'Exam day: a light concept review':escape(d.topic)}</h3><p>${d.final?'Review key clues and make room to rest.':`${Math.round(p.minutes*.4)} min concept review · ${Math.round(p.minutes*.4)} min practice · ${p.minutes-Math.round(p.minutes*.4)*2} min reflection`}</p></div>${secondary(d.final?'The book':'Practice',d.final?'book':'setup',`data-course="${p.course}" data-topic="${d.topic}"`)}</div>`;}).join('')}${all.length>14&&!showAllDays?`<div class="spacer">${secondary(`Show all ${all.length} days`,'all-days')}</div>`:''}</div>`;}
function render(){const page=route();const navs=[['dashboard','Overview','dashboard'],['practice','Practice questions','practice'],['book','The book','book'],['plan','Study plan','calendar'],['progress','My progress','chart'],['bookmarks','Bookmarks','bookmark']];document.querySelector('#nav').innerHTML=navs.map(([id,title,ic])=>`<a class="nav-link${id===page?' active':''}" href="#${id}" ${id===page?'aria-current="page"':''}>${icon(ic)}${title}${id==='bookmarks'&&state.bookmarks.length?`<span class="nav-count">${state.bookmarks.length}</span>`:''}</a>`).join('');document.querySelector('#breadcrumb').textContent=navs.find(n=>n[0]===page)[1];document.querySelector('#profile-name').textContent=state.name;document.querySelector('#profile-initials').textContent=initials(state.name);document.querySelector('#top-initials').textContent=initials(state.name);main.innerHTML=(!storageOK?'<div class="storage-warning">Browser storage is unavailable. Export your progress before closing this page.</div>':'')+(loadNotice?`<div class="storage-warning" role="status">${escape(loadNotice)} <button class="text-link" data-action="dismiss-notice">Dismiss</button></div>`:'')+({dashboard,practice:practicePage,plan:planPage,progress:progressPage,bookmarks:bookmarksPage,book:bookPage}[page])();hydrateIcons();renderBookPanel();}
function modalShell(title,subtitle,body){modal.innerHTML=`<div class="modal-header"><div><h2 id="modal-title">${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</div><button class="icon-button" data-action="close-modal" aria-label="Close dialog">${icon('close')}</button></div><div class="modal-body">${body}</div>`;if(!modal.open)modal.showModal();}
function closeModal(){quizVisible=false;modal.close();render();}
function openSetup(course='all',topic='all'){if(state.session){modalShell('You have a session in progress.','Your answers are saved on this device.',`<p class="about-copy">Continue your ${state.session.mode==='exam'?'timed exam':'tutor session'}, or finish it now before starting a new one.</p><div class="modal-footer">${secondary('Finish current session','finish')}${primary('Resume session','resume')}</div>`);return;}setupMode='tutor';modalShell('Make this practice yours.','A focused session for what you want to understand.',`<form id="practice-form"><div class="form-grid"><label class="field">Chapter<select id="practice-course">${[{id:'all',name:'All chapters'},...courses].map(c=>`<option value="${c.id}" ${course===c.id?'selected':''}>${c.name}</option>`).join('')}</select></label><label class="field">Section<select id="practice-topic"></select></label><div class="field full"><span>How do you want to practice?</span><div class="mode-pick"><button type="button" class="mode-option active" data-action="mode" data-mode="tutor"><strong>${icon('book')}Tutor mode</strong><p>Understand each answer as you go.</p></button><button type="button" class="mode-option" data-action="mode" data-mode="exam"><strong>${icon('clock')}Timed exam</strong><p>See explanations after you finish.</p></button></div></div><label class="field">Questions<select id="practice-count"></select></label><label class="field" id="time-field" style="display:none">Time limit<select id="practice-time"><option value="5">5 minutes</option><option value="10" selected>10 minutes</option><option value="20">20 minutes</option></select></label></div><p class="dialog-note">${active.length} questions organized by the book’s chapters and sections. Drafted from the book and awaiting the author’s review. Progress saves in this browser.</p><div class="modal-footer"><button class="primary" type="submit">Start practice ${icon('arrow')}</button></div></form>`);updateSetupTopics(topic);}
function updateSetupTopics(topic='all'){const course=document.querySelector('#practice-course').value;const topics=course==='all'?courses.flatMap(c=>c.topics):courseOf(course).topics;document.querySelector('#practice-topic').innerHTML=`<option value="all">All sections</option>`+topics.map(t=>`<option value="${t}" ${topic===t?'selected':''}>${t}</option>`).join('');updateSetupCounts();}
function setupQuestions(){const c=document.querySelector('#practice-course').value,t=document.querySelector('#practice-topic').value;return active.filter(q=>(c==='all'||q.course===c)&&(t==='all'||q.topic===t));}
function updateSetupCounts(){const n=setupQuestions().length;const counts=[...new Set([Math.min(4,n),Math.min(8,n),n])];document.querySelector('#practice-count').innerHTML=counts.map(i=>`<option value="${i}">${i} question${i===1?'':'s'}</option>`).join('');}
function startSession(ids,mode='tutor',minutes=10,label='Mixed course practice'){if(state.session){openSetup();return;}state.session={id:crypto.randomUUID(),ids,mode,label,index:0,answers:{},started:new Date().toISOString(),deadline:mode==='exam'?Date.now()+minutes*60000:null};save();showQuiz();}
function selectedQuestion(){return qOf(state.session?.ids[state.session.index]);}
function showQuiz(){const s=state.session;if(!s)return;quizVisible=true;const q=selectedQuestion();const a=s.answers[q.id],submitted=!!a?.submitted;const revealed=submitted&&s.mode==='tutor';modalShell(s.mode==='tutor'?'A little practice. A clearer why.':'Your timed practice exam.',` ${courseOf(q.course).name} · ${q.topic}`,`<div class="quiz-header"><span>QUESTION ${s.index+1} OF ${s.ids.length}</span><span id="timer">${s.mode==='exam'?timerText(s.deadline):'TUTOR MODE · AT YOUR PACE'}</span></div><div class="quiz-progress"><div style="width:${s.index/s.ids.length*100}%"></div></div><p class="question-stem">${q.stem}</p><div class="answer-options">${q.options.map((o,i)=>`<button class="answer${a?.selected===i?' selected':''}${revealed&&i===q.correct?' correct':''}${revealed&&a.selected===i&&i!==q.correct?' incorrect':''}" data-action="select-answer" data-choice="${i}" ${submitted?'disabled':''} aria-pressed="${a?.selected===i}"><span class="answer-letter">${'ABCD'[i]}</span><span>${o}</span>${revealed&&i===q.correct?`<span style="margin-left:auto">${icon('check')}</span>`:''}</button>`).join('')}</div><div class="quiz-toolbar"><button data-action="bookmark" data-id="${q.id}">${icon('bookmark')}${state.bookmarks.includes(q.id)?'Bookmarked':'Bookmark'}</button><button data-action="report" data-id="${q.id}">${icon('flag')}Report question</button><span class="save-label">${storageOK?'✓ Saved on this device':'Storage unavailable'}</span></div>${revealed?rationale(q,a):''}<div class="modal-footer">${secondary(s.mode==='exam'?'Save & leave':'Save & pause','close-modal')}${submitted?primary(s.index===s.ids.length-1?'Finish session':'Next question','next'): `<button class="primary" data-action="submit-answer" ${a?.selected==null?'disabled':''}>${s.mode==='exam'?'Save answer':'Check answer'} ${icon('arrow')}</button>`}</div>`);if(s.mode==='exam'&&Date.now()>=s.deadline)finishSession(true);}
function sourceBlock(q){if(q.source==='book')return `<div class="book-ref"><span>Rapid Nursing Review · p. ${q.page}</span><button class="mini" data-action="show-page" data-page="${q.page}" data-target="pg-${q.id}" aria-expanded="false">View page</button><button class="mini" data-action="open-page" data-page="${q.page}">Open in the book</button></div><div id="pg-${q.id}"></div><p class="dialog-note">Drafted from the book · Awaiting author review</p>`;const s=sectionOf(q.section);return `<a class="source-link" href="${sources[q.source].url}" target="_blank" rel="noopener noreferrer">${sources[q.source].name} ↗</a><p class="dialog-note">Pilot question · Source checked Oct 12, 2026 · Clinical review pending</p>${s?`<div class="book-ref"><span>Related in the book: ${escape(s.title)}, ${pageRange(s)}</span><button class="mini" data-action="open-page" data-page="${s.start}">Open in the book</button></div>`:''}`;}
function rationale(q,a,review=false){return `<section class="rationale"><h3>${a.selected===q.correct?'✓ You connected the clues.':'Let’s connect the missing clue.'}</h3><p><strong>Key clue:</strong> ${q.clue}</p><p><strong>Nursing priority:</strong> ${q.priority}</p><div class="rationale-list">${q.rationales.map((r,i)=>`<div><strong>${'ABCD'[i]}. ${q.options[i]}${i===q.correct?' ✓':''}</strong><br>${r}</div>`).join('')}</div>${sourceBlock(q)}${secondary('Explain it simply','simplify',`data-id="${q.id}"`)}<div id="simple-${q.id}"></div>${a.selected!==q.correct&&!review?`<p class="dialog-note">What made this one tricky? (Your reflection, optional)</p><div class="mistake-picks">${['Knowledge gap','Missed cue','Prioritization','Calculation'].map(m=>`<button data-action="mistake" data-mistake="${m}" class="${a.mistake===m?'active':''}">${m}</button>`).join('')}</div>`:''}</section>`;}
function selectAnswer(choice){const s=state.session,q=selectedQuestion();if(!s||s.answers[q.id]?.submitted)return;s.answers[q.id]={selected:choice,submitted:false};save();showQuiz();}
function submitAnswer(){const s=state.session,q=selectedQuestion(),a=s?.answers[q.id];if(!a||a.selected==null||a.submitted)return;if(s.mode==='exam'&&Date.now()>=s.deadline){finishSession(true);return;}a.submitted=true;state.attempts.push({id:`${s.id}:${q.id}`,session:s.id,qid:q.id,selected:a.selected,correct:a.selected===q.correct,day:dayKey(),at:new Date().toISOString()});save();if(s.mode==='exam')nextQuestion();else showQuiz();}
function nextQuestion(){const s=state.session;if(!s?.answers[s.ids[s.index]]?.submitted)return;if(s.index===s.ids.length-1){finishSession();return;}s.index++;save();showQuiz();}
function timerText(deadline){const n=Math.max(0,Math.ceil((deadline-Date.now())/1000));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')} LEFT`;}
function finishSession(expired=false){const s=state.session;if(!s)return;const correct=Object.entries(s.answers).filter(([id,a])=>a.submitted&&a.selected===qOf(id).correct).length;const h={...s,finished:new Date().toISOString(),correct,count:s.ids.length,expired};state.history.push(h);state.session=null;quizVisible=false;save();render();showResults(h);}
function showResults(h){const notAnswered=h.ids.filter(id=>!h.answers[id]?.submitted).length;modalShell(h.expired?'Time’s up. Let’s learn from it.':'Every question moved you forward.',`${h.label} · ${h.mode==='exam'?'Timed exam':'Tutor mode'}`,`<div class="result-score">${Math.round(h.correct/h.count*100)}<span style="font-size:30px">%</span></div><p class="result-label">${h.correct} of ${h.count} correct${notAnswered?` · ${notAnswered} unanswered (counted as incorrect)`:''}</p>${h.ids.map(id=>{const q=qOf(id),a=h.answers[id];return `<div class="result-item"><span style="color:${a?.submitted&&a.selected===q.correct?'#68864f':'#b18a6b'}">${a?.submitted&&a.selected===q.correct?'✓':'↻'}</span><span>${q.topic}${!a?.submitted?' · Unanswered':''}</span><button data-action="review-answer" data-id="${id}" data-history="${h.id}">See explanation →</button></div>`;}).join('')}<p class="dialog-note">This is a score on sample practice questions, not a validated readiness assessment.</p><div class="modal-footer">${secondary('See my progress','progress')}${primary('Practice again','new-practice')}</div>`);}
function showReview(id,historyId){const h=state.history.find(x=>x.id===historyId),q=qOf(id);if(!q||!h)return;modalShell('Understand the deciding clue.',`${courseOf(q.course).name} · ${q.topic}`,`<p class="question-stem">${q.stem}</p>${rationale(q,h.answers[id]?.submitted?h.answers[id]:{selected:-1},true)}<div class="modal-footer">${secondary('Back to results','history',`data-id="${h.id}"`)}</div>`);}
function showLesson(id){const l=lessons.find(x=>x.id===id);if(!l)return;quizVisible=false;modalShell(l.title,`${courseOf(l.course).name} · ${l.read} read`, `<p class="lesson-content">${l.text}</p><div class="takeaway"><small>MAKE IT STICK</small><p>${l.takeaway}</p></div><a class="source-link" href="${sources[l.source].url}" target="_blank" rel="noopener noreferrer">${sources[l.source].name} ↗</a><p class="dialog-note">Source checked Oct 12, 2026 · Clinical review pending</p><div class="modal-footer">${secondary(state.readLessons.includes(id)?'Marked as read':'Mark as read','read-lesson',`data-id="${id}"`,'check')}${primary('Practice this concept','lesson-practice',`data-id="${id}"`)}</div>`);}
function openPlan(){const p=state.plan;const date=p?.date||dayKey(addDays(new Date(),7));modalShell('A plan for your next exam.','A few details. A manageable path forward.',`<form id="plan-form"><div class="form-grid"><label class="field full">Exam name<input name="title" value="${escape(p?.title||'')}" placeholder="e.g. Pharmacology Exam 1" maxlength="80" required></label><label class="field">Course<select name="course" id="plan-course">${courses.map(c=>`<option value="${c.id}" ${c.id===(p?.course||'resp')?'selected':''}>${c.name}</option>`).join('')}</select></label><label class="field">Exam date<input type="date" name="date" value="${date}" min="${dayKey()}" max="${dayKey(addDays(new Date(),90))}" required></label><label class="field full">Minutes available each day<select name="minutes">${[10,15,20,30,45,60,90,120].map(n=>`<option value="${n}" ${n===(p?.minutes||20)?'selected':''}>${n} minutes</option>`).join('')}</select></label><div class="field full"><span>Topics to focus on</span><div id="plan-topics" class="checkboxes"></div><span class="field-hint">Choose at least one topic from the sample library.</span></div></div><div class="modal-footer"><button type="submit" class="primary">${p?'Save changes':'Build my plan'} ${icon('arrow')}</button></div></form>`);updatePlanTopics(p?.topics);}
function updatePlanTopics(selected){const c=courseOf(document.querySelector('#plan-course').value);document.querySelector('#plan-topics').innerHTML=c.topics.map(t=>`<label class="check-label"><input name="topics" type="checkbox" value="${t}" ${!selected||selected.includes(t)?'checked':''}>${t}</label>`).join('');}
function showSearch(){modalShell('Find your next connection.','Search book sections, pages and practice questions.',`<input id="search-input" type="search" placeholder="Try “warfarin” or “DKA”" aria-label="Search the book and questions" autocomplete="off"><div id="search-results" class="search-results" aria-live="polite"></div>`);searchLibrary('');document.querySelector('#search-input').focus();}
function searchLibrary(term){term=term.toLowerCase().trim();const ss=sections.filter(s=>`${s.title} ${courseOf(s.course).name}`.toLowerCase().includes(term));const pages=term.length>2?pageText.map((t,i)=>i+1).filter(p=>pageAllowed(p)&&pageText[p-1].toLowerCase().includes(term)):[];const qs=term?active.filter(q=>`${q.stem} ${q.topic}`.toLowerCase().includes(term)):[];document.querySelector('#search-results').innerHTML=ss.slice(0,6).map(s=>{const c=courseOf(s.course);return `<button class="search-item" data-action="read-section" data-id="${s.id}">${chapterNum(c)}<span><strong>${escape(s.title)}</strong><p>${c.name} · ${pageRange(s)} · ${sectionQs(s.id).length} questions</p></span></button>`;}).join('')+(pages.length?`<button class="search-item" data-action="book-search" data-q="${escape(term)}"><span class="sec-pages">${pages.length} pp.</span><span><strong>Search inside the book</strong><p>${pages.length} page${pages.length===1?'':'s'} mention “${escape(term)}”</p></span></button>`:'')+qs.slice(0,6).map(q=>`<button class="search-item" data-action="single" data-id="${q.id}">${chapterNum(courseOf(q.course))}<span><strong>${escape(q.topic)}</strong><p>${escape(q.stem)}</p></span></button>`).join('')+(!ss.length&&!qs.length&&!pages.length?'<p class="dialog-note">No matches. Try a body system, a condition or a drug name.</p>':'');}
function showAbout(){modalShell('Learn. Test. Understand.','Rapid Nursing Review, the study app.',`<div style="display:flex;gap:16px;align-items:center;margin-bottom:16px"><img src="pages/cover.webp" alt="Book cover" style="width:72px;border-radius:4px;box-shadow:0 4px 14px #0003"><p class="about-copy" style="margin:0">This app follows <cite>Rapid Nursing Review: All Body Systems at a Glance</cite> by ${escape(book.author)}. Each chapter of the book is a course, and each section has its own reading pages and quiz.</p></div><ul class="about-list"><li>${courses.length} parts: NCLEX must-know content, nine body-system chapters and the fluid & electrolytes bonus.</li><li>${sections.length} sections with ${active.length} questions, each with a rationale for every option and a link to the book page.</li><li>The full book reader with search and page bookmarks, on the right side.</li><li>Saved sessions, bookmarks, question reports and an exam-date plan.</li></ul><div class="notice">The quiz questions were drafted from the book and are awaiting the author’s review. Scores are not a validated readiness assessment.</div><p class="about-copy">Progress is stored only on this device. There is no account sync, payment or live AI tutor yet. Reports stay on this device and can be exported for review.</p><div class="modal-footer">${secondary('Open the book','toggle-book','','book')}${primary('Explore practice','practice')}</div>`);}
function showSettings(){modalShell('Your study space.','A few personal touches and your saved data.',`<form id="profile-form"><label class="field">What should we call you?<input name="name" value="${escape(state.name)}" maxlength="30" required></label><div class="modal-footer"><button type="submit" class="primary">Save name ${icon('check')}</button></div></form><div class="setting-row"><div><strong>Your progress belongs to you.</strong><p>Export answers, sessions, reports, and your plan.</p></div>${secondary('Export','export','','download')}</div><div class="setting-row"><div><strong>Question reports</strong><p>${state.reports.length} saved locally · Not sent to a reviewer</p></div>${secondary('View','reports')}</div><div class="setting-row"><div><strong>Start fresh</strong><p>Reset study data on this device.</p></div><button class="text-link danger" data-action="confirm-reset">Reset data</button></div>`);}
function exportData(){const payload=JSON.stringify({app:'Rapid Nursing Review',exported:new Date().toISOString(),...state},null,2);if(native){native.postMessage(JSON.stringify({type:'export',filename:`rapid-nursing-review-${dayKey()}.json`,data:payload}));return;}const blob=new Blob([payload],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`rapid-nursing-review-${dayKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Your progress export is ready.');}
function openReport(id){const q=qOf(id);if(!q)return;quizVisible=false;modalShell('Help make this question better.','This report will be saved locally for clinical review.',`<p class="about-copy">${q.stem}</p><form id="report-form" data-id="${id}"><label class="field">What needs a closer look?<select name="reason"><option>Answer or rationale concern</option><option>Unclear wording</option><option>Reference concern</option><option>Other feedback</option></select></label><label class="field spacer">Details<textarea name="details" placeholder="Describe the concern so a reviewer can check it." required maxlength="1500"></textarea></label><p class="dialog-note">Reports are not transmitted. Export them from your profile to share with a clinical reviewer.</p><div class="modal-footer">${state.session?secondary('Back to question','resume'):secondary('Cancel','close-modal')}<button type="submit" class="primary">Save report ${icon('flag')}</button></div></form>`);}
function showReports(){modalShell('Your saved question reports.',`${state.reports.length} reports · Stored on this device`,`${state.reports.length?state.reports.slice().reverse().map(r=>`<article class="bookmark-card"><span class="tag">${qOf(r.qid)?.topic||'Question'}</span><h3>${escape(r.reason)}</h3><p class="about-copy">${escape(r.details)}</p><small>${readableDate(new Date(r.created))} · Clinical review pending</small></article>`).join(''):'<p class="about-copy">No reports yet. Use “Report question” during practice to record a concern.</p>'}<div class="modal-footer">${secondary('Export reports & progress','export','','download')}</div>`);}
function quick(){const picks=[],seen=new Set();for(const q of shuffle(active)){if(!seen.has(q.course)){seen.add(q.course);picks.push(q.id);}if(picks.length===4)break;}startSession(picks,'tutor',10,'Quick mixed practice');}
function toggleBookmark(id){if(!qOf(id))return;state.bookmarks=state.bookmarks.includes(id)?state.bookmarks.filter(x=>x!==id):[...state.bookmarks,id];save();if(quizVisible&&state.session)showQuiz();else render();toast(state.bookmarks.includes(id)?'Question saved to your bookmarks.':'Bookmark removed.');}

document.addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(!button)return;const d=button.dataset;switch(d.action){
 case 'practice':case 'plan':case 'progress':case 'lessons':case 'book':closeModal();navigate(d.action==='lessons'?'book':d.action);break;
 case 'toggle-book':if(modal.open)closeModal();if(bookIsOpen()){state.book.open=false;save();renderBookPanel();}else openBook(null,state.book.tab);break;
 case 'close-book':state.book.open=false;save();renderBookPanel();document.querySelector('.book-toggle')?.focus();break;
 case 'book-tab':state.book.tab=d.tab;save();renderBookPanel();break;
 case 'toc-expand':state.book.expanded=state.book.expanded===d.id?'':d.id;save();renderBookPanel();break;
 case 'read-section':{const s=sectionOf(d.id);if(!s)break;if(modal.open)closeModal();state.book.expanded=s.course;openBook(s.start);break;}
 case 'open-chapter':{const c=courseOf(d.id);state.book.expanded=c.id;openBook(c.opener);break;}
 case 'section-quiz':{const s=sectionOf(d.id),ids=sectionQs(d.id).map(q=>q.id);if(!ids.length)break;startSession(ids,'tutor',10,`${s.title} quiz`);break;}
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
 case 'resume':showQuiz();break;
 case 'new-practice':closeModal();openSetup();break;
 case 'finish':finishSession();break;
 case 'filter':filter=d.filter;render();break;
 case 'close-modal':closeModal();break;
 case 'select-answer':selectAnswer(Number(d.choice));break;
 case 'submit-answer':submitAnswer();break;
 case 'next':nextQuestion();break;
 case 'mode':setupMode=d.mode;document.querySelectorAll('.mode-option').forEach(x=>x.classList.toggle('active',x.dataset.mode===setupMode));document.querySelector('#time-field').style.display=setupMode==='exam'?'flex':'none';break;
 case 'bookmark':toggleBookmark(d.id);break;
 case 'review':if(!missed().length){toast('No missed questions to review yet.');break;}startSession(missed(),'tutor',10,'Missed question review');break;
 case 'single':startSession([d.id],'tutor',10,`${qOf(d.id).topic} practice`);break;
 case 'lesson':showLesson(d.id);break;
 case 'read-lesson':if(!state.readLessons.includes(d.id))state.readLessons.push(d.id);save();showLesson(d.id);render();toast('Lesson marked as read.');break;
 case 'lesson-practice':{const l=lessons.find(x=>x.id===d.id);startSession(questions.filter(q=>q.topic===l.topic).map(q=>q.id),'tutor',10,`${l.topic} practice`);break;}
 case 'history':{const h=state.history.find(x=>x.id===d.id);if(h)showResults(h);break;}
 case 'review-answer':showReview(d.id,d.history);break;
 case 'simplify':{const q=qOf(d.id);document.querySelector(`#simple-${q.id}`).innerHTML=`<div class="simple-explanation">Look for: <strong>${q.clue}</strong><br>The answer is <strong>${q.options[q.correct]}</strong> because ${q.rationales[q.correct].charAt(0).toLowerCase()+q.rationales[q.correct].slice(1)}<br><small>A shorter explanation from this question’s rationale.</small></div>`;break;}
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
 case 'dismiss-notice':loadNotice='';render();break;
 case 'reset':state=freshState();loadNotice='';save();closeModal();toast('Your study space is ready for a fresh start.');break;
 }});
document.addEventListener('change',e=>{if(e.target.id==='practice-course')updateSetupTopics();if(e.target.id==='practice-topic')updateSetupCounts();if(e.target.id==='plan-course')updatePlanTopics();});
document.addEventListener('input',e=>{if(e.target.id==='search-input')searchLibrary(e.target.value);if(e.target.id==='book-search'){bookQuery=e.target.value;const q=bookQuery.trim().toLowerCase();document.querySelector('#book-results').innerHTML=q.length>1?bookResults(q):tocList(latestMap());}});
document.addEventListener('keydown',e=>{if(e.target.id==='page-jump'&&e.key==='Enter'){e.preventDefault();document.querySelector('[data-action="jump-page"]').click();return;}const panel=document.querySelector('#book-panel');if(modal.open||document.querySelector('#page-viewer').open)return;if(e.key==='Escape'&&bookIsOpen()&&window.innerWidth<=1280){state.book.open=false;save();renderBookPanel();return;}if(state.book.tab==='reader'&&panel.contains(document.activeElement)&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();openBook(state.book.page+(e.key==='ArrowRight'?1:-1));}});
document.querySelector('#page-viewer').addEventListener('click',e=>{if(e.target.id==='page-viewer')e.target.close();});
document.addEventListener('submit',e=>{if(!['practice-form','plan-form','profile-form','report-form'].includes(e.target.id))return;e.preventDefault();const form=e.target,data=new FormData(form);if(form.id==='practice-form'){const available=setupQuestions(),n=Number(document.querySelector('#practice-count').value);const c=document.querySelector('#practice-course').value,t=document.querySelector('#practice-topic').value;startSession(shuffle(available).slice(0,n).map(q=>q.id),setupMode,Number(document.querySelector('#practice-time').value),t!=='all'?`${t} practice`:c==='all'?'Mixed course practice':`${courseOf(c).name} practice`);}else if(form.id==='plan-form'){const topics=data.getAll('topics');if(!topics.length){toast('Choose at least one topic for your plan.');return;}const title=data.get('title').trim();if(!title){toast('Enter a name for your exam.');return;}const old=state.plan,date=data.get('date');const created=old&&old.created<=date?old.created:dayKey();state.plan={title,course:data.get('course'),date,minutes:Number(data.get('minutes')),topics,created,completed:(old?.completed||[]).filter(d=>d>=created&&d<=date)};save();closeModal();navigate('plan');toast(old?'Your study plan is updated. Checked-off days are kept.':'Your daily study plan is ready.');}else if(form.id==='profile-form'){const name=data.get('name').trim();if(!name){toast('Enter a name.');return;}state.name=name;save();closeModal();toast('Your study space is updated.');}else{state.reports.push({id:crypto.randomUUID(),qid:form.dataset.id,reason:data.get('reason'),details:data.get('details').trim(),created:new Date().toISOString(),status:'pending clinical review'});save();toast('Report saved locally. Export it from your profile.');if(state.session)showQuiz();else closeModal();}});
modal.addEventListener('cancel',()=>{quizVisible=false;render();});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
document.querySelector('#menu').addEventListener('click',()=>{const open=document.querySelector('#sidebar').classList.toggle('open');document.querySelector('#menu').setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!quizVisible)showSearch();}});
window.addEventListener('hashchange',()=>{filter='all';render();window.scrollTo({top:0});document.querySelector('#sidebar').classList.remove('open');document.querySelector('#menu').setAttribute('aria-expanded','false');});
setInterval(()=>{const s=state.session;if(!s||s.mode!=='exam')return;if(Date.now()>=s.deadline){finishSession(true);return;}const t=document.querySelector('#timer');if(t)t.textContent=timerText(s.deadline);},1000);
render();
