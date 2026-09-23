/* contact.js — officials directory, mailto/tel builders, templates, testimony builder, call log. */
(function () {
  window.SPS = window.SPS || {};
  const $ = (s) => document.querySelector(s);
  const esc = (s) => SPS.esc ? SPS.esc(s) : String(s);
  const ic = (n) => (SPS.icon ? SPS.icon(n) : '');
  const SUBJECT = 'PROJECT SUNRISE – Proposed Amazon Mega Warehouse, Holbrook (CZ 2026-010)';
  const LS = { name: 'sps.you.name', street: 'sps.you.street', town: 'sps.you.town', log: 'sps.calllog' };

  /* ---- personalization ---- */
  function concernsText() { const L = SPS.concerns ? SPS.concerns.list() : []; if (!L.length) return ''; return 'Specifically, before any vote, I ask for the following in writing:\n' + L.map((x, i) => (i + 1) + '. ' + x.text + ' (' + x.who + ')').join('\n') + '\n\n'; }
  function impact() { try { return localStorage.getItem('sps.impact') || ''; } catch (e) { return ''; } }
  function you() {
    return { name: ($('#you-name') || {}).value || '', street: ($('#you-street') || {}).value || '', town: ($('#you-town') || {}).value || 'Holbrook' };
  }
  function fill(text, official) {
    const y = you();
    return String(text || '')
      .replace(/\{\{name\}\}/g, y.name || '[your name]')
      .replace(/\{\{street\}\}/g, y.street || '[your street]')
      .replace(/\{\{town\}\}/g, y.town || 'Holbrook')
      .replace(/\{\{official\}\}/g, official || '[official]')
      .replace(/\{\{impact\}\}\n?\n?/g, (impact() ? impact() + '\n\n' : ''))
      .replace(/\{\{concerns\}\}\n?\n?/g, concernsText());
  }
  function saveYou() { try { localStorage.setItem(LS.name, $('#you-name').value); localStorage.setItem(LS.street, $('#you-street').value); localStorage.setItem(LS.town, $('#you-town').value); } catch (e) {} }
  function loadYou() { try { $('#you-name').value = localStorage.getItem(LS.name) || ''; $('#you-street').value = localStorage.getItem(LS.street) || ''; $('#you-town').value = localStorage.getItem(LS.town) || 'Holbrook'; } catch (e) {} }

  /* ---- template access ---- */
  const T = () => SPS.templates || { emails: {}, scripts: {}, testimony: [] };
  function emailFor(group, official) {
    const t = T().emails[official.emailTemplate] || T().emails[group.emailTemplate] || T().emails.generic || T().emails.townBoard || { subject: SUBJECT, body: '' };
    return { subject: fill(t.subject || SUBJECT, official.name), body: fill(t.body, official.name) };
  }
  function mailto(addrs, subject, body) {
    return 'mailto:' + addrs.join(',') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }
  function telHref(p) { return 'tel:' + String(p || '').replace(/[^\d+]/g, ''); }

  /* ---- modals ---- */
  function openEmail(group, official) {
    const e = emailFor(group, official);
    const addrs = official.email ? [official.email] : [];
    SPS.openModal(`<h3>Email ${esc(official.name)}</h3><p class="small muted">${esc(official.title || '')}${official.email ? ' · ' + esc(official.email) : ''}</p>
      <p class="small"><strong>Subject:</strong> ${esc(e.subject)}</p>
      <textarea id="m-body">${esc(e.body)}</textarea>
      <div class="acts">
        ${addrs.length ? `<a class="btn" id="m-send" href="#">${ic('mail')} Open in my email app</a>` : '<span class="muted small">No email on file — use the phone.</span>'}
        <button class="btn secondary" id="m-copy">${ic('copy')} Copy text</button>
        ${official.email ? `<button class="btn secondary" id="m-copy-addr">${ic('copy')} Copy address</button>` : ''}
      </div>
      <p class="small muted" style="margin-top:10px">Edit it first. Add one sentence about what this means for your street. Personal letters are weighed more than form letters. If your email app opens with the message cut off, use "Copy text" and paste it in.</p>`);
    const send = $('#m-send'); if (send) send.addEventListener('click', ev => { ev.preventDefault(); window.location.href = mailto(addrs, e.subject, $('#m-body').value); logAuto(official, 'Email'); });
    $('#m-copy').addEventListener('click', () => SPS.copy($('#m-body').value));
    const ca = $('#m-copy-addr'); if (ca) ca.addEventListener('click', () => SPS.copy(official.email));
  }
  function openScript(id, official) {
    const s = T().scripts[id] || T().scripts.generic; if (!s) return;
    const name = official ? official.name : (s.forWhom || '');
    const phone = official && official.phone ? official.phone : s.phone;
    SPS.openModal(`<h3>${ic('script')} ${esc(s.title || 'Phone script')}</h3>${phone ? `<p><a class="btn" href="${telHref(phone)}">${ic('phone')} Call ${esc(phone)}</a></p>` : ''}
      <textarea id="m-body">${esc(fill(s.body, name))}${impact() ? '\n\n' + esc(impact()) : ''}${s.askStaff ? '\n\nASK THE STAFFER: ' + esc(fill(s.askStaff, name)) : ''}${s.followUp ? '\n\nAFTER THE CALL: ' + esc(s.followUp) : ''}</textarea>
      <div class="acts"><button class="btn secondary" id="m-copy">${ic('copy')} Copy script</button></div>
      <p class="small muted" style="margin-top:10px">Say your name and street. Be polite and brief. Ask the staffer to log your position. Then add it to your call log below.</p>`);
    $('#m-copy').addEventListener('click', () => SPS.copy($('#m-body').value));
  }
  function openBulk(group) {
    const addrs = group.officials.map(o => o.email).filter(Boolean);
    const t = T().emails[group.emailTemplate] || T().emails.generic || { subject: SUBJECT, body: '' };
    const body = fill(t.body, 'Supervisor Carpenter and Members of the Town Board');
    SPS.openModal(`<h3>Email the whole ${esc(group.title)}</h3><p class="small muted">${addrs.map(esc).join(', ')}</p>
      <textarea id="m-body">${esc(body)}</textarea>
      <div class="acts"><a class="btn" id="m-send" href="#">${ic('mail')} Open in my email app</a><button class="btn secondary" id="m-copy">${ic('copy')} Copy text</button><button class="btn secondary" id="m-copy-addr">${ic('copy')} Copy all addresses</button></div>`);
    $('#m-send').addEventListener('click', ev => { ev.preventDefault(); window.location.href = mailto(addrs, fill(t.subject || SUBJECT), $('#m-body').value); logAuto({ name: group.title }, 'Email'); });
    $('#m-copy').addEventListener('click', () => SPS.copy($('#m-body').value));
    $('#m-copy-addr').addEventListener('click', () => SPS.copy(addrs.join(', ')));
  }

  /* ---- directory ---- */
  function renderOfficials() {
    const host = $('#officials'); if (!host || !SPS.officialGroups) return;
    host.innerHTML = SPS.officialGroups.map((g, gi) => `
      <div class="group-head"><span class="icon-tile ${g.level === 'town' ? 'red' : g.level === 'county' ? 'blue' : g.level === 'state' ? 'yellow' : ''}" style="margin:0">${ic(SPS.iconFor.level[g.level] || 'landmark')}</span><h3>${gi + 1}. ${esc(g.title)}</h3><span class="badge ${g.level === 'town' ? 'red' : g.level === 'county' ? 'blue' : g.level === 'state' ? 'yellow' : 'gray'}">${esc(g.level)}</span>
        ${g.officials.filter(o => o.email).length > 1 ? `<button class="btn sm yellow" data-bulk="${esc(g.id)}">${ic('mail')} Email all ${g.officials.filter(o => o.email).length}</button>` : ''}
        ${g.script ? `<button class="btn sm secondary" data-gscript="${esc(g.script)}">${ic('script')} Phone script</button>` : ''}</div>
      <details class="ogroup"${gi === 0 ? ' open' : ''}><summary>${gi === 0 ? 'Hide' : 'Show'} the ${g.officials.length} people ${gi === 0 ? '' : '›'}</summary>
      <p class="small"><strong>Why they matter:</strong> ${esc(g.why)} <strong>The ask:</strong> ${esc(g.ask)}</p>
      <div class="grid cols-3">${g.officials.map((o, oi) => `
        <div class="card official${o.ally ? ' ok' : ''}">
          <div class="name">${esc(o.name)} ${o.ally ? '<span class="badge">' + ic('award') + 'ally — thank &amp; push</span>' : ''} ${o.verify ? '<span class="badge gray" title="Not in campaign source docs; confirm before relying on it">' + ic('alert') + 'verify</span>' : ''}</div>
          <div class="title">${esc(o.title || '')}</div>
          ${o.note ? `<div class="role">${esc(o.note)}</div>` : ''}
          <div class="contact">${o.phone ? `<a href="${telHref(o.phone)}">${esc(o.phone)}</a>` : ''}${o.phone && o.email ? ' · ' : ''}${o.email ? `<a href="mailto:${esc(o.email)}">${esc(o.email)}</a>` : ''}${o.address ? `<br><span class="muted">${esc(o.address)}</span>` : ''}</div>
          <div class="acts">
            ${o.phone ? `<a class="btn sm" href="${telHref(o.phone)}">${ic('phone')} Call</a>` : ''}
            ${o.email ? `<button class="btn sm" data-email="${gi}:${oi}">${ic('mail')} Email</button>` : ''}
            <button class="btn sm secondary" data-oscript="${gi}:${oi}">${ic('script')} Script</button>
          </div>
        </div>`).join('')}</div></details>`).join('');
    host.addEventListener('click', e => {
      const b = e.target.closest('[data-bulk]'); if (b) { openBulk(SPS.officialGroups.find(g => g.id === b.dataset.bulk)); return; }
      const gs = e.target.closest('[data-gscript]'); if (gs) { openScript(gs.dataset.gscript); return; }
      const em = e.target.closest('[data-email]'); if (em) { const [gi, oi] = em.dataset.email.split(':').map(Number); openEmail(SPS.officialGroups[gi], SPS.officialGroups[gi].officials[oi]); return; }
      const os = e.target.closest('[data-oscript]'); if (os) { const [gi, oi] = os.dataset.oscript.split(':').map(Number); const g = SPS.officialGroups[gi], o = g.officials[oi]; openScript(o.script || g.script || 'generic', o); return; }
    });
  }

  /* ---- testimony + newsday ---- */
  function renderTestimony() {
    const sel = $('#testimony-topic'); if (!sel) return;
    sel.innerHTML = (T().testimony || []).map(t => `<option value="${esc(t.id)}">${esc(t.topic)} — ${esc(t.hearing)}</option>`).join('');
    $('#testimony-open').addEventListener('click', () => {
      const t = (T().testimony || []).find(x => x.id === sel.value); if (!t) return;
      SPS.openModal(`<h3>${esc(t.topic)}</h3><p class="small muted">Best venue: ${esc(t.hearing)}. ~3 minutes ≈ 350 words. Sign in to speak when you arrive.</p>
        <textarea id="m-body" style="min-height:320px">${esc(fill(t.draft))}${SPS.concerns && SPS.concerns.list().length ? '\n\nBefore any vote, I ask for these in writing:\n' + esc(SPS.concerns.text('say')) : ''}</textarea>
        <div class="acts"><button class="btn secondary" id="m-copy">Copy</button></div>
        <details class="how"><summary>Data behind this draft</summary><p>${esc(t.data || '')}</p><p>${esc(t.hook || '')}</p></details>`);
      $('#m-copy').addEventListener('click', () => SPS.copy($('#m-body').value));
    });
    const fo = $('#foil-open');
    if (fo) fo.addEventListener('click', () => {
      const t = T().emails.foil; if (!t) return;
      SPS.openModal(`<h3>${ic('file')} Records request to the Town of Islip</h3><p class="small muted">${esc(t.note || '')}</p>
        <p class="small"><strong>Subject:</strong> ${esc(t.subject)}</p>
        <textarea id="m-body" style="min-height:320px">${esc(fill(t.body))}</textarea>
        <div class="acts"><a class="btn" id="m-send" href="#">${ic('mail')} Open in my email app</a><button class="btn secondary" id="m-copy">${ic('copy')} Copy</button></div>
        <p class="small muted" style="margin-top:10px">Send it to the Town Clerk / Records Access Officer. If you get no acknowledgement in five business days, say so in writing and cite Public Officers Law Article 6.</p>`);
      if (SPS.renderIcons) SPS.renderIcons($('#modal-body'));
      $('#m-copy').addEventListener('click', () => SPS.copy($('#m-body').value));
      $('#m-send').addEventListener('click', ev => { ev.preventDefault(); window.location.href = mailto([], t.subject, $('#m-body').value); });
    });
    const nd = $('#newsday-open'); if (nd) nd.addEventListener('click', () => {
      const n = T().newsday; if (!n) return;
      SPS.openModal(`<h3>Letter to Newsday</h3><p class="small muted">To: ${esc(n.to)} · Subject: ${esc(n.subject)}</p><textarea id="m-body">${esc(fill(n.body))}</textarea>
        <div class="acts"><a class="btn" href="${mailto([n.to], n.subject, fill(n.body))}">Open in my email app</a><button class="btn secondary" id="m-copy">Copy</button></div>`);
      $('#m-copy').addEventListener('click', () => SPS.copy($('#m-body').value));
    });
  }

  /* ---- call log ---- */
  function getLog() { try { return JSON.parse(localStorage.getItem(LS.log) || '[]'); } catch (e) { return []; } }
  function setLog(l) { try { localStorage.setItem(LS.log, JSON.stringify(l)); } catch (e) {} }
  function logAuto(official, method) { const l = getLog(); l.push({ when: new Date().toISOString().slice(0, 16).replace('T', ' '), official: official.name, method, note: '' }); setLog(l); renderLog(); }
  function renderLog() {
    const t = $('#log-table'); if (!t) return;
    const l = getLog();
    t.innerHTML = '<thead><tr><th>When</th><th>Official</th><th>Method</th><th>Notes</th><th></th></tr></thead><tbody>' +
      (l.length ? l.map((r, i) => `<tr><td>${esc(r.when)}</td><td>${esc(r.official)}</td><td>${esc(r.method)}</td><td>${esc(r.note)}</td><td><button class="btn sm ghost" data-del="${i}">×</button></td></tr>`).join('') : '<tr><td colspan="5" class="muted">No entries yet.</td></tr>') + '</tbody>';
  }
  function initLog() {
    const sel = $('#log-official'); if (!sel) return;
    sel.innerHTML = (SPS.officialGroups || []).flatMap(g => g.officials.map(o => `<option>${esc(o.name)}</option>`)).join('');
    $('#log-add').addEventListener('click', () => { const l = getLog(); l.push({ when: new Date().toISOString().slice(0, 16).replace('T', ' '), official: sel.value, method: $('#log-method').value, note: $('#log-note').value }); setLog(l); $('#log-note').value = ''; renderLog(); });
    $('#log-export').addEventListener('click', () => {
      const y = you();
      const rows = [['when', 'caller', 'street', 'official', 'method', 'note'], ...getLog().map(r => [r.when, y.name, y.street, r.official, r.method, r.note])];
      const csv = rows.map(r => r.map(v => '"' + String(v || '').replace(/"/g, '""') + '"').join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'call-log.csv'; document.body.appendChild(a); a.click(); a.remove();
    });
    $('#log-table').addEventListener('click', e => { const d = e.target.closest('[data-del]'); if (d) { const l = getLog(); l.splice(Number(d.dataset.del), 1); setLog(l); renderLog(); } });
    renderLog();
  }

  function init() {
    if (!$('#officials')) return;
    loadYou();
    ['#you-name', '#you-street', '#you-town'].forEach(s => { const el = $(s); if (el) el.addEventListener('input', saveYou); });
    renderOfficials(); renderTestimony(); initLog();
  }

  SPS.contact = { init, openScript, openEmail, openBulk, fill, mailto, SUBJECT };
})();
