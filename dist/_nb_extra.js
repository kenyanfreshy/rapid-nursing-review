
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
  medsurg: ['Bowen, C., Carey, B., Palozie, J., & Reinholdt, M. M. (2024). <i>Medical-surgical nursing</i>. OpenStax. https://openstax.org/books/medical-surgical-nursing/pages/1-introduction', 'https://openstax.org/books/medical-surgical-nursing/pages/1-introduction'],
  pharm: ['Barbour-Taylor, T., Mueller, L., Paris, D., & Weaver, D. (2024). <i>Pharmacology for nurses</i>. OpenStax. https://openstax.org/books/pharmacology/pages/1-introduction', 'https://openstax.org/books/pharmacology/pages/1-introduction'],
  fund: ['Bowen, C., Draper, L., & Moore, H. (2024). <i>Fundamentals of nursing</i>. OpenStax. https://openstax.org/books/fundamentals-nursing/pages/1-introduction', 'https://openstax.org/books/fundamentals-nursing/pages/1-introduction'],
  psych: ['Puchkors, R., Saunders, J., & Sharp, D. (2024). <i>Psychiatric-mental health nursing</i>. OpenStax. https://openstax.org/books/psychiatric-mental-health/pages/1-introduction', 'https://openstax.org/books/psychiatric-mental-health/pages/1-introduction'],
  mat: ['Giles, A., Prusinski, R., & Wallace, L. (2024). <i>Maternal newborn nursing</i>. OpenStax. https://openstax.org/books/maternal-newborn-nursing/pages/1-introduction', 'https://openstax.org/books/maternal-newborn-nursing/pages/1-introduction'],
  peds: ['Hockenberry, M. J., Duffy, E. A., & Gibbs, K. D. (2024). <i>Wong’s essentials of pediatric nursing</i> (12th ed.). Elsevier.', 'https://shop.elsevier.com/books/wongs-essentials-of-pediatric-nursing/hockenberry/978-0-443-12352-8'],
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
  fxQueue.shift(); if (fxQueue.length) showFx(); else d?.close();
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
  if (first) { celebrate({ eyebrow: 'Welcome, future nurse', title: 'You belong here.', body: `This is your study space. Practice with 2,500 NCLEX questions, read the book page by page, and watch yourself grow. Today’s motivation: ${todaysMotivation()}`, icon: 'heart', colors: ['#ea580c', '#e11d48'], cta: 'Let’s begin', form: `<form id="fx-form" class="fx-form"><label for="fx-name">What should we call you?</label><input id="fx-name" maxlength="30" placeholder="Your first name" autocomplete="given-name"></form>` }); return; }
  const line = st >= 2 ? `You’re on a ${st}-day streak.` : due ? `${due} question${due === 1 ? '' : 's'} are waiting for a second try.` : 'Let’s make today count.';
  celebrate({ eyebrow: 'Welcome back', title: name ? `Welcome back, ${name}!` : 'Welcome back!', body: `${line} ${todaysMotivation()}`, icon: 'sun', colors: ['#f59e0b', '#ea580c'], cta: 'Let’s study' });
}
