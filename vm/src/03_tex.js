// =====================================================================
// §3. ТЕКСТУРЫ: рисуются кодом на canvas (позже заменим фото из поездки)
// =====================================================================
function CT(w, h, draw, o = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  draw(g, w, h, mulberry32(o.seed || (w * 7 + h * 13)));
  if (o.canvasOnly) return c;
  const t = new THREE.CanvasTexture(c);
  if (o.rep !== false) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = o.mip === false ? THREE.NearestFilter : THREE.NearestMipmapLinearFilter;
  t.generateMipmaps = o.mip !== false;
  t.userData.canvas = c;
  return t;
}
function noiseFill(g, w, h, base, amp, rng, size = 1) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  const id = g.getImageData(0, 0, w, h), d = id.data;
  for (let y = 0; y < h; y += size) for (let x = 0; x < w; x += size) {
    const n = (rng() - 0.5) * amp;
    for (let yy = 0; yy < size && y + yy < h; yy++) for (let xx = 0; xx < size && x + xx < w; xx++) { const i = ((y + yy) * w + (x + xx)) * 4; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  }
  g.putImageData(id, 0, 0);
}
function blotches(g, w, h, rng, colors, n, rmin, rmax, alpha = 0.5) {
  for (let i = 0; i < n; i++) {
    g.globalAlpha = alpha * (0.4 + rng() * 0.6); g.fillStyle = colors[Math.floor(rng() * colors.length)];
    const x = rng() * w, y = rng() * h, r = rmin + rng() * (rmax - rmin);
    for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) { g.beginPath(); g.ellipse(x + dx, y + dy, r, r * (0.6 + rng() * 0.8), rng() * 3, 0, Math.PI * 2); g.fill(); }
  }
  g.globalAlpha = 1;
}
function px(g, x, y, c, w = 1, h = 1) { g.fillStyle = c; g.fillRect(x, y, w, h); }

const TEX = {};
function buildTextures() {
  // --- обои в комнате Коли: бежевые, полоски и цветочки ---
  TEX.wallRoom = CT(64, 64, (g, w, h, r) => {
    noiseFill(g, w, h, '#d8c69c', 10, r);
    for (let x = 0; x < w; x += 16) { g.fillStyle = 'rgba(160,120,70,0.35)'; g.fillRect(x, 0, 3, h); g.fillStyle = 'rgba(255,250,230,0.3)'; g.fillRect(x + 3, 0, 1, h); }
    for (let y = 4; y < h; y += 16) for (let x = 9; x < w; x += 16) {
      const yy = (y + (x % 32 ? 8 : 0)) % h;
      px(g, x, yy, '#a3533f', 2, 2); px(g, x - 1, yy + 1, '#b9654c'); px(g, x + 2, yy + 1, '#b9654c'); px(g, x, yy + 2, '#5f7a45', 1, 3); px(g, x + 1, yy + 3, '#5f7a45');
    }
  });
  // --- обои в прихожей: оливковые ромбы ---
  TEX.wallHall = CT(64, 64, (g, w, h, r) => {
    noiseFill(g, w, h, '#a2ad83', 10, r);
    g.strokeStyle = 'rgba(90,100,60,0.45)'; g.lineWidth = 1;
    for (let i = -64; i < 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); g.beginPath(); g.moveTo(i + 64, 0); g.lineTo(i, 64); g.stroke(); }
    for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) px(g, x + 7, y + 7, '#e6dcb0', 2, 2);
  });
  // --- обои у мамы: розовые ---
  TEX.wallMom = CT(64, 64, (g, w, h, r) => {
    noiseFill(g, w, h, '#d6b2a6', 10, r);
    for (let x = 0; x < w; x += 21) { g.fillStyle = 'rgba(150,80,80,0.25)'; g.fillRect(x, 0, 6, h); }
    for (let y = 0; y < h; y += 12) for (let x = 2; x < w; x += 21) px(g, x + 1, y + (x % 2) * 6, '#9c4a52', 3, 3);
  });
  TEX.paintKitchen = CT(32, 32, (g, w, h, r) => { noiseFill(g, w, h, '#b6d0c8', 9, r); });
  TEX.whitewash = CT(64, 64, (g, w, h, r) => { noiseFill(g, w, h, '#e7e3d8', 10, r); blotches(g, w, h, r, ['#d8d2c2', '#efece4'], 10, 3, 9, 0.35); });
  TEX.ceiling = CT(64, 64, (g, w, h, r) => { noiseFill(g, w, h, '#ecebe4', 8, r); g.strokeStyle = 'rgba(120,110,100,0.25)'; g.beginPath(); g.moveTo(5, 40); g.lineTo(20, 36); g.lineTo(31, 44); g.lineTo(50, 41); g.stroke(); });
  // --- линолеум «под паркет» ---
  TEX.lino = CT(64, 64, (g, w, h, r) => {
    const cs = ['#9a663b', '#8b5a33', '#a77345', '#93603a'];
    for (let by = 0; by < 4; by++) for (let bx = 0; bx < 4; bx++) {
      const vert = (bx + by) % 2 === 0;
      for (let k = 0; k < 4; k++) {
        g.fillStyle = cs[Math.floor(r() * cs.length)];
        if (vert) g.fillRect(bx * 16 + k * 4, by * 16, 4, 16); else g.fillRect(bx * 16, by * 16 + k * 4, 16, 4);
      }
    }
    g.globalAlpha = 0.12; for (let i = 0; i < 400; i++) px(g, r() * 64, r() * 64, r() < 0.5 ? '#3a2412' : '#e0b080'); g.globalAlpha = 1;
    g.fillStyle = 'rgba(40,20,10,0.25)'; for (let i = 0; i <= 64; i += 16) { g.fillRect(i, 0, 1, 64); g.fillRect(0, i, 64, 1); }
  });
  // --- линолеум на кухне: серо-бежевая плитка ---
  TEX.linoK = CT(64, 64, (g, w, h, r) => {
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#b9ab8e' : '#9c8f76'; g.fillRect(x * 16, y * 16, 16, 16); }
    g.fillStyle = 'rgba(120,60,40,0.35)'; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.save(); g.translate(x * 16 + 8, y * 16 + 8); g.rotate(Math.PI / 4); g.fillRect(-3, -3, 6, 6); g.restore(); }
    noiseFill2(g, w, h, 10, r);
  });
  TEX.parquet = CT(64, 64, (g, w, h, r) => {
    for (let y = 0; y < 64; y += 8) { let x = -Math.floor(r() * 20); while (x < 64) { const L = 14 + Math.floor(r() * 18); g.fillStyle = ['#a06d3f', '#93613a', '#ad7a48', '#8a5933'][Math.floor(r() * 4)]; g.fillRect(x, y, L, 8); g.fillStyle = 'rgba(40,20,10,0.4)'; g.fillRect(x, y, 1, 8); x += L; } g.fillStyle = 'rgba(40,20,10,0.35)'; g.fillRect(0, y, 64, 1); }
    noiseFill2(g, w, h, 12, r);
  });
  TEX.tilesBath = CT(64, 64, (g, w, h, r) => {
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = r() < 0.08 ? '#8fbcd0' : '#a7cde0'; g.fillRect(x * 16, y * 16, 16, 16); }
    g.fillStyle = '#e8eef0'; for (let i = 0; i <= 64; i += 16) { g.fillRect(i, 0, 1, 64); g.fillRect(0, i, 64, 1); }
    noiseFill2(g, w, h, 8, r);
  });
  TEX.tilesFloor = CT(64, 64, (g, w, h, r) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#c9bfae' : '#8f7f6a'; g.fillRect(x * 8, y * 8, 8, 8); }
    noiseFill2(g, w, h, 10, r);
  });
  TEX.tilesWhite = CT(64, 64, (g, w, h, r) => {
    noiseFill(g, w, h, '#efeee8', 6, r);
    g.fillStyle = '#bdbcb2'; for (let i = 0; i <= 64; i += 16) { g.fillRect(i, 0, 1, 64); g.fillRect(0, i, 64, 1); }
  });
  // --- ковёр на стене (красный, с орнаментом) ---
  TEX.carpet = CT(128, 192, (g, w, h, r) => {
    noiseFill(g, w, h, '#7d1b1d', 14, r);
    const sym = (fn) => { fn(1, 1); g.save(); g.translate(w, 0); g.scale(-1, 1); fn(); g.restore(); g.save(); g.translate(0, h); g.scale(1, -1); fn(); g.restore(); g.save(); g.translate(w, h); g.scale(-1, -1); fn(); g.restore(); };
    g.fillStyle = '#2a1830'; g.fillRect(0, 0, w, 12); g.fillRect(0, h - 12, w, 12); g.fillRect(0, 0, 12, h); g.fillRect(w - 12, 0, 12, h);
    g.fillStyle = '#d0a84e'; for (let x = 4; x < w; x += 8) { g.fillRect(x, 4, 4, 4); g.fillRect(x, h - 8, 4, 4); } for (let y = 4; y < h; y += 8) { g.fillRect(4, y, 4, 4); g.fillRect(w - 8, y, 4, 4); }
    g.strokeStyle = '#e6d6ae'; g.lineWidth = 2; g.strokeRect(14, 14, w - 28, h - 28);
    const dia = (cx, cy, rx, ry, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(cx, cy - ry); g.lineTo(cx + rx, cy); g.lineTo(cx, cy + ry); g.lineTo(cx - rx, cy); g.closePath(); g.fill(); };
    dia(64, 96, 44, 62, '#1f2b52'); dia(64, 96, 36, 52, '#a4262b'); dia(64, 96, 28, 40, '#d0a84e'); dia(64, 96, 20, 30, '#1f2b52'); dia(64, 96, 12, 18, '#e6d6ae'); dia(64, 96, 5, 8, '#a4262b');
    sym(() => { dia(30, 36, 12, 14, '#1f2b52'); dia(30, 36, 7, 8, '#d0a84e'); dia(22, 70, 5, 7, '#e6d6ae'); dia(46, 22, 6, 6, '#d0a84e'); px(g, 20, 20, '#e6d6ae', 3, 3); px(g, 34, 56, '#e6d6ae', 2, 2); });
    g.globalAlpha = 0.18; for (let i = 0; i < 900; i++) px(g, r() * w, r() * h, r() < 0.5 ? '#000' : '#f0d0a0'); g.globalAlpha = 1;
  }, { rep: false });
  TEX.palas = CT(64, 96, (g, w, h, r) => {
    noiseFill(g, w, h, '#6b4a2e', 14, r);
    g.fillStyle = '#c8a86a'; g.fillRect(4, 4, w - 8, 2); g.fillRect(4, h - 6, w - 8, 2); g.fillRect(4, 4, 2, h - 8); g.fillRect(w - 6, 4, 2, h - 8);
    for (let y = 14; y < h - 10; y += 14) for (let x = 14; x < w - 10; x += 14) { g.fillStyle = (x + y) % 28 ? '#a2563a' : '#d9c08a'; g.fillRect(x - 3, y - 3, 6, 6); }
  }, { rep: false });
  // --- постер «Спартака» ---
  TEX.poster = CT(96, 128, (g, w, h, r) => {
    g.fillStyle = '#c4161c'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff'; g.fillRect(0, 26, w, 6); g.fillRect(0, h - 34, w, 4);
    g.fillStyle = '#fff'; g.font = 'bold 17px Arial Black, Arial'; g.textAlign = 'center'; g.fillText('СПАРТАК', w / 2, 20);
    g.font = 'bold 11px Arial'; g.fillText('ЧЕМПИОН!', w / 2, h - 18); g.font = 'bold 9px Arial'; g.fillText('2016/17', w / 2, h - 6);
    for (let i = 0; i < 5; i++) {
      const x = 12 + i * 18, y = 50 + (i % 2) * 6;
      px(g, x - 3, y - 10, '#e0b090', 6, 6); px(g, x - 3, y - 11, '#3a2a1a', 6, 2);
      px(g, x - 5, y - 4, '#e01a22', 10, 14); px(g, x - 5, y + 1, '#fff', 10, 2);
      px(g, x - 4, y + 10, '#fff', 3, 10); px(g, x + 1, y + 10, '#fff', 3, 10);
      px(g, x - 8, y - 6, '#e0b090', 3, 3); px(g, x + 5, y - 6, '#e0b090', 3, 3);
    }
    px(g, 44, 34, '#e8c040', 8, 10); px(g, 46, 44, '#e8c040', 4, 4); px(g, 42, 48, '#e8c040', 12, 3);
    g.globalAlpha = 0.15; for (let i = 0; i < 300; i++) px(g, r() * w, r() * h, '#000'); g.globalAlpha = 1;
  }, { rep: false });
  // --- двери ---
  TEX.doorPadded = CT(64, 128, (g, w, h, r) => {
    noiseFill(g, w, h, '#5b2f20', 16, r);
    g.strokeStyle = 'rgba(20,8,4,0.6)'; g.lineWidth = 1;
    for (let i = -128; i < 192; i += 16) { g.beginPath(); g.moveTo(i, 8); g.lineTo(i + 120, 128); g.stroke(); g.beginPath(); g.moveTo(i + 120, 8); g.lineTo(i, 128); g.stroke(); }
    for (let y = 8; y < h; y += 16) for (let x = 0; x < w; x += 16) { px(g, x + ((y / 16) % 2 ? 8 : 0) - 1, y - 1, '#d6b46c', 2, 2); }
    g.fillStyle = '#2a140c'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); g.fillRect(w - 3, 0, 3, h);
    px(g, 24, 18, '#c8a24c', 16, 10); g.fillStyle = '#3a2410'; g.font = 'bold 9px Arial'; g.textAlign = 'center'; g.fillText('10', 32, 26);
    px(g, 31, 34, '#111', 3, 3); px(g, 52, 64, '#c0a060', 6, 3); px(g, 53, 72, '#888', 3, 6);
  }, { rep: false });
  TEX.doorWhite = CT(32, 64, (g, w, h, r) => {
    noiseFill(g, w, h, '#e6e2d6', 6, r);
    g.strokeStyle = 'rgba(120,110,90,0.55)'; g.strokeRect(4.5, 4.5, 23, 24); g.strokeRect(4.5, 33.5, 23, 26);
    px(g, 25, 31, '#b0a080', 4, 2);
  }, { rep: false });
  TEX.doorGlass = CT(32, 64, (g, w, h, r) => {
    noiseFill(g, w, h, '#e6e2d6', 6, r);
    px(g, 5, 5, '#a9c0c4', 22, 30); g.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 6; i++) g.fillRect(6 + i * 4, 6, 1, 28);
    g.strokeStyle = 'rgba(120,110,90,0.55)'; g.strokeRect(4.5, 40.5, 23, 19); px(g, 25, 36, '#b0a080', 4, 2);
  }, { rep: false });
  TEX.woodDark = CT(32, 32, (g, w, h, r) => { noiseFill(g, w, h, '#5a3822', 10, r); g.globalAlpha = 0.25; for (let y = 0; y < h; y += 2) { g.fillStyle = r() < 0.5 ? '#3a2214' : '#7a5034'; g.fillRect(0, y, w, 1); } g.globalAlpha = 1; });
  TEX.woodLight = CT(32, 32, (g, w, h, r) => { noiseFill(g, w, h, '#a8784a', 10, r); g.globalAlpha = 0.25; for (let y = 0; y < h; y += 2) { g.fillStyle = r() < 0.5 ? '#6a4224' : '#c89a64'; g.fillRect(0, y, w, 1); } g.globalAlpha = 1; });
  TEX.woodPaint = CT(32, 32, (g, w, h, r) => { noiseFill(g, w, h, '#6e8a4a', 14, r); g.globalAlpha = 0.4; for (let i = 0; i < 30; i++) px(g, r() * w, r() * h, '#8a6a44', 2 + r() * 4, 1); g.globalAlpha = 1; });
  TEX.plaid = CT(32, 32, (g, w, h, r) => { g.fillStyle = '#2f4f7a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(40,110,70,0.7)'; g.fillRect(0, 8, w, 8); g.fillRect(8, 0, 8, h); g.fillStyle = 'rgba(220,200,90,0.6)'; g.fillRect(0, 23, w, 1); g.fillRect(23, 0, 1, h); noiseFill2(g, w, h, 12, r); });
  TEX.pinkDots = CT(32, 32, (g, w, h, r) => { g.fillStyle = '#e8a0b8'; g.fillRect(0, 0, w, h); for (let y = 2; y < h; y += 8) for (let x = 2; x < w; x += 8) px(g, x + ((y / 8) % 2) * 4, y, '#fff2f6', 2, 2); });
  TEX.oilcloth = CT(32, 32, (g, w, h, r) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#e8e2d4' : '#c23a3a'; g.fillRect(x * 8, y * 8, 8, 8); } noiseFill2(g, w, h, 10, r); });
  TEX.robe = CT(32, 32, (g, w, h, r) => { g.fillStyle = '#2b3f6e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 18; i++) { const x = r() * w, y = r() * h; px(g, x, y, '#e6c25a', 2, 2); px(g, x + 2, y + 1, '#c8505a', 1, 1); } });
  TEX.scarf = CT(32, 32, (g, w, h, r) => { g.fillStyle = '#efe4c8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 14; i++) { const x = r() * w, y = r() * h; px(g, x, y, '#c43a3a', 3, 3); px(g, x + 1, y + 3, '#4a7a3a', 1, 2); } g.fillStyle = '#c43a3a'; g.fillRect(0, h - 3, w, 3); });
  TEX.tracksuit = CT(32, 32, (g, w, h, r) => { noiseFill(g, w, h, '#1d1f24', 6, r); g.fillStyle = '#e8e8e8'; g.fillRect(2, 0, 2, h); g.fillRect(6, 0, 2, h); g.fillRect(10, 0, 2, h); });
  TEX.kostyaShirt = CT(32, 32, (g, w, h, r) => { noiseFill(g, w, h, '#b8282a', 8, r); g.fillStyle = '#fff'; g.font = 'bold 12px Arial'; g.textAlign = 'center'; g.fillText('10', 16, 22); });
  TEX.vanyaShirt = CT(32, 32, (g, w, h, r) => { noiseFill(g, w, h, '#e8c43a', 8, r); px(g, 11, 10, '#2a7ac8', 10, 10); px(g, 14, 13, '#fff', 4, 4); });
  TEX.koshelek = CT(16, 16, (g, w, h, r) => { noiseFill(g, w, h, '#7a1f2a', 20, r); px(g, 0, 7, '#c8a050', 16, 1); });
  // --- подъезд ---
  TEX.podGreen = CT(64, 64, (g, w, h, r) => {
    noiseFill(g, w, h, '#3f7656', 12, r);
    blotches(g, w, h, r, ['#33644a', '#4b8564'], 10, 3, 10, 0.4);
    g.globalAlpha = 0.5; for (let i = 0; i < 14; i++) { g.strokeStyle = r() < 0.5 ? '#9cc4a8' : '#26443a'; g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 16, y + (r() - 0.5) * 6); g.stroke(); } g.globalAlpha = 1;
  });
  TEX.podWhite = CT(64, 64, (g, w, h, r) => { noiseFill(g, w, h, '#d9d4c3', 12, r); blotches(g, w, h, r, ['#bdb6a0', '#c9c1a8', '#e8e2d0'], 14, 3, 12, 0.35); });
  TEX.metlakh = CT(64, 64, (g, w, h, r) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = ((x + y) % 2) ? '#b9a27c' : '#8a5f3e'; g.fillRect(x * 8, y * 8, 8, 8); if ((x + y) % 4 === 0) { px(g, x * 8 + 3, y * 8 + 3, '#d9c8a0', 2, 2); } }
    g.fillStyle = 'rgba(30,20,10,0.35)'; for (let i = 0; i <= 64; i += 8) { g.fillRect(i, 0, 1, 64); g.fillRect(0, i, 64, 1); }
    blotches(g, w, h, r, ['#5a4a3a'], 6, 2, 6, 0.25); noiseFill2(g, w, h, 12, r);
  });
  TEX.concrete = CT(64, 64, (g, w, h, r) => { noiseFill(g, w, h, '#8e8a82', 22, r); blotches(g, w, h, r, ['#6e6a62', '#a6a298'], 12, 2, 8, 0.35); });
  TEX.concreteWet = CT(64, 64, (g, w, h, r) => { noiseFill(g, w, h, '#55524c', 18, r); blotches(g, w, h, r, ['#3e3c38', '#6a665e'], 12, 2, 8, 0.4); });
  TEX.rail = CT(16, 16, (g, w, h, r) => { noiseFill(g, w, h, '#6a3a22', 18, r); });
  TEX.mailbox = CT(64, 48, (g, w, h, r) => {
    noiseFill(g, w, h, '#3c5e8c', 14, r);
    for (let y = 0; y < 2; y++) for (let x = 0; x < 4; x++) { g.strokeStyle = '#1e2e48'; g.strokeRect(x * 16 + 1.5, y * 24 + 1.5, 13, 21); px(g, x * 16 + 4, y * 24 + 5, '#111', 8, 2); g.fillStyle = '#e8e8e8'; g.font = '7px Arial'; g.fillText(String(y * 4 + x + 1 + 4), x * 16 + 5, y * 24 + 18); }
  }, { rep: false });
  TEX.notice = CT(96, 128, (g, w, h, r) => {
    noiseFill(g, w, h, '#f1eee4', 8, r);
    g.fillStyle = '#1a1a1a'; g.textAlign = 'center'; g.font = 'bold 12px Arial'; g.fillText('ОБЪЯВЛЕНИЕ', w / 2, 18);
    g.font = '9px Arial'; const L = ['Уважаемые жильцы!', 'С 1 по 14 июня', 'будет отключена', 'ГОРЯЧАЯ ВОДА.', 'Приносим извинения', 'за неудобства.', '', 'Управляющая', 'компания'];
    L.forEach((s, i) => g.fillText(s, w / 2, 36 + i * 10));
    px(g, 40, 0, 'rgba(200,190,140,0.8)', 16, 5);
  }, { rep: false });
  TEX.noSmoke = CT(64, 32, (g, w, h) => { g.fillStyle = '#f4f0e0'; g.fillRect(0, 0, w, h); g.fillStyle = '#b01818'; g.font = 'bold 11px Arial'; g.textAlign = 'center'; g.fillText('НЕ КУРИТЬ!', w / 2, 20); }, { rep: false });
  TEX.panel = CT(32, 64, (g, w, h, r) => { noiseFill(g, w, h, '#7d8a8a', 12, r); g.strokeStyle = '#3a4444'; g.strokeRect(1.5, 1.5, 29, 61); px(g, 22, 30, '#2a2a2a', 4, 6); g.fillStyle = '#e8d020'; g.font = 'bold 9px Arial'; g.fillText('⚡', 10, 20); }, { rep: false });
  // --- улица ---
  TEX.facade = CT(512, 320, (g, w, h, r) => {
    noiseFill(g, w, h, '#c4beb0', 12, r, 2);
    for (let f = 0; f < 5; f++) for (let b = 0; b < 16; b++) {
      const x = b * 32, y = f * 64;
      g.fillStyle = 'rgba(70,64,56,0.55)'; g.fillRect(x, y, 32, 1); g.fillRect(x, y, 1, 64);
      g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x + 1, y + 60, 31, 4);
      const wx = x + 7, wy = y + 14;
      px(g, wx - 1, wy - 1, '#e6e4dc', 20, 32);
      const lit = r() < 0.1;
      const gr = g.createLinearGradient(0, wy, 0, wy + 30); gr.addColorStop(0, lit ? '#e8c880' : '#5a6e80'); gr.addColorStop(1, lit ? '#b8904a' : '#2a3440');
      g.fillStyle = gr; g.fillRect(wx, wy, 18, 30);
      const cur = r(); if (cur < 0.6) { g.fillStyle = cur < 0.3 ? 'rgba(240,240,230,0.75)' : ['#c87850', '#7a9ac8', '#d8b060', '#a86a9a'][Math.floor(r() * 4)]; g.fillRect(wx, wy, 5, 30); g.fillRect(wx + 13, wy, 5, 30); }
      px(g, wx + 8, wy, '#e6e4dc', 2, 30); px(g, wx, wy + 10, '#e6e4dc', 18, 2);
      px(g, wx - 2, wy + 31, '#9a968c', 22, 2);
      if (f === 4 && r() < 0.4) { g.fillStyle = '#2a2a2a'; for (let i = 0; i < 18; i += 4) g.fillRect(wx + i, wy, 1, 30); g.fillRect(wx, wy + 15, 18, 1); }
    }
    blotches(g, w, h, r, ['#9a9284', '#d8d2c4'], 40, 4, 16, 0.18);
  });
  TEX.panelPlain = CT(64, 64, (g, w, h, r) => { noiseFill(g, w, h, '#c0baac', 12, r, 2); g.fillStyle = 'rgba(70,64,56,0.5)'; g.fillRect(0, 0, 64, 1); g.fillRect(0, 0, 1, 64); g.fillRect(32, 0, 1, 64); });
  TEX.asphalt = CT(64, 64, (g, w, h, r) => {
    noiseFill(g, w, h, '#4a4a4b', 30, r);
    g.strokeStyle = 'rgba(20,20,20,0.6)'; for (let i = 0; i < 4; i++) { g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 18; y += (r() - 0.5) * 18; g.lineTo(x, y); } g.stroke(); }
    blotches(g, w, h, r, ['#3a3a3a', '#5a5a58'], 8, 3, 10, 0.3);
  });
  TEX.ground = CT(128, 128, (g, w, h, r) => {
    noiseFill(g, w, h, '#5f7b36', 26, r, 2);
    blotches(g, w, h, r, ['#7a6546', '#6b5a3e', '#857052'], 16, 6, 20, 0.6);
    blotches(g, w, h, r, ['#4f6e2a', '#71903e'], 30, 3, 10, 0.5);
    for (let i = 0; i < 60; i++) px(g, r() * w, r() * h, r() < 0.7 ? '#e8d030' : '#f0f0e8', 2, 2);
  });
  TEX.dirt = CT(64, 64, (g, w, h, r) => { noiseFill(g, w, h, '#7a6648', 24, r, 2); blotches(g, w, h, r, ['#5e4e36', '#8e7a58'], 12, 3, 10, 0.4); });
  TEX.sand = CT(64, 64, (g, w, h, r) => { noiseFill(g, w, h, '#cdb27c', 30, r); blotches(g, w, h, r, ['#b89a64', '#ddc694'], 10, 3, 9, 0.4); });
  TEX.rust = CT(64, 64, (g, w, h, r) => { noiseFill(g, w, h, '#7a4628', 22, r); blotches(g, w, h, r, ['#a8622e', '#5a321c'], 14, 2, 8, 0.6); blotches(g, w, h, r, ['#4a6e9a'], 6, 4, 12, 0.5); });
  TEX.metalBlue = CT(32, 32, (g, w, h, r) => { noiseFill(g, w, h, '#4b6f9c', 14, r); blotches(g, w, h, r, ['#8a5a30', '#6a4020'], 6, 1, 4, 0.7); });
  TEX.metalRed = CT(32, 32, (g, w, h, r) => { noiseFill(g, w, h, '#a2403a', 14, r); blotches(g, w, h, r, ['#6a4020'], 6, 1, 4, 0.7); });
  TEX.garage = CT(64, 64, (g, w, h, r) => { noiseFill(g, w, h, '#6e6a5e', 16, r); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(31, 4, 2, 60); g.fillRect(4, 4, 56, 2); blotches(g, w, h, r, ['#8a5430', '#5a3a20'], 14, 2, 9, 0.6); });
  TEX.bark = CT(32, 64, (g, w, h, r) => { noiseFill(g, w, h, '#6a655c', 20, r); g.fillStyle = 'rgba(30,28,24,0.5)'; for (let i = 0; i < 10; i++) g.fillRect(r() * w, 0, 1, h); });
  TEX.birch = CT(32, 64, (g, w, h, r) => { noiseFill(g, w, h, '#e6e4dc', 10, r); for (let i = 0; i < 16; i++) px(g, r() * w, r() * h, '#2a2a26', 3 + r() * 8, 1 + r() * 2); });
  TEX.leaves = CT(64, 64, (g, w, h, r) => { noiseFill(g, w, h, '#4c7a2c', 30, r, 2); blotches(g, w, h, r, ['#6a9a3a', '#2e5a1c', '#86b048'], 40, 2, 6, 0.6); });
  TEX.leavesBirch = CT(64, 64, (g, w, h, r) => { noiseFill(g, w, h, '#6a9a34', 30, r, 2); blotches(g, w, h, r, ['#8ab84a', '#4a7a24', '#a8c858'], 40, 2, 5, 0.6); });
  TEX.fluff = CT(16, 16, (g, w, h) => { const gr = g.createRadialGradient(8, 8, 0, 8, 8, 8); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, { rep: false, mip: false });
  TEX.blob = CT(32, 32, (g, w, h) => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, { rep: false, mip: false });
  TEX.windowView = CT(256, 128, (g, w, h, r) => {
    const sky = g.createLinearGradient(0, 0, 0, 80); sky.addColorStop(0, '#8fb6e0'); sky.addColorStop(1, '#e8eef0'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(r() * w, 10 + r() * 30, 20 + r() * 20, 5 + r() * 4, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#c8c0b0'; g.fillRect(20, 40, 220, 70); g.fillStyle = '#8a8478'; g.fillRect(20, 40, 220, 2);
    for (let f = 0; f < 5; f++) for (let b = 0; b < 18; b++) { px(g, 26 + b * 12, 46 + f * 13, r() < 0.1 ? '#e0c080' : '#4a5a68', 6, 8); }
    for (let i = 0; i < 14; i++) { const x = r() * w, hh = 30 + r() * 40; g.fillStyle = '#3e5a2a'; g.beginPath(); g.ellipse(x, 128 - hh * 0.6, 10 + r() * 10, hh * 0.6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#5a7a3a'; g.beginPath(); g.ellipse(x - 3, 128 - hh * 0.7, 6 + r() * 6, hh * 0.4, 0, 0, Math.PI * 2); g.fill(); }
    for (let i = 0; i < 5; i++) { const x = r() * w; px(g, x, 70, '#e8e6e0', 2, 58); }
    g.fillStyle = '#5f7b36'; g.fillRect(0, 118, w, 10);
  }, { rep: false });
  TEX.screenOff = CT(16, 16, (g, w, h) => { g.fillStyle = '#1c2422'; g.fillRect(0, 0, w, h); px(g, 2, 2, '#2c3a36', 4, 2); }, { rep: false });
  TEX.monitorOn = CT(32, 32, (g, w, h) => { g.fillStyle = '#1a3a6a'; g.fillRect(0, 0, w, h); px(g, 2, 2, '#c0d0e0', 3, 3); px(g, 2, 8, '#c0d0e0', 3, 3); px(g, 0, 28, '#c8c8c8', 32, 4); px(g, 1, 29, '#3a8a3a', 6, 2); }, { rep: false });
  TEX.tv = CT(32, 24, (g, w, h, r) => { g.fillStyle = '#4a6a8a'; g.fillRect(0, 0, w, h); px(g, 4, 6, '#d8c8b0', 8, 10); px(g, 16, 4, '#2a3a5a', 14, 6); px(g, 0, 18, '#b01818', 32, 4); g.fillStyle = '#fff'; g.font = '4px Arial'; g.fillText('НОВОСТИ', 2, 21); }, { rep: false });
}
function noiseFill2(g, w, h, amp, rng) {
  const id = g.getImageData(0, 0, w, h), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const n = (rng() - 0.5) * amp; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(id, 0, 0);
}
// --- лица персонажей (32x32, две версии рта для разговора) ---
function faceTex(o) {
  const mk = (open) => CT(32, 32, (g, w, h, r) => {
    g.fillStyle = o.skin; g.fillRect(0, 0, w, h);
    const ey = o.eyeY || 14, ex = o.eyeX || 8;
    if (o.wrinkles) { g.fillStyle = 'rgba(80,40,30,0.35)'; g.fillRect(ex - 1, ey + 4, 5, 1); g.fillRect(31 - ex - 4, ey + 4, 5, 1); g.fillRect(10, 6, 12, 1); g.fillRect(9, 25, 2, 3); g.fillRect(21, 25, 2, 3); }
    px(g, ex, ey, '#f4f0ea', 5, 3); px(g, 32 - ex - 5, ey, '#f4f0ea', 5, 3);
    px(g, ex + (o.lookSide || 2), ey, o.eye || '#3a2a1a', 2, 3); px(g, 32 - ex - 5 + (o.lookSide || 2), ey, o.eye || '#3a2a1a', 2, 3);
    if (o.lashes) { px(g, ex - 1, ey - 1, '#1a1010', 7, 1); px(g, 32 - ex - 6, ey - 1, '#1a1010', 7, 1); }
    px(g, ex - 1, ey - 3 + (o.browUp || 0), o.brow || '#3a2a1a', 6, o.browH || 1); px(g, 32 - ex - 5, ey - 3 + (o.browUp || 0), o.brow || '#3a2a1a', 6, o.browH || 1);
    px(g, 15, ey + 3, 'rgba(0,0,0,0.18)', 2, 4); px(g, 14, ey + 7, 'rgba(0,0,0,0.12)', 4, 1);
    if (o.freckles) { for (let i = 0; i < 8; i++) px(g, 7 + r() * 18, ey + 4 + r() * 4, 'rgba(150,80,40,0.55)', 1, 1); }
    if (o.blush) { px(g, ex - 1, ey + 6, 'rgba(230,90,90,0.25)', 5, 2); px(g, 32 - ex - 4, ey + 6, 'rgba(230,90,90,0.25)', 5, 2); }
    const my = o.mouthY || 24, mw = o.mouthW || 8, mc = o.lips || '#8a3a34';
    if (open) { px(g, 16 - mw / 2, my - 1, '#3a1410', mw, 3); px(g, 16 - mw / 2 + 1, my - 1, '#e8e0d8', mw - 2, 1); }
    else if (o.smile) { px(g, 16 - mw / 2, my - 1, mc, 1, 1); px(g, 16 - mw / 2 + 1, my, mc, mw - 2, 1); px(g, 16 + mw / 2 - 1, my - 1, mc, 1, 1); }
    else px(g, 16 - mw / 2, my, mc, mw, 1);
    if (o.stubble) { g.globalAlpha = 0.25; for (let i = 0; i < 40; i++) px(g, 8 + r() * 16, 22 + r() * 8, '#3a2a20'); g.globalAlpha = 1; }
  }, { rep: false, mip: false, seed: o.seed || 5 });
  return [mk(false), mk(true)];
}
// --- старое фото с новогоднего утренника (2 класс, декабрь 2011) ---
function drawUtrennikPhoto() {
  return CT(320, 220, (g, w, h, r) => {
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#3a5a8a'); bg.addColorStop(1, '#22304a'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = '#6a3a2a'; g.fillRect(0, 150, w, 70);
    for (let i = 0; i < 26; i++) { g.fillStyle = ['#e8d040', '#c8c8d8', '#e05050', '#50c060'][i % 4]; g.beginPath(); g.arc(i * 13, 18 + Math.sin(i) * 6, 3, 0, 7); g.fill(); }
    g.fillStyle = '#f0f0ff'; g.font = '18px Arial'; for (let i = 0; i < 8; i++) g.fillText('❄', 20 + r() * 280, 40 + r() * 50);
    g.fillStyle = '#1e5a2a'; g.beginPath(); g.moveTo(290, 30); g.lineTo(320, 150); g.lineTo(255, 150); g.closePath(); g.fill();
    const kid = (x, body, head = '#e8c0a0', extra) => { g.fillStyle = body; g.fillRect(x - 13, 100, 26, 56); g.fillStyle = head; g.beginPath(); g.arc(x, 86, 12, 0, 7); g.fill(); g.fillStyle = '#2a1a10'; g.fillRect(x - 5, 84, 3, 3); g.fillRect(x + 3, 84, 3, 3); if (extra) extra(x); };
    kid(30, '#f0f0f8', '#e8c0a0', (x) => { g.fillStyle = '#d8e8ff'; g.fillRect(x - 14, 72, 28, 6); });
    kid(66, '#4a4a6a', '#e8c0a0', (x) => { g.fillStyle = '#c03030'; g.fillRect(x - 13, 70, 26, 8); });
    // Лиса — Коля
    kid(108, '#e07a2a', '#e8c0a0', (x) => { g.fillStyle = '#e8822e'; g.beginPath(); g.moveTo(x - 14, 82); g.lineTo(x, 96); g.lineTo(x + 14, 82); g.lineTo(x, 76); g.closePath(); g.fill(); g.beginPath(); g.moveTo(x - 12, 78); g.lineTo(x - 8, 62); g.lineTo(x - 2, 76); g.fill(); g.beginPath(); g.moveTo(x + 12, 78); g.lineTo(x + 8, 62); g.lineTo(x + 2, 76); g.fill(); g.fillStyle = '#fff'; g.fillRect(x - 4, 120, 8, 30); g.fillStyle = '#e07a2a'; g.fillRect(x + 12, 130, 18, 8); g.fillStyle = '#fff'; g.fillRect(x + 26, 130, 5, 8); });
    // Колобок — Хатем
    g.fillStyle = '#f0c040'; g.beginPath(); g.arc(160, 112, 34, 0, 7); g.fill(); g.fillStyle = '#e8c0a0'; g.beginPath(); g.arc(160, 100, 12, 0, 7); g.fill(); g.fillStyle = '#2a1a10'; g.fillRect(155, 97, 3, 3); g.fillRect(163, 97, 3, 3); g.fillStyle = '#c04040'; g.fillRect(156, 105, 8, 2);
    kid(208, '#f0f0f8', '#e8c0a0', (x) => { g.fillStyle = '#ffffff'; g.fillRect(x - 6, 60, 4, 16); g.fillRect(x + 2, 60, 4, 16); });
    kid(246, '#3a7ad8', '#e8c0a0', (x) => { g.fillStyle = '#e8e8ff'; g.fillRect(x - 14, 70, 28, 7); });
    kid(282, '#202020', '#e8c0a0', (x) => { g.fillStyle = '#202020'; g.fillRect(x - 12, 68, 24, 8); g.fillStyle = '#fff'; g.fillRect(x - 3, 70, 6, 3); });
    g.globalAlpha = 0.25; const fl = g.createRadialGradient(150, 100, 10, 150, 100, 220); fl.addColorStop(0, 'rgba(255,255,230,0.8)'); fl.addColorStop(1, 'rgba(0,0,0,0.9)'); g.fillStyle = fl; g.fillRect(0, 0, w, h); g.globalAlpha = 1;
    noiseFill2(g, w, h, 20, r);
    g.fillStyle = '#ff8a1a'; g.font = 'bold 14px Courier New, monospace'; g.fillText("27 12 '11", 214, 208);
  }, { canvasOnly: true, seed: 2011 });
}
