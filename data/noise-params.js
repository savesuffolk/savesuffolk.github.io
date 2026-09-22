// Stop Project Sunrise — noise & light page data. Every number carries a source and a status tag.
// status: "verified" = the source page/PDF was fetched and the number read in it; "unverified" = seen only in search
// snippets or fetch blocked — confirm before quoting; "estimate" = our own assumption or arithmetic, shown as such.
// Full research trail: research/noise.md. Calculator math: js/noise.js (mirrors research/noise-calc.py).
window.SPS = window.SPS || {};

SPS.noise = {
  // ---- Site geometry (estimate). Property polygon traced from OpenStreetMap road centerlines (Veterans Memorial Hwy,
  // Sunrise Hwy, Beacon Dr) and tuned to the filed 138.05 acres; the building envelope is the polygon inset by the filed
  // 240-ft buffer (544 ft on the north/residential side per the site plan). Docks are assumed anywhere on that envelope.
  site: {
    polygon: [[40.7702, -73.0585], [40.7713, -73.0520], [40.7758, -73.0520], [40.7758, -73.0645], [40.7747, -73.0672]],
    insetFt: [240, 240, 240, 240, 240], // per edge, starting with the edge from vertex 0 to 1 (south), then east, north, northwest, west. The building itself sits 544 ft from the north line, but truck courts and trailer parking can occupy everything outside the 240-ft buffer.
    centroid: [40.7735, -73.0625],
    brightview: [40.7678, -73.0636],
    source: "Property outline: OpenStreetMap centerlines (ODbL), tuned to Full EAF Part 1 site area 138.05 ac. Buffers: Full EAF attachment; VHB site plan.",
    status: "estimate"
  },

  // ---- Source sound levels (dBA) at a reference distance ----
  sources: [
    { key: "pass", label: "Heavy truck, yard movement", level: 85, ref: 50, metric: "SEL per pass", source: "Saxelby Acoustics, West Roseville CA noise study (Sept 2022)", url: "https://www.roseville.ca.gov/Documents/City%20Administration/Boards%20and%20Commissions/Planning%20Commission/2023/PL22-0205,%201751%20Pleasant%20Grove,%20Grocery%20Outlet,%2002%20Attachment%202%20noise%20study.pdf", status: "verified" },
    { key: "cruise", label: "Heavy truck pass-by at 45 mph", level: 81.3, ref: 50, metric: "Lmax", source: "FHWA Traffic Noise Model 3.0 Tech Manual, Table 10 REMEL constants (our arithmetic)", url: "https://www.fhwa.dot.gov/environment/noise/traffic_noise_model/old_versions/tnm_v30/tnm3_tech_manual.cfm", status: "verified" },
    { key: "idle", label: "Three trucks idling", level: 69, ref: 50, metric: "continuous", source: "LSA truck-terminal study, cited in City of Long Beach Intex Fulfillment Center DEIR §4.9", url: "https://www.longbeach.gov/globalassets/lbcd/media-library/documents/planning/environmental/environmental-reports/pending/intex-corporate-office-and-fulfillment-center-project-eir/4-9-noise", status: "verified" },
    { key: "dock", label: "Loading-dock lane: air brakes, backing, coupling", level: 81, ref: 100, metric: "Lmax", source: "Saxelby Acoustics, West Roseville CA (2022)", url: "https://www.roseville.ca.gov/Documents/City%20Administration/Boards%20and%20Commissions/Planning%20Commission/2023/PL22-0205,%201751%20Pleasant%20Grove,%20Grocery%20Outlet,%2002%20Attachment%202%20noise%20study.pdf", status: "verified" },
    { key: "alarm", label: "Back-up alarm (SAE J994 Type C)", level: 97, ref: 4, metric: "Lmax", source: "Federal Signal 2012-series data sheet; SAE J994 rating. 4-ft rating distance is the industry convention.", url: "https://www.fedsig.com/sites/default/files/resource_library_document/M9009%202012%20Series%20Back-up%20Alarm%20Data%20Sheet.pdf", status: "verified", note: "Holzman, Environ. Health Perspect. 2011: typical alarms 97–112 dB at the source." },
    { key: "tru", label: "Trailer refrigeration unit", level: 70, ref: 50, metric: "continuous", source: "RWDI, Canadian Acoustics: average sound power 102 dBA over 16 units (converted to 50 ft, our arithmetic)", url: "https://jcaa.caa-aca.ca/index.php/jcaa/article/download/3145/pdf/4351", status: "verified" },
    { key: "hvac", label: "Rooftop HVAC unit (50-ton)", level: 59, ref: 50, metric: "Leq", source: "Saxelby Acoustics, manufacturer data (2022)", url: "https://www.roseville.ca.gov/Documents/City%20Administration/Boards%20and%20Commissions/Planning%20Commission/2023/PL22-0205,%201751%20Pleasant%20Grove,%20Grocery%20Outlet,%2002%20Attachment%202%20noise%20study.pdf", status: "verified" }
  ],

  // ---- Calculator assumptions (each labelled) ----
  model: {
    selTruck: { value: 85, label: "SEL of one truck movement at 50 ft", status: "verified" },
    idle3: { value: 69, label: "Three idling trucks at 50 ft", status: "verified" },
    alarmAt4ft: { value: 97, label: "Back-up alarm at 4 ft", status: "verified" },
    dockLmaxAt100: { value: 81, label: "Air-brake / coupling Lmax at 100 ft", status: "verified" },
    movementsPerTrip: { value: 2, label: "Dock maneuvers per truck trip (arrive + depart)", status: "estimate" },
    idlers: { value: 5, label: "Trucks idling at once", status: "estimate" },
    alarmSeconds: { value: 10, label: "Seconds of alarm per maneuver", status: "estimate", note: "LSG&A, Brewster NY (2026) used the same assumption" },
    uniform24h: { label: "Trips spread evenly over 24 hours", status: "estimate", note: "The filing gives daily totals only; the applicant's hour-by-hour schedule is not public." }
  },

  // ---- Ambient presets (dBA Leq) ----
  ambient: [
    { key: "quiet", label: "Quiet suburban street", day: 50, night: 40, source: "FTA Transit Noise & Vibration manual Table 5-7, 1,000–3,000 people/sq mi; NYSDEC DEP-00-1 \"quiet suburban… about 45 dB(A)\"", status: "verified" },
    { key: "suburban", label: "Typical Holbrook block (default)", day: 55, night: 45, source: "FTA Table 5-7, 3,000–10,000 people/sq mi. Holbrook CDP ≈ 3,850/sq mi.", status: "verified" },
    { key: "highway", label: "Within 400 ft of Sunrise Hwy", day: 60, night: 50, source: "FTA Table 5-7, 200–400 ft from an interstate-type highway with trucks", status: "verified" },
    { key: "measured", label: "Measured: Lake Ronkonkoma, 10–11 PM", day: 55, night: 49, source: "PS&S for PSEG-LI, Feb 11 2020, Innis Ave residential boundary Leq 49.2", status: "verified" }
  ],

  // ---- Thresholds ----
  thresholds: {
    dec: [
      { at: 3, label: "0–3 dB: no appreciable effect" },
      { at: 6, label: "3–6 dB: potential adverse impact for sensitive receptors" },
      { at: 10, label: "over 6 dB: closer analysis; approaching 10 dB: mitigation in most cases" }
    ],
    decMax: 65,
    who: { loael: 40, lnight: 45, danger: 55 },
    epa: { ldn: 55 }
  },

  // ---- What the rules say ----
  rules: [
    { who: "NYSDEC Program Policy DEP-00-1, Assessing and Mitigating Noise Impacts (2000, rev. 2001)", says: "\"In non-industrial settings the SPL should probably not exceed ambient noise by more than 6 dB(A) at the receptor. An increase of 6 dB(A) may cause complaints.\" \"An increase of 10 dB(A) deserves consideration of avoidance and mitigation measures in most cases.\" No new source should raise a non-industrial ambient above 65 dB(A). Names back-up beepers and compressed-air exhaust as \"extremely annoying\" sounds to examine specifically.", url: "https://dec.ny.gov/sites/default/files/2025-03/noise2000.pdf", status: "verified" },
    { who: "Town of Islip Code, Chapter 35 (Noise)", says: "§35-4: no sound source may exceed the Table 1 limits \"measured at or within the real property boundary line of the receiving property.\" §35-3 lists violations that need no meter: repetitive alarms, engine idling, loading or unloading, or any sound \"clearly audible\" across a residential property line, substantiated by two residents' affidavits. Penalties $100–$1,500 and up to 15 days.", url: "https://ecode360.com/6508583", status: "verified", note: "The dBA figures in Table 1 are an attachment we could not retrieve online — confirm with the Town Clerk. Brookhaven's equivalent is 65 dBA day / 50 dBA night at a residential line." },
    { who: "WHO Environmental Noise Guidelines (2018)", says: "Road-traffic noise should stay below 53 dB Lden and 45 dB Lnight. Night Noise Guidelines (2009): effects begin at 40 dB outside bedrooms; 40–55 dB, adverse health effects observed, vulnerable groups more affected; above 55 dB, \"increasingly dangerous for public health.\"", url: "https://www.ncbi.nlm.nih.gov/books/NBK535301/table/ch8.tab11/", status: "verified" },
    { who: "US EPA Levels Document (1974)", says: "55 dB Ldn outdoors and 45 dB indoors in residential areas protect health and welfare with a margin of safety.", url: "https://www.nonoise.org/library/levels74/levels74.htm", status: "verified" }
  ],

  // ---- Other Amazon facilities: what neighbors measured or won ----
  cases: [
    { place: "Edison, NJ — Amazon LGA9, homes 300 ft away", what: "Township sound study found the worst sounds were back-up beepers and trailer drops; readings taken on nights neighbors called \"relatively quiet\" still met the 50 dBA night limit only \"just under.\" A 20-ft sound wall replaced a 10-ft fence; experts testified it bought 6 dB. Residents still \"have trouble sleeping\"; a Rutgers noise expert coined \"complaint fatigue.\"", url: "https://nj.gov/dep/enforcement/docs/july24minutes.pdf", cite: "NJ Noise Control Council minutes, July 2024; PS&S sound study Aug 2020", status: "verified" },
    { place: "Ogden, NY — Amazon sortation center (opened 2023)", what: "\"Hundreds of trailers\" moved at night; air brakes, coupling, back-up alarms, light trespass. Amazon retrofitted white-noise alarms and light shields after opening; the town is planning a berm.", url: "https://www.whec.com/top-news/ogden-neighbors-voice-concerns-over-amazon-facility-expansion/", cite: "News10NBC", status: "verified" },
    { place: "Charlotte, NC — Amazon CLT9 sort center", what: "Operations start at 11 PM; more than a dozen noise complaints since 2019; the noise wall promised at approval had not been built.", url: "https://www.wsoctv.com/news/local/resident-says-noisy-trucks-amazon-facility-disrupt-her-entire-life/4KV4A25KPRCQRPCZSOIOFZCMAQ/", cite: "WSOC-TV, July 15 2022", status: "verified" },
    { place: "Prince William County, VA — Amazon data center, 600 ft from homes through an oak forest", what: "Residents metered up to 65 dB at night against a 55 dB county limit. Amazon replaced 424 rooftop fans; levels dropped to about 50 dB. Six hundred feet and a forest were not enough; a 10-dB fix was possible once forced.", url: "https://www.datacenterknowledge.com/data-center-construction/amazon-tones-down-its-data-center-noise-after-residents-sound-the-alarm", cite: "Data Center Knowledge", status: "verified" },
    { place: "Coventry, UK — Amazon Lyons Park, up to 500 lorries a day", what: "Planning consent required a 5.5-m cantilevered barrier, a 6-m bund, improved bedroom glazing for the nearest homes and \"no tonal reversing alarms at night.\" When Amazon asked to relax conditions, 363 residents petitioned and the council kept the alarm ban.", url: "https://edemocracy.coventry.gov.uk/documents/s35248/", cite: "Coventry City Council report S73/2017/0902", status: "verified" },
    { place: "Brewster (Southeast), NY — warehouse night-truck study (May 2026)", what: "Homes 1,400–3,900 ft from the docks. Even at that range the consultant modeled trailer-hitching at 36–42 dBA at the nearest lots, added screening, and conceded alarms \"may be barely perceptible\" outdoors. Holbrook's homes are at 240 ft.", url: "https://southeast-ny.gov/DocumentCenter/View/9118/Lincoln-Logistics-Submission-05062026", cite: "LSG&A for Town of Southeast", status: "verified" },
    { place: "Holbrook, NY — Amazon delivery station, 717 Broadway Ave (2021)", what: "A 150,000 sq ft station about 250 ft from homes, 1/28th the size of Project Sunrise. Neighbors cited idling, sound and 3,600 lights. The Islip ZBA granted a 24.4-ft sound-attenuating wall.", url: "https://greaterlongisland.com/amazon-warehouse-construction-is-underway-in-holbrook-concerns-linger/", cite: "Greater Long Island, June 2021; Patch, Dec 2020", status: "verified" }
  ],

  // ---- Sleep window & indoor thresholds (WHO Night Noise Guidelines for Europe, 2009, Table 1; NYSDEC DEP-00-1 for facade reduction) ----
  sleep: { windowStart: "11 PM", windowEnd: "6 AM", windowLabel: "11 PM to 6 AM", hours: 7, indoorClosed: 15, indoorOpen: 5,
    who: { motility: 32, eeg: 35, wake: 42 },
    url: "https://iris.who.int/server/api/core/bitstreams/43bf485d-2771-4297-86fe-6284430090ef/content", status: "verified",
    note: "WHO NNG Table 1 (LAmax,inside): 32 dB onset of motility; 35 dB EEG awakening, sleep fragmentation; 42 dB waking up in the night and/or too early. NYSDEC DEP-00-1: 15 dB outside-to-inside with windows closed, 5 dB open. WHO NNG (p. 10) treats 15 dB as a window slightly open and says the simplest closed facades give under 24 dB — so our closed-window figure is conservative." },

  // ---- Recordings from neighbors of 24/7 logistics sites. Existence, title, channel and date verified by fetching each page;
  // audio content NOT yet listened to — the "hear" text is from the source's own description. Research: research/audio-clips.md.
  audio: [
    { url: "https://www.wsoctv.com/news/local/resident-says-noisy-trucks-amazon-facility-disrupt-her-entire-life/4KV4A25KPRCQRPCZSOIOFZCMAQ/", title: "Resident says noisy trucks at Amazon facility disrupt her entire life", by: "WSOC-TV Charlotte, July 15 2022", where: "Charlotte, NC — Amazon CLT9 sort center", distance: "next door, 50 years in the house", when: "\"When they start at 11 o'clock at night, they don't stop\"", hear: "her own cellphone recording of the trucks; the noise wall promised at approval was never built", amazon: true, status: "verified" },
    { url: "https://www.whec.com/top-news/ogden-neighbors-voice-concerns-over-amazon-facility-expansion/", title: "Ogden neighbors voice concerns over Amazon facility expansion", by: "News10NBC Rochester, Jan 2026", where: "Ogden, NY — Amazon sortation center", distance: "neighbors on Shepard Rd", when: "night", hear: "\"hundreds of trailers… you can hear the air brakes go, the clanking of connecting the trailers\"", amazon: true, status: "verified" },
    { yt: "WpEzKVKlEDw", start: 3282, title: "\"They are most definitely coming from Amazon\" — a neighbor to her City Council", by: "City of Brooklyn, Ohio council meeting, June 22 2026 (starts at 54:42; about 3 minutes)", where: "Brooklyn, OH — Amazon facility", distance: "10523 Manoa Ave, next to the site", when: "alarms between 11 PM and 5 AM, three years running", hear: "her testimony: alarms she can hear over her TV, police unsure of the source, Amazon \"always has an excuse.\" No recording is played on camera.", amazon: true, status: "verified" },
    { yt: "IAB71khi7_s", title: "The back-up sound of an Amazon Prime step van", by: "Long Island hobbyist channel, 2021", where: "Long Island, NY", distance: "curbside", when: "", hear: "seven seconds of the reverse alarm on an Amazon van — the tone, not the distance", amazon: true, status: "verified" }
  ],

  // ---- Health ----
  health: [
    { stat: "40 dB", label: "Outdoor night level where WHO says health effects begin", detail: "WHO Night Noise Guidelines for Europe (2009): 40 dB Lnight,outside is the lowest observed adverse effect level; self-reported sleep disturbance at 42; hypertension and heart attack risk from 50.", url: "https://iris.who.int/server/api/core/bitstreams/43bf485d-2771-4297-86fe-6284430090ef/content", status: "verified" },
    { stat: "2.5×", label: "Odds of high sleep disturbance per +10 dB of night road noise", detail: "Smith, Cordoza & Basner, Environmental Health Perspectives 2022 (WHO evidence update): OR 2.52, 95% CI 2.28–2.79.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9272916/", status: "verified" },
    { stat: "Children", label: "Traffic noise affects learning, sleep and blood pressure", detail: "American Academy of Pediatrics policy statement, Pediatrics 2023; Qu et al., Noise & Health 2026: +0.5–1.5 mmHg systolic per +10 dB daytime traffic noise, ages 7–12.", url: "https://europepmc.org/article/MED/37864407", status: "verified" },
    { stat: "1,200 ft", label: "Brightview Sayville senior residence", detail: "WHO names the elderly and chronically ill as the groups most affected between 40 and 55 dB. Unmitigated, the model puts the project's own contribution at about 46 dBA at Brightview, with single air-brake events near 59 dBA.", url: "", status: "estimate" }
  ],

  // ---- One truck, start to finish (Lmax at 50 ft; scaled by the calculator) ----
  cycle: [
    { step: "Rolls through the yard toward the docks", lmax50: 76, note: "25-mph pass-by (FHWA TNM); 81 dBA at highway speed" },
    { step: "Air brakes release at the dock lane", lmax50: 87, note: "Roseville study: 81 dBA at 100 ft" },
    { step: "Backs into the bay — alarm sounds", lmax50: 75, note: "97 dBA alarm at 4 ft" },
    { step: "Trailer drops / couples", lmax50: 87, note: "impulsive; \"like dropping trailers\" (Edison study)" },
    { step: "Idles while unloading", lmax50: 64, note: "per-bay activity, Long Beach DEIR" },
    { step: "Reefer unit runs", lmax50: 70, note: "RWDI: 102 dBA sound power" },
    { step: "Pulls out", lmax50: 76, note: "and the next one is 2.6 minutes behind it" }
  ],

  // Everyday comparisons (CDC, "What Noises Cause Hearing Loss?")
  ladder: [[30, "Whisper"], [40, "Refrigerator hum"], [50, "Moderate rainfall"], [60, "Normal conversation"], [70, "Washing machine, dishwasher"], [80, "City traffic, inside the car"], [90, "Motorcycle, lawn mower"], [100, "Car horn at 16 ft; subway train arriving"]],
  ladderSource: { label: "CDC, National Center for Environmental Health", url: "https://www.cdc.gov/hearing-loss/about/what-noises-cause-hearing-loss.html" },

  // ---- Light ----
  light: {
    facts: [
      { text: "The applicant's lighting plan is marked \"being prepared\" and has not been submitted.", source: "Full EAF Part 1", status: "verified" },
      { text: "The Illuminating Engineering Society / DarkSky Model Lighting Ordinance limits light trespass at a residential property line to 0.1 footcandle (LZ1) or 0.3 fc (LZ2).", source: "IES/IDA Model Lighting Ordinance, Table B", status: "verified", url: "https://www.mrcog-nm.gov/DocumentCenter/View/3067/Example-Dark-Skies-Lighting-Ordinance-PDF" },
      { text: "Holbrook's 2021 Amazon delivery station drew objections to 3,600 proposed lights; Ogden NY's Amazon had to retrofit shields after opening.", source: "Patch (Dec 2020); News10NBC", url: "https://patch.com/new-york/sachem/amazon-center-proposal-draws-local-opposition-holbrook", status: "verified" }
    ],
    asks: ["Full-cutoff (U0) fixtures, 3000 K or warmer, everywhere on the site", "Photometric plan showing 0.1 fc or less at the north property line", "Post-midnight curfew dimming on yard and parking lighting", "The 240-ft buffer kept as a dark zone with no fixtures"]
  },

  // ---- What to demand before any vote ----
  asks: [
    "The operational noise study, submitted and reviewed, before the Change of Zone is heard — not after.",
    "Independent nighttime ambient monitoring at the north property line and at Brightview, with the data published.",
    "Non-tonal (broadband) back-up alarms on every yard vehicle and no trailer moves on the north side between 10 PM and 7 AM, written as conditions (Coventry precedent).",
    "An engineered sound wall designed to deliver 10 dB at the nearest homes — not a fence — with the design stamped before approval.",
    "Electric standby for every refrigerated trailer parked on site.",
    "A published complaint line with meter readings posted within 48 hours."
  ]
};
