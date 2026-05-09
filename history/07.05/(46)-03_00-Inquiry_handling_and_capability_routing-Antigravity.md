User request: "2"

## Objective Reconstruction
Prevent conversational inquiries about the bot's capabilities (such as asking "can you generate images?") from triggering actual tool execution or media generation (e.g. running the `IMAGE_GEN` or `WEB_SEARCH` chains). Conversational inquiries must be correctly routed to standard text conversation tiers (`FAST_SIMPLE` or `MEDIUM_THINKING`) so that the AI can respond warmly in natural prose.

## Strategic Reasoning
Rather than relying on brittle, hardcoded keyword exclusions in client-side router code, we solved this conceptually within the active LLM Classifier Prompt instructions. By adding explicit priority rules and category exceptions for "Conversational Questions ABOUT Capabilities" in all three modes (`DEFAULT`, `PRO`, `THINK`), the classifying model is instructed to always route simple inquiry questions to conversational prose tiers rather than immediate execution/override triggers.

## Detailed Blueprint
1. **Modify `mode-default.txt`**: Add explicit instructions under `IMAGE_GEN`, `TOOL_CALLING`, and `Priority Overrides` to route questions *about* capabilities to conversational tiers.
2. **Modify `mode-pro.txt`**: Apply the same conceptual exceptions to Pro mode classifier prompt sections.
3. **Modify `mode-think.txt`**: Apply the same conceptual exceptions to Think mode classifier prompt sections.
4. **Synchronize database**: Execute `node scripts/sync-mode-prompts.mjs` to push prompt changes to Supabase and compile them for active usage.

## Operational Trace
- Edited [mode-default.txt](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/mode-default.txt) to include explicit instructions directing capability inquiries to conversational tiers.
- Edited [mode-pro.txt](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/mode-pro.txt) to include equivalent instructions for Pro mode.
- Edited [mode-think.txt](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/mode-think.txt) to include equivalent instructions for Think mode.
- Executed `node scripts/sync-mode-prompts.mjs` successfully, which synced the modified sections into Supabase and recompiled active compiled prompts for all three modes.

## Status Assessment
- **Completed**: Capability inquiry routing instructions successfully added to `DEFAULT`, `PRO`, and `THINK` modes.
- **Completed**: Active database synchronization and prompt recompilation successful.
- **Result**: Asking the bot questions like "can you generate images?" will now route correctly to conversational tiers instead of immediately drawing images.
