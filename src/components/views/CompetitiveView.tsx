'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Sparkles,
  TrendingDown,
  RefreshCw,
  Layers,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Brain,
} from 'lucide-react';
import { CompetitiveImpactAnalysis } from '@/types/competitive';
import { formatINR } from '@/lib/api-client';
import { GOAT_COMPANY, GOAT_PRODUCTS } from '@/config/company';

interface CompetitiveViewProps {
  onOpenDecisionModal: () => void;
}

export const CompetitiveView: React.FC<CompetitiveViewProps> = ({ onOpenDecisionModal }) => {
  const [selectedProduct, setSelectedProduct] = useState('GOAT Rockerz 550');
  const [currentPrice, setCurrentPrice] = useState(1499);
  const [proposedPrice, setProposedPrice] = useState(1349);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CompetitiveImpactAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'competitors' | 'audit'>('scenarios');

  // Sync default price when product changes
  const handleProductChange = (prodName: string) => {
    setSelectedProduct(prodName);
    const found = GOAT_PRODUCTS.find((p) => p.name === prodName);
    if (found) {
      setCurrentPrice(found.typicalPrice);
      setProposedPrice(Math.round(found.typicalPrice * 0.9));
    }
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/competitive-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: selectedProduct,
          currentPrice,
          proposedPrice,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (e) {
      console.error('Competitive analysis error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunAnalysis();
  }, []);

  return (
    <div className="space-y-8 pb-16 font-mono">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="glyph-dot-white" />
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
              Competitive Impact Analysis
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1 font-sans">
            Groq Browser Search on live competitors (boAt, Noise, Boult) combined with 3 response scenarios & Hindsight recall.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunAnalysis}
            disabled={loading}
            className="btn-nothing-primary text-xs py-2 px-4 uppercase tracking-wider flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Researching Web...' : 'Run Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Input Parameters Card */}
      <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <span className="text-xs uppercase font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-white" />
            Marketplace Simulation Parameters
          </span>
          <span className="nothing-tag">GAME THEORETIC MODEL</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] uppercase text-neutral-400 font-semibold block mb-1">
              Select GOAT Audio Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs focus:outline-none focus:border-white/40 appearance-none cursor-pointer"
            >
              {GOAT_PRODUCTS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase text-neutral-400 font-semibold block mb-1">
              Current MSRP (₹)
            </label>
            <input
              type="number"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs focus:outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase text-neutral-400 font-semibold block mb-1">
              Proposed Price (₹)
            </label>
            <input
              type="number"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs focus:outline-none focus:border-white/40"
            />
          </div>
        </div>

        {/* Quick Markdown % Pills */}
        <div className="flex items-center gap-2 pt-2">
          <span className="text-[10px] uppercase text-neutral-500">Quick Test:</span>
          {[-5, -10, -15, -20].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => setProposedPrice(Math.round(currentPrice * (1 + pct / 100)))}
              className="px-2.5 py-1 rounded-full border border-white/10 bg-neutral-900 text-neutral-300 hover:text-white hover:border-white/30 text-xs transition-colors"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Loading Feedback */}
      {loading && (
        <div className="rounded-3xl border border-white/20 bg-neutral-900/60 p-12 text-center space-y-4">
          <Globe className="w-10 h-10 text-white animate-spin mx-auto" />
          <h3 className="text-base font-semibold text-white uppercase tracking-wider">
            Conducting Competitor Web Intelligence
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto font-sans">
            Searching boAt, Noise, and Boult pricing structures across Indian e-commerce marketplaces and synthesizing 3 game-theoretic response scenarios.
          </p>
        </div>
      )}

      {/* Analysis Results Display */}
      {!loading && analysis && (
        <div className="space-y-6 animate-fade-in">
          {/* Key Metric Strip */}
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] uppercase text-neutral-500 block">Product</span>
              <div className="text-sm font-bold text-white mt-0.5 truncate">
                {analysis.proposedChange.product}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase text-neutral-500 block">Current Price</span>
              <div className="text-sm font-bold text-white mt-0.5">
                {formatINR(analysis.proposedChange.currentPrice)}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase text-neutral-500 block">Proposed Price</span>
              <div className="text-sm font-bold text-white mt-0.5">
                {formatINR(analysis.proposedChange.proposedPrice)}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase text-neutral-500 block">Delta Percentage</span>
              <div className="flex items-center gap-1 text-sm font-bold text-red-400 mt-0.5">
                <TrendingDown className="w-4 h-4" />
                <span>{analysis.proposedChange.percentageChange}%</span>
              </div>
            </div>
          </div>

          {/* Market Standing Shift */}
          <div className="bg-neutral-900/60 border border-white/10 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-white" />
                Market Standing Shift
              </span>
              <span className="nothing-tag">POSITIONING</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-neutral-950 p-4 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] text-neutral-500 font-semibold uppercase">Current Standing:</span>
                <p className="text-white font-bold">{analysis.currentPosition.rankingText}</p>
                <p className="text-[11px] text-neutral-400 font-sans">{analysis.currentPosition.summary}</p>
              </div>
              <div className="bg-neutral-950 p-4 rounded-2xl border border-white/15 space-y-1">
                <span className="text-[10px] text-white font-semibold uppercase">Proposed Standing:</span>
                <p className="text-white font-bold">{analysis.proposedPosition.rankingText}</p>
                <p className="text-[11px] text-neutral-300 font-sans">{analysis.proposedPosition.summary}</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-colors ${
                activeTab === 'scenarios' ? 'bg-white text-black font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              3 Simulated Response Scenarios
            </button>
            <button
              onClick={() => setActiveTab('competitors')}
              className={`px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                activeTab === 'competitors' ? 'bg-white text-black font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Observed Competitors ({analysis.competitiveEvidence.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-colors ${
                activeTab === 'audit' ? 'bg-white text-black font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Evidence & Audit Proof
            </button>
          </div>

          {/* TAB 1: 3 Simulated Scenarios */}
          {activeTab === 'scenarios' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.scenarios.map((sc, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-900 border border-white/10 rounded-3xl p-5 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{sc.name}</span>
                        <span className="nothing-tag">SIMULATED</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed font-sans mt-1">
                        {sc.description}
                      </p>

                      <div className="mt-3 p-2.5 bg-neutral-950 rounded-xl border border-white/5 text-[10px] space-y-1">
                        <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[9px] block">
                          Assumptions:
                        </span>
                        {sc.assumptions.map((as, aIdx) => (
                          <p key={aIdx} className="text-neutral-300 leading-normal font-sans">
                            • {as}
                          </p>
                        ))}
                      </div>

                      <div className="mt-3 text-xs">
                        <span className="text-neutral-500 text-[10px] uppercase">Position: </span>
                        <span className="font-semibold text-white">{sc.pricePosition}</span>
                      </div>

                      <div className="mt-3 space-y-1">
                        <span className="text-neutral-500 text-[10px] uppercase block font-semibold">
                          Implications:
                        </span>
                        {sc.competitiveImplications.map((imp, iIdx) => (
                          <p key={iIdx} className="text-[11px] text-neutral-300 font-sans">
                            ✓ {imp}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <span className="text-red-400 text-[10px] font-semibold flex items-center gap-1 mb-1">
                        <AlertCircle className="w-3 h-3" /> Key Risk:
                      </span>
                      <p className="text-[11px] text-neutral-400 leading-normal font-sans">
                        {sc.risks[0] || 'Competitive retaliation.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Observed Competitor Pricing Table */}
          {activeTab === 'competitors' && (
            <div className="bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-neutral-400 bg-neutral-950/60">
                      <th className="py-3 px-4 font-semibold uppercase">Competitor</th>
                      <th className="py-3 px-4 font-semibold uppercase">Observed Price</th>
                      <th className="py-3 px-4 font-semibold uppercase">Price Gap vs Proposed</th>
                      <th className="py-3 px-4 font-semibold uppercase">Evidence Source</th>
                      <th className="py-3 px-4 font-semibold uppercase">Checked At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {analysis.competitiveEvidence.map((ev, idx) => {
                      const compPrice = ev.numericPrice || 0;
                      const diff = analysis.proposedChange.proposedPrice - compPrice;
                      return (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-white">{ev.competitor}</td>
                          <td className="py-3.5 px-4 font-bold text-white">
                            {ev.value || (compPrice > 0 ? formatINR(compPrice) : 'N/A')}
                          </td>
                          <td className="py-3.5 px-4">
                            {compPrice > 0 ? (
                              <span className={`font-semibold ${diff < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {diff < 0 ? 'Cheaper by ' : 'Higher by '}
                                {formatINR(Math.abs(diff))}
                              </span>
                            ) : (
                              <span className="text-neutral-500">Tier match</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <a
                              href={ev.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-white hover:text-neutral-300 flex items-center gap-1 underline"
                            >
                              <span>{ev.sourceTitle || ev.sourceDomain || 'Public Source'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-400 text-[11px]">{ev.checkedAt}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Evidence & Audit Proof */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-neutral-900 rounded-2xl border border-white/10 text-center">
                  <span className="text-neutral-400 block text-[10px] uppercase">Internal Facts</span>
                  <span className="text-base font-bold text-white mt-1 block">
                    {analysis.evidenceSummary.businessFacts} Verified
                  </span>
                </div>
                <div className="p-3.5 bg-neutral-900 rounded-2xl border border-white/10 text-center">
                  <span className="text-neutral-400 block text-[10px] uppercase">Hindsight Memories</span>
                  <span className="text-base font-bold text-white mt-1 block">
                    {analysis.evidenceSummary.hindsightMemories} Memories
                  </span>
                </div>
                <div className="p-3.5 bg-neutral-900 rounded-2xl border border-white/10 text-center">
                  <span className="text-neutral-400 block text-[10px] uppercase">Web Sources</span>
                  <span className="text-base font-bold text-white mt-1 block">
                    {analysis.evidenceSummary.webSources} Sources
                  </span>
                </div>
                <div className="p-3.5 bg-neutral-900 rounded-2xl border border-white/10 text-center">
                  <span className="text-neutral-400 block text-[10px] uppercase">Assumptions</span>
                  <span className="text-base font-bold text-white mt-1 block">
                    {analysis.evidenceSummary.assumptions} Stated
                  </span>
                </div>
              </div>

              {/* Historical Precedents */}
              <div className="bg-neutral-900 border border-white/10 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold text-xs uppercase">
                  <Brain className="w-4 h-4 text-white" />
                  <span>Hindsight Institutional Precedents Cited</span>
                </div>
                <div className="space-y-2 mt-2">
                  {analysis.historicalEvidence.slice(0, 5).map((h, i) => (
                    <div key={i} className="p-3 bg-neutral-950 rounded-xl border border-white/5 text-xs text-neutral-300 font-sans">
                      <span className="text-pink-300 font-mono text-[10px] block mb-0.5">Precedent #{i + 1}</span>
                      {h.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-2">
                <button
                  onClick={onOpenDecisionModal}
                  className="btn-nothing-primary text-xs py-2.5 px-5 uppercase tracking-wider"
                >
                  Record Strategic Action in Hindsight
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompetitiveView;
