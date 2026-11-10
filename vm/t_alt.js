module.exports = async (T) => {
  const idle = async (ms = 40000) => { await T.wait(200); return T.until('!VMT.BUSY && VMT.MODE==="play"', ms); };
  await T.ev(() => { VMT.speed = 2; VMT.start('stairs', true); });
  await idle(30000);
  await T.ev(() => { VMT.S.flags['не_умылся'] = true; VMT.TEST.picks.push('help'); VMT.tp(-0.7, 5.6, 0.8, 0, -0.2); }); await T.wait(300); await idle();
  await T.ev(() => VMT.tp(-0.5, 4.5, -1.0, -Math.PI / 2, -0.25)); await T.wait(600); await T.shot('50_bucket_vm');
  await T.ev(() => VMT.tp(0.3, 1.5, -1.2, 0, -0.05)); await T.wait(600); await T.shot('51_vlad_sill');
  await T.ev(() => { VMT.TEST.picks.push('honest'); VMT.tp(-0.7, 2.6, 0.9, 0, -0.2); }); await T.wait(300);
  const seen = new Set(); const t0 = Date.now();
  while (Date.now() - t0 < 30000) { const s = await T.state(); if (s.dlg) seen.add(s.dlg.slice(0, 60)); if (!s.busy) break; await T.wait(100); }
  T.log('VLAD DLG:', [...seen].join(' | '));
  T.log(JSON.stringify(await T.state()));
  // двор с другими выборами
  await T.ev(() => { VMT.goScene('yard'); }); await T.until('VMT.W.name==="yard" && !VMT.BUSY', 30000);
  await T.ev(() => VMT.tp(6.5, 0, 11.0, Math.PI, 0.25)); await T.wait(100);
  await T.ev(() => { VMT.TEST.picks.push('no', 'lie'); });
  await T.wait(1500); await T.shot('52_kostya_hang_close');
  await T.wait(3500); await T.shot('53_stunt_mid');
  const seen2 = new Set(); const t1 = Date.now();
  while (Date.now() - t1 < 60000) { const s = await T.state(); if (s.dlg) seen2.add(s.dlg.slice(0, 50)); if (!s.busy) break; await T.wait(100); }
  T.log('YARD DLG:', [...seen2].join(' | '));
  T.log(JSON.stringify(await T.state()));
  await T.shot('54_after');
  await T.ev(() => VMT.tp(5.5, 0, 14.0, Math.PI * 1.1, -0.3)); await T.wait(500); await T.shot('55_sandbox');
  // пауза и настройки
  await T.ev(() => openPause && 0).catch(() => {});
  await T.page.keyboard.press('Escape'); await T.wait(400); await T.shot('56_pause');
  await T.page.click('#p-set'); await T.wait(300); await T.shot('57_settings');
};
