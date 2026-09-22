// Stop Project Sunrise — roads data. Hourly schedules are the applicant's own (Stonefield TIS Tables A5/A6, operator-supplied,
// summed from 15-minute rows; they reproduce the filing's 555/809 truck trips and 10,815/14,373 total vehicles exactly).
// Intersection coordinates: from OpenStreetMap road geometry (ODbL) where both roads could be matched; "approx" where placed by hand;
// the two Expressway service-road intersections are listed without pins. Route: Nicolls Road (CR 97) south from the LIE to NY-454,
// then west to the proposed gateway at Church Street — the TIS says all site trucks use this path.
window.SPS = window.SPS || {};
SPS.roads = {
  hourly: { avg: {"trucks": [17, 20, 19, 17, 24, 19, 16, 17, 27, 25, 29, 37, 26, 29, 37, 28, 27, 27, 19, 14, 21, 20, 18, 22], "cars": [26, 26, 58, 59, 470, 550, 389, 440, 78, 297, 305, 135, 104, 67, 80, 123, 140, 767, 757, 266, 38, 50, 97, 50], "flex": [160, 160, 160, 78, 78, 182, 182, 288, 288, 322, 322, 314, 314, 292, 292, 254, 254, 204, 204, 204, 84, 84, 84, 84], "total": [203, 206, 237, 154, 572, 751, 587, 745, 393, 644, 656, 486, 444, 388, 409, 405, 421, 998, 980, 484, 143, 154, 199, 156]}, peak: {"trucks": [24, 28, 29, 24, 28, 29, 28, 30, 35, 45, 45, 50, 44, 50, 48, 33, 37, 30, 36, 27, 30, 27, 25, 27], "cars": [24, 30, 95, 60, 490, 681, 1096, 240, 84, 377, 381, 183, 75, 56, 83, 153, 156, 898, 1174, 383, 52, 67, 166, 42], "flex": [214, 214, 214, 104, 104, 242, 242, 384, 384, 430, 430, 418, 418, 388, 388, 340, 340, 272, 272, 272, 112, 112, 112, 112], "total": [262, 272, 338, 188, 622, 952, 1366, 654, 503, 852, 856, 651, 537, 494, 519, 526, 533, 1200, 1482, 682, 194, 206, 303, 181]} },
  route: [[40.81387, -73.05319], [40.81225, -73.05295], [40.81134, -73.0528], [40.80912, -73.05244], [40.80542, -73.05185], [40.80454, -73.05172], [40.80367, -73.0516], [40.80278, -73.05152], [40.80191, -73.05149], [40.80102, -73.05146], [40.79781, -73.05144], [40.79363, -73.0517], [40.7924, -73.05141], [40.7912, -73.05168], [40.78918, -73.05167], [40.78778, -73.05138], [40.78688, -73.05165], [40.786, -73.05162], [40.78513, -73.05152], [40.78426, -73.05136], [40.7834, -73.05113], [40.78255, -73.05084], [40.78177, -73.05021], [40.78095, -73.0498], [40.77992, -73.04923], [40.77876, -73.0489], [40.77783, -73.04809], [40.77691, -73.04763], [40.77596, -73.04726], [40.775, -73.04695], [40.77403, -73.04673], [40.77304, -73.04658], [40.77204, -73.04648], [40.77019, -73.05211], [40.7694, -73.05405], [40.76904, -73.05509], [40.77, -73.05607], [40.769, -73.0568], [40.76991, -73.05698], [40.76906, -73.05708], [40.76988, -73.05721], [40.76995, -73.05849], [40.7703, -73.05951], [40.77069, -73.06056], [40.77137, -73.06137], [40.7716, -73.0617]],
  // Corridor geometry for the "all traffic" view (OSM centerlines, thinned). Shares from TIS Table 3 live in data/corridors.js; nicolls uses `route`.
  corridorGeom: {"sunrise-eb": [[40.74902, -73.13738], [40.74929, -73.13573], [40.74962, -73.13404], [40.75001, -73.13239], [40.75044, -73.13076], [40.75161, -73.12705], [40.75209, -73.12544], [40.75228, -73.12401], [40.75267, -73.12236], [40.75369, -73.1184], [40.75407, -73.11675], [40.7545, -73.11512], [40.75499, -73.11352], [40.75552, -73.11195], [40.7561, -73.1104], [40.75673, -73.10888], [40.75743, -73.10725], [40.75788, -73.10569], [40.75843, -73.10427], [40.76081, -73.09842], [40.76134, -73.09695], [40.76185, -73.09536], [40.76231, -73.09375], [40.76272, -73.09211], [40.76309, -73.09041], [40.76345, -73.08849], [40.76378, -73.08666], [40.76413, -73.08485], [40.76448, -73.08318], [40.76487, -73.08153], [40.7653, -73.0799], [40.76575, -73.07828], [40.76662, -73.07488], [40.76723, -73.07346], [40.76766, -73.07182], [40.76804, -73.07018], [40.76836, -73.0685], [40.76863, -73.06682], [40.76885, -73.06512], [40.76886, -73.06319], [40.76899, -73.06164], [40.76936, -73.05955], [40.76955, -73.05786], [40.76979, -73.0562], [40.77009, -73.05453]], "sunrise-wb": [[40.77043, -73.0529], [40.77083, -73.05127], [40.77128, -73.04968], [40.77178, -73.0481], [40.77232, -73.04656], [40.77356, -73.04284], [40.77434, -73.0413], [40.77489, -73.03974], [40.7754, -73.03814], [40.77569, -73.03652], [40.77633, -73.0349], [40.77655, -73.03325], [40.77693, -73.03159], [40.77729, -73.02988], [40.77762, -73.02811]], "rte454": [[40.78556, -73.11412], [40.78512, -73.1122], [40.78468, -73.11023], [40.78436, -73.1088], [40.78405, -73.10739], [40.78389, -73.10595], [40.78306, -73.10298], [40.78292, -73.10144], [40.7827, -73.09989], [40.78258, -73.09835], [40.78239, -73.09661], [40.78238, -73.09498], [40.78252, -73.09201], [40.78251, -73.09046], [40.78232, -73.08899], [40.78221, -73.08741], [40.78209, -73.08491], [40.78177, -73.08352], [40.78167, -73.08199], [40.78113, -73.08054], [40.78063, -73.07914], [40.77999, -73.0778], [40.7793, -73.07651], [40.77867, -73.07497], [40.77774, -73.07358], [40.77704, -73.07191], [40.77555, -73.06946], [40.77464, -73.06774], [40.77397, -73.06649], [40.77328, -73.06487], [40.77217, -73.06312], [40.77157, -73.06171]], "broadway-sb": [[40.80409, -73.06854], [40.80351, -73.06932], [40.80217, -73.06923], [40.80075, -73.06909], [40.79968, -73.06898], [40.7984, -73.06885], [40.79642, -73.06868], [40.79475, -73.06855], [40.79354, -73.06846], [40.79209, -73.06833], [40.79086, -73.06821], [40.78992, -73.06813], [40.78905, -73.06804], [40.78776, -73.06793], [40.78675, -73.06784], [40.78565, -73.06775], [40.78426, -73.06761], [40.78325, -73.06753], [40.78235, -73.06745], [40.78152, -73.06738], [40.78062, -73.0673], [40.77976, -73.06723], [40.7788, -73.06714], [40.77757, -73.06703], [40.77662, -73.06695], [40.77563, -73.06686], [40.77468, -73.06677]], "broadway-nb": [[40.77353, -73.06669], [40.77258, -73.06661], [40.7714, -73.06648], [40.77049, -73.0664], [40.76961, -73.06635], [40.76826, -73.06624], [40.76731, -73.06619], [40.76566, -73.06633], [40.76466, -73.06643], [40.76365, -73.06654], [40.76205, -73.0667], [40.76037, -73.06688], [40.7582, -73.06712], [40.75738, -73.0672], [40.75653, -73.06718], [40.75498, -73.06716], [40.75382, -73.06713], [40.75191, -73.06709], [40.74966, -73.06705], [40.74852, -73.06702], [40.74767, -73.06701]], "church": [[40.76906, -73.11612], [40.7692, -73.11445], [40.76929, -73.11332], [40.7694, -73.11203], [40.76951, -73.11074], [40.76968, -73.10886], [40.76995, -73.10558], [40.77008, -73.10408], [40.7702, -73.10268], [40.77031, -73.10134], [40.77043, -73.09997], [40.77046, -73.09847], [40.77047, -73.09663], [40.77047, -73.09435], [40.77048, -73.09226], [40.7705, -73.08939], [40.7705, -73.08829], [40.7705, -73.08705], [40.77051, -73.08575], [40.77052, -73.08439], [40.77053, -73.08329], [40.77054, -73.08076], [40.77054, -73.07896], [40.77054, -73.07777], [40.77055, -73.07657], [40.77056, -73.07544], [40.77062, -73.07419], [40.77074, -73.07195], [40.77081, -73.07058], [40.77088, -73.06926], [40.77096, -73.06759], [40.77102, -73.06644], [40.7711, -73.06446], [40.77121, -73.06251]]},
  pins: {
    "NYS 454 & Broadway Ave": [40.77428, -73.06674],
    "NYS 454 & Church St (new gateway)": [40.77163, -73.0617],
    "Nicolls Rd & Colin Dr / Greenbelt Pkwy": [40.77922, -73.04916],
    "Sunrise Hwy N. Service Rd & Beacon Dr": [40.7713, -73.0516],
    "Broadway Ave & Sunrise Hwy S. Service Rd": [40.7686, -73.0662]
  },
  approxPins: ["Sunrise Hwy N. Service Rd & Beacon Dr", "Broadway Ave & Sunrise Hwy S. Service Rd"],
  gradeWords: { A: "free-flowing", B: "free-flowing", C: "moving", D: "slowing", E: "stop-and-go", F: "failing" },
  // What heavy trucks cost a road, from current federal work rather than the much-quoted 1979 ratio.
  // Every figure here was read from the document at the url given.
  wear: {
    // Headline: the federal cost of a mile driven, by vehicle type. Congressional Budget Office, 2020.
    costPerMile: {
      car: 0.8, combo: 8.4, heaviestLo: 2.2, heaviestHi: 20.3, unit: "cents per mile of federal highway cost",
      label: "What a mile costs the public, by vehicle",
      quote: "Passenger vehicles ... were estimated to account for about 60 percent of federal highway costs in 2000, even though their estimated cost per mile of highway use was the lowest at 0.8 cents. For each mile they traveled in 2000, combination trucks (that is, tractors pulling one or more trailers) were estimated to impose a cost of 8.4 cents.",
      source: "Congressional Budget Office, Reauthorizing Federal Highway Programs: Issues and Options (May 2020)",
      url: "https://www.cbo.gov/publication/56373", status: "verified"
    },
    // Modern mechanistic modelling, not ESALs: take the overweight axles out and the asphalt lasts longer.
    serviceLife: {
      lo: 19, hi: 34,
      quote: "Flexible pavement initial service intervals increased by between and 19 percent and 34 percent ... when overweight axles were removed from the traffic mix.",
      note: "\"Overweight\" there means a single axle over 20,500 lb or a tandem over 35,000 lb. The stray \"and\" is in the original.",
      scope: "medium-volume Interstate sections",
      source: "USDOT / FHWA, Comprehensive Truck Size and Weight Limits Study, Pavement Comparative Analysis Technical Report (2015), p. ES-7 and \u00a75.1 \u2014 the modelled subset was the medium-volume traffic sections on the Interstate system",
      url: "https://ops.fhwa.dot.gov/freight/sw/map21tswstudy/technical_rpts/pcanalysis.pdf", status: "verified"
    },
    // Who actually pays for the damage they cause.
    costShare: {
      autos: 1.0, combo75to80: 0.8, combo80to100: 0.5, comboOver100: 0.4,
      quote: "The heaviest combinations, those over 80,000 pounds, pay only half of their cost responsibility.",
      source: "USDOT / FHWA, Addendum to the 1997 Federal Highway Cost Allocation Study (May 2000), Executive Summary and Table 7 — still the most recent federal cost allocation study",
      url: "https://www.fhwa.dot.gov/policy/hcas/addendum.cfm", status: "verified"
    },
    // A state DOT study of exactly this situation: heavy trucks a local road was never designed for.
    localRoads: {
      semiPCE: 1408, garbagePCE: 1000,
      quote: "The heavy vehicles of interest are those which were not anticipated at the time the pavement structure was designed, but which cause additional damage and thus create the need for rehabilitation or reconstruction sooner than expected. These unexpected heavy vehicles could be generated by new industrial facilities...",
      note: "The 1,408 figure is a table the Minnesota report reproduces from an R3 Consulting Group study for the City of Fort Collins. Minnesota's own rule of thumb in the same report is one garbage truck to 1,000 car trips.",
      source: "W. James Wilde, Assessing the Effects of Heavy Vehicles on Local Roadways, MnDOT / Local Road Research Board report MN/RC 2014-32 (2014)",
      url: "https://mdl.mndot.gov/_flysystem/fedora/2023-01/201432.pdf", status: "verified"
    },
    // The finding that matters most for a county road: thin pavements take the damage.
    thinRoads: {
      quote: "The more significant impacts are predicted to occur on lower volume facilities, specifically on low-volume other NHS arterials, which are typically constructed with thinner cross-sections. The estimated impacts of the scenarios are relatively minor for those thicker pavement sections that were built to handle higher truck volumes.",
      localQuote: "local roads are, overall, built to lower design standards than roadways on the higher functionally classified roadway networks",
      // Structural comparison, Ohio sections \u2014 the modelled location closest to Long Island's wet-freeze climate.
      arterialAsphaltIn: 6, interstateAsphaltIn: 12, arterialBaseIn: 8, interstateBaseIn: 12,
      arterialConcreteIn: 8, interstateConcreteIn: 12,
      limitation: "It models generic road tiers, not this road. Which tier Nicolls Road was built to, and how many trucks it carries now, is a question only Suffolk County can answer \u2014 and nobody has asked it. That study should be done before the vote, not after.",

      source: "USDOT / FHWA, Comprehensive Truck Size and Weight Limits Study, Pavement Comparative Analysis Technical Report (2015), p. ES-7, \u00a74.2, and Tables 6 and 7 (Ohio sections)",
      url: "https://ops.fhwa.dot.gov/freight/sw/map21tswstudy/technical_rpts/pcanalysis.pdf", status: "verified"
    },
    // FHWA stating the principle the whole section rests on, without leaning on ESALs.
    nonLinear: {
      quote: "Average axle loads, after all, are not as important as the distribution of axle loads at the higher ends of the axle load range, given the non-linearity of pavement damage as a function of axle load.",
      source: "USDOT / FHWA, Comprehensive Truck Size and Weight Limits Study, Pavement Comparative Analysis Technical Report, Appendix A \u00a71.6",
      url: "https://ops.fhwa.dot.gov/freight/sw/map21tswstudy/technical_rpts/pcanalysis/appendix_a.htm", status: "verified"
    },
    // A published finding that a truck mile costs far more on a local road than on a freeway. Carries FHWA's own
    // reservation, quoted here too, because it rests on the ESAL method FHWA says it cannot use.
    localVsFreeway: {
      freewayPerMile: 0.006, localPerMile: 0.72,
      quote: "a typical additional truck mile resulted in marginal costs that varied significantly across the highway system, ranging from a low of C$0.004 per km ($0.006 / mile) on a southern Ontario freeway to C$0.46 per km ($0.72 / mile) on a local road.",
      caveat: "FHWA adds that Ontario used a marginal-cost method rather than the average-cost method used in the United States, which is why the gap is so wide, and says of the underlying approach: \"We do not suggest reviving the incremental design approach ... and cannot use the ESAL assumption.\"",
      source: "FHWA, Pavement Structure Comparative Analysis Desk Scan (November 2013), p. 6, summarising an Ontario Ministry of Transportation analysis (Hajek, Tighe & Hutchinson, Transportation Research Record 1613)",
      url: "https://ops.fhwa.dot.gov/freight/sw/map21tswstudy/deskscan/pavement_dksn.pdf", status: "verified"
    },
    // The ratio everyone quotes, and why we no longer lead with it.
    ratio: {
      gao: 9600, stateDot: 1408, industry: 285,
      gaoSource: "U.S. General Accounting Office, CED-79-94 (1979), p. 23 — derived from Association of American State Highway Officials data, for interstate pavement",
      gaoUrl: "https://www.gao.gov/assets/ced-79-94.pdf",
      industrySource: "FPInnovations for the American Trucking Associations, Analysis of car and truck pavement impacts (2018) — the trucking industry's own commissioned engineering study, flexible pavement",
      industryUrl: "https://www.trucking.org/sites/default/files/2022-01/Analysis%20of%20car%20and%20truck%20pavement%20impacts-FINAL.pdf",
      criticUrl: "https://ops.fhwa.dot.gov/freight/sw/map21tswstudy/deskscan/pavement_dksn.pdf",
      criticQuote: "FHWA's HCA and TSW studies stopped using unmodified AASHO-Road-Test-based Equivalent Single Axle Loads (ESALs) in 1979, after the Congressional Budget Office (CBO) strongly criticized their continued use.",
      criticSource: "FHWA, Pavement Comparative Analysis Desk Scan (November 2013), p. 1",
      affirmQuote: "Thus doubling axle load may increase pavement deterioration by a factor of eight rather than 16, but still a very significant difference.",
      affirmSource: "FHWA, Comprehensive Truck Size and Weight Study, Volume 3, Chapter V: Pavement (2000), p. V-4",
      affirmUrl: "https://www.fhwa.dot.gov/reports/tswstudy/vol3-chapter5.pdf",
      status: "verified"
    },
    // kept for the older arithmetic that still references it
    carsPerLoadedTruck: 9600, source: "U.S. General Accounting Office, CED-79-94 (1979)", url: "https://www.gao.gov/assets/ced-79-94.pdf", status: "verified",
    loadedShare: { value: 0.5, label: "Share of truck trips running loaded (arrivals full, departures lighter)", status: "estimate" }
  },
  // Peak-hour vs daily, straight from the study. Table 1 is a one-hour slice of the 24-hour schedule in Table A5;
  // Table A1 is the study's own peak-hour selection sheet. Verified by summing A5's 96 fifteen-minute rows:
  // 7:30-8:30 AM = 143 cars + 288 flex + 20 trucks = 451; 5:00-6:00 PM = 767 + 204 + 27 = 998; all 24 h = 555 trucks, 10,815 vehicles.
  peakHour: {
    amWindow: "7:30 to 8:30 AM", amTrips: 451, amTrucks: 20,
    pmWindow: "5:00 to 6:00 PM", pmTrips: 998, pmTrucks: 27,
    siteMaxWindow: "5:30 to 6:30 PM", siteMaxTrips: 1459,
    combinedAnalysed: 19038, combinedSiteMax: 17435,
    truckMaxWindow: "11 AM to noon", truckMaxTrips: 37,
    dailyTrips: 10815, dailyTrucks: 555,
    source: "Stonefield TIS Table 1 (peak-hour trip generation), Table A1 (peak-hour selection) and Table A5 (24-hour operational schedule)",
    status: "verified"
  },
  // The study's own comparison to the never-built Islip Pines approval. It compares trip counts only.
  islipPines: {
    prevAM: 1524, prevPM: 2125, propAM: 451, propPM: 998,
    what: "350 homes, 491,800 sq ft of retail, 302,820 sq ft of office, 818,130 sq ft of industrial, 51,218 sq ft of civic space and a 200-room hotel",
    source: "Stonefield TIS Tables 2 and 5; trip rates from the ITE Trip Generation Manual, 10th Edition",
    status: "verified"
  },
  // What the applicant's engineer will say at the hearing, and what the filing itself shows.
  // Two sentences on what the submitted study covers and what it leaves out. Each carries its own sources.
  studySummary: [
    { text: "A traffic study was submitted, but its truck numbers are one-hour counts, and it sizes the project against Islip Pines — homes, shops, offices and a hotel — so it counts vehicles without weighing them.",
      sources: [
        { source: "Stonefield TIS Table 1 and Table A5", note: "Table 1 gives the peak-hour trip generation; Table A5 is the operator's 24-hour schedule in 15-minute blocks. Summing all 96 rows of A5 gives 555 truck trips and 10,815 vehicles on an average day.", status: "verified" },
        { source: "Stonefield TIS Tables 2 and 5", note: "The study's comparison with the Islip Pines approval: 1,524 morning and 2,125 evening peak-hour trips for Islip Pines against 451 and 998 here. Islip Pines trips were estimated from standard rates for homes, retail, office and a hotel.", status: "verified" }
      ] },
    { text: "On what the trucks do to the road itself there is no study at all: no pavement analysis, no axle-load calculation and no maintenance estimate in its 663 pages.",
      sources: [
        { source: "Stonefield TIS, full-text search for pavement, axle, load, weight and maintenance", note: "Searching all 663 pages returns no pavement section, no axle-load calculation and no maintenance estimate. Truck percentages appear only inside the signal-timing worksheets.", status: "verified" }
      ] }
  ],
  // Our arithmetic, shown so it can be checked: the study's own evening peak hour, weighed instead of counted.
  weighed: {
    prevTrips: 2125, propTrips: 998, propTrucks: 27, loadedShare: 0.5,
    note: "Islip Pines' peak hour counted as passenger cars; Project Sunrise's 27 truck trips counted at each published pavement factor, with half assumed to be running loaded."
  },
  fixes: "The study's road fixes — a realigned Beacon Drive, new signals at Church Street and the Sunrise service road, dual turn lanes, a fourth westbound lane — are each described as \"subject to approval\" by the Town, County and State. No funding commitment, schedule or guarantee appears in the file.",
  asks: [
    "A binding condition that every off-site road improvement is built and paid for by the applicant before a certificate of occupancy.",
    "Suffolk DPW's pavement rating, last resurfacing cost and cost per lane-mile for Nicolls Road between Sunrise Highway and the Expressway, and who pays for the next one.",
    "Truck routing written into the approval — Nicolls Road and Route 454 only — with a complaint line and fines, so trucks never use Broadway, Beacon Drive or the neighborhood streets.",
    "A capacity analysis of the Church Street gateway and the Route 454 turns for 5:30 to 6:30 PM, the hour the applicant's own Table A1 shows its traffic at maximum.",
    "A pavement-impact analysis in axle loads, not trip counts, comparing this project with the Islip Pines approval it is measured against."
  ]
};
