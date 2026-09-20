/* app.js — shared page chrome (nav, footer, modal, toast) + renderers. Every renderer guards on its host element, so one script serves every page. */
(function () {
  window.SPS = window.SPS || {};
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  SPS.esc = esc;
  const ic = (name, opts) => (SPS.icon ? SPS.icon(name, opts) : '');
  function renderIcons(root) {
    (root || document).querySelectorAll('i[data-icon]').forEach(el => { const svg = ic(el.dataset.icon, { cls: el.dataset.cls }); if (svg) el.outerHTML = svg; });
  }
  SPS.renderIcons = renderIcons;

  /* ---------- site chrome ---------- */
  const PAGES = [
    ['house.html', 'Your House'], ['project.html', 'The Project'], ['issues.html', 'The Issues'],
    ['calendar.html', 'Meetings'], ['act.html', 'Take Action', 'cta']
  ];
  function currentPage() { const p = location.pathname.split('/').pop(); return p && p.endsWith('.html') ? p : 'index.html'; }
  function renderChrome() {
    const nav = $('#site-nav');
    if (nav) {
      const cur = currentPage();
      nav.innerHTML = `<nav class="nav"><div class="wrap"><a class="brand" href="index.html" aria-label="Stop Project Sunrise — home"><span class="mark">${ic('tree')}</span><span class="wordmark"><span class="line1">STOP <span>PROJECT SUNRISE</span></span><span class="line2">No 4.26M sq ft Amazon warehouse in Holbrook</span></span></a><ul>` +
        PAGES.map(p => `<li><a href="${p[0]}" class="${p[2] || ''}${p[0] === cur ? ' active' : ''}">${ic(SPS.iconFor.page[p[0]])}${p[1]}</a></li>`).join('') + `</ul></div></nav>`;
    }
    const foot = $('#site-footer');
    if (foot) {
      foot.innerHTML = `<footer class="footer"><div class="wrap">
        <p><strong>Stop Project Sunrise</strong> is a volunteer effort by residents of Holbrook, Bohemia, Sayville, Bayport and neighboring Suffolk County communities. Not affiliated with the Town of Islip, Suffolk County, or Amazon. Every fact is cited to a source document; if you find an error, tell us and we will fix it.</p>
        <p><a href="https://www.facebook.com/STOPISLIPOVERBUILDING" target="_blank" rel="noopener">Facebook page</a><a href="https://www.facebook.com/search/groups/?q=Holbrook%20Residents%20Opposing%20the%20Mega%20Warehouse" target="_blank" rel="noopener">Facebook group</a><a href="https://www.change.org/p/stop-amazon-from-building-a-mega-warehouse-in-holbrook-ny" target="_blank" rel="noopener">Petition</a><a href="docs.html">Documents</a><a href="act.html">Take action</a></p>
        <p class="small">Last updated <span id="updated"></span>. Officials' contact details are public information from their offices and the campaign's contact directory; entries marked "verify" were not in the source documents and should be confirmed.</p>
      </div></footer>
      <div class="modal" id="modal"><div class="box"><button class="close" id="modal-close" aria-label="Close">×</button><div id="modal-body"></div></div></div>
      <div class="toast" id="toast"></div>`;
      $('#updated').textContent = document.lastModified ? new Date(document.lastModified).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
      $('#modal-close').addEventListener('click', SPS.closeModal);
      $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') SPS.closeModal(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') SPS.closeModal(); });
    }
  }

  /* ---------- toast + modal ---------- */
  let toastTimer;
  SPS.toast = function (msg) {
    const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  };
  SPS.openModal = function (html) { const b = $('#modal-body'); if (!b) return; b.innerHTML = html; $('#modal').classList.add('open'); };
  SPS.closeModal = function () { const m = $('#modal'); if (m) m.classList.remove('open'); };
  SPS.copy = async function (text) {
    try { await navigator.clipboard.writeText(text); SPS.toast('Copied to clipboard'); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); SPS.toast('Copied'); } catch (e2) { SPS.toast('Copy failed — select the text manually'); }
      ta.remove();
    }
  };

  /* ---------- fact tiles ---------- */
  function tile(f) {
    return `<div class="fact${f.warn ? ' warn' : ''}"><span class="fi">${ic(SPS.factIcon ? SPS.factIcon(f.id || '') : 'warehouse')}</span><div class="v">${esc(f.display)}</div><div class="l">${esc(f.label)}${f.unit ? ' <span class="muted">(' + esc(f.unit) + ')</span>' : ''}</div><div class="s">${esc(f.source)}</div></div>`;
  }
  function renderFacts() {
    const host = $('#fact-tiles'); if (!host || !SPS.facts) return;
    host.innerHTML = Object.entries(SPS.facts).filter(([k, f]) => f.tile).map(([k, f]) => tile(Object.assign({ id: k }, f))).join('');
  }
  function renderQuickFacts() {
    const host = $('#quick-facts'); if (!host || !SPS.facts) return;
    const ids = (host.dataset.ids || '').split(',').map(s => s.trim()).filter(Boolean);
    const list = ids.map(id => SPS.facts[id] && Object.assign({ id }, SPS.facts[id])).filter(Boolean);
    host.innerHTML = (list.length ? list : Object.entries(SPS.facts).filter(([k, f]) => f.tile).slice(0, 6).map(([k, f]) => Object.assign({ id: k }, f))).map(tile).join('');
  }

  /* ---------- timeline ---------- */
  function renderTimeline() {
    const host = $('#timeline'); if (!host || !SPS.timeline) return;
    host.innerHTML = SPS.timeline.map(t => `<li class="${t.future ? 'future' : ''}"><div class="d">${esc(t.date)}</div><div><strong>${esc(t.label)}</strong>${t.detail ? ' — ' + esc(t.detail) : ''}</div></li>`).join('');
  }

  /* ---------- issue cards ---------- */
  function renderIssues() {
    const host = $('#issue-cards'); if (!host || !SPS.issues) return;
    const brief = host.dataset.brief === '1';
    host.innerHTML = SPS.issues.map(i => brief
      ? `<a class="card" href="issues.html#issue-${esc(i.id)}" style="border-top:5px solid ${esc(i.color || 'var(--green)')};text-decoration:none;color:inherit"><span class="icon-tile" style="color:${esc(i.color || 'var(--green)')}">${ic(SPS.iconFor.issue[i.id] || 'alert')}</span><h3>${esc(i.title)}</h3><p class="small">${esc(i.fact)}</p></a>`
      : `<div class="card" id="${esc(i.id)}" style="border-top:5px solid ${esc(i.color || 'var(--green)')}">
        <span class="icon-tile" style="color:${esc(i.color || 'var(--green)')}">${ic(SPS.iconFor.issue[i.id] || 'alert')}</span><h3>${esc(i.title)}</h3>
        <p><strong>${ic('file')} The fact:</strong> ${esc(i.fact)}</p>
        <p><strong>${ic('alert')} Why it matters:</strong> ${esc(i.why)}</p>
        <p style="background:var(--green-light);padding:8px 10px;border-radius:6px"><strong>${ic('mic')} Ask at the hearing:</strong> ${esc(i.question)}</p>
        ${i.link ? `<p><a href="${esc(i.link).replace('#water', 'water.html')}">${esc(i.linkText || 'See the numbers →')}</a></p>` : ''}
        <div class="src">Source: ${(i.sources || []).map(esc).join('; ')}</div></div>`).join('');
  }

  /* ---------- issue slideshow (issues page) ---------- */
  function renderIssueSlides() {
    const host = $('#issue-slides'); if (!host || !SPS.issues) return;
    const list = SPS.issues; let cur = 0;
    const slide = (i, idx) => {
      const p = (SPS.photos || {})[i.photo];
      return `<article class="slide" id="issue-${esc(i.id)}" data-idx="${idx}" aria-hidden="true">
        <div class="slide-media">${p ? `<img src="${esc(p.file)}" alt="${esc(i.photoCaption || p.caption)}" loading="lazy"><div class="slide-cap">${esc(i.photoCaption || p.caption)}<span class="credit">${esc(p.credit)}${p.license && !/campaign|google/i.test(p.license) ? ' · ' + esc(p.license) : ''}</span></div>` : ''}</div>
        <div class="slide-body">
          <div class="slide-kicker"><span class="icon-tile" style="color:${esc(i.color || 'var(--green)')}">${ic(SPS.iconFor.issue[i.id] || 'alert')}</span><span class="n">${idx + 1} / ${list.length}</span></div>
          <h3>${esc(i.title)}</h3>
          <div class="slide-row"><div class="lab">${ic('file')} The fact</div><p>${esc(i.fact)}</p></div>
          <div class="slide-row"><div class="lab">${ic('alert')} Why it matters</div><p>${esc(i.why)}</p></div>
          <div class="slide-row ask"><div class="lab">${ic('mic')} Ask at the hearing</div><p>${esc(i.question)}</p></div>
          ${i.link ? `<p class="slide-link"><a href="${esc(i.link).replace('#water', 'water.html')}">${esc(i.linkText || 'See the numbers ›')}</a></p>` : ''}
          <div class="src">Source: ${(i.sources || []).map(esc).join('; ')}</div>
        </div></article>`;
    };
    const tabsHtml = `<div class="slide-tabs story-tabs" role="tablist">${list.map((i, idx) => `<button role="tab" data-go="${idx}" class="story${idx === 0 ? ' on' : ''}" style="--c:${esc(i.color || 'var(--green)')}" aria-label="${esc(i.title)}"><span class="ring">${ic(SPS.iconFor.issue[i.id] || 'alert')}</span><span class="lbl">${esc(i.short || i.title)}</span></button>`).join('')}</div>`;
    const asSubnav = host.dataset.subnav === '1' && $('#site-nav');
    host.innerHTML = (asSubnav ? '' : tabsHtml) + `<div class="slides">${list.map(slide).join('')}
        <button class="slide-nav prev" aria-label="Previous issue">${ic('chevron')}</button><button class="slide-nav next" aria-label="Next issue">${ic('chevron')}</button></div>
      <div class="slide-dots">${list.map((i, idx) => `<button data-go="${idx}" aria-label="${esc(i.title)}" class="${idx === 0 ? 'on' : ''}"></button>`).join('')}</div>`;
    let subnav = null;
    if (asSubnav) { subnav = document.createElement('div'); subnav.className = 'subnav issues-subnav'; subnav.innerHTML = `<div class="wrap"><div class="subnav-tabs">${tabsHtml}</div></div>`; $('#site-nav').appendChild(subnav); subnav.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) go(Number(g.dataset.go), true); }); renderIcons(subnav); }
    const tabRoot = () => subnav || host;
    const slides = [...host.querySelectorAll('.slide')];
    function go(n, push) {
      cur = (n + list.length) % list.length;
      slides.forEach((s, i) => { s.classList.toggle('on', i === cur); s.setAttribute('aria-hidden', i === cur ? 'false' : 'true'); });
      host.querySelectorAll('[data-go]').forEach(b => b.classList.toggle('on', Number(b.dataset.go) === cur));
      if (subnav) subnav.querySelectorAll('[data-go]').forEach(b => b.classList.toggle('on', Number(b.dataset.go) === cur));
      const tab = tabRoot().querySelector(`.slide-tabs [data-go="${cur}"]`);
      if (push && tab) { const row = tab.parentElement; row.scrollTo({ left: tab.offsetLeft - row.clientWidth / 2 + tab.offsetWidth / 2, behavior: 'smooth' }); }
      if (push) history.replaceState(null, '', '#issue-' + list[cur].id);
    }
    host.addEventListener('click', e => {
      const g = e.target.closest('[data-go]'); if (g) { go(Number(g.dataset.go), true); return; }
      if (e.target.closest('.prev')) go(cur - 1, true); else if (e.target.closest('.next')) go(cur + 1, true);
    });
    document.addEventListener('keydown', e => {
      if (e.target.matches('input, textarea, select')) return;
      if (e.key === 'ArrowLeft') go(cur - 1, true); else if (e.key === 'ArrowRight') go(cur + 1, true);
    });
    let sx = null; const box = host.querySelector('.slides');
    box.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1), true); sx = null; });
    const h = location.hash.slice(1).replace(/^issue-/, ''); const start = list.findIndex(i => i.id === h);
    go(start >= 0 ? start : 0, false);
    renderIcons(host);
  }

  /* ---------- LOS table ---------- */
  function renderLOS() {
    const host = $('#los-table'); if (!host || !SPS.los) return;
    const cell = v => { const g = (v || '?').toString().trim().charAt(0).toUpperCase(); const cls = /[A-F]/.test(g) ? 'los-' + g : ''; return `<td class="${cls}" style="text-align:center">${esc(v || '?')}</td>`; };
    host.innerHTML = `<table class="tbl"><thead><tr><th>Intersection</th><th>2025 AM</th><th>2025 PM</th><th>2030 no‑build AM</th><th>2030 no‑build PM</th><th>2030 build AM</th><th>2030 build PM</th></tr></thead><tbody>` +
      SPS.los.map(r => `<tr><td>${esc(r.intersection)}</td>${cell(r.existingAM)}${cell(r.existingPM)}${cell(r.noBuildAM)}${cell(r.noBuildPM)}${cell(r.buildAM)}${cell(r.buildPM)}</tr>`).join('') + `</tbody></table>`;
  }

  /* ---------- committees ---------- */
  const COMMITTEES = [
    ['Petition & Outreach', 'pen', 'Signature drives, door‑to‑door, neighborhood mapping, volunteer follow‑up.'],
    ['Government, Legal Advocacy & Research', 'scale', 'Track the amended application, PDD/FAR issue, Islip Pines covenants, Town land sale, FOIL requests.'],
    ['Environmental Impact', 'leaf', 'Forest clearing, aquifer, stormwater/drywells, Goldisc monitoring, Parkland sewer capacity; recruit environmental professionals.'],
    ['Traffic Study / Impact', 'truck', 'Audit the 544‑crash dataset, 451/998 peak‑hour projections, LOS F movements, Beacon Drive truck egress.'],
    ['Social Media & Public Advocacy', 'megaphone', 'Fact‑based posts and graphics, consistent language, action alerts, meeting notices.'],
    ['Public Advocacy', 'mic', 'Attendance and speaker rosters for every Town, County and State meeting; document what officials say.'],
  ];
  function renderCommittees() {
    const host = $('#committees'); if (!host) return;
    host.innerHTML = COMMITTEES.map(c => `<div class="card"><span class="icon-tile">${ic(c[1])}</span><h3>${esc(c[0])}</h3><p class="small">${esc(c[2])}</p></div>`).join('');
  }

  /* ---------- photos ---------- */
  // <div class="photo wide" data-photo="key" data-caption="optional override"></div>  → figure with caption + credit
  // <header class="hero has-photo" data-photo-bg="key">                              → background image
  function photoHtml(p, caption) {
    return `<figure><img src="${esc(p.file)}" alt="${esc(caption || p.caption)}" loading="lazy"><span class="zoom" aria-hidden="true">${ic('search')}</span><figcaption>${esc(caption || p.caption)}<span class="credit">${esc(p.credit)}${p.license && !/campaign|google/i.test(p.license) ? ' · ' + esc(p.license) : ''}${p.source ? ' · <a href="' + esc(p.source) + '" target="_blank" rel="noopener">source</a>' : ''}</span></figcaption></figure>`;
  }
  function renderPhotos() {
    SPS.photos = Object.assign({}, SPS.photosLocal || {}, SPS.photos || {});
    document.querySelectorAll('[data-photo]').forEach(el => {
      const p = SPS.photos[el.dataset.photo];
      if (!p) { el.remove(); return; }
      el.innerHTML = photoHtml(p, el.dataset.caption);
    });
    document.querySelectorAll('[data-photo-bg]').forEach(el => {
      const p = SPS.photos[el.dataset.photoBg];
      if (!p) { el.classList.remove('has-photo'); return; }
      const bg = document.createElement('div'); bg.className = 'bg'; bg.style.backgroundImage = `url(${p.file})`; el.prepend(bg);
    });
  }
  SPS.photoHtml = (key, caption) => { const p = (SPS.photos || {})[key]; return p ? `<div class="photo">${photoHtml(p, caption)}</div>` : ''; };

  /* ---------- lightbox: click any .photo img to expand; arrows step through the page's photos ---------- */
  let lbIndex = -1;
  function lbFigures() { return [...document.querySelectorAll('.photo figure')]; }
  function ensureLightbox() {
    if ($('#lightbox')) return;
    const lb = document.createElement('div'); lb.id = 'lightbox'; lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = `<button class="lb-close" aria-label="Close">${ic('x')}</button><button class="lb-prev" aria-label="Previous photo">${ic('chevron')}</button><button class="lb-next" aria-label="Next photo">${ic('chevron')}</button>
      <figure><img alt=""><figcaption></figcaption></figure><div class="lb-count"></div>`;
    document.body.appendChild(lb);
    lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('.lb-close')) closeLightbox(); });
    lb.querySelector('.lb-prev').addEventListener('click', () => showLightbox(lbIndex - 1));
    lb.querySelector('.lb-next').addEventListener('click', () => showLightbox(lbIndex + 1));
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox(); else if (e.key === 'ArrowLeft') showLightbox(lbIndex - 1); else if (e.key === 'ArrowRight') showLightbox(lbIndex + 1);
    });
    let sx = null;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) showLightbox(lbIndex + (dx < 0 ? 1 : -1)); sx = null; });
  }
  function showLightbox(i) {
    const figs = lbFigures(); if (!figs.length) return;
    lbIndex = (i + figs.length) % figs.length;
    const f = figs[lbIndex]; const img = f.querySelector('img'); const cap = f.querySelector('figcaption');
    const lb = $('#lightbox');
    const big = lb.querySelector('img'); big.src = img.src; big.alt = img.alt;
    lb.querySelector('figcaption').innerHTML = cap ? cap.innerHTML : '';
    lb.querySelector('.lb-count').textContent = `${lbIndex + 1} / ${figs.length}`;
    lb.classList.add('open'); document.body.style.overflow = 'hidden';
  }
  function closeLightbox() { const lb = $('#lightbox'); if (lb) lb.classList.remove('open'); document.body.style.overflow = ''; }
  SPS.openLightbox = showLightbox;
  document.addEventListener('click', e => {
    const img = e.target.closest('.photo figure img'); if (!img) return;
    ensureLightbox(); const figs = lbFigures(); showLightbox(figs.indexOf(img.closest('figure')));
  });

  /* ---------- next-up banner (home + nav strip) ---------- */
  function renderNextUp() {
    const hosts = document.querySelectorAll('.next-up'); if (!hosts.length || !SPS.events) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const up = SPS.events.filter(e => e.date && !e.past && new Date(e.date + 'T12:00:00') >= today).sort((a, b) => a.date.localeCompare(b.date));
    const decisive = up.find(e => e.decisive); const next = up[0];
    const fmt = e => `${SPS.fmtDate ? SPS.fmtDate(e.date) : e.date} ${SPS.fmtTime ? SPS.fmtTime(e.time) : e.time} — ${esc(e.title)}, ${esc(e.location)}`;
    const cd = $('#countdown');
    hosts.forEach(host => {
      if (!next) { host.innerHTML = '<strong>Next up:</strong> check the calendar for 2027 dates.'; return; }
      host.innerHTML = `<div><strong>${ic('calendar')} Next meeting:</strong> ${fmt(next)}</div>` +
        (decisive && decisive !== next && !cd ? `<div style="margin-top:6px"><strong>${ic('gavel')} Decisive hearing:</strong> ${fmt(decisive)} <a href="calendar.html">details</a></div>` : '');
    });
    // countdown to the decisive hearing (home hero) + the very next meeting, from the same list and today's date
    if (cd) {
      const target = decisive || next;
      if (!target) { cd.innerHTML = `<span class="k">Next decisive hearing: date to be announced.</span><span class="w"><a href="calendar.html">Watch the calendar</a></span>`; return; }
      const now = new Date();
      const when = new Date(target.date + 'T' + (target.time || '00:00') + ':00');
      const ms = when - now, days = Math.floor(ms / 86400000), hours = Math.floor((ms % 86400000) / 3600000);
      const num = ms <= 0 ? 'Today' : days >= 2 ? String(days) : days === 1 ? String(24 + hours) : String(Math.max(hours, 1));
      const unit = ms <= 0 ? 'is the decisive hearing' : (days >= 2 ? 'days' : 'hours') + ' until the decisive hearing';
      const whenText = `${SPS.fmtDate ? SPS.fmtDate(target.date) : target.date}${target.time ? ', ' + (SPS.fmtTime ? SPS.fmtTime(target.time) : target.time) : ''}`;
      const nextIsOther = next && next !== target;
      const niceTitle = t => t === t.toUpperCase() ? t.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()).replace(/\bOf\b/g, 'of') : t;
      const shortPlace = e => String(e.location || '').split(',')[0];
      const mapLink = e => `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((e.address ? e.address : e.location) || '')}" target="_blank" rel="noopener">${esc(shortPlace(e))}</a>`;
      const row = (label, e, cls) => `<div class="cd-row ${cls || ''}"><span class="lab">${label}</span><span class="txt"><strong>${SPS.fmtDate ? SPS.fmtDate(e.date) : e.date}${e.time ? ', ' + (SPS.fmtTime ? SPS.fmtTime(e.time) : e.time) : ''}</strong> · ${esc(niceTitle(String(e.title).split(' — ')[0]))} · ${mapLink(e)}</span></div>`;
      cd.innerHTML = `<div class="cd-main"><span class="n">${num}</span><span class="k">${unit}</span></div>${row(ic('gavel'), target, 'decisive')}` +
        (nextIsOther ? `<div class="cd-main next"><span class="k">Next up</span></div>` + row(ic('calendar'), next, 'next') : '') +
        `<div class="cd-foot"><a href="calendar.html">All meetings ›</a></div>`;
    }
  }

  /* ---------- fullscreen toggle for maps ---------- */
  SPS.fullscreenButton = function (container, onChange) {
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'map-fs'; btn.setAttribute('aria-label', 'Full screen'); btn.innerHTML = ic('external');
    const wrap = container;
    function isFs() { return document.fullscreenElement === wrap || wrap.classList.contains('fs-fallback'); }
    function update() { btn.innerHTML = isFs() ? ic('x') : ic('external'); btn.setAttribute('aria-label', isFs() ? 'Exit full screen' : 'Full screen'); if (onChange) setTimeout(onChange, 80); }
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      if (isFs()) { if (document.fullscreenElement) document.exitFullscreen(); else { wrap.classList.remove('fs-fallback'); document.body.style.overflow = ''; update(); } return; }
      if (wrap.requestFullscreen) wrap.requestFullscreen().catch(() => { wrap.classList.add('fs-fallback'); document.body.style.overflow = 'hidden'; update(); });
      else { wrap.classList.add('fs-fallback'); document.body.style.overflow = 'hidden'; update(); }
    });
    document.addEventListener('fullscreenchange', update);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && wrap.classList.contains('fs-fallback')) { wrap.classList.remove('fs-fallback'); document.body.style.overflow = ''; update(); } });
    wrap.appendChild(btn);
    return btn;
  };

  /* ---------- town chips (home hero): every hamlet the project reaches, tappable ---------- */
  function renderTownChips() {
    const host = $('#town-chips'); if (!host) return;
    const set = new Map();
    (SPS.hamlets || []).forEach(h => set.set(h.hamlet, 1));
    (SPS.corridors || []).forEach(c => c.hamlets.forEach(n => set.set(n, 1)));
    const first = ['Holbrook', 'Bohemia', 'Sayville', 'Bayport', 'Ronkonkoma', 'Holtsville', 'Blue Point', 'Patchogue', 'Oakdale', 'Lake Ronkonkoma', 'Islip', 'Bay Shore', 'Farmingville', 'Selden', 'Medford', 'Coram'];
    const rest = [...set.keys()].filter(n => !first.includes(n)).sort();
    const list = first.filter(n => set.has(n)).concat(rest);
    const shown = list.slice(0, 16), more = list.length - shown.length;
    host.innerHTML = shown.map(n => `<a class="chip" href="house.html?hamlet=${encodeURIComponent(n)}">${esc(n)}</a>`).join('') + (more > 0 ? `<a class="chip more" href="house.html">+ ${more} more towns ›</a>` : '');
  }

  function fitScrollPadding() { const nav = $('#site-nav'); if (nav) document.documentElement.style.scrollPaddingTop = (nav.offsetHeight + 12) + 'px'; }
  document.addEventListener('DOMContentLoaded', () => {
    renderChrome();
    renderTownChips();
    renderIcons();
    renderPhotos();
    renderFacts(); renderQuickFacts(); renderTimeline(); renderIssues(); renderIssueSlides(); renderLOS(); renderCommittees();
    if (SPS.charts) SPS.charts.init();
    const s3 = $('#site3d'); if (s3 && SPS.site3d) { try { SPS.site3d.init(s3); } catch (e) { console.error(e); } }
    if (SPS.calendar) SPS.calendar.init();
    renderNextUp();
    if (SPS.contact) SPS.contact.init();
    if (SPS.locate) SPS.locate.init();
    const waterHost = $('#water-app');
    if (SPS.water && waterHost) {
      try { SPS.water.init(waterHost); } catch (err) { console.error(err); waterHost.innerHTML = '<p class="muted">Simulation failed to load: ' + esc(err.message) + '</p>'; }
    }
    renderIcons();
    const lbq = new URLSearchParams(location.search).get('lightbox'); if (lbq !== null && /^\d+$/.test(lbq)) { ensureLightbox(); showLightbox(Number(lbq)); }
    // scroll to hash target after dynamic render (sticky nav height varies by page)
    fitScrollPadding(); window.addEventListener('resize', fitScrollPadding);
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(() => { fitScrollPadding(); t.scrollIntoView(); }, 80); }
  });
})();
