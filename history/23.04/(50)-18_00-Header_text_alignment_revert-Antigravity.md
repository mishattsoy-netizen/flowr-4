User request: "header's text should start where list icons start"

## 1. Objective Reconstruction
The user requested a specific alignment pattern where sidebar section headers (e.g., "WORKSPACES") align vertically with the icons of the list items below them, rather than the titles. This creates a clear visual hierarchy where the category label acts as an anchor for the starting point of the navigation rail.

## 2. Strategic Reasoning
- **Hierarchical Anchoring**: Aligning header text with icons (at 12px) instead of titles (at 40px) is a standard design pattern that makes the sidebar feel more structured. It clearly distinguishes the "Category" level from the "Content" level.
- **Consistency**: All headers now share the same 12px left padding, providing a stable starting point for the eye as it scans down the sidebar.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/components/layout/Sidebar.tsx`
- **Plan**:
  - Remove the `w-7` spacer `div` from the "Unsorted" and "Workspaces" header blocks.
  - Ensure the `span` remains the first child of the header row (after the `px-3` padding).

## 4. Operational Trace
1. Modified `Sidebar.tsx`:
   - Removed the wrapper `<div className="flex items-center">` and the `<div className="w-7 shrink-0" />` spacer from the "Unsorted" section header.
   - Removed the wrapper `<div className="flex items-center">` and the `<div className="w-7 shrink-0" />` spacer from the "Workspaces" section header.
   - Restored the `span` elements as direct children of the row container.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: Header text now starts at exactly the same horizontal position as the item icons/chevrons, creating a professional and clean hierarchical step.
- **Recommendation**: None.
