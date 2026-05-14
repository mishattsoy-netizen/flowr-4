export const dynamic = 'force-dynamic'

import { getCostSummary, getCostSeries, getModelBreakdown } from './actions'
import { CostDashboardClient } from './CostDashboardClient'

export default async function CostAnalyticsPage() {
  const [summary, series, models] = await Promise.all([
    getCostSummary(30),
    getCostSeries(30),
    getModelBreakdown(30),
  ])

  return <CostDashboardClient initial={{ summary, series, models }} />
}
