User request: "when bot is providing sources(links). i want them to be disspalyed alway in the end of pharagpraph, list, quote or anywhere else, just next to the provided info. i dont want it to me dissplayed like in the image. Sources and pills with "," between."

### 0. Date and time of the request
16.05.2026 02:06

### 1. User request
"when bot is providing sources(links). i want them to be disspalyed alway in the end of pharagpraph, list, quote or anywhere else, just next to the provided info. i dont want it to me dissplayed like in the image. Sources and pills with "," between."

### 2. Objective Reconstruction
Rebrand the citation/source display in the chat interface. Move sources from a separate bottom section into inline pills placed directly next to the information they support (at the end of paragraphs, list items, etc.). Remove the legacy "Sources:" header and the comma-separated layout.

### 3. Strategic Reasoning
I moved the citation rendering logic directly into the Markdown processing flow. By creating a specialized `CitationPill` component that renders when a citation link is detected, I ensure that sources appear exactly where the model placed them in the text. To handle cases where the model might omit inline markers but still provide citations in metadata, I added logic to automatically append any unused citations to the end of the content as a clean row of pills. This eliminates the need for the redundant and cluttered bottom section.

### 4. Detailed Blueprint
- **Component Changes**:
    - Created `CitationPill`: A compact, premium version of the link popup specifically for citations, showing the index, favicon, and domain.
    - Updated `markdownComponents.a`: Now checks for citation patterns (`[n]`) and returns a `CitationPill`.
- **Data Logic**:
    - Updated `targetContent` useMemo: Tracks which citations from `msg.citations` are used in the text and appends the rest to the end of the markdown string.
- **UI Cleanup**:
    - Removed the legacy `Sources` section from the bottom of `ChatMessage`.

### 5. Operational Trace
- Modified `src/components/assistant/components/ChatMessage.tsx`:
    - Inserted `CitationPill` component after `LinkWithPopup`.
    - Updated `markdownComponents.a` to detect citations and render the new pill.
    - Refactored the citation link replacement logic in `targetContent` to track usage and append unused sources.
    - Deleted the citation rendering block at the bottom of the assistant message template.

### 6. Status Assessment
- Sources are now displayed as beautiful inline pills.
- Redundant bottom section removed.
- Citations are always preserved even if not explicitly placed by the model.
- Aesthetics are consistent with the "Literata" and "Bone" design system.
