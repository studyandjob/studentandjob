import BusinessShell from '@/components/business/BusinessShell';
import ResetPasswordForm from '@/components/business/ResetPasswordForm';

export const metadata = { title: 'Reset Password' };

export default function Page() {
  return (
    <BusinessShell>
      <ResetPasswordForm />
    </BusinessShell>
  );
}
