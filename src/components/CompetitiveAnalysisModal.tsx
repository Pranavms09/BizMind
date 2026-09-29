'use client';

import React, { useState } from 'react';
import {
  X,
  TrendingDown,
  TrendingUp,
  Globe,
  Brain,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  CompetitiveImpactAnalysis,
  CompetitiveScenario,
  WebEvidence,
} from '@/types/competitive';
import { formatINR } from '@/lib/analytics';
import { DEMO_COMPANY } from '@/config/company';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Competitive Impact Analysis</span>
                {analysis && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                    {DEMO_COMPANY.name}: {analysis.proposedChange.product}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Auditable decision intelligence: Internal Data + Hindsight Memory + Live Web Research + Scenario Modeling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Globe className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm text-slate-300 font-medium">
                Researching competitors via Groq Browser Search & modeling response scenarios...
              </p>
              <p className="text-xs text-slate-500">Cross-referencing Hindsight institutional memory bank</p>
            </div>
          )}

          {!loading && !analysis && (
            <div className="text-center py-16 text-slate-400 text-sm">
              No competitive impact analysis data generated yet.
            </div>
          )}

          {!loading && analysis && (
            <>
              {/* Proposed Change Banner */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[11px] text-slate-400">Product Under Analysis</span>
                  <div className="text-sm font-bold text-white mt-0.5 truncate">
                    {analysis.proposedChange.product}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Current Unit Price</span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {formatINR(analysis.proposedChange.currentPrice)}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Proposed Price</span>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5">
                    {formatINR(analysis.proposedChange.proposedPrice)}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Price Move</span>
                  <div className="flex items-center gap-1 text-sm font-bold text-rose-400 mt-0.5">
                    <TrendingDown className="w-4 h-4" />
                    <span>{analysis.proposedChange.percentageChange}%</span>
                  </div>
                </div>
              </div>

              {/* Observed Shift: Current vs Proposed Standing */}
              <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-xs">
                  <Layers className="w-4 h-4" />
                  <span>Observed Competitive Standing Shift</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Current Position:</span>
                    <p className="text-slate-200 font-semibold mt-1">
                      {analysis.currentPosition.rankingText}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {analysis.currentPosition.summary}
                    </p>
                  </div>
                  <div className="bg-cyan-950/30 p-3 rounded-lg border border-cyan-800/40">
                    <span className="text-[11px] text-cyan-400 font-medium">Proposed Position:</span>
                    <p className="text-cyan-200 font-semibold mt-1">
                      {analysis.proposedPosition.rankingText}
                    </p>
                    <p className="text-[11px] text-cyan-300/80 mt-0.5">
                      {analysis.proposedPosition.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab('scenarios')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'scenarios'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  3 Simulated Response Scenarios
                </button>
                <button
                  onClick={() => setActiveTab('competitors')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'competitors'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>Observed Competitors</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    {analysis.competitiveEvidence.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'audit'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>Why This Analysis? (Audit Proof)</span>
                </button>
              </div>

              {/* TAB 1: 3 Scenarios */}
              {activeTab === 'scenarios' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.scenarios.map((sc, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white">{sc.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                              Simulated
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {sc.description}
                          </p>

                          {/* Assumptions Pill */}
                          <div className="mt-2.5 p-2 bg-slate-900 rounded-lg border border-slate-800 text-[10px] space-y-1">
                            <span className="text-amber-400 font-semibold uppercase tracking-wider text-[9px] block">
                              Explicit Assumption:
                            </span>
                            {sc.assumptions.map((as, aIdx) => (
                              <p key={aIdx} className="text-slate-300 leading-normal">
                                • {as}
                              </p>
                            ))}
                          </div>

                          {/* Price Position */}
                          <div className="mt-2.5 text-xs">
                            <span className="text-slate-400 text-[11px]">Resulting Position: </span>
                            <span className="font-semibold text-cyan-300">{sc.pricePosition}</span>
                          </div>

                          {/* Implications */}
                          <div className="mt-2.5 space-y-1">
                            <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider block">
                              Implications:
                            </span>
                            {sc.competitiveImplications.map((imp, iIdx) => (
                              <p key={iIdx} className="text-[11px] text-slate-300">
                                ✓ {imp}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Risks */}
                        <div className="pt-2 border-t border-slate-800/80">
                          <span className="text-rose-400 text-[10px] font-medium flex items-center gap-1 mb-1">
                            <AlertCircle className="w-3 h-3" /> Key Scenario Risk:
                          </span>
                          <p className="text-[11px] text-rose-300/80 leading-normal">
                            {sc.risks[0] || 'Competitive retaliation.'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial Disclaimer Banner */}
                  <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-3 text-xs text-amber-300/90 flex items-start gap-2.5">
                    <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Financial Impact Policy:</span>
                      <p className="text-[11px] text-amber-200/80 mt-0.5">
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
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No external competitor pricing web evidence retrieved.
                    </div>
                  ) : (
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                            <th className="py-2.5 px-4 font-semibold">Competitor</th>
                            <th className="py-2.5 px-4 font-semibold">Observed Price</th>
                            <th className="py-2.5 px-4 font-semibold">Price Gap vs Proposed</th>
                            <th className="py-2.5 px-4 font-semibold">Evidence / Source</th>
                            <th className="py-2.5 px-4 font-semibold">Checked At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {analysis.competitiveEvidence.map((ev, idx) => {
                            const compPrice = ev.numericPrice || 0;
                            const diff = analysis.proposedChange.proposedPrice - compPrice;
                            return (
                              <tr key={idx} className="hover:bg-slate-900/40">
                                <td className="py-3 px-4 font-medium text-white">
                                  {ev.competitor}
                                </td>
                                <td className="py-3 px-4 font-bold text-cyan-400">
                                  {ev.value || (compPrice > 0 ? formatINR(compPrice) : 'N/A')}
                                </td>
                                <td className="py-3 px-4">
                                  {compPrice > 0 ? (
                                    <span
                                      className={`font-semibold ${
                                        diff < 0 ? 'text-emerald-400' : 'text-rose-400'
                                      }`}
                                    >
                                      {diff < 0 ? 'Cheaper by ' : 'Higher by '}
                                      {formatINR(Math.abs(diff))}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">Unpriced tier</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <a
                                    href={ev.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline"
                                  >
                                    <span>{ev.sourceTitle || ev.sourceDomain || 'Public Source'}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </td>
                                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
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

              {/* TAB 3: Why This Analysis? (Auditable Evidence Summary) */}
              {activeTab === 'audit' && (
                <div className="space-y-4">
                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                      <span className="text-slate-400 block text-[11px]">Internal Facts Used</span>
                      <span className="text-lg font-bold text-white mt-1 block">
                        {analysis.evidenceSummary.businessFacts} Verified
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                      <span className="text-slate-400 block text-[11px]">Hindsight Memories</span>
                      <span className="text-lg font-bold text-cyan-400 mt-1 block">
                        {analysis.evidenceSummary.hindsightMemories} Memories
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                      <span className="text-slate-400 block text-[11px]">Web Sources Cited</span>
                      <span className="text-lg font-bold text-indigo-400 mt-1 block">
                        {analysis.evidenceSummary.webSources} Sources
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                      <span className="text-slate-400 block text-[11px]">Explicit Assumptions</span>
                      <span className="text-lg font-bold text-amber-400 mt-1 block">
                        {analysis.evidenceSummary.assumptions} Stated
                      </span>
                    </div>
                  </div>

                  {/* Historical Hindsight Precedents */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                      <Brain className="w-4 h-4" />
                      <span>Hindsight Institutional Precedents Cited</span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic">
                      "Historical experience provides supporting context on price elasticity, but is not a guaranteed prediction."
                    </p>
                    <div className="space-y-2 mt-2">
                      {analysis.historicalEvidence.slice(0, 5).map((h, i) => (
                        <div
                          key={i}
                          className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] text-slate-300"
                        >
                          <span className="text-cyan-400 font-mono text-[10px] block mb-0.5">
                            Precedent #{i + 1}
                          </span>
                          {h.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strategic Risks & Key Takeaways */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-4">
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-2">
                        <ShieldAlert className="w-4 h-4" /> Strategic Competitive Risks
                      </span>
                      <ul className="text-xs text-rose-200/80 space-y-1.5">
                        {analysis.risks.map((r, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-1.5">
                            <span className="text-rose-400 mt-0.5">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-4 h-4" /> Key Strategic Takeaways
                      </span>
                      <ul className="text-xs text-emerald-200/80 space-y-1.5">
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
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>Hindsight Bank: <strong className="text-white font-mono">business-analyst</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
