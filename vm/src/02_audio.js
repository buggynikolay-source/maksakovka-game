// =====================================================================
// §2. ЗВУК: всё синтезируется WebAudio, без файлов
// =====================================================================
const AU = {
  ctx: null, master: null, nb: null, bnb: null, beds: [], loops: [],
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const ctx = (this.ctx = new C());
    this.master = ctx.createGain(); this.master.gain.value = settings.vol; this.master.connect(ctx.destination);
    const len = ctx.sampleRate * 2;
    const b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.nb = b;
    const bb = ctx.createBuffer(1, len, ctx.sampleRate), e = bb.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; e[i] = last * 3.5; }
    this.bnb = bb;
  },
  setVol(v) { if (this.master) this.master.gain.value = v; },
  get on() { return !!this.ctx; },
  tone(f, dur, o = {}) {
    if (!this.ctx) return; const c = this.ctx, t = c.currentTime + (o.at || 0);
    const osc = c.createOscillator(); osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
    if (o.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = o.vib; lg.gain.value = f * 0.02; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + 0.05); }
    const g = c.createGain(); const v = o.vol ?? 0.15;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.attack || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc;
    if (o.lp) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; osc.connect(fl); node = fl; }
    node.connect(g); g.connect(o.dest || this.master); osc.start(t); osc.stop(t + dur + 0.05);
  },
  noise(dur, o = {}) {
    if (!this.ctx) return; const c = this.ctx, t = c.currentTime + (o.at || 0);
    const s = c.createBufferSource(); s.buffer = o.brown ? this.bnb : this.nb; s.loop = true;
    const fl = c.createBiquadFilter(); fl.type = o.type || 'lowpass'; fl.frequency.setValueAtTime(o.f || 1000, t);
    if (o.f2) fl.frequency.exponentialRampToValueAtTime(o.f2, t + dur); fl.Q.value = o.q || 0.8;
    const g = c.createGain(); const v = o.vol ?? 0.15;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.attack || 0.003)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(o.dest || this.master); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  },
  // постоянный фон (шум с фильтром); pos — точка в мире для затухания по расстоянию
  bed(o = {}) {
    if (!this.ctx) return null; const c = this.ctx;
    const s = c.createBufferSource(); s.buffer = o.brown ? this.bnb : this.nb; s.loop = true;
    const fl = c.createBiquadFilter(); fl.type = o.type || 'lowpass'; fl.frequency.value = o.f || 400; fl.Q.value = o.q || 0.7;
    const g = c.createGain(); g.gain.value = 0;
    s.connect(fl); fl.connect(g); g.connect(this.master); s.start();
    const bed = { s, fl, g, vol: o.vol || 0.05, pos: o.pos || null, k: o.k || 0.15, mod: o.mod || null, stop() { try { g.gain.setTargetAtTime(0, c.currentTime, 0.2); s.stop(c.currentTime + 1); } catch (e) {} } };
    this.beds.push(bed); return bed;
  },
  stopAll() {
    for (const b of this.beds) b.stop(); this.beds = [];
    for (const l of this.loops) l.stop(); this.loops = [];
  },
  updateBeds(camPos) {
    if (!this.ctx) return; const t = this.ctx.currentTime;
    for (const b of this.beds) {
      let v = b.vol;
      if (b.pos) { const d = camPos.distanceTo(b.pos); v = b.vol / (1 + d * d * b.k); }
      if (b.mod) v *= b.mod(t);
      if (b.muted) v = 0;
      b.g.gain.setTargetAtTime(v, t, 0.08);
    }
  },
  // планировщик повторяющихся звуков
  loop(interval, fn) {
    const self = this; let alive = true, next = 0;
    const L = { stop() { alive = false; }, gain: null };
    const tick = () => { if (!alive || !self.ctx) return; const now = self.ctx.currentTime; if (next < now) next = now + 0.05; while (next < now + 0.25) { fn(next - now, next); next += typeof interval === 'function' ? interval() : interval; } setTimeout(tick, 60); };
    tick(); this.loops.push(L); return L;
  },
  // --- конкретные звуки ---
  click() { this.tone(880, 0.05, { type: 'square', vol: 0.03, lp: 3000 }); },
  remember() { this.tone(660, 0.25, { type: 'triangle', vol: 0.05 }); this.tone(990, 0.4, { type: 'triangle', vol: 0.04, at: 0.12 }); },
  coins() { for (let i = 0; i < 4; i++) this.tone(2400 + Math.random() * 1200, 0.12, { type: 'square', vol: 0.02, at: i * 0.07, lp: 6000 }); },
  step(tag) {
    const r = 0.85 + Math.random() * 0.3;
    switch (tag) {
      case 'carpet': this.noise(0.09, { f: 350 * r, vol: 0.06 }); break;
      case 'wood': this.noise(0.08, { type: 'bandpass', f: 700 * r, q: 1.2, vol: 0.09 }); this.tone(140 * r, 0.06, { vol: 0.03 }); break;
      case 'lino': this.noise(0.07, { type: 'bandpass', f: 1300 * r, q: 1.0, vol: 0.07 }); break;
      case 'tile': this.noise(0.06, { type: 'bandpass', f: 2200 * r, q: 1.6, vol: 0.08 }); break;
      case 'concrete': this.noise(0.09, { type: 'bandpass', f: 1100 * r, q: 0.9, vol: 0.11 }); this.noise(0.25, { type: 'bandpass', f: 900, q: 2, vol: 0.015, at: 0.05 }); break;
      case 'wet': this.noise(0.12, { type: 'bandpass', f: 2600 * r, q: 0.8, vol: 0.08 }); break;
      case 'asphalt': this.noise(0.08, { type: 'bandpass', f: 1500 * r, q: 0.7, vol: 0.08 }); break;
      case 'grass': this.noise(0.14, { type: 'highpass', f: 2600 * r, vol: 0.035 }); break;
      case 'sand': this.noise(0.16, { type: 'bandpass', f: 3200 * r, q: 0.6, vol: 0.06 }); break;
      default: this.noise(0.07, { type: 'bandpass', f: 1200 * r, vol: 0.07 });
    }
  },
  door(open = true) { this.noise(0.18, { f: 300, vol: 0.12 }); this.tone(open ? 420 : 300, 0.35, { type: 'sawtooth', vol: 0.012, f2: open ? 520 : 240, vib: 9, lp: 1200, at: 0.02 }); if (!open) this.noise(0.12, { f: 200, vol: 0.2, at: 0.3 }); },
  thud() { this.tone(90, 0.35, { vol: 0.35, f2: 40 }); this.noise(0.3, { f: 500, vol: 0.25 }); this.noise(0.6, { type: 'bandpass', f: 3000, vol: 0.05, at: 0.05 }); },
  splash() { for (let i = 0; i < 6; i++) this.noise(0.25, { type: 'bandpass', f: 1500 + Math.random() * 2000, q: 1.5, vol: 0.06, at: i * 0.12 }); },
  rec() { this.tone(1320, 0.09, { type: 'square', vol: 0.03, lp: 4000 }); this.tone(1760, 0.09, { type: 'square', vol: 0.03, lp: 4000, at: 0.11 }); },
  knock() { for (let i = 0; i < 3; i++) { this.noise(0.08, { f: 600, vol: 0.25, at: i * 0.22 }); this.tone(120, 0.08, { vol: 0.12, at: i * 0.22 }); } },
  // будильник старого андроида: мелодия + вибрация
  alarm() {
    const notes = [1318, 1568, 1976, 1568, 1318, 1568, 2637, 0];
    let i = 0; const self = this;
    const L = this.loop(0.16, (at) => { const f = notes[i % notes.length]; if (f) { self.tone(f, 0.22, { type: 'triangle', vol: 0.06, at }); self.tone(f * 2, 0.1, { type: 'sine', vol: 0.02, at }); } if (i % 8 < 3) self.noise(0.15, { f: 160, vol: 0.12, at, q: 3, type: 'bandpass' }); i++; });
    return L;
  },
  // бит у Влада из динамика телефона (хрипит)
  beat(getVol) {
    if (!this.ctx) return null; const c = this.ctx;
    const g = c.createGain(); g.gain.value = 0;
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 380;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200;
    const ws = c.createWaveShaper(); const curve = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curve[i] = Math.tanh(x * 3); } ws.curve = curve;
    const bus = c.createGain(); bus.gain.value = 1; bus.connect(ws); ws.connect(hp); hp.connect(lp); lp.connect(g); g.connect(this.master);
    const bpm = 140, s16 = 60 / bpm / 4; let step = 0; const self = this;
    const bass = [55, 0, 0, 55, 0, 0, 65.4, 0, 49, 0, 0, 49, 0, 0, 41.2, 0];
    const L = this.loop(s16, (at) => {
      const k = step % 16;
      if (k === 0 || k === 10) self.tone(110, 0.25, { vol: 0.5, f2: 40, at, dest: bus });
      if (k === 4 || k === 12) self.noise(0.18, { type: 'bandpass', f: 1800, q: 0.7, vol: 0.4, at, dest: bus });
      if (k % 2 === 0 || (step % 64 > 56)) self.noise(0.04, { type: 'highpass', f: 7000, vol: 0.12, at, dest: bus });
      if (bass[k]) self.tone(bass[k] * 2, 0.5, { type: 'sine', vol: 0.35, at, dest: bus });
      step++;
    });
    const B = { g, L, stop() { L.stop(); try { g.gain.setTargetAtTime(0, c.currentTime, 0.1); } catch (e) {} }, set(v) { g.gain.setTargetAtTime(v, c.currentTime, 0.1); } };
    this.loops.push(B); return B;
  },
  // Алёнка поёт в расчёску за дверью ванной (приглушённо)
  singing() {
    if (!this.ctx) return null; const c = this.ctx;
    const g = c.createGain(); g.gain.value = 0.0;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    lp.connect(g); g.connect(this.master);
    const mel = [659, 659, 587, 523, 587, 659, 0, 784, 659, 587, 523, 494, 523, 0, 0, 0];
    let i = 0; const self = this;
    const L = this.loop(0.32, (at) => {
      const f = mel[i % mel.length]; i++; if (!f) return;
      const t = c.currentTime + at;
      const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t);
      const vib = c.createOscillator(), vg = c.createGain(); vib.frequency.value = 5.5; vg.gain.value = 6; vib.connect(vg); vg.connect(o.frequency);
      const f1 = c.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 800; f1.Q.value = 6;
      const f2 = c.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1250; f2.Q.value = 7;
      const eg = c.createGain(); eg.gain.setValueAtTime(0.0001, t); eg.gain.exponentialRampToValueAtTime(0.5, t + 0.05); eg.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
      o.connect(f1); o.connect(f2); f1.connect(eg); f2.connect(eg); eg.connect(lp);
      o.start(t); vib.start(t); o.stop(t + 0.4); vib.stop(t + 0.4);
    });
    const Sg = { g, L, stop() { L.stop(); g.gain.setTargetAtTime(0, c.currentTime, 0.05); }, set(v) { g.gain.setTargetAtTime(v, c.currentTime, 0.1); } };
    this.loops.push(Sg); return Sg;
  },
  birds() {
    const self = this;
    return this.loop(() => 0.25 + Math.random() * 1.6, (at) => {
      if (Math.random() < 0.55) { const f = 2400 + Math.random() * 2600; const n = 1 + Math.floor(Math.random() * 4); for (let i = 0; i < n; i++) self.tone(f * (0.9 + Math.random() * 0.2), 0.07, { vol: 0.012 + Math.random() * 0.012, f2: f * (Math.random() < 0.5 ? 1.3 : 0.75), at: at + i * 0.09 }); }
    });
  },
  // жужжание спиннера: громкость и высота зависят от скорости
  spinner() {
    if (!this.ctx) return null; const c = this.ctx;
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 60;
    const n = c.createBufferSource(); n.buffer = this.nb; n.loop = true;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2000; bp.Q.value = 2;
    const g = c.createGain(); g.gain.value = 0;
    const og = c.createGain(); og.gain.value = 0.25;
    o.connect(og); og.connect(bp); n.connect(bp); bp.connect(g); g.connect(this.master); o.start(); n.start();
    return { set(speed) { const t = c.currentTime; const s = clamp(speed / 40, 0, 1); g.gain.setTargetAtTime(s * s * 0.05, t, 0.05); o.frequency.setTargetAtTime(20 + speed * 3, t, 0.05); bp.frequency.setTargetAtTime(800 + speed * 60, t, 0.05); } };
  },
};
