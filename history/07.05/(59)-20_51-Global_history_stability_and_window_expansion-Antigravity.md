User request: "bot is constantly forgetting history how to fix it? can we change so all advisor, classifier, thikning and output chains saw 10 lats turns (q&a pairs) of chat history?"

Objective Reconstruction:
Resolve conversation context "forgetfulness" by expanding the history window and fixing format mismatches in the AI orchestration layers. The goal was to ensure all intermediate and final stages of the pipeline see at least 10 turns (20 messages) of the conversation.

Strategic Reasoning:
My audit revealed two primary issues:
1. **Format Mismatches**: Several providers (HuggingFace, OpenRouter, Pollinations) were expecting a 'content' property that didn't exist in the history format, effectively causing them to ignore all previous messages. I fixed these to correctly parse the Gemini-style 'parts[0].text' format.
2. **Short Context Windows**: Most orchestration layers (Advisor, Classifier, Thinking, Orchestrator) were hardcoded to only see the last 6 messages (3 turns). I expanded these to 20 messages (10 turns) as requested.
3. **Missing Propagation**: The orchestrator pipeline steps were not receiving any history at all. I refactored 'executePipeline' and its children to propagate the 10-turn window.

Detailed Blueprint:
- **Providers**: 
    - Added history support and normalization to `cloudflare.ts`.
    - Fixed format parsing in `huggingface.ts`, `openrouter.ts`, and `pollinations.ts`.
- **Orchestration**:
    - Updated `advisor.ts`, `classifier.ts`, `orchestrator.ts`, and `thinkChain.ts` to use a 20-message (10-turn) history slice.
- **Pipeline**:
    - Refactored `pipeline.ts` to pass history to all individual step chains.
    - Updated `chainRouter.ts` to propagate history into the pipeline and Cloudflare calls.

Operational Trace:
- Modified multiple provider and orchestration files to standardize on a 10-turn history window and ensure 100% format compatibility.
- Verified that both single-chain and multi-chain (orchestrated) flows now correctly propagate context.

Status Assessment:
Completed. The bot should now maintain significantly better context across long conversations, as all reasoning and output layers now see the last 10 Q&A pairs.
