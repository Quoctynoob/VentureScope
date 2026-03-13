'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowUpDown,
  FolderCode,
  EllipsisVertical,
  Trash2,
} from 'lucide-react';
import { type Session } from '@/types';
import { deleteSessions } from '@/lib/actions/sessions';

const COLS = 12;

interface SessionsTableProps {
  sessions: Session[];
  sortKey: string;
  sortDir: string;
}

export function SessionsTable({ sessions, sortKey, sortDir }: SessionsTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const allSelected = sessions.length > 0 && sessions.every((s) => selected.has(s.id));
  const someSelected = !allSelected && sessions.some((s) => selected.has(s.id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        sessions.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        sessions.forEach((s) => next.add(s.id));
        return next;
      });
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteSessions(Array.from(selected));
      setSelected(new Set());
    } finally {
      setIsDeleting(false);
    }
  }

  function toggleSort(key: string) {
    const params = new URLSearchParams(window.location.search);
    if (sortKey === key) {
      params.set('dir', sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      params.set('sort', key);
      params.set('dir', 'asc');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                />
              </TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => toggleSort('industry')}
                >
                  Industry <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-slate-400" />
                </Button>
              </TableHead>
              <TableHead>Primary Region</TableHead>
              <TableHead>Revenue Model</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => toggleSort('confidence')}
                >
                  AI Confidence <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-slate-400" />
                </Button>
              </TableHead>
              <TableHead>Decision</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => toggleSort('createdAt')}
                >
                  Last Updated <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-slate-400" />
                </Button>
              </TableHead>
              <TableHead>Action</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLS + 1} className="text-center py-32">
                  <div className="flex flex-col items-center gap-2">
                    <span className="bg-slate-100 p-3 rounded-md inline-flex">
                      <FolderCode className="w-5 h-5 text-slate-800" />
                    </span>
                    <h1 className="text-base font-semibold text-slate-800">No Projects Yet</h1>
                    <div className="text-gray-500 text-sm">
                      Import your first pitch deck to get started
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((s) => (
                <TableRow
                  key={s.id}
                  data-selected={selected.has(s.id)}
                  className="data-[selected=true]:bg-slate-50"
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                      checked={selected.has(s.id)}
                      onChange={() => toggleOne(s.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{s.intake.company}</TableCell>
                  <TableCell className="text-slate-500">{s.intake.fundingStage}</TableCell>
                  <TableCell className="text-slate-500">{s.intake.industry}</TableCell>
                  <TableCell className="text-slate-500">{s.intake.primaryRegion ?? '—'}</TableCell>
                  <TableCell className="text-slate-500">{s.intake.revenueModel ?? '—'}</TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full border">
                      {s.riskLevel}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-18 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-500"
                          style={{ width: `${s.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 tabular-nums w-8 text-right">
                        {s.confidence}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">{s.intake.decision ?? '—'}</TableCell>
                  <TableCell className="text-slate-500">{s.intake.status ?? '—'}</TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {new Date(s.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <EllipsisVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/results?id=${s.id}`}>View</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Selection info and delete button */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 py-2 text-sm text-slate-500">
          <span>
            {selected.size} row{selected.size !== 1 ? 's' : ''} selected
          </span>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 h-7 px-2 text-xs"
          >
            <Trash2 className="h-3 w-3" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      )}
    </>
  );
}
