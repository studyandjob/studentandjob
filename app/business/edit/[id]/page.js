import BusinessShell from '@/components/business/BusinessShell';
import RequireOwner from '@/components/business/RequireOwner';
import BusinessWizard from '@/components/business/BusinessWizard';

export const metadata = { title: 'Business Edit Karein' };

export default function Page({ params }) {
  return (
    <BusinessShell wide>
      <RequireOwner>
        <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">Profile edit karein</h1>
        <BusinessWizard businessId={params.id} />
      </RequireOwner>
    </BusinessShell>
  );
}
