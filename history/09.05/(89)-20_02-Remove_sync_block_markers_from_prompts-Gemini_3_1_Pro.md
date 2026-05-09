User request: "remove # SYNC BLOCK rows in the prompts"

## Objective Reconstruction
Remove the `# SYNC BLOCK — update this in all three mode files together` comment lines from the `mode-default.txt` and `mode-pro.txt` system prompt files to clean up the content and remove unnecessary administrative markers from the active prompt text.

## Strategic Reasoning
The `# SYNC BLOCK` markers are internal workflow hints intended for human developers to remember to keep sections synchronized across multiple text files. Since the prompts themselves are injected directly into the LLM context, these markers consume characters and slightly clutter the instructions without providing behavioral value to the AI model itself. Removing them streamlines the final prompt strings.

## Detailed Blueprint
Targeted all instances of `# SYNC BLOCK — update this in all three mode files together` in both core prompt files:
- `mode-default.txt`
- `mode-pro.txt`
Removed the markers entirely using parallel replacement calls.

## Operational Trace
- Used `grep_search` to verify the exact phrasing and locations of the markers across the `mode-*.txt` files.
- Executed `replace_file_content` with `AllowMultiple: true` on both files to delete the string globally without affecting the surrounding structure.

## Status Assessment
Complete. The `# SYNC BLOCK` markers have been entirely purged from the prompt text files, resulting in cleaner, unbroken system instructions ready for the database/UI.
