/* roads.js — "Your roads": hour-of-day truck story, route map with graded intersections, report card, wear story.
   Requires data/roads.js (SPS.roads), data/facts.js (SPS.los, SPS.crashRates), Leaflet, optional SPS.locate for the corridor block. */
(function () {
  window.SPS = window.SPS || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return SPS.esc ? SPS.esc(s) : String(s == null ? "" : s); };
  var ic = function (n) { return SPS.icon ? SPS.icon(n) : ""; };
  var fmt = function (n, d) { return isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: d || 0 }) : "—"; };
  var badge = function (st) { return SPS.statusBadge ? SPS.statusBadge(st) : ""; };
  function el(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { if (k === "class") e.className = attrs[k]; else if (k === "html") e.innerHTML = attrs[k]; else if (k === "text") e.textContent = attrs[k]; else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); });
    for (var i = 2; i < arguments.length; i++) { var c = arguments[i]; if (c == null) continue; if (Array.isArray(c)) c.forEach(function (x) { if (x != null) e.appendChild(typeof x === "string" ? document.createTextNode(x) : x); }); else e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }
    return e;
  }
  var GRADE = { A: "#2f7d5a", B: "#5aa876", C: "#c9b043", D: "#d9822b", E: "#c25a3f", F: "#8e2f1f" };
  function hourLabel(h) { var s = h % 12 === 0 ? 12 : h % 12; return s + (h < 12 ? " AM" : " PM"); }
  function gradeChip(g) { g = String(g || "?").trim().charAt(0).toUpperCase(); var known = /[A-F]/.test(g); return '<span class="grade' + (known ? " g" + g : " gx") + '" title="' + (known ? esc(SPS.roads.gradeWords[g]) : "not reported") + '">' + (known ? g : "?") + "</span>"; }

  var state = { hour: 17, peak: false, map: null, route: null, pins: [] };
  var ui = {};

  function init(host) {
    var R = SPS.roads, T = SPS.trips;
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
    var report = el("div", { class: "rows report" });
    ui.report = report;
    var wear = el("div", { class: "rwear" }); ui.wear = wear;
    host.innerHTML = "";
    host.appendChild(el("div", { class: "rstory" },
      el("section", { class: "wstep" }, el("div", { class: "wnum", text: "1" }), el("div", null, el("h3", { text: "A tractor-trailer every few minutes, around the clock" }), el("p", { html: "The applicant's own schedule, hour by hour. Drag the slider through a day." }), el("div", { class: "rh" }, el("div", { class: "rh-left" }, ui.hourVal, ui.hourSub), el("div", { class: "rh-right" }, ui.strip, el("div", { class: "rh-slider" }, ui.slider), el("div", { class: "rh-axis small muted" }, el("span", { text: "midnight" }), el("span", { text: "6 AM" }), el("span", { text: "noon" }), el("span", { text: "6 PM" }), el("span", { text: "midnight" })))), el("div", { style: "margin-top:10px" }, seg))),
      el("section", { class: "wstep" }, el("div", { class: "wnum", text: "2" }), el("div", null, el("h3", { text: "One way in: Nicolls Road, then Veterans Highway" }), ui.viewNote, viewSeg, mapEl, ui.mapNote,
        el("div", { class: "rlegend small", html: ["A", "C", "D", "E", "F"].map(function (g) { return '<span><i class="sw" style="background:' + GRADE[g] + '"></i> ' + g + " — " + esc(R.gradeWords[g]) + "</span>"; }).join("") + '<span class="muted">Engineers grade intersections like school: A is free-flowing, F is failing.</span>' }))),
      el("section", { class: "wstep" }, el("div", { class: "wnum", text: "3" }), el("div", null, el("h3", { text: "The report card" }), el("p", { html: "Morning and evening rush, today and with the warehouse — from the study's own tables. Most of these already fail; the fix offered is a one-second signal change." }), report)),
      el("section", { class: "wstep" }, el("div", { class: "wnum", text: "4" }), el("div", null, el("h3", { text: "Trucks eat roads. County taxes repave them." }), wear))));
    buildStrip(); buildMap(mapEl); buildReport(); buildWear(); render(); state.view = new URLSearchParams(location.search).get("view") === "all" ? "all" : "trucks"; renderView();
  }
  function sched() { return SPS.roads.hourly[state.peak ? "peak" : "avg"]; }
  function buildStrip() { ui.strip.innerHTML = ""; for (var h = 0; h < 24; h++) ui.strip.appendChild(el("span", { "data-h": String(h), onclick: (function (hh) { return function () { state.hour = hh; ui.slider.value = hh; render(); }; })(h) })); }
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
      mk.bindTooltip("<strong>" + esc(name.replace(" (new gateway)", "")) + "</strong><br>Today: " + esc(row.existingAM || "?") + " morning · " + esc(row.existingPM || "?") + " evening<br>With the warehouse: " + esc(row.buildAM || "?") + " morning · " + esc(row.buildPM || "?") + " evening" + (row.note ? "<br><span class=\"small\">" + esc(row.note) + "</span>" : "") + (R.approxPins.indexOf(name) >= 0 ? "<br><span class=\"small muted\">pin position approximate</span>" : ""), { direction: "top" });
      L_.marker(R.pins[name], { icon: L_.divIcon({ className: "rgrade", html: /[A-F]/.test(g) ? g : "?", iconSize: [22, 22], iconAnchor: [11, 11] }), interactive: false }).addTo(m);
    });
    state.bounds = L_.latLngBounds(R.route.concat(Object.keys(R.pins).map(function (k) { return R.pins[k]; }))).pad(0.12);
    m.fitBounds(state.bounds);
    state.map = m;
    if (SPS.fullscreenButton) SPS.fullscreenButton(mapEl, function () { m.invalidateSize(); m.fitBounds(state.view === "all" ? state.allBounds : state.bounds); });
    state.corr = L_.layerGroup(); state.corrLabels = [];
    var T = SPS.trips, total = T.avg.total, C = R.corridorGeom || {};
    (SPS.corridors || []).forEach(function (c) {
      var pts = c.id === "nicolls" ? R.route.slice(0, -1) : C[c.id]; if (!pts || pts.length < 2) return;
      var trips = Math.round(total * c.share / 100), w = 3 + c.share * 0.55;
      L_.polyline(pts, { color: c.trucks ? "#a1432a" : "#c25a3f", weight: w, opacity: .75, interactive: true }).bindTooltip("<strong>" + esc(c.corridor.split(" — ")[0]) + "</strong><br>" + fmt(trips) + " trips a day (" + c.share + "%)" + (c.trucks ? "<br>plus every truck" : ""), { sticky: true }).addTo(state.corr);
      var mid = pts[Math.floor(pts.length / 2)];
      L_.marker(mid, { icon: L_.divIcon({ className: "rcorr-label", html: fmt(trips) + "/day", iconSize: [70, 20], iconAnchor: [35, 10] }), interactive: false }).addTo(state.corr);
    });
    state.allBounds = L_.latLngBounds([].concat.apply([], Object.keys(C).map(function (k) { return C[k]; })).concat(R.route)).pad(0.05);
    var off = 0; setInterval(function () { off = (off - 1 + 18) % 18; var e = state.route.getElement && state.route.getElement(); if (e) e.style.strokeDashoffset = off; }, 60);
    ui.mapNote.innerHTML = "Two study intersections out at the Expressway service roads (Route 454 at Express Drive North and South) are on the report card but off this map.";
  }
  function renderView() {
    var m = state.map; if (!m) return;
    ui.viewSeg.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", b.dataset.v === state.view); });
    if (state.view === "all") { state.corr.addTo(m); state.route.setStyle({ opacity: .35 }); m.fitBounds(state.allBounds); ui.viewNote.innerHTML = "All <strong>10,815</strong> daily trips, by the study's own split: Nicolls Road 29%, Sunrise Highway 26% from the east and 24% from the west, Route 454 14%, and the rest on Broadway and Church Street. Thicker line, more trips. Tap a road."; }
    else { m.removeLayer(state.corr); state.route.setStyle({ opacity: .95 }); m.fitBounds(state.bounds); ui.viewNote.innerHTML = "Every truck trip, by the study's own routing, comes down Nicolls Road from the Expressway and turns onto Route 454 to a new gateway at Church Street. Pins show how each intersection grades today and with the warehouse; tap one."; }
  }
  function buildReport() {
    var los = SPS.los || [];
    ui.report.innerHTML = '<div class="row head"><div class="who">Intersection</div><div class="what">Today <span class="muted">AM · PM</span></div><div class="what">With the warehouse <span class="muted">AM · PM</span></div></div>' +
      los.map(function (r) { var d = r.delay || {}, add = function (e, b) { return e != null && b != null ? '<span class="dsec ' + (b - e >= 5 ? "bad" : b - e > 0 ? "warm" : "ok") + '">' + (b - e >= 0 ? "+" : "") + fmt(b - e, 0) + " s</span>" : ""; }; return '<div class="row"><div class="who">' + esc(r.intersection.replace(" (new gateway)", "")) + (r.note ? '<div class="small muted">' + esc(r.note) + "</div>" : "") + '</div><div class="what">' + gradeChip(r.existingAM) + " " + gradeChip(r.existingPM) + (d.existingAM != null ? '<div class="small muted">' + fmt(d.existingAM, 0) + " s · " + fmt(d.existingPM, 0) + " s wait per car</div>" : "") + '</div><div class="what">' + gradeChip(r.buildAM) + " " + gradeChip(r.buildPM) + (d.buildAM != null ? '<div class="small">' + add(d.existingAM, d.buildAM) + " " + add(d.existingPM, d.buildPM) + "</div>" : "") + "</div></div>"; }).join("") +
      '<p class="small muted" style="margin-top:8px">Seconds are the study\'s average wait per car at the light; "+12 s" is what the warehouse adds by its own count. A 15-minute commute through two or three of these lights gains 10 to 30 seconds on paper — if the operator\'s trip counts hold. The left turn from Broadway onto Route 454 alone goes from 99 to 130 seconds. "?" means the study did not report that case in the pages we have. The Beacon Drive "A" assumes a new signal, a realigned road, dual turn lanes and a fourth westbound lane are all built first. Source: Stonefield Traffic Impact Study, June 30 2026.</p>';
  }
  function buildWear() {
    var R = SPS.roads, T = SPS.trips, W = R.wear, trucks = T.avg.trucks, cars = T.avg.cars + T.avg.flex;
    var loaded = trucks * W.loadedShare.value, carEq = loaded * W.carsPerLoadedTruck, share = carEq / (carEq + cars);
    var imp = (SPS.impacts || []).filter(function (x) { return x.id === "roads"; })[0];
    ui.wear.innerHTML = '<p>Pavement does not care how many vehicles pass; it cares how heavy they are. A loaded tractor-trailer wears a road like <strong>' + fmt(W.carsPerLoadedTruck) + ' cars</strong>. So the ' + fmt(trucks) + ' truck trips a day' + (W.loadedShare.value < 1 ? ', even if only half run loaded,' : '') + ' do the wear of about <strong>' + fmt(carEq / 1e6, 1) + ' million cars a day</strong> — ' + fmt(share * 100, 1) + '% of the damage, from ' + fmt(trucks / (trucks + cars) * 100, 0) + '% of the traffic.</p>' +
      '<div class="wcontam"><div class="wc"><div class="v">' + fmt(carEq / 1e6, 1) + 'M</div><div class="l">cars\' worth of wear a day</div><div class="s">' + fmt(loaded) + ' loaded trucks × ' + fmt(W.carsPerLoadedTruck) + '</div></div><div class="wc"><div class="v">County road</div><div class="l">Nicolls Road is Suffolk\'s to repave</div><div class="s">CR 97, 14 miles, county property tax</div></div><div class="wc"><div class="v">$0</div><div class="l">committed for the road fixes</div><div class="s">every improvement "subject to approval," no funding in the file</div></div></div>' +
      '<p class="small muted" style="margin-top:8px">' + esc(R.fixes) + ' <a href="' + esc(W.url) + '" target="_blank" rel="noopener">GAO source</a> ' + badge(W.status) + ' · loaded share ' + badge(W.loadedShare.status) + '</p>' +
      '<h3 class="panel-h">' + ic("megaphone") + ' Ask for it in writing</h3><ol class="asks-list">' + R.asks.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + "</ol>";
  }
  function render() {
    var s = sched(), h = state.hour, t = s.trucks[h], v = s.total[h];
    ui.seg.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", b.dataset.p === String(state.peak)); });
    ui.hourVal.innerHTML = '<span class="n">' + t + '</span> trucks';
    ui.hourSub.innerHTML = "between " + hourLabel(h) + " and " + hourLabel((h + 1) % 24) + " — one every <strong>" + (t ? fmt(60 / t, 1) : "—") + " minutes</strong>, plus " + fmt(v - t) + " cars and delivery vans. " + (h >= 22 || h < 6 ? "<strong>While you sleep.</strong>" : h >= 7 && h <= 9 ? "<strong>School bus hours.</strong>" : h >= 16 && h <= 18 ? "<strong>Rush hour, on roads that already fail.</strong>" : "");
    var max = Math.max.apply(null, s.trucks);
    ui.strip.querySelectorAll("span").forEach(function (sp, i) { var tt = s.trucks[i]; sp.style.setProperty("--h", (tt / max * 100) + "%"); sp.classList.toggle("on", i === h); sp.classList.toggle("night", i >= 22 || i < 6); sp.title = hourLabel(i) + ": " + tt + " trucks"; });
  }
  SPS.roadsUI = { init: init, refresh: function () { if (!state.map) return; setTimeout(function () { state.map.invalidateSize(); state.map.fitBounds(state.view === "all" ? state.allBounds : state.bounds); }, 60); } };
  document.addEventListener("DOMContentLoaded", function () { var h = $("#roads-app"); if (h && SPS.roads) { try { init(h); } catch (e) { console.error(e); h.innerHTML = '<p class="muted">Roads failed: ' + esc(e.message) + "</p>"; } } });
})();
