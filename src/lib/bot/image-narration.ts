import { logger } from '../logger'
import { getRouterChain, IntentCategory } from '../router-config'
import { runGoogle } from './providers/google'
import { runCloudflare } from './providers/cloudflare'
import { runOpenRouter } from './providers/openrouter'
import { runGroq } from './providers/groq'
import { getSubchainConfig } from '../subchain-config'

export async function narrateGeneratedImage(
  imageBuffer: Buffer,
  context?: any
): Promise<{ description: string; modelId: string; provider: string } | null> {
  const config = await getSubchainConfig('image_narration')
  const chainCategory: IntentCategory = config?.chain_category ?? 'VISION'
  const systemPrompt = config?.system_prompt ?? ''

  const { chain } = await getRouterChain(chainCategory)
  if (!chain || chain.length === 0) {
    logger.warn(`No ${chainCategory} chain available for image narration`)
    return null
  }

  const prompt = 'Describe this image in detail (250-700 characters).'

  for (const model of chain) {
    if (!model.is_enabled) continue

    try {
      let response: any = null
      const provider = model.provider.toLowerCase()

      if (provider === 'google' || provider === 'gemini') {
        response = await runGoogle(model.id, prompt, systemPrompt, imageBuffer, context, [])
      } else if (provider === 'cloudflare') {
        response = await runCloudflare(model.id, prompt, context?.aiApiKey, systemPrompt, [], 'VISION')
      } else if (provider === 'openrouter') {
        response = await runOpenRouter(model.id, prompt, systemPrompt, [], context?.aiApiKey, { openrouterProvider: model.openrouter_provider }, imageBuffer)
      } else if (provider === 'groq') {
        response = await runGroq(model.id, prompt, systemPrompt, context?.aiApiKey, context, [], imageBuffer)
      }

      if (response) {
        const description = typeof response === 'object' ? response.content : response
        if (description && description.length >= 10) {
          logger.info(`Narrated image using ${model.id}: ${description.slice(0, 50)}...`)
          return { description: description.trim(), modelId: model.id, provider: model.provider }
        }
      }
    } catch (e: any) {
      logger.warn(`Narration failed with ${model.id}: ${e.message}`)
    }
  }

  return null
}
