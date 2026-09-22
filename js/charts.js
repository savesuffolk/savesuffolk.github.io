/* charts.js — Chart.js wrappers for the Project and Issues sections. */
(function () {
  window.SPS = window.SPS || {};
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const PALETTE = { green: '#2f7d5a', greenLight: '#8fc7a6', blue: '#3b7ea1', red: '#c25a3f', yellow: '#f3cf73', gray: '#9aa69f' };

  function baseDefaults() {
    if (!window.Chart) return;
    Chart.defaults.color = css('--fg') || '#222';
    Chart.defaults.borderColor = css('--border') || '#ddd';
    Chart.defaults.font.family = css('--font') || 'sans-serif';
    Chart.defaults.plugins.legend.labels.boxWidth = 14;
    Chart.defaults.font.size = 15;
    Chart.defaults.plugins.tooltip.bodyFont = { size: 15 };
    Chart.defaults.plugins.tooltip.titleFont = { size: 15, weight: '700' };
    Chart.defaults.plugins.tooltip.padding = 10;
  }

  function scaleChart() {
    const el = document.getElementById('chart-scale'); if (!el || !SPS.scaleComparisons) return;
    const rows = [...SPS.scaleComparisons].sort((a, b) => b.sqft - a.sqft);
    new Chart(el, {
      type: 'bar',
      data: { labels: rows.map(r => r.name), datasets: [{ label: 'Floor area (sq ft)', data: rows.map(r => r.sqft), backgroundColor: rows.map(r => /sunrise/i.test(r.name) ? PALETTE.red : PALETTE.green) }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.raw.toLocaleString() + ' sq ft' } } },
        scales: { x: { ticks: { callback: v => (v / 1e6).toFixed(1) + 'M' } } }, maintainAspectRatio: false }
    });
  }

  function crashChart() {
    const el = document.getElementById('chart-crash'); if (!el || !SPS.crashRates) return;
    new Chart(el, {
      type: 'bar',
      data: { labels: SPS.crashRates.map(r => r.intersection), datasets: [
        { label: 'Study intersection rate', data: SPS.crashRates.map(r => r.rate), backgroundColor: PALETTE.red },
        { label: 'NYSDOT statewide average', data: SPS.crashRates.map(r => r.nysdotAvg), backgroundColor: PALETTE.gray }] },
      options: { indexAxis: 'y', maintainAspectRatio: false, plugins: { tooltip: { callbacks: { afterLabel: c => c.datasetIndex === 0 ? SPS.crashRates[c.dataIndex].crashes + ' crashes in 36 months' : '' } } } }
    });
  }

  function tripChart() {
    const el = document.getElementById('chart-trips'); if (!el || !SPS.trips) return;
    const t = SPS.trips;
    new Chart(el, {
      type: 'bar',
      data: { labels: ['Average weekday', 'Seasonal peak day'], datasets: [
        { label: 'Employee cars', data: [t.avg.cars, t.peak.cars], backgroundColor: PALETTE.green },
        { label: 'Flex delivery cars', data: [t.avg.flex, t.peak.flex], backgroundColor: PALETTE.blue },
        { label: 'Trucks', data: [t.avg.trucks, t.peak.trucks], backgroundColor: PALETTE.red }] },
      options: { maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } },
        plugins: { tooltip: { callbacks: { footer: items => 'Total: ' + items.reduce((s, i) => s + i.raw, 0).toLocaleString() + ' vehicle trips/day' } } } }
    });
  }

  function landChart() {
    const el = document.getElementById('chart-land'); if (!el || !SPS.landCover) return;
    const b = SPS.landCover.before, a = SPS.landCover.after;
    const keys = ['forest', 'impervious', 'landscape', 'recharge', 'meadow'];
    const labels = { forest: 'Forest', impervious: 'Impervious (roof/pavement)', landscape: 'Landscaping', recharge: 'Existing recharge basin', meadow: 'Meadow' };
    const colors = { forest: PALETTE.green, impervious: '#555', landscape: PALETTE.greenLight, recharge: PALETTE.blue, meadow: PALETTE.yellow };
    new Chart(el, {
      type: 'bar',
      data: { labels: ['Today', 'After Project Sunrise'], datasets: keys.map(k => ({ label: labels[k], data: [b[k] || 0, a[k] || 0], backgroundColor: colors[k] })) },
      options: { maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, title: { display: true, text: 'acres' } } } }
    });
  }

  SPS.charts = { init() { if (!window.Chart) { console.warn('Chart.js not loaded'); return; } baseDefaults(); scaleChart(); crashChart(); tripChart(); landChart(); }, PALETTE };
})();
