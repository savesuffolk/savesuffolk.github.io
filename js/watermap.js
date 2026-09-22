/* watermap.js — "The aquifer is a filter": story + two synced maps + particle spread, all driven by js/water.js models.
   Public: SPS.waterMap.init(host, { addr }), .refresh(), .setAddress([lat, lon]).
   Map feet: origin = center of the site's south edge (+x east, +y north), 364,000 ft per degree of latitude. Screening-level. */
(function () {
  window.SPS = window.SPS || {};
  var ORIGIN = [40.7701, -73.0625];
  var FT_LAT = 1 / 364000, FT_LON = 1 / (364000 * Math.cos(40.77 * Math.PI / 180));
  var ll = function (x, y) { return [ORIGIN[0] + y * FT_LAT, ORIGIN[1] + x * FT_LON]; };
  var toFt = function (lat, lon) { return { x: (lon - ORIGIN[1]) / FT_LON, y: (lat - ORIGIN[0]) / FT_LAT }; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return SPS.esc ? SPS.esc(s) : String(s == null ? "" : s); };
  var ic = function (n) { return SPS.icon ? SPS.icon(n) : ""; };
  var fmt = function (n, d) { return isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: d || 0 }) : "—"; };
  function el(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { if (k === "class") e.className = attrs[k]; else if (k === "html") e.innerHTML = attrs[k]; else if (k === "text") e.textContent = attrs[k]; else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); });
    for (var i = 2; i < arguments.length; i++) { var c = arguments[i]; if (c == null) continue; if (Array.isArray(c)) c.forEach(function (x) { if (x != null) e.appendChild(typeof x === "string" ? document.createTextNode(x) : x); }); else e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }
    return e;
  }
  function setOrigin() { var poly = SPS.noise && SPS.noise.site && SPS.noise.site.polygon; if (!poly) return; var la = 0, lo = 0; poly.forEach(function (q) { la += q[0] / poly.length; lo += q[1] / poly.length; }); ORIGIN = [la - 1250 * FT_LAT, lo]; }

  var M = function () { return SPS.water && SPS.water.model; };
  var WP = function () { return SPS.waterParams.map; };
  var DAYS = 365.25, PLUME_THICK_FT = 30; // the recharge plume rides the top of the water table; 30 ft is our assumption (full aquifer is 140 ft)
  var state = { years: 10, playing: false, addr: null, timer: null };
  var L_ = null, host = null, ui = {}, maps = {}, syncing = false, antsTimer = null, antsOffset = 0, raf = null, particles = [], rain = [];

  /* ---- model glue ---- */
  function params() { return M().defaults(); }
  function frame(v) {
    var th = v.flowDir * Math.PI / 180, u = { x: Math.sin(th), y: Math.cos(th) }, p = { x: Math.cos(th), y: -Math.sin(th) };
    var c = { x: 0 - u.x * (v.sourceLength / 2), y: 1250 - u.y * (v.sourceLength / 2) };
    return { u: u, p: p, c: c, toMap: function (xp, yp) { return { x: c.x + u.x * xp + p.x * yp, y: c.y + u.y * xp + p.y * yp }; }, toFlow: function (x, y) { var dx = x - c.x, dy = y - c.y; return { x: dx * u.x + dy * u.y, y: dx * p.x + dy * p.y }; } };
  }
  function lateral(s, x, tDays, frac) { if (M().plumeConc(s, x, 0, tDays) / s.C0 < frac) return null; var lo = 0, hi = s.Y / 2 + 8 * Math.sqrt(s.aT * Math.max(x, 1)) + 800; for (var i = 0; i < 26; i++) { var mid = (lo + hi) / 2; if (M().plumeConc(s, x, mid, tDays) / s.C0 >= frac) lo = mid; else hi = mid; } return lo; }
  function contour(s, fr, tDays, frac) {
    var xmax = s.vp * tDays * s.beta + 5 * Math.sqrt(s.aL * s.vp * Math.max(tDays, 1)) + 300, step = Math.max(60, xmax / 70), right = [], left = [], area = 0, len = 0;
    for (var x = step; x <= xmax; x += step) { var yh = lateral(s, x, tDays, frac); if (yh == null) break; right.push([x, yh]); left.push([x, -yh]); area += 2 * yh * step; len = x; }
    if (!right.length) return null;
    var pts = [[0, s.Y / 2]].concat(right).concat(left.reverse()).concat([[0, -s.Y / 2]]);
    return { poly: pts.map(function (q) { var m = fr.toMap(q[0], q[1]); return ll(m.x, m.y); }), areaFt2: area, lengthFt: len };
  }
  function spreadAt(years, v, s, fr) { var c = contour(s, fr, years * DAYS, 0.1); if (!c) return { len: 0, acres: 0, gal: 0 }; return { len: c.lengthFt, acres: c.areaFt2 / 43560, gal: c.areaFt2 * PLUME_THICK_FT * v.ne * 7.48052 }; }
  function arrival(s, fr, x, y) { var f = fr.toFlow(x, y); if (f.x <= 0) return { first: null, t50: null, behind: true, lateral: f.y }; var b = M().breakthrough(s, f.x, f.y, 60, 0.5); return { first: b.firstArrival, t50: b.t50, behind: false, lateral: f.y }; }
  function receptors() {
    var lakes = WP().lakes, top = lakes.reduce(function (a, q) { return q[1] > a[1] ? q : a; }, lakes[0]);
    return { lakes: { label: "Sans Souci Lakes", x: top[0], y: top[1] }, bay: { label: "Great South Bay", x: 0, y: -21000 }, church: { label: "Church Street wells", x: WP().wells[0].x, y: WP().wells[0].y, q: WP().wells[0].q }, greenbelt: { label: "Green Belt Parkway wells", x: WP().wells[1].x, y: WP().wells[1].y } };
  }
  function colorFor(frac) { return frac >= 0.5 ? "#8e2f1f" : frac >= 0.1 ? "#d9822b" : "#f2c94c"; }

  /* ---- story blocks ---- */
  function storyHtml(v, s, fr, b, l) {
    var cl = l.rows.filter(function (r) { return r.key === "Cl"; })[0], na = l.rows.filter(function (r) { return r.key === "Na"; })[0], pb = l.rows.filter(function (r) { return r.key === "Pb"; })[0];
    var demand = v.demandGpd * DAYS / 1e6;
    var bar = function (label, val, cls, max) { return '<div class="wbar ' + cls + '"><span class="l">' + label + '</span><span class="track"><span class="fill" style="width:' + Math.min(100, val / max * 100) + '%"></span></span><span class="v">' + fmt(val, 0) + ' M gal/yr</span></div>'; };
    return '' +
      '<section class="wstep"><div class="wnum">1</div><div><h3>The ground is the filter</h3><p>There is no reservoir on Long Island. Rain falls on the woods, sinks through 19 feet of sand, and comes out clean in the aquifer every tap in Suffolk draws from. On this site that is about <strong>' + fmt(b.pre.total, 0) + ' million gallons a year</strong> of clean water, made for free.</p>' + designationHtml() + bar("Clean water the woods make today", b.pre.total, "clean", 100) + '</div></section>' +
      '<section class="wstep"><div class="wnum">2</div><div><h3>The warehouse turns the filter off</h3><p>Pave 84 acres and the rain no longer filters through soil. It runs off roof and truck court, picks up road salt, oil, tire metals and diesel drips, and is pumped straight into the ground through drywells: <strong>' + fmt(b.post.drywell, 0) + ' million gallons a year</strong>, untreated. On top of that the building drinks <strong>' + fmt(demand, 0) + ' million gallons a year</strong> from the same aquifer.</p>' + bar("Clean water the woods make", 0, "clean", 100) + bar("Untreated runoff injected", b.post.drywell, "dirty", 100) + bar("Pumped out for the warehouse", demand, "drawn", 100) + '<p class="small">Net: about <strong>' + fmt(b.pre.total + demand, 0) + ' million gallons a year</strong> of clean water gone, replaced by ' + fmt(b.post.drywell, 0) + ' million of salty water.</p>' +
      '<div class="wcontam"><div class="wc"><div class="v">' + fmt(na.ratio, 0) + '×</div><div class="l">the drinking-water standard for sodium</div><div class="s">' + fmt(na.concMgL, 0) + ' mg/L in the runoff vs 20 allowed</div></div><div class="wc"><div class="v">At the limit</div><div class="l">chloride and lead</div><div class="s">' + fmt(cl.concMgL, 0) + ' mg/L chloride vs 250; lead ' + pb.concMgL.toFixed(3) + ' vs 0.025</div></div><div class="wc"><div class="v">' + fmt(l.salt.clLb / 2000, 0) + ' tons</div><div class="l">of chloride a year from deicing</div><div class="s">44 acres of pavement at 2 tons of salt an acre</div></div></div></div></section>';
  }
  function badge2(st) {
    if (SPS.statusBadge) return SPS.statusBadge(st);
    var map = { verified: "verified", unverified: "unverified", estimate: "assumption", paraphrase: "paraphrase" };
    return '<span class="basis ' + (map[st] || "assumption") + '">' + String(st) + "</span>";
  }
  function designationHtml() {
    var d = (SPS.waterParams || {}).designation; if (!d) return "";
    var esc2 = function (x) { return SPS.esc ? SPS.esc(x) : String(x); };
    return '<div class="wzone"><span class="z">Zone ' + esc2(d.zone) + '</span><div><strong>' + esc2(d.label) + '.</strong> ' + esc2(d.text) +
      ' <a class="small" href="' + esc2(d.url) + '" target="_blank" rel="noopener">' + esc2(d.source) + "</a>" +
      " " + badge2(d.status) + "</div></div>";
  }
  function spreadHtml(v, s, fr) {
    var rows = [5, 10, 30].map(function (y) { var sp = spreadAt(y, v, s, fr); return "<tr><td><button type=\"button\" class=\"yr\" data-yr=\"" + y + "\">Year " + y + "</button></td><td>" + fmt(sp.len / 5280, 1) + " mi south</td><td>" + fmt(sp.acres, 0) + " acres</td><td>" + fmt(sp.gal / 1e9, 1) + " billion gal</td></tr>"; }).join("");
    return '<section class="wstep"><div class="wnum">3</div><div><h3>It spreads, and it compounds</h3><p>Groundwater under Holbrook moves south about ' + fmt(s.vel, 1) + ' feet a day. Every year adds another ' + fmt(v.impervPost, 0) + '-acre dose on top of the last, so the salty water does not pass through — it stacks. Press Play, or a year:</p><div class="tbl-wrap"><table class="tbl wspread"><thead><tr><th></th><th>How far</th><th>Footprint</th><th>Groundwater carrying it</th></tr></thead><tbody>' + rows + '</tbody></table></div><p class="small muted">Footprint and volume are the area where salt is above a tenth of its strength at the site, in the top ' + PLUME_THICK_FT + ' feet of the water table (the aquifer is 140 ft deep; the runoff rides the top of it).</p></div></section>';
  }

  /* ---- maps ---- */
  function makeMap(elm, kind) {
    var m = L_.map(elm, { scrollWheelZoom: false, zoomControl: kind === "after", zoomSnap: 0.25, attributionControl: false }).setView([40.7595, -73.0635], 13.6);
    L_.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, className: "wmap-tiles" }).addTo(m);
    var v = params(), fr = frame(v), R = receptors();
    var site = (SPS.noise && SPS.noise.site && SPS.noise.site.polygon) || WP().site.map(function (q) { return ll(q[0], q[1]); });
    var g = { kind: kind, map: m, ants: [] };
    // road + place labels (our own, few)
    [[40.7690, -73.0790, "Sunrise Highway", "road"], [40.7768, -73.0745, "Veterans Memorial Hwy", "road"], [40.7660, -73.0552, "Nicolls Road", "road"], [40.7515, -73.0725, "Sans Souci County Park", "park"], [40.7455, -73.0560, "Great South Bay", "water"], [40.7790, -73.0560, "Holbrook", "town"], [40.7500, -73.0850, "Sayville", "town"], [40.7480, -73.0500, "Bayport", "town"]].forEach(function (q) { L_.marker([q[0], q[1]], { icon: L_.divIcon({ className: "wmap-place " + q[3], html: esc(q[2]), iconSize: [160, 18], iconAnchor: [80, 9] }), interactive: false }).addTo(m); });
    // Church Street wells: draw area + the flow lines that bend into them
    var cz = M().capture(v, R.church.q), pts = cz.pts.map(function (q) { var x = Math.max(q.x, -7000); var mp = { x: R.church.x + fr.u.x * x + fr.p.x * q.y, y: R.church.y + fr.u.y * x + fr.p.y * q.y }; return ll(mp.x, mp.y); });
    L_.polygon(pts, { color: "#1c6f9c", weight: 1, opacity: .45, dashArray: "3 5", fillColor: "#1c6f9c", fillOpacity: .06, interactive: false }).addTo(m);
    g.captured = [];
    [-1000, -650].forEach(function (x0) { var line = []; for (var t = 0; t <= 1.0001; t += 0.04) { var mt = 1 - t; line.push(ll(mt * mt * x0 + 2 * mt * t * x0 + t * t * R.church.x, mt * mt * 900 + 2 * mt * t * -1400 + t * t * R.church.y)); } g.captured.push(L_.polyline(line, { color: kind === "after" ? "#a1432a" : "#1c6f9c", weight: kind === "after" ? 4 : 3, dashArray: "3 12", opacity: .95, interactive: false }).addTo(m)); });
    L_.marker(ll(-2300, -600), { icon: L_.divIcon({ className: "wmap-label " + (kind === "after" ? "rust" : "blue"), html: "the west side of the site<br>drains into these wells &#8600;", iconSize: [170, 30], iconAnchor: [150, 15] }), interactive: false }).addTo(m);
    g.site = L_.polygon(site, kind === "after" ? { color: "#333", weight: 2, fillColor: "#555", fillOpacity: .6 } : { color: "#1d7a4f", weight: 2, fillColor: "#2f7d5a", fillOpacity: .5 }).addTo(m).bindTooltip(kind === "after" ? "84 acres of roof and truck court, runoff into drywells" : "137 acres of forest: rain filtered through 19 ft of sand", { sticky: true });
    g.plume = L_.layerGroup().addTo(m);
    [-800, 0, 800].forEach(function (off) { var a = fr.toMap(0, off), b2 = fr.toMap(22000, off); g.ants.push(L_.polyline([ll(a.x, a.y), ll(b2.x, b2.y)], { color: kind === "after" ? "#a1432a" : "#1c6f9c", weight: 2, dashArray: "3 12", opacity: kind === "after" ? .5 : .85, interactive: false }).addTo(m)); });
    var arrowAt = fr.toMap(7800, -2300);
    L_.marker(ll(arrowAt.x, arrowAt.y), { icon: L_.divIcon({ className: "wmap-arrow", html: '<span class="ar">&#8595;</span><span class="t">groundwater flows south<br>about 2 feet a day</span>', iconSize: [170, 80], iconAnchor: [85, 40] }), interactive: false }).addTo(m);
    [R.lakes, R.church, R.greenbelt].forEach(function (r) { var p = ll(r.x, r.y); L_.circleMarker(p, { radius: 7, color: "#12261c", weight: 2, fillColor: "#fff", fillOpacity: 1 }).addTo(m).bindTooltip("<strong>" + esc(r.label) + "</strong>"); L_.marker(p, { icon: L_.divIcon({ className: "wmap-label", html: esc(r.label), iconSize: [180, 16], iconAnchor: [-10, 8] }), interactive: false }).addTo(m); });
    // particle canvas
    var cv = el("canvas", { class: "wmap-particles" }); m.getContainer().appendChild(cv); g.canvas = cv;
    if (SPS.fullscreenButton) SPS.fullscreenButton(elm, function () { m.invalidateSize(); sizeCanvas(g); });
    m.on("move", function () { if (syncing) return; syncing = true; Object.keys(maps).forEach(function (k) { if (maps[k] !== g) maps[k].map.setView(m.getCenter(), m.getZoom(), { animate: false }); }); syncing = false; });
    m.on("resize move zoom", function () { sizeCanvas(g); });
    return g;
  }
  function sizeCanvas(g) { var sz = g.map.getSize(); if (g.canvas.width !== sz.x || g.canvas.height !== sz.y) { g.canvas.width = sz.x; g.canvas.height = sz.y; } }

  /* ---- particles ---- */
  function seedParticles(v, s) {
    particles = []; rain = [];
    for (var i = 0; i < 520; i++) { var u1 = Math.random(), u2 = Math.random(); particles.push({ y0: (Math.random() - 0.5) * s.Y, r: Math.random() * 30, n: Math.sqrt(-2 * Math.log(u1 + 1e-9)) * Math.cos(2 * Math.PI * u2), j: Math.random() * 6.28 }); }
    for (var k = 0; k < 90; k++) rain.push({ x: (Math.random() - 0.5) * 2200, y: Math.random() * 2400 + 50, ph: Math.random() * 6.28 });
  }
  function drawParticles(now) {
    var v = params(), s = M().plumeSetup(v), fr = frame(v), T = state.years, tDays = T * DAYS;
    var g = maps.after; if (g && g.canvas) {
      sizeCanvas(g); var ctx = g.canvas.getContext("2d"); ctx.clearRect(0, 0, g.canvas.width, g.canvas.height);
      particles.forEach(function (p) {
        var age = T - p.r; if (age <= 0) return;
        var x = s.vp * age * DAYS * (0.85 + 0.3 * ((Math.sin(p.j) + 1) / 2)); if (x < 30) return;
        var y = p.y0 + p.n * Math.sqrt(2 * s.aT * x) + Math.sin(now / 900 + p.j) * 25;
        var frac = M().plumeConc(s, x, y, tDays) / s.C0; if (frac < 0.004) return;
        var mp = fr.toMap(x, y), pt = g.map.latLngToContainerPoint(ll(mp.x, mp.y));
        ctx.beginPath(); ctx.arc(pt.x, pt.y, frac >= 0.5 ? 3.2 : 2.6, 0, 6.283); ctx.fillStyle = colorFor(frac); ctx.globalAlpha = 0.85; ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    var t = maps.today; if (t && t.canvas) {
      sizeCanvas(t); var c2 = t.canvas.getContext("2d"); c2.clearRect(0, 0, t.canvas.width, t.canvas.height);
      rain.forEach(function (d) { var ph = (now / 2600 + d.ph) % 1; var fy = d.y - ph * 900; var pt = t.map.latLngToContainerPoint(ll(d.x, fy)); c2.beginPath(); c2.arc(pt.x, pt.y, 2.2, 0, 6.283); c2.fillStyle = "#1c6f9c"; c2.globalAlpha = 0.9 * (1 - ph); c2.fill(); });
      c2.globalAlpha = 1;
    }
  }
  function loop(now) { drawParticles(now || 0); raf = requestAnimationFrame(loop); }

  function build() {
    L_ = window.L; if (!L_) { host.innerHTML = '<p class="muted">Map library did not load.</p>'; return; }
    var v = params(), s = M().plumeSetup(v), fr = frame(v), b = M().budget(v), l = M().loads(v);
    seedParticles(v, s);
    var leftEl = el("div", { class: "wmap" }), rightEl = el("div", { class: "wmap" });
    ui.readout = el("div", { class: "readout wmap-readout" });
    ui.slider = el("input", { type: "range", min: 0, max: 30, step: 0.5, value: state.years, "aria-label": "Years after opening" });
    ui.slider.addEventListener("input", function () { state.years = +ui.slider.value; stop(); render(); });
    ui.yearLabel = el("span", { class: "val" });
    ui.play = el("button", { class: "btn sm", type: "button", html: ic("chevron") + " Play 30 years", onclick: function () { if (state.playing) stop(); else play(); } });
    ui.timeRow = el("div", { class: "wmap-time" }, ui.play, el("label", { class: "wmap-years" }, "Years after opening", ui.slider), ui.yearLabel);
    host.innerHTML = "";
    host.appendChild(el("div", { class: "wmap-wrap" },
      el("div", { class: "wstory", html: storyHtml(v, s, fr, b, l) + spreadHtml(v, s, fr) }),
      el("div", { class: "wmap-pair" }, el("div", null, el("div", { class: "wmap-head today", text: "Today: 137 acres of forest" }), leftEl), el("div", null, el("div", { class: "wmap-head after", html: 'With the warehouse — <span id="wmap-yr">year 10</span>' }), rightEl)),
      ui.timeRow,
      el("div", { class: "wmap-legend small" }, el("span", null, el("i", { class: "sw", style: "background:#1c6f9c" }), " clean rain soaking in"), el("span", null, el("i", { class: "sw", style: "background:#f2c94c" }), " a trace of salt"), el("span", null, el("i", { class: "sw", style: "background:#d9822b" }), " a tenth of full strength"), el("span", null, el("i", { class: "sw", style: "background:#8e2f1f" }), " half strength or more"), el("span", null, el("i", { class: "sw", style: "background:#1c6f9c;opacity:.3" }), " where the Church Street wells draw from")),
      el("section", { class: "wstep" }, el("div", { class: "wnum", text: "4" }), el("div", null, el("h3", { text: "Where it lands" }), ui.readout)),
      el("p", { class: "small muted", style: "margin:10px 0 0" }, "Screening model, not a hydrogeologic study. Speed, direction and the road-salt source strength are published USGS/EPA values you can change under \"Show the math.\" Well-field positions are approximate. Base map © OpenStreetMap contributors.")));
    host.addEventListener("click", function (e) { var y = e.target.closest("[data-yr]"); if (y) { stop(); state.years = +y.dataset.yr; ui.slider.value = state.years; render(); var pair = host.querySelector(".wmap-pair"); if (pair) pair.scrollIntoView({ behavior: "smooth", block: "center" }); } });
    maps.today = makeMap(leftEl, "today"); maps.after = makeMap(rightEl, "after");
    startAnts(); if (!raf) loop();
    render();
  }
  function startAnts() { if (antsTimer) return; antsTimer = setInterval(function () { antsOffset = (antsOffset - 1 + 15) % 15; Object.keys(maps).forEach(function (k) { (maps[k].ants.concat(maps[k].captured || [])).forEach(function (pl) { var e = pl.getElement && pl.getElement(); if (e) e.style.strokeDashoffset = antsOffset; }); }); }, 70); }
  function setAddress(latlon) { state.addr = latlon; if (maps.after) render(); }
  function play() { state.playing = true; ui.play.innerHTML = ic("x") + " Stop"; if (state.years >= 30) state.years = 0; state.timer = setInterval(function () { state.years = Math.min(30, state.years + 0.25); ui.slider.value = state.years; render(); if (state.years >= 30) stop(); }, 110); }
  function stop() { state.playing = false; if (state.timer) clearInterval(state.timer); state.timer = null; if (ui.play) ui.play.innerHTML = ic("chevron") + " Play 30 years"; }

  function render() {
    if (!maps.after) return;
    var v = params(), fr = frame(v), s = M().plumeSetup(v), tDays = state.years * DAYS, R = receptors();
    ui.yearLabel.textContent = state.years === 0 ? "opening day" : state.years + (state.years === 1 ? " year" : " years");
    var yr = document.getElementById("wmap-yr"); if (yr) yr.textContent = state.years === 0 ? "opening day" : "year " + Math.round(state.years);
    host.querySelectorAll("[data-yr]").forEach(function (b) { b.classList.toggle("on", +b.dataset.yr === state.years); });
    var g = maps.after; g.plume.clearLayers();
    if (state.years > 0) [[0.01, "#f2c94c", .18], [0.1, "#d9822b", .22], [0.5, "#8e2f1f", .28]].forEach(function (c) { var ct = contour(s, fr, tDays, c[0]); if (ct) L_.polygon(ct.poly, { stroke: false, fillColor: c[1], fillOpacity: c[2], interactive: false }).addTo(g.plume); });
    Object.keys(maps).forEach(function (k) { var mm = maps[k]; if (mm.addr) mm.map.removeLayer(mm.addr); if (state.addr) mm.addr = L_.circleMarker(state.addr, { radius: 8, color: "#e5322b", weight: 3, fillColor: "#fff", fillOpacity: 1 }).addTo(mm.map).bindTooltip("Your house", { permanent: true, direction: "left", className: "wmap-you" }); });
    var aL = arrival(s, fr, R.lakes.x, R.lakes.y), aB = arrival(s, fr, R.bay.x, R.bay.y);
    var lakeNow = M().plumeConc(s, fr.toFlow(R.lakes.x, R.lakes.y).x, fr.toFlow(R.lakes.x, R.lakes.y).y, tDays) / s.C0;
    var tiles = [["In the path", "the Church Street wells, and whoever they serve", "the west side of the site drains into them; one well there was shut in 1993 over a drywell site upgradient"],
      ["Year " + (aL.first == null ? "—" : fmt(aL.first, 0)), "salt reaches Sans Souci Lakes", (state.years > 0 && lakeNow > 0.01 ? "now at " + fmt(lakeNow * 100, 0) + "% of full strength" : "half strength by year " + fmt(aL.t50, 0))],
      ["Year " + (aB.first == null ? "—" : fmt(aB.first, 0)), "salt reaches the Great South Bay", "about 4 miles south"]];
    if (state.addr) { var f = toFt(state.addr[0], state.addr[1]), aY = arrival(s, fr, f.x, f.y); tiles.push(aY.behind ? ["Upstream", "your house sits behind the flow", "the plume moves away from your street — what matters for you is the well"] : aY.first == null ? ["Beside it", "your house is off to the side", Math.round(Math.abs(aY.lateral)).toLocaleString() + " ft from the plume's edge — what matters for you is the well"] : ["Year " + fmt(aY.first, 0), "first traces pass under your block", aY.t50 ? "half strength by year " + fmt(aY.t50, 0) : ""]); }
    ui.readout.innerHTML = tiles.map(function (t) { return '<div class="fact"><div class="v">' + esc(t[0]) + '</div><div class="l">' + esc(t[1]) + '</div><div class="s">' + esc(t[2]) + "</div></div>"; }).join("");
  }

  SPS.waterMap = {
    init: function (h, opts) { host = h; setOrigin(); if (opts && opts.addr) state.addr = opts.addr; var qy = new URLSearchParams(location.search).get("wyears"); if (qy) state.years = +qy; build(); },
    refresh: function () { setTimeout(function () { Object.keys(maps).forEach(function (k) { maps[k].map.invalidateSize(); sizeCanvas(maps[k]); }); }, 60); },
    setAddress: setAddress, state: state
  };
  document.addEventListener("DOMContentLoaded", function () { var h = $("#water-map"); if (h && !host && SPS.water) { try { SPS.waterMap.init(h); } catch (e) { console.error(e); h.innerHTML = '<p class="muted">Map failed: ' + esc(e.message) + "</p>"; } } });
})();
