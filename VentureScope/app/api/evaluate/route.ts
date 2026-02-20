import { NextRequest, NextResponse } from 'next/server';

const AGENTS_URL = 'https://api.you.com/v1/agents/runs';

// ─── Types ────────────────────────────────────────────────────────────────────

type Citation  = { title: string; url: string; snippet: string };
type AgentResult = { text: string; citations: Citation[] };

// ─── SSE-aware agent caller ───────────────────────────────────────────────────
// The Agents API always returns SSE (server-sent events), even when stream is
// not requested. We buffer the full response, parse each "data: {...}" line,
// stitch the text deltas together, and collect any citations that appear.

async function youAgent(input: string): Promise<AgentResult> {
  const apiKey = process.env.YOU_API_KEY!;

  const res = await fetch(AGENTS_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent: 'advanced',
      input,
      tools: [{ type: 'research' }],
      verbosity: 'medium',
      workflow_config: { max_workflow_steps: 5 },
    }),
  });

  if (!res.ok) throw new Error(`Agents API ${res.status}: ${await res.text()}`);

  // Buffer the entire SSE stream as plain text, then parse line by line
  const raw = await res.text();
  let fullText = '';
  const citations: Citation[] = [];

  for (const line of raw.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    try {
      const parsed = JSON.parse(line.slice(6));

      // Stitch text chunks together
      if (parsed.type === 'response.output_text.delta') {
        fullText += parsed.response?.delta ?? '';
      }

      // Citations can appear in different keys depending on API version
      const cites: Record<string, string>[] =
        parsed.citations ??
        parsed.response?.citations ??
        parsed.response?.search_results ??
        [];

      for (const c of cites) {
        citations.push({
          title:   c.title   ?? c.name  ?? '',
          url:     c.url     ?? c.link  ?? '',
          snippet: c.snippet ?? c.description ?? '',
        });
      }
    } catch { /* skip malformed SSE lines */ }
  }

  return { text: fullText, citations };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const {
      startupName,
      industry,
      primaryGeography,
      knownCompetitors         = [] as string[],
      coreProblemStatement,
      proposedSolutionOverview,
      targetCustomerProfile,
      revenueModelStructure,
      businessModelExplanation,
      competitiveDifferentiators,
      fundingStage,
      monthlyRecurringRevenue,
      activeCustomerCount,
      monthOverMonthGrowth,
    } = data;

    // All 5 calls run in parallel — Agents API only, no Search API
    const [
      industryNewsResult,
      competitorLinksResult,
      synthesisResult,
      tamResult,
      riskResult,
    ] = await Promise.all([

      // 1. Recent industry news (replaces Search API)
      youAgent(
        `Find the 5 most recent and relevant news articles about startups or companies in the ${industry} industry, specifically related to this problem: "${coreProblemStatement}".

For each article provide:
- Title
- Source URL
- One-sentence summary

Focus on 2025–2026 news. Cite your sources.`
      ),

      // 2. Competitor pages (replaces Search API)
      (knownCompetitors as string[]).length > 0
        ? youAgent(
            `Find the official website and pricing page for each of these companies: ${(knownCompetitors as string[]).join(', ')}.

For each company return:
- Company name
- Homepage URL
- Pricing page URL (if publicly available)

Cite your sources.`
          )
        : Promise.resolve<AgentResult>({ text: 'No competitors listed.', citations: [] }),

      // 3. Problem / Solution / ICP → AI Research Synthesis
      youAgent(
        `You are a senior venture analyst writing an AI Research Synthesis report section.

Startup: ${startupName} (${industry})
Problem: ${coreProblemStatement}
Solution: ${proposedSolutionOverview}
Ideal Customer Profile (ICP): ${targetCustomerProfile}

Write 3 concise paragraphs:
1. Problem clarity and market pain severity
2. Solution uniqueness and feasibility
3. ICP fit and go-to-market alignment

Be direct, analytical, and grounded in evidence. Cite sources where possible.`
      ),

      // 4. Primary Geography → localized TAM estimate
      youAgent(
        `You are a market research analyst specializing in regional market sizing.

Startup: ${startupName}
Industry: ${industry}
Problem: ${coreProblemStatement}
Target Region: ${primaryGeography}

Provide a concise TAM (Total Addressable Market) estimate ONLY for the ${primaryGeography} region. Include:
- Estimated market size in USD
- Key growth drivers in this region
- Any region-specific risks or regulatory considerations

Cite real data sources where available.`
      ),

      // 5. Revenue Model / Business Model → Risk & Confidence Layer
      youAgent(
        `You are a venture risk analyst evaluating startup business model viability.

Startup: ${startupName}
Industry: ${industry}
Stage: ${fundingStage ?? 'Unknown'}
Revenue Model: ${revenueModelStructure}
Business Model: ${businessModelExplanation}
Competitive Differentiators: ${competitiveDifferentiators}
${monthlyRecurringRevenue ? `MRR: ${monthlyRecurringRevenue}` : ''}
${activeCustomerCount     ? `Active Customers: ${activeCustomerCount}` : ''}
${monthOverMonthGrowth    ? `MoM Growth: ${monthOverMonthGrowth}` : ''}

Return a structured evaluation with:
1. Risk Level: Low / Medium / High — with a one-sentence justification
2. Confidence Score: 0–100% — based on model clarity, market fit, and differentiation strength
3. Benchmark: How does this model compare to typical ${industry} companies at the ${fundingStage ?? 'current'} stage?

Be concise and direct.`
      ),
    ]);

    return NextResponse.json({
      industryNews:    { text: industryNewsResult.text,    citations: industryNewsResult.citations    },
      competitorLinks: { text: competitorLinksResult.text, citations: competitorLinksResult.citations },
      synthesis:       { text: synthesisResult.text,       citations: synthesisResult.citations       },
      tamData:         { text: tamResult.text,              citations: tamResult.citations             },
      riskScore:       { text: riskResult.text,             citations: riskResult.citations            },
    });

  } catch (err: unknown) {
    console.error('[/api/evaluate]', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
