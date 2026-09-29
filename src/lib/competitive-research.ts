import { Groq } from 'groq-sdk';
import { WebEvidence } from '@/types/competitive';

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

export interface ResearchCompetitorParams {
  product: string;
  category?: string;
  targetCompetitors?: string[];
  currentPrice?: number;
}

export interface ResearchCompetitorResult {
  evidence: WebEvidence[];
  observedPrices: Record<string, number>;
  searchSummary: string;
  webSearchAvailable: boolean;
  searchNotice?: string;
}

/**
 * Conduct live competitive web research using Groq's openai/gpt-oss-120b with browser_search tool.
 * Extracts observed competitor prices, promotions, features, and source citations.
 */
export async function conductCompetitiveWebResearch({
  product,
  category = 'commercial enterprise products',
  targetCompetitors = [],
  currentPrice,
}: ResearchCompetitorParams): Promise<ResearchCompetitorResult> {
  const checkedAt = new Date().toISOString().split('T')[0];

  const groq = getGroqClient();

  const competitorsPrompt =
    targetCompetitors.length > 0
      ? `Specific competitors to research: ${targetCompetitors.join(', ')}.`
      : `Identify 3 realistic, major market competitors for ${product} in the ${category} category in India/global market.`;

  const systemPrompt = `You are a specialized competitive intelligence research agent.
You utilize browser search to discover verified, publicly observable competitor retail prices, discounts, and promotions.

RULES:
1. Search the web for current pricing of competing products.
2. Return factual, public information with verifiable source URLs.
3. For every competitor found, provide:
   - Competitor / Brand Name
   - Exact observed price in INR (₹) or local currency (numeric value)
   - Features / Package Tier / Promotional condition
   - Source URL from which this price was retrieved.
4. If a competitor has multiple tiers, select the closest equivalent tier.
5. End your response with a clear JSON block between \`\`\`json and \`\`\` in this exact format:
{
  "competitors": [
    {
      "name": "Competitor Name",
      "price": 950,
      "currency": "INR",
      "tier": "Standard / Pro",
      "claim": "Price is ₹950 per unit on Amazon/Official Store",
      "sourceUrl": "https://example.com/product",
      "sourceTitle": "Official Product Page",
      "evidenceType": "pricing"
    }
  ]
}`;

  const userPrompt = `Conduct competitive research for our product: "${product}".
${currentPrice ? `Our current price is approximately ₹${currentPrice.toLocaleString()}.` : ''}
${competitorsPrompt}

Search for their current live retail pricing, active discounts, and promotional offers. Include URLs.`;

  try {
    const res = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      tools: [{ type: 'browser_search' }],
      max_tokens: 1200,
    });

    const choice = res.choices[0];
    const rawContent = choice?.message?.content || '';
    const executedTools = (choice?.message as any)?.executed_tools || [];

    // Extract citations / source URLs from executed tools
    const urlMap = new Map<string, string>();
    for (const tool of executedTools) {
      if (tool.search_results && Array.isArray(tool.search_results.results)) {
        for (const item of tool.search_results.results) {
          if (item.url) {
            try {
              const domain = new URL(item.url).hostname.replace('www.', '');
              urlMap.set(domain, item.url);
            } catch {}
          }
        }
      }
    }

    // Parse structured JSON block if present
    const evidenceList: WebEvidence[] = [];
    const observedPrices: Record<string, number> = {};

    const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (Array.isArray(parsed.competitors)) {
          for (const item of parsed.competitors) {
            const numericPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price);
            if (!isNaN(numericPrice) && numericPrice > 0) {
              observedPrices[item.name] = numericPrice;
            }

            let sourceUrl = item.sourceUrl || '';
            let domain = 'web-source';
            try {
              if (sourceUrl) domain = new URL(sourceUrl).hostname.replace('www.', '');
            } catch {}

            evidenceList.push({
              competitor: item.name,
              claim: item.claim || `Observed price: ₹${numericPrice.toLocaleString()}`,
              value: `₹${numericPrice.toLocaleString()}`,
              numericPrice: !isNaN(numericPrice) ? numericPrice : undefined,
              sourceUrl: sourceUrl || 'https://groq.browser.search',
              sourceTitle: item.sourceTitle || `${item.name} Price Listing`,
              sourceDomain: domain,
              checkedAt,
              evidenceType: item.evidenceType || 'pricing',
            });
          }
        }
      } catch (parseErr) {
        console.warn('[Competitive Research] Failed to parse JSON block from search output:', parseErr);
      }
    }

    // If JSON parsing was sparse, extract from markdown tables or text patterns
    if (evidenceList.length === 0) {
      // Regex pattern to extract competitor names and INR prices: e.g. "Zoho: ₹1,300" or "| Zoho | ₹1,300 |"
      const lines = rawContent.split('\n');
      for (const line of lines) {
        const priceMatch = line.match(/(?:₹|Rs\.?|INR)\s*([0-9,]+)/i);
        if (priceMatch) {
          const rawNum = priceMatch[1].replace(/,/g, '');
          const price = parseFloat(rawNum);
          if (!isNaN(price) && price > 50 && price < 500000) {
            // Find candidate name in line
            const cleanLine = line.replace(/[|*#`]/g, '').trim();
            const candidateName = cleanLine.split(/[:–-]/)[0]?.trim().slice(0, 30) || 'Market Competitor';

            if (!observedPrices[candidateName]) {
              observedPrices[candidateName] = price;
              evidenceList.push({
                competitor: candidateName,
                claim: cleanLine.slice(0, 140),
                value: `₹${price.toLocaleString()}`,
                numericPrice: price,
                sourceUrl: 'https://groq.browser.search/observed-result',
                sourceTitle: `${candidateName} Market Price`,
                sourceDomain: 'public-listing',
                checkedAt,
                evidenceType: 'pricing',
              });
            }
          }
        }
      }
    }

    return {
      evidence: evidenceList,
      observedPrices,
      searchSummary: rawContent.split('```json')[0].trim(),
      webSearchAvailable: true,
    };
  } catch (err: any) {
    console.warn('[Competitive Research] Live web search encountered error:', err.message);
    return {
      evidence: [],
      observedPrices: {},
      searchSummary: 'Live competitive intelligence is unavailable. The analysis uses internal business data and historical memory only.',
      webSearchAvailable: false,
      searchNotice: `Web search notice: ${err.message}`,
    };
  }
}
