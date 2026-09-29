import { Groq } from 'groq-sdk';
import { MemoryEvidenceItem } from '@/types/business';
import {
  CompetitiveCalculations,
  CompetitiveScenario,
  WebEvidence,
} from '@/types/competitive';
import { DEMO_COMPANY } from '@/config/company';

let groqClientInstance: Groq | null = null;

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not configured.');
  }

  if (!groqClientInstance) {
    groqClientInstance = new Groq({ apiKey });
  }

  return groqClientInstance;
}

export interface AnalystInputParams {
  query: string;
  currentDataContext: string;
  recalledMemories: MemoryEvidenceItem[];
  hindsightReflectSummary?: string;
  detectedProduct?: string | null;
}

export interface AnalystResponseOutput {
  reply: string;
  model: string;
  evidenceUsedCount: number;
}

/**
 * Generate comprehensive strategic business intelligence combining:
 * 1. Current deterministic metrics (calculated via TypeScript math engine)
 * 2. Retrieved institutional memories from Hindsight
 * 3. Cognitive reflection from Hindsight (when available)
 * 4. High-performance LLM synthesis via Groq
 */
export async function generateBusinessAnalystInsight({
  query,
  currentDataContext,
  recalledMemories,
  hindsightReflectSummary,
  detectedProduct,
}: AnalystInputParams): Promise<AnalystResponseOutput> {
  const groq = getGroqClient();
  const primaryModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const fallbackModel = 'qwen/qwen3.8-27b';

  // Format memories for Groq context
  const memoriesFormatted =
    recalledMemories.length > 0
      ? recalledMemories
          .slice(0, 15) // Keep top 15 most relevant to respect token budgets
          .map((m, idx) => `[Memory Precedent ${idx + 1}]: ${m.text}`)
          .join('\n')
      : 'No prior historical decisions or precedents found in Hindsight bank for this query.';

  const systemPrompt = `You are BizMind, the Lead AI Business Decision Analyst operating for ${DEMO_COMPANY.fullName} ("${DEMO_COMPANY.name}").
${DEMO_COMPANY.name} is our demo consumer-electronics company in India specializing in ${DEMO_COMPANY.primaryCategory} (e.g., GOAT Rockerz 550, GOAT Airdopes 141, GOAT Nirvana 751, GOAT Stone 350).
You possess institutional memory powered by Hindsight and deliver strategic decision intelligence.

CORE OPERATIONAL PRINCIPLES:
1. STRICT ADHERENCE TO DETERMINISTIC NUMBERS:
   Do NOT calculate, alter, or invent numerical metrics. Use the exact verified figures provided in CURRENT BUSINESS FACTS.
2. CLEAR THREE-PART RESPONSE ARCHITECTURE:
   Format your response with the following markdown sections:
   ### 1. CURRENT BUSINESS FACTS
   Summarize current verified performance, revenue, units, and MoM deltas without recalculating them.
   
   ### 2. HISTORICAL PRECEDENTS & INSTITUTIONAL MEMORY (Hindsight)
   Explicitly cite what the business tried previously, the rationale, what happened afterward, and what lesson was learned. If no precedent exists, state clearly that no corporate memory exists.
   
   ### 3. STRATEGIC ANALYSIS & RECOMMENDATION
   Synthesize the current situation with past lessons. Explain whether past strategies apply, highlight differences (e.g. price elasticity, product tier, margins), and provide actionable strategic advice.
3. PREVENT BLIND REPLICATION:
   Never recommend blindly copying a previous decision if conditions differ between products or market environments.`;

  const userPrompt = `USER INQUIRY:
"${query}"
${detectedProduct ? `Targeted Product Focus: ${detectedProduct}` : ''}

==================================================
VERIFIED CURRENT BUSINESS DATA (Calculated Deterministically):
==================================================
${currentDataContext}

==================================================
RETRIEVED HINDSIGHT HISTORICAL MEMORIES (Corporate Precedents):
==================================================
${memoriesFormatted}

${
  hindsightReflectSummary
    ? `==================================================
HINDSIGHT COGNITIVE REFLECTION SYNTHESIS:
==================================================
${hindsightReflectSummary.substring(0, 1500)}`
    : ''
}

Please synthesize these inputs and deliver your structured business counsel.`;

  const modelsToTry = [primaryModel, fallbackModel].filter(
    (m, idx, arr) => arr.indexOf(m) === idx
  );

  let lastError: any = null;

  for (const modelToUse of modelsToTry) {
    try {
      const completion = await groq.chat.completions.create({
        model: modelToUse,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      const reply =
        completion.choices?.[0]?.message?.content ||
        'Unable to generate an analysis at this moment.';

      return {
        reply,
        model: modelToUse,
        evidenceUsedCount: recalledMemories.length,
      };
    } catch (err: any) {
      console.warn(`[Groq] Model ${modelToUse} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All configured Groq models failed to generate response.');
}

export interface CompetitiveSynthesisParams {
  product: string;
  calculations: CompetitiveCalculations;
  webEvidence: WebEvidence[];
  historicalMemories: MemoryEvidenceItem[];
  scenarios: CompetitiveScenario[];
  internalBusinessContext: string;
}

export interface CompetitiveSynthesisOutput {
  strategicSummary: string;
  currentPositionSummary: string;
  proposedPositionSummary: string;
  financialImpactSummary: string;
  risks: string[];
  keyTakeaways: string[];
  historicalRelevanceStatement: string;
}

/**
 * Synthesizes Competitive Impact Analysis adhering strictly to epistemic boundaries:
 * - Never claims certainty on competitor future reactions.
 * - Never claims revenue or elasticity increases without explicit disclaimers.
 * - Distinguishes facts from assumptions and simulations.
 */
export async function generateCompetitiveSynthesis({
  product,
  calculations,
  webEvidence,
  historicalMemories,
  scenarios,
  internalBusinessContext,
}: CompetitiveSynthesisParams): Promise<CompetitiveSynthesisOutput> {
  const groq = getGroqClient();
  const primaryModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  const webSummary =
    webEvidence.length > 0
      ? webEvidence
          .map(
            (w, i) =>
              `- Competitor: ${w.competitor} | Price: ${w.value || 'N/A'} | Source: [${w.sourceTitle || w.sourceDomain}](${w.sourceUrl})`
          )
          .join('\n')
      : 'No live web competitor sources retrieved. Using baseline market assumptions.';

  const memoriesSummary =
    historicalMemories.length > 0
      ? historicalMemories.map((m, i) => `- Memory ${i + 1}: ${m.text}`).join('\n')
      : 'No previous price interventions found in company Hindsight memory.';

  const scenariosSummary = scenarios
    .map(
      (s) =>
        `### ${s.name}
Assumptions: ${s.assumptions.join('; ')}
Company Price: ₹${s.companyPrice} vs Observed Competitors: ${JSON.stringify(s.competitorPrices)}
Position: ${s.pricePosition}`
    )
    .join('\n\n');

  const systemPrompt = `You are BizMind, the Senior Corporate Strategy & Competitive Decision Intelligence platform operating for ${DEMO_COMPANY.fullName} ("${DEMO_COMPANY.name}").
${DEMO_COMPANY.name} is our demo consumer-electronics company in India specializing in ${DEMO_COMPANY.primaryCategory}.
Real competitors in India's consumer audio market include boAt, Noise, Boult, JBL, Sony, and Realme.
You deliver auditable, rigorous competitive impact assessments combining ${DEMO_COMPANY.name}'s internal business data, Hindsight memory, live web competitive research, and deterministic scenario models.

MANDATORY EPISTEMIC PRINCIPLES:
1. NEVER declare what competitors WILL do. Always frame future actions as: "Scenario: If competitors respond by..."
2. NEVER guarantee financial returns or declare "Revenue will increase by X%". If elasticity is unknown, explicitly declare: "Competitive price position can be evaluated, but revenue impact cannot be reliably estimated without a demand-response assumption or sufficient historical evidence."
3. NEVER state "This worked before so it will work here." Say: "A previous strategy produced this outcome under different conditions. Its relevance to the current situation is limited/medium/high based on available evidence."
4. STRICTLY SEPARATE:
   - CURRENT BUSINESS FACTS (Deterministic metrics)
   - HISTORICAL MEMORY (Hindsight institutional experience)
   - WEB COMPETITIVE INTELLIGENCE (Live observed pricing)
   - ASSUMPTIONS & SIMULATED SCENARIOS (Hypothetical models)
5. BE CONCISE: Keep each string field to 1-2 tight sentences so the JSON completes within token limits.

Return your response as a valid JSON object matching this structure:
{
  "strategicSummary": "High-level strategic briefing contrasting current vs proposed competitive dynamics.",
  "currentPositionSummary": "Precise summary of current price standing relative to observed competitors.",
  "proposedPositionSummary": "Summary of proposed price standing and expected initial shift.",
  "historicalRelevanceStatement": "Nuanced statement comparing previous Hindsight pricing lessons to this specific product.",
  "financialImpactSummary": "Cautious financial appraisal declaring data availability and demand caveats.",
  "risks": ["Risk 1", "Risk 2", "Risk 3"],
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]
}`;

  const userPrompt = `PRODUCT UNDER ANALYSIS: ${product}
Proposed Price Move: ₹${calculations.companyCurrentPrice.toLocaleString()} -> ₹${calculations.proposedPrice.toLocaleString()} (${calculations.percentageChange}%)

==================================================
CURRENT COMPANY DATA (Deterministic verified metrics):
==================================================
${internalBusinessContext}
Calculated Position: ${calculations.currentPositionText}
Calculated Proposed Position: ${calculations.proposedPositionText}
Observed Competitor Average: ₹${calculations.avgObservedCompetitorPrice.toLocaleString()}

==================================================
CURRENT WEB EVIDENCE (Publicly observed competitor offers):
==================================================
${webSummary}

==================================================
HISTORICAL HINDSIGHT PRECEDENTS (Institutional Memory):
==================================================
${memoriesSummary}

==================================================
DETERMINISTIC SIMULATION SCENARIOS:
==================================================
${scenariosSummary}

Deliver your structured JSON assessment now.`;

  const modelsToTry = [primaryModel, 'qwen/qwen3.8-27b'].filter(
    (m, idx, arr) => arr.indexOf(m) === idx
  );

  for (const modelToUse of modelsToTry) {
    try {
      const res = await groq.chat.completions.create({
        model: modelToUse,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 800,
      });

      const rawContent = res.choices[0]?.message?.content || '{}';
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawContent);

      return {
        strategicSummary:
          parsed.strategicSummary ||
          `Reducing ${product} to ₹${calculations.proposedPrice.toLocaleString()} moves your pricing ${calculations.proposedPositionText}.`,
        currentPositionSummary:
          parsed.currentPositionSummary ||
          `Currently ${calculations.currentPositionText} (Average observed: ₹${calculations.avgObservedCompetitorPrice.toLocaleString()}).`,
        proposedPositionSummary:
          parsed.proposedPositionSummary ||
          `Under proposed pricing of ₹${calculations.proposedPrice.toLocaleString()}, your position becomes ${calculations.proposedPositionText}.`,
        historicalRelevanceStatement:
          parsed.historicalRelevanceStatement ||
          'Historical pricing experiments in Hindsight provide contextual precedent regarding elasticity, but must not be treated as a guaranteed forecast for this product tier.',
        financialImpactSummary:
          parsed.financialImpactSummary ||
          'Competitive price position can be evaluated, but revenue impact cannot be reliably estimated without a demand-response assumption or sufficient historical evidence.',
        risks: Array.isArray(parsed.risks) && parsed.risks.length > 0
          ? parsed.risks
          : [
              'Gross margin compression if unit volume lift does not overcome discount delta.',
              'Competitor matching price cuts eroding initial pricing edge.',
              'Potential customer hesitation regarding perceived product value.',
            ],
        keyTakeaways: Array.isArray(parsed.keyTakeaways) && parsed.keyTakeaways.length > 0
          ? parsed.keyTakeaways
          : [
              `Proposed price moves ${product} from ${calculations.currentPositionText} to ${calculations.proposedPositionText}.`,
              'Competitor reaction scenarios determine whether advantage is temporary or sustained.',
              'Maintain focus on differentiated value rather than entering an unhedged price war.',
            ],
      };
    } catch (modelErr: any) {
      console.warn(`[Groq Competitive Synthesis] Model ${modelToUse} note:`, modelErr.message);
    }
  }

  // Fallback if all models fail
  return {
    strategicSummary: `Moving ${product} from ₹${calculations.companyCurrentPrice.toLocaleString()} to ₹${calculations.proposedPrice.toLocaleString()} (${calculations.percentageChange}%) shifts observed standing from ${calculations.currentPositionText} to ${calculations.proposedPositionText}.`,
    currentPositionSummary: `Currently ${calculations.currentPositionText} across observed market competitors.`,
    proposedPositionSummary: `At ₹${calculations.proposedPrice.toLocaleString()}, standing improves to ${calculations.proposedPositionText}.`,
    historicalRelevanceStatement:
      'Hindsight memories document prior pricing experiments on GOAT Rockerz 550, but distinct audio product tiers have different demand elasticities and require tailored strategic execution.',
    financialImpactSummary:
      'Competitive price position can be evaluated, but revenue impact cannot be reliably estimated without a demand-response assumption or sufficient historical evidence.',
    risks: [
      'Risk of initiating price matching across observed competitors.',
      'Margin compression without guaranteed demand elasticity.',
      'Uncertainty from incomplete competitor promotion telemetry.',
    ],
    keyTakeaways: [
      `Initial position improves to ${calculations.proposedPositionText}.`,
      'Scenario models show outcomes under no response, partial matching, and full retaliation.',
      'Review Hindsight evidence before committing capital.',
    ],
  };
}
