// Stop Project Sunrise — email templates, phone scripts, hearing testimony drafts, Newsday letter.
// Placeholders: {{name}}, {{street}}, {{official}}, {{town}} (default "Holbrook").
// All figures are from the applicant's own filing (Full EAF 7/15/2026; Stonefield TIS 6/30/2026;
// VHB site plan; Town emails). Keep them consistent with data/facts.js.
window.SPS = window.SPS || {};

var SPS_SUBJECT = "PROJECT SUNRISE – Proposed Amazon Mega Warehouse, Holbrook (CZ 2026-010)";

SPS.templates = {
  subject: SPS_SUBJECT,

  emails: {
    townBoard: {
      subject: SPS_SUBJECT,
      body:
"Dear {{official}},\n\n" +
"My name is {{name}} and I live at {{street}} in {{town}}. I am writing to ask you to vote NO on change-of-zone application CZ 2026-010 — the proposed Amazon fulfillment complex at the northeast corner of Sunrise Highway and Veterans Memorial Highway — and NO on any new Planned Development District created to accommodate it.\n\n" +
"{{impact}}" +
"The applicant's own filing shows this project does not fit this location:\n" +
"• 4,264,725 sq ft of floor area (4,430,709 with the garage) on 138.05 acres — a floor-area ratio of 0.713, double the 0.35 maximum in the Industrial 1 district. The applicant's own zoning chart marks this \"Complies: N.\"\n" +
"• 1,500 parking stalls provided where the Town code requires 6,859 — also marked \"Complies: N.\"\n" +
"• 555 truck trips on an average weekday and 809 on a seasonal peak day, 24 hours a day, 7 days a week, with 426 trailer spaces and 115 loading docks facing Sunrise Highway and Veterans Highway.\n" +
"• 10,815 vehicle trips per day on average; 998 new trips in the PM peak hour alone.\n" +
"• 99.87 acres of forest removed; 83.8 acres of new pavement and roof over the Nassau-Suffolk Sole Source Aquifer, with a water table the applicant puts at 19 feet below grade — and all runoff sent to drywells.\n" +
"• No jobs figure, no tax-revenue figure and no fiscal analysis appear anywhere in the application.\n\n" +
"Your own Planning staff wrote on July 24, 2026 that the requested height and FAR departures are \"variances of significant magnitude\" and that the application mischaracterized the action under SEQRA. On August 6 the Town declared the application incomplete.\n\n" +
"I respectfully ask the Town Board to:\n" +
"1. Deny the change of zone and decline to create a new PDD for this site.\n" +
"2. Refuse to rescind the Islip Pines covenants and restrictions.\n" +
"3. Refuse to sell the Town-owned \"triangle\" parcel or abandon the paper streets for this project.\n" +
"4. Require a SEQRA Positive Declaration and a full Draft Environmental Impact Statement, including an independent hydrogeologic study, before any further action.\n\n" +
"This is not about being anti-Amazon. It is about whether a development of this scale belongs at this location. Please vote no and protect Holbrook.\n\n" +
"Sincerely,\n{{name}}\n{{street}}, {{town}}, NY"
    },

    ida: {
      subject: SPS_SUBJECT,
      body:
"Dear {{official}},\n\n" +
"My name is {{name}} and I live at {{street}} in {{town}}. I am writing to oppose any PILOT agreement, property-tax abatement, sales-tax exemption or other financial assistance for the proposed Amazon fulfillment complex in Holbrook (Town of Islip change-of-zone application CZ 2026-010).\n\n" +
"The applicant's Full Environmental Assessment Form lists the Islip IDA for \"Potential Financial Assistance.\" Yet the application contains no jobs figure, no wage figure, no tax-revenue projection and no fiscal impact analysis of any kind. There is nothing on the record that could justify a public subsidy.\n\n" +
"The end user is Amazon, a company valued at roughly $2.9 trillion. The land was purchased for a recorded $160 million. A company of that size does not need Islip taxpayers — or the Sachem and Connetquot school districts — to forgo revenue so it can build a 4.26-million-square-foot, 24-hour truck terminal generating 555 to 809 truck trips a day.\n\n" +
"I ask the IDA to:\n" +
"1. Deny any application for financial assistance for this project.\n" +
"2. Hold a fully noticed public hearing, in the evening, in Holbrook, before any vote.\n" +
"3. Release any cost-benefit analysis, draft PILOT terms and correspondence with the applicant before that hearing.\n\n" +
"Sincerely,\n{{name}}\n{{street}}, {{town}}, NY"
    },

    planning: {
      subject: SPS_SUBJECT + " — SEQRA Positive Declaration requested",
      body:
"Dear {{official}},\n\n" +
"My name is {{name}} and I live at {{street}} in {{town}}. I am writing regarding the SEQRA review of change-of-zone application CZ 2026-010 (\"Project Sunrise\").\n\n" +
"I ask the Planning Division and Planning Board to issue a Positive Declaration and require a full Draft Environmental Impact Statement. This is a Type I action: 138.05 acres, 101.6 acres disturbed, 4,264,725 sq ft of floor area, a change of zone, and a site over the Nassau-Suffolk Sole Source Aquifer.\n\n" +
"The Full EAF submitted on July 15, 2026 is incomplete on the issues that matter most:\n" +
"• It reports the water table at 19 feet below grade and 99.9% well-drained sand, yet proposes to route runoff from 83.8 acres of pavement and roof — including 426 trailer spaces and 115 loading docks — into drywells for direct infiltration. The NYSDEC Stormwater Management Design Manual (Chapter 4, Table 4.3) classifies fleet storage and outdoor loading areas as stormwater hotspots whose runoff \"cannot be allowed to infiltrate untreated into groundwater.\"\n" +
"• No hydrogeologic study, no Suffolk County Sanitary Code Article 6 or Article 7 analysis, no drywell design, no deicing plan and no spill-prevention plan were submitted.\n" +
"• Water demand (72,000 gal/day) and sewage (61,200 gal/day) are \"based on similar projects\" that are never named; no water or sewer lines exist on the site, and the EAF concedes consultations with SCWA and County DPW have not occurred.\n" +
"• The operational noise study, air-quality/greenhouse-gas assessment and lighting plan are each marked \"being prepared\" — none was submitted.\n" +
"• The EAF answers \"No\" to every wetland question while the site plan states that wetland and natural-resource areas \"are still being researched.\"\n" +
"• The adjacent Goldisc Recording site (NYSDEC 152022) contaminated a public supply well through drywells; that history demands an independent groundwater analysis here.\n\n" +
"Your staff wrote on July 24, 2026 that the EAF \"needs to be modified to accurately characterize the proposed action\" and that the height and FAR departures are of \"significant magnitude.\" Please ensure the amended application is met with a Positive Declaration, a full scoping process and independent studies paid for by the applicant.\n\n" +
"Sincerely,\n{{name}}\n{{street}}, {{town}}, NY"
    },

    county: {
      subject: SPS_SUBJECT,
      body:
"Dear {{official}},\n\n" +
"My name is {{name}} and I live at {{street}} in {{town}}. I am writing about the proposed Amazon fulfillment complex at Sunrise Highway and Veterans Memorial Highway in Holbrook (Town of Islip change-of-zone CZ 2026-010), which has regional impacts well beyond the property line.\n\n" +
"The applicant's own filing describes 4,264,725 sq ft of floor area, 555 to 809 truck trips per day, 10,815 total vehicle trips per day, 99.87 acres of forest removed and 83.8 acres of new impervious surface over the Sole Source Aquifer. Every studied intersection already has a crash rate above the NYSDOT average.\n\n" +
"I ask you to use the County's authority to:\n" +
"1. Ensure the Suffolk County Planning Commission gives the §239-m referral a rigorous review and recommends disapproval of a zone change that doubles the Industrial 1 floor-area limit.\n" +
"2. Direct the Department of Public Works and the Sewer Agency to independently verify that Sewer District No. 14 (Parkland) can accept 61,200 gallons per day. The EAF states no sewer lines exist on the site and that consultations with DPW have not yet occurred.\n" +
"3. Direct the Department of Health Services to review the plan to infiltrate untreated truck-court runoff through drywells above a 19-foot water table, next to the Goldisc remediation site.\n" +
"4. Oppose any Suffolk County IDA or other public incentive for this project.\n\n" +
"Sincerely,\n{{name}}\n{{street}}, {{town}}, NY"
    },

    piccirillo: {
      subject: SPS_SUBJECT + " — thank you, and next steps",
      body:
"Dear Legislator Piccirillo,\n\n" +
"My name is {{name}} and I live at {{street}} in {{town}}. Thank you for attending the August 10 community meeting and for standing against corporate tax giveaways. The residents of Holbrook have your back.\n\n" +
"I am asking you to keep the pressure on:\n" +
"1. Ask the Department of Public Works and the Sewer Agency to conduct a strict, written review of whether Sewer District No. 14 (Parkland) can accept the 61,200 gallons per day the applicant claims — the EAF says no sewer lines exist on the site.\n" +
"2. Ask the Department of Health Services to review the plan to infiltrate runoff from 83.8 acres of pavement and roof — including 426 trailer spaces and 115 loading docks — through drywells above a 19-foot water table, next to the Goldisc site that shut down a public supply well in 1993.\n" +
"3. Introduce a Legislature resolution opposing any Islip IDA PILOT or abatement for this project.\n" +
"4. Co-lead a public forum with Assemblyman Smith before the November 19 Change of Zone hearing.\n\n" +
"Thank you for representing us.\n\n" +
"Sincerely,\n{{name}}\n{{street}}, {{town}}, NY"
    },

    state: {
      subject: SPS_SUBJECT,
      body:
"Dear {{official}},\n\n" +
"My name is {{name}} and I am your constituent at {{street}} in {{town}}. I am writing about Amazon's proposed 4.26-million-square-foot \"Project Sunrise\" fulfillment complex at Sunrise Highway and Veterans Memorial Highway in Holbrook (Town of Islip application CZ 2026-010).\n\n" +
"Two state agencies hold real leverage over this project, and I am asking you to engage them formally:\n" +
"1. NYSDOT Region 10 must issue highway work permits for access on NY-27 and NY-454. The applicant's traffic study documents 544 collisions in three years at the study intersections, every one above the NYSDOT average crash rate, and admits several movements will remain at Level of Service F. Please send a formal inquiry asking NYSDOT to require a full corridor safety review and to withhold permits until it is complete.\n" +
"2. NYSDEC Region 1 issues the SPDES stormwater permit. The plan infiltrates untreated runoff from 83.8 acres of pavement and roof, including a 426-space trailer court, through drywells above a 19-foot water table in the Sole Source Aquifer — a practice the NYSDEC Design Manual says \"cannot be allowed\" for fleet-storage hotspots. Please ask NYSDEC to scrutinize the aquifer impacts and require a hydrogeologic study.\n\n" +
"I also ask you to issue a public statement opposing any Islip IDA tax abatement for this project. The filing contains no jobs figure, no wage figure and no fiscal analysis.\n\n" +
"Please let me know what action your office will take.\n\n" +
"Sincerely,\n{{name}}\n{{street}}, {{town}}, NY"
    },

    dec: {
      subject: SPS_SUBJECT + " — Sole Source Aquifer / SPDES concerns",
      body:
"To the Regional Permit Administrator, NYSDEC Region 1:\n\n" +
"My name is {{name}} and I live at {{street}} in {{town}}, Suffolk County. I am writing regarding the proposed \"Project Sunrise\" e-commerce warehouse (Town of Islip change-of-zone CZ 2026-010) at the northeast corner of Sunrise Highway and Veterans Memorial Highway, Holbrook, which will require SPDES General Permit GP-0-25-001 coverage and lies over the Nassau-Suffolk Sole Source Aquifer.\n\n" +
"According to the applicant's Full EAF (July 15, 2026):\n" +
"• 83.8 acres of new impervious surface (roof and pavement) will replace 99.87 acres of forest; the water table is stated at 19 feet below grade in 99.9% well-drained outwash sand.\n" +
"• All runoff, including from 426 trailer spaces and 115 loading docks serving 555–809 truck trips per day, will be routed to catch basins and drywells for subsurface infiltration. No pretreatment, no drywell design and no deicing or spill-prevention plan were submitted.\n" +
"• NYSDEC's Stormwater Management Design Manual, Chapter 4, Table 4.3, classifies fleet storage areas and outdoor loading facilities as hotspots whose runoff \"cannot be allowed to infiltrate untreated into groundwater.\"\n" +
"• The adjacent property to the west is NYSDEC site 152022 (Goldisc Recording), which contaminated a public supply well via drywells and remains under quarterly groundwater monitoring; NYSDEC site 152007 (Stimpson) is 1,170 feet south.\n" +
"• The EAF denies the presence of wetlands while the site plan states natural-resource areas \"are still being researched.\"\n\n" +
"I ask NYSDEC Region 1 to (1) identify itself as an involved agency and press for a SEQRA Positive Declaration; (2) require a site-specific hydrogeologic study, including depth-to-water borings and groundwater flow direction relative to the SCWA Church Street and Green Belt Parkway wellfields; (3) require hotspot-compliant treatment before any infiltration; and (4) require an SPCC/spill plan and a deicing management plan as conditions of any SPDES coverage.\n\n" +
"Sincerely,\n{{name}}\n{{street}}, {{town}}, NY"
    },

    dot: {
      subject: SPS_SUBJECT + " — NY-27 / NY-454 highway work permits",
      body:
"To the Regional Director, NYSDOT Region 10:\n\n" +
"My name is {{name}} and I live at {{street}} in {{town}}. I am writing about the highway work permits that the proposed \"Project Sunrise\" e-commerce warehouse (Town of Islip change-of-zone CZ 2026-010) will require for access on NY-454 (Veterans Memorial Highway) and the Sunrise Highway (NY-27) service roads in Holbrook.\n\n" +
"The applicant's Traffic Impact Study (Stonefield, June 30, 2026) reports:\n" +
"• 555 truck trips on an average weekday and 809 on a seasonal peak day; 10,815 total vehicle trips per day; 451 new trips in the AM peak hour and 998 in the PM peak hour.\n" +
"• 544 collisions at the study intersections between January 1, 2023 and January 1, 2026, with every intersection in the crash-rate table above the NYSDOT comparison rate (e.g., NY-454 & Lakeland Ave 1.78 vs 0.25; NY-454 & Express Dr N 1.66 vs 0.25).\n" +
"• Several intersections already operate at overall LOS E, and certain movements remain at LOS F after the proposed mitigation, which is limited to one-second signal-timing shifts at two locations.\n" +
"• Analysis performed with the superseded HCM 2000 methodology, using turning-movement counts from October 2022 alongside 2025 and 2026 counts, and trip generation taken from \"operational traffic schedules provided by the e-commerce warehouse operator\" rather than published ITE rates.\n" +
"• A conclusion of \"no significant impact\" that rests on comparison to the never-built Islip Pines project approved in 2014.\n\n" +
"I ask NYSDOT Region 10 to require an independent corridor safety and capacity review, current counts, HCM 6th/7th Edition analysis, verification of the operator-supplied trip generation, and a truck-routing plan with enforceable restrictions on the Beacon Drive egress before issuing any permit.\n\n" +
"Sincerely,\n{{name}}\n{{street}}, {{town}}, NY"
    },

    federal: {
      subject: SPS_SUBJECT + " — Sole Source Aquifer",
      body:
"Dear {{official}},\n\n" +
"My name is {{name}} and I live at {{street}} in {{town}}, Suffolk County. I am writing about a proposed 4.26-million-square-foot Amazon fulfillment complex in Holbrook (Town of Islip change-of-zone CZ 2026-010) that would place 83.8 acres of pavement and roof, a 426-space trailer court and 555–809 daily truck trips over the Nassau-Suffolk Sole Source Aquifer, designated under Safe Drinking Water Act §1424(e). All runoff would be infiltrated through drywells above a water table the applicant puts at 19 feet.\n\n" +
"The site adjoins the Goldisc Recordings Superfund site, where drywell disposal contaminated a public supply well. No hydrogeologic study has been submitted.\n\n" +
"I ask you to request that EPA Region 2 review the project's consistency with Sole Source Aquifer protection and its potential effect on the Goldisc monitoring program, and to oppose any federal or local tax incentive for it.\n\n" +
"Sincerely,\n{{name}}\n{{street}}, {{town}}, NY"
    }
  },

  scripts: {
    smith: {
      title: "Call Assemblyman Doug Smith",
      forWhom: "Assemblyman Doug Smith (D5, Holbrook)",
      phone: "(631) 585-0230",
      body:
"Hi, my name is {{name}}, and I'm a constituent living in Holbrook at {{street}}. I'm calling regarding Amazon's 4.2M sq ft Project Sunrise warehouse. Assemblyman Smith mentioned at the Parkland Civic meeting that his office had fewer than 5 calls. I am calling to urge the Assemblyman to actively intervene with NYSDOT Region 10 to withhold highway access permits on Route 27 and Route 454, and to petition the NYSDEC to protect our sole-source aquifer. We need state-level leadership to protect Holbrook from gridlock.",
      askStaff: "Can you log my opposition to this project and confirm if Assemblyman Smith will send a formal inquiry to NYSDOT?",
      followUp: "Log your call on the committee call sheet; follow up with an email confirmation to smithd@nyassembly.gov."
    },
    piccirillo: {
      title: "Call Legislator Anthony Piccirillo",
      forWhom: "Suffolk County Legislator Anthony Piccirillo (D8)",
      phone: "(631) 854-9611",
      body:
"Hi, my name is {{name}}, a voter in Suffolk County living in Holbrook. I want to thank Legislator Piccirillo for attending the civic meeting and standing up against corporate handouts. I am calling to urge him to keep fighting against any Islip IDA tax breaks (PILOT) for Amazon's warehouse and to ensure Suffolk County DPW thoroughly audits the sewer and stormwater capacity of the 140-acre parcel.",
      askStaff: "Please let the Legislator know the community has his back on fighting IDA subsidies and would love him to speak at our upcoming coalition rally.",
      followUp: "Inform the committee field lead so Piccirillo's office receives steady reinforcement."
    },
    townBoard: {
      title: "Call the Islip Town Board (20 seconds)",
      forWhom: "Supervisor Carpenter and Councilmembers Lorenzo, Guadrón, Kuhn, McElwee",
      phone: "(631) 224-5500",
      body:
"Hi, my name is {{name}} and I live at {{street}} in Holbrook. I'm calling about Project Sunrise, the Amazon mega-warehouse application, case CZ 2026-010. I am asking {{official}} to vote NO on the change of zone and NO on any new PDD for this site. The applicant's own paperwork shows a floor-area ratio double the legal limit, 1,500 parking spaces where 6,859 are required, and 555 to 809 truck trips a day over our drinking-water aquifer. Please don't rescind the Islip Pines covenants or sell Town land for this. I'll be watching the vote.",
      askStaff: "Can you please log my opposition to CZ 2026-010 and tell me how {{official}} plans to vote?",
      followUp: "Send the Town Board email template right after so your position is in writing."
    },
    ida: {
      title: "Call the Islip IDA",
      forWhom: "Islip Industrial Development Agency",
      phone: "(631) 224-5512",
      body:
"Hi, my name is {{name}} and I live at {{street}} in Holbrook. I'm calling about the proposed Amazon warehouse, Project Sunrise. I am asking the IDA to deny any PILOT, tax abatement or sales-tax exemption for this project. The application contains no jobs number and no fiscal analysis. Amazon is a $2.9 trillion company; it does not need Islip taxpayers or the Sachem schools to subsidize a 4.26-million-square-foot truck terminal. If there is an application, I want a public hearing in Holbrook, in the evening, before any vote.",
      askStaff: "Has the IDA received an application for this project, and when will the public hearing be scheduled?",
      followUp: "Email info@islipida.com and ecodev@islipny.gov so your request is on the record."
    },
    generic: {
      title: "Call any official",
      forWhom: "Any elected official or agency",
      phone: "",
      body:
"Hi, my name is {{name}} and I live at {{street}} in Holbrook. I'm calling about PROJECT SUNRISE — the proposed Amazon mega-warehouse in Holbrook, Town of Islip case CZ 2026-010. I oppose the change of zone and any tax breaks for this project. It is 4.26 million square feet, operates 24/7, and the applicant's own study shows 555 to 809 truck trips a day and 83.8 acres of pavement over our Sole Source Aquifer. I am asking {{official}} to call for a full review of traffic and truck impacts, drainage and stormwater, noise and lighting, water and wastewater, and public safety before any approval.",
      askStaff: "Can you log my opposition and tell me what {{official}} is doing about this project?",
      followUp: "Follow up with the matching email template so it is in writing."
    }
  },

  // Three-minute testimony drafts. Figures corrected to the applicant's filing.
  testimony: [
    {
      id: "traffic", topic: "Traffic: arterial chokepoints", hearing: "Planning Board / Town Board",
      hook: "The applicant's own study shows the network is already failing.",
      data: "555 truck trips avg / 809 peak; 10,815 vehicles/day; 998 PM peak-hour trips; LOS E at NY-454 & Broadway, NY-454 & Lakeland, Nicolls & Colin today.",
      draft:
"Good evening. My name is {{name}} and I live at {{street}} in {{town}}. I want to talk about traffic, using only the applicant's own numbers. The Stonefield study says this facility will generate 555 truck trips on an average weekday and 809 on a peak day, plus 10,815 total vehicle trips a day, with 998 new trips in the evening peak hour. It admits that Veterans Highway at Broadway, at Lakeland Avenue, and Nicolls Road at Colin Drive already operate at Level of Service E — one step from failure — and that several turning movements will stay at LOS F even after their mitigation, which amounts to one-second signal changes. The study relies on truck counts from October 2022 and on trip numbers supplied by the operator, not published standards. Its conclusion of \"no significant impact\" is measured against Islip Pines, a project that was never built. Please vote no on the change of zone."
    },
    {
      id: "safety", topic: "Public safety: emergency response", hearing: "Town Board",
      hook: "Holbrook Fire Department and ambulances share these corridors.",
      data: "544 collisions in 36 months; every study intersection above the NYSDOT crash rate; Sunrise Hwy N. Service Rd & Beacon Dr 0.97 vs 0.12.",
      draft:
"My name is {{name}}, {{street}}, {{town}}. The applicant's traffic study counted 544 collisions at the study intersections in three years, 259 of them rear-end crashes. Every intersection in its crash-rate table is above the NYSDOT average — Beacon Drive at the Sunrise service road is eight times the average. The Holbrook Fire Department and mutual-aid ambulances use these same roads. Adding 555 to 809 tractor-trailer trips a day, 24 hours a day, to corridors that are already the most dangerous in the area is a public-safety decision, not just a zoning decision. The study says crash rates \"are not anticipated to be adversely impacted.\" It offers no analysis to support that. I ask the Board to require an independent emergency-response study before any approval. Please vote no on the change of zone."
    },
    {
      id: "aquifer", topic: "Environment: Sole Source Aquifer", hearing: "Planning Board (SEQRA)",
      hook: "83.8 acres of untreated runoff into drywells above a 19-foot water table.",
      data: "Water table 19 ft; 99.9% well-drained sand; 83.80 ac impervious; 426 trailer spaces; NYSDEC Design Manual Table 4.3 hotspot rule; Goldisc site adjacent.",
      draft:
"My name is {{name}}, {{street}}, {{town}}. This site sits on the Nassau-Suffolk Sole Source Aquifer. The applicant's EAF puts the water table at 19 feet below grade in sand that is 99.9 percent well-drained. It proposes to strip 99.87 acres of forest, lay down 83.8 acres of pavement and roof — including 426 trailer spaces and 115 loading docks — and send every drop of runoff into drywells. The state's own Stormwater Design Manual says runoff from fleet-storage and loading areas \"cannot be allowed to infiltrate untreated into groundwater.\" The property next door, Goldisc Recording, did exactly that and shut down a public water-supply well in 1993. The applicant has submitted no hydrogeologic study, no Article 6 or 7 review, no drywell design, no deicing plan and no spill plan. I ask for a Positive Declaration and an independent groundwater study. Please vote no on the change of zone."
    },
    {
      id: "tax", topic: "Fiscal: corporate tax abatement", hearing: "Islip IDA / Town Board",
      hook: "The filing contains no jobs, wage or revenue figures — nothing to justify a subsidy.",
      data: "EAF lists Islip IDA for \"Potential Financial Assistance\"; Amazon ≈ $2.9 trillion; land bought for $160 million; no jobs figure anywhere in the file.",
      draft:
"My name is {{name}}, {{street}}, {{town}}. The applicant's environmental form lists the Islip IDA for \"potential financial assistance.\" I searched the entire application. There is no jobs number. There is no wage number. There is no tax-revenue projection. There is no fiscal analysis of any kind. What we do know is that the end user is Amazon, a company worth roughly 2.9 trillion dollars, and that the land alone cost 160 million dollars. A PILOT for this project would take money from the Sachem and Connetquot schools and from every taxpayer in this room, to help the largest retailer on earth build a truck terminal that its own study says will put 555 to 809 trucks a day on our roads. There is no public benefit on this record. I ask the IDA to deny any incentive, and I ask this Board to make clear it expects none. Please vote no on the change of zone."
    },
    {
      id: "noise", topic: "Noise and light pollution, 24/7", hearing: "Planning Board",
      hook: "The noise study, lighting plan and air study were not submitted.",
      data: "24/7 operation; sound wall proposed before noise study done; 240-ft north buffer; Brightview Sayville 1,200 ft; noise, air/GHG, lighting each \"being prepared\".",
      draft:
"My name is {{name}}, {{street}}, {{town}}. This facility will run 24 hours a day, 7 days a week, every day of the year: backup alarms, loading docks, diesel engines, security lighting, all night. The applicant's own site plan says the property abuts homes to the north and that a sound wall \"may be required\" — but the operational noise study was not submitted. The lighting plan was not submitted. The air-quality and greenhouse-gas study was not submitted. Each one is marked \"being prepared.\" The Brightview Sayville senior residence is 1,200 feet away. The Board is being asked to change the zoning before anyone has measured what our neighborhoods will hear, see or breathe. That is backwards. Require the studies first, and require them independently reviewed. Please vote no on the change of zone."
    },
    {
      id: "roads", topic: "Infrastructure: road wear and who pays", hearing: "Town Board",
      hook: "Heavy trucks do the damage; taxpayers do the repaving.",
      data: "555–809 truck trips/day; road realignment of Beacon Dr, new signals, fourth WB lane all \"subject to approval\"; no funding commitment in file.",
      draft:
"My name is {{name}}, {{street}}, {{town}}. A loaded tractor-trailer causes thousands of times the pavement damage of a passenger car. The applicant proposes 555 to 809 truck trips a day, forever. Its plan depends on a list of road projects — realigning Beacon Drive, new signals at Church Street and at the Sunrise service road, dual turn lanes, a fourth westbound lane — all described as \"subject to approval\" by the Town, County and State. There is no funding commitment, no construction schedule and no guarantee any of it is finished before the first truck arrives. When it is not, Islip and Suffolk taxpayers pay. I ask the Board to require, as a condition of any consideration, a binding agreement that every improvement is built and paid for by the applicant before a certificate of occupancy. Better still: please vote no on the change of zone."
    },
    {
      id: "air", topic: "Air quality: diesel particulates", hearing: "Planning Board (SEQRA)",
      hook: "Hundreds of diesel trucks a day, next to homes, and no air study.",
      data: "555–809 truck trips/day; mobile source \"tractor trailers\"; stationary \"generator / HVAC\"; air permit questions left blank; GHG question unanswered.",
      draft:
"My name is {{name}}, {{street}}, {{town}}. Diesel exhaust is fine particulate matter, PM2.5, the pollutant most closely tied to childhood asthma and heart disease. The applicant lists \"tractor trailers\" as its mobile emission source and \"generators and HVAC\" as its stationary sources, and then leaves every air-permit question on the EAF blank, including whether the project will exceed 10,000 tons of greenhouse gases a year. It says an air study is \"being prepared.\" We are talking about 555 to 809 truck trips a day, idling at 115 loading docks, a few hundred feet from homes, a senior residence and Sans Souci County Park. No zoning change should be considered until an air-quality analysis is on the record and independently reviewed. Please vote no on the change of zone."
    },
    {
      id: "zoning", topic: "Zoning precedent and density", hearing: "Town Board",
      hook: "Double the FAR limit, one-fifth the parking, and a new district written for one applicant.",
      data: "FAR 0.713 vs 0.35 max; parking 1,500 vs 6,859; IMUPDD → IND1 requested; Town Planning recommends new PDD to \"avoid setting a precedent\"; Islip Pines covenants to be rescinded.",
      draft:
"My name is {{name}}, {{street}}, {{town}}. In 2014 this Board created the Islip Mixed-Use PDD for this property, with recorded covenants, and defended it in court. Now the applicant asks you to throw that out, rezone the site to Industrial 1, and then ignore the Industrial 1 rules. Its own zoning chart shows a floor-area ratio of 0.713 against a limit of 0.35 — double — and 1,500 parking spaces where the code requires 6,859. Both lines are marked \"Complies: N.\" Your Planning staff wrote that these are \"variances of significant magnitude\" and suggested a brand-new PDD instead, to \"avoid setting a precedent.\" A district invented so one company can exceed every limit is the precedent. If the code has to be rewritten for a project to fit, the project does not fit. Please vote no on the change of zone."
    },
    {
      id: "jobs", topic: "Economic impact: job quality", hearing: "Islip IDA / Town Board",
      hook: "A robotics facility with no jobs number in the file.",
      data: "TIS describes \"Amazon Robotics Sortable\" and \"Sub Same-Day\" facility; no employment figure anywhere; 1,500 employee stalls.",
      draft:
"My name is {{name}}, {{street}}, {{town}}. We keep hearing about jobs. The traffic study describes this as an \"Amazon Robotics Sortable\" fulfillment center — a facility designed around automation. The application contains no employment number at all; the only clue is 1,500 employee parking stalls for a 4.26-million-square-foot building. Warehouse work of this kind is known for high turnover and shift schedules that put thousands of cars on Broadway Avenue and Veterans Highway at the same moment. Before anyone weighs \"jobs\" against 100 acres of forest, a Sole Source Aquifer and 809 trucks a day, the applicant should put a number, a wage and a turnover rate on the record — under oath. Until then, there is nothing to weigh. Please vote no on the change of zone."
    },
    {
      id: "schools", topic: "Schools and community services", hearing: "Islip IDA / Town Board",
      hook: "A PILOT takes from Sachem; the trucks take from the school buses.",
      data: "EAF: Sachem Central School District; Suffolk PD 5th Precinct; Holbrook FD; IDA listed for financial assistance; 998 PM peak-hour trips.",
      draft:
"My name is {{name}}, {{street}}, {{town}}. The applicant's EAF names the Sachem Central School District, the Fifth Precinct and the Holbrook Fire Department as the services this project will draw on. It also names the Islip IDA for financial assistance. A tax abatement means Sachem receives less than the full commercial ratable while absorbing every impact. Meanwhile 998 new vehicle trips in the evening peak hour and 555 to 809 trucks a day land on the roads our school buses use. The Fire Department gets a 4.3-million-square-foot, 60-foot-tall building with a 12-megawatt electrical load and a robotics floor, and no additional resources. Nobody has calculated any of this because the application contains no fiscal analysis. Ask the school board what it thinks. Ask the fire commissioners. Then please vote no on the change of zone."
    }
  ],

  newsday: {
    to: "letters@newsday.com",
    subject: "Letter to the editor: Amazon's Holbrook warehouse does not belong here",
    body:
"To the Editor:\n\n" +
"Amazon wants to build a 4.26-million-square-foot fulfillment complex on 138 wooded acres at Sunrise Highway and Veterans Memorial Highway in Holbrook. Its own application tells you why residents are alarmed. The building would have double the floor-area ratio the Industrial 1 zone allows and one-fifth the required parking; the applicant's zoning chart literally reads \"Complies: N.\" Its traffic study projects 555 truck trips on an average day and 809 at peak, 24 hours a day, on roads where every studied intersection already has a crash rate above the state average. It would clear 100 acres of forest and send runoff from 84 acres of pavement into drywells above a water table 19 feet down, in the Sole Source Aquifer, next to a former Superfund site that once shut down a public well. No jobs number appears anywhere in the filing, yet the company is expected to ask the Islip IDA for a tax break.\n\n" +
"The Town of Islip has already called the application incomplete and its variances of \"significant magnitude.\" The Town Board should say no to the zone change, and the IDA should say no to any subsidy. This is not about being anti-Amazon. It is about whether a development of this scale belongs in a residential hamlet. It does not.\n\n" +
"{{name}}\n{{town}}"
  }
};
