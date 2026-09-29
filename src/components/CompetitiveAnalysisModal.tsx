'use client';

import React, { useState } from 'react';
import {
  X,
  TrendingDown,
  Globe,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Brain,
  ShieldAlert,
} from 'lucide-react';
import {
  CompetitiveImpactAnalysis,
} from '@/types/competitive';
import { formatINR } from '@/lib/api-client';
import { GOAT_COMPANY } from '@/config/company';

interface CompetitiveAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: CompetitiveImpactAnalysis | null;
  loading?: boolean;
}

export function CompetitiveAnalysisModal({
  isOpen,
  onClose,
  analysis,
  loading = false,
}: CompetitiveAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'competitors' | 'audit'>('scenarios');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="bg-[#121214] border border-white/20 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-white border border-white/20">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <span>Competitive Impact Analysis</span>
                {analysis && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 font-mono">
                    {GOAT_COMPANY.name}: {analysis.proposedChange.product}
                  </span>
                )}
              </h2>
              <p className="text-xs text-neutral-400">
                Deterministic Data + Hindsight Memory + Live Web Research + 3 Response Scenarios
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Globe className="w-8 h-8 text-white animate-spin" />
              <p className="text-sm text-neutral-200 font-medium">
                Researching competitors via Groq Browser Search & modeling response scenarios...
              </p>
              <p className="text-xs text-neutral-500">Cross-referencing Hindsight institutional memory bank</p>
            </div>
          )}

          {!loading && !analysis && (
            <div className="text-center py-16 text-neutral-400 text-sm">
              No competitive impact analysis data generated yet.
            </div>
          )}

          {!loading && analysis && (
            <>
              {/* Proposed Change Banner */}
              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] uppercase text-neutral-500 block">Product</span>
                  <div className="text-sm font-bold text-white mt-0.5 truncate">
                    {analysis.proposedChange.product}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-neutral-500 block">Current MSRP</span>
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
                  <span className="text-[10px] uppercase text-neutral-500 block">Price Move</span>
                  <div className="flex items-center gap-1 text-sm font-bold text-red-400 mt-0.5">
                    <TrendingDown className="w-4 h-4" />
                    <span>{analysis.proposedChange.percentageChange}%</span>
                  </div>
                </div>
              </div>

              {/* Observed Shift: Current vs Proposed Standing */}
              <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2 text-white font-semibold text-xs uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-white" />
                  <span>Market Standing Trajectory</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-neutral-950 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-neutral-500 font-semibold uppercase">Current Position:</span>
                    <p className="text-white font-bold">{analysis.currentPosition.rankingText}</p>
                    <p className="text-[11px] text-neutral-400 font-sans">{analysis.currentPosition.summary}</p>
                  </div>
                  <div className="bg-neutral-950 p-3.5 rounded-xl border border-white/15 space-y-1">
                    <span className="text-[10px] text-white font-semibold uppercase">Proposed Position:</span>
                    <p className="text-white font-bold">{analysis.proposedPosition.rankingText}</p>
                    <p className="text-[11px] text-neutral-300 font-sans">{analysis.proposedPosition.summary}</p>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <button
                  onClick={() => setActiveTab('scenarios')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
                    activeTab === 'scenarios'
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  3 Simulated Scenarios
                </button>
                <button
                  onClick={() => setActiveTab('competitors')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                    activeTab === 'competitors'
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Observed Competitors</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300">
                    {analysis.competitiveEvidence.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                    activeTab === 'audit'
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Audit Trail</span>
                </button>
              </div>

              {/* TAB 1: 3 Scenarios */}
              {activeTab === 'scenarios' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.scenarios.map((sc, idx) => (
                      <div
                        key={idx}
                        className="bg-neutral-900 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white">{sc.name}</span>
                            <span className="nothing-tag">SIMULATED</span>
                          </div>
                          <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                            {sc.description}
                          </p>

                          {/* Assumptions Pill */}
                          <div className="mt-2.5 p-2.5 bg-neutral-950 rounded-xl border border-white/5 text-[10px] space-y-1">
                            <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[9px] block">
                              Assumptions:
                            </span>
                            {sc.assumptions.map((as, aIdx) => (
                              <p key={aIdx} className="text-neutral-300 leading-normal font-sans">
                                • {as}
                              </p>
                            ))}
                          </div>

                          {/* Price Position */}
                          <div className="mt-2.5 text-xs">
                            <span className="text-neutral-500 text-[10px] uppercase">Position: </span>
                            <span className="font-semibold text-white">{sc.pricePosition}</span>
                          </div>

                          {/* Implications */}
                          <div className="mt-2.5 space-y-1">
                            <span className="text-neutral-500 text-[10px] uppercase block">
                              Implications:
                            </span>
                            {sc.competitiveImplications.map((imp, iIdx) => (
                              <p key={iIdx} className="text-[11px] text-neutral-300 font-sans">
                                ✓ {imp}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Risks */}
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

                  {/* Financial Disclaimer Banner */}
                  <div className="bg-neutral-900/40 border border-white/10 rounded-2xl p-3 text-xs text-neutral-300 flex items-start gap-2.5">
                    <Info className="w-4 h-4 shrink-0 text-white mt-0.5" />
                    <div>
                      <span className="font-semibold block uppercase text-[10px]">Financial Impact Policy:</span>
                      <p className="text-[11px] text-neutral-400 mt-0.5 font-sans">
                        {analysis.financialImpact.summary}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Observed Competitors & Sources */}
              {activeTab === 'competitors' && (
                <div className="space-y-4">
                  {analysis.competitiveEvidence.length === 0 ? (
                    <div className="p-6 text-center text-neutral-400 text-xs">
                      No external competitor pricing web evidence retrieved.
                    </div>
                  ) : (
                    <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-neutral-400 bg-neutral-950/60 font-mono">
                            <th className="py-2.5 px-4 font-semibold uppercase">Competitor</th>
                            <th className="py-2.5 px-4 font-semibold uppercase">Observed Price</th>
                            <th className="py-2.5 px-4 font-semibold uppercase">Price Gap vs Proposed</th>
                            <th className="py-2.5 px-4 font-semibold uppercase">Evidence Source</th>
                            <th className="py-2.5 px-4 font-semibold uppercase">Checked At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono">
                          {analysis.competitiveEvidence.map((ev, idx) => {
                            const compPrice = ev.numericPrice || 0;
                            const diff = analysis.proposedChange.proposedPrice - compPrice;
                            return (
                              <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 px-4 font-medium text-white">
                                  {ev.competitor}
                                </td>
                                <td className="py-3 px-4 font-bold text-white">
                                  {ev.value || (compPrice > 0 ? formatINR(compPrice) : 'N/A')}
                                </td>
                                <td className="py-3 px-4">
                                  {compPrice > 0 ? (
                                    <span
                                      className={`font-semibold ${
                                        diff < 0 ? 'text-emerald-400' : 'text-red-400'
                                      }`}
                                    >
                                      {diff < 0 ? 'Cheaper by ' : 'Higher by '}
                                      {formatINR(Math.abs(diff))}
                                    </span>
                                  ) : (
                                    <span className="text-neutral-500">Unpriced tier</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
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
                                <td className="py-3 px-4 text-neutral-400 text-[11px]">
                                  {ev.checkedAt}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Audit Trail */}
              {activeTab === 'audit' && (
                <div className="space-y-4">
                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 bg-neutral-900 rounded-xl border border-white/10 text-center">
                      <span className="text-neutral-400 block text-[10px] uppercase">Internal Facts Used</span>
                      <span className="text-base font-bold text-white mt-1 block">
                        {analysis.evidenceSummary.businessFacts} Verified
                      </span>
                    </div>
                    <div className="p-3.5 bg-neutral-900 rounded-xl border border-white/10 text-center">
                      <span className="text-neutral-400 block text-[10px] uppercase">Hindsight Memories</span>
                      <span className="text-base font-bold text-white mt-1 block">
                        {analysis.evidenceSummary.hindsightMemories} Memories
                      </span>
                    </div>
                    <div className="p-3.5 bg-neutral-900 rounded-xl border border-white/10 text-center">
                      <span className="text-neutral-400 block text-[10px] uppercase">Web Sources Cited</span>
                      <span className="text-base font-bold text-white mt-1 block">
                        {analysis.evidenceSummary.webSources} Sources
                      </span>
                    </div>
                    <div className="p-3.5 bg-neutral-900 rounded-xl border border-white/10 text-center">
                      <span className="text-neutral-400 block text-[10px] uppercase">Explicit Assumptions</span>
                      <span className="text-base font-bold text-white mt-1 block">
                        {analysis.evidenceSummary.assumptions} Stated
                      </span>
                    </div>
                  </div>

                  {/* Historical Hindsight Precedents */}
                  <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-white font-semibold text-xs uppercase">
                      <Brain className="w-4 h-4 text-white" />
                      <span>Hindsight Institutional Precedents Cited</span>
                    </div>
                    <div className="space-y-2 mt-2">
                      {analysis.historicalEvidence.slice(0, 5).map((h, i) => (
                        <div
                          key={i}
                          className="p-3 bg-neutral-950 rounded-xl border border-white/5 text-xs text-neutral-300 font-sans"
                        >
                          <span className="text-pink-300 font-mono text-[10px] block mb-0.5">
                            Precedent #{i + 1}
                          </span>
                          {h.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strategic Risks & Key Takeaways */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-neutral-900 border border-red-500/20 rounded-2xl p-4">
                      <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 mb-2 uppercase">
                        <ShieldAlert className="w-4 h-4" /> Strategic Competitive Risks
                      </span>
                      <ul className="text-xs text-neutral-300 space-y-1.5 font-sans">
                        {analysis.risks.map((r, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-1.5">
                            <span className="text-red-400 mt-0.5">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 mb-2 uppercase">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Key Strategic Takeaways
                      </span>
                      <ul className="text-xs text-neutral-300 space-y-1.5 font-sans">
                        {analysis.keyTakeaways.map((t, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-black/60 flex items-center justify-between text-xs text-neutral-400">
          <span>Hindsight Cloud Bank: <strong className="text-white font-mono">business-analyst</strong></span>
          <button
            onClick={onClose}
            className="btn-nothing-outline text-xs py-1.5 px-4 uppercase"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompetitiveAnalysisModal;
