const { chromium } = require('/vercel/sandbox/node_modules/playwright');
const steps = require(process.argv[2]);
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/local/bin/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const logs = [];
  page.on('console', (m) => { if (m.type() !== 'log' || /ERR|warn/i.test(m.text())) logs.push(m.type() + ': ' + m.text().slice(0, 400)); });
  page.on('pageerror', (e) => logs.push('PAGEERROR: ' + (e.stack || e.message).slice(0, 600)));
  await page.goto('file:///data/vm/dist/maksakovka_prologue_v0.1.html');
  await page.waitForTimeout(800);
  const T = {
    page, logs,
    wait: (ms) => page.waitForTimeout(ms),
    ev: (fn, arg) => page.evaluate(fn, arg),
    shot: async (n) => { await page.screenshot({ path: '/data/vm/shots/' + n + '.png' }); },
    state: async () => page.evaluate(() => VMT.state()),
    until: async (fnStr, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fnStr)) return true; await page.waitForTimeout(150); } return false; },
    log: (...a) => console.log(...a),
  };
  try { await steps(T); } catch (e) { console.log('STEP ERROR', e.message); }
  const err = await page.evaluate(() => document.getElementById('err').textContent);
  if (err) console.log('ERRBOX:', err.slice(0, 1500));
  console.log('LOGS:\n' + logs.slice(0, 40).join('\n'));
  await browser.close(); process.exit(0);
})();
