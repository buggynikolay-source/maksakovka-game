// =====================================================================
// §9. СЦЕНА 2. ПОДЪЕЗД (3-й этаж → улица)
// =====================================================================
// Надпись на стене (прозрачный фон)
function grafTex(text, o = {}) {
  const w = o.w || 128, h = o.h || 32;
  return CT(w, h, (g, W_, H_, r) => {
    g.save(); g.translate(w / 2, h / 2); g.rotate(o.rot || 0);
    g.font = `${o.italic ? 'italic ' : ''}bold ${o.size || 18}px ${o.font || 'Arial'}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const n = o.spray ? 4 : 1;
    for (let i = 0; i < n; i++) { g.globalAlpha = o.spray ? 0.45 : 0.92; g.fillStyle = o.color || '#151515'; g.fillText(text, (r() - 0.5) * (o.spray ? 2 : 0), (r() - 0.5) * (o.spray ? 2 : 0)); }
    if (o.stroke) { g.globalAlpha = 1; g.strokeStyle = o.stroke; g.lineWidth = 1; g.strokeText(text, 0, 0); }
    g.restore();
    if (o.drips) { g.globalAlpha = 0.6; g.fillStyle = o.color || '#151515'; for (let i = 0; i < o.drips; i++) { const x = 8 + r() * (w - 16), y = h * 0.55 + r() * 4; g.fillRect(x, y, 1, 3 + r() * 9); } }
  }, { rep: false, mip: false, seed: text.length * 17 + (o.seed || 0) });
}
// Полоса краски по ломаной [(a, y)...]: axis 'z' — стена на x=c, axis 'x' — стена на z=c
function bandMesh(axis, c, pts, h, mat, ts = 1) {
  const pos = [], uv = [], idx = [];
  for (const [a, y] of pts) {
    if (axis === 'z') pos.push(c, y, a, c, y + h, a); else pos.push(a, y, c, a, y + h, c);
    uv.push(a / ts, y / ts, a / ts, (y + h) / ts);
  }
  for (let i = 0; i < pts.length - 1; i++) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; W.scene.add(m); return m;
}
// Стена с любым числом проёмов: holes [[aFrom, aTo, yFrom, yTo]] в мировых координатах
function holedWall(axis, c, a0, a1, y0, y1, t, mat, holes) {
  const xs = new Set([a0, a1]); for (const h of holes) { xs.add(clamp(h[0], a0, a1)); xs.add(clamp(h[1], a0, a1)); }
  const arr = [...xs].sort((p, q) => p - q);
  for (let i = 0; i < arr.length - 1; i++) {
    const a = arr[i], b = arr[i + 1]; if (b - a < 0.001) continue;
    const hs = holes.filter((h) => h[0] <= a + 1e-6 && h[1] >= b - 1e-6).map((h) => [h[2], h[3]]).sort((p, q) => p[0] - q[0]);
    const emit = (ya, yb) => { if (yb - ya < 0.001) return; if (axis === 'x') B((a + b) / 2, ya, c, b - a, yb - ya, t, mat, { col: true, block: true }); else B(c, ya, (a + b) / 2, t, yb - ya, b - a, mat, { col: true, block: true }); };
    let cy = y0; for (const [ha, hb] of hs) { emit(cy, ha); cy = Math.max(cy, hb); } emit(cy, y1);
  }
}
// Наклонная балка/плита между двумя точками (z, y) по ширине xa..xb
function slope(xa, xb, za, ya, zb, yb, th, mat, o = {}) {
  const dz = zb - za, dy = yb - ya, L = Math.hypot(dz, dy);
  const m = new THREE.Mesh(new THREE.BoxGeometry(xb - xa, th, L + (o.ext || 0)), mat);
  m.position.set((xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); m.rotation.x = Math.atan2(-dy, dz);
  m.castShadow = o.cast !== false; m.receiveShadow = true; W.scene.add(m); return m;
}
// Лестничный марш: 10 подступенков, 9 проступей. Верх — (zTop, yTop), низ — (zBot, yBot)
function flight(xa, xb, zTop, yTop, zBot, yBot, mat, tag, o = {}) {
  const riser = (yTop - yBot) / 10, tread = (zBot - zTop) / 9;
  for (let i = 1; i <= 9; i++) {
    const za = zTop + (i - 1) * tread, zb = zTop + i * tread, y = yTop - i * riser;
    B((xa + xb) / 2, y - 0.32, (za + zb) / 2, xb - xa, 0.32, Math.abs(tread) + 0.004, mat, { ts: 1 });
  }
  slope(xa, xb, zTop, yTop - 0.42, zBot, yBot - 0.27, 0.16, o.under || mat);
  // перила у пролёта
  const rx = o.railX, rm = MT(TEX.rail), metal = MC(0x3a3a36);
  if (rx !== undefined) {
    for (let i = 1; i <= 9; i++) { const zc = zTop + (i - 0.5) * tread, y = yTop - i * riser; B(rx, y, zc, 0.02, 0.88, 0.02, metal, { ts: 0, cast: false }); }
    slope(rx - 0.03, rx + 0.03, zTop - tread * 0.3, yTop + 0.88 - riser * 0.2, zBot + tread * 0.3, yBot + 0.88 + riser * 0.6, 0.05, rm, { cast: false });
    slope(rx - 0.01, rx + 0.01, zTop, yTop + 0.1, zBot, yBot + 0.1, 0.03, metal, { cast: false });
  }
  if (!o.nosurf) addSurf(xa, Math.min(zTop, zBot), xb, Math.max(zTop, zBot), (x, z) => yBot + (yTop - yBot) * clamp((z - zBot) / (zTop - zBot), 0, 1), tag);
}
function makeShura() {
  const p = makePerson({ name: 'Баба Шура', h: 1.52, bw: 1.15, belly: 1.35, skin: 0xd9a98c, topTex: TEX.robe, skirt: 0.5, skirtTex: TEX.robe, bottom: 0x7a6a64, hairStyle: 'scarf', shoes: 0x2e2a2a, face: { wrinkles: true, eye: '#3c3c3c', brow: '#9a9a9a', lips: '#a06060' } });
  const stick = pbox(0.025, 1.25, 0.025, MC(0x9a7a50)); stick.position.set(0, -0.55, 0.05); p.armL.hand.add(stick);
  const rag = pbox(0.32, 0.04, 0.12, MC(0x8a8070)); rag.position.set(0, -1.18, 0.05); p.armL.hand.add(rag);
  return p;
}
function makeVlad() {
  const p = makePerson({ name: 'Влад', h: 1.66, topTex: TEX.tracksuit, botTex: TEX.tracksuit, hairStyle: 'fringe', hair: 0x24170f, shoes: 0xeeeeee, skin: 0xd8a47c, face: { eye: '#3a2a1a', brow: '#24170f' } });
  const ph = pbox(0.045, 0.085, 0.01, MC(0x141418)); ph.position.set(0, -0.06, 0.035); ph.rotation.x = -0.4; p.armR.hand.add(ph);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.038, 0.07), new THREE.MeshBasicMaterial({ color: 0x8ab4ff })); scr.position.z = 0.006; ph.add(scr);
  p.phoneMesh = ph;
  return p;
}
SCENES.stairs = {
  build() {
    newWorld('stairs');
    const s = W.scene; s.background = new THREE.Color(0x050505);
    const st = (W.st = { shuraDone: false, vladDone: false, bucketDropped: false });
    // свет: окна на пролётах (солнце снаружи), лампочки на этажах
    s.add(new THREE.HemisphereLight(0xdde4ea, 0x4a4238, 0.8));
    const sun = new THREE.DirectionalLight(0xfff0d8, 2.8);
    sun.position.set(-1.5, 14, -13); sun.target.position.set(0, 3, 0); s.add(sun.target);
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 9, bottom: -9, near: 2, far: 40 }); sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.03;
    s.add(sun);
    const mW = MT(TEX.podWhite), mWet = MT(TEX.concreteWet, { phong: true, shininess: 60, specular: 0x333333 }), mC = MT(TEX.concrete), mT = MT(TEX.metlakh);
    const mG = MT(TEX.podGreen, { side: THREE.DoubleSide }), mLine = MC(0x24402f, { side: THREE.DoubleSide });
    // стены колодца
    B(-1.5, -1.5, 0, 0.2, 12.4, 6.4, mW, { col: true, block: true });
    B(1.5, -1.5, 0, 0.2, 12.4, 6.4, mW, { col: true, block: true });
    B(0, -1.5, 3.1, 3.2, 12.4, 0.2, mW, { col: true, block: true });
    const MIDS = [-1.5, 1.5, 4.5, 7.5], FLOORS = [0, 3, 6, 9];
    const holes = [[-1.3, -0.4, -1.5, 0.6]]; for (const m of MIDS.slice(1)) holes.push([-0.6, 0.6, m + 0.9, m + 2.3]);
    holedWall('x', -3.1, -1.6, 1.6, -1.5, 10.9, 0.2, mW, holes);
    B(0, 10.6, 0, 3.4, 0.3, 6.6, mW);
    // зелёная краска до 1.5 м + тёмная полоска сверху
    const band = (axis, c, pts, h = 1.5, line = true) => { bandMesh(axis, c, pts, h, mG); if (line) bandMesh(axis, c, pts.map(([a, y]) => [a, y + h]), 0.035, mLine); };
    for (const f of FLOORS) band('z', -1.39, [[3, f], [1.6, f], [-1.6, f - 1.5], [-3, f - 1.5]]);
    for (const m of MIDS) band('z', 1.39, [[-3, m], [-1.6, m], [1.6, m - 1.5], [3, m - 1.5]]);
    for (const f of FLOORS) band('x', 2.99, [[-1.4, f], [1.4, f]]);
    band('x', -2.99, [[-1.4, -1.5], [-1.3, -1.5]]); band('x', -2.99, [[-0.4, -1.5], [1.4, -1.5]]);
    for (const m of MIDS.slice(1)) { band('x', -2.99, [[-1.4, m], [1.4, m]], 0.9, false); band('x', -2.99, [[-1.4, m + 0.9], [-0.6, m + 0.9]], 0.6); band('x', -2.99, [[0.6, m + 0.9], [1.4, m + 0.9]], 0.6); }
    // площадки этажей (метлахская плитка) и межэтажные (бетон)
    for (const f of FLOORS) { B(0, f - 0.2, 2.3, 2.8, 0.2, 1.4, [mW, mW, mT, mW, mW, mW]); if (f < 9) addSurf(-1.4, 1.6, 1.4, 3, f, 'tile'); }
    B(0, -1.5, 2.3, 2.8, 1.3, 1.4, mW);
    for (const m of MIDS) { B(0, m - 0.2, -2.3, 2.8, 0.2, 1.4, [mW, mW, mC, mW, mW, mW]); addSurf(-1.4, -3, 1.4, -1.6, m, 'concrete'); }
    // марши: левые — вниз от этажа к пролёту, правые — от пролёта к этажу ниже
    for (const f of FLOORS) flight(-1.4, -0.05, 1.6, f, -1.6, f - 1.5, f === 6 ? mWet : mC, f === 6 ? 'wet' : 'concrete', { railX: -0.07, under: mW, nosurf: f === 9 });
    for (const m of [1.5, 4.5, 7.5]) flight(0.05, 1.4, -1.6, m, 1.6, m - 1.5, mC, 'concrete', { railX: 0.07, under: mW, nosurf: m === 7.5 });
    for (const f of [0, 3, 6, 9]) addCol(-0.1, f - 3, -1.65, 0.1, f + 1.0, 1.65);
    addCol(0.05, 6, 1.42, 1.4, 8.5, 1.6); // наверх не идём
    addTrigger(() => P.pos.y > 5.8 && P.pos.x > 0.15 && P.pos.z < 2.0, async () => { bark('Коля', 'Наверх незачем. Там четвёртый, пятый и голуби на чердаке.', 3); }, { once: true });
    // подвал под маршем
    B(0.725, -1.5, -1.7, 1.35, 2.5, 0.2, mW, { col: true, block: true });
    band('x', -1.81, [[0.05, -1.5], [1.4, -1.5]]);
    const bDoor = BX(0.75, -1.5, -1.83, 0.85, 1.9, 0.04, MC(0x4a4c50)); bDoor.material = MC(0x4a4c50);
    decal(grafTex('ПОДВАЛ', { size: 14, color: '#e8e4d8', w: 64, h: 16 }), 0.5, 0.12, 0.75, -0.05, -1.855, Math.PI, { alpha: true });
    addInter({ box: [0.85, 1.9, 0.1], at: [0.75, -0.55, -1.86], label: 'Дверь в подвал', fn: async () => { AU.knock(); await think('Закрыто. Оттуда вечно тянет сыростью и кошками.'); } });
    // окна на пролётах: матовое стекло, подоконник, батарея
    const frost = CT(32, 32, (g, w, h, r) => { noiseFill(g, w, h, '#dfe8ee', 6, r); blotches(g, w, h, r, ['#f2f6f8', '#c8d4dc'], 6, 3, 8, 0.3); }, {});
    for (const m of MIDS.slice(1)) {
      windowAt('x', 0, -3.1, 1.2, m + 0.9, m + 2.3, { inward: 1 });
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), new THREE.MeshBasicMaterial({ map: frost, color: 0xe4ecf2 })); gl.position.set(0, m + 1.6, -3.14); W.scene.add(gl);
      radiator('x', 0, -3.0, 0.9, m + 0.2, 1);
    }
    // двери квартир (по 4 на этаже)
    for (let i = 0; i < 3; i++) {
      const f = i * 3, n = i * 4 + 1, dk = MC(0x2a1c14);
      const dm = (k, face) => { const a = [dk, dk, dk, dk, dk, dk]; a[face] = MT(padDoorTex(k)); return a; };
      BX(-1.37, f, 2.25, 0.06, 2.05, 0.8, dm(n, 0));
      BX(-0.82, f, 2.97, 0.8, 2.05, 0.06, dm(n + 1, 5));
      BX(0.82, f, 2.97, 0.8, 2.05, 0.06, dm(n + 2, 5));
      BX(1.37, f, 2.25, 0.06, 2.05, 0.8, dm(n + 3, 1));
      BX(0, f + 1.0, 2.97, 0.36, 0.72, 0.1, [dk, dk, dk, dk, dk, MT(TEX.panel)]);
      decal(grafTex(String(i + 1) + ' этаж', { size: 13, color: '#1e3a2a', w: 64, h: 16, font: 'Courier New' }), 0.5, 0.12, -1.39, f + 1.75, 1.75, Math.PI / 2, { alpha: true });
    }
    BX(-0.82, 6.001, 2.55, 0.66, 0.012, 0.42, MT(TEX.palas), { cast: false });
    // надписи
    decal(grafTex('ЦОЙ ЖИВ', { size: 22, spray: true, drips: 7, w: 128, h: 32 }), 1.25, 0.32, -1.385, 6.35, -0.1, Math.PI / 2, { alpha: true });
    decal(grafTex('ТУТ БЫЛ КОСТЯН', { size: 13, color: '#1d3fb0', w: 128, h: 24, rot: -0.06 }), 1.0, 0.19, 1.385, 4.75, 0.3, -Math.PI / 2, { alpha: true });
    decal(grafTex('СПАРТАК ЧЕМПИОН', { size: 13, color: '#c81e1e', stroke: '#ffffff', w: 128, h: 24, rot: 0.04 }), 1.2, 0.22, -1.385, 0.5, -0.3, Math.PI / 2, { alpha: true });
    decal(grafTex('здесь был Влад 2017', { size: 11, italic: true, color: '#2a2a2a', w: 128, h: 20 }), 0.7, 0.11, 0.98, 2.9, -2.985, 0, { alpha: true });
    decal(TEX.noSmoke, 0.46, 0.23, -1.0, 3.05, -2.985, 0);
    decal(TEX.notice, 0.33, 0.44, 0.35, -0.15, -2.985, 0);
    BX(1.34, -0.65, -2.4, 0.12, 0.62, 1.0, [MC(0x58606a), MT(TEX.mailbox), MC(0x58606a), MC(0x58606a), MC(0x58606a), MC(0x58606a)]);
    addInter({ box: [1.25, 0.4, 0.2], at: [-1.3, 6.35, -0.1], label: 'Надпись', dist: 2.6, fn: async () => { await think('«Цой жив». Эту надпись тут никто никогда не закрашивает.'); } });
    addInter({ box: [0.2, 0.3, 1.0], at: [1.33, 4.75, 0.3], label: 'Надпись', dist: 2.6, fn: async () => { await think('«Тут был Костян». Хорошо хоть номер квартиры не дописал.'); } });
    addInter({ box: [0.2, 0.3, 1.2], at: [-1.33, 0.5, -0.3], label: 'Надпись', dist: 2.6, fn: async () => { await think('«Спартак — чемпион». Первый раз за шестнадцать лет. Батя на вахте, наверное, орал.'); } });
    addInter({ box: [0.4, 0.5, 0.1], at: [0.35, -0.15, -2.95], label: 'Объявление', fn: async () => { await think('С первого по четырнадцатое июня — без горячей воды. Ну всё, лето.'); } });
    addInter({ box: [0.15, 0.62, 1.0], at: [1.33, -0.34, -2.4], label: 'Почтовые ящики', fn: async () => { await think('Ящик десятой квартиры. Квитанции и реклама пластиковых окон.'); } });
    addInter({ box: [0.8, 2.0, 0.15], at: [-0.82, 7.0, 2.9], label: 'Дверь квартиры', fn: async () => { await think('Мама ещё дома, Алёнка тоже. Всё взял — пора.'); } });
    // лампочки
    const lamps = [];
    for (const f of [0, 3, 6]) lamps.push(bulb(0.2, f + 2.55, 2.3, 0xffe2b0, 1.5, 6, { wire: 0.15 }));
    bulb(-0.3, 1.05, -2.3, 0xffe8c0, 1.1, 5, { wire: 0.15 });
    W.updates.push(() => { lamps[1].intensity = Math.random() < 0.04 ? 0.2 : 1.5; });
    // входная дверь и улица за ней
    const D = makeDoor({ axis: 'x', x: -0.85, z: -3.1, w: 0.9, h: 2.1, y: -1.5, t: 0.06, mat: MC(0x5a3424), openSign: 1 });
    W.D = { exit: D };
    backdrop(TEX.windowView, -0.85, -0.2, -5.0, 8, 4.5, 0);
    floorRect(-2.5, -6, 1, -3.2, -1.5, MT(TEX.asphalt), 1, 'asphalt');
    // --- баба Шура моет пол на пролёте между 3-м и 2-м ---
    const sh = makeShura().add(s); sh.setPos(-0.9, 4.5, -2.45, 0.35); sh.state = 'mop';
    W.shura = sh;
    const bucket = new THREE.Group(); bucket.position.set(-1.2, 4.5, -2.8); s.add(bucket);
    const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.3, 10, 1, true), ps1(new THREE.MeshLambertMaterial({ color: 0x7d8a96, side: THREE.DoubleSide }))); bb.position.y = 0.15; bb.castShadow = true; bucket.add(bb);
    const wat = new THREE.Mesh(new THREE.CircleGeometry(0.14, 10), MC(0x4a5a50)); wat.rotation.x = -Math.PI / 2; wat.position.y = 0.24; bucket.add(wat);
    W.bucket = bucket;
    addCol(-1.25, 4.5, -2.8, -0.6, 6.0, -2.15);
    let swishT = 0;
    W.updates.push((dt) => {
      swishT -= dt;
      if (swishT <= 0 && sh.state === 'mop') { swishT = 1.4 + Math.random(); const d = camera.position.distanceTo(sh.root.position); if (d < 9) AU.noise(0.5, { type: 'bandpass', f: 1200, q: 0.8, vol: 0.05 / (1 + d * 0.5) }); }
    });
    addTrigger(() => !st.shuraDone && P.pos.x < -0.05 && P.pos.y < 5.75 && P.pos.y > 4.6 && P.pos.z < 1.45, () => run(shuraTalk));
    async function shuraTalk() {
      st.shuraDone = true;
      sh.state = 'idle'; sh.face(P.pos.x, P.pos.z); sh.lookP = () => camera.position;
      await say('Баба Шура', 'Воробьёв! Я только помыла!', { p: sh });
      const id = await choose([{ t: '«Извините, баб Шура» — и пройти по краю', id: 'sorry' }, { t: '«Давайте ведро спущу»', id: 'help' }, { t: '«Да ладно, высохнет»', id: 'rude' }]);
      if (id === 'sorry') {
        await say('Коля', 'Извините, баб Шура.');
        bark('Баба Шура', 'По краешку, по краешку!', 2.5);
      } else if (id === 'help') {
        await say('Коля', 'Давайте ведро спущу.');
        await say('Баба Шура', 'Вот ведь бывают люди! Любке своей позвоню, расскажу, какой ты у нас молодец.', { p: sh });
        await say('Баба Шура', 'Внизу у двери поставь, я домою — заберу.', { p: sh });
        setF('помог_бабе_шуре'); trait('доброта', +1); rel('шура', +1);
        bucket.visible = false; S.items.bucket = true; AU.splash();
        addTask('bucket', 'Спустить ведро бабы Шуры к выходу');
      } else {
        await say('Коля', 'Да ладно, высохнет.');
        await say('Баба Шура', 'Я твоей матери всё скажу!', { p: sh });
        setF('нахамил_бабе_шуре'); rel('шура', -1);
      }
      sh.lookP = null; sh.root.rotation.y = 0.35; sh.state = 'mop';
    }
    addTrigger(() => S.items.bucket && P.pos.y < -1.0, () => {
      S.items.bucket = false; st.bucketDropped = true; bucket.visible = true; bucket.position.set(0.1, -1.5, -2.75); AU.noise(0.3, { f: 600, vol: 0.12 });
      doneTask('bucket'); toast('Ведро у двери. Баба Шура заберёт.');
    });
    // --- Влад на подоконнике между 2-м и 1-м ---
    const V = makeVlad().add(s); V.setPos(0.3, 1.66, -2.92, 0); V.state = 'sit';
    W.vlad = V;
    V.extra = (dt, p) => { if (p.state === 'sit') { p.head.rotation.x = 0.1 + Math.abs(Math.sin(GT * Math.PI * 140 / 60)) * 0.12; } };
    let beat = null;
    W.startBeat = () => { beat = AU.beat(); W.updates.push(() => { if (beat) { const d = camera.position.distanceTo(V.headPos(V3())); beat.set((st.verse ? 0.32 : 0.2) / (1 + d * d * 0.22)); } }); };
    addTrigger(() => !st.vladDone && P.pos.x < -0.05 && P.pos.y < 2.9 && P.pos.y > 1.3 && P.pos.z < 1.4, () => run(vladTalk));
    async function vladTalk() {
      st.vladDone = true;
      V.lookP = () => camera.position;
      await say('Влад', 'Воробей, стой. Слушай, че придумал.', { p: V });
      st.verse = true;
      await say('Влад', 'Я с Верхней Максаковки, тут тёмные дворы,\nУ меня два спиннера и нет девчонки до поры...', { p: V, italic: true });
      st.verse = false;
      await say('Влад', 'Ну? Фараон нервно курит?', { p: V });
      const id = await choose([{ t: '«Это огонь, брат»', id: 'fire' }, { t: '«Ну такое. Рифма «дворы — поры» — это сильно»', id: 'honest' }, { t: '«А твоя мамка вчера просила меня сделать потише»', id: 'mamka' }]);
      if (id === 'fire') {
        await say('Коля', 'Это огонь, брат.');
        await say('Влад', 'Я знал. Ты первый после мамки твоей, кто оценил.', { p: V });
        rel('влад', +1);
      } else if (id === 'honest') {
        await say('Коля', 'Ну такое. Рифма «дворы — поры» — это сильно.');
        await say('Влад', 'Ты в искусстве как твоя мамка в физике.', { p: V });
        trait('честность', +1);
      } else {
        await say('Коля', 'А твоя мамка вчера просила меня сделать потише.');
        await say('Влад', 'Ооо, засчитано.', { p: V });
        rel('влад', +1); setF('батл_про_мамок');
      }
      if (F('не_умылся')) await say('Влад', 'Брат, у тебя зубная паста на щеке... а, нет, это ты такой и есть.', { p: V });
      await say('Влад', 'Погнали, Костян во дворе опять что-то затевает.', { p: V });
      V.lookP = null; V.state = 'idle';
      await tween(0.35, (k) => V.setPos(0.3, lerp(1.66, 1.5, k), lerp(-2.92, -2.55, k)));
      
      V.walkTo([[0.7, 1.5, -2.0], [0.72, 1.5, -1.6], [0.72, 0, 1.6], [0.6, 0, 2.15], [-0.7, 0, 2.15], [-0.72, 0, 1.6], [-0.72, -1.5, -1.6], [-0.85, -1.5, -2.55]], 1.9).then(async () => {
        await D.open(0.5, 1.3); await V.walkTo([[-0.85, -1.5, -3.8]], 1.6); V.show(false); if (beat) { beat.stop(); beat = null; }
      });
    }
    // выход
    addInter({ box: [0.9, 2.1, 0.3], at: [-0.85, -0.45, -2.95], label: 'Выйти во двор', fn: async () => {
      if (!st.vladDone) { await vladTalk(); return; }
      if (D.ang < 1) await D.open(0.5, 1.3);
      doneTask('down'); await goScene('yard');
    } });
  },
  async start() {
    setFade(1);
    placePlayer(-0.82, 6, 2.45, 0, -0.12);
    setTasks([{ id: 'down', t: 'Выйти во двор' }]);
    AU.bed({ brown: true, f: 160, vol: 0.035 });
    AU.bed({ brown: false, type: 'bandpass', f: 2500, q: 0.5, vol: 0.006, pos: V3(0, 2.3, -3.2), k: 0.1 });
    W.startBeat();
    AU.door(false);
    await fade(0, 0.9);
    await think('Хлоркой пахнет. Баба Шура опять моет.');
  },
};
