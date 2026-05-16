User request: Multiple requests across the conversation session:
1. Analyze and refine final prompts for chain/routing ecosystem (WEB_SEARCH too weak, bot couldn't find latest data)
2. Fix search not triggering - bot hallucinated instead of searching
3. Fix pipeline format leaking into final answers
4. Fix history not being carried between conversation turns
5. Fix note creation - numbered list items not copying correctly

### Objective Reconstruction
Comprehensive overhaul of the bot's prompt system, search chain execution, history persistence, and note formatting to fix critical failures in data retrieval, context awareness, and output quality.

### Strategic Reasoning
1. **Prompt Refinement**: The new "Final prompts" were architecturally abstracted (using "INPUT/OUTPUT CONTRACT" meta-framing) instead of action-oriented instructions. Rewrote all 16 prompt files to use imperative, direct language with proper token budgets: mode files 1.5-2k tokens, restrictions 250-500 tokens, chain prompts 700-1.5k tokens, classifiers 700-1k tokens.

2. **Search Not Running**: The `hasSearchData` check in `chainRouter.ts` used a naive `system_prompt.includes('[SEARCH DATA]')` which matched the instruction text in the WEB_SEARCH prompt itself ("when [SEARCH DATA] is present..."). This caused EVERY search to be skipped as "redundant." Fixed to check for `[SEARCH DATA:]` (with colon, matching the actual injection format) and `[SEARCH DATA]\n` (from think chain).

3. **Search Retry on Failure**: Added `generateOptimizedQuery()` function that breaks comparison queries into individual entity queries and strips conversational framing. When initial search returns empty, retries with optimized queries.

4. **[SEARCH FAILED] Injection**: Added code to inject `[SEARCH FAILED]` block into system prompt before text models run when all search engines have been exhausted, so the model acknowledges cutoff instead of fabricating.

5. **History Persistence**: `getWebConversationMemory` in `memory.ts` filtered by `topic_tag = chat:${chatId}` but the stored topic_tag format sometimes mismatched. Added fallback: when chatId filter returns empty, retry without chat isolation.

6. **Classifier Context Awareness**: Added history awareness to classifier prompts so follow-ups like "summarize" or "i mean X" use prior conversation context for routing. Classifier now uses same history settings as other chains (respects admin-configured `historyEnabledCategories`).

7. **Search Query Augmentation**: Added `augmentSearchQuery()` that appends relevant context from history to search queries when the current query is short or ambiguous. Prevents "write an essay about b4ne" from searching for the B4NE stock ticker when prior context was about TikTok creator.

8. **Numbered List Serialization**: Both `markdownBlocks.ts` and `store.helpers.ts` always serialized numberedList blocks as `1.`, losing correct numbering. Fixed to use a tracking counter that increments for consecutive numberedList blocks.

9. **TOOLS Chain Prompt**: Updated to emphasize `blocks` parameter over `content` for structured note creation. Fixed wrong parameter name (`folder?` → `parentId?`). Added block format examples.

### Detailed Blueprint
- **`Final prompts/chains/WEB_SEARCH/system_prompt.txt`**: Rewritten from passive "search synthesis agent" to active "search the web" framing. No training-knowledge fallback. Clear ANSWER MODE vs PIPELINE MODE separation. Added CRITICAL instruction to not output pipeline format in final answer.
- **`Final prompts/chains/RESEARCH/system_prompt.txt`**: Rewritten as iterative research agent with confidence scoring, gap detection, and structured output.
- **`Final prompts/chains/REGULAR/system_prompt.txt`**, **`COMPLEX/system_prompt.txt`**, **`CODING/system_prompt.txt`**, **`TOOLS/system_prompt.txt`**: Removed abstract "INPUT/OUTPUT CONTRACT" meta-framing. Active, imperative instructions with multi-chain awareness.
- **`Final prompts/modes/default/*.txt`**, **`modes/pro/*.txt`**: Expanded from ~500 to ~1,900 tokens total per mode. Restored temporal awareness, anti-denial rule, verification loop, language detection, empathetic directness.
- **`Final prompts/modes/*/restrictions.txt`**: Restored full ANTI-DENIAL RULE (CRITICAL) with examples and full TEMPORAL GUARD.
- **`Final prompts/classifier/mode-default.txt`**, **`mode-pro.txt`**: Expanded routing rules. Added history-awareness note for context-dependent follow-ups. WEB_SEARCH is now default for ANY named entity query, not keyword-triggered.
- **`src/lib/bot/chainRouter.ts`**: Added `generateOptimizedQuery()`, `augmentSearchQuery()`, retry logic on search failure, `[SEARCH FAILED]` injection, fixed `hasSearchData` check.
- **`src/lib/bot/memory.ts`**: Added fallback in `getWebConversationMemory` when `chatId` filter returns empty.
- **`src/lib/editor/markdownBlocks.ts`**: Fixed `serializeBlocks` to track numbered list index (1., 2., 3. instead of 1., 1., 1.).
- **`src/data/store.helpers.ts`**: Same fix for `blocksToMarkdown`.
- **`Final prompts/chains/TOOLS/system_prompt.txt``: Updated to emphasize `blocks` parameter. Fixed `folder?` → `parentId?`. Added block format examples.
- **`router_chains` DB**: Reordered CLASSIFIER chain (reliable models first). Updated WEB_SEARCH, TOOLS, REGULAR, COMPLEX, CODING, RESEARCH system prompts.

### Operational Trace
1. **Analyzed prompt system architecture**: Read all 40+ prompt files, source code for prompt compilation and routing. Identified that new "Final prompts" used abstract meta-framing while old "bot prompts" used direct imperative language. The old mode-default.txt (230 lines) worked because it was a monolithic agent prompt with strong guardrails and active instructions.
2. **Rewrote all prompts with imperative framing**: 12 core files rewritten. Each chain prompt now says "Your job: do X" instead of "You are the X chain. INPUT CONTRACT: you may receive..."
3. **Added `generateOptimizedQuery()`**: Function that generates alternative search queries when initial search fails. Breaks "compare X and Y" into individual entity queries (e.g., "X specifications", "Y specifications").
4. **Added `augmentSearchQuery()`**: Appends context from recent history to search queries when current query is short/ambiguous.
5. **Fixed `hasSearchData` check**: Changed from `includes('[SEARCH DATA]')` to `includes('[SEARCH DATA:]')` to prevent matching the instruction text "when [SEARCH DATA] is present".
6. **Added `[SEARCH FAILED]` injection**: Before text models run in WEB_SEARCH/RESEARCH, if no search data was obtained and no failure block exists, inject it.
7. **Added history fallback**: In `getWebConversationMemory`, when `chatId` filter returns empty, retry without chat isolation.
8. **Fixed numbered list serialization**: Both serializers now track a counter that increments for consecutive numberedList blocks.
9. **Updated TOOLS prompt**: Emphasized `blocks` over `content`, fixed parameter names, added format examples.
10. **Reordered CLASSIFIER chain**: Moved `google/gemini-3.1-flash-lite` to first position for reliability.
11. **Synced all prompts to DB**: Mode prompts via `sync-mode-prompts.mjs`, chain prompts via direct DB update.
12. **Removed debug logging**: Cleaned up temporary debug logs added during investigation.

### Status Assessment
- **Completed**: All prompt rewrites, search chain fixes (retry, SEARCH FAILED, hasSearchData), history persistence fallback, classifier context awareness, search query augmentation, numbered list serialization fix, TOOLS prompt update, classifier chain reorder.
- **Result**: TypeScript compiles cleanly (`npx tsc --noEmit` exit code 0). All prompts synced to DB. Search now actually runs and finds real data (verified via transcripts showing real sources from Artificial Analysis, DataCamp, Kilo.ai). Bot no longer fabricates specs from naming conventions. Numbered lists in notes copy with correct ordering.
