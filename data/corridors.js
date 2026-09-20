// Trip distribution from the Stonefield Traffic Impact Study (June 30, 2026), Table 3, based on operator-supplied employee/driver origin data.
// Shares are of all site-generated vehicle trips. Trucks are routed separately: the TIS states site trucks "would access the gateway
// driveway along NYS Route 454 via Nicolls Road" — i.e. all 555 (avg) / 809 (peak) daily truck trips use Nicolls Road and Route 454.
window.SPS = window.SPS || {};
SPS.corridors = [
  { id: 'nicolls', photo: 'nicolls-rd', corridor: 'Nicolls Road (CR 97) — southbound approach', share: 29, hamlets: ['Coram', 'Holbrook', 'Selden', 'Centereach', 'Port Jefferson Station', 'Holtsville', 'Stony Brook', 'Lake Grove', 'Farmingville'], trucks: true },
  { id: 'sunrise-wb', photo: 'sunrise-hwy', corridor: 'Sunrise Highway (NY-27) — westbound from the east', share: 26, hamlets: ['Patchogue', 'North Patchogue', 'East Patchogue', 'Medford', 'Shirley', 'Bellport', 'Mastic', 'Middle Island', 'Blue Point', 'Bayport'], trucks: false },
  { id: 'sunrise-eb', photo: 'sunrise-hwy', corridor: 'Sunrise Highway (NY-27) — eastbound from the west', share: 24, hamlets: ['Bay Shore', 'Brightwaters', 'Islip', 'East Islip', 'Great River', 'Islip Terrace', 'Oakdale', 'Lindenhurst', 'West Babylon', 'Babylon', 'Deer Park'], trucks: false },
  { id: 'rte454', photo: 'vets-hwy', corridor: 'Veterans Memorial Highway (NY-454) — eastbound, LIE interchange', share: 14, hamlets: ['Brentwood', 'Ronkonkoma', 'Lake Ronkonkoma', 'Central Islip', 'Hauppauge', 'Huntington Station', 'Smithtown', 'Nesconset', 'Commack'], trucks: true },
  { id: 'broadway-sb', photo: 'earth-site-costco', corridor: 'Broadway Avenue — southbound (local)', share: 3, hamlets: ['Holbrook'], trucks: false },
  { id: 'broadway-nb', photo: 'sayville', corridor: 'Broadway Avenue — northbound from Sayville', share: 2, hamlets: ['Sayville', 'West Sayville'], trucks: false },
  { id: 'church', photo: 'bohemia', corridor: 'Church Street — eastbound from Bohemia', share: 2, hamlets: ['Bohemia'], trucks: false },
];
SPS.corridorsSource = 'Stonefield Traffic Impact Study, June 30 2026, Table 3 (trip distribution) and p. 29 (truck routing via Nicolls Road / NYS Route 454).';
