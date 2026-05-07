import { logger } from '../logger'
import { getRouterChain, IntentCategory } from '../router-config'
import { getProviderKeys } from '../vault'

export interface OrchestratorPlan {
  steps: IntentCategory[]
  stepGoals: string[]
}

const VALID_CHAIN_CATEGORIES: IntentCategory[] = [
  'FAST_SIMPLE', 'MEDIUM_THINKING', 'COMPLEX_THINKING',
  'CODING', 'WEB_SEARCH', 'DEEP_RESEARCH', 'IMAGE_GEN',
  'TOOL_CALLING', 'VISION', 'AUDIO_VOICE',
]

const DEFAULT_ORCHESTRATOR_SYSTEM_PROMPT = `You are the pipeline orchestrator for an AI assistant. Your job is to plan the minimal sequence of processing chains needed to answer a complex user request. Output only valid JSON. Never explain your reasoning.`

function parseOrchestratorOutput(raw: string, maxSteps: number): OrchestratorPlan | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    const parsed = JSON.parse(jsonMatch[0])
    if (!Array.isArray(parsed.steps) || !Array.isArray(parsed.step_goals)) return null

    const steps = (parsed.steps as string[])
      .filter(s => VALID_CHAIN_CATEGORIES.includes(s as IntentCategory))
      .slice(0, Math.max(1, maxSteps - 2)) as IntentCategory[]

    const stepGoals = (parsed.step_goals as string[]).slice(0, steps.length)

    if (steps.length === 0) return null
    return { steps, stepGoals }
  } catch {
    return null
  }
}

function buildOrchestratorPrompt(userPrompt: string, maxSteps: number): string {
  return `The user sent this message: "${userPrompt}"

Plan the optimal chain sequence to answer this request. Output ONLY valid JSON, nothing else.

Available chain types: VISION, WEB_SEARCH, DEEP_RESEARCH, CODING, COMPLEX_THINKING, MEDIUM_THINKING, FAST_SIMPLE, IMAGE_GEN, TOOL_CALLING

Rules:
- Maximum ${Math.max(1, maxSteps - 2)} steps (system adds THINK and OUTPUT automatically)
- Last step must be a text chain: FAST_SIMPLE, MEDIUM_THINKING, or COMPLEX_THINKING
- IMAGE_GEN must be placed last among data chains
- Only include chains that are genuinely necessary

Output format:
{"steps":["CHAIN_TYPE","CHAIN_TYPE"],"step_goals":["what this step should produce for the next step","what this step should produce"]}`
}

export async function planChainSequence(
  prompt: string,
  history: any[],
  replyContext: any,
  sessionSummary: string | null,
  maxSteps: number
): Promise<OrchestratorPlan | null> {
  const { chain, system_prompt } = await getRouterChain('ORCHESTRATOR' as any)

  if (chain.length === 0) {
    logger.error('ORCHESTRATOR chain is empty — add models via Admin > Router > ORCHESTRATOR')
    return null
  }

  const orchestratorPrompt = buildOrchestratorPrompt(prompt, maxSteps)
  const systemPrompt = system_prompt || DEFAULT_ORCHESTRATOR_SYSTEM_PROMPT
  const recentHistory = history.slice(-6)

  for (const modelConfig of chain) {
    if (!modelConfig.is_enabled) continue
    try {
      let response: string | null = null
      const provider = modelConfig.provider.toLowerCase()

      // Import and call providers dynamically to avoid circular deps
      if (provider === 'google') {
        const { runGoogle } = await import('./providers/google')
        // runGoogle fetches its own Gemini keys internally
        response = await runGoogle(modelConfig.id, orchestratorPrompt, systemPrompt, undefined, {} as any, recentHistory)
      } else if (provider === 'groq') {
        const { runGroq } = await import('./providers/groq')
        // runGroq fetches its own Groq keys internally when aiApiKey is undefined
        response = await runGroq(modelConfig.id, orchestratorPrompt, systemPrompt, undefined, {} as any, recentHistory)
      } else if (provider === 'openrouter') {
        const { runOpenRouter } = await import('./providers/openrouter')
        const keys = await getProviderKeys('OPENROUTER')
        // runOpenRouter(modelId, prompt, systemPrompt?, history[], apiKey?)
        response = await runOpenRouter(modelConfig.id, orchestratorPrompt, systemPrompt, recentHistory, keys[0] || '')
      }

      if (response) {
        const plan = parseOrchestratorOutput(response, maxSteps)
        if (plan) {
          logger.info(`Orchestrator planned: ${plan.steps.join(' → ')}`)
          return plan
        }
      }
    } catch (e: any) {
      logger.warn(`Orchestrator model ${modelConfig.id} failed: ${e.message}`)
    }
  }

  logger.error('Orchestrator: all models failed to produce a valid plan')
  return null
}
