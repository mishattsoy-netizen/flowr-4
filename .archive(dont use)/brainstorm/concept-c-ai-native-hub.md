# Concept C — AI-Native Hub

> **One-liner:** Stop organizing. Just talk. Flowr builds and maintains your hub for you.

## Who this is for
- People who bounced off Notion because setup felt like a second job.
- Users comfortable talking to AI (the growing majority).
- Busy professionals who want "a thing that keeps my life in order" with minimum UI.

## Core idea
The AI agent is not a feature — it is **the interface**. The user rarely clicks "add page" or "new database." They say what they want; the agent creates the right structure, fills it, and updates it over time.

Think: **ChatGPT with a persistent, editable workspace that the AI owns and the user can inspect.**

## Structure

### Primary surface: the Agent panel
- Always-visible chat-like panel on the left (or full-screen on mobile).
- Types messages, voice input, file drops.
- Agent replies inline + also **writes into the workspace** (creates pages, fills tables, adds tasks).

### Secondary surface: the Hub
- A single scrollable home (not a tree) showing what matters today: tasks, trades, habits, notes the agent surfaces.
- User can click any item to expand, edit, or "ask the agent to change it."
- User can still directly edit — but never has to create structure manually.

### No navigation tree
- The agent answers "where is X?" instantly.
- A flat **Collections** list exists (for browsing) but is auto-maintained by the agent.

### Inspection mode
- Power users toggle a "show structure" mode to see the underlying pages/tables/blocks the agent built. They can edit directly. This is the escape hatch for users who want to take manual control.

## Example user flows

- **Onboarding (90 seconds):**
  User: "I'm a freelance designer doing 3 client projects, I want to track invoices, tasks, and a moodboard per client."
  Agent: creates 3 client hubs, each with a task list, invoice section, and moodboard canvas. Asks 2 follow-ups. Done.

- **Daily use:**
  User: "Closed a long on BTC, +2.1%, felt overconfident, exited too early."
  Agent: logs Trade Entry, updates PnL, appends emotion log, suggests review tomorrow.

- **Maintenance:**
  Every Sunday, the agent proactively: "Here's your week. You skipped 3 habits. Client B's invoice is 4 days overdue. Your trading win rate dropped to 41% — want to review?"

## Block types
Fewer than Concepts A/B. The agent assembles whatever is needed from a small primitive set:
- Text, Task, Table row, Calendar event, Canvas block, Metric, File.
That's it. The agent composes these into named "views" on the fly.

## The AI agent's role
**Everything.** But specifically:
- **Builder:** creates structures from natural language.
- **Editor:** edits them on request.
- **Surfaceer:** decides what shows up on Home today.
- **Journaler:** turns offhand messages into structured entries.
- **Reporter:** weekly/monthly digests unprompted.
- **Memory:** remembers user preferences across sessions (themes, schedules, style).

## Why this beats Notion
- Zero learning curve. No slash-commands, no database config.
- Age-appropriate UX for a world where AI is the default.
- Notion can't go here without cannibalizing their power-user base.

## Why a user might still pick Notion
- They want full control over structure.
- They distrust AI making decisions about their data.
- They collaborate in teams with strict permissioning.

## Fit with current Flowr code
- **Reuse:** AI assistant infrastructure, existing entity/task models, canvas, tracker.
- **Biggest add:** a **tool-using agent** that can create/update entities, tasks, workspaces via structured tool calls. This is the load-bearing piece. Requires well-defined tool schemas.
- **Refactor:** home layout → agent-panel + dynamic feed. Current sidebar becomes a collapsed "structure inspector."
- **Data model:** unchanged, but every mutation must be reachable through an agent tool call.

## Risks
- **AI cost.** Every action is an LLM call. Need aggressive caching, local small-model fallbacks, and rate limits.
- **Trust.** Users fear AI deleting or mangling their data. Mitigation: every agent mutation is previewed + undoable + logged in a visible "agent actions" feed.
- **Determinism.** Agents hallucinate. Must constrain via tool schemas and confirmation steps for destructive actions.
- **Differentiation from ChatGPT.** Flowr must own persistent, structured, domain-tailored workspace state — not just chat.

## Monetization hooks
- This is the **most natural fit for subscription**. Everything runs on AI.
- Free: 30 agent actions/day, small model only.
- Pro: unlimited actions, frontier model, voice, proactive weekly reports.
- Team: shared agent memory per workspace.

## What a phased plan would look like (preview)
1. Tool-calling agent scaffolding — define tools for create/update/delete of entities, tasks, blocks. Action preview + undo feed.
2. Redesign Home: agent panel primary, dynamic feed secondary. Old navigation collapsed.
3. Onboarding-by-conversation flow.
4. Proactive agent: weekly digest, reminders, surfacing.
5. Voice input + quick-capture anywhere.
6. Inspection mode for power users.
7. Memory layer (user preferences, recurring patterns).
8. Cost controls: local SLM for routine classification, frontier model for generation.
