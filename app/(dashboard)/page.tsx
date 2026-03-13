import { getSessions } from '@/lib/actions/sessions';
import { filterAndSortSessions, parseSearchParams } from '@/lib/session-utils';
import { SessionsToolbar } from '@/components/sessions/sessions-toolbar';
import { SessionsTable } from '@/components/sessions/sessions-table';
import { PaginationControls } from '@/components/sessions/pagination-controls';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseSearchParams(params);

  // Fetch sessions from server action
  const allSessions = await getSessions();

  // Filter and paginate
  const { sessions, totalSessions, totalPages, currentPage } = filterAndSortSessions(
    allSessions,
    filters
  );

  // Check if there are any sessions at all
  const hasNoSessions = allSessions.length === 0;
  const hasNoResults = !hasNoSessions && sessions.length === 0;

  return (
    <>
      {/* Heading */}
      <div className="mb-6">
        <h1 className="m-0 text-3xl font-semibold text-slate-900">Current Batch</h1>
      </div>

      {/* Toolbar */}
      <SessionsToolbar />

      {/* Sessions table */}
      {hasNoResults ? (
        <div className="rounded-md border bg-white p-10 text-center text-slate-400">
          No results match your filters.
        </div>
      ) : (
        <SessionsTable
          sessions={sessions}
          sortKey={filters.sortKey || 'createdAt'}
          sortDir={filters.sortDir || 'desc'}
        />
      )}

      {/* Pagination */}
      {!hasNoSessions && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={filters.pageSize || 5}
          totalItems={totalSessions}
        />
      )}
    </>
  );
}
