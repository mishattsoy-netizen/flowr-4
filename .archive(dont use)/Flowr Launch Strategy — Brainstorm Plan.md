# Flowr Launch Strategy — Brainstorm Plan

## Context

Flowr is a Next.js 15 web app that already has Supabase integration (entities, tasks, settings tables with RLS), optional cloud sync, and multi-model AI support. The user wants to launch with zero/low investment and needs to decide on: deployment model, data storage strategy, and monetization.

---

## Question 1: Web App vs Native App

### Web App (current — Next.js)
- **Cost:** $0 on Vercel hobby plan (sufficient for early stage)
- **Works on:** Desktop browser, tablet browser, mobile browser (PWA-able)
- **Cross-device sync:** Yes, just log in from any browser
- **Time to ship:** Already done — you're already here
- **Cons:** No offline-first without extra work; no App Store presence

### Native Mobile App (React Native / Expo)
- **Cost:** $99/yr Apple Developer account to publish iOS; Google Play is $25 one-time
- **Time to build:** 2-4 months of extra work to port Flowr to React Native
- **Cross-device sync:** Yes, same Supabase backend
- **Cons:** Huge additional effort, two codebases to maintain

### Progressive Web App (PWA) — **Recommended middle ground**
- Add a `manifest.json` + service worker to your Next.js app
- Users can "Add to Home Screen" on iOS/Android — looks and feels like an app
- **Cost:** $0 extra
- **Time to add:** 1-2 days
- Offline support with cached data possible
- **Verdict: Ship as web app first, add PWA support. Skip native app until you have paying users.**

---

## Question 2: Server Sync Cost

### Supabase Free Tier Limits (as of 2025)
| Resource | Free Limit |
|---|---|
| Database storage | 500 MB |
| Monthly active users | 50,000 |
| Auth users | Unlimited |
| Bandwidth | 5 GB/month |
| File storage | 1 GB |
| Edge Functions invocations | 500K/month |

### How many users can you support for free?
- Each user's data (entities + tasks) is roughly **50–200 KB** depending on content richness
- At 200 KB avg: **500 MB / 0.2 MB = ~2,500 users** before hitting storage limit
- At 50 KB avg (light users): **~10,000 users**
- **Realistic answer: 1,000–3,000 active users comfortably on free tier**
- This is more than enough for early launch

### Supabase Pro Plan (when you outgrow free)
- **$25/month** — includes 8 GB database, 250 GB bandwidth
- Enough for ~40,000–100,000 users
- You'll have revenue by then if the product works

---

## Question 3: Data Storage Strategy — 3 Options

### Option A: Local-only (Obsidian model)
- Data stored in localStorage / IndexedDB / exported files
- **Pro:** Zero server cost, privacy-first, open-source friendly
- **Con:** No cross-device sync, no web access from another machine, no backup
- **Monetization:** Charge for AI subscription ($5-15/mo)
- **Verdict:** Simple to ship but limits network effects. Good if your audience is power users who value privacy.

### Option B: Cloud-only (Notion model)
- All data on Supabase, login required
- **Pro:** Full sync, collaboration possible later, shareable pages
- **Con:** You bear server costs, must have limits for free tier
- **Monetization:** Storage tiers (free = 5MB, pro = unlimited) + AI subscription
- **Verdict:** Better long-term but requires subscription system upfront.

### Option C: Hybrid — Local + Optional Cloud Sync (Recommended)
- Default: localStorage (already works — Zustand persist is in the codebase)
- Optional: Connect Supabase account (user brings their own, OR use yours with limits)
- **Pro:** Zero cost for local users; cloud users pay; best of both worlds
- **Con:** Slightly more complex UX (onboarding must explain the choice)
- **Monetization:**
  - **Free tier:** Local storage (unlimited) + limited AI (e.g. 50 messages/month free)
  - **Pro $9–12/mo:** Cloud sync + unlimited AI
  - **Power $19/mo:** Cloud sync + priority AI models (GPT-4, Claude Opus) + more storage

---

## Recommended Launch Plan (Zero Cost to Start)

### Phase 1: Launch as Web App (Now — Week 1-2)
1. Deploy to **Vercel** (free hobby plan)
2. Keep Supabase free tier for cloud users
3. Default to **local storage** for users who don't sign up
4. Add **email/password + Google OAuth** via Supabase Auth (already partially done)
5. Gate cloud sync behind account creation (free, no payment needed yet)

### Phase 2: PWA (Week 2-3)
1. Add `manifest.json` + service worker
2. Enable "Add to Home Screen" — instant mobile app feel
3. Basic offline support for read-only access

### Phase 3: Monetization Setup (Month 2)
1. Add **Stripe** for subscriptions (Stripe has no monthly fee — only 2.9% + 30¢ per transaction)
2. Introduce AI usage limits on free tier (track in Supabase)
3. Pro plan unlocks: cloud sync, more AI calls, priority models

### Phase 4: Growth (Month 3+)
1. Share on Product Hunt, Twitter/X, Reddit (r/productivity, r/ObsidianMD, r/Notion)
2. Open source the local-only core to drive organic discovery
3. Upgrade Supabase to Pro ($25/mo) only when storage approaches 400 MB

---

## Cost Summary

| Stage | Monthly Cost |
|---|---|
| Launch (0-1K users) | **$0** (Vercel free + Supabase free) |
| Growth (1K-10K users) | **$25** (Supabase Pro) |
| Scale (10K+ users) | $25-100 depending on usage |

**Revenue needed to break even at scale: ~3 paying Pro users at $9/mo = $27/mo covers Supabase Pro forever.**

---

## Critical Files to Know
- `/src/lib/sync.ts` — existing Supabase sync layer (reuse this)
- `/supabase/schema.sql` — data models (entities, tasks, settings)
- `/src/store/` — Zustand stores with localStorage persist (local storage already works)


---

## User Decisions (from brainstorm)

- **Storage model:** Hybrid — local-first by default, optional cloud sync behind login
- **Public sharing:** Not at launch, planned post-beta
- **Monetization at launch:** Free / no subscriptions. Grow user base first.
- **AI limits at beta launch:**
  - Chat: generous free limit (e.g. 100 messages/day)
  - Agent tool-calling: very limited or disabled
  - Image generation: limited (expensive API cost)
  - Text-to-speech: limited
  - No paywalls yet — just soft caps to control API cost while building audience
- **Future monetization:** AI subscription + cloud storage tiers (post-beta)

---

## Beta Launch Checklist (Revised — Zero Cost)

### Must Have
- [ ] Deploy to Vercel (free)
- [ ] Local storage works out of the box (already done — Zustand persist)
- [ ] Optional Supabase login for cloud sync
- [ ] AI chat with soft daily limit (track in localStorage or Supabase)
- [ ] Disable or hide: image gen, TTS, agent tool-calling (or show "coming soon")

### Nice to Have Before Launch
- [ ] PWA manifest (add to home screen on mobile)
- [ ] Landing page / waitlist page
- [ ] Basic onboarding flow explaining local vs cloud

### Post-Beta Roadmap
- [ ] Stripe subscription integration (AI Pro + Cloud Storage Pro)
- [ ] Public page sharing
- [ ] Mobile PWA polish
- [ ] Supabase Pro upgrade when storage hits ~400 MB