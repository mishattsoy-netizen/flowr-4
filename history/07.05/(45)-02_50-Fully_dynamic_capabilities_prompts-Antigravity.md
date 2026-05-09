User request: "i said no template answer you did exaplty it"

### 1. Objective Reconstruction
Refactor the `Greeting & Capabilities Behavior` prompts across all active modes (`DEFAULT`, `PRO`, `THINK`) to completely remove all hardcoded bullet lists, parenthetical examples, and fixed capability pillars. Guide the model to explain its capabilities dynamically, organically, and conversationally on the fly based purely on the active context and the user's current register, with absolutely zero static lists or templates. Synchronize these changes to the live Supabase database and trigger compiled prompt updates.

---

### 2. Strategic Reasoning
*   **Zero Templates**: Any pre-written list or bulleted set of examples within the system instructions acts as a literal template for LLMs, resulting in repetitive, copy-paste capability lists when users ask "what can you do?". Removing all lists and replacing them with purely abstract behavioral guidelines forces the model to generate custom, organic, and context-aware responses on the fly.
*   **Synchronous Compilation**: Running `scripts/sync-mode-prompts.mjs` directly updates `bot_settings` and rebuilds the `bot_compiled_prompt` table, ensuring the live model uses the new dynamic parameters immediately.

---

### 3. Detailed Blueprint
*   **Refactor `mode-default.txt`**:
    *   Completely strip out the bullet points for writing, research, planning, design, and practical tools.
    *   Direct the model to answer "what can you do?" dynamically and conversationally, mentioning versatility and inviting natural communication.
*   **Refactor `mode-pro.txt`**:
    *   Apply matching dynamic capabilities instructions.
*   **Refactor `mode-think.txt`**:
    *   Apply matching dynamic capabilities instructions.
*   **Live Database Sync**:
    *   Run `node scripts/sync-mode-prompts.mjs` to push and recompile live prompts.

---

### 4. Operational Trace
*   **Refactored [mode-default.txt](file:///c:/Users/misha/Documents/Vibe Coding/flowr-4-main/mode-default.txt)**: Replaced the bulleted capability list on lines 27 to 32 with a strict dynamic instruction.
*   **Refactored [mode-pro.txt](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/mode-pro.txt)**: Replaced the bulleted capability list on lines 35 to 40 with a strict dynamic instruction.
*   **Refactored [mode-think.txt](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/mode-think.txt)**: Replaced the bulleted capability list on lines 26 to 31 with a strict dynamic instruction.
*   **Executed Database Sync**: Successfully ran `node scripts/sync-mode-prompts.mjs`, recompiling and synchronizing all 15 settings modules instantly on Supabase.

---

### 5. Status Assessment
*   **Completed**:
    *   All prompt files have been successfully refactored.
    *   All hardcoded bullet lists, examples, and templates of capabilities have been completely removed.
    *   The live database is synchronized and recompiled with the new dynamic behavior.
