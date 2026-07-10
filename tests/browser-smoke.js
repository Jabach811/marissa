const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('C:/Users/mabac/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright');

const root = path.resolve(__dirname, '..');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const pages = ['index.html', 'stylists/marissa.html'];
const viewports = [
  { width: 320, height: 700 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 1000 }
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function scrollThrough(page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= height; y += 600) {
    await page.evaluate(position => scrollTo(0, position), y);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(250);
}

async function validatePage(browser, file, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error)));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const location = message.location();
    if (location.url && /^https?:\/\//.test(location.url)) return;
    consoleErrors.push(message.text());
  });
  await page.goto(pathToFileURL(path.join(root, file)).href, { waitUntil: 'load' });
  await scrollThrough(page);

  if (file === 'index.html') {
    for (let index = 1; index <= 6; index += 1) {
      await page.locator(`#look-tab-${index}`).click();
      await page.waitForFunction(number => {
        const image = document.querySelector(`#look-panel-${number} img`);
        return image && image.complete && image.naturalWidth > 0;
      }, index);
    }
  }

  const state = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    brokenImages: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.src),
    signRatio: (() => {
      const image = document.querySelector('.studio-sign img');
      if (!image) return null;
      const box = image.getBoundingClientRect();
      return {
        natural: image.naturalWidth / image.naturalHeight,
        rendered: box.width / box.height
      };
    })()
  }));

  assert(state.scrollWidth <= state.clientWidth, `${file} ${viewport.width}px: horizontal overflow ${state.scrollWidth}/${state.clientWidth}`);
  assert(state.brokenImages.length === 0, `${file} ${viewport.width}px: broken images ${state.brokenImages.join(', ')}`);
  if (state.signRatio) {
    assert(Math.abs(state.signRatio.natural - state.signRatio.rendered) < 0.01,
      `${file} ${viewport.width}px: studio sign image is distorted ${state.signRatio.rendered.toFixed(3)}/${state.signRatio.natural.toFixed(3)}`);
  }
  assert(pageErrors.length === 0, `${file} ${viewport.width}px: page errors ${pageErrors.join(' | ')}`);
  assert(consoleErrors.length === 0, `${file} ${viewport.width}px: console errors ${consoleErrors.join(' | ')}`);
  console.log(`PASS page ${file} ${viewport.width}px`);
  await context.close();
}

async function validateMenu(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href, { waitUntil: 'load' });
  const toggle = page.locator('.nav-toggle');
  await toggle.click();
  assert(await toggle.getAttribute('aria-expanded') === 'true', 'mobile menu did not open');
  assert(await toggle.getAttribute('aria-label') === 'Close menu', 'mobile menu open label incorrect');
  await page.keyboard.press('Escape');
  assert(await toggle.getAttribute('aria-expanded') === 'false', 'mobile menu did not close with Escape');
  assert(await toggle.getAttribute('aria-label') === 'Open menu', 'mobile menu closed label incorrect');
  assert(await page.evaluate(() => document.activeElement === document.querySelector('.nav-toggle')), 'mobile menu did not return focus after Escape');
  console.log('PASS mobile menu');
  await context.close();
}

async function validateGallery(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href, { waitUntil: 'load' });
  const first = page.locator('#look-tab-1');
  await first.focus();
  await page.keyboard.press('ArrowRight');
  const state = await page.evaluate(() => ({
    selected: document.querySelector('[role="tab"][aria-selected="true"]')?.id,
    firstHidden: document.getElementById('look-panel-1').hidden,
    secondHidden: document.getElementById('look-panel-2').hidden,
    focused: document.activeElement?.id
  }));
  assert(state.selected === 'look-tab-2', `gallery selected ${state.selected} instead of look-tab-2`);
  assert(state.firstHidden && !state.secondHidden, 'gallery panels do not match selected control');
  assert(state.focused === 'look-tab-2', `gallery focus remained on ${state.focused}`);
  console.log('PASS gallery keyboard');
  await context.close();
}

async function validateReducedMotion(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href, { waitUntil: 'load' });
  const state = await page.evaluate(() => ({
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    teamPinHeight: document.querySelector('.team-pin').getBoundingClientRect().height,
    teamRowHeight: document.querySelector('.team-row').getBoundingClientRect().height
  }));
  assert(state.scrollBehavior === 'auto', `reduced motion scroll behavior is ${state.scrollBehavior}`);
  assert(state.teamPinHeight <= state.teamRowHeight + 2, `reduced motion retains forced team scroll ${state.teamPinHeight}/${state.teamRowHeight}`);
  console.log('PASS reduced motion');
  await context.close();
}

async function validateNoJavaScript(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false
  });
  const page = await context.newPage();
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href, { waitUntil: 'load' });
  const hidden = await page.evaluate(() => [...document.querySelectorAll('.rv')].filter(item => getComputedStyle(item).opacity === '0').length);
  assert(hidden === 0, `${hidden} reveal items hidden without JavaScript`);
  console.log('PASS no JavaScript');
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  try {
    for (const viewport of viewports) {
      for (const file of pages) await validatePage(browser, file, viewport);
    }
    await validateMenu(browser);
    await validateGallery(browser);
    await validateReducedMotion(browser);
    await validateNoJavaScript(browser);
    console.log('PASS browser smoke');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
