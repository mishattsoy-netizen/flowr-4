# Phase 13 — Marketing Site + MDX Pipeline

## 1. Request Summary

Build the public marketing site under `/` of the same Next.js project. Routes: home, features, pricing, changelog, FAQ, contact, terms, privacy, download/PWA. Content is MDX files in `content/`. Also add an in-app "What's new" popover that reads the same changelog files.

---

## 2. Codebase Context
- `src/app/page.tsx` — currently redirects to `/app` (phase 01). Becomes the marketing home.
- `src/app/layout.tsx` — root layout
- Next.js 16 app router

## 3. Step-by-Step Implementation Plan

### Step 1 — MDX pipeline
- **File:** `package.json`, `next.config.ts`
- **Action:** modify
- **What to do:** Add `@next/mdx`, `@mdx-js/react`, `gray-matter`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`. Configure `next.config.ts` with `withMDX({ extension: /\.mdx?$/ })`.

### Step 2 — Content directories
- **File:** `content/changelog/`, `content/faq/`, `content/legal/` (create)
- **Action:** create
- **What to do:** Seed each with at least one MDX file. Changelog frontmatter:
  ```
  ---
  version: "4.0.0-beta.1"
  date: "2026-04-18"
  type: "feature"    # feature | fix | improvement | breaking
  title: "Flowr 4.0 Beta: Lifestyle Modes"
  ---
  ```

### Step 3 — MDX loader helper
- **File:** `src/lib/mdx.ts` (create)
- **Action:** create
- **What to do:** `loadAllMdx(dir: 'changelog'|'faq'|'legal')` reads files at build time, parses frontmatter, returns sorted array. Uses Node `fs` (server component only).

### Step 4 — Marketing root layout
- **File:** `src/app/(marketing)/layout.tsx` (create), `src/app/page.tsx` (modify to live under marketing group)
- **Action:** create + modify
- **What to do:** Use route group `(marketing)` so marketing pages share a layout (nav + footer) distinct from `/app`. Move the current redirect page into `(marketing)` root.

### Step 5 — Home page
- **File:** `src/app/(marketing)/page.tsx`
- **Action:** create
- **What to do:** Hero with value prop + "Pick your mode" interactive demo (clicking Trader/Creator/Student/etc. swaps a visual preview). Sections: Modes grid, AI agent, Calendar, Workspaces, Pricing teaser, CTA.

### Step 6 — Features page
- **File:** `src/app/(marketing)/features/page.tsx`
- **Action:** create
- **What to do:** Deep-dive per feature: modes (anchor links per mode), calendar, AI agent, workspaces. Mostly static.

### Step 7 — Pricing page
- **File:** `src/app/(marketing)/pricing/page.tsx`
- **Action:** create
- **What to do:** Three-tier table (Free / Pro / Power). Beta note: "Free during beta, paid tiers coming post-launch."

### Step 8 — Changelog page
- **File:** `src/app/(marketing)/changelog/page.tsx`
- **Action:** create
- **What to do:** Renders all MDX from `content/changelog/`, grouped by month, newest first. Type badges. RSS feed at `/changelog/rss.xml` (create `src/app/(marketing)/changelog/rss.xml/route.ts`).

### Step 9 — FAQ page
- **File:** `src/app/(marketing)/faq/page.tsx`
- **Action:** create
- **What to do:** Accordion of MDX entries. Frontmatter: `category`, `question`, `order`.

### Step 10 — Contact + legal
- **File:** `src/app/(marketing)/contact/page.tsx`, `terms/page.tsx`, `privacy/page.tsx`
- **Action:** create
- **What to do:** Contact: form → submits to `/api/contact` which emails owner (use Resend or simple SMTP). Legal: render MDX.

### Step 11 — Download / PWA page
- **File:** `src/app/(marketing)/download/page.tsx`, `public/manifest.json`, `public/sw.js`
- **Action:** create
- **What to do:** Add PWA manifest + minimal service worker. Page explains "Add to Home Screen" per-platform with screenshots.

### Step 12 — Shared nav + footer
- **File:** `src/app/(marketing)/_components/Nav.tsx`, `Footer.tsx`
- **Action:** create
- **What to do:** Sticky nav, "Open App" CTA → `/app`. Footer with all marketing links + socials.

### Step 13 — In-app "What's new" popover
- **File:** `src/components/changelog/WhatsNewPopover.tsx` (create)
- **Action:** create
- **What to do:** On app boot, compare latest changelog `version` to `localStorage['flowr.lastSeenVersion']`. If newer, show popover with title + summary + "See all updates" → `/changelog`. Popover reads the same MDX loader (server-imported into a client component via a serialized prop).

### Step 14 — Analytics + SEO
- **File:** `src/app/(marketing)/_components/Analytics.tsx`, `src/app/(marketing)/robots.ts`, `sitemap.ts`
- **Action:** create
- **What to do:** Add lightweight analytics (Plausible or Vercel Analytics). Proper `<meta>` tags + OG images per page. Sitemap generated from MDX + static routes.

### Step 15 — Route the original `/app` redirect away
- **File:** `src/app/page.tsx`
- **Action:** modify
- **What to do:** Remove `redirect('/app')` from phase 01. `/` now renders marketing home. `/app` remains app entry. Confirm existing logged-in users can still bookmark `/app` directly.

---

## 4. Verification Checklist
- [ ] `/` shows marketing home.
- [ ] `/app` still loads the app.
- [ ] `/changelog` lists all MDX posts newest first; RSS feed validates.
- [ ] `/faq` accordion renders and searches.
- [ ] Contact form sends a real email.
- [ ] PWA: "Add to Home Screen" works on iOS + Android.
- [ ] "What's new" popover triggers after publishing a new changelog entry.
- [ ] Lighthouse SEO ≥ 95 on marketing pages.
- [ ] `npm run build` produces correct chunking (marketing pages are light, app bundle unchanged).

## 5. Notes & Warnings
- Route groups `(marketing)` don't add URL segments — URLs stay clean.
- Don't import marketing components into `/app` and vice versa — keep bundles separate.
- MDX build-time-only: no secrets in content. Ensure `gray-matter` parses safely.
- Contact form: rate-limit + honeypot to avoid spam.
- PWA service worker: keep minimal in beta (network-first for `/app`); aggressive caching breaks auth.
