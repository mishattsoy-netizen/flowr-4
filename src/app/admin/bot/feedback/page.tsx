import { getFeedbackLogs } from './actions'
import FeedbackClient from './FeedbackClient'

export default async function BotFeedbackPage() {
  const logs = await getFeedbackLogs()
  return <FeedbackClient initialLogs={logs} />
}
