/* review.js — "The review that isn't happening": the 2013 impact statement on this land against the 2026 assessment form.
   Renders SPS.review into #review-app. Numbered references sit with the section. */
(function () {
  window.SPS = window.SPS || {};
  var esc = function (s) { return SPS.esc ? SPS.esc(s) : String(s == null ? "" : s); };
  var ic = function (n) { return SPS.icon ? SPS.icon(n) : ""; };
  var badge = function (st) { return SPS.statusBadge ? SPS.statusBadge(st) : ""; };
  var order = [], marks = {};
  function ref(key) {
    var i = order.indexOf(key); if (i < 0) { order.push(key); i = order.length - 1; }
    return '<sup class="refmark"><a href="#rv-ref-' + (i + 1) + '" aria-label="Reference ' + (i + 1) + '">' + (i + 1) + "</a></sup>";
  }
  function refList(S) {
    if (!order.length) return "";
    return '<h4 class="rsub">Sources for this section</h4><ol class="reflist">' + order.map(function (k, i) {
      var s = S.sources[k] || {};
      return '<li id="rv-ref-' + (i + 1) + '">' + (s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + "</a>" : esc(s.title)) +
        (s.note ? '<div class="rn">' + esc(s.note) + "</div>" : "") + (s.status ? '<div class="rb">' + badge(s.status) + "</div>" : "") + "</li>";
    }).join("") + "</ol>";
  }
  function init(host) {
    var S = SPS.review; if (!S) return;
    order = [];
    var steps = S.steps.map(function (st) {
      return '<section class="wstep"><div class="wnum">' + esc(st.n) + '</div><div><h3>' + esc(st.title) + "</h3><p>" + esc(st.body) + ref(st.cite) + "</p></div></section>";
    }).join("");
    var rows = S.compare.rows.map(function (r) {
      return '<div class="row"><div class="who">' + esc(r.what) + '</div><div class="what then">' + esc(r.then) + '</div><div class="what now">' + esc(r.now) + "</div></div>";
    }).join("");
    host.innerHTML = '<p class="lede">' + esc(S.lead) + "</p>" +
      '<div class="rstory">' + steps + "</div>" +
      '<h4 class="rsub">The same land, then and now</h4>' +
      '<div class="rows cmp"><div class="row head"><div class="who">&nbsp;</div><div class="what">Islip Pines, as the Town zoned it in 2014</div><div class="what">Project Sunrise, as filed in 2026</div></div>' + rows + "</div>" +
      '<p class="small muted">' + esc(S.compare.note) + "</p>" +
      '<p class="small muted"><strong>In fairness.</strong> ' + esc(S.caveat) + "</p>" +
      '<div data-asks="review" data-limit="3" style="margin-top:22px"></div>' +
      '<div class="rrefs" style="margin-top:22px">' + refList(S) + "</div>";
    if (SPS.renderIcons) SPS.renderIcons(host);
  }
  SPS.reviewUI = { init: init };
  document.addEventListener("DOMContentLoaded", function () {
    var h = document.getElementById("review-app");
    if (h && SPS.review) { try { init(h); } catch (e) { console.error(e); h.innerHTML = '<p class="muted">Review section failed: ' + esc(e.message) + "</p>"; } }
  });
})();
