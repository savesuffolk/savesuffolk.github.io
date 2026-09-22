/* Stop Project Sunrise — Water & Aquifer Impact module.
   Vanilla JS. Requires: Chart.js v4 (global Chart) and data/water-params.js (SPS.waterParams).
   Public API: SPS.water.init(hostEl)      -> renders the whole section into hostEl
               SPS.water.model.*           -> pure model functions (testable in node)
   Units: feet, days, gallons, mg/L unless stated. 1 acre-inch = 27,154 gal. */
(function () {
  var SPS = (typeof window !== "undefined") ? (window.SPS = window.SPS || {}) : (global.SPS = global.SPS || {});
  var GAL_PER_ACIN = 27154, L_PER_GAL = 3.78541, MG_PER_LB = 453592, FT3_PER_GPM_DAY = 192.5, GAL_PER_FT3 = 7.48052;
  var DAYS_PER_YR = 365.25, OLYMPIC_POOL_GAL = 660000;

  /* ---------- math helpers ---------- */
  // Abramowitz & Stegun 7.1.26, |error| < 1.5e-7
  function erf(x) {
    var s = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  function erfc(x) { return 1 - erf(x); }
  function fin(x, fallback) { return (typeof x === "number" && isFinite(x)) ? x : (fallback === undefined ? 0 : fallback); }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function fmt(n, d) {
    if (!isFinite(n)) return "—";
    d = d === undefined ? 0 : d;
    return n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });
  }
  function sig(n, s) { // significant figures
    if (!isFinite(n) || n === 0) return isFinite(n) ? "0" : "—";
    var d = Math.max(0, (s || 2) - 1 - Math.floor(Math.log10(Math.abs(n))));
    return n.toLocaleString(undefined, { maximumFractionDigits: Math.min(d, 6), minimumFractionDigits: 0 });
  }
  function hoursLabel(h) {
    if (!isFinite(h)) return "—";
    if (h < 1) return fmt(h * 60, 0) + " min";
    if (h < 72) return fmt(h, 1) + " h";
    if (h < 24 * 365) return fmt(h / 24, 1) + " days";
    return fmt(h / 24 / 365.25, 1) + " yr";
  }

  /* ---------- parameter access ---------- */
  function defaults() {
    var v = {};
    (SPS.waterParams.groups || []).forEach(function (g) {
      (g.params || []).forEach(function (p) { v[p.key] = p.default; });
      (g.fixed || []).forEach(function (p) { v[p.key] = p.value; });
    });
    return v;
  }

  /* =====================================================================
     MODULE 1 — Recharge & runoff budget
     R_cover = A(ac) × P(in) × f  → gallons = ac·in × 27,154
     Pre : forest×f_forest (+ trace impervious)
     Post: forest×f_forest + landscape×f_turf + impervious×C_runoff×f_drywell (roof + pavement, via drywells)
     ET / not recharged = total precip on site − recharge
     ===================================================================== */
  function budget(v) {
    var mg = function (ac, inches) { return ac * inches * GAL_PER_ACIN / 1e6; };
    var pre = {
      forest: mg(v.forestPre, v.P * v.fForest),
      imperv: mg(v.impervPre, v.P * v.cRunoff)
    };
    pre.total = pre.forest + pre.imperv;
    pre.et = mg(v.siteAc, v.P) - pre.total;
    var post = {
      forest: mg(v.forestPost, v.P * v.fForest),
      turf: mg(v.landscapeAc, v.P * v.fTurf),
      roof: mg(v.roofAc, v.P * v.cRunoff * v.fDrywell),
      pave: mg(v.paveAc, v.P * v.cRunoff * v.fDrywell)
    };
    post.drywell = post.roof + post.pave;
    post.total = post.forest + post.turf + post.drywell;
    post.et = mg(v.siteAc, v.P) - post.total;
    var demandMG = v.demandGpd * DAYS_PER_YR / 1e6;
    return {
      pre: pre, post: post,
      demandMG: demandMG,
      ratioDemand: fin(post.drywell / demandMG),
      ratioPave: fin(post.pave / demandMG),
      pools: post.drywell * 1e6 / OLYMPIC_POOL_GAL,
      stormMG: mg(v.impervPost, v.designStormIn),
      pctUntreated: fin(100 * post.drywell / post.total),
      gpdDrywell: post.drywell * 1e6 / DAYS_PER_YR,
      rechargeIn: v.P * v.cRunoff
    };
  }

  /* =====================================================================
     MODULE 2 — Pollutant loading (EMC method) and road salt
     L(lb/yr) = 0.2266 × EMC(mg/L) × R(in/yr) × A(ac)        [Schueler "Simple Method"]
     Concentration in recharge (mg/L) = L × 453,592 / (V_gal × 3.785)
     Salt: M_NaCl = rate(ton/ac/yr) × A_pave ; Cl = 0.607·M ; Na = 0.393·M
     ===================================================================== */
  function loads(v) {
    var grp = SPS.waterParams.groups.filter(function (g) { return g.id === "loads"; })[0];
    var R = v.P * v.cRunoff;                    // inches of runoff per year off impervious
    var truckAc = clamp(v.truckAc, 0, v.paveAc), parkAc = v.paveAc - truckAc, roofAc = v.roofAc;
    var b = budget(v);
    var denomGal = [v.paveAc * R * GAL_PER_ACIN, v.impervPost * R * GAL_PER_ACIN, b.post.total * 1e6][clamp(Math.round(v.denom), 0, 2)];
    var salt = saltModel(v);
    var rows = grp.emc.map(function (e) {
      var truck = e.truck, park = e.park, roof = e.roof;
      if (e.key === "PAH" && v.sealcoat >= 0.5) { truck = 0.328; park = 0.328; }
      var r = {
        key: e.key, label: e.label, std: e.std, stdLabel: e.stdLabel, stdBasis: e.stdBasis,
        truckLb: 0.2266 * truck * R * truckAc,
        parkLb: 0.2266 * park * R * parkAc,
        roofLb: 0.2266 * roof * R * roofAc,
        extraLb: 0
      };
      if (e.key === "TN") { r.extraLb = v.fertN * v.landscapeAc * 0.25; r.extraLabel = "fertilizer leaching (25%)"; }
      if (e.salt) { r.extraLb = (e.key === "Cl") ? salt.clLb : salt.naLb; r.extraLabel = "deicing salt"; }
      r.totalLb = r.truckLb + r.parkLb + r.roofLb + r.extraLb;
      r.concMgL = fin(r.totalLb * MG_PER_LB / (denomGal * L_PER_GAL));
      r.ratio = (e.std && e.std > 0) ? r.concMgL / e.std : null;
      return r;
    });
    return { rows: rows, R: R, truckAc: truckAc, parkAc: parkAc, roofAc: roofAc, denomGal: denomGal, salt: salt };
  }
  function saltModel(v) {
    var tons = v.saltRate * v.paveAc;
    var clLb = tons * 2000 * v.clFrac, naLb = tons * 2000 * v.naFrac;
    var R = v.P * v.cRunoff;
    var paveGal = v.paveAc * R * GAL_PER_ACIN, siteGal = budget(v).post.total * 1e6;
    var conc = function (lb, gal) { return fin(lb * MG_PER_LB / (gal * L_PER_GAL)); };
    return {
      tonsNaCl: tons, clLb: clLb, naLb: naLb, clTons: clLb / 2000, naTons: naLb / 2000,
      clPave: conc(clLb, paveGal), naPave: conc(naLb, paveGal),
      clSite: conc(clLb, siteGal), naSite: conc(naLb, siteGal)
    };
  }

  /* =====================================================================
     MODULE 3 — Vertical travel time to the water table
     (a) Green–Ampt ponded infiltration, piston wetting front through L = DTW − pool depth:
         t = (Δθ/Ks)·[ L − (H+ψ)·ln(1 + L/(H+ψ)) ]              (days, Ks in ft/d)
     (b) Diesel: retention threshold V* = θ_res · A_pool · L ; LNAPL front v_o ≈ Ks·(ρo/ρw)/(μo/μw)
     (c) Fire water: V = Q·duration, same Green–Ampt travel time
     (d) Contrast: natural percolation ≈ L_total / (recharge rate / θ_field)
     ===================================================================== */
  function greenAmptDays(L, Ks, dTheta, Hpsi) {
    if (L <= 0) return 0;
    if (Ks <= 0) return Infinity;
    return (dTheta / Ks) * (L - Hpsi * Math.log(1 + L / Hpsi));
  }
  function vertical(v) {
    var L = v.dtw - v.poolDepth;
    var Hpsi = v.head + v.psi;
    var rainHours = greenAmptDays(L, v.Ks, v.dTheta, Hpsi) * 24;
    var poolArea = Math.PI * v.poolRadius * v.poolRadius;
    var spillCapGal = v.thetaRes * poolArea * Math.max(L, 0) * GAL_PER_FT3;
    var spillGal = v.spillGal * v.spillFrac;
    var oilV = v.Ks * v.oilDensity / v.oilVisc;   // ft/day
    var spillDays = L > 0 ? L / oilV : 0;
    var fireGal = v.fireQ * v.fireDur;
    var fireHours = greenAmptDays(L, v.Ks, v.dTheta, Hpsi + 4) * 24; // surcharged pools, +4 ft head
    var forestYears = v.dtw / ((v.naturalRechargeIn / 12) / v.fieldTheta);
    return {
      L: L, rainHours: rainHours, spillCapGal: spillCapGal, spillGal: spillGal, spillReaches: spillGal > spillCapGal,
      spillHours: spillDays * 24, oilV: oilV, fireGal: fireGal, fireHours: fireHours, forestHours: forestYears * 365.25 * 24, forestYears: forestYears,
      fireDrywells: fireGal / (poolArea * v.poolDepth * GAL_PER_FT3)
    };
  }

  /* =====================================================================
     MODULE 4 — 2-D Domenico (1987) vertically-averaged plume, continuous source of width Y
     v = K·i/nₑ ;  v' = v/R ;  λ = ln2/t½ ;  β = √(1 + 4·λ·αL/v')
     C(x,y,t) = (C₀/4) · exp[ x(1−β)/(2αL) ] · erfc[ (x − v'tβ) / (2√(αL v' t)) ]
                · { erf[(y+Y/2)/(2√(αT x))] − erf[(y−Y/2)/(2√(αT x))] }
     x = distance downgradient from the source line (ft), y = lateral offset (ft), t in days, αT = αL/10
     ===================================================================== */
  function plumeSetup(v) {
    var vel = v.K * v.i / v.ne;
    var vp = vel / Math.max(v.R, 1);
    var lam = v.halfLife > 0 ? Math.LN2 / (v.halfLife * DAYS_PER_YR) : 0;
    var aL = Math.max(v.alphaL, 0.1), aT = aL / 10;
    var beta = Math.sqrt(1 + 4 * lam * aL / vp);
    return { vel: vel, vp: vp, lam: lam, aL: aL, aT: aT, beta: beta, Y: v.sourceWidth, C0: v.C0 };
  }
  function plumeConc(s, x, y, tDays) {
    if (x <= 0 || tDays <= 0) return (x <= 0 && Math.abs(y) <= s.Y / 2 && x > -1e-9) ? s.C0 : 0;
    var term1 = Math.exp(Math.min(0, x * (1 - s.beta) / (2 * s.aL)));
    var term2 = erfc((x - s.vp * tDays * s.beta) / (2 * Math.sqrt(s.aL * s.vp * tDays)));
    var sx = 2 * Math.sqrt(s.aT * x);
    var term3 = erf((y + s.Y / 2) / sx) - erf((y - s.Y / 2) / sx);
    return fin((s.C0 / 4) * term1 * term2 * term3);
  }
  function breakthrough(s, x, y, maxYears, stepYears) {
    var out = [], first = null, t50 = null;
    for (var t = 0; t <= maxYears + 1e-9; t += stepYears) {
      var c = plumeConc(s, x, y, t * DAYS_PER_YR);
      out.push({ t: t, c: c });
      if (first === null && c / s.C0 >= 0.01) first = t;
      if (t50 === null && c / s.C0 >= 0.5) t50 = t;
    }
    return { series: out, firstArrival: first, t50: t50, final: out[out.length - 1].c };
  }
  // flow-coordinate transform: map ft (x east, y north) -> (xp downgradient, yp lateral) relative to source line
  function flowFrame(v) {
    var th = v.flowDir * Math.PI / 180;
    var u = { x: Math.sin(th), y: Math.cos(th) };        // unit vector along flow
    var p = { x: Math.cos(th), y: -Math.sin(th) };       // lateral
    var site = SPS.waterParams.map.site;
    var cx = 0, cy = 0; site.forEach(function (q) { cx += q[0] / site.length; cy += q[1] / site.length; });
    var back = v.sourceLength / 2;
    var c = { x: cx - u.x * back, y: cy - u.y * back }; // upgradient edge center = source line
    return { u: u, p: p, c: c, toFlow: function (x, y) { var dx = x - c.x, dy = y - c.y; return { x: dx * u.x + dy * u.y, y: dx * p.x + dy * p.y }; } };
  }

  /* =====================================================================
     MODULE 5 — Capture zone of a pumping well in uniform flow (Javandel & Tsang 1986)
     T = K·b ; Q in ft³/d (gpm × 192.5) ; x downgradient from the well
     Stagnation point x_s = Q/(2π T i) ; far-field width W = Q/(T i)
     Envelope: x = y / tan(2π T i y / Q),  |y| < W/2
     ===================================================================== */
  function capture(v, Qgpm) {
    var Q = (Qgpm === undefined ? v.Q : Qgpm) * FT3_PER_GPM_DAY;
    var T = v.K * v.b;
    var Ti = T * v.i;
    var xs = fin(Q / (2 * Math.PI * Ti));
    var W = fin(Q / Ti);
    var pts = [];
    var n = 80;
    for (var k = 1; k < n; k++) {
      var y = -W / 2 + (W * k) / n;
      var a = 2 * Math.PI * Ti * y / Q;
      var x = Math.abs(a) < 1e-9 ? xs : y / Math.tan(a);
      pts.push({ x: clamp(fin(x, -1e6), -30000, xs), y: y });
    }
    return { T: T, xs: xs, W: W, halfW: W / 2, pts: pts, Qft3: Q };
  }

  SPS.water = SPS.water || {};
  SPS.water.model = { defaults: defaults, budget: budget, loads: loads, salt: saltModel, vertical: vertical, greenAmptDays: greenAmptDays,
    plumeSetup: plumeSetup, plumeConc: plumeConc, breakthrough: breakthrough, flowFrame: flowFrame, capture: capture, erf: erf, erfc: erfc };

  if (typeof document === "undefined") { return; } // node testing: models only

  /* ======================= UI ======================= */
  var PARAMS = SPS.waterParams, MAP = PARAMS.map;
  var state = defaults();
  var charts = {};
  var pendingDraw = null;

  function el(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null) continue;
      if (Array.isArray(c)) c.forEach(function (x) { if (x != null) e.appendChild(typeof x === "string" ? document.createTextNode(x) : x); });
      else e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return e;
  }
  function toast(msg) {
    if (SPS.toast) return SPS.toast(msg);
    var t = document.querySelector(".toast") || document.body.appendChild(el("div", { class: "toast" }));
    t.textContent = msg; t.classList.add("show"); setTimeout(function () { t.classList.remove("show"); }, 1800);
  }
  function cssVar(name, fb) { var s = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return s || fb; }
  function themeCharts() {
    if (!window.Chart) return;
    Chart.defaults.color = cssVar("--fg", "#222");
    Chart.defaults.borderColor = cssVar("--border", "#ddd");
    Chart.defaults.font.family = cssVar("--font", "sans-serif");
  }
  var COLORS = { green: "#2f7d5a", green2: "#8fc7a6", yellow: "#f3cf73", red: "#c25a3f", blue: "#3b7ea1", gray: "#9aa69f", orange: "#d9822b" };

  function groupBy(id) { return PARAMS.groups.filter(function (g) { return g.id === id; })[0]; }
  function basisTag(b) { return el("span", { class: "basis " + b, text: b }); }
  function decimals(step) { var s = String(step); return s.indexOf(".") >= 0 ? s.split(".")[1].length : 0; }

  function slider(p, onChange) {
    var inp = el("input", { type: "range", min: p.min, max: p.max, step: p.step, value: state[p.key] });
    var val = el("span", { class: "val", text: fmt(state[p.key], decimals(p.step)) + " " + (p.unit.length > 10 ? "" : p.unit) });
    inp.addEventListener("input", function () {
      state[p.key] = parseFloat(inp.value);
      val.textContent = fmt(state[p.key], decimals(p.step)) + " " + (p.unit.length > 10 ? "" : p.unit);
      onChange();
    });
    var lab = el("label", null, el("span", { class: "n" }, p.label, basisTag(p.basis)), el("span", { class: "muted small", text: p.unit.length > 10 ? p.unit : (p.note || "") }));
    return el("div", { class: "slider-row", title: p.source || "" }, lab, inp, val);
  }
  function controls(groupId, onChange, extra) {
    var g = groupBy(groupId);
    var box = el("div", { class: "card" });
    g.params.forEach(function (p) { box.appendChild(slider(p, onChange)); });
    if (extra) box.appendChild(extra);
    var reset = el("button", { class: "btn sm secondary", type: "button", onclick: function () {
      g.params.forEach(function (p) { state[p.key] = p.default; });
      var fresh = controls(groupId, onChange, extra); box.replaceWith(fresh); onChange();
    } }, "Reset to defaults");
    box.appendChild(el("div", { style: "margin-top:10px" }, reset));
    return box;
  }
  function tile(v, l, s, warn) { return el("div", { class: "fact" + (warn ? " warn" : "") }, el("div", { class: "v", text: v }), el("div", { class: "l", text: l }), s ? el("div", { class: "s", text: s }) : null); }
  function how(title, eqn, explain) {
    return el("details", { class: "how" }, el("summary", { text: title || "How this is computed" }), el("pre", { text: eqn }), explain ? el("p", { class: "small muted", html: explain }) : null);
  }
  function makeChart(canvas, cfg) {
    themeCharts();
    if (charts[canvas.id]) { charts[canvas.id].destroy(); }
    charts[canvas.id] = new Chart(canvas.getContext("2d"), cfg);
    return charts[canvas.id];
  }
  function updateChart(id, fn) { var c = charts[id]; if (!c) return; fn(c); c.update("none"); }

  /* ---------- Module 1 UI ---------- */
  function moduleBudget() {
    var readout = el("div", { class: "readout" });
    var canvas = el("canvas", { id: "wc-budget", height: 260 });
    function render() {
      var b = budget(state);
      readout.innerHTML = "";
      readout.appendChild(tile(sig(b.post.drywell, 3) + " MG/yr", "untreated roof + pavement runoff injected via drywells", "million gallons per year", true));
      readout.appendChild(tile(fmt(b.ratioDemand, 1) + "×", "the project's own 72,000 gal/day water demand", "(" + sig(b.demandMG, 3) + " MG/yr)"));
      readout.appendChild(tile(sig(b.post.pave, 3) + " MG/yr", "from truck courts & parking alone", fmt(b.ratioPave, 1) + "× demand"));
      readout.appendChild(tile(fmt(b.pctUntreated, 0) + "%", "of all recharge under the site becomes untreated runoff", "was 0% (forest)"));
      readout.appendChild(tile(sig(b.stormMG, 3) + " MG", "injected in ~24 h by one 8-inch design storm", "83.8 ac × 8 in"));
      readout.appendChild(tile(fmt(b.pools, 0), "Olympic pools per year", "660,000 gal each"));
      var d = [b.pre, b.post];
      updateChart("wc-budget", function (c) {
        c.data.datasets[0].data = [d[0].forest, d[1].forest];
        c.data.datasets[1].data = [0, d[1].turf];
        c.data.datasets[2].data = [0, d[1].roof];
        c.data.datasets[3].data = [d[0].imperv, d[1].pave];
        c.data.datasets[4].data = [d[0].et, d[1].et];
      });
    }
    var body = el("div", { class: "body" }, controls("budget", render),
      el("div", null, readout,
        el("div", { class: "chart-box" }, el("h4", { text: "Where the rain goes — million gallons per year" }), canvas,
          el("div", { class: "note", text: "Forest recharge is slow, filtered percolation through 19–40 ft of soil. Drywell recharge is pavement runoff dropped straight to within a few feet of the water table." })),
        how("How this is computed", "Recharge (gal/yr) = area (ac) × precipitation (in/yr) × fraction × 27,154 gal per acre-inch\n" +
          "Forest: fraction = f_forest (≈0.49)      Landscaping: f_turf (≈0.53)\n" +
          "Roof & pavement: fraction = C_runoff × share sent to drywells (≈0.90 × 1.0)\n" +
          "Evapotranspiration / other = total precipitation on 138.05 ac − recharge",
          "Areas are the applicant's own land-cover table (Full EAF). Roof vs pavement split from the VHB site plan footprints.")));
    var mod = el("div", { class: "module", id: "wm-budget" }, el("h3", { text: "1. More water, dirtier water: the recharge budget" }),
      el("p", { class: "muted", text: "Today 137 acres of pine-oak forest recharge the aquifer through the soil. The plan replaces 100 acres of it with roof and pavement whose runoff is collected in catch basins and injected into drywells — the same disposal pathway that contaminated the neighboring SCWA well in 1993." }), body);
    setTimeout(function () {
      makeChart(canvas, { type: "bar", data: { labels: ["Existing (forest)", "Proposed (warehouse)"], datasets: [
        { label: "Forest recharge", data: [], backgroundColor: COLORS.green },
        { label: "Landscaping recharge", data: [], backgroundColor: COLORS.green2 },
        { label: "Roof → drywells", data: [], backgroundColor: COLORS.yellow },
        { label: "Pavement/truck court → drywells", data: [], backgroundColor: COLORS.red },
        { label: "Evapotranspiration", data: [], backgroundColor: COLORS.gray }
      ] }, options: { responsive: true, scales: { x: { stacked: true }, y: { stacked: true, title: { display: true, text: "MG / yr" } } }, plugins: { legend: { position: "bottom" } } } });
      render();
    }, 0);
    return mod;
  }

  /* ---------- Module 2 UI ---------- */
  var stdLinePlugin = { id: "stdLine", afterDraw: function (chart) {
    var xs = chart.scales.x; if (!xs) return; var x = xs.getPixelForValue(1); if (!isFinite(x)) return;
    var ctx = chart.ctx; ctx.save(); ctx.strokeStyle = COLORS.red; ctx.setLineDash([4, 4]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, chart.chartArea.top); ctx.lineTo(x, chart.chartArea.bottom); ctx.stroke();
    ctx.fillStyle = COLORS.red; ctx.font = "bold 11px sans-serif"; ctx.fillText("= NYS standard", x + 4, chart.chartArea.top + 12); ctx.restore();
  } };
  function moduleLoads() {
    var readout = el("div", { class: "readout" });
    var c1 = el("canvas", { id: "wc-loads", height: 300 }), c2 = el("canvas", { id: "wc-ratio", height: 240 });
    var tblWrap = el("div", { class: "tbl-wrap" });
    function render() {
      var L = loads(state), s = L.salt;
      readout.innerHTML = "";
      readout.appendChild(tile(sig(s.clPave, 3) + " mg/L", "chloride in truck-court/parking recharge", "NYS standard 250 mg/L", s.clPave >= 250));
      readout.appendChild(tile(sig(s.naPave, 3) + " mg/L", "sodium in pavement recharge", "NYS standard 20 mg/L", s.naPave >= 20));
      readout.appendChild(tile(sig(s.clTons, 2) + " tons/yr", "chloride to the aquifer from deicing", sig(s.tonsNaCl, 2) + " tons NaCl on 44 ac"));
      var tss = L.rows.filter(function (r) { return r.key === "TSS"; })[0];
      readout.appendChild(tile(sig(tss.totalLb / 2000, 2) + " tons/yr", "sediment washed into drywells", "accumulates; Goldisc drywell sediments had to be excavated"));
      var og = L.rows.filter(function (r) { return r.key === "OG"; })[0];
      readout.appendChild(tile(sig(og.totalLb, 2) + " lb/yr", "oil & grease", "≈ " + sig(og.totalLb / 7.5, 2) + " gal of oil-equivalent"));
      var zn = L.rows.filter(function (r) { return r.key === "Zn"; })[0], cu = L.rows.filter(function (r) { return r.key === "Cu"; })[0];
      readout.appendChild(tile(sig(zn.totalLb, 2) + " / " + sig(cu.totalLb, 2) + " lb/yr", "zinc / copper (tires, brakes, galvanized roof)", ""));
      var nonSalt = L.rows.filter(function (r) { return !r.saltOnly; });
      updateChart("wc-loads", function (c) {
        c.data.labels = nonSalt.map(function (r) { return r.key; });
        c.data.datasets[0].data = nonSalt.map(function (r) { return r.truckLb > 0 ? r.truckLb : null; });
        c.data.datasets[1].data = nonSalt.map(function (r) { return r.parkLb > 0 ? r.parkLb : null; });
        c.data.datasets[2].data = nonSalt.map(function (r) { return r.roofLb > 0 ? r.roofLb : null; });
        c.data.datasets[3].data = nonSalt.map(function (r) { return r.extraLb > 0 ? r.extraLb : null; });
      });
      var withStd = L.rows.filter(function (r) { return r.ratio !== null; });
      updateChart("wc-ratio", function (c) {
        c.data.labels = withStd.map(function (r) { return r.key + " (" + sig(r.concMgL, 2) + " mg/L)"; });
        c.data.datasets[0].data = withStd.map(function (r) { return Math.max(r.ratio, 1e-3); });
        c.data.datasets[0].backgroundColor = withStd.map(function (r) { return r.ratio >= 1 ? COLORS.red : (r.ratio >= 0.5 ? COLORS.yellow : COLORS.green); });
      });
      tblWrap.innerHTML = "";
      var t = el("table", { class: "tbl" }, el("thead", null, el("tr", null, ["Constituent", "Truck court lb/yr", "Parking lb/yr", "Roof lb/yr", "Other lb/yr", "Total lb/yr", "Conc. in recharge mg/L", "Standard"].map(function (h) { return el("th", { text: h }); }))));
      var tb = el("tbody");
      L.rows.forEach(function (r) {
        tb.appendChild(el("tr", null, [el("td", { text: r.label }), el("td", { text: sig(r.truckLb, 3) }), el("td", { text: sig(r.parkLb, 3) }), el("td", { text: sig(r.roofLb, 3) }),
          el("td", { text: r.extraLb ? sig(r.extraLb, 3) + " (" + r.extraLabel + ")" : "—" }), el("td", { text: sig(r.totalLb, 3) }),
          el("td", { text: sig(r.concMgL, 3), style: r.ratio >= 1 ? "color:var(--danger);font-weight:700" : "" }),
          el("td", null, r.std !== null ? r.stdLabel : r.stdLabel, r.stdBasis === "unverified" ? basisTag("assumption") : null)]));
      });
      t.appendChild(tb); tblWrap.appendChild(t);
    }
    var body = el("div", { class: "body" }, controls("loads", render, controls("salt", render)),
      el("div", null, readout,
        el("div", { class: "grid cols-2" },
          el("div", { class: "chart-box" }, el("h4", { text: "Annual pollutant load washed into drywells (lb/yr, log scale)" }), c1, el("div", { class: "note", text: "Event-mean concentrations: NSQD v4.02 medians. No truck-terminal category exists; freeway/industrial used for truck courts." })),
          el("div", { class: "chart-box" }, el("h4", { text: "Concentration in recharge ÷ NYS groundwater standard" }), c2, el("div", { class: "note", text: "Bars at or beyond the dashed line exceed the Class GA standard before any dilution in the aquifer. Chloride and sodium are conservative: they never break down." }))),
        tblWrap,
        how("How this is computed", "Load (lb/yr) = 0.2266 × EMC (mg/L) × runoff depth (in/yr) × area (ac)       [Simple Method]\n" +
          "Runoff depth = precipitation × C_runoff ≈ 47 × 0.90 = 42.3 in/yr\n" +
          "Salt: NaCl (tons/yr) = rate × 44 paved acres ; chloride = 0.607 × NaCl ; sodium = 0.393 × NaCl\n" +
          "Concentration in recharge (mg/L) = load (lb) × 453,592 / (recharge volume (gal) × 3.785)",
          "Dilution volume toggle: 0 = only the water that falls on pavement (what actually enters the truck-court drywells); 1 = all impervious; 2 = every drop of recharge on the whole site.")));
    var mod = el("div", { class: "module", id: "wm-loads" }, el("h3", { text: "2. What is in the runoff: metals, oil, salt" }),
      el("p", { class: "muted", html: "NYSDEC's own Stormwater Design Manual classifies <em>fleet storage areas</em> and <em>outdoor loading facilities</em> as hotspots whose runoff \"cannot be allowed to infiltrate untreated into groundwater.\" The EAF proposes exactly that for 83.8 acres. Winter is the worst case: road salt goes straight through sand and never degrades." }), body);
    setTimeout(function () {
      makeChart(c1, { type: "bar", data: { labels: [], datasets: [
        { label: "Truck court", data: [], backgroundColor: COLORS.red },
        { label: "Car parking & roads", data: [], backgroundColor: COLORS.yellow },
        { label: "Roof", data: [], backgroundColor: COLORS.blue },
        { label: "Salt / fertilizer", data: [], backgroundColor: COLORS.gray }
      ] }, options: { indexAxis: "y", responsive: true, scales: { x: { type: "logarithmic", title: { display: true, text: "lb / yr" } } }, plugins: { legend: { position: "bottom" } } } });
      makeChart(c2, { type: "bar", data: { labels: [], datasets: [{ label: "C / standard", data: [], backgroundColor: [] }] },
        options: { indexAxis: "y", responsive: true, scales: { x: { type: "logarithmic", min: 0.001, max: 100, title: { display: true, text: "× NYS Class GA standard" } } }, plugins: { legend: { display: false } } }, plugins: [stdLinePlugin] });
      render();
    }, 0);
    return mod;
  }

  /* ---------- Module 3 UI ---------- */
  function moduleVertical() {
    var readout = el("div", { class: "readout" });
    var canvas = el("canvas", { id: "wc-vert", height: 220 });
    function render() {
      var r = vertical(state);
      readout.innerHTML = "";
      readout.appendChild(tile(hoursLabel(r.rainHours), "rain in a drywell → water table", r.L > 0 ? fmt(r.L, 0) + " ft of sand below the pool" : "pool bottom is at/below the water table", true));
      readout.appendChild(tile(fmt(r.spillCapGal, 0) + " gal", "sand can hold before diesel reaches groundwater", "below one 8-ft leaching pool"));
      readout.appendChild(tile(r.spillReaches ? hoursLabel(r.spillHours) : "retained", r.spillReaches ? "one " + fmt(state.spillGal, 0) + "-gal saddle-tank spill reaches the water table" : fmt(r.spillGal, 0) + " gal stays in the sand until the next storm flushes it", "", r.spillReaches));
      readout.appendChild(tile(sig(r.fireGal / 1000, 3) + "k gal", "fire-suppression water in " + fmt(state.fireDur, 0) + " min", "→ drywells in " + hoursLabel(r.fireHours) + "; PFAS foam / battery runoff untreated"));
      readout.appendChild(tile(hoursLabel(r.forestHours), "natural percolation through forest soil (today)", "for contrast"));
      updateChart("wc-vert", function (c) {
        c.data.datasets[0].data = [Math.max(r.forestHours, 0.1), Math.max(r.rainHours, 0.1), r.spillReaches ? Math.max(r.spillHours, 0.1) : null, Math.max(r.fireHours, 0.1)];
      });
    }
    var body = el("div", { class: "body" }, controls("vertical", render),
      el("div", null, readout,
        el("div", { class: "chart-box" }, el("h4", { text: "Time for water/fuel to reach the water table (log scale)" }), canvas,
          el("div", { class: "note", text: "Goldisc (adjacent) and Stimpson (1,170 ft south) both contaminated groundwater through this identical drywell / leaching-pool pathway." })),
        how("How this is computed", "Green–Ampt ponded infiltration through L = depth-to-water − pool depth (ft):\n" +
          "  t (days) = (Δθ / Ks) · [ L − (H+ψ) · ln(1 + L/(H+ψ)) ]\n" +
          "Diesel retention threshold V* = θ_res · π r² · L · 7.48 gal/ft³ ;  LNAPL front speed ≈ Ks · 0.85 / 4\n" +
          "Fire water V = Q · duration ; natural percolation ≈ depth ÷ (23 in/yr ÷ θ_field)",
          "Depth to water is the biggest unknown: the EAF asserts 19 ft with no boring log; EPA data next door say 18–32 ft; USGS wells at the NE corner say ~40 ft.")));
    var mod = el("div", { class: "module", id: "wm-vert" }, el("h3", { text: "3. Hours, not years: how fast a drywell reaches the water table" }),
      el("p", { class: "muted", text: "The site is 99.9% well-drained outwash sand (NRCS). A drywell puts runoff 8–10 ft down, leaving 9–30 ft of sand between a truck court and the drinking-water aquifer." }), body);
    setTimeout(function () {
      makeChart(canvas, { type: "bar", data: { labels: ["Rain through forest soil (today)", "Rain via drywell", "Diesel saddle-tank spill via drywell", "Fire-suppression water via drywells"], datasets: [{ label: "hours", data: [], backgroundColor: [COLORS.green, COLORS.yellow, COLORS.red, COLORS.orange] }] },
        options: { indexAxis: "y", responsive: true, scales: { x: { type: "logarithmic", title: { display: true, text: "hours (1 day = 24, 1 year = 8,766)" } } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return hoursLabel(c.raw); } } } } } });
      render();
    }, 0);
    return mod;
  }

  /* ---------- Module 4 + 5 UI (shared map) ---------- */
  function moduleMap() {
    var W = 720, H = Math.round(W * MAP.heightFt / MAP.widthFt);
    var scale = W / MAP.widthFt;
    var canvas = el("canvas", { id: "wc-map", width: W, height: H, style: "width:100%;height:auto;border:1px solid var(--border);border-radius:8px;background:#f3f4ef;touch-action:none;cursor:crosshair" });
    var btChart = el("canvas", { id: "wc-bt", height: 220 });
    var readout = el("div", { class: "readout" });
    var capReadout = el("div", { class: "readout" });
    var marker = { x: MAP.lakes[0][0] + 100, y: MAP.lakes[0][1] };   // default: north tip of Sans Souci Lakes
    var ui = { showCapture: true, capWell: "church", showStd: true, std: 250 };
    var dragging = false;

    function toPx(x, y) { return { x: (x + MAP.widthFt / 2) * scale, y: (MAP.northFt - y) * scale }; }
    function fromPx(px, py) { return { x: px / scale - MAP.widthFt / 2, y: MAP.northFt - py / scale }; }
    function ramp(ratio) { var t = clamp((Math.log10(ratio) + 3) / 3, 0, 1); var hue = 210 * (1 - t); return "hsla(" + hue + ",85%,45%," + (0.25 + 0.55 * t) + ")"; }
    function capWell() {
      if (ui.capWell === "marker") return { x: marker.x, y: marker.y, q: state.Q, label: "your marker" };
      var w = MAP.wells.filter(function (w) { return w.id === ui.capWell; })[0];
      return { x: w.x, y: w.y, q: state.Q, label: w.label };
    }
    function poly(ctx, pts, fill, stroke, dash) {
      ctx.beginPath(); pts.forEach(function (p, i) { var q = toPx(p[0], p[1]); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.setLineDash(dash || []); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); }
    }
    function draw() {
      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, W, H);
      var s = plumeSetup(state), ff = flowFrame(state), tD = state.tYears * DAYS_PER_YR;
      // heat map
      var nx = 60, ny = 50, cw = W / nx, ch = H / ny;
      for (var iy = 0; iy < ny; iy++) for (var ix = 0; ix < nx; ix++) {
        var p = fromPx((ix + 0.5) * cw, (iy + 0.5) * ch), f = ff.toFlow(p.x, p.y);
        var c = f.x > 0 ? plumeConc(s, f.x, f.y, tD) : 0; // source line sits on the site's upgradient edge
        var r = c / s.C0;
        if (r < 1e-3) continue;
        ctx.fillStyle = ramp(r); ctx.fillRect(ix * cw, iy * ch, cw + 0.5, ch + 0.5);
        if (ui.showStd && c >= ui.std) { ctx.strokeStyle = "rgba(198,40,40,.9)"; ctx.lineWidth = 1; ctx.strokeRect(ix * cw + 0.5, iy * ch + 0.5, cw - 1, ch - 1); }
      }
      // roads
      ctx.strokeStyle = "#6b7570"; ctx.lineWidth = 5;
      var a = toPx(-MAP.widthFt / 2, MAP.sunriseHwyY), b = toPx(MAP.widthFt / 2, MAP.sunriseHwyY); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      a = toPx(MAP.vetsHwyX, MAP.northFt); b = toPx(MAP.vetsHwyX, MAP.sunriseHwyY); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.lineWidth = 2; a = toPx(MAP.beaconDrX, MAP.northFt); b = toPx(MAP.beaconDrX, MAP.sunriseHwyY); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.fillStyle = "#3a4440"; ctx.font = "11px sans-serif";
      var lp = toPx(-MAP.widthFt / 2 + 200, MAP.sunriseHwyY - 250); ctx.fillText("Sunrise Hwy (NY-27)", lp.x, lp.y);
      lp = toPx(MAP.vetsHwyX - 1900, MAP.northFt - 400); ctx.fillText("Vets Mem. Hwy (NY-454)", lp.x, lp.y);
      lp = toPx(MAP.beaconDrX + 100, MAP.northFt - 400); ctx.fillText("Beacon Dr", lp.x, lp.y);
      // site
      poly(ctx, MAP.site, "rgba(47,125,90,.15)", "#2f7d5a");
      lp = toPx(MAP.site[0][0] + 150, MAP.site[2][1] - 300); ctx.fillStyle = "#1f5a41"; ctx.font = "bold 12px sans-serif"; ctx.fillText("Project Sunrise site (138 ac)", lp.x, lp.y);
      // lakes
      poly(ctx, MAP.lakes, "rgba(59,126,161,.45)", "#3b7ea1");
      lp = toPx(MAP.lakes[1][0] + 200, MAP.lakes[1][1] - 600); ctx.fillStyle = "#3b7ea1"; ctx.fillText("Sans Souci Lakes → Brown's River", lp.x, lp.y);
      // superfund sites
      [MAP.goldisc, MAP.stimpson].forEach(function (g) { var q = toPx(g.x, g.y); ctx.fillStyle = "#8a6a1c"; ctx.beginPath(); ctx.moveTo(q.x, q.y - 7); ctx.lineTo(q.x + 7, q.y + 6); ctx.lineTo(q.x - 7, q.y + 6); ctx.closePath(); ctx.fill(); ctx.font = "10px sans-serif"; ctx.fillText(g.label.split(" (")[0], q.x + 9, q.y + 4); });
      // capture zone
      if (ui.showCapture) {
        var w = capWell(), cz = capture(state, w.q), th = state.flowDir * Math.PI / 180, u = { x: Math.sin(th), y: Math.cos(th) }, pv = { x: Math.cos(th), y: -Math.sin(th) };
        var pts = cz.pts.map(function (p) { return [w.x + p.x * u.x + p.y * pv.x, w.y + p.x * u.y + p.y * pv.y]; });
        // close the envelope far upgradient
        var far = -30000; pts.push([w.x + far * u.x + (cz.halfW) * pv.x, w.y + far * u.y + cz.halfW * pv.y]); pts.unshift([w.x + far * u.x - cz.halfW * pv.x, w.y + far * u.y - cz.halfW * pv.y]);
        poly(ctx, pts, "rgba(217,130,43,.18)", "#d9822b", [6, 4]);
        // Art. 7 buffers: 1,500 ft upgradient half-disc, 500 ft downgradient half-disc
        var arc = function (r, from, to) { var pp = []; for (var k = 0; k <= 30; k++) { var ang = from + (to - from) * k / 30; pp.push([w.x + r * Math.cos(ang), w.y + r * Math.sin(ang)]); } return pp; };
        var base = Math.atan2(u.y, u.x); // flow direction angle in (x east, y north)
        var up = arc(state.buffUp, base + Math.PI / 2, base + 3 * Math.PI / 2), down = arc(state.buffDown, base - Math.PI / 2, base + Math.PI / 2);
        poly(ctx, up.concat(down), "rgba(194,90,63,.08)", "#c25a3f", [2, 3]);
        var sp = toPx(w.x + cz.xs * u.x, w.y + cz.xs * u.y); ctx.fillStyle = "#d9822b"; ctx.beginPath(); ctx.arc(sp.x, sp.y, 3, 0, 7); ctx.fill();
      }
      // wells
      MAP.wells.forEach(function (w) { var q = toPx(w.x, w.y); ctx.fillStyle = "#fff"; ctx.strokeStyle = "#3b7ea1"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q.x, q.y, 7, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#3b7ea1"; ctx.font = "bold 10px sans-serif"; ctx.fillText("W", q.x - 4, q.y + 4); ctx.font = "10px sans-serif"; ctx.fillText(w.label.split(" (")[0] + (w.approx ? " (approx.)" : ""), q.x + 10, q.y - 6); });
      // flow arrow
      var th2 = state.flowDir * Math.PI / 180, ax = W - 70, ay = 60; ctx.strokeStyle = "#1f5a41"; ctx.fillStyle = "#1f5a41"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ax - 25 * Math.sin(th2), ay + 25 * Math.cos(th2)); ctx.lineTo(ax + 25 * Math.sin(th2), ay - 25 * Math.cos(th2)); ctx.stroke();
      ctx.font = "10px sans-serif"; ctx.fillText("GW flow " + state.flowDir + "°", ax - 30, ay + 42);
      // north arrow + scale
      ctx.fillText("N ↑", 10, 16); var s1 = toPx(-MAP.widthFt / 2 + 300, -MAP.heightFt + MAP.northFt + 500), s2 = toPx(-MAP.widthFt / 2 + 300 + 5280, -MAP.heightFt + MAP.northFt + 500);
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.lineTo(s2.x, s2.y); ctx.stroke(); ctx.fillText("1 mile", s1.x, s1.y - 5);
      ctx.fillStyle = "#3b7ea1"; ctx.font = "bold 11px sans-serif"; ctx.fillText(MAP.bayLabel, W / 2 - 80, H - 8);
      // marker
      var m = toPx(marker.x, marker.y); ctx.fillStyle = "#d9822b"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(m.x, m.y, 8, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#8a4a1a"; ctx.font = "bold 10px sans-serif"; ctx.fillText("drag me", m.x + 10, m.y + 4);
      // legend
      var lx = 10, ly = H - 70; ctx.font = "10px sans-serif"; ctx.fillStyle = "#3a4440"; ctx.fillText("C / C₀", lx, ly - 4);
      for (var k = 0; k < 30; k++) { ctx.fillStyle = ramp(Math.pow(10, -3 + 3 * k / 30)); ctx.fillRect(lx + k * 3, ly, 3, 10); }
      ctx.fillStyle = "#3a4440"; ctx.fillText("0.001", lx, ly + 20); ctx.fillText("1", lx + 82, ly + 20);
      if (ui.showStd) { ctx.strokeStyle = "rgba(198,40,40,.9)"; ctx.strokeRect(lx, ly + 26, 10, 10); ctx.fillText("≥ " + ui.std + " mg/L", lx + 14, ly + 35); }
      renderReadouts();
    }
    function renderReadouts() {
      var s = plumeSetup(state), ff = flowFrame(state), f = ff.toFlow(marker.x, marker.y);
      var bt = breakthrough(s, f.x, f.y, 50, 0.25);
      readout.innerHTML = "";
      readout.appendChild(tile(fmt(s.vel, 2) + " ft/day", "groundwater velocity", "= " + fmt(s.vel * 365.25, 0) + " ft/yr (EPA measured 1.3–2.9 next door)"));
      readout.appendChild(tile(f.x > 0 ? fmt(f.x / 5280, 2) + " mi" : "upgradient", "marker distance downgradient", fmt(Math.abs(f.y), 0) + " ft off the plume axis"));
      readout.appendChild(tile(bt.firstArrival !== null ? fmt(bt.firstArrival, 1) + " yr" : "> 50 yr", "first arrival at marker (1% of C₀)", "", bt.firstArrival !== null && bt.firstArrival < 15));
      readout.appendChild(tile(bt.t50 !== null ? fmt(bt.t50, 1) + " yr" : "> 50 yr", "half-strength at marker (50% of C₀)", ""));
      readout.appendChild(tile(sig(bt.final, 2) + " mg/L", "at marker after 50 yr", "C₀ = " + state.C0 + " mg/L"));
      updateChart("wc-bt", function (c) { c.data.labels = bt.series.map(function (p) { return p.t; }); c.data.datasets[0].data = bt.series.map(function (p) { return p.c; }); c.data.datasets[1].data = bt.series.map(function () { return ui.std; }); });
      var w = capWell(), cz = capture(state, w.q);
      capReadout.innerHTML = "";
      capReadout.appendChild(tile(fmt(cz.W, 0) + " ft", "capture width of a " + fmt(w.q, 0) + " gpm well", "site is ~2,400 ft wide", cz.W >= 2400));
      capReadout.appendChild(tile(fmt(cz.xs, 0) + " ft", "stagnation point downgradient", "everything upgradient inside the orange envelope ends up in the well"));
      capReadout.appendChild(tile(sig(cz.T, 3) + " ft²/d", "transmissivity T = K·b", ""));
      capReadout.appendChild(tile(fmt(cz.W * cz.T * state.i * GAL_PER_FT3 / 1440, 0) + " gpm", "check: T·i·W ÷ 192.5", "≈ Q"));
    }
    function scheduleDraw() { if (pendingDraw) cancelAnimationFrame(pendingDraw); pendingDraw = requestAnimationFrame(function () { pendingDraw = null; draw(); }); }
    function pointer(ev) { var r = canvas.getBoundingClientRect(); var t = ev.touches ? ev.touches[0] : ev; return { x: (t.clientX - r.left) * W / r.width, y: (t.clientY - r.top) * H / r.height }; }
    function setMarkerFromEvent(ev) { var p = pointer(ev), f = fromPx(p.x, p.y); marker.x = clamp(f.x, -MAP.widthFt / 2, MAP.widthFt / 2); marker.y = clamp(f.y, MAP.northFt - MAP.heightFt, MAP.northFt); scheduleDraw(); }
    canvas.addEventListener("mousedown", function (e) { dragging = true; setMarkerFromEvent(e); });
    canvas.addEventListener("mousemove", function (e) { if (dragging) setMarkerFromEvent(e); });
    window.addEventListener("mouseup", function () { dragging = false; });
    canvas.addEventListener("touchstart", function (e) { dragging = true; setMarkerFromEvent(e); e.preventDefault(); }, { passive: false });
    canvas.addEventListener("touchmove", function (e) { if (dragging) { setMarkerFromEvent(e); e.preventDefault(); } }, { passive: false });
    window.addEventListener("touchend", function () { dragging = false; });

    var presets = el("div", { class: "acts", style: "display:flex;flex-wrap:wrap;gap:6px;margin:8px 0" },
      el("span", { class: "small muted", text: "Put the marker at:" }),
      el("button", { class: "btn sm secondary", type: "button", onclick: function () { marker.x = MAP.lakes[0][0] + 100; marker.y = MAP.lakes[0][1]; scheduleDraw(); } }, "Sans Souci Lakes"),
      el("button", { class: "btn sm secondary", type: "button", onclick: function () { marker.x = MAP.wells[0].x; marker.y = MAP.wells[0].y; scheduleDraw(); } }, "Church St wellfield"),
      el("button", { class: "btn sm secondary", type: "button", onclick: function () { marker.x = MAP.wells[1].x; marker.y = MAP.wells[1].y; scheduleDraw(); } }, "Green Belt Pkwy wellfield"),
      el("button", { class: "btn sm secondary", type: "button", onclick: function () { marker.x = 0; marker.y = MAP.northFt - MAP.heightFt + 300; scheduleDraw(); } }, "South edge of map"));
    var stdInput = el("input", { type: "number", value: ui.std, min: 0, step: 1, style: "width:80px;padding:4px;border:1px solid var(--border);border-radius:6px;background:var(--card);color:var(--fg)", oninput: function (e) { ui.std = parseFloat(e.target.value) || 0; scheduleDraw(); } });
    var stdToggle = el("input", { type: "checkbox", checked: "checked", onchange: function (e) { ui.showStd = e.target.checked; scheduleDraw(); } });
    var capToggle = el("input", { type: "checkbox", checked: "checked", onchange: function (e) { ui.showCapture = e.target.checked; scheduleDraw(); } });
    var capSel = el("select", { onchange: function (e) { ui.capWell = e.target.value; var w = MAP.wells.filter(function (w) { return w.id === ui.capWell; })[0]; if (w) { state.Q = w.q; qSlider.querySelector("input").value = w.q; qSlider.querySelector(".val").textContent = fmt(w.q, 0) + " gal/min"; } scheduleDraw(); } },
      el("option", { value: "church", text: "Church Street wellfield (2,083 gpm summer)" }), el("option", { value: "greenbelt", text: "Green Belt Parkway wellfield (1,000 gpm)" }), el("option", { value: "marker", text: "A well at my marker" }));
    var capParams = groupBy("capture").params;
    var qSlider = slider(capParams[0], scheduleDraw), bSlider = slider(capParams[1], scheduleDraw);
    var capControls = el("div", { class: "card" }, el("h4", { style: "margin:0 0 6px", text: "5. Supply-well capture zone" }),
      el("label", { class: "small", style: "display:flex;gap:6px;align-items:center;margin:4px 0" }, capToggle, "Show capture zone for:"), capSel, qSlider, bSlider,
      el("p", { class: "small muted", html: "Orange envelope = every drop of groundwater that ends up in the well. Red dashed = Suffolk Sanitary Code Art. 7 Water Supply Sensitive Area (1,500 ft upgradient / 500 ft downgradient). Wellfield positions are approximate — see FOIL list." }));
    var plumeControls = controls("plume", scheduleDraw, el("div", null,
      el("label", { class: "small", style: "display:flex;gap:6px;align-items:center;margin:6px 0" }, stdToggle, "Outline cells above ", stdInput, " mg/L")));
    // Reset in controls() rebuilds; keep Q from preset in sync via select
    var body = el("div", { class: "body" }, el("div", null, plumeControls, el("div", { style: "height:12px" }), capControls),
      el("div", null, readout, presets,
        el("div", { class: "chart-box" }, el("h4", { text: "Plume map after the selected number of years — colour = concentration relative to source (log scale)" }), canvas,
          el("div", { class: "note", text: "Screening model: 2-D Domenico solution, continuous source across the site's upgradient edge, vertically averaged over the Upper Glacial aquifer. Real plumes sink with depth and are pulled toward pumping wells; see the capture zone." })),
        el("div", { class: "chart-box" }, el("h4", { text: "Concentration at the marker over time" }), btChart),
        capReadout,
        how("How this is computed", "Groundwater velocity v = K·i / nₑ ;  effective velocity v' = v / R ;  decay λ = ln2 / t½ ;  β = √(1 + 4·λ·αL / v')\n" +
          "C(x,y,t) = (C₀/4) · exp[ x(1−β)/(2αL) ] · erfc[ (x − v'·t·β) / (2√(αL·v'·t)) ]\n" +
          "           · { erf[ (y + Y/2) / (2√(αT·x)) ] − erf[ (y − Y/2) / (2√(αT·x)) ] }        (Domenico 1987; αT = αL/10; Y = 2,400 ft)\n" +
          "Capture zone (Javandel & Tsang 1986): T = K·b ; x_s = Q/(2π·T·i) ; W = Q/(T·i) ; envelope x = y / tan(2π·T·i·y/Q)",
          "Chloride/sodium: R = 1, no decay — the worst case and also the most realistic one for road salt. Defaults give ~2 ft/day, within EPA's measured 1.3–2.9 ft/day at the Goldisc site next door.")));
    var mod = el("div", { class: "module", id: "wm-map" }, el("h3", { text: "4. Where it goes: the plume, the lakes, the wells" }),
      el("p", { class: "muted", html: "Groundwater under Holbrook moves south–southeast toward Sans Souci Lakes, Brown's River and the Great South Bay at roughly 1–3 ft per day (EPA, Goldisc ROD). The site sits between two SCWA wellfields: <strong>Church Street</strong>, whose well CS-2 was shut in 1993 by nickel from the neighboring Goldisc drywells, and <strong>Green Belt Parkway</strong>, where USGS showed that pumping pulls shallow water down into the Magothy." }), body);
    setTimeout(function () {
      makeChart(btChart, { type: "line", data: { labels: [], datasets: [
        { label: "concentration at marker (mg/L)", data: [], borderColor: COLORS.orange, backgroundColor: "rgba(239,108,0,.15)", fill: true, pointRadius: 0, tension: 0.2 },
        { label: "standard", data: [], borderColor: COLORS.red, borderDash: [4, 4], pointRadius: 0, fill: false }
      ] }, options: { responsive: true, scales: { x: { title: { display: true, text: "years after opening" }, ticks: { maxTicksLimit: 11 } }, y: { title: { display: true, text: "mg/L" }, beginAtZero: true } }, plugins: { legend: { position: "bottom" } } } });
      draw();
    }, 0);
    return mod;
  }

  /* ---------- Assumptions & sources, gaps, FOIL, disclaimer ---------- */
  function assumptionsText() {
    var lines = ["Stop Project Sunrise — Water & Aquifer module: assumptions and sources (" + new Date().toLocaleDateString() + ")", ""];
    PARAMS.groups.forEach(function (g) {
      lines.push(g.title);
      (g.params || []).forEach(function (p) { lines.push("  " + p.label + ": " + p.default + " " + p.unit + " [" + p.basis + "] range " + p.min + "–" + p.max + " — " + p.source + (p.note ? " (" + p.note + ")" : "")); });
      (g.fixed || []).forEach(function (p) { lines.push("  " + p.label + ": " + p.value + " " + p.unit + " [" + p.basis + "] — " + p.source); });
      lines.push("");
    });
    lines.push("Disclaimer: " + PARAMS.disclaimer);
    return lines.join("\n");
  }
  function sectionAssumptions() {
    var tb = el("tbody");
    PARAMS.groups.forEach(function (g) {
      tb.appendChild(el("tr", null, el("th", { colspan: 6, text: g.title })));
      (g.params || []).forEach(function (p) {
        tb.appendChild(el("tr", null, el("td", { text: p.label }), el("td", { text: p.default + " " + p.unit }), el("td", { text: p.min + "–" + p.max }), el("td", null, basisTag(p.basis)),
          el("td", { html: SPS.srcHtml ? SPS.srcHtml(p.source, { url: p.url }) : String(p.source || "") }), el("td", { text: p.note || "" })));
      });
      (g.fixed || []).forEach(function (p) {
        tb.appendChild(el("tr", null, el("td", { text: p.label }), el("td", { text: p.value + " " + p.unit }), el("td", { text: "fixed" }), el("td", null, basisTag(p.basis)), el("td", { text: p.source || "" }), el("td", { text: "" })));
      });
    });
    var loadsG = groupBy("loads");
    tb.appendChild(el("tr", null, el("th", { colspan: 6, text: "Runoff concentrations (event-mean, mg/L): truck court / parking / roof" })));
    loadsG.emc.forEach(function (e) { if (e.salt) return; tb.appendChild(el("tr", null, el("td", { text: e.label }), el("td", { text: e.truck + " / " + e.park + " / " + e.roof }), el("td", { text: "" }), el("td", null, basisTag("literature")), el("td", null, el("a", { href: loadsG.emcUrl, target: "_blank", rel: "noopener", text: loadsG.emcSource })), el("td", { text: e.stdLabel }))); });
    var table = el("div", { class: "tbl-wrap" }, el("table", { class: "tbl" }, el("thead", null, el("tr", null, ["Parameter", "Default", "Slider range", "Basis", "Source", "Note"].map(function (h) { return el("th", { text: h }); }))), tb));
    var copyBtn = el("button", { class: "btn sm", type: "button", onclick: function () {
      var txt = assumptionsText();
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { toast("Assumptions copied"); }, function () { fallbackCopy(txt); });
      else fallbackCopy(txt);
    } }, "Copy assumptions as text");
    function fallbackCopy(txt) { var ta = el("textarea", { style: "position:fixed;left:-9999px" }); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast("Assumptions copied"); } catch (e) { toast("Copy failed"); } ta.remove(); }
    var reg = el("ul", null, PARAMS.regulatory.map(function (r) { return el("li", null, r.text, " ", el("a", { href: r.url, target: "_blank", rel: "noopener", text: "[source]" })); }));
    var np = el("ul", null, PARAMS.notProvided.map(function (t) { return el("li", { text: t }); }));
    var foil = el("ul", null, PARAMS.foil.map(function (f) { return el("li", null, el("strong", { text: f.who + ": " }), f.what); }));
    var unv = el("ul", null, PARAMS.unverified.map(function (t) { return el("li", { text: t }); }));
    return el("div", { class: "module", id: "wm-sources" },
      el("h3", { text: "Assumptions, sources and what is missing" }),
      el("div", { class: "grid cols-2" },
        el("div", { class: "card flag" }, el("h3", { text: "What the applicant did not provide" }), np),
        el("div", { class: "card ok" }, el("h3", { text: "What the rules say" }), reg)),
      el("h3", { style: "margin-top:22px", text: "Every parameter, with its basis" }), copyBtn, el("div", { style: "height:8px" }), table,
      el("div", { class: "grid cols-2", style: "margin-top:18px" },
        el("div", { class: "card" }, el("h3", { text: "Records to request (FOIL / SCWA / SCDHS / NYSDEC)" }), foil),
        el("div", { class: "card" }, el("h3", { text: "Flagged as unverified" }), unv)),
      el("div", { class: "disclaimer", style: "margin-top:18px" }, el("strong", { text: "Read this first. " }), PARAMS.disclaimer));
  }

  function init(host) {
    if (!host) return;
    host.innerHTML = "";
    host.appendChild(el("div", { class: "disclaimer" }, el("strong", { text: "Screening-level models. " }), "Not a hydrogeologic study — the applicant has not submitted one. Every default is sourced or labeled an assumption; move the sliders to test any number."));
    host.appendChild(moduleBudget());
    host.appendChild(moduleLoads());
    host.appendChild(moduleVertical());
    host.appendChild(moduleMap());
    host.appendChild(sectionAssumptions());
    // re-theme charts if the viewer toggles dark mode
    if (window.matchMedia) { try { window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { themeCharts(); Object.keys(charts).forEach(function (k) { charts[k].update(); }); }); } catch (e) { } }
  }
  SPS.water.init = init;
})();
