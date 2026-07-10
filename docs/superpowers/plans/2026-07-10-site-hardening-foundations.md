# Serenity Rose Studios Site Hardening Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the six-page Serenity Rose Studios static site for accessibility, resilience, SEO, performance, and repeatable local verification while preserving all temporary content and avoiding publication.

**Architecture:** Keep the current static HTML/CSS structure. Add one dependency-free structural validator, one shared progressive-enhancement script for navigation/reveal behavior, homepage-specific gallery/stylist logic, and a Playwright browser smoke test that uses installed Chrome. No framework migration or business-data model is introduced.

**Tech Stack:** HTML5, CSS, vanilla JavaScript, Node.js 24, Playwright 1.61 with installed Google Chrome, GitHub Pages-compatible static files.

## Global Constraints

- Preserve the existing visual direction, section order, placeholder testimonials, temporary photographs, biographies, prices, hours, and placeholder stylist booking data.
- Do not invent or imply verified reviews, identities, booking destinations, policies, ratings, or credentials.
- Do not modify, delete, move, stage, or commit `draft/`, `assets/actual hairdressers/`, `assets/images/sample hairdressers.png`, or `assets/images/small icon header.png`.
- Do not push, publish, merge to `main`, or update `gh-pages`.
- Keep the site dependency-free in production.
- Use test-first changes: add the failing validator/browser assertion, observe the expected failure, then write the minimum production change.
- Use installed Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe` for browser tests.
- Keep the compressed `assets/images/transparent.png` below 100 KB.
- Preserve current placeholder review and 555-number strings unchanged; tests report them as deferred content but do not fail on them.

---

## File map

- `index.html`: homepage metadata, skip target, semantic gallery/stylist markup, image dimensions, accessible color/reduced-motion CSS, homepage interactions.
- `assets/site.js`: shared root enhancement class, reveal fallback, and mobile-navigation behavior.
- `stylists/stylist.css`: shared profile-page focus, contrast, progressive-reveal, navigation, and reduced-motion rules.
- `stylists/{marissa,jess,gricelda,nancy,lexi}.html`: profile metadata, skip target, semantic headings, intrinsic image sizes, shared-script loading.
- `robots.txt`: crawler permission and sitemap pointer.
- `sitemap.xml`: canonical URL inventory for all six pages.
- `tests/validate-site.js`: dependency-free static structure and asset validator.
- `tests/browser-smoke.js`: Playwright interaction, no-JavaScript, console, image, and responsive checks.

---

### Task 1: SEO, crawl files, and the structural validator

**Files:**
- Create: `tests/validate-site.js`
- Create: `robots.txt`
- Create: `sitemap.xml`
- Modify: `index.html`
- Modify: `stylists/marissa.html`
- Modify: `stylists/jess.html`
- Modify: `stylists/gricelda.html`
- Modify: `stylists/nancy.html`
- Modify: `stylists/lexi.html`

**Interfaces:**
- Consumes: static files rooted at `process.cwd()`.
- Produces: `node tests/validate-site.js metadata`, which exits 0 only when all six pages have required SEO metadata and crawl coverage.

- [ ] **Step 1: Create the failing metadata validator**

Create `tests/validate-site.js` with a small assertion runner and a `metadata` group:

```js
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
function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
function check(condition, message) { if (!condition) failures.push(message); }

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
  for (const page of pages) check(sitemap.includes(`<loc>${page.url}</loc>`), `sitemap.xml: ${page.url} missing`);
}

const group = process.argv[2] || 'all';
if (group === 'metadata' || group === 'all') validateMetadata();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`PASS ${group}`);
```

- [ ] **Step 2: Run the metadata validator and confirm RED**

Run:

```powershell
& 'C:\Users\mabac\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' tests/validate-site.js metadata
```

Expected: exit 1 with missing canonical/metadata/crawl-file messages, not a syntax or file-loader error.

- [ ] **Step 3: Add canonical and social metadata to every page**

For the homepage, retain the existing OG/schema data and add:

```html
<link rel="canonical" href="https://jabach811.github.io/marissa/">
```

For each stylist page, add the exact page canonical, favicon/touch icon, OG title, existing meta-description text as `og:description`, page URL, portrait image URL, and Twitter card. Example for Marissa:

```html
<link rel="canonical" href="https://jabach811.github.io/marissa/stylists/marissa.html">
<link rel="icon" type="image/png" href="../assets/images/favicon.png">
<link rel="apple-touch-icon" href="../assets/images/favicon.png">
<meta property="og:type" content="profile">
<meta property="og:title" content="Marissa — Stylist at Serenity Rose Studios">
<meta property="og:description" content="Marissa is a stylist at Serenity Rose Studios in Manteca, CA. Lived-in balayage &amp; brunette dimension.">
<meta property="og:url" content="https://jabach811.github.io/marissa/stylists/marissa.html">
<meta property="og:image" content="https://jabach811.github.io/marissa/assets/images/stylist-marissa-portrait.jpg">
<meta name="twitter:card" content="summary_large_image">
```

Use the corresponding existing title, description, page slug, and portrait filename for Jess, Gricelda, Nancy, and Lexi. Do not add `Person`, review, rating, or booking schema.

- [ ] **Step 4: Add crawler files**

Create `robots.txt`:

```text
User-agent: *
Allow: /

Sitemap: https://jabach811.github.io/marissa/sitemap.xml
```

Create `sitemap.xml` with all six canonical URLs and no fabricated change frequency or priority:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://jabach811.github.io/marissa/</loc></url>
  <url><loc>https://jabach811.github.io/marissa/stylists/marissa.html</loc></url>
  <url><loc>https://jabach811.github.io/marissa/stylists/jess.html</loc></url>
  <url><loc>https://jabach811.github.io/marissa/stylists/gricelda.html</loc></url>
  <url><loc>https://jabach811.github.io/marissa/stylists/nancy.html</loc></url>
  <url><loc>https://jabach811.github.io/marissa/stylists/lexi.html</loc></url>
</urlset>
```

- [ ] **Step 5: Run GREEN verification**

Run the metadata validator again. Expected: `PASS metadata` and exit 0.

- [ ] **Step 6: Commit Task 1**

```powershell
git add -- tests/validate-site.js robots.txt sitemap.xml index.html stylists/marissa.html stylists/jess.html stylists/gricelda.html stylists/nancy.html stylists/lexi.html
git commit -m "feat: add complete static SEO foundations"
```

---

### Task 2: Progressive enhancement, skip navigation, and shared mobile menu behavior

**Files:**
- Modify: `tests/validate-site.js`
- Create: `assets/site.js`
- Modify: `index.html`
- Modify: `stylists/stylist.css`
- Modify: all five `stylists/*.html` pages

**Interfaces:**
- Consumes: `.nav-toggle`, `#nav-menu`, `.rv`, and `main#main` markup on every page.
- Produces: a shared deferred script that owns reveal fallback and menu state.

- [ ] **Step 1: Extend the validator with a `semantics` group**

Add checks that every page contains:

```js
check(html.includes('class="skip-link" href="#main"'), `${page.file}: skip link missing`);
check(/<main id="main">/.test(html), `${page.file}: main#main missing`);
check(html.includes('aria-controls="nav-menu"'), `${page.file}: nav toggle wiring missing`);
check(html.includes('assets/site.js') || html.includes('../assets/site.js'), `${page.file}: shared script missing`);
```

Also check `index.html` and `stylists/stylist.css` for `.js .rv`, and reject an unconditional rule beginning with `.rv{opacity:0`.

- [ ] **Step 2: Run `semantics` and confirm RED**

Expected: skip-link, main target, shared-script, and progressive-reveal failures.

- [ ] **Step 3: Add shared progressive-enhancement behavior**

Create `assets/site.js`:

```js
(() => {
  const revealItems = [...document.querySelectorAll('.rv')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('in'));
  }

  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  function setMenu(open, returnFocus = false) {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  matchMedia('(min-width: 961px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
})();
```

Add this tiny head script before page styles so reveal CSS is applied only when enhancement is available:

```html
<script>document.documentElement.classList.add('js')</script>
```

- [ ] **Step 4: Update shared page markup and CSS**

On all six pages:

```html
<a class="skip-link" href="#main">Skip to main content</a>
```

Change `<main>` to `<main id="main">`, initialize toggle labels as `aria-label="Open menu"`, remove duplicated inline menu/reveal code, and load the shared script with `defer`.

Change reveal rules from unconditional `.rv` hiding to:

```css
.rv{opacity:1;transform:none}
.js .rv{opacity:0;transform:translateY(26px);transition:opacity .9s ease,transform .9s cubic-bezier(.2,.7,.2,1)}
.js .rv.in{opacity:1;transform:none}
```

Add a skip-link treatment that is off-canvas until focused and then appears above the sticky header. Make mobile menu links at least 44px tall.

- [ ] **Step 5: Run GREEN verification**

Run `node tests/validate-site.js semantics`. Expected: `PASS semantics`.

- [ ] **Step 6: Commit Task 2**

```powershell
git add -- tests/validate-site.js assets/site.js index.html stylists/stylist.css stylists/marissa.html stylists/jess.html stylists/gricelda.html stylists/nancy.html stylists/lexi.html
git commit -m "feat: harden navigation and progressive enhancement"
```

---

### Task 3: Manual accessible gallery and stable stylist state

**Files:**
- Modify: `tests/validate-site.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: six `.look` controls and six gallery images.
- Produces: `setLook(index, { focus })`, tab/tabpanel relationships, no timer, and stable focused state.

- [ ] **Step 1: Add failing gallery checks**

Require six `role="tab"` controls, six unique `aria-controls`, six corresponding `role="tabpanel"` elements, `aria-selected`, and no `setInterval` in homepage JavaScript. Require `role="list"` on `.team-row` and `role="listitem"` on each `.team-panel`.

- [ ] **Step 2: Run the gallery group and confirm RED**

Expected: missing tab/panel/list semantics and forbidden timer failures.

- [ ] **Step 3: Convert gallery markup to tab semantics**

Give the existing ordered list `role="tablist" aria-label="Featured hair looks"`. For indexes 1–6, controls use stable IDs `look-tab-1` through `look-tab-6`, corresponding `aria-controls="look-panel-N"`, `aria-selected`, and roving `tabindex`.

Wrap each gallery image in:

```html
<div class="look-panel active" id="look-panel-1" role="tabpanel" aria-labelledby="look-tab-1">
  <img loading="lazy" decoding="async" width="1122" height="1402" src="assets/images/gallery-lived-in-balayage.webp" alt="Lived-in brunette balayage with soft natural waves">
</div>
```

Use each file’s real dimensions from the asset inventory. Set `hidden` on the five inactive panels.

- [ ] **Step 4: Replace timer-based gallery behavior**

Implement `setLook(index, { focus = false } = {})` so it updates active classes, `aria-selected`, roving tabindex, `hidden`, and the visible count. Add ArrowUp/ArrowLeft and ArrowDown/ArrowRight/Home/End keyboard behavior. Remove gallery autoplay and hover-driven automatic selection.

The mobile scroll synchronizer may call `setLook` only when focus is not inside `.gallery` and reduced motion is not requested.

- [ ] **Step 5: Stabilize stylist semantics**

Add `role="list"` to `.team-row` and `role="listitem"` to all five `.team-panel` links. In reduced-motion mode, disable the mobile scroll listener and present the manual stacked accordion state. Keep desktop hover/focus behavior and remove any remaining timed state changes.

- [ ] **Step 6: Run GREEN verification and commit**

Run `node tests/validate-site.js gallery`; expect `PASS gallery`.

```powershell
git add -- tests/validate-site.js index.html
git commit -m "feat: make portfolio interactions stable and accessible"
```

---

### Task 4: Contrast, focus, document hierarchy, and image dimensions

**Files:**
- Modify: `tests/validate-site.js`
- Modify: `index.html`
- Modify: `stylists/stylist.css`
- Modify: all five stylist HTML files

**Interfaces:**
- Consumes: current palette tokens and image files.
- Produces: accessible semantic text/focus tokens, correct headings, and intrinsic image geometry.

- [ ] **Step 1: Add failing structure and image checks**

For each page, reject `.vd h4`, require detail headings to be `h3`, and require every `<img>` to contain numeric `width` and `height`. Require the homepage hero image to include `fetchpriority="high"`; require below-the-fold images to include `decoding="async"`.

Add a token check that requires `--rose-text:#8b4656` and a two-color focus rule containing both `var(--cream)` and `var(--maroon-deep)`.

- [ ] **Step 2: Run `presentation` and confirm RED**

Expected: heading, dimension, hero-priority, decode, rose-text, and focus-ring failures.

- [ ] **Step 3: Apply accessible palette and focus rules**

Add:

```css
--rose-text:#8b4656;
```

Use `--rose-text` for cream/linen eyebrows and the hero script. Use `--blush` for small text on maroon. Raise inactive gallery title opacity to at least `.64`.

Use a dual-contrast focus treatment globally:

```css
:where(a,button):focus-visible{
  outline:3px solid var(--cream);
  outline-offset:3px;
  box-shadow:0 0 0 6px var(--maroon-deep);
}
```

Retain component hover styling without overriding the focus ring.

- [ ] **Step 4: Correct headings and reduced-motion behavior**

Change all `.vd h4` markup and selectors to `.vd h3`. Add:

```css
@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
}
```

Ensure the homepage’s mobile pinned stylist/gallery behavior is disabled in the corresponding JavaScript when `noMotion` is true.

- [ ] **Step 5: Add actual image dimensions**

Use these verified production dimensions:

```text
transparent.png 160x160
hero-shampoo-service.webp 1122x1402
marissa-portrait.webp 759x1600
studio-chair-polaroid.webp 1254x1254
serenity-rose-sign.jpg 1504x1046
gallery-lived-in-balayage.webp 1122x1402
gallery-natural-curls.webp 1254x1254
gallery-dimensional-blonde.webp 1086x1448
gallery-blowout-process.webp 1402x1122
gallery-occasion-updo.webp 1122x1402
gallery-brunette-gloss.webp 1086x1448
all stylist portrait/action JPGs 900x1125
favicon.png 180x180
```

Add `fetchpriority="high"` only to the homepage hero and each profile’s hero portrait. Add `decoding="async"` to all content images.

- [ ] **Step 6: Run GREEN verification and commit**

Run `node tests/validate-site.js presentation`; expect `PASS presentation`.

```powershell
git add -- tests/validate-site.js index.html stylists/stylist.css stylists/marissa.html stylists/jess.html stylists/gricelda.html stylists/nancy.html stylists/lexi.html
git commit -m "fix: improve contrast semantics and image stability"
```

---

### Task 5: Browser smoke tests and narrow-layout repair

**Files:**
- Create: `tests/browser-smoke.js`
- Modify: `index.html`
- Modify: `stylists/stylist.css` only if the smoke test exposes profile overflow

**Interfaces:**
- Consumes: static files through `file:` URLs, installed Chrome, and Playwright.
- Produces: a repeatable browser command that exits nonzero on interaction, console, image, no-JS, or overflow regressions.

- [ ] **Step 1: Create browser assertions before responsive fixes**

Implement a Playwright script that:

- Loads `index.html` and `stylists/marissa.html` at 320, 390, 768, and 1440 widths
- Fails if `document.documentElement.scrollWidth > document.documentElement.clientWidth`
- Opens the mobile menu, checks `aria-expanded`, closes with Escape, and verifies focus returns
- Selects gallery tabs with arrow keys and verifies the selected tab and visible panel remain aligned
- Uses a reduced-motion context and verifies `scroll-behavior: auto`
- Uses a JavaScript-disabled context and verifies `.rv` content has opacity 1
- Scrolls through the page and fails on broken images, `pageerror`, or console errors

Use the bundled module directly:

```js
const { chromium } = require('C:/Users/mabac/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright');
```

Launch with:

```js
const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
});
```

- [ ] **Step 2: Run the browser test and confirm expected RED**

Expected: the 320px homepage overflow assertion fails because the rotated About composition extends beyond the document width. Any additional failure must be investigated rather than hidden.

- [ ] **Step 3: Repair the narrow About layout**

At `max-width:360px`, constrain grid items with `min-width:0`, remove the About frame’s rotation, allow `.about-facts` to wrap or use a two-column grid with the final fact spanning the row, and keep the polaroid inside the wrap.

Do not rely solely on `body{overflow-x:hidden}` to pass the assertion.

- [ ] **Step 4: Run the complete browser matrix and confirm GREEN**

Run:

```powershell
& 'C:\Users\mabac\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' tests/browser-smoke.js
```

Expected: a PASS line for every viewport/page combination, menu test, gallery test, reduced-motion test, and no-JavaScript test; exit 0 with no warnings.

- [ ] **Step 5: Commit Task 5**

```powershell
git add -- tests/browser-smoke.js index.html stylists/stylist.css
git commit -m "test: add responsive browser regression coverage"
```

---

### Task 6: Full verification and scope audit

**Files:**
- Modify only if verification exposes an in-scope defect.

**Interfaces:**
- Consumes: all previous task outputs.
- Produces: evidence that the local branch satisfies the specification without publishing or touching user-owned untracked files.

- [ ] **Step 1: Run static validation**

```powershell
& 'C:\Users\mabac\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' tests/validate-site.js all
```

Expected: `PASS all`.

- [ ] **Step 2: Run browser validation**

```powershell
& 'C:\Users\mabac\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' tests/browser-smoke.js
```

Expected: exit 0 with all browser scenarios passing.

- [ ] **Step 3: Run source and scope checks**

```powershell
git diff --check
git status --short
git diff origin/main --stat
git diff origin/main -- index.html stylists assets/site.js robots.txt sitemap.xml tests docs
```

Confirm:

- Placeholder reviews and 555 numbers remain unchanged.
- The untracked user files remain untracked and absent from every commit.
- No `gh-pages` or remote branch has changed.
- The logo remains below 100 KB.
- No production dependency or build framework was added.

- [ ] **Step 4: Perform final rendered inspection**

Capture and inspect homepage desktop/mobile folds, the gallery, the mobile stylist sequence, the pricing section, the Visit section, and one complete stylist page. Compare against the pre-change visual direction for hierarchy and atmosphere, not pixel identity.

- [ ] **Step 5: Commit verification-only corrections if required**

If verification required an in-scope correction, stage only its exact files and commit:

```powershell
git commit -m "fix: resolve final site hardening regressions"
```

If no correction was required, create no empty commit.

---

## Self-review result

- Spec coverage: all fourteen acceptance criteria map to Tasks 1–6.
- Placeholder policy: explicitly preserved and excluded from failing validation.
- Interface consistency: `assets/site.js`, `tests/validate-site.js`, and `tests/browser-smoke.js` have unique responsibilities.
- Scope: no framework migration, asset replacement, business-data centralization, booking integration, publication, or user-owned untracked-file mutation.
- Execution choice: inline execution is selected because the user explicitly asked the current task to do the work and did not request subagent delegation.
