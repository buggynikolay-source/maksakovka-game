// =====================================================================
// §10. СЦЕНА 3. ДВОР: турник, песочница, тополиный пух
// =====================================================================
function makeKostya() {
  return makePerson({ name: 'Костя', h: 1.8, bw: 0.95, topTex: TEX.kostyaShirt, shortSleeves: true, bottom: 0x2a2e3a, hairStyle: 'cap', capColor: 0x1a1a1e, hair: 0x6a4a2a, skin: 0xe0b08a, shoes: 0x202020, face: { smile: true, eye: '#5a3a1a', brow: '#5a3a1a' } });
}
function makeVanya() {
  const p = makePerson({ name: 'Ваня', h: 1.38, topTex: TEX.vanyaShirt, shortSleeves: true, shortPants: true, bottom: 0x34466a, skin: 0xebbd96, hair: 0x9a6030, hairStyle: 'short', shoes: 0x3040a0, face: { freckles: true, eye: '#4a6a8a', brow: '#8a5424' } });
  const sp = makeSpinner({ glow: true }); sp.scale.setScalar(1.6); sp.position.set(0, -0.07, 0.03); sp.rotation.x = Math.PI / 2; p.armR.hand.add(sp);
  p.spinner = sp; p.extra = (dt) => { sp.rotation.y += dt * 28; };
  return p;
}
// --- элементы двора ---
function tree(x, z, kind = 'poplar', h = 11, seed = 1) {
  const r = mulberry32(seed * 977 + 13);
  if (kind === 'poplar') {
    CYL(x, 0, z, 0.2, 0.3, h * 0.55, 6, MT(TEX.bark), { col: true });
    const lm = MT(TEX.leaves, { flatShading: true });
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), lm);
      m.scale.set(1.9 + r() * 0.8, 2.6 + r() * 1.2, 1.9 + r() * 0.8); m.position.set(x + (r() - 0.5) * 1.2, h * (0.5 + i * 0.17), z + (r() - 0.5) * 1.2); m.rotation.y = r() * 3;
      m.castShadow = true; m.receiveShadow = true; W.scene.add(m);
    }
  } else {
    CYL(x, 0, z, 0.1, 0.16, h * 0.7, 6, MT(TEX.birch), { col: true });
    const lm = MT(TEX.leavesBirch, { flatShading: true });
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), lm);
      m.scale.set(1.2 + r() * 0.8, 1.6 + r() * 0.8, 1.2 + r() * 0.8); m.position.set(x + (r() - 0.5) * 1.8, h * (0.55 + r() * 0.35), z + (r() - 0.5) * 1.8);
      m.castShadow = true; m.receiveShadow = true; W.scene.add(m);
    }
  }
}
function bench(x, z, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; W.scene.add(g);
  const conc = MC(0x9a968c), wood = MT(TEX.woodPaint);
  for (const sx of [-0.7, 0.7]) { const l = pbox(0.1, 0.42, 0.4, conc); l.position.set(sx, 0.21, 0); g.add(l); }
  for (let i = 0; i < 3; i++) { const sl = pbox(1.7, 0.04, 0.11, wood); sl.position.set(0, 0.44, -0.13 + i * 0.13); g.add(sl); }
  for (let i = 0; i < 2; i++) { const sl = pbox(1.7, 0.1, 0.03, wood); sl.position.set(0, 0.62 + i * 0.15, -0.22); sl.rotation.x = -0.15; g.add(sl); }
  const sw = Math.abs(Math.sin(ry)) > 0.7; addCol(x - (sw ? 0.25 : 0.88), 0, z - (sw ? 0.88 : 0.25), x + (sw ? 0.25 : 0.88), 0.8, z + (sw ? 0.88 : 0.25));
  return g;
}
function lada(x, z, ry, color) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; W.scene.add(g);
  const bm = MC(color, { phong: true, shininess: 50, specular: 0x444444 }), gl = MC(0x1a2228, { phong: true, shininess: 90, specular: 0x888888 }), ch = MC(0xb8bcc0, { phong: true, shininess: 80 }), blk = MC(0x141414);
  const add = (w, h, d, m, px_, py, pz) => { const b = pbox(w, h, d, m); b.position.set(px_, py, pz); g.add(b); return b; };
  add(4.1, 0.6, 1.62, bm, 0, 0.62, 0);
  add(2.0, 0.52, 1.44, [gl, gl, bm, bm, gl, gl], -0.25, 1.18, 0);
  add(0.06, 0.14, 1.66, ch, 2.07, 0.42, 0); add(0.06, 0.14, 1.66, ch, -2.07, 0.42, 0);
  add(0.04, 0.22, 0.9, blk, 2.06, 0.72, 0);
  for (const sz of [-0.62, 0.62]) { const hl = add(0.04, 0.16, 0.22, MC(0xfff0c0, { emissive: 0x302810 }), 2.06, 0.74, sz); }
  add(0.03, 0.11, 0.52, MC(0xf4f4f4), 2.09, 0.42, 0);
  for (const sx of [-1.3, 1.3]) for (const sz of [-0.74, 0.74]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.2, 10), blk); w.rotation.x = Math.PI / 2; w.position.set(sx, 0.31, sz); w.castShadow = true; g.add(w); const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.21, 8), ch); hub.rotation.x = Math.PI / 2; hub.position.copy(w.position); g.add(hub); }
  const sw = Math.abs(Math.sin(ry)) > 0.7; addCol(x - (sw ? 0.85 : 2.1), 0, z - (sw ? 2.1 : 0.85), x + (sw ? 0.85 : 2.1), 1.5, z + (sw ? 2.1 : 0.85));
  return g;
}
function signTex() {
  return CT(64, 64, (g, w, h) => {
    g.fillStyle = '#d02020'; g.beginPath(); g.moveTo(32, 2); g.lineTo(62, 58); g.lineTo(2, 58); g.closePath(); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(32, 13); g.lineTo(53, 52); g.lineTo(11, 52); g.closePath(); g.fill();
    g.fillStyle = '#111'; g.beginPath(); g.arc(26, 27, 3, 0, 7); g.fill(); g.beginPath(); g.arc(38, 31, 2.5, 0, 7); g.fill();
    g.fillRect(24, 30, 4, 10); g.fillRect(36, 33, 4, 8); g.fillRect(23, 40, 2, 7); g.fillRect(27, 40, 2, 7); g.fillRect(36, 41, 2, 6); g.fillRect(39, 41, 2, 6);
  }, { rep: false, mip: false });
}
function entranceDoorTex(num) {
  return CT(32, 64, (g, w, h, r) => {
    noiseFill(g, w, h, '#5a3424', 12, r); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h); g.fillRect(w - 2, 0, 2, h);
    px(g, 22, 26, '#8a8a8a', 6, 10); px(g, 23, 27, '#222', 4, 3); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) px(g, 23 + j * 2, 31 + i * 2, '#ccc', 1, 1);
    px(g, 4, 30, '#c8b070', 3, 8);
  }, { rep: false, seed: num });
}
SCENES.yard = {
  build() {
    newWorld('yard');
    const s = W.scene;
    const st = (W.st = { talked: false, called: false, warnT: 0 });
    // свет и небо: утреннее солнце
    const sunDir = V3(0.55, 0.62, 0.56).normalize();
    s.add(new THREE.HemisphereLight(0xcfe0f0, 0x5a6a3a, 1.15));
    const sun = new THREE.DirectionalLight(0xfff0d8, 3.1);
    const cen = V3(-3, 0, 18); sun.position.copy(cen).addScaledVector(sunDir, 70); sun.target.position.copy(cen); s.add(sun.target);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -42, right: 42, top: 42, bottom: -42, near: 10, far: 160 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.05;
    s.add(sun);
    makeSky({ top: 0x5b8fd2, hor: 0xd9e4ea, sun: sunDir });
    s.fog = new THREE.Fog(0xd5e0e6, 45, 200);
    // земля, тротуары, проезд, дорога
    floorRect(-70, -14, 70, 80, 0, MT(TEX.ground), 3, 'grass');
    const asp = MT(TEX.asphalt);
    floorRect(-24.5, 0, 24.5, 2.2, 0.02, asp, 2, 'asphalt');
    floorRect(-44, 4, 30, 7.6, 0.02, asp, 2, 'asphalt');
    floorRect(-44, -14, -35, 80, 0.025, asp, 2, 'asphalt');
    floorRect(1.6, 2.2, 3.2, 4, 0.015, MT(TEX.dirt), 2, 'grass');
    floorRect(2.2, 7.6, 3.8, 13.5, 0.015, MT(TEX.dirt), 2, 'grass');
    const curb = MC(0xb8b4a8);
    B(-10, 0, 3.95, 68, 0.1, 0.12, curb, { ts: 0, cast: false }); B(-10, 0, 7.65, 68, 0.1, 0.12, curb, { ts: 0, cast: false });
    // наш дом: пятиэтажка, три подъезда
    const fac = MT(TEX.facade), side = MC(0xbcb6a8), roof = MC(0x55524c);
    BX(0, 0, -6, 48, 15, 12, [side, side, roof, side, fac, side]);
    B(0, 15, -6, 48.4, 0.5, 12.4, MC(0x6a665e), { ts: 0 });
    addCol(-70, 0, -20, 70, 20, 0.02);
    for (const dx of [-15, 0, 15]) {
      B(dx, 0, 1.0, 2.6, 0.12, 1.9, MT(TEX.concrete), { ts: 1, cast: false }); addSurf(dx - 1.3, 0.05, dx + 1.3, 1.95, 0.12, 'concrete');
      B(dx, 2.55, 0.95, 2.6, 0.12, 1.9, MC(0x8e8a82), { ts: 0 });
      for (const sx of [-1.15, 1.15]) B(dx + sx, 0.12, 1.75, 0.08, 2.43, 0.08, MC(0x505458), { ts: 0, col: true });
      BX(dx, 0.12, 0.03, 1.1, 2.1, 0.06, [side, side, side, side, MT(entranceDoorTex(dx + 30)), side]);
      decal(grafTex(String(dx / 15 + 2), { size: 14, color: '#ffffff', w: 32, h: 16 }), 0.28, 0.14, dx, 2.4, 0.04, 0, { alpha: true });
      bench(dx + 2.4, 1.5, 0);
    }
    decal(grafTex('кв. 9–16', { size: 10, color: '#ffffff', w: 64, h: 16 }), 0.45, 0.11, 0.85, 2.3, 0.04, 0, { alpha: true });
    addInter({ box: [1.1, 2.1, 0.2], at: [0, 1.17, 0.12], label: 'Подъезд', fn: async () => { await think('Домой рано. Сначала школа — последний день.'); } });
    // дом напротив и сбоку
    BX(0, 0, 58, 48, 15, 12, [side, side, roof, side, side, fac]);
    BX(-58, 0, 26, 12, 15, 48, [fac, side, roof, side, side, side]);
    // гаражи
    for (let i = 0; i < 9; i++) { const gz = 12 + i * 3.1; BX(34, 0, gz, 6, 2.5, 3.0, [side, MT(TEX.garage), MC(0x3a3632), side, side, side]); }
    for (let i = 0; i < 9; i++) { const gz = 12 + i * 3.1; BX(41, 0, gz, 6, 2.5, 3.0, [MT(TEX.garage), side, MC(0x3a3632), side, side, side]); }
    // лес вдали (тайга)
    const fm = MC(0x24402a), rr = mulberry32(77);
    for (let i = 0; i < 90; i++) { const a = rr() * Math.PI * 2, R = 110 + rr() * 50, h = 14 + rr() * 12; const c = new THREE.Mesh(new THREE.ConeGeometry(2.8 + rr() * 2, h, 6), fm); c.position.set(Math.cos(a) * R, h / 2, 20 + Math.sin(a) * R); W.scene.add(c); }
    // деревья
    let sd = 1;
    for (const x of [-26, -19, -12, 12, 18, 24]) tree(x, 10.2 + (sd % 2) * 0.6, 'poplar', 11 + (sd % 3), sd++);
    for (const x of [-16, 9, 15, 21]) tree(x, 23 + (sd % 2), 'poplar', 12, sd++);
    for (const x of [-20, -8, 8, 20]) tree(x, 3.1, 'birch', 8, sd++);
    tree(-24, 18, 'birch', 9, sd++); tree(-2, 25, 'birch', 8, sd++); tree(25, 16, 'birch', 9, sd++);
    // площадка: песочница, грибок, турник, горка, качели, шины
    const woodP = MT(TEX.woodPaint), rust = MT(TEX.rust), mb = MT(TEX.metalBlue), mr = MT(TEX.metalRed);
    floorRect(5, 15.6, 8, 18.6, 0.12, MT(TEX.sand), 1, 'sand');
    B(6.5, 0, 15.6, 3.1, 0.25, 0.1, woodP, { ts: 0 }); B(6.5, 0, 18.6, 3.1, 0.25, 0.1, woodP, { ts: 0 });
    B(5.0, 0, 17.1, 0.1, 0.25, 3.0, woodP, { ts: 0 }); B(8.0, 0, 17.1, 0.1, 0.25, 3.0, woodP, { ts: 0 });
    CYL(5.45, 0.12, 18.15, 0.05, 0.05, 1.9, 6, MC(0x6a5a40), { col: true });
    const gr = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.55, 8), MT(TEX.metalRed)); gr.position.set(5.45, 2.25, 18.15); gr.castShadow = true; W.scene.add(gr);
    const metal = MC(0x5a6068, { phong: true, shininess: 40 });
    CYL(5.3, 0, 15.0, 0.05, 0.05, 2.15, 6, mb, { col: true }); CYL(7.7, 0, 15.0, 0.05, 0.05, 2.15, 6, mb, { col: true });
    CYL(6.5, 2.0 - 1.22, 15.0, 0.022, 0.022, 2.44, 8, metal, { rz: Math.PI / 2 });
    // горка
    B(-3.5, 0, 16, 1.0, 1.4, 1.0, mr, { ts: 0, col: true });
    B(-3.5, 1.4, 16, 1.1, 0.06, 1.1, rust, { ts: 1 });
    slope(-3.85, -3.15, 16.5, 1.4, 19.2, 0.2, 0.05, rust);
    for (const sx of [-3.88, -3.12]) slope(sx - 0.02, sx + 0.02, 16.5, 1.6, 19.2, 0.4, 0.04, rust);
    for (let i = 0; i < 5; i++) B(-3.5, 0.28 * i, 15.45, 0.7, 0.04, 0.06, rust, { ts: 0 });
    addCol(-3.9, 0, 16.5, -3.1, 1.0, 19.2);
    // качели
    for (const sx of [-10.2, -7.8]) CYL(sx, 0, 17, 0.05, 0.05, 2.4, 6, mb, { col: true });
    CYL(-9, 2.4 - 1.25, 17, 0.04, 0.04, 2.5, 8, mb, { rz: Math.PI / 2 });
    const swingP = new THREE.Group(); swingP.position.set(-9, 2.38, 17); W.scene.add(swingP);
    for (const sx of [-0.25, 0.25]) { const ch = pbox(0.015, 1.9, 0.015, metal); ch.position.set(sx, -0.95, 0); swingP.add(ch); }
    const seat = pbox(0.6, 0.04, 0.25, woodP); seat.position.y = -1.9; swingP.add(seat);
    W.updates.push(() => { swingP.rotation.x = Math.sin(GT * 1.3) * 0.08 + Math.sin(GT * 0.37) * 0.05; });
    // вкопанные крашеные шины
    const tc = [0xd03030, 0xe8c020, 0x3060c0, 0xeeeeee, 0x30a050];
    for (let i = 0; i < 10; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.11, 5, 10), MC(tc[i % 5])); t.position.set(-6 + i * 0.75, 0.12, 13.0); t.castShadow = true; W.scene.add(t); }
    bench(1.2, 13.2, Math.PI); bench(-6.5, 20.5, 0);
    // бельё на верёвках
    const postM = MC(0x6a6e72);
    for (const sx of [14, 20]) { CYL(sx, 0, 9, 0.04, 0.04, 2.2, 6, postM, { col: true }); B(sx, 2.15, 9, 0.06, 0.06, 1.4, postM, { ts: 0 }); }
    for (const sz of [8.45, 9, 9.55]) B(17, 2.17, sz, 6, 0.01, 0.01, MC(0xdddddd), { ts: 0, cast: false });
    const sheets = [];
    const sheetCols = [0xf4f2ea, 0x9ab4e0, 0xe8e0c8, 0xd06060, 0xf4f2ea];
    for (let i = 0; i < 5; i++) {
      const g = new THREE.Group(); g.position.set(14.8 + i * 1.1, 2.17, [8.45, 9, 9.55][i % 3]); W.scene.add(g);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, i === 3 ? 0.6 : 1.2), MT(null, { color: sheetCols[i], side: THREE.DoubleSide, nocache: true })); m.position.y = i === 3 ? -0.3 : -0.6; m.castShadow = true; g.add(m);
      sheets.push(g);
    }
    W.updates.push(() => { sheets.forEach((g, i) => { g.rotation.x = Math.sin(GT * 1.7 + i) * 0.12 + 0.08; }); });
    // машины и знак
    lada(-12, 5.8, 0, 0x6e1a24);
    lada(14, 5.8, Math.PI, 0xd8d2c0);
    addInter({ box: [4.2, 1.5, 1.7], at: [-12, 0.75, 5.8], label: 'Жигули', dist: 2.6, fn: async () => { await think('Семёрка дяди Миши. Заводится через раз, зато цвет «вишня».'); } });
    CYL(-22, 0, 7.9, 0.035, 0.035, 2.3, 6, postM);
    decal(signTex(), 0.7, 0.7, -22, 2.3, 7.95, Math.PI / 2, { alpha: true, double: true });
    // границы двора
    addCol(-33, 0, -14, -32, 6, 80); addCol(27.5, 0, -14, 28.5, 6, 80); addCol(-70, 0, 44, 70, 6, 45);
    const bar = addCol(-27.2, 0, 0, -27, 6, 44);
    addTrigger(() => !st.talked && P.pos.x < -24.5, () => { if (GT > st.warnT) { st.warnT = GT + 6; bark('Коля', 'Сначала к пацанам. Вон Костян на турнике.', 3); } }, { once: false });
    // пух
    const N = 260, pos = new Float32Array(N * 3), fr = mulberry32(5);
    for (let i = 0; i < N; i++) { pos[i * 3] = (fr() - 0.5) * 24; pos[i * 3 + 1] = fr() * 6; pos[i * 3 + 2] = (fr() - 0.5) * 24; }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ map: TEX.fluff, size: 2, sizeAttenuation: false, transparent: true, depthWrite: false, color: 0xffffff, fog: true }));
    pts.frustumCulled = false; W.scene.add(pts);
    W.updates.push((dt) => {
      pts.material.size = clamp(6 / settings.px, 1.5, 4);
      const c = camera.position;
      for (let i = 0; i < N; i++) {
        let x = pos[i * 3] + dt * (0.5 + Math.sin(GT * 0.6 + i) * 0.3), y = pos[i * 3 + 1] + dt * Math.sin(GT * 1.1 + i * 1.7) * 0.25 - dt * 0.05, z = pos[i * 3 + 2] + dt * Math.cos(GT * 0.5 + i) * 0.2;
        const rx = x - c.x, rz = z - c.z;
        if (rx > 12) x -= 24; if (rx < -12) x += 24; if (rz > 12) z -= 24; if (rz < -12) z += 24; if (y < 0) y += 6; if (y > 6) y -= 6;
        pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      }
      pg.attributes.position.needsUpdate = true;
    });
    // --- люди ---
    const V = makeVlad().add(s); V.setPos(1.0, 0, 3.0, 0.4); W.vlad = V;
    const K = makeKostya().add(s); W.kostya = K;
    const barG = new THREE.Group(); barG.position.set(6.5, 2.0, 15.0); s.add(barG);
    const swingG = new THREE.Group(); barG.add(swingG);
    const faceG = new THREE.Group(); faceG.rotation.y = Math.PI; swingG.add(faceG);
    faceG.add(K.root); K.root.position.set(0, K.lLeg, 0); K.root.rotation.set(0, 0, Math.PI); K.state = 'hang';
    W.updates.push(() => { if (st.hangIdle !== false) swingG.rotation.x = Math.sin(GT * 1.6) * 0.18; });
    const VA = makeVanya().add(s); VA.setPos(-14, 0, 26, 0.5); VA.show(false); W.vanya = VA;
    // зов Кости и разговор
    addTrigger(() => P.pos.distanceTo(barG.position) < 20 && P.pos.z > 5, () => bark('Костя', 'Воробей! Сюда давай, ща покажу!', 3));
    addTrigger(() => Math.hypot(P.pos.x - 6.5, P.pos.z - 15) < 6.2, () => run(kostyaScene));
    // песочный «пуф»
    function sandPuff(at) {
      const parts = [];
      for (let i = 0; i < 16; i++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.fluff, color: 0xd8c08a, transparent: true, depthWrite: false }));
        sp.position.copy(at); sp.scale.setScalar(0.3); W.scene.add(sp);
        const a = (i / 16) * Math.PI * 2; parts.push({ sp, v: V3(Math.cos(a) * (0.8 + Math.random()), 0.6 + Math.random() * 1.2, Math.sin(a) * (0.8 + Math.random())) });
      }
      tween(1.4, (k) => { for (const p of parts) { p.sp.position.addScaledVector(p.v, 0.016); p.v.y -= 0.03; p.sp.scale.setScalar(0.3 + k * 0.7); p.sp.material.opacity = 1 - k; } }, linear).then(() => parts.forEach((p) => W.scene.remove(p.sp)));
    }
    async function kostyaScene() {
      st.talked = true; doneTask('kostya');
      const look = () => K.headPos(V3());
      P.look = look;
      V.face(6.5, 15); V.state = 'idle';
      await say('Костя', 'Пацаны, снимайте! Сейчас будет солнышко!', { p: K, focus: false });
      const id = await choose([{ t: 'Снять на телефон', id: 'film' }, { t: '«Костя, не надо»', id: 'no' }]);
      if (id === 'film') { VMD.mode = 'phone'; UI.rec.classList.add('on'); AU.rec(); setF('видео_кости'); }
      else { await say('Коля', 'Костя, не надо!'); await say('Костя', 'Смотри и учись, Вороба!', { p: K, focus: false }); }
      hideDlg();
      // раскачка → солнышко → срыв
      st.hangIdle = false; const a0 = swingG.rotation.x; let t0 = GT;
      await tween(3.0, (k) => { const t = GT - t0; swingG.rotation.x = lerp(a0, 0, Math.min(1, t * 2)) + Math.sin(t * 2.6) * lerp(0.2, 2.2, k); }, linear);
      const th0 = swingG.rotation.x, th1 = -1.0 - Math.PI * 2;
      await tween(1.9, (k) => { swingG.rotation.x = lerp(th0, th1, k); }, (k) => k * k * (1.6 - 0.6 * k));
      // отпустил
      s.attach(K.root); K.state = 'fly'; AU.noise(0.4, { type: 'bandpass', f: 900, vol: 0.12 });
      bark('Костя', 'Оп-па-а-а!', 1.5);
      const p0 = K.root.position.clone(), q0 = K.root.quaternion.clone();
      const p1 = V3(6.5, 0.22, 18.2), q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
      await tween(0.85, (k) => { K.root.position.lerpVectors(p0, p1, k); K.root.position.y += Math.sin(k * Math.PI) * 1.1; K.root.quaternion.slerpQuaternions(q0, q1, k); }, linear);
      K.state = 'lie'; AU.thud(); sandPuff(V3(6.5, 0.3, 17.3));
      P.pitch -= 0.04;
      await wait(1.1);
      if (VMD.mode === 'phone') { AU.rec(); await wait(0.4); VMD.mode = 'none'; UI.rec.classList.remove('on'); toast('Видео сохранено в галерее: «костя_солнышко.mp4»'); }
      await say('Влад', 'Костян, ты живой?', { p: V, focus: false });
      await say('Костя', 'Нормально! Песок мягкий!', { p: K });
      // Ваня
      VA.show(true); VA.setPos(-3, 0, 22);
      const tgt = V3(P.pos.x + (6.5 - P.pos.x) * 0.25 - 1.0, 0, P.pos.z + (15 - P.pos.z) * 0.25);
      VA.lookP = () => camera.position;
      P.look = () => VA.headPos(V3());
      await VA.walkTo([[tgt.x - 1.5, 0, tgt.z + 3], [tgt.x, 0, tgt.z]], 3.4);
      VA.face(P.pos.x, P.pos.z); VA.state = 'spin';
      await say('Ваня', 'Смотрите! Какой классный! Три минуты крутится!', { p: VA });
      const v = await choose([{ t: '«Крутой, малой»', id: 'cool' }, { t: '«Три минуты? У меня пять»', id: 'lie' }]);
      if (v === 'cool') { await say('Коля', 'Крутой, малой.'); VA.state = 'cheer'; rel('ваня', +1); await wait(1.2); VA.state = 'spin'; }
      else { await say('Коля', 'Три минуты? У меня пять.'); VA.state = 'sad'; setF('соврал_ване'); await wait(1.4); }
      // Костя встаёт, отряхивается
      const qs = K.root.quaternion.clone(), qe = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.atan2(P.pos.x - 6.5, P.pos.z - 17.6), 0));
      const ps = K.root.position.clone(), pe = V3(6.5, 0.12, 17.6);
      K.state = 'idle';
      await tween(0.9, (k) => { K.root.quaternion.slerpQuaternions(qs, qe, k); K.root.position.lerpVectors(ps, pe, k); });
      await K.walkTo([[6.3, 0.12, 16.2], [6.0, 0, 15.2], [lerp(6.0, P.pos.x, 0.5), 0, lerp(15.2, P.pos.z, 0.5)]], 1.4);
      K.face(VA.root.position.x, VA.root.position.z); K.state = 'dust';
      await say('Костя', 'С таким аккуратнее, малой. Серый такой же на рынке искал.', { p: K });
      K.state = 'idle'; K.face(P.pos.x, P.pos.z);
      await say('Костя', 'Так, пацаны, план. После школы — на Кирпичку, считай, уже лето. Вороба, с тебя чипсы и газировка. Мы скинемся.', { p: K });
      S.money += 70; AU.coins(); toast('+70 ₽ от пацанов');
      setTasks([{ id: 'buy', t: 'Купить чипсы и газировку после школы: 150 ₽ (у тебя {money} ₽)' }, { id: 'school', t: 'Идти в школу вместе с пацанами' }]);
      bar.off = true;
      VA.lookP = null; VA.state = 'run'; VA.walkTo([[-8.6, 0, 15.6]], 3.2).then(() => { VA.face(-9, 17); VA.state = 'spin'; });
      K.walkTo([[0, 0, 8.5], [-20, 0, 6.0], [-28.6, 0, 5.4]], 1.6).then(() => { K.face(P.pos.x, P.pos.z); K.lookP = () => camera.position; });
      V.walkTo([[-1, 0, 9.3], [-20, 0, 6.8], [-29.2, 0, 6.4]], 1.6).then(() => { V.face(P.pos.x, P.pos.z); V.state = 'phone'; });
      showHint('Пацаны идут к дороге за домами — догоняй', 6);
    }
    addTrigger(() => st.talked && P.pos.x < -26.6, () => run(async () => {
      doneTask('school'); bark('Костя', 'Вороба, не отставай! Звонок через десять минут!', 3);
      await wait(1.2); await fade(1, 1.2);
      await endDemo();
    }));
  },
  async start() {
    setFade(1);
    placePlayer(0, 0.12, 1.25, Math.PI, 0.02);
    setTasks([{ id: 'kostya', t: 'Найти Костю во дворе' }]);
    AU.bed({ brown: true, f: 380, vol: 0.035, mod: (t) => 0.7 + 0.3 * Math.sin(t * 0.3) * Math.sin(t * 0.13 + 1) });
    AU.birds();
    AU.door(false);
    W.vlad.walkTo([[2.6, 0, 6.0], [4.4, 0, 12.4]], 1.7).then(() => { W.vlad.face(6.5, 15); W.vlad.state = 'phone'; });
    await fade(0, 0.9);
    await think('Пух полетел. Всё, точно лето.');
  },
};
