import BusinessShell from '@/components/business/BusinessShell';
import RequireOwner from '@/components/business/RequireOwner';
import BusinessWizard from '@/components/business/BusinessWizard';

export const metadata = { title: 'Naya Business Add Karein' };

export default function Page() {
  return (
    <BusinessShell wide>
      <RequireOwner>
        <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">Naya business add karein</h1>
        <BusinessWizard />
      </RequireOwner>
    </BusinessShell>
  );
}
