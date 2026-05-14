import { getMessageExchanges } from './actions'
import LogsTable from './LogsTable'

export const dynamic = 'force-dynamic'

export default async function LogsPage() {
  const { exchanges, total } = await getMessageExchanges({ limit: 20, offset: 0 })

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="mb-2">
        <h1 className="text-4xl font-display font-medium text-foreground mb-1">Message Logs</h1>
        <p className="text-muted-foreground text-sm font-medium">
          All interactions across app and Telegram — <span className="text-foreground font-bold">{total.toLocaleString()}</span> total exchanges.
        </p>
      </div>

      <LogsTable initialExchanges={exchanges} initialTotal={total} />
    </div>
  )
}
