module.exports = async (T) => {
  await T.shot('60_title');
  await T.page.click('#b-new'); 
  await T.until('!VMT.BUSY && VMT.MODE==="play"', 40000);
  const p0 = (await T.state()).pos;
  await T.page.keyboard.down('KeyW'); await T.wait(1200); await T.page.keyboard.up('KeyW');
  const p1 = (await T.state()).pos; T.log('walk', JSON.stringify(p0), JSON.stringify(p1));
  // ведро во вьюмодели
  await T.ev(() => { VMT.S.items.bucket = true; VMT.tp(2.5, 0, 4.0, 0, 0); }); await T.wait(500); await T.shot('61_bucket');
  await T.ev(() => { VMT.S.items.bucket = false; });
  // E — продвинуть мысль
  await T.ev(() => VMT.inter('Ковёр')); await T.wait(1500);
  T.log('dlg before', (await T.state()).dlg);
  await T.page.keyboard.press('KeyE'); await T.wait(300);
  T.log('after E', JSON.stringify((await T.state()).busy), (await T.state()).dlg);
  await T.page.keyboard.press('KeyE'); await T.wait(300);
  T.log('after E2', JSON.stringify((await T.state()).busy));
};
