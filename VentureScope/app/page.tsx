import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus } from 'lucide-react';

type Research = {
  startupName: string;
  status: string;
  confidence: string;
  riskLevel: string;
  lastUpdated: string;
};

// Replace with real API data
const RESEARCH: Research[] = [];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* Heading */}
      <div className="mb-6">
        <h1 className="m-0 text-[22px] font-bold text-slate-900">Recent Research</h1>
      </div>

      {/* Toolbar: button left, title right */}
      <div className="flex items-center justify-between py-4 border-b border-slate-100">
        <h3 className="text-[15px] font-bold text-slate-900">Recent Research</h3>
        <Link href="/projectintake"><Button><Plus />New Projects</Button></Link>
      </div>

      {/* Recent Research table */}
      <div className="bg-white rounded-l shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Startup Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Confidence %</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {RESEARCH.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400 py-10">
                  No research data yet.
                </TableCell>
              </TableRow>
            ) : (
              RESEARCH.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.startupName}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>{r.confidence}</TableCell>
                  <TableCell>{r.riskLevel}</TableCell>
                  <TableCell>{r.lastUpdated}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
