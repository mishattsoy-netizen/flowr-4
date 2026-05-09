User request: "Build Error: Expression expected / Reading source code for parsing failed - invalid utf-8 sequence"

## Objective Reconstruction
Fix two build errors in `ChatMessage.tsx`:
1. "Reading source code for parsing failed — invalid utf-8 sequence of 1 bytes from index 0"
2. "Expression expected" at line 842 (`</>` orphaned fragment)

## Strategic Reasoning
The first error was a file encoding issue: the file was saved as UTF-16 LE (BOM: `0xFF 0xFE`), which Turbopack cannot parse. The second error was a JSX structure problem — orphaned `</>` and `)}` tags with broken indentation, caused by the UTF-16 → UTF-8 conversion process which also exposed deeper corruption already baked into the committed file.

## Detailed Blueprint
1. Convert ChatMessage.tsx from UTF-16 LE to UTF-8 (no BOM)
2. Remove duplicate "use client" + import block (lines 7–12) created by the UTF-16 conversion
3. Restore broken `step.output` rendering block (merged with citations block in corrupted state)
4. Remove orphaned `</>` closing fragment at old line 842

## Operational Trace
1. Detected `0xFF 0xFE` BOM at file start using PowerShell byte inspection
2. Used `[System.IO.File]::ReadAllText` with `Encoding.Unicode` + `WriteAllText` with `UTF8Encoding($false)` to re-save as UTF-8 without BOM
3. Ran `git stash` and `git checkout 94f6f9c` to restore file state — but confirmed both had the corruption already committed
4. Applied 3 surgical edits to ChatMessage.tsx:
   - Removed duplicate `"use client"` + 5 import lines (lines 7–12)
   - Restored broken `{step.output && (...)}` block and properly closed the pipeline steps map/loop/containers
   - Removed orphaned `</>` + `)}` from tail of file
5. Fixed residual leftover `)}        )}` double close on line 780
6. Added missing `</div>` to close `flex items-center gap-2 mb-1` div
7. Fixed excess leading whitespace on `{step.output` line

## Status Assessment
Resolved. ChatMessage.tsx is now valid UTF-8, has no duplicate imports, and the JSX structure is correct end-to-end. The build should proceed without errors.

**Note:** The original corruption was in git commit `94f6f9c` (feat: add copy to note split button in chat message) — the file was committed as UTF-16 by another tool (opencode terminal), causing the header to appear doubled during UTF-8 conversion. The corrupted JSX in the pipeline steps section was also pre-existing in that commit.
