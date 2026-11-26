// Owner portal pages are private — keep them out of search engines.
export const metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function BusinessLayout({ children }) {
  return children;
}
