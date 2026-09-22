/* concerns.js — "Ask for it in writing" blocks + the reader's basket of concerns.
   SPS.asksBlock(topic) renders a topic's asks with "Add to my concerns" toggles and the action rail; any element with
   data-asks="<topic>" is filled automatically (MutationObserver), so modules only need to output the placeholder.
   SPS.concerns: list()/has()/toggle()/clear()/text()/render(host). Basket lives in localStorage "sps.concerns". */
(function () {
  window.SPS = window.SPS || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return SPS.esc ? SPS.esc(s) : String(s == null ? "" : s); };
  var ic = function (n) { return SPS.icon ? SPS.icon(n) : ""; };
  var LS = "sps.concerns";

  function read() { try { return JSON.parse(localStorage.getItem(LS) || "[]"); } catch (e) { return []; } }
  function write(ids) { try { localStorage.setItem(LS, JSON.stringify(ids)); } catch (e) { } document.dispatchEvent(new CustomEvent("sps:concerns", { detail: ids })); }
  function all() { var out = []; var A = SPS.asks || { order: [], topics: {} }; (A.order || Object.keys(A.topics)).forEach(function (t) { var tp = A.topics[t]; if (tp) tp.items.forEach(function (it) { out.push(Object.assign({ topic: t, topicTitle: tp.title, icon: tp.icon }, it)); }); }); return out; }
  function byId(id) { return all().filter(function (x) { return x.id === id; })[0] || null; }
  function list() { var ids = read(); return all().filter(function (x) { return ids.indexOf(x.id) >= 0; }); }
  function has(id) { return read().indexOf(id) >= 0; }
  function toggle(id) { var ids = read(), i = ids.indexOf(id); if (i >= 0) ids.splice(i, 1); else ids.push(id); write(ids); return i < 0; }
  function clear() { write([]); }
  function text(kind) { var L = list(); if (!L.length) return ""; return L.map(function (x, i) { return (i + 1) + ". " + (kind === "say" ? x.say : x.text); }).join("\n"); }

  function hearingLine() { var h = (SPS.asks && SPS.asks.hearing) || {}; return "Decided by the " + esc(h.body || "Islip Town Board") + ", " + esc(h.where || "") + ", " + esc(h.when || "") + "."; }
  function railHtml() {
    var n = read().length;
    return '<div class="ask-rail"><a class="btn" href="act.html#concerns">' + ic("megaphone") + ' My concerns' + (n ? ' <span class="cnt">' + n + "</span>" : "") + ' — what to say</a><a class="btn secondary" href="act.html#officials">' + ic("mail") + ' Email the Town Board</a><a class="btn secondary" href="act.html#testimony">' + ic("mic") + ' Say it at the hearing</a></div><p class="small muted ask-where">' + hearingLine() + "</p>";
  }
  function askItem(x) {
    var on = has(x.id);
    return '<li class="ask' + (on ? " on" : "") + '" data-ask="' + esc(x.id) + '"><div class="ask-t">' + esc(x.text) + ' <span class="ask-who">' + esc(x.who) + '</span></div><button type="button" class="ask-add" data-ask-toggle="' + esc(x.id) + '" aria-pressed="' + on + '">' + ic(on ? "check" : "plus") + '<span>' + (on ? "In my concerns" : "Add to my concerns") + "</span></button></li>";
  }
  function asksBlock(topic, opts) {
    var A = SPS.asks && SPS.asks.topics && SPS.asks.topics[topic]; if (!A) return "";
    var o = opts || {}, lim = o.limit || 3, items = A.items, top = items.slice(0, lim), rest = items.slice(lim);
    return '<div class="asks-block" data-asks-topic="' + esc(topic) + '"><h3 class="asks-h">' + ic("megaphone") + ' Ask for it in writing</h3><p class="asks-lead">' + esc(A.headline) + '. Tap the ones you care about; they become your letter and your three minutes at the hearing.</p>' +
      '<ol class="asks">' + top.map(askItem).join("") + "</ol>" +
      (rest.length ? '<details class="how asks-more"><summary>' + rest.length + " more to ask for</summary><ol class=\"asks\" start=\"" + (lim + 1) + '">' + rest.map(askItem).join("") + "</ol></details>" : "") +
      (o.rail === false ? "" : railHtml()) + "</div>";
  }
  function refreshBlocks(root) {
    (root || document).querySelectorAll("[data-ask]").forEach(function (li) { var on = has(li.dataset.ask); li.classList.toggle("on", on); var b = li.querySelector("[data-ask-toggle]"); if (b) { b.setAttribute("aria-pressed", String(on)); b.innerHTML = ic(on ? "check" : "plus") + "<span>" + (on ? "In my concerns" : "Add to my concerns") + "</span>"; } });
    (root || document).querySelectorAll(".ask-rail .cnt").forEach(function (c) { c.remove(); });
    var n = read().length; if (n) (root || document).querySelectorAll(".ask-rail .btn:first-child").forEach(function (b) { b.insertAdjacentHTML("beforeend", ' <span class="cnt">' + n + "</span>"); });
    if (SPS.renderIcons) SPS.renderIcons(root || document.body);
  }
  function fill(root) {
    (root || document).querySelectorAll("[data-asks]").forEach(function (h) { if (h.dataset.filled) return; var html = asksBlock(h.dataset.asks, { limit: +h.dataset.limit || 3, rail: h.dataset.rail !== "0" }); if (!html) return; h.innerHTML = html; h.dataset.filled = "1"; });
    (root || document).querySelectorAll("#concerns-host").forEach(function (h) { if (!h.dataset.filled) { render(h); h.dataset.filled = "1"; } });
  }

  /* ---- the basket, rendered on Take Action and the Who-decides panel ---- */
  function render(host) {
    if (!host) return;
    var L = list(), groups = {};
    L.forEach(function (x) { (groups[x.topic] = groups[x.topic] || { title: x.topicTitle, icon: x.icon, items: [] }).items.push(x); });
    if (!L.length) {
      host.innerHTML = '<div class="concerns empty"><h3>' + ic("list") + ' Your concerns</h3><p>Nothing picked yet. On any page, tap <strong>Add to my concerns</strong> under "Ask for it in writing." They collect here as your letter and your three minutes at the hearing.</p><div class="ask-rail"><a class="btn secondary" href="house.html">' + ic("home") + ' Start with your house</a></div></div>';
      if (SPS.renderIcons) SPS.renderIcons(host); return;
    }
    host.innerHTML = '<div class="concerns"><h3>' + ic("list") + ' Your concerns <span class="cnt">' + L.length + '</span></h3><p class="small muted">Each one is a demand to put in writing and a sentence to say out loud. ' + hearingLine() + "</p>" +
      Object.keys(groups).map(function (t) { var g = groups[t]; return '<div class="cgroup"><div class="cg-h">' + ic(g.icon) + " " + esc(g.title) + "</div>" + g.items.map(function (x) { return '<div class="citem" data-ask="' + esc(x.id) + '"><div class="c-ask"><span class="k">Ask for</span> ' + esc(x.text) + ' <span class="ask-who">' + esc(x.who) + '</span></div><div class="c-say"><span class="k">Say</span> "' + esc(x.say) + '"</div><button type="button" class="c-rm" data-ask-toggle="' + esc(x.id) + '" aria-label="Remove">' + ic("x") + "</button></div>"; }).join("") + "</div>"; }).join("") +
      '<div class="ask-rail"><button type="button" class="btn" data-concern-act="email">' + ic("mail") + ' Email the Town Board with these</button><button type="button" class="btn secondary" data-concern-act="say">' + ic("mic") + ' My 3-minute statement</button><button type="button" class="btn secondary" data-concern-act="copy">' + ic("copy") + ' Copy the list</button><button type="button" class="btn sm yellow" data-concern-act="clear">Clear</button></div></div>';
    if (SPS.renderIcons) SPS.renderIcons(host);
  }
  function statement() {
    var L = list(), y = SPS.contact && SPS.contact.fill ? SPS.contact.fill("{{name}}|{{street}}|{{town}}").split("|") : ["[your name]", "[your street]", "Holbrook"];
    var imp = ""; try { imp = localStorage.getItem("sps.impact") || ""; } catch (e) { }
    var body = "Good evening. My name is " + y[0] + " and I live at " + y[1] + " in " + y[2] + ". " + (imp ? imp + " " : "") + "I am not here to say I am against Amazon. I am here to ask this Board for " + (L.length === 1 ? "one thing" : L.length + " things") + " in writing before any vote on CZ 2026-010.\n\n" +
      L.map(function (x, i) { return (i + 1) + ". " + x.say + " (" + x.who + ")"; }).join("\n") +
      "\n\nEvery one of these comes from the applicant's own filing or from what other towns learned the hard way. If the applicant cannot put them in writing, the Board should not put this zoning on the books. Thank you.";
    return body;
  }
  function act(kind) {
    var L = list();
    if (kind === "clear") { if (confirm("Clear your " + L.length + " concerns?")) clear(); return; }
    if (kind === "copy") { var t = L.map(function (x, i) { return (i + 1) + ". ASK: " + x.text + " (" + x.who + ")\n   SAY: " + x.say; }).join("\n\n"); if (SPS.copy) SPS.copy(t); else if (navigator.clipboard) navigator.clipboard.writeText(t); return; }
    if (kind === "say") { if (!SPS.openModal) { location.href = "act.html#testimony"; return; } SPS.openModal('<h3>' + ic("mic") + ' Your 3-minute statement</h3><p class="small muted">About 350 words is three minutes. Read it slowly. Sign in to speak when you arrive.</p><textarea id="m-body" style="min-height:320px">' + esc(statement()) + '</textarea><div class="acts"><button class="btn secondary" id="m-copy">' + ic("copy") + ' Copy</button></div>'); if (SPS.renderIcons) SPS.renderIcons($("#modal-body")); var c = $("#m-copy"); if (c) c.addEventListener("click", function () { SPS.copy($("#m-body").value); }); return; }
    if (kind === "email") { var g = (SPS.officialGroups || []).filter(function (x) { return x.id === "townBoard"; })[0]; if (g && SPS.contact && SPS.contact.openBulk) SPS.contact.openBulk(g); else location.href = "act.html#officials"; return; }
  }

  /* ---- sticky bar ---- */
  function bar() {
    var b = $("#concern-bar"); var n = read().length;
    if (!n) { if (b) b.remove(); document.body.classList.remove("has-concern-bar"); return; }
    if (!b) { b = document.createElement("div"); b.id = "concern-bar"; document.body.appendChild(b); document.body.classList.add("has-concern-bar"); }
    var onAct = /act\.html/.test(location.pathname);
    b.innerHTML = '<div class="wrap"><span class="cb-t">' + ic("list") + ' <strong>' + n + "</strong> concern" + (n === 1 ? "" : "s") + ' picked</span>' + (onAct ? '<a class="btn sm" href="#concerns">See what to say</a>' : '<a class="btn sm" href="act.html#concerns">See what to say ›</a>') + "</div>";
    if (SPS.renderIcons) SPS.renderIcons(b);
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-ask-toggle]") : null;
    if (t) { e.preventDefault(); toggle(t.dataset.askToggle); return; }
    var a = e.target.closest ? e.target.closest("[data-concern-act]") : null;
    if (a) { e.preventDefault(); act(a.dataset.concernAct); }
  });
  document.addEventListener("sps:concerns", function () { refreshBlocks(); document.querySelectorAll("#concerns-host").forEach(render); bar(); });
  document.addEventListener("DOMContentLoaded", function () {
    fill(); bar();
    if (window.MutationObserver) new MutationObserver(function () { fill(); }).observe(document.body, { childList: true, subtree: true });
  });
  SPS.asksBlock = asksBlock;
  SPS.concerns = { list: list, has: has, toggle: toggle, clear: clear, text: text, render: render, fill: fill, refresh: refreshBlocks, byId: byId, statement: statement };
})();
