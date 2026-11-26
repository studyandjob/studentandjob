import BusinessShell from '@/components/business/BusinessShell';
import BusinessAuthForm from '@/components/business/BusinessAuthForm';

export const metadata = { title: 'Add Your Business' };

export default function Page() {
  return (
    <BusinessShell>
      <BusinessAuthForm mode="register" />
    </BusinessShell>
  );
}
