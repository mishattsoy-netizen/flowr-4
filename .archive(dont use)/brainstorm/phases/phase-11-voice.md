# Phase 11 — Voice Capture + Voice Agent

## 1. Request Summary

Add voice as a first-class input channel. Two surfaces:
1. **Quick voice capture** — hold-to-talk button available globally (floating action button + `/` + Space shortcut). Transcribes; routes through the same quick-capture parser as phase 05.
2. **Voice agent** — full voice conversation with the agent (toggleable in AIAssistant). User speaks, agent responds with text (beta) or optional TTS (post-beta).

STT uses browser Web Speech API first (free, local), with fallback to a cloud provider (Groq Whisper / OpenAI Whisper via existing routes).

---

## 2. Codebase Context
- `src/components/assistant/AIAssistant.tsx`
- `src/agent/runner.ts` (phase 06)
- `src/modes/life/widgets/today/QuickCapture.tsx` (phase 05)
- Existing model routes: `src/app/api/groq/route.ts` (Whisper available there)

## 3. Step-by-Step Implementation Plan

### Step 1 — Voice service abstraction
- **File:** `src/voice/service.ts` (create)
- **Action:** create
- **What to do:**
  ```ts
  export interface VoiceService {
    isAvailable(): boolean;
    startRecording(): Promise<void>;
    stopRecording(): Promise<Blob>;    // returns audio
    transcribe(audio: Blob): Promise<{ text: string; confidence?: number }>;
  }
  ```
  Provide two impls: `WebSpeechService` (uses `SpeechRecognition` API for streaming transcription — no audio blob) and `WhisperService` (records via `MediaRecorder`, uploads to `/api/transcribe`).

### Step 2 — Transcribe API route
- **File:** `src/app/api/transcribe/route.ts` (create)
- **Action:** create
- **What to do:** POST multipart with audio. Relays to Groq Whisper (existing Groq key) or OpenAI depending on settings. Returns `{ text }`. Enforce 60s audio cap + file-size cap.

### Step 3 — Push-to-talk FAB
- **File:** `src/components/voice/VoiceFAB.tsx` (create)
- **Action:** create
- **What to do:** Floating button bottom-right. Hold to record (button pulses, mic icon). Release → transcribes → routes through `handleQuickCapture(text)` from phase 05.

### Step 4 — Keyboard shortcut
- **File:** `src/hooks/useKeyboardShortcuts.ts` (create or extend)
- **Action:** create or modify
- **What to do:** Global `/` then `Space` toggles voice capture. Shows same recording indicator.

### Step 5 — Voice toggle in AIAssistant
- **File:** `src/components/assistant/AIAssistant.tsx`
- **Action:** modify
- **What to do:** Add mic toggle button next to the message input. When on, user speaks → transcript fills input → auto-send after 1.5s silence (VAD via `AudioContext.createAnalyser`). Off by default.

### Step 6 — Recording indicator
- **File:** `src/components/voice/RecordingIndicator.tsx` (create)
- **Action:** create
- **What to do:** Small pill "Listening… 0:05" with live waveform. Dismissable.

### Step 7 — Permission flow
- **File:** `src/voice/permissions.ts` (create)
- **Action:** create
- **What to do:** First-use prompt explaining mic use, with "Maybe later" + "Enable" buttons. Remember choice in localStorage.

### Step 8 — Usage tracking
- **File:** `src/agent/limits.ts` (extend)
- **Action:** modify
- **What to do:** Track `voice_seconds` per day; enforce soft daily cap (e.g. 15 min on free tier).

### Step 9 — Quick-capture slash routing
- **File:** `src/modes/life/widgets/today/QuickCapture.tsx`
- **Action:** modify
- **What to do:** Accept optional voice-specific hints like "add task to trader mode" → map to `/trade` prefix before dispatch.

### Step 10 — Optional TTS (stub)
- **File:** `src/voice/tts.ts` (create, minimal)
- **Action:** create
- **What to do:** Beta: no-op. Post-beta slot to plug in ElevenLabs / OpenAI TTS. Keep interface ready: `speak(text: string): Promise<void>`.

---

## 4. Verification Checklist
- [ ] FAB records + transcribes + creates the right object via quick-capture.
- [ ] Whisper fallback works when browser STT unavailable (Safari).
- [ ] AIAssistant voice mode: speak → see transcript → agent responds.
- [ ] Permission denial handled gracefully.
- [ ] Hitting voice cap shows the cap message.

## 5. Notes & Warnings
- Web Speech API is not available on all browsers — always ship Whisper fallback.
- VAD (silence detection) is fragile; tune 1.5s threshold with a user setting.
- Audio blobs can be large — enforce 60s + 5 MB client-side cap before upload.
- Privacy: show clear mic indicator while recording; never record in background.
- Mobile Safari: `getUserMedia` requires HTTPS + user gesture; ensure FAB triggers are within a tap handler.
