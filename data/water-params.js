/* Water & Aquifer module — every parameter, default, range, basis and source.
   Edit here; sliders AND the Assumptions & Sources table both render from this file.
   basis: verified   = read directly from the cited public document
          literature = standard published value / range, not site-specific
          assumption = our estimate; change it with the slider
          applicant  = taken from the applicant's own Full EAF / site plan (July 15, 2026) */
window.SPS = window.SPS || {};
SPS.waterParams = {
  groups: [
    {
      id: "budget", title: "1. Recharge & runoff budget",
      params: [
        { key: "P", label: "Precipitation", default: 47, min: 40, max: 52, step: 1, unit: "in/yr", basis: "verified",
          source: "USGS SIR 2024-5044 (Long Island, 1900–2019 mean 47 in); EPA Goldisc ROD 1998 (46 in, Holbrook)",
          url: "https://pubs.usgs.gov/publication/sir20245044", note: "" },
        { key: "fForest", label: "Recharge fraction, forest", default: 0.49, min: 0.40, max: 0.57, step: 0.01, unit: "of precip", basis: "verified",
          source: "USGS: Suffolk natural recharge ≈ 23.2 in/yr of 47 in", url: "https://pubs.usgs.gov/publication/sir20245044", note: "Remainder is evapotranspiration." },
        { key: "fTurf", label: "Recharge fraction, landscaping", default: 0.53, min: 0.45, max: 0.60, step: 0.01, unit: "of precip", basis: "literature",
          source: "USGS soil-water-balance modeling: turf recharges slightly more than forest (less ET)", url: "", note: "" },
        { key: "cRunoff", label: "Runoff coefficient, impervious", default: 0.90, min: 0.80, max: 0.95, step: 0.01, unit: "—", basis: "literature",
          source: "NYSDEC Stormwater Design Manual: Rv = 0.05 + 0.009·I → 0.95 at 100% impervious", url: "https://extapps.dec.ny.gov/docs/water_pdf/swdm2015chptr04.pdf", note: "0.90 allows for depression storage and evaporation." },
        { key: "fDrywell", label: "Share of runoff sent to drywells", default: 1.0, min: 0.8, max: 1.0, step: 0.05, unit: "—", basis: "applicant",
          source: "Full EAF: drywells sized for an 8-inch storm; no surface discharge; 'subsurface infiltration'", url: "docs/Full-EAF-2026-07-15.pdf", note: "" }
      ],
      fixed: [
        { key: "siteAc", label: "Site area", value: 138.05, unit: "acres", basis: "applicant", source: "Full EAF" },
        { key: "forestPre", label: "Forest, existing", value: 136.77, unit: "acres", basis: "applicant", source: "Full EAF land-cover table" },
        { key: "forestPost", label: "Forest, after", value: 36.90, unit: "acres", basis: "applicant", source: "Full EAF land-cover table" },
        { key: "impervPre", label: "Impervious, existing", value: 0.50, unit: "acres", basis: "applicant", source: "Full EAF land-cover table" },
        { key: "impervPost", label: "Impervious, after", value: 83.80, unit: "acres", basis: "applicant", source: "Full EAF land-cover table" },
        { key: "roofAc", label: "Roof area (of impervious)", value: 40, unit: "acres", basis: "verified", source: "VHB Conceptual Site Plan C1.00 footprints: 1,254,400 + 425,000 + 45,000 + 9,800 + 165,984 sf ≈ 43.5 ac; 40 used net of overlaps" },
        { key: "paveAc", label: "Pavement / truck court (of impervious)", value: 44, unit: "acres", basis: "verified", source: "83.8 impervious − ~40 roof" },
        { key: "landscapeAc", label: "Landscaping, after", value: 16.60, unit: "acres", basis: "applicant", source: "Full EAF land-cover table" },
        { key: "demandGpd", label: "Project water demand", value: 72000, unit: "gal/day", basis: "applicant", source: "Full EAF ('based on similar projects')" },
        { key: "designStormIn", label: "Drywell design storm", value: 8, unit: "inches", basis: "applicant", source: "Full EAF attachment" }
      ]
    },
    {
      id: "loads", title: "2. Pollutant loading from runoff",
      params: [
        { key: "truckAc", label: "Truck court / trailer yard share of pavement", default: 22, min: 0, max: 44, step: 1, unit: "acres", basis: "assumption",
          source: "Site plan: 426 trailer stalls + 115 docks along south & west; remainder car parking/roads", url: "docs/Conceptual-Site-Plan-2026-07-15.pdf", note: "Car parking + roads = 44 − this." },
        { key: "fertN", label: "Fertilizer nitrogen on landscaping", default: 10, min: 0, max: 30, step: 1, unit: "lb N/ac/yr", basis: "assumption",
          source: "Suffolk County turf guidance; commercial landscape rates 0–3 lb/1,000 sf", url: "", note: "25% assumed to leach." },
        { key: "sealcoat", label: "Coal-tar sealcoat on pavement (PAH ×160)", default: 0, min: 0, max: 1, step: 1, unit: "off/on", basis: "assumption",
          source: "USGS Mahler et al.: sealcoated lot runoff PAH ≈ 328 µg/L vs 2 unsealed", url: "https://www.usgs.gov/centers/oklahoma-texas-water-science-center/science/coal-tar-based-pavement-sealcoat", note: "NY does not ban coal-tar sealcoat statewide." },
        { key: "denom", label: "Dilution volume for concentration", default: 0, min: 0, max: 2, step: 1, unit: "0=pavement recharge, 1=all impervious, 2=whole site", basis: "assumption",
          source: "Toggle: the applicant will argue whole-site dilution; the truck courts drain to their own drywells", url: "", note: "" }
      ],
      /* Event-mean concentrations, mg/L. NSQD v4.02 medians (Pitt, Maestre & Clary 2018). No truck-terminal category
         exists in NSQD: freeway/industrial group used as proxy for truck courts, commercial for parking. Roof = assumption.
         std = NYS Class GA groundwater standard or guidance value (TOGS 1.1.1) where one exists; stdBasis flags which were read directly. */
      emc: [
        { key: "TSS", label: "Total suspended solids", truck: 74, park: 55, roof: 20, std: null, stdLabel: "no GA standard (fills drywells; cf. Goldisc dry-well sediment excavation)", stdBasis: "verified" },
        { key: "Cl", label: "Chloride (road salt — see salt panel)", truck: 0, park: 0, roof: 0, std: 250, stdLabel: "250 mg/L GA standard", stdBasis: "verified", salt: true },
        { key: "Na", label: "Sodium (road salt — see salt panel)", truck: 0, park: 0, roof: 0, std: 20, stdLabel: "20 mg/L GA standard", stdBasis: "verified", salt: true },
        { key: "Zn", label: "Zinc", truck: 0.130, park: 0.130, roof: 0.100, std: 2.0, stdLabel: "2,000 µg/L guidance value", stdBasis: "unverified" },
        { key: "Cu", label: "Copper", truck: 0.024, park: 0.012, roof: 0.008, std: 0.2, stdLabel: "200 µg/L GA standard", stdBasis: "verified" },
        { key: "Pb", label: "Lead", truck: 0.031, park: 0.007, roof: 0.005, std: 0.025, stdLabel: "25 µg/L GA standard", stdBasis: "unverified" },
        { key: "Ni", label: "Nickel", truck: 0.006, park: 0.001, roof: 0.001, std: 0.1, stdLabel: "100 µg/L GA standard (cited in Goldisc ROD)", stdBasis: "verified" },
        { key: "OG", label: "Oil & grease", truck: 5.0, park: 2.0, roof: 0.5, std: 15, stdLabel: "15 mg/L effluent limit (TOGS 1.1.1 Table 5)", stdBasis: "verified" },
        { key: "TN", label: "Total nitrogen (TKN + NO₃)", truck: 2.7, park: 1.8, roof: 1.5, std: 10, stdLabel: "10 mg/L total-N effluent limit, Nassau/Suffolk", stdBasis: "verified" },
        { key: "TP", label: "Total phosphorus", truck: 0.209, park: 0.209, roof: 0.10, std: null, stdLabel: "no GA standard", stdBasis: "verified" },
        { key: "PAH", label: "Total PAHs", truck: 0.002, park: 0.001, roof: 0.0002, std: null, stdLabel: "no single standard: benzo(a)pyrene must be non-detect; individual PAHs 0.002–0.05 µg/L (TOGS 1.1.1)", stdBasis: "unverified" }
      ],
      emcSource: "National Stormwater Quality Database v4.02 (Pitt, Maestre & Clary 2018), medians by land use",
      emcUrl: "https://www.bmpdatabase.org/national-stormwater-quality-database"
    },
    {
      id: "salt", title: "2b. Road salt (deicing)",
      params: [
        { key: "saltRate", label: "Salt applied to pavement", default: 2.0, min: 0.5, max: 6.4, step: 0.1, unit: "tons NaCl/acre/yr", basis: "assumption",
          source: "MPCA: parking lots 0.1–1 ton/ac per event, 'typically 6.4 tons/ac/yr' (Twin Cities); LI winters milder → 2 used", url: "https://www.pca.state.mn.us/sites/default/files/wq-s1-94.pdf",
          note: "USGS WRI 85-4088 (Ku & Simmons) measured up to 1,100 mg/L chloride in Long Island parking-lot runoff. Chloride does not degrade or sorb." }
      ],
      fixed: [
        { key: "clFrac", label: "Chloride mass fraction of NaCl", value: 0.607, unit: "—", basis: "verified", source: "stoichiometry" },
        { key: "naFrac", label: "Sodium mass fraction of NaCl", value: 0.393, unit: "—", basis: "verified", source: "stoichiometry" }
      ]
    },
    {
      id: "vertical", title: "3. Travel time to the water table",
      params: [
        { key: "dtw", label: "Depth to water table", default: 19, min: 15, max: 45, step: 1, unit: "ft", basis: "applicant",
          source: "Full EAF says 19± ft; EPA Goldisc ROD (adjacent) 18–32 ft; USGS WRI 01-4025 Green Belt Pkwy wells ≈ 40 ft", url: "https://pubs.usgs.gov/wri/2001/4025/wri014025.pdf",
          note: "The 19–40 ft spread is itself a data gap: no boring logs were submitted." },
        { key: "poolDepth", label: "Leaching pool / drywell depth", default: 10, min: 6, max: 15, step: 1, unit: "ft", basis: "assumption", source: "Typical Suffolk 8–10 ft precast leaching pools; no drywell design submitted", url: "", note: "" },
        { key: "Ks", label: "Saturated hydraulic conductivity, sand", default: 8, min: 2, max: 20, step: 0.5, unit: "ft/day", basis: "literature",
          source: "NRCS: Riverhead sandy loam 2–6 in/hr; Plymouth loamy coarse sand 6–20 in/hr (4 in/hr = 8 ft/d)", url: "https://websoilsurvey.nrcs.usda.gov/", note: "" },
        { key: "dTheta", label: "Fillable porosity (Δθ)", default: 0.25, min: 0.15, max: 0.35, step: 0.01, unit: "—", basis: "literature", source: "Rawls, Brakensiek & Saxton 1983 (sand)", url: "", note: "" },
        { key: "psi", label: "Wetting-front suction (ψ)", default: 0.2, min: 0.05, max: 0.5, step: 0.05, unit: "ft", basis: "literature", source: "Rawls et al. 1983: sand ≈ 5 cm", url: "", note: "" },
        { key: "head", label: "Ponded head in drywell", default: 4, min: 0, max: 8, step: 0.5, unit: "ft", basis: "assumption", source: "half-full 8-ft pool", url: "", note: "" },
        { key: "thetaRes", label: "Residual oil saturation (θ_res)", default: 0.04, min: 0.02, max: 0.08, step: 0.005, unit: "vol/vol", basis: "literature", source: "ITRC LNAPL guidance: Sr 10–20% of n ≈ 0.3 in coarse sand", url: "https://lnapl-3.itrcweb.org/", note: "" },
        { key: "spillGal", label: "Diesel spill volume", default: 150, min: 25, max: 300, step: 5, unit: "gal", basis: "literature", source: "Class 8 tractors carry dual 100–150 gal saddle tanks", url: "", note: "" },
        { key: "spillFrac", label: "Fraction of spill reaching one drywell", default: 1.0, min: 0.1, max: 1.0, step: 0.05, unit: "—", basis: "assumption", source: "curbed truck court: each catch basin drains a small area, so a spill at a dock goes to one pool", url: "", note: "1.0 = worst case." },
        { key: "fireQ", label: "Fire-suppression flow", default: 1500, min: 500, max: 3000, step: 100, unit: "gal/min", basis: "literature", source: "NFPA 13 ESFR storage sprinklers + hose streams", url: "", note: "AFFF/PFAS and lithium-ion battery runoff are not treatable in drywells." },
        { key: "fireDur", label: "Fire-suppression duration", default: 60, min: 30, max: 120, step: 10, unit: "min", basis: "literature", source: "NFPA 13 water-supply duration 60–120 min", url: "", note: "" }
      ],
      fixed: [
        { key: "poolRadius", label: "Leaching pool radius", value: 4, unit: "ft", basis: "assumption", source: "8-ft diameter precast ring" },
        { key: "oilDensity", label: "Diesel specific gravity", value: 0.85, unit: "—", basis: "literature", source: "" },
        { key: "oilVisc", label: "Diesel viscosity ratio to water", value: 4, unit: "—", basis: "literature", source: "≈ 3–5 at 15 °C" },
        { key: "naturalRechargeIn", label: "Natural recharge rate (forest)", value: 23, unit: "in/yr", basis: "verified", source: "USGS SIR 2024-5044" },
        { key: "fieldTheta", label: "Field moisture content, unsaturated sand", value: 0.10, unit: "vol/vol", basis: "literature", source: "" }
      ]
    },
    {
      id: "plume", title: "4. Plume transport in the Upper Glacial aquifer",
      params: [
        { key: "K", label: "Hydraulic conductivity (K)", default: 270, min: 100, max: 300, step: 5, unit: "ft/day", basis: "verified",
          source: "USGS Smolensky, Buxton & Shernoff 1989 (Upper Glacial avg 270 ft/d); SIR 2024-5044 outwash 130–270", url: "https://pubs.usgs.gov/publication/ha709", note: "" },
        { key: "i", label: "Hydraulic gradient (i)", default: 0.002, min: 0.001, max: 0.003, step: 0.0001, unit: "ft/ft", basis: "verified",
          source: "EPA Goldisc ROD: velocity 1.3–2.9 ft/d, flow S–SE; head drop site (~40–60 ft) to Sans Souci Lakes (~30 ft) over ~1–1.5 mi", url: "https://extapps.dec.ny.gov/data/DecDocs/152022/ROD.HW.152022.1998-09-01.goldisc_recordings_ou2.pdf", note: "" },
        { key: "ne", label: "Effective porosity (nₑ)", default: 0.25, min: 0.20, max: 0.35, step: 0.01, unit: "—", basis: "literature", source: "USGS: specific yield 0.10–0.30; mobile fraction ≈ 0.23", url: "", note: "" },
        { key: "alphaL", label: "Longitudinal dispersivity (αL)", default: 30, min: 5, max: 100, step: 5, unit: "ft", basis: "literature", source: "Gelhar, Welty & Rehfeldt 1992: ~1–10% of travel distance; αT = αL/10", url: "", note: "" },
        { key: "C0", label: "Source concentration (C₀)", default: 253, min: 1, max: 1000, step: 1, unit: "mg/L", basis: "assumption", source: "Pre-filled with chloride in pavement recharge from panel 2b (2 tons/ac)", url: "", note: "Use ~160 for sodium; enter a spill concentration for benzene." },
        { key: "R", label: "Retardation factor (R)", default: 1, min: 1, max: 100, step: 1, unit: "—", basis: "literature", source: "Chloride, sodium, nitrate = 1; benzene 1.4; zinc ~7–130; copper ~30–300 (R = 1 + ρb·Kd/n)", url: "", note: "" },
        { key: "halfLife", label: "Half-life (0 = no decay)", default: 0, min: 0, max: 20, step: 0.5, unit: "years", basis: "literature", source: "Chloride/sodium: none. Benzene 1–2 yr aerobic.", url: "", note: "" },
        { key: "tYears", label: "Elapsed time", default: 10, min: 0.5, max: 50, step: 0.5, unit: "years", basis: "assumption", source: "", url: "", note: "" },
        { key: "flowDir", label: "Groundwater flow direction", default: 180, min: 120, max: 210, step: 5, unit: "° from north", basis: "verified", source: "EPA Goldisc ROD: 'south to southeast' (180–135°); USGS water-table maps: toward Great South Bay", url: "", note: "Try 165° for south-southeast." }
      ],
      fixed: [
        { key: "sourceWidth", label: "Source width (site E–W)", value: 2400, unit: "ft", basis: "verified", source: "site frontage / survey" },
        { key: "sourceLength", label: "Source length (site N–S)", value: 2500, unit: "ft", basis: "verified", source: "138 ac ≈ 2,400 × 2,500 ft" }
      ]
    },
    {
      id: "capture", title: "5. Supply-well capture zone",
      params: [
        { key: "Q", label: "Well pumping rate (Q)", default: 1000, min: 200, max: 3000, step: 50, unit: "gal/min", basis: "verified",
          source: "SCWA Church Street wellfield 60,000 gpd winter – 3 MGD summer (2,083 gpm); Green Belt Pkwy GB-1A tested at 700 gpm, field 1.4–6 MGD", url: "https://pubs.usgs.gov/wri/2001/4025/wri014025.pdf", note: "" },
        { key: "b", label: "Upper Glacial saturated thickness (b)", default: 140, min: 100, max: 160, step: 5, unit: "ft", basis: "verified", source: "USGS WRI 01-4025: Upper Glacial/Magothy contact 186 ft bls, water table ~40 ft; EPA ROD ~135 ft", url: "", note: "T = K × b" }
      ],
      fixed: [
        { key: "buffUp", label: "Art. 7 Water Supply Sensitive Area, upgradient", value: 1500, unit: "ft", basis: "verified", source: "Suffolk County Sanitary Code §760-703.Y / §760-706" },
        { key: "buffDown", label: "Art. 7 Water Supply Sensitive Area, downgradient", value: 500, unit: "ft", basis: "verified", source: "Suffolk County Sanitary Code §760-703.Y / §760-706" }
      ]
    }
  ],

  /* Map features (feet; origin = center of the site's south edge at Sunrise Hwy North Service Rd; +x east, +y north).
     Positions of the wellfields are approximate — from the EPA ROD (Church St ~1,200 ft S of Goldisc, which is at 717 Broadway Ave
     west of Vets Hwy) and the site plan label "Greenbelt Parkway West" at the NE corner. FOIL SCWA for coordinates. */
  map: {
    widthFt: 15840, heightFt: 13200, northFt: 4000,
    site: [[-1200, 0], [1200, 0], [1200, 2500], [-1200, 2500]],
    sunriseHwyY: -150,
    vetsHwyX: -1350,
    beaconDrX: 1300,
    lakes: [[-900, -4750], [1500, -4850], [1700, -6200], [1200, -7600], [100, -8450], [-1100, -7900], [-1400, -6300]],
    wells: [
      { id: "church", label: "SCWA Church Street wellfield (Upper Glacial; CS-2 shut 1993 for nickel)", x: -3000, y: -1500, q: 2083, approx: true },
      { id: "greenbelt", label: "SCWA Green Belt Parkway wellfield (Magothy; USGS: pumping pulls shallow water down)", x: 1500, y: 2800, q: 1000, approx: true }
    ],
    goldisc: { x: -2600, y: 600, label: "Goldisc Superfund site (nickel, solvents, drywells)" },
    stimpson: { x: -900, y: -1170, label: "Stimpson Mfg NYSDEC site (plating sludge)" },
    bayLabel: "Great South Bay ≈ 4 mi south ↓"
  },

  notProvided: [
    "Site boring logs or a measured depth to water table (EAF says '19± ft' with no data)",
    "A hydraulic-conductivity or percolation test",
    "Drywell / leaching-pool count, depth, spacing, or pretreatment design",
    "The 8-inch storm drainage calculation",
    "A deicing / snow-management plan for 44 acres of pavement",
    "A Spill Prevention, Control and Countermeasure (SPCC) plan",
    "Fire-water containment design; fire tank and generator fuel volumes",
    "Suffolk County Sanitary Code Article 6 or Article 7 review",
    "Any hydrogeologic study, nitrogen-loading analysis, or Special Groundwater Protection Area discussion",
    "Identification of which SCWA well will serve the site ('not yet identified')"
  ],

  foil: [
    { who: "SCWA", what: "Coordinates, screen intervals, permitted and 2020–2025 actual pumpage for Church Street (CS-1/2/3) and Green Belt Parkway (GB-1–4, GB-1A); any wells or tanks at Sans Souci County Park and near 5801 Sunrise Hwy; Distribution Area #1 source-well list; chloride, sodium and nickel trends at CS-2 and GB wells; wellhead-protection / capture-zone delineations" },
    { who: "NYSDEC", what: "Goldisc (site 152022) quarterly groundwater monitoring 2016–2026 and well map; Stimpson (152007) status; water-withdrawal permits for SCWA wells within 1 mile of 11741; SPDES Multi-Sector General Permit applicability for the site (truck terminal / warehousing); lead-agency correspondence on stormwater hotspot classification" },
    { who: "SCDHS", what: "Groundwater Management Zone map and Water Supply Sensitive Area map (§760-703.Y) for the parcel; any Article 6/7/12 pre-application review; leaching-pool separation-to-groundwater standard; SCDHS comments on CZ 2026-010" },
    { who: "Town of Islip / applicant", what: "Drywell count, depth and the boring logs behind '19± ft'; the 8-inch drainage calculation; deicing plan; SPCC plan; fire tank volume and containment; generator fuel volume; roof material (galvanized = high zinc); whether pavement will be sealcoated; irrigation-reuse volumes" },
    { who: "USGS / NWIS", what: "Latest water-table contour map for the Holbrook quadrangle; Brown's River / West Branch Brown Creek at Sayville (gage 01306200) baseflow statistics" }
  ],

  unverified: [
    "Reported SCWA water tanks at Sans Souci County Park and behind the Shops at SunVet — locations and any co-located wells are unconfirmed",
    "Sans Souci lake surface elevation and Brown's River baseflow (only ~34 ft land elevation from USGS 3DEP)",
    "Truck-terminal-specific runoff concentrations (NSQD has none; freeway/industrial medians used as proxy)",
    "NYS Class GA values for zinc, lead and nitrate are quoted from memory of TOGS 1.1.1 Table 1; copper, chromium, sodium, sulfate and the Table 5 effluent limits were read directly",
    "The proposed New York parking-lot salt cap (4.7 lb/1,000 sf per application) is pending legislation, not law",
    "The Town of Islip '8-inch' drainage rule is the applicant's statement; code search found only a 2-inch subdivision rule",
    "Whether the parcel lies inside an SCDHS Deep Recharge Area / Water Supply Sensitive Area (determines Article 7 §760-706 applicability)",
    "Exact wellfield coordinates on the map (approximate; see FOIL list)"
  ],

  disclaimer: "These are screening-level calculations built from published USGS, EPA, NYSDEC and Suffolk County data and the applicant's own Full EAF and site plan. They are not a hydrogeologic study and should not be cited as one. The applicant has submitted no hydrogeologic study, no Article 6/7 review, no drywell design, no deicing plan and no spill-prevention plan for a 138-acre truck terminal over the Nassau–Suffolk Sole Source Aquifer — that is the point. Every number here can be changed with the sliders; every default is sourced or labeled an assumption. When the applicant produces site-specific data, we will update the defaults.",

  regulatory: [
    { text: "NYSDEC Stormwater Management Design Manual, Ch. 4 Table 4.3: 'Fleet storage areas (bus, truck, etc.)' and 'Outdoor loading/unloading facilities' are stormwater hotspots; runoff from hotspots 'cannot be allowed to infiltrate untreated into groundwater.'", url: "https://extapps.dec.ny.gov/docs/water_pdf/swdm2015chptr04.pdf" },
    { text: "Suffolk County Sanitary Code Article 7 §760-703.P lists 'Roadway Deicing Salt' and 'Petroleum Distillates' as restricted toxic or hazardous materials; §760-705.B.2.c removes the stormwater exemption where such materials may enter the system; §760-706 imposes extra requirements in Deep Recharge Areas and within 1,500 ft upgradient / 500 ft downgradient of Upper Glacial supply wells.", url: "https://www.suffolkcountyny.gov/Departments/Health-Services/Environmental-Quality/Water-Resources" },
    { text: "EPA Record of Decision, Goldisc Recordings OU-2 (Sept 1998): SCWA Church Street well CS-2 taken out of service late 1993 for nickel >100 µg/L traced to Goldisc drywell disposal ~1,200 ft upgradient; groundwater flow south–southeast at 1.3–2.9 ft/day; depth to water 18–32 ft.", url: "https://extapps.dec.ny.gov/data/DecDocs/152022/ROD.HW.152022.1998-09-01.goldisc_recordings_ou2.pdf" },
    { text: "USGS WRI 01-4025 (Brown, Colabufo & Coates 2002), Green Belt Parkway well field, Holbrook: 'continuous pumping from the Magothy aquifer at this site can induce downward flow of shallow, oxygenated water despite locally confined conditions.'", url: "https://pubs.usgs.gov/wri/2001/4025/wri014025.pdf" }
  ]
};
