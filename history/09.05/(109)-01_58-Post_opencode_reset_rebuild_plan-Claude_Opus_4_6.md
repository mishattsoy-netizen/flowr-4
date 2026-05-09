User request: "write rebuild plan"

## Objective Reconstruction
Create a comprehensive rebuild plan documenting all features lost when `opencode` ran `git reset --hard 94f6f9c`, organized by priority with execution order and time estimates.

## Strategic Reasoning
Cross-referenced the git reflog (`HEAD@{1}: reset: moving to 94f6f9c`) with the full history report archive (100+ reports in `history/09.05/`) to catalog every feature that was destroyed. Verified current file states against history reports to confirm what's actually missing vs. what survived.

## Detailed Blueprint
Created 4-phase plan:
- **Phase 1 (P0):** OpenRouter routing + fallbacks, ChatMessage.tsx full rebuild, trivial code fixes
- **Phase 2 (P1):** Paid model support, Global Settings pipeline prompts, Think page removal, LogsTable fix, Provider selector UI
- **Phase 3 (P2):** Note styling, slash commands, code blocks, chat formatting
- **Phase 4:** Audit surviving untracked component files

## Operational Trace
1. Checked `git reflog` — confirmed `opencode` ran `reset --hard` at `HEAD@{1}`
2. Read 15+ history reports to catalog lost features
3. Verified current file states via `Select-String` checks on key files
4. Confirmed ChatMessage.tsx reverted to 572-line `e86b759` version (lost all session work)
5. Confirmed OpenRouter provider routing, paid model support, Global Settings pipeline prompts, LogsTable advisor filter — all missing
6. Identified 6 surviving untracked admin component files for potential recovery
7. Wrote and saved plan to `docs/plans/2026-05-10-rebuild-plan.md`

## Status Assessment
Plan created. Estimated 3–4 hours of rebuild work across 4 phases and 15 task items. Immediate action: kill `opencode` and commit current state as safety checkpoint before starting rebuild.
