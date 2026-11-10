// =====================================================================
// §6. ИНТЕРФЕЙС: диалоги, выборы с замочками, задачи, подсказки, экраны
// =====================================================================
const UI = {};
['dlg', 'dlg-name', 'dlg-text', 'dlg-next', 'choices', 'prompt', 'tasks', 'toasts', 'hint', 'card', 'bark', 'fade', 'photo', 'lockhint', 'rec', 'cross'].forEach((id) => (UI[id.replace('-', '_')] = document.getElementById(id)));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SPK = {
  'Коля': '#9fd3ff', 'Мама': '#ffb38a', 'Алёнка': '#ff9fd0', 'Влад': '#b9ff8a', 'Костя': '#ffd36b', 'Ваня': '#8af0ff',
  'Баба Шура': '#e0c8ff', 'Голос мамы': '#ffb38a',
};
const DLG = { waiting: null, typing: false, full: '', shown: 0, choice: null, italic: false, autoT: 0, active: false };
function dlgBusy() { return !!(DLG.waiting || DLG.typing || DLG.choice); }
function advanceInput() {
  if (DLG.choice) return false;
  if (DLG.typing) { DLG.shown = DLG.full.length; return true; }
  if (DLG.waiting) { const r = DLG.waiting; DLG.waiting = null; r(); return true; }
  return false;
}
function renderDlgText() {
  const s = DLG.full.slice(0, Math.floor(DLG.shown));
  UI.dlg_text.innerHTML = esc(s).replace(/\n/g, '<br>');
}
function updateDlg(dt) {
  if (DLG.typing) {
    DLG.shown += dt * 52;
    if (DLG.shown >= DLG.full.length) { DLG.shown = DLG.full.length; DLG.typing = false; UI.dlg_next.style.opacity = 1; }
    renderDlgText();
  }
  if (TEST.auto && DLG.waiting && !DLG.typing) { DLG.autoT += dt; if (DLG.autoT > 0.05) { DLG.autoT = 0; advanceInput(); } }
  if (TEST.auto && DLG.choice) { const C = DLG.choice; const want = TEST.picks.length ? TEST.picks.shift() : null; let idx = -1; if (want !== null) idx = C.opts.findIndex((o) => o.id === want); if (idx < 0) idx = C.opts.findIndex((o) => !o.locked); pickChoice(idx); }
}
async function say(who, text, o = {}) {
  UI.dlg.classList.add('on'); UI.dlg.classList.toggle('think', !!o.think); UI.dlg.classList.toggle('ital', !!o.italic);
  UI.dlg_name.textContent = o.think ? 'Коля (про себя)' : who;
  UI.dlg_name.style.color = o.think ? '#9fd3ff' : SPK[who] || '#ffffff';
  const p = o.p || null;
  if (p) { p.talking = true; if (o.focus !== false) lookAtPerson(p); }
  DLG.full = text; DLG.shown = 0; DLG.typing = true; UI.dlg_next.style.opacity = 0; renderDlgText();
  await new Promise((r) => (DLG.waiting = r));
  if (p) p.talking = false;
}
const think = (text, o = {}) => say('Коля', text, Object.assign({ think: true }, o));
function hideDlg() { UI.dlg.classList.remove('on'); DLG.waiting = null; DLG.typing = false; }
// Выбор: [{t, id, locked, hint}] → id выбранного
function choose(opts) {
  return new Promise((res) => {
    UI.choices.innerHTML = '';
    const sel = Math.max(0, opts.findIndex((o) => !o.locked));
    DLG.choice = { opts, sel, res, acc: 0 };
    opts.forEach((op, i) => {
      const b = document.createElement('div');
      b.className = 'ch' + (op.locked ? ' locked' : '');
      b.innerHTML = `<span class="n">${i + 1}</span><span class="t">${op.locked ? '🔒 ' : ''}${esc(op.t)}</span>` + (op.locked && op.hint ? `<div class="h">${esc(op.hint)}</div>` : '');
      b.addEventListener('mouseenter', () => { if (!op.locked) selChoice(i); });
      b.addEventListener('mousedown', (e) => { e.stopPropagation(); pickChoice(i); });
      UI.choices.appendChild(b);
    });
    UI.choices.classList.add('on'); selChoice(sel);
  });
}
function selChoice(i) { const C = DLG.choice; if (!C) return; C.sel = i; [...UI.choices.children].forEach((el, k) => el.classList.toggle('sel', k === i)); }
function moveChoice(d) { const C = DLG.choice; if (!C) return; let i = C.sel; for (let k = 0; k < C.opts.length; k++) { i = (i + d + C.opts.length) % C.opts.length; if (!C.opts[i].locked) break; } selChoice(i); AU.tone(500, 0.03, { type: 'square', vol: 0.015 }); }
function pickChoice(i) {
  const C = DLG.choice; if (!C) return; const op = C.opts[i];
  if (!op || op.locked) { AU.tone(180, 0.15, { type: 'square', vol: 0.03 }); return; }
  AU.click(); DLG.choice = null; UI.choices.classList.remove('on'); UI.choices.innerHTML = '';
  C.res(op.id !== undefined ? op.id : i);
}
function choiceMouse(dy) { const C = DLG.choice; if (!C) return; C.acc += dy; if (C.acc > 70) { C.acc = 0; moveChoice(1); } if (C.acc < -70) { C.acc = 0; moveChoice(-1); } }
// задачи
function setTasks(list) { S.tasks = list.map((k) => Object.assign({ done: false }, k)); renderTasks(); }
function addTask(id, t) { if (!S.tasks.find((k) => k.id === id)) S.tasks.push({ id, t, done: false }); renderTasks(); }
function doneTask(id) { const k = S.tasks.find((x) => x.id === id); if (k && !k.done) { k.done = true; renderTasks(); AU.tone(784, 0.15, { type: 'triangle', vol: 0.04 }); AU.tone(1175, 0.25, { type: 'triangle', vol: 0.035, at: 0.1 }); } }
function taskDone(id) { const k = S.tasks.find((x) => x.id === id); return !!(k && k.done); }
function renderTasks() {
  const fmt = (t) => t.replace('{money}', S.money);
  UI.tasks.innerHTML = S.tasks.length ? '<div class="hd">Задачи</div>' + S.tasks.map((k) => `<div class="tk${k.done ? ' done' : ''}">${k.done ? '✔' : '□'} ${esc(fmt(k.t))}</div>`).join('') : '';
}
function toast(text, cls = '') {
  const d = document.createElement('div'); d.className = 'toast ' + cls; d.textContent = text; UI.toasts.appendChild(d);
  setTimeout(() => d.classList.add('out'), 3600); setTimeout(() => d.remove(), 4400);
}
let _hintT = null;
function showHint(html, dur = 6) { UI.hint.innerHTML = html; UI.hint.classList.add('on'); clearTimeout(_hintT); if (dur) _hintT = setTimeout(() => UI.hint.classList.remove('on'), dur * 1000); }
function hideHint() { UI.hint.classList.remove('on'); }
let _cardT = null;
function showCard(t1, t2, dur = 4.5) { UI.card.querySelector('.t1').textContent = t1; UI.card.querySelector('.t2').textContent = t2 || ''; UI.card.classList.add('on'); clearTimeout(_cardT); _cardT = setTimeout(() => UI.card.classList.remove('on'), dur * 1000); }
let _barkT = null;
function bark(who, text, dur = 3.2) { UI.bark.innerHTML = `<b style="color:${SPK[who] || '#fff'}">${esc(who)}:</b> ${esc(text)}`; UI.bark.classList.add('on'); clearTimeout(_barkT); _barkT = setTimeout(() => UI.bark.classList.remove('on'), dur * 1000); }
let fadeV = 1;
function setFade(v) { fadeV = v; UI.fade.style.opacity = v; }
function fade(to, dur = 0.8) { const f0 = fadeV; return tween(dur, (k) => setFade(lerp(f0, to, k)), linear); }
function setPrompt(t) { if (t) { UI.prompt.innerHTML = `<span class="key">E</span> ${esc(t)}`; UI.prompt.classList.add('on'); } else UI.prompt.classList.remove('on'); }
async function showPhoto(srcCanvas, caption) {
  const c = UI.photo.querySelector('canvas'); c.width = srcCanvas.width; c.height = srcCanvas.height; c.getContext('2d').drawImage(srcCanvas, 0, 0);
  UI.photo.querySelector('.cap').textContent = caption || ''; UI.photo.classList.add('on');
  await wait(0.4);
  await new Promise((r) => (DLG.waiting = r));
  UI.photo.classList.remove('on');
}
