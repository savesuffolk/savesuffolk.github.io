# Stop Project Sunrise — campaign website

Static site (no build step) opposing Amazon's proposed 4.26M sq ft "Project Sunrise" warehouse in Holbrook, NY (Town of Islip case CZ 2026-010).

## Run locally + edit data

```
cd site
node dev-server.js
# site:   http://localhost:8765
# editor: http://localhost:8765/admin
```

`dev-server.js` is a zero-dependency Node server. Besides serving the site it hosts `/admin`, a table editor for every file in `data/`: pick a file and a key, edit fields (lists/objects appear as JSON), add or delete rows, Save. It rewrites just that `SPS.<key> = …` statement in `data/<file>.js`, keeps comments and other keys, validates the result still parses, and leaves a `.bak` beside it. Local only — GitHub Pages serves `data/*.js` as static files and `admin.html` does nothing there without the server.

Plain `python3 -m http.server` also works for viewing (no editor). Opening `index.html` from disk works too; only the CDNs (Chart.js, Three.js, Google Fonts) need internet.

## Deploy (GitHub Pages)

1. Create a GitHub repo, push the contents of `site/` to `main` (keep `.nojekyll`).
2. Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
3. Site appears at `https://<user>.github.io/<repo>/`. Add a custom domain in the same settings page if you buy one.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Home (four sections: hero + address box, three ways to stop it, Suffolk framing, issues). 3D scale scene lives on `project.html` only. | 
| — | Home: address box in the hero (→ `house.html?q=`), "Suffolk County issue" framing, issues, what you can do |
| `house.html` | **Your House** — one address (or hamlet) → six at-a-glance cards (sleep, home value, roads, water, taxes, your say) + actions ranked by distance. Saves `sps.house` and an `sps.impact` sentence that `{{impact}}` in the email templates picks up. After an address (or hamlet) is entered, a sticky **sub-nav** appears under the main nav (Overview + Sleep / Home value / Roads / Water / Taxes / Who decides) and swaps the content area in place: `#house-panels` holds hidden panels (`#panel-sleep`, `-home`, `-roads`, `-water`, `-taxes`, `-say`) containing the same host IDs the deep pages use, so `noise.js`, `values.js`, `water.js`, `charts.js`, `voices.js`, `contact.js` render them at load; `house.js` moves the chosen panel into `#drawer-body` and presets it via `SPS.noiseUI.setDistance`, `SPS.valuesUI.setDistance`, `SPS.voicesUI.setTopic`, `SPS.locate.corridorBlock/repCard/waterBlock`. |
| `project.html` | Fact tiles, scale chart, where/who, every approval needed, timeline |
| `issues.html` | Eight issue cards with hearing questions; traffic charts; LOS table; land cover |
| `water.html` | "Where the water goes": Leaflet map (`js/watermap.js`) driven by the plume model — today/with-warehouse toggle, 30-year slider with play, contours at 50/10/1% of source strength, well fields, lakes, bay, your house; five slider models folded under "Show the math" |
| `calendar.html` | Month/list calendar, filters, Google Calendar / .ics |
| `act.html` | "Where do you live?" (hamlet → your reps + corridor), officials directory, email/phone/testimony builders, volunteer, call log |
| `noise.html` | Noise & light: address → distance → dBA calculator (`js/noise.js`), source levels, NYSDEC/Islip/WHO thresholds, other-FC cases, health, demands |
| `values.html` | Home values: sourced studies, distance-ring chart, dollar-exposure calculator, tax-shift mechanics, applicant counter-arguments answered |
| `voices.html` | Voices from other towns: filterable attributed quotes by facility, promises-vs-outcomes table, towns that said no, video gallery |
| `docs.html` | FOIL'd filing, campaign materials, outside sources |

Nav and footer are injected by `js/app.js` (`PAGES` array) so you edit them once. Nav is deliberately short (Your House, Project, Issues, Meetings, Take Action); noise/values/water/voices/docs are deep pages reached from cards, the Issues lede and the footer. Every renderer checks whether its host element exists, so the same scripts run on every page.

## Editing content — you only need to touch `data/`

| File | What it holds |
|---|---|
| `data/facts.js` | Canonical numbers for the fact tiles, charts, timeline. Every entry has a `source`. Change numbers here, not in the HTML. |
| `data/events.js` | Every meeting/hearing. Add campaign events (rallies, petition drives) with `level: "campaign"`. Dates `YYYY-MM-DD`, times 24h `HH:MM`. Set `decisive: true` for zone-change hearings. |
| `data/officials.js` | Officials grouped by decision role. `verify: true` marks contacts not taken from the campaign's own directory — confirm them. |
| `data/templates.js` | Email templates, phone scripts, 3-minute testimony drafts, Newsday letter. Placeholders: `{{name}}`, `{{street}}`, `{{town}}`, `{{official}}`. |
| `data/issues.js` | The eight issue cards. |
| `data/water-params.js` | Every parameter in the water simulations with default, range, basis tag and source. |
| `data/noise-params.js` | Site outline (estimate), source sound levels, calculator assumptions, ambient presets, thresholds, rules, cases, health, light. |
| `data/values.js` | Property-value studies, local numbers (ZHVI, RAR), exposure defaults, counter-evidence + rebuttals, tax steps. |
| `data/roads.js` | Hourly truck/car/Flex schedules parsed from TIS Tables A5/A6 (sum exactly to the filing), truck-route polyline (OSM), intersection pins, wear constants (GAO 9,600), asks. Rendered by `js/roads.js` on Your House → Roads and on issues.html. |
| `data/voices.js` | Quotes grouped by facility (never edit a quote; each has `status`), promises table, towns that said no, videos. |

Every entry in the three new data files carries a `status`: `verified` (source fetched, number read), `unverified` (search snippet only — confirm before printing), `paraphrase`, or `estimate` (our arithmetic). The badges render on the page. Research trail and open items: `research/README.md`.

`docs/` holds public records obtained by FOIL. Do **not** add the 200-ft radius map (it lists private owners' names) or any volunteer spreadsheets.

## Things to verify before/after launch

- Change of Zone dates (Nov 19, Dec 17 2026) against https://islipny.gov meeting notices — the Town cancelled May/June sessions this year.
- Islip IDA hearing date (unknown at build time) — add to `events.js` when noticed.
- Contact details flagged `verify` in `officials.js` (federal offices, SCWA, County Planning Commission, Sen. Murray).
- Two emails appear for the Islip IDA (`info@islipida.com`, `ecodev@islipny.gov`) and for Planning (`Commissioner-pd@islipny.gov`, `planning@islipny.gov`); both are listed.
- Facebook group URL: the site links a search for "Holbrook Residents Opposing the Mega Warehouse" — replace with the group's direct URL in `index.html` (two places) once you have it.
- Campaign contact email: placeholder text in the Volunteer section of `index.html`.

## Sources of the numbers

Applicant's Full EAF (VHB, Jul 15 2026), Change of Zone application form, Stonefield Traffic Impact Study (Jun 30 2026), VHB Conceptual Site Plan, Town of Islip ↔ Forchelli Deegan Terrana email correspondence (Jul 24 – Aug 6 2026), Suffolk County deeds, USGS WRI 01-4025, EPA Goldisc ROD (1998), NYSDEC Stormwater Design Manual, Suffolk County Sanitary Code Art. 7, NSQD v4.02.

## District table (`data/districts.js`)

Hamlet → county legislative / Assembly / Senate district, derived by sampling Suffolk County's public GIS layers (HamletPolygon, LegislativeDistrict, StateAssemblyDistrict, StateSenateDistrict) — area share, not population share. Split hamlets list every district with ≥3% of land, largest first, with a `note` describing the boundary. `confidence: "medium"` rows: Brightwaters, Ronkonkoma, Stony Brook. Officeholders as of Jan 2026 (county) / Feb 2025 (state). Re-check after the Nov 2026 election. Share a preselected link with `act.html?hamlet=Sayville`.

## 3D visualization (`project.html`)

`js/site3d.js` — one continuous sequence: house → football field → Costco → SunVet → JFK8 → Smith Haven → Roosevelt Field (boxes to scale in feet, footprint and height), then the 138‑acre wooded site (~14,000 instanced trees), then clearing west → east across the 101.6 disturbed acres while the buildings rise to their filed heights, ending low beside the south building with a 24‑ft house and a 13.5‑ft trailer for vertical scale. Counters use the EAF acreages; tree total assumes 350 stems/acre. Needs Three.js r128 (cdnjs) and WebGL; without WebGL, on save‑data / low‑memory devices, or if the first two seconds run under 20 fps, it swaps to a slideshow of pre‑rendered frames in `assets/frames/` (re‑render with `render-frames.html` + the headless Chrome loop in the scratchpad if the scene changes). Also embedded on the home page. Test links: `project.html?step=9` (end), `?step=8&clear=0.5`. Edit `COMPARE` and `BUILDINGS` at the top of the file.

## Editing text in the browser (local only)

Run the dev server and open any page:

```
node dev-server.js          # http://localhost:8765
```

A dark **Edit text** pill sits in the bottom-left corner. Click it (or press Cmd/Ctrl+Shift+E) and every
block of text that comes from `data/*.js` gets a dashed outline. Click one, type, click away. The change is
written straight into the data file, with the previous version kept alongside it as `<file>.js.bak`, and the
page reloads so you see the real result.

* A short, plain sentence edits in place.
* A long one, or one containing markup, or a number with a separate display string, opens a small panel so
  you edit the whole record (value, display, unit, label, source, url) instead of just the rendered text.
* Amber dotted outline means that exact sentence appears at more than one place in the data. The editor will
  not guess which one you meant; use `/admin` and pick.
* Text with no outline is not in a data file. It is either written into the page HTML or built inside a JS
  module, usually because it has numbers interpolated into it.

The editor is **injected by the dev server**, not written into any page. Nothing on disk references it, so it
cannot reach the published site. It also refuses to run on any host other than localhost.

Two endpoints back it, both local-only:

| Route | What it does |
|---|---|
| `POST /api/text/<file>` | Swaps one string literal in place. One-line diff, formatting and comments untouched. |
| `POST /api/data/<file>` | Rewrites a whole `SPS.<key>`. Used for numbers and multi-field edits; reflows that key to JSON. |

Both syntax-check the result before writing and refuse the write if the value does not land where expected.
