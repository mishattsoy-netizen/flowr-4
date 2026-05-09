User request: "@[current_problems]"

## Objective Reconstruction
Resolve the set of TypeScript compilation errors and runtime logic bugs listed in the provided IDE snapshot. This included:
1. Fixing critical JSX syntax / nesting failure in `ChatMessage.tsx`
2. Reconciling defunct state action names (`createEntity`, `getEntityById`) and imports (`markdownToBlocks`) in `ChatMessage.tsx`
3. Rectifying parameter signature mismatch in `chainRouter.ts` calls
4. Conforming missing required `EditorBlock` properties in `markdownToBlocks.ts`

## Strategic Reasoning
The initial focus was resolving the deep tree corruption in `ChatMessage.tsx` causing cascade JSX failures. After parsing context stacks, the missing closing sequences for fragment, ternary trees, and scope brackets were restored. Secondarily, legacy state patterns from parallel developments (accessing `.blocks` vs `.content`) were realigned with current schema specs. Finally, orphaned leftovers in build paths (`.next`) were triaged and determined harmless as they contain no source-bound errors.

## Detailed Blueprint
- **ChatMessage.tsx**: Add missing structural terminal sequence `) )} </> )}` at JSX tail. Remove nonexistent `markdownToBlocks` import from store, consolidate into functional `parseMarkdownToBlocks` utility. Refactor `activeEntityId` tracking to use manual `.find()` lookup rather than nonexistent method. Swap phantom `createEntity` with configured `addEntity` passing standard `Entity` structure.
- **chainRouter.ts**: Trim `system_prompt` from Cloudflare caller to match 3-argument provider spec.
- **markdownToBlocks.ts**: Add `content: ""` defaults to `divider` and `table` factories.

## Operational Trace
1. **Structural Cleanup**: Verified line range 600-852 sequence flow. Restored lost structural closures below assistants nested view.
2. **State Bridge Repair**: Surveyed `store.ts` to harvest active signatures. Replaced `createEntity` implementation with raw `addEntity` call generating its own `generateId()` and injecting standardized empty object parameters.
3. **Property Safety**: Filtered `msg.content` interactions through fallback operators ensuring undefined strings don't crash consumers.
4. **Provider Align**: Reviewed `providers/cloudflare.ts` implementation, confirmed text system prompt discard, removed passing arg.
5. **Validation**: Ran `tsc --noEmit` to test source correctness. Successfully confirmed eradication of all targeted file errors.

## Status Assessment
All requested issues fully resolved. All patched files pass current strict type checking. Additional latent errors noticed in background admin panels (mostly related to the `think` BotMode string typing) exist, but are distinct from the present critical queue and should be addressed incrementally.
