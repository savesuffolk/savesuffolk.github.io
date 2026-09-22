// Stop Project Sunrise — how this application is being reviewed, against how the same land was reviewed in 2013.
// Primary source for the 2013 column: Suffolk County Planning Commission staff report, file IS-13-04, July 3 2013,
// which records the Town's own referral data for Islip Pines. Current-column figures are from the applicant's own
// filing (Full EAF and site plan) and the Town Planning Department's July 24 2026 email.
window.SPS = window.SPS || {};
SPS.review = {
  lead: "The same 143 acres were reviewed twelve years ago, for a smaller project. The Town required a full environmental impact statement then. This time a short assessment form was filed instead, and the Town's own planner says it does not describe the project accurately.",
  steps: [
    {
      n: "1", title: "In 2013 the Town required a full environmental impact statement",
      body: "When Serota asked to rezone this land for Islip Pines, the Town declared the project significant, adopted a scope, and made the developer produce a Draft Environmental Impact Statement. The Planning Department sent the first draft back for more data on traffic, groundwater and the comprehensive plan. Suffolk County's referral file for the rezoning records the review type in one word: DEIS.",
      cite: "scpc"
    },
    {
      n: "2", title: "This time the applicant filed an assessment form, and the Town says it is wrong",
      body: "Project Sunrise was submitted with an Environmental Assessment Form rather than an impact statement. On July 24 2026 the Town's principal planner wrote that the form states no amendment of an ordinance is required, when the applicant's own stated intentions require one, and that the Zoning Board of Appeals is not listed as an involved agency although variances would be needed. His conclusion: the form \"needs to be modified to accurately characterize the proposed action.\" He also recorded that the height and floor-area departures being sought are \"variances of significant magnitude.\"",
      cite: "colgan"
    },
    {
      n: "3", title: "And this project is larger than the zoning written for this site allows",
      body: "The mixed-use district created for Islip Pines in 2014 is the zoning on the land today. It caps floor area at 2,968,614 square feet and a floor area ratio of 0.5, with buildings of 50 to 60 feet. Project Sunrise proposes 4,264,725 square feet at a ratio of 0.713, rising to 0.741 and 4,430,709 square feet counting the garage. That is roughly 1.3 million square feet more than the site's current zoning permits, before any rezoning to Industrial 1, where the limit is 0.35.",
      cite: "compare"
    }
  ],
  // The comparison the two documents support, side by side.
  compare: {
    rows: [
      { what: "Environmental review", then: "Draft Environmental Impact Statement required", now: "Environmental Assessment Form only; Town says it mischaracterises the action" },
      { what: "Maximum floor area", then: "2,968,614 sq ft", now: "4,264,725 sq ft proposed (4,430,709 with the garage)" },
      { what: "Floor area ratio", then: "0.5 cap", now: "0.713 proposed (0.741 with the garage)" },
      { what: "Building height", then: "50 to 60 ft", now: "60 ft, with a tallest element of 78 ft 10 in" },
      { what: "Operating hours", then: "Shops, offices, homes and a hotel", now: "Trucks arriving and leaving 24 hours a day" }
    ],
    note: "The 2013 column is the district the Town actually adopted for this land and which still governs it. The 2026 column is the applicant's own filing."
  },
  sources: {
    scpc: { title: "Suffolk County Planning Commission, staff report IS-13-04, July 3 2013 meeting packet", url: "https://suffolkcountyny.gov/portals/0/formsdocs/planning/SCPlanningCommission/2013/ScPCjuly2013.pdf",
      note: "The County's referral file for the Islip Pines rezoning. Records \"SEQRA Type: DEIS\", a tract of 143.23 acres, Groundwater Management Zone I, a floor-area-ratio cap of 0.5, a maximum permitted 2,968,614 sq ft, heights of 50 to 60 ft, and an earlier Commission review of the same land in 1998.", status: "verified" },
    colgan: { title: "Email, Sean Colgan, Principal Planner, Town of Islip, to the applicant's attorney, July 24 2026", url: "docs/Town-Email-Correspondence-Jul-Aug-2026.pdf",
      note: "Records that the submitted form does not accurately characterise the action, that the Zoning Board of Appeals is missing as an involved agency, and that the departures sought are variances of significant magnitude.", status: "verified" },
    compare: { title: "Full Environmental Assessment Form and site plan (July 15 2026), against the 2013 County referral file", url: "docs/Full-EAF-2026-07-15.pdf",
      note: "Floor area, floor area ratio and height for the current proposal come from the applicant's own filing and its zoning chart, which marks the floor-area and parking rows \"Complies: N\".", status: "verified" }
  },
  // Correction note kept with the data so it stays honest if anyone edits the text above.
  caveat: "One difference is real and worth stating: Islip Pines was a rezoning to a new mixed-use district, and this is a rezoning to Industrial 1 or to another new district. Both are legislative actions by the same Town Board on the same land. What changed is not the kind of decision, it is the depth of the review being asked for."
};
