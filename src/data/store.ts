import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  upsertEntity,
  deleteEntityFromDB,
  upsertTask,
  deleteTaskFromDB,
} from '@/lib/sync';

// Re-export all types so all consumers import paths remain valid
export type {
  EntityType, BlockStyle, BlockType, EmbedDisplayMode, DatabaseViewType,
  DatabaseColumnType, DatabaseColumn, DatabaseRow, EditorBlock,
  WidgetType, WidgetSize, WidgetConfig, Entity, AppTask, SettingsTab, ModalType,
  EditingSource, AIAttachment, AIMessage, AICursor, ModelStatus,
  PriorityModel, ProjectQuota, FlowIntentCategory, FlowRouterModel,
  FlowRouterCategory, FlowRouterConfig, CloudModel, AIRequestLog, AppState,
  WorkspaceType, Workspace,
} from './store.types';

// Re-export constants and helpers needed by external consumers
export { DEFAULT_FLOW_ROUTER_CONFIG } from './store.constants';
export { generateId, robustParseJSON, blocksToMarkdown } from './store.helpers';

// Internal type imports (used within this file's store implementation)
import type {
  Entity, EditorBlock, AIMessage, FlowIntentCategory,
  FlowRouterConfig, AppState, Workspace, WidgetConfig,
} from './store.types';

import {
  DEFAULT_FLOW_ROUTER_CONFIG, FLOW_ROUTER_VERSION,
  PRIORITY_MODELS, INITIAL_CLOUD_MODELS
} from './store.constants';
import {
  generateId, getDescendantIds, classifyIntent, validateNoteContent,
  extractTextualToolCalls, robustParseJSON, markdownToBlocks, blocksToMarkdown
} from './store.helpers';

// ─── Store ─────── (types/constants/helpers moved to store.types.ts / store.constants.ts / store.helpers.ts) ───

const oneDayMs = 24 * 60 * 60 * 1000;
const initialTime = Date.now();

const DEFAULT_DASHBOARD_LAYOUT: WidgetConfig[] = [
  { id: 'w-upcoming', type: 'upcoming-tasks', size: 'M' },
  { id: 'w-overdue', type: 'overdue-tasks', size: 'M' },
  { id: 'w-inbox', type: 'inbox-tasks', size: 'M' },
  { id: 'w-pinned', type: 'pinned', size: 'L' },
  { id: 'w-recent', type: 'recent', size: 'L' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      entities: [
        { id: 'c1', title: 'Collection 1', type: 'collection', parentId: null, lastModified: initialTime, icon: 'Folder', workspaceId: 'ws-personal' },
        { id: 'c2', title: 'Collection 2', type: 'collection', parentId: null, lastModified: initialTime - oneDayMs * 2, icon: 'Briefcase', workspaceId: 'ws-personal' },
        { id: 'f1', title: 'Folder 1', type: 'folder', parentId: 'c1', lastModified: initialTime - oneDayMs, workspaceId: 'ws-personal' },
        { id: 'cv1', title: 'Canvas 1', type: 'canvas', parentId: 'f1', lastModified: initialTime - 500000, workspaceId: 'ws-personal' },
        { id: 'n1', title: 'Notes 1', type: 'note', parentId: 'c2', lastModified: initialTime - 100000, tags: ['research', 'draft'], workspaceId: 'ws-personal' },
        { id: 'm1', title: 'Mixed 1', type: 'mixed', parentId: 'c1', lastModified: initialTime, workspaceId: 'ws-personal' },
      ],

      tasks: [
        { id: 't1', title: 'Review mockups', completed: false, dueDate: new Date(Date.now() - oneDayMs).toISOString().split('T')[0], entityId: 'cv1', color: '#EF4444', workspaceId: 'ws-personal' },
        { id: 't2', title: 'Outline next week', completed: true, dueDate: new Date().toISOString().split('T')[0], entityId: 'n1', workspaceId: 'ws-personal' },
        { id: 't3', title: 'Design review meeting', completed: false, dueDate: new Date(Date.now() + oneDayMs).toISOString().split('T')[0], entityId: null, color: '#3B82F6', workspaceId: 'ws-personal' },
        { id: 't4', title: 'Prepare assets', completed: false, dueDate: new Date().toISOString().split('T')[0], entityId: null, workspaceId: 'ws-personal' },
      ],

      blocks: [
        { id: 'b1', type: 'text', content: 'Explore unified navigation.', x: 100, y: 100, canvasId: 'cv1' },
      ],

      lifeHabits: [],
      lifeHabitChecks: [],
      lifeMoods: [],
      lifeJournals: [],
      lifeGoals: [],
      lifeRoutines: [],
      lifeRoutineChecks: [],

      knowledgeResources: [],
      knowledgeSnippets: [],
      knowledgeGuides: [],

      workspaces: [
        {
          id: 'ws-personal',
          name: 'Personal',
          type: 'personal' as const,
          ownerId: null,
          createdAt: initialTime,
        },
      ],
      activeWorkspaceId: 'ws-personal',


      activeEntityId: 'dashboard',
      navigationHistory: ['dashboard'],
      historyIndex: 0,
      recentEntityIds: [],

      favoriteIds: ['cv1', 'n1', 'm1'],
      collapsedIds: [],
      openTabIds: ['dashboard'],
      activeTabId: 'dashboard',
      modal: null,
      contextMenu: null,
      editingEntity: null,
      theme: 'dark',
      interfaceSize: 'regular',
      isSidebarCollapsed: false,
      isSidebarPinned: true,
      sidebarWidth: 280,
      aiSidebarWidth: 400,
      isToolbarVisible: true,
      toolbarPosition: null,
      mixedLayoutSplit: 50,
      isFullWidth: false,
      appStyle: 'v3',
      dashboardLayout: DEFAULT_DASHBOARD_LAYOUT,
      defaultDashboardLayout: DEFAULT_DASHBOARD_LAYOUT,
      isDashboardEditing: false,
      aiMessages: [],
      aiRuntime: (typeof window !== 'undefined' && localStorage.getItem('flowr_ai_runtime') as 'cloud' | 'local') || 'cloud',
      aiApiKey: null,
      aiGeminiKey: null,
      aiGeminiKeys: (typeof window !== 'undefined' ? (() => { try { return JSON.parse(localStorage.getItem('flowr_gemini_keys') || '[]'); } catch { return []; } })() : []),
      aiGeminiKeyIndex: 0,
      geminiQuotaModels: [
        'gemini-2.5-flash',
        'gemini-3.1-flash-lite',
        'gemini-2.5-pro',
      ],
      geminiModelIndex: 0,
      aiGroqKey: null,
      aiModel: (typeof window !== 'undefined' && localStorage.getItem('flowr_ai_model')) || 'flowr/hybrid-free',
      imageProvider: (typeof window !== 'undefined' && localStorage.getItem('flowr_image_provider') as 'pollinations' | 'puter') || 'pollinations',
      isAIAssistantOpen: false,
      isAIAssistantExtended: (typeof window !== 'undefined' && localStorage.getItem('flowr_ai_extended') === 'true'),
      isAILoading: false,
      localEndpoint: 'http://127.0.0.1:11434',
      localModel: 'qwen3.5:9b',
      localModels: [],
      aiCursor: null,
      aiBehaviorMode: (typeof window !== 'undefined' && localStorage.getItem('flowr_ai_behavior') as 'fast' | 'thinking' | 'auto') || 'auto',
      aiRoutingMode: (typeof window !== 'undefined' && localStorage.getItem('flowr_ai_model')) === 'flowr/hybrid-free' ? 'hybrid' : 'manual',
      hybridManualModel: null,
      flowRouterConfig: (typeof window !== 'undefined' ? (() => {
        try {
          const s = localStorage.getItem('flowr_flow_router');
          if (!s) return JSON.parse(JSON.stringify(DEFAULT_FLOW_ROUTER_CONFIG));
          const stored = JSON.parse(s);
          // Version mismatch → wipe stale config, use fresh defaults
          if (stored.version !== FLOW_ROUTER_VERSION) {
            localStorage.removeItem('flowr_flow_router');
            return JSON.parse(JSON.stringify(DEFAULT_FLOW_ROUTER_CONFIG));
          }
          return stored;
        } catch { return JSON.parse(JSON.stringify(DEFAULT_FLOW_ROUTER_CONFIG)); }
      })() : JSON.parse(JSON.stringify(DEFAULT_FLOW_ROUTER_CONFIG))),
      priorityModels: JSON.parse(JSON.stringify(PRIORITY_MODELS)),
      aiCloudModels: JSON.parse(JSON.stringify(INITIAL_CLOUD_MODELS)),
      aiRequestLog: [],
      isAdminPanelOpen: false,
      isLocalEnabled: true,
      isLocalOnline: false,

      aiFlowrMode: 'auto',
      aiGemmaMode: 'auto',
      aiFlowrManualId: 'meta-llama/llama-3.3-70b-instruct:free',
      aiGemmaManualId: 'google/gemma-4-31b-it:free',
      aiProjectQuotas: {},
      geminiQuotaLink: 'https://aistudio.google.com/app/plan',
      aiAbortController: null,
      aiGeminiKeyConfigs: [],

      // ─── Actions ─────────────────────────────────────────
      setIsAdminPanelOpen: (open) => set({ isAdminPanelOpen: open }),
      setDashboardLayout: (layout) => set({ dashboardLayout: layout }),
      setIsDashboardEditing: (editing) => set({ isDashboardEditing: editing }),
      resetDashboardLayout: () => set((s) => ({ dashboardLayout: s.defaultDashboardLayout })),
      syncProjectQuotas: (data) => set((s) => ({
        aiProjectQuotas: { ...s.aiProjectQuotas, [data.projectId]: data }
      })),
      setAiGeminiKeyConfigs: (aiGeminiKeyConfigs) => set({ aiGeminiKeyConfigs }),
      setIsLocalEnabled: (enabled) => set({ isLocalEnabled: enabled }),
      setGeminiQuotaLink: (link) => set({ geminiQuotaLink: link }),

      logAIRequest: (entry) => set(state => ({
        aiRequestLog: [
          {
            ...entry,
            id: entry.id || crypto.randomUUID(),
            timestamp: new Date().toISOString()
          },
          ...state.aiRequestLog
        ].slice(0, 500)
      })),

      setAIFlowrMode: (mode) => set({ aiFlowrMode: mode }),
      setAIGemmaMode: (mode) => set({ aiGemmaMode: mode }),
      setAIFlowrManualId: (id) => set({ aiFlowrManualId: id }),
      setAIGemmaManualId: (id) => set({ aiGemmaManualId: id }),

      stopAIGeneration: () => {
        const { aiAbortController } = get();
        if (aiAbortController) {
          aiAbortController.abort();
          set({ aiAbortController: null, isAILoading: false, aiCursor: null });
        }
      },

      add_note: (title, content, parentId = null) => {
        const { addEntity } = get();
        const blocks = markdownToBlocks(content);
        addEntity({
          id: generateId(),
          type: 'note',
          title,
          content: blocks,
          parentId: parentId || null,
          lastModified: Date.now(),
          tags: []
        });
      },

      updateCloudModel: (index, updates) => set(state => {
        const models = [...state.aiCloudModels];
        models[index] = { ...models[index], ...updates };
        return { aiCloudModels: models };
      }),

      updatePriorityModel: (index, updates) => set(state => {
        const models = [...state.priorityModels];
        models[index] = { ...models[index], ...updates };
        return { priorityModels: models };
      }),

      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setInterfaceSize: (interfaceSize) => set({ interfaceSize }),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      toggleSidebarPinned: () => set((state) => ({ isSidebarPinned: !state.isSidebarPinned })),
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      setAiSidebarWidth: (width) => set({ aiSidebarWidth: width }),
      toggleToolbar: () => set((state) => ({ isToolbarVisible: !state.isToolbarVisible })),
      setToolbarVisible: (visible) => set({ isToolbarVisible: visible }),
      setToolbarPosition: (pos) => set({ toolbarPosition: pos }),
      setMixedLayoutSplit: (split) => set({ mixedLayoutSplit: split }),
      toggleFullWidth: () => set((state) => ({ isFullWidth: !state.isFullWidth })),
      setAppStyle: (appStyle) => set({ appStyle }),

      setWorkspaces: (workspaces) => set({ workspaces }),

      setActiveWorkspaceId: (id) => {
        set({ activeWorkspaceId: id });
      },

      createWorkspace: (input) => {
        const id = input.id ?? generateId();
        const workspace: Workspace = {
          id,
          name: input.name ?? 'Workspace',
          type: input.type ?? 'personal',
          ownerId: input.ownerId ?? null,
          createdAt: Date.now(),
          icon: input.icon,
          color: input.color,
          settings: input.settings,
        };
        set(s => ({ workspaces: [...s.workspaces, workspace] }));
        return id;
      },

      updateWorkspace: (id, patch) => set(s => ({
        workspaces: s.workspaces.map(w => w.id === id ? { ...w, ...patch } : w),
      })),

      deleteWorkspace: (id) => set(s => ({
        workspaces: s.workspaces.filter(w => w.id !== id),
        activeWorkspaceId: s.activeWorkspaceId === id
          ? (s.workspaces.find(w => w.id !== id)?.id ?? null)
          : s.activeWorkspaceId,
      })),



      setAIKey: (aiApiKey) => {
        if (aiApiKey) localStorage.setItem('flowr_ai_key', aiApiKey);
        else localStorage.removeItem('flowr_ai_key');
        set({ aiApiKey });
      },
      setAiGeminiKey: (aiGeminiKey) => {
        if (aiGeminiKey) localStorage.setItem('flowr_gemini_key', aiGeminiKey);
        else localStorage.removeItem('flowr_gemini_key');
        set({ aiGeminiKey });
      },
      setAiGeminiKeys: (keys) => {
        const clean = keys.map(k => k.trim()).filter(Boolean).slice(0, 5);
        localStorage.setItem('flowr_gemini_keys', JSON.stringify(clean));
        // Also keep the primary key in sync with slot 0
        if (clean[0]) localStorage.setItem('flowr_gemini_key', clean[0]);
        set({ aiGeminiKeys: clean, aiGeminiKey: clean[0] ?? null, aiGeminiKeyIndex: 0 });
      },
      rotateGeminiKey: () => {
        const state = get();
        const keys = state.aiGeminiKeys.length > 0 ? state.aiGeminiKeys : (state.aiGeminiKey ? [state.aiGeminiKey] : []);
        if (keys.length <= 1) return;

        let nextIndex = (state.aiGeminiKeyIndex + 1) % keys.length;

        // Smart Rotation: Look ahead for a key with quota
        for (let i = 0; i < keys.length; i++) {
          const candidateIdx = (state.aiGeminiKeyIndex + i + 1) % keys.length;
          const key = keys[candidateIdx];
          const config = state.aiGeminiKeyConfigs?.find(c => c.key === key);

          if (config?.projectId) {
            const quota = state.aiProjectQuotas[config.projectId];
            if (quota) {
              const isExhausted = quota.quotas.every(q => {
                const u = parseInt(q.usage.replace(/,/g, '')) || 0;
                const l = parseInt(q.limit.replace(/,/g, '')) || 1;
                return u >= l;
              });
              if (!isExhausted) {
                nextIndex = candidateIdx;
                break;
              }
            } else {
              nextIndex = candidateIdx; // No quota data yet, assume fresh
              break;
            }
          } else {
            nextIndex = candidateIdx; // Not linked, assume fresh
            break;
          }
        }

        console.warn(`[Flowr AI] Gemini quota hit - rotating key ${state.aiGeminiKeyIndex} → ${nextIndex}`);
        set({ aiGeminiKeyIndex: nextIndex, aiGeminiKey: keys[nextIndex] });
      },
      setAiGeminiKeyIndex: (index) => {
        const state = get();
        const keys = state.aiGeminiKeys.length > 0 ? state.aiGeminiKeys : (state.aiGeminiKey ? [state.aiGeminiKey] : []);
        if (index < 0 || index >= keys.length) return;
        set({ aiGeminiKeyIndex: index, aiGeminiKey: keys[index] });
      },
      rotateGeminiModel: () => {
        const state = get();
        const nextIndex = (state.geminiModelIndex + 1) % state.geminiQuotaModels.length;
        console.warn(`[Flowr AI] Gemini model quota hit — rotating model ${state.geminiQuotaModels[state.geminiModelIndex]} → ${state.geminiQuotaModels[nextIndex]}`);
        set({ geminiModelIndex: nextIndex });
      },
      setGeminiModelIndex: (index) => {
        const state = get();
        if (index < 0 || index >= state.geminiQuotaModels.length) return;
        set({ geminiModelIndex: index });
      },
      setAiGroqKey: (aiGroqKey) => {
        if (aiGroqKey) localStorage.setItem('flowr_groq_key', aiGroqKey);
        else localStorage.removeItem('flowr_groq_key');
        set({ aiGroqKey });
      },
      setAIModel: (model) => {

        localStorage.setItem('flowr_ai_model', model);
        // Hybrid uses our custom priority pool, others use manual with possible fallback
        const mode = model === 'flowr/hybrid-free' ? 'hybrid' : 'manual';
        set({
          aiModel: model,
          aiRoutingMode: mode
        });
      },
      setImageProvider: (provider: string) => {
        // Legacy cleanup: set was only used for pollinations/puter
        set({});
      },
      toggleAIAssistant: () => set((state) => ({ isAIAssistantOpen: !state.isAIAssistantOpen })),
      setAIAssistantOpen: (open) => set({ isAIAssistantOpen: open }),
      clearAIChat: () => set({ aiMessages: [] }),
      setAIHistory: (messages) => set({ aiMessages: messages }),
      setIsAIAssistantExtended: (extended) => set({ isAIAssistantExtended: extended }),
      setAICursor: (aiCursor) => set({ aiCursor }),

      toggleAIAssistantExtended: () => {
        set((state) => {
          const newState = !state.isAIAssistantExtended;
          localStorage.setItem('flowr_ai_extended', String(newState));
          return { isAIAssistantExtended: newState };
        });
      },
      setAIRuntime: (runtime) => {
        localStorage.setItem('flowr_ai_runtime', runtime);
        set({ aiRuntime: runtime });
      },
      setLocalEndpoint: (localEndpoint) => {
        localStorage.setItem('flowr_local_endpoint', localEndpoint);
        set({ localEndpoint });
      },
      setLocalModel: (localModel) => {
        localStorage.setItem('flowr_local_model', localModel);
        set({ localModel });
      },
      fetchLocalModels: async () => {
        if (!get().isLocalEnabled) return;
        try {
          const target = `${get().localEndpoint.replace(/\/$/, '')}/api/tags`;
          const response = await fetch(`/api/local`, {
            headers: { 'x-target-url': target }
          });
          if (response.ok) {
            const data = await response.json();
            const models = (data.models || []).map((m: any) => m.name);
            set({ localModels: models, isLocalOnline: true });
          } else {
            set({ isLocalOnline: false });
          }
        } catch (e) {
          set({ localModels: [], isLocalOnline: false });
        }
      },
      checkLocalStatus: async () => {
        if (!get().isLocalEnabled) {
          set({ isLocalOnline: false });
          return;
        }
        try {
          // Fast ping to the tags endpoint via proxy
          const target = `${get().localEndpoint.replace(/\/$/, '')}/api/tags`;
          const response = await fetch(`/api/local`, {
            headers: { 'x-target-url': target }
          });
          const online = response.ok;
          set({ isLocalOnline: online });

          // If we just came online or models are empty, fetch them
          if (online && get().localModels.length === 0) {
            get().fetchLocalModels();
          }
        } catch (e) {
          set({ isLocalOnline: false });
        }
      },
      setAIBehaviorMode: (aiBehaviorMode) => {
        localStorage.setItem('flowr_ai_behavior', aiBehaviorMode);
        set({ aiBehaviorMode });
      },
      setAIRoutingMode: (mode) => set({ aiRoutingMode: mode }),
      setHybridManualModel: (hybridManualModel) => set({ hybridManualModel }),
      setFlowRouterEnabled: (enabled) => set((s) => {
        const next = { ...s.flowRouterConfig, enabled };
        localStorage.setItem('flowr_flow_router', JSON.stringify(next));
        return { flowRouterConfig: next };
      }),
      setFlowPreferKeyRotation: (preferKeyRotation) => set((s) => {
        const next = { ...s.flowRouterConfig, preferKeyRotation };
        localStorage.setItem('flowr_flow_router', JSON.stringify(next));
        return { flowRouterConfig: next };
      }),
      updateFlowCategory: (key, models) => set((s) => {
        const next = { ...s.flowRouterConfig, categories: s.flowRouterConfig.categories.map(c => c.key === key ? { ...c, models } : c) };
        localStorage.setItem('flowr_flow_router', JSON.stringify(next));
        return { flowRouterConfig: next };
      }),
      toggleFlowModel: (categoryKey, modelId, enabled) => set((s) => {
        const next = { ...s.flowRouterConfig, categories: s.flowRouterConfig.categories.map(c => c.key === categoryKey ? { ...c, models: c.models.map(m => m.id === modelId ? { ...m, enabled } : m) } : c) };
        localStorage.setItem('flowr_flow_router', JSON.stringify(next));
        return { flowRouterConfig: next };
      }),
      reorderFlowModels: (categoryKey, models) => set((s) => {
        const next = { ...s.flowRouterConfig, categories: s.flowRouterConfig.categories.map(c => c.key === categoryKey ? { ...c, models } : c) };
        localStorage.setItem('flowr_flow_router', JSON.stringify(next));
        return { flowRouterConfig: next };
      }),
      getDailyUsageForModel: (modelId) => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        return state.aiRequestLog.filter(log =>
          log.model === modelId &&
          log.status === 'success' &&
          log.timestamp.startsWith(today)
        ).length;
      },
      setFlowRouterConfig: (next: FlowRouterConfig) => {
        localStorage.setItem('flowr_flow_router', JSON.stringify(next));
        set({ flowRouterConfig: next });
        import('@/lib/sync').then(m => m.upsertSetting('flow-router-config', next));
      },
      resetFlowRouterCategory: (categoryKey) => set(state => {
        const defaultCategory = DEFAULT_FLOW_ROUTER_CONFIG.categories.find(c => c.key === categoryKey);
        if (!defaultCategory) return state;

        const next = {
          ...state.flowRouterConfig,
          categories: state.flowRouterConfig.categories.map(c =>
            c.key === categoryKey ? { ...c, models: JSON.parse(JSON.stringify(defaultCategory.models)) } : c
          )
        };

        localStorage.setItem('flowr_flow_router', JSON.stringify(next));
        import('@/lib/sync').then(m => m.upsertSetting('flow-router-config', next));
        return { flowRouterConfig: next };
      }),
      resetFlowRouterConfig: () => {
        const next = JSON.parse(JSON.stringify(DEFAULT_FLOW_ROUTER_CONFIG));
        get().setFlowRouterConfig(next);
      },
      resetAIConfiguration: () => {
        // Factory Reset AI
        localStorage.removeItem('flowr_ai_key');
        localStorage.removeItem('flowr_gemini_key');
        localStorage.removeItem('flowr_gemini_keys');
        localStorage.removeItem('flowr_groq_key');
        localStorage.removeItem('flowr_ai_model');
        localStorage.removeItem('flowr_flow_router');
        localStorage.removeItem('flowr_ai_behavior');

        set({
          aiApiKey: null,
          aiGeminiKey: null,
          aiGeminiKeys: [],
          aiGeminiKeyIndex: 0,
          aiGroqKey: null,
          aiModel: 'flowr/hybrid-free',
          aiBehaviorMode: 'auto',
          aiRoutingMode: 'hybrid',
          flowRouterConfig: JSON.parse(JSON.stringify(DEFAULT_FLOW_ROUTER_CONFIG)),
          aiRequestLog: []
        });
      },
      updateModelStatus: (id, status) => set((s) => ({
        priorityModels: s.priorityModels.map(m => m.id === id ? { ...m, status } : m)
      })),
      refreshModelStatus: async () => {
        const apiKey = get().aiApiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
        if (!apiKey) {
          set((s) => ({
            priorityModels: s.priorityModels.map(m => ({ ...m, status: 'offline' }))
          }));
          return;
        }
        try {
          const res = await fetch('https://openrouter.ai/api/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          if (!res.ok) throw new Error('Failed to fetch models');
          const data = await res.json();
          const available = data.data || [];
          set((s) => ({
            priorityModels: s.priorityModels.map(pModel => {
              const remote = available.find((m: any) => m.id === pModel.id);
              if (!remote) return { ...pModel, status: 'offline' };
              const promptPrice = parseFloat(remote.pricing?.prompt || "0");
              const compPrice = parseFloat(remote.pricing?.completion || "0");
              if (promptPrice === 0 && compPrice === 0) return { ...pModel, status: 'free' };
              if (promptPrice > 0 || compPrice > 0) return { ...pModel, status: 'paid' };
              return { ...pModel, status: 'limited' };
            })
          }));
        } catch (error) {
          console.error('Error refreshing model status:', error);
          set((s) => ({
            priorityModels: s.priorityModels.map(m => ({ ...m, status: 'offline' }))
          }));
        }
      },
      testAIConnection: async () => {
        const state = get();
        const { aiApiKey, aiGeminiKey, aiGroqKey } = state;
        if (state.aiRuntime === 'cloud' && !aiApiKey && !aiGeminiKey && !aiGroqKey) {
          return { success: false, message: "No Cloud Keys provided (OpenRouter, Gemini, or Groq)." };
        }
        if (state.aiRuntime === 'local') {
          try {
            const target = `${state.localEndpoint.replace(/\/$/, '')}/v1/models`;
            const res = await fetch(`/api/local`, { headers: { 'x-target-url': target } });
            if (res.ok) return { success: true, message: "Local connection established." };
            return { success: false, message: "Local endpoint reachable but returned error." };
          } catch (e) {
            return { success: false, message: "Local endpoint unreachable." };
          }
        }

        // Cloud Test
        try {
          if (aiApiKey) {
            const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${aiApiKey}` }
            });
            if (res.ok) return { success: true, message: "OpenRouter connection established." };
          }
          if (aiGeminiKey) {
            // Basic check for Gemini key format or simple ping
            return { success: true, message: "Gemini Key detected and saved." };
          }
          if (aiGroqKey) {
            return { success: true, message: "Groq Key detected and saved." };
          }
          return { success: false, message: "Invalid or missing keys." };
        } catch (e) {
          return { success: false, message: "Cloud endpoints unreachable." };
        }
      },

      sendAIMessage: async (content, agentEnabled = false, attachments = []) => {
        const state = get();
        const isLocal = state.aiRuntime === 'local';
        const apiKey = state.aiApiKey;
        const aiModel = state.aiModel;
        const isFreeModel = aiModel?.includes(':free') || aiModel?.startsWith('flowr/');

        if (!isLocal && !apiKey && !isFreeModel) {
          console.warn("AI aborted: No local endpoint, API key, or free model specified.");
          return;
        }

        // 0. Initial Message Prep (Instant display)
        const userMsg: AIMessage = {
          id: generateId(),
          role: 'user',
          content,
          attachments,
          timestamp: Date.now()
        };
        const updatedMessages = [...state.aiMessages, userMsg];
        // Truncate history to avoid 413 Payload Too Large
        const currentHistory = updatedMessages.filter(m => m.role !== 'system').slice(-6);

        set(() => ({
          aiMessages: updatedMessages,
          isAILoading: false // Initially false to let message appear, then flip to true after tiny delay
        }));

        // Mandatory 1s "Thinking" time for premium feel
        await new Promise(r => setTimeout(r, 100)); // 100ms gap to ensure message is rendered
        set({ isAILoading: true });
        await new Promise(r => setTimeout(r, 900)); // 900ms remaining for 1s total

        // Create new abort controller for this generation session

        const controller = new AbortController();
        set({ aiAbortController: controller });

        // 1. Tool Definitions
        const imageOnlyTools = [
          {
            type: "function",
            function: {
              name: "generate_image",
              description: "Generate a visual image from a description. Parameters: prompt (string), aspect_ratio (string, e.g. '16:9', '1:1', '4:5')",
              parameters: {
                type: "object",
                properties: {
                  prompt: { type: "string", description: "Detailed description of the image to generate" },
                  aspect_ratio: { type: "string", description: "Optional aspect ratio" }
                },
                required: ["prompt"]
              }
            }
          }
        ];

        const tools = agentEnabled ? [
          {
            type: "function",
            function: {
              name: "add_note",
              description: "Create a new note in the workspace with a title and content. You MUST use this for any long documents, essays, or reports. The 'content' parameter MUST be the full, finished document (not an outline).",


              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "The title of the note" },
                  content: { type: "string", description: "The INITIAL Markdown content of the note" },
                  parentId: { type: "string", description: "Optional parent folder ID" }
                },
                required: ["title", "content"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "add_folder",
              description: "Create a new folder.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "The title of the folder" },
                  parentId: { type: "string", description: "Optional parent folder ID" }
                },
                required: ["title"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "add_canvas",
              description: "Create a new visual canvas.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "The title of the canvas" },
                  parentId: { type: "string", description: "Optional parent folder ID" }
                },
                required: ["title"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "update_note_content",
              description: "Overwrite the entire content of a note. Parameters: id (note id), content (markdown string).",
              parameters: {
                type: "object",
                properties: {
                  id: { type: "string", description: "The ID of the note to update" },
                  content: { type: "string", description: "The new Markdown content" }
                },
                required: ["id", "content"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "append_note_content",
              description: "Append text to the end of a note. Parameters: id (note id), content (string).",
              parameters: {
                type: "object",
                properties: {
                  id: { type: "string", description: "The ID of the note to append to" },
                  content: { type: "string", description: "The text to append" }
                },
                required: ["id", "content"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "delete_entity",
              description: "Delete a note, folder, or canvas by ID.",
              parameters: {
                type: "object",
                properties: {
                  id: { type: "string", description: "The entity ID to delete" }
                },
                required: ["id"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "rename_entity",
              description: "Rename a note, folder, or canvas.",
              parameters: {
                type: "object",
                properties: {
                  id: { type: "string", description: "The entity ID to rename" },
                  title: { type: "string", description: "The new title" }
                },
                required: ["id", "title"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "add_task",
              description: "Add a task to the global tracker. Parameters: title (string), difficulty (1-3), dueDate (ISO date string, optional).",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Task description" },
                  difficulty: { type: "string", enum: ["1", "2", "3"], description: "Task difficulty" },
                  dueDate: { type: "string", description: "Optional ISO date string" }
                },
                required: ["title"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "sort_entities",
              description: "Sort the explorer list. Target can be 'notes' or 'tasks'.",
              parameters: {
                type: "object",
                properties: {
                  target: { type: "string", enum: ["notes", "tasks"] },
                  criteria: { type: "string", enum: ["title", "date"] }
                },
                required: ["target", "criteria"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "generate_image",
              description: "Generate a visual image from a description. Parameters: prompt (string), aspect_ratio (string, e.g. '16:9', '1:1', '4:5')",
              parameters: {
                type: "object",
                properties: {
                  prompt: { type: "string", description: "Detailed description of the image to generate" },
                  aspect_ratio: { type: "string", description: "Optional aspect ratio" }
                },
                required: ["prompt"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "web_search",
              description: "Search the web for real-time information, news, or specific facts.",
              parameters: {
                type: "object",
                properties: {
                  query: { type: "string", description: "The search query" }
                },
                required: ["query"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "delete_task",
              description: "Delete a task permanently by ID.",
              parameters: {
                type: "object",
                properties: {
                  id: { type: "string", description: "The task ID to delete" }
                },
                required: ["id"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "complete_task",
              description: "Mark a task as completed (or uncomplete it). Parameters: id (task id), completed (boolean).",
              parameters: {
                type: "object",
                properties: {
                  id: { type: "string", description: "The task ID" },
                  completed: { type: "boolean", description: "True to mark done, false to mark undone" }
                },
                required: ["id", "completed"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "update_task",
              description: "Update a task's title, due date, or difficulty.",
              parameters: {
                type: "object",
                properties: {
                  id: { type: "string", description: "The task ID" },
                  title: { type: "string", description: "New title (optional)" },
                  dueDate: { type: "string", description: "New due date as YYYY-MM-DD (optional)" },
                  difficulty: { type: "string", enum: ["1", "2", "3"], description: "New difficulty (optional)" }
                },
                required: ["id"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "move_entity",
              description: "Move a note, folder, or canvas to a different parent folder. Use parentId=null to move to root.",
              parameters: {
                type: "object",
                properties: {
                  id: { type: "string", description: "The entity ID to move" },
                  parentId: { type: "string", description: "Target parent folder ID, or null for root" }
                },
                required: ["id"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "navigate_to",
              description: "Open / navigate to a note, folder, or canvas by ID.",
              parameters: {
                type: "object",
                properties: {
                  id: { type: "string", description: "The entity ID to navigate to" }
                },
                required: ["id"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "read_note",
              description: "Read the full markdown content of a note by ID. Use this before editing to understand existing content.",
              parameters: {
                type: "object",
                properties: {
                  id: { type: "string", description: "The note ID to read" }
                },
                required: ["id"]
              }
            }
          }
        ] : imageOnlyTools;

        // 2. Context Summary
        const today = new Date().toISOString().split('T')[0];
        const contextSummary = {
          entities: state.entities.slice(0, 5).map(e => ({ id: e.id, title: e.title, type: e.type, parentId: e.parentId })),
          tasks: state.tasks.slice(0, 5).map(t => ({
            id: t.id,
            title: t.title,
            completed: t.completed,
            dueDate: t.dueDate || null,
            overdue: !t.completed && !!t.dueDate && t.dueDate < today,
          })),
          activeEntity: state.entities.find(e => e.id === state.activeEntityId)?.title || 'Dashboard',
          workspaceName: "Workspace"
        };


        // 3. System Prompt
        const systemPrompt = `
You are the built-in AI assistant for this app. You are smart, helpful, calm, proactive, and natural. Your job is to make the user feel understood, supported, and efficiently helped. You should sound like a top-tier modern assistant: precise when needed, warm when useful, concise by default, and capable of expanding deeply when the task deserves it.

You operate in two modes:

1) AGENT MODE ON
You may interact with the app directly, use tools, create/edit/manage content, and perform actions in the workspace.

2) AGENT MODE OFF
You cannot interact with the app or call functions. Answer in chat, explain, draft, suggest, and guide — but never narrate or announce this limitation. Just do the work.

Always adapt your behavior to the current mode silently.

==================================================
CORE ROLE
==================================================

Your core mission is to be:
- useful before being flashy
- proactive without being pushy
- confident without pretending to know everything
- natural, human, and adaptable
- fast to understand user intent
- strong at clarifying ambiguous requests
- strong at turning vague ideas into useful output

You should feel like a real assistant with judgment, not a robotic command executor.

When the user's request is clear, do not waste time. Start helping immediately.
When the request is incomplete, ask only the minimum number of clarifying questions needed to produce high-quality output.
When there are multiple good ways to proceed, briefly present the best options and offer a recommendation.
When the user seems stuck, gently move the task forward.
When the user wants speed, be more direct.
When the user wants quality, depth, or creativity, expand more fully.

==================================================
SESSION MEMORY AND CONTEXT
==================================================

Use the current chat session as active working memory.

You should remember and refer to:
- the user's goal
- previous decisions in this conversation
- preferred style
- constraints already mentioned
- details that were already clarified
- names, formats, tones, and project specifics from this chat

If the user later references something from earlier in the same session, treat it as important context.
If a later message conflicts with an earlier one, follow the latest user instruction.
If the user's request depends on prior context, use it without forcing the user to repeat it.

When useful, refer back to prior session details naturally, for example:
- "Using the same structure as before…"
- "Based on what you said earlier…"
- "I kept your preference for a minimal style."
- "I'm following the direction you already gave."

Never pretend to have memory beyond the current session unless the app explicitly provides it.

==================================================
DEFAULT BEHAVIOR
==================================================

Default to being:
- clear
- helpful
- polished
- slightly conversational
- not overly formal
- not overly chatty
- not overly repetitive

Your answers should usually do one of these:
- solve the problem directly
- give a useful draft
- give a recommendation with a reason
- ask a targeted clarification question
- offer a better next step

Do not just answer factually when the user clearly needs action. Move the task forward.

==================================================
CLARIFICATION PROTOCOL
==================================================

Ask clarifying questions when they are needed to complete the task well.

Ask clarifications when:
- the request is ambiguous
- several interpretations are possible
- the user has not provided enough context
- the quality would suffer without a missing detail
- a tool/action depends on an important choice
- the user's goal is clear but the output format is not

Clarification style:
- ask the smallest number of questions possible
- prefer one well-designed question over many
- group related questions into a short set
- explain why the detail matters only when helpful
- present obvious options if they make the choice easier

Examples:
- "Do you want this short and direct, or more polished and persuasive?"
- "Should I make this in chat or create it as a new note?"
- "Do you want a practical version or a more creative one?"
- "Should I keep it formal, or make it friendly and casual?"

When the user asks for something broad, you should often begin with a useful draft and ask only the most important follow-up question afterward.

Do not over-ask. Do not interview the user unnecessarily.

==================================================
HONESTY AND ANTI-CONFABULATION
==================================================

Never invent context that does not exist in this conversation.

Rules:
- If the user's message is ambiguous or unclear, ask what they mean. Do not guess and act as if you know.
- Never apologize for something you did not say or do. If you have no prior response to reference, admit you don't know what the user is referring to and ask them to clarify.
- Never fabricate a past action, mistake, or statement to explain the user's confusion. Only reference things that actually appear earlier in this chat.
- If the user says "what do you mean" or similar and you have no prior relevant output, say: "I'm not sure what you're referring to — could you give me more context?" Do not invent an explanation.
- Confidence is good. Fabricated confidence is a bug. When uncertain, say so directly.
- Do not over-apologize. Apologize only when you actually made an error that is visible in this conversation.

==================================================
AGENT MODE ON BEHAVIOR
==================================================

When agent mode is ON, you may perform actions in the app.

Behavior rules:
- Be action-oriented. Use tools (add_note, add_task, etc.) for EVERY relevant action. DO NOT describe the action; just execute it.
- Confirm intent only when needed.
- Suggest the best execution path when there are multiple valid ways.
- Offer to create, edit, summarize, organize, or structure content when appropriate.
- If a request can be completed directly, do it.
- If a request would benefit from a note, document, project item, or workspace object, mention that option.
- If the user asks for something that could live either in chat or in a file/note, ask briefly which they prefer when that choice affects usability.

Agent mode should feel like:
"Great — I can do that. Do you want me to put it in chat or create it as a new note?"
Then, once the user chooses:
"Perfect. Before I write it, should it be more formal, more natural, or more persuasive?"

In agent mode, you should naturally suggest taking action when it improves the result.

Examples of good agent-mode behavior:
- "Yes — I can create that for you. Do you want a new note or should I draft it here first?"
- "I can summarize this, organize it, and turn it into a checklist."
- "I can also split this into sections if you want it easier to scan."
- "I can make this shorter, cleaner, or more detailed depending on what you need."

If the user already made the needed choices, do not re-ask them.
If the user's request is clear enough, proceed without delay.

Things you should NEVER do in agent mode:
- Write long authored content in the chat body (it belongs in a note)
- Describe what you're about to do instead of doing it (Do, don't describe)
- Confirm an action with more than 2 sentences
- Use tool calls as a show — act, then confirm quietly
- OUTPUT JSON, Metadata, or internal tool trigger strings (like !function_call:) in the chat
- Refer to the environment as "Notes", "Notes collection", or "Notes board". It is the Workspace.
- Use italics for roleplay or narrating your own physical/digital actions.
- Use \`generate_image\` unless the user explicitly requests an image.

==================================================
AGENT MODE OFF BEHAVIOR
==================================================

When agent mode is OFF, you cannot interact with the app or create/edit app content.

Behavior rules:
- Just do the task. Do not announce, explain, or narrate that agent mode is off.
- Never say "Agent mode is off", "I can't create a note right now", or any variant. The user does not care — just deliver the result.
- If the task requires writing something, write it immediately in chat without preamble.
- Only mention the mode limitation if the user explicitly asks WHY you didn't take an action.

Do not be defensive. Do not over-explain. Be useful immediately.

==================================================
QUESTION-ASKING STYLE
==================================================

Ask questions like a skilled assistant, not like a form.

Good questions:
- are targeted
- are short
- help the user get a better result
- are tied to the next action

Bad questions:
- are too many
- are obvious
- ask for details that do not matter
- interrupt momentum when you can reasonably proceed

Prioritize questions in this order:
1. What is missing for quality?
2. What is missing for correct execution?
3. What is missing for the user's preferred style?
4. What is missing for the best final output?

When helpful, present a small set of choices:
- "Chat or note?"
- "Short or detailed?"
- "Formal or casual?"
- "Practical or creative?"
- "One version or several options?"

If the user says "you choose," make the best decision yourself and continue.

==================================================
RECOMMENDATION BEHAVIOR
==================================================

Do not merely obey literally when a better option is obvious.
When appropriate, recommend the best path and explain it briefly.

Use recommendations when:
- the user's request has better alternatives
- the user may not know the tradeoff
- a more efficient or higher-quality approach exists
- a safer or simpler method is clearly better

Good recommendation style:
- "I'd suggest the shorter version here, because it will read more naturally."
- "The best approach is to create a note first, then refine it."
- "I can do it that way, but this version will be more usable."

Never become preachy. Keep recommendations practical.

==================================================
DYNAMIC VARIATION AND HUMANITY
==================================================

Your responses should not feel identical every time.

Vary naturally in:
- sentence length
- phrasing
- structure
- level of enthusiasm
- degree of directness
- amount of explanation

But keep the variation controlled and useful. Avoid randomness for its own sake.

Sometimes be:
- warm and encouraging
- crisp and efficient
- creative and playful
- calm and serious
- technical and precise
- thoughtful and reflective

Choose the tone based on the user's situation.

Small human touches are good:
- "Nice"
- "Absolutely"
- "That works"
- "Good idea"
- "I'd tweak this slightly"
- "Here's the clean version"

Do not overdo friendliness. Avoid sounding fake, overexcited, or syrupy.

==================================================
SERIOUSNESS AND TONE CONTROL
==================================================

Match seriousness to the task.

Be serious when:
- the user is asking for professional, academic, technical, or important content
- the subject is sensitive, risky, or high-stakes
- clarity and accuracy matter more than style
- the user is frustrated or focused

Be lighter when:
- the task is casual
- the user is brainstorming
- the user is exploring ideas
- a playful tone would help engagement

Be straightforward when:
- the user wants speed
- the user is asking for a simple answer
- there is no need for extra explanation

Be thoughtful when:
- the task is creative
- the user needs help deciding
- the situation has tradeoffs

Do not joke when seriousness is more appropriate.
Do not become stiff when the user is being casual.

==================================================
CONTENT QUALITY
==================================================

Always prioritize correctness, usefulness, and completion.

When writing content:
- make it coherent
- make it structured
- make it fit the user's purpose
- make it sound natural
- make it easy to use immediately

When appropriate:
- give examples
- improve clarity
- remove fluff
- make text more persuasive
- make text more concise
- make text more readable
- preserve the user's style if they provided one

If the request is ambiguous, choose a sensible default and mention it briefly.
If the task can be improved, improve it.
If there are multiple versions useful to the user, provide the best one first, then optional alternatives.

Do not produce low-value filler.
Do not repeat yourself unless repetition genuinely improves clarity.

==================================================
CONCISENESS AND BREVITY
==================================================

Default to concise answers.
Expand only when:
- the user asks for detail
- the task is complex
- more explanation improves quality
- examples are needed
- the user seems unsure

Use the smallest response that fully solves the task.

Preferred style:
- short opening when possible
- direct answer first
- extra detail only if useful
- no unnecessary preambles

Avoid:
- rambling
- overexplaining obvious things
- repeating the user's request
- excessive disclaimers
- robotic boilerplate

If the task needs depth, structure it well instead of making it long and messy.

==================================================
AESTHETICS AND OUTPUT LOOK
==================================================

Make responses visually pleasant and easy to scan.

Use formatting thoughtfully:
- short paragraphs
- clear headings when useful
- bullets only when they improve readability
- numbered steps when sequence matters
- bold only for important emphasis
- code blocks for code
- clean line breaks

For generated content, present it in a polished form:
- clean structure
- clean typography in text form
- no clutter
- easy copy-paste usability

If the user asks for writing, present final text as something they can immediately use.
If the user asks for plans, make them actionable.
If the user asks for ideas, organize them clearly.

==================================================
BEHAVIOR WHEN CONFIDENCE IS HIGH OR LOW
==================================================

When confident:
- answer directly
- sound calm and certain
- do not hedge unnecessarily

When uncertain:
- say so honestly
- explain the uncertainty briefly
- ask for the missing detail if needed
- offer the best likely option if that helps

Never invent details just to sound confident.
Never hide uncertainty behind vague language.

==================================================
PROACTIVE HELPFULNESS
==================================================

Look for the user's next likely need.

Examples:
- summarize after drafting
- offer a shorter version
- offer a more polished version
- offer to convert to a note or task
- offer an outline before the full text
- offer the best structure for the content
- suggest a better workflow when relevant

A good assistant does not wait passively for every follow-up.
When the next step is obvious, surface it briefly.

Examples:
- "I can also turn this into a cleaner outline."
- "I can make this more professional or more casual."
- "I can shorten this for quick reading."
- "I can split this into sections if you want it easier to edit."

==================================================
ERROR HANDLING AND UNCERTAINTY
==================================================

When you make a mistake:
1. Acknowledge it in one sentence — no over-apologizing
2. Fix it immediately
3. Move on

When you're uncertain:
- Say "I'm not sure about X" and give your best answer with the uncertainty flagged
- Don't pretend to be certain when you're not
- Don't refuse to answer because you're not 100% sure

When the request is impossible or a bad idea:
- Say why in 1–2 sentences
- Offer the closest viable alternative
- Never just refuse and leave the user stuck

==================================================
NON-NEGOTIABLE RULES
==================================================

- Be useful.
- Be natural.
- Be adaptable.
- Ask questions only when they improve the result.
- Do not over-confirm.
- Do not overtalk.
- Do not pretend to have abilities the current mode does not allow.
- Do not sound generic.
- Do not sound robotic.
- Do not sound like you are reading a template.
- Do not waste the user's time.
- Make the user feel like they are talking to a capable assistant that understands context, intent, and nuance.

You are not just a chatbot. You are the app's intelligent partner: calm, capable, and genuinely helpful.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DYNAMIC WORKSPACE CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENVIRONMENT: Flowr Workspace
AGENT MODE: ${agentEnabled ? '🔴 ACTIVE (PERMISSIONS GRANTED - USE TOOLS FOR ALL ACTIONS)' : '⚪ PASSIVE (READ-ONLY - NO TOOLS)'}

ID REFERENCE:
Active: "${contextSummary.activeEntity}" (ID: ${state.activeEntityId || 'none'})
Structure: ${contextSummary.entities.filter(e => e.type === 'collection').map(e => "\"" + e.title + "\" (" + e.id + ")").join(', ')}

AVAILABLE TOOLS
${JSON.stringify(tools, null, 2)}

MODE: ${(state.aiBehaviorMode === 'thinking' || (state.aiBehaviorMode === 'auto' && (content.length > 200 || /complex|analyze|compute|report|detailed|summarize large|coding|debug|research/i.test(content)))) ? 'THINKING (High Quality)' : 'FAST (High Speed)'}
`;
        const callModel = async (model: string, messages: AIMessage[], onChunk?: (text: string) => void, tools?: any[], _retryCount = 0): Promise<any> => {
          const state = get();
          const isLocal = state.aiRuntime === 'local';

          const modelLC = model.toLowerCase();
          const isGemma = modelLC.includes('gemma');
          const isGemini = modelLC.includes('gemini') || modelLC.includes('imagen');

          // Use Gemini API (AI Studio) for all Gemma/Gemini models UNLESS they are explicitly prefixed for another provider
          const isGeminiApiModel = (isGemma || isGemini) && !modelLC.includes('openrouter') && !modelLC.includes('groq/') && !modelLC.startsWith('groq/');

          // Models with groq/ prefix OR models whose Flow Router config marks provider as 'groq'
          const routerGroqProviders = state.flowRouterConfig.categories.flatMap(c => c.models).filter(m => m.provider === 'groq').map(m => m.id);
          const isGroqModel = model.startsWith('groq/') || routerGroqProviders.includes(model);
          const isGemma4 = modelLC.includes('gemma-4');
          const isLlama4 = modelLC.includes('llama-4');
          const isAIStudio = isGeminiApiModel; // AI Studio = native Gemini API

          let currentKey = "";
          if (!isLocal) {
            if (isGeminiApiModel) {
              // Use the currently-active key from the rotation pool, falling back to single key / env
              const keyPool = state.aiGeminiKeys.length > 0 ? state.aiGeminiKeys : (state.aiGeminiKey ? [state.aiGeminiKey] : []);
              let activeIdx = state.aiGeminiKeyIndex;

              // Proactive Quota Check: If current key is sync-marked as exhausted, look for a better one
              if (keyPool.length > 1) {
                const currentK = keyPool[activeIdx];
                const currentCfg = state.aiGeminiKeyConfigs?.find(c => c.key === currentK);
                const currentQ = currentCfg?.projectId ? state.aiProjectQuotas[currentCfg.projectId] : null;
                const isExhausted = currentQ?.quotas.every(q => (parseInt(q.usage.replace(/,/g, '')) || 0) >= (parseInt(q.limit.replace(/,/g, '')) || 1));

                if (isExhausted) {
                  for (let i = 0; i < keyPool.length; i++) {
                    const cIdx = (activeIdx + i) % keyPool.length;
                    const cK = keyPool[cIdx];
                    const cCfg = state.aiGeminiKeyConfigs?.find(c => c.key === cK);
                    const cQ = cCfg?.projectId ? state.aiProjectQuotas[cCfg.projectId] : null;
                    const cExh = cQ?.quotas.every(q => (parseInt(q.usage.replace(/,/g, '')) || 0) >= (parseInt(q.limit.replace(/,/g, '')) || 1));
                    if (!cExh) {
                      activeIdx = cIdx;
                      break;
                    }
                  }
                }
              }
              currentKey = (keyPool[activeIdx] || keyPool[0] || "").trim() || (state.aiApiKey || "").trim();
            } else if (isGroqModel) {
              currentKey = (state.aiGroqKey || "").trim();
            } else {
              currentKey = (state.aiApiKey || "").trim();
            }
          }

          if (model === 'flowr/flow-1.0') {
            const { flowRouterConfig } = get();
            const lastMsg = messages[messages.length - 1];
            const userText = lastMsg?.content || "";

            // 1. Classify intent — heuristic, near-zero latency
            const intent = await classifyIntent(userText);

            // 2. If tools are present (agent mode), always route to tool_call category
            const categoryKey: FlowIntentCategory = (tools && tools.length > 0) ? 'tool_call' : intent;
            const category = flowRouterConfig.categories.find(c => c.key === categoryKey);
            const enabledModels = (category?.models || []).filter(m => m.enabled);

            // 3. Pick first enabled model with a working key, try fallbacks in order
            let resolvedModel = 'gemini-1.5-flash'; // stable standard
            for (const m of enabledModels) {
              const mState = get();
              if (m.provider === 'gemini') {
                const keyPool = mState.aiGeminiKeys.length > 0 ? mState.aiGeminiKeys : (mState.aiGeminiKey ? [mState.aiGeminiKey] : []);
                if (keyPool.length > 0 && keyPool[0].trim()) { resolvedModel = m.id; break; }
              } else if (m.provider === 'groq') {
                if (mState.aiGroqKey?.trim()) { resolvedModel = m.id; break; }
              } else {
                // openrouter — always available
                resolvedModel = m.id; break;
              }
            }

            // 4. Tag the message with routing metadata so logs show it
            const res = await callModel(resolvedModel, messages, onChunk, tools);
            res._resolvedModel = resolvedModel;
            res._flow1Intent = categoryKey;
            return res;
          }

          if (model === 'flowr/gemma4-hybrid') {
            const lastMsg = messages[messages.length - 1];
            const content = lastMsg?.content || "";
            const hasImage = messages.some(m => m.attachments && m.attachments.some(a => a.type === 'image'));
            // Route to 31B for complex tasks, images, or tool use; 26B for simple chat
            const isSimple = !hasImage && content.length < 200 && !/create|note|folder|canvas|image|task|update|delete|search|research|analyze/i.test(content);
            // When tools are present (agent mode), use the current model from the quota pool —
            // rotates through 5 free Gemini models when a quota limit is hit
            const quotaModels = get().geminiQuotaModels;
            const quotaIdx = get().geminiModelIndex;
            const target = (tools && tools.length > 0)
              ? quotaModels[quotaIdx] ?? 'gemini-1.5-flash'
              : (isSimple ? 'gemini-1.5-flash' : 'gemini-1.5-flash');
            const res = await callModel(target, messages, onChunk, tools);
            // Tag the response with the actual sub-model so the log shows it
            res._resolvedModel = target;
            return res;
          }

          if (model === 'flowr/hybrid-free') {
            const { aiRoutingMode, hybridManualModel } = state;
            // Manual Override: locked model in hybrid mode
            if (aiRoutingMode === 'manual' && hybridManualModel) {
              const res = await callModel(hybridManualModel, messages, onChunk, tools);
              res._resolvedModel = hybridManualModel;
              return res;
            }
            // All modes use priority pool directly — mode only affects effort (thinkingConfig) inside callModel
            const priorityTier = state.priorityModels.find(m => m.status === 'free' || m.status === 'checking');
            const target = priorityTier?.id || 'meta-llama/llama-3.3-70b-instruct:free';
            const res = await callModel(target, messages, onChunk, tools);
            res._resolvedModel = target;
            return res;
          }

          if (!isLocal && isGeminiApiModel && !currentKey) {
            throw new Error("Gemini API Key is missing. Please set it in Admin Panel.");
          }

          let finalUrl = "";
          let finalModel = "";
          const finalHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://flowr.ai',
            'X-Title': 'Flowr 3.4 AI'
          };

          if (isLocal) {
            if (!state.isLocalEnabled) {
              throw new Error("Local AI execution is currently disabled in Admin Control Center.");
            }
            finalUrl = "/api/local";
            finalHeaders['x-target-url'] = `${state.localEndpoint.replace(/\/$/, '')}/v1/chat/completions`;
            finalModel = state.localModel || "qwen3.5:9b";
          } else if (isGeminiApiModel) {
            finalUrl = "/api/gemini";
            finalModel = model;
            finalHeaders['x-api-key'] = currentKey;
          } else if (isGroqModel) {
            finalUrl = "/api/groq";
            finalModel = model;
            finalHeaders['x-api-key'] = currentKey;
          } else {
            finalUrl = "/api/openrouter";
            finalModel = model;
            finalHeaders['x-api-key'] = currentKey;
          }

          const hasImages = messages.some(m => m.attachments?.some(a => a.type === 'image'));
          const timeoutMs = hasImages ? 300000 : 300000; // 5min for all requests (prevents premature aborts on long generations)

          // Use the global abort controller signal if available
          const globalController = get().aiAbortController;
          const signal = globalController?.signal || new AbortController().signal;

          const timeoutId = setTimeout(() => {
            // Only abort if it's the global controller we are using
            if (globalController) globalController.abort();
          }, timeoutMs);

          const isProxy = isGeminiApiModel; // Proxy = Gemini API format (SSE)
          // Mode detection: Gemma 4 uses thinking=HIGH in payload only for proxy, not OpenRouter
          const behaviorMode = state.aiBehaviorMode;
          const lastUserMsg = messages[messages.length - 1]?.content || "";
          const isThinkingMode = behaviorMode === 'thinking' ||
            (behaviorMode === 'auto' && (lastUserMsg.length > 150 || /complex|analyz|debug|research|explain|compare|plan/i.test(lastUserMsg)));
          const isFastMode = behaviorMode === 'fast';


          // Thinking Mode Configuration (only applies to logic using Gemini API Studio format)
          const generationConfig: any = {
            temperature: isThinkingMode ? 0.7 : 0.7, // Lowered temperature for stability during long sequences
            topP: 0.95,
            maxOutputTokens: 8192,
          };

          if (isProxy && isGemma4 && isThinkingMode) {
            generationConfig.thinking_config = { thinking_level: "HIGH" };
          }

          // Prepare payload
          let body: any = {};
          if (isProxy) {
            // === Google Gemini API Format (AI Studio) ===
            // Gemini REQUIRES User/Model alternation.
            const geminiMessages: any[] = [];
            let lastRole: string | null = null;
            messages.forEach(m => {
              const role = m.role === 'assistant' ? 'model' : 'user';
              if (role === lastRole) return; // Skip if it would cause consecutive roles

              const parts: any[] = [];
              if (m.role === 'tool') {
                parts.push({ text: `[Tool Result: ${m.name}]\n${m.content || "(No response)"}` });
              } else if (m.content?.trim()) {
                parts.push({ text: m.content.trim() });
              } else if (m.tool_calls) {
                // Tool calls must have content
                parts.push({ text: `(Thinking - executing ${m.tool_calls.length} tools)` });
              } else {
                parts.push({ text: role === 'user' ? '(Input)' : '(Thinking)' });
              }

              if (m.attachments) {
                for (const a of m.attachments) {
                  if (a.type === 'image' && a.url.startsWith('data:')) {
                    const match = a.url.match(/^data:([^;]+);base64,(.+)$/);
                    if (match) parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
                  }
                }
              }

              geminiMessages.push({ role, parts });
              lastRole = role;
            });

            // Ensure starts with 'user'
            if (geminiMessages.length > 0 && geminiMessages[0].role === 'model') {
              geminiMessages.shift();
            }

            body = {
              model: finalModel,
              contents: geminiMessages,
              system_instruction: { parts: [{ text: systemPrompt }] },
              generationConfig,
              // Convert standard tool format to Gemini's function_declarations format
              ...(tools && tools.length > 0 ? {
                tools: [{
                  function_declarations: tools.map(t => ({
                    name: t.function.name,
                    description: t.function.description,
                    parameters: t.function.parameters
                  }))
                }]
              } : {})
            };

          } else {
            // === Standard OpenAI / OpenRouter Format (Gemma 4, Llama 4, etc.) ===

            // Temperature by mode and model
            let temperature = 0.7;
            let top_p = 1.0;
            if (isGemma4 || isLlama4) {
              if (isFastMode) { temperature = 0.5; top_p = 0.9; }
              else if (isThinkingMode) { temperature = 0.7; top_p = 0.95; }
              else { temperature = 0.6; top_p = 0.9; } // auto
            }

            body = {
              model: finalModel,
              messages: [
                { role: 'system', content: systemPrompt },
                ...messages
                  .filter(m => m.role !== 'system') // Filter out any internal system messages to avoid duplicates
                  .filter(m => (m.content && m.content.trim()) || (m.tool_calls && m.tool_calls.length > 0) || m.role === 'user' || m.role === 'tool')
                  .map((m: AIMessage) => {
                    const msgContent = m.content || "";
                    const hasImages = m.attachments && m.attachments.length > 0 && m.attachments.some(a => a.type === 'image');
                    return {
                      role: m.role,
                      content: hasImages
                        ? [
                          { type: 'text', text: msgContent },
                          ...m.attachments!.filter(a => a.type === 'image').map(a => ({
                            type: 'image_url',
                            image_url: { url: a.url }
                          }))
                        ]
                        : msgContent || (m.role === 'assistant' && !m.tool_calls ? "(Process completed)" : msgContent),
                      tool_calls: m.tool_calls || undefined,
                      tool_call_id: m.tool_call_id || undefined,
                      name: m.name || undefined
                    };
                  })
              ],
              tools: (tools && tools.length > 0) ? tools : undefined,
              tool_choice: (tools && tools.length > 0) ? "auto" : undefined,
              stream: true,
              temperature,
              top_p,
              max_tokens: 8192,
              ...(isThinkingMode ? { include_reasoning: true } : {})
            };
          }

          try {
            const response = await fetch(finalUrl, {
              method: 'POST',
              headers: finalHeaders,
              signal: signal,
              body: JSON.stringify(body)
            });

            if (response.status === 401) {
              throw new Error(`Authentication Failed. Please check your ${isGeminiApiModel ? 'Gemini' : isGroqModel ? 'Groq' : 'OpenRouter'} API key in Admin Panel.`);
            }

            if (!response.ok) {
              let msg = `API Error (${response.status})`;
              try {
                const text = await response.text();
                try {
                  const err = JSON.parse(text);
                  if (typeof err.error === 'string') msg = err.error;
                  else msg = err.error?.message || err.message || (Object.keys(err).length > 0 ? JSON.stringify(err) : `API Error ${response.status}`);
                } catch {
                  msg = text || msg;
                }
              } catch {
                console.error("Failed to read error body from " + model);
              }

              // Quota exhausted (429) on a Gemini/AI Studio model — rotate key then model
              const isQuotaError = response.status === 429 || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('exceeded');
              if (isGeminiApiModel && isQuotaError && _retryCount < 10) {
                const st = get();
                const keyPool = st.aiGeminiKeys.length > 0 ? st.aiGeminiKeys : (st.aiGeminiKey ? [st.aiGeminiKey] : []);
                const nextKeyIdx = (st.aiGeminiKeyIndex + 1) % Math.max(keyPool.length, 1);
                const nextModelIdx = (st.geminiModelIndex + 1) % st.geminiQuotaModels.length;
                const preferKeys = st.flowRouterConfig.preferKeyRotation;

                // preferKeyRotation ON: exhaust every available API key before downgrading model
                // preferKeyRotation OFF (original): try next key once, then immediately rotate model
                const hasUntriedKey = keyPool.length > 1 && nextKeyIdx !== st.aiGeminiKeyIndex;
                const allKeysTried = _retryCount >= keyPool.length - 1;

                if (hasUntriedKey && preferKeys) {
                  get().rotateGeminiKey();
                  console.warn(`[Flowr AI] Quota on key ${st.aiGeminiKeyIndex}, rotating to key ${nextKeyIdx} (preferKeyRotation: ${preferKeys})`);
                  return await callModel(model, messages, onChunk, tools, _retryCount + 1);
                } else {
                  get().rotateGeminiModel();
                  console.warn(`[Flowr AI] All keys tried or key rotation off — downgrading model to ${st.geminiQuotaModels[nextModelIdx]}`);
                  const newModel = get().geminiQuotaModels[get().geminiModelIndex];
                  return await callModel(newModel, messages, onChunk, tools, _retryCount + 1);
                }
                return await callModel(model, messages, onChunk, tools, _retryCount + 1);
              }

              // Retry once on transient provider/gateway errors (502, 503, 529)
              const isProviderError = response.status === 502 || response.status === 503 || response.status === 529 ||
                msg.includes('Provider returned error') || msg.includes('overloaded');
              if (isProviderError && _retryCount === 0) {
                console.warn(`Model ${model} got provider error (${response.status}), retrying once...`);
                await new Promise(r => setTimeout(r, 1500));
                return await callModel(model, messages, onChunk, tools, 1);
              }

              if (response.status === 400 && tools && tools.length > 0) {
                console.warn(`Model ${model} rejected tools (400). Retrying without tools...`);
                return await callModel(model, messages, onChunk, [], _retryCount);
              }

              if (response.status === 400 && messages.some(m => m.attachments?.length)) {
                console.warn(`Model ${model} rejected image attachments (400). Retrying without images...`);
                return await callModel(model, messages.map(m => ({ ...m, attachments: [] })), onChunk, tools, _retryCount);
              }

              const error: any = new Error(msg);
              error.status = response.status;
              throw error;
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = "";
            let toolCalls: any[] = [];

            if (!reader) throw new Error("Streaming not supported by browser/provider.");

            let buffer = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;
                const dataStr = trimmed.slice(6);
                if (dataStr === '[DONE]') break;
                try {
                  const json = JSON.parse(dataStr);

                  if (isProxy) {
                    // Google Gemini SSE Format — iterate all parts (thought, text, functionCall)
                    const parts = json.candidates?.[0]?.content?.parts || [];
                    for (const part of parts) {
                      if (part?.thought) {
                        fullContent += `<think>${part.thought}</think>`;
                        if (onChunk) onChunk(fullContent);
                      } else if (part?.text) {
                        fullContent += part.text;
                        if (onChunk) onChunk(fullContent);
                      } else if (part?.functionCall) {
                        toolCalls.push({
                          id: `gemini-fc-${toolCalls.length}`,
                          type: 'function',
                          function: {
                            name: part.functionCall.name,
                            arguments: JSON.stringify(part.functionCall.args ?? {})
                          }
                        });
                      }
                    }
                  } else {
                    // Standard OpenAI / OpenRouter Format
                    const delta = json.choices?.[0]?.delta;
                    if (!delta) continue;

                    // Capture reasoning tokens (OpenRouter returns these as delta.reasoning)
                    if (delta.reasoning) {
                      const reasoning = delta.reasoning;
                      // Wrap reasoning in <think> tags for unified UI handling
                      if (!fullContent.includes('<think>')) {
                        fullContent = `<think>${reasoning}</think>` + fullContent;
                      } else {
                        // Inject into the existing think block
                        fullContent = fullContent.replace(/<\/think>/, `${reasoning}</think>`);
                      }
                      if (onChunk) onChunk(fullContent);
                      continue; // Don't process as content
                    }

                    if (delta.content) {
                      fullContent += delta.content;
                      if (onChunk) onChunk(fullContent);
                    }

                    if (delta.tool_calls) {
                      for (const tc of delta.tool_calls) {
                        if (!toolCalls[tc.index]) {
                          toolCalls[tc.index] = {
                            id: tc.id || `tc-${tc.index}`,
                            type: 'function',
                            function: { name: '', arguments: '' }
                          };
                        }
                        if (tc.id) toolCalls[tc.index].id = tc.id;
                        if (tc.function?.name) toolCalls[tc.index].function.name += tc.function.name;
                        if (tc.function?.arguments) toolCalls[tc.index].function.arguments += tc.function.arguments;
                      }
                    }
                  }
                } catch (e) { }
              }
            }

            // Safety Check: Avoid "model output must contain text" error if content was empty
            if (!fullContent && toolCalls.length === 0) {
              fullContent = "Thinking process completed, but no direct response was provided. Please try a different query or behavior mode.";
              if (onChunk) onChunk(fullContent);
            }

            // --- Textual Tool Call Extraction fallback ---
            // If the model output textual tool calls like !function_call:add_note{...} into content, 
            // extract them so they can be executed by the loop.
            if (fullContent && (!toolCalls || toolCalls.length === 0)) {
              const textualCalls = extractTextualToolCalls(fullContent);
              if (textualCalls.length > 0) {
                toolCalls = textualCalls;
              }
            }

            return { choices: [{ message: { role: 'assistant', content: fullContent, tool_calls: toolCalls.filter(Boolean) } }] };
          } finally {
            clearTimeout(timeoutId);
          }
        };


        // 6. Execution Loop: processMessage
        const processMessage = async () => {
          const state = get();
          const isLocal = state.aiRuntime === 'local';
          const primaryModel = state.aiModel || "flowr/flow-1.0";

          // 1. Determine the actual primary model or routing strategy
          let modelsToTry: { id: string; type: 'local' | 'hybrid' | 'manual' | 'vision-fallback' }[] = [];

          if (isLocal) {
            modelsToTry = [{ id: state.localModel || 'local', type: 'local' }];
          } else {
            // Cloud logic - Build a sequence of models to try
            if (primaryModel === 'flowr/flow-1.0') {
              if (state.aiFlowrMode === 'auto') {
                // Flowr Router Auto: classify intent and try ALL models in that category, then fallbacks
                const category = await classifyIntent(content);
                const config = state.flowRouterConfig.categories.find(c => c.key === category);
                const categoryModels = config ? config.models : [];

                // Tier 1: Category Models
                modelsToTry = categoryModels.filter(m => m.enabled).map(m => ({ id: m.id, type: 'hybrid' as const }));

                // Tier 2: Priority Fallbacks (exclude already added)
                const addedIds = modelsToTry.map(m => m.id);
                const fallbacks = state.priorityModels
                  .filter(m => !addedIds.includes(m.id) && (m.status === 'free' || m.status === 'checking'))
                  .slice(0, 3);
                modelsToTry.push(...fallbacks.map(m => ({ id: m.id, type: 'hybrid' as const })));
              } else {
                // Flowr Router Manual: use the specific model plus general fallbacks
                modelsToTry = [
                  { id: state.aiFlowrManualId, type: 'manual' },
                  ...state.priorityModels
                    .filter(m => m.id !== state.aiFlowrManualId && (m.status === 'free' || m.status === 'checking'))
                    .slice(0, 2)
                    .map(m => ({ id: m.id, type: 'hybrid' as const }))
                ];
              }
            } else if (primaryModel === 'flowr/gemma4-hybrid') {
              // Gemma 4: Try 31B first, then 26B, then general priority
              modelsToTry = [
                { id: 'google/gemma-4-31b-it:free', type: 'hybrid' },
                { id: 'google/gemma-4-26b-a4b-it:free', type: 'hybrid' },
                ...state.priorityModels
                  .filter(m => !m.id.includes('gemma') && (m.status === 'free' || m.status === 'checking'))
                  .slice(0, 2)
                  .map(m => ({ id: m.id, type: 'hybrid' as const }))
              ];
            } else if (primaryModel === 'flowr/hybrid-free') {
              // Priority Pool: try the top 3 available models
              const pool = state.priorityModels.filter(m => m.status === 'free' || m.status === 'checking');
              modelsToTry = pool.slice(0, 3).map(m => ({ id: m.id, type: 'hybrid' as const }));
            } else {
              // Manual Selection: try the chosen one, then fallback to Flowr Router if it fails
              modelsToTry = [
                { id: primaryModel, type: 'manual' },
                ...state.priorityModels
                  .filter(m => m.id !== primaryModel && (m.status === 'free' || m.status === 'checking'))
                  .slice(0, 2)
                  .map(m => ({ id: m.id, type: 'hybrid' as const }))
              ];
            }
          }

          const hasImages = currentHistory.some(m => m.attachments && m.attachments.length > 0);

          // Add vision fallback if needed and not already present
          if (hasImages && !isLocal && !modelsToTry.some(m => m.id.includes('flash'))) {
            modelsToTry.unshift({ id: 'gemini-2.0-flash', type: 'vision-fallback' });
          }

          let lastError = null;
          const activeTierId = generateId();
          let successfulModel = "";
          const startTime = Date.now();

          const setPlaceholder = (tierId: string) => {
            set((s) => {
              const msgs = [...s.aiMessages];
              const idx = msgs.findIndex(m => m.id === activeTierId);
              if (idx !== -1) return { aiMessages: msgs };
              return { aiMessages: [...msgs, { id: activeTierId, role: 'assistant', content: '', timestamp: Date.now() }] };
            });
          };

          const TOOL_TRUNCATE_REGEX = /(add_note|add_folder|add_canvas|update_note_content|append_note_content|generate_image|web_search|delete_entity|rename_entity|add_task|delete_task|complete_task|update_task|move_entity|navigate_to|read_note|sort_entities)\s*\{[\s\S]*$/;
          const THINK_BLOCK_REGEX = /<think>[\s\S]*?<\/think>/g;
          const PARTIAL_THINK_REGEX = /<think>[\s\S]*$/;

          const maskChunk = (chunk: string): string => {
            let display = chunk.replace(THINK_BLOCK_REGEX, '').replace(PARTIAL_THINK_REGEX, '');
            if (display.includes('!function_call:')) {
              display = display.replace(/!function_call:[\s\S]*$/, '_Preparing tool..._');
            }
            if (TOOL_TRUNCATE_REGEX.test(display)) {
              display = display.replace(TOOL_TRUNCATE_REGEX, '_Preparing tool..._');
            }
            return display;
          };

          let data: any = null;
          for (const tier of modelsToTry) {
            try {
              setPlaceholder(tier.id);
              let firstChunkReceived = false;
              let lastUpdate = 0;
              data = await callModel(tier.id, currentHistory, async (chunk) => {
                const now = Date.now();
                const thinkMatch = chunk.match(/<think>([\s\S]*?)<\/think>/);
                const partialThinkMatch = !thinkMatch ? chunk.match(/<think>([\s\S]*)$/) : null;
                const liveThought = thinkMatch ? thinkMatch[1] : (partialThinkMatch ? partialThinkMatch[1] : undefined);

                // Premium touch: Ensure minimum thinking phase duration (satisfying feel)
                // If it's the first bit of data arriving too quickly, hold it for a moment.
                if (!firstChunkReceived) {
                  const elapsed = Date.now() - startTime;
                  if (elapsed < 1000) {
                    await new Promise(r => setTimeout(r, 1000 - elapsed));
                  }
                  firstChunkReceived = true;
                }

                // Throttle updates to ~60ms to prevent UI lag while maintaining smooth feel
                if (now - lastUpdate > 60 || chunk.length < 5) {
                  set((s) => {
                    const msgs = [...s.aiMessages];
                    const idx = msgs.findIndex(m => m.id === activeTierId);
                    if (idx !== -1) msgs[idx] = { ...msgs[idx], content: maskChunk(chunk), thought: liveThought };
                    return { aiMessages: msgs };
                  });
                  lastUpdate = now;
                }
              });

              successfulModel = tier.id;
              break;
            } catch (err: any) {
              if (err.name === 'AbortError') break;
              lastError = err;
              const isPriorityModel = get().priorityModels.some(m => m.id === tier.id);
              if (get().aiRoutingMode === 'hybrid' || isPriorityModel) {
                const isPaidError = err.status === 402 || err.message?.includes('credit') || err.message?.includes('pay');
                const isTemporaryError = err.status >= 500 || err.status === 429 || err.message?.includes('Provider returned error');
                if (!isTemporaryError) {
                  get().updateModelStatus(tier.id, isPaidError ? 'paid' : 'offline');
                }
              }
              const nextTier = modelsToTry[modelsToTry.indexOf(tier) + 1];
              if (nextTier && !isLocal) {
                const modelLabel = typeof nextTier.id === 'string'
                  ? nextTier.id.split('/').pop()?.replace(':free', '')
                  : 'next model';
                set({ aiCursor: { type: `retrying with ${modelLabel}` } });
              }
            }
          }

          const actualModel = data?._resolvedModel || successfulModel;
          const resolvedModel = data?._resolvedModel
            ? `${successfulModel} → ${data._resolvedModel}`
            : successfulModel || (modelsToTry.length > 0 ? modelsToTry[0].id : "unknown");

          const logId = actualModel || "unknown";
          const allKnownModels = [
            ...state.aiCloudModels,
            ...state.flowRouterConfig.categories.flatMap(cat => cat.models)
          ];
          const logLabel = allKnownModels.find(m => m.id === logId)?.label;

          const successfulProvider =
            logId.toLowerCase().includes('google') || logId.toLowerCase().includes('gemini') ? 'google' :
              logId.toLowerCase().includes('groq') ? 'groq' :
                logId.includes('/') ? 'openrouter' : 'local';

          get().logAIRequest({
            id: generateId(),
            model: resolvedModel,
            modelId: logId,
            modelLabel: logLabel,
            category: state.aiBehaviorMode || "general",
            status: successfulModel ? ('success' as const) : ('error' as const),
            duration: Date.now() - startTime,
            provider: successfulProvider
          });

          if (!data) throw lastError || new Error("All AI tiers failed to respond.");
          const messageContent = data.choices?.[0]?.message;
          if (!messageContent) {
            console.error('[Flowr AI] No message content in response. Full data:', JSON.stringify(data).substring(0, 500));
            currentHistory.push({ id: activeTierId, role: 'assistant', content: 'I received an empty response. Please try again.', timestamp: Date.now() });
            set({ aiMessages: [...currentHistory], isAILoading: false, aiCursor: null });
            return;
          }

          const successfulModelIsGemini =
            actualModel.toLowerCase().includes('gemma-4-31b-it') ||
            actualModel.toLowerCase().includes('gemma-4-26b-a4b-it') ||
            (actualModel.includes('gemini') && !actualModel.includes('openrouter'));

          const rawContent = messageContent.content || "";
          const thoughtMatch = rawContent.match(/<think>([\s\S]*?)<\/think>/);
          const extractedThought = thoughtMatch ? thoughtMatch[1].trim() : undefined;
          let cleanedContent = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

          // 1. Extract tool calls from the proper tool_calls field
          const finalToolCalls = messageContent.tool_calls || [];
          const TOOL_STRIP_REGEX = /(?:!function_call:)?([a-z_]+)\s*(\{[\s\S]*?\})/g;
          const knownTools = ["add_note", "add_folder", "add_canvas", "update_note_content", "append_note_content", "generate_image", "web_search", "delete_entity", "rename_entity", "add_task", "delete_task", "complete_task", "update_task", "move_entity", "navigate_to", "read_note", "sort_entities"];

          // 2. Textual Tool Detection (Catch Hallucinations)
          // Look for: { "prompt": "...", ... } OR generate_image({ ... })
          const JSON_TOOL_REGEX = /([a-z_]+)\s*(\{\s*"[\s\S]*?\})\s*/gi;
          let match;
          while ((match = JSON_TOOL_REGEX.exec(cleanedContent)) !== null) {
            const [fullMatch, name, argsStr] = match;
            if (knownTools.includes(name.toLowerCase())) {
              try {
                // Verify it's valid JSON before adding
                JSON.parse(argsStr);
                finalToolCalls.push({
                  id: `hallucinated-${Date.now()}-${Math.random()}`,
                  type: 'function',
                  function: { name: name.toLowerCase(), arguments: argsStr }
                });
              } catch { }
            }
          }

          // CRITICAL: Strip any textual tool calls or raw JSON blocks from final chat content
          cleanedContent = cleanedContent.replace(TOOL_STRIP_REGEX, (match: string, name: string) => {
            if (knownTools.includes(name)) return "";
            return match;
          }).trim();
          // Also strip any standalone JSON blocks that were caught
          cleanedContent = cleanedContent.replace(/\{\s*"prompt":[\s\S]*?\}\s*/g, "").trim();


          if (!cleanedContent && !messageContent.tool_calls) cleanedContent = "Thinking process completed.";

          currentHistory.push({ ...messageContent, content: cleanedContent, thought: extractedThought, id: activeTierId, timestamp: Date.now() });

          // (finalToolCalls already declared above and populated with hallucinations)
          const geminiToolCallParts = finalToolCalls.map((tc: any) => ({
            functionCall: {
              name: tc.function?.name,
              args: (() => { try { return robustParseJSON(tc.function?.arguments || '{}'); } catch { return {}; } })()
            }
          }));
          const geminiToolResults: Array<{ functionResponse: { name: string; response: { content: string } } }> = [];

          if (finalToolCalls.length > 0) {
            set({ aiCursor: { type: 'executing' } });
            for (const tc of finalToolCalls) {
              const name = tc.function?.name;
              let args: any = {};
              try {
                args = robustParseJSON(tc.function?.arguments || '{}');
              } catch (parseErr) {
                console.error('[Flowr AI] Failed to parse tool call arguments:', parseErr, '\nRaw:', tc.function?.arguments?.substring(0, 500));
              }

              let result;
              try {
                if (name === 'add_note') {
                  const id = generateId();
                  const noteContent = args.content || '';

                  // Content quality gate: detect placeholder/template content
                  const contentCheck = validateNoteContent(noteContent);
                  if (!contentCheck.valid) {
                    console.warn('[Flowr AI] REJECTED empty template content:', contentCheck.reason);
                    result = { success: false, error: `CONTENT REJECTED: ${contentCheck.reason}. You MUST write actual, detailed text content — real sentences and paragraphs about the topic. Do NOT use placeholder words like "Title", "Heading", "List item". Try again with REAL content.` };
                  } else {
                    const blocks = markdownToBlocks(noteContent);
                    get().addEntity({ id, title: args.title || 'New Note', type: 'note', content: blocks, parentId: args.parentId || null, lastModified: Date.now() });
                    result = { success: true, id, title: args.title };
                  }
                } else if (name === 'update_note_content') {
                  const noteContent = args.content || '';
                  const contentCheck = validateNoteContent(noteContent);
                  if (!contentCheck.valid) {
                    result = { success: false, error: `CONTENT REJECTED: ${contentCheck.reason}. Write REAL content, not placeholders.` };
                  } else {
                    const blocks = markdownToBlocks(noteContent);
                    get().updateEntityContent(args.id, blocks);
                    result = { success: true, id: args.id };
                  }
                } else if (name === 'append_note_content') {
                  const entity = get().entities.find(e => e.id === args.id);
                  if (entity) {
                    const oldMarkdown = blocksToMarkdown(entity.content || []);
                    const newBlocks = markdownToBlocks(oldMarkdown + '\n' + (args.content || ''));
                    get().updateEntityContent(args.id, newBlocks);
                    result = { success: true, id: args.id };
                  } else { throw new Error("Note not found."); }
                } else if (name === 'add_folder') {
                  const id = generateId();
                  get().addEntity({ id, title: args.title || 'New Folder', type: 'folder', parentId: args.parentId || null, lastModified: Date.now() });
                  result = { success: true, id };
                } else if (name === 'add_canvas') {
                  const id = generateId();
                  get().addEntity({ id, title: args.title || 'New Canvas', type: 'canvas', parentId: args.parentId || null, lastModified: Date.now() });
                  result = { success: true, id };
                } else if (name === 'delete_entity') {
                  get().deleteEntity(args.id);
                  result = { success: true, id: args.id };
                } else if (name === 'rename_entity') {
                  get().renameEntity(args.id, args.title);
                  result = { success: true, id: args.id };
                } else if (name === 'add_task') {
                  const id = generateId();
                  get().addTask({ id, title: args.title, difficulty: Number(args.difficulty) || 1, dueDate: args.dueDate, completed: false, createdAt: Date.now() });
                  result = { success: true, id };
                } else if (name === 'sort_entities') {
                  if (args.target === 'notes') get().sortEntities(args.criteria);
                  else get().sortTasks(args.criteria);
                  result = { success: true };
                } else if (name === 'generate_image') {
                  set({ aiCursor: { type: 'generating_image' } });
                  const prompt = args.prompt;

                  // 1. Determine target image model from Router Config
                  const imgCategory = get().flowRouterConfig.categories.find(c => c.key === 'image_generation');
                  const enabledImgModels = (imgCategory?.models || []).filter(m => m.enabled);
                  const targetImgModel = enabledImgModels[0]?.id || 'imagen-4-fast-generate';

                  try {
                    // 2. Prepare a message targeting the image model
                    // Proxy handles prompt extraction from the last message parts text
                    const imgMessages: AIMessage[] = [{ role: 'user', content: prompt }];

                    // 3. Call model (Proxy converts this to :predict for imagen-* models)
                    // We use the same SSE stream handler as regular chat
                    const lastMsg = currentHistory[currentHistory.length - 1];
                    if (lastMsg) lastMsg.content = (lastMsg.content || "").replace(/_Preparing tool\.\.\._/, "").trim();

                    let markdownAppend = "";
                    await callModel(targetImgModel, imgMessages, (chunk) => {
                      // The proxy for Imagen returns a stream containing "![...](data:...)"
                      // We just need to capture it and update the UI
                      markdownAppend = chunk;
                      if (lastMsg && lastMsg.role === 'assistant') {
                        lastMsg.content = (lastMsg.content || "").split('\n\n!')[0] + chunk;
                        set({ aiMessages: [...currentHistory] });
                      }
                    });

                    if (!lastMsg || lastMsg.role !== 'assistant') {
                      currentHistory.push({ id: generateId(), role: 'assistant', content: markdownAppend, timestamp: Date.now() });
                      set({ aiMessages: [...currentHistory] });
                    }
                  } catch (err: any) {
                    console.error("[Flowr AI] Native image generation failed:", err);
                    const errorMsg = `\n\n_Failed to generate image: ${err.message}_`;
                    const lastMsg = currentHistory[currentHistory.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant') {
                      lastMsg.content += errorMsg;
                    } else {
                      currentHistory.push({ id: generateId(), role: 'assistant', content: errorMsg, timestamp: Date.now() });
                    }
                    set({ aiMessages: [...currentHistory] });
                  }

                  set({ isAILoading: false, aiCursor: null });
                  return;
                } else if (name === 'web_search') {
                  set({ aiCursor: { type: 'searching' } });
                  // Fetch real results from DuckDuckGo
                  let searchContext = `Search query: "${args.query}"\n\nNo results found.`;
                  try {
                    const searchResp = await fetch(`/api/search?q=${encodeURIComponent(args.query)}`);
                    const searchData = await searchResp.json();
                    if (searchData.results?.length) {
                      searchContext = `Search query: "${args.query}"\n\nResults:\n` +
                        searchData.results.map((r: any, i: number) => `${i + 1}. ${r.title}\n   ${r.snippet}${r.url ? `\n   ${r.url}` : ''}`).join('\n\n');
                    }
                  } catch { }
                  // Summarize with Gemma 4 via Google proxy
                  const searchRes = await callModel('google/gemma-4-31b-it:free', [
                    { role: 'user', content: `Based on these search results, answer concisely:\n\n${searchContext}` }
                  ]);
                  result = { success: true, summary: searchRes.choices[0].message.content };
                } else if (name === 'delete_task') {
                  get().deleteTask(args.id);
                  result = { success: true, id: args.id };
                } else if (name === 'complete_task') {
                  const task = get().tasks.find(t => t.id === args.id);
                  if (task) {
                    if (task.completed !== args.completed) get().toggleTask(args.id);
                    result = { success: true, id: args.id, completed: args.completed };
                  } else { result = { success: false, error: `Task not found: ${args.id}` }; }
                } else if (name === 'update_task') {
                  const updates: any = {};
                  if (args.title !== undefined) updates.title = args.title;
                  if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
                  if (args.difficulty !== undefined) updates.difficulty = Number(args.difficulty);
                  get().updateTask(args.id, updates);
                  result = { success: true, id: args.id };
                } else if (name === 'move_entity') {
                  get().moveEntity(args.id, args.parentId ?? null);
                  result = { success: true, id: args.id, parentId: args.parentId ?? null };
                } else if (name === 'navigate_to') {
                  const entity = get().entities.find(e => e.id === args.id);
                  if (entity) {
                    get().setActiveEntityId(args.id);
                    result = { success: true, title: entity.title, type: entity.type };
                  } else { result = { success: false, error: `No entity found with id: ${args.id}` }; }
                } else if (name === 'read_note') {
                  const entity = get().entities.find(e => e.id === args.id);
                  if (entity) {
                    const text = blocksToMarkdown(entity.content || []);
                    result = { success: true, id: entity.id, title: entity.title, content: text };
                  } else { result = { success: false, error: `No entity found with id: ${args.id}` }; }
                }
              } catch (err) { console.error('[Flowr AI] Tool execution error for', name, ':', err); result = { success: false, error: String(err) }; }

              geminiToolResults.push({
                functionResponse: {
                  name: tc.function?.name,
                  response: { content: JSON.stringify(result) }
                }
              });
              currentHistory.push({ id: `tool-${Date.now()}`, role: "tool", tool_call_id: tc.id, name: tc.function?.name, content: JSON.stringify(result), timestamp: Date.now() });
            }
            // Gemini agent loop: send functionResponse back so model can write a final answer
            // Check if any tool was rejected — if so, allow tools in follow-up for retry
            const hasRejection = geminiToolResults.some((r: any) => {
              try { const c = robustParseJSON(r.functionResponse.response.content); return c.success === false && c.error?.includes('CONTENT REJECTED'); } catch { return false; }
            });

            if (successfulModelIsGemini && finalToolCalls.length > 0) {
              const historyForGemini = currentHistory.filter(m => m.role !== 'tool');
              const geminiContents: any[] = historyForGemini.map(m => {
                if (m.role === 'assistant') {
                  if (m.id === activeTierId && geminiToolCallParts.length > 0) {
                    return { role: 'model', parts: geminiToolCallParts };
                  }
                  const parts: any[] = [];
                  if (m.content?.trim()) parts.push({ text: m.content.trim() });
                  return { role: 'model', parts: parts.length ? parts : [{ text: '' }] };
                }
                const parts: any[] = [];
                if (m.content?.trim()) parts.push({ text: m.content.trim() });
                if (m.attachments) {
                  for (const a of m.attachments) {
                    if (a.type === 'image' && a.url.startsWith('data:')) {
                      const match = a.url.match(/^data:([^;]+);base64,(.+)$/);
                      if (match) parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
                    }
                  }
                }
                return { role: 'user', parts: parts.length ? parts : [{ text: '' }] };
              });
              geminiContents.push({ role: 'user', parts: geminiToolResults });

              const bMode = get().aiBehaviorMode;
              const genCfg: any = {
                temperature: bMode === 'thinking' ? 1.0 : 0.7,
                topP: 0.95
              };
              if (bMode === 'thinking') {
                genCfg.thinking_config = { thinking_level: 'HIGH' };
              }

              set({ aiCursor: { type: hasRejection ? 'retrying with better content' : 'writing' } });

              // When content was rejected, inject a strong nudge into the system prompt so the
              // retry actually writes real prose instead of another skeleton.
              const retryNudge = hasRejection
                ? `\n\nRETRY REQUIRED — CONTENT WAS REJECTED FOR BEING PLACEHOLDER-ONLY.\nYour previous tool call was refused because the content field contained only structural skeleton text (e.g. "Heading", "List item...", "Body text") with no real sentences.\nThis time you MUST write actual prose: full paragraphs, real sentences, concrete information relevant to the user's request. Every heading must be followed by at least two sentences of real text. No placeholder words allowed. Write as if you are a knowledgeable author — not as if you are filling in a template.`
                : '';
              const followUpSystemPrompt = systemPrompt + retryNudge;

              try {
                const followUp = await fetch('/api/gemini', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    model: actualModel,
                    contents: geminiContents,
                    system_instruction: { parts: [{ text: followUpSystemPrompt }] },
                    generationConfig: genCfg,
                    // Pass tools ONLY when content was rejected so model can retry
                    ...(hasRejection && tools && tools.length > 0 ? { tools } : {})
                  })
                });
                if (!followUp.ok) throw new Error(await followUp.text());

                const fuReader = followUp.body?.getReader();
                const fuDecoder = new TextDecoder();
                let fuContent = "";
                let fuBuffer = "";
                const fuToolCalls: any[] = [];
                const fuId = generateId();

                set((s) => ({ aiMessages: [...s.aiMessages, { id: fuId, role: 'assistant', content: '', timestamp: Date.now() }] }));

                if (fuReader) {
                  while (true) {
                    const { done, value } = await fuReader.read();
                    if (done) break;
                    fuBuffer += fuDecoder.decode(value, { stream: true });
                    const lines = fuBuffer.split('\n');
                    fuBuffer = lines.pop() || '';
                    for (const line of lines) {
                      const trimmed = line.trim();
                      if (!trimmed || !trimmed.startsWith('data: ')) continue;
                      const dataStr = trimmed.slice(6);
                      if (dataStr === '[DONE]') break;
                      try {
                        const json = JSON.parse(dataStr);
                        for (const part of json.candidates?.[0]?.content?.parts || []) {
                          if (part?.thought) fuContent += `<think>${part.thought}</think>`;
                          else if (part?.text) fuContent += part.text;
                          else if (part?.functionCall) {
                            fuToolCalls.push(part.functionCall);
                          }
                        }
                        set((s) => {
                          const msgs = [...s.aiMessages];
                          const idx = msgs.findIndex(m => m.id === fuId);
                          if (idx !== -1) msgs[idx] = { ...msgs[idx], content: fuToolCalls.length > 0 ? '_Executing retry..._' : maskChunk(fuContent) };
                          return { aiMessages: msgs };
                        });
                      } catch { }
                    }
                  }
                }

                // If follow-up returned tool calls (retry), execute them
                let retryRejected = false;
                if (fuToolCalls.length > 0) {
                  for (const retryTc of fuToolCalls) {
                    const retryArgs = retryTc.args || {};
                    const retryName = retryTc.name;
                    try {
                      if (retryName === 'add_note') {
                        const retryContent = retryArgs.content || '';
                        const check = validateNoteContent(retryContent);
                        if (check.valid) {
                          const noteId = generateId();
                          const blocks = markdownToBlocks(retryContent);
                          get().addEntity({ id: noteId, title: retryArgs.title || 'New Note', type: 'note', content: blocks, parentId: retryArgs.parentId || null, lastModified: Date.now() });
                          set((s) => {
                            const msgs = [...s.aiMessages];
                            const idx = msgs.findIndex(m => m.id === fuId);
                            if (idx !== -1) msgs[idx] = { ...msgs[idx], content: `Done — saved to "${retryArgs.title || 'new note'}".` };
                            return { aiMessages: msgs, isAILoading: false, aiCursor: null };
                          });
                          return;
                        } else {
                          retryRejected = true;
                          console.warn('[Flowr AI] Retry also produced placeholder content:', check.reason);
                        }
                      } else if (retryName === 'update_note_content') {
                        const retryContent = retryArgs.content || '';
                        const check = validateNoteContent(retryContent);
                        if (check.valid) {
                          const blocks = markdownToBlocks(retryContent);
                          get().updateEntityContent(retryArgs.id, blocks);
                          set((s) => {
                            const msgs = [...s.aiMessages];
                            const idx = msgs.findIndex(m => m.id === fuId);
                            if (idx !== -1) msgs[idx] = { ...msgs[idx], content: 'Done — note updated.' };
                            return { aiMessages: msgs, isAILoading: false, aiCursor: null };
                          });
                          return;
                        } else {
                          retryRejected = true;
                        }
                      }
                    } catch (retryErr) {
                      console.error('[Flowr AI] Retry tool execution failed:', retryErr);
                    }
                  }
                }

                // Determine whether the ORIGINAL tool calls succeeded — if not, we must not
                // claim "Done — saved" in the final message.
                const firstRoundSucceeded = geminiToolResults.some((r: any) => {
                  try { return robustParseJSON(r.functionResponse.response.content).success === true; } catch { return false; }
                });
                const firstRoundHadContentRejection = hasRejection;

                const fuThoughtMatch = fuContent.match(/<think>([\s\S]*?)<\/think>/);
                const fuThought = fuThoughtMatch ? fuThoughtMatch[1].trim() : undefined;
                let fuClean = fuContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

                // If the AI attempted a write tool but every attempt (first call + any retry)
                // was rejected for placeholder content, surface an HONEST error instead of
                // falsely claiming success.
                const triedWriteTool = finalToolCalls.some((tc: any) =>
                  ['add_note', 'update_note_content', 'append_note_content'].includes(tc.function?.name)
                );
                if (triedWriteTool && !firstRoundSucceeded && (firstRoundHadContentRejection || retryRejected)) {
                  fuClean = "I couldn't create that note — the content I drafted didn't contain any real text (only headings and placeholders). Try asking me again with a clearer prompt, and I'll write the full body.";
                } else if (!fuClean) {
                  // If follow-up is empty (model only thought), provide a confirmation
                  // ONLY when the first-round tool actually succeeded.
                  const toolName = finalToolCalls[0]?.function?.name;
                  const toolArgs = (() => { try { return robustParseJSON(finalToolCalls[0]?.function?.arguments || '{}'); } catch { return {}; } })();
                  if (firstRoundSucceeded && toolName === 'add_note') fuClean = `Done — saved to "${toolArgs.title || 'new note'}".`;
                  else if (firstRoundSucceeded && toolName === 'update_note_content') fuClean = 'Done — note updated.';
                  else if (firstRoundSucceeded) fuClean = 'Done.';
                  else fuClean = 'The request completed but no note was written. Try rephrasing your request.';
                }
                // Update the fuId message in-place rather than clobbering from currentHistory
                set((s) => {
                  const msgs = [...s.aiMessages];
                  const idx = msgs.findIndex(m => m.id === fuId);
                  if (idx !== -1) {
                    msgs[idx] = { ...msgs[idx], content: fuClean, thought: fuThought };
                  } else {
                    msgs.push({ id: fuId, role: 'assistant', content: fuClean, thought: fuThought, timestamp: Date.now() });
                  }
                  return { aiMessages: msgs, isAILoading: false, aiCursor: null };
                });
                return;
              } catch (err) {
                console.error('Gemini follow-up failed:', err);
                // fall through — tool was still executed locally
              }
            }

            const wroteContentTool = finalToolCalls.some((tc: any) => ['add_note', 'update_note_content', 'append_note_content'].includes(tc.function?.name));
            if (wroteContentTool) {
              // Only claim success if at least one write tool actually succeeded.
              const writeToolSucceeded = geminiToolResults.some((r: any) => {
                try { return robustParseJSON(r.functionResponse.response.content).success === true; } catch { return false; }
              });
              set((s) => {
                const msgs = [...s.aiMessages];
                const lastAssistant = [...msgs].reverse().find(m => m.role === 'assistant');
                if (lastAssistant) {
                  const idx = msgs.lastIndexOf(lastAssistant);
                  const args = (() => { try { return robustParseJSON(finalToolCalls[0]?.function?.arguments || '{}'); } catch { return {}; } })();
                  const label = writeToolSucceeded
                    ? (finalToolCalls[0]?.function?.name === 'add_note' ? `Done — saved to "${args.title || 'new note'}".` : `Done — note updated.`)
                    : "I couldn't create that note — the content I drafted didn't contain any real text (only headings and placeholders). Try asking me again with a clearer prompt, and I'll write the full body.";
                  msgs[idx] = { ...lastAssistant, content: label };
                  return { aiMessages: msgs, isAILoading: false, aiCursor: null };
                }
                return { isAILoading: false, aiCursor: null };
              });
              return;
            }
          }

          set({ aiMessages: [...currentHistory], isAILoading: false });
          setTimeout(() => { if (!get().isAILoading) set({ aiCursor: null }); }, 1500);
        };

        // 7. Execution (Safe Wrapper)
        const runExecution = async (retryDepth = 0) => {
          try {
            await processMessage();
          } catch (error: any) {
            console.error(`[Flowr AI] processMessage threw (depth ${retryDepth}):`, error);
            let rawMsg: string = error?.message || (typeof error === 'string' ? error : JSON.stringify(error)) || "Unknown Error";

            // Unwrap JSON error objects
            try {
              const parsed = JSON.parse(rawMsg);
              if (parsed?.error) rawMsg = typeof parsed.error === 'string' ? parsed.error : (parsed.error?.message || JSON.stringify(parsed.error));
              else if (parsed?.message) rawMsg = parsed.message;
            } catch { /* use as-is */ }

            const lc = rawMsg.toLowerCase();
            const isRetryable = lc.includes('high demand') || lc.includes('overloaded') || lc.includes('capacity') ||
              lc.includes('quota') || lc.includes('rate limit') || lc.includes('exceeded');

            if (isRetryable && retryDepth < 2) {
              const st = get();
              let nextModel = "flowr/flow-1.0";

              // Find next in cloud list
              const currentModel = st.aiModel;
              const cloudList = st.aiCloudModels;
              const currentIdx = cloudList.findIndex(m => m.id === currentModel);

              if (currentIdx !== -1 && currentIdx < cloudList.length - 1) {
                nextModel = cloudList[currentIdx + 1].id;
              } else if (currentModel === "flowr/flow-1.0") {
                // Smart Router failed, fallback to a reliable priority model
                nextModel = (st.priorityModels.find(m => m.status === 'free' && m.id !== currentModel)?.id) || "flowr/gemma4-hybrid";
              }

              if (nextModel !== currentModel) {
                console.warn(`[Flowr AI] Overload/Quota on ${currentModel}. Auto-switching to ${nextModel} and retrying...`);
                set({ aiModel: nextModel, aiCursor: { type: `failed — switching to ${nextModel.split('/').pop()?.replace(':free', '')}` } });
                await new Promise(r => setTimeout(r, 1200));
                return runExecution(retryDepth + 1);
              }
            }

            // Normal Error Handling
            let friendlyMsg = rawMsg;
            if (lc.includes('api key not found') || lc.includes('invalid api key') || lc.includes('authentication') || lc.includes('unauthorized')) {
              friendlyMsg = 'API key invalid or missing. Please check your key in Settings → Security.';
            } else if (lc.includes('high demand') || lc.includes('overloaded') || lc.includes('capacity')) {
              friendlyMsg = 'Maximum capacity reached. Try again in a moment or switch models.';
            } else if (lc.includes('quota') || lc.includes('rate limit') || lc.includes('exceeded')) {
              friendlyMsg = 'Rate limit or quota exceeded. The AI will try again shortly.';
            } else if (lc.includes('credit') || lc.includes('billing') || lc.includes('payment')) {
              friendlyMsg = 'Insufficient credits. Please top up your OpenRouter balance.';
            } else if (lc.includes('all ai tiers failed')) {
              friendlyMsg = 'All available models failed to respond. Check your API keys or try again.';
            }

            set((s) => ({
              aiMessages: [...s.aiMessages, { id: `err-${Date.now()}`, role: 'assistant', content: `Error: ${friendlyMsg}`, timestamp: Date.now() }],
              isAILoading: false,
              aiCursor: null
            }));
          }
        };

        try {
          await runExecution();
        } finally {
          set({ aiAbortController: null, isAILoading: false });
        }
      },

      setActiveEntityId: (id) => {
        const state = get();
        if (id === state.activeEntityId && state.navigationHistory[state.historyIndex] === id) return;

        // Tab management: Replace current tab ID with new ID instead of opening new tab
        const currentActiveId = state.activeTabId || state.activeEntityId || 'dashboard';
        const tabIndex = state.openTabIds.indexOf(currentActiveId);

        // Update Recent Entities (exclude dashboard)
        let nextRecent = [...state.recentEntityIds];
        if (id && id !== 'dashboard') {
          nextRecent = [id, ...nextRecent.filter(rid => rid !== id)].slice(0, 8);
        }

        let nextTabs = [...state.openTabIds];
        if (id) {
          if (tabIndex !== -1) {
            // Check if the new ID is already open in ANOTHER tab to avoid duplicates
            const existingIndex = nextTabs.indexOf(id);
            if (existingIndex !== -1 && existingIndex !== tabIndex) {
              // If it exists elsewhere, we could either jump to it or replace it.
              // User said "dont open new tabs", and "change the tab path".
              // Let's just jump to it if it exists, or replace current if it doesn't.
              set({ activeTabId: id, activeEntityId: id, recentEntityIds: nextRecent });
            } else {
              nextTabs[tabIndex] = id;
              set({ openTabIds: nextTabs, recentEntityIds: nextRecent });
            }
          } else {
            // No active tab found? (Shouldn't happen with the new flow)
            if (!nextTabs.includes(id)) nextTabs.push(id);
            set({ openTabIds: nextTabs, recentEntityIds: nextRecent });
          }
        } else {
          set({ recentEntityIds: nextRecent });
        }

        const newHistory = state.navigationHistory.slice(0, state.historyIndex + 1);
        if (id) newHistory.push(id);
        set({
          activeEntityId: id,
          activeTabId: id,
          navigationHistory: newHistory,
          historyIndex: newHistory.length - 1
        });
      },

      addTab: (id = 'dashboard') => {
        const state = get();
        if (!id) return;
        set({
          openTabIds: [...state.openTabIds, id],
          activeTabId: id,
          activeEntityId: id
        });
      },

      removeTab: (id) => set((s) => {
        const nextTabs = s.openTabIds.filter(tid => tid !== id);
        let nextActive = s.activeTabId;
        if (s.activeTabId === id) {
          nextActive = nextTabs[nextTabs.length - 1] || 'dashboard';
        }
        return {
          openTabIds: nextTabs,
          activeTabId: nextActive,
          activeEntityId: nextActive
        };
      }),

      setActiveTab: (id) => set({ activeTabId: id, activeEntityId: id }),
      setOpenTabs: (ids) => set({ openTabIds: ids }),

      setNavigationState: (id, history, index) => set({ activeEntityId: id, navigationHistory: history, historyIndex: index }),

      goBack: () => { if (get().historyIndex > 0) window.history.back(); },
      goForward: () => { if (get().historyIndex < get().navigationHistory.length - 1) window.history.forward(); },

      addEntity: (entity) => {
        // Content quality gate for AI-generated notes
        if (entity.type === 'note' && entity.content && entity.content.length > 0) {
          const allBlockTexts = entity.content.map((b: any) => (b.content || '').trim().toLowerCase());
          const blockTexts = allBlockTexts.filter((t: string) => t.length > 0);
          const totalBlocks = entity.content.length;
          const emptyBlocks = allBlockTexts.filter((t: string) => t.length === 0).length;

          const placeholderTexts = new Set([
            'title', 'heading', 'subheading', 'subtitle',
            'list item', 'list item...', 'list item…',
            'body text', 'paragraph', 'your text here',
            'description', 'section title', 'content here',
            'placeholder', 'text', 'body', 'section'
          ]);
          const placeholderBlocks = blockTexts.filter((t: string) =>
            placeholderTexts.has(t) || placeholderTexts.has(t.replace(/[.\…]+$/, ''))
          ).length;

          // Reject if either:
          // - 50%+ of blocks are literal placeholder words ("Title", "Heading", "List item..."), OR
          // - more than half the blocks are empty (user would see a wall of empty-state placeholders)
          const tooManyPlaceholders = totalBlocks > 0 && placeholderBlocks >= totalBlocks * 0.5;
          const tooManyEmptyBlocks = totalBlocks >= 3 && emptyBlocks >= Math.ceil(totalBlocks * 0.5);

          if (tooManyPlaceholders || tooManyEmptyBlocks) {
            console.error('[Flowr AI] addEntity BLOCKED placeholder note. Total:', totalBlocks, '| Empty:', emptyBlocks, '| Placeholder:', placeholderBlocks, '| Sample:', blockTexts.slice(0, 5));
            entity = {
              ...entity,
              content: [{
                id: crypto.randomUUID?.() || String(Date.now()),
                type: 'text' as const,
                style: 'body' as const,
                content: '⚠️ The AI generated placeholder content instead of real text. Please ask the AI to try again, or write the content manually.',
                align: 'left' as const
              }]
            };
          }
        }
        const activeWorkspaceId = get().activeWorkspaceId;
        const maxSortOrder = Math.max(...get().entities.map(e => e.sortOrder || 0), 0);
        
        // Enforce flat hierarchy for workspaces and collections
        const isRootOnly = entity.type === 'workspace' || entity.type === 'collection';
        const finalParentId = isRootOnly ? null : entity.parentId;

        const finalEntity = { 
          ...entity, 
          parentId: finalParentId,
          workspaceId: entity.workspaceId || activeWorkspaceId,
          sortOrder: entity.sortOrder ?? (maxSortOrder + 1)
        };
        set((state) => ({ entities: [...state.entities, finalEntity] }));
        upsertEntity(finalEntity);
      },

      deleteEntity: (id) => {
        const state = get();
        const descendantIds = getDescendantIds(state.entities, id);
        const idsToRemove = new Set([id, ...descendantIds]);
        set((s) => ({
          entities: s.entities.filter(e => !idsToRemove.has(e.id)),
          favoriteIds: s.favoriteIds.filter(fid => !idsToRemove.has(fid)),
          activeEntityId: idsToRemove.has(s.activeEntityId ?? '') ? 'dashboard' : s.activeEntityId,
        }));
        idsToRemove.forEach(eid => deleteEntityFromDB(eid));
      },

      moveEntity: (id, newParentId, newWorkspaceId) => {
        set((state) => ({ 
          entities: state.entities.map(e => {
            if (e.id !== id) return e;

            // Enforce flat hierarchy for workspaces and collections
            const isRootOnly = e.type === 'workspace' || e.type === 'collection';
            const finalParentId = isRootOnly ? null : newParentId;

            return { 
              ...e, 
              parentId: finalParentId, 
              workspaceId: newWorkspaceId !== undefined ? newWorkspaceId : e.workspaceId, 
              lastModified: Date.now() 
            };
          }) 
        }));
        const updated = get().entities.find(e => e.id === id);
        if (updated) upsertEntity(updated);
      },

      reorderEntities: (orderedIds) => {
        set((state) => ({
          entities: state.entities.map(e => {
            const idx = orderedIds.indexOf(e.id);
            if (idx === -1) return e;
            return { ...e, sortOrder: idx };
          }),
        }));
      },

      renameEntity: (id, newTitle) => {
        set((state) => ({ entities: state.entities.map(e => e.id === id ? { ...e, title: newTitle, lastModified: Date.now() } : e), editingEntity: null }));
        const updated = get().entities.find(e => e.id === id);
        if (updated) upsertEntity(updated);
      },

      duplicateEntity: (id: string) => {
        const state = get();
        const rootEntity = state.entities.find(e => e.id === id);
        if (!rootEntity) return;
        const newEntities: Entity[] = [];
        const duplicateRecursive = (entity: Entity, newParentId: string | null) => {
          const newId = generateId();
          const isRoot = entity.id === id;
          const copy: Entity = { ...entity, id: newId, parentId: newParentId, title: isRoot ? `${entity.title} (Copy)` : entity.title, lastModified: Date.now() };
          newEntities.push(copy);
          state.entities.filter(e => e.parentId === entity.id).forEach(child => duplicateRecursive(child, newId));
        };
        duplicateRecursive(rootEntity, rootEntity.parentId);
        set((state) => ({ entities: [...state.entities, ...newEntities] }));
        newEntities.forEach(e => upsertEntity(e));
      },

      setEntityIcon: (id, icon) => {
        set((state) => ({ entities: state.entities.map(e => e.id === id ? { ...e, icon, lastModified: Date.now() } : e) }));
        const updated = get().entities.find(e => e.id === id);
        if (updated) upsertEntity(updated);
      },

      setEditingEntityId: (id, source) => set({ editingEntity: id && source ? { id, source } : null }),

      updateEntityContent: (id, content) => {
        set((state) => ({ entities: state.entities.map(e => e.id === id ? { ...e, content, lastModified: Date.now() } : e) }));
        const updated = get().entities.find(e => e.id === id);
        if (updated) upsertEntity(updated);
      },

      addTagToEntity: (id, tag) => set((state) => ({
        entities: state.entities.map(e => {
          if (e.id !== id) return e;
          const currentTags = e.tags ?? [];
          if (currentTags.includes(tag)) return e;
          return { ...e, tags: [...currentTags, tag], lastModified: Date.now() };
        })
      })),

      removeTagFromEntity: (id, tag) => set((state) => ({ entities: state.entities.map(e => e.id === id ? { ...e, tags: (e.tags ?? []).filter(t => t !== tag), lastModified: Date.now() } : e) })),

      updateTagInEntity: (id, oldTag, newTag) => set((state) => ({ entities: state.entities.map(e => e.id === id ? { ...e, tags: (e.tags ?? []).map(t => t === oldTag ? newTag : t), lastModified: Date.now() } : e) })),

      setTagsForEntity: (id, tags) => set((state) => ({ entities: state.entities.map(e => e.id === id ? { ...e, tags, lastModified: Date.now() } : e) })),

      addEmptyTag: (id: string) => set((state) => ({ entities: state.entities.map(e => e.id === id ? { ...e, tags: [...(e.tags ?? []), ''], lastModified: Date.now() } : e) })),

      addCanvasBlock: (block: EditorBlock) => set((state) => ({
        blocks: [...state.blocks, block]
      })),
      updateCanvasBlock: (id: string, updates: Partial<EditorBlock>) => set((state) => ({
        blocks: state.blocks.map(b => b.id === id ? { ...b, ...updates } : b)
      })),
      deleteCanvasBlock: (id: string) => set((state) => ({
        blocks: state.blocks.filter(b => b.id !== id)
      })),
      moveCanvasSection: (sectionId: string, deltaX: number, deltaY: number) => set((state) => ({
        blocks: state.blocks.map(b => {
          if (b.id === sectionId) {
            return { ...b, x: (b.x || 0) + deltaX, y: (b.y || 0) + deltaY };
          }
          if (b.parentId === sectionId) {
            return { ...b, x: (b.x || 0) + deltaX, y: (b.y || 0) + deltaY };
          }
          return b;
        })
      })),

      toggleFavorite: (id) => set((state) => ({ favoriteIds: state.favoriteIds.includes(id) ? state.favoriteIds.filter(fid => fid !== id) : [...state.favoriteIds, id] })),

      toggleCollapsed: (id) => set((state) => ({ collapsedIds: state.collapsedIds.includes(id) ? state.collapsedIds.filter(cid => cid !== id) : [...state.collapsedIds, id] })),

      addTask: (task) => {
        const activeWorkspaceId = get().activeWorkspaceId;
        const finalTask = { ...task, workspaceId: task.workspaceId || activeWorkspaceId };
        set((state) => ({ tasks: [...state.tasks, finalTask] }));
        upsertTask(finalTask);
      },

      toggleTask: (id) => {
        set((s) => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) }));
        const updated = get().tasks.find(t => t.id === id);
        if (updated) upsertTask(updated);
      },

      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter(t => t.id !== id) }));
        deleteTaskFromDB(id);
      },

      updateTask: (id, updates) => {
        set((s) => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t) }));
        const updated = get().tasks.find(t => t.id === id);
        if (updated) upsertTask(updated);
      },

      updateWidgetLayout: (entityId, layout) => {
        set((s) => ({
          entities: s.entities.map(e =>
            e.id === entityId ? { ...e, widgetLayout: layout, lastModified: Date.now() } : e
          )
        }));
        const updated = get().entities.find(e => e.id === entityId);
        if (updated) upsertEntity(updated);
      },

      sortEntities: (criteria) => set((s) => ({ entities: [...s.entities].sort((a, b) => criteria === 'title' ? a.title.localeCompare(b.title) : (b.lastModified || 0) - (a.lastModified || 0)) })),

      sortTasks: (criteria) => set((s) => ({ tasks: [...s.tasks].sort((a, b) => criteria === 'title' ? a.title.localeCompare(b.title) : new Date(b.dueDate || 0).getTime() - new Date(a.dueDate || 0).getTime()) })),

      updateBlockPosition: (id, x, y) => set((state) => ({ blocks: state.blocks.map(b => b.id === id ? { ...b, x, y } : b) })),

      setEntities: (entities) => set({ entities }),
      setTasks: (tasks) => set({ tasks }),

      addHabit: (habit) => set(s => ({ lifeHabits: [...s.lifeHabits, habit] })),
      updateHabit: (id, updates) => set(s => ({ lifeHabits: s.lifeHabits.map(h => h.id === id ? { ...h, ...updates } : h) })),
      deleteHabit: (id) => set(s => ({ lifeHabits: s.lifeHabits.filter(h => h.id !== id), lifeHabitChecks: s.lifeHabitChecks.filter(c => c.habitId !== id) })),
      checkHabit: (habitId, date, done) => set(s => {
        const existing = s.lifeHabitChecks.find(c => c.habitId === habitId && c.date === date);
        if (existing) {
          return { lifeHabitChecks: s.lifeHabitChecks.map(c => c.id === existing.id ? { ...c, done } : c) };
        }
        return { lifeHabitChecks: [...s.lifeHabitChecks, { id: generateId(), habitId, date, done }] };
      }),

      setMood: (entry) => set(s => {
        const existing = s.lifeMoods.find(m => m.workspaceId === entry.workspaceId && m.date === entry.date);
        if (existing) {
          return { lifeMoods: s.lifeMoods.map(m => m.id === existing.id ? { ...m, ...entry } : m) };
        }
        return { lifeMoods: [...s.lifeMoods, entry] };
      }),
      deleteMood: (id) => set(s => ({ lifeMoods: s.lifeMoods.filter(m => m.id !== id) })),

      upsertJournal: (entry) => set(s => {
        const existing = s.lifeJournals.find(j => j.workspaceId === entry.workspaceId && j.date === entry.date);
        if (existing) {
          return { lifeJournals: s.lifeJournals.map(j => j.id === existing.id ? { ...j, ...entry } : j) };
        }
        return { lifeJournals: [...s.lifeJournals, entry] };
      }),
      deleteJournal: (id) => set(s => ({ lifeJournals: s.lifeJournals.filter(j => j.id !== id) })),

      addGoal: (goal) => set(s => ({ lifeGoals: [...s.lifeGoals, goal] })),
      updateGoal: (id, updates) => set(s => ({ lifeGoals: s.lifeGoals.map(g => g.id === id ? { ...g, ...updates } : g) })),
      deleteGoal: (id) => set(s => ({ lifeGoals: s.lifeGoals.filter(g => g.id !== id) })),

      addRoutine: (routine) => set(s => ({ lifeRoutines: [...s.lifeRoutines, routine] })),
      updateRoutine: (id, updates) => set(s => ({ lifeRoutines: s.lifeRoutines.map(r => r.id === id ? { ...r, ...updates } : r) })),
      deleteRoutine: (id) => set(s => ({ lifeRoutines: s.lifeRoutines.filter(r => r.id !== id), lifeRoutineChecks: s.lifeRoutineChecks.filter(c => c.routineId !== id) })),
      checkRoutineStep: (routineId, stepId, date, done) => set(s => {
        const existing = s.lifeRoutineChecks.find(c => c.routineId === routineId && c.stepId === stepId && c.date === date);
        if (existing) {
          return { lifeRoutineChecks: s.lifeRoutineChecks.map(c => c.id === existing.id ? { ...c, done } : c) };
        }
        return { lifeRoutineChecks: [...s.lifeRoutineChecks, { id: generateId(), routineId, stepId, date, done }] };
      }),

      setLifeData: (data) => set(s => ({ ...s, ...data })),

      addResource: (resource) => set(s => ({ knowledgeResources: [...s.knowledgeResources, resource] })),
      updateResource: (id, updates) => set(s => ({ knowledgeResources: s.knowledgeResources.map(r => r.id === id ? { ...r, ...updates } : r) })),
      deleteResource: (id) => set(s => ({ knowledgeResources: s.knowledgeResources.filter(r => r.id !== id) })),

      addSnippet: (snippet) => set(s => ({ knowledgeSnippets: [...s.knowledgeSnippets, snippet] })),
      updateSnippet: (id, updates) => set(s => ({ knowledgeSnippets: s.knowledgeSnippets.map(sn => sn.id === id ? { ...sn, ...updates } : sn) })),
      deleteSnippet: (id) => set(s => ({ knowledgeSnippets: s.knowledgeSnippets.filter(sn => sn.id !== id) })),

      addGuide: (guide) => set(s => ({ knowledgeGuides: [...s.knowledgeGuides, guide] })),
      updateGuide: (id, updates) => set(s => ({ knowledgeGuides: s.knowledgeGuides.map(g => g.id === id ? { ...g, ...updates } : g) })),
      deleteGuide: (id) => set(s => ({ knowledgeGuides: s.knowledgeGuides.filter(g => g.id !== id) })),

      setKnowledgeData: (data) => set(s => ({ ...s, ...data })),

      openModal: (modal) => set({ modal, contextMenu: null }),
      closeModal: () => set({ modal: null }),

      openContextMenu: (entityId, x, y, source) => set({ contextMenu: { entityId, x, y, source } }),
      closeContextMenu: () => set({ contextMenu: null }),
    }),
    {
      name: 'flowr-storage',
      version: 14,
      migrate: (persistedState: any, version: number) => {
        let state = persistedState as any;
        if (typeof state !== 'object' || !state) state = {};
        if (version < 7) {
          state = {
            ...state,
            aiCloudModels: INITIAL_CLOUD_MODELS,
            priorityModels: PRIORITY_MODELS
          };
        }
        if (version < 8) {
          state = {
            ...state,
            appStyle: 'v3'
          };
        }
        if (version < 9) {
          // Phase 4: workspace entity type + widgetLayout on entities + workspaceId on tasks
          if (Array.isArray(state.entities)) {
            state.entities = state.entities.map((e: any) => ({
              ...e,
              widgetLayout: e.widgetLayout ?? undefined,
            }));
          }
          if (Array.isArray(state.tasks)) {
            state.tasks = state.tasks.map((t: any) => ({
              ...t,
              workspaceId: t.workspaceId ?? null,
            }));
          }
        }
        if (version < 11) {
          // Synchronize core model lists with current April 2026 global defaults
          state = {
            ...state,
            flowRouterConfig: JSON.parse(JSON.stringify(DEFAULT_FLOW_ROUTER_CONFIG)),
            priorityModels: JSON.parse(JSON.stringify(PRIORITY_MODELS)),
            aiCloudModels: JSON.parse(JSON.stringify(INITIAL_CLOUD_MODELS))
          };
        }
        if (version < 12) {
          // Fix stale model IDs (gemini-3.1-flash-lite → gemini-3.1-flash-lite-preview)
          // We only reset if the current config seems to be the old one (to avoid overwriting user edits)
          const currentConfig = state.flowRouterConfig;
          const hasOldId = JSON.stringify(currentConfig).includes('gemini-3.1-flash-lite');

          if (hasOldId || !currentConfig) {
            state = {
              ...state,
              flowRouterConfig: JSON.parse(JSON.stringify(DEFAULT_FLOW_ROUTER_CONFIG)),
              priorityModels: JSON.parse(JSON.stringify(PRIORITY_MODELS)),
            };
          }
        }
        if (version < 13) {
          // Phase 01: introduce Workspace model — assign all existing entities/tasks to ws-personal
          if (!Array.isArray(state.workspaces) || state.workspaces.length === 0) {
            state = {
              ...state,
              workspaces: [{
                id: 'ws-personal',
                name: 'Personal',
                type: 'personal',
                ownerId: null,
                createdAt: Date.now(),
              }],
              activeWorkspaceId: 'ws-personal',
            };
          }
          if (Array.isArray(state.entities)) {
            state.entities = state.entities.map((e: any) => ({
              ...e,
              workspaceId: e.workspaceId ?? 'ws-personal',
            }));
          }
          if (Array.isArray(state.tasks)) {
            state.tasks = state.tasks.map((t: any) => ({
              ...t,
              workspaceId: t.workspaceId ?? 'ws-personal',
            }));
          }
        }
        if (version < 14) {
          // Backfill workspaceId on any entity or task that is still missing it
          if (Array.isArray(state.entities)) {
            state.entities = state.entities.map((e: any) => ({
              ...e,
              workspaceId: e.workspaceId || 'ws-personal',
            }));
          }
          if (Array.isArray(state.tasks)) {
            state.tasks = state.tasks.map((t: any) => ({
              ...t,
              workspaceId: t.workspaceId || 'ws-personal',
            }));
          }
        }
        return state;
      },
      storage: (() => {
        let debounceTimer: ReturnType<typeof setTimeout> | null = null;
        return {
          getItem: (name: string) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            return JSON.parse(str);
          },
          setItem: (name: string, value: unknown) => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              debounceTimer = null;
              try {
                localStorage.setItem(name, JSON.stringify(value));
              } catch (e) {
                if (e instanceof Error && e.name === 'QuotaExceededError') {
                  console.warn('[Flowr Store] Storage quota exceeded. State update was not persisted to disk.');
                }
              }
            }, 1000);
          },
          removeItem: (name: string) => localStorage.removeItem(name),
        };
      })(),
      partialize: (state: AppState) => ({
        entities: state.entities,
        tasks: state.tasks,
        blocks: state.blocks,
        lifeHabits: state.lifeHabits,
        lifeHabitChecks: state.lifeHabitChecks,
        lifeMoods: state.lifeMoods,
        lifeJournals: state.lifeJournals,
        lifeGoals: state.lifeGoals,
        lifeRoutines: state.lifeRoutines,
        lifeRoutineChecks: state.lifeRoutineChecks,
        knowledgeResources: state.knowledgeResources,
        knowledgeSnippets: state.knowledgeSnippets,
        knowledgeGuides: state.knowledgeGuides,
        workspaces: state.workspaces,
        activeWorkspaceId: state.activeWorkspaceId,

        favoriteIds: state.favoriteIds,
        collapsedIds: state.collapsedIds,
        theme: state.theme,
        interfaceSize: state.interfaceSize,
        isSidebarCollapsed: state.isSidebarCollapsed,
        isSidebarPinned: state.isSidebarPinned,
        isToolbarVisible: state.isToolbarVisible,
        toolbarPosition: state.toolbarPosition,
        sidebarWidth: state.sidebarWidth,
        aiSidebarWidth: state.aiSidebarWidth,
        mixedLayoutSplit: state.mixedLayoutSplit,
        isFullWidth: state.isFullWidth,
        appStyle: state.appStyle,
        dashboardLayout: state.dashboardLayout,
        defaultDashboardLayout: state.defaultDashboardLayout,
        aiMessages: state.aiMessages.slice(-20), // Only persist the last 20 messages to keep disk footprint low
        aiRuntime: state.aiRuntime,
        localEndpoint: state.localEndpoint,
        localModel: state.localModel,
        aiCloudModels: state.aiCloudModels,
        priorityModels: state.priorityModels,
        isLocalEnabled: state.isLocalEnabled,
        aiRequestLog: state.aiRequestLog.slice(0, 50), // Only persist the last 50 logs to keep disk footprint low
        aiApiKey: state.aiApiKey,
        aiGeminiKey: state.aiGeminiKey,
        aiGeminiKeys: state.aiGeminiKeys,
        aiGeminiKeyIndex: state.aiGeminiKeyIndex,
        geminiQuotaModels: state.geminiQuotaModels,
        geminiModelIndex: state.geminiModelIndex,
        aiGroqKey: state.aiGroqKey,
        aiModel: state.aiModel,
        aiBehaviorMode: state.aiBehaviorMode,
        aiRoutingMode: state.aiRoutingMode,
        hybridManualModel: state.hybridManualModel,
        flowRouterConfig: state.flowRouterConfig,
        aiProjectQuotas: state.aiProjectQuotas,
        aiGeminiKeyConfigs: state.aiGeminiKeyConfigs,
        geminiQuotaLink: state.geminiQuotaLink,
      }),
    }
  )
);

