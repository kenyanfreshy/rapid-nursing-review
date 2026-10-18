// Web app only: book pages are protected. The app asks for `pages/pNNN.webp`; on the web,
// pageImg() calls window.__rnrWebPageSrc(p) instead, which returns a blank placeholder tagged
// with the page number. This module swaps each placeholder for a <canvas> and draws the page
// fetched one at a time from the `book-page` Edge Function (Pro check + per-account limits,
// no-store), with a watermark naming the account. There is no image file to save or drag,
// and nothing is cached on disk: pages live only in memory for this tab.
export const WebReader = (() => {
  const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  const W = 900, H = 1350;
  const cache = new Map();            // page → Promise<ImageBitmap|HTMLImageElement>
  const MAX_CACHED = 24;

  window.__rnrWebPageSrc = p => `${BLANK}#rnr-page-${Number(p)}`;

  function label() {
    return String(window.__RNR_ACCOUNT_LABEL__ || 'Rapid Nursing Review Pro');
  }
  async function decode(blob) {
    if (window.createImageBitmap) return createImageBitmap(blob);
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
  }
  function load(page) {
    if (!cache.has(page)) {
      const pr = window.__RNR_ACCOUNT__.bookPage(page).then(decode);
      pr.catch(() => cache.delete(page));
      cache.set(page, pr);
      while (cache.size > MAX_CACHED) cache.delete(cache.keys().next().value);
    }
    return cache.get(page);
  }

  function message(ctx, text) {
    ctx.fillStyle = '#f4f5f8'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#5b6478'; ctx.font = '600 30px system-ui, -apple-system, sans-serif'; ctx.textAlign = 'center';
    const words = String(text).split(' '); let line = '', y = H / 2 - 40;
    for (const w of words) {
      if (ctx.measureText(line + w).width > W - 160) { ctx.fillText(line.trim(), W / 2, y); line = ''; y += 42; }
      line += w + ' ';
    }
    ctx.fillText(line.trim(), W / 2, y);
  }
  function watermark(ctx, page) {
    const who = label(), stamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    ctx.save();
    ctx.globalAlpha = 0.07; ctx.fillStyle = '#000';
    ctx.font = '700 30px system-ui, -apple-system, sans-serif'; ctx.textAlign = 'center';
    ctx.translate(W / 2, H / 2); ctx.rotate(-Math.PI / 6);
    for (let y = -H; y <= H; y += 210) for (let x = -W; x <= W; x += 520) ctx.fillText(`${who} · ${stamp}`, x + ((y / 210) % 2 ? 260 : 0), y);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.55; ctx.fillStyle = '#5b6478'; ctx.font = '500 18px system-ui, -apple-system, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(`Licensed to ${who} · Rapid Nursing Review · p. ${page}`, W - 24, H - 18);
    ctx.restore();
  }

  function swap(img) {
    const m = /#rnr-page-(\d+)$/.exec(img.getAttribute('src') || '');
    if (!m) return;
    const page = Number(m[1]);
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    for (const a of img.attributes) if (a.name !== 'src' && a.name !== 'alt' && a.name !== 'loading') c.setAttribute(a.name, a.value);
    c.classList.add('rnr-page');
    c.setAttribute('role', 'img');
    c.setAttribute('aria-label', img.getAttribute('alt') || `Book page ${page}`);
    c.dataset.rnrPage = String(page);
    img.replaceWith(c);
    const ctx = c.getContext('2d');
    message(ctx, `Loading page ${page}…`);
    load(page).then(bmp => {
      if (!c.isConnected) return;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(bmp, 0, 0, W, H);
      watermark(ctx, page);
    }).catch(e => { if (c.isConnected) message(ctx, e?.message || `Couldn't load page ${page}.`); });
  }
  function scan(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.matches?.('img[src*="#rnr-page-"]')) swap(root);
    root.querySelectorAll('img[src*="#rnr-page-"]').forEach(swap);
  }
  function start() {
    scan(document.body);
    new MutationObserver(list => {
      for (const r of list) {
        if (r.type === 'attributes') scan(r.target);
        else r.addedNodes.forEach(scan);
      }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
    // A browser can't block the computer's screenshot keys. As a deterrent, pages blur whenever the
    // window loses focus (screenshot and snipping tools usually take focus) or Print Screen is pressed.
    const hide = on => document.body.classList.toggle('rnr-shield', on);
    window.addEventListener('blur', () => hide(true));
    window.addEventListener('focus', () => hide(false));
    document.addEventListener('visibilitychange', () => hide(document.visibilityState !== 'visible'));
    document.addEventListener('keydown', e => { if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && /^[345]$/.test(e.key))) { hide(true); setTimeout(() => hide(!document.hasFocus()), 1500); } });
    document.addEventListener('keyup', e => { if (e.key === 'PrintScreen') { hide(true); setTimeout(() => hide(!document.hasFocus()), 1500); } });
    // No saving or dragging the book pages.
    for (const ev of ['contextmenu', 'dragstart', 'copy']) {
      document.addEventListener(ev, e => { if (e.target?.closest?.('canvas.rnr-page, .reader, .inline-page, #page-viewer')) e.preventDefault(); });
    }
  }
  return { start };
})();
