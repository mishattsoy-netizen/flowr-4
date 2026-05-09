User request: "change bot's max width to 99%"

## Objective Reconstruction
Broaden the overall content boundaries of the AI assistant responses by pushing the allowable horizontal max-width ceiling from 97% to 99% inside the chat message component stream.

## Strategic Reasoning
Explicit request to utilize more available screen real estate. Relaxing the upper boundary constraint delivers maximum usable canvas width for code, tables, and dense paragraphs while retaining a minimal fractional safety gap (1%) for visual boundary definition.

## Detailed Blueprint
Located and revised the standard Flex layout max-width definition on line 680 of `ChatMessage.tsx`, mutating `max-w-[97%]` conditional tail to `max-w-[99%]`.

## Operational Trace
- Analyzed container layout stack for the assistant flow.
- Applied precision replacement modifying width predicate directly.

## Status Assessment
Complete. Bot responses now occupy up to 99% of the flex row width.
