import BusinessShell from '@/components/business/BusinessShell';
import EmailLogin from '@/components/business/EmailLogin';

export const metadata = { title: 'Business Login' };

export default function Page({ searchParams }) {
  return (
    <BusinessShell>
      <EmailLogin next={typeof searchParams?.next === 'string' ? searchParams.next : undefined} />
    </BusinessShell>
  );
}
