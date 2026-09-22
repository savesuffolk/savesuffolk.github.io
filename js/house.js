/* house.js — "Your House": one address → six at-a-glance cards + ranked actions. Reuses the noise and values models,
   the hamlet→district table, the corridor table, events, and the contact templates. Saves the result in localStorage
   (sps.house, sps.impact) so the Take Action templates can open with an address-specific sentence. */
(function () {
  window.SPS = window.SPS || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return SPS.esc ? SPS.esc(s) : String(s == null ? "" : s); };
  var ic = function (n) { return SPS.icon ? SPS.icon(n) : ""; };
  var LS = "sps.house";
  function fmt(n, d) { return isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: d || 0 }) : "—"; }
  function money(n) { return "$" + (Math.round(n / 1000) * 1000).toLocaleString(); }
  function el(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { if (k === "class") e.className = attrs[k]; else if (k === "html") e.innerHTML = attrs[k]; else if (k === "text") e.textContent = attrs[k]; else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); });
    for (var i = 2; i < arguments.length; i++) { var c = arguments[i]; if (c == null) continue; if (Array.isArray(c)) c.forEach(function (x) { if (x != null) e.appendChild(typeof x === "string" ? document.createTextNode(x) : x); }); else e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }
    return e;
  }

  /* ---------- lookups ---------- */
  function hamletByName(name) {
    if (!name) return null; var n = name.trim().toLowerCase();
    var h = (SPS.hamlets || []).filter(function (x) { return x.hamlet.toLowerCase() === n; })[0];
    if (h) return h;
    var c = (SPS.corridors || []).filter(function (cc) { return cc.hamlets.some(function (x) { return x.toLowerCase() === n; }); })[0];
    return c ? { hamlet: name, town: "", county: [], assembly: [], senate: [], confidence: "none" } : null;
  }
  function titleCase(s) { return String(s || "").toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }
  function decisiveHearing() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var up = (SPS.events || []).filter(function (e) { return e.date && new Date(e.date + "T12:00:00") >= today; }).sort(function (a, b) { return a.date.localeCompare(b.date); });
    return up.filter(function (e) { return e.decisive; })[0] || up[0] || null;
  }
  function bandLabel(ft) { return ft <= 820 ? "your yard is next to it" : ft <= 2640 ? "within half a mile" : ft <= 5280 ? "within a mile" : "more than a mile away"; }

  /* ---------- compute ---------- */
  function compute(rec) {
    var out = { ft: rec.ft, hamlet: hamletByName(rec.hamlet), addr: rec.label };
    var trips = (SPS.trips && SPS.trips.avg.trucks) || 555;
    if (rec.ft != null && SPS.noiseModel && SPS.noise) {
      var m = SPS.noiseModel.defaultsFromData(SPS.noise), o = Object.assign({}, SPS.noiseModel.DEFAULT_OPTS, { trips: trips });
      var dockFt = rec.dockFt != null ? rec.dockFt : rec.ft + 240;
      out.night = SPS.noiseModel.nightCount(dockFt, o, m, SPS.noise);
      out.nightWall = SPS.noiseModel.nightCount(dockFt, Object.assign({}, o, { wall: 10 }), m, SPS.noise);
    }
    if (rec.ft != null && SPS.valuesModel && SPS.values) {
      var b = SPS.valuesModel.bandForFt(rec.ft), v = SPS.values.local.zhvi.value;
      out.value = { band: b, lo: v * b.lo, hi: v * b.hi, base: v };
    }
    if (out.hamlet) out.corridors = (SPS.corridors || []).filter(function (c) { return c.hamlets.indexOf(out.hamlet.hamlet) >= 0; });
    out.hearing = decisiveHearing();
    return out;
  }
  function impactSentence(r) {
    var parts = [];
    if (r.ft != null) parts.push("I live about " + (r.ft > 5280 ? fmt(r.ft / 5280, 1) + " miles" : fmt(Math.round(r.ft / 10) * 10) + " feet") + " from the site" + (r.hamlet ? " in " + r.hamlet.hamlet : "") + ".");
    if (r.night && r.night.wake) parts.push("Using published sound levels and WHO sleep thresholds, that is " + fmt(r.night.wake) + " dock events a night loud enough to wake me in my bedroom.");
    else if (r.night && r.night.eeg) parts.push("Using published sound levels and WHO sleep thresholds, " + fmt(r.night.eeg) + " dock events a night would be loud enough in my bedroom to fragment my sleep.");
    if (r.value && r.value.hi) parts.push("Applying the published percentages from the peer-reviewed studies cited on savesuffolk.org (de Vor & de Groot 2011; Robert et al., SSRN 2024) to a typical home at my distance gives " + money(r.value.lo) + " to " + money(r.value.hi) + " off its value.");
    if (r.corridors && r.corridors.length) parts.push("The applicant's traffic study routes " + r.corridors[0].share + "% of the project's trips through my hamlet on " + r.corridors[0].corridor.split(" — ")[0] + ".");
    return parts.join(" ");
  }

  /* ---------- render ---------- */
  var TOPIC = { "noise.html": "sleep", "values.html": "home", "values.html#tax": "home", "issues.html#traffic": "roads", "water.html": "water", "act.html#officials": "say" };
  var SEV = { hot: "Serious", warm: "Likely", ok: "Not much", neutral: "" };
  // Where a number comes from, said plainly on the card itself.
  var PROV = {
    filing: { k: "filing", t: "From the applicant's own filing", h: 'From the applicant\'s own <a href="docs/Full-EAF-2026-07-15.pdf" target="_blank">filing</a>' },
    tis: { k: "filing", t: "From the applicant's traffic study", h: 'From the applicant\'s own <a href="docs/Traffic-Impact-Study-2026-06-30.pdf" target="_blank">traffic study</a>' },
    research: { k: "research", t: "From published studies", h: 'Published percentages applied to your distance — <a href="values.html#research">the nine studies</a>' },
    ourmath: { k: "ourmath", t: "Our arithmetic", h: "Our own arithmetic from the filing's numbers. Not an expert report — check the math" },
    calendar: { k: "record", t: "From the public hearing calendar", h: "From the Town's published hearing calendar" }
  };
  function provHtml(kind, topic) {
    var pv = PROV[kind]; if (!pv) return "";
    return '<div class="hprov"><span class="prov ' + pv.k + '">' + esc(pv.t) + "</span> <span class=\"small muted\">" + pv.h + "</span></div>";
  }
  function impactProv(x) {
    var f = (x.facts || []).filter(function (q) { return q.url; });
    if (!f.length) return "";
    return '<div class="hprov"><span class="prov record">' + f.length + ' linked source' + (f.length === 1 ? "" : "s") + '</span> <span class="small muted">Every fact on this card links to its document</span></div>';
  }
  function card(icon, big, sub, body, link, linkText, cls, prov) {
    var topic = TOPIC[link] || "", sev = cls || "neutral";
    if (current) current.sev[topic] = sev;
    return '<div class="card hcard ' + sev + '" data-topic="' + topic + '" role="button" tabindex="0"><div class="hhead"><span class="ring">' + ic(icon) + '</span>' + (SEV[sev] ? '<span class="sev">' + SEV[sev] + "</span>" : "") + '</div><div class="big">' + big + '</div><div class="sub">' + sub + '</div><p class="small">' + body + '</p>' + (prov ? provHtml(prov, topic) : "") + (link ? '<a class="why" href="#' + topic + '" data-open="' + topic + '">' + esc(linkText || "Why ›") + "</a>" : "") + "</div>";
  }
  var current = null; // last computed report, used to preset the drawer panels
  var TABS = [["overview", "list", "Overview"], ["home", "home", "Home value"], ["water", "droplet", "Water"], ["roads", "truck", "Roads"], ["sleep", "moon", "Sleep"], ["more", "alert", "More"], ["say", "gavel", "Who decides"]];
  function renderTabs(active) {
    var host = $("#drawer-tabs"); if (!host) return;
    var sev = (current && current.sev) || {};
    host.innerHTML = TABS.map(function (t) { var sv = sev[t[0]] || ""; return '<button role="tab" data-open="' + t[0] + '" class="story' + (t[0] === active ? " on" : "") + (sv ? " " + sv : "") + '" aria-selected="' + (t[0] === active) + '"><span class="ring">' + ic(t[1]) + (sv === "hot" || sv === "warm" ? '<i class="dot"></i>' : "") + '</span><span class="lbl">' + esc(t[2]) + "</span></button>"; }).join("");
  }
  function togglePop() { var p = $("#loc-pop"), b = $("#loc-pill"); if (!p) return; var open = p.hidden; p.hidden = !open; if (b) b.setAttribute("aria-expanded", String(open)); if (open) { var d = $("#loc-dist"); if (d && current) d.querySelectorAll("[data-ft]").forEach(function (x) { var ft = +x.dataset.ft; x.classList.toggle("on", current.ft != null && bandLabel(current.ft) === bandLabel(ft)); }); var st = $("#loc-status"); if (st) st.textContent = ""; setTimeout(function () { var i = $("#subnav-input"); if (i && window.innerWidth > 760) i.focus(); }, 30); } }
  function closePop() { var p = $("#loc-pop"), b = $("#loc-pill"); if (p) p.hidden = true; if (b) b.setAttribute("aria-expanded", "false"); }
  function scrollToContent() {
    var nav = $("#site-nav"); var off = nav ? nav.offsetHeight : 0;
    var target = $("#house-view").hidden ? $("#house-report-sec") : $("#house-view");
    if (!target) return; var y = target.getBoundingClientRect().top + window.pageYOffset - off - 8;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }
  function openDrawer(topic, anchor) {
    if (topic === "overview") { closeDrawer(); return; }
    var panel = $("#panel-" + topic), view = $("#house-view"), body = $("#drawer-body"); if (!panel || !view) return;
    var prev = body.firstElementChild; if (prev && prev !== panel) $("#house-panels").appendChild(prev);
    body.appendChild(panel);
    $("#drawer-title").textContent = panel.dataset.title;
    $("#drawer-full").href = panel.dataset.full;
    renderTabs(topic); if (SPS.renderIcons) SPS.renderIcons($("#drawer-tabs"));
    $("#house-intro").hidden = true; $("#house-report-sec").hidden = true; view.hidden = false;
    presetPanel(topic);
    history.replaceState(null, "", "#" + topic);
    setTimeout(function () { window.dispatchEvent(new Event("resize")); if (anchor) { var t = document.getElementById("more-" + anchor); if (t) { var nav = $("#site-nav"); window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - (nav ? nav.offsetHeight : 0) - 10, behavior: "smooth" }); return; } } scrollToContent(); }, 20);
  }
  function closeDrawer() {
    var body = $("#drawer-body"), prev = body && body.firstElementChild; if (prev) $("#house-panels").appendChild(prev);
    var v = $("#house-view"); if (v) v.hidden = true; var rs = $("#house-report-sec"); var has = rs && rs.dataset.has === "1"; if (rs) rs.hidden = !has; var i = $("#house-intro"); if (i) i.hidden = has;
    renderTabs("overview"); if (SPS.renderIcons) SPS.renderIcons($("#drawer-tabs"));
    history.replaceState(null, "", location.pathname + location.search);
    setTimeout(scrollToContent, 20);
  }
  function presetPanel(topic) {
    var r = current; if (!r) return;
    if (topic === "sleep") { if (SPS.noiseUI && SPS.noiseUI.setDistance && r.dockFt != null) SPS.noiseUI.setDistance(r.dockFt, r.addr); if (SPS.voicesUI) SPS.voicesUI.setTopic("night"); }
    if (topic === "home") { if (SPS.valuesUI && SPS.valuesUI.setDistance && r.ft != null) SPS.valuesUI.setDistance(r.ft, r.addr); }
    if (topic === "roads") { if (SPS.roadsUI) { if (SPS.roadsUI.setHamlet) SPS.roadsUI.setHamlet(r.hamlet ? r.hamlet.hamlet : ""); SPS.roadsUI.refresh(); } }
    if (topic === "water") { var w = $("#house-water-note"); if (w) w.innerHTML = r.hamlet && SPS.locate ? SPS.locate.waterBlock(r.hamlet) : ""; if (SPS.renderIcons) SPS.renderIcons(w); if (SPS.waterMap) { if (r.lat && r.lon) SPS.waterMap.setAddress([r.lat, r.lon]); SPS.waterMap.refresh(); } }
    if (topic === "home") { var t = $("#house-taxes"); if (t && SPS.values) { t.innerHTML = (r.value && r.value.hi ? '<p class="tax-line"><strong>Your taxes go up either way.</strong> School and town budgets are fixed amounts spread across everyone\'s assessed value. When the homes nearest the site win lower assessments — ' + money(r.value.lo) + " to " + money(r.value.hi) + ' off yours is roughly ' + money(r.value.lo * 0.0668) + " to " + money(r.value.hi * 0.0668) + ' off the assessed value on a grievance form — the same dollars land on everyone else in Sachem and Connetquot.</p>' : '<p class="tax-line"><strong>Your taxes go up either way.</strong> School and town budgets are fixed amounts spread across everyone\'s assessed value. When the homes nearest the site win lower assessments, the same dollars land on everyone else in Sachem and Connetquot, a mile away and more.</p>'); } }
    if (topic === "more") {
      var mh = $("#more-rows"); if (mh && SPS.impacts) {
        mh.innerHTML = SPS.impacts.map(function (x) {
          return '<section class="more-sec ' + x.sev + '" id="more-' + esc(x.id) + '"><div class="more-head"><span class="ring">' + ic(x.icon) + '</span><div><div class="kick">' + (SEV[x.sev] ? '<span class="sev">' + SEV[x.sev] + "</span>" : "") + '</div><h3>' + esc(x.title) + '</h3></div></div><p class="more-line">' + esc(x.line) + '</p><div class="rows">' +
            x.facts.map(function (f) { return '<div class="row two"><div class="what">' + esc(f.text) + '</div><div class="src small">' + (SPS.srcHtml ? SPS.srcHtml(f.source, { url: f.url }) : esc(f.source)) + " " + (SPS.statusBadge ? SPS.statusBadge(f.status) : "") + "</div></div>"; }).join("") +
            '</div>' + (SPS.asks && SPS.asks.topics[x.id] ? '<div data-asks="' + esc(x.id) + '" data-rail="0" style="margin-top:12px"></div>' : "") + "</section>";
        }).join("");
        if (SPS.renderIcons) SPS.renderIcons(mh);
      }
    }
    if (topic === "say") {
      var reps = $("#house-reps"), he = $("#house-hearings");
      if (reps) reps.innerHTML = r.hamlet && SPS.locate ? SPS.locate.repCard("Suffolk County Legislator", r.hamlet.county) + SPS.locate.repCard("NYS Assembly Member", r.hamlet.assembly) + SPS.locate.repCard("NYS Senator", r.hamlet.senate) : '<p class="muted">Pick your hamlet above to see your representatives.</p>';
      if (he) { var today = new Date(); today.setHours(0, 0, 0, 0); var up = (SPS.events || []).filter(function (e) { return e.date && new Date(e.date + "T12:00:00") >= today; }).sort(function (a, b) { return a.date.localeCompare(b.date); }).slice(0, 4);
        he.innerHTML = '<h3>' + ic("gavel") + ' The next decisions</h3><ul class="ev-list">' + up.map(function (e) { return '<li class="' + (e.decisive ? "decisive" : "") + '"><div class="when">' + (SPS.fmtDate ? SPS.fmtDate(e.date) : e.date) + (e.time ? "<br>" + (SPS.fmtTime ? SPS.fmtTime(e.time) : e.time) : "") + '</div><div><div class="title">' + esc(e.title) + '</div><div class="meta">' + esc(e.location || "") + "</div>" + (e.why ? '<div class="why">' + esc(e.why) + "</div>" : "") + "</div></li>"; }).join("") + '</ul><p class="small"><a href="calendar.html">Full calendar, with .ics downloads ›</a></p>'; }
      if (SPS.renderIcons) { SPS.renderIcons(reps); SPS.renderIcons(he); }
      try { var st = $("#you-street"), tw = $("#you-town"); if (st && !st.value && r.addr) st.value = r.addr.split(",")[0]; if (tw && r.hamlet) tw.value = r.hamlet.hamlet; } catch (e) { }
    }
  }
  function render(rec) {
    var host = $("#house-report"); if (!host) return;
    var r = compute(rec), cards = []; current = r; r.lat = rec.lat; r.lon = rec.lon; var slot = {}; current.sev = {}; current.dockFt = rec.dockFt != null ? rec.dockFt : (rec.ft != null ? rec.ft + 240 : null);
    var hf = r.hamlet && SPS.hamletFacts && SPS.hamletFacts[r.hamlet.hamlet];
    var who = hf ? '<p class="small muted whoLine">In ' + esc(r.hamlet.hamlet) + ', about one home in three has kids and about one neighbor in five is over 65 — the people who hear night noise most. <span class="muted">(' + esc(SPS.hamletFacts.source) + ')</span></p>' : "";
    var where = (r.addr ? "<strong>" + esc(r.addr) + "</strong>" : (r.hamlet ? "<strong>" + esc(r.hamlet.hamlet) + "</strong>" : "")) + (rec.approx ? " — a home " + bandLabel(r.ft) : "") + (r.ft != null && !rec.approx ? " — about " + (r.ft > 5280 ? fmt(r.ft / 5280, 1) + " miles" : fmt(Math.round(r.ft / 10) * 10) + " ft") + " from the property line, " + bandLabel(r.ft) : "") + (r.hamlet && r.hamlet.town ? " · Town of " + esc(r.hamlet.town) : "");
    if (hf && hf.kids < 30) who = who.replace("about one home in three has kids", "about three homes in ten have kids");

    // sleep
    if (r.night) {
      var n = r.night, nw = r.nightWall;
      cards.push(n.wake ? card("moon", fmt(n.wake) + " wake-ups a night", "every night, from the loading docks", "Between 11 PM and 6 AM, " + fmt(n.trucks) + " trucks arrive or leave, each with an air brake and a back-up alarm. With only the trees in the plan, " + fmt(n.wake) + " of those are loud enough in your bedroom to wake you" + (nw.wake < n.wake ? "; a real sound wall would cut that to " + fmt(nw.wake) : "") + ".", "noise.html", "How we count ›", "hot", "ourmath")
        : n.eeg ? card("moon", fmt(n.eeg) + " times a night", "your sleep gets broken", "Nothing reaches the full wake-up line at your distance, but " + fmt(n.eeg) + " dock events a night are loud enough to break your sleep.", "noise.html", "How we count ›", "warm", "ourmath")
        : card("moon", "Quiet nights", "the docks are too far to wake you", "No dock event reaches the sleep-disturbance line in your bedroom at this distance.", "noise.html", "How we count ›", "ok", "ourmath"));
    } else cards.push(card("moon", "Type your address", "to count your nights", "The count depends on feet from the docks.", "noise.html", "The noise page ›", "neutral", "ourmath"));
    // home
    if (r.value) {
      var v = r.value;
      cards.push(v.hi ? card("home", money(v.lo) + " to " + money(v.hi), "gone from your home's value", esc(v.band.why.split(". ")[0].replace(/\.$/, "")) + ". And when the nearest homes win lower assessments, the school and town bill shifts to you.", "values.html", "See the studies ›", "hot", "research")
        : card("home", "Your price holds", "but your taxes don't", esc(v.band.why) + " School and town budgets are fixed; when the nearest homes win lower assessments, the bill shifts to you.", "values.html", "Why ›", "warm", "research"));
    } else cards.push(card("home", "Type your address", "to see the price effect", "Price effects depend on distance: 15% next door, 6–10% within half a mile.", "values.html", "See the studies ›", "neutral", "research"));
    // roads
    if (r.corridors && r.corridors.length) {
      var c = r.corridors[0], total = (SPS.trips && SPS.trips.avg.total) || 10815;
      cards.push(card("truck", c.share + "% of the traffic", "lands on " + esc(c.corridor.split(" — ")[0].replace(/ \(.*\)/, "")) + " through " + esc(r.hamlet.hamlet), "About " + fmt(total * c.share / 100) + " vehicle trips a day" + (c.trucks ? ", and every one of the 555–809 daily truck trips — each costing the public about ten times what a car does per mile." : ", by the applicant's own study."), "issues.html#traffic", "The traffic study ›", c.trucks ? "hot" : "warm", "tis"));
    } else cards.push(card("truck", "10,815 trips a day", "on Nicolls Road, Sunrise Highway and Veterans Highway", (r.hamlet ? esc(r.hamlet.hamlet) + " is not named in the traffic study's trip table, but every road into the site already fails at rush hour." : "Pick your hamlet to see which road carries the project's traffic past you."), "issues.html#traffic", "The traffic study ›", "warm", "tis"));
    // water
    var hn = r.hamlet ? r.hamlet.hamlet : "";
    var near = ["Holbrook", "Bohemia", "Ronkonkoma", "Lake Ronkonkoma", "Holtsville"].indexOf(hn) >= 0, ss = ["Sayville", "West Sayville", "Bayport", "Blue Point", "Oakdale", "Great River", "Islip", "East Islip", "Bay Shore", "Brightwaters", "Patchogue", "Bellport", "Islip Terrace"].indexOf(hn) >= 0;
    cards.push(card("droplet", "Sodium at 8× the limit", near ? "in 96 million gallons a year, into your own well fields" : ss ? "in 96 million gallons a year, flowing toward your shore" : "in 96 million gallons a year, into the aquifer you drink", (near ? "Your tap draws from the well fields that bracket the site. " : ss ? "Groundwater under the site flows south to your shore and surfaces at Sans Souci Lakes. " : "Every tap in Suffolk draws from the one aquifer under the site. ") + "Runoff from 84 acres of roof and truck court would go into the ground 19 feet above it, and no water study has been filed.", "water.html", "The water models ›", near ? "hot" : ss ? "warm" : "warm", "ourmath"));
    // your say
    var reps = [];
    if (r.hamlet) { ["county", "assembly", "senate"].forEach(function (k) { var list = r.hamlet[k] || []; if (list[0]) reps.push([{ county: "County Legislator", assembly: "Assembly Member", senate: "State Senator" }[k], list[0].name]); }); }
    var hr = r.hearing;
    cards.push(card("gavel", hr ? (SPS.fmtDate ? SPS.fmtDate(hr.date) : hr.date) : "Two hearings", hr ? "one vote decides it: the " + esc(hr.title.split(" — ")[0].toLowerCase()) : "decide it", (hr ? esc(hr.location) + ". " : "") + (reps.length ? "Yours: " + reps.map(function (p) { return p[0].replace("Suffolk ", "") + " <strong>" + esc(p[1]) + "</strong>"; }).join(", ") + ". " : "") + (r.hamlet && /islip/i.test(r.hamlet.town || "") ? "Your Town Board casts the vote." : "Islip's Town Board casts the vote."), "act.html#officials", "Their phones and emails ›", "hot", "calendar"));

    // actions ranked by distance
    var ft = r.ft, tier = ft == null ? 2 : ft <= 2640 ? 0 : ft <= 5280 ? 1 : 2;
    var actions = [
      { t: "Speak at the hearing", d: "Three minutes, your address, your numbers. The record matters for any lawsuit later.", act: "say", btn: "Build my statement", rank: [1, 2, 3] },
      { t: "Email the Town Board", d: "One click emails all five members. Your address and the numbers above go in the first paragraph.", act: "email", btn: "Open the email", rank: [2, 1, 1] },
      { t: "Call your county legislator", d: reps.length ? "Ask for " + reps[0][1] + "'s office. Script provided; two minutes." : "Script provided; two minutes.", act: "call", btn: "Get the script", rank: [3, 2, 2] },
      { t: "Share it on Facebook", d: "Most of Holbrook will hear about this from a neighbor's post. Share this page.", href: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(location.origin + location.pathname.replace(/[^/]*$/, "") + "house.html"), ext: true, btn: "Share on Facebook", rank: [4, 3, 1] },
      { t: "Sign the petition", d: "Two minutes. The count gets read into the record.", href: "https://www.change.org/p/stop-amazon-from-building-a-mega-warehouse-in-holbrook-ny", ext: true, btn: "Petition", rank: [5, 4, 3] },
      { t: "Join the group", d: "Holbrook Residents Opposing the Mega Warehouse, on Facebook. Meetings, rides to Town Hall, lawn signs.", href: "https://www.facebook.com/search/groups/?q=Holbrook%20Residents%20Opposing%20the%20Mega%20Warehouse", ext: true, btn: "Facebook group", rank: [6, 5, 4] }
    ].sort(function (a, b) { return a.rank[tier] - b.rank[tier]; });

    var ems = (SPS.impacts || []).filter(function (x) { return x.id === "ems"; })[0];
    if (ems) { cards.push('<div class="card hcard ' + ems.sev + '" data-topic="more" data-anchor="ems" role="button" tabindex="0"><div class="hhead"><span class="ring">' + ic(ems.icon) + '</span><span class="sev">' + SEV[ems.sev] + '</span></div><div class="big">' + esc(ems.big) + '</div><div class="sub">' + esc(ems.sub) + '</div><p class="small">' + esc(ems.line) + '</p>' + impactProv(ems) + '<a class="why" href="#more" data-open="more" data-anchor="ems">Why ›</a></div>'); current.sev.more = "hot"; }
    var ORDER = ["home", "water", "roads", "sleep", "more", "say"];
    cards.sort(function (a, b) { var ta = (a.match(/data-topic="([a-z]+)"/) || [])[1], tb = (b.match(/data-topic="([a-z]+)"/) || [])[1]; return ORDER.indexOf(ta) - ORDER.indexOf(tb); });
    var moreCards = (SPS.impacts || []).filter(function (x) { return x.card && x.id !== "ems"; });
    if (!current.sev.more) { var hotMore = moreCards.some(function (x) { return x.sev === "hot"; }), warmMore = moreCards.some(function (x) { return x.sev === "warm"; }); current.sev.more = hotMore ? "hot" : warmMore ? "warm" : "neutral"; }
    var moreHtml = moreCards.length ? '<h3 style="margin:28px 0 10px">' + ic("alert") + ' Also on the table</h3><div class="grid cols-4 house-cards compact">' + moreCards.map(function (x) { return '<div class="card hcard ' + x.sev + '" data-topic="more" data-anchor="' + esc(x.id) + '" role="button" tabindex="0"><div class="hhead"><span class="ring">' + ic(x.icon) + '</span>' + (SEV[x.sev] ? '<span class="sev">' + SEV[x.sev] + "</span>" : "") + '</div><div class="big">' + esc(x.big) + '</div><div class="sub">' + esc(x.sub) + '</div><p class="small">' + esc(x.line.split(". ")[0]) + '.</p>' + impactProv(x) + '<a class="why" href="#more" data-open="more" data-anchor="' + esc(x.id) + '">Why ›</a></div>'; }).join("") + "</div>" : "";
    var li = function (a, i) { return '<li><div><strong>' + esc(a.t) + "</strong><div class=\"small\">" + esc(a.d) + "</div></div>" + (a.href ? '<a class="btn' + (i ? " secondary" : "") + '" href="' + esc(a.href) + '"' + (a.ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(a.btn) + "</a>" : '<button class="btn' + (i ? " secondary" : "") + '" data-act="' + a.act + '">' + esc(a.btn) + "</button>") + "</li>"; };
    host.innerHTML = '<p class="where">' + where + '</p>' + who +
      '<div class="prov-note"><strong>Where these numbers come from.</strong> Each card says its source. <span class="prov filing">applicant\'s filing</span> means it is in a document Amazon\'s team filed with the Town, linked so you can read it. <span class="prov research">published study</span> means a published percentage applied to your distance, with every study linked. <span class="prov ourmath">our arithmetic</span> means this site did the sum from those inputs — volunteers, not engineers, and no expert has reviewed it. Check our math, and tell us if we got it wrong.</div>' + '<div class="grid cols-3 house-cards">' + cards.join("") + '</div>' + moreHtml +
      '<h3 style="margin:36px 0 6px">' + ic("megaphone") + ' What you should do' + (tier === 0 ? " — you are one of the closest homes" : tier === 1 ? " — you are within a mile" : "") + '</h3>' +
      '<p class="small muted" style="margin-bottom:14px">Ranked for your distance. These two matter most.</p><ol class="actions">' + actions.slice(0, 2).map(li).join("") + "</ol>" +
      '<details class="how" style="margin-top:10px"><summary>More ways to help</summary><ol class="actions" style="counter-reset:a 2;margin-top:10px">' + actions.slice(2).map(function (a, i) { return li(a, i + 2); }).join("") + "</ol></details>" +
      '<p class="small muted" style="margin-top:14px">Every number links to its source, with the math one tap away. This stays on your phone; nothing is sent to us. <a href="#" data-act="print">Print this page</a> for someone who prefers paper.</p>';
    if (SPS.renderIcons) SPS.renderIcons(host);
    try { localStorage.setItem(LS, JSON.stringify(rec)); localStorage.setItem("sps.impact", impactSentence(r)); if (r.hamlet) localStorage.setItem("sps.hamlet", r.hamlet.hamlet); if (rec.street) localStorage.setItem("sps.you.street", rec.street); if (r.hamlet) localStorage.setItem("sps.you.town", r.hamlet.hamlet); } catch (e) { }
    host.dataset.ready = "1";
    var rs = $("#house-report-sec"); if (rs) { rs.dataset.has = "1"; rs.hidden = false; } var intro = $("#house-intro"); if (intro) intro.hidden = true;
    var sub = $("#house-subnav"); if (sub) { sub.hidden = false; renderTabs("overview"); if (SPS.renderIcons) SPS.renderIcons($("#drawer-tabs")); var chip = $("#subnav-addr"); if (chip) chip.textContent = (r.addr ? r.addr : (r.hamlet ? r.hamlet.hamlet : "Your location")) + (r.ft != null ? " · " + (rec.approx ? "about " : "") + (r.ft > 5280 ? fmt(r.ft / 5280, 1) + " mi" : fmt(Math.round(r.ft / 10) * 10) + " ft") : ""); closePop(); }
    setTimeout(scrollToContent, 20);
    var want = location.hash.replace("#", ""); if (want && $("#panel-" + want)) openDrawer(want);
    window.__houseReps = reps;
  }

  /* ---------- geocode ---------- */
  function jsonp(url, cb, onerr) {
    var name = "spsGeoH" + Date.now(), sc = document.createElement("script"), done = false;
    window[name] = function (data) { done = true; delete window[name]; sc.remove(); cb(data); };
    sc.onerror = function () { delete window[name]; sc.remove(); onerr(); };
    setTimeout(function () { if (!done) { try { delete window[name]; sc.remove(); } catch (e) { } onerr(); } }, 12000);
    sc.src = url + "&callback=" + name; document.head.appendChild(sc);
  }
  function lookup(q, status) {
    q = (q || "").trim(); if (!q) { status("Type an address first."); return; }
    if (!/holbrook|bohemia|sayville|bayport|ronkonkoma|islip|patchogue|oakdale|blue point|ny\b|new york|\d{5}/i.test(q)) q += ", Holbrook, NY";
    status("Looking up…");
    jsonp("https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?benchmark=Public_AR_Current&format=jsonp&address=" + encodeURIComponent(q), function (data) {
      var m = data && data.result && data.result.addressMatches;
      if (m && m.length) { finish(+m[0].coordinates.y, +m[0].coordinates.x, m[0].matchedAddress); return; }
      nominatim(q, status);
    }, function () { nominatim(q, status); });
  }
  function nominatim(q, status) {
    fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&countrycodes=us&viewbox=-73.25,40.60,-72.85,40.95&bounded=1&q=" + encodeURIComponent(q), { headers: { Accept: "application/json" } })
      .then(function (r) { return r.json(); }).then(function (res) {
        if (!res || !res.length) { status("No match. Try the full street name and ZIP, or pick your hamlet."); return; }
        var a = res[0].address || {}; finish(+res[0].lat, +res[0].lon, (a.house_number ? a.house_number + " " : "") + (a.road || "") + ", " + (a.hamlet || a.village || a.town || a.suburb || a.city || ""));
      }).catch(function () { status("Lookup failed. Pick your hamlet instead."); });
  }
  function finish(lat, lon, matched) {
    var parts = String(matched).split(","), street = titleCase(parts[0] || ""), hamlet = titleCase((parts[1] || "").trim());
    var d = SPS.noiseModel.siteDistances([lat, lon], SPS.noise.site);
    render({ label: street + ", " + hamlet, street: street, hamlet: hamlet, ft: d.toProperty, dockFt: d.toBuilding, lat: lat, lon: lon });
    var st = $("#house-status"); if (st) st.textContent = ""; var ls = $("#loc-status"); if (ls) ls.textContent = "";
  }

  /* ---------- init ---------- */
  function init() {
    var form = $("#house-form"); if (!form) return;
    var sub = $("#house-subnav"), navHost = $("#site-nav"); if (sub && navHost) navHost.appendChild(sub);
    var sf = $("#subnav-form"); if (sf) { sf.addEventListener("submit", function (e) { e.preventDefault(); var v = $("#subnav-input").value; if (v.trim()) { lookup(v, function (t) { var c = $("#loc-status"); if (c) c.textContent = t; }); } }); }
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePop(); });
    var sh = $("#subnav-hamlet");
    var input = $("#house-addr"), status = function (t) { var s = $("#house-status"); if (s) s.textContent = t; };
    var sel = $("#house-hamlet");
    if (sel) {
      var names = {}; (SPS.hamlets || []).forEach(function (h) { names[h.hamlet] = 1; }); (SPS.corridors || []).forEach(function (c) { c.hamlets.forEach(function (h) { names[h] = 1; }); });
      Object.keys(names).sort().forEach(function (n) { sel.appendChild(el("option", { value: n, text: n })); if (sh) sh.appendChild(el("option", { value: n, text: n })); });
      sel.addEventListener("change", function () { if (sel.value) render({ label: "", hamlet: sel.value, ft: null }); });
      if (sh) sh.addEventListener("change", function () { if (sh.value) render({ label: "", hamlet: sh.value, ft: null }); });
    }
    form.addEventListener("submit", function (e) { e.preventDefault(); lookup(input.value, status); });
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]"); if (!b) return;
      if (b.dataset.act === "email") { var g = (SPS.officialGroups || []).filter(function (x) { return /town board/i.test(x.title); })[0]; if (g && SPS.contact && SPS.contact.openBulk) SPS.contact.openBulk(g); else location.href = "act.html#officials"; }
      else if (b.dataset.act === "call") { var reps = window.__houseReps || [], m = reps.length && SPS.locate ? SPS.locate.findOfficial(reps[0][1]) : null; if (m && SPS.contact) SPS.contact.openScript(m.official.script || m.group.script || "generic", m.official); else location.href = "act.html#officials"; }
      else if (b.dataset.act === "say") { openDrawer("say"); setTimeout(function () { var t = $("#testimony-topic"); if (t) t.scrollIntoView({ behavior: "smooth", block: "center" }); }, 200); }
      else if (b.dataset.act === "print") { e.preventDefault(); window.print(); }
      else if (b.dataset.act === "share") { var url = location.origin + location.pathname.replace(/[^/]*$/, ""); if (navigator.share) navigator.share({ title: "Stop Project Sunrise — what it means for your house", url: url }); else if (SPS.copy) SPS.copy(url); }
    });
    document.addEventListener("click", function (e) {
      if (e.target.closest("#loc-pill")) { togglePop(); return; }
      var dc = e.target.closest("#loc-dist [data-ft]"); if (dc) { var ft = +dc.dataset.ft, hm = (current && current.hamlet && current.hamlet.hamlet) || "Holbrook"; render({ label: "", hamlet: hm, ft: ft, dockFt: ft + 240, approx: true }); return; }
      if (!e.target.closest("#loc-pop") && !e.target.closest("#loc-pill")) closePop();
      var o = e.target.closest("[data-open]"); if (o) { e.preventDefault(); openDrawer(o.dataset.open, o.dataset.anchor); return; }
      var c = e.target.closest(".hcard[data-topic]"); if (c && !e.target.closest("a")) { openDrawer(c.dataset.topic, c.dataset.anchor); return; }
      if (e.target.closest("#drawer-close")) { closeDrawer(); }
    });
    document.addEventListener("keydown", function (e) {
      var c = e.target.closest && e.target.closest(".hcard[data-topic]"); if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openDrawer(c.dataset.topic); return; }
    });
    var q = new URLSearchParams(location.search).get("q"), hq = new URLSearchParams(location.search).get("hamlet");
    if (q) { input.value = q; lookup(q, status); return; }
    if (hq) { render({ label: "", hamlet: hq, ft: null }); if (sel) sel.value = hq; return; }
    try { var saved = JSON.parse(localStorage.getItem(LS) || "null"); if (saved) { if (saved.label) input.value = saved.label; render(saved); } } catch (e) { }
  }
  document.addEventListener("DOMContentLoaded", init);
})();
