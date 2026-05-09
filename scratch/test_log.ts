import { logModelWebMessage } from '../src/lib/bot/analytics'

async function test() {
  console.log('Testing logModelWebMessage...')
  try {
    const contextMessages = {
      classify: [],
      routing: [],
      pipeline_steps: [
        { chain: 'THINKING', goal: 'Test thinking', status: 'done', output: 'Worked perfectly!' }
      ]
    }
    const crypto = await import('crypto')
    const logId = await logModelWebMessage('anonymous', 'Test content', 'chat', 'success', 'test_chain', crypto.randomUUID(), contextMessages)
    console.log('Log ID returned:', logId)
  } catch (error) {
    console.error('Error logging:', error)
  }
}

test()
