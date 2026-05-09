User request: "change rpds, max visible nubmers is 3 examples: 500 rpd instead of 1,000 rpd show 1k rpd or 1.5k rpd or 14,4k rpd..."

### Objective Reconstruction
Refactor the RPD display format inside the Admin Router UI rows so that numbers larger than or equal to 1,000 are cleanly formatted as compact strings with a maximum of three visible digits followed by a `k` suffix (e.g., `1,000` -> `1k`, `1,500` -> `1.5k`, `14,400` -> `14.4k`), while values below 1,000 are rendered as standard strings.

### Strategic Reasoning
- **Visual Tidiness:** Displaying raw numbers with thousands-separator commas (e.g., `14,400`) takes up significant horizontal spacing and clutters the UI card layout. Compact notation (e.g., `14.4k`) is visually sleek and easy to digest at a single glance.
- **Robust Implementation:** Writing a direct inline format function ensures perfect and instantaneous conversion without requiring external formatting dependencies or mutating any underlying database numbers.

### Detailed Blueprint
- **Inline Refactoring:** Replace the standard `.toLocaleString()` formatting block inside [RouterManager.tsx](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/components/admin/RouterManager.tsx) with a compact custom mapping function that handles:
  - Null/undefined: returns `'∞'`
  - Below 1000: returns standard string
  - Above 1000: divides by 1000 and prints to max 1 decimal point with `.0` stripped.

### Operational Trace
1. **Refactored RPD Formatter:** Replaced `matchingModel.max_rpd.toLocaleString()` with robust formatting logic inside `RouterManager.tsx`:
   ```typescript
   if (!matchingModel || matchingModel.max_rpd === null) return '∞'
   const val = matchingModel.max_rpd
   if (val < 1000) return val.toString()
   const k = val / 1000
   const formatted = k.toFixed(1).replace('.0', '')
   return `${formatted}k`
   ```

### Status Assessment
- **Completed:** RPD number formatting has been updated to the compact, highly aesthetic three-character `k` system across all rows.
