import { runChain } from '../src/lib/bot/chainRouter'

async function test() {
  console.log('Starting runChain test...')
  try {
    const result = await runChain('Hello, how are you?', undefined, {
      userId: 'test-user',
      thinkingEnabled: true,
      onStatus: (step) => {
        console.log('STATUS:', step)
      }
    })
    console.log('Result content:', result.content)
    console.log('Result model chain:', result.model_chain)
    console.log('Result pipeline steps:', JSON.stringify(result.pipeline_steps, null, 2))
  } catch (error) {
    console.error('Error running test:', error)
  }
}

test()
