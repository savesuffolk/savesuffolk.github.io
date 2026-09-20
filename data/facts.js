// Stop Project Sunrise — canonical facts. Single source of truth for every number on the site.
// All values come from the applicant's own filing (Full EAF 7/15/2026, Stonefield Traffic Impact
// Study 6/30/2026, VHB Conceptual Site Plan 7/15/2026, Change-of-Zone application form, Town emails,
// recorded deeds). Do NOT use flyer rounding here. Edit display/source together.
window.SPS = window.SPS || {};

SPS.facts = {
  // ---- Scale ----
  gfa: { value: 4264725, display: "4,264,725", unit: "sq ft", label: "Floor area (GFA)", source: "Change-of-Zone application form; Full EAF Part 1 (7/15/2026)", warn: false, tile: true },
  gfaWithGarage: { value: 4430709, display: "4,430,709", unit: "sq ft", label: "Floor area incl. parking garage", source: "VHB Conceptual Site Plan, zoning summary chart", warn: false, tile: false },
  southBuilding: { value: 3484260, display: "3,484,260", unit: "sq ft", label: "South building (3-story, 60 ft)", source: "Full EAF Part 1; site plan", warn: false, tile: false },
  northBuilding: { value: 725000, display: "725,000", unit: "sq ft", label: "North building (2-story, 48–52 ft, incl. 300,000 sq ft future mezzanine)", source: "Full EAF Part 1; site plan", warn: false, tile: false },
  garage: { value: 165984, display: "165,984", unit: "sq ft", label: "One-level parking garage", source: "Full EAF Part 1; site plan", warn: false, tile: false },
  siteAcres: { value: 138.05, display: "138.05", unit: "acres", label: "Site area", source: "Full EAF Part 1 (5,977,852 sq ft)", warn: false, tile: true },
  disturbedAcres: { value: 101.6, display: "101.6", unit: "acres", label: "Acres to be physically disturbed", source: "Full EAF Part 1", warn: false, tile: true },
  heightSouth: { value: 60, display: "60", unit: "ft", label: "South building height", source: "Full EAF Part 1; site plan", warn: false, tile: false },
  heightTallest: { value: 78.83, display: "78'-10\"", unit: "", label: "Tallest element (stair elevation)", source: "VHB site plan height data", warn: true, tile: false },
  heightMax: { value: 60, display: "60 ft / 4 stories", unit: "", label: "Industrial 1 maximum height", source: "Islip Town Code §68-343", warn: false, tile: false },
  largestStructure: { value: "60 × 640 × 1,960 ft", display: "60 ft tall, 640 ft wide, 1,960 ft long", unit: "", label: "Largest structure dimensions", source: "Full EAF Part 1", warn: false, tile: false },
  far: { value: 0.713, display: "0.713", unit: "FAR", label: "Floor area ratio proposed (0.741 with garage)", source: "Site plan zoning chart — marked \"Complies: N\"", warn: true, tile: true },
  farMax: { value: 0.35, display: "0.35", unit: "FAR", label: "Industrial 1 maximum FAR", source: "Islip Town Code §68-344", warn: false, tile: false },
  farWithGarage: { value: 0.741, display: "0.741", unit: "FAR", label: "FAR including garage", source: "Site plan zoning chart", warn: true, tile: false },

  // ---- Parking / docks ----
  parkingProvided: { value: 1500, display: "1,500", unit: "employee stalls", label: "Code-counted parking provided", source: "Site plan zoning chart", warn: true, tile: true },
  parkingRequired: { value: 6859, display: "6,859", unit: "stalls", label: "Parking required by Town ordinance", source: "Site plan zoning chart — marked \"Complies: N\"", warn: true, tile: false },
  spacesTotal: { value: 2046, display: "2,046", unit: "spaces", label: "All parking/delivery/trailer spaces", source: "Full EAF Part 1", warn: false, tile: false },
  trailerSpaces: { value: 426, display: "426", unit: "trailer spaces", label: "Trailer spaces (12 × 55 ft)", source: "Full EAF Part 1; site plan", warn: false, tile: true },
  loadingBays: { value: 115, display: "115", unit: "loading docks", label: "Truck loading bays (14 × 60 ft)", source: "Full EAF Part 1; site plan", warn: false, tile: true },
  flexSpaces: { value: 120, display: "120", unit: "spaces", label: "Same-day delivery / Flex vehicle spaces", source: "Full EAF Part 1", warn: false, tile: false },
  adaProvided: { value: 30, display: "30 (59 required)", unit: "", label: "Accessible spaces", source: "Site plan zoning chart", warn: true, tile: false },

  // ---- Traffic ----
  truckTripsAvg: { value: 555, display: "555", unit: "truck trips / avg weekday", label: "Truck trips, average weekday", source: "Stonefield TIS Table A5 (operator-supplied schedule); Full EAF", warn: true, tile: true },
  truckTripsPeak: { value: 809, display: "809", unit: "truck trips / seasonal peak day", label: "Truck trips, seasonal peak weekday", source: "Stonefield TIS Table A6; Full EAF", warn: true, tile: true },
  vehiclesAvg: { value: 10815, display: "10,815", unit: "vehicles / day", label: "All vehicle trips, average weekday", source: "Stonefield TIS Table A5", warn: true, tile: true },
  vehiclesPeak: { value: 14373, display: "14,373", unit: "vehicles / day", label: "All vehicle trips, seasonal peak day", source: "Stonefield TIS Table A6", warn: false, tile: false },
  peakHourAM: { value: 451, display: "451", unit: "new trips / AM peak hour", label: "AM peak-hour trips (267 in / 184 out)", source: "Stonefield TIS Table 1", warn: false, tile: true },
  peakHourPM: { value: 998, display: "998", unit: "new trips / PM peak hour", label: "PM peak-hour trips (601 in / 397 out)", source: "Stonefield TIS Table 1", warn: true, tile: true },
  peakHourAMSeasonal: { value: 529, display: "529", unit: "trips / AM peak hour", label: "AM peak hour, seasonal peak day", source: "Stonefield TIS Table 4", warn: false, tile: false },
  peakHourPMSeasonal: { value: 1200, display: "1,200", unit: "trips / PM peak hour", label: "PM peak hour, seasonal peak day", source: "Stonefield TIS Table 4", warn: false, tile: false },
  trucksPMPeak: { value: 27, display: "27", unit: "truck trips / PM peak hour", label: "Trucks in PM peak hour", source: "Stonefield TIS Table 1", warn: false, tile: false },
  crashes: { value: 544, display: "544", unit: "collisions", label: "Collisions at study intersections, Jan 1 2023 – Jan 1 2026", source: "Stonefield TIS, NYSDOT collision data", warn: true, tile: true },
  crashesRearEnd: { value: 259, display: "259", unit: "rear-end", label: "Rear-end collisions (≈48%)", source: "Stonefield TIS", warn: false, tile: false },
  intersectionsAboveAvg: { value: "all", display: "Every one", unit: "", label: "Study intersections with crash rate above NYSDOT average", source: "Stonefield TIS crash-rate summary table", warn: true, tile: false },
  countDates: { value: "2022–2026", display: "Oct 27 2022; Jan 30 2025; Mar 24 2026", unit: "", label: "Traffic count dates used", source: "Stonefield TIS", warn: true, tile: false },
  hours: { value: "24/7", display: "24 / 7 / 365", unit: "", label: "Hours of operation", source: "Full EAF Part 1", warn: true, tile: true },

  // ---- Land / environment ----
  forestBefore: { value: 136.77, display: "136.77", unit: "acres", label: "Forest today", source: "Full EAF Part 1, land-cover table", warn: false, tile: false },
  forestAfter: { value: 36.90, display: "36.90", unit: "acres", label: "Forest after construction", source: "Full EAF Part 1, land-cover table", warn: true, tile: false },
  forestLost: { value: 99.87, display: "99.87", unit: "acres", label: "Forest removed", source: "Full EAF Part 1, land-cover table (136.77 − 36.90)", warn: true, tile: true },
  imperviousBefore: { value: 0.50, display: "0.50", unit: "acres", label: "Impervious surface today", source: "Full EAF Part 1, land-cover table", warn: false, tile: false },
  imperviousAfter: { value: 83.80, display: "83.80", unit: "acres", label: "Impervious surface after (≈61% of site)", source: "Full EAF Part 1, land-cover table", warn: true, tile: true },
  landscaping: { value: 16.60, display: "16.60", unit: "acres", label: "Landscaped area after", source: "Full EAF Part 1, land-cover table", warn: false, tile: false },
  depthToWater: { value: 19, display: "19", unit: "ft below grade", label: "Depth to water table (applicant's figure)", source: "Full EAF Part 1 (\"19± feet bgs\"); EPA Goldisc ROD reports 18–32 ft nearby", warn: true, tile: true },
  depthToBedrock: { value: 1600, display: "1,600", unit: "ft", label: "Depth to bedrock", source: "Full EAF Part 1", warn: false, tile: false },
  aquifer: { value: "Nassau-Suffolk Sole Source Aquifer", display: "Sole Source Aquifer", unit: "", label: "Site sits over the Nassau-Suffolk Sole Source Aquifer", source: "Full EAF Part 1", warn: true, tile: true },
  soils: { value: "99.9% well drained", display: "99.9%", unit: "well-drained sand", label: "Soils: Riverhead sandy loam 63.9%, Plymouth loamy coarse sand 25.3%, Carver/Plymouth 8.3%", source: "Full EAF Part 1", warn: false, tile: false },
  waterDemand: { value: 72000, display: "72,000", unit: "gal / day", label: "Water demand (SCWA Distribution Area #1; no lines exist on site)", source: "Full EAF Part 1 — \"provided by the Applicant based on similar projects\"", warn: true, tile: true },
  sewage: { value: 61200, display: "61,200", unit: "gal / day", label: "Sanitary wastewater to Suffolk County Sewer District No. 14 (Parkland); no sewer lines exist on site", source: "Full EAF Part 1 — \"provided by the Applicant based on similar projects\"", warn: true, tile: true },
  stormDesign: { value: 8, display: "8-inch", unit: "storm", label: "Stormwater: catch basins and drywells sized for an 8-inch rainfall; infiltrated on site", source: "Full EAF attachment", warn: true, tile: false },
  electric: { value: 12.1, display: "12.1", unit: "MW peak", label: "Peak electrical demand (PSEG Long Island)", source: "Full EAF Part 1", warn: false, tile: false },
  solidWaste: { value: 4000, display: "4,000", unit: "tons / yr", label: "Operational solid waste (1,400 tons/yr during construction)", source: "Full EAF Part 1", warn: false, tile: false },
  bufferNorth: { value: 240, display: "240", unit: "ft minimum", label: "Vegetated buffer along northern (residential) boundary", source: "Full EAF attachment; site plan", warn: false, tile: false },
  brightview: { value: 1200, display: "1,200", unit: "ft", label: "Distance to Brightview Sayville senior living (southwest)", source: "Full EAF Part 1", warn: false, tile: false },
  goldisc: { value: "717 Broadway Ave", display: "Adjacent (west)", unit: "", label: "Goldisc Recording NYSDEC site 152022 — nickel plating wastes, solvents, PVC; quarterly groundwater monitoring continues", source: "Full EAF attachment; EPA Superfund profile", warn: true, tile: false },
  stimpson: { value: 1170, display: "1,170", unit: "ft south", label: "Stimpson Mfg. NYSDEC site 152007, 900 Sylvan Ave — plating sludge; leaching pools remediated", source: "Full EAF attachment", warn: false, tile: false },

  // ---- Economics / process ----
  jobs: { value: null, display: "None stated", unit: "", label: "Jobs claimed in the filing", source: "Every FOIL'd document searched for \"employ\", \"jobs\", \"associates\": no figure appears", warn: true, tile: true },
  landPrice: { value: 160000000, display: "$160 million", unit: "", label: "Land purchase price, Serota Islip LLC → Islip NY Hold Co, LLC", source: "Recorded deeds (Liber D00013172 p.290; D00013179 p.445)", warn: false, tile: true },
  applicationFee: { value: 40275, display: "$40,275", unit: "", label: "Change-of-zone application fee paid", source: "Amended Planning Application, Receipt No. 468527", warn: false, tile: false },
  noticeRadius: { value: 200, display: "200 ft", unit: "≈41 owners notified", label: "Legal notice radius", source: "Radius map and owner list (FOIL)", warn: true, tile: false },
  caseNumber: { value: "CZ 2026-010", display: "CZ 2026-010", unit: "", label: "Town of Islip change-of-zone case", source: "Amended Planning Application", warn: false, tile: false },
  filingDate: { value: "2026-07-16", display: "July 16, 2026", unit: "", label: "Application hand-delivered to Town Planning", source: "Forchelli Deegan Terrana cover letter, stamped RECEIVED JUL 16 2026", warn: false, tile: false },
  incompleteDate: { value: "2026-08-06", display: "August 6, 2026", unit: "", label: "Town declared application incomplete", source: "Email, Jessica Joyce (Town of Islip) to Brian Kennedy, 8/6/2026 3:51 PM", warn: false, tile: false },
  zoningFrom: { value: "IMUPDD", display: "IMUPDD → IND1", unit: "", label: "Zone change requested: Islip Mixed-Use Planned Development District (plus ICD and Residence AA portions) to Industrial 1", source: "Change-of-Zone application form; Full EAF attachment", warn: false, tile: false },
  pddRecommended: { value: true, display: "New PDD", unit: "", label: "Town Planning recommended a new Planned Development District because height/FAR variances would be of \"significant magnitude\"", source: "Email, Sean Colgan (Town Planning) to Brian Kennedy, 7/24/2026", warn: true, tile: false },
  covenants: { value: true, display: "Rescind", unit: "", label: "Islip Pines covenants & restrictions (2014) must be eliminated or modified", source: "Full EAF attachment; TC No. 5084", warn: false, tile: false },
  townLand: { value: 0.82, display: "0.82", unit: "acres", label: "Town-owned \"triangle\" (Residence AA) to be sold to applicant", source: "Full EAF attachment; site plan", warn: false, tile: false },
  paperStreets: { value: "Barkley Dr, Kings Rd, Church Ct", display: "3 paper streets", unit: "", label: "Paper streets to be abandoned", source: "Full EAF attachment", warn: false, tile: false },
  amazonValuation: { value: 2.9e12, display: "$2.9 trillion", unit: "", label: "Amazon market value (companiesmarketcap.com, 8/11/2026)", source: "Campaign Community Information sheet citing companiesmarketcap.com", warn: false, tile: false },
  // ---- Power, waste, services (Full EAF Part 1 + attachment; Stonefield TIS Table 1) — added 2026-09-20 ----
  facilityTypes: { value: "ARS FC GEN 14 + SSD", display: "Robotics FC + same-day station", unit: "", label: "What the filing calls it: a 1,254,400 sq ft \"ARS FC – GEN 14\" (Amazon Robotics Sortable fulfillment center, 14th-generation design) plus a 425,000 sq ft \"SSD + Injection\" same-day delivery station", source: "Stonefield TIS Table 1 (footprints as used for trip generation)", warn: false, tile: false },
  flexTrips: { value: 4888, display: "4,888", unit: "delivery-car trips / day", label: "Amazon Flex trips a day — gig drivers in their own cars, fanning out from the same-day station into neighborhoods", source: "Stonefield TIS Table A5 (6,518 on a peak day, Table A6)", warn: true, tile: false },
  lipaRows: { value: 3, display: "3", unit: "LIPA transmission corridors", label: "High-voltage rights-of-way crossing the site (east, west, and along the northern boundary); Beacon Drive access needs an easement across one", source: "Full EAF attachment, site description", warn: false, tile: false },
  generator: { value: "Generator / HVAC", display: "On-site generator", unit: "", label: "Stationary air-emission sources during operations, per the filing; air permit questions left blank", source: "Full EAF Part 1 §D.2.f–g", warn: true, tile: false },
  utilityUpgrades: { value: "undetermined", display: "Not determined", unit: "", label: "Whether water, sewer or electric upgrades are needed: \"consultations are being conducted\"", source: "Full EAF attachment", warn: true, tile: false },
  ghg: { value: "pending", display: "Not submitted", unit: "", label: "Greenhouse-gas and air-quality assessment (\"is being prepared\"); the 10,000-ton CO2e question is unanswered", source: "Full EAF Part 1 §D.2.h and note", warn: true, tile: false },
  parks: { value: 7, display: "7", unit: "parks", label: "Parks the filing lists as serving the site: Sans Souci County Park, Islip Grange, Greenbelt Rec Center, Holbrook Country Club, Holbrook Park (PAL), Michael Buckley Park, Pearl Street Park", source: "Full EAF Part 1 §C.4.d", warn: false, tile: false },
  faa: { value: "required", display: "FAA review", unit: "", label: "Determination of No Hazard to Air Navigation required (MacArthur Airport approach)", source: "Full EAF attachment, approvals table", warn: false, tile: false },
  studiesPending: { value: "noise, air/GHG, lighting", display: "Not submitted", unit: "", label: "Operational noise, air-quality/GHG and lighting studies", source: "Full EAF Part 1 — each marked \"is being prepared\"", warn: true, tile: false }
};

// Building size comparisons (sq ft). Approximate figures are labeled.
SPS.scaleComparisons = [
  { name: "Project Sunrise (proposed)", sqft: 4264725, source: "Application form / Full EAF" },
  { name: "Roosevelt Field Mall", sqft: 2250000, source: "approx., public sources" },
  { name: "Smith Haven Mall", sqft: 1340000, source: "approx., public sources" },
  { name: "Amazon JFK8, Staten Island", sqft: 855000, source: "approx., public sources" },
  { name: "Shops at SunVet (next door)", sqft: 168000, source: "Wikipedia, redeveloped open-air center" },
  { name: "Costco Holbrook (next door)", sqft: 148000, source: "approx., typical Costco warehouse" }
];

// Crash rates from the Stonefield TIS crash-rate summary table (crashes per million entering vehicles).
SPS.crashRates = [
  { intersection: "NYS 454 & Broadway Ave", crashes: 34, rate: 0.88, nysdotAvg: 0.25 },
  { intersection: "Broadway Ave & Sunrise Hwy S. Service Rd", crashes: 40, rate: 1.59, nysdotAvg: 0.25 },
  { intersection: "Nicolls Rd & Colin Dr / Greenbelt Pkwy", crashes: 87, rate: 1.12, nysdotAvg: 0.25 },
  { intersection: "Sunrise Hwy N. Service Rd & Beacon Dr", crashes: 46, rate: 0.97, nysdotAvg: 0.12 },
  { intersection: "NYS 454 & Lakeland Ave", crashes: 106, rate: 1.78, nysdotAvg: 0.25 },
  { intersection: "NYS 454 & Express Dr South", crashes: 77, rate: 1.39, nysdotAvg: 0.25 },
  { intersection: "NYS 454 & Express Dr North", crashes: 80, rate: 1.66, nysdotAvg: 0.25 }
];
SPS.crashRatesSource = "Stonefield Traffic Impact Study (6/30/2026), NYSDOT collision data Jan 1 2023 – Jan 1 2026; 544 collisions total";

// Daily trips, operator-supplied 24-hour schedules (TIS Tables A5/A6).
SPS.trips = {
  avg: { cars: 5372, flex: 4888, trucks: 555, total: 10815 },
  peak: { cars: 7046, flex: 6518, trucks: 809, total: 14373 },
  source: "Stonefield TIS Tables A5 (average weekday) and A6 (seasonal peak day)"
};

// Land cover, acres (Full EAF Part 1 land-cover table).
SPS.landCover = {
  before: { forest: 136.77, impervious: 0.50, meadow: 0.03, recharge: 0.63, landscape: 0 },
  after: { forest: 36.90, impervious: 83.80, meadow: 0, recharge: 0.63, landscape: 16.60 },
  source: "Full EAF Part 1, land-cover table (\"Wetlands\" row is an existing 0.63-acre recharge basin)"
};

// Overall intersection Level of Service (A best – F worst). "?" = not reported in the extraction.
SPS.los = [
  { intersection: "NYS 454 & Broadway Ave", delay: { existingAM: 57.2, buildAM: 62.9, existingPM: 58.4, buildPM: 70.6 }, existingAM: "E", existingPM: "E", noBuildAM: "E", noBuildPM: "E", buildAM: "E", buildPM: "E", note: "SB left/through LOS F both peaks; NB left degrades to F with project" },
  { intersection: "Nicolls Rd & Colin Dr / Greenbelt Pkwy", delay: { existingAM: 74.2, buildAM: 70.7, existingPM: 49.9, buildPM: 48.9 }, existingAM: "E", existingPM: "D", noBuildAM: "F", noBuildPM: "E", buildAM: "E", buildPM: "D", note: "Multiple turning movements LOS F today; second NB left-turn lane proposed" },
  { intersection: "NYS 454 & Lakeland Ave", delay: { existingAM: 79.9, buildAM: 85.3, existingPM: 73.7, buildPM: 80.5 }, existingAM: "E", existingPM: "E", noBuildAM: "E", noBuildPM: "E", buildAM: "E", buildPM: "E", note: "SB left remains LOS F after mitigation (1-second signal shift)" },
  { intersection: "Sunrise Hwy N. Service Rd & Beacon Dr", existingAM: "E", existingPM: "E", noBuildAM: "?", noBuildPM: "F", buildAM: "A", buildPM: "A", note: "\"A\" assumes new signal, realigned Beacon Dr, dual SB right turns and a 4th WB through lane are built" },
  { intersection: "NYS 454 & Express Dr North", delay: { existingAM: 66.4, buildAM: 69.9, existingPM: 42.4, buildPM: 43.9 }, existingAM: "E", existingPM: "D", noBuildAM: "E", noBuildPM: "D", buildAM: "E", buildPM: "D", note: "WB right LOS F both peaks today" },
  { intersection: "NYS 454 & Express Dr South", delay: { existingAM: 30.4, buildAM: 31.7, existingPM: 51.4, buildPM: 59.2 }, existingAM: "C", existingPM: "D", noBuildAM: "C", noBuildPM: "D", buildAM: "C", buildPM: "E", note: "Degrades to overall LOS E in PM with project" },
  { intersection: "NYS 454 & Church St (new gateway)", delay: { existingAM: null, buildAM: 16.6, existingPM: null, buildPM: 18.3 }, existingAM: "–", existingPM: "–", noBuildAM: "–", noBuildPM: "–", buildAM: "B", buildPM: "B", note: "Project's own entrance: NB left/through operates at LOS F in the AM peak" }
];
SPS.losSource = "Stonefield TIS, HCM 2000 / Synchro 12; 2025 Existing, 2030 No-Build, 2030 Build";

// Project timeline.
SPS.timeline = [
  { date: "2014-03", label: "Islip Pines rezoning approved", detail: "Town Board votes 4-0 to create the Islip Mixed-Use PDD for Serota's mixed-use plan (350 homes, retail, offices, hotel, great lawn). Covenants recorded June 30, 2014.", future: false },
  { date: "2016-01", label: "Court upholds Islip Pines zoning", detail: "Peconic Baykeeper's Article 78 challenge (water quality, traffic) dismissed. Islip Pines is never built.", future: false },
  { date: "2022-08", label: "Site sold for $160 million", detail: "Serota Islip LLC conveys the assemblage to Islip NY Hold Co, LLC (Scannell Properties, Indianapolis). Deeds recorded Aug 31 and Nov 28, 2022.", future: false },
  { date: "2026-06-30", label: "Traffic study issued", detail: "Stonefield Traffic Impact Study for \"Project Sunrise\" prepared for Scannell Properties; describes an Amazon Robotics Sortable + Sub-Same-Day fulfillment center.", future: false },
  { date: "2026-07-16", label: "Change-of-zone application filed", detail: "Forchelli Deegan Terrana hand-delivers application CZ 2026-010: rezone IMUPDD → Industrial 1, rescind covenants, buy Town land, abandon paper streets.", future: false },
  { date: "2026-07-24", label: "Town: variances of \"significant magnitude\"", detail: "Principal Planner Sean Colgan writes that the project exceeds Industrial 1 height and FAR limits and recommends a new PDD; says the EAF mischaracterizes the action.", future: false },
  { date: "2026-08-04", label: "Amazon at Town Hall", detail: "Danielle Aristy of Amazon joins the applicant's attorney for a 1 PM meeting with Town Planning.", future: false },
  { date: "2026-08-06", label: "Application declared incomplete", detail: "Town tells the applicant to pick up the submission and refile an amended application (+$850 if it becomes a PDD).", future: false },
  { date: "2026-08-10", label: "Community meeting, Holbrook Fire Dept", detail: "Residents, Assemblyman Doug Smith and Legislator Anthony Piccirillo meet at Terry Blvd. Smith says his office had received fewer than 5 calls.", future: false },
  { date: "2026-08-12", label: "Residents FOIL the file; speak at Town Board", detail: "Parkland Civic Association files FOIL M82661. Residents tell the Islip Town Board they will oppose any zone change.", future: false },
  { date: "2026-09-07", label: "FOIL records released (partially)", detail: "Town releases the application, EAF, traffic study, site plan and emails — with redactions.", future: false },
  { date: "2026-09-12", label: "Online petition launched", detail: "change.org petition \"Stop Amazon from building a mega warehouse in Holbrook, NY\".", future: false },
  { date: "2026-11-19", label: "Change of Zone hearing", detail: "Islip Town Hall, 655 Main St, 5:00 PM. The venue where the rezoning is decided. Confirm on the Town agenda.", future: true },
  { date: "2026-12-17", label: "Change of Zone hearing", detail: "Islip Town Hall, 655 Main St, 5:00 PM. Last scheduled 2026 change-of-zone date.", future: true }
];

// Who lives here (2020 Census, via the Wikipedia hamlet pages; fetched 2026-09-20). Used for one plain sentence on Your House.
SPS.hamletFacts = {
  source: "U.S. Census 2020, via Wikipedia",
  Holbrook: { medianAge: 43.4, over65: 18.3, kids: 31.6, medianAge2000: 35 },
  Bohemia: { medianAge: 45.0, over65: 18.5, kids: 29.9 },
  Sayville: { medianAge: 46.9, over65: 21.9, kids: 30.6, medianAge2000: 37 },
  Bayport: { medianAge: 46.6, over65: 20.3, kids: 30.2 },
  Ronkonkoma: { medianAge: 40.9, over65: 15.6, kids: 34.7 }
};
