User request: "reasersch and search anser must always contain source links"

## 1. Objective Reconstruction
The user requested that research and search answers must always contain source links (citations/web search links) when using Google Search grounding. The objective was to ensure that Gemini-grounded responses parse and return citation links so they are correctly rendered in the UI.

## 2. Strategic Reasoning
- **Discovered Citing Logic Gap:**
  - When the Google Search grounding tool executes, the Gemini API returns `groundingMetadata` (including `groundingChunks` containing titles and source URLs) under `response.candidates[0]?.groundingMetadata`.
  - Previously, `runGoogle` only retrieved and returned `response.text()` as a raw string, throwing away the valuable citation metadata.
- **Unified Citation Passing:**
  - We modified `runGoogle` to extract the `groundingChunks` from response candidates.
  - If citations are found, we map them to their corresponding web URIs and return them alongside the final answer in an object: `{ content: string, citations: string[] }`.
  - This perfectly interfaces with `chainRouter.ts` which already expects this exact structure and handles passing the `citations` to the chat UI.

## 3. Detailed Blueprint
- **Check `groundingMetadata`:** Add a parser to check if `response.candidates?.[0]?.groundingMetadata?.groundingChunks` exists.
- **Map Citations:** Map the chunks to retrieve their `web.uri` values, filter for valid HTTP links, and remove duplicates.
- **Return Structured Object:** If citations are found, return `{ content: finalAnswer, citations }` instead of a plain string.

## 4. Operational Trace
- **File Modified:** [google.ts](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/lib/bot/providers/google.ts)
- Updated response extraction block (lines 139–158) to dynamically extract and return `groundingMetadata` citations.

## 5. Status Assessment
- **Complete:** Gemini native search grounding now correctly extracts source URLs, and they are fully rendered as citations and source links in the UI!
