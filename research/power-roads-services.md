# Electricity, roads, emergency services, schools, and other categories — research (2026-09-20)

WebSearch budget was exhausted; this pass used ~70 direct fetches (Wikipedia, agency PDFs). VERIFIED = page fetched and number read. Blocked: nytimes, vox, guardian, latimes, sbsun, reveal, cnbc, osha.gov, iccsafe, aboutamazon EV/Flex pages. Extracted PDF text saved in the session scratchpad (NYISO Power Trends 2026, 2025 Gold Book, GAO 1979, EIA CBECS C14, EIA Table 5A, OSC IDA 2026, LIPA Tariff 9/2026, Senate HELP Amazon report, Sachem 2026-27 budget, Suffolk road list).

## A. Electricity
- 12.1 MW peak (EAF) ≈ average draw of ~15,500 NY homes (EIA Table 5.A 2024: NY 571 kWh/mo → 0.78 kW). Say "average draw of," not "powers." https://www.eia.gov/electricity/sales_revenue_price/pdf/table_5A.pdf VERIFIED
- CBECS 2018 Table C14 warehouses: mean 5.8 kWh/sq ft/yr, median 3.4; 12.1 MW at 50% load factor ≈ 53 GWh/yr, 2–4× a normal warehouse. https://www.eia.gov/consumption/commercial/data/2018/ce/pdf/c14.pdf VERIFIED
- NYISO Power Trends 2026: Long Island reliability margins "deficient beginning in summer 2027"; transmission security concerns "summer 2027 on Long Island"; 51 large-load projects / 12,670 MW in queue statewide. https://www.nyiso.com/documents/d/guest/2026-power-trends VERIFIED
- NYISO 2025 Gold Book Table I-4a: Zone K peak 4,935 MW (2024), 5,079 (2025 fcst), 5,230 (2030); 12.1 MW ≈ 0.24% of island peak — small island-wide, large for local feeders. VERIFIED
- LIPA Tariff (Sept 2026) §II.D: nonresidential applicants pay for facilities exceeding the allowance; service ≥23 kV needs an Interconnection Agreement; allowance dollars and any substation cost split UNVERIFIED → FOIL/PSEG question. https://www.lipower.org/wp-content/uploads/2026/09/LIPA-Tariff-September-2026-linked.pdf VERIFIED (text)
- Rivian EDV 11 kW AC charging; 120 same-day stalls × 11 kW ≈ 1.3 MW. Wikipedia VERIFIED; Amazon charger kW UNVERIFIED.
- No NY warehouse-delayed-by-power case found.

## B. Roads / who pays
- **Do not lead with the 9,600 figure.** FHWA "stopped using unmodified AASHO-Road-Test-based Equivalent Single Axle Loads (ESALs) in 1979, after the Congressional Budget Office (CBO) strongly criticized their continued use" — FHWA Pavement Comparative Analysis Desk Scan, Nov 2013, p.1. https://ops.fhwa.dot.gov/freight/sw/map21tswstudy/deskscan/pavement_dksn.pdf VERIFIED
- HEADLINE: CBO 2020 — combination truck 8.4 cents/mile of federal highway cost vs 0.8 cents for a passenger vehicle (up to 20.3 cents heaviest). https://www.cbo.gov/publication/56373 VERIFIED (cbo.gov 403s to curl; opens in a browser)
- FHWA/USDOT Comprehensive Truck Size & Weight Limits Study, Pavement Comparative Analysis (2015) p.ES-7: removing overweight axles raised flexible pavement initial service intervals "between and 19 percent and 34 percent" (typo in original). https://ops.fhwa.dot.gov/freight/sw/map21tswstudy/technical_rpts/pcanalysis.pdf VERIFIED. CAUTION: the same study's Tables 2-3 show heavier 6-axle trucks REDUCING pavement life-cycle cost — it is axle weight, not gross weight.
- MnDOT/LRRB MN/RC 2014-32 (2014), heavy vehicles on local roads never designed for them, names "new industrial facilities"; carries an R3 Consulting/Fort Collins table putting a long-haul semi at 1,408 passenger-car equivalents; MnDOT's own rule of thumb is 1 garbage truck = 1,000 car trips. https://mdl.mndot.gov/_flysystem/fedora/2023-01/201432.pdf VERIFIED
- FHWA 2000 vol 3 ch V p.V-4, the fair restatement: "doubling axle load may increase pavement deterioration by a factor of eight rather than 16, but still a very significant difference." https://www.fhwa.dot.gov/reports/tswstudy/vol3-chapter5.pdf VERIFIED
- FHWA CTSW Pavement Comparative Analysis (June 2015, 132 pp) — VERIFIED PAGE BY PAGE against the downloaded PDF, prompted by a claim set Mike was sent:
  - ES-7 verbatim: "The more significant impacts are predicted to occur on lower volume facilities, specifically on low-volume other NHS arterials, which are typically constructed with thinner cross-sections. The estimated impacts of the scenarios are relatively minor for those thicker pavement sections that were built to handle higher truck volumes." CONFIRMED
  - Ch.4 verbatim: "local roads are, overall, built to lower design standards than roadways on the higher functionally classified roadway networks." CONFIRMED
  - Table 6 (flexible), Location #1 = OHIO: low-volume arterial 2+2+2 = 6.0 in AC over 8.0 in base; high-volume Interstate 2+4+6 = 12.0 in AC over 12.0 in base. CONFIRMED. Table 7 (rigid): 8.0 in PCC / 1.25 in dowels vs 12.0 in PCC / 1.5 in dowels. CONFIRMED.
  - Locations are #1 Ohio, #2 Mississippi, #3 Utah, #4 Arizona. Ohio is the wet-freeze analogue for Long Island — use Ohio numbers.
  - SCOPE CORRECTION: the 19-34% service-interval gain is §5.1, measured only on "the medium-volume traffic sections on the Interstate system". Site text now says so.
  - Appendix L, Location #4 (ARIZONA) rigid: HV and MV Interstate never failed in 50 years; LV arterial failed transverse cracking at 19.686 yr, and Scenario 4 cut that by 1.956 yr (-9.9%). CONFIRMED — but DO NOT USE: in Location #1 (Ohio) the low-volume arterial outperformed the Interstates at baseline (782 ADTT vs 11,338), so the Arizona section is not the general pattern and citing it would be cherry-picking.
  - Scenario 4 = tractor plus twin 33-ft trailers, 5 axles, 80,000 lb — same legal weight as the control, and ADTT falls slightly under it.
- FHWA CTSW Pavement Comparative Analysis, Appendix A §1.6 — the principle, stated without ESALs: "Average axle loads, after all, are not as important as the distribution of axle loads at the higher ends of the axle load range, given the non-linearity of pavement damage as a function of axle load." https://ops.fhwa.dot.gov/freight/sw/map21tswstudy/technical_rpts/pcanalysis/appendix_a.htm VERIFIED (quoted verbatim)
- Ontario MTO marginal-cost analysis via FHWA Desk Scan p.6: a truck mile costs C$0.004/km ($0.006/mi) on a freeway vs C$0.46/km ($0.72/mi) on a local road, ~115x. Hajek, Tighe & Hutchinson, TRR 1613. USE ONLY WITH THE CAVEAT: FHWA says the gap is that wide because Ontario used marginal rather than average ESAL cost, and adds "We do not suggest reviving the incremental design approach ... and cannot use the ESAL assumption." Site carries it inside the caveat fold with that reservation attached. https://ops.fhwa.dot.gov/freight/sw/map21tswstudy/deskscan/pavement_dksn.pdf VERIFIED
- The industry rebuttal, engage with it: ATA hosts FPInnovations (2018), which accepts the ESAL arithmetic but puts flexible pavement at 285:1 and rigid at 10,643:1. https://www.trucking.org/sites/default/files/2022-01/Analysis%20of%20car%20and%20truck%20pavement%20impacts-FINAL.pdf VERIFIED. Even their own lowest number is 285 cars per truck.
- GAO CED-79-94 (1979) p.23: 9,600 automobiles of INTERSTATE pavement impact, from AASHTO data not GAO engineering. https://www.gao.gov/assets/ced-79-94.pdf VERIFIED — now presented on the site only inside a caveat fold.
- FHWA HCAS Addendum 2000: 80–100k-lb combinations pay 0.5 of their cost share; common combinations pay 80%. https://www.fhwa.dot.gov/policy/hcas/addendum.cfm VERIFIED
- Nicolls Road = Suffolk CR 97, county-maintained, 14.29 mi. Suffolk DPW road list VERIFIED. Cost per lane-mile: NOT FOUND → FOIL.
- NY Highway Law §52: commissioner may require a bond/sum for work permits; permittee maintains what it builds. NYSDOT PERM 33-COM; GML §239-f county referral. No "fair share" for off-site wear found. VERIFIED
- Inland Empire / Robbinsville / Lehigh road-damage examples: NOT VERIFIED (news blocked). Do not cite.

## C. Emergency services
- U.S. Senate HELP majority staff report, Dec 15 2024: Amazon 6.54 injuries/100 (2023) vs 4.8 all warehouses, 5.4 large; nearly twice non-Amazon warehouses each of last seven years; >2/3 of Amazon warehouses above industry average. https://www.help.senate.gov/imo/media/doc/amazon_investigation.pdf VERIFIED. Derived: 1,500–3,000 workers × 6.54/100 ≈ 100–200 recordable injuries/yr.
- SOC "Failure to Deliver" (May 2025): 2024 injury rate 80% above Amazon's own 2025 target; serious-injury rate nearly double non-Amazon. SOC "Same-Day Injury" (2024): injuries up to 59% higher during peak. VERIFIED (summary pages).
- Daily Beast 2019: 189 mental-health 911 calls from 46 Amazon warehouses in five years. VERIFIED. All-cause ambulance counts at specific FCs: UNVERIFIED → FOIL.
- Holbrook Volunteer FD 2025: 624 fire + 2,889 EMS = 3,513 calls; two new engines. https://www.holbrookfd.org/ VERIFIED. Aerial apparatus: unknown.
- Redlands CA, June 6 2020: 600,000 sq ft Amazon-chain warehouse, ESFR sprinklers, roof collapse in 20–25 min, city mains fell to 40 psi / yard hydrants 30 psi, loss >$200M. Fire Engineering VERIFIED.
- Edwardsville IL, Dec 10 2021: 594,000 sq ft Amazon delivery station collapse, 6 dead. Wikipedia VERIFIED.
- NYS Fire Code ch. 32 Table 3206.2: top bracket is ">500,000 sq ft"; this building is 8× that. UpCodes VERIFIED.
- 6 NYCRR 217-3: 5-minute heavy-truck idling limit; loading/unloading and cargo temperature control exempt. Cornell LII VERIFIED.

## D. Schools & taxes
- NYS Comptroller IDA report (May 2026, FY2024): $2.06B total exemptions; school-district property tax exempted $717M (34.8%); job data self-reported, "not independently verified." https://www.osc.ny.gov/files/local-government/publications/pdf/ida-performance-report-2026.pdf VERIFIED
- Sachem CSD 2026-27: levy $216.5M = 56.83% of revenue; PILOTs inside a 2.84% "other" bucket; enrollment 11,749. VERIFIED. Confirm parcel's district (Sachem per EAF).
- Islip IDA offers property-tax abatement, sales-tax and mortgage-tax exemptions, bonds. VERIFIED. UTEP/PILOT schedule: FOIL.
- Turnover 150%/yr (NYT 2021): UNVERIFIED. Senate report: policies designed "to create attrition when peak periods conclude." VERIFIED.

## E. Other
- Heat island (EPA): 1–7°F day, 2–5°F night; roofs up to 66°F hotter. VERIFIED. Severity: not much.
- Stormwater: NOAA Atlas 14 at site 100-yr 24-h = 6.20 in → ~14.1M gal on 84 ac; EAF designs for 8 in. Off-site flooding: not much on paper; issue stays the aquifer. VERIFIED.
- Drones: Amazon MK30 launches "from facilities next to our Same-Day Delivery site"; expanding to "nearly 500 US cities and towns this year." aboutamazon VERIFIED. Noise dB: UNVERIFIED — don't publish.
- Refrigeration: unknown; ask. Flex drivers: 4,888 personal-car trips/day (TIS); gig drivers in unmarked cars (Wikipedia Amazon Flex VERIFIED); no impact reporting found.

## Ranked new cards
1. Ambulance/EMS (serious) — 6.54/100 vs 2,889 volunteer EMS calls. 2. Road bill (serious) — 1 truck = 9,600 cars, county road. 3. School money (likely) — $717M statewide; Sachem 57% property tax. 4. Power (likely) — draw of ~15,000 homes; LI deficient summer 2027; who pays. 5. Fire (likely) — Redlands 40 psi. 6. Drones (likely, unquantified). 7. Heat (not much). 8. Stormwater (not much; fold into water). 9. Idling loophole (fold into trucks).

## FOIL / questions
Town/Planning/Fire Marshal: PSEG will-serve or system-impact study for 12.1 MW; substation/feeder cost responsibility; fire-flow analysis and SCWA hydrant flow tests; sprinkler design basis, commodity class, storage height; FD/FRES review of apparatus access and aerial reach; EMS impact analysis or host-community agreement; NYSDOT PERM 33-COM and Suffolk GML §239-f file; off-site improvement funding conditions; idling/routing/hours conditions; refrigeration; drone plans.
Islip IDA: application, UTEP, PILOT schedule by jurisdiction, cost-benefit, job clawbacks, GML 18-A notices to the school district.
Suffolk DPW: CR 97 pavement rating, last resurfacing cost, cost per lane-mile, capital entries, highway work permit file.
PSEG LI/LIPA: required upgrades, cost, share to rate base.
Holbrook Fire District: apparatus inventory, mutual aid, EMS response times, project review.
