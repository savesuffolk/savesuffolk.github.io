// Stop Project Sunrise — public officials and agencies, ordered by leverage over the decision.
// Only public officials / agency contacts. `verify:true` = not from the campaign's own contact
// directory; confirm before mass use. `ally:true` = has publicly sided with residents.
window.SPS = window.SPS || {};

SPS.officialGroups = [
  {
    id: "townBoard",
    title: "Islip Town Board",
    level: "town",
    why: "Casts the final vote on the change of zone (IMUPDD → Industrial 1, or a new PDD), the rescission of the Islip Pines covenants, the sale of Town-owned land, and the abandonment of paper streets. Nothing happens without this vote.",
    ask: "Vote NO on the change of zone and any new PDD. Do not rescind the covenants or sell Town land for this project.",
    emailTemplate: "townBoard",
    script: "townBoard",
    address: "Town Hall, 655 Main St, Islip, NY 11751",
    officials: [
      { name: "Angie Carpenter", title: "Town Supervisor", phone: "(631) 224-5500", email: "supervisorsoffice@islipny.gov", address: "655 Main St, Islip, NY 11751", note: "" },
      { name: "John M. Lorenzo", title: "Councilman, District 4 — Holbrook", phone: "(631) 589-0234", email: "JLorenzo@islipny.gov", address: "655 Main St, Islip, NY 11751", note: "Represents Holbrook. Named on the change.org petition as a decision maker." },
      { name: "Jorge Guadrón", title: "Councilman, District 1", phone: "(631) 595-3555", email: "JGuadron@islipny.gov", address: "655 Main St, Islip, NY 11751", note: "" },
      { name: "DawnMarie Kuhn", title: "Councilwoman, District 2", phone: "(631) 595-3905", email: "DKuhn@islipny.gov", address: "655 Main St, Islip, NY 11751", note: "" },
      { name: "Michael J. McElwee, Jr.", title: "Councilman, District 3", phone: "(631) 224-5559", email: "MMcElwee@islipny.gov", address: "655 Main St, Islip, NY 11751", note: "" },
      { name: "Town of Islip — general mailbox", title: "Constituent contact", phone: "(631) 595-3500", email: "contactus@islipny.gov", address: "655 Main St, Islip, NY 11751", note: "Copy this address so your message is logged." },
      { name: "Town Clerk", title: "Public record / FOIL", phone: "(631) 224-5490", email: "townclerk@islipny.gov", address: "655 Main St, Islip, NY 11751", note: "Written comments submitted to the Clerk become part of the hearing record.", verify: true }
    ]
  },
  {
    id: "ida",
    title: "Islip Industrial Development Agency (IDA)",
    level: "town",
    why: "Decides whether Amazon gets a PILOT property-tax abatement and sales-tax waiver. The applicant's own EAF lists the IDA for \"Potential Financial Assistance\". Amazon has said publicly the project needs a tax break to proceed.",
    ask: "Deny any PILOT, abatement or sales-tax exemption. Hold a full public hearing before any vote.",
    emailTemplate: "ida",
    script: "ida",
    address: "40 Nassau Ave, Islip, NY 11751",
    officials: [
      { name: "Islip IDA — Executive Director & Board", title: "Tax incentives", phone: "(631) 224-5512", email: "info@islipida.com", address: "40 Nassau Ave, Islip, NY 11751", note: "Two addresses appear in campaign documents: info@islipida.com and ecodev@islipny.gov. Send to both." },
      { name: "Islip Office of Economic Development", title: "IDA staff", phone: "(631) 224-5512", email: "ecodev@islipny.gov", address: "40 Nassau Ave, Islip, NY 11751", note: "" }
    ]
  },
  {
    id: "planning",
    title: "Islip Planning Division & Planning Board",
    level: "town",
    why: "Runs the SEQRA environmental review and site-plan approval. Can require a Positive Declaration and a full Environmental Impact Statement. Town Planning already wrote (7/24/2026) that the requested height and FAR variances are of \"significant magnitude\".",
    ask: "Issue a SEQRA Positive Declaration (Type I action) and require a full DEIS with an independent hydrogeologic study before any zoning recommendation.",
    emailTemplate: "planning",
    script: "generic",
    address: "Town Hall, 655 Main St, Islip, NY 11751",
    officials: [
      { name: "Planning Division", title: "Commissioner of Planning: Ela Dokonal; Principal Planner: Sean Colgan, AICP", phone: "(631) 224-5450", email: "Commissioner-pd@islipny.gov", address: "655 Main St, Islip, NY 11751", note: "Fax (631) 224-5444. A second address, planning@islipny.gov, appears in the campaign dossier." },
      { name: "Planning Board", title: "Edward Friedland (Chair), Kevin Brown (Vice Chair), Ines Cruz, Victoria Ryan, Patrick B. Fife, Brett Robinson, Patricia Barraga", phone: "(631) 224-5450", email: "planning@islipny.gov", address: "Meets at Town Hall West, 401 Main St, Islip", note: "Wednesdays 6:00 PM. Public comment period at each meeting." }
    ]
  },
  {
    id: "county",
    title: "Suffolk County",
    level: "county",
    why: "County Planning Commission gets a §239-m referral on the zone change. County DPW / Sewer Agency must certify Parkland (Sewer District 14) capacity for 61,200 gal/day. Health Services reviews water supply and sanitary disposal. Legislators can demand those reviews and oppose county-level incentives.",
    ask: "Demand a rigorous County Planning Commission referral, a DPW sewer-capacity and drainage review, a Health Services aquifer review, and no county IDA incentives.",
    emailTemplate: "county",
    script: "generic",
    address: "H. Lee Dennison Bldg, 100 Veterans Memorial Hwy, Hauppauge, NY 11788",
    officials: [
      { name: "Anthony A. Piccirillo", title: "Legislator, District 8 — Holbrook", phone: "(631) 854-9611", email: "Anthony.Piccirillo@suffolkcountyny.gov", address: "1601 Veterans Memorial Hwy, Islandia, NY", note: "ALLY. Attended the Aug 10 community meeting; publicly opposes IDA tax giveaways. Thank him, then ask him to push DPW/Health reviews and introduce a resolution opposing any PILOT.", ally: true, script: "piccirillo", emailTemplate: "piccirillo" },
      { name: "Ed Romaine", title: "County Executive", phone: "(631) 853-4000", email: "county.executive@suffolkcountyny.gov", address: "H. Lee Dennison Bldg, 100 Veterans Memorial Hwy, Hauppauge, NY 11788", note: "" },
      { name: "Trish Bergin", title: "Legislator, District 10", phone: "(631) 854-0940", email: "Trish.Bergin@suffolkcountyny.gov", address: "", note: "" },
      { name: "Suffolk County Legislature — Clerk", title: "Public comment to all 18 legislators", phone: "(631) 853-4070", email: "clerk.legislature@suffolkcountyny.gov", address: "725 Veterans Memorial Hwy, Smithtown, NY 11787", note: "Comments sent here are distributed to the full Legislature." },
      { name: "Greg Doroski", title: "Legislator, District 1", phone: "(631) 852-3200", email: "", address: "", note: "" },
      { name: "Ann Welker", title: "Legislator, District 2", phone: "(631) 852-8400", email: "", address: "", note: "" },
      { name: "James F. Mazzarella", title: "Legislator, District 3", phone: "(631) 852-1300", email: "", address: "", note: "" },
      { name: "Nick Caracappa", title: "Legislator, District 4", phone: "(631) 854-9292", email: "", address: "", note: "" },
      { name: "Steven Englebright", title: "Legislator, District 5", phone: "(631) 854-1650", email: "", address: "", note: "" },
      { name: "Chad Lennon", title: "Legislator, District 6", phone: "(631) 854-1600", email: "", address: "", note: "" },
      { name: "Dominick S. Thorne", title: "Legislator, District 7", phone: "(631) 854-1400", email: "", address: "", note: "" },
      { name: "Samuel Gonzalez", title: "Legislator, District 9", phone: "(631) 853-3700", email: "", address: "", note: "" },
      { name: "Steven J. Flotteron", title: "Legislator, District 11", phone: "(631) 854-4100", email: "", address: "", note: "" },
      { name: "Leslie Kennedy", title: "Legislator, District 12", phone: "(631) 854-3735", email: "", address: "", note: "" },
      { name: "Salvatore Formica", title: "Legislator, District 13", phone: "(631) 854-3900", email: "", address: "", note: "" },
      { name: "RJ Renna", title: "Legislator, District 14", phone: "(631) 854-1100", email: "", address: "", note: "" },
      { name: "Jason Richberg", title: "Legislator, District 15", phone: "(631) 854-1111", email: "", address: "", note: "" },
      { name: "Rebecca Sanin", title: "Legislator, District 16", phone: "(631) 854-5100", email: "", address: "", note: "" },
      { name: "Tom Donnelly", title: "Legislator, District 17", phone: "(631) 854-4433", email: "", address: "", note: "" },
      { name: "Stephanie Bontempi", title: "Legislator, District 18", phone: "(631) 854-4500", email: "", address: "", note: "" },
      { name: "Suffolk County Planning Commission", title: "§239-m referral on the zone change (via Dept. of Economic Development & Planning)", phone: "(631) 853-5191", email: "", address: "H. Lee Dennison Bldg, 100 Veterans Memorial Hwy, 4th Fl, Hauppauge, NY 11788", note: "Meets Oct 7, Nov 4, Dec 9 at 2:00 PM (location varies).", verify: true },
      { name: "Suffolk County Dept. of Health Services — Office of Pollution Control", title: "Water supply, sanitary disposal, groundwater protection (Sanitary Code Articles 6 & 7)", phone: "(631) 852-5700", email: "dhs@suffolkcountyny.gov", address: "360 Yaphank Ave, Yaphank, NY 11980", note: "" },
      { name: "Suffolk County Dept. of Public Works / Sewer Agency", title: "Sewer District 14 (Parkland) capacity, §239-f road review, drainage", phone: "(631) 852-4010", email: "", address: "335 Yaphank Ave, Yaphank, NY 11980", note: "Highway Maintenance: (631) 852-4071.", verify: true },
      { name: "Suffolk County Water Authority (SCWA)", title: "Public water supplier; owns the Church Street and Green Belt Parkway wellfields near the site", phone: "(631) 563-0219", email: "", address: "4060 Sunrise Hwy, Oakdale, NY 11769", note: "Ask SCWA to comment on the SEQRA record about wellhead protection and untreated infiltration upgradient of its wells.", verify: true },
      { name: "Suffolk County IDA", title: "County-level tax incentives", phone: "(631) 853-4802", email: "info@suffolkida.org", address: "H. Lee Dennison Bldg, 100 Veterans Memorial Hwy, 3rd Fl, Hauppauge, NY 11788", note: "" }
    ]
  },
  {
    id: "state",
    title: "New York State",
    level: "state",
    why: "NYSDOT Region 10 issues the highway work permits on Sunrise Hwy (NY-27) and Veterans Memorial Hwy (NY-454). NYSDEC Region 1 issues the SPDES stormwater permit and protects the Sole Source Aquifer. State legislators can demand both agencies scrutinize the project and can publicly oppose tax breaks.",
    ask: "Ask legislators to formally request NYSDOT and NYSDEC reviews; ask the agencies directly for full corridor-safety and aquifer reviews.",
    emailTemplate: "state",
    script: "generic",
    address: "",
    officials: [
      { name: "Doug Smith", title: "Assemblyman, District 5 (Holbrook)", phone: "(631) 585-0230", email: "smithd@nyassembly.gov", address: "991 Main St, Suite 202, Holbrook, NY 11741", note: "Lives in Holbrook. At the Aug 10 meeting he said his office had received fewer than 5 calls and asked residents to call. Campaign target: 250 calls.", script: "smith", emailTemplate: "state" },
      { name: "Jarett Gandolfo", title: "Assemblyman, District 7", phone: "(631) 589-0348", email: "gandolfoj@nyassembly.gov", address: "", note: "" },
      { name: "Rebecca Kassay", title: "Assemblymember, District 4", phone: "(631) 751-3094", email: "kassayr@nyassembly.gov", address: "", note: "" },
      { name: "Phil Ramos", title: "Assemblyman, District 6", phone: "(631) 435-3214", email: "ramosp@nyassembly.gov", address: "", note: "" },
      { name: "Joe DeStefano", title: "Assemblyman, District 3", phone: "(631) 207-0073", email: "destefanoj@nyassembly.gov", address: "", note: "" },
      { name: "Michael J. Fitzpatrick", title: "Assemblyman, District 8", phone: "(631) 724-2929", email: "FitzpatrickM@nyassembly.gov", address: "", note: "" },
      { name: "Jodi Giglio", title: "Assemblywoman, District 2", phone: "(631) 727-0204", email: "giglioj2@nyassembly.gov", address: "", note: "" },
      { name: "Tommy John Schiavoni", title: "Assemblyman, District 1", phone: "(631) 537-2583", email: "schiavonitj@nyassembly.gov", address: "", note: "" },
      { name: "Alexis Weik", title: "State Senator, District 8", phone: "", email: "weik@nysenate.gov", address: "", note: "" },
      { name: "Monica Martinez", title: "State Senator, District 4", phone: "", email: "martinez@nysenate.gov", address: "", note: "" },
      { name: "Dean Murray", title: "State Senator, District 3", phone: "", email: "murray@nysenate.gov", address: "", note: "", verify: true },
      { name: "Gov. Kathy Hochul", title: "Governor of New York", phone: "(518) 474-8390", email: "", address: "NYS Capitol, Albany, NY 12224", note: "Use the web contact form at governor.ny.gov." },
      { name: "NYSDEC Region 1", title: "Regional Permit Administrator — SPDES stormwater, Sole Source Aquifer, remediation sites", phone: "(631) 444-0355", email: "dep.r1@dec.ny.gov", address: "50 Circle Rd, Stony Brook, NY 11790", note: "", emailTemplate: "dec" },
      { name: "NYSDOT Region 10 (Long Island)", title: "Regional Director — highway work permits, NY-27 & NY-454 access", phone: "(631) 952-6632", email: "dot.sm.r10.traffic@dot.ny.gov", address: "250 Veterans Memorial Hwy, Hauppauge, NY 11788", note: "", emailTemplate: "dot" }
    ]
  },
  {
    id: "federal",
    title: "Federal",
    level: "federal",
    why: "The Nassau-Suffolk aquifer is a federally designated Sole Source Aquifer (Safe Drinking Water Act §1424(e)). Federal representatives can ask EPA Region 2 to weigh in and can press on the adjacent Goldisc Superfund site.",
    ask: "Ask for an EPA Region 2 review of impacts to the Sole Source Aquifer and the adjacent Goldisc Superfund monitoring program.",
    emailTemplate: "federal",
    script: "generic",
    address: "",
    officials: [
      { name: "Rep. Andrew Garbarino", title: "U.S. Representative, NY-2", phone: "(202) 225-7896", email: "", address: "Use the web contact form at garbarino.house.gov", note: "", verify: true },
      { name: "Sen. Charles E. Schumer", title: "U.S. Senator", phone: "(202) 224-6542", email: "", address: "Use the web contact form at schumer.senate.gov", note: "", verify: true },
      { name: "Sen. Kirsten Gillibrand", title: "U.S. Senator", phone: "(202) 224-4451", email: "", address: "Use the web contact form at gillibrand.senate.gov", note: "", verify: true }
    ]
  }
];

// Convenience: all Town Board email addresses in one string (for the "Email the whole Town Board" button).
SPS.townBoardEmails = [
  "supervisorsoffice@islipny.gov", "JLorenzo@islipny.gov", "JGuadron@islipny.gov",
  "DKuhn@islipny.gov", "MMcElwee@islipny.gov", "contactus@islipny.gov"
];
