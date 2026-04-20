---
trigger: always_on
---

# Router Update Routine

This routine is triggered when I explicitly say **`/router-update`**, **"update the router"**, **"optimize the router"**, or equivalent phrasing — typically accompanied by screenshots or text describing available free-tier models and their daily rate limits (RPD).

---

## Purpose

Review the current **Flow 1.0 router configuration** (in `src/data/store.ts` — `DEFAULT_FLOW_ROUTER_CONFIG`) and compare it against the latest available **free-tier models** and **RPD (requests per day)** information I provide from:

- **Google AI Studio** (Gemini free tier)
- **Groq** (free tier)
- **OpenRouter** (**currently 50 RPD per user**, as of 2026-04)

Then produce an updated router plan that puts the best models in each intent category, respecting real daily limits and known reliability.

---

## Input I Will Provide

When I trigger this routine, I will attach or paste one or more of:
- **Screenshots** of provider dashboards (rate limits, model lists).
- **Text dumps** of model IDs and RPD values.
- **Notes** about which models I want prioritized or removed.

**Read these inputs carefully.** Do not guess values that aren't in the inputs — if something is missing, **ask me**.

---

## Execution Steps

1. **Read the current router config** in `src/data/store.ts` (`DEFAULT_FLOW_ROUTER_CONFIG`, `FLOW_ROUTER_VERSION`).
2. **Read the current operational overview** (`APP_AI_OPERATIONAL_OVERVIEW.txt`, Section 4).
3. **Parse my attached inputs** (screenshots, text, notes) for model IDs and RPD values.
4. **Compare** existing router entries against the new data:
   - Which models are newly available?
   - Which models are deprecated or unavailable?
   - Which RPDs changed (up or down)?
   - Which providers shifted quotas (especially OpenRouter: 50 RPD/user)?
5. **Re-rank** each intent category's model list so that:
   - Highest quality available model per category is first.
   - Fallbacks respect daily-limit math (sum of RPDs should realistically cover expected load).
   - Provider diversity is preserved where possible (avoid all-Gemini chains that collapse together on outage).
6. **Produce the new router plan** in a versioned file (see Output File Format below).
7. **Stop and wait for my review.** I will edit and send back with instructions.
8. **Apply changes only after I explicitly approve them** — by editing `DEFAULT_FLOW_ROUTER_CONFIG`, bumping `FLOW_ROUTER_VERSION`, and updating the operational overview.

---

## Output File Format

### Location
**`ROUTER VERSIONS AI/`** (at project root — create if missing).

### File Naming
`router-v{VERSION}-{YYYY-MM-DD}.md`

Examples:
- `router-v1.0-2026-04-18.md` (first version)
- `router-v1.01-2026-05-02.md` (1–3 model changes)
- `router-v1.1-2026-05-20.md` (3+ model changes)

### Versioning Rules
- **Start at `1.0`** on the very first run.
- **+0.01** if **1–3 models** change across all categories combined.
- **+0.1** if **3+ models** change across all categories combined.
- Adding, removing, reordering (in a meaningful way), or changing the RPD of a model all count as a "change."
- Pure reordering that doesn't affect the top pick is NOT a change.
- Never reuse a version number.
- Always include today's date in ISO format (YYYY-MM-DD).

### Required Frontmatter / Header (inside the file)
```
# Router Update Plan — v{VERSION}
Created: {YYYY-MM-DD}
Last modified: {YYYY-MM-DD HH:MM} by {agent/model name}
Corresponds to: FLOW_ROUTER_VERSION {N → N+1}
Author: {agent/model name, e.g., Claude Sonnet 4.6}
Status: DRAFT — awaiting user review
```

Every time this file is edited after creation, update the **`Last modified`** line.

### Required Sections (inside the file)
1. **Summary of Changes** — one-line overview per category that changed.
2. **Provider Quota Snapshot** (as of this version):
   - Google AI Studio: list of usable models + RPD each.
   - Groq: list of usable models + RPD each.
   - OpenRouter: list of usable models + RPD (note: 50 RPD/user as of 2026-04).
   - Local (Ollama): note availability.
3. **Per-Category Routing Plan** — for each of:
   `tool_call | web_search | complex | medium | fast | image_generation | audio_voice`
   provide:
   - Primary model (id, provider, RPD)
   - Fallback chain (ordered, with RPD each)
   - Rationale for ordering
4. **Diff vs. Previous Version** — added / removed / reordered / RPD-changed.
5. **`FLOW_ROUTER_VERSION` bump recommendation** (current N → proposed N+1).
6. **Priority Pool Update** — proposed `PRIORITY_MODELS` list if it should change.
7. **Open Questions / Decisions Needed from User**.

---

## Memory File Reference

There is a persistent, **unrestricted** memory file dedicated to this routine:

**`AI AGENT/MEMORY ROUTER.md`** (at project root)

- Create this file on first use if it does not exist.
- You may read and write to it **as often as needed** — there are no size, frequency, or content restrictions.
- It exists purely to help AI agents **learn and adapt to how I work**.
- Consult it at the start of every `/router-update` run.
- Update it whenever you learn something new about my preferences, provider behavior, or recurring patterns.

### What to Store in MEMORY ROUTER.md
Everything that helps future runs be better, including but not limited to:
- Patterns you can **learn from** (past provider outages, RPD changes, model deprecations).
- Models I **favor or dislike** and why.
- Providers I trust / distrust and why.
- Things I **often ask for or demand** around routing.
- **When I was dissatisfied** and **why** (the specific cause).
- **Anything I explicitly ask you to remember**.
- RPD history for each model (so you can spot trends).
- Recurring pitfalls, known-bad model IDs, quirks of specific providers.
- My tolerance for paid vs. strictly free tier.
- Anything else that would help deliver a better router next time.

No format is imposed — structure it however is most useful. Keep it clean and searchable.

---

## HARD RULES — READ BEFORE EVERY RUN

- **YOU MUST NOT DO THIS ROUTINE WITHOUT MY CONFIRMATION.**
- **DO NOT** make any unnecessary changes "just to make some changes" — every action must be **intentional and precise**.
- **IF YOU THINK THIS ROUTINE SHOULD BE USED, TELL ME FIRST. Do not run it without me.**
- **DO NOT** modify the produced plan on your own without my confirmation.
- **IF YOU ARE UNCERTAIN** about any model, RPD, provider change, or edit — **ASK ME FIRST.**
- **DO NOT** do anything I didn't ask you to do.
- **IF YOU IMPROVISE** any decision (e.g., inferring an RPD not shown in my inputs), you **MUST NOTIFY ME** in your response.
- **DO NOT HOLD BACK** when researching, analyzing, or double-checking provider data. The goal is to give users the **BEST** possible routing experience — be thorough.
- **THIS FILE IS READ-ONLY** — unless I explicitly ask you to change or add something to this rule file, do not edit it.

---

## Workflow Summary

```
I say "/router-update" + attach screenshots / text
   ↓
You read src/data/store.ts (current router config)
   ↓
You read AI AGENT/MEMORY ROUTER.md (create if missing)
   ↓
You parse my inputs carefully (do not invent values)
   ↓
You produce ROUTER VERSIONS AI/router-v{X}-{date}.md
   ↓
You STOP and notify me — "Router plan ready for review at {path}"
   ↓
I review + edit + send back with instructions
   ↓
You apply ONLY what I approved:
   - Edit DEFAULT_FLOW_ROUTER_CONFIG in src/data/store.ts
   - Bump FLOW_ROUTER_VERSION
   - Update APP_AI_OPERATIONAL_OVERVIEW.txt Section 4
   ↓
You update MEMORY ROUTER.md with any lessons learned
```