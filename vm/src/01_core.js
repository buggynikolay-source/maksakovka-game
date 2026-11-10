// =====================================================================
// §1. ЯДРО: загрузка Three.js, рендер, стиль «современный PS1», время
// =====================================================================
const THREE = await (async () => {
  const el = document.getElementById('three-src');
  const url = URL.createObjectURL(new Blob([el.textContent], { type: 'text/javascript' }));
  return await import(url);
})();

const VERSION = 'v0.1';
const SAVE_KEY = 'vm_prolog_save_v01', SET_KEY = 'vm_settings_v01';
const STYLE_PRESETS = {
  modern: { name: 'Современный PS1', px: 3, snap: true, dither: true, levels: 40, snapDiv: 1 },
  hard:   { name: 'Хардкор PS1',     px: 5, snap: true, dither: true, levels: 18, snapDiv: 2 },
  clean:  { name: 'Чистый',          px: 1, snap: false, dither: false, levels: 0, snapDiv: 1 },
};
function loadJSON(k) { try { return JSON.parse(localStorage.getItem(k) || 'null') || null; } catch (e) { return null; } }
const settings = Object.assign({ style: 'modern', px: 3, snap: true, dither: true, levels: 40, snapDiv: 1, sens: 1, vol: 0.8, remember: true, fov: 72 }, loadJSON(SET_KEY) || {});
function saveSettings() { try { localStorage.setItem(SET_KEY, JSON.stringify(settings)); } catch (e) {} }

// --- утилиты ---
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - (1 - t) * (1 - t);
const linear = (t) => t;
function angNorm(a) { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; }
function lerpAng(a, b, t) { return a + angNorm(b - a) * t; }
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// --- игровое время, ожидания и анимации (останавливаются на паузе) ---
let GT = 0, PAUSED = true, EPOCH = 0;
let waits = [], tweens = [];
function wait(s) { const ep = EPOCH; return new Promise((r) => waits.push({ t: GT + s, r, ep })); }
function tween(dur, fn, ez = ease) { const ep = EPOCH; return new Promise((r) => tweens.push({ t0: GT, dur: Math.max(0.0001, dur), fn, ez, r, ep })); }
function tickTimers() {
  for (let i = waits.length - 1; i >= 0; i--) { const w = waits[i]; if (GT >= w.t) { waits.splice(i, 1); if (w.ep === EPOCH) w.r(); } }
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i]; const k = clamp((GT - tw.t0) / tw.dur, 0, 1);
    try { tw.fn(tw.ez(k)); } catch (e) { console.error(e); }
    if (k >= 1) { tweens.splice(i, 1); if (tw.ep === EPOCH) tw.r(); }
  }
}
function resetTimers() { EPOCH++; waits = []; tweens = []; }

// --- рендер ---
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // гамму делаем сами в пост-шейдере
const camera = new THREE.PerspectiveCamera(settings.fov, 16 / 9, 0.04, 600);
camera.rotation.order = 'YXZ';

// Общие uniform-ы стиля: дрожание вершин как на PS1
const G = { uSnap: { value: 0 }, uSnapRes: { value: new THREE.Vector2(320, 180) } };
function ps1(m) {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uSnap = G.uSnap; sh.uniforms.uSnapRes = G.uSnapRes;
    sh.vertexShader = 'uniform float uSnap;\nuniform vec2 uSnapRes;\n' + sh.vertexShader.replace('#include <project_vertex>',
      `#include <project_vertex>
      if (uSnap > 0.5) { vec2 g = uSnapRes * 0.5; gl_Position.xy = floor(gl_Position.xy / gl_Position.w * g + 0.5) / g * gl_Position.w; }`);
  };
  return m;
}

// Пост-обработка: низкое разрешение, тонмаппинг, квантование цвета, дизеринг, виньетка
let rt = null;
const postMat = new THREE.ShaderMaterial({
  uniforms: {
    tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uDither: { value: 1 }, uLevels: { value: 40 },
    uExposure: { value: 1.0 }, uSat: { value: 1.06 }, uVig: { value: 0.32 }, uTint: { value: new THREE.Color(1, 1, 1) }, uFlash: { value: 0 },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uDither, uLevels, uExposure, uSat, uVig, uFlash; uniform vec3 uTint;
    varying vec2 vUv;
    vec3 aces(vec3 x){ const float a=2.51, b=0.03, c=2.43, d=0.59, e=0.14; return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0); }
    float b2(vec2 a){ a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
    float b4(vec2 a){ return b2(0.5 * a) * 0.25 + b2(a); }
    void main(){
      vec2 px = floor(vUv * uRes);
      vec3 c = texture2D(tDiffuse, (px + 0.5) / uRes).rgb * uExposure;
      c = aces(c * 1.1);
      c = pow(c, vec3(1.0 / 2.2));
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, uSat) * uTint;
      vec2 q = vUv - 0.5; c *= 1.0 - uVig * dot(q, q) * 1.7;
      c = mix(c, vec3(1.0), uFlash);
      if (uLevels > 0.5) { float d = uDither > 0.5 ? (b4(px) - 0.5) : 0.0; c = floor(c * uLevels + d + 0.5) / uLevels; }
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
  depthTest: false, depthWrite: false,
});
const postScene = new THREE.Scene();
const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat));

function resize() {
  const w = Math.max(320, innerWidth), h = Math.max(200, innerHeight);
  renderer.setSize(w, h, true);
  camera.aspect = w / h; camera.fov = settings.fov; camera.updateProjectionMatrix();
  const px = clamp(Math.round(settings.px), 1, 8);
  const rw = Math.max(120, Math.floor(w / px)), rh = Math.max(80, Math.floor(h / px));
  if (!rt) rt = new THREE.WebGLRenderTarget(rw, rh, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true });
  else rt.setSize(rw, rh);
  postMat.uniforms.tDiffuse.value = rt.texture;
  postMat.uniforms.uRes.value.set(rw, rh);
  const sd = settings.snapDiv || 1;
  G.uSnapRes.value.set(rw / sd, rh / sd);
}
function applySettings() {
  G.uSnap.value = settings.snap ? 1 : 0;
  postMat.uniforms.uDither.value = settings.dither ? 1 : 0;
  postMat.uniforms.uLevels.value = settings.levels || 0;
  resize();
  if (typeof AU !== 'undefined') AU.setVol(settings.vol);
  saveSettings();
}
addEventListener('resize', resize);
