import { logger } from '../../logger'

export async function runPollinations(prompt: string): Promise<Buffer | null> {
  try {
    const seed = Math.floor(Math.random() * 1000000)
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=1024&height=1024&nologo=true`
    
    logger.info(`Generating image via Pollinations: ${url}`)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Pollinations failed: ${response.statusText}`)
    
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error: any) {
    logger.error('Pollinations image generation failed:', error.message)
    return null
  }
}
