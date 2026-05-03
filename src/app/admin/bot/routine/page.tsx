import { getLatestPlans } from './planActions'
import RoutineClient from './RoutineClient'

export const dynamic = 'force-dynamic'

export default async function BotRoutinePage() {
  const plans = await getLatestPlans()
  return <RoutineClient initialPlans={plans} />
}
