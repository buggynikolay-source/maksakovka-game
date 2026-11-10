// =====================================================================
// §4. СТРОИТЕЛЬСТВО МИРА: коробки, стены с проёмами, полы, двери, коллизии
// =====================================================================
let W = null; // текущая локация
function newWorld(name) {
  W = { name, scene: new THREE.Scene(), col: [], surf: [], inter: [], blockers: [], people: [], triggers: [], updates: [], doors: [] };
  W.scene.add(camera);
  return W;
}
const _matCache = new Map();
function MT(tex, o = {}) {
  const key = (tex ? tex.uuid : 'none') + JSON.stringify(o);
  if (!o.nocache && _matCache.has(key)) return _matCache.get(key);
  const p = Object.assign({}, o); delete p.nocache; delete p.phong;
  if (tex) p.map = tex;
  const m = ps1(o.phong ? new THREE.MeshPhongMaterial(p) : new THREE.MeshLambertMaterial(p));
  if (!o.nocache) _matCache.set(key, m);
  return m;
}
const MC = (color, o = {}) => MT(null, Object.assign({ color }, o));
const HIT_MAT = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });

// UV в мировых координатах: текстуры стыкуются между кусками стен
function worldUV(geo, ox, oy, oz, ts) {
  const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + ox, y = p.getY(i) + oy, z = p.getZ(i) + oz;
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    let u, v;
    if (ax > 0.5) { u = n.getX(i) > 0 ? -z : z; v = y; } else if (ay > 0.5) { u = x; v = z; } else { u = n.getZ(i) > 0 ? x : -x; v = y; }
    uv.setXY(i, u / ts, v / ts);
  }
  uv.needsUpdate = true;
}
function addCol(x0, y0, z0, x1, y1, z1, tag) { const c = { x0: Math.min(x0, x1), x1: Math.max(x0, x1), y0: Math.min(y0, y1), y1: Math.max(y0, y1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), off: false, tag }; W.col.push(c); return c; }
function addSurf(x0, z0, x1, z1, h, tag = 'concrete') { const s = { x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), h, tag }; W.surf.push(s); return s; }
function groundAt(x, z, y) {
  let best = -Infinity, tag = null;
  for (const s of W.surf) {
    if (x < s.x0 || x > s.x1 || z < s.z0 || z > s.z1) continue;
    const h = typeof s.h === 'function' ? s.h(x, z) : s.h;
    if (h <= y + 0.5 && h > best) { best = h; tag = s.tag; }
  }
  return { h: best, tag };
}
// Коробка: (x,z) — центр, y — низ
function B(x, y, z, w, h, d, mat, o = {}) {
  const geo = new THREE.BoxGeometry(w, h, d);
  if (o.ts !== 0) worldUV(geo, x, y + h / 2, z, o.ts || 1);
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y + h / 2, z);
  if (o.ry) m.rotation.y = o.ry;
  m.castShadow = o.cast !== false; m.receiveShadow = o.recv !== false;
  (o.parent || W.scene).add(m);
  if (o.col) {
    let hw = w / 2, hd = d / 2; if (o.ry && Math.abs(Math.sin(o.ry)) > 0.7) [hw, hd] = [hd, hw];
    m.userData.col = addCol(x - hw, y, z - hd, x + hw, y + h, z + hd, o.tag);
  }
  if (o.block) W.blockers.push(m);
  return m;
}
// Простой меш (без мировых UV) — для мебели с цельной текстурой
function BX(x, y, z, w, h, d, mat, o = {}) { return B(x, y, z, w, h, d, mat, Object.assign({ ts: 0 }, o)); }
function CYL(x, y, z, r1, r2, h, seg, mat, o = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat);
  m.position.set(x, y + h / 2, z); m.castShadow = o.cast !== false; m.receiveShadow = true;
  if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz; if (o.ry) m.rotation.y = o.ry;
  (o.parent || W.scene).add(m);
  if (o.col) addCol(x - r1, y, z - r1, x + r1, y + h, z + r1);
  return m;
}
// Пол / потолок
function floorRect(x0, z0, x1, z1, y, mat, ts = 1, tag = 'concrete', o = {}) {
  const w = x1 - x0, d = z1 - z0;
  const geo = new THREE.PlaneGeometry(w, d, Math.max(1, Math.ceil(w / 1.5)), Math.max(1, Math.ceil(d / 1.5)));
  geo.rotateX(o.ceil ? Math.PI / 2 : -Math.PI / 2);
  const p = geo.attributes.position, uv = geo.attributes.uv;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + cx) / ts, -(p.getZ(i) + cz) / ts);
  const m = new THREE.Mesh(geo, mat); m.position.set(cx, y, cz); m.receiveShadow = true; m.castShadow = !!o.ceil;
  W.scene.add(m);
  if (!o.ceil && o.surf !== false) addSurf(x0, z0, x1, z1, y, tag);
  return m;
}
const ceilRect = (x0, z0, x1, z1, y, mat, ts = 1) => floorRect(x0, z0, x1, z1, y, mat, ts, null, { ceil: true });
// Стена вдоль оси Z (на координате x) с проёмами [from, to, yBottom, yTop]
function wallZ(x, z1, z2, o) {
  const y0 = o.y0 || 0, H = o.h || 2.5, t = o.t || 0.1;
  const mats = [o.pos, o.neg, o.top || o.pos, o.top || o.pos, o.end || o.pos, o.end || o.pos];
  const holes = (o.holes || []).slice().sort((a, b) => a[0] - b[0]);
  const piece = (a, b, ya, yb) => {
    if (b - a < 0.005 || yb - ya < 0.005) return;
    const m = B(x, ya, (a + b) / 2, t, yb - ya, b - a, mats, { ts: o.ts || 1, col: ya < y0 + 1.8, block: true });
    return m;
  };
  let cur = z1;
  for (const hl of holes) { piece(cur, hl[0], y0, y0 + H); piece(hl[0], hl[1], y0, y0 + hl[2]); piece(hl[0], hl[1], y0 + hl[3], y0 + H); cur = hl[1]; }
  piece(cur, z2, y0, y0 + H);
}
// Стена вдоль оси X (на координате z)
function wallX(z, x1, x2, o) {
  const y0 = o.y0 || 0, H = o.h || 2.5, t = o.t || 0.1;
  const mats = [o.end || o.pos, o.end || o.pos, o.top || o.pos, o.top || o.pos, o.pos, o.neg];
  const holes = (o.holes || []).slice().sort((a, b) => a[0] - b[0]);
  const piece = (a, b, ya, yb) => { if (b - a < 0.005 || yb - ya < 0.005) return; B((a + b) / 2, ya, z, b - a, yb - ya, t, mats, { ts: o.ts || 1, col: ya < y0 + 1.8, block: true }); };
  let cur = x1;
  for (const hl of holes) { piece(cur, hl[0], y0, y0 + H); piece(hl[0], hl[1], y0, y0 + hl[2]); piece(hl[0], hl[1], y0 + hl[3], y0 + H); cur = hl[1]; }
  piece(cur, x2, y0, y0 + H);
}
// Наклейка (плоскость с текстурой), смотрит по нормали ry
function decal(tex, w, h, x, y, z, ry = 0, o = {}) {
  const mat = MT(tex, { transparent: !!o.alpha, alphaTest: o.alpha ? 0.3 : 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: o.double ? THREE.DoubleSide : THREE.FrontSide, emissive: o.emissive || 0x000000, emissiveMap: o.emissive ? tex : null, color: o.color || 0xffffff });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.y = ry; if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz;
  m.receiveShadow = true; (o.parent || W.scene).add(m);
  return m;
}
// Дверь: шарнир на краю, axis — вдоль какой оси идёт стена
function makeDoor(o) {
  const w = o.w || 0.8, h = o.h || 2.05, t = o.t || 0.05, y = o.y || 0;
  const pivot = new THREE.Group();
  const s = o.hinge || -1; // -1: петли на «меньшем» краю
  const leafMats = Array.isArray(o.mat) ? o.mat : [o.side || o.mat, o.side || o.mat, o.side || o.mat, o.side || o.mat, o.mat, o.back || o.mat];
  let leaf;
  if (o.axis === 'x') {
    pivot.position.set(o.x + s * w / 2, y, o.z);
    leaf = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), leafMats); leaf.position.set(-s * w / 2, h / 2, 0);
  } else {
    pivot.position.set(o.x, y, o.z + s * w / 2);
    leaf = new THREE.Mesh(new THREE.BoxGeometry(t, h, w), [leafMats[4], leafMats[5], leafMats[2], leafMats[3], leafMats[0], leafMats[1]]); leaf.position.set(0, h / 2, -s * w / 2);
  }
  leaf.castShadow = true; leaf.receiveShadow = true; pivot.add(leaf);
  // ручка
  const hm = MC(0xb8a070);
  const knob = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.03), hm);
  if (o.axis === 'x') { knob.position.set(-s * (w - 0.1), 1.0 - h / 2, 0.05); knob.scale.z = 2.5; } else { knob.position.set(0.05, 1.0 - h / 2, -s * (w - 0.1)); knob.rotation.y = Math.PI / 2; knob.scale.z = 2.5; }
  leaf.add(knob);
  W.scene.add(pivot); W.blockers.push(leaf);
  const col = o.axis === 'x' ? addCol(o.x - w / 2, y, o.z - 0.06, o.x + w / 2, y + h, o.z + 0.06) : addCol(o.x - 0.06, y, o.z - w / 2, o.x + 0.06, y + h, o.z + w / 2);
  const D = { pivot, leaf, col, ang: 0, openSign: o.openSign || 1,
    set(a) { this.ang = a; pivot.rotation.y = a * this.openSign; col.off = Math.abs(a) > 0.3; },
    async open(dur = 0.6, a = 1.45) { AU.door(true); const a0 = this.ang; await tween(dur, (k) => this.set(lerp(a0, a, k))); },
    async close(dur = 0.5) { const a0 = this.ang; await tween(dur, (k) => this.set(lerp(a0, 0, k))); AU.door(false); } };
  if (o.open) D.set(o.open);
  W.doors.push(D);
  return D;
}
// Наличник вокруг проёма
function doorFrame(axis, x, z, w, h, y = 0, mat = MC(0xe8e4d8)) {
  const t = 0.06, d = 0.16;
  if (axis === 'x') { B(x - w / 2 - t / 2, y, z, t, h + t, d, mat, { ts: 0 }); B(x + w / 2 + t / 2, y, z, t, h + t, d, mat, { ts: 0 }); B(x, y + h, z, w + t * 2, t, d, mat, { ts: 0 }); }
  else { B(x, y, z - w / 2 - t / 2, d, h + t, t, mat, { ts: 0 }); B(x, y, z + w / 2 + t / 2, d, h + t, t, mat, { ts: 0 }); B(x, y + h, z, d, t, w + t * 2, mat, { ts: 0 }); }
}
// Окно с рамой, стеклом и подоконником
function windowAt(axis, x, z, w, y0, y1, o = {}) {
  const fm = MC(0xeeece4), h = y1 - y0, t = 0.05;
  const inward = o.inward || 1; // в какую сторону комната
  if (axis === 'x') {
    B(x, y0, z, w, t, 0.12, fm, { ts: 0 }); B(x, y1 - t, z, w, t, 0.12, fm, { ts: 0 });
    B(x - w / 2 + t / 2, y0, z, t, h, 0.12, fm, { ts: 0 }); B(x + w / 2 - t / 2, y0, z, t, h, 0.12, fm, { ts: 0 });
    B(x, y0, z, t, h, 0.1, fm, { ts: 0 }); B(x, y0 + h * 0.72, z, w, t, 0.1, fm, { ts: 0 });
    if (o.sill !== false) B(x, y0 - 0.04, z + inward * 0.14, w + 0.16, 0.04, 0.26, MC(0xf0eee8), { ts: 0, col: false });
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0xcfe4f0, transparent: true, opacity: 0.12, depthWrite: false }));
    gl.position.set(x, y0 + h / 2, z); W.scene.add(gl);
  } else {
    B(x, y0, z, 0.12, t, w, fm, { ts: 0 }); B(x, y1 - t, z, 0.12, t, w, fm, { ts: 0 });
    B(x, y0, z - w / 2 + t / 2, 0.12, h, t, fm, { ts: 0 }); B(x, y0, z + w / 2 - t / 2, 0.12, h, t, fm, { ts: 0 });
    B(x, y0, z, 0.1, h, t, fm, { ts: 0 }); B(x, y0 + h * 0.72, z, 0.1, t, w, fm, { ts: 0 });
    if (o.sill !== false) B(x + inward * 0.14, y0 - 0.04, z, 0.26, 0.04, w + 0.16, MC(0xf0eee8), { ts: 0, col: false });
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0xcfe4f0, transparent: true, opacity: 0.12, depthWrite: false }));
    gl.position.set(x, y0 + h / 2, z); gl.rotation.y = Math.PI / 2; W.scene.add(gl);
  }
}
// Батарея под окном
function radiator(axis, x, z, w, y = 0.18, inward = 1) {
  const m = MC(0xe8e6de); const n = Math.floor(w / 0.08);
  for (let i = 0; i < n; i++) {
    const off = -w / 2 + (i + 0.5) * (w / n);
    if (axis === 'x') B(x + off, y, z + inward * 0.06, 0.05, 0.5, 0.08, m, { ts: 0, cast: false });
    else B(x + inward * 0.06, y, z + off, 0.08, 0.5, 0.05, m, { ts: 0, cast: false });
  }
}
// Вид из окна — нарисованный задник
function backdrop(tex, x, y, z, w, h, ry) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, fog: false }));
  m.position.set(x, y, z); m.rotation.y = ry; W.scene.add(m); return m;
}
function bulb(x, y, z, color = 0xfff0c8, intensity = 1.2, dist = 6, o = {}) {
  const l = new THREE.PointLight(color, intensity, dist, 1.6); l.position.set(x, y, z); W.scene.add(l);
  if (o.mesh !== false) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), new THREE.MeshBasicMaterial({ color: 0xfff6d8 })); b.position.set(x, y + 0.03, z); W.scene.add(b); if (o.wire) { const wire = new THREE.Mesh(new THREE.BoxGeometry(0.01, o.wire, 0.01), MC(0x222222)); wire.position.set(x, y + o.wire / 2 + 0.05, z); W.scene.add(wire); } }
  return l;
}
// Интерактивный объект
function addInter(o) {
  let hit = o.mesh;
  if (o.box) { hit = new THREE.Mesh(new THREE.BoxGeometry(o.box[0], o.box[1], o.box[2]), HIT_MAT); hit.position.set(o.at[0], o.at[1], o.at[2]); hit.visible = false; W.scene.add(hit); }
  const it = Object.assign({ on: true, dist: 2.2 }, o, { hit });
  hit.userData.inter = it; W.inter.push(it);
  return it;
}
function addTrigger(test, fn, o = {}) { const t = Object.assign({ test, fn, once: true, done: false }, o); W.triggers.push(t); return t; }
// Небо: градиент + солнце + облака
function makeSky(o = {}) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(o.top || 0x5d8fd0) }, hor: { value: new THREE.Color(o.hor || 0xdde6ea) }, sunDir: { value: (o.sun || V3(0.6, 0.5, 0.3)).clone().normalize() }, uT: { value: 0 } },
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w; }`,
    fragmentShader: `uniform vec3 top, hor, sunDir; uniform float uT; varying vec3 vD;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      void main(){ vec3 d = normalize(vD); float y = max(d.y, 0.0);
        vec3 c = mix(hor, top, pow(y, 0.6));
        float s = max(dot(d, sunDir), 0.0); c += vec3(1.0, 0.85, 0.6) * (pow(s, 600.0) * 3.0 + pow(s, 12.0) * 0.25);
        vec2 p = d.xz / (d.y + 0.15) * 2.0 + vec2(uT * 0.01, 0.0);
        float cl = n(p) * 0.6 + n(p * 2.3) * 0.3 + n(p * 5.1) * 0.1; cl = smoothstep(0.55, 0.8, cl) * smoothstep(0.0, 0.25, d.y);
        c = mix(c, vec3(1.0, 0.98, 0.95), cl * 0.8);
        if (d.y < 0.0) c = hor * 0.9;
        gl_FragColor = vec4(c, 1.0); }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(400, 24, 12), mat); m.renderOrder = -1; m.frustumCulled = false;
  W.scene.add(m); W.updates.push((dt) => { mat.uniforms.uT.value += dt; m.position.copy(camera.position); });
  return m;
}
