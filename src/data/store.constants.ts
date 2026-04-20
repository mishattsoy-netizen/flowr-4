import type { FlowRouterConfig, PriorityModel, CloudModel } from './store.types';

// Bump when model IDs change to bust stale localStorage
export const FLOW_ROUTER_VERSION = 12;

export const DEFAULT_FLOW_ROUTER_CONFIG: FlowRouterConfig = {
  enabled: true,
  preferKeyRotation: true,
  version: FLOW_ROUTER_VERSION,
  categories: [
    {
      key: 'tool_call',
      label: 'Tool Calling',
      description: 'Handles complex function calling and workspace actions (Gemini 2.5 Flash).',
      models: [
        { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: 'gemini', enabled: true, dailyLimit: 20 },
        { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', provider: 'gemini', enabled: true, dailyLimit: 500 },
        { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', provider: 'groq', enabled: true, dailyLimit: 1000 },
        { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B', provider: 'groq', enabled: true, dailyLimit: 1000 },
        { id: 'google/gemma-4-31b-it:free', label: 'Gemma 4 31B', provider: 'openrouter', enabled: true, dailyLimit: 1500 },
        { id: 'google/gemma-3-12b-it:free', label: 'Gemma 3 12B', provider: 'gemini', enabled: true, dailyLimit: 14400 },
      ],
    },
    {
      key: 'web_search',
      label: 'Web Search',
      description: 'Optimized for RAG, search grounding, and online queries (Gemini 2.5 & 3.1).',
      models: [
        { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: 'gemini', enabled: true, dailyLimit: 20 },
        { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', provider: 'gemini', enabled: true, dailyLimit: 500 },
        { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B', provider: 'groq', enabled: true, dailyLimit: 1000 },
        { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', provider: 'groq', enabled: true, dailyLimit: 1000 },
        { id: 'nvidia/nemotron-3-super-120b-a12b:free', label: 'Nemotron 3 Super', provider: 'openrouter', enabled: true, dailyLimit: 200 },
        { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B (OR)', provider: 'openrouter', enabled: true, dailyLimit: 200 },
      ],
    },
    {
      key: 'complex',
      label: 'Complex Thinking',
      description: 'Deep reasoning and analysis (Gemini 2.5 Flash).',
      models: [
        { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: 'gemini', enabled: true, dailyLimit: 20 },
        { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', provider: 'gemini', enabled: true, dailyLimit: 500 },
        { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', provider: 'groq', enabled: true, dailyLimit: 1000 },
        { id: 'google/gemma-4-31b-it:free', label: 'Gemma 4 31B', provider: 'openrouter', enabled: true, dailyLimit: 1500 },
        { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B', provider: 'groq', enabled: true, dailyLimit: 1000 },
        { id: 'google/gemma-3-12b-it:free', label: 'Gemma 3 12B', provider: 'gemini', enabled: true, dailyLimit: 14400 },
      ],
    },
    {
      key: 'medium',
      label: 'Medium',
      description: 'Balanced performance for general-purpose requests (Gemini 3.1 Flash Lite).',
      models: [
        { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', provider: 'gemini', enabled: true, dailyLimit: 500 },
        { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: 'gemini', enabled: true, dailyLimit: 20 },
        { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', provider: 'groq', enabled: true, dailyLimit: 1000 },
        { id: 'qwen/qwen3-32b', label: 'Qwen3 32B', provider: 'groq', enabled: true, dailyLimit: 1000 },
        { id: 'google/gemma-4-31b-it:free', label: 'Gemma 4 31B', provider: 'openrouter', enabled: true, dailyLimit: 1500 },
        { id: 'google/gemma-3-12b-it:free', label: 'Gemma 3 12B', provider: 'gemini', enabled: true, dailyLimit: 14400 },
      ],
    },
    {
      key: 'fast',
      label: 'Fast',
      description: 'Sub-second latency (Gemini 3.1 Flash Lite).',
      models: [
        { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', provider: 'gemini', enabled: true, dailyLimit: 500 },
        { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B', provider: 'groq', enabled: true, dailyLimit: 14400 },
        { id: 'google/gemma-4-26b-a4b-it:free', label: 'Gemma 4 26B', provider: 'openrouter', enabled: true, dailyLimit: 1500 },
        { id: 'nvidia/nemotron-nano-9b-v2:free', label: 'Nemotron Nano 9B', provider: 'openrouter', enabled: true, dailyLimit: 200 },
        { id: 'google/gemma-3-12b-it:free', label: 'Gemma 3 12B', provider: 'gemini', enabled: true, dailyLimit: 14400 },
        { id: 'google/gemma-3-4b-it:free', label: 'Gemma 3 4B', provider: 'gemini', enabled: true, dailyLimit: 14400 },
      ],
    },
    {
      key: 'image_generation',
      label: 'Image Generation',
      description: 'Creative and high-fidelity image output.',
      hidden: true,
      models: [
        { id: 'imagen-3.0-generate-001', label: 'Imagen 3 Generate', provider: 'gemini', enabled: true, dailyLimit: 25 },
        { id: 'imagen-3.0-fast-generate-001', label: 'Imagen 3 Fast', provider: 'gemini', enabled: true, dailyLimit: 25 },
        { id: 'gemini-1.5-flash', label: 'Gemini 1.5 (IMG)', provider: 'gemini', enabled: true, dailyLimit: 20 },
      ],
    },
    {
      key: 'audio_voice',
      label: 'Audio & Voice',
      description: 'Transcribe audio, native voice dialog, and text-to-speech.',
      hidden: true,
      models: [
        { id: 'groq/whisper-large-v3', label: 'Whisper Large V3', provider: 'groq', enabled: true, dailyLimit: 2000 },
        { id: 'groq/whisper-large-v3-turbo', label: 'Whisper Large V3 Turbo', provider: 'groq', enabled: true, dailyLimit: 2000 },
        { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Audio', provider: 'gemini', enabled: true, dailyLimit: 500 },
      ],
    },
  ],
};

export const PRIORITY_MODELS: PriorityModel[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', status: 'checking' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', status: 'checking' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', status: 'checking' },
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B', status: 'checking' },
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', status: 'checking' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super', status: 'checking' },
];

export const INITIAL_CLOUD_MODELS: CloudModel[] = [
  { id: 'flowr/flow-1.0', label: 'Flow 1.0 🌊', provider: 'flowr', description: 'Smart intent router — automatically picks the best model for each task.' },
  { id: 'flowr/gemma4-hybrid', label: 'Gemma 4 Hybrid ✨', provider: 'google', isFree: true, isThinking: true, description: 'Smart Gemma 4 hybrid: 31B for tools & reasoning, 26B MoE for fast answers.' },
];
