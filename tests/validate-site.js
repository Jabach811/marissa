const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pages = [
  { file: 'index.html', url: 'https://jabach811.github.io/marissa/' },
  { file: 'stylists/marissa.html', url: 'https://jabach811.github.io/marissa/stylists/marissa.html' },
  { file: 'stylists/jess.html', url: 'https://jabach811.github.io/marissa/stylists/jess.html' },
  { file: 'stylists/gricelda.html', url: 'https://jabach811.github.io/marissa/stylists/gricelda.html' },
  { file: 'stylists/nancy.html', url: 'https://jabach811.github.io/marissa/stylists/nancy.html' },
  { file: 'stylists/lexi.html', url: 'https://jabach811.github.io/marissa/stylists/lexi.html' }
];

const failures = [];

function read(file) {
  const absolute = path.join(root, file);
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : '';
}

function check(condition, message) {
  if (!condition) failures.push(message);
}

function validateMetadata() {
  for (const page of pages) {
    const html = read(page.file);
    check(/<title>[^<]+<\/title>/.test(html), `${page.file}: title missing`);
    check(/<meta name="description" content="[^"]+">/.test(html), `${page.file}: description missing`);
    check(html.includes(`<link rel="canonical" href="${page.url}">`), `${page.file}: canonical missing`);
    check(html.includes('<link rel="icon"'), `${page.file}: favicon missing`);
    check(html.includes('<meta property="og:title"'), `${page.file}: og:title missing`);
    check(html.includes(`<meta property="og:url" content="${page.url}">`), `${page.file}: og:url missing`);
    check(html.includes('<meta property="og:image"'), `${page.file}: og:image missing`);
    check(html.includes('<meta name="twitter:card" content="summary_large_image">'), `${page.file}: Twitter card missing`);
  }

  const robots = read('robots.txt');
  const sitemap = read('sitemap.xml');
  check(robots.includes('Sitemap: https://jabach811.github.io/marissa/sitemap.xml'), 'robots.txt: sitemap pointer missing');
  for (const page of pages) {
    check(sitemap.includes(`<loc>${page.url}</loc>`), `sitemap.xml: ${page.url} missing`);
  }
}

function validateSemantics() {
  for (const page of pages) {
    const html = read(page.file);
    check(html.includes('class="skip-link" href="#main"'), `${page.file}: skip link missing`);
    check(/<main id="main">/.test(html), `${page.file}: main#main missing`);
    check(html.includes('aria-controls="nav-menu"'), `${page.file}: nav toggle wiring missing`);
    const expectedScript = page.file === 'index.html' ? 'src="assets/site.js"' : 'src="../assets/site.js"';
    check(html.includes(expectedScript), `${page.file}: shared script missing`);
  }

  const home = read('index.html');
  const stylistCss = read('stylists/stylist.css');
  check(home.includes('.js .rv{'), 'index.html: enhanced reveal selector missing');
  check(stylistCss.includes('.js .rv{'), 'stylists/stylist.css: enhanced reveal selector missing');
  check(!/(^|\n)\.rv\{opacity:0/.test(home), 'index.html: reveal content hidden without JavaScript');
  check(!/(^|\n)\.rv\{opacity:0/.test(stylistCss), 'stylists/stylist.css: reveal content hidden without JavaScript');
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function validateGallery() {
  const html = read('index.html');
  check(countMatches(html, /role="tab"/g) === 6, 'index.html: expected six gallery tabs');
  check(countMatches(html, /role="tabpanel"/g) === 6, 'index.html: expected six gallery tabpanels');
  check(countMatches(html, /aria-controls="look-panel-[1-6]"/g) === 6, 'index.html: gallery aria-controls wiring incomplete');
  check(countMatches(html, /aria-selected="(?:true|false)"/g) === 6, 'index.html: gallery selection state incomplete');
  check(!html.includes('setInterval('), 'index.html: timed autoplay remains');
  check(/class="team-row[^"\n]*"[^>]*role="list"/.test(html), 'index.html: stylist list semantics missing');
  check(countMatches(html, /class="team-panel(?: open)?"[^>]*role="listitem"/g) === 5, 'index.html: stylist list items incomplete');
}

function validatePresentation() {
  for (const page of pages) {
    const html = read(page.file);
    check(!/<div class="vd">\s*<h4>/.test(html), `${page.file}: level-four detail heading remains`);
    const images = html.match(/<img\b[^>]*>/g) || [];
    for (const image of images) {
      check(/\bwidth="\d+"/.test(image) && /\bheight="\d+"/.test(image), `${page.file}: image missing intrinsic dimensions: ${image.slice(0, 90)}`);
      if (!image.includes('class="brand-logo"')) {
        check(image.includes('decoding="async"'), `${page.file}: content image missing async decoding: ${image.slice(0, 90)}`);
      }
    }
  }

  const home = read('index.html');
  const stylistCss = read('stylists/stylist.css');
  check(/hero-shampoo-service\.webp[^>]*fetchpriority="high"/.test(home), 'index.html: hero fetch priority missing');
  for (const page of pages.filter(page => page.file !== 'index.html')) {
    const html = read(page.file);
    check(/stylist-[a-z]+-portrait\.jpg[^>]*fetchpriority="high"/.test(html), `${page.file}: profile hero fetch priority missing`);
  }
  check(home.includes('--rose-text:#8b4656'), 'index.html: accessible rose text token missing');
  check(stylistCss.includes('--rose-text:#8b4656'), 'stylists/stylist.css: accessible rose text token missing');
  check(home.includes('outline:3px solid var(--cream)') && home.includes('0 0 0 6px var(--maroon-deep)'), 'index.html: dual contrast focus ring missing');
  check(stylistCss.includes('outline:3px solid var(--cream)') && stylistCss.includes('0 0 0 6px var(--maroon-deep)'), 'stylists/stylist.css: dual contrast focus ring missing');
  check(home.includes('html{scroll-behavior:auto}'), 'index.html: reduced-motion scroll reset missing');
  check(stylistCss.includes('html{scroll-behavior:auto}'), 'stylists/stylist.css: reduced-motion scroll reset missing');
}

function validateIntegrity() {
  const referencedScripts = new Set();

  for (const page of pages) {
    const html = read(page.file);
    check(!html.includes('\u00e2\u20ac'), `${page.file}: mojibake sequence remains`);
    check(countMatches(html, /<h1\b/g) === 1, `${page.file}: expected one h1`);
    check(countMatches(html, /<main id="main">/g) === 1, `${page.file}: expected one main#main`);

    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    check(new Set(ids).size === ids.length, `${page.file}: duplicate IDs found`);

    for (const match of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/g)) {
      const src = match[1];
      if (/^(?:https?:|data:)/.test(src)) continue;
      const asset = path.resolve(root, path.dirname(page.file), src);
      check(fs.existsSync(asset), `${page.file}: missing image ${src}`);
    }

    for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>/g)) {
      const href = match[1];
      if (/^(?:https?:|tel:|mailto:|sms:)/.test(href)) continue;
      const [relativeFile, fragment] = href.split('#');
      const targetFile = relativeFile || path.basename(page.file);
      const absolute = path.resolve(root, path.dirname(page.file), targetFile);
      check(fs.existsSync(absolute), `${page.file}: missing link target ${href}`);
      if (fragment && fs.existsSync(absolute)) {
        const targetHtml = fs.readFileSync(absolute, 'utf8');
        check(targetHtml.includes(`id="${fragment}"`), `${page.file}: missing fragment ${href}`);
      }
    }

    for (const match of html.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/g)) {
      const openTag = match[0].slice(0, match[0].indexOf('>') + 1);
      if (/type="application\/ld\+json"/.test(openTag)) {
        try { JSON.parse(match[1]); } catch (error) { failures.push(`${page.file}: invalid JSON-LD ${error.message}`); }
      } else if (!/\bsrc=/.test(openTag)) {
        try { new Function(match[1]); } catch (error) { failures.push(`${page.file}: invalid inline JavaScript ${error.message}`); }
      }
    }

    for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)) {
      const source = path.resolve(root, path.dirname(page.file), match[1]);
      check(fs.existsSync(source), `${page.file}: missing script ${match[1]}`);
      if (fs.existsSync(source)) referencedScripts.add(source);
    }
  }

  for (const source of referencedScripts) {
    try { new Function(fs.readFileSync(source, 'utf8')); } catch (error) { failures.push(`${path.relative(root, source)}: invalid JavaScript ${error.message}`); }
  }

  const logo = path.join(root, 'assets/images/transparent.png');
  check(fs.statSync(logo).size < 100 * 1024, `assets/images/transparent.png: exceeds 100 KB budget`);

  const home = read('index.html');
  const profileHtml = pages.filter(page => page.file !== 'index.html').map(page => read(page.file)).join('\n');
  check(countMatches(home, /Placeholder review/g) === 3, 'deferred content changed: expected three placeholder reviews');
  check(countMatches(profileHtml, /\+1209555\d{4}/g) === 8, 'deferred content changed: expected eight 555 telephone links');
  check(countMatches(profileHtml, /555-\d{4}/g) === 4, 'deferred content changed: expected four visible 555 numbers');
}

const group = process.argv[2] || 'all';
if (group === 'metadata' || group === 'all') validateMetadata();
if (group === 'semantics' || group === 'all') validateSemantics();
if (group === 'gallery' || group === 'all') validateGallery();
if (group === 'presentation' || group === 'all') validatePresentation();
if (group === 'integrity' || group === 'all') validateIntegrity();

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`PASS ${group}`);
