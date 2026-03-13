import { type Session, type SortKey, type SortDir } from '@/types';

export interface SessionFilters {
  search?: string;
  riskFilter?: string;
  sortKey?: SortKey;
  sortDir?: SortDir;
  page?: number;
  pageSize?: number;
}

export function filterAndSortSessions(
  sessions: Session[],
  filters: SessionFilters
) {
  const {
    search = '',
    riskFilter = 'all',
    sortKey = 'createdAt',
    sortDir = 'desc',
    page = 1,
    pageSize = 5,
  } = filters;

  let rows = [...sessions];

  // Apply search filter
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(
      (s) =>
        s.intake.company.toLowerCase().includes(q) ||
        s.intake.industry.toLowerCase().includes(q)
    );
  }

  // Apply risk filter
  if (riskFilter !== 'all') {
    rows = rows.filter((s) => s.riskLevel === riskFilter);
  }

  // Apply sorting
  rows.sort((a, b) => {
    let av: string | number;
    let bv: string | number;

    if (sortKey === 'industry') {
      av = a.intake.industry;
      bv = b.intake.industry;
    } else if (sortKey === 'confidence') {
      av = a.confidence;
      bv = b.confidence;
    } else {
      av = a.createdAt;
      bv = b.createdAt;
    }

    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const validPage = Math.min(Math.max(1, page), totalPages);
  const paginated = rows.slice((validPage - 1) * pageSize, validPage * pageSize);

  return {
    sessions: paginated,
    totalSessions: rows.length,
    totalPages,
    currentPage: validPage,
  };
}

export function parseSearchParams(searchParams: {
  [key: string]: string | string[] | undefined;
}): SessionFilters {
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const riskFilter = typeof searchParams.risk === 'string' ? searchParams.risk : 'all';
  const sortKey = (typeof searchParams.sort === 'string' ? searchParams.sort : 'createdAt') as SortKey;
  const sortDir = (typeof searchParams.dir === 'string' ? searchParams.dir : 'desc') as SortDir;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const pageSize = typeof searchParams.size === 'string' ? parseInt(searchParams.size, 10) : 5;

  return {
    search,
    riskFilter,
    sortKey,
    sortDir,
    page,
    pageSize,
  };
}
