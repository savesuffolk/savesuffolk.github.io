/* site3d.js — one continuous 3D story for the Project page.
   Act 1 (scale): a Holbrook house, then each comparison building, drawn to scale in feet, camera pulling back each step.
   Act 2 (forest): the camera swings to the 138-acre wooded site (2,400 × 2,500 ft, ~14,000 instanced trees).
   Act 3 (clearing): trees topple west → east across the 101.6 disturbed acres (EAF) and the buildings rise to their
   filed heights — south building 60 ft, north 50 ft, garage 14 ft — with a house and a truck standing beside them for
   vertical scale. Counters use the EAF acreages. Requires THREE (r128 UMD). Renders into #site3d. */
(function () {
  window.SPS = window.SPS || {};
  const $ = (s, el) => (el || document).querySelector(s);

  // ---- data ----
  const COMPARE = [
    { name: 'A Holbrook home', short: 'Home', sqft: 2000, sub: '≈ 2,000 sq ft, 24 ft to the ridge', w: 44, d: 46, h: 24, color: 0xd8cbb2 },
    { name: 'A football field', short: 'Football field', sqft: 57600, sub: '57,600 sq ft incl. end zones', w: 360, d: 160, h: 1, color: 0x8fc7a6 },
    { name: 'Costco Holbrook', short: 'Costco', sqft: 148000, sub: '≈ 148,000 sq ft · 32 ft', w: 400, d: 370, h: 32, color: 0x7fa08f },
    { name: 'Shops at SunVet', short: 'SunVet', sqft: 168000, sub: '168,000 sq ft · 28 ft', w: 600, d: 280, h: 28, color: 0x7fa08f },
    { name: 'Amazon JFK8, Staten Island', short: 'Amazon JFK8', sqft: 855000, sub: '855,000 sq ft · 4 floors · 70 ft', w: 620, d: 345, h: 70, color: 0x6f8f7f },
    { name: 'Smith Haven Mall', sqft: 1340000, sub: '≈ 1.34 million sq ft · 40 ft', w: 1000, d: 670, h: 40, color: 0x6f8f7f },
    { name: 'Roosevelt Field', sqft: 2250000, sub: '≈ 2.25 million sq ft · 45 ft', w: 1200, d: 750, h: 45, color: 0x6f8f7f },
  ];
  const SITE = { w: 2400, d: 2500 };
  const ACRES = { forestBefore: 136.77, forestAfter: 36.90, disturbed: 101.6, impervious: 83.8 };
  const STEMS_PER_ACRE = 350, RENDER_N = 14000, TREES_EST = Math.round(ACRES.forestBefore * STEMS_PER_ACRE);
  const RECHARGE_GAL_PER_AC = 23 / 12 * 43560 * 7.48;
  const BUILDINGS = [
    { w: 1960, d: 640, h: 60, x: -120, z: 250, color: 0xc25a3f, label: 'South building · 3,484,260 sq ft' },
    { w: 850, d: 500, h: 50, x: -600, z: -420, color: 0xd1704f, label: 'North building · 725,000 sq ft' },
    { w: 500, d: 330, h: 14, x: 350, z: -420, color: 0xc9c4b8, label: 'Garage · 165,984 sq ft' },
  ];
  const SITE_ORIGIN = { x: 0, z: -(2500 / 2 + 900) };   // site block sits just north of the comparison row; row becomes a scale bar along its south edge
  const keeps = (x, z) => z < -SITE.d / 2 + 240 || x > SITE.w / 2 - 340 || x < -SITE.w / 2 + 140;   // EAF: 240-ft north buffer + east/west strips; the south face is the trailer court on Sunrise Hwy

  // timeline: steps 0..COMPARE.length-1 = scale; then 'forest', 'clear', 'done'
  const STEPS = COMPARE.map((c, i) => ({ kind: 'scale', i })).concat([{ kind: 'forest' }, { kind: 'clear' }, { kind: 'done' }]);

  const FRAMES = [
    ['s0', 'A Holbrook home — about 2,000 sq ft'], ['s1', 'A football field — 57,600 sq ft'], ['s2', 'Costco Holbrook — about 148,000 sq ft'], ['s3', 'Shops at SunVet — 168,000 sq ft'],
    ['s4', 'Amazon JFK8, Staten Island — 855,000 sq ft'], ['s5', 'Smith Haven Mall — about 1.34 million sq ft'], ['s6', 'Roosevelt Field — about 2.25 million sq ft'],
    ['s7', 'The site today — 138 acres of pine–oak woodland'], ['c0.12', 'Clearing begins on the west side'], ['c0.3', '101.6 acres to be disturbed'], ['c0.5', 'The buildings start to rise'],
    ['c0.7', '4.26 million sq ft'], ['c0.9', '83.8 acres paved or roofed'], ['s9', 'Everything to scale — the site next to everything it was compared with'],
  ];
  function slideshow(host, why) {
    host.classList.add('viz3d');
    host.innerHTML = `<div class="viz-stage viz-slides"><img alt=""><div class="viz-label"><div class="n"></div><div class="s">${why || ''}</div></div></div>
      <div class="viz-controls"><button class="btn sm" data-act="play">Pause</button><button class="btn sm secondary" data-act="prev">‹</button><button class="btn sm secondary" data-act="next">›</button><span class="viz-step mono"></span>${window.THREE && webglOK() ? '<button class="btn sm ghost" data-act="to3d" style="margin-left:auto">Show 3D</button>' : ''}</div>`;
    const img = host.querySelector('img'), n = host.querySelector('.n'), stepEl = host.querySelector('.viz-step'); let i = 0, playing = true, t = null;
    function show(k) { i = (k + FRAMES.length) % FRAMES.length; img.src = 'assets/frames/' + FRAMES[i][0] + '.jpg'; n.textContent = FRAMES[i][1]; stepEl.textContent = `${i + 1} / ${FRAMES.length}`; }
    function tick() { clearTimeout(t); if (!playing) return; t = setTimeout(() => { show(i + 1); tick(); }, i >= FRAMES.length - 1 ? 4000 : 2000); }
    host.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; if (b.dataset.act === 'play') { playing = !playing; b.textContent = playing ? 'Pause' : 'Play'; tick(); } if (b.dataset.act === 'prev') { show(i - 1); } if (b.dataset.act === 'next') { show(i + 1); } if (b.dataset.act === 'to3d') { playing = false; clearTimeout(t); try { localStorage.setItem('sps.viz', '3d'); } catch (x) {} const fresh = host.cloneNode(false); fresh.dataset.force3d = '1'; host.replaceWith(fresh); init(fresh); } });
    show(0); tick();
  }
  function webglOK() {
    try { const c = document.createElement('canvas'); const gl = c.getContext('webgl') || c.getContext('experimental-webgl'); return !!gl && !!gl.getParameter(gl.VERSION); } catch (e) { return false; }
  }
  const saveData = navigator.connection && navigator.connection.saveData;
  const lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.deviceMemory && navigator.deviceMemory <= 2);

  function init(host) {
    let pref = ''; try { pref = localStorage.getItem('sps.viz') || ''; } catch (e) {}
    const force3d = host.dataset.force3d === '1' || pref === '3d';
    const hard = !window.THREE || !webglOK();
    const soft = host.dataset.slides === '1' || new URLSearchParams(location.search).has('slides') || saveData || lowPower || pref === 'slides';
    if (hard || (soft && !force3d)) { slideshow(host); return; }
    if (!window.THREE) { host.innerHTML = '<p class="muted small">3D view needs the Three.js library (blocked or offline). The chart carries the same numbers.</p>'; return; }
    const T = THREE;
    host.classList.add('viz3d');
    host.innerHTML = `<div class="viz-stage"><canvas></canvas><div class="viz-label"><div class="n"></div><div class="s"></div><div class="x"></div></div><div class="viz-tags"></div></div>
      <div class="viz-hud below" hidden><div class="k"><span class="v" data-k="acres">0</span><span class="l">acres cleared</span></div><div class="k"><span class="v" data-k="trees">0</span><span class="l">trees down (est.)</span></div><div class="k"><span class="v" data-k="imp">0</span><span class="l">acres paved</span></div><div class="k"><span class="v" data-k="gal">0</span><span class="l">gal/yr recharge lost</span></div><div class="k"><span class="v" data-k="h">0 ft</span><span class="l">tallest building</span></div></div>
      <div class="viz-controls"><button class="btn sm" data-act="play">${SPS.icon ? SPS.icon('chevron') : ''} Play</button><button class="btn sm secondary" data-act="prev">‹</button><button class="btn sm secondary" data-act="next">›</button>
      <input type="range" min="0" max="${STEPS.length - 1}" value="0" step="1" aria-label="Step"><span class="viz-step mono"></span><button class="btn sm ghost" data-act="slides" title="Switch to the image version" style="margin-left:auto">Slideshow</button></div>
`;
    const canvas = $('canvas', host), label = $('.viz-label', host), hudBox = $('.viz-hud', host), slider = $('input[type=range]', host), stepEl = $('.viz-step', host);
    const hud = k => $(`[data-k=${k}]`, host);

    let renderer; try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { slideshow(host); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const scene = new T.Scene(); scene.fog = new T.Fog(0xf3f5ef, 9000, 22000);
    const camera = new T.PerspectiveCamera(42, 16 / 9, 4, 60000);
    scene.add(new T.HemisphereLight(0xffffff, 0xc4cfc2, 0.95));
    const sun = new T.DirectionalLight(0xffffff, 0.8); sun.position.set(-2000, 3000, 1500); scene.add(sun);
    const ground = new T.Mesh(new T.PlaneGeometry(80000, 80000), new T.MeshLambertMaterial({ color: 0xe9ede4 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.6; scene.add(ground);
    const grid = new T.GridHelper(30000, 300, 0xd5dcd3, 0xe3e8e0); scene.add(grid);

    // ---- act 1: comparison row along +x ----
    const edge = (mesh) => { const e = new T.LineSegments(new T.EdgesGeometry(mesh.geometry), new T.LineBasicMaterial({ color: 0x223026, transparent: true, opacity: .35 })); e.position.copy(mesh.position); e.scale.copy(mesh.scale); return e; };
    let cx = 0; const centers = [];
    COMPARE.forEach((o, i) => {
      const half = Math.max(o.w, o.d) / 2; cx += half + (i ? 150 + half * 0.15 : 0);
      const m = new T.Mesh(new T.BoxGeometry(o.w, o.h, o.d), new T.MeshLambertMaterial({ color: o.color })); m.position.set(cx, o.h / 2, 0); scene.add(m); scene.add(edge(m));
      centers.push({ x: cx, size: Math.max(o.w, o.d), mesh: m }); cx += half;
    });
    const rowShift = -cx / 2; centers.forEach(c => { c.x += rowShift; c.mesh.position.x += rowShift; c.home = c.mesh.position.clone(); });
    const rowEdges = scene.children.filter(o => o.isLineSegments); rowEdges.forEach((e, i) => { e.position.x += rowShift; if (centers[i]) centers[i].edge = e; });

    // ---- act 2/3: the site ----
    const site = new T.Group(); site.position.set(SITE_ORIGIN.x, 0, SITE_ORIGIN.z); scene.add(site);
    const floor = new T.Mesh(new T.PlaneGeometry(SITE.w, SITE.d), new T.MeshLambertMaterial({ color: 0x6f8a5a })); floor.rotation.x = -Math.PI / 2; site.add(floor);
    const road = (w, d, x, z) => { const r = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshLambertMaterial({ color: 0xb9b9b4 })); r.rotation.x = -Math.PI / 2; r.position.set(x, 0.5, z); site.add(r); };
    road(9000, 220, 0, SITE.d / 2 + 260); road(220, 9000, -SITE.w / 2 - 260, 0); road(90, 9000, SITE.w / 2 + 120, 0);
    const canopyGeo = new T.ConeGeometry(11, 34, 6); canopyGeo.translate(0, 34 / 2 + 8, 0);
    const trunkGeo = new T.CylinderGeometry(1.6, 2.2, 10, 5); trunkGeo.translate(0, 5, 0);
    const canopy = new T.InstancedMesh(canopyGeo, new T.MeshLambertMaterial({ color: 0x2f6b46 }), RENDER_N);
    const trunk = new T.InstancedMesh(trunkGeo, new T.MeshLambertMaterial({ color: 0x5a4632 }), RENDER_N);
    const rnd = (() => { let s = 12345; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const trees = []; for (let i = 0; i < RENDER_N; i++) { const x = (rnd() - 0.5) * SITE.w, z = (rnd() - 0.5) * SITE.d; trees.push({ x, z, s: 0.75 + rnd() * 0.6, dir: rnd() * Math.PI * 2, keep: keeps(x, z), order: (x + SITE.w / 2) / SITE.w + (rnd() - 0.5) * 0.06 }); }
    const col = new T.Color(); trees.forEach((t, i) => canopy.setColorAt(i, col.setHSL(0.33 + (rnd() - 0.5) * 0.04, 0.42, 0.28 + rnd() * 0.12)));
    const m4 = new T.Matrix4(), q = new T.Quaternion(), sc = new T.Vector3(), pos = new T.Vector3(), eul = new T.Euler();
    function place(i, f) { const t = trees[i]; const fall = Math.min(1, f / 0.7), sink = Math.max(0, (f - 0.7) / 0.3); pos.set(t.x, -sink * 60 * t.s, t.z); eul.set(0, t.dir, fall * Math.PI / 2 * 0.98); q.setFromEuler(eul); sc.set(t.s, t.s, t.s); m4.compose(pos, q, sc); canopy.setMatrixAt(i, m4); trunk.setMatrixAt(i, m4); }
    trees.forEach((t, i) => place(i, 0)); canopy.instanceMatrix.needsUpdate = trunk.instanceMatrix.needsUpdate = true; if (canopy.instanceColor) canopy.instanceColor.needsUpdate = true;
    site.add(canopy); site.add(trunk);
    const bMeshes = BUILDINGS.map(b => { const m = new T.Mesh(new T.BoxGeometry(b.w, b.h, b.d), new T.MeshLambertMaterial({ color: b.color })); m.position.set(b.x, 0, b.z); m.scale.y = 0.001; m.visible = false; site.add(m); const e = new T.LineSegments(new T.EdgesGeometry(m.geometry), new T.LineBasicMaterial({ color: 0x3a2a24, transparent: true, opacity: .45 })); m.add(e); return { m, b }; });
    const paving = new T.Mesh(new T.PlaneGeometry(2100, 1900), new T.MeshLambertMaterial({ color: 0x8e8d88, transparent: true, opacity: 0 })); paving.rotation.x = -Math.PI / 2; paving.position.set(-150, 1.5, 0); site.add(paving);

    // ---- 3D-anchored labels for the aerial finale ----
    const tagHost = $('.viz-tags', host); const TAGS = [];
    const addTag = (x, y, z, text, cls, dy) => { const el = document.createElement('div'); el.className = 'viz-tag' + (cls ? ' ' + cls : ''); el.textContent = text; tagHost.appendChild(el); TAGS.push({ el, v: new T.Vector3(x, y, z), dy: dy || 0 }); };
    const fmtSq = n => n >= 1e6 ? (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M sq ft' : n.toLocaleString() + ' sq ft';
    COMPARE.forEach((o, i) => addTag(centers[i].x, o.h + 10, 0, `${o.short || o.name} · ${fmtSq(o.sqft)}`, '', -(i < 4 ? (3 - i) * 20 : 0)));   // stagger the four small ones upward
    BUILDINGS.forEach(b => addTag(SITE_ORIGIN.x + b.x, b.h + 10, SITE_ORIGIN.z + b.z, b.label, 'hot'));
    addTag(SITE_ORIGIN.x, 5, SITE_ORIGIN.z - SITE.d / 2 - 120, 'Homes · 240 ft buffer', 'muted');
    addTag(SITE_ORIGIN.x, 5, SITE_ORIGIN.z + SITE.d / 2 + 380, 'Sunrise Highway', 'muted');
    addTag(SITE_ORIGIN.x - SITE.w / 2 - 520, 5, SITE_ORIGIN.z + 900, 'Veterans Memorial Hwy', 'muted');
    addTag(SITE_ORIGIN.x + SITE.w / 2 + 300, 5, SITE_ORIGIN.z + 700, 'Beacon Dr', 'muted');
    function drawTags() {
      const on = STEPS[step].kind === 'done'; tagHost.hidden = !on; if (!on) return;
      const w = canvas.clientWidth, h = canvas.clientHeight; const p = new T.Vector3();
      TAGS.forEach(t => { p.copy(t.v).project(camera); const vis = p.z < 1 && Math.abs(p.x) < 1.05 && Math.abs(p.y) < 1.05; t.el.hidden = !vis; if (vis) { t.el.style.left = ((p.x + 1) / 2 * w) + 'px'; t.el.style.top = ((1 - p.y) / 2 * h + t.dy) + 'px'; t.el.style.setProperty('--stem', (6 - t.dy) + 'px'); } });
    }

    // ---- camera + state ----
    let step = 0, progress = 0, playing = false, lastTs = 0, timer = null, dead = false;
    const camPos = new T.Vector3(), look = new T.Vector3(), goal = { pos: new T.Vector3(), look: new T.Vector3() };
    const orbit = { yaw: 0.6, pitch: 0.58, dist: 1, drag: null, zoom: 1 };
    function goalFor() {
      const s = STEPS[step];
      if (s.kind === 'scale') {
        const c = centers[s.i]; const dist = Math.max(110, c.size * 2.3) * orbit.zoom;
        goal.look.set(c.x, COMPARE[s.i].h * 0.35, 0);
        goal.pos.set(c.x + Math.sin(orbit.yaw) * dist * Math.cos(orbit.pitch), dist * Math.sin(orbit.pitch), Math.cos(orbit.yaw) * dist * Math.cos(orbit.pitch));
      } else if (s.kind === 'done') {                                              // aerial: whole site + comparison row in one frame
        const dist = 8200 * orbit.zoom, yaw = orbit.drag ? orbit.yaw : 0.32, pitch = orbit.drag ? orbit.pitch : 0.9;
        goal.look.set(SITE_ORIGIN.x, 0, SITE_ORIGIN.z + 1150);
        goal.pos.set(goal.look.x + Math.sin(yaw) * dist * Math.cos(pitch), dist * Math.sin(pitch), goal.look.z + Math.cos(yaw) * dist * Math.cos(pitch));
      } else {
        // forest / clearing: look over the comparison row (foreground) at the site (background)
        const dist = 4600 * orbit.zoom, yaw = orbit.drag ? orbit.yaw : 2.55, pitch = orbit.drag ? orbit.pitch : 0.6;   // from the north-east, homes side
        goal.look.set(SITE_ORIGIN.x, 40, SITE_ORIGIN.z + 100);
        goal.pos.set(goal.look.x + Math.sin(yaw) * dist * Math.cos(pitch), dist * Math.sin(pitch), goal.look.z + Math.cos(yaw) * dist * Math.cos(pitch));
      }
    }
    function applyClearing(p) {
      progress = Math.max(0, Math.min(1, p)); const front = progress * 1.15; let removed = 0;
      trees.forEach((t, i) => { let g = 0; if (!t.keep) { const f = (front - t.order) / 0.1; if (f > 0) { g = Math.min(1, f); removed += g; } } place(i, g); });
      canopy.instanceMatrix.needsUpdate = trunk.instanceMatrix.needsUpdate = true;
      const clearable = trees.filter(t => !t.keep).length, frac = clearable ? removed / clearable : 0;
      const rise = Math.max(0, (progress - 0.35) / 0.65);
      bMeshes.forEach(({ m, b }) => { const s = Math.max(0.001, rise); m.scale.y = s; m.position.y = b.h * s / 2; m.visible = rise > 0; });
      paving.material.opacity = Math.max(0, (progress - 0.3) / 0.5) * 0.95;
      const acres = frac * (ACRES.forestBefore - ACRES.forestAfter);
      hud('acres').textContent = acres.toFixed(1);
      hud('trees').textContent = Math.round(frac * TREES_EST * (1 - ACRES.forestAfter / ACRES.forestBefore)).toLocaleString();
      hud('imp').textContent = (Math.max(0, (progress - 0.3) / 0.7) * ACRES.impervious).toFixed(1);
      hud('gal').textContent = Math.round(acres * RECHARGE_GAL_PER_AC / 1e6 * 10) / 10 + ' M';
      hud('h').textContent = Math.round(rise * 60) + ' ft';
    }
    function setStep(i, instant) {
      step = Math.max(0, Math.min(STEPS.length - 1, i)); const s = STEPS[step];
      orbit.zoom = 1; goalFor(); if (instant) { camPos.copy(goal.pos); look.copy(goal.look); }
      if (s.kind === 'scale') { const o = COMPARE[s.i]; $('.n', label).textContent = o.name; $('.s', label).textContent = o.sub; $('.x', label).textContent = `${o.w.toLocaleString()} × ${o.d.toLocaleString()} ft footprint`; label.classList.remove('hot'); hudBox.hidden = true; applyClearing(0); }
      if (s.kind === 'forest') { $('.n', label).textContent = 'The site today'; $('.s', label).textContent = '138 acres of pine–oak woodland, 2,400 × 2,500 ft'; $('.x', label).textContent = 'the comparison buildings sit along Sunrise Hwy at the bottom for scale'; label.classList.remove('hot'); hudBox.hidden = true; applyClearing(0); }
      if (s.kind === 'clear') { $('.n', label).textContent = 'Clearing 100 acres'; $('.s', label).textContent = 'then 4.26 million sq ft rises'; $('.x', label).textContent = '101.6 acres disturbed; 36.9 acres of forest kept as buffers'; label.classList.add('hot'); hudBox.hidden = false; if (instant) applyClearing(1); else if (progress >= 1) applyClearing(0); }
      if (s.kind === 'done') { $('.n', label).textContent = 'Everything to scale'; $('.s', label).textContent = '4.26 million sq ft on 138 acres, next to everything it was compared with'; $('.x', label).textContent = 'drag to orbit, wheel to zoom'; label.classList.add('hot'); hudBox.hidden = false; applyClearing(1); }
      centers.forEach((c, i) => { c.mesh.visible = c.edge.visible = s.kind !== 'forest' && s.kind !== 'clear'; });
      slider.value = step; stepEl.textContent = `${step + 1} / ${STEPS.length}`;
    }
    host.__site3d = { setStep, applyClearing, STEPS };
    const qs = new URLSearchParams(location.search).get('step'); setStep(qs !== null && /^\d+$/.test(qs) ? Number(qs) : 0, true);
    const qp = new URLSearchParams(location.search).get('clear'); if (qp !== null && !isNaN(qp) && STEPS[step].kind === 'clear') applyClearing(Number(qp));

    // ---- playback ----
    function play() { playing = true; $('[data-act=play]', host).innerHTML = 'Pause'; schedule(); }
    function pause() { playing = false; clearTimeout(timer); $('[data-act=play]', host).innerHTML = (SPS.icon ? SPS.icon('chevron') : '') + ' Play'; }
    function schedule() {
      clearTimeout(timer); if (!playing) return;
      const k = STEPS[step].kind;
      if (k === 'clear') return;                                                // advanced by the render loop when clearing completes
      timer = setTimeout(() => { if (step >= STEPS.length - 1) { pause(); return; } setStep(step + 1); if (STEPS[step].kind === 'clear') applyClearing(0); schedule(); }, k === 'forest' ? 3200 : 2300);
    }
    host.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'play') { if (playing) pause(); else { if (step >= STEPS.length - 1) setStep(0); if (STEPS[step].kind === 'clear' && progress >= 1) applyClearing(0); play(); } }
      if (b.dataset.act === 'prev') { pause(); setStep(step - 1); if (STEPS[step].kind === 'clear') applyClearing(0); }
      if (b.dataset.act === 'next') { pause(); setStep(step + 1, false); if (STEPS[step].kind === 'clear') applyClearing(1); }
      if (b.dataset.act === 'slides') { pause(); dead = true; try { localStorage.setItem('sps.viz', 'slides'); } catch (x) {} renderer.dispose(); slideshow(host); }
    });
    slider.addEventListener('input', () => { pause(); setStep(Number(slider.value)); if (STEPS[step].kind === 'clear') applyClearing(1); });

    // ---- orbit / zoom ----
    canvas.addEventListener('pointerdown', e => { orbit.drag = { x: e.clientX, y: e.clientY, yaw: orbit.yaw, pitch: orbit.pitch }; });
    window.addEventListener('pointermove', e => { if (!orbit.drag) return; orbit.yaw = orbit.drag.yaw + (e.clientX - orbit.drag.x) * 0.006; orbit.pitch = Math.max(0.1, Math.min(1.3, orbit.drag.pitch + (e.clientY - orbit.drag.y) * 0.004)); goalFor(); });
    window.addEventListener('pointerup', () => { orbit.drag = null; });
    canvas.addEventListener('wheel', e => { e.preventDefault(); orbit.zoom = Math.max(0.3, Math.min(3, orbit.zoom * (1 + e.deltaY * 0.001))); goalFor(); }, { passive: false });

    function resize() { const w = host.clientWidth || 600, h = Math.round(w * 9 / 16); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    window.addEventListener('resize', resize); resize();
    let visible = true, autoplayed = false;
    new IntersectionObserver(en => { visible = en[0].isIntersecting; if (en[0].isIntersecting && en[0].intersectionRatio > 0.5 && !autoplayed) { autoplayed = true; if (!playing && step === 0) play(); } }, { threshold: [0, 0.5] }).observe(host);
    let probeN = 0, probeT0 = 0, probed = false;
    (function loop(ts) {
      if (dead) return; requestAnimationFrame(loop); if (!visible) return;
      if (!probed && document.visibilityState === 'visible') { if (!probeT0) probeT0 = ts; probeN++; if (ts - probeT0 > 3000) { probed = true; const fps = probeN / ((ts - probeT0) / 1000); if (fps < 14 && !force3d && !new URLSearchParams(location.search).has('step')) { dead = true; clearTimeout(timer); renderer.dispose(); slideshow(host); return; } } }
      const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0); lastTs = ts;
      if (playing && STEPS[step].kind === 'clear') { applyClearing(progress + dt / 11); if (progress >= 1) { setStep(step + 1); schedule(); } }
      camPos.lerp(goal.pos, 0.04); look.lerp(goal.look, 0.05);
      camera.position.copy(camPos); camera.lookAt(look); renderer.render(scene, camera); drawTags();
    })(0);
  }
  SPS.site3d = { init, COMPARE, BUILDINGS, ACRES };
})();
