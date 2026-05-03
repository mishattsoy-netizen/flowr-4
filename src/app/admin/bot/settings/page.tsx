import { getSettings, getCompiledPromptMeta, getGlobalEnabled, getOllamaEnabled, getBackendModel } from './actions'
import { getModels } from '@/app/admin/models/actions'
import SettingsClient from './SettingsClient'

export default async function BotSettingsPage() {
  const [settings, meta, globalEnabled, ollamaEnabled, backendModel, models] = await Promise.all([
    getSettings(),
    getCompiledPromptMeta(),
    getGlobalEnabled(),
    getOllamaEnabled(),
    getBackendModel(),
    getModels(),
  ])

  return (
    <SettingsClient
      initialSettings={settings}
      compiledAt={meta.compiled_at}
      entryCount={meta.entry_count}
      compiledContent={meta.content}
      globalEnabled={globalEnabled}
      initialActiveStates={Object.fromEntries(settings.map(s => [s.category, s.is_active]))}
      initialOllamaEnabled={ollamaEnabled}
      initialBackendModel={backendModel}
      initialModels={models}
    />
  )
}

