import { classifyIntentWithModel } from './classifier'
import { getRouterChain, getFallbackModes } from '../router-config'
import { getProviderKeys } from '../vault'
import { logger } from '../logger'
import { runGoogle } from './providers/google'
import { runGroq } from './providers/groq'
import { runHuggingFace, runHuggingFaceText } from './providers/huggingface'
import { runWebSearchChain } from './providers/tavily'
import { runDuckDuckGoSearchChain } from './providers/duckduckgo'
import { runCloudflare } from './providers/cloudflare'
import { runPollinations } from './providers/pollinations'
import { runOllama } from './providers/ollama'
import { getConversationMemory, getWebConversationMemory } from './memory'
import { supabaseAdmin } from '../supabase'
import { getCompiledPrompt } from './compilePrompt'

function trackModelUsage(modelId: string, provider: string) {
  supabaseAdmin.rpc('increment_model_usage', { p_model_id: modelId, p_provider: provider })
    .then(({ error }: { error: any }) => { if (error) logger.warn(`Usage track failed [${modelId}]: ${error.message}`) })
}

export interface RoutingTrace {
  model: string
  category?: string
  key: string
  success: boolean
}

export interface ChainResponse {
  type: 'text' | 'photo'
  content: string | Buffer
  usage_type?: 'chat' | 'tool' | 'search' | 'vision' | 'image'
  model?: string
  model_chain?: string
  status?: 'success' | 'error'
  classification_trace?: any[]
  routing_trace?: RoutingTrace[]
}

export async function runChain(
  prompt: string,
  inputBuffer?: Buffer,
  context?: { chatId?: number; userId?: string; aiApiKey?: string; activeEntityId?: string; activeWorkspaceId?: string; classificationModelId?: string; agentEnabled?: boolean; temperature?: number }
): Promise<ChainResponse> {
  let history: any[] = []
  if (context?.chatId) {
    history = await getConversationMemory(context.chatId)
  } else if (context?.userId && context.userId !== 'anonymous') {
    history = await getWebConversationMemory(context.userId)
  }

  // 1. Specialized Vision Flow (Buffer or URL)
  let activeBuffer = inputBuffer
  if (!activeBuffer && (prompt.includes('http://') || prompt.includes('https://'))) {
    const urlMatch = prompt.match(/(https?:\/\/[^\s]+?\.(jpe?g|png|webp|gif|bmp|svg|tiff|avif))(\?[^\s]*)?/i)
    if (urlMatch) {
      try {
        logger.info(`Detected image URL: ${urlMatch[0]}, fetching...`)
        const res = await fetch(urlMatch[0])
        if (res.ok) {
          activeBuffer = Buffer.from(await res.arrayBuffer())
          logger.info(`Successfully fetched image, size: ${activeBuffer.length} bytes`)
        } else {
          logger.warn(`Failed to fetch image URL: ${res.status} ${res.statusText}`)
        }
      } catch (e: any) {
        logger.error(`Error fetching image URL: ${e.message}`)
      }
    }
  }

  if (activeBuffer) {
    // Look up VISION chain from DB — configure models via Router admin
    let { chain: visionChain } = await getRouterChain('VISION')

    let activePrompt = prompt;
    if (!activePrompt && activeBuffer) {
      if (history.length > 0) {
        activePrompt = "The user sent an image without a prompt. Analyze the conversation history and this image to understand what the user likely wants. If there is a clear task (e.g., 'extract text', 'describe this', 'summarize'), perform it. If the intent is unclear, describe the image and ask how you can help.";
      } else {
        activePrompt = "Analyze this image and decide how to answer by yourself. Describe it and ask how I can help.";
      }
    }

    for (const modelConfig of visionChain) {
      if (!modelConfig.is_enabled) continue
      try {
        logger.info(`Routing vision to: ${modelConfig.id} (${modelConfig.provider})`)
        const visionRes = await runGoogle(modelConfig.id, activePrompt, undefined, activeBuffer, context as any, history)
        if (visionRes) {
          trackModelUsage(modelConfig.id, modelConfig.provider)
          return { type: 'text', content: visionRes, usage_type: 'vision', model: modelConfig.id, model_chain: `vision → ${modelConfig.id}`, status: 'success' }
        }
      } catch (e: any) {
        logger.warn(`Vision failure [${modelConfig.id}]: ${e.message}`)
      }
    }

    if (visionChain.length === 0) logger.warn('No VISION chain configured in DB. Add models via Router admin.')
    return { type: 'text', content: "Vision chain is empty. Configure models in the VISION router.", usage_type: 'vision', model_chain: 'vision → (none)', status: 'error' }
  }

  // 2. Standard Routing Flow
  const { category: rawCategory, classifierModel, trace: classificationTrace } = await classifyIntentWithModel(prompt, context?.aiApiKey, context?.classificationModelId)
  let category = rawCategory
  const routingTrace: RoutingTrace[] = []

  // Agent mode: override non-specific categories to TOOL_CALLING so the full tool loop engages
  if (context?.agentEnabled && (category === 'FAST_SIMPLE' || category === 'MEDIUM_THINKING')) {
    logger.info(`Agent mode active: overriding ${category} → TOOL_CALLING`)
    category = 'TOOL_CALLING'
  }
  let { chain, system_prompt, temperature } = await getRouterChain(category)

  // 3. Ensure System Prompt for Tool Calling
  if (!system_prompt && category === 'TOOL_CALLING') {
    system_prompt = "You are a workspace assistant. You can list, create, update, and delete notes/folders. When a user asks to modify a note by title, use list_notes first to find its ID. Always confirm actions."
  }
  if (!system_prompt && category === 'IMAGE_GEN') {
    system_prompt = "You are a creative artist. Generate high-quality images based on user prompts."
  }

  // Inject global compiled prompt (settings + brain entries) as prefix
  const globalPrompt = await getCompiledPrompt()
  if (globalPrompt) {
    system_prompt = globalPrompt + "\n\n" + (system_prompt || "")
  }

  // Global constraint to prevent leaking internal reasoning/analysis
  system_prompt = "CRITICAL: Provide ONLY the final answer. NEVER output internal reasoning, analysis, planning, or drafting. Do not use headers like '*Neutrality:*', '*Final version plan:*', or '*Self-Correction:*'. Jump directly to the response.\n" +
                  "When you use a tool or perform a search, always synthesize and summarize the tool results into a natural, complete, and helpful answer to the user's question. Do NOT output raw tool results verbatim.\n\n" + (system_prompt || "");

  let finalUsageType: 'chat' | 'tool' | 'search' | 'vision' | 'image' = 'chat'
  if (category === 'WEB_SEARCH') finalUsageType = 'search'
  if (category === 'TOOL_CALLING') finalUsageType = 'tool'
  if (category === 'IMAGE_GEN') finalUsageType = 'image'

  const fallbackModes = await getFallbackModes()
  const fallbackMode = fallbackModes[category] || 'model_first'
  const triedKeysCount: Record<string, number> = {}

  for (const modelConfig of chain) {
    if (!modelConfig.is_enabled) continue

    const key = modelConfig.provider === 'google' ? 'GEMINI' : modelConfig.provider.toUpperCase()
    let providerKeys: string[] = []

    providerKeys = await getProviderKeys(key)

    if (providerKeys.length === 0) {
      providerKeys = [context?.aiApiKey || '']
    }

    const startIndex = triedKeysCount[key] || 0

    try {
      for (let k = startIndex; k < providerKeys.length; k++) {
        const activeKey = providerKeys[k]

        try {
          logger.info(`Attempting model: ${modelConfig.id} (${modelConfig.provider}) for ${category}, API key index: ${k + 1}`)
          let response: string | Buffer | null = null

          let usedSynthesisModel = ''
          const routeContext: any = { 
            ...(context || {}), 
            useTools: category === 'TOOL_CALLING', 
            aiApiKey: activeKey || undefined,
            usedKeyIndex: k + 1,
            temperature: typeof temperature === 'number' ? temperature : undefined,
            setSynthesisModel: (m: string) => { usedSynthesisModel = m }
          }

          switch (modelConfig.provider.toLowerCase() as string) {
            case 'google':
              response = await runGoogle(modelConfig.id, prompt, system_prompt, undefined, routeContext, history)
              break
            case 'groq':
              response = await runGroq(modelConfig.id, prompt, system_prompt, activeKey || context?.aiApiKey, routeContext, history)
              break
            case 'huggingface':
              if (category === 'IMAGE_GEN') {
                response = await runHuggingFace(modelConfig.id, prompt, activeKey || context?.aiApiKey)
              } else {
                response = await runHuggingFaceText(modelConfig.id, prompt, system_prompt, history, activeKey || context?.aiApiKey)
              }
              break
            case 'cloudflare':
              response = await runCloudflare(modelConfig.id, prompt, activeKey || context?.aiApiKey)
              break
            case 'vault':
              if (modelConfig.id === 'tavily-search') response = await runWebSearchChain(prompt, routeContext)
              if (modelConfig.id === 'duckduckgo-search') response = await runDuckDuckGoSearchChain(prompt, routeContext)
              break
            case 'pollinations':
              response = await runPollinations(prompt)
              break
            case 'local':
            case 'ollama':
            case 'ollama(my pc)':
              response = await runOllama(modelConfig.id, prompt, system_prompt, history, temperature)
              break
          }

          if (response) {
            if (category === 'IMAGE_GEN' && typeof response === 'string') {
              logger.info(`Model ${modelConfig.id} returned text for IMAGE_GEN. Skipping to next fallback.`)
              const displayKey = routeContext.usedKeyIndex ? `${key} ${routeContext.usedKeyIndex}` : `${key} 1`
              routingTrace.push({ model: modelConfig.id, category, key: displayKey, success: false })
              continue
            }

            const displayKey = routeContext.usedKeyIndex ? `${key} ${routeContext.usedKeyIndex}` : `${key} 1`
            routingTrace.push({ model: modelConfig.id, category, key: displayKey, success: true })
            if (usedSynthesisModel) {
              routingTrace.push({ model: usedSynthesisModel, category, key: 'GEMINI 1', success: true })
            }
            trackModelUsage(modelConfig.id, modelConfig.provider)

            const chainParts = [classifierModel, category]
            routingTrace.forEach(r => chainParts.push(`${r.model}|${r.key}|${r.success ? 'true' : 'false'}`))
            const detailedModelChain = chainParts.join(' → ')

            return {
              type: category === 'IMAGE_GEN' ? 'photo' : 'text',
              content: response as any,
              usage_type: finalUsageType,
              model: modelConfig.id,
              model_chain: detailedModelChain,
              status: 'success',
              classification_trace: classificationTrace,
              routing_trace: routingTrace
            }
          } else {
            triedKeysCount[key] = k + 1
            const displayKey = routeContext.usedKeyIndex ? `${key} ${routeContext.usedKeyIndex}` : `${key} 1`
            routingTrace.push({ model: modelConfig.id, category, key: displayKey, success: false })
            if (fallbackMode !== 'api_key_first') {
              throw new Error(`Model ${modelConfig.id} returned empty response`)
            }
          }
        } catch (error: any) {
          triedKeysCount[key] = k + 1
          routingTrace.push({ model: modelConfig.id, category, key: `${key} ${k + 1}`, success: false })
          logger.warn(`Failure with key ${k + 1} for [${modelConfig.id}]: ${error.message}`)
          if (fallbackMode !== 'api_key_first') {
            throw error
          }
        }
      }
    } catch (outerError: any) {
      logger.warn(`Fallback triggered to next model due to: ${outerError.message}`)
      continue
    }
  }

  const chainParts = [classifierModel, category]
  routingTrace.forEach(r => chainParts.push(`${r.model}|${r.key}|${r.success ? 'true' : 'false'}`))
  const detailedModelChain = chainParts.join(' → ')

  return { 
    type: 'text', 
    content: "⚡ *System Overload*", 
    usage_type: 'chat', 
    model_chain: detailedModelChain, 
    status: 'error',
    classification_trace: classificationTrace,
    routing_trace: routingTrace
  }
}
