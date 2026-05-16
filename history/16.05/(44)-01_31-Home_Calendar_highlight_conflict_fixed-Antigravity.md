# History Report - 15.05

## 0. Date and time of the request
16.05.2026 01:31

## 1. User request
"calendar is still highlingted with home"

## 2. Objective Reconstruction
Fix a conflict where the "Home" button remained highlighted while the "Calendar" page was active. This was due to a mismatch between the internal ID used for the Calendar view (`tracker`) and the ID used in the Home highlighting logic (`calendar`).

## 3. Strategic Reasoning
Highlighting logic must precisely match the internal state IDs to remain mutually exclusive where intended. By updating the "Home" exclusion list to use the correct `tracker` ID, we ensure that Home is only active when the user is within the Home/Entity/Workspace context.

## 4. Detailed Blueprint
- **Sidebar Layout**: Update `src/components/layout/Sidebar.tsx`.
- **Correction**: Changed the Home button's exclusion condition from `calendar` to `tracker` to match the actual Calendar view ID.

## 5. Operational Trace
- **File Edit**: Modified `src/components/layout/Sidebar.tsx` to fix the highlighting overlap.

## 6. Status Assessment
- **Completed**: Highlighting conflict resolved.
- **Result**: Home, Calendar (Tracker), and Chat now have correctly exclusive top-level highlights.
