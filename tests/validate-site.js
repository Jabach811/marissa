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

const group = process.argv[2] || 'all';
if (group === 'metadata' || group === 'all') validateMetadata();

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`PASS ${group}`);
