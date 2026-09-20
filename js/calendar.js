/* calendar.js — month grid + list view of SPS.events, filters, Google Calendar links, ICS export. */
(function () {
  window.SPS = window.SPS || {};
  const $ = (s) => document.querySelector(s);
  const esc = (s) => SPS.esc ? SPS.esc(s) : String(s);
  const ic = (n) => (SPS.icon ? SPS.icon(n) : '');
  const evIcon = (e) => ic(e.decisive ? 'gavel' : (SPS.iconFor && SPS.iconFor.eventType[e.type]) || 'calendar');
  const TZ = 'America/New_York';

  SPS.fmtDate = function (iso) {
    if (!iso) return 'TBD';
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  SPS.fmtTime = function (t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; const hh = ((h + 11) % 12) + 1;
    return `${hh}:${String(m).padStart(2, '0')} ${ap}`;
  };

  let view = new Date(); view.setDate(1);
  let mode = 'grid';
  let filter = '';

  function events() {
    return (SPS.events || []).filter(e => e.date).sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  }
  function passes(e) {
    if (!filter) return true;
    if (filter === 'speak') return !!e.speak;
    return e.level === filter;
  }
  function levelClass(e) { return e.decisive ? 'decisive' : (e.level === 'county' || e.level === 'state') ? 'county' : e.level === 'campaign' ? 'campaign' : ''; }

  /* ---- Google Calendar + ICS ---- */
  function gcalUrl(e) {
    const start = (e.date + 'T' + (e.time || '09:00') + ':00').replace(/[-:]/g, '');
    const endT = e.endTime || addHours(e.time || '09:00', 2);
    const end = (e.date + 'T' + endT + ':00').replace(/[-:]/g, '');
    const p = new URLSearchParams({ action: 'TEMPLATE', text: e.title, dates: `${start}/${end}`, details: (e.why || '') + (e.verifyUrl ? '\nVerify: ' + e.verifyUrl : ''), location: [e.location, e.address].filter(Boolean).join(', '), ctz: TZ });
    return 'https://calendar.google.com/calendar/render?' + p.toString();
  }
  function addHours(t, n) { const [h, m] = t.split(':').map(Number); return `${String(Math.min(23, h + n)).padStart(2, '0')}:${String(m).padStart(2, '0')}`; }
  function icsEvent(e) {
    const dt = (d, t) => d.replace(/-/g, '') + 'T' + (t || '09:00').replace(':', '') + '00';
    const escI = s => String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    return ['BEGIN:VEVENT', `UID:${e.id}@stopprojectsunrise`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      `DTSTART;TZID=${TZ}:${dt(e.date, e.time)}`, `DTEND;TZID=${TZ}:${dt(e.date, e.endTime || addHours(e.time || '09:00', 2))}`,
      `SUMMARY:${escI(e.title)}`, `LOCATION:${escI([e.location, e.address].filter(Boolean).join(', '))}`, `DESCRIPTION:${escI((e.why || '') + (e.verifyUrl ? ' Verify: ' + e.verifyUrl : ''))}`, 'END:VEVENT'].join('\r\n');
  }
  function icsFile(list) {
    const tz = ['BEGIN:VTIMEZONE', 'TZID:America/New_York', 'BEGIN:STANDARD', 'DTSTART:19701101T020000', 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU', 'TZOFFSETFROM:-0400', 'TZOFFSETTO:-0500', 'END:STANDARD', 'BEGIN:DAYLIGHT', 'DTSTART:19700308T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU', 'TZOFFSETFROM:-0500', 'TZOFFSETTO:-0400', 'END:DAYLIGHT', 'END:VTIMEZONE'].join('\r\n');
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Stop Project Sunrise//EN', 'CALSCALE:GREGORIAN', tz, ...list.map(icsEvent), 'END:VCALENDAR'].join('\r\n');
  }
  function download(name, text) {
    const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---- render ---- */
  function eventActions(e) {
    return `<div class="acts">
      <a class="btn sm" target="_blank" rel="noopener" href="${gcalUrl(e)}">${ic('calendarPlus')} Google Calendar</a>
      <button class="btn sm secondary" data-ics="${esc(e.id)}">${ic('download')} .ics</button>
      ${e.address ? `<a class="btn sm secondary" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.address)}">${ic('pin')} Directions</a>` : ''}
      ${e.script && SPS.contact ? `<button class="btn sm secondary" data-script="${esc(e.script)}">${ic('script')} What to say</button>` : ''}
      ${e.verifyUrl ? `<a class="btn sm ghost" target="_blank" rel="noopener" href="${esc(e.verifyUrl)}">${ic('external')} Verify</a>` : ''}
    </div>`;
  }
  function detailHtml(e) {
    return `<h3>${evIcon(e)} ${esc(e.title)}</h3>
      <p><strong>${SPS.fmtDate(e.date)}${e.time ? ', ' + SPS.fmtTime(e.time) : ''}</strong><br>${esc(e.location)}${e.address ? '<br>' + esc(e.address) : ''}</p>
      <p>${esc(e.why || '')}</p>
      ${e.speak ? '<p class="badge">' + ic('mic') + 'Public comment allowed</p>' : ''} ${e.decisive ? '<p class="badge red">' + ic('gavel') + 'Decisive vote venue</p>' : ''}
      ${eventActions(e)}`;
  }

  function renderGrid() {
    const host = $('#cal-grid'); if (!host) return;
    const y = view.getFullYear(), m = view.getMonth();
    $('#cal-month').textContent = view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const first = new Date(y, m, 1); const startDow = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const todayIso = new Date().toISOString().slice(0, 10);
    const evs = events().filter(passes);
    let html = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="dow">${d}</div>`).join('');
    for (let i = 0; i < startDow; i++) html += '<div class="cal-day other"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const todays = evs.filter(e => e.date === iso);
      html += `<div class="cal-day${iso === todayIso ? ' today' : ''}"><div class="n">${d}</div>` +
        todays.map(e => `<span class="cal-ev ${levelClass(e)}" data-ev="${esc(e.id)}" title="${esc(e.title)}">${evIcon(e)}${e.time ? SPS.fmtTime(e.time).replace(':00', '') + ' ' : ''}${esc(e.title)}</span>`).join('') + '</div>';
    }
    host.innerHTML = html;
  }
  function renderList() {
    const host = $('#cal-list'); if (!host) return;
    const today = new Date().toISOString().slice(0, 10);
    const evs = events().filter(passes).filter(e => e.date >= today || e.past === false);
    const tbd = (SPS.events || []).filter(e => e.tbd);
    host.innerHTML = evs.map(e => `<li class="${e.decisive ? 'decisive' : ''}">
        <div class="when">${SPS.fmtDate(e.date)}<br>${SPS.fmtTime(e.time)}</div>
        <div><div class="title">${evIcon(e)} ${esc(e.title)}</div><div class="meta">${esc(e.body)} · ${esc(e.location)}${e.speak ? ' · <span class="badge">' + ic('mic') + 'speak</span>' : ''}</div><div class="why">${esc(e.why || '')}</div>${eventActions(e)}</div></li>`).join('') +
      tbd.map(e => `<li><div class="when">TBD</div><div><div class="title">${esc(e.title)}</div><div class="meta">${esc(e.body)} · ${esc(e.location || '')}</div><div class="why">${esc(e.why || '')}</div></div></li>`).join('');
  }
  function render() { if (mode === 'grid') renderGrid(); else renderList(); }

  function init() {
    if (!$('#cal-grid')) return;
    // start on the month of the next upcoming event
    const today = new Date().toISOString().slice(0, 10);
    const next = events().find(e => e.date >= today);
    if (next) { view = new Date(next.date + 'T12:00:00'); view.setDate(1); }
    $('#cal-prev').addEventListener('click', () => { view.setMonth(view.getMonth() - 1); render(); });
    $('#cal-next').addEventListener('click', () => { view.setMonth(view.getMonth() + 1); render(); });
    $('#cal-filter').addEventListener('change', e => { filter = e.target.value; render(); });
    $('#cal-view-toggle').addEventListener('click', e => {
      mode = mode === 'grid' ? 'list' : 'grid';
      e.target.textContent = mode === 'grid' ? 'List view' : 'Month view';
      $('#cal-grid').hidden = mode !== 'grid'; $('#cal-list').hidden = mode !== 'list';
      $('#cal-prev').hidden = $('#cal-next').hidden = $('#cal-month').hidden = mode !== 'grid';
      render();
    });
    $('#cal-ics-all').addEventListener('click', () => download('stop-project-sunrise-meetings.ics', icsFile(events().filter(e => !e.past))));
    document.addEventListener('click', e => {
      const ev = e.target.closest('[data-ev]'); if (ev) { const ob = events().find(x => x.id === ev.dataset.ev); if (ob) SPS.openModal(detailHtml(ob)); return; }
      const ics = e.target.closest('[data-ics]'); if (ics) { const ob = events().find(x => x.id === ics.dataset.ics); if (ob) download(ob.id + '.ics', icsFile([ob])); return; }
      const sc = e.target.closest('[data-script]'); if (sc && SPS.contact) { SPS.contact.openScript(sc.dataset.script); }
    });
    render();
  }

  SPS.calendar = { init, icsFile, gcalUrl };
})();
