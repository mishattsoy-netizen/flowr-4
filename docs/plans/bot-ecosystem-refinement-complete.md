# Bot Ecosystem Refinement — Complete Plan

## Chain Taxonomy (Post-Refinement)

```
USER-FACING (direct answers):
  REGULAR        ← merged from FAST_SIMPLE + MEDIUM_THINKING
  COMPLEX        ← renamed from COMPLEX_THINKING
  CODING         ← unchanged
  IMAGE_GEN      ← unchanged

PIPELINE (internal steps):
  VISION         ← unchanged
  WEB_SEARCH     ← unchanged
  RESEARCH       ← renamed from DEEP_RESEARCH
  TOOLS          ← renamed from TOOL_CALLING
  AUDIO          ← renamed from AUDIO_VOICE

SYSTEM:
  CLASSIFIER     ← unchanged (separate prompt per mode)
  THINKING       ← unchanged (optional reasoning pre-pass)
  ADVISOR        ← unchanged (optional clarifying questions)
  COMPACTION     ← unchanged (session memory)
```

## What Was Done

### Code changes
| Change | Files affected |
|--------|---------------|
| Remove orchestrator | `orchestrator.ts`, `pipeline.ts` (replaced with type stub), `OrchestratorPanel.tsx`, orchestrator test route, `pipeline-orchestrator.txt` |
| Remove MULTI_CHAIN path | `chainRouter.ts` (~110 lines removed) |
| Remove ORCHESTRATOR from type | `router-config.ts` IntentCategory |
| Rename FAST_SIMPLE → REGULAR | `router-config.ts`, `classifier.ts`, `chainRouter.ts`, `thinkChain.ts`, `analytics.ts`, `RouterManager.tsx`, `subchain-config.ts`, `prompt-expansion.ts`, `deepResearch.ts` |
| Remove MEDIUM_THINKING | Same files as above |
| Rename COMPLEX_THINKING → COMPLEX | All chain references |
| Rename TOOL_CALLING → TOOLS | All chain references |
| Rename AUDIO_VOICE → AUDIO | All chain references |
| Rename DEEP_RESEARCH → RESEARCH | All chain references |
| Update FILE_MAP in actions.ts | `pipeline-deep-research.txt` → `pipeline-research.txt`, `pipeline-tool-calling.txt` → `pipeline-tools.txt` |

### Directory changes
- `Final prompts/chains/TOOL_CALLING/` → `TOOLS/`
- `Final prompts/chains/COMPLEX_THINKING/` → `COMPLEX/`
- `Final prompts/chains/AUDIO_VOICE/` → `AUDIO/`
- `Final prompts/chains/DEEP_RESEARCH/` → `RESEARCH/`
- `bot prompts/pipeline-deep-research.txt` → `pipeline-research.txt`
- `bot prompts/pipeline-tool-calling.txt` → `pipeline-tools.txt`

### DB migration needed
Run in Supabase SQL Editor:

```sql
-- ============================================================
-- Chain Rename Migration
-- Run this: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Rename user-facing chains
UPDATE router_chains SET category = 'REGULAR' WHERE category = 'FAST_SIMPLE';
UPDATE router_chains SET category = 'COMPLEX'  WHERE category = 'COMPLEX_THINKING';

-- Rename pipeline/system chains
UPDATE router_chains SET category = 'TOOLS'    WHERE category = 'TOOL_CALLING';
UPDATE router_chains SET category = 'AUDIO'    WHERE category = 'AUDIO_VOICE';
UPDATE router_chains SET category = 'RESEARCH' WHERE category = 'DEEP_RESEARCH';

-- Remove deleted chains
DELETE FROM router_chains WHERE category = 'MEDIUM_THINKING';
DELETE FROM router_chains WHERE category = 'ORCHESTRATOR';

-- Migrate pipeline internal prompts (from MEDIUM_THINKING to REGULAR)
UPDATE settings
SET value = jsonb_set(value, '{REGULAR}', value->'MEDIUM_THINKING')
WHERE key = 'pipeline_internal_prompts' AND value ? 'MEDIUM_THINKING';

UPDATE settings
SET value = value - 'MEDIUM_THINKING'
WHERE key = 'pipeline_internal_prompts';

-- Migrate status messages (MEDIUM_THINKING → REGULAR)
UPDATE settings
SET value = jsonb_set(value, '{REGULAR}', value->'MEDIUM_THINKING')
WHERE key = 'pipeline_status_messages' AND value ? 'MEDIUM_THINKING';

UPDATE settings
SET value = value - 'MEDIUM_THINKING'
WHERE key = 'pipeline_status_messages';

-- Migrate history/token/global enabled categories in pipeline_settings
-- These are stored as arrays — update via jsonb manipulation
UPDATE settings
SET value = jsonb_set(
  value,
  '{history_enabled_categories}',
  (SELECT jsonb_agg(CASE WHEN elem = 'MEDIUM_THINKING' THEN 'REGULAR' WHEN elem = 'FAST_SIMPLE' THEN 'REGULAR' WHEN elem = 'DEEP_RESEARCH' THEN 'RESEARCH' WHEN elem = 'TOOL_CALLING' THEN 'TOOLS' WHEN elem = 'COMPLEX_THINKING' THEN 'COMPLEX' WHEN elem = 'AUDIO_VOICE' THEN 'AUDIO' ELSE elem END) FROM jsonb_array_elements_text(value->'history_enabled_categories') AS elem)
)
WHERE key = 'pipeline_settings' AND value ? 'history_enabled_categories';

UPDATE settings
SET value = jsonb_set(
  value,
  '{global_prompt_enabled_categories}',
  (SELECT jsonb_agg(CASE WHEN elem = 'MEDIUM_THINKING' THEN 'REGULAR' WHEN elem = 'FAST_SIMPLE' THEN 'REGULAR' WHEN elem = 'DEEP_RESEARCH' THEN 'RESEARCH' WHEN elem = 'TOOL_CALLING' THEN 'TOOLS' WHEN elem = 'COMPLEX_THINKING' THEN 'COMPLEX' WHEN elem = 'AUDIO_VOICE' THEN 'AUDIO' ELSE elem END) FROM jsonb_array_elements_text(value->'global_prompt_enabled_categories') AS elem)
)
WHERE key = 'pipeline_settings' AND value ? 'global_prompt_enabled_categories';

UPDATE settings
SET value = jsonb_set(
  value,
  '{token_limit_enabled_categories}',
  (SELECT jsonb_agg(CASE WHEN elem = 'MEDIUM_THINKING' THEN 'REGULAR' WHEN elem = 'FAST_SIMPLE' THEN 'REGULAR' WHEN elem = 'DEEP_RESEARCH' THEN 'RESEARCH' WHEN elem = 'TOOL_CALLING' THEN 'TOOLS' WHEN elem = 'COMPLEX_THINKING' THEN 'COMPLEX' WHEN elem = 'AUDIO_VOICE' THEN 'AUDIO' ELSE elem END) FROM jsonb_array_elements_text(value->'token_limit_enabled_categories') AS elem)
)
WHERE key = 'pipeline_settings' AND value ? 'token_limit_enabled_categories';

-- Migrate router temperatures
UPDATE settings
SET value = jsonb_set(value, '{REGULAR}', value->'MEDIUM_THINKING')
WHERE key = 'router_temperatures' AND value ? 'MEDIUM_THINKING';
UPDATE settings
SET value = jsonb_set(value, '{REGULAR}', COALESCE(value->'FAST_SIMPLE', value->'REGULAR'))
WHERE key = 'router_temperatures' AND value ? 'FAST_SIMPLE';
UPDATE settings
SET value = value - 'FAST_SIMPLE' WHERE key = 'router_temperatures';
UPDATE settings
SET value = value - 'MEDIUM_THINKING' WHERE key = 'router_temperatures';

-- Migrate fallback modes
UPDATE settings
SET value = jsonb_set(value, '{REGULAR}', value->'MEDIUM_THINKING')
WHERE key = 'router_fallback_modes' AND value ? 'MEDIUM_THINKING';
UPDATE settings
SET value = jsonb_set(value, '{REGULAR}', COALESCE(value->'FAST_SIMPLE', value->'REGULAR'))
WHERE key = 'router_fallback_modes' AND value ? 'FAST_SIMPLE';
UPDATE settings
SET value = value - 'FAST_SIMPLE' WHERE key = 'router_fallback_modes';
UPDATE settings
SET value = value - 'MEDIUM_THINKING' WHERE key = 'router_fallback_modes';
```

### Final Prompts folder
Located at `Final prompts/` — 25+ prompt files organized by category:
- `chains/{REGULAR,COMPLEX,CODING,VISION,WEB_SEARCH,RESEARCH,IMAGE_GEN,TOOLS,AUDIO,ADVISOR,THINKING}/`
- `modes/{default,pro}/`
- `classifier/`
- `subchains/`
- `compaction/`

Each prompt file contains:
- `--- OVERVIEW ---` — one-line description
- `--- PROMPT ---` — the actual prompt with sections:
  - `[ROLE]` — identity
  - `[INPUT CONTRACT]` — what data it can receive from previous chains
  - `[OUTPUT CONTRACT]` — what it produces (direct answer or structured data)
  - `[BEHAVIOR]` — specific instructions

### Routing behavior
Every chain is a mini-orchestrator:
- VISION: extracts → routes via JSON if it can't handle alone, or answers directly
- RESEARCH: 2-round search (Tavily → gap detection → Tavily) → writes report
- WEB_SEARCH: single pass → can answer or pass data forward
- TOOLS: executes workspace actions with data received from previous chains
- No orchestrator — chains route directly to each other via VISION JSON or classifier

### Verification
- `npm run build` — passes (47/47 pages, clean TypeScript)
- `npm run test` — 36/36 tests pass
- Admin sidebar updated with correct grouping
