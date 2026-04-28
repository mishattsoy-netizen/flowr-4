import { getSettings, getCompiledPromptMeta, getGlobalEnabled } from './actions'
import SettingsClient from './SettingsClient'

export default async function BotSettingsPage() {
  const [settings, meta, globalEnabled] = await Promise.all([
    getSettings(),
    getCompiledPromptMeta(),
    getGlobalEnabled(),
  ])

  return (
    <SettingsClient
      initialSettings={settings}
      compiledAt={meta.compiled_at}
      entryCount={meta.entry_count}
      compiledContent={meta.content}
      globalEnabled={globalEnabled}
      initialActiveStates={Object.fromEntries(settings.map(s => [s.category, s.is_active]))}
    />
  )
}
