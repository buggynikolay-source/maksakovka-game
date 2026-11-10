// =====================================================================
// §11. СОСТОЯНИЕ, СОХРАНЕНИЯ, СМЕНА СЦЕН, ГЛАВНЫЙ ЦИКЛ, МЕНЮ
// =====================================================================
const S0 = () => ({ v: 1, scene: 'flat', flags: {}, rel: {}, traits: { доброта: 0, честность: 0, смелость: 0, хитрость: 0 }, money: 0, items: { phone: false, spinner: false, backpack: false, bucket: false }, tasks: [] });
let S = S0(), S_snap = null;
const F = (k) => !!S.flags[k];
function setF(k, v = true) { S.flags[k] = v; }
const REL_NAMES = { сестра: 'Алёнка', мама: 'Мама', влад: 'Влад', костя: 'Костя', ваня: 'Ваня', шура: 'Баба Шура', отец: 'Отец' };
function rel(who, d) {
  S.rel[who] = (S.rel[who] || 0) + d;
  if (settings.remember) { toast(`${REL_NAMES[who] || who} это запомнит.`, 'rem' + (d < 0 ? ' neg' : '')); AU.remember(); }
}
function trait(k, d) { S.traits[k] = (S.traits[k] || 0) + d; if (settings.remember) toast(`${k[0].toUpperCase() + k.slice(1)} ${d > 0 ? '+' : ''}${d}`, 'trait'); }
function saveGame() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function loadGame() { const s = loadJSON(SAVE_KEY); if (!s || !s.scene || !SCENES[s.scene]) return null; return Object.assign(S0(), s); }
const clone = (o) => JSON.parse(JSON.stringify(o));

function clearChoices() { DLG.choice = null; UI.choices.classList.remove('on'); UI.choices.innerHTML = ''; }
function disposeWorld() {
  if (!W) return;
  W.scene.remove(camera);
  W.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  renderer.renderLists.dispose();
}
async function goScene(name, o = {}) {
  BUSY = true; P.ctrl = false; setPrompt(null);
  if (!o.instant && fadeV < 1) await fade(1, 0.6);
  AU.stopAll(); resetTimers(); hideDlg(); clearChoices(); hideHint();
  UI.rec.classList.remove('on'); UI.bark.classList.remove('on'); UI.photo.classList.remove('on');
  VMD.mode = 'none'; CAM.override = false; P.look = null; S.items.bucket = false;
  disposeWorld();
  S.scene = name;
  SCENES[name].build();
  S_snap = clone(S); saveGame();
  const ep = EPOCH;
  try { await SCENES[name].start(); } catch (e) { console.error(e); showErr(e); }
  if (ep === EPOCH) { BUSY = false; P.ctrl = true; P.look = null; hideDlg(); }
}

// --- главный цикл ---
let lastT = performance.now(), fpsAcc = 0, fpsN = 0, FPS = 60;
function render() {
  if (!W) { renderer.setRenderTarget(null); renderer.setClearColor(0x000000); renderer.clear(); return; }
  renderer.setRenderTarget(rt); renderer.render(W.scene, camera);
  renderer.setRenderTarget(null); renderer.render(postScene, postCam);
}
function frame(now) {
  requestAnimationFrame(frame);
  let dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)); lastT = now;
  fpsAcc += dt; fpsN++; if (fpsAcc > 1) { FPS = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }
  if (MODE === 'play' && W) {
    dt *= VMT.speed;
    GT += dt; tickTimers();
    for (const u of W.updates) { try { u(dt); } catch (e) { console.error(e); } }
    for (const p of W.people) p.update(dt);
    updatePlayer(dt);
    for (const t of W.triggers) {
      if (t.done || BUSY) continue;
      let ok = false; try { ok = t.test(); } catch (e) { console.error(e); }
      if (ok) { if (t.once) t.done = true; try { t.fn(); } catch (e) { console.error(e); } }
    }
    updateInteract(); updateDlg(dt); updateViewmodel(dt);
    AU.updateBeds(camera.position);
  }
  render();
}

// --- экраны: титул, пауза, настройки, финал ---
const SCR = { title: $('#title'), pause: $('#pause'), settings: $('#settings'), end: $('#end') };
function showScreen(name) { for (const k in SCR) SCR[k].classList.toggle('on', k === name); }
let settingsFrom = 'title', pauseT = 0;
function openPause() {
  if (MODE !== 'play') return;
  MODE = 'pause'; PAUSED = true; pauseT = performance.now(); showScreen('pause');
  if (document.pointerLockElement) { intentionalUnlock = true; document.exitPointerLock(); }
  if (AU.ctx) AU.ctx.suspend();
  for (const k in keys) keys[k] = false;
}
function resumeGame() {
  if (performance.now() - pauseT < 350) return;
  showScreen(null); MODE = 'play'; PAUSED = false;
  if (AU.ctx) AU.ctx.resume();
  requestLock();
}
function openSettings(from) { settingsFrom = from; buildSettings(); showScreen('settings'); }
function closeSettings() { showScreen(settingsFrom); }
function buildSettings() {
  const el = $('#set-body'); el.innerHTML = '';
  const row = (label, ctrl) => { const r = document.createElement('div'); r.className = 'srow'; const l = document.createElement('label'); l.textContent = label; r.appendChild(l); r.appendChild(ctrl); el.appendChild(r); return r; };
  const styles = document.createElement('div'); styles.className = 'seg';
  for (const k in STYLE_PRESETS) {
    const b = document.createElement('button'); b.textContent = STYLE_PRESETS[k].name; b.className = settings.style === k ? 'on' : '';
    b.onclick = () => { Object.assign(settings, STYLE_PRESETS[k], { style: k }); delete settings.name; applySettings(); buildSettings(); };
    styles.appendChild(b);
  }
  row('Графика', styles);
  const range = (key, min, max, step, fmt) => {
    const w = document.createElement('div'); w.className = 'rng';
    const i = document.createElement('input'); i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = settings[key];
    const v = document.createElement('span'); v.textContent = fmt(settings[key]);
    i.oninput = () => { settings[key] = parseFloat(i.value); v.textContent = fmt(settings[key]); if (key === 'px' || key === 'fov') settings.style = 'custom'; applySettings(); };
    w.appendChild(i); w.appendChild(v); return w;
  };
  const check = (key) => { const i = document.createElement('input'); i.type = 'checkbox'; i.checked = !!settings[key]; i.onchange = () => { settings[key] = i.checked; if (key !== 'remember') settings.style = 'custom'; applySettings(); }; return i; };
  row('Размер пикселя', range('px', 1, 6, 1, (v) => v + '×'));
  row('Дрожание вершин (PS1)', check('snap'));
  row('Дизеринг', check('dither'));
  row('Подсказки «… это запомнит»', check('remember'));
  row('Чувствительность мыши', range('sens', 0.3, 2.5, 0.05, (v) => v.toFixed(2)));
  row('Громкость', range('vol', 0, 1, 0.05, (v) => Math.round(v * 100) + '%'));
  row('Поле зрения', range('fov', 60, 95, 1, (v) => v + '°'));
}
const FLAG_TEXT = {
  взял_деньги_мамы: 'Тихо взял 100 ₽ из маминого кошелька', попросил_деньги: 'Попросил у мамы — дала 50 ₽', не_взял_деньги: 'Не взял денег из дома',
  видел_фото_утренника: 'Видел фото с новогоднего утренника', вспомнил_утренник: 'Мама рассказала про Лису и Колобка', не_умылся: 'Ушёл, не умывшись',
  помог_бабе_шуре: 'Помог бабе Шуре: спустил ведро', нахамил_бабе_шуре: 'Нахамил бабе Шуре', батл_про_мамок: 'Начался «батл про мамок» с Владом',
  видео_кости: 'Снял «солнышко» Кости на телефон', соврал_ване: 'Соврал Ване, что твой спиннер крутится пять минут',
};
async function endDemo() {
  MODE = 'end'; PAUSED = true;
  if (document.pointerLockElement) { intentionalUnlock = true; document.exitPointerLock(); }
  AU.stopAll(); if (VMD.snd) VMD.snd.set(0);
  const fl = Object.keys(S.flags).filter((k) => FLAG_TEXT[k]).map((k) => `<li>${esc(FLAG_TEXT[k])}</li>`).join('') || '<li>Ничего особенного — тихое утро.</li>';
  const lock = (ok, t1, t2) => `<li class="${ok ? 'ok' : 'no'}"><span class="bd">${ok ? 'открыто' : 'закрыто'}</span> <b>${esc(t1)}</b> — ${esc(t2)}</li>`;
  const need = 150 - S.money;
  const ahead = [
    lock(F('вспомнил_утренник'), 'Школа, Хатем', F('вспомнил_утренник') ? 'откроются два особых ответа: дразнилка или извинение' : (F('видел_фото_утренника') ? 'вы видели фото, но так и не узнали, что тогда случилось' : 'вы чего-то не помните')),
    lock(F('помог_бабе_шуре'), 'Магазин, тётя Люба', F('помог_бабе_шуре') ? 'баба Шура уже позвонила дочке: можно попросить в долг' : 'нужно было быть добрее с соседями'),
    lock(need <= 0, 'Чипсы и газировка', need <= 0 ? `денег хватает: ${S.money} ₽ из 150` : `у тебя ${S.money} ₽ — не хватает ${need} ₽`),
  ];
  const evening = [];
  if (F('взял_деньги_мамы')) evening.push('Мама заметит, что из кошелька пропала сотка.');
  if (F('нахамил_бабе_шуре')) evening.push('Баба Шура позвонит маме.');
  if (!F('вспомнил_утренник') && F('видел_фото_утренника')) evening.push('Мама сама вспомнит про фото с утренника.');
  const relT = Object.entries(S.rel).map(([k, v]) => `${REL_NAMES[k] || k} ${v > 0 ? '+' : ''}${v}`).join(' · ') || '—';
  const trT = Object.entries(S.traits).filter(([, v]) => v).map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`).join(' · ') || '—';
  $('#end-body').innerHTML = `
    <div class="e1">Конец демо-версии</div>
    <div class="e2">Дальше по сценарию: школа → магазин → гаражи → Кирпичка → вечер дома</div>
    <div class="cols"><div><h3>Что ты сделал этим утром</h3><ul>${fl}</ul></div>
    <div><h3>Что это откроет дальше</h3><ul class="locks">${ahead.join('')}</ul>${evening.length ? '<h3>Вечером дома</h3><ul>' + evening.map((t) => `<li>${esc(t)}</li>`).join('') + '</ul>' : ''}</div></div>
    <div class="dbg">Для теста — отношения: ${esc(relT)} · черты: ${esc(trT)} · деньги: ${S.money} ₽</div>`;
  showScreen('end'); await fade(0, 0.01);
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}
function startNew(scene = 'flat') {
  AU.init(); AU.setVol(settings.vol); if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume();
  S = S0();
  if (scene !== 'flat') Object.assign(S.items, { phone: true, spinner: true, backpack: true });
  MODE = 'play'; PAUSED = false; showScreen(null); requestLock();
  goScene(scene, { instant: true });
}
function continueGame() {
  const s = loadGame(); if (!s) return startNew();
  AU.init(); AU.setVol(settings.vol); if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume();
  S = s; MODE = 'play'; PAUSED = false; showScreen(null); requestLock();
  goScene(S.scene, { instant: true });
}
function restartScene() {
  if (!S_snap) return; S = clone(S_snap);
  MODE = 'play'; PAUSED = false; showScreen(null); if (AU.ctx) AU.ctx.resume(); requestLock();
  goScene(S.scene, { instant: true });
}
function jumpScene(name) {
  const keep = S; S = Object.assign(S0(), clone(keep));
  if (name !== 'flat') Object.assign(S.items, { phone: true, spinner: true, backpack: true });
  else { S = S0(); }
  MODE = 'play'; PAUSED = false; showScreen(null); if (AU.ctx) AU.ctx.resume(); requestLock();
  goScene(name, { instant: true });
}
function toTitle() { MODE = 'title'; PAUSED = true; AU.stopAll(); if (VMD.snd) VMD.snd.set(0); setTasks([]); hideDlg(); clearChoices(); setPrompt(null); refreshTitle(); showScreen('title'); disposeWorld(); W = null; }
function refreshTitle() { const s = loadGame(); const b = $('#b-cont'); b.style.display = s ? '' : 'none'; if (s) b.textContent = 'Продолжить · ' + ({ flat: 'Квартира', stairs: 'Подъезд', yard: 'Двор' }[s.scene] || s.scene); }
// кнопки
$('#b-new').onclick = () => startNew();
$('#b-cont').onclick = () => continueGame();
$('#b-set').onclick = () => openSettings('title');
$('#p-res').onclick = () => resumeGame();
$('#p-set').onclick = () => openSettings('pause');
$('#p-restart').onclick = () => restartScene();
$('#p-menu').onclick = () => toTitle();
document.querySelectorAll('[data-sc]').forEach((b) => (b.onclick = () => jumpScene(b.dataset.sc)));
$('#s-done').onclick = () => closeSettings();
$('#e-again').onclick = () => startNew();
$('#e-menu').onclick = () => toTitle();
// ошибки — показываем на экране, чтобы можно было прислать скриншот
function showErr(e) { const el = $('#err'); el.style.display = 'block'; el.textContent = 'Ошибка: ' + (e && (e.stack || e.message) || e) + '\n' + el.textContent.slice(0, 600); }
addEventListener('error', (e) => showErr(e.error || e.message));
addEventListener('unhandledrejection', (e) => showErr(e.reason));

// --- отладка и автотесты ---
const VMT = {
  speed: 1, TEST, P, DLG, settings, keys,
  get S() { return S; }, get W() { return W; }, get BUSY() { return BUSY; }, get FPS() { return FPS; }, get MODE() { return MODE; },
  start(scene = 'flat', auto = true) { TEST.auto = auto; startNew(scene); },
  tp(x, y, z, yaw = P.yaw, pitch = 0) { placePlayer(x, y, z, yaw, pitch); },
  inter(label) { const it = W.inter.find((i) => i.on && (!i.cond || i.cond()) && String(typeof i.label === 'function' ? i.label() : i.label).includes(label)); if (it) run(it.fn); return !!it; },
  labels() { return W.inter.filter((i) => i.on && (!i.cond || i.cond())).map((i) => (typeof i.label === 'function' ? i.label() : i.label)); },
  state() { return { scene: W && W.name, mode: MODE, busy: BUSY, ctrl: P.ctrl, pos: P.pos.toArray().map((v) => +v.toFixed(2)), yaw: +P.yaw.toFixed(2), dlg: UI.dlg.classList.contains('on') ? DLG.full : '', choice: DLG.choice ? DLG.choice.opts.map((o) => o.t) : null, money: S.money, flags: Object.keys(S.flags), rel: S.rel, tasks: S.tasks.map((t) => (t.done ? '✔' : '□') + t.t), fps: Math.round(FPS), calls: renderer.info.render.calls, tris: renderer.info.render.triangles }; },
  look(yaw, pitch = 0) { P.yaw = yaw; P.pitch = pitch; },
  goScene, endDemo,
};
window.VMT = VMT;

// --- запуск ---
buildTextures(); buildViewmodel(); applySettings(); refreshTitle();
$('#loading').style.display = 'none';
showScreen('title');
requestAnimationFrame(frame);
