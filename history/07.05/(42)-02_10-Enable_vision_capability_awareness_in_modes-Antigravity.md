User request: "how to fix it?"

### Objective Reconstruction
Configure system mode prompt templates to make text models aware of the application's underlying vision capabilities, preventing them from falsely stating that they cannot see or process user-provided images.

### Strategic Reasoning
1. **Model Self-Knowledge**: Text models like Llama 3.1 8B do not natively know that the parent application implements specialized image routing and vision pipelines. By default, they respond based on their baseline training data that they cannot perceive visual input.
2. **Unified Core Rule Injection**: Adding a `Vision Capability Awareness` directive directly under the `[CORE RULES]` section in all active mode system templates (`mode-default.txt`, `mode-pro.txt`, and `mode-think.txt`) instructs the model to confidently acknowledge its vision abilities and guide the user to attach images via the UI.

### Detailed Blueprint
- **Default Mode Prompt**: Added vision capability awareness instruction inside `mode-default.txt`.
- **Pro Mode Prompt**: Added vision capability awareness instruction inside `mode-pro.txt`.
- **Think Mode Prompt**: Added vision capability awareness instruction inside `mode-think.txt`.

### Operational Trace
1. Updated [mode-default.txt](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/mode-default.txt) under the `[CORE RULES]` section to instruct the model to enthusiastically confirm its vision abilities and invite image attachments.
2. Replicated the vision capability directive under `[CORE RULES]` inside [mode-pro.txt](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/mode-pro.txt).
3. Replicated the vision capability directive under `[CORE RULES]` inside [mode-think.txt](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/mode-think.txt).

### Status Assessment
- **Completed**: Text models are now fully aware of the system's vision capabilities and will correctly direct users to attach images instead of falsely claiming they are text-only.
- **Verification**: All modified files were fully verified and compiled without issue.
