'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ExamRunner from '@/components/StudyZone/ExamRunner';

// This page is intentionally a client component throughout — an exam in
// progress (live timer, one-question-at-a-time state) has nothing to gain
// from server rendering, and keeping it client-side avoids ever caching a
// student's in-progress paper. Header/Footer fall back to their built-in
// site name when no settings are passed, same as any other client page.
export default function TestSessionPage({ params }) {
  return (
    <>
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
          <ExamRunner sessionId={params.sessionId} />
        </div>
      </main>

      <Footer />
    </>
  );
}
