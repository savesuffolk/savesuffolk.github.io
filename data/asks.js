// Stop Project Sunrise — "Ask for it in writing", one list per topic. Rendered everywhere by js/concerns.js (SPS.asksBlock).
// Each ask: text = the demand as written (under ~25 words, starts with the thing wanted); say = the first-person line to say or write;
// who = the body that can grant it. Sources for each demand sit with the topic's facts (noise-params, values, roads, water-params, impacts).
window.SPS = window.SPS || {};
SPS.asks = {
  hearing: { body: "Islip Town Board", where: "655 Main St, Islip", when: "Nov 19, 5 PM" },
  order: ["review", "sleep", "home", "roads", "water", "ems", "power", "schools", "drones", "heat"],
  topics: {
    review: { title: "How it is being reviewed", icon: "file", headline: "Before any vote, in writing", items: [
      { id: "review-1", who: "Town Board", text: "A Positive Declaration under SEQRA and a full Draft Environmental Impact Statement, as the Town required for the smaller Islip Pines project on this same land in 2013.", say: "You required a full environmental impact statement here in 2013. Require one now." },
      { id: "review-2", who: "Planning Board", text: "The corrected assessment form the Town's own planner asked for on July 24 2026, published before any hearing rather than after.", say: "Publish the corrected environmental form your planner asked for, before the hearing." },
      { id: "review-3", who: "Town Board", text: "A written explanation of how a project larger than the site's existing zoning permits can be reviewed with less scrutiny than the smaller project that zoning was written for.", say: "Explain in writing why a bigger project is getting a smaller review." },
      { id: "review-4", who: "Town Board", text: "The operational noise, air-quality, greenhouse-gas and lighting studies the filing lists as \"being prepared\", completed and on the record before the Change of Zone is heard.", say: "The studies marked \"being prepared\" must be finished and public before you vote." },
      { id: "review-5", who: "Town of Islip (FOIL)", text: "The 2013 Islip Pines Draft and Final Environmental Impact Statements for this property, released in full, so the review the Town once required here can be compared with the review being accepted now.", say: "Release the 2013 environmental impact statement for this same land." }
    ] },
    sleep: { title: "Your sleep", icon: "moon", headline: "Before any vote, in writing", items: [
      { id: "sleep-1", who: "Town Board", text: "The operational noise study, submitted and reviewed, before the Change of Zone is heard — not after.", say: "Require the noise study before the hearing, not after it." },
      { id: "sleep-2", who: "Town Board", text: "No trailer moves on the north side between 10 PM and 7 AM, and broadband back-up alarms on every yard vehicle, written as conditions.", say: "Write a 10 PM to 7 AM ban on north-side trailer moves into the approval." },
      { id: "sleep-3", who: "Planning Board", text: "Independent nighttime noise monitoring at the north property line and at Brightview, with the data published.", say: "Require independent nighttime noise monitoring, with the data published." },
      { id: "sleep-4", who: "Town Board", text: "An engineered sound wall designed to deliver 10 dB at the nearest homes — not a fence — stamped before approval.", say: "Require an engineered sound wall, stamped before approval, not a fence." },
      { id: "sleep-5", who: "Town Board", text: "Electric standby for every refrigerated trailer parked on site.", say: "Require electric standby for every refrigerated trailer." },
      { id: "sleep-6", who: "Town Board", text: "A published complaint line with meter readings posted within 48 hours.", say: "Require a complaint line with meter readings posted within 48 hours." },
      { id: "sleep-7", who: "Planning Board", text: "Full-cutoff fixtures, 3000 K or warmer, everywhere on the site, with a photometric plan showing 0.1 foot-candles or less at the north property line.", say: "Require full-cutoff, warm lighting and a photometric plan at the north line." },
      { id: "sleep-8", who: "Planning Board", text: "Post-midnight dimming on yard and parking lighting, and the 240-foot buffer kept as a dark zone with no fixtures.", say: "Require post-midnight dimming and a dark 240-foot buffer." }
    ] },
    home: { title: "Your home's value", icon: "home", headline: "Before any vote, in writing", items: [
      { id: "home-1", who: "Town Board", text: "The Town's own estimate of the effect on assessed values within a mile, and who makes up the difference in the Sachem and Connetquot levies.", say: "What is the Town's estimate of the hit to assessed values within a mile, and who makes up the school levy?" },
      { id: "home-2", who: "Islip IDA", text: "The Islip IDA's proposed tax-break schedule by year and by taxing body, before any vote.", say: "Publish the IDA tax-break schedule, by year and by taxing body, before any vote." },
      { id: "home-3", who: "Town Board", text: "A written answer to the appraisal profession's term for this: external obsolescence.", say: "Answer in writing how the Town will handle external obsolescence claims from nearby homeowners." }
    ] },
    roads: { title: "Your roads", icon: "truck", headline: "Before any vote, in writing", items: [
      { id: "roads-1", who: "Town Board", text: "A binding condition that every off-site road improvement is built and paid for by the applicant before a certificate of occupancy.", say: "Make every road fix a binding condition, built and paid for by Amazon before the doors open." },
      { id: "roads-2", who: "County Legislature", text: "Suffolk DPW's pavement rating, last resurfacing cost and cost per lane-mile for Nicolls Road, and who pays for the next one.", say: "Get Suffolk DPW's repaving bill for Nicolls Road on the record, and say who pays it." },
      { id: "roads-3", who: "Town Board", text: "Truck routing written into the approval — Nicolls Road and Route 454 only — with a complaint line and fines.", say: "Write truck routing into the approval: Nicolls Road and Route 454 only, with fines." },
      { id: "roads-4", who: "Town Board", text: "An idling condition stricter than the State's, with the loading-dock exemption closed.", say: "Require an idling limit stricter than the State's, with no loading-dock exemption." },
      { id: "roads-5", who: "Planning Board", text: "A capacity analysis of the Church Street gateway and the Route 454 turns for 5:30 to 6:30 PM, the hour the applicant's own Table A1 shows its traffic at maximum.", say: "Test the intersections at 5:30 to 6:30, when your own table shows your traffic peaks." },
      { id: "roads-6", who: "Town Board", text: "A pavement-impact analysis in axle loads, not trip counts, comparing this project with the Islip Pines approval it is measured against.", say: "Compare this project to Islip Pines by weight, not by trip count." },
      { id: "roads-7", who: "Suffolk County DPW", text: "The built pavement cross-section of Nicolls Road at the site \u2014 asphalt and base thickness \u2014 and its current daily truck count, so the added traffic can be judged against what the road was actually designed to carry.", say: "Publish what Nicolls Road is actually built of, and how many trucks it carries now." }
    ] },
    water: { title: "Your water", icon: "droplet", headline: "Before any vote, in writing", items: [
      { id: "water-1", who: "Town Board", text: "A hydrogeologic study, with boring logs behind the \"19 feet\" and a measured water table, before any vote.", say: "Require a hydrogeologic study with real boring logs before any vote." },
      { id: "water-2", who: "Planning Board", text: "The drywell count, depth and pretreatment design, and the deicing plan for 44 acres of pavement.", say: "Put the drywell design and the deicing plan for 44 acres of pavement on the record." },
      { id: "water-3", who: "SCWA", text: "Which SCWA well will serve the site, and SCWA's written position on infiltrating truck-court runoff upgradient of its wells.", say: "Get the Water Authority's written position on truck-court runoff upgradient of its wells." },
      { id: "water-4", who: "Town of Islip (FOIL)", text: "The groundwater and hydrogeology chapters of the 2013 Islip Pines environmental impact statement, which analysed recharge on this same parcel — so a new study starts from what was already measured here.", say: "Release the groundwater analysis already done for this parcel in 2013." }
    ] },
    ems: { title: "Ambulance and fire", icon: "heart", headline: "Before any vote, in writing", items: [
      { id: "ems-1", who: "Town Board", text: "An emergency-services impact analysis: projected ambulance and fire calls, and who pays for them.", say: "Require an emergency-services impact analysis: how many calls, and who pays." },
      { id: "ems-2", who: "Holbrook Fire District", text: "Written review by the Holbrook Fire District and Suffolk FRES of apparatus access, aerial reach and EV-charging fire protection.", say: "Get the Fire District's written review of access, aerial reach and EV-charging fire risk." },
      { id: "ems-3", who: "SCWA", text: "A fire-flow analysis and hydrant flow tests from the Suffolk County Water Authority for this site.", say: "Require hydrant flow tests and a fire-flow analysis for this site." }
    ] },
    power: { title: "Power", icon: "bolt", headline: "Before any vote, in writing", items: [
      { id: "power-1", who: "PSEG Long Island", text: "PSEG Long Island's will-serve letter or system-impact study for 12.1 MW, naming the substation and feeders.", say: "Put PSEG's will-serve letter for 12.1 megawatts on the record, naming the substation." },
      { id: "power-2", who: "Town Board", text: "The cost of any substation or feeder upgrade and the share recovered from the applicant versus the rate base.", say: "Say who pays for the substation upgrade: Amazon, or every ratepayer." },
      { id: "power-3", who: "Planning Board", text: "Generator fuel type, capacity and expected run hours.", say: "Disclose the backup generators: fuel, size and hours they will run." }
    ] },
    schools: { title: "Schools and the tax break", icon: "users", headline: "Before any vote, in writing", items: [
      { id: "schools-1", who: "Islip IDA", text: "The IDA application, uniform tax exemption policy, and the proposed PILOT schedule by year and by taxing body (Sachem, county, town, fire district).", say: "Publish the PILOT schedule by year and taxing body, including Sachem schools, before any vote." },
      { id: "schools-2", who: "Islip IDA", text: "The IDA's cost-benefit analysis and job commitments with clawback terms.", say: "Require job commitments with clawbacks and a public cost-benefit analysis." },
      { id: "schools-3", who: "Town Board", text: "Confirmation the parcel lies in the Sachem district for tax purposes.", say: "Confirm in writing which school district collects on this parcel." }
    ] },
    drones: { title: "Drones", icon: "wind", headline: "Before any vote, in writing", items: [
      { id: "drones-1", who: "Town Board", text: "Whether drone operations are contemplated for the same-day area, and any FAA Part 135 filings for this site.", say: "Ask whether drone delivery is planned here, and for any FAA filings." }
    ] },
    heat: { title: "Heat", icon: "sun", headline: "Before any vote, in writing", items: [
      { id: "heat-1", who: "Planning Board", text: "The photometric and thermal assumptions behind the \"high-reflectance\" claims, in numbers.", say: "Put the numbers behind the \"high-reflectance roof\" claim on the record." }
    ] }
  }
};
