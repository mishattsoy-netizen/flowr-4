User request: "no hardcoded prompts!"

## Objective Reconstruction
The objective is to completely remove any hardcoded intermediate system prompt strings (such as those for `VISION`, `WEB_SEARCH`, `DEEP_RESEARCH`, `CODING`, etc.) from the codebase. Instead, the application must load these prompts dynamically from their respective `.txt` files in the root folder at runtime. Additionally, the database sync scripts must dynamically read from the file system instead of utilizing hardcoded prompt templates.

## Strategic Reasoning
Hardcoded prompts in source code are difficult to maintain and violate modular design principles. 
- **Dynamic Local File Loading**: Leveraged Node's `fs` and `path` inside `compilePrompt.ts` to locate and read `.txt` files at runtime.
- **Removed Hardcoded Defaults**: Completely deleted the large `DEFAULT_INTERNAL_PROMPTS` object, making the codebase highly clean and strictly modular.
- **Dynamic Database Syncing**: Refactored the database sync script `sync_internal_prompts.mjs` to dynamically load prompts from files prior to uploading to Supabase, eliminating duplication and static text representations.

## Detailed Blueprint
- **Files Modified**:
  - `src/lib/bot/compilePrompt.ts`:
    - Imported `fs` and `path`.
    - Declared a file mapping configuration (`FILE_MAP`).
    - Implemented `loadPromptFromFile` helper function.
    - Deleted `DEFAULT_INTERNAL_PROMPTS` completely.
    - Updated `getInternalPrompt` to use `loadPromptFromFile`.
  - `scratch/sync_internal_prompts.mjs`:
    - Refactored the database sync script to dynamically read `pipeline-web-search.txt` and `pipeline-deep-research.txt` via `readFileSync`.

## Operational Trace
1. **Refactored `sync_internal_prompts.mjs`**: Removed the massive hardcoded string declarations and substituted them with dynamic `fs.readFileSync` calls. Verified the execution using `node scratch/sync_internal_prompts.mjs`.
2. **Updated `src/lib/bot/compilePrompt.ts`**:
   - Added `fs` and `path` imports.
   - Replaced `DEFAULT_INTERNAL_PROMPTS` with the dynamic file loading function `loadPromptFromFile`.
   - Updated the fallback fallback chain in `getInternalPrompt` to use `loadPromptFromFile`.
3. **Executed Type Checks**: Ran `npx tsc --noEmit` and confirmed 100% compile-time correctness and type safety.

## Status Assessment
- **Completed**:
  - Zero hardcoded system prompts remain in the intermediate step compiling system. All prompts are successfully resolved from physical files at runtime.
  - Script syncing is 100% dynamic.
