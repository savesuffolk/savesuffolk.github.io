/* values.js — Home Values page: one-question simulator (value + distance), facts as rows, short rebuttals, tax steps.
   Requires data/values.js (SPS.values); uses SPS.noiseModel + SPS.noise.site (js/noise.js, data/noise-params.js) for address → distance. */
(function () {
  window.SPS = window.SPS || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return SPS.esc ? SPS.esc(s) : String(s == null ? "" : s); };
  var ic = function (n) { return SPS.icon ? SPS.icon(n) : ""; };
  var badge = function (st) { return SPS.statusBadge ? SPS.statusBadge(st) : ""; };
  var TIER = { peer: "Peer-reviewed", agency: "Government", working: "University working paper", industry: "Appraisal profession" };
  function money(n) { return "$" + (Math.round(n / 1000) * 1000).toLocaleString(); }
  function el(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { if (k === "class") e.className = attrs[k]; else if (k === "html") e.innerHTML = attrs[k]; else if (k === "text") e.textContent = attrs[k]; else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); });
    for (var i = 2; i < arguments.length; i++) { var c = arguments[i]; if (c == null) continue; if (Array.isArray(c)) c.forEach(function (x) { if (x != null) e.appendChild(typeof x === "string" ? document.createTextNode(x) : x); }); else e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }
    return e;
  }

  // Distance bands → published loss ranges. Sources: industrial 14.9% (<820 ft), Amazon DC 6–10% (<½ mi), freeway 4.6% (200 ft–½ mi) applied conservatively to ½–1 mi.
  var BANDS = [
    { key: "abut", label: "My yard touches the site", ft: 300, lo: 0.10, hi: 0.149, why: "Homes within about 800 feet of an industrial site sold for 15% less; within half a mile of an Amazon distribution center, about 10% less.", src: ["industrial", "amazon-dc"] },
    { key: "half", label: "Within a half mile", ft: 1500, lo: 0.06, hi: 0.10, why: "Homes within half a mile of a new Amazon distribution center sold for 6–10% less.", src: ["amazon-dc"] },
    { key: "mile", label: "Half a mile to a mile", ft: 4000, lo: 0.03, hi: 0.046, why: "Homes from a few hundred feet to half a mile from a freeway sold for 4.6% less per square foot over 16 years; we apply a lower figure out to a mile.", src: ["freeway"] },
    { key: "far", label: "More than a mile", ft: 8000, lo: 0, hi: 0, why: "No study measures a price effect this far out. What reaches you is the tax shift below, and the truck routes.", src: [] }
  ];
  function bandForFt(ft) { return ft <= 820 ? BANDS[0] : ft <= 2640 ? BANDS[1] : ft <= 5280 ? BANDS[2] : BANDS[3]; }
  SPS.valuesModel = { bands: BANDS, bandForFt: bandForFt, money: money };

  function renderSim() {
    var host = $("#values-sim"); if (!host || !SPS.values) return;
    var V = SPS.values, st = { value: V.local.zhvi.value, band: BANDS[1], addr: null };
    var vIn = el("input", { type: "range", min: 300000, max: 1500000, step: 10000, value: st.value, "aria-label": "What your home is worth" });
    var vOut = el("div", { class: "sim-val" });
    vIn.addEventListener("input", function () { st.value = +vIn.value; render(); });
    var seg = el("div", { class: "seg big" });
    BANDS.forEach(function (b) { seg.appendChild(el("button", { type: "button", "data-k": b.key, onclick: function () { st.band = b; st.addr = null; render(); } }, b.label)); });
    var addrIn = el("input", { type: "text", placeholder: "or type your address", "aria-label": "Your address" });
    var addrBtn = el("button", { class: "btn sm secondary", type: "button", html: ic("search") + " Check", onclick: function () { geocode(addrIn.value); } });
    addrIn.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); geocode(addrIn.value); } });
    var addrOut = el("div", { class: "small muted", style: "min-height:1.3em;margin-top:4px" });
    var result = el("div", { class: "sim-result" });

    function render() {
      vOut.textContent = "$" + st.value.toLocaleString();
      seg.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", b.dataset.k === st.band.key); });
      var lo = st.value * st.band.lo, hi = st.value * st.band.hi;
      var srcs = st.band.src.map(function (id) { var s = V.studies.filter(function (x) { return x.id === id; })[0]; return s ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.short || s.cite) + "</a>" : ""; }).filter(Boolean).join(" · ");
      result.innerHTML = st.band.hi ?
        '<div class="eyebrow">The research says</div><div class="big">' + money(lo) + ' to ' + money(hi) + '</div><div class="sub">off the price of your home.</div><p>' + esc(st.band.why) + (st.addr ? " Your address is about " + esc(st.addr) + " from the site." : "") + '</p><p class="small muted">Sources: ' + srcs + '. Published percentages applied to the value you set; not an appraisal.</p>' :
        '<div class="eyebrow">The research says</div><div class="big">Your taxes</div><div class="sub">are what reaches you.</div><p>' + esc(st.band.why) + (st.addr ? " Your address is about " + esc(st.addr) + " from the site." : "") + '</p>';
    }
    function geocode(q) {
      q = (q || "").trim(); if (!q) return;
      if (!/holbrook|bohemia|sayville|bayport|ronkonkoma|islip|patchogue|oakdale|blue point|ny\b|new york|\d{5}/i.test(q)) q += ", Holbrook, NY";
      addrOut.textContent = "Looking up…";
      var name = "spsGeoV" + Date.now(), sc = document.createElement("script"), done = false;
      window[name] = function (data) { done = true; delete window[name]; sc.remove(); var mch = data && data.result && data.result.addressMatches; if (!mch || !mch.length) { addrOut.textContent = "No match — try the full street name and ZIP, or pick a distance above."; return; } if (!SPS.noiseModel || !SPS.noise) { addrOut.textContent = "Distance tool not loaded."; return; } var d = SPS.noiseModel.siteDistances([+mch[0].coordinates.y, +mch[0].coordinates.x], SPS.noise.site); var ft = d.toProperty; st.band = bandForFt(ft); st.addr = ft > 5280 ? (ft / 5280).toFixed(1) + " miles" : Math.round(ft / 10) * 10 + " feet"; addrOut.textContent = mch[0].matchedAddress.split(",").slice(0, 2).join(",") + " — " + st.addr + " from the property line."; render(); };
      sc.onerror = function () { delete window[name]; sc.remove(); addrOut.textContent = "Lookup failed. Pick a distance above."; };
      setTimeout(function () { if (!done) { try { delete window[name]; sc.remove(); } catch (e) { } addrOut.textContent = "Lookup timed out. Pick a distance above."; } }, 12000);
      sc.src = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?benchmark=Public_AR_Current&format=jsonp&address=" + encodeURIComponent(q) + "&callback=" + name; document.head.appendChild(sc);
    }
    host.innerHTML = "";
    SPS.valuesUI = SPS.valuesUI || {}; SPS.valuesUI.setDistance = function (ft, label) { st.band = bandForFt(ft); st.addr = ft > 5280 ? (ft / 5280).toFixed(1) + " miles" : Math.round(ft / 10) * 10 + " feet"; addrOut.textContent = label ? label + " — " + st.addr + " from the property line." : ""; render(); };
    var compact = host.dataset.compact === "1";
    host.appendChild(el("div", { class: "sim" + (compact ? " compact" : "") },
      el("div", { class: "sim-controls" },
        el("div", { class: "q" }, el("div", { class: "lab", text: "What is your home worth?" }), vOut, vIn, el("div", { class: "small muted", html: "Typical Holbrook home: <a href=\"" + esc(V.local.zhvi.url) + "\" target=\"_blank\" rel=\"noopener\">" + esc(V.local.zhvi.display) + "</a> (Zillow, Aug 2026). Slide to yours." })),
        compact ? null : el("div", { class: "q" }, el("div", { class: "lab", text: "How close is the site?" }), seg, el("div", { class: "addr-row", style: "margin-top:8px" }, addrIn, addrBtn), addrOut)),
      result));
    render();
  }

  function renderRows() {
    var host = $("#values-rows"); if (!host || !SPS.values) return;
    host.innerHTML = '<div class="rows">' + SPS.values.studies.map(function (s) {
      return '<div class="row"><div class="who">' + esc(s.who || s.sub) + '</div><div class="what">' + esc(s.what || s.headline) + '</div><div class="src small"><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.short || s.cite) + '</a><br><span class="muted">' + esc(TIER[s.tier] || "") + '</span> ' + badge(s.status) + '</div></div>';
    }).join("") + "</div>";
  }
  function renderCounter() {
    var host = $("#values-counter"); if (!host || !SPS.values) return;
    host.innerHTML = '<div class="rows two">' + (SPS.values.counterShort || []).map(function (c) { return '<div class="row"><div class="who">' + esc(c[0]) + '</div><div class="what">' + esc(c[1]) + "</div></div>"; }).join("") + "</div>" +
      '<p class="small muted" style="margin-top:10px">Full citations for these claims: ' + SPS.values.counter.map(function (c) { return '<a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.source.split(",")[0]) + "</a>"; }).join(" · ") + "</p>";
  }
  function renderTax() {
    var host = $("#values-tax"); if (!host || !SPS.values) return;
    host.innerHTML = "<ol class=\"steps\">" + SPS.values.tax.map(function (t) { return "<li><strong>" + esc(t.step) + ".</strong> " + esc(t.text) + "</li>"; }).join("") + "</ol>";
  }
  function renderPrecedent() {
    var host = $("#values-precedent"); if (!host || !SPS.values) return;
    var p = SPS.values.precedent, a = SPS.values.appraisal;
    host.innerHTML = '<div class="rows two"><div class="row"><div class="who">' + esc(p.title) + '</div><div class="what">' + esc(p.text) + ' <a class="small" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.cite.split(";")[0]) + "</a> " + badge(p.status) + '</div></div>' +
      '<div class="row"><div class="who">Appraisers have a name for it: ' + esc(a.term) + '</div><div class="what">' + esc(a.definition) + " " + esc(a.detail.split(".")[0]) + '. <a class="small" href="' + esc(a.url) + '" target="_blank" rel="noopener">Appraisal Institute</a> ' + badge(a.status) + "</div></div></div>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderSim(); renderRows(); renderCounter(); renderTax(); renderPrecedent();
    if (SPS.renderIcons) SPS.renderIcons();
  });
})();
