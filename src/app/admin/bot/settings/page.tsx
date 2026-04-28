import { getSettings, getCompiledPromptMeta } from './actions'
import SettingsClient from './SettingsClient'

export default async function BotSettingsPage() {
  const [settings, meta] = await Promise.all([
    getSettings(),
    getCompiledPromptMeta(),
  ])

  return (
    <SettingsClient
      initialSettings={settings}
      compiledAt={meta.compiled_at}
      entryCount={meta.entry_count}
      compiledContent={meta.content}
    />
  )
}
