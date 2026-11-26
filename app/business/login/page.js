import BusinessShell from '@/components/business/BusinessShell';
import BusinessAuthForm from '@/components/business/BusinessAuthForm';

export const metadata = { title: 'Business Login' };

export default function Page({ searchParams }) {
  return (
    <BusinessShell>
      <BusinessAuthForm mode="login" next={typeof searchParams?.next === 'string' ? searchParams.next : undefined} />
    </BusinessShell>
  );
}
