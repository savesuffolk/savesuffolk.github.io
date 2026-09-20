# Noise (and Light) Research Report — technical basis for the Stop Project Sunrise NOISE page
Research date: 2026-09-19. Companion script: `noise-calc.py` (reproduces the worked example).

Verification key: **VERIFIED** = page/PDF fetched and number read in it. **UNVERIFIED** = only seen in search snippets or fetch blocked. **estimate** = assumption/derivation by the researcher.

---

## A. Source sound levels (dBA) with reference distance

| Source | Level | Ref. distance | Metric | Source / URL | Status |
|---|---|---|---|---|---|
| Heavy truck pass-by, cruise, avg pavement (FHWA TNM REMEL) | 74.3 (≤10 mph) · 76.0 (25 mph) · 78.5 (35) · 81.3 (45) · 83.9 (55) · 86.3 (65) | 50 ft | Lmax (energy-mean) | Computed from TNM 3.0 Tech Manual Table 10 constants for heavy trucks, avg pavement, cruise: A=35.87985, B=21.019665, C=74.298135; full-throttle C=80.0 (80.0 at ≤10 mph, 85.1 at 55 mph). Eq.: L = 10·log10(mph^(A/10)·10^(B/10) + 10^(C/10)). https://www.fhwa.dot.gov/environment/noise/traffic_noise_model/old_versions/tnm_v30/tnm3_tech_manual.cfm | Constants VERIFIED; speed values are derived arithmetic |
| Heavy truck (dump/flatbed) | 84 spec; 74–76 measured | 50 ft | Lmax | FHWA Construction Noise Handbook Table 9.1 https://www.fhwa.dot.gov/Environment/noise/construction_noise/handbook/handbook09.cfm | VERIFIED |
| Truck movement in a lot/yard | 85 | 50 ft | SEL per event | Saxelby Acoustics, West Roseville noise study (Sept 2022) https://www.roseville.ca.gov/Documents/City%20Administration/Boards%20and%20Commissions/Planning%20Commission/2023/PL22-0205,%201751%20Pleasant%20Grove,%20Grocery%20Outlet,%2002%20Attachment%202%20noise%20study.pdf | VERIFIED |
| Idling heavy truck | Lw 96 dBA (one); 3 idling = Lw 101 → 69 dBA at 50 ft | 50 ft | continuous | LSA Bloomington Truck Terminal study as cited in City of Long Beach Intex Fulfillment Center DEIR §4.9 https://www.longbeach.gov/globalassets/lbcd/media-library/documents/planning/environmental/environmental-reports/pending/intex-corporate-office-and-fulfillment-center-project-eir/4-9-noise | VERIFIED (secondary citation) |
| Truck loading/unloading activity (backing, doors, forklift, idling), per bay | 64 | 50 ft | hourly Leq | same Long Beach DEIR | VERIFIED |
| Loading-dock maneuvering lanes (arrivals, idling, backing, **air-brake release**, TRUs) | 61 Leq / **81 Lmax** | 100 ft | Leq / Lmax | Saxelby Roseville study (above) | VERIFIED |
| Idling diesel truck (advocacy figure) | 85 | 50 ft | — | CEDS "warehouses" page https://ceds.org/warehouses/ (cites "FHWA"; could not be traced to a primary FHWA doc) | Page VERIFIED, provenance UNVERIFIED — do not lead with it |
| Backup alarm, SAE J994 | 87 (Type D) / **97 (Type C)** / 102 (Type F) dB(A) | rated at ~4 ft (1.2 m) per SAE J994 convention | Lmax | Federal Signal 2012 Series data sheet https://www.fedsig.com/sites/default/files/resource_library_document/M9009%202012%20Series%20Back-up%20Alarm%20Data%20Sheet.pdf | Ratings VERIFIED; 4-ft test distance UNVERIFIED from a primary standard |
| Backup alarm, typical | 97–112 dB "at the source", ~1,000 Hz tone; broadband alternative ≈95 dB, "much less annoying" | source | — | Holzman, *Environ Health Perspect* 2011;119(1):A30–A33 https://pmc.ncbi.nlm.nih.gov/articles/PMC3018517/ | VERIFIED |
| Trailer refrigeration unit (TRU) | Lw 102 dBA avg (range 93–109), 16 units measured | sound power | continuous | Roy & VanDelden (RWDI), *Canadian Acoustics* https://jcaa.caa-aca.ca/index.php/jcaa/article/download/3145/pdf/4351 | VERIFIED. ≈70 dBA at 50 ft (Lw − 20log r − 8, hemispherical; derived) |
| Rooftop packaged HVAC, 50-ton unit | 59 | 50 ft | Leq | Saxelby Roseville study ("manufacturer's data") | VERIFIED |
| Yard tractor ("hostler") | no primary number found; Edison NJ and Brewster NY studies treat yard-tractor **broadband backup alarms** and movements as the dominant night sources | — | — | see Section D | Use truck values; label "estimate" |
| Trailer coupling / "dropping trailers" | modeled as impulsive; measured impulses at Edison homes "all below 60 dBA" on a self-described quiet night | at residence | Lmax | Edison study (Section D) | VERIFIED |
| Backup alarm derived to 50 ft | 97 − 20·log10(50/4) = **75.1** | 50 ft | Lmax | derivation | estimate |

Human-perception anchors (VERIFIED, DEC DEP-00-1 and FHWA): 3 dB barely perceptible; 10 dB perceived as twice as loud; a 10-dB reduction "can transform the sound level of a typical tractor trailer pass-by to that of an automobile" (FHWA).

---

## B. Propagation spec (turn this into JS)

All formulas below are VERIFIED in NYSDEC DEP-00-1 (pp. 8–9), FHWA "Highway Traffic Noise Barriers at a Glance", FHWA "Sound Level Descriptors" (fhwahep17053), the FTA manual, and the Long Beach DEIR unless marked estimate.

```
// 1. Point source (dock cluster, idling truck, alarm): 6 dB per doubling  [DEC p.8, FTA]
L(d) = L_ref - 20*log10(d/d_ref)          // hard/flat ground
L(d) = L_ref - 25*log10(d/d_ref)          // "soft site" (grass/scattered trees): 7.5 dB/dd  [Long Beach DEIR: +1.5 dB/dd ground effect]

// 2. Line source (steady truck stream on the access road / Sunrise Hwy): 3 dB per doubling (4.5 soft)  [FTA; Long Beach DEIR]
L(d) = L_ref - 10*log10(d/d_ref)          // (use 15*log10 for soft ground)

// 3. Combine sources (energy sum)  [DEC Table A is the lookup version of this]
Ltot = 10*log10( Σ 10^(Li/10) )

// 4. Hourly Leq from N discrete events with sound exposure level SEL  [FHWA descriptors: LEQ(t) = LAE - 10log10(t)]
Leq_1h = SEL + 10*log10(N) - 10*log10(3600)           // SEL_truck_movement = 85 dBA @50 ft
// or for a source of known Lmax running D seconds per event:
Leq_1h = Lmax + 10*log10(N*D/3600)                     // backup alarm: Lmax 75.1 @50 ft, D ≈ 10 s/movement [LSG&A Brewster assumption]

// 5. Ldn / DNL (10 dB night penalty 10pm–7am)  [FHWA descriptors; DEC p.7]
Ldn = LAE + 10*log10(N_day + 10*N_night) - 49.4

// 6. Tree buffer (dense, cannot see through, ≥15 ft tall, ≥100 ft deep):
//    FHWA: ~5 dB per 100 ft (30 m); DEC: 3–7 dB for ≥100 ft; TNM Table 7 at 1 kHz: 0.06 dB/m from 20–200 m, max 12 dB;
//    FTA Table 6-10: A_trees = min(10, W_ft/20).  For the 240-ft buffer: FTA gives 10, TNM ≈4–5, FHWA ≈5+.  Use 5 dB default, 10 dB "optimistic".
A_trees = clamp(W_ft/20, 0, 10)    // W_ft = buffer depth actually dense, not the nominal setback

// 7. Barrier/wall:  FHWA: 5 dB when it just breaks line of sight; "effective barriers typically 5 to 10 dB";
//    ~1.5 dB more per metre of added height.  FTA Table 6-9: A_barrier = min(15, 20*log10(2.51P/tanh(4.46P))+5) with P = path-length difference (ft).
//    Building walls: DEC – 15 dB with windows closed, 5 dB open.  Rows of houses: FTA – 4.5 dB first row, +1.5/row, max 10.
A_wall = user selects 0 / 5 / 10

// 8. Ambient combination and "increase" test (this is what DEC asks for)
L_future = 10*log10(10^(L_amb/10) + 10^(L_project/10));  increase = L_future - L_amb

// 9. Night vs day: same source levels; night differs by (a) trip rate, (b) lower ambient, (c) meteorology favouring propagation.
//    DEC p.9: "Temperature inversions may cause temporary problems when cooler air is next to the earth allowing for more distant propagation".
//    ISO 9613-2 is explicitly a downwind/inversion ("commonly occurs at night") prediction; Todoroski (AAS 2015): "noise enhancements of 10dB and up to 20dB under extreme meteorological conditions" — but that is for km-scale distances. Do NOT add a night bonus inside ~1,000 ft; optionally show "+3 dB inversion night" as a labelled toggle beyond that (estimate).
//    Air absorption: DEC – up to 2 dB per 1,000 ft, "should not be considered". Wind: DEC says downwind receptors do NOT get an increase (contested, but it's the NY policy text).
```

Default ambient (calculator baseline), all VERIFIED:
- FTA Table 5-7 (2006 manual; 2018 manual keeps the same table, UNVERIFIED because transit.dot.gov blocks fetches): population density 3,000–10,000 people/sq mi → **Leq day 55 / evening 50 / night 45, Ldn 55**; 1,000–3,000 → 50/45/40. Homes 200–400 ft from an "Interstate-type" highway with trucks (Sunrise Hwy qualifies: ≥4 lanes, trucks) → 60/55/50; 400–800 ft → 55/50/45. Also EPA relation Ldn = 22 + 10·log10(people/sq mi).
- Measured Long Island nights: Lake Ronkonkoma residential boundary (PS&S for PSEG-LI, 11 Feb 2020, 10–11 PM): **Leq 49.2** (Innis Ave, residential side), 53.2 (Waltess Rd), 54.4–56.3 (Hawkins Ave frontage); Lmin 43–48. https://www.psegliny.com/reliability/-/media/0E8D675341D64F1EABF6F172B49DEE84.ashx VERIFIED. Belmont/Floral Park residences (AKRF 2018, Saturday 9:30–10:30 PM): Leq 50.3–56.0. https://esd.ny.gov/sites/default/files/13_Belmont-DEIS-Noise.pdf VERIFIED.
- Edison NJ homes 300 ft from Amazon LGA9 at night with the site quiet: residual 38–48 dBA (VERIFIED).
- No measured ambient for Holbrook itself exists in any public filing found; the applicant's noise study is "being prepared". Recommend the campaign take its own calibrated readings (Edison's Noise Control Council advised residents to do exactly this: keep a log).

**Worked example** (from `noise-calc.py`; every input sourced except the labelled estimates: 24/7 uniform trip spread, 2 dock movements per truck trip, 5 trucks idling at once, 10 s of alarm per movement).

Dock-area composite at 50 ft (night hour):
- Avg weekday: 555 trips/day ÷ 24 = 23.1 trips/h → 46 dock movements/h. Pass-by Leq = 85 + 10log(46) − 35.6 = 66.1. Idling (5 trucks) = 69 + 10log(5/3) = 71.2. Alarms = 75.1 + 10log(46·10/3600) = 66.1. **Composite = 73.3 dBA Leq @ 50 ft.**
- Peak day: 809 → 33.7 trips/h → 67 movements/h → 67.7 / 71.2 / 67.8 → **composite 74.0 dBA @ 50 ft.**
- Single events @ 50 ft: backup alarm Lmax 75.1; air-brake/coupling Lmax 87 (81 @100 ft + 6).

Project-only level, 6 dB/doubling from the nearest dock edge (avg / peak):

| Distance | No mitigation | + 240-ft dense buffer (−5) | + buffer + wall 5 dB | + buffer + wall 10 dB | Lmax backup alarm | Lmax air-brake/coupling |
|---|---|---|---|---|---|---|
| 300 ft | 57.7 / 58.4 | 52.7 / 53.4 | 47.7 / 48.4 | 42.7 / 43.4 | 59.5 | 71.4 |
| 1,000 ft | 47.3 / 48.0 | 42.3 / 43.0 | 37.3 / 38.0 | 32.3 / 33.0 | 49.0 | 61.0 |
| 2,500 ft | 39.3 / 40.0 | 34.3 / 35.0 | 29.3 / 30.0 | 24.3 / 25.0 | 41.1 | 53.0 |
| 1 mile | 32.8 / 33.5 | 27.8 / 28.5 | 22.8 / 23.5 | 17.8 / 18.5 | 34.6 | 46.5 |

Arithmetic for 300 ft avg: 73.3 − 20·log10(300/50) = 73.3 − 15.6 = 57.7. Soft-ground variant (7.5 dB/dd) gives 53.9 at 300 ft, 40.8 at 1,000 ft.

Resulting total and **increase over ambient** (avg weekday; peak adds ≈0.5 dB):

| Distance | Night (amb 45): none / buffer / buf+wall5 / buf+wall10 | Day (amb 55): none / buffer / buf+wall5 |
|---|---|---|
| 300 ft | 58.0 (**+13.0**) / 53.4 (**+8.4**) / 49.6 (+4.6) / 47.0 (+2.0) | 59.6 (+4.6) / 57.0 (+2.0) / 55.7 (+0.7) |
| 1,000 ft | 49.3 (+4.3) / 46.9 (+1.9) / 45.7 (+0.7) / 45.2 (+0.2) | 55.7 (+0.7) / 55.2 / 55.1 |
| 2,500 ft | 46.0 (+1.0) / 45.4 / 45.1 / 45.0 | 55.1 / 55.0 / 55.0 |
| 1 mile | 45.3 (+0.3) / 45.1 / 45.0 / 45.0 | 55.0 / 55.0 / 55.0 |

Read against the thresholds: at the north-boundary homes (≈240–300 ft) the unmitigated night increase (+13 dB) is above DEC's ">6 dB" and "approaching 10 dB → mitigation" lines and above 55 dB (WHO NNG "increasingly dangerous"); with buffer alone it is still +8.4 dB and >WHO 45 dB Lnight; buffer plus a real wall gets to +2 to +5 dB. Beyond ~1,000 ft the Leq contribution falls under DEC's 3-dB "no appreciable effect" line, but single events (backup alarms ≈49 dBA Lmax, air-brake/coupling ≈61 dBA Lmax at 1,000 ft) remain clearly audible at night, which is exactly what Edison, Ogden and Charlotte residents complain about. Caveats to print under the calculator: dock area is really an area source ~1,000+ ft long, so "distance" should be to the nearest active dock; results are Leq, not what a single air-brake sounds like; the calculator is an estimate, not the applicant's unsubmitted study.

---

## C. Regulatory thresholds

**NYSDEC Program Policy DEP-00-1, "Assessing and Mitigating Noise Impacts"**, issued 6 Oct 2000, revised 2 Feb 2001. https://dec.ny.gov/sites/default/files/2025-03/noise2000.pdf VERIFIED. Key text, pp. 13–14:
- "Increases ranging from 0-3 dB should have no appreciable effect on receptors. Increases from 3-6 dB may have potential for adverse noise impact only in cases where the most sensitive of receptors are present. Sound pressure increases of more than 6 dB may require a closer analysis... SPL increases approaching 10 dB result in a perceived doubling of SPL... An increase of 10 dB(A) deserves consideration of avoidance and mitigation measures in most cases."
- "In non-industrial settings the SPL should probably not exceed ambient noise by more than 6 dB(A) at the receptor. An increase of 6 dB(A) may cause complaints."
- "The addition of any noise source, in a non-industrial setting, should not raise the ambient noise level above a maximum of 65 dB(A)"; commercial/industrial ambient may reach ~79 dB(A).
- EPA 55 dBA Ldn cited as protective; "Most humans find a sound level of 60-70 dB(A) as beginning to create a condition of significant noise effect."
- p.11: singles out **back-up beepers** and compressed-air exhaust as "extremely annoying" sharp/startling noises to pay particular attention to; tonal sounds get a dB penalty.
- Estimation ambient: "quiet suburban residential area... about 45 dB(A)"; dense vegetation ≥100 ft deep reduces 3–7 dB(A), evergreens better; walls/windows closed −15 dB.
- 6 dB per doubling; Table A for adding levels.

**Town of Islip Code Chapter 35, Noise** (adopted 3-4-1986; amended in entirety 11-15-2011; amended 8-9-2022 and 12-12-2023). Text VERIFIED from the Town's Dec 12 2023 hearing/amendment PDF https://ecode360.com/IS0324/laws/LF1938219.pdf ; eCode page https://ecode360.com/6508583 is behind Cloudflare (UNVERIFIED fetch).
- § 35-4: no person shall operate a sound source "so as to create a sound level that exceeds the particular sound level limits set forth in Table 1, when measured at or within the real property boundary line of the receiving property." **The dBA values of Table 1 are an attachment that could not be retrieved — treat the numbers as UNVERIFIED until someone pulls Table 1 from eCode360 or the Town Clerk.** (Brookhaven Ch. 50 is 65 dBA day / 50 dBA night at residential property, VERIFIED via the PSEG report; Floral Park is 50 day / 40 night residential, VERIFIED via Belmont DEIS.)
- § 35-3 violations needing **no measurement**: (B) "sounding of any horn, signaling device or alarm... repetitive sounds for any unreasonable or unnecessary period of time"; (E) "operation, including the stationary idling, of any engine, including... truck... so as to create a noise disturbance"; (H) "loading or unloading of any vehicle... so as to create a noise disturbance"; (G)/(I) heavy equipment and construction limited to 7 a.m.–8 p.m. weekdays.
- "Noise disturbance" = annoys a reasonable person, or is "clearly audible outside the residential real property boundary from which it originates", substantiated by affidavits from two residents in separate homes, a meter reading over Table 1, or an officer's observation. Penalties $100–$500 / $500–$1,000 / $1,000–$1,500 and up to 15 days.
- Suffolk County Ch. 618 applies only to county property/roads (VERIFIED via PSEG report).

**EPA "Levels Document" (March 1974)**: Ldn ≤ 55 dB outdoors residential, ≤ 45 indoors, Leq(24) ≤ 70 for hearing; 5-dB margin of safety. https://www.nonoise.org/library/levels74/levels74.htm VERIFIED; EPA press release 2 Apr 1974 https://www.epa.gov/archive/epa/aboutepa/epa-identifies-noise-levels-affecting-health-and-welfare.html VERIFIED.

**FTA Transit Noise and Vibration Impact Assessment Manual**: 2006 edition (Table 5-7 ambient estimates, Table 6-9/6-10 shielding) https://rmadocs.venturacounty.gov/images/pdf/planning/ceqa/FTA_Noise_and_Vibration_Manual.pdf VERIFIED; 2018 edition (FTA Report 0123) https://www.transit.dot.gov/sites/fta.dot.gov/files/docs/research-innovation/118131/transit-noise-and-vibration-impact-assessment-manual-fta-report-no-0123_0.pdf UNVERIFIED (403).

**FHWA**: barriers/vegetation page https://www.fhwa.dot.gov/Environment/noise/noise_barriers/design_construction/keepdown.cfm VERIFIED; descriptors https://www.fhwa.dot.gov/Environment/noise/resources/fhwahep17053.pdf VERIFIED.

---

## D. Real-world FC / DC noise cases

1. **Amazon LGA9, 2170 Route 27, Edison NJ** — homes ~300 ft away. Township sound study by PS&S (Aug 2020) https://cms2.revize.com/revize/edisonnj/1%20NEWS%20NEW/Amazon%20Sound%20Study.pdf VERIFIED: residents' worst sounds were "truck backup beepers and short duration loud noises that sounded like dropping trailers or dragging trailers"; observed sources at the property lines were yard-tractor broadband alarms, air-brake release, trucks "revving to get into gear", horns, hitch opening, trailer drops; residual (site-off) 38–48 dBA; impulses "all below 60 dBA"; found compliant with NJ 50 dBA night / 80 dBA impulse limits — on a night neighbours called "relatively quiet". Township re-investigation Dec 2023 (same PDF): again compliant, again "nights the readings were taken seemed relatively quiet". NJ Noise Control Council minutes, July 2024 https://nj.gov/dep/enforcement/docs/july24minutes.pdf VERIFIED: resident 300 ft away "struggle with quality of life and have trouble sleeping"; Amazon replaced a 10-ft stockade fence with a **20-ft sound barrier; experts testified a 6-dB improvement**; readings "just under the nighttime limit of 50 decibels"; loudest on Prime Day; Rutgers noise expert coined "complaint fatigue". Lesson for the page: compliance readings on quiet nights do not equal quiet, and a 20-ft wall bought 6 dB.
2. **Amazon sortation center, 119 Shepard Rd, Ogden NY (Monroe County)** — WHEC https://www.whec.com/top-news/ogden-neighbors-voice-concerns-over-amazon-facility-expansion/ VERIFIED: 24/7; "hundreds of trailers" moved at night; backup alarms, air brakes, coupling; light pollution; Amazon retrofitted white-noise alarms and light shields after opening; town planning a berm. No dB numbers.
3. **Amazon CLT9 sort center, west Charlotte NC** — WSOC 15 Jul 2022 https://www.wsoctv.com/news/local/resident-says-noisy-trucks-amazon-facility-disrupt-her-entire-life/4KV4A25KPRCQRPCZSOIOFZCMAQ/ VERIFIED: operations from 11 p.m.; ">a dozen noise complaints since 2019"; promised noise wall not built at time of article. No dB.
4. **Amazon data center, Great Oak subdivision, Prince William County VA** (not an FC, but Amazon + measured numbers) — Data Center Knowledge https://www.datacenterknowledge.com/data-center-construction/amazon-tones-down-its-data-center-noise-after-residents-sound-the-alarm VERIFIED: ~600 ft from homes with an oak forest between; residents metered **up to 65 dB at night vs 55 dB county limit**; Amazon replaced 424 rooftop fans; dropped to ~50 dB. Shows (a) 600 ft + trees was not enough, (b) 10-dB fixes are possible when forced.
5. **Amazon, Lyons Park, Coventry UK** — Council report S73/2017/0902 (edemocracy.coventry.gov.uk/documents/s35248/) VERIFIED: original consent (up to 500 lorries/24 h) required a 5.5-m cantilevered barrier, 6-m barrier/bund, improved bedroom glazing for nearest homes, and "**No tonal reversing alarms at night**"; residents' night rating levels "already predicted to exceed background noise levels by 5dB"; petition opposed any relaxation; officers kept the non-tonal-alarm condition. Useful precedent for conditions to demand.
6. **Red Hook, Brooklyn (Amazon last-mile cluster)** — Consumer Reports https://innovation.consumerreports.org/?p=8733 VERIFIED: 6-month meter on a balcony recorded events "twice as loud as background levels every three minutes" by day and "four times as loud every 30 minutes"; ~1,000 trucks/vans per weekday. No absolute dB published.
7. **Brewster (Southeast) NY warehouse night-truck study**, LSG&A, 6 May 2026 https://southeast-ny.gov/DocumentCenter/View/9118/Lincoln-Logistics-Submission-05062026 VERIFIED — a NY comparator: town limits 65 day / 55 night, impulsive 75/65; homes **1,400–3,900 ft** from docks; modeled continuous Lmax 47–54 dBA and trailer-hitching 36–42 dBA at the nearest lines; background L90 34–43; consultant still had to add screening and concedes alarms "may be barely perceptible" outdoors. Contrast: Holbrook homes are at 240 ft.
8. **Holbrook's own precedent** — the 2021 Amazon last-mile facility at 717 Broadway Ave/Vets Hwy (~150,000 sf, ~250 ft from homes): Islip ZBA granted a **24.4-ft sound-attenuating wall** variance; residents cited idling, sound and light (3,600 lights). Patch Dec 2020 https://patch.com/new-york/sachem/amazon-center-proposal-draws-local-opposition-holbrook and GreaterLongIsland Jun 2021 https://greaterlongisland.com/amazon-warehouse-construction-is-underway-in-holbrook-concerns-linger/ both VERIFIED. (The "240 ft / 24.4-ft wall" claim in search snippets belongs to that 2021 project, not Project Sunrise; do not conflate.)
9. Searched but found no public noise study or dB data for Amazon in Montgomery, Schodack, Clay, Syosset, Carle Place, Woodbury NY; Bucks County PA; Fresno; Inland Empire (only qualitative "chorus of beeping loading docks" coverage).

---

## E. Health thresholds

- **WHO Environmental Noise Guidelines 2018** (via NCBI Bookshelf Table 8.11) https://www.ncbi.nlm.nih.gov/books/NBK535301/table/ch8.tab11/ VERIFIED: road traffic **Lden < 53 dB, Lnight < 45 dB** (strong); rail 54/44; aircraft 45/40. Official WHO page https://www.who.int/europe/publications/i/item/9789289053563 VERIFIED (landing page only).
- **WHO Night Noise Guidelines for Europe 2009** https://iris.who.int/server/api/core/bitstreams/43bf485d-2771-4297-86fe-6284430090ef/content VERIFIED: **Lnight,outside 40 dB = LOAEL**; 30 dB = NOEL; 40–55 dB "adverse health effects are observed... vulnerable groups more severely affected"; **>55 dB "increasingly dangerous for public health... risk of cardiovascular disease increases"**; interim target 55 dB. Effect thresholds table: self-reported sleep disturbance 42; hypertension 50; myocardial infarction 50.
- WHO/Europe noise fact sheet https://www.who.int/europe/news-room/fact-sheets/item/noise VERIFIED: <30 dB(A) in bedrooms, <35 in classrooms, <40 Lnight outside bedrooms; "consistent evidence that noise exposure harms cognitive performance" in children.
- Smith, Cordoza, Basner, *EHP* 2022;130(7):076001 (WHO review update) https://pmc.ncbi.nlm.nih.gov/articles/PMC9272916/ VERIFIED: per +10 dB Lnight, odds of high sleep disturbance from **road noise OR 2.52** (95% CI 2.28–2.79).
- AAP policy statement, Balk et al., *Pediatrics* 2023;152(5):e2023063752 https://europepmc.org/article/MED/37864407 VERIFIED: "Environmental noise, such as traffic noise, can affect learning, physiologic parameters, sleep, and quality of life."
- Qu et al., *Noise Health* 2026;28(132):535–543 https://pmc.ncbi.nlm.nih.gov/articles/PMC13399459/ VERIFIED: +0.5–1.5 mmHg systolic BP per +10 dB daytime traffic noise in children 7–12; WHO 40 dB night for children.
- Brightview Sayville (1,200 ft SW) is the "vulnerable group" WHO names (elderly, chronically ill). At 1,200 ft the model gives ~46 dBA Leq project-only with no mitigation, roughly at the WHO Lnight line; individual air-brake events ≈59 dBA Lmax.

---

## F. Light pollution (brief)

- IDA-IES Model Lighting Ordinance: light-trespass limit at any vertical property-line plane by zone — LZ1 **0.1 fc**, LZ2 0.3 fc, LZ3 0.8 fc (Appendix Table B); zones LZ0–LZ4; curfews; BUG ratings. Verified from a public-review draft mirror https://www.mrcog-nm.gov/DocumentCenter/View/3067/Example-Dark-Skies-Lighting-Ordinance-PDF VERIFIED; official 2011 MLO https://darksky.org/app/uploads/bsk-pdf-manager/16_MLO_FINAL_JUNE2011.PDF UNVERIFIED (403).
- Amazon cases: Ogden NY shields retrofitted after complaints (VERIFIED, above); Havant UK delivery station brightness complaints, Portsmouth News UNVERIFIED (403); Holbrook 2021 project "3,600 lights" resident concern (VERIFIED, Patch).
- Ask: full-cutoff/U0 fixtures, ≤3000K, 0.1 fc at the north property line, post-midnight curfew dimming, photometric plan showing the 240-ft buffer as a dark zone.

---

## G. Suggested page outline and headline stats

Outline: (1) hero + 3 stats; (2) "What you'll hear" source table with a play-by-play of a single truck cycle (arrive, air-brake, back-up alarm, coupling, idle, depart); (3) "How loud at my house" calculator (inputs: distance to nearest dock, avg/peak day, day/night, buffer depth actually dense, wall 0/5/10, ambient preset 45/50/55 or user-measured) with the increase-over-ambient readout colour-coded to DEC 3/6/10 dB and WHO 40/45/55; (4) "What the rules say" (DEC, Islip §35-3/35-4, WHO); (5) "It happened elsewhere" (Edison, Ogden, Charlotte, Prince William, Coventry, Brewster contrast); (6) health; (7) light; (8) demands: submit the operational noise study before any vote; independent night ambient monitoring at the north boundary and Brightview; non-tonal alarms and no night trailer moves at north docks as conditions (Coventry precedent); engineered wall sized to ≥10 dB at the nearest homes, not a fence; TRU electric standby; complaint hotline with published meter data.

Three headline stats:
1. "555 trucks a day, 24/7/365 — one truck every 2.6 minutes, all night (one every 1.8 minutes on peak days)." (applicant's filing; arithmetic derived)
2. "A standard back-up alarm is 97 dB(A) at 4 feet. At the homes 300 feet from the docks that is still ~60 dBA — louder than WHO's 45 dB night limit and above the 40 dB level where WHO says health effects begin." (FedSig/SAE + 6 dB/doubling; derivation)
3. "Amazon's Edison NJ neighbours live 300 feet from a fulfillment center. Their 20-foot sound wall bought 6 decibels; they still can't sleep on Prime Day." (NJ Noise Control Council minutes, July 2024, VERIFIED)

Two open items: the Islip Chapter 35 **Table 1 dBA values** (eCode360 blocked; screenshot from ecode360.com/6508583 or request from the Town Clerk), and the FTA **2018** manual PDF (blocked; the 2006 mirror is verified and contains the same ambient table).
