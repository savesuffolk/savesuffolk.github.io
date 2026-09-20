// Stop Project Sunrise — additional impact categories for Your House ("Also on the table" + the More tab).
// status: verified = source fetched and number read; unverified = confirm before quoting; estimate = our arithmetic.
// Research trail: research/power-roads-services.md and research/filing-power-services.md.
window.SPS = window.SPS || {};

SPS.impacts = [
  { id: "ems", card: true, icon: "heart", sev: "hot", short: "Ambulance", title: "Your volunteer ambulance, their injury rate",
    big: "6.5 injuries per 100 workers", sub: "answered by Holbrook volunteers",
    line: "Amazon warehouses injure workers at 6.54 per 100, over 30% above the industry average and nearly twice other warehouses. Holbrook's all-volunteer department already ran 2,889 ambulance calls last year.",
    facts: [
      { text: "Amazon's 2023 injury rate was 6.54 per 100 workers, against 4.8 for all warehouses and 5.4 for large ones; in each of the last seven years Amazon workers were nearly twice as likely to be hurt as workers in other warehouses.", source: "U.S. Senate HELP Committee majority staff report, Dec 15 2024", url: "https://www.help.senate.gov/imo/media/doc/amazon_investigation.pdf", status: "verified" },
      { text: "Injuries at Amazon warehouses rose by as much as 59% during 2023 peak periods; in 2024 the company's injury rate was 80% above its own 2025 target.", source: "Strategic Organizing Center, Same-Day Injury (2024) and Failure to Deliver (2025)", url: "https://thesoc.org/resources/failure-to-deliver-amazon-falls-short-on-safety/", status: "verified" },
      { text: "With 1,500 parking stalls and round-the-clock shifts, that rate works out to roughly 100–200 recordable injuries a year in one building.", source: "Our arithmetic from the filing's parking count and the Senate rate", url: "", status: "estimate" },
      { text: "Holbrook Fire Department, all volunteer, answered 624 fire and 2,889 EMS calls in 2025 — 3,513 responses. Whether it has an aerial ladder able to reach a three-story, 60-foot building is not stated.", source: "Holbrook Fire Department", url: "https://www.holbrookfd.org/", status: "verified" },
      { text: "In 2020 a 600,000 sq ft warehouse in Amazon's supply chain in Redlands, CA — sprinklered and code-compliant — burned to the ground; the roof began collapsing in 20 minutes and city water mains fell to 40 psi. Loss over $200 million. Project Sunrise is seven times that size.", source: "Fire Engineering, lessons learned from the Redlands ESFR fire", url: "https://www.fireengineering.com/fire-safety/lessons-learned-from-a-large-loss-fire-involving-an-esfr-sprinkler-system/", status: "verified" },
      { text: "The New York fire code's largest bracket for high-piled storage is \"over 500,000 sq ft.\" This building is eight of those.", source: "2020 Fire Code of New York State, Table 3206.2", url: "https://up.codes/viewer/new_york/ny-fire-code-2020/chapter/32/high-piled-combustible-storage", status: "verified" }
    ],
    asks: ["A fire-flow analysis and hydrant flow tests from the Suffolk County Water Authority for this site.", "Written review by the Holbrook Fire District and Suffolk FRES of apparatus access, aerial reach and EV-charging fire protection.", "An emergency-services impact analysis: projected ambulance and fire calls, and who pays for them."] },

  { id: "roads", card: true, icon: "truck", sev: "hot", short: "Road bill", title: "Your road, their trucks",
    big: "1 truck = 9,600 cars", sub: "of pavement wear, on a county road you pay for",
    line: "A loaded tractor-trailer does the road damage of at least 9,600 cars. Nicolls Road is a Suffolk County road: when 555 to 809 trucks a day chew it up, county property tax repaves it.",
    facts: [
      { text: "A five-axle tractor-trailer at the 80,000-pound federal limit has the same pavement impact as at least 9,600 automobiles; one 20,000-pound truck axle equals 7,550 passes of a car axle.", source: "U.S. General Accounting Office, CED-79-94 (1979)", url: "https://www.gao.gov/assets/ced-79-94.pdf", status: "verified" },
      { text: "The heaviest combination trucks pay about half of their share of highway costs; the most common ones pay 80%. The difference is made up by everyone else.", source: "FHWA, Addendum to the 1997 Federal Highway Cost Allocation Study (2000)", url: "https://www.fhwa.dot.gov/policy/hcas/addendum.cfm", status: "verified" },
      { text: "Nicolls Road is Suffolk County Route 97, 14.29 miles maintained by the county Department of Public Works. Route 454 and Sunrise Highway are State roads.", source: "Suffolk County DPW county road list", url: "https://www.suffolkcountyny.gov/Portals/0/formsdocs/publicworks/PDF/Suffolk%20County%20Roads%20List.pdf", status: "verified" },
      { text: "A State highway work permit can require a bond and maintenance of the driveway and turn lanes the developer builds. Nothing found requires a contribution for wear on the other 14 miles.", source: "NY Highway Law §52; NYSDOT PERM 33-COM", url: "https://www.nysenate.gov/legislation/laws/HAY/52", status: "verified" },
      { text: "The traffic study's road fixes — a realigned Beacon Drive, new signals, a fourth westbound lane — are all \"subject to approval,\" with no funding commitment in the file.", source: "Stonefield Traffic Impact Study, June 30 2026", url: "docs/Traffic-Impact-Study-2026-06-30.pdf", status: "verified" },
      { text: "New York's five-minute idling limit for heavy trucks exempts loading, unloading and cargo refrigeration — the loading-dock loophole.", source: "6 NYCRR 217-3.2 and 217-3.3", url: "https://www.law.cornell.edu/regulations/new-york/6-NYCRR-217-3.3", status: "verified" }
    ],
    asks: ["Suffolk DPW: pavement condition, last resurfacing cost and cost per lane-mile for Nicolls Road between Sunrise Highway and the Expressway.", "A binding condition that every off-site road improvement is built and paid for by the applicant before a certificate of occupancy.", "An idling condition stricter than the State's, with the loading-dock exemption closed."] },

  { id: "power", card: true, icon: "bolt", sev: "warm", short: "Power", title: "The electric draw of 15,000 homes",
    big: "12.1 megawatts", sub: "on a grid its own operator calls short by 2027",
    line: "The filing asks PSEG for 12.1 MW of peak power — the average draw of about 15,000 Long Island homes. The grid operator says Long Island's reliability margins run short from summer 2027. Who pays for the substation is not in the file.",
    facts: [
      { text: "\"Electrical load is estimated 12.1± MW peak demand,\" supplied by PSEG Long Island and on-site solar. Three LIPA transmission corridors already cross the site.", source: "Full EAF Part 1 §D.2.k and attachment", url: "docs/Full-EAF-2026-07-15.pdf", status: "verified" },
      { text: "The average New York home draws about 0.78 kW (571 kWh a month), so 12.1 MW is the average draw of roughly 15,500 homes — more than every home in Holbrook and Holtsville combined.", source: "U.S. EIA, Table 5.A, 2024 average residential bill, New York", url: "https://www.eia.gov/electricity/sales_revenue_price/pdf/table_5A.pdf", status: "verified" },
      { text: "Long Island's bulk power reliability margins \"would be deficient beginning in summer 2027 and continuing through the remainder of the five-year study horizon.\"", source: "NYISO, Power Trends 2026", url: "https://www.nyiso.com/documents/d/guest/2026-power-trends", status: "verified" },
      { text: "Against the whole island's 5,000 MW peak this is a quarter of one percent; against the Holbrook–Ronkonkoma feeders and substation it is a new industrial customer the size of a small town.", source: "NYISO 2025 Gold Book, Table I-4a (Zone K); our framing", url: "https://www.nyiso.com/documents/20142/2226333/2025-Gold-Book-Public.pdf", status: "verified" },
      { text: "Under LIPA's tariff a commercial customer pays only for facilities beyond the utility's allowance; service at 23,000 volts or above needs an interconnection agreement. Whether ratepayers pick up any of a substation upgrade is not disclosed.", source: "LIPA Tariff for Electric Service, Sept 2026, §II.D", url: "https://www.lipower.org/wp-content/uploads/2026/09/LIPA-Tariff-September-2026-linked.pdf", status: "verified" },
      { text: "An on-site generator is listed as a stationary emission source; its fuel, size and run hours are not given, and the air-permit questions are blank.", source: "Full EAF Part 1 §D.2.f–g", url: "docs/Full-EAF-2026-07-15.pdf", status: "verified" }
    ],
    asks: ["PSEG Long Island's will-serve letter or system-impact study for 12.1 MW, naming the substation and feeders.", "The cost of any substation or feeder upgrade and the share recovered from the applicant versus the rate base.", "Generator fuel type, capacity and expected run hours."] },

  { id: "schools", card: true, icon: "users", sev: "warm", short: "Schools", title: "School money in the tax break",
    big: "$717 million", sub: "of school taxes waived by NY IDAs last year",
    line: "Industrial Development Agency deals exempted $717 million in school-district property tax across New York in 2024. Sachem gets 57% of its budget from your property tax, and the Comptroller says IDA job claims are not independently verified.",
    facts: [
      { text: "In 2024 New York IDAs granted $2.06 billion in tax exemptions; $717 million of it was school-district property tax. The Comptroller notes exemptions \"may in some cases lead to increases in taxpayer bills.\"", source: "NYS Comptroller, Performance of Industrial Development Agencies, 2026 report", url: "https://www.osc.ny.gov/files/local-government/publications/pdf/ida-performance-report-2026.pdf", status: "verified" },
      { text: "Job numbers in IDA reports are self-reported: \"The data presented in this report is not independently verified by the Office of the New York State Comptroller.\"", source: "Same report", url: "https://www.osc.ny.gov/files/local-government/publications/pdf/ida-performance-report-2026.pdf", status: "verified" },
      { text: "Sachem Central School District's 2026–27 budget draws 56.83% ($216.5 million) from the property-tax levy; payments in lieu of taxes sit inside a 2.84% \"other\" line. Enrollment 11,749.", source: "Sachem CSD 2026–27 Budget Overview", url: "https://files.smartsites.parentsquare.com/9431/2026-27_budget_overview.pdf", status: "verified" },
      { text: "The filing lists the Islip IDA for \"potential financial assistance\" but states no jobs figure, no payroll and no fiscal analysis.", source: "Full EAF Part 1; every FOIL'd document searched", url: "docs/Full-EAF-2026-07-15.pdf", status: "verified" },
      { text: "The Senate report describes Amazon staffing policies designed \"to create attrition when peak periods conclude\" — seasonal churn, not careers.", source: "U.S. Senate HELP Committee report, 2024", url: "https://www.help.senate.gov/imo/media/doc/amazon_investigation.pdf", status: "verified" }
    ],
    asks: ["Islip IDA: the application, uniform tax exemption policy, and the proposed PILOT schedule by year and by taxing body (Sachem, county, town, fire district, library).", "The IDA's cost-benefit analysis and job commitments with clawback terms.", "Confirmation the parcel lies in the Sachem district for tax purposes."] },

  { id: "drones", card: false, icon: "wind", sev: "warm", short: "Drones", title: "Drones come with same-day sites",
    big: "500 towns", sub: "Amazon's drone rollout this year",
    line: "Amazon launches its MK30 delivery drones \"from facilities next to our Same-Day Delivery site,\" and is expanding drone delivery to nearly 500 US cities and towns this year. The filing includes a 425,000 sq ft same-day station with 120 delivery-car stalls.",
    facts: [
      { text: "\"Our new MK30 drones will deploy from facilities next to our Same-Day Delivery site… These smaller sites are hybrid — part fulfillment center, part delivery station.\"", source: "Amazon, drone delivery launch in Tolleson, AZ", url: "https://www.aboutamazon.com/news/transportation/amazon-drone-delivery-arizona", status: "verified" },
      { text: "The traffic study labels the north building \"425,000 SF SSD + Injection\" — a same-day delivery station — with 4,888 Flex delivery-car trips a day.", source: "Stonefield TIS Table 1 and A5", url: "docs/Traffic-Impact-Study-2026-06-30.pdf", status: "verified" },
      { text: "Drone noise complaints have been reported near other launch sites; a decibel figure is not verified and is not published here.", source: "—", url: "", status: "unverified" }
    ],
    asks: ["Whether drone operations are contemplated for the same-day area, and any FAA Part 135 filings for this site."] },

  { id: "heat", card: false, icon: "sun", sev: "ok", short: "Heat", title: "84 acres of roof and asphalt",
    big: "2–5°F warmer nights", sub: "typical heat-island effect",
    line: "Pavement and roofs run 1–7°F hotter than surrounding land by day and 2–5°F at night. The filing promises reflective concrete and a white roof; none of it is quantified.",
    facts: [
      { text: "Daytime temperatures in urban areas are about 1–7°F higher than outlying areas and nighttime 2–5°F; roof surfaces can be up to 66°F hotter than the air.", source: "U.S. EPA, Learn About Heat Islands", url: "https://www.epa.gov/heatislands/learn-about-heat-islands", status: "verified" },
      { text: "A 100-year storm here is 6.2 inches in 24 hours — about 14 million gallons on 84 acres, all sent into the ground above the aquifer. The system is designed for 8 inches, so off-site flooding is unlikely on paper; the issue stays the water.", source: "NOAA Atlas 14 for the site; Full EAF attachment", url: "https://hdsc.nws.noaa.gov/pfds/", status: "verified" }
    ],
    asks: ["The photometric and thermal assumptions behind the \"high-reflectance\" claims, in numbers."] }
];
