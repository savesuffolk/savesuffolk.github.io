/* locate.js — "Where do you live?" panel: hamlet → your representatives on this decision + which traffic corridor reaches you. */
(function () {
  window.SPS = window.SPS || {};
  const $ = (s) => document.querySelector(s);
  const esc = (s) => SPS.esc ? SPS.esc(s) : String(s);
  const ic = (n) => (SPS.icon ? SPS.icon(n) : '');
  const LS = 'sps.hamlet';

  function allHamlets() {
    const set = new Map();
    (SPS.hamlets || []).forEach(h => set.set(h.hamlet, h));
    (SPS.corridors || []).forEach(c => c.hamlets.forEach(n => { if (!set.has(n)) set.set(n, { hamlet: n, town: '', county: [], assembly: [], senate: [], confidence: 'none' }); }));
    return [...set.values()].sort((a, b) => a.hamlet.localeCompare(b.hamlet));
  }

  // match a district officeholder to an entry in officials.js so we can reuse the Call/Email/Script buttons
  function findOfficial(name) {
    const last = String(name || '').split(' ').filter(Boolean).pop().toLowerCase().replace(/[^a-z]/g, '');
    for (const g of SPS.officialGroups || []) {
      for (const o of g.officials) {
        const ol = String(o.name).split(' ').filter(Boolean).pop().toLowerCase().replace(/[^a-z]/g, '');
        if (ol === last) return { group: g, official: o };
      }
    }
    return null;
  }

  function repCard(label, list, fallbackNote) {
    if (!list || !list.length) return `<div class="card official"><div class="title">${esc(label)}</div><div class="role muted small">${esc(fallbackNote || 'Not in our table yet — use the lookup links below.')}</div></div>`;
    return list.map(r => {
      const m = findOfficial(r.name);
      const o = m ? m.official : {};
      const phone = o.phone ? `<a class="btn sm" href="tel:${esc(String(o.phone).replace(/[^\d+]/g, ''))}">${ic('phone')} Call</a>` : '';
      const email = o.email ? `<button class="btn sm" data-loc-email="${esc(r.name)}">${ic('mail')} Email</button>` : '';
      const script = m ? `<button class="btn sm secondary" data-loc-script="${esc(r.name)}">${ic('script')} Script</button>` : '';
      return `<div class="card official${o.ally ? ' ok' : ''}">
        <div class="title">${esc(label)} ${r.district ? '· District ' + esc(r.district) : ''}</div>
        <div class="name">${esc(r.name)} ${o.ally ? '<span class="badge">' + ic('award') + 'ally — thank &amp; push</span>' : ''}</div>
        ${o.note ? `<div class="role small">${esc(o.note)}</div>` : ''}
        <div class="contact">${o.phone ? esc(o.phone) : ''}${o.phone && o.email ? ' · ' : ''}${o.email ? esc(o.email) : ''}</div>
        <div class="acts">${phone}${email}${script}</div>
      </div>`;
    }).join('');
  }

  function corridorBlock(h) {
    const name = h.hamlet;
    const cs = (SPS.corridors || []).filter(c => c.hamlets.includes(name));
    const avg = (SPS.trips && SPS.trips.avg.total) || 10815, peak = (SPS.trips && SPS.trips.peak.total) || 14373;
    const tAvg = (SPS.trips && SPS.trips.avg.trucks) || 555, tPeak = (SPS.trips && SPS.trips.peak.trucks) || 809;
    if (!cs.length) return `<div class="card"><h3>${ic('truck')} How the traffic reaches you</h3><p class="small">${esc(name)} is not named in the traffic study's trip‑distribution table, but the study assumes drivers from across Suffolk. The corridors it does name: Nicolls Road, Sunrise Highway (both directions), Veterans Memorial Highway and the LIE service roads.</p><div class="src">${esc(SPS.corridorsSource || '')}</div></div>`;
    return cs.map(c => {
      const share = c.share / 100;
      return `<div class="card">${SPS.photoHtml ? SPS.photoHtml(c.photo, c.corridor) : ''}<h3>${ic('truck')} How the traffic reaches you</h3>
        <p><strong>${esc(c.corridor)}</strong> carries <strong>${c.share}%</strong> of the project's trips per the applicant's own study — about <strong>${Math.round(avg * share).toLocaleString()}</strong> vehicle trips on an average weekday and <strong>${Math.round(peak * share).toLocaleString()}</strong> on a peak day, and the study names ${esc(name)} among the communities they come from.</p>
        ${c.trucks ? `<p><strong>All ${tAvg.toLocaleString()}–${tPeak.toLocaleString()} daily truck trips</strong> are routed via Nicolls Road and NYS Route 454 to the site's gateway driveway, so tractor‑trailers share this corridor too.</p>` : '<p class="small">Trucks are routed via Nicolls Road and Route 454 rather than this corridor, but employee and Amazon Flex delivery traffic uses it around the clock.</p>'}
        <div class="src">${esc(SPS.corridorsSource || '')}</div></div>`;
    }).join('');
  }

  const SOUTH_SHORE = ['Sayville', 'West Sayville', 'Bayport', 'Blue Point', 'Oakdale', 'Great River', 'Islip', 'East Islip', 'Bay Shore', 'Brightwaters', 'Patchogue', 'Bellport', 'Islip Terrace'];
  function waterBlock(h) {
    const ss = SOUTH_SHORE.includes(h.hamlet);
    const near = ['Holbrook', 'Bohemia', 'Ronkonkoma', 'Lake Ronkonkoma', 'Holtsville'].includes(h.hamlet);
    return `<div class="card"><h3>${ic('droplet')} Your water</h3>
      <p class="small">${near ? 'You are on the same Suffolk County Water Authority distribution area as the site (Area #1), and the Church Street and Green Belt Parkway well fields that bracket the property serve this part of the system. ' : ''}${ss ? 'Groundwater under the site flows south toward Sans Souci Lakes, Brown\'s River and the Great South Bay — the same water that feeds your creeks and the bay. ' : ''}Every Suffolk resident drinks from the same Sole Source Aquifer. The filing proposes infiltrating runoff from 84 acres of truck courts and roofs through drywells, with no hydrogeologic study. <a href="water.html">Run the models →</a></p></div>`;
  }

  function render(h) {
    const host = $('#hamlet-result'); if (!host) return;
    if (!h) { host.innerHTML = ''; return; }
    const isIslip = /islip/i.test(h.town || '');
    const townNote = isIslip
      ? `<div class="card flag"><h3>${ic('landmark')} Your Town Board votes on this</h3><p class="small">${esc(h.hamlet)} is in the Town of Islip. The five‑member Town Board decides the zone change and the sale of Town land; the Islip IDA decides the tax break. They are your officials. <a href="#officials">Email all of them →</a></p></div>`
      : `<div class="card"><h3>${ic('landmark')} Town of ${esc(h.town || '—')}</h3><p class="small">Your town board does not vote on this zone change — Islip's does — but your county legislator sits on the body that reviews sewer capacity, county roads and county incentives, and your state legislators can press NYSDOT and NYSDEC. The Islip Town Board also hears from every Suffolk resident who shows up.</p></div>`;
    host.innerHTML = `
      <div class="grid cols-2" style="margin-bottom:14px">${townNote}${waterBlock(h)}</div>
      <div class="grid cols-2" style="margin-bottom:14px">${corridorBlock(h)}</div>
      <h3>${ic('users')} Your representatives on this decision</h3>
      ${h.split ? '<p class="small muted">This hamlet is split between districts; check the lookup links below for your exact address.</p>' : ''}
      ${h.confidence === 'low' ? '<p class="small muted">District assignment for this hamlet is unconfirmed — verify with the lookup links.</p>' : ''}
      <div class="grid cols-3">
        ${repCard('Suffolk County Legislator', h.county)}
        ${repCard('NYS Assembly Member', h.assembly)}
        ${repCard('NYS Senator', h.senate)}
      </div>`;
  }

  function init() {
    const sel = $('#hamlet-select'); if (!sel) return;
    const list = allHamlets();
    sel.innerHTML = '<option value="">Choose your hamlet…</option>' + list.map(h => `<option value="${esc(h.hamlet)}">${esc(h.hamlet)}${h.town ? ' (' + esc(h.town) + ')' : ''}</option>`).join('');
    const lk = SPS.districtLookups || {};
    const lkHost = $('#hamlet-lookups');
    if (lkHost) lkHost.innerHTML = 'Confirm by address: ' + [['county', 'Suffolk County Legislature'], ['assembly', 'NYS Assembly'], ['senate', 'NYS Senate'], ['islipCouncil', 'Islip council districts']].filter(p => lk[p[0]]).map(p => `<a href="${esc(lk[p[0]])}" target="_blank" rel="noopener">${p[1]}</a>`).join(' · ') + (Object.keys(lk).length ? '' : '<a href="https://www.nysenate.gov/find-my-senator" target="_blank" rel="noopener">NYS Senate</a> · <a href="https://nyassembly.gov/mem/search/" target="_blank" rel="noopener">NYS Assembly</a> · <a href="https://www.scnylegislature.us/148/Legislators" target="_blank" rel="noopener">Suffolk Legislature</a>');
    const pick = (name, save) => {
      const h = list.find(x => x.hamlet === name) || null; render(h);
      const note = $('#hamlet-note'); if (note) note.textContent = h && h.note ? h.note : '';
      const yt = $('#you-town'); if (yt && h) { yt.value = h.hamlet; yt.dispatchEvent(new Event('input')); }
      if (save) { try { localStorage.setItem(LS, name); } catch (e) {} }
    };
    sel.addEventListener('change', () => pick(sel.value, true));
    let saved = ''; try { saved = localStorage.getItem(LS) || ''; } catch (e) {}
    const fromUrl = new URLSearchParams(location.search).get('hamlet') || '';
    const initial = [fromUrl, saved].find(n => n && list.some(h => h.hamlet.toLowerCase() === n.toLowerCase()));
    if (initial) { const h = list.find(x => x.hamlet.toLowerCase() === initial.toLowerCase()); sel.value = h.hamlet; pick(h.hamlet, !!fromUrl); }
    document.addEventListener('click', e => {
      const em = e.target.closest('[data-loc-email]'); if (em && SPS.contact && SPS.contact.openEmail) { const m = findOfficial(em.dataset.locEmail); if (m) SPS.contact.openEmail(m.group, m.official); return; }
      const sc = e.target.closest('[data-loc-script]'); if (sc && SPS.contact) { const m = findOfficial(sc.dataset.locScript); if (m) SPS.contact.openScript(m.official.script || m.group.script || 'generic', m.official); }
    });
  }

  SPS.locate = { init, findOfficial, corridorBlock, repCard, waterBlock, allHamlets };
})();
