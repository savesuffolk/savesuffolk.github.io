/* voices.js — "Voices from other towns": filterable attributed quotes, promises table, video gallery. Requires data/voices.js. */
(function () {
  window.SPS = window.SPS || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return SPS.esc ? SPS.esc(s) : String(s == null ? "" : s); };
  var ic = function (n) { return SPS.icon ? SPS.icon(n) : ""; };
  var badge = function (st) { return SPS.statusBadge ? SPS.statusBadge(st) : ""; };
  var state = { topic: "", region: "" };

  function quoteCard(q, f) {
    var pos = q.topics.indexOf("positive") >= 0;
    return '<blockquote class="q' + (pos ? " pos" : "") + (q.status === "paraphrase" ? " para" : "") + '"><p>' + (q.status === "paraphrase" ? "" : "“") + esc(q.text) + (q.status === "paraphrase" ? "" : "”") + '</p><footer><strong>' + esc(q.who) + "</strong>" + (q.desc ? ", " + esc(q.desc) : "") + (f ? " · " + esc(f.place) : "") + '<span class="cite"><a href="' + esc(q.url) + '" target="_blank" rel="noopener">' + esc(q.outlet) + (q.when ? ", " + esc(q.when) : "") + "</a> " + badge(q.status) + "</span></footer></blockquote>";
  }

  function renderPull() { renderPullInto($("#voices-pull")); renderPullInto($("#voices-pull-values")); }
  function renderPullInto(host) {
    if (!host || !SPS.voices) return;
    var picks = [], topic = host.dataset.topic || "", lim = +host.dataset.limit || 0;
    SPS.voices.facilities.forEach(function (f) { f.quotes.forEach(function (q) { if (q.pull && (!topic || q.topics.indexOf(topic) >= 0)) picks.push([q, f]); }); });
    if (topic && picks.length < (lim || 3)) SPS.voices.facilities.forEach(function (f) { f.quotes.forEach(function (q) { if (!q.pull && q.status === "verified" && q.topics.indexOf(topic) >= 0 && picks.length < (lim || 3)) picks.push([q, f]); }); });
    if (lim) picks = picks.slice(0, lim);
    host.innerHTML = picks.map(function (p) { return quoteCard(p[0], p[1]); }).join("");
  }

  function renderFilters() {
    var host = $("#voices-filters"); if (!host || !SPS.voices) return;
    var V = SPS.voices;
    host.innerHTML = '<div class="slide-tabs" id="voices-topics"><button data-t="" class="on">All</button>' + Object.keys(V.topics).map(function (k) { return '<button data-t="' + k + '">' + esc(V.topics[k]) + "</button>"; }).join("") + "</div>" +
      '<div class="cal-controls"><select id="voices-region"><option value="">Everywhere</option>' + Object.keys(V.regions).map(function (k) { return '<option value="' + k + '">' + esc(V.regions[k]) + "</option>"; }).join("") + '</select><span class="small muted" id="voices-count"></span></div>';
    host.addEventListener("click", function (e) { var b = e.target.closest("[data-t]"); if (!b) return; state.topic = b.dataset.t; host.querySelectorAll("[data-t]").forEach(function (x) { x.classList.toggle("on", x === b); }); renderList(); });
    $("#voices-region").addEventListener("change", function (e) { state.region = e.target.value; renderList(); });
  }

  function renderList() {
    var host = $("#voices-list"); if (!host || !SPS.voices) return;
    var n = 0, html = "";
    SPS.voices.facilities.forEach(function (f) {
      if (state.region && f.region !== state.region) return;
      var qs = f.quotes.filter(function (q) { return !state.topic || q.topics.indexOf(state.topic) >= 0; });
      if (!qs.length) return; n += qs.length;
      html += '<section class="facility" id="f-' + esc(f.id) + '"><div class="fhead"><div><h3>' + esc(f.place) + (f.analog ? ' <span class="badge">size analog</span>' : "") + '</h3><div class="fmeta">' + esc(f.name) + " · " + esc(f.size) + " · opened " + esc(f.opened) + "</div></div></div>" + (f.why ? '<p class="fwhy">' + esc(f.why) + "</p>" : "") + '<div class="qgrid">' + qs.map(function (q) { return quoteCard(q); }).join("") + "</div></section>";
    });
    host.innerHTML = html || '<p class="muted">Nothing matches that filter.</p>';
    var c = $("#voices-count"); if (c) c.textContent = n + " quotes";
  }

  function renderPromises() {
    var host = $("#voices-promises"); if (!host || !SPS.voices) return;
    host.innerHTML = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Town</th><th>What they were told</th><th>What happened</th></tr></thead><tbody>' + SPS.voices.promises.map(function (p) { return "<tr><td><strong>" + esc(p.place) + "</strong></td><td>" + esc(p.promised) + "</td><td>" + esc(p.happened) + ' <a class="small" href="' + esc(p.url) + '" target="_blank" rel="noopener">source</a> ' + badge(p.status) + "</td></tr>"; }).join("") + "</tbody></table></div>";
  }
  function renderNo() {
    var host = $("#voices-no"); if (!host || !SPS.voices) return;
    host.innerHTML = SPS.voices.saidNo.map(function (t) { return '<div class="card"><h3>' + esc(t.place) + ' <span class="muted small">' + esc(t.size) + "</span></h3><p>" + esc(t.what) + '</p><p class="small" style="font-style:italic">' + esc(t.quote) + '</p><div class="src"><a href="' + esc(t.url) + '" target="_blank" rel="noopener">Source</a> ' + badge(t.status) + "</div></div>"; }).join("");
  }
  function renderVideos() {
    var host = $("#voices-videos"); if (!host || !SPS.voices) return;
    host.innerHTML = SPS.voices.videos.map(function (v) {
      var media = v.yt ? '<button class="vthumb" data-yt="' + esc(v.yt) + '" aria-label="Play: ' + esc(v.title) + '"><img src="https://i.ytimg.com/vi/' + esc(v.yt) + '/hqdefault.jpg" alt="" loading="lazy"><span class="play">' + ic("video") + "</span></button>" : '<a class="vthumb ext" href="' + esc(v.url) + '" target="_blank" rel="noopener"><span class="play">' + ic("external") + "</span></a>";
      return '<div class="vcard">' + media + '<div class="vbody"><div class="vt">' + esc(v.title) + '</div><div class="small muted">' + esc(v.outlet) + (v.date ? " · " + esc(v.date) : "") + "</div>" + (v.note ? '<div class="small">' + esc(v.note) + "</div>" : "") + (v.yt ? '<a class="small" href="https://www.youtube.com/watch?v=' + esc(v.yt) + '" target="_blank" rel="noopener">Open on YouTube</a>' : "") + "</div></div>";
    }).join("");
    host.addEventListener("click", function (e) {
      var b = e.target.closest("[data-yt]"); if (!b) return;
      var f = document.createElement("div"); f.className = "vframe"; f.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(b.dataset.yt) + '?autoplay=1&rel=0" title="Video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      b.replaceWith(f);
    });
  }

  SPS.voicesUI = { setTopic: function (t) { state.topic = t || ""; var host = $("#voices-filters"); if (host) host.querySelectorAll("[data-t]").forEach(function (x) { x.classList.toggle("on", x.dataset.t === state.topic); }); renderList(); } };
  document.addEventListener("DOMContentLoaded", function () {
    renderPull(); renderFilters(); renderList(); renderPromises(); renderNo(); renderVideos();
    if (location.hash && /^#f-/.test(location.hash)) { var t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(function () { t.scrollIntoView(); }, 50); }
    if (SPS.renderIcons) SPS.renderIcons();
  });
})();
