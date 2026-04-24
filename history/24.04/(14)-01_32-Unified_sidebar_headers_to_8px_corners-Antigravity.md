User request: "do same for headers" (referring to 8px rounding)

## 1. Objective Reconstruction
Following the unification of navigation buttons and tree items to 8px corners, the user requested that the sidebar section headers (Pinned, Unsorted, Workspaces) also be updated to match this new 8px standard.

## 2. Strategic Reasoning
- **Full Sidebar Parity**: By aligning the section headers with the navigation rows, we create a consistent visual "rhythm" as the user's eye travels down the sidebar. Every high-level container row now uses the same rounding.
- **Secondary Distinction**: We maintain a clear hierarchy by keeping the primary rows at 8px while the secondary utility buttons and chevrons remain at the smaller 5px radius.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/components/layout/Sidebar.tsx`: The implementation of the Pinned, Unsorted, and Workspaces headers.
- **Plan**:
  - Locate all three section header `div` elements.
  - Update their `rounded-[var(--radius-small)]` class to `rounded-[var(--radius-8)]`.

## 4. Operational Trace
1. Modified `Sidebar.tsx`:
   - Updated the Unsorted and Workspaces headers to 8px.
   - Updated the Pinned (Favorites) header to 8px.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: The sidebar is now perfectly standardized. All primary row containers (Dashboard, Tracker, Section Headers, Notes, Folders) use an 8px corner radius, while utility controls use a 5px radius.
- **Recommendation**: None.
