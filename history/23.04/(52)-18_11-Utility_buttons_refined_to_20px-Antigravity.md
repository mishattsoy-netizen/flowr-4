User request: "cange to 20px, dont change to icon"

## 1. Objective Reconstruction
The user requested a further refinement of the sidebar utility buttons, shrinking the hover background from 24px to a minimal 20px (w-5 h-5). The icon scale (14px) was specifically requested to remain unchanged, creating a higher-density interaction state.

## 2. Strategic Reasoning
- **High-Density Design**: A 20px background for a 14px icon creates only 3px of internal padding. This results in a very precise, "tight" look that feels premium and intentional.
- **Visual Uniformity**: Ensuring every interactive secondary element (Plus, More, Chevron) occupies the exact same 20px footprint prevents visual clutter and makes the sidebar's vertical rail feel more organized.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/app/globals.css`: To update the global button utility.
  - `src/components/layout/TreeItem.tsx`: To synchronize the chevron hover area.
- **Plan**:
  - Update `btn-sidebar-utility` to `w-5 h-5`.
  - Adjust the TreeItem chevron inset to `-inset-[3px]` to achieve the same 20px footprint (14 + 6 = 20).

## 4. Operational Trace
1. Modified `globals.css`:
   - Updated `btn-sidebar-utility` from `w-6 h-6` to `w-5 h-5`.
2. Modified `TreeItem.tsx`:
   - Updated the absolute inset for the chevron toggle from `5px` to `3px`.
   - Verified that the icon remains at `w-3.5 h-3.5`.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: All sidebar utility backgrounds are now exactly 20px. The interaction is tight, minimal, and professional.
- **Recommendation**: None.
