// =====================================================================
// §7. ИГРОК: управление от первого лица, коллизии, взаимодействие, руки
// =====================================================================
const P = { pos: V3(), yaw: 0, pitch: 0, vy: 0, r: 0.26, eye: 1.5, ctrl: false, look: null, onGround: true, bobT: 0, lastStep: 0, vel: new THREE.Vector2(), camY: 0, surfTag: 'concrete', moved: 0, looked: 0 };
const CAM = { override: false, pos: V3(), yaw: 0, pitch: 0 };
const keys = {}; let mdx = 0, mdy = 0, locked = false, BUSY = false, hover = null;
const TEST = { auto: false, picks: [] };
let MODE = 'title'; // title | play | pause | end
let intentionalUnlock = false;
function requestLock() { if (TEST.auto) return; try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvas;
  if (!locked && MODE === 'play' && !intentionalUnlock) openPause();
  intentionalUnlock = false;
});
addEventListener('mousemove', (e) => { if (locked) { mdx += e.movementX; mdy += e.movementY; if (DLG.choice) choiceMouse(e.movementY); } });
canvas.addEventListener('mousedown', (e) => {
  if (MODE !== 'play') return;
  AU.init();
  if (!locked) requestLock();
  if (DLG.choice) { if (locked) pickChoice(DLG.choice.sel); return; }
  if (advanceInput()) return;
  if (locked && hover && !BUSY) interact();
});
addEventListener('keydown', (e) => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  keys[e.code] = true;
  if (MODE === 'pause' && e.code === 'Escape') { resumeGame(); return; }
  if (MODE !== 'play') return;
  if (e.code === 'Escape') { openPause(); return; }
  if (DLG.choice) {
    const n = parseInt(e.key, 10); if (n >= 1 && n <= 9) { pickChoice(n - 1); return; }
    if (e.code === 'KeyW' || e.code === 'ArrowUp') moveChoice(-1);
    if (e.code === 'KeyS' || e.code === 'ArrowDown') moveChoice(1);
    if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') pickChoice(DLG.choice.sel);
    return;
  }
  if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') { if (advanceInput()) return; if (e.code === 'KeyE' && hover && !BUSY) interact(); }
  if (e.code === 'KeyF') spinFidget();
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

function lookAtPerson(p) { P.look = () => p.headPos(V3()); }
function lookAtPoint(v) { P.look = v.clone(); }
function placePlayer(x, y, z, yaw = 0, pitch = 0) { P.pos.set(x, y, z); P.yaw = yaw; P.pitch = pitch; P.vy = 0; P.camY = y + P.eye; P.vel.set(0, 0); P.look = null; }
function collide(p) {
  const r = P.r;
  for (let it = 0; it < 3; it++) {
    for (const c of W.col) {
      if (c.off) continue;
      if (p.y + 0.32 > c.y1 || p.y + 1.6 < c.y0) continue;
      const cx = clamp(p.x, c.x0, c.x1), cz = clamp(p.z, c.z0, c.z1);
      const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
      if (d2 < r * r) {
        if (d2 > 1e-9) { const d = Math.sqrt(d2), k = (r - d) / d; p.x += dx * k; p.z += dz * k; }
        else { const l = p.x - c.x0, rr = c.x1 - p.x, b = p.z - c.z0, f = c.z1 - p.z, m = Math.min(l, rr, b, f); if (m === l) p.x = c.x0 - r; else if (m === rr) p.x = c.x1 + r; else if (m === b) p.z = c.z0 - r; else p.z = c.z1 + r; }
      }
    }
  }
}
function updatePlayer(dt) {
  // взгляд
  if (P.look) {
    const tp = typeof P.look === 'function' ? P.look() : P.look;
    const cp = camera.position;
    const dx = tp.x - cp.x, dy = tp.y - cp.y, dz = tp.z - cp.z;
    const yT = Math.atan2(-dx, -dz), pT = Math.atan2(dy, Math.hypot(dx, dz));
    const k = 1 - Math.exp(-dt * 4.5);
    P.yaw = lerpAng(P.yaw, yT, k); P.pitch = lerp(P.pitch, pT, k);
  } else if (P.ctrl && locked) {
    const s = 0.0022 * settings.sens;
    P.yaw -= mdx * s; P.pitch = clamp(P.pitch - mdy * s, -1.45, 1.45);
    P.looked += Math.abs(mdx) + Math.abs(mdy);
  }
  mdx = mdy = 0;
  // движение
  let f = 0, st = 0;
  if (P.ctrl) { if (keys.KeyW || keys.ArrowUp) f += 1; if (keys.KeyS || keys.ArrowDown) f -= 1; if (keys.KeyD || keys.ArrowRight) st += 1; if (keys.KeyA || keys.ArrowLeft) st -= 1; }
  const sp = keys.ShiftLeft || keys.ShiftRight ? 3.9 : 2.3;
  const sy = Math.sin(P.yaw), cy = Math.cos(P.yaw);
  let wx = -sy * f + cy * st, wz = -cy * f - sy * st; const wl = Math.hypot(wx, wz); if (wl > 1) { wx /= wl; wz /= wl; }
  const ak = 1 - Math.exp(-dt * 12);
  P.vel.x = lerp(P.vel.x, wx * sp, ak); P.vel.y = lerp(P.vel.y, wz * sp, ak);
  const p = P.pos;
  p.x += P.vel.x * dt; p.z += P.vel.y * dt;
  collide(p);
  const g = groundAt(p.x, p.z, p.y);
  if (g.h > -1e9) {
    if (p.y > g.h + 0.01) {
      if (P.onGround && p.y - g.h < 0.5) { p.y = g.h; }
      else { P.vy -= 22 * dt; p.y += P.vy * dt; if (p.y <= g.h) { p.y = g.h; P.vy = 0; P.onGround = true; } else P.onGround = false; }
    } else { p.y = g.h; P.vy = 0; P.onGround = true; }
    P.surfTag = g.tag;
  }
  const speed = P.vel.length();
  P.moved += speed * dt;
  if (P.onGround && speed > 0.4) {
    P.bobT += dt * speed * 2.7;
    const stepN = Math.floor(P.bobT / Math.PI);
    if (stepN !== P.lastStep) { P.lastStep = stepN; AU.step(P.surfTag); }
  }
  const bob = Math.sin(P.bobT * 2) * 0.028 * clamp(speed / 2.3, 0, 1);
  P.camY = lerp(P.camY, p.y + P.eye, 1 - Math.exp(-dt * 18));
  if (CAM.override) { camera.position.copy(CAM.pos); camera.rotation.set(CAM.pitch, CAM.yaw, 0); }
  else { camera.position.set(p.x, P.camY + bob, p.z); camera.rotation.set(P.pitch, P.yaw, 0); }
  // руки
  VMD.g.position.set(Math.sin(P.bobT) * 0.008 * clamp(speed, 0, 1), bob * 0.5, 0);
}
// --- взаимодействие ---
const ray = new THREE.Raycaster(); ray.far = 3.2;
const _c0 = new THREE.Vector2(0, 0);
function updateInteract() {
  hover = null;
  if (!P.ctrl || BUSY || MODE !== 'play') { setPrompt(null); return; }
  ray.setFromCamera(_c0, camera);
  const list = [];
  for (const it of W.inter) if (it.on && (!it.cond || it.cond())) list.push(it.hit);
  const hits = ray.intersectObjects(list.concat(W.blockers), false);
  if (hits.length) { const h = hits[0]; const it = h.object.userData.inter; if (it && list.includes(h.object) && h.distance <= it.dist) hover = it; }
  setPrompt(hover ? (typeof hover.label === 'function' ? hover.label() : hover.label) : null);
  UI.cross.classList.toggle('hot', !!hover);
}
function interact() { const it = hover; if (!it) return; run(it.fn); }
async function run(fn) {
  if (BUSY) return; BUSY = true; P.ctrl = false; setPrompt(null); const ep = EPOCH;
  try { await fn(); } catch (e) { console.error(e); }
  finally { if (ep === EPOCH) { BUSY = false; P.ctrl = true; P.look = null; hideDlg(); } }
}
// --- руки и предметы в руках (вьюмодель) ---
const VMD = { g: new THREE.Group(), spinner: null, phone: null, bucket: null, spinV: 0, mode: 'none', snd: null, rt: null, pcam: null };
camera.add(VMD.g);
function buildViewmodel() {
  const skin = MC(0xe2b48c), sleeve = MC(0x2d3e5c);
  // спиннер в руке
  const sh = new THREE.Group(); sh.position.set(0.15, -0.14, -0.3);
  const sp = makeSpinner({ color: 0x1f4fa8 }); sp.scale.setScalar(1.5); sp.rotation.x = Math.PI / 2; sh.add(sp);
  const hand = pbox(0.05, 0.035, 0.07, skin); hand.position.set(0.005, -0.045, 0.01); hand.rotation.x = 0.3; sh.add(hand);
  const thumb = pbox(0.018, 0.05, 0.018, skin); thumb.position.set(-0.02, -0.02, 0.012); thumb.rotation.z = 0.5; sh.add(thumb);
  const arm = pbox(0.06, 0.06, 0.3, sleeve); arm.position.set(0.04, -0.09, 0.17); arm.rotation.x = 0.35; sh.add(arm);
  sh.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = false; } });
  VMD.g.add(sh); VMD.spinner = sh; VMD.spinMesh = sp; sh.visible = false;
  // телефон для съёмки
  const ph = new THREE.Group(); ph.position.set(0.02, -0.05, -0.25);
  VMD.rt = new THREE.WebGLRenderTarget(90, 160, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  VMD.pcam = new THREE.PerspectiveCamera(50, 90 / 160, 0.05, 400); VMD.pcam.rotation.order = 'YXZ';
  const body = pbox(0.068, 0.132, 0.008, MC(0x16161a)); ph.add(body);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.112), new THREE.MeshBasicMaterial({ map: VMD.rt.texture })); scr.position.z = 0.0045; ph.add(scr);
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.112), new THREE.MeshBasicMaterial({ map: CT(32, 64, (g) => { g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(32, 6); g.lineTo(20, 18); g.lineTo(24, 30); g.lineTo(9, 44); g.moveTo(20, 18); g.lineTo(6, 22); g.moveTo(24, 30); g.lineTo(31, 40); g.stroke(); }, { rep: false, mip: false }), transparent: true }));
  crack.position.z = 0.005; ph.add(crack);
  const h1 = pbox(0.022, 0.05, 0.02, skin); h1.position.set(0.036, -0.05, -0.004); h1.rotation.z = 0.3; ph.add(h1);
  const h2 = pbox(0.022, 0.05, 0.02, skin); h2.position.set(-0.036, -0.05, -0.004); h2.rotation.z = -0.3; ph.add(h2);
  ph.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = false; } });
  VMD.g.add(ph); VMD.phone = ph; ph.visible = false;
  // ведро бабы Шуры: висит в правой руке внизу кадра
  const bk = new THREE.Group(); bk.position.set(0.25, -0.47, -0.52);
  const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.24, 10, 1, true), ps1(new THREE.MeshLambertMaterial({ color: 0x7d8a96, side: THREE.DoubleSide }))); bk.add(bb);
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.12, 10), MC(0x4a5a50)); water.rotation.x = -Math.PI / 2; water.position.y = 0.06; bk.add(water);
  const bail = pbox(0.26, 0.012, 0.012, MC(0x55606a)); bail.position.set(0, 0.2, 0); bk.add(bail);
  for (const sx of [-0.125, 0.125]) { const st_ = pbox(0.012, 0.1, 0.012, MC(0x55606a)); st_.position.set(sx, 0.15, 0); st_.rotation.z = sx > 0 ? 0.5 : -0.5; bk.add(st_); }
  const fist = pbox(0.07, 0.06, 0.08, skin); fist.position.set(0, 0.22, 0); bk.add(fist);
  const wr = pbox(0.06, 0.1, 0.07, sleeve); wr.position.set(0.01, 0.29, 0.02); bk.add(wr);
  VMD.g.add(bk); VMD.bucket = bk; bk.visible = false;
}
function spinFidget() {
  if (!S.items.spinner || VMD.mode !== 'none' || BUSY) return;
  AU.init(); if (!VMD.snd) VMD.snd = AU.spinner();
  VMD.spinV = Math.min(70, VMD.spinV + 32);
  if (!S.flags._spun) { S.flags._spun = true; }
}
function updateViewmodel(dt) {
  VMD.spinner.visible = !!S.items.spinner && VMD.mode === 'none';
  VMD.phone.visible = VMD.mode === 'phone';
  VMD.bucket.visible = !!S.items.bucket;
  if (VMD.bucket.visible) VMD.spinner.visible = false;
  VMD.spinV *= Math.exp(-dt * 0.3); if (VMD.spinV < 0.05) VMD.spinV = 0;
  VMD.spinMesh.rotation.y += VMD.spinV * dt;
  if (VMD.snd) VMD.snd.set(VMD.spinner.visible ? VMD.spinV : 0);
  if (VMD.mode === 'phone') {
    VMD.pcam.position.copy(camera.position); VMD.pcam.rotation.set(P.pitch, P.yaw, 0);
    VMD.g.visible = false; renderer.setRenderTarget(VMD.rt); renderer.render(W.scene, VMD.pcam); VMD.g.visible = true; renderer.setRenderTarget(null);
  }
}
