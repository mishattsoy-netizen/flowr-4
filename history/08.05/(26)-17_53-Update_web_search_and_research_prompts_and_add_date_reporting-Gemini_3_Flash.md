User request: "update web search and research prompts, Add date-reporting requirements. so models aknowlage if they provided data matching with datecontext block if not it must say it it used its cutoff data. and make sure all chain's system prompt contain context date block and must respect it"

## Objective Reconstruction
The objective is to update the system prompts for the `WEB_SEARCH` and `DEEP_RESEARCH` pipeline chains to incorporate explicit date-reporting requirements. Specifically, the models running these steps must verify and acknowledge whether retrieved search facts match or align with the current date context. If the models rely on their internal pre-trained knowledge cutoff instead of fresh retrieved data, they must explicitly state this. Furthermore, all other pipeline chains and helper system prompts (such as `ADVISOR` and `THINKING`) must receive the compiled current date context block in their system prompts and strictly respect it.

## Strategic Reasoning
Pre-existing date injection was present in the main chat chains (`VISION`, `CLASSIFIER`, `MULTI_CHAIN` final answer, `Single-Chain` final answer), but was missing from individual intermediate pipeline steps (e.g. `WEB_SEARCH`, `DEEP_RESEARCH`, etc.), helper steps (`ADVISOR` system prompt), and reasoning steps (`THINKING`).
1. **Injected Date Context Universally**: Modified `getInternalPrompt` in `src/lib/bot/compilePrompt.ts` to prepend `[CURRENT CONTEXT]` with the current date/time to all pipeline step system prompts, ensuring that all models in every chain have immediate access to the current date.
2. **Hardened Advisor and Thinking Chains**: Injected `dateContext` into the system prompts of the `ADVISOR` and `THINKING` models so they can correctly steer and review results with the current timeline in mind.
3. **Structured Date-Reporting in Search/Research**: Updated the default internal prompts for `WEB_SEARCH` and `DEEP_RESEARCH` in the codebase and synced them directly to the Supabase settings database under `pipeline_internal_prompts`. This forces models to output a structured `DATE REPORTING` block acknowledging either alignment with the current date context or declaring the usage of their internal knowledge cutoff date.

## Detailed Blueprint
- **Files to Modify**:
  - `src/lib/bot/compilePrompt.ts`:
    - Update `DEFAULT_INTERNAL_PROMPTS.WEB_SEARCH` and `DEFAULT_INTERNAL_PROMPTS.DEEP_RESEARCH` to include `DATE REPORTING` guidelines and `[CURRENT CONTEXT]` block references.
    - Update `getInternalPrompt` to generate and prepend the current context date block to all pipeline steps' compiled system prompts.
  - `src/lib/bot/advisor.ts`:
    - Update `runAdvisor` to prepend `dateContext` to the compiled `systemPrompt` passed to the underlying AI model.
  - `src/lib/bot/thinkChain.ts`:
    - Update `runThinkChain` to prepend `dateContext` to the compiled `systemPrompt` passed to the thinking AI model.
  - `pipeline-web-search.txt`:
    - Update the documented system prompt file in the root folder with the new date-reporting guidelines.
  - `pipeline-deep-research.txt`:
    - Update the documented system prompt file in the root folder with the new date-reporting guidelines.
- **Database Alignment**:
  - Create a scratch script `scratch/sync_internal_prompts.mjs` to fetch current `pipeline_internal_prompts` settings from Supabase, update the `WEB_SEARCH` and `DEEP_RESEARCH` entries, and upsert them back to ensure immediate live application.

## Operational Trace
1. **Modified `src/lib/bot/compilePrompt.ts`**:
   - Updated `DEFAULT_INTERNAL_PROMPTS` fields `WEB_SEARCH` and `DEEP_RESEARCH` with date context directives and output format requirements.
   - Updated `getInternalPrompt` to generate `dateContext` dynamically and prepended it as the first element of the `parts` array.
2. **Modified `pipeline-web-search.txt`**:
   - Updated the root-level text file with the new structured date context and date-reporting specifications.
3. **Modified `pipeline-deep-research.txt`**:
   - Updated the root-level text file with the new structured date context and date-reporting specifications.
4. **Modified `src/lib/bot/advisor.ts`**:
   - Injected the dynamic `dateContext` block and prepended it to the ADVISOR model's system prompt prior to execution.
5. **Modified `src/lib/bot/thinkChain.ts`**:
   - Injected the dynamic `dateContext` block and prepended it to the THINKING model's system prompt prior to execution.
6. **Created & Ran Scratch Script (`scratch/sync_internal_prompts.mjs`)**:
   - Implemented an automated script to safely read `.env` and upsert updated `WEB_SEARCH` and `DEEP_RESEARCH` prompts to Supabase's `settings` table.
   - Executed the script: `node scratch/sync_internal_prompts.mjs` which successfully verified and updated database settings.

## Status Assessment
- **Completed**:
  - Prepending of `[CURRENT CONTEXT]` date blocks is now active across all pipeline steps, advisor, thinking, and main chat chains.
  - Custom `DATE REPORTING` format guidelines have been injected into both default prompts and live Supabase database prompts for `WEB_SEARCH` and `DEEP_RESEARCH`.
  - All documented system prompt files are completely updated and in sync with the live database and source code.
- **Next Steps / Recommendations**:
  - Continually verify the format parsing correctness of intermediate steps under varied models.
