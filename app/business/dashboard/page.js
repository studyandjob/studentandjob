import BusinessShell from '@/components/business/BusinessShell';
import RequireOwner from '@/components/business/RequireOwner';
import OwnerDashboard from '@/components/business/OwnerDashboard';

export const metadata = { title: 'Meri Listings' };

export default function Page() {
  return (
    <BusinessShell wide>
      <RequireOwner>
        <OwnerDashboard />
      </RequireOwner>
    </BusinessShell>
  );
}
