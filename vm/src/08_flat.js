// =====================================================================
// §8. СЦЕНА 1. КВАРТИРА ВОРОБЬЁВЫХ, УТРО (31 мая 2017)
// =====================================================================
const SCENES = {};
const MOM_STORY = [
  'Ты что, не помнишь? Второй класс, ёлка. Ты — Лиса, Хатемка — Колобок.',
  'Ты вместо «я тебя съем» как ляпнешь: «Да тебя не съешь, ты сам всех съешь!» Зал лёг.',
  'А он прям в костюме расплакался... Его потом года два Колобком дразнили. Бедный мальчик.',
];
function makeMom() {
  return makePerson({ name: 'Мама', h: 1.62, skin: 0xe2b292, top: 0x8f74a8, bottom: 0x2a2a38, skirt: 0.52, skirtColor: 0x2c2c3c, hair: 0x5a3420, hairStyle: 'bun', shoes: 0x3a2a2a, face: { lips: '#a8343a', lashes: true, eye: '#3a5a3a', brow: '#4a2a18' } });
}
SCENES.flat = {
  build() {
    newWorld('flat');
    const s = W.scene; s.background = new THREE.Color(0x0a0a0a);
    const st = (W.st = { alarm: null, alarmOn: true, momTalked: false, momHome: true, momInRoom: false, momLeaveAt: Infinity, momWarned: false, bathFree: false, washed: false, wallet: false });
    // свет: солнце с востока через окно Коли, небо, лампочки
    s.add(new THREE.HemisphereLight(0xdfe6f0, 0x6a5440, 0.9));
    const sun = new THREE.DirectionalLight(0xfff0d6, 3.2);
    sun.position.set(11, 6.5, 2.5); sun.target.position.set(2.5, 0, 4.2); s.add(sun.target);
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 }); sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.03;
    s.add(sun);
    const mHall = MT(TEX.wallHall), mRoom = MT(TEX.wallRoom), mMom = MT(TEX.wallMom), mKit = MT(TEX.paintKitchen), mBath = MT(TEX.tilesBath), mWhite = MT(TEX.whitewash);
    const wd = MT(TEX.woodDark), wl = MT(TEX.woodLight);
    // полы и потолок
    floorRect(0, 0, 1.3, 6, 0, MT(TEX.lino), 1.2, 'lino');
    floorRect(-1.8, 0, 0, 1.8, 0, MT(TEX.tilesFloor), 0.8, 'tile');
    floorRect(-2.8, 1.8, 0, 4.6, 0, MT(TEX.linoK), 1.2, 'lino');
    floorRect(1.3, 2.4, 4.9, 6, 0, MT(TEX.parquet), 1.5, 'wood');
    floorRect(1.3, 0, 4.9, 2.4, 0, MT(TEX.parquet), 1.5, 'wood');
    ceilRect(-2.8, 0, 4.9, 6, 2.5, MT(TEX.ceiling), 1.5);
    // стены
    const T = 0.7;
    wallZ(0, 0, 1.8, { pos: mHall, neg: mBath, holes: [[0.45, 1.15, 0, 2.0]], ts: T });
    wallZ(0, 1.8, 4.6, { pos: mHall, neg: mKit, holes: [[2.6, 3.4, 0, 2.05]], ts: T });
    wallZ(0, 4.6, 6, { pos: mHall, neg: mWhite, ts: T });
    wallZ(1.3, 0, 2.4, { pos: mMom, neg: mHall, holes: [[0.95, 1.75, 0, 2.05]], ts: T });
    wallZ(1.3, 2.4, 6, { pos: mRoom, neg: mHall, holes: [[2.8, 3.6, 0, 2.05]], ts: T });
    wallZ(4.9, 0, 2.4, { pos: mWhite, neg: mMom, holes: [[0.6, 1.8, 0.85, 2.2]], ts: T });
    wallZ(4.9, 2.4, 6, { pos: mWhite, neg: mRoom, holes: [[3.7, 4.9, 0.85, 2.2]], ts: T });
    wallZ(-1.8, 0, 1.8, { pos: mBath, neg: mWhite, ts: 0.6 });
    wallZ(-2.8, 1.8, 4.6, { pos: mKit, neg: mWhite, holes: [[2.7, 3.7, 0.85, 2.2]], ts: T });
    wallX(0, -1.8, 0, { pos: mBath, neg: mWhite, ts: 0.6 });
    wallX(0, 0, 1.3, { pos: mHall, neg: mWhite, holes: [[0.25, 1.05, 0, 2.05]], ts: T });
    wallX(0, 1.3, 4.9, { pos: mMom, neg: mWhite, ts: T });
    wallX(1.8, -2.8, -1.8, { pos: mKit, neg: mWhite, ts: T });
    wallX(1.8, -1.8, 0, { pos: mKit, neg: mBath, ts: 0.6 });
    wallX(2.4, 1.3, 4.9, { pos: mRoom, neg: mMom, ts: T });
    wallX(4.6, -2.8, 0, { pos: mWhite, neg: mKit, ts: T });
    wallX(6, 0, 1.3, { pos: mWhite, neg: mHall, ts: T });
    wallX(6, 1.3, 4.9, { pos: mWhite, neg: mRoom, ts: T });
    // окна и вид за окном
    windowAt('z', 4.9, 4.3, 1.2, 0.85, 2.2, { inward: -1 });
    windowAt('z', 4.9, 1.2, 1.2, 0.85, 2.2, { inward: -1 });
    windowAt('z', -2.8, 3.2, 1.0, 0.85, 2.2, { inward: 1 });
    backdrop(TEX.windowView, 9, 1.8, 2.8, 14, 7, -Math.PI / 2);
    backdrop(TEX.windowView, -7, 1.8, 3.2, 10, 5, Math.PI / 2);
    radiator('z', 4.84, 1.2, 0.9, 0.2, -1); radiator('z', -2.74, 3.2, 0.7, 0.2, 1);
    // двери
    const D = (W.D = {});
    D.entrance = makeDoor({ axis: 'x', x: 0.65, z: 0, w: 0.8, h: 2.05, mat: MT(padDoorTex(10)), side: wd, openSign: 1 });
    D.bath = makeDoor({ axis: 'z', x: 0, z: 0.8, w: 0.7, h: 2.0, mat: MT(TEX.doorWhite), side: MC(0xe0dccf), openSign: -1 });
    D.kitchen = makeDoor({ axis: 'z', x: 0, z: 3.0, w: 0.8, h: 2.05, mat: MT(TEX.doorGlass), side: MC(0xe0dccf), openSign: -1, open: 1.5 });
    D.mom = makeDoor({ axis: 'z', x: 1.3, z: 1.35, w: 0.8, h: 2.05, mat: MT(TEX.doorWhite), side: MC(0xe0dccf), openSign: 1 });
    D.room = makeDoor({ axis: 'z', x: 1.3, z: 3.2, w: 0.8, h: 2.05, mat: MT(TEX.doorWhite), side: MC(0xe0dccf), openSign: 1, open: 1.35 });
    doorFrame('x', 0.65, 0, 0.8, 2.05); doorFrame('z', 0, 0.8, 0.7, 2.0); doorFrame('z', 0, 3.0, 0.8, 2.05); doorFrame('z', 1.3, 1.35, 0.8, 2.05); doorFrame('z', 1.3, 3.2, 0.8, 2.05);
    // --- комната Коли ---
    BX(2.9, 0, 5.575, 2.0, 0.32, 0.85, wd, { col: true });
    BX(2.85, 0.32, 5.575, 1.9, 0.12, 0.8, MT(TEX.plaid));
    BX(3.93, 0, 5.575, 0.06, 0.75, 0.85, wd);
    const pillow = BX(3.66, 0.44, 5.575, 0.34, 0.1, 0.55, MC(0xf2efe6));
    const mySpinner = makeSpinner({ color: 0x1f4fa8 }); mySpinner.position.set(3.5, 0.452, 5.36); mySpinner.rotation.y = 0.7; s.add(mySpinner);
    decal(TEX.carpet, 2.0, 1.45, 2.9, 1.3, 5.94, Math.PI);
    BX(4.2, 0, 5.65, 0.4, 0.5, 0.45, wl, { col: true });
    const phone = BX(4.18, 0.5, 5.62, 0.075, 0.012, 0.14, MC(0x18181c));
    const phoneScr = decal(TEX.monitorOn, 0.06, 0.11, 4.18, 0.507, 5.62, 0, { rx: -Math.PI / 2, emissive: 0x88aaff });
    decal(TEX.poster, 0.6, 0.8, 4.84, 1.6, 5.35, -Math.PI / 2);
    BX(4.55, 0, 4.3, 0.6, 0.74, 1.2, wl, { col: true });
    BX(4.62, 0.74, 4.05, 0.38, 0.34, 0.38, MC(0xd8d2c0));
    decal(TEX.monitorOn, 0.29, 0.23, 4.428, 0.92, 4.05, -Math.PI / 2, { emissive: 0x6688cc });
    BX(4.35, 0.74, 4.5, 0.16, 0.025, 0.42, MC(0xd8d2c0));
    // стул и рюкзак
    BX(3.95, 0.42, 4.35, 0.42, 0.04, 0.42, wl); for (const [dx, dz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) BX(3.95 + dx, 0, 4.35 + dz, 0.04, 0.42, 0.04, wl);
    BX(3.75, 0.46, 4.35, 0.04, 0.45, 0.42, wl); addCol(3.72, 0, 4.13, 4.17, 0.9, 4.57);
    const pack = new THREE.Group(); s.add(pack);
    BX(3.98, 0.46, 4.35, 0.22, 0.38, 0.3, MC(0x2a4a7a), { parent: pack }); BX(4.1, 0.5, 4.35, 0.05, 0.2, 0.24, MC(0x1e3a62), { parent: pack }); BX(3.98, 0.84, 4.35, 0.18, 0.03, 0.2, MC(0x1a1a1a), { parent: pack });
    // кровать Алёнки
    BX(3.95, 0, 2.85, 1.8, 0.3, 0.8, wl, { col: true }); BX(3.95, 0.3, 2.85, 1.75, 0.12, 0.75, MT(TEX.pinkDots)); BX(4.65, 0.42, 2.85, 0.28, 0.09, 0.5, MC(0xf4eef0));
    BX(4.55, 0.42, 2.62, 0.14, 0.16, 0.1, MC(0xf0f0f0)); BX(4.53, 0.58, 2.62, 0.03, 0.12, 0.03, MC(0xf0f0f0)); BX(4.58, 0.58, 2.62, 0.03, 0.12, 0.03, MC(0xf0f0f0));
    BX(1.65, 0, 4.55, 0.6, 2.1, 1.05, wd, { col: true });
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 1), MC(0xf2f2f2, { flatShading: true })); ball.position.set(2.45, 0.11, 3.85); ball.castShadow = true; s.add(ball);
    decal(TEX.palas, 1.4, 2.0, 2.75, 0.006, 4.15, 0, { rx: -Math.PI / 2 });
    CYL(3.1, 2.25, 4.2, 0.18, 0.12, 0.2, 8, MC(0xf4ecd8));
    // --- кухня ---
    BX(-2.35, 0, 3.2, 0.7, 0.72, 0.9, wl, { col: true }); BX(-2.35, 0.72, 3.2, 0.76, 0.015, 0.96, MT(TEX.oilcloth));
    BX(-1.85, 0, 2.75, 0.32, 0.45, 0.32, MT(TEX.woodPaint), { col: true }); BX(-1.85, 0, 3.7, 0.32, 0.45, 0.32, MT(TEX.woodPaint), { col: true });
    CYL(-2.3, 0.735, 3.05, 0.045, 0.04, 0.09, 8, MC(0xf0f0f0)); CYL(-2.45, 0.735, 3.45, 0.1, 0.1, 0.02, 10, MC(0xe8e8e0));
    BX(-1.0, 0, 4.3, 0.5, 0.85, 0.55, MC(0xeeeeea), { col: true });
    for (const [dx, dz] of [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]]) CYL(-1.0 + dx, 0.85, 4.3 + dz, 0.07, 0.07, 0.01, 8, MC(0x202020));
    CYL(-1.12, 0.86, 4.18, 0.08, 0.1, 0.17, 8, MC(0xc83a3a)); BX(-1.0, 0.0, 4.02, 0.4, 0.3, 0.01, MC(0x2a2a2a));
    BX(-1.8, 0, 4.3, 0.8, 0.85, 0.55, MC(0xe8e4dc), { col: true }); BX(-1.8, 0.85, 4.3, 0.5, 0.02, 0.4, MC(0xb8bcc4)); BX(-1.8, 0.86, 4.5, 0.03, 0.25, 0.03, MC(0xc0c4cc)); BX(-1.8, 1.08, 4.42, 0.03, 0.03, 0.16, MC(0xc0c4cc));
    BX(-1.6, 1.6, 4.42, 1.4, 0.6, 0.32, MC(0xe8e4dc));
    B(-1.4, 0.85, 4.545, 2.8, 0.65, 0.01, MT(TEX.tilesWhite), { ts: 0.6, cast: false });
    BX(-0.35, 0, 4.25, 0.6, 1.45, 0.6, MC(0xf2f0ea), { col: true }); BX(-0.35, 1.0, 3.94, 0.04, 0.25, 0.03, MC(0xb0b0a8));
    BX(-0.35, 1.45, 4.25, 0.42, 0.32, 0.36, MC(0x2a2a2a));
    const tvScr = decal(TEX.tv, 0.32, 0.24, -0.35, 1.61, 4.068, Math.PI, { emissive: 0xaabbcc });
    W.updates.push(() => { tvScr.material.emissiveIntensity = 0.7 + Math.sin(GT * 13) * 0.08 + (Math.random() < 0.05 ? 0.3 : 0); });
    decal(calendarTex(), 0.3, 0.42, -0.056, 1.5, 4.1, -Math.PI / 2);
    CYL(-1.4, 2.28, 3.2, 0.2, 0.14, 0.18, 8, MC(0xf4ecd8));
    bulb(-1.4, 2.25, 3.2, 0xffe2b8, 2.6, 7, { mesh: false });
    // --- ванная ---
    BX(-1.45, 0, 0.9, 0.7, 0.55, 1.7, MC(0xf4f4f0), { col: true }); BX(-1.45, 0.5, 0.9, 0.56, 0.06, 1.56, MC(0xd0d6d8));
    BX(-0.6, 0.75, 1.6, 0.5, 0.12, 0.34, MC(0xf4f4f0)); BX(-0.6, 0, 1.68, 0.14, 0.75, 0.14, MC(0xf4f4f0), { col: true }); BX(-0.6, 0.87, 1.74, 0.03, 0.15, 0.03, MC(0xc0c4cc));
    decal(null, 0.45, 0.55, -0.6, 1.45, 1.743, Math.PI, { color: 0x9fb4bc });
    BX(-0.25, 1.15, 1.7, 0.3, 0.02, 0.12, MC(0xe8e8e8)); CYL(-0.3, 1.17, 1.7, 0.03, 0.03, 0.09, 6, MC(0x4a90c8));
    bulb(-0.9, 2.3, 0.9, 0xf0f0ff, 1.6, 4, { mesh: false });
    // --- прихожая ---
    BX(1.08, 0, 0.5, 0.4, 0.8, 0.7, wd, { col: true });
    const wallet = BX(1.05, 0.8, 0.42, 0.14, 0.035, 0.09, MT(TEX.koshelek)); wallet.rotation.y = 0.3;
    BX(1.1, 0.8, 0.72, 0.16, 0.07, 0.2, MC(0xc8c4b8)); BX(1.1, 0.87, 0.72, 0.05, 0.03, 0.18, MC(0xb8b4a8));
    decal(null, 0.5, 0.7, 1.245, 1.5, 0.5, -Math.PI / 2, { color: 0xa8b8c0 });
    BX(0.06, 1.75, 1.85, 0.04, 0.04, 1.0, wd); BX(0.15, 0.95, 1.55, 0.18, 0.8, 0.4, MC(0x6a4a3a)); BX(0.14, 1.0, 2.05, 0.16, 0.75, 0.36, MC(0x3a4a6a)); addCol(0, 0.9, 1.3, 0.26, 1.8, 2.3);
    BX(0.25, 0, 1.6, 0.28, 0.1, 0.12, MC(0x2a2018)); BX(0.27, 0, 1.9, 0.26, 0.09, 0.11, MC(0x8a8a90)); BX(0.24, 0, 2.2, 0.3, 0.12, 0.13, MC(0xe0e0e0));
    BX(0.15, 1.05, 4.8, 0.26, 0.03, 1.1, wd); BX(0.15, 1.45, 4.8, 0.26, 0.03, 1.1, wd); BX(0.15, 0.95, 4.27, 0.26, 0.55, 0.03, wd); BX(0.15, 0.95, 5.33, 0.26, 0.55, 0.03, wd);
    const photoCanvas = drawUtrennikPhoto();
    const ptex = new THREE.CanvasTexture(photoCanvas); ptex.colorSpace = THREE.SRGBColorSpace;
    BX(0.12, 1.08, 4.55, 0.02, 0.2, 0.27, MC(0x8a6a3a)); decal(ptex, 0.23, 0.16, 0.135, 1.18, 4.55, Math.PI / 2);
    BX(0.12, 1.08, 4.95, 0.02, 0.18, 0.14, MC(0x6a4a2a)); BX(0.12, 1.48, 4.6, 0.18, 0.2, 0.5, MC(0x8a3a2a)); BX(0.12, 1.48, 5.05, 0.18, 0.24, 0.3, MC(0x2a4a6a));
    BX(0.65, 0, 5.72, 1.2, 2.2, 0.5, wd, { col: true });
    decal(TEX.palas, 0.6, 0.9, 0.65, 0.006, 0.6, 0, { rx: -Math.PI / 2 });
    CYL(0.65, 2.3, 2.2, 0.15, 0.1, 0.15, 8, MC(0xf4ecd8));
    bulb(0.65, 2.28, 2.2, 0xffe0b0, 2.0, 6, { mesh: false });
    // --- мамина комната ---
    BX(3.0, 0, 2.05, 1.8, 0.45, 0.6, MC(0x6a3a4a), { col: true }); BX(3.0, 0.45, 2.3, 1.8, 0.4, 0.15, MC(0x6a3a4a));
    BX(3.1, 0, 0.27, 2.6, 2.0, 0.45, wd, { col: true });
    // персонажи
    const mom = (W.mom = makeMom().add(s)); mom.setPos(-1.25, 0, 3.0, Math.PI / 2); mom.state = 'tea';
    const mug = CYL(0, 0, 0, 0.035, 0.03, 0.08, 8, MC(0xe8e0d0), { parent: mom.armR.hand }); mug.position.set(0, -0.05, 0.05);
    const alyona = (W.alyona = makePerson({ name: 'Алёнка', h: 1.32, topTex: TEX.pinkDots, botTex: TEX.pinkDots, hair: 0x8a5a2a, hairStyle: 'tails', shoes: 0xe0a0b0, face: { freckles: true, blush: true, eye: '#4a6a3a', brow: '#7a4a20', lips: '#c0505a' } }).add(s));
    alyona.setPos(-0.55, 0, 0.9, Math.PI / 2); alyona.show(false);
    BX(0, -0.03, 0.06, 0.03, 0.12, 0.03, MC(0xd04080), { parent: alyona.armR.hand });
    // --- интерактив ---
    let ring = 0;
    W.updates.push((dt) => {
      if (st.alarmOn) { ring += dt; phone.position.x = 4.18 + Math.sin(ring * 60) * 0.004 * (Math.sin(ring * 3) > 0 ? 1 : 0); phoneScr.position.x = phone.position.x; }
      if (st.momInRoom && st.momHome && !st.leaving) {
        if (!st.momWarned && GT > st.momLeaveAt - 45 && !BUSY) { st.momWarned = true; bark('Голос мамы', 'Коль, я через пару минут убегаю!'); }
        if (GT > st.momLeaveAt && !BUSY) momLeave();
      }
    });
    addInter({ box: [0.3, 0.15, 0.3], at: [4.18, 0.55, 5.62], label: 'Выключить будильник', cond: () => st.alarmOn, fn: async () => {
      st.alarmOn = false; if (st.alarm) st.alarm.stop(); phone.visible = false; phoneScr.visible = false; S.items.phone = true; doneTask('alarm');
      await think('7:30. Последний день седьмого класса. Почти лето.');
      bark('Голос мамы', 'Коля, встал? Зайди на кухню!', 4);
      addTask('spinner', 'Найти спиннер'); addTask('backpack', 'Взять рюкзак'); addTask('wash', 'Умыться'); addTask('kitchen', 'Зайти к маме на кухню');
    } });
    addInter({ box: [0.4, 0.2, 0.6], at: [3.66, 0.5, 5.575], label: 'Заглянуть под подушку', cond: () => !S.items.spinner && !st.alarmOn, fn: async () => {
      await tween(0.35, (k) => { pillow.position.y = 0.49 + k * 0.08; pillow.rotation.z = k * 0.25; });
      mySpinner.visible = false; S.items.spinner = true; doneTask('spinner'); AU.tone(1200, 0.1, { type: 'triangle', vol: 0.04 });
      await tween(0.3, (k) => { pillow.position.y = 0.57 - k * 0.08; pillow.rotation.z = 0.25 - k * 0.25; });
      await think('Вот он. Мой, на подшипниках.');
      showHint('<b>F</b> — покрутить спиннер', 6);
    } });
    addInter({ box: [0.4, 0.5, 0.4], at: [3.98, 0.65, 4.35], label: 'Взять рюкзак', cond: () => !S.items.backpack, fn: async () => {
      pack.visible = false; S.items.backpack = true; doneTask('backpack'); AU.noise(0.25, { f: 900, vol: 0.08 });
      await think('Дневник внутри. Сегодня годовые оценки.');
    } });
    addInter({ box: [1.8, 1.2, 0.2], at: [2.9, 1.3, 5.85], label: 'Ковёр', dist: 1.8, fn: async () => { await think('Ковёр. В детстве я по нему узоры считал, пока не усну.'); } });
    addInter({ box: [0.15, 0.85, 0.65], at: [4.8, 1.6, 5.35], label: 'Постер', fn: async () => { await think('«Спартак» — чемпион! Первый раз за шестнадцать лет.'); } });
    addInter({ box: [0.45, 0.4, 0.45], at: [4.6, 0.92, 4.05], label: 'Компьютер', fn: async () => { await think('Комп. Вечером, если оценки нормальные, — катка в CS.'); } });
    addInter({ box: [0.2, 1.3, 1.2], at: [4.8, 1.55, 4.3], label: 'Окно', fn: async () => { await think('Пятиэтажки, тополя. Верхняя Максаковка во всей красе.'); } });
    addInter({ box: [0.2, 1.3, 1.0], at: [-2.7, 1.55, 3.2], label: 'Окно', fn: async () => { await think('Во дворе уже кто-то орёт. Походу, Костян.'); } });
    addInter({ box: [0.5, 0.4, 0.4], at: [-0.35, 1.61, 4.2], label: 'Телевизор', fn: async () => { await think('Новости. Мама всегда включает их «для фона».'); } });
    addInter({ box: [0.62, 1.2, 0.1], at: [-0.35, 0.8, 3.92], label: 'Холодильник', fn: async () => { await think('Кабачковая икра, пельмени и банка огурцов. Классика.'); } });
    addInter({ box: [0.3, 0.2, 0.3], at: [1.1, 0.88, 0.72], label: 'Домашний телефон', fn: async () => { await think('Домашний. На него звонит только баба Шура.'); } });
    // мама
    const momInter = addInter({ box: [0.6, 1.7, 0.6], at: [-1.25, 0.85, 3.0], label: 'Поговорить с мамой', cond: () => !st.momTalked && !st.momInRoom, fn: momTalk });
    W.momInter = momInter;
    addTrigger(() => !st.momTalked && !st.alarmOn && P.pos.x < -0.25 && P.pos.z > 1.9 && P.pos.z < 4.5, () => run(momTalk));
    async function momTalk() {
      if (st.momTalked) return;
      st.momTalked = true; mom.state = 'idle'; mom.face(P.pos.x, P.pos.z); mom.lookP = () => camera.position;
      await say('Мама', 'Коль, сегодня годовые оценки, да? Если по алгебре двойка — лето у бабушки в огороде.', { p: mom });
      await say('Коля', 'Там тройка. Наверное.');
      await say('Мама', '«Наверное»... И ещё: папа вчера звонил. Вахту продлили, приедет не в субботу. Вечером ещё позвонит.', { p: mom });
      await say('Мама', 'Всё, пойду собираться.', { p: mom });
      doneTask('kitchen');
      hideDlg(); momToRoom();
    }
    async function momToRoom() {
      mom.lookP = null; mom.state = 'idle';
      await mom.walkTo([[-0.3, 0, 3.0], [0.65, 0, 3.0], [0.65, 0, 1.35], [1.0, 0, 1.35]]);
      await W.D.mom.open(0.5, 1.4);
      await mom.walkTo([[2.4, 0, 1.3]]);
      mom.face(3.0, 1.0); st.momInRoom = true; st.momLeaveAt = GT + 150;
      await W.D.mom.close();
    }
    async function momLeave() {
      if (st.leaving) return; st.leaving = true;
      await W.D.mom.open(0.5, 1.4);
      await mom.walkTo([[1.7, 0, 1.35], [0.65, 0, 1.1], [0.65, 0, 0.5]]);
      bark('Мама', 'Всё, Коль, я убежала! Не опоздай!', 3.5);
      st.momHome = false; wallet.visible = false; walletInter.on = false;
      W.D.mom.close();
      await W.D.entrance.open(0.5, 1.3);
      await mom.walkTo([[0.65, 0, -0.7]]);
      mom.show(false); await W.D.entrance.close();
    }
    addInter({ box: [0.15, 1.9, 0.8], at: [1.24, 1.0, 1.35], label: 'Мамина комната', cond: () => !st.leaving, fn: async () => {
      if (st.momInRoom && st.momHome) { AU.knock(); await say('Голос мамы', 'Коль, я переодеваюсь! Что хотел?'); }
      else await think('Мамина комната. Мама на кухне.');
    } });
    // кошелёк
    const walletInter = addInter({ box: [0.3, 0.15, 0.3], at: [1.05, 0.85, 0.42], label: 'Мамин кошелёк', cond: () => !st.wallet, fn: async () => {
      if (!st.momInRoom) { await think('Мамин кошелёк. Мама рядом, на кухне. Даже не думай.'); return; }
      const opts = [{ t: 'Тихо взять 100 ₽', id: 'take' }];
      if (st.momHome) opts.push({ t: 'Попросить: «Мам, дай на праздник конца года?»', id: 'ask' });
      opts.push({ t: 'Ничего не брать', id: 'none' });
      await think('Кошелёк лежит на тумбочке. Мама у себя в комнате.');
      const id = await choose(opts);
      if (id === 'take') { setF('взял_деньги_мамы'); S.money = 100; AU.coins(); toast('+100 ₽'); }
      else if (id === 'ask') { await say('Коля', 'Мам, дай на праздник конца года?'); await say('Голос мамы', 'На полтинник, и не на ерунду.'); setF('попросил_деньги'); S.money = 50; AU.coins(); toast('+50 ₽'); }
      else { setF('не_взял_деньги'); await think('Не, обойдусь.'); }
      st.wallet = true; renderTasks();
    } });
    // фото с утренника
    addInter({ box: [0.35, 0.5, 1.1], at: [0.18, 1.25, 4.8], label: 'Полка с фотографиями', fn: async () => {
      await showPhoto(photoCanvas, 'Фото на полке. Подпись маминой рукой: «2 класс, ёлка»');
      if (F('вспомнил_утренник')) { await think('Лиса и Колобок. Теперь-то я помню.'); return; }
      await think('Утренник какой-то. Ничего не помню.'); setF('видел_фото_утренника');
      const opts = []; if (st.momHome && !st.leaving) opts.push({ t: 'Показать фото маме, пока она не ушла: «Мам, а это что за утренник?»', id: 'ask' });
      opts.push({ t: 'Поставить на место', id: 'put' });
      const id = await choose(opts);
      if (id === 'ask') {
        await say('Коля', 'Мам, а это что за утренник?');
        const near = !st.momInRoom; const who = near ? 'Мама' : 'Голос мамы';
        for (const line of MOM_STORY) await say(who, line, near ? { p: mom } : {});
        setF('вспомнил_утренник');
        await think('Хатем — Колобок... Вот почему он на меня всё время так зыркает.');
      } else if (!st.momHome) await think('Мама уже ушла. Вечером спрошу.');
    } });
    // ванная
    let sing = null;
    W.startSinging = () => { sing = AU.singing(); W.updates.push(() => { if (sing) { const d = camera.position.distanceTo(V3(-0.6, 1.4, 0.9)); sing.set(st.bathFree ? 0 : 0.5 / (1 + d * d * 0.35)); } }); };
    addInter({ box: [0.2, 1.9, 0.75], at: [0.08, 1.0, 0.8], label: 'Постучать в ванную', cond: () => !st.bathFree, fn: async () => {
      AU.knock(); await wait(0.5);
      await think('Алёнка опять поёт в расчёску.');
      const id = await choose([{ t: '«Алён, ну выходи, пожалуйста»', id: 'nice' }, { t: '«Выходи, а то маме расскажу, что ты её помаду брала»', id: 'threat' }, { t: 'Отойти', id: 'leave' }]);
      if (id === 'leave') return;
      if (id === 'nice') {
        await say('Коля', 'Алён, ну выходи, пожалуйста.');
        await say('Алёнка', 'Ща-а-ас!');
        hideDlg(); await fade(1, 0.5); showCard('Через минуту…', '', 1.6); await wait(1.4); await fade(0, 0.5);
        rel('сестра', +1);
        await alyonaOut(false);
      } else {
        await say('Коля', 'Выходи, а то маме расскажу, что ты её помаду брала!');
        await alyonaOut(true);
        rel('сестра', -1);
      }
    } });
    async function alyonaOut(angry) {
      st.bathFree = true; if (sing) sing.stop();
      W.D.bath.open(angry ? 0.25 : 0.6, 1.5);
      alyona.show(true); alyona.setPos(-0.55, 0, 0.9, Math.PI / 2);
      const pace = angry ? 3.2 : 1.3;
      if (angry) { bark('Алёнка', 'Ябеда!', 2.5); AU.door(true); }
      await alyona.walkTo([[0.45, 0, 0.9]], pace);
      alyona.walkTo([[0.65, 0, 3.2], [2.2, 0, 3.25], [3.3, 0, 3.6]], pace).then(() => { alyona.face(4.0, 2.85); alyona.lookP = () => camera.position; });
    }
    addInter({ box: [0.5, 1.4, 0.5], at: [3.3, 0.7, 3.6], label: 'Алёнка', cond: () => st.bathFree && alyona.visible && !alyona.path, fn: async () => {
      if ((S.rel['сестра'] || 0) > 0) await say('Алёнка', 'Ванная свободна, ваше величество.', { p: alyona });
      else await say('Алёнка', 'Не разговариваю с тобой.', { p: alyona });
    } });
    addInter({ box: [0.6, 0.4, 0.45], at: [-0.6, 0.95, 1.55], label: 'Умыться', cond: () => st.bathFree && !st.washed, fn: async () => {
      AU.splash(); await fade(0.85, 0.3); await wait(0.6); await fade(0, 0.4);
      st.washed = true; doneTask('wash');
      await think('Бр-р. Холодная. Зато проснулся.');
    } });
    // выход
    addInter({ box: [0.9, 2.0, 0.25], at: [0.65, 1.0, 0.14], label: 'Выйти в подъезд', cond: () => !st.leaving || st.momHome === false, fn: async () => {
      if (st.alarmOn) { await think('Сначала будильник выключить.'); return; }
      if (!S.items.spinner) { await think('Без спиннера? В последний день? Не, он где-то под подушкой.'); return; }
      if (!S.items.backpack) { await think('Рюкзак забыл. Там дневник, сегодня же годовые.'); return; }
      if (!st.momTalked) { await say('Голос мамы', 'Коля! Ну-ка зайди на кухню!'); return; }
      if (!st.washed) setF('не_умылся');
      if (st.momHome) bark('Голос мамы', 'Дверь захлопни!', 2);
      await W.D.entrance.open(0.5, 1.2);
      await goScene('stairs');
    } });
  },
  async start() {
    const st = W.st;
    CAM.override = true; CAM.pos.set(3.62, 0.72, 5.58); CAM.yaw = Math.PI; CAM.pitch = 1.15;
    setFade(1); setTasks([]);
    st.alarm = AU.alarm(); W.startSinging();
    AU.bed({ brown: true, f: 220, vol: 0.02 });
    AU.bed({ brown: true, f: 700, vol: 0.05, pos: V3(-0.35, 1.6, 4.1), k: 0.4, mod: (t) => 0.5 + 0.5 * Math.sin(t * 3.1) * Math.sin(t * 1.7 + 1) });
    showCard('Верхняя Максаковка', '31 мая 2017, среда · 7:30', 5);
    await wait(2.4);
    await fade(0.55, 0.25); await fade(1, 0.2); await wait(0.35); await fade(0, 0.7);
    await tween(2.2, (k) => { CAM.pitch = lerp(1.15, 0.1, k); });
    await wait(0.5);
    await tween(1.8, (k) => { CAM.pos.set(lerp(3.62, 3.35, k), lerp(0.72, 1.1, k), lerp(5.58, 5.3, k)); CAM.yaw = lerpAng(Math.PI, -1.3, k); CAM.pitch = lerp(0.1, 0.05, k); });
    await wait(0.7);
    await tween(1.0, (k) => { CAM.pos.set(lerp(3.35, 3.3, k), lerp(1.1, 1.5, k), lerp(5.3, 4.85, k)); CAM.yaw = lerpAng(-1.3, -0.9, k); CAM.pitch = lerp(0.05, -0.25, k); });
    placePlayer(3.3, 0, 4.85, CAM.yaw, CAM.pitch); CAM.override = false;
    setTasks([{ id: 'alarm', t: 'Выключить будильник' }]);
    showHint('Мышь — осмотреться · <b>WASD</b> — идти · <b>Shift</b> — бегом · <b>E</b> — действие · <b>Esc</b> — меню', 10);
  },
};
function padDoorTex(num) {
  padDoorTex.c = padDoorTex.c || {};
  if (padDoorTex.c[num]) return padDoorTex.c[num];
  const base = ['#5b2f20', '#3e2a22', '#6a3a28', '#4a3020'][num % 4];
  const t = CT(64, 128, (g, w, h, r) => {
    noiseFill(g, w, h, base, 16, r);
    g.strokeStyle = 'rgba(20,8,4,0.6)'; g.lineWidth = 1;
    for (let i = -128; i < 192; i += 16) { g.beginPath(); g.moveTo(i, 8); g.lineTo(i + 120, 128); g.stroke(); g.beginPath(); g.moveTo(i + 120, 8); g.lineTo(i, 128); g.stroke(); }
    for (let y = 8; y < h; y += 16) for (let x = 0; x < w; x += 16) px(g, x + ((y / 16) % 2 ? 8 : 0) - 1, y - 1, '#d6b46c', 2, 2);
    g.fillStyle = '#2a140c'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); g.fillRect(w - 3, 0, 3, h);
    px(g, 24, 16, '#c8a24c', 16, 11); g.fillStyle = '#3a2410'; g.font = 'bold 9px Arial'; g.textAlign = 'center'; g.fillText(String(num), 32, 25);
    px(g, 31, 34, '#111', 3, 3); px(g, 50, 64, '#c0a060', 8, 3); px(g, 52, 72, '#777', 3, 6);
  }, { rep: false, seed: num * 31 });
  padDoorTex.c[num] = t; return t;
}
function calendarTex() {
  return CT(48, 64, (g, w, h) => {
    g.fillStyle = '#f4f0e6'; g.fillRect(0, 0, w, h); g.fillStyle = '#c02020'; g.fillRect(0, 0, w, 14);
    g.fillStyle = '#fff'; g.font = 'bold 9px Arial'; g.textAlign = 'center'; g.fillText('2017', w / 2, 10);
    g.fillStyle = '#222'; g.font = 'bold 8px Arial'; g.fillText('МАЙ', w / 2, 24);
    for (let i = 0; i < 31; i++) { const c = (i + 0) % 7, rr = Math.floor((i + 0) / 7); g.fillStyle = c >= 5 ? '#c02020' : '#444'; g.fillRect(4 + c * 6, 30 + rr * 6, 4, 4); }
    g.strokeStyle = '#c02020'; g.strokeRect(4 + 2 * 6 - 1.5, 30 + 4 * 6 - 1.5, 7, 7);
  }, { rep: false });
}
