import { getLatestPlans } from './planActions'
import RoutineClient from './RoutineClient'

export default async function BotRoutinePage() {
  const plans = await getLatestPlans()
  return <RoutineClient initialPlans={plans} />
}
