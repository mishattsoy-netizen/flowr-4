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
        const { aiMessages } = get();

        const userMessage: AIMessage = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: Date.now(),
          attachments,
        };

        set({ aiMessages: [...aiMessages, userMessage], isAILoading: true });

        void agentEnabled;

        try {
          const res = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: content }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Request failed' }));
            const errorMessage: AIMessage = {
              id: generateId(),
              role: 'assistant',
              content: err.error || 'Something went wrong.',
              timestamp: Date.now(),
            };
            set(s => ({ aiMessages: [...s.aiMessages, errorMessage], isAILoading: false }));
            return;
          }

          const data = await res.json();
          const assistantMessage: AIMessage = {
            id: generateId(),
            role: 'assistant',
            content: data.content,
            timestamp: Date.now(),
          };
          set(s => ({ aiMessages: [...s.aiMessages, assistantMessage], isAILoading: false }));
        } catch {
          const errorMessage: AIMessage = {
            id: generateId(),
            role: 'assistant',
            content: 'Connection error. Please try again.',
            timestamp: Date.now(),
          };
          set(s => ({ aiMessages: [...s.aiMessages, errorMessage], isAILoading: false }));
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

