User request: "chage: h1- 28px h2-24 h3-20"

## Objective Reconstruction
Scale the typographic visual hierarchy up slightly by revising explicitly defined pixel heights for Markdown H1, H2, and H3 header tags in the Assistant's output stream.

## Strategic Reasoning
Simple design tweak targeting increased visual separation and dominance of structural anchors. Bumped H1 by 2px, H2 by 2px, and H3 by 1px to establish the requested progressive density ramp.

## Detailed Blueprint
Adjust the direct inline property lists inside `ChatMessage.tsx`:
- H1: 26px -> 28px
- H2: 22px -> 24px
- H3: 19px -> 20px

## Operational Trace
- Mapped element hooks inside standard markdown component dictionary.
- Deployed immediate replacement patch enforcing pixel exactness.

## Status Assessment
Implemented successfully. The headers now present slightly greater proportional weight.
