# History Report - 15.05

## 0. Date and time of the request
16.05.2026 01:29

## 1. User request
"when i select page in the home, home page should still be highlighned because its part of home"

## 2. Objective Reconstruction
Refine the sidebar highlighting so that the "Home" button remains active whenever a root-level entity (a note, canvas, or mixed page not contained within a workspace or collection) is selected. This treats these "Unsorted" pages as part of the broader "Home" context.

## 3. Strategic Reasoning
Entities that exist outside of specific workspaces are often grouped under a "Home" or "Root" umbrella. By keeping the Home button highlighted when these pages are active, we maintain a consistent navigational anchor for general-purpose content.

## 4. Detailed Blueprint
- **Sidebar Layout**: Update `src/components/layout/Sidebar.tsx`.
- **Change**: Updated the Home button's activation condition to include entities where `parentId` is null and the type is `note`, `canvas`, or `mixed`.

## 5. Operational Trace
- **File Edit**: Modified `src/components/layout/Sidebar.tsx` to expand the Home button's highlight logic to root-level pages.

## 6. Status Assessment
- **Completed**: Root-level page highlighting for Home button implemented.
- **Result**: Selecting an unsorted page now keeps the Home sidebar item highlighted.
