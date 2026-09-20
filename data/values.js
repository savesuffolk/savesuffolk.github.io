// Stop Project Sunrise — property-value page data. status: "verified" = source fetched and number read; "unverified" =
// abstract/snippet only, confirm before quoting; "estimate" = our arithmetic. Research trail: research/property-values.md.
window.SPS = window.SPS || {};

SPS.values = {
  // ---- Studies. tier: peer (peer-reviewed), working (academic working paper), agency (government), industry (appraisal profession) ----
  studies: [
    { id: "amazon-dc", short: "Robert, Rios-Avila, Zahirovic-Herbert & Gibler, SSRN 2024", who: "Homes within half a mile of a new Amazon distribution center", what: "sold for about 10% less (6% in the cautious version of the study)", tier: "working", headline: "≈10% lower", sub: "single-family prices within ½ mile of a new Amazon distribution center",
      detail: "Staggered difference-in-differences across Amazon facility openings. The authors report the effect \"consistently depresses local single-family property values\": almost 10% within 0.5 mile in the full model, 6% in a simpler one.",
      cite: "Robert, Rios-Avila, Zahirovic-Herbert & Gibler, \"Prime Locations, Hidden Costs: Measuring the Impact of Amazon Distribution Centers on Housing Prices,\" SSRN working paper, Oct 2024",
      url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4990815", status: "unverified",
      note: "SSRN blocked our download; figures are from the abstract. Read the PDF before quoting on a flyer.",
      band: { from: 0, to: 2640, pct: 10, low: 6, label: "Within ½ mile · new Amazon distribution center (2024 working paper)" } },
    { id: "industrial", short: "de Vor & de Groot, Regional Studies 2011", who: "Homes within about 800 feet of an industrial site", what: "sold for 15% less; the bigger the site, the wider the ring of homes affected", tier: "peer", headline: "14.9% lower", sub: "within 820 ft of an industrial site; effect fades out near 0.7 mile",
      detail: "Hedonic analysis of house sales near industrial sites. Houses within 250 m sell for 14.9% less than houses beyond 2,250 m, all else equal. \"The larger the site, the larger the range of houses which are affected.\" Project Sunrise is 138 acres.",
      cite: "de Vor & de Groot, \"The Impact of Industrial Sites on Residential Property Values,\" Regional Studies 45(5), 2011",
      url: "https://papers.tinbergen.nl/09035.pdf", status: "verified",
      band: { from: 0, to: 820, pct: 14.9, label: "Within 820 ft · industrial site (peer-reviewed)" } },
    { id: "trucks", short: "Li & Saphores, UC Irvine, Transportation Research Record 2012", who: "Homes near a truck corridor", what: "lost $2,000\u2013$2,750 (on a $420,000 house) for every 1% more truck traffic; cars barely mattered", tier: "peer", headline: "$2,000–$2,750", sub: "off a $420,000 home for every 1% rise in truck traffic (100–400 m band)",
      detail: "4,715 single-family sales along the Los Angeles / Long Beach port freeway corridor. A 1% increase in truck traffic cut value by $2,000–$2,750; a 1% increase in total traffic cut it by $24. Buyers punish trucks, not cars. Scaled to a $692,000 Holbrook home: roughly $3,300–$4,500 per percentage point.",
      cite: "Li & Saphores (UC Irvine), Transportation Research Record 2288, 2012",
      url: "https://doi.org/10.3141/2288-06", status: "verified" },
    { id: "noise", short: "Nelson, J. Transport Economics & Policy 1982; NAE 2010", who: "Homes next to a noisy highway", what: "sold for 8\u201310% less; roughly 0.4% off for every extra decibel", tier: "peer", headline: "0.4% per decibel", sub: "average noise-depreciation index across 17 estimates; 8–10% for a main highway",
      detail: "Survey of North American hedonic studies: highway noise reduces house prices 8–10%; the noise depreciation index runs 0.16–0.63% per dB with a mean of 0.40%. The National Academy of Engineering repeats the figure in Technology for a Quieter America (2010).",
      cite: "Nelson, Journal of Transport Economics and Policy 16(2), 1982; NAE 2010, ch. 7",
      url: "https://jtep.org/journal/highway-noise-and-property-values-a-survey-of-recent-evidence/", status: "verified" },
    { id: "freeway", short: "Carey, Arizona DOT / FHWA Report 516, 2001", who: "Homes within 200 feet of a freeway, tracked for 16 years", what: "sold for 6.8% less per square foot; from 200 feet to half a mile, 4.6% less", tier: "agency", headline: "6.8% / 4.6%", sub: "lower price per sq ft within 200 ft, and from 200 ft to ½ mile, of a freeway over 16 years",
      detail: "Arizona DOT / FHWA study of the Superstition Freeway corridor, Phoenix: homes 0–200 ft from the freeway averaged 6.8% lower price per square foot than the control area; homes 200 ft to half a mile averaged 4.6% lower.",
      cite: "Carey, Impact of Highways on Property Values, ADOT Report 516 (2001); Carey & Semmens, TRR 1839 (2003)",
      url: "https://rosap.ntl.bts.gov/view/dot/37313/dot_37313_DS1.pdf", status: "verified",
      band: { from: 0, to: 200, pct: 6.8, label: "Within 200 ft · freeway (16-year study)" }, band2: { from: 200, to: 2640, pct: 4.6, label: "200 ft to ½ mile · freeway (16-year study)" } },
    { id: "spatial", short: "McElveen, Brown & Gibbons, Real Estate Finance 2020", who: "8,010 home sales within a mile of an interstate", what: "the loss lands on the closest 500 feet, in every model tested", tier: "peer", headline: "0–500 ft", sub: "the ring that bears the loss, significant at 99% in every model",
      detail: "8,010 qualified sales 2012–2016 within a mile of I-295, Jacksonville. The 0–500 ft variable was negative and significant in all models. Literature review: \"highway proximity is a negative externality on home prices, and this phenomenon holds across time and locale.\"",
      cite: "McElveen (MAI), Brown & Gibbons, Real Estate Finance 37(1), 2020",
      url: "https://urbaneconomics.com/wp-content/uploads/2020/07/REF_Summer20_McElveen-Brown-Gibbons.pdf", status: "verified" },
    { id: "bronx", short: "Shearston et al., IJERPH 2020", who: "A neighborhood after a delivery warehouse opened", what: "overnight truck traffic rose 32%; the trucks come at night", tier: "peer", headline: "+31.7%", sub: "overnight truck traffic after a delivery warehouse opened in the South Bronx",
      detail: "Measured 9 PM–midnight truck counts rose 31.7% (95% CI 23.4–40.6%) at one monitoring site and 27.7% at another after a last-mile warehouse opened in 2018 — the hours that drive noise-based value loss.",
      cite: "Shearston et al., Int. J. Environ. Res. Public Health, 2020",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7246477/", status: "verified" },
    { id: "fhwa", short: "FHWA, The Audible Landscape", who: "Federal Highway Administration", what: "\"strong indications\" highway noise lowers home values where homes sit next to it", tier: "agency", headline: "\"Strong indications\"", sub: "that highway noise reduces property values where homes are next to it",
      detail: "\"There are strong indications that [highway noise] does [reduce property values] when the property use is incompatible with the highway, as in the case of many residential areas.\"",
      cite: "Federal Highway Administration, The Audible Landscape, ch. 7",
      url: "https://www.fhwa.dot.gov/Environment/noise/noise_compatible_planning/federal_approach/audible_landscape/al07.cfm", status: "verified" },
    { id: "urban", short: "Urban Institute, The Polluted Life Near the Highway, 2022", who: "Homes within 1,000 feet of a busy roadway", what: "lower property values, and where lung, heart and pre-term-birth effects concentrate", tier: "agency", headline: "1,000 ft", sub: "where roadway health effects concentrate; property values fall too",
      detail: "\"Roadways also tend to reduce the property values of nearby residences.\" Lung disease, stroke and pre-term birth effects are most common within 300 m (about 1,000 ft); within 100 m, 5% higher acute heart-attack risk.",
      cite: "Urban Institute, The Polluted Life Near the Highway (Nov 2022)",
      url: "https://www.urban.org/sites/default/files/2022-11/The%20Polluted%20Life%20Near%20the%20Highway.pdf", status: "verified" }
  ],

  // ---- The appraisal profession's own term ----
  appraisal: {
    term: "External obsolescence",
    definition: "\"A type of depreciation; a diminution in value caused by negative external influences and generally incurable on the part of the owner, landlord, or tenant.\"",
    detail: "The Appraisal Institute recognizes three kinds — locational, environmental (\"properties affected by a noxious nearby use\") and economic — and measures it by paired sales or capitalized income loss. Your mortgage appraiser and the Town assessor both know the term.",
    cite: "The Dictionary of Real Estate Appraisal, 6th ed. (2015); Longhofer, The Appraisal Journal, Spring 2021",
    url: "https://www.appraisalinstitute.org/getattachment/4dc20c66-65db-44cd-9acb-2c36e8c6e8f2/2021-spring-feat2-external-obsolescence.pdf", status: "verified"
  },

  // ---- Local numbers ----
  local: {
    zhvi: { value: 692419, display: "$692,419", label: "Typical Holbrook (11741) home value", source: "Zillow Home Value Index, Aug 31 2026 (+6.1% year over year)", url: "https://www.zillow.com/home-values/62220/holbrook-ny-11741/", status: "verified" },
    islipMedian: { value: 579341, display: "$579,341", label: "Town of Islip median home value", source: "NYS ORPS roll year 2025, 92,911 parcels", url: "https://longislandpropertytax.com/town/islip", status: "verified" },
    units: { value: 9714, display: "9,714", label: "Housing units in Holbrook", source: "2020 Census (CDP); 6.88 sq mi ≈ 1,410 units per sq mi", url: "https://en.wikipedia.org/wiki/Holbrook,_New_York", status: "verified" },
    rar: { value: 6.68, display: "6.68%", label: "Islip residential assessment ratio (2025)", source: "Suffolk County RAR tables; confirm on ORPTS Municipal Profiles", url: "https://retiredassessor.com/residential-assessment-ratios/suffolk-county-residential-assessment-ratios/", status: "verified" },
    grievance: { value: "2027-05", display: "3rd Tuesday of May", label: "Islip Grievance Day", source: "Town of Islip Assessor (May 19 in 2026), 40 Nassau Ave, Islip", url: "https://islipny.gov/departments/assessor", status: "verified" }
  },

  // ---- Exposure calculator defaults (all estimates until a parcel count replaces them) ----
  exposure: {
    value: 692419,
    homesHalf: 550, homesMile: 1650,
    pctHalf: 10, pctMile: 4.6,
    note: "Home counts assume Holbrook's average density (≈1,410 units/sq mi) over roughly half of each ring, because the site itself, Costco and the Sunrise Highway strip fill the rest. Replace with a Suffolk GIS parcel count before printing a number.",
    status: "estimate"
  },

  // ---- What the applicant will cite ----
  counterShort: [
    ["\"A study says Amazon raises home values 5.6%.\"", "That study looked at whole metro areas, not the street next to the building. Long Island already has nine Amazon sites. The homes next door are the ones that pay."],
    ["\"Warehouses create jobs and income.\"", "The industry's own commissioned report — and it says nothing about your home's value."],
    ["\"Homes near data centers sold for more.\"", "Data centers have no trucks. Even those authors say the study doesn't prove cause."]
  ],
  counter: [
    { claim: "\"Amazon raises home values 5.6%\"", source: "Cunningham, Journal of Policy Analysis and Management, 2025", url: "https://reason.com/2024/12/16/amazon-warehouses-benefit-local-economies-study-finds/", status: "verified",
      rebuttal: "That study measures whole metro areas, not the blocks next to a facility, and treats the 5.6% as a cost to buyers and renters. Long Island already has nine Amazon sites, so the \"metro entry\" effect here is zero. The neighborhood studies above and the metro study can both be true: the region gains, the abutters pay." },
    { claim: "\"Warehouses support 1.35 million New Jersey jobs\"", source: "Rutgers CAIT for NAIOP-NJ (developers' trade group), Nov 2025", url: "https://re-nj.com/outsized-impact-new-jersey-warehouses-support-1-35-million-jobs-113-billion-in-personal-income-study-finds/", status: "verified",
      rebuttal: "Commissioned by the industrial developers' association and contains no property-value analysis at all." },
    { claim: "\"Homes near data centers sold for more\"", source: "George Mason University Center for Regional Analysis, Nov 2025", url: "https://schar.gmu.edu/news/2025-11/study-home-prices-are-higher-when-house-near-data-center", status: "verified",
      rebuttal: "Data centers, not warehouses: no trucks. The authors themselves credit infrastructure and job access and say the study \"doesn't isolate data center proximity as a causal factor.\"" },
    { claim: "\"Truck traffic was statistically insignificant\"", source: "Kawamura & Mahajan, TRR 1924, 2005 (Chicago arterials)", url: "https://journals.sagepub.com/doi/10.1177/0361198105192400109", status: "unverified",
      rebuttal: "Used assessed values instead of sales along ordinary city arterials. The 2012 UC Irvine study used 4,715 actual sales next to a port truck corridor and found the opposite." }
  ],

  // ---- Local precedent ----
  precedent: {
    title: "Islip already knows what a warehouse does to the houses next door",
    text: "In 2020–22 the Town approved a 150,000 sq ft Amazon delivery station at 717 Broadway Avenue, about 250 feet from homes, with roughly 20 tractor-trailers and 200 vans a day. Neighbors organized; the Zoning Board ended up granting a 24.4-foot sound-attenuating wall. Project Sunrise is 28 times that floor area, with 115 docks and 555 to 809 truck trips a day.",
    cite: "Patch, Dec 14 2020; Greater Long Island, June 18 2021; Change.org petition, Dec 2020 (363 signatures)",
    url: "https://patch.com/new-york/sachem/amazon-center-proposal-draws-local-opposition-holbrook", status: "verified"
  },

  // ---- Tax mechanics ----
  tax: [
    { step: "Values fall, assessments follow", text: "New York requires assessments to be a uniform share of market value (RPTL §305). Islip assesses at about 6.7% of full value, so a $70,000 loss in market value is a $4,700 drop in assessed value — and grounds for a grievance." },
    { step: "Every neighbor files", text: "Form RP-524 to the Board of Assessment Review on Grievance Day in May, then Small Claims Assessment Review ($30 filing fee) if denied. A sale or appraisal showing the loss is the evidence." },
    { step: "The levy does not shrink", text: "School and town budgets are fixed amounts spread across the tax base. When hundreds of homes near the site win reductions, the same dollars shift onto everyone else in the Sachem and Connetquot districts. Residents a mile away pay for the loss too." },
    { step: "No precedent yet — Holbrook would be the test case", text: "We found no reported New York decision granting a reduction specifically for a new warehouse neighbor. Do not claim one exists. The mechanism is routine; the fact pattern would be new." }
  ]
};
