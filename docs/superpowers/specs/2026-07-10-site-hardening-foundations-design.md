# Serenity Rose Studios Site Hardening Foundations

## Objective

Prepare the current Serenity Rose Studios static website for a later content-completion and launch pass without inventing business facts, replacing temporary creative assets, completing booking integrations, or publishing the site.

The existing visual direction stays intact. This pass improves the technical and interaction foundation so real photographs, reviews, profiles, prices, policies, and booking destinations can be inserted later without reopening basic accessibility, SEO, performance, or release-workflow problems.

## Approved constraints

- Preserve the current page architecture, copy, placeholder testimonials, temporary photographs, stylist biographies, pricing, hours, and placeholder stylist booking details.
- Do not invent or imply that temporary information is verified.
- Do not remove unfinished sections merely because their final content is unavailable.
- Do not publish, push, merge to `main`, or update `gh-pages` without a separate explicit user request.
- Do not modify, delete, move, stage, or commit the existing untracked `draft/`, `assets/actual hairdressers/`, `assets/images/sample hairdressers.png`, or `assets/images/small icon header.png` content.
- Preserve the warm editorial visual system: cream/linen/rose/maroon palette, Fraunces/Karla/Ms Madi typography, arched imagery, section order, pricing structure, and mobile stylist scrollytelling concept.
- Use the current remote `main` commit `f5e64ac` as the implementation baseline.

## Current baseline

The baseline already includes:

- A compressed 37 KB header logo
- A favicon asset and favicon markup
- Open Graph metadata and Twitter card metadata on the homepage
- `HairSalon` JSON-LD on the homepage
- Flat, restrained button styling
- A responsive hamburger menu on the homepage and all five stylist pages
- Manual desktop stylist-panel selection instead of desktop autoplay
- Scroll-driven mobile stylist and gallery presentation

Remaining weaknesses include incomplete mobile-menu behavior, gallery autoplay and accessibility semantics, low-contrast visual tokens, JavaScript-dependent reveal visibility, missing canonical URLs and crawl files, inconsistent heading structure, no skip link, duplicated behavior across stylist pages, missing responsive-image metadata, and no automated regression harness.

## Design approach

### 1. Progressive enhancement and resilient content

All meaningful content will be visible by default. JavaScript will add a root `.js` class before reveal effects are applied. If JavaScript or `IntersectionObserver` is unavailable, the site remains fully readable and navigable.

Reduced-motion mode will disable entrance animation, marquee motion, image zoom transitions, scroll-driven automatic state changes where practical, and smooth anchor scrolling.

### 2. Accessible global navigation

Every page will begin with a keyboard-visible “Skip to main content” link and a consistent `id="main"` target.

The existing mobile menu will be completed rather than replaced. It will:

- Maintain an accurate `aria-expanded` state
- Expose a clear open/closed accessible name
- Close after selecting a link
- Close on Escape
- Return focus to the toggle after Escape
- Close when the viewport returns to desktop size
- Use visible focus indicators and at least 44-by-44-pixel touch targets where layout permits

No focus trap is necessary because the menu is a short, in-document navigation list rather than a modal dialog.

### 3. Stable gallery interaction

The gallery will stop autoplaying. Visitors will explicitly choose a look using the existing controls. The component will use a tab-like relationship:

- The control list receives an accessible group label
- Each control uses `aria-selected` and `aria-controls`
- Each image panel has a stable ID and descriptive accessible label
- Inactive panels use `hidden`, removing them from layout and the accessibility tree
- Arrow-key movement between controls is supported without stealing normal page scrolling outside the component
- The visible count remains presentational rather than becoming a noisy live region

The visual design and desktop/mobile layout remain unchanged. Scroll-driven mobile selection may remain, but it must update the same semantic state and must not override a user’s active keyboard/pointer interaction.

### 4. Stylist-panel interaction

Desktop panels remain manual hover/focus selections. Mobile scroll-driven panel changes remain because they are part of the approved visual concept.

The implementation will:

- Keep the focused panel open while keyboard focus is inside the stylist collection
- Avoid timed autoplay
- Provide list semantics for the stylist collection
- Ensure the mobile scroll behavior is disabled under reduced motion, falling back to a conventional stacked/manual presentation
- Prevent the narrow-layout clipping currently masked by `overflow-x:hidden`

### 5. Color, focus, and document semantics

New semantic color tokens will separate decorative rose from accessible text and interaction colors. The final values must meet:

- 4.5:1 for normal text
- 3:1 for large text
- 3:1 for focus indicators and meaningful non-text UI boundaries

The low-contrast hero script, eyebrows, inactive gallery labels, small gallery numbers, button text edge cases, and rose focus outlines will be corrected without changing the overall palette.

Contact/detail groups below an `h2` will use `h3`, not `h4`. Social-link and stylist collections will use list or navigation semantics rather than labeled generic containers. Stylist-profile social handles will remain unchanged if no verified URL is available.

### 6. SEO and sharing foundations

The homepage and five stylist pages will receive:

- Self-referencing canonical URLs
- Open Graph title, description, URL, and image
- Twitter card metadata
- Favicon and Apple touch icon markup
- Consistent page descriptions

The homepage’s existing `HairSalon` JSON-LD will be retained and validated against the currently provided business data. Stylist pages will not receive speculative `Person` schema until the identities and details are verified.

Two new crawl files will be added:

- `robots.txt`, allowing normal crawling and referencing the sitemap
- `sitemap.xml`, containing the homepage and five stylist canonical URLs

No fabricated review, rating, price-range, employee, or booking schema will be added.

### 7. Image and loading behavior

Existing production images will receive intrinsic `width` and `height` values to reserve layout space. The hero image will receive `fetchpriority="high"`; below-the-fold images remain lazy loaded and use `decoding="async"` where appropriate.

No new visual assets will be generated. No original photographs will be transformed or replaced in this pass. Responsive `srcset` derivatives will be deferred because only one production size currently exists for most images; adding fake duplicate candidates would provide no benefit.

Google Fonts will remain externally hosted for this pass because self-hosting would introduce new font assets and licensing/subsetting work beyond the approved no-new-assets constraint.

### 8. Maintainable shared behavior

The site remains static HTML. A framework migration is intentionally deferred.

Small shared JavaScript and CSS files may be introduced where doing so removes exact duplication across the five stylist pages. Homepage-only gallery and scrollytelling logic remains homepage-specific. Business data, biographies, phone numbers, prices, and availability will not be centralized yet because those values are explicitly temporary.

This creates a clean intermediate state without committing the project to Astro, Eleventy, Jekyll, or another build system before the real content model is known.

### 9. Automated validation

A dependency-free Node validation script will be added under `tests/`. It will inspect the generated/static files directly and fail on regressions in:

- Required page titles, descriptions, canonicals, favicon links, and social metadata
- One `main#main` and one `h1` per page
- Skip links and mobile-menu ARIA wiring
- Correct heading levels in contact/detail groups
- Gallery control/panel relationships
- JavaScript-visible-by-default reveal strategy
- Internal file and fragment references
- Referenced image existence
- Image intrinsic dimensions
- JavaScript syntax
- `robots.txt` and sitemap coverage
- Oversized production logo regression

The validator will explicitly allow the currently approved placeholder reviews and 555 stylist booking data. It will report them as known deferred content rather than failing the build.

Headless Chrome regression tests will verify:

- Mobile menu open, close, link selection, Escape behavior, and resize reset
- Gallery keyboard selection and stable state
- Reduced-motion behavior
- No horizontal document overflow at 320, 390, 768, and 1440 pixels
- No broken images, console errors, or page errors across the homepage and a representative stylist page
- Visible content when JavaScript is disabled

## File-level architecture

Expected files to modify:

- `index.html` — homepage metadata, semantic markup, accessible gallery/stylist state, responsive-image attributes, and homepage-specific behavior
- `stylists/stylist.css` — shared stylist-page navigation, focus, contrast, reduced-motion, and responsive behavior
- `stylists/marissa.html`
- `stylists/jess.html`
- `stylists/gricelda.html`
- `stylists/nancy.html`
- `stylists/lexi.html` — canonical/social metadata, skip link, main target, headings, image dimensions, and shared-script reference

Expected files to create:

- `assets/site.js` — shared menu and progressive-enhancement behavior used by all pages
- `robots.txt`
- `sitemap.xml`
- `tests/validate-site.js` — dependency-free structural validator
- `tests/browser-smoke.js` — Playwright/Chrome interaction and responsive validator

If implementation shows that `assets/site.js` would force homepage-only code into stylist pages, it will remain limited to menu/reveal behavior and homepage-specific logic will stay inline in `index.html`.

## Failure behavior

- Without JavaScript, all content and normal anchor navigation remain available; only enhanced menu/reveal/gallery behavior is reduced.
- Without external fonts, the existing Georgia and sans-serif fallbacks preserve hierarchy and readability.
- If an image fails, descriptive alternative text remains available and intrinsic dimensions prevent major layout collapse.
- If a future booking URL is unavailable, this pass does not change the existing placeholder state or invent a replacement.

## Release boundary

Implementation will occur only on `codex/site-hardening-foundations`. Completion means the local branch is tested and ready for review.

It does not mean:

- The site has been published
- `main` has been changed
- `gh-pages` has been changed
- Temporary content has been approved
- Booking is operational
- Real assets have been installed

Those require later user-provided content and explicit publication approval.

## Acceptance criteria

1. Current visual hierarchy and section order remain recognizable at desktop and mobile sizes.
2. All six pages remain reachable and internally linked.
3. All meaningful content is visible with JavaScript disabled.
4. Mobile navigation is keyboard- and screen-reader-operable.
5. Gallery state is manual, stable, and semantically connected to the displayed image.
6. Reduced-motion users do not receive automatic scrollytelling or smooth anchor motion.
7. Tested text and focus colors meet WCAG AA thresholds.
8. No horizontal document overflow appears at 320 pixels or wider.
9. Canonical/social metadata, favicon markup, sitemap, and robots configuration are present and internally consistent.
10. The compressed logo remains under 100 KB.
11. Automated structural and browser smoke tests pass.
12. Placeholder reviews, temporary images, and placeholder stylist booking information remain present and unchanged.
13. No untracked user-owned draft or original-image content is modified, staged, or committed.
14. Nothing is pushed, published, or merged without a separate explicit request.
