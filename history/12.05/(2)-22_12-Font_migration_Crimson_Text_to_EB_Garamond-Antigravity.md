# History Report: Font Migration — Crimson Text to EB Garamond

## 0. Date and time of the request
Date: 12.05  
Completion Time: 22:12

## 1. User request: "replace crimson text with EB Garamond https://fonts.google.com/share?selection.family=EB+Garamond:ital,wght@0,400..800;1,400..800"

## 2. Objective Reconstruction
Migrate the primary serif typeface of the application from **Crimson Text** to **EB Garamond**. This includes updating the global Next.js font configuration, CSS utility classes, and any hardcoded inline style references in the codebase (Editor, AI Chat, and Admin views).

## 3. Strategic Reasoning
*   **Centralized Font Management**: Leveraging `next/font/google` in the root layout ensures efficient font loading and CSS variable injection.
*   **CSS Utility Preservation**: To minimize breaking changes in Tailwind classes, the `font-crimson` utility was kept but updated to point to EB Garamond.
*   **Comprehensive Search & Replace**: A recursive grep ensured that hardcoded inline styles (which often override CSS classes in complex components like the AI Assistant) were correctly updated to maintain typographic consistency.

## 4. Detailed Blueprint
*   **`src/app/layout.tsx`**: Replace `Crimson_Text` with `EB_Garamond`.
*   **`src/app/globals.css`**: Update `@import` and `@utility font-crimson`.
*   **`src/components/editor/BlockRenderer.tsx`**: Update inline styles for list markers and default block text.
*   **`src/components/assistant/components/ChatMessage.tsx`**: Perform a sweep of all `style={{ fontFamily: '"Crimson Text"' }}` declarations.
*   **`src/components/assistant/AIAssistant.tsx`**: Update the "Agent" title font.
*   **`src/app/admin/bot/brain/BrainClient.tsx`**: Update the "AI Manager" title font.

## 5. Operational Trace
1.  **Updated `src/app/layout.tsx`**:
    - Swapped `Crimson_Text` import for `EB_Garamond`.
    - Initialized `ebGaramond` with weights `[400, 500, 600, 700, 800]` and variable `--font-display`.
    - Updated `<html>` class list.
2.  **Updated `src/app/globals.css`**:
    - Changed Google Fonts import URL to EB Garamond.
    - Updated `--font-crimson` variable and `@utility font-crimson` to use `'EB Garamond'`.
3.  **Refactored `BlockRenderer.tsx`**:
    - Replaced all 12 instances of hardcoded "Crimson Text" with "EB Garamond".
4.  **Refactored `ChatMessage.tsx`**:
    - Replaced all 13 instances of hardcoded "Crimson Text" with "EB Garamond" in headings, body text, lists, and status indicators.
5.  **Refactored `AIAssistant.tsx` & `BrainClient.tsx`**:
    - Updated the header titles to use EB Garamond.

## 6. Status Assessment
*   **Completed**: All source code references to Crimson Text have been migrated to EB Garamond.
*   **Verification**: Recursive grep of the `src` directory confirms zero remaining instances of "Crimson Text".
*   **Recommendations**: The `font-crimson` Tailwind utility still exists for ease of use but now renders EB Garamond. If future branding requires a name change, the utility can be renamed to `font-garamond`.
