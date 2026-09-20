// Stop Project Sunrise — issue cards. Each: filing fact → why it matters → the question to ask at a
// hearing (from the campaign's Master Question Bank where available) → sources.
window.SPS = window.SPS || {};

SPS.issues = [
  {
    id: "traffic", short: "Traffic", photo: "amazon-truck", photoCaption: "A 53-foot Amazon trailer on the highway — the filing counts 555 to 809 of these a day", title: "Traffic & Safety", color: '#c25a3f', icon: "🚛",
    fact: "555 truck trips on an average weekday, 809 on a seasonal peak day; 10,815 total vehicle trips a day; 998 new trips in the PM peak hour. 544 collisions in three years at the study intersections, and every intersection in the crash-rate table exceeds the NYSDOT average.",
    why: "Veterans Highway at Broadway, at Lakeland Avenue and Nicolls Road at Colin Drive already operate at Level of Service E. Certain movements stay at LOS F after the proposed mitigation, which is limited to one-second signal-timing shifts. Trip numbers were supplied by the operator, not derived from published rates, and rest on comparison to the never-built Islip Pines project.",
    question: "How does the Town evaluate a project when all 11 crash-rate intersections already exceed the NYSDOT average, and will the Town independently verify the operator-supplied truck schedules?",
    sources: ["Stonefield Traffic Impact Study, June 30, 2026 — Tables 1, 3, 4, A5, A6; crash-rate summary", "Full EAF Part 1 (truck trips)"]
  },
  {
    id: "water", short: "Water", photo: "sans-souci", photoCaption: "Sans Souci Lakes, Sayville — groundwater from under the site surfaces here", title: "Water & the Aquifer", color: '#3b7ea1', icon: "💧",
    fact: "Water table at 19 feet in 99.9% well-drained sand over the Nassau-Suffolk Sole Source Aquifer. 83.8 acres of new roof and pavement — including 426 trailer spaces and 115 loading docks — drained to drywells for direct infiltration. 72,000 gal/day water demand and 61,200 gal/day sewage \"based on similar projects\"; no water or sewer lines exist on site.",
    why: "NYSDEC's Stormwater Design Manual classifies fleet-storage and loading areas as hotspots whose runoff \"cannot be allowed to infiltrate untreated into groundwater.\" The adjacent Goldisc site contaminated a public supply well through drywells. No hydrogeologic study, no Suffolk Sanitary Code Article 6/7 analysis, no drywell design, no deicing plan and no spill plan were submitted. SCWA wellfields sit on two sides of the site.",
    question: "Can subsurface infiltration safely handle 83+ acres of impervious surface over the Sole Source Aquifer, and has Parkland sewer capacity for 61,200 gallons per day actually been confirmed in writing?",
    sources: ["Full EAF Part 1 and attachment (water, sewer, stormwater, depth to water, soils, hazardous-waste sites)", "NYSDEC Stormwater Management Design Manual, Ch. 4, Table 4.3", "EPA Record of Decision, Goldisc Recordings OU-2 (1998)"],
    link: "#water"
  },
  {
    id: "forest", short: "Forest", photo: "pine-barrens", photoCaption: "Pitch pine–oak woodland: the same forest type standing on the site today", title: "Forest & Wildlife", color: '#2f7d5a', icon: "🌲",
    fact: "Forest drops from 136.77 acres to 36.90 — 99.87 acres removed. 101.6 acres disturbed. Impervious surface rises from 0.50 to 83.80 acres. The EAF itself lists Pine Warbler, Eastern Wood Pewee, White-tailed Deer and other species on the site.",
    why: "This is the largest block of vacant woodland in the Sunrise Highway corridor and a recharge sponge for the aquifer. The EAF answers \"No\" to every wetland question while the site plan states wetland and natural-resource areas \"are still being researched.\" The Town's own application form checks \"Yes\" for within 500 feet of a stream, drainage channel or wetland.",
    question: "What alternatives to removing roughly 100 acres of forest were evaluated, and what stream, drainage channel or wetland lies within 500 feet of the property?",
    sources: ["Full EAF Part 1, land-cover table and Section E", "VHB Conceptual Site Plan, General Note 3", "Change-of-Zone application form"]
  },
  {
    id: "noise", short: "Noise", photo: "amazon-fc", photoCaption: "A typical Amazon fulfillment center. Project Sunrise is five of these, stacked three high, running 24/7", title: "Noise, Light & 24/7 Operations", color: '#7a5c9e', icon: "🔊", link: "noise.html", linkText: "How loud at your house? ›",
    fact: "Operations 24 hours a day, 7 days a week, holidays included. Tree removal proposed with a sound wall that \"may be required.\" The operational noise study, lighting plan and air/greenhouse-gas assessment were each marked \"being prepared\" and not submitted.",
    why: "Homes abut the northern boundary; the Brightview Sayville senior residence is 1,200 feet away. Backup alarms, loading docks, mechanical equipment, headlights and security lighting run all night. The Board is being asked to rezone before anyone has measured what neighbors will hear or see.",
    question: "Why is a sound wall proposed before the noise study is complete, and what will nighttime truck, loading and backup-alarm noise be at the nearest homes?",
    sources: ["Full EAF Part 1 (hours, noise, lighting, air)", "VHB Conceptual Site Plan, General Note 6"]
  },
  {
    id: "air", short: "Air", photo: "lie", photoCaption: "Diesel traffic on the Long Island Expressway — one of the corridors the study routes trips through", title: "Air Quality & Diesel Exhaust", color: '#6b7f8a', icon: "🌫️",
    fact: "Mobile emission source: \"tractor trailers.\" Stationary: \"generator / HVAC systems.\" Every air-permit question on the EAF (CO, NOx, PM-10/PM-2.5, VOC, SO2) is blank; the 10,000-ton greenhouse-gas question is unanswered.",
    why: "Diesel particulate (PM2.5) is linked to asthma, heart disease and premature death. Hundreds of trucks a day idling at 115 loading docks, a few hundred feet from homes, a senior residence and Sans Souci County Park, with no analysis on the record.",
    question: "When will the air-quality and GHG assessment be submitted, and will it be independently reviewed before any zoning action?",
    sources: ["Full EAF Part 1, Section D.2 (air) and footnotes"]
  },
  {
    id: "zoning", short: "Zoning", photo: "site-overlay", photoCaption: "The proposed footprint over today's aerial — twice the floor area the IND1 code allows", title: "Zoning & Precedent", color: '#d9822b', icon: "📐",
    fact: "Requested: rezone the Islip Mixed-Use PDD (created for Islip Pines in 2014) to Industrial 1 — then exceed IND1 limits. FAR 0.713 vs 0.35 maximum; 1,500 parking stalls vs 6,859 required; both marked \"Complies: N\" on the applicant's own chart. Town Planning called these \"variances of significant magnitude\" and recommended a brand-new PDD \"to avoid setting a precedent.\"",
    why: "The recorded Islip Pines covenants must be rescinded, a Town-owned parcel sold, and three paper streets abandoned. A district written so one applicant can double the floor-area limit is the precedent. If the code must be rewritten for the project to fit, the project does not fit.",
    question: "Why should the Town create a new PDD for a project that does not fit ordinary IND1 rules, and what specific public amenities would be exchanged for doubling the FAR?",
    sources: ["VHB Conceptual Site Plan, zoning summary chart", "Email, Sean Colgan (Town Planning) to Brian Kennedy, July 24, 2026", "Full EAF attachment (approvals list)"]
  },
  {
    id: "tax", short: "Tax breaks", photo: "dennison-bldg", photoCaption: "H. Lee Dennison Building, Hauppauge — county government, where incentives are also decided", title: "Tax Breaks & Jobs", color: '#b58a2a', icon: "💸", link: "values.html", linkText: "What it does to home values ›",
    fact: "The EAF lists the Islip IDA for \"Potential Financial Assistance.\" No jobs figure, no wage figure, no tax-revenue projection and no fiscal analysis appear anywhere in the application. Land purchased for a recorded $160 million. Amazon's market value ≈ $2.9 trillion.",
    why: "A PILOT shifts revenue away from the Sachem and Connetquot school districts and Town services while taxpayers absorb road, drainage and emergency-service costs. There is nothing on the record that could justify a subsidy.",
    question: "What measurable public benefit justifies tax incentives, are incentives necessary at all, and what protections exist for taxpayers?",
    sources: ["Full EAF attachment, Government Approvals table", "Recorded deeds (Liber D00013172, D00013179)", "Every FOIL'd document searched: no employment figure"]
  },
  {
    id: "process", short: "Process", photo: "islip-town-hall", photoCaption: "Islip Town Hall, where the Change of Zone hearing will be held", title: "Process & Transparency", color: '#4f6b7a', icon: "📋",
    fact: "Application declared incomplete Aug 6, 2026. The EAF states no ordinance amendment is required, which the Town says is wrong, and omits the Zoning Board as an involved agency. Legal notice went to a 200-foot radius — about 41 owners. Amazon's name appears nowhere on the zoning forms; \"Danielle Aristy from Amazon\" attended the Aug 4 Town meeting.",
    why: "Local officials were briefed days before the press release; residents learned from the news. FOIL records were released partially and with redactions. A 4.4-million-square-foot, 24/7 facility affecting tens of thousands of residents was noticed to two blocks.",
    question: "What was discussed at the August 4 meeting attended by the applicant and an Amazon representative, and what is the Town's standard for deciding whether this intensity of development is appropriate for this location — not merely whether it can technically be made approvable?",
    sources: ["Town of Islip email correspondence, July 24 – Aug 6, 2026 (FOIL)", "Email \"Fw: Meeting Tomorrow\", Aug 3, 2026", "Radius map and owner list (FOIL M82661); FOIL determination Sept 7, 2026"]
  }
];
