import { Suspense } from 'react';
import { getSessionById } from '@/lib/actions/sessions';
import { ResultsContent } from '@/components/results/results-content';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function ResultsWrapper({ searchParams }: PageProps) {
  const params = await searchParams;
  const id = typeof params.id === 'string' ? params.id : undefined;

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        No session ID provided. Please select a session from the dashboard.
      </div>
    );
  }

  const session = await getSessionById(id);

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Session not found. Please complete the evaluation first.
      </div>
    );
  }

  const generatedAt = new Date(session.createdAt).toLocaleString();

  return (
    <ResultsContent
      result={session.result}
      intake={session.intake}
      generatedAt={generatedAt}
      sessionId={id}
    />
  );
}

export default function ResultsPage({ searchParams }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading…</div>
      }
    >
      <ResultsWrapper searchParams={searchParams} />
    </Suspense>
  );
}
