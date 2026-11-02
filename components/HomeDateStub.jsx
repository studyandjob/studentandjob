import { daysRemaining, toDateKey } from '@/lib/jobStatus';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** The "last date" shown as a small stub: day over month. Red when 3 days or fewer remain. */
export default function HomeDateStub({ lastDate, size = 'md' }) {
  const key = toDateKey(lastDate);
  const dims = size === 'sm' ? 'h-12 w-12' : 'h-14 w-14';
  if (!key) {
    return (
      <div className={`flex ${dims} flex-shrink-0 flex-col items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-[11px] font-semibold text-gray-500`}>
        Open
      </div>
    );
  }
  const [, m, d] = key.split('-').map(Number);
  const left = daysRemaining(lastDate);
  const urgent = left !== null && left <= 3;
  return (
    <div
      className={`flex ${dims} flex-shrink-0 flex-col items-center justify-center rounded-md border ${
        urgent ? 'border-red-200 bg-red-50 text-red-700' : 'border-brand-100 bg-brand-50 text-brand-800'
      }`}
      title={`Last date: ${d} ${MONTHS[m - 1]}`}
    >
      <span className="text-lg font-bold leading-none">{String(d).padStart(2, '0')}</span>
      <span className="mt-0.5 text-[11px] font-semibold uppercase leading-none">{MONTHS[m - 1]}</span>
    </div>
  );
}

export function daysLeftLabel(lastDate) {
  const left = daysRemaining(lastDate);
  if (left === null || left < 0) return '';
  if (left === 0) return 'Closes today';
  if (left === 1) return '1 day left';
  if (left <= 7) return `${left} days left`;
  return '';
}
