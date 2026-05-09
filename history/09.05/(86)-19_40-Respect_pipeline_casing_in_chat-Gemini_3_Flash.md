User request: "fix status message, if i set Analyzing, it shoulnt display as analyzing"

## Objective Reconstruction
Align display behavior of chat pipeline step labels to respect user-specified letter capitalization. Prevent unintended coercion of input values to lowercase formats.

## Strategic Reasoning
Investigation yielded a hardcoded `.toLowerCase()` filter buried inside the `ChatMessage` pipeline status resolver block. Purging this post-processing mutation ensures the system acts as a true pass-through for configuration values dictated in the admin panel.

## Detailed Blueprint
Target line 623 in `ChatMessage.tsx` to eliminate the `.toLowerCase()` invocation chained onto `activeStep.goal`. Promoted base system fallback message from "thinking" to "Thinking" to follow normalized capital sentence standards.

## Operational Trace
Executed surgical string handler replacement. Re-compiled system sources without adverse warnings.

## Status Assessment
Resolved. Status indicator matches user branding verbatim.
