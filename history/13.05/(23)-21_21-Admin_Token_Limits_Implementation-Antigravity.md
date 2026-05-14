Date: 13.05.2026 21:21
User request: "add setting to tha admin where i can set input and output token limits, that apply to selected providers, like Global Bot Prompt visibility settings, but if not selected its unlimited(max available for models)"

### 2. Objective Reconstruction
Implement a granular token management system in the admin dashboard. This includes UI controls for input/output caps, a category-based filter to apply these caps, and the backend logic to enforce these limits across all major AI providers.

### 3. Strategic Reasoning
I followed the existing design pattern of "Intent Category" selection used for prompt visibility. For the backend, I implemented a "Token Guard" in the central `chainRouter` that performs history trimming for input limits and passes dynamic `max_tokens` to providers for output limits. This ensures consistency and prevents manual overrides in individual provider files.

### 4. Detailed Blueprint
1.  Update `OrchestratorPanel.tsx` with numeric inputs for limits and a multi-select category pill bar.
2.  Extend `PipelineSettings` interface in `router-config.ts` to include the new fields.
3.  Inject history-trimming logic into `chainRouter.ts` using the `estimateTokens` utility.
4.  Standardize provider signatures (`runGoogle`, `runOpenRouter`, etc.) to accept a context object containing the dynamic `max_tokens` value.

### 5. Operational Trace
- Modified `src/components/admin/OrchestratorPanel.tsx`: Added `input_token_limit`, `output_token_limit`, and `token_limit_enabled_categories`.
- Modified `src/lib/router-config.ts`: Updated interface and parsing for pipeline settings.
- Modified `src/lib/bot/chainRouter.ts`: Added history trimming loop and updated all provider call sites.
- Modified `src/lib/bot/providers/google.ts`, `src/lib/bot/providers/groq.ts`, `src/lib/bot/providers/openrouter.ts`, `src/lib/bot/providers/siliconflow.ts`, `src/lib/bot/providers/cloudflare.ts`, `src/lib/bot/providers/pollinations.ts`, `src/lib/bot/providers/huggingface.ts`, `src/lib/bot/providers/ollama.ts`: Implemented dynamic `max_tokens` / `num_predict` support.

### 6. Status Assessment
Completed. The system now offers full control over token budgets per intent category, preventing expensive or excessively long responses while allowing "unlimited" mode for unselected categories.
