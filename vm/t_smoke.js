module.exports = async (T) => {
  await T.shot('00_title');
  await T.ev(() => { VMT.speed = 1; VMT.start('flat', true); });
  await T.wait(3000); await T.shot('01_flat_wake');
  await T.until('!VMT.BUSY', 30000);
  T.log(JSON.stringify(await T.state()));
  await T.shot('02_flat_control');
};
