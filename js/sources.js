/* sources.js — every citation on this site resolves to a document you can open, or says plainly that it cannot.
   SPS.srcHtml(text) turns a source string into linked document names plus a provenance chip:
     filing   — the applicant's own submission (FOIL'd PDF on this site)
     record   — a government or agency document
     research — a published study
     ourmath  — this site's own arithmetic from the inputs named
     nolink   — named, but we have no online copy; ask us for it
   Add a document here once and every page that cites it gets the link. */
(function () {
  window.SPS = window.SPS || {};
  var esc = function (s) { return SPS.esc ? SPS.esc(s) : String(s == null ? "" : s); };

  // Documents this site hosts or can point at. `re` matches how the citation is written in the data files.
  var DOCS = [
    { key: "eaf", re: /Full EAF(?: Part 1| attachment)?|\bEAF\b/g, label: "Full EAF", url: "docs/Full-EAF-2026-07-15.pdf", kind: "filing", title: "Full Environmental Assessment Form, VHB, Jul 15 2026 (FOIL'd)" },
    { key: "tis", re: /Stonefield (?:Traffic Impact Study|TIS)|Traffic Impact Study|\bTIS\b/g, label: "Traffic Impact Study", url: "docs/Traffic-Impact-Study-2026-06-30.pdf", kind: "filing", title: "Stonefield Traffic Impact Study, Jun 30 2026, 663 pp (FOIL'd)" },
    { key: "plan", re: /VHB Conceptual Site Plan(?: C1\.00)?|Conceptual Site Plan|[Ss]ite plan zoning chart|[Ss]ite plan|zoning summary chart|zoning chart/g, label: "site plan", url: "docs/Conceptual-Site-Plan-2026-07-15.pdf", kind: "filing", title: "VHB Conceptual Site Plan, Jul 15 2026 (FOIL'd)" },
    { key: "app", re: /Change-of-Zone application form|Amended Planning Application|Application form/g, label: "application form", url: "docs/Change-of-Zone-Application-Form.pdf", kind: "filing", title: "Change of Zone application form (FOIL'd)" },
    { key: "letter", re: /Forchelli Deegan Terrana cover letter[^;,]*/g, label: "applicant's cover letter", url: "docs/Forchelli-Cover-Letter-2026-07-16.pdf", kind: "filing", title: "Forchelli Deegan Terrana cover letter, Jul 16 2026 (FOIL'd)" },
    { key: "emails", re: /Email, [^;]+?\d{4}(?: \d{1,2}:\d{2} [AP]M)?|Town ↔ applicant emails|Town emails/g, label: null, url: "docs/Town-Email-Correspondence-Jul-Aug-2026.pdf", kind: "filing", title: "Town ↔ applicant email correspondence, Jul–Aug 2026 (FOIL'd)" },
    { key: "islipcode", re: /Islip Town Code §68-3\d\d/g, label: null, url: "https://ecode360.com/7705949", kind: "record", title: "Islip Town Code, Article XXV — Industrial 1 District (eCode360)" },
    { key: "fta", re: /FTA Transit Noise & Vibration manual Table 5-7|FTA Table 5-7|FTA Transit Noise & Vibration manual/g, label: null, url: "https://www.transit.dot.gov/sites/fta.dot.gov/files/docs/research-innovation/118131/transit-noise-and-vibration-impact-assessment-manual-fta-report-no-0123_0.pdf", kind: "record", title: "FTA Transit Noise and Vibration Impact Assessment Manual, Report 0123 (2018)" },
    { key: "dec-noise", re: /NYSDEC DEP-00-1/g, label: null, url: "https://dec.ny.gov/sites/default/files/2025-03/noise2000.pdf", kind: "record", title: "NYSDEC DEP-00-1, Assessing and Mitigating Noise Impacts" },
    { key: "usgs-sir", re: /USGS SIR 2024-5044/g, label: null, url: "https://pubs.usgs.gov/publication/sir20245044/full", kind: "record", title: "USGS SIR 2024-5044, Long Island regional aquifer system, 1900–2019" },
    { key: "dec-swdm", re: /NYSDEC Stormwater Design Manual[^:,;]*/g, label: null, url: "https://extapps.dec.ny.gov/docs/water_pdf/swdm2015chptr04.pdf", kind: "record", title: "NYSDEC Stormwater Management Design Manual, Ch. 4" },
    { key: "corridor", re: /Suffolk County Sunrise Highway Corridor Study[^,;]*/g, label: null, url: "https://www.suffolkcountyny.gov/portals/0/formsdocs/planning/Publications/sunrisehwycorr81209.pdf", kind: "record", title: "Suffolk County Sunrise Highway Corridor Study (2009)" },
    { key: "goldisc", re: /EPA Goldisc ROD(?: 1998)?|EPA ROD|Goldisc ROD/g, label: null, url: "https://semspub.epa.gov/work/02/99371.pdf", kind: "record", title: "EPA Record of Decision, Goldisc Recordings Superfund site, Holbrook (OU2, 1998)" },
    { key: "goldisc-site", re: /EPA Superfund profile/g, label: null, url: "https://cumulis.epa.gov/supercpad/SiteProfiles/index.cfm?fuseaction=second.cleanup&id=0202239", kind: "record", title: "EPA Superfund Site Profile — Goldisc Recordings, Inc., Holbrook" },
    { key: "wri014025", re: /USGS WRI 01-4025/g, label: null, url: "https://pubs.usgs.gov/publication/wri014025", kind: "record", title: "USGS WRI 01-4025 — Green Belt Parkway Well Field, Holbrook (Brown, Colabufo & Coates, 2002)" },
    { key: "scsc7", re: /Suffolk County Sanitary Code §760-7\d\d(?:\.\w)?(?: \/ §760-\d+)?/g, label: null, url: "https://www.suffolkcountyny.gov/Portals/0/FormsDocs/Health/EnvironmentalQuality/Article%207%20of%20the%20Suffolk%20County%20Sanitary%20Code.pdf", kind: "record", title: "Article 7 of the Suffolk County Sanitary Code (water pollution control)" },
    { key: "census", re: /U\.S\. Census 2020(?:, via Wikipedia)?|2020 Census \(CDP\)/g, label: null, url: "https://data.census.gov/", kind: "record", title: "2020 Decennial Census" }
  ];
  // Citations that are this site's own arithmetic, not a document. Never dressed up as a source.
  var OURMATH = /our arithmetic|our framing|stoichiometry|half-full|precast (?:ring|leaching)|≈ 3–5 at 15|138 ac ≈|83\.8 impervious −|site frontage|approx\.|Our arithmetic|Toggle:|Pre-filled with|Typical Suffolk|Class 8 tractors|curbed truck court|dilution|R = 1 \+|Chloride\/sodium: none/i;
  var KINDLABEL = { filing: "applicant's filing", record: "public record", research: "published study", ourmath: "our arithmetic", nolink: "no online copy" };

  function link(url, text, title) {
    var ext = /^https?:/.test(url);
    return '<a href="' + esc(url) + '"' + (ext ? ' target="_blank" rel="noopener"' : ' target="_blank"') + ' title="' + esc(title || "") + '">' + text + "</a>";
  }
  // Turn every recognised document name inside a citation into a link. Returns { html, kinds, linked }.
  function annotate(text) {
    var s = esc(text || ""), kinds = {}, linked = 0, marks = [];
    DOCS.forEach(function (d) {
      var re = new RegExp(d.re.source, "g"), m;
      while ((m = re.exec(s)) !== null) { marks.push({ a: m.index, b: m.index + m[0].length, doc: d, raw: m[0] }); }
    });
    marks.sort(function (x, y) { return x.a - y.a || y.b - x.b; });
    var out = "", at = 0;
    marks.forEach(function (k) {
      if (k.a < at) return;
      out += s.slice(at, k.a) + link(k.doc.url, k.raw, k.doc.title);
      at = k.b; kinds[k.doc.kind] = 1; linked++;
    });
    out += s.slice(at);
    if (!linked && OURMATH.test(text || "")) kinds.ourmath = 1;
    return { html: out, kinds: Object.keys(kinds), linked: linked };
  }
  function chip(kind) { return '<span class="prov ' + kind + '" title="' + esc(KINDLABEL[kind] || kind) + '">' + esc(KINDLABEL[kind] || kind) + "</span>"; }

  /* srcHtml(text, opts) — linked citation + provenance chip.
     opts.url     an explicit link for the whole citation (used when the data row already carries one)
     opts.kind    force the provenance ("research" for a study, etc.)
     opts.chip    false to leave the chip off */
  function srcHtml(text, opts) {
    var o = opts || {}, t = String(text || "").trim();
    if (!t || t === "—") return "";
    var a = annotate(t), html = a.html, kind = o.kind || a.kinds[0] || (o.url ? "research" : (a.linked ? "filing" : "nolink"));
    if (o.url && !a.linked) html = link(o.url, html, t);
    if (o.chip === false) return html;
    return html + " " + chip(kind);
  }
  function docsFor(text) { var out = []; DOCS.forEach(function (d) { if (new RegExp(d.re.source).test(text || "")) out.push(d); }); return out; }


  /* ---- the full index: every citation on the site, in one table ---- */
  function collect() {
    var rows = [], seen = {};
    function push(where, claim, src, url, status, kind) {
      src = String(src || "").trim(); if (!src || src === "—") return;
      var key = where + "|" + src + "|" + (url || "");
      if (seen[key]) return; seen[key] = 1;
      rows.push({ where: where, claim: claim || "", src: src, url: url || "", status: status || "", kind: kind || "" });
    }
    var F = SPS.facts || {};
    Object.keys(F).forEach(function (k) { var f = F[k]; if (f && f.source) push("The filing", f.label, f.source, f.url, "", "filing"); });
    var V = SPS.values || {};
    (V.studies || []).forEach(function (x) { push("Home values", (x.who || "") + " " + (x.what || ""), x.cite, x.url, x.status, "research"); });
    (V.counter || []).forEach(function (x) { push("Home values — what Amazon will say", x.claim, x.source, x.url, x.status, "research"); });
    if (V.obsolescence) push("Home values", V.obsolescence.title || "External obsolescence", V.obsolescence.cite, V.obsolescence.url, V.obsolescence.status, "research");
    if (V.precedent) push("Home values", V.precedent.title, V.precedent.cite, V.precedent.url, V.precedent.status, "research");
    Object.keys(V.local || {}).forEach(function (k) { var x = V.local[k]; if (x && x.source) push("Home values", x.label, x.source, x.url, "", "record"); });
    var N = SPS.noise || {};
    (N.sources || []).forEach(function (x) { push("Noise", x.label, x.source, x.url, x.status, "research"); });
    ((N.light || {}).facts || []).forEach(function (x) { push("Light", x.text, x.source, x.url, x.status, "research"); });
    (N.ambient || []).forEach(function (x) { push("Noise — background levels", x.label, x.source, x.url, x.status, "record"); });
    (SPS.impacts || []).forEach(function (im) { (im.facts || []).forEach(function (f) { push(im.title || im.short, f.text, f.source, f.url, f.status, ""); }); });
    var RV = SPS.review || {};
    Object.keys(RV.sources || {}).forEach(function (k) { var q = RV.sources[k]; push("How it is being reviewed", q.note, q.title, q.url, q.status, ""); });
    var R = SPS.roads || {};
    if (R.wear) push("Roads", "Pavement wear per loaded truck", R.wear.source, R.wear.url, R.wear.status, "record");
    if (SPS.losSource) push("Roads", "Intersection grades and delays", SPS.losSource, "docs/Traffic-Impact-Study-2026-06-30.pdf", "", "filing");
    if (SPS.crashRatesSource) push("Roads", "Crash rates", SPS.crashRatesSource, "docs/Traffic-Impact-Study-2026-06-30.pdf", "", "filing");
    if (SPS.corridorsSource) push("Roads", "Which road the trips use", SPS.corridorsSource, "docs/Traffic-Impact-Study-2026-06-30.pdf", "", "filing");
    var W = SPS.waterParams || {};
    (W.groups || []).forEach(function (g) {
      (g.params || []).forEach(function (x) { push("Water — " + (g.title || ""), x.label, x.source, x.url, x.basis, ""); });
      (g.fixed || []).forEach(function (x) { push("Water — " + (g.title || ""), x.label, x.source, x.url, x.basis, ""); });
    });
    ((SPS.voices || {}).facilities || []).forEach(function (fa) {
      (fa.quotes || []).forEach(function (q) { push("Voices — " + (fa.place || ""), '"' + String(q.text || "").slice(0, 90) + '" — ' + (q.who || ""), (q.outlet || "") + (q.when ? ", " + q.when : ""), q.url, q.status || "verified", "research"); });
    });
    ((SPS.voices || {}).saidNo || []).forEach(function (t) { push("Towns that said no", t.place, t.source || t.outlet, t.url, t.status, "research"); });
    return rows;
  }
  function indexHtml() {
    var rows = collect();
    if (!rows.length) return '<p class="muted">Source index unavailable on this page.</p>';
    var groups = {}, order = [];
    rows.forEach(function (r) { if (!groups[r.where]) { groups[r.where] = []; order.push(r.where); } groups[r.where].push(r); });
    var linked = rows.filter(function (r) { return r.url || annotate(r.src).linked; }).length;
    var head = '<p class="small muted">' + rows.length + " citations on this site, " + linked + " of them linked to the document. The rest are named in full so you can request them; tell us if any link is dead or says something different from what we claim.</p>";
    return head + order.map(function (g) {
      return '<h3 class="srcidx-h">' + esc(g) + "</h3><div class=\"rows two srcidx\">" + groups[g].map(function (r) {
        return '<div class="row two"><div class="what">' + esc(r.claim || "").slice(0, 180) + '</div><div class="src small">' + srcHtml(r.src, { url: r.url }) + (r.status && SPS.statusBadge ? " " + SPS.statusBadge(r.status) : "") + "</div></div>";
      }).join("") + "</div>";
    }).join("");
  }
  function renderIndex(host) { host = host || document.getElementById("source-index"); if (!host) return; host.innerHTML = indexHtml(); }
  document.addEventListener("DOMContentLoaded", function () { renderIndex(); });

  SPS.sources = { srcHtml: srcHtml, annotate: annotate, chip: chip, docs: DOCS, docsFor: docsFor, KINDLABEL: KINDLABEL, collect: collect, indexHtml: indexHtml, renderIndex: renderIndex };
  SPS.srcHtml = srcHtml;
})();
