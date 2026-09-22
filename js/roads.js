/* roads.js — "Your roads": which highway carries it past you, hour-of-day truck story, route map with graded intersections,
   report card (one rush at a time), wear math. Requires data/roads.js (SPS.roads), data/facts.js (SPS.los, SPS.trips),
   data/corridors.js (SPS.corridors), Leaflet, optional SPS.locate.allHamlets for the town picker. */
(function () {
  window.SPS = window.SPS || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return SPS.esc ? SPS.esc(s) : String(s == null ? "" : s); };
  var ic = function (n) { return SPS.icon ? SPS.icon(n) : ""; };
  var fmt = function (n, d) { return isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: d || 0 }) : "—"; };
  var badge = function (st) { if (SPS.statusBadge) return SPS.statusBadge(st); var map = { verified: "verified", unverified: "unverified", estimate: "assumption", paraphrase: "paraphrase" }; return '<span class="basis ' + (map[st] || "assumption") + '">' + esc(st) + "</span>"; };
  function el(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { if (k === "class") e.className = attrs[k]; else if (k === "html") e.innerHTML = attrs[k]; else if (k === "text") e.textContent = attrs[k]; else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); });
    for (var i = 2; i < arguments.length; i++) { var c = arguments[i]; if (c == null) continue; if (Array.isArray(c)) c.forEach(function (x) { if (x != null) e.appendChild(typeof x === "string" ? document.createTextNode(x) : x); }); else e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }
    return e;
  }
  function tisLink() { return '<a href="docs/Traffic-Impact-Study-2026-06-30.pdf" target="_blank">Stonefield Traffic Impact Study</a>'; }
  var GRADE = { A: "#2f7d5a", B: "#5aa876", C: "#c9b043", D: "#d9822b", E: "#c25a3f", F: "#8e2f1f" };
  function hourLabel(h) { var s = h % 12 === 0 ? 12 : h % 12; return s + (h < 12 ? " AM" : " PM"); }
  function gradeChip(g) { g = String(g || "?").trim().charAt(0).toUpperCase(); if (g === "–" || g === "-") return ""; var known = /[A-F]/.test(g); return '<span class="grade' + (known ? " g" + g : " gx") + '" title="' + (known ? esc(SPS.roads.gradeWords[g]) : "not reported") + '">' + (known ? g : "?") + "</span>"; }

  var state = { hour: 17, peak: false, rush: "PM", hamlet: "", view: "trucks", map: null, route: null, pins: [] };
  var ui = {};

  // ---- Step 1: which highway carries it past you --------------------------------------------------------------
  var ROAD_WORDS = {
    "nicolls": { name: "Nicolls Road", line: function (p) { return p + "% of the warehouse's trips, and every one of the 555 to 809 tractor-trailers."; } },
    "sunrise-wb": { name: "Sunrise Highway, from the east", line: function (p) { return p + "% of the warehouse's trips, heading west toward the site from Patchogue and beyond."; } },
    "sunrise-eb": { name: "Sunrise Highway, from the west", line: function (p) { return p + "% of the warehouse's trips, heading east toward the site from Bay Shore and beyond."; } },
    "rte454": { name: "Veterans Highway, from the Expressway", line: function (p) { return p + "% of the warehouse's trips, plus every truck on the last stretch from Nicolls Road to the warehouse gate."; } }
  };
  function hamletList() {
    if (SPS.locate && SPS.locate.allHamlets) return SPS.locate.allHamlets().map(function (h) { return h.hamlet; });
    var set = {}; (SPS.corridors || []).forEach(function (c) { c.hamlets.forEach(function (h) { set[h] = 1; }); }); return Object.keys(set).sort();
  }
  function buildYourRoad() {
    var sel = el("select", { class: "rtown", "aria-label": "Your town" }); sel.appendChild(el("option", { value: "" }, "Pick your town…"));
    hamletList().forEach(function (h) { sel.appendChild(el("option", { value: h }, h)); });
    sel.addEventListener("change", function () { state.hamlet = sel.value; try { if (sel.value) localStorage.setItem("sps.hamlet", sel.value); } catch (e) { } if (sel.value) state.view = "all"; renderYourRoad(); renderView(); });
    ui.town = sel; ui.syn = el("p", { class: "rsyn" }); ui.pie = el("div", { class: "rpie" }); attachPieEvents();
    try { state.hamlet = localStorage.getItem("sps.hamlet") || ""; } catch (e) { }
    var qt = new URLSearchParams(location.search).get("town"); if (qt) state.hamlet = qt;
    if (state.hamlet) state.view = "all";
  }
  function roadSlices() {
    var C = SPS.corridors || [], major = C.filter(function (c) { return ROAD_WORDS[c.id]; }), local = C.filter(function (c) { return !ROAD_WORDS[c.id]; });
    var out = major.map(function (c) { return { id: c.id, ids: [c.id], name: ROAD_WORDS[c.id].name, share: c.share, trucks: !!c.trucks, hamlets: c.hamlets }; });
    out.push({ id: "local", ids: local.map(function (c) { return c.id; }), name: "Broadway and Church Street", share: local.reduce(function (a, c) { return a + c.share; }, 0), trucks: false, hamlets: [].concat.apply([], local.map(function (c) { return c.hamlets; })) });
    return out;
  }
  function mineSlice(name) { return roadSlices().filter(function (x) { return x.hamlets.indexOf(name) >= 0; })[0] || null; }
  var SLICE = { nicolls: "#a1432a", "sunrise-wb": "#5f7f72", "sunrise-eb": "#a3b3c4", rte454: "#c9784f", local: "#b8c3bd" };
  function sliceColor(x, mineId) { return x.id === mineId ? "#c0392b" : SLICE[x.id] || "#9aa69f"; }
  var SHORT = { nicolls: "Nicolls Rd", "sunrise-wb": "Sunrise Hwy (east)", "sunrise-eb": "Sunrise Hwy (west)", rte454: "Veterans Hwy", local: "Local streets" };
  var PIE = { cx: 160, cy: 112, R: 88, r: 54 };
  function donut(slices, mineId) {
    var R = PIE.R, r = PIE.r, cx = PIE.cx, cy = PIE.cy, a0 = -Math.PI / 2, parts = [], labels = [];
    slices.forEach(function (x) {
      var a1 = a0 + x.share / 100 * 2 * Math.PI, big = a1 - a0 > Math.PI ? 1 : 0, am = (a0 + a1) / 2;
      var p = function (rad, a) { return (cx + rad * Math.cos(a)).toFixed(2) + " " + (cy + rad * Math.sin(a)).toFixed(2); };
      var d = "M" + p(R, a0) + " A" + R + " " + R + " 0 " + big + " 1 " + p(R, a1) + " L" + p(r, a1) + " A" + r + " " + r + " 0 " + big + " 0 " + p(r, a0) + " Z";
      parts.push('<path class="slice" data-id="' + x.id + '" d="' + d + '" fill="' + sliceColor(x, mineId) + '" stroke="#fff" stroke-width="2" tabindex="0" role="button" aria-label="' + esc(SHORT[x.id]) + ": " + x.share + '%"></path>');
      if (x.share >= 10) { var lm = (R + r) / 2; labels.push('<text class="lbl" x="' + (cx + lm * Math.cos(am)).toFixed(1) + '" y="' + (cy + lm * Math.sin(am) + 5).toFixed(1) + '" text-anchor="middle">' + x.share + "%</text>"); }
      var lx = cx + (R + 10) * Math.cos(am), ly = cy + (R + 10) * Math.sin(am), right = Math.cos(am) >= 0;
      labels.push('<text class="name' + (x.id === mineId ? " you" : "") + '" data-id="' + x.id + '" x="' + lx.toFixed(1) + '" y="' + (ly + 4).toFixed(1) + '" text-anchor="' + (right ? "start" : "end") + '">' + esc(SHORT[x.id]) + (x.trucks ? ' <tspan class="tr">+ trucks</tspan>' : "") + "</text>");
      a0 = a1;
    });
    return '<svg viewBox="0 0 320 224" role="img" aria-label="How the warehouse\'s daily trips split across the roads">' + parts.join("") + labels.join("") + '<g class="ctr"></g></svg>';
  }
  function pieFocusId() { return state.pieHover || state.piePin || (state.hamlet && mineSlice(state.hamlet) ? mineSlice(state.hamlet).id : ""); }
  function renderPieFocus() {
    var svg = ui.pie.querySelector("svg"); if (!svg) return;
    var id = pieFocusId(), total = SPS.trips.avg.total, x = roadSlices().filter(function (q) { return q.id === id; })[0], mine = state.hamlet ? mineSlice(state.hamlet) : null, mineId = mine ? mine.id : "";
    svg.querySelectorAll(".slice").forEach(function (pth) { var on = !id || pth.dataset.id === id; pth.style.opacity = on ? 1 : .4; pth.setAttribute("stroke-width", pth.dataset.id === id ? 3 : 2); });
    svg.querySelectorAll(".name").forEach(function (t) { t.classList.toggle("on", t.dataset.id === id); });
    var g = svg.querySelector(".ctr"), cx = PIE.cx, cy = PIE.cy;
    g.innerHTML = x ? '<text x="' + cx + '" y="' + (cy - 16) + '" text-anchor="middle" class="sm">' + esc(SHORT[x.id]) + '</text><text x="' + cx + '" y="' + (cy + 8) + '" text-anchor="middle" class="big">' + x.share + '%</text><text x="' + cx + '" y="' + (cy + 24) + '" text-anchor="middle" class="sm">+' + fmt(total * x.share / 100) + ' a day</text>' + (x.id === mineId ? '<text x="' + cx + '" y="' + (cy + 38) + '" text-anchor="middle" class="sm you">your road</text>' : "")
      : '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" class="big">' + fmt(total) + '</text><text x="' + cx + '" y="' + (cy + 16) + '" text-anchor="middle" class="sm">trips a day</text><text x="' + cx + '" y="' + (cy + 30) + '" text-anchor="middle" class="sm">tap a road</text>';
  }
  function attachPieEvents() {
    var idOf = function (t) { var e = t && t.closest ? t.closest("[data-id]") : null; return e ? e.dataset.id : ""; };
    ui.pie.addEventListener("pointerover", function (e) { var id = idOf(e.target); if (id) { state.pieHover = id; renderPieFocus(); } });
    ui.pie.addEventListener("pointerout", function (e) { if (idOf(e.target)) { state.pieHover = ""; renderPieFocus(); } });
    ui.pie.addEventListener("click", function (e) { var id = idOf(e.target); if (!id) return; state.piePin = state.piePin === id ? "" : id; state.pieHover = ""; renderPieFocus(); });
    ui.pie.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { var id = idOf(e.target); if (id) { e.preventDefault(); state.piePin = state.piePin === id ? "" : id; renderPieFocus(); } } });
  }
  function renderYourRoad() {
    var T = SPS.trips, total = T.avg.total, name = state.hamlet, slices = roadSlices(), mine = name ? mineSlice(name) : null, mineId = mine ? mine.id : "";
    if (name && ![].some.call(ui.town.options, function (o) { return o.value === name; })) ui.town.appendChild(el("option", { value: name }, name));
    if (ui.town.value !== name) ui.town.value = name;
    var trucksPerHour = SPS.roads.hourly.avg.trucks, tMin = Math.min.apply(null, trucksPerHour), tMax = Math.max.apply(null, trucksPerHour);
    var every = "one every " + fmt(60 / tMax, 0) + " to " + fmt(60 / tMin, 0) + " minutes, around the clock";
    if (mine) {
      ui.syn.innerHTML = "<strong>" + esc(name) + " drivers meet it on " + esc(mine.name.split(",")[0]) + ":</strong> about <strong>" + fmt(total * mine.share / 100) + " more vehicles a day</strong>" + (mine.id === "nicolls" ? ", and every one of the " + fmt(T.avg.trucks) + " to " + fmt(T.peak.trucks) + " daily tractor-trailers — " + every + "." : mine.id === "rte454" ? ", plus every tractor-trailer on the last stretch from Nicolls Road to the warehouse gate." : ". Trucks use Nicolls Road and Veterans Highway; this road gets the employees and the Amazon Flex delivery cars.");
    } else if (name) {
      ui.syn.innerHTML = "<strong>" + esc(name) + " is not named in the traffic study's trip table</strong>, but the study assumes drivers from across Suffolk. You meet this traffic on Nicolls Road, Sunrise Highway or Veterans Highway — and every tractor-trailer comes down Nicolls Road from the Expressway, " + every + ".";
    } else {
      ui.syn.innerHTML = "<strong>Most of Long Island reaches this site on Nicolls Road, Sunrise Highway or Veterans Highway.</strong> Every tractor-trailer comes down Nicolls Road from the Expressway, " + every + ".";
    }
    ui.pie.innerHTML = '<div class="rdonut">' + donut(slices, mineId) + '</div>';
    state.piePin = ""; renderPieFocus();
    if (state.corrLines) Object.keys(state.corrLines).forEach(function (id) { var on = mine && mine.ids.indexOf(id) >= 0; state.corrLines[id].setStyle({ color: on ? "#c0392b" : (state.corrTrucks[id] ? "#a1432a" : "#c25a3f"), opacity: mine ? (on ? 1 : .35) : .75, weight: state.corrWeight[id] + (on ? 2 : 0) }); if (on) state.corrLines[id].bringToFront(); });
  }

  // ---- layout ---------------------------------------------------------------------------------------------------
  function init(host) {
    var R = SPS.roads;
    buildYourRoad();
    ui.hourVal = el("div", { class: "rh-val" }); ui.hourSub = el("div", { class: "rh-sub" });
    ui.slider = el("input", { type: "range", min: 0, max: 23, step: 1, value: state.hour, "aria-label": "Hour of the day" });
    ui.slider.addEventListener("input", function () { state.hour = +ui.slider.value; render(); });
    ui.strip = el("div", { class: "rh-strip" });
    var seg = el("div", { class: "seg" });
    [["Average day", false], ["Peak season day", true]].forEach(function (o) { seg.appendChild(el("button", { type: "button", "data-p": String(o[1]), onclick: function () { state.peak = o[1]; render(); } }, o[0])); });
    ui.seg = seg;
    var mapEl = el("div", { class: "rmap" });
    var viewSeg = el("div", { class: "seg", style: "margin:6px 0 8px" });
    [["trucks", "The truck route"], ["all", "Every road the traffic uses"]].forEach(function (o) { viewSeg.appendChild(el("button", { type: "button", "data-v": o[0], class: o[0] === "trucks" ? "on" : "", onclick: function () { state.view = o[0]; renderView(); } }, o[1])); });
    ui.viewSeg = viewSeg; ui.viewNote = el("p", { class: "small", style: "margin:0 0 6px" });
    ui.mapNote = el("div", { class: "small muted", style: "margin-top:6px" });
    var rushSeg = el("div", { class: "seg", style: "margin:8px 0 10px" });
    [["AM", "Morning rush hour"], ["PM", "Evening rush hour"]].forEach(function (o) { rushSeg.appendChild(el("button", { type: "button", "data-r": o[0], onclick: function () { state.rush = o[0]; buildReport(); } }, o[1])); });
    ui.rushSeg = rushSeg; ui.reportLead = el("p"); ui.report = el("div", { class: "rcards" }); ui.reportFoot = el("div");
    ui.wear = el("div", { class: "rwear" }); ui.refs = el("div", { class: "rrefs" });
    host.innerHTML = "";
    var hourPanel = el("div", { class: "rduo-p" }, el("div", { class: "rduo-h" }, el("h4", { text: "Tractor-trailers, hour by hour" }), el("p", { class: "small muted", html: "Hour-by-hour schedule the operator supplied, from Tables A5 and A6 of the " + tisLink() + ". Drag the slider or tap a bar." })), ui.strip, el("div", { class: "rh-slider" }, ui.slider), el("div", { class: "rh-axis small muted" }, el("span", { text: "midnight" }), el("span", { text: "6 AM" }), el("span", { text: "noon" }), el("span", { text: "6 PM" }), el("span", { text: "midnight" })), el("div", { class: "rh-read" }, ui.hourVal, ui.hourSub), seg);
    var piePanel = el("div", { class: "rduo-p" }, el("div", { class: "rduo-h" }, el("h4", { text: "Additional vehicles every day" }), el("p", { class: "small muted", html: fmt(SPS.trips.avg.total) + " a day, split by the road they use, from Table 3 of the " + tisLink() + ". Hover or tap a road." })), ui.pie);
    host.appendChild(el("div", { class: "rstory" },
      el("section", { class: "wstep" }, el("div", { class: "wnum", text: "1" }), el("div", null, el("h3", { text: "Your road" }), el("p", { html: "<strong>" + fmt(SPS.trips.avg.total) + " more vehicles a day</strong> — " + fmt(SPS.trips.peak.total) + " in peak season — on roads most of Long Island already uses. Pick your town to see the road they take past you." }), el("div", { class: "rtown-row" }, el("label", { text: "Your town" }), ui.town), ui.syn, viewSeg, mapEl, ui.mapNote,
        el("div", { class: "rlegend small", html: ["A", "C", "D", "E", "F"].map(function (g) { return '<span><i class="sw" style="background:' + GRADE[g] + '"></i> ' + g + " — " + esc(R.gradeWords[g]) + "</span>"; }).join("") + '<span class="muted">Pins grade each light like school: A is free-flowing, F is failing. Tap one.</span>' }),
        el("div", { class: "rduo" }, piePanel, hourPanel), el("div", { id: "roads-asks", "data-asks": "roads", style: "margin-top:22px" }))),
      el("section", { class: "wstep" }, el("div", { class: "wnum", text: "2" }), el("div", null, el("h3", { text: "Trucks eat roads. County taxes repave them." }), ui.wear)),
      el("section", { class: "wstep" }, el("div", { class: "wnum", text: "3" }), el("div", null, el("h3", { text: "The report card: how the lights on the map grade" }),
        el("p", { html: "Every traffic light in the applicant's traffic study gets a grade, like a report card. <strong>A</strong> means you sail through. <strong>F</strong> means you sit through more than one red. The grade comes from <strong>how many seconds the average car waits</strong> at that light." }),
        ui.reportLead, rushSeg, ui.report, ui.reportFoot)),
      el("section", { class: "wstep refs" }, el("div", null), el("div", null, ui.refs))));
    buildStrip(); buildMap(mapEl); buildReport(); buildWear(); buildCrash(); if (ui.refs) ui.refs.innerHTML = refListHtml(); render(); var qv = new URLSearchParams(location.search).get("view"); if (qv) state.view = qv === "all" ? "all" : "trucks"; renderYourRoad(); renderView();
  }
  function sched() { return SPS.roads.hourly[state.peak ? "peak" : "avg"]; }
  function buildStrip() { ui.strip.innerHTML = ""; for (var h = 0; h < 24; h++) ui.strip.appendChild(el("span", { "data-h": String(h), onclick: (function (hh) { return function () { state.hour = hh; ui.slider.value = hh; render(); }; })(h) })); }

  // ---- map -------------------------------------------------------------------------------------------------------
  function buildMap(mapEl) {
    var L_ = window.L; if (!L_) { mapEl.innerHTML = '<p class="muted">Map library did not load.</p>'; return; }
    var R = SPS.roads, m = L_.map(mapEl, { scrollWheelZoom: false, attributionControl: false, zoomSnap: 0.25 });
    L_.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, className: "wmap-tiles" }).addTo(m);
    var site = SPS.noise && SPS.noise.site && SPS.noise.site.polygon; if (site) L_.polygon(site, { color: "#333", weight: 2, fillColor: "#555", fillOpacity: .55, interactive: false }).addTo(m);
    L_.polyline(R.route, { color: "#7a2e22", weight: 9, opacity: .25, interactive: false }).addTo(m);
    state.route = L_.polyline(R.route, { color: "#a1432a", weight: 4, dashArray: "4 14", opacity: .95, interactive: false }).addTo(m);
    [[40.8125, -73.0545, "from the Long Island Expressway", "road"], [40.792, -73.0515, "NICOLLS ROAD", "road"], [40.7735, -73.0565, "VETERANS MEMORIAL HWY", "road"], [40.7685, -73.0605, "SUNRISE HIGHWAY", "road"], [40.7728, -73.0640, "new truck gateway", "gate"]].forEach(function (q) { L_.marker([q[0], q[1]], { icon: L_.divIcon({ className: "wmap-place " + q[3], html: esc(q[2]), iconSize: [190, 18], iconAnchor: [95, 9] }), interactive: false }).addTo(m); });
    var los = SPS.los || [];
    Object.keys(R.pins).forEach(function (name) {
      var row = los.filter(function (r) { return r.intersection === name; })[0] || {}; var g = (row.buildPM || row.existingPM || "?").charAt(0).toUpperCase(), col = GRADE[g] || "#9aa69f";
      var mk = L_.circleMarker(R.pins[name], { radius: 11, color: "#fff", weight: 2, fillColor: col, fillOpacity: 1 }).addTo(m);
      mk.bindTooltip("<strong>" + esc(name.replace(" (new gateway)", "")) + "</strong><br>Today: " + esc(row.existingAM || "?") + " morning · " + esc(row.existingPM || "?") + " evening<br>With the warehouse: " + esc(row.buildAM || "?") + " morning · " + esc(row.buildPM || "?") + " evening" + (row.plain ? "<br><span class=\"small\">" + esc(row.plain) + "</span>" : "") + (R.approxPins.indexOf(name) >= 0 ? "<br><span class=\"small muted\">pin position approximate</span>" : ""), { direction: "top" });
      L_.marker(R.pins[name], { icon: L_.divIcon({ className: "rgrade", html: /[A-F]/.test(g) ? g : "?", iconSize: [22, 22], iconAnchor: [11, 11] }), interactive: false }).addTo(m);
    });
    state.bounds = L_.latLngBounds(R.route.concat(Object.keys(R.pins).map(function (k) { return R.pins[k]; }))).pad(0.12);
    m.fitBounds(state.bounds);
    state.map = m;
    if (SPS.fullscreenButton) SPS.fullscreenButton(mapEl, function () { m.invalidateSize(); m.fitBounds(state.view === "all" ? state.allBounds : state.bounds); });
    state.corr = L_.layerGroup(); state.corrLines = {}; state.corrTrucks = {}; state.corrWeight = {};
    var T = SPS.trips, total = T.avg.total, C = R.corridorGeom || {};
    (SPS.corridors || []).forEach(function (c) {
      var pts = c.id === "nicolls" ? R.route.slice(0, -1) : C[c.id]; if (!pts || pts.length < 2) return;
      var trips = Math.round(total * c.share / 100), w = 2.5 + c.share * 0.25;
      state.corrTrucks[c.id] = !!c.trucks; state.corrWeight[c.id] = w;
      state.corrLines[c.id] = L_.polyline(pts, { color: c.trucks ? "#a1432a" : "#c25a3f", weight: w, opacity: .75, interactive: true }).bindTooltip("<strong>" + esc(c.corridor.split(" — ")[0]) + "</strong><br>" + fmt(trips) + " trips a day (" + c.share + "%)" + (c.trucks ? "<br>plus every truck" : ""), { sticky: true }).addTo(state.corr);
      var mid = pts[Math.floor(pts.length / 2)];
      L_.marker(mid, { icon: L_.divIcon({ className: "rcorr-label", html: fmt(trips) + "/day", iconSize: [70, 20], iconAnchor: [35, 10] }), interactive: false }).addTo(state.corr);
    });
    state.allBounds = L_.latLngBounds([].concat.apply([], Object.keys(C).map(function (k) { return C[k]; })).concat(R.route)).pad(0.05);
    var off = 0; setInterval(function () { off = (off - 1 + 18) % 18; var e = state.route.getElement && state.route.getElement(); if (e) e.style.strokeDashoffset = off; }, 60);
  }
  function renderView() {
    var m = state.map; if (!m) return;
    ui.viewSeg.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", b.dataset.v === state.view); });
    if (state.view === "all") { state.corr.addTo(m); state.route.setStyle({ opacity: .35 }); m.fitBounds(state.allBounds); ui.mapNote.innerHTML = "Thicker line, more trips. Tap a road for its count." + (state.hamlet ? " Your road is highlighted." : ""); }
    else { m.removeLayer(state.corr); state.route.setStyle({ opacity: .95 }); m.fitBounds(state.bounds); ui.mapNote.innerHTML = "Every truck, by the traffic study's own routing: down Nicolls Road from the Expressway, onto Route 454, to a new gateway at Church Street. Two graded lights out at the Expressway service roads are off this map."; }
  }

  // ---- report card: one rush at a time -------------------------------------------------------------------------
  function buildReport() {
    var los = SPS.los || [], k = state.rush, rushWord = k === "AM" ? "morning" : "evening", W = SPS.roads.gradeWords;
    ui.rushSeg.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", b.dataset.r === k); });
    var graded = los.filter(function (r) { return /[A-F]/.test(String(r["existing" + k]).charAt(0)); }), bad = graded.filter(function (r) { return /[DEF]/.test(String(r["existing" + k]).charAt(0)); });
    ui.reportLead.innerHTML = "<strong>" + (bad.length === graded.length ? "Every one" : bad.length + " of " + graded.length) + " of these lights already grades D or E in the " + rushWord + " rush</strong> — about a minute of waiting per car — before a single Amazon truck.";
    var word = function (g) { g = String(g || "").charAt(0).toUpperCase(); return W[g] || ""; };
    ui.report.innerHTML = los.map(function (r) {
      var d = r.delay || {}, e = d["existing" + k], b = d["build" + k], gE = r["existing" + k], gB = r["build" + k], diff = e != null && b != null ? Math.round(b - e) : null, noLight = gE === "–" || gE === "-";
      var today = noLight ? '<div class="rc-g"><span class="rc-none">No traffic light here today</span></div>' : '<div class="rc-g">' + gradeChip(gE) + '<span class="w">' + esc(word(gE)) + '</span></div>' + (e != null ? '<div class="rc-s">' + fmt(e, 0) + ' seconds at the light</div>' : "");
      var after = '<div class="rc-g">' + gradeChip(gB) + '<span class="w">' + esc(word(gB)) + '</span></div>' + (b != null ? '<div class="rc-s">' + fmt(b, 0) + ' seconds' + (diff != null && diff !== 0 ? ' — <strong class="' + (diff >= 5 ? "bad" : diff > 0 ? "warm" : "ok") + '">' + Math.abs(diff) + (Math.abs(diff) === 1 ? ' second ' : ' seconds ') + (diff > 0 ? "longer" : "shorter") + '</strong>' : "") + '</div>' : "");
      return '<div class="rcard"><div class="rc-name">' + esc(r.intersection.replace(" (new gateway)", "")) + '</div>' + (r.plain ? '<div class="rc-note">' + esc(r.plain) + "</div>" : "") + '<div class="rc-cols"><div class="rc-col"><div class="rc-k">Today</div>' + today + '</div><div class="rc-col with"><div class="rc-k">With the warehouse</div>' + after + "</div></div></div>";
    }).join("");
    ui.reportFoot.innerHTML = '<div class="rwhy"><strong>Why the seconds look small.</strong> "12 seconds longer" is the average over every car, all hour — including the ones that catch a green. The traffic study\'s own worst case is the left turn from Broadway onto Route 454: <strong>99 seconds today, 130 with the warehouse</strong>. That is more than two minutes sitting at one light. And every number here rests on the operator\'s own trip counts, which nobody outside the company can check.</div>' +
      '<p class="small muted" style="margin-top:8px">Grades and seconds are from the applicant\'s own ' + tisLink() + ', June 30 2026 (' + rushWord + ' rush hour, 2025 today vs. 2030 with the project). "?" means the pages we have do not report that case.</p>';
  }
  // ---- wear: the math, then who pays ---------------------------------------------------------------------------
  // Numbered references: the body stays plain, every claim carries a marker, the list sits at the end of the section.
  var refs = [];
  function ref(o) {
    for (var i = 0; i < refs.length; i++) { if (refs[i].source === o.source) return mark(i); }
    refs.push(o); return mark(refs.length - 1);
  }
  function mark(i) { return '<sup class="refmark"><a href="#rd-ref-' + (i + 1) + '" aria-label="Reference ' + (i + 1) + '">' + (i + 1) + "</a></sup>"; }
  function refListHtml() {
    if (!refs.length) return "";
    return '<h4 class="rsub">Sources for this section</h4><p class="small muted">Every claim above is numbered to one of these. Open any of them and check it against what we say.</p><ol class="reflist">' +
      refs.map(function (r, i) {
        return '<li id="rd-ref-' + (i + 1) + '">' + (r.url ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.title) + "</a>" : esc(r.title)) +
          (r.note ? '<div class="rn">' + esc(r.note) + "</div>" : "") +
          (r.status ? '<div class="rb">' + badge(r.status) + "</div>" : "") + "</li>";
      }).join("") + "</ol>";
  }

  function buildWear() {
    var R = SPS.roads, W = R.wear;
    var SL = W.serviceLife, CS = W.costShare, CM = W.costPerMile, RA = W.ratio, TR = W.thinRoads;
    refs = [];
    var summary = summaryHtml();
    var r1 = ref({ source: W.nonLinear.source, title: "USDOT / FHWA, Comprehensive Truck Size and Weight Limits Study — Pavement Comparative Analysis (2015), Appendix A §1.6", url: W.nonLinear.url, status: W.nonLinear.status, note: "States that pavement damage rises non-linearly with axle load, so what matters is the heavy end of the range rather than the average." });
    var r2 = ref({ source: TR.source, title: "The same report, p. ES-7, §4.2 and Tables 6 and 7 (Ohio sections)", url: TR.url, status: TR.status, note: "Gives the built thickness of each road class and finds the significant impacts fall on low-volume arterials, which are built with thinner cross-sections, while the effect on thicker pavement is relatively minor. Also states that local roads are built to lower design standards still." });
    var r3 = ref({ source: SL.source, title: "The same report, §5.1", url: SL.url, status: SL.status, note: "Removing overweight axles from the traffic mix raised asphalt service intervals by 19 to 34 per cent. Modelled on the medium-volume Interstate sections only." });
    ui.wear.innerHTML =
      summary +
      '<p>A road wears out under <strong>weight on an axle</strong>, not under the number of vehicles that pass. Federal engineers make the point precisely: what counts is not the average axle load but how many very heavy ones there are.' + r1 + '</p>' +
      '<p>Which road takes that damage is not an open question. The federal government modelled it in 2015, and the answer was the thin ones.</p>' +
      '<div class="rinfo">' +
        '<div class="ri one hotline"><div class="ri-a"><div class="ri-ic">' + ic("ruler") + '</div><div class="v">' + TR.arterialAsphaltIn + '&Prime; of asphalt, not ' + TR.interstateAsphaltIn + '&Prime;</div>' +
          '<div class="l">A county-grade arterial is built with about <strong>' + TR.arterialAsphaltIn + ' inches of asphalt on an ' + TR.arterialBaseIn + '-inch base</strong>. An interstate gets <strong>' + TR.interstateAsphaltIn + ' inches on a ' + TR.interstateBaseIn + '-inch base</strong>, twice the asphalt. The damage from heavier trucks landed on the thin roads; on interstate-grade pavement the same modelling called it minor.' + r2 + ' <strong>' + esc(TR.limitation) + '</strong></div></div></div>' +
        '<div class="ri one"><div class="ri-a"><div class="ri-ic">' + ic("clock") + '</div><div class="v">' + SL.lo + '&ndash;' + SL.hi + '% longer</div>' +
          '<div class="l">How much longer asphalt lasted in that modelling once the overweight axles were taken out of the traffic. Measured on ' + esc(SL.scope) + ', roads built thicker than yours.' + r3 + '</div></div></div>' +
      '</div>' +
      '<div class="rpay"><div class="rpay-ic">' + ic("landmark") + '</div><div><div class="k">Who pays here</div><p><strong>Nicolls Road is a county road</strong> (CR 97). Suffolk County repaves it with county property tax, which is yours. The file commits <strong>$0</strong> to the road fixes: the realigned Beacon Drive, the new signals, the extra turn lanes and the fourth westbound lane are each "subject to approval," with no funding, schedule or guarantee.</p>' + "</div></div>" +
      '<details class="how rcaveat"><summary>The older cost figures, and the number you may have seen</summary>' +
        '<p>Three figures get quoted a lot in this argument. All three are worth knowing and none is current, which is why they are down here.</p>' +
        '<ul class="rold">' +
        '<li><strong>' + CM.car + ' cents a mile for a car against ' + CM.combo + ' cents for a tractor-trailer.</strong> Published by the Congressional Budget Office in 2020, but the estimates in it are for the year 2000.' + ref({ source: CM.source, title: "Congressional Budget Office, Reauthorizing Federal Highway Programs: Issues and Options (May 2020)", url: CM.url, status: CM.status, note: "Puts the federal highway cost of a mile at 0.8 cents for a passenger vehicle and 8.4 cents for a combination truck, rising to 20.3 cents for the heaviest. The underlying estimates are for the year 2000." }) + '</li>' +
        '<li><strong>Cars pay back all of the road costs they cause; the heaviest combination trucks pay about half.</strong> That is the 1997 federal cost allocation study as updated in 2000. It is still the most recent one the federal government has done, which is either the point or the problem depending on who is arguing.' + ref({ source: CS.source, title: "USDOT / FHWA, Addendum to the 1997 Federal Highway Cost Allocation Study (May 2000)", url: CS.url, status: CS.status, note: "Table 7 sets the ratio of user charges to allocated costs at 1.0 for cars and 0.5 for combination trucks registered between 80,000 and 100,000 pounds." }) + '</li>' +
        '<li><strong>"One truck equals 9,600 cars."</strong> A 1979 federal report about interstate pavement.' + ref({ source: RA.gaoSource, title: "U.S. General Accounting Office, CED-79-94 (1979), p. 23", url: RA.gaoUrl, status: "verified", note: "The origin of the 9,600 figure, derived from highway-officials data and stated for interstate pavement." }) + ' The trucking industry answers that passenger cars were never tested in the 1950s experiment behind it and that the test sections were built under-strength on purpose. They are right about both. So is this, which they rarely mention: the federal highway administration stopped using that method in 1979 itself, after the Congressional Budget Office criticised it.' + ref({ source: RA.criticSource, title: "FHWA, Pavement Structure Comparative Analysis Desk Scan (November 2013), p. 1", url: RA.criticUrl, status: "verified", note: "Records that FHWA stopped using unmodified AASHO Road Test equivalent single axle loads in 1979 after the Congressional Budget Office criticised them." }) + ' Published estimates of the ratio run from <strong>' + fmt(RA.industry) + ':1</strong>, in the trucking industry\'s own commissioned study,' + ref({ source: RA.industrySource, title: "FPInnovations for the American Trucking Associations, Analysis of car and truck pavement impacts (2018)", url: RA.industryUrl, status: "verified", note: "Industry-commissioned engineering study. Puts one pass of a five-axle tractor-trailer at 285 to 343 cars on ordinary asphalt, and 10,643 on concrete." }) + ' to <strong>' + fmt(RA.gao) + ':1</strong>. Even the lowest is ' + fmt(RA.industry) + ' cars.</li>' +
        '</ul>' +
        '<p class="small muted">The direction is not in dispute, only the size. Federal engineers have put it that doubling an axle load may raise pavement deterioration eightfold rather than sixteenfold, and called that still a very significant difference.' + ref({ source: RA.affirmSource, title: "FHWA, Comprehensive Truck Size and Weight Study, Volume 3, Chapter V: Pavement (2000), p. V-4", url: RA.affirmUrl, status: "verified", note: "Concedes the exponent is probably nearer a third power than a fourth, and affirms the effect is still very significant." }) + ' One caution the other way: this is about weight per axle, not truck size. The same 2015 modelling found a heavier truck with an extra axle can be easier on pavement than a lighter one without it.</p>' +
      "</details>";
  }
  function summaryHtml() {
    var S = SPS.roads.studySummary; if (!S || !S.length) return "";
    return '<p>' + S.map(function (part) {
      return esc(part.text) + (part.sources || []).map(function (q) {
        return ref({ source: q.source, title: q.source + " — the applicant's own traffic study, June 30 2026", url: "docs/Traffic-Impact-Study-2026-06-30.pdf", status: q.status, note: q.note || "" });
      }).join("");
    }).join(" ") + "</p>";
  }
  function buildCrash() {
    var host = document.getElementById("crash-rows"); if (!host || !SPS.crashSeverity) return;
    var C = SPS.crashSeverity, rates = SPS.crashRates || [];
    var over = rates.filter(function (r) { return r.rate > r.nysdotAvg; }).length;
    var mult = rates.map(function (r) { return r.rate / r.nysdotAvg; }), lo = Math.round(Math.min.apply(null, mult)), hi = Math.round(Math.max.apply(null, mult));
    host.innerHTML = '<h4 class="rsub" style="margin-top:0">What the crash record actually shows</h4>' +
      '<div class="rows two crashrows">' +
      '<div class="row two"><div class="what"><strong>' + fmt(C.crashes) + ' crashes</strong> at the ' + C.intersections + ' study intersections over ' + C.years + ' years</div><div class="src small">' + (SPS.srcHtml ? SPS.srcHtml(C.source) : "") + "</div></div>" +
      '<div class="row two"><div class="what"><strong>' + fmt(C.injury) + '</strong> of them involved an injury, about ' + Math.round(C.injury / C.years) + ' a year</div><div class="src small"></div></div>' +
      '<div class="row two"><div class="what"><strong>Zero fatalities.</strong> We say that plainly because the applicant does, and because it is true. This is not a story about deadly intersections.</div><div class="src small"></div></div>' +
      '<div class="row two"><div class="what"><strong>Every one of the ' + rates.length + ' intersections</strong> sit above the NYSDOT comparison crash rate, by ' + lo + ' to ' + hi + ' times. Exceeding that rate is the State\'s own screening trigger for a closer safety look.</div><div class="src small"></div></div>' +
      '<div class="row two"><div class="what">The study\'s entire safety conclusion is one sentence, repeated for each intersection: <em>"' + esc(C.studyConclusion) + '"</em> No analysis supports it, and no safety study was done.</div><div class="src small"></div></div>' +
      "</div>" +
      '<p class="small muted">Crash rate is crashes per million vehicles entering the intersection. The comparison figure is NYSDOT\'s for that intersection type. ' +
      'The honest version of this point is narrow: the project adds ' + fmt((SPS.trips && SPS.trips.avg.total) || 10815) + ' vehicle trips a day to junctions the State\'s own screening already flags, and nobody looked at what that does.</p>';
    if (SPS.renderIcons) SPS.renderIcons(host);
  }
  function render() {
    var s = sched(), h = state.hour, t = s.trucks[h], v = s.total[h];
    ui.seg.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", b.dataset.p === String(state.peak)); });
    ui.hourVal.innerHTML = '<span class="n">' + t + '</span> trucks';
    ui.hourSub.innerHTML = "between " + hourLabel(h) + " and " + hourLabel((h + 1) % 24) + " — one every <strong>" + (t ? fmt(60 / t, 1) : "—") + " minutes</strong>, plus " + fmt(v - t) + " cars and delivery vans. " + (h >= 22 || h < 6 ? "<strong>While you sleep.</strong>" : h >= 7 && h <= 9 ? "<strong>School bus hours.</strong>" : h >= 16 && h <= 18 ? "<strong>Rush hour, on roads that already fail.</strong>" : "");
    var max = Math.max.apply(null, s.trucks);
    ui.strip.querySelectorAll("span").forEach(function (sp, i) { var tt = s.trucks[i]; sp.style.setProperty("--h", (tt / max * 100) + "%"); sp.classList.toggle("on", i === h); sp.classList.toggle("night", i >= 22 || i < 6); sp.title = hourLabel(i) + ": " + tt + " trucks"; });
  }
  SPS.roadsUI = {
    init: init,
    setHamlet: function (name) { if (!ui.town) return; state.hamlet = name || ""; if (state.hamlet) state.view = "all"; renderYourRoad(); renderView(); },
    refresh: function () { if (!state.map) return; setTimeout(function () { state.map.invalidateSize(); state.map.fitBounds(state.view === "all" ? state.allBounds : state.bounds); }, 60); }
  };
  document.addEventListener("DOMContentLoaded", function () { var h = $("#roads-app"); if (h && SPS.roads) { try { init(h); } catch (e) { console.error(e); h.innerHTML = '<p class="muted">Roads failed: ' + esc(e.message) + "</p>"; } } });
})();
