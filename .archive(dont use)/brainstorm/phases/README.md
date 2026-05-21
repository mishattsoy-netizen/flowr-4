# Flowr 4.0 — Phased Implementation Plan

Derived from [`../FINAL-concept-lifestyle-modes.md`](../FINAL-concept-lifestyle-modes.md).

Each phase file follows the structure from `.agents/rules/Planner agent prompt.md`:
**Request Summary → Codebase Context → Step-by-Step → Verification Checklist → Notes & Warnings.**

Every phase is independently shippable and verifiable. Each phase ends with the app still fully working.

---

## Execution order

| # | Phase | File | Depends on |
|---|---|---|---|
| 01 | Foundation — workspaces, modes, route split | [`phase-01-foundation.md`](phase-01-foundation.md) | — |
| 02 | Life Mode end-to-end | [`phase-02-life-mode.md`](phase-02-life-mode.md) | 01 |
| 03 | Knowledge Manager Mode | [`phase-03-knowledge-manager.md`](phase-03-knowledge-manager.md) | 01 |
| 04 | Global Calendar | [`phase-04-global-calendar.md`](phase-04-global-calendar.md) | 01 |
| 05 | Today overview aggregation | [`phase-05-today-overview.md`](phase-05-today-overview.md) | 02, 04 |
| 06 | AI Agent tool-calling | [`phase-06-agent-toolcalling.md`](phase-06-agent-toolcalling.md) | 01, 02 |
| 07 | Trader Mode | [`phase-07-trader-mode.md`](phase-07-trader-mode.md) | 01, 04, 06 |
| 08 | Creator Mode | [`phase-08-creator-mode.md`](phase-08-creator-mode.md) | 01, 04 |
| 09 | Student Mode | [`phase-09-student-mode.md`](phase-09-student-mode.md) | 01, 04 |
| 10 | Hobby-Business Mode | [`phase-10-hobby-business-mode.md`](phase-10-hobby-business-mode.md) | 01, 04 |
| 11 | Voice capture + voice agent | [`phase-11-voice.md`](phase-11-voice.md) | 06 |
| 12 | Shared workspace beta | [`phase-12-shared-workspace.md`](phase-12-shared-workspace.md) | 01 |
| 13 | Marketing routes + MDX | [`phase-13-marketing.md`](phase-13-marketing.md) | 01 |
| 14 | Mode voting | [`phase-14-mode-voting.md`](phase-14-mode-voting.md) | 13 |
| 15 | Beta polish | [`phase-15-beta-polish.md`](phase-15-beta-polish.md) | all |

---

## Parallelization hints

- Phases **07–10** (the four lifestyle modes) are independent after phase 06 lands → can be built in parallel by different sessions.
- Phase **13 (marketing)** is independent of mode work after phase 01 → can run parallel to 02–12.
- Phase **12 (shared workspaces)** touches RLS and sync layer — schedule before modes lock in their data shapes, or plan for RLS retrofit.

## Beta release gate

Beta = phases 01–06, 13, 15 minimum.
Modes 02 + 03 required. 07–10 can ship rolling after beta opens.
Voice (11) and voting (14) are nice-to-have for beta but not blockers.
