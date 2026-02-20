'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Section    = { text: string; citations: unknown[] };
type EvalResult = {
  industryNews:    Section;
  competitorLinks: Section;
  synthesis:       Section;
  tamData:         Section;
  riskScore:       Section;
};
type IntakeData = {
  startupName: string;
  industry:    string;
  fundingStage: string;
};
type RiskLevel = 'Low' | 'Medium' | 'High';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseRiskScore(text: string): {
  confidence: number;
  riskLevel: RiskLevel;
  justification: string;
  rationale: string;
} {
  const confidenceMatch = text.match(/Confidence Score[^:*]*[:\*]+\s*\*?\*?(\d+)%/i);
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 75;

  const riskMatch = text.match(/Risk Level[^:*]*[:\*]+\s*\*?\*?(Low|Medium|High)/i);
  const riskLevel = (riskMatch?.[1] ?? 'Medium') as RiskLevel;

  const justMatch = text.match(/[Jj]ustification[:\*\s]+([^\n]+)/);
  const justification = justMatch ? justMatch[1].replace(/\*/g, '').trim() : '';

  const rationaleMatch = text.match(/[Rr]ationale[:\*\s]+([\s\S]+?)(?=\n---|\n###)/);
  const rationale = rationaleMatch ? rationaleMatch[1].replace(/\*/g, '').replace(/-\s+/g, '').trim() : '';

  return { confidence, riskLevel, justification, rationale };
}

function splitTamData(text: string): { main: string; risks: string } {
  const idx = text.search(/###\s+\d*\.?\s*[Rr]egion.{0,20}[Rr]isk/);
  if (idx === -1) return { main: text, risks: '' };
  return { main: text.slice(0, idx).trim(), risks: text.slice(idx).trim() };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const RISK_STYLES: Record<RiskLevel, { badge: string; dot: string; label: string }> = {
  Low:    { badge: 'bg-green-50 border-green-200 text-green-800', dot: 'bg-green-500', label: 'Low Risk'    },
  Medium: { badge: 'bg-amber-50 border-amber-200 text-amber-800', dot: 'bg-amber-500', label: 'Medium Risk' },
  High:   { badge: 'bg-red-50 border-red-200 text-red-800',       dot: 'bg-red-500',   label: 'High Risk'   },
};

function CircularProgress({ value }: { value: number }) {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
      <circle
        cx="60" cy="60" r={r}
        fill="none"
        stroke="#1B3A6B"
        strokeWidth="10"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="56" textAnchor="middle" fontSize="20" fontWeight="700" fill="#0f172a">{value}%</text>
      <text x="60" y="74" textAnchor="middle" fontSize="10" fill="#94a3b8">confidence</text>
    </svg>
  );
}

// Shared ReactMarkdown config — enables tables, styled links, blockquotes, etc.
function Markdown({ children, prose = true }: { children: string; prose?: boolean }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-xl font-bold text-slate-900 mt-6 mb-3">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-bold text-slate-800 mt-5 mb-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-semibold text-slate-800 mt-4 mb-2">{children}</h3>,
        p:  ({ children }) => <p  className="text-sm text-slate-700 leading-relaxed mb-3">{children}</p>,
        a:  ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{children}</a>,
        ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-sm text-slate-700">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm text-slate-700">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-dark-blue bg-blue-50 px-4 py-3 my-4 rounded-r-lg text-sm text-slate-700 italic">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="w-full text-xs border-collapse border border-slate-200 rounded">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
        th: ({ children }) => <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">{children}</th>,
        td: ({ children }) => <td className="border border-slate-200 px-3 py-2 text-slate-600">{children}</td>,
        hr: () => <hr className="border-slate-200 my-4" />,
        strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const [result, setResult]   = useState<EvalResult | null>(null);
  const [intake, setIntake]   = useState<IntakeData | null>(null);

  useEffect(() => {
    const r = localStorage.getItem('ventureScope_result');
    const i = localStorage.getItem('ventureScope_intake');
    if (r) setResult(JSON.parse(r));
    if (i) setIntake(JSON.parse(i));
  }, []);

  if (!result || !intake) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        No results found. Please complete the evaluation first.
      </div>
    );
  }

  const { confidence, riskLevel, justification, rationale } = parseRiskScore(result.riskScore.text);
  const riskStyle = RISK_STYLES[riskLevel] ?? RISK_STYLES.Medium;
  const { main: tamMain, risks: tamRisks } = splitTamData(result.tamData.text);

  return (
    <div className="space-y-8">

      {/* ── 1. Dashboard Header ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white -mx-7 px-7 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-slate-900">
            Validation Memo: {intake.startupName}
          </h1>
          <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
            {intake.industry}
          </span>
          <span className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
            {intake.fundingStage}
          </span>
        </div>
        <Button size="sm" variant="outline" className="rounded-sm shrink-0">
          <FileDown className="w-3.5 h-3.5 mr-1.5" /> Download PDF
        </Button>
      </div>

      {/* ── 2. Executive Verdict ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Card A: Confidence Score */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col items-center gap-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Confidence Score</p>
          <CircularProgress value={confidence} />
        </div>

        {/* Card B: Risk Level */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col items-center justify-center gap-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Risk Level</p>
          <div className={`flex items-center gap-2 border rounded-full px-4 py-2 ${riskStyle.badge}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${riskStyle.dot}`} />
            <span className="text-lg font-bold">{riskStyle.label}</span>
          </div>
          {justification && (
            <p className="text-xs text-slate-500 text-center leading-relaxed">{justification}</p>
          )}
        </div>

        {/* Card C: TL;DR Rationale */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">TL;DR</p>
          <p className="text-sm text-slate-700 leading-relaxed">{rationale || justification}</p>
        </div>

      </div>

      {/* ── 3. AI Research Synthesis ──────────────────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-8">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-dark-blue rounded-full inline-block" />
          AI Research Synthesis
        </h2>
        <Markdown>{result.synthesis.text}</Markdown>
      </div>

      {/* ── 4. Market Sizing & Economics ─────────────────────────────────── */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-dark-blue rounded-full inline-block" />
          Market Sizing & Economics
        </h2>
        <div className="grid grid-cols-2 gap-6">

          {/* Left: TAM data */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <Markdown>{tamMain}</Markdown>
          </div>

          {/* Right: Risks */}
          <div className="bg-red-50 border border-red-100 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-red-400 rounded-full inline-block" />
              Region-Specific Risks
            </h3>
            {tamRisks ? (
              <Markdown>{tamRisks}</Markdown>
            ) : (
              <p className="text-sm text-red-700">No region-specific risks extracted.</p>
            )}
          </div>

        </div>
      </div>

      {/* ── 5. Live Market Signals ────────────────────────────────────────── */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-dark-blue rounded-full inline-block" />
          Live Market Signals
        </h2>
        <div className="grid grid-cols-2 gap-6">

          {/* Left: Industry News */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Industry News</h3>
            <Markdown>{result.industryNews.text}</Markdown>
          </div>

          {/* Right: Competitors */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Competitor Intelligence</h3>
            <Markdown>{result.competitorLinks.text}</Markdown>
          </div>

        </div>
      </div>

    </div>
  );
}
