import { Session } from '@/types/models';

const SEGMENTS = [
  { key: 'extraction',   name: 'Extraction',   label: 'ingesting',     color: '#E8F2FF' },
  { key: 'parse',        name: 'Parse',        label: 're-evaluating', color: '#ACA7C9' },
  { key: 'review',       name: 'Review',       label: '',              color: '#E56B6F' },
  { key: 'verification', name: 'Verification', label: 'fact checking', color: '#8DC1FF' },
  { key: 'score',        name: 'Score',        label: 'scoring',       color: '#202D56' },
  { key: 'export',       name: 'Export',       label: 'exporting',     color: '#4FA49F' },
] as const;

type SegmentKey = (typeof SEGMENTS)[number]['key'];

// TODO: compute real per-stage counts once `currentStep` is added to the Session type.
// Map currentStep strings → segment keys:
//   "Researching" | "Extracting content" → extraction
//   "Extracting VC"                       → parse
//   "Fact-checking"                        → verification
//   "Fundability"                          → score
//   "Generating"                           → export
function getPercentages(_sessions: Session[]): Record<SegmentKey, number> {
  return { extraction: 20, parse: 15, review: 5, verification: 20, score: 20, export: 20 };
}

interface PipelineBarProps {
  sessions: Session[];
}

export function PipelineBar({ sessions }: PipelineBarProps) {
  const pcts = getPercentages(sessions);

  return (
    <div className="w-full rounded-lg border bg-white px-4 py-3 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-700">Total Progress</span>
          <span className="text-xs text-slate-400">{sessions.length} Documents</span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {SEGMENTS.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-slate-500">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Segmented bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {SEGMENTS.map((s) => (
          <div
            key={s.key}
            style={{ width: `${pcts[s.key]}%`, backgroundColor: s.color }}
          />
        ))}
      </div>

      {/* Labels below each segment — positioned at the left edge */}
      <div className="mt-1 flex w-full">
        {SEGMENTS.map((s) => (
          <div key={s.key} style={{ width: `${pcts[s.key]}%` }}>
            {s.label && (
              <span className="text-[10px] leading-none text-slate-400">{s.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
