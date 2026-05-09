User request: "only use 133% line heaighnt in lists/ any other text types in chat, use 0.3rem Between items in a list"

## Objective Reconstruction
Synchronize global line-height behaviors inside the assistant view down to 133% across all primary typography elements (Paragraphs, Lists, Quotes, and Tables) and adjust the localized padding interval between individual list item instances from 0.5rem to a tighter 0.3rem.

## Strategic Reasoning
Uniformity of baseline tracking across semantic blocks builds a cohesive editorial texture. By stripping implicit Tailwind defaults (`leading-relaxed`, unset prose variants) and explicit hardcodes (`leading-[150%]`), we ground the entire chat flow to the specific cadence desired by the user. The reduction of internal list spacing to `0.3rem` directly complements this compressed line-height constraint, preventing disparate gaps from cluttering item flow.

## Detailed Blueprint
Target edits deployed strictly inside `ChatMessage.tsx`:
- `p` Component: appended `leading-[133%]` to container list.
- `blockquote` Component: applied `leading-[133%]` override.
- `ul`/`ol` Components: replaced `space-y-2` tracking with `space-y-[0.3rem]`.
- `li` Component: swapped `leading-[150%]` to `leading-[133%]`.
- `th`/`td` Components: inserted `leading-[133%]` and retired native `leading-relaxed`.

## Operational Trace
- Ran component baseline audit in `ChatMessage.tsx`.
- Dispatched simultaneous multi-chunk replacement encompassing paragraphs, quotes, lists, and tables.
- Verified Tailwind syntax interpolation alignment for `-[0.3rem]`.

## Status Assessment
Complete. All conversational copy renders at consistent 1.33 scale, and lists maintain specific 0.3rem separation gaps.
