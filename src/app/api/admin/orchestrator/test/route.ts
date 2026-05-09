import { NextRequest, NextResponse } from 'next/server'
import { planChainSequence } from '@/lib/bot/orchestrator'
import { getPipelineSettings } from '@/lib/router-config'

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 })

  try {
    const settings = await getPipelineSettings()
    const plan = await planChainSequence(prompt, [], null, null, settings.maxPipelineSteps)
    if (!plan) return NextResponse.json({ error: 'Orchestrator returned no plan' }, { status: 500 })
    return NextResponse.json({ steps: plan.steps, goals: plan.stepGoals })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
