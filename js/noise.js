/* noise.js — "How loud at my house?" calculator + noise page renderers.
   Requires data/noise-params.js (SPS.noise), data/facts.js (SPS.trips), optional Chart.js.
   Model mirrors research/noise-calc.py. Pure functions live in SPS.noiseModel for testing in node. */
(function () {
  var SPS = (typeof window !== "undefined") ? (window.SPS = window.SPS || {}) : (global.SPS = global.SPS || {});

  /* ---------- acoustics ---------- */
  function dbAdd() { var s = 0; for (var i = 0; i < arguments.length; i++) { s += Math.pow(10, arguments[i] / 10); } return 10 * Math.log10(s); }
  function point(Lref, d, dref, rate) { return Lref - (rate || 20) * Math.log10(d / (dref || 50)); }
  function leqEvents(SEL, N, T) { return SEL + 10 * Math.log10(N) - 10 * Math.log10(T || 3600); }
  function leqDuty(Lmax, N, dur, T) { return Lmax + 10 * Math.log10(N * dur / (T || 3600)); }

  // Composite dock-area level at 50 ft for a given daily truck-trip count.
  function composite(tripsPerDay, m) {
    var perHour = tripsPerDay / 24;
    var movements = perHour * m.movementsPerTrip;
    var alarm50 = point(m.alarmAt4ft, 50, 4);
    var pass = leqEvents(m.selTruck, movements);
    var idle = m.idle3 + 10 * Math.log10(m.idlers / 3);
    var alarm = leqDuty(alarm50, movements, m.alarmSeconds);
    return { perHour: perHour, movements: movements, pass: pass, idle: idle, alarm: alarm, total: dbAdd(pass, idle, alarm),
      alarmLmax50: alarm50, brakeLmax50: m.dockLmaxAt100 + 6, minutesBetweenTrucks: 60 / perHour };
  }
  function defaultsFromData(nd) {
    var m = nd.model;
    return { selTruck: m.selTruck.value, idle3: m.idle3.value, alarmAt4ft: m.alarmAt4ft.value, dockLmaxAt100: m.dockLmaxAt100.value,
      movementsPerTrip: m.movementsPerTrip.value, idlers: m.idlers.value, alarmSeconds: m.alarmSeconds.value };
  }
  // Level at distance d (ft) from the nearest dock. o = { trips, ambient, buffer, wall, soft }
  function at(d, o, m) {
    d = Math.max(d, 50);
    var c = composite(o.trips, m);
    var rate = o.soft ? 25 : 20;
    var mit = (o.buffer || 0) + (o.wall || 0);
    var proj = point(c.total, d, 50, rate) - mit;
    var alarm = point(c.alarmLmax50, d, 50, rate) - mit;
    var brake = point(c.brakeLmax50, d, 50, rate) - mit;
    var total = dbAdd(o.ambient, proj);
    return { proj: proj, total: total, inc: total - o.ambient, alarm: alarm, brake: brake, ambient: o.ambient, c: c };
  }

  /* ---------- geometry (local flat-earth in feet around the site centroid) ---------- */
  var FT_PER_M = 3.28084;
  function toXY(latlon, origin) {
    var lat0 = origin[0] * Math.PI / 180;
    return [(latlon[1] - origin[1]) * 111320 * Math.cos(lat0) * FT_PER_M, (latlon[0] - origin[0]) * 110574 * FT_PER_M];
  }
  function lineIntersect(p1, d1, p2, d2) { // p + t*d
    var den = d1[0] * d2[1] - d1[1] * d2[0]; if (Math.abs(den) < 1e-9) return p2;
    var t = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / den;
    return [p1[0] + t * d1[0], p1[1] + t * d1[1]];
  }
  function signedArea(poly) { var a = 0; for (var i = 0; i < poly.length; i++) { var p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }
  // Inset a convex polygon: insets[i] applies to edge i (vertex i → i+1).
  function inset(poly, insets) {
    var n = poly.length, ccw = signedArea(poly) > 0, lines = [];
    for (var i = 0; i < n; i++) {
      var p = poly[i], q = poly[(i + 1) % n], d = [q[0] - p[0], q[1] - p[1]], len = Math.hypot(d[0], d[1]);
      var nrm = ccw ? [-d[1] / len, d[0] / len] : [d[1] / len, -d[0] / len];
      lines.push({ p: [p[0] + nrm[0] * insets[i], p[1] + nrm[1] * insets[i]], d: d });
    }
    var out = [];
    for (var j = 0; j < n; j++) { var a = lines[(j - 1 + n) % n], b = lines[j]; out.push(lineIntersect(a.p, a.d, b.p, b.d)); }
    return out;
  }
  function distToSegment(p, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
    var t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)) : 0;
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
  }
  function inside(p, poly) {
    var c = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var a = poly[i], b = poly[j];
      if (((a[1] > p[1]) !== (b[1] > p[1])) && (p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0])) c = !c;
    }
    return c;
  }
  function distToPolygon(p, poly) {
    if (inside(p, poly)) return 0;
    var best = Infinity;
    for (var i = 0; i < poly.length; i++) best = Math.min(best, distToSegment(p, poly[i], poly[(i + 1) % poly.length]));
    return best;
  }
  function siteDistances(latlon, site) {
    var o = site.centroid, prop = site.polygon.map(function (v) { return toXY(v, o); });
    var env = inset(prop, site.insetFt), p = toXY(latlon, o);
    var dx = p[0], dy = p[1], ang = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
    var dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return { toProperty: distToPolygon(p, prop), toBuilding: distToPolygon(p, env), bearing: dirs[Math.round(ang / 45) % 8], centroidFt: Math.hypot(dx, dy) };
  }


  // Pure per-night count. o = { trips, buffer, wall, soft, windows:"closed"|"open" }
  function nightCount(d, o, m, nd) {
    d = Math.max(d, 50);
    var SL = nd.sleep, rate = o.soft ? 25 : 20, mit = (o.buffer || 0) + (o.wall || 0);
    var outdoor = function (l50) { return point(l50, d, 50, rate) - mit; };
    var reduce = o.windows === "open" ? SL.indoorOpen : SL.indoorClosed;
    var trucks = o.trips / 24 * SL.hours, maneuvers = trucks * m.movementsPerTrip;
    var ev = [
      { key: "alarm", label: "Back-up alarm", n: maneuvers, out: outdoor(nd.cycle[2].lmax50) },
      { key: "brake", label: "Air-brake release", n: maneuvers, out: outdoor(nd.cycle[1].lmax50) },
      { key: "drop", label: "Trailer drop / coupling", n: trucks, out: outdoor(nd.cycle[3].lmax50) },
      { key: "pass", label: "Truck pass-by", n: trucks * 2, out: outdoor(nd.cycle[0].lmax50) }
    ];
    ev.forEach(function (e) { e.inside = e.out - reduce; });
    var count = function (th) { return ev.reduce(function (s, e) { return s + (e.inside >= th ? e.n : 0); }, 0); };
    var wake = count(SL.who.wake), eeg = count(SL.who.eeg), mot = count(SL.who.motility), all = ev.reduce(function (s, e) { return s + e.n; }, 0);
    return { trucks: trucks, maneuvers: maneuvers, ev: ev, wake: wake, eeg: eeg, motility: mot, all: all, reduce: reduce, minutesPerWake: wake ? SL.hours * 60 / wake : Infinity };
  }
  var DEFAULT_OPTS = { buffer: 5, wall: 0, soft: false, windows: "closed", ambient: 45 };

  SPS.noiseModel = { nightCount: nightCount, DEFAULT_OPTS: DEFAULT_OPTS, dbAdd: dbAdd, point: point, leqEvents: leqEvents, leqDuty: leqDuty, composite: composite, at: at, defaultsFromData: defaultsFromData,
    inset: inset, distToPolygon: distToPolygon, siteDistances: siteDistances, toXY: toXY };

  if (typeof document === "undefined") return;

  /* ---------- UI ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return SPS.esc ? SPS.esc(s) : String(s == null ? "" : s); };
  var ic = function (n) { return SPS.icon ? SPS.icon(n) : ""; };
  function el(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") e.className = attrs[k]; else if (k === "html") e.innerHTML = attrs[k]; else if (k === "text") e.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) { var c = arguments[i]; if (c == null) continue; if (Array.isArray(c)) c.forEach(function (x) { if (x != null) e.appendChild(typeof x === "string" ? document.createTextNode(x) : x); }); else e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }
    return e;
  }
  function fmt(n, d) { return isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: d || 0, minimumFractionDigits: d || 0 }) : "—"; }
  function badge(status) { var map = { verified: "verified", unverified: "unverified", estimate: "assumption", paraphrase: "paraphrase" }; return '<span class="basis ' + (map[status] || "assumption") + '">' + esc(status) + '</span>'; }
  SPS.statusBadge = badge;

  function ladderLabel(db, nd) {
    var l = nd.ladder, best = l[0];
    for (var i = 0; i < l.length; i++) if (Math.abs(l[i][0] - db) < Math.abs(best[0] - db)) best = l[i];
    return best[1].toLowerCase() + " (" + best[0] + " dB)";
  }
  function decClass(inc) { return inc < 3 ? "ok" : inc < 6 ? "warn" : inc < 10 ? "bad" : "worst"; }
  function decText(inc, nd) { var t = nd.thresholds.dec; return inc < 3 ? t[0].label : inc < 6 ? t[1].label : t[2].label; }
  function whoText(nightLevel, nd) {
    var w = nd.thresholds.who;
    if (nightLevel < w.loael) return "below the 40 dB level where WHO says night-time health effects begin";
    if (nightLevel < w.lnight) return "above 40 dB (WHO: effects begin) but under its 45 dB road-noise night limit";
    if (nightLevel < w.danger) return "above the WHO 45 dB night limit; \"adverse health effects are observed\"";
    return "above 55 dB — WHO: \"increasingly dangerous for public health\"";
  }

  function init(host) {
    var nd = SPS.noise, m = defaultsFromData(nd), trips = SPS.trips || { avg: { trucks: 555 }, peak: { trucks: 809 } };
    var state = { d: 300, night: true, peak: false, ambientKey: "suburban", ambientCustom: null, buffer: 5, wall: 0, soft: false, addr: null, windows: "closed" };
    var chart = null;

    function ambient() { if (state.ambientCustom != null) return state.ambientCustom; var a = nd.ambient.filter(function (x) { return x.key === state.ambientKey; })[0]; return state.night ? a.night : a.day; }
    function opts() { return { trips: state.peak ? trips.peak.trucks : trips.avg.trucks, ambient: ambient(), buffer: state.buffer, wall: state.wall, soft: state.soft }; }

    /* controls */
    var addrIn = el("input", { type: "text", placeholder: "e.g. 21 Glensummer Rd, Holbrook", "aria-label": "Your address" });
    var addrOut = el("div", { class: "small", style: "margin-top:6px;min-height:1.4em" });
    var locateBtn = el("button", { class: "btn sm", type: "button", html: ic("search") + " Find distance", onclick: function () { geocode(addrIn.value); } });
    var gpsBtn = el("button", { class: "btn sm secondary", type: "button", html: ic("pin") + " Use my location", onclick: useGPS });
    addrIn.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); geocode(addrIn.value); } });

    var dIn = el("input", { type: "range", min: 100, max: 5280, step: 10, value: state.d, "aria-label": "Distance to the nearest loading dock, feet" });
    var dVal = el("span", { class: "val" });
    dIn.addEventListener("input", function () { state.d = +dIn.value; state.addr = null; render(); });

    function seg(name, options, get, set) {
      var box = el("div", { class: "seg", role: "group", "aria-label": name });
      options.forEach(function (o) { box.appendChild(el("button", { type: "button", class: get() === o[0] ? "on" : "", "data-v": String(o[0]), onclick: function () { set(o[0]); render(); } }, o[1])); });
      return box;
    }
    var segs = {};
    function segRow(label, key, options, get, set) { segs[key] = seg(label, options, get, set); return el("div", { class: "ctl-row" }, el("span", { class: "n", text: label }), segs[key]); }
    var ambSel = el("select", { "aria-label": "Background noise preset" });
    nd.ambient.forEach(function (a) { ambSel.appendChild(el("option", { value: a.key, text: a.label + " (" + a.day + " day / " + a.night + " night)" })); });
    ambSel.appendChild(el("option", { value: "custom", text: "I measured it myself…" }));
    ambSel.value = state.ambientKey;
    var ambCustom = el("input", { type: "number", min: 25, max: 80, step: 1, placeholder: "dBA", style: "width:80px;display:none", "aria-label": "Measured background dBA" });
    ambSel.addEventListener("change", function () { if (ambSel.value === "custom") { ambCustom.style.display = ""; state.ambientCustom = +ambCustom.value || 45; } else { ambCustom.style.display = "none"; state.ambientCustom = null; state.ambientKey = ambSel.value; } render(); });
    ambCustom.addEventListener("input", function () { state.ambientCustom = +ambCustom.value || 45; render(); });

    var BANDS = [["My yard touches the site", 300], ["Within a half mile", 1500], ["Half a mile to a mile", 4000], ["More than a mile", 5280]];
    var bandSeg = el("div", { class: "seg big" });
    BANDS.forEach(function (bd) { bandSeg.appendChild(el("button", { type: "button", "data-d": String(bd[1]), onclick: function () { state.d = bd[1]; state.addr = null; dIn.value = state.d; render(); } }, bd[0])); });
    var buildSeg = el("div", { class: "seg big" });
    [["What is in the plan: trees only", 0], ["Add a real sound wall (−10 dB)", 10]].forEach(function (o) { buildSeg.appendChild(el("button", { type: "button", "data-w": String(o[1]), onclick: function () { state.wall = o[1]; state.buffer = 5; render(); } }, o[0])); });
    var controls = el("div", { class: "card noise-ctl" },
      el("div", { class: "q" }, el("div", { class: "lab", text: "How close is your house?" }), bandSeg, el("div", { class: "addr-row", style: "margin-top:8px" }, addrIn, locateBtn), addrOut),
      el("div", { class: "q", style: "margin-top:18px" }, el("div", { class: "lab", text: "What gets built between you and the docks?" }), buildSeg, el("p", { class: "small muted", style: "margin:6px 0 0" }, "The filing promises a 240-foot strip of trees and says a sound wall \"may be required.\" No wall is designed.")));
    var advanced = el("div", { class: "card noise-ctl", style: "margin-top:14px" },
      el("h4", { text: "Change the assumptions" }),
      el("div", { class: "slider-row" }, el("label", null, el("span", { class: "n", text: "Exact distance to the nearest loading dock" }), el("span", { class: "muted small", text: "feet, straight line to the building envelope" })), dIn, dVal),
      segRow("Time", "night", [[true, "Night (10 PM–7 AM)"], [false, "Day"]], function () { return state.night; }, function (v) { state.night = v; }),
      segRow("Day type", "peak", [[false, "Average weekday · 555 trucks"], [true, "Peak day · 809 trucks"]], function () { return state.peak; }, function (v) { state.peak = v; }),
      el("div", { class: "ctl-row" }, el("span", { class: "n", text: "Background noise today" }), el("span", null, ambSel, " ", ambCustom)),
      segRow("Tree buffer", "buffer", [[0, "Cleared"], [5, "240-ft dense buffer · −5 dB"], [10, "Best case · −10 dB"]], function () { return state.buffer; }, function (v) { state.buffer = v; }),
      segRow("Sound wall", "wall", [[0, "None"], [5, "Basic wall · −5 dB"], [10, "Engineered · −10 dB"]], function () { return state.wall; }, function (v) { state.wall = v; }),
      segRow("Ground", "soft", [[false, "Pavement / flat"], [true, "Soft ground"]], function () { return state.soft; }, function (v) { state.soft = v; }),
      segRow("Bedroom window", "windows", [["closed", "Closed · −15 dB"], ["open", "Open · −5 dB"]], function () { return state.windows; }, function (v) { state.windows = v; }),
      el("div", { style: "margin-top:12px" }, el("button", { class: "btn sm secondary", type: "button", onclick: function () { state = { d: 300, night: true, peak: false, ambientKey: "suburban", ambientCustom: null, buffer: 5, wall: 0, soft: false, addr: null, windows: "closed" }; dIn.value = 300; ambSel.value = "suburban"; ambCustom.style.display = "none"; render(); } }, "Reset")));

    /* readout */
    var readout = el("div", { class: "readout noise-readout" });
    var verdict = el("div", { class: "verdict" });
    var canvas = el("canvas", { id: "noise-chart", height: 280 });
    var cycle = el("div", { class: "cycle" });
    var howBox = el("details", { class: "how" }, el("summary", { text: "How this is computed" }), el("pre", { id: "noise-how" }),
      el("p", { class: "small muted", html: "Formulas from NYSDEC DEP-00-1 (6 dB per doubling of distance for a point source, energy addition of levels), FHWA/FTA (tree and barrier attenuation, hourly Leq from event SEL). The dock area is treated as a point source at its nearest edge; it is really a line of docks up to 1,960 ft long, so this understates exposure for homes along the north side. Results are hourly averages (Leq). Single events — an air brake, a trailer drop — are shown separately because that is what wakes people." }));

    function render() {
      var o = opts(), r = at(state.d, o, m), d = state.d;
      dVal.textContent = fmt(d) + " ft";
      Object.keys(segs).forEach(function (k) { var cur = String(state[k]); segs[k].querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", b.dataset.v === cur); }); });
      var bandD = state.d <= 820 ? 300 : state.d <= 2640 ? 1500 : state.d < 5280 ? 4000 : 5280;
      bandSeg.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", +b.dataset.d === bandD); });
      buildSeg.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", +b.dataset.w === (state.wall >= 10 ? 10 : 0)); });
      if (host.__wallSeg) host.__wallSeg.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", +b.dataset.w2 === (state.wall >= 10 ? 10 : 0)); });
      readout.innerHTML = "";
      var cls = decClass(r.inc);
      readout.appendChild(tile(fmt(r.proj, 0) + " dBA", "the warehouse alone, at your house", "hourly average, " + (state.night ? "night" : "day")));
      readout.appendChild(tile("+" + fmt(r.inc, 1) + " dB", "added to today's " + fmt(r.ambient) + " dBA background", decText(r.inc, nd), cls));
      readout.appendChild(tile(fmt(r.alarm, 0) + " dBA", "each back-up alarm, peak", "about " + fmt(r.c.movements, 0) + " dock maneuvers an hour"));
      readout.appendChild(tile(fmt(r.brake, 0) + " dBA", "each air-brake release or trailer drop, peak", "≈ " + ladderLabel(r.brake, nd)));
      var lines = [];
      lines.push("<strong>NYSDEC:</strong> " + (r.inc >= 6 ? "an increase of 6 dB \"may cause complaints\"; " : "") + (r.inc >= 10 ? "approaching 10 dB \"deserves consideration of avoidance and mitigation measures.\"" : r.inc >= 3 ? "3–6 dB has \"potential for adverse noise impact\" for sensitive receptors — homes and a senior residence qualify." : "under 3 dB, \"no appreciable effect.\""));
      if (state.night) lines.push("<strong>WHO:</strong> combined night level " + fmt(r.total, 0) + " dBA is " + whoText(r.total, nd) + ".");
      lines.push("<strong>What it sounds like:</strong> the steady level is about " + ladderLabel(r.total, nd) + "; every " + fmt(r.c.minutesBetweenTrucks, 1) + " minutes a truck adds a " + fmt(r.brake, 0) + " dB peak, " + ladderLabel(r.brake, nd) + ", " + (state.night ? "while you sleep." : "all day."));
      if (state.addr) lines.unshift("<strong>" + esc(state.addr.label) + ":</strong> about " + fmt(state.addr.toBuilding) + " ft from the nearest possible dock and " + fmt(state.addr.toProperty) + " ft from the property line, " + state.addr.bearing + " of the site center. Distances are estimates from the filed setbacks.");
      verdict.className = "verdict " + cls;
      verdict.innerHTML = lines.map(function (l) { return "<p>" + l + "</p>"; }).join("");
      renderNight();
      drawChart(o);
      drawCycle(r, o);
      $("#noise-how").textContent = howText(r, o);
    }
    function tile(v, l, s, cls) { return el("div", { class: "fact" + (cls ? " " + cls : "") }, el("div", { class: "v", text: v }), el("div", { class: "l", text: l }), el("div", { class: "s", text: s })); }
    function howText(r, o) {
      var c = r.c;
      return ["Trucks/day " + o.trips + " ÷ 24 h = " + fmt(c.perHour, 1) + "/h  ×  " + m.movementsPerTrip + " maneuvers = " + fmt(c.movements, 1) + " dock movements/h",
        "Pass-by Leq @50ft = SEL 85 + 10·log10(" + fmt(c.movements, 1) + ") − 10·log10(3600) = " + fmt(c.pass, 1),
        "Idling  Leq @50ft = 69 (3 trucks) + 10·log10(" + m.idlers + "/3) = " + fmt(c.idle, 1),
        "Alarms  Leq @50ft = " + fmt(c.alarmLmax50, 1) + " + 10·log10(" + fmt(c.movements, 1) + "·" + m.alarmSeconds + "/3600) = " + fmt(c.alarm, 1),
        "Dock composite @50ft = 10·log10(Σ10^(L/10)) = " + fmt(c.total, 1) + " dBA",
        "At " + state.d + " ft: " + fmt(c.total, 1) + " − " + (o.soft ? 25 : 20) + "·log10(" + state.d + "/50) − " + (o.buffer + o.wall) + " (trees + wall) = " + fmt(r.proj, 1),
        "With background " + fmt(o.ambient) + ": 10·log10(10^(" + fmt(o.ambient) + "/10) + 10^(" + fmt(r.proj, 1) + "/10)) = " + fmt(r.total, 1) + "  → +" + fmt(r.inc, 1) + " dB",
        "Peaks: alarm " + fmt(c.alarmLmax50, 1) + " @50ft → " + fmt(r.alarm, 1) + ";  air brake/coupling 87 @50ft → " + fmt(r.brake, 1)].join("\n");
    }
    function drawChart(o) {
      if (!window.Chart) return;
      var xs = [], proj = [], tot = [], amb = [], who45 = [], who55 = [];
      for (var d = 100; d <= 5280; d += 60) { var r = at(d, o, m); xs.push(d); proj.push(+r.proj.toFixed(1)); tot.push(+r.total.toFixed(1)); amb.push(o.ambient); who45.push(45); who55.push(55); }
      var here = at(state.d, o, m);
      var cfg = { type: "line", data: { labels: xs, datasets: [
        { label: "Warehouse alone", data: proj, borderColor: "#7a5c9e", backgroundColor: "rgba(122,92,158,.12)", fill: true, pointRadius: 0, tension: .3 },
        { label: "Warehouse + background", data: tot, borderColor: "#c25a3f", pointRadius: 0, tension: .3 },
        { label: "Background today", data: amb, borderColor: "#9aa69f", borderDash: [6, 4], pointRadius: 0 },
        { label: "WHO night limit (45)", data: who45, borderColor: "#3b7ea1", borderDash: [2, 4], pointRadius: 0 },
        { label: "WHO \"increasingly dangerous\" (55)", data: who55, borderColor: "#e5322b", borderDash: [2, 4], pointRadius: 0 },
        { label: "Your house", data: xs.map(function (x) { return null; }), pointRadius: 0 }] },
        options: { maintainAspectRatio: false, animation: false, interaction: { mode: "index", intersect: false },
          scales: { x: { title: { display: true, text: "feet from the nearest dock" }, ticks: { maxTicksLimit: 9, callback: function (v, i) { var x = xs[i]; return x % 1000 === 0 || x === 100 ? (x === 5260 ? "1 mi" : x) : ""; } } }, y: { min: 20, max: 80, title: { display: true, text: "dBA" } } },
          plugins: { legend: { labels: { boxWidth: 10, filter: function (l) { return l.text !== "Your house"; } } }, tooltip: { callbacks: { title: function (it) { return it[0].label + " ft"; } } } } } };
      if (chart) { chart.data = cfg.data; chart.options = cfg.options; chart.update("none"); } else { if (SPS.charts && Chart.defaults) { Chart.defaults.font.family = getComputedStyle(document.documentElement).getPropertyValue("--font"); } chart = new Chart(canvas.getContext("2d"), cfg); }
      // marker
      var idx = Math.round((state.d - 100) / 60);
      chart.data.datasets[5].data = xs.map(function (x, i) { return i === idx ? +here.total.toFixed(1) : null; });
      chart.data.datasets[5].pointRadius = xs.map(function (x, i) { return i === idx ? 6 : 0; });
      chart.data.datasets[5].pointBackgroundColor = "#12261c";
      chart.update("none");
    }
    function drawCycle(r, o) {
      cycle.innerHTML = "";
      var rate = o.soft ? 25 : 20, mit = o.buffer + o.wall;
      nd.cycle.forEach(function (s, i) {
        var lv = point(s.lmax50, state.d, 50, rate) - mit, w = Math.max(4, Math.min(100, (lv - 20) / 60 * 100));
        cycle.appendChild(el("div", { class: "cyc" }, el("div", { class: "k" }, el("span", { class: "step-num", text: String(i + 1) }), s.step), el("div", { class: "bar" }, el("span", { style: "width:" + w + "%" })), el("div", { class: "v", text: fmt(lv, 0) + " dBA" }), el("div", { class: "s muted small", text: s.note })));
      });
    }



    /* ---------- while you sleep: events per night in the bedroom ---------- */
    var SLEEP = nd.sleep;
    function nightStats() { var o = opts(); return nightCount(state.d, { trips: o.trips, buffer: o.buffer, wall: o.wall, soft: o.soft, windows: state.windows }, m, nd); }
    var nightBox = el("div", { class: "sim-result night-hero" });
    function renderNight() {
      var n = nightStats(), r = at(state.d, opts(), m);
      nightBox.innerHTML = "";
      nightBox.appendChild(el("div", { class: "eyebrow", text: "Between " + SLEEP.windowStart + " and " + SLEEP.windowEnd + ", the model says" }));
      if (n.wake) {
        nightBox.appendChild(el("div", { class: "big", text: fmt(n.wake, 0) + " times a night" }));
        nightBox.appendChild(el("div", { class: "sub", text: "something at the docks is loud enough to wake you." }));
        nightBox.appendChild(el("p", { html: "One every <strong>" + interval(n.minutesPerWake) + "</strong>, every night, holidays included. " + fmt(n.trucks, 0) + " trucks arrive or leave while you sleep; each one brakes, backs in with an alarm, and drops a trailer." + (n.eeg > n.wake ? " Another " + fmt(n.eeg - n.wake, 0) + " events are loud enough to fragment sleep without fully waking you." : "") }));
      } else if (n.eeg) {
        nightBox.appendChild(el("div", { class: "big", text: fmt(n.eeg, 0) + " times a night" }));
        nightBox.appendChild(el("div", { class: "sub", text: "the docks are loud enough in your bedroom to fragment your sleep." }));
        nightBox.appendChild(el("p", { html: "Nothing reaches the level where WHO says people fully wake up, but " + fmt(n.eeg, 0) + " events a night cross the line for EEG awakenings and broken sleep. " + fmt(n.trucks, 0) + " trucks arrive or leave while you sleep." }));
      } else {
        nightBox.appendChild(el("div", { class: "big ok", text: "Below the sleep lines" }));
        nightBox.appendChild(el("div", { class: "sub", text: "at this distance with this mitigation." }));
        nightBox.appendChild(el("p", { html: "No single dock event reaches WHO's sleep-disturbance levels in your bedroom. The steady hum still adds " + fmt(r.inc, 1) + " dB to the night background" + (r.inc >= 3 ? " — NYSDEC's threshold for a noticeable change is 3 dB." : ".") }));
      }
      nightBox.appendChild(nightStrip(n));
      nightBox.appendChild(el("p", { class: "small", style: "margin:12px 0 0", html: "In your bedroom, windows " + state.windows + ": each back-up alarm reaches <strong>" + fmt(n.ev[0].inside, 0) + " decibels</strong>, each air-brake release <strong>" + fmt(n.ev[1].inside, 0) + "</strong>. The World Health Organization says people wake at 42, sleep breaks up at 35, and stirring starts at 32." + (state.addr ? " Your address is about " + fmt(state.addr.toBuilding) + " ft from the nearest possible dock." : "") }));
      if (host.dataset.compact === "1") return;
      nightBox.appendChild(el("p", { class: "small muted", style: "margin:8px 0 0", html: "Trips spread evenly over 24 hours (the applicant's hourly schedule is not public). Indoor levels per NYSDEC DEP-00-1: 15 dB quieter with windows closed, 5 dB with a window open (WHO calls 15 dB a window slightly open, so closed is conservative). WHO Night Noise Guidelines Table 1. <a href=\"" + esc(SLEEP.url) + "\" target=\"_blank\" rel=\"noopener\">Source</a> " + badge(SLEEP.status) + " · Full arithmetic below." }));
    }
    function o() { return opts(); }
    function interval(minutes) { return minutes < 2 ? fmt(minutes * 60, 0) + " seconds" : fmt(minutes, 1) + " minutes"; }
    function nightStrip(n) {
      // one tick per event across the sleep window, colored by which WHO line it crosses
      var W = 1000, H = 54, wrap = el("div", { class: "night-strip" });
      var items = [];
      n.ev.forEach(function (e) { var cnt = Math.round(e.n); for (var i = 0; i < cnt; i++) items.push({ t: (i + Math.random()) / cnt, lv: e.inside }); });
      items.sort(function (a, b) { return a.t - b.t; });
      var ticks = items.map(function (it) { var c = it.lv >= SLEEP.who.wake ? "#e5322b" : it.lv >= SLEEP.who.eeg ? "#d9822b" : it.lv >= SLEEP.who.motility ? "#f2c94c" : "#c9d3cc"; var h = Math.max(6, Math.min(40, (it.lv - 20) * 1.3)); return '<rect x="' + (it.t * W).toFixed(1) + '" y="' + (44 - h) + '" width="1.2" height="' + h + '" fill="' + c + '"/>'; }).join("");
      wrap.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-label="Every dock event during the sleep window">' + ticks + '<line x1="0" y1="44.5" x2="' + W + '" y2="44.5" stroke="#9aa69f" stroke-width="1"/></svg>' +
        '<div class="axis small muted"><span>' + esc(SLEEP.windowStart) + '</span><span>' + fmt(n.all, 0) + ' dock events in ' + SLEEP.hours + ' hours</span><span>' + esc(SLEEP.windowEnd) + '</span></div>' +
        '<div class="legend-icons small"><span><i class="sw" style="background:#e5322b"></i> wakes you (≥' + SLEEP.who.wake + ')</span><span><i class="sw" style="background:#d9822b"></i> EEG awakening (≥' + SLEEP.who.eeg + ')</span><span><i class="sw" style="background:#f2c94c"></i> stirs you (≥' + SLEEP.who.motility + ')</span><span><i class="sw" style="background:#c9d3cc"></i> below</span></div>';
      return wrap;
    }

    /* geocoding */
    function applyLatLon(lat, lon, label) {
      var s = siteDistances([lat, lon], nd.site);
      var dft = Math.round(Math.max(50, s.toBuilding) / 10) * 10;
      state.d = Math.min(5280, dft); dIn.value = state.d;
      state.addr = { label: label, toBuilding: s.toBuilding, toProperty: s.toProperty, bearing: s.bearing };
      addrOut.innerHTML = s.toBuilding > 5280 ? "About " + fmt(s.toBuilding / 5280, 1) + " miles from the site — the slider tops out at one mile, where the hourly average is background but the peaks may still carry on a still night." : "Set to " + fmt(state.d) + " ft.";
      render();
    }
    // 1) US Census geocoder (has house numbers; JSONP because it sends no CORS header). 2) OpenStreetMap Nominatim fallback.
    function jsonp(url, cb, onerr) {
      var name = "spsGeo" + Date.now(), sc = document.createElement("script"), done = false;
      window[name] = function (data) { done = true; cb(data); cleanup(); };
      function cleanup() { delete window[name]; if (sc.parentNode) sc.parentNode.removeChild(sc); }
      sc.onerror = function () { cleanup(); onerr(); };
      setTimeout(function () { if (!done) { cleanup(); onerr(); } }, 12000);
      sc.src = url + "&callback=" + name; document.head.appendChild(sc);
    }
    function geocode(q) {
      q = (q || "").trim(); if (!q) { addrOut.textContent = "Type an address first."; return; }
      if (!/holbrook|bohemia|sayville|bayport|ronkonkoma|islip|patchogue|oakdale|blue point|ny\b|new york|\d{5}/i.test(q)) q += ", Holbrook, NY";
      addrOut.textContent = "Looking up\u2026";
      var censusUrl = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?benchmark=Public_AR_Current&format=jsonp&address=" + encodeURIComponent(q);
      jsonp(censusUrl, function (data) {
        var m = data && data.result && data.result.addressMatches;
        if (m && m.length) { applyLatLon(+m[0].coordinates.y, +m[0].coordinates.x, m[0].matchedAddress.split(",").slice(0, 2).join(",")); return; }
        nominatim(q);
      }, function () { nominatim(q); });
    }
    function nominatim(q) {
      var url = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&viewbox=-73.25,40.60,-72.85,40.95&bounded=1&q=" + encodeURIComponent(q);
      fetch(url, { headers: { "Accept": "application/json" } }).then(function (r) { return r.json(); }).then(function (res) {
        if (!res || !res.length) { addrOut.textContent = "No match. Try the full street name and ZIP (e.g. 21 Glensummer Rd, Holbrook, NY 11741), or use the slider."; return; }
        applyLatLon(+res[0].lat, +res[0].lon, res[0].display_name.split(",").slice(0, 2).join(","));
      }).catch(function () { addrOut.textContent = "Lookup failed (offline?). Use the slider."; });
    }
    function useGPS() {
      if (!navigator.geolocation) { addrOut.textContent = "Location not available in this browser."; return; }
      addrOut.textContent = "Getting location…";
      navigator.geolocation.getCurrentPosition(function (pos) { applyLatLon(pos.coords.latitude, pos.coords.longitude, "Your location"); }, function () { addrOut.textContent = "Location denied. Type an address or use the slider."; }, { timeout: 8000 });
    }

    host.innerHTML = "";
    var compact = host.dataset.compact === "1";
    if (compact) {
      var wallSeg = el("div", { class: "seg big", style: "margin:14px 0 4px" });
      [["Trees only, as filed", 0], ["With a real sound wall", 10]].forEach(function (o) { wallSeg.appendChild(el("button", { type: "button", "data-w2": String(o[1]), onclick: function () { state.wall = o[1]; state.buffer = 5; render(); } }, o[0])); });
      host.appendChild(el("div", { class: "night-wrap" }, nightBox, el("div", { class: "small muted", style: "margin-top:12px" }, "What gets built between you and the docks:"), wallSeg));
      host.__wallSeg = wallSeg;
    } else {
      host.appendChild(el("div", { class: "sim noise-sim" }, controls, nightBox));
    }
    host.appendChild(el("details", { class: "how math" }, el("summary", { text: "Show the math, and change the assumptions" }),
      el("div", { class: "module noise-module", style: "margin-top:12px" },
        el("div", { class: "body" }, advanced,
          el("div", null, readout, verdict, el("div", { class: "chart-box", style: "margin-top:14px" }, el("h4", { text: "Level by distance, with your settings" }), canvas, el("div", { class: "note", text: "Purple: the warehouse's own contribution. Red: what you would hear on top of today's background. Dot: your distance. Peaks from single events are higher than either line." })))),
        el("h3", { style: "margin-top:28px", html: ic("truck") + " One truck, start to finish — at your distance" }), cycle,
        howBox)));
    render();
    host.querySelector("details.math").addEventListener("toggle", function () { if (chart) chart.resize(); });
    SPS.noiseUI.setDistance = function (ft, label) { state.d = Math.max(100, Math.min(5280, Math.round(ft / 10) * 10)); state.addr = label ? { label: label, toBuilding: ft, toProperty: ft, bearing: "" } : null; dIn.value = state.d; render(); };
  }

  /* ---------- static renderers ---------- */
  function renderListen() {
    var host = $("#noise-listen"); if (!host || !SPS.noise) return;
    var clips = SPS.noise.audio || []; var lim = +host.dataset.limit; if (lim) clips = clips.slice(0, lim);
    if (!clips.length) { host.closest("section") && host.closest("section").classList.add("hidden"); return; }
    host.innerHTML = clips.map(function (v) {
      var media = v.yt ? '<button class="vthumb" data-yt="' + esc(v.yt) + '"' + (v.start ? ' data-start="' + esc(v.start) + '"' : '') + ' aria-label="Play: ' + esc(v.title) + '"><img src="https://i.ytimg.com/vi/' + esc(v.yt) + '/hqdefault.jpg" alt="" loading="lazy"><span class="play">' + ic("volume") + '</span></button>' : '<a class="vthumb ext" href="' + esc(v.url) + '" target="_blank" rel="noopener" aria-label="Open: ' + esc(v.title) + '"><span class="play">' + ic("external") + '</span></a>';
      var tag = v.amazon ? '<span class="badge">Amazon</span>' : '<span class="badge gray">not Amazon — comparable 24/7 depot</span>';
      return '<div class="vcard">' + media + '<div class="vbody"><div class="vt">' + esc(v.title) + '</div><div class="small">' + tag + '</div><div class="small">' + esc(v.where) + (v.distance ? " · " + esc(v.distance) : "") + (v.when ? " · " + esc(v.when) : "") + '</div>' + (v.hear ? '<div class="small muted hear">You hear: ' + esc(v.hear) + '</div>' : '') + '<div class="small muted">' + esc(v.by) + ' ' + badge(v.status) + (v.yt ? ' · <a href="https://www.youtube.com/watch?v=' + esc(v.yt) + '" target="_blank" rel="noopener">YouTube</a>' : '') + '</div></div></div>';
    }).join("");
    host.addEventListener("click", function (e) { var b = e.target.closest("[data-yt]"); if (!b) return; var f = document.createElement("div"); f.className = "vframe"; f.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(b.dataset.yt) + '?autoplay=1&rel=0' + (b.dataset.start ? '&start=' + b.dataset.start : '') + '" title="Video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'; b.replaceWith(f); });
  }
  function renderSources() {
    var host = $("#noise-sources"); if (!host || !SPS.noise) return;
    host.innerHTML = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Source</th><th>Level</th><th>Measured at</th><th>Source document</th></tr></thead><tbody>' +
      SPS.noise.sources.map(function (s) { return "<tr><td>" + esc(s.label) + (s.note ? '<div class="small muted">' + esc(s.note) + "</div>" : "") + "</td><td><strong>" + esc(s.level) + " dBA</strong> <span class=\"muted small\">" + esc(s.metric) + "</span></td><td>" + esc(s.ref) + " ft</td><td class=\"small\">" + (SPS.srcHtml ? SPS.srcHtml(s.source, { url: s.url }) : esc(s.source)) + " " + badge(s.status) + "</td></tr>"; }).join("") + "</tbody></table></div>";
  }
  function renderAssumptions() {
    var host = $("#noise-assumptions"); if (!host || !SPS.noise) return;
    var m = SPS.noise.model;
    host.innerHTML = "<ul class=\"small\">" + Object.keys(m).map(function (k) { var p = m[k]; return "<li>" + esc(p.label) + (p.value != null ? ": <strong>" + esc(p.value) + "</strong>" : "") + " " + badge(p.status) + (p.note ? ' <span class="muted">— ' + esc(p.note) + "</span>" : "") + "</li>"; }).join("") +
      "<li>Site outline and building envelope " + badge("estimate") + ' <span class="muted">— ' + (SPS.srcHtml ? SPS.srcHtml(SPS.noise.site.source, { chip: false }) : esc(SPS.noise.site.source)) + "</span></li></ul>";
  }
  function rowsHtml(items) { return '<div class="rows">' + items.map(function (r) { return '<div class="row"><div class="who">' + r[0] + '</div><div class="what">' + r[1] + '</div><div class="src small">' + r[2] + "</div></div>"; }).join("") + "</div>"; }
  function renderRules() {
    var host = $("#noise-rules"); if (!host || !SPS.noise) return;
    host.innerHTML = rowsHtml(SPS.noise.rules.map(function (r) { return [esc(r.who), esc(r.says) + (r.note ? ' <span class="muted">' + esc(r.note) + "</span>" : ""), (r.url ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">Source</a> ' : "") + badge(r.status)]; }));
  }
  function renderCases() {
    var host = $("#noise-cases"); if (!host || !SPS.noise) return;
    host.innerHTML = rowsHtml(SPS.noise.cases.map(function (c) { return [esc(c.place), esc(c.what), '<a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.cite) + "</a> " + badge(c.status)]; }));
  }
  function renderHealth() {
    var host = $("#noise-health"); if (!host || !SPS.noise) return;
    host.innerHTML = rowsHtml(SPS.noise.health.map(function (h) { return ['<span class="stat-inline">' + esc(h.stat) + "</span> " + esc(h.label), esc(h.detail), (h.url ? '<a href="' + esc(h.url) + '" target="_blank" rel="noopener">Source</a> ' : "") + badge(h.status)]; }));
  }
  function renderLight() {
    var host = $("#noise-light"); if (!host || !SPS.noise) return;
    var L = SPS.noise.light;
    host.innerHTML = '<div class="grid cols-2"><div class="card"><h3>' + ic("sun") + " What we know</h3><ul>" + L.facts.map(function (f) { return "<li>" + esc(f.text) + ' <span class="small muted">' + (f.url ? '<a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + esc(f.source) + "</a>" : esc(f.source)) + "</span> " + badge(f.status) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="card"><h3>' + ic("moon") + " What to demand in writing</h3><ul>" + L.asks.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + "</ul></div></div>";
  }
  function renderAsks() {
    var host = $("#noise-asks"); if (!host || !SPS.noise) return;
    if (SPS.asksBlock) { host.innerHTML = '<div data-asks="sleep" data-limit="' + (+host.dataset.limit || 4) + '"></div>'; return; }
    var asks = SPS.noise.asks; var lim = +host.dataset.limit; if (lim) asks = asks.slice(0, lim);
    host.innerHTML = "<ol>" + asks.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + "</ol>";
  }
  function renderLadder() {
    var host = $("#noise-ladder"); if (!host || !SPS.noise) return;
    var nd = SPS.noise;
    host.innerHTML = '<div class="ladder">' + nd.ladder.map(function (r) { return '<div class="rung"><span class="db">' + r[0] + '</span><span class="bar"><span style="width:' + ((r[0] - 20) / 80 * 100) + '%"></span></span><span class="t">' + esc(r[1]) + "</span></div>"; }).join("") + '</div><div class="note">dBA is logarithmic: +10 dB sounds about twice as loud; +3 dB is the smallest change most people notice. Everyday levels from the <a href="' + esc(nd.ladderSource.url) + '" target="_blank" rel="noopener">' + esc(nd.ladderSource.label) + "</a>.</div>";
  }

  SPS.noiseUI = SPS.noiseUI || {}; SPS.noiseUI.init = init;
  document.addEventListener("DOMContentLoaded", function () {
    var host = $("#noise-app"); if (host && SPS.noise) { try { init(host); } catch (e) { console.error(e); host.innerHTML = '<p class="muted">Calculator failed to load: ' + esc(e.message) + "</p>"; } }
    renderListen(); renderSources(); renderAssumptions(); renderRules(); renderCases(); renderHealth(); renderLight(); renderAsks(); renderLadder();
    if (SPS.renderIcons) SPS.renderIcons();
  });
})();
