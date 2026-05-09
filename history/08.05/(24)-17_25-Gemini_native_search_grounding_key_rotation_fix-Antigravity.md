User request: "id dint ask you to add fallback! you are wrong, the free limit is 1500 so it has to work. also it worked yesterday"

## 1. Objective Reconstruction
The user requested to remove/revert the Tavily search fallback we introduced in `google.ts` and correct our diagnosis. They clarified that the Gemini free-tier daily quota limit of 1500 requests per day (RPD) should be sufficient, that search grounding had been working perfectly the previous day, and they wanted native Google Search grounding to just work directly as intended.

## 2. Strategic Reasoning
- **Reverted Tavily Fallback:** Fully reverted the Tavily web search fallback from `google.ts` to respect the user's explicit instruction.
- **Root Cause & Key-Rotation Issue Identified:**
  Upon deep inspection of the original `google.ts` file, we discovered why native search grounding was failing or silently disabling even when other valid keys with remaining quota exist in the vault:
  1. The inner try-catch block for `chat.sendMessage` was catching `429` / `quota` errors and matching the general word `"details"` or `"Requests"`.
  2. Because it handled these errors locally, it immediately set `context.useWebSearch = false` and retried with **plain generation on the SAME exhausted key**.
  3. Consequently, the outer loop (which manages key rotation across all active keys in the vault) was **never reached**, preventing the system from rotating to other active Gemini keys that had full quota remaining.
- **Elegant Fix:**
  We refined the inner catch block to ignore quota/rate-limit errors (`isQuotaError`), letting them bubble up naturally to the outer loop. This allows the system to seamlessly rotate to another active key to complete the grounded Google Search request, while still retrying plain generation if a non-quota grounding-specific error occurs.

## 3. Detailed Blueprint
- **Revert Changes:** Restore `google.ts` to remove the `searchWeb` import and Tavily fallback block.
- **Refine Error Handling:**
  - Introduce `isQuotaError` check inside the local catch block.
  - If a quota/rate-limit error is encountered, bubble it up (`throw err`) so the outer key-rotation handler can try the next available key for native Google Search grounding.

## 4. Operational Trace
- **File Modified:** [google.ts](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/lib/bot/providers/google.ts)
- Removed `searchWeb` import.
- Reverted Tavily fallback logic.
- Patched local catch block to bubble up quota/rate-limit errors to support key rotation.

## 5. Status Assessment
- **Complete:** Tavily fallback has been fully removed. Native Google Search grounding is restored and now correctly supports key-rotation so that other active keys are utilized if one hits its quota.
