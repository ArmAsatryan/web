# BALLISTiQ – SEO implementation checklist & verification

## What was changed (file paths)

### 1) Sitewide meta + technical SEO
- **client/index.html** – Default title/description (50–60 / 140–160 chars), `robots` meta (index, follow), canonical, OG + Twitter Card, favicon, `favicon.ico`, apple-touch-icon (uses `/favicon.ico`), manifest link, Jura font preload + `display=swap` (in URL).
- **client/src/lib/seo.ts** – New: `SITE_URL` (from `VITE_SITE_URL` or `https://ballistiq.xyz`), `setPageMeta()` for title, description, canonical, robots, OG, Twitter.
- **client/src/hooks/use-page-meta.ts** – New: `usePageMeta(options)` hook.
- **client/src/pages/HomePage.tsx** – `usePageMeta(HOME_META)` for home.
- **client/src/pages/PrivacyPolicy.tsx** – `usePageMeta()` with unique title, description, path `/privacy-policy`.
- **client/src/pages/TermsOfService.tsx** – `usePageMeta()` with unique title, description, path `/terms-of-service`.
- **client/src/pages/not-found.tsx** – `setPageMeta(..., index: false)` for noindex.
- **client/src/App.tsx** – Catch-all route `/:rest+` → `NotFound`; import `NotFound`.

### 2) Structured data (JSON-LD)
- **client/index.html** – Single `@graph`: Organization (with `@id`, `sameAs`), WebSite (no SearchAction), SoftwareApplication with AggregateOffer, two Review items matching visible testimonials.

### 3) Crawlability
- **client/public/robots.txt** – `Allow: /`, `Disallow: /api`, `Sitemap: https://ballistiq.xyz/sitemap.xml`.
- **client/public/sitemap.xml** – Unchanged; contains `/`, `/privacy-policy`, `/terms-of-service` with lastmod.
- **client/public/_headers** – New: Cache-Control for `/assets/*` (Cloudflare Pages).

### 4) Performance & indexing
- **client/src/components/Logo.tsx** – `width={56}` `height={56}` on logo img (alt already present).
- **client/src/components/PricingSection.tsx** – Logo img: `alt="BALLISTiQ logo"`, `width={28}` `height={28}`.
- **client/src/components/TeamSection.tsx** – Already has width/height and alt.
- **client/src/components/B2BSection.tsx** – Already has width/height and descriptive alt from i18n.
- **client/index.html** – Preload for Jura stylesheet; font URL already uses `&display=swap`.

### 5) Content hygiene
- **client/src/components/Footer.tsx** – Terms link changed from `<a href="/terms-of-service">` to `<Link href="/terms-of-service">` for SPA navigation. Anchor text unchanged (already descriptive).
- H1: Home (HeroSection), Privacy, Terms, 404 each have exactly one H1. Heading hierarchy (H2 under H1, etc.) already correct.

### 6) Analytics / verification (optional)
- **client/src/lib/analytics.ts** – New: `initAnalytics()` reads `VITE_GSC_VERIFICATION` and `VITE_GA4_MEASUREMENT_ID`, injects GSC meta and/or GA4 gtag when set.
- **client/src/main.tsx** – Calls `initAnalytics()` after render. No secrets in code.

### 7) Other
- **client/public/manifest.json** – New: name, short_name, description, start_url, display, theme_color, background_color, icons (favicon.ico).
- **Production domain** – All absolute URLs use `SITE_URL` in code or `https://ballistiq.xyz` in static files. Override via `VITE_SITE_URL` if needed.

---

## How to verify

### Lighthouse SEO score
1. Build: `npm run build`.
2. Serve `dist/public` (e.g. `npx serve dist/public` or deploy to Cloudflare Pages).
3. Open Chrome DevTools → Lighthouse → SEO, run for the homepage and for `/privacy-policy`, `/terms-of-service`.
4. Confirm: meta description, valid source order, crawlable links, document has a title, etc.

### Rich Results Test
1. Go to [Google Rich Results Test](https://search.google.com/test/rich-results).
2. Enter `https://ballistiq.xyz/` (or your staging URL).
3. Confirm Organization, WebSite, SoftwareApplication, and Review are detected and valid (no errors).

### Sitemap and robots reachability
1. Open `https://ballistiq.xyz/robots.txt` – should show `Allow: /`, `Disallow: /api`, `Sitemap: https://ballistiq.xyz/sitemap.xml`.
2. Open `https://ballistiq.xyz/sitemap.xml` – should list `/`, `/privacy-policy`, `/terms-of-service` with correct `loc` and `lastmod`.

### Canonical correctness
1. Home: view-source and check `<link rel="canonical" href="https://ballistiq.xyz/">`.
2. Navigate to Privacy Policy and Terms of Service; in devtools or view-source confirm `<link rel="canonical">` and `<title>` update to the correct URL and title (client-side).
3. 404: open a non-existent path (e.g. `/foo`); confirm `<meta name="robots" content="noindex, nofollow">` and title "Page Not Found | BALLISTiQ".

### Optional: GSC and GA4
- **GSC**: In `.env` set `VITE_GSC_VERIFICATION=<your-meta-content-value>`, rebuild, deploy. In Search Console, verify ownership.
- **GA4**: Set `VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX`, rebuild, deploy. In GA4 Realtime, confirm hits.

---

## Asset note
- **og-image.png**: OG and Twitter meta point to `https://ballistiq.xyz/og-image.png`. Add a 1200×630 image at `client/public/og-image.png` for correct social previews.
- **apple-touch-icon**: Currently uses `favicon.ico`. For best results on iOS, add a 180×180 `client/public/apple-touch-icon.png` and set `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` in `client/index.html`.
