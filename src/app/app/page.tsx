import { Shell } from '@/components/layout/Shell';
import { WorkspaceRouter } from '@/components/WorkspaceRouter';
import { cookies } from 'next/headers';

export default async function AppPage() {
  const cookieStore = await cookies();
  const initialEntityId = cookieStore.get('flowr-initial-entity')?.value || 'dashboard';

  return (
    <Shell initialEntityId={initialEntityId}>
      <WorkspaceRouter initialEntityId={initialEntityId} />
    </Shell>
  );
}
