// =====================================================================
// §5. ЛЮДИ: low-poly персонажи из коробок с процедурной анимацией
// =====================================================================
function pbox(w, h, d, mat) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.castShadow = true; m.receiveShadow = true; return m; }
function grp(parent, x = 0, y = 0, z = 0) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; }

function makePerson(o) {
  const H = o.h || 1.6, bw = o.bw || 1;
  const P = { o, name: o.name, H, root: new THREE.Group(), state: 'idle', t: Math.random() * 10, ph: 0, talking: false, speed: o.speed || 1.3, path: null, lookP: null, mouthT: 0, extra: null, visible: true };
  const skin = MC(o.skin || 0xd9a982);
  const topM = o.topTex ? MT(o.topTex) : MC(o.top || 0x445566);
  const sleeveM = o.sleeveTex ? MT(o.sleeveTex) : topM;
  const botM = o.botTex ? MT(o.botTex) : MC(o.bottom || 0x2a2a34);
  const shoeM = MC(o.shoes || 0x1e1e1e);
  const hairM = o.hairTex ? MT(o.hairTex) : MC(o.hair || 0x3a2a1a);
  const legL = H * 0.47, uLeg = H * 0.245, lLeg = legL - uLeg, footH = H * 0.04;
  const torsoH = H * 0.29, neck = H * 0.025, headH = H * 0.135, headW = H * 0.105 * (o.headW || 1), headD = H * 0.115;
  const shW = H * 0.23 * bw, hipW = H * 0.17 * bw, tD = H * 0.1 * bw * (o.belly || 1), limb = H * 0.058 * Math.sqrt(bw);
  const uArm = H * 0.17, lArm = H * 0.165;
  Object.assign(P, { legL, uLeg, lLeg, torsoH, headH });
  const hips = grp(P.root, 0, legL, 0); P.hips = hips;
  const pelvis = pbox(hipW, H * 0.06, tD * 0.95, botM); pelvis.position.y = 0.0; hips.add(pelvis);
  const spine = grp(hips, 0, 0.01, 0); P.spine = spine;
  const torso = pbox(shW, torsoH, tD, topM); torso.position.y = torsoH / 2; spine.add(torso);
  if (o.belly && o.belly > 1.1) { const b = pbox(shW * 0.9, torsoH * 0.5, tD * 0.4, topM); b.position.set(0, torsoH * 0.3, tD * 0.55); spine.add(b); }
  const neckG = grp(spine, 0, torsoH, 0);
  const nm = pbox(limb * 0.9, neck * 1.6, limb * 0.9, skin); nm.position.y = neck * 0.5; neckG.add(nm);
  const head = grp(neckG, 0, neck, 0); P.head = head;
  const [fc, fo] = faceTex(Object.assign({ skin: '#' + new THREE.Color(o.skin || 0xd9a982).getHexString(THREE.SRGBColorSpace) }, o.face || {}));
  const faceMat = ps1(new THREE.MeshLambertMaterial({ map: fc }));
  P.faceMat = faceMat; P.faceTex = [fc, fo];
  const hm = pbox(headW, headH, headD, [skin, skin, hairM, skin, faceMat, o.hairStyle === 'bald' ? skin : hairM]); hm.position.y = headH / 2; head.add(hm);
  P.headMesh = hm;
  // причёски
  const hs = o.hairStyle || 'short';
  const hb = (w, h, d, x, y, z, m = hairM) => { const b = pbox(w, h, d, m); b.position.set(x, y, z); head.add(b); return b; };
  if (hs !== 'bald') {
    if (hs === 'scarf') {
      const sm = MT(TEX.scarf);
      hb(headW * 1.14, headH * 0.42, headD * 1.12, 0, headH * 0.86, -headD * 0.02, sm);
      hb(headW * 1.14, headH * 0.95, headD * 0.3, 0, headH * 0.5, -headD * 0.44, sm);
      hb(headW * 0.12, headH * 0.8, headD * 0.9, headW * 0.55, headH * 0.55, -headD * 0.05, sm);
      hb(headW * 0.12, headH * 0.8, headD * 0.9, -headW * 0.55, headH * 0.55, -headD * 0.05, sm);
      hb(headW * 0.5, headH * 0.5, headD * 0.15, 0, headH * 0.05, -headD * 0.62, sm);
    } else {
      const capH = hs === 'buzz' ? 0.18 : 0.3;
      hb(headW * 1.08, headH * capH, headD * 1.08, 0, headH * (1 - capH / 2) + 0.005, 0);
      hb(headW * 1.08, headH * 0.7, headD * 0.18, 0, headH * 0.62, -headD * 0.47);
      if (hs !== 'buzz') { hb(headW * 0.1, headH * 0.4, headD * 0.8, headW * 0.52, headH * 0.75, -headD * 0.06); hb(headW * 0.1, headH * 0.4, headD * 0.8, -headW * 0.52, headH * 0.75, -headD * 0.06); }
      if (hs === 'fringe') hb(headW * 1.06, headH * 0.2, headD * 0.14, 0, headH * 0.8, headD * 0.5);
      if (hs === 'long' || hs === 'tails') hb(headW * 1.12, headH * 1.25, headD * 0.24, 0, headH * 0.28, -headD * 0.5);
      if (hs === 'tails') { const t1 = hb(headW * 0.22, headH * 0.7, headD * 0.22, headW * 0.62, headH * 0.25, -headD * 0.25); const t2 = hb(headW * 0.22, headH * 0.7, headD * 0.22, -headW * 0.62, headH * 0.25, -headD * 0.25); }
      if (hs === 'bun') hb(headW * 0.45, headH * 0.38, headD * 0.4, 0, headH * 0.95, -headD * 0.45);
      if (hs === 'cap') { const cm = MC(o.capColor || 0x22222a); hb(headW * 1.12, headH * 0.32, headD * 1.12, 0, headH * 0.9, 0, cm); hb(headW * 0.9, headH * 0.06, headD * 0.6, 0, headH * 0.78, -headD * 0.8, cm); }
    }
  }
  // руки
  const mkArm = (side) => {
    const sh = grp(spine, side * (shW / 2 + limb / 2), torsoH - limb * 0.6, 0);
    const ua = pbox(limb, uArm, limb, sleeveM); ua.position.y = -uArm / 2; sh.add(ua);
    const el = grp(sh, 0, -uArm, 0);
    const fa = pbox(limb * 0.92, lArm * 0.78, limb * 0.92, o.shortSleeves ? skin : sleeveM); fa.position.y = -lArm * 0.39; el.add(fa);
    const hand = grp(el, 0, -lArm * 0.78, 0);
    const hmsh = pbox(limb * 0.85, lArm * 0.24, limb * 1.0, skin); hmsh.position.y = -lArm * 0.11; hand.add(hmsh);
    return { sh, el, hand };
  };
  P.armL = mkArm(1); P.armR = mkArm(-1);
  // ноги
  const mkLeg = (side) => {
    const hp = grp(hips, side * hipW * 0.26, 0, 0);
    const th = pbox(limb * 1.18, uLeg, limb * 1.2, botM); th.position.y = -uLeg / 2; hp.add(th);
    const kn = grp(hp, 0, -uLeg, 0);
    const sh = pbox(limb * 1.05, lLeg - footH, limb * 1.05, o.shortPants ? skin : botM); sh.position.y = -(lLeg - footH) / 2; kn.add(sh);
    const ft = pbox(limb * 1.15, footH, limb * 2.0, shoeM); ft.position.set(0, -lLeg + footH / 2, limb * 0.45); kn.add(ft);
    return { hp, kn };
  };
  P.legL = mkLeg(1); P.legR = mkLeg(-1);
  if (o.skirt) { const sk = pbox(hipW * 1.25, o.skirt, tD * 1.35, o.skirtTex ? MT(o.skirtTex) : MC(o.skirtColor || 0x333344)); sk.position.y = -o.skirt / 2 + 0.03; hips.add(sk); P.skirt = sk; }
  if (o.apron) { const ap = pbox(hipW * 1.0, H * 0.32, 0.01, MC(o.apron)); ap.position.set(0, -H * 0.12, tD * 0.7); hips.add(ap); }
  // тень-пятно
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), new THREE.MeshBasicMaterial({ map: TEX.blob, transparent: true, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2; P.blob = blob;
  P.add = (scene) => { scene.add(P.root); scene.add(blob); W.people.push(P); return P; };
  P.setPos = (x, y, z, ry) => { P.root.position.set(x, y, z); if (ry !== undefined) P.root.rotation.y = ry; return P; };
  P.face = (x, z) => { P.root.rotation.y = Math.atan2(x - P.root.position.x, z - P.root.position.z); };
  P.headPos = (out = V3()) => P.headMesh.getWorldPosition(out);
  P.show = (v) => { P.visible = v; P.root.visible = v; blob.visible = v; };
  P.walkTo = (pts, speed) => new Promise((res) => { P.path = pts.map((p) => (p.isVector3 ? p.clone() : V3(p[0], p[1], p[2]))); P.walkSpeed = speed || P.speed; P.walkRes = res; P.state = speed > 2.5 ? 'run' : 'walk'; });
  P.update = (dt) => {
    P.t += dt;
    if (P.path && P.path.length) {
      const pos = P.root.position, tg = P.path[0];
      const d = V3().subVectors(tg, pos), dist = d.length();
      if (dist < 0.04) { P.path.shift(); if (!P.path.length) { P.path = null; P.state = P.afterWalk || 'idle'; P.afterWalk = null; const r = P.walkRes; P.walkRes = null; r && r(); } }
      else { const st = Math.min(dist, P.walkSpeed * dt); pos.addScaledVector(d, st / dist); if (Math.hypot(d.x, d.z) > 0.02) P.root.rotation.y = lerpAng(P.root.rotation.y, Math.atan2(d.x, d.z), 1 - Math.exp(-dt * 10)); }
    }
    animate(P, dt);
    if (P.talking) { P.mouthT -= dt; if (P.mouthT <= 0) { P.mouthT = 0.07 + Math.random() * 0.1; P.faceMat.map = P.faceMat.map === P.faceTex[0] ? P.faceTex[1] : P.faceTex[0]; } }
    else if (P.faceMat.map !== P.faceTex[0]) P.faceMat.map = P.faceTex[0];
    if (P.extra) P.extra(dt, P);
    if (W) { const g = groundAt(P.root.position.x, P.root.position.z, P.root.position.y + 0.3); const gy = g.h > -1e9 ? g.h : P.root.position.y; blob.position.set(P.root.position.x, gy + 0.012, P.root.position.z); blob.visible = P.visible && P.state !== 'hang' && P.state !== 'fly'; }
  };
  return P;
}
function setR(g, x = 0, y = 0, z = 0) { g.rotation.set(x, y, z); }
function animate(P, dt) {
  const t = P.t, s = P.state;
  // базовая поза
  setR(P.spine); setR(P.head); setR(P.armL.sh, 0, 0, 0.08); setR(P.armR.sh, 0, 0, -0.08); setR(P.armL.el); setR(P.armR.el);
  setR(P.legL.hp); setR(P.legR.hp); setR(P.legL.kn); setR(P.legR.kn); P.hips.position.y = P.legL ? P.legL : P.hips.position.y;
  P.hips.position.y = P.H * 0.47;
  const breath = Math.sin(t * 1.7) * 0.012;
  if (s === 'idle' || s === 'talk') {
    P.spine.rotation.x = breath; P.armL.sh.rotation.z = 0.08 + breath; P.armR.sh.rotation.z = -0.08 - breath;
    P.armL.el.rotation.x = -0.1; P.armR.el.rotation.x = -0.1;
  } else if (s === 'walk' || s === 'run') {
    const k = s === 'run' ? 1.5 : 1;
    P.ph += dt * P.walkSpeed * (s === 'run' ? 3.2 : 4.6);
    const a = Math.sin(P.ph);
    P.legL.hp.rotation.x = a * 0.55 * k; P.legR.hp.rotation.x = -a * 0.55 * k;
    P.legL.kn.rotation.x = Math.max(0, -Math.cos(P.ph)) * 0.8 * k; P.legR.kn.rotation.x = Math.max(0, Math.cos(P.ph)) * 0.8 * k;
    P.armL.sh.rotation.x = -a * 0.45 * k; P.armR.sh.rotation.x = a * 0.45 * k; P.armL.el.rotation.x = -0.3 * k; P.armR.el.rotation.x = -0.3 * k;
    P.hips.position.y = P.H * 0.47 + Math.abs(Math.cos(P.ph)) * 0.025 * k;
    P.spine.rotation.x = s === 'run' ? 0.15 : 0.03;
  } else if (s === 'sit') {
    P.legL.hp.rotation.x = -1.45; P.legR.hp.rotation.x = -1.4; P.legL.kn.rotation.x = 1.3 + Math.sin(t * 2) * 0.12; P.legR.kn.rotation.x = 1.5 + Math.sin(t * 2 + 1) * 0.12;
    P.spine.rotation.x = 0.12 + breath;
    P.armR.sh.rotation.x = -0.7; P.armR.el.rotation.x = -1.1; P.armL.sh.rotation.x = -0.2; P.armL.el.rotation.x = -0.6;
    P.head.rotation.x = 0.15;
  } else if (s === 'phone') {
    P.spine.rotation.x = breath; P.armR.sh.rotation.x = -0.6; P.armR.el.rotation.x = -1.3; P.armL.sh.rotation.z = 0.1; P.head.rotation.x = 0.35;
  } else if (s === 'mop') {
    P.spine.rotation.x = 0.55; P.spine.rotation.y = Math.sin(t * 2.2) * 0.2;
    P.armL.sh.rotation.x = -1.0 + Math.sin(t * 2.2) * 0.15; P.armR.sh.rotation.x = -0.8 - Math.sin(t * 2.2) * 0.15; P.armL.el.rotation.x = -0.3; P.armR.el.rotation.x = -0.4;
    P.legL.hp.rotation.x = -0.3; P.legL.kn.rotation.x = 0.4; P.legR.hp.rotation.x = 0.1; P.head.rotation.x = -0.25;
  } else if (s === 'tea') {
    P.spine.rotation.x = breath; P.armR.sh.rotation.x = -0.5; P.armR.el.rotation.x = -1.4 + Math.max(0, Math.sin(t * 0.7) - 0.8) * 2; P.armL.sh.rotation.z = 0.15;
    P.head.rotation.y = Math.sin(t * 0.6) * 0.5; P.head.rotation.x = 0.1;
  } else if (s === 'hang') {
    P.armL.sh.rotation.x = Math.PI + Math.sin(t * 2) * 0.1; P.armR.sh.rotation.x = Math.PI + Math.sin(t * 2 + 0.5) * 0.1; P.armL.sh.rotation.z = 0.3; P.armR.sh.rotation.z = -0.3;
    P.legL.kn.rotation.x = 1.75; P.legR.kn.rotation.x = 1.75; P.legL.hp.rotation.x = 0.1; P.legR.hp.rotation.x = 0.1;
    P.head.rotation.x = -0.35;
  } else if (s === 'fly') {
    P.armL.sh.rotation.x = -2.5 + Math.sin(t * 15) * 0.5; P.armR.sh.rotation.x = -2.3 + Math.cos(t * 15) * 0.5; P.legL.hp.rotation.x = -0.8; P.legR.hp.rotation.x = -0.4; P.legL.kn.rotation.x = 0.9;
  } else if (s === 'lie') {
    P.armL.sh.rotation.z = 0.9; P.armR.sh.rotation.z = -0.7; P.legL.hp.rotation.z = 0.15; P.legR.hp.rotation.z = -0.1; P.legR.kn.rotation.x = 0.4; P.head.rotation.y = Math.sin(t * 0.8) * 0.3;
  } else if (s === 'dust') {
    P.spine.rotation.x = 0.25; P.armL.sh.rotation.x = -0.5 + Math.sin(t * 13) * 0.35; P.armR.sh.rotation.x = -0.3 + Math.cos(t * 13) * 0.35; P.armL.el.rotation.x = -0.6; P.armR.el.rotation.x = -0.6; P.head.rotation.x = 0.4;
  } else if (s === 'cheer') {
    const j = Math.abs(Math.sin(t * 7));
    P.hips.position.y = P.H * 0.47 + j * 0.12; P.armL.sh.rotation.x = -2.6; P.armR.sh.rotation.x = -2.2 + Math.sin(t * 7) * 0.3; P.legL.kn.rotation.x = j * 0.5; P.legR.kn.rotation.x = j * 0.5;
  } else if (s === 'sad') {
    P.spine.rotation.x = 0.15; P.head.rotation.x = 0.5; P.armL.sh.rotation.z = 0.02; P.armR.sh.rotation.z = -0.02;
  } else if (s === 'spin') {
    P.spine.rotation.x = breath; P.armR.sh.rotation.x = -1.1; P.armR.el.rotation.x = -0.9; P.head.rotation.x = 0.25;
  }
  if (P.talking && s !== 'hang' && s !== 'fly') { P.head.rotation.x += Math.sin(t * 7) * 0.035; P.armL.el.rotation.x += Math.sin(t * 3.1) * 0.15; }
  // взгляд на точку
  if (P.lookP && s !== 'hang' && s !== 'lie' && s !== 'fly') {
    const lp = typeof P.lookP === 'function' ? P.lookP() : P.lookP;
    const dx = lp.x - P.root.position.x, dz = lp.z - P.root.position.z;
    const rel = clamp(angNorm(Math.atan2(dx, dz) - P.root.rotation.y - P.spine.rotation.y), -1.1, 1.1);
    P.head.rotation.y = rel;
  }
}
// Спиннер (три лопасти): ось вращения — локальная Y
function makeSpinner(o = {}) {
  const g = new THREE.Group();
  const body = o.glow ? new THREE.MeshLambertMaterial({ color: 0x40e0ff, emissive: 0x2080ff, emissiveIntensity: 1.2 }) : MC(o.color || 0x2a5fb0);
  const metal = MC(0xb8bcc4);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.009, 10), metal); g.add(hub);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.008, 0.03), body); arm.position.set(Math.sin(a) * 0.016, 0, Math.cos(a) * 0.016); arm.rotation.y = a; g.add(arm);
    const lobe = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.008, 10), body); lobe.position.set(Math.sin(a) * 0.032, 0, Math.cos(a) * 0.032); g.add(lobe);
    const brg = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.0095, 8), metal); brg.position.copy(lobe.position); g.add(brg);
  }
  ps1(body);
  g.userData.body = body;
  return g;
}
