# Flowr

Next.js 16 + React 19 + TypeScript 5 app. Visual-first productivity workspace with AI routing.

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Dev server (port 3000 or 3001) |
| `npm run build` | Next.js production build |
| `npm run lint` | `next lint` (ESLint 9) |
| `npm run test` | `vitest run` (tests via Vitest) |

No typecheck script exists — run `npx tsc --noEmit` if needed.

## Architecture

- **Entrypoint:** `src/app/page.tsx` redirects to `/app`. Real root: `src/app/app/page.tsx` → `Shell` + `WorkspaceRouter`.
- **State:** Zustand store in `src/data/store.ts` (1415 lines), persisted to localStorage under key `flowr-storage`. All types in `src/data/store.types.ts`.
- **Supabase sync:** `SupabaseProvider` at layout root loads initial data + subscribes to realtime. Supabase client in `src/lib/supabase.ts`. Sync logic in `src/lib/sync.ts`. Schema in `supabase/schema.sql`.
- **AI routes:** `src/app/api/` — ai, gemini, groq, openrouter, local, search, telegram, admin, sync-quotas.
- **Router system:** `src/lib/router-config.ts` fetches model chains from Supabase `router_chains` table. Fallback in `DEFAULT_FLOW_ROUTER_CONFIG` in `src/data/store.ts`.
- **`@/` path alias** → `./src/*` (configured in both tsconfig.json and vitest.config.ts).
- **Admin pages** at `src/app/admin/` — models, router, vault, users, logs, analytics, bot, presets, discover, telegram.

## Style system

- Tailwind CSS v4 via PostCSS (`@tailwindcss/postcss` plugin).
- Typography in `TYPOGRAPHY.md`. Fonts: Literata/Crimson Pro (display), DM Sans (UI), DM Mono (mono).
- BRANDING specs in `BRANDING/` — read-only except `PREFERENCES.md`. Check before UI work.
- Global CSS: `src/app/globals.css`. Has `.preload` class to suppress transitions during hydration.

## Testing

- `src/lib/editor/markdownBlocks.test.ts` is the only test file. Run `npm run test`.
- Vitest config in `vitest.config.ts` with `@/` alias and `environment: 'node'`.

## Agent infrastructure

- Superpowers skills in `skills/` (22 skills — TDD, brainstorming, debugging, etc.).
- Agent definitions in `.claude/agents/` (engineering, design, testing, orchestrator).
- History logging mandatory per `.agents/rules/reporting-rule.md` — writes to `history/DD.MM/` after every request.
- **Always check `.agents/rules/` before acting** — those are the authoritative rules.

## Quirks & gotchas

- `.env` has `NODE_OPTIONS=--max-old-space-size=1024` to limit memory.
- `tsconfig.json` excludes `Flowr-1.0/`, `Flowr-AI-Telegram-Bot-main/`, `skills/`.
- Build optimized imports: `lucide-react`, `gsap` (in `next.config.ts`).
- ESLint is lenient: `no-explicit-any` off, `unused-vars` warn, `exhaustive-deps` warn.
- Version suffix in `package.json` name (`flowr-4.9.2`) — bump on pushes per `.agents/rules/project-versions-rule.md`.
- The `www`/`non-www` redirect happens via an `entities` table. Not via middleware.
- `supabase_types.ts` is empty — Supabase types not yet generated.
