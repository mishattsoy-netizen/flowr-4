User request: "make row height in tables just a little bit tighter"

## Objective Reconstruction
Slightly compact the vertical spacing inside data table cells and header rows by dialing back current padding metrics to a denser setting.

## Strategic Reasoning
Incremental density improvement. Moving from standard Tailwind `py-3` (12px) to `py-2.5` (10px) trims 4px of vertical whitespace per row while preserving ideal legibility and separation characteristics.

## Detailed Blueprint
Targeted markdown component mappings for `th` and `td` inside `ChatMessage.tsx` to execute precise string-class replacement.

## Operational Trace
- Swapped padding utilities in coordinated block replacement.
- Verified identical padding is distributed uniformly across both header cells and data bodies.

## Status Assessment
Completed. Tables are subtly more concise.
