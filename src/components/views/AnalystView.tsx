'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  BrainCircuit,
  Sparkles,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  PlusCircle,
  Layers,
  History,
  RefreshCw,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { analysisApi, datasetsApi } from '@/lib/api-client';
import { Conversation, AIAnalysisResponse, Dataset } from '@/types';
import { GOAT_COMPANY, GOAT_PRODUCTS } from '@/config/company';

interface AnalystViewProps {
  onOpenDecisionModal: () => void;
  onOpenCompetitiveModal: () => void;
  onViewEvidence: (evidence: any[], title: string) => void;
}

export const AnalystView: React.FC<AnalystViewProps> = ({
  onOpenDecisionModal,
  onOpenCompetitiveModal,
  onViewEvidence,
}) => {
  // Datasets state
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');

  // Form state
  const [question, setQuestion] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<string>('Root Cause Analysis');

  // History & Active state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeAnalysisResult, setActiveAnalysisResult] = useState<AIAnalysisResponse | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string>('');
  const [rawBackendResult, setRawBackendResult] = useState<any>(null);

  // Loading state
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');

  const resultContainerRef = useRef<HTMLDivElement>(null);

  const exampleQuestions = [
    'What would happen competitively if we reduce GOAT Rockerz 550 price by 10%?',
    'Why did GOAT Rockerz 550 revenue drop in January 2026?',
    'What did we learn from our previous pricing experiments on GOAT Rockerz 550?',
    'Should GOAT reduce the price of GOAT Airdopes 141 against Boult Audio?',
  ];

  const analysisTypes = [
    'Root Cause Analysis',
    'Price Elasticity & Competitive Response',
    'Revenue & Margin Diagnostics',
    'Product Line Performance',
    'Predictive Recovery Scenario',
  ];

  useEffect(() => {
    datasetsApi
      .getDatasets()
      .then((items) => {
        setDatasets(items);
        if (items.length > 0) {
          const active = items.find((d) => d.isActive) || items[0];
          setSelectedDatasetId(active.id);
        }
      })
      .catch(() => {});

    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const convs = await analysisApi.getConversations();
      setConversations(convs);
      if (convs.length > 0 && !activeAnalysisResult) {
        const latest = convs[0];
        setActiveConversationId(latest.id);
        const msgs = await analysisApi.getConversationMessages(latest.id);
        const lastAstMsg = [...msgs].reverse().find((m) => m.role === 'assistant' && m.structuredOutput);
        const lastUserMsg = msgs.find((m) => m.role === 'user');
        if (lastAstMsg && lastAstMsg.structuredOutput) {
          setActiveAnalysisResult(lastAstMsg.structuredOutput);
          setActiveQuestion(lastUserMsg?.content || latest.title);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectConversation = async (conv: Conversation) => {
    setActiveConversationId(conv.id);
    try {
      const msgs = await analysisApi.getConversationMessages(conv.id);
      const astMsg = [...msgs].reverse().find((m) => m.role === 'assistant' && m.structuredOutput);
      const userMsg = msgs.find((m) => m.role === 'user');
      if (astMsg && astMsg.structuredOutput) {
        setActiveAnalysisResult(astMsg.structuredOutput);
        setActiveQuestion(userMsg?.content || conv.title);
      }
    } catch (e) {}
  };

  const handleNewAnalysis = () => {
    setActiveConversationId(null);
    setActiveAnalysisResult(null);
    setActiveQuestion('');
    setQuestion('');
    setRawBackendResult(null);
  };

  const handleClearHistory = async () => {
    await analysisApi.clearConversations();
    setConversations([]);
    setActiveConversationId(null);
    setActiveAnalysisResult(null);
    setActiveQuestion('');
    setRawBackendResult(null);
  };

  const handleRunAnalysis = async (customQuestion?: string) => {
    const query = (customQuestion || question).trim();
    if (!query || loading) return;

    setLoading(true);
    setActiveQuestion(query);

    setLoadingStage('Calculating deterministic business facts...');
    const s1 = setTimeout(() => setLoadingStage('Recalling historical experiences from Hindsight Cloud...'), 350);
    const s2 = setTimeout(() => setLoadingStage('Querying Groq LLM with combined context...'), 700);

    try {
      const res = await analysisApi.analyze(
        query,
        selectedDatasetId || undefined,
        analysisType,
        activeConversationId || undefined
      );

      clearTimeout(s1);
      clearTimeout(s2);

      setActiveConversationId(res.conversationId);
      setActiveAnalysisResult(res.aiResponse);
      setRawBackendResult(res.analysis);
      setQuestion('');

      const updatedConvs = await analysisApi.getConversations();
      setConversations(updatedConvs);

      setTimeout(() => {
        resultContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Analysis error:', err);
    } finally {
      clearTimeout(s1);
      clearTimeout(s2);
      setLoading(false);
      setLoadingStage('');
    }
  };

  return (
    <div className="space-y-8 pb-16 font-mono">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="glyph-dot-white" />
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
              AI Business Analyst
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1 font-sans">
            Groq reasoning engine grounded in deterministic math & persistent Hindsight Cloud memory.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {conversations.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-neutral-400 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center space-x-1.5 text-xs"
            >
              <History className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}

          <button
            onClick={handleNewAnalysis}
            className="btn-nothing-primary text-xs py-2 px-4 uppercase tracking-wider shadow-sm flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Analysis</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Panel & History */}
        <div className="lg:col-span-5 min-w-0 space-y-6">
          {/* Main Area: Analysis Input Panel */}
          <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-white" />
                Diagnostic Parameters
              </span>
              <span className="nothing-tag">GROQ + HINDSIGHT</span>
            </div>

            {/* 1. Select a Dataset */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase text-neutral-400 font-medium flex items-center justify-between">
                <span>Active Telemetry Source</span>
                <span className="text-[10px] text-neutral-500">{datasets.length} available</span>
              </label>
              <div className="relative">
                <select
                  value={selectedDatasetId}
                  onChange={(e) => setSelectedDatasetId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs focus:outline-none focus:border-white/40 appearance-none cursor-pointer"
                >
                  {datasets.length === 0 ? (
                    <option value="">{GOAT_COMPANY.name} Telemetry Baseline</option>
                  ) : (
                    datasets.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.rowCount} units)
                      </option>
                    ))
                  )}
                </select>
                <Database className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Select Analysis Type */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase text-neutral-400 font-medium">
                Diagnostic Method
              </label>
              <div className="relative">
                <select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs focus:outline-none focus:border-white/40 appearance-none cursor-pointer"
                >
                  {analysisTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <Layers className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. Enter Business Question */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase text-neutral-400 font-medium">
                  Business Inquiry
                </label>
                <span className="text-[10px] text-neutral-500">
                  {question.length}/250
                </span>
              </div>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about GOAT products, price changes, competitor pressure, or lessons..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs focus:outline-none focus:border-white/40 placeholder:text-neutral-600 resize-none font-sans"
              />
            </div>

            {/* Suggested Queries */}
            <div className="space-y-2">
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">
                Suggested Inquiries:
              </span>
              <div className="space-y-1.5">
                {exampleQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setQuestion(q);
                      handleRunAnalysis(q);
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-white/5 bg-neutral-900/50 hover:bg-neutral-800 hover:border-white/20 text-xs text-neutral-300 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span className="truncate pr-2 font-sans">{q}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Run Analysis Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleRunAnalysis()}
                disabled={loading || !question.trim()}
                className="w-full btn-nothing-primary py-3 uppercase tracking-wider shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Processing with Groq & Hindsight...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Run AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Past Analyses Session History */}
          <div className="rounded-3xl border border-white/10 bg-[#121214] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-semibold uppercase text-white flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-neutral-400" />
                Session History
              </span>
              <span className="text-[10px] text-neutral-500">
                {conversations.length} saved
              </span>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {conversations.length === 0 ? (
                <p className="text-xs text-neutral-500 py-2 text-center">
                  No previous inquiries recorded yet.
                </p>
              ) : (
                conversations.map((conv) => {
                  const isSelected = activeConversationId === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col space-y-1 ${
                        isSelected
                          ? 'border-white bg-white/10 text-white font-medium'
                          : 'border-white/5 bg-neutral-900/30 text-neutral-400 hover:text-white hover:border-white/15'
                      }`}
                    >
                      <span className="truncate font-sans">{conv.title}</span>
                      <span className="text-[10px] text-neutral-500">
                        {conv.updatedAt?.split('T')[0] || 'Today'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Loading State & Analysis Result */}
        <div ref={resultContainerRef} className="lg:col-span-7 min-w-0 space-y-6">
          {/* Loading State Animation */}
          {loading && (
            <div className="rounded-3xl border border-white/20 bg-neutral-900/60 p-8 text-center space-y-4 shadow-xl animate-fade-in">
              <div className="w-12 h-12 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white uppercase tracking-wider">
                  Hindsight Diagnostic Engine Active
                </h3>
                <p className="text-xs text-neutral-300 tracking-wide">
                  {loadingStage || 'Processing business data...'}
                </p>
              </div>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto font-sans">
                Running deterministic math, filtering anomalies, and verifying past institutional lessons from Hindsight Cloud bank.
              </p>
            </div>
          )}

          {/* Analysis Result */}
          {!loading && activeAnalysisResult ? (
            <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 space-y-6 shadow-xl animate-fade-in">
              {/* Question & Summary Header */}
              <div className="space-y-3 pb-5 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <span className="nothing-tag">
                    <span className="glyph-dot-white mr-1.5" />
                    VERIFIED AI BUSINESS DIAGNOSIS
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Groq LLM + Hindsight Cloud
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white tracking-tight font-sans">
                  "{activeQuestion}"
                </h2>

                {/* Structured Evidence Separation: Current Facts vs Memories vs Reasoning */}
                <div className="p-4 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      AI Executive Reasoning
                    </span>
                    <span className="nothing-tag">INTERPRETATION</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans whitespace-pre-line break-words">
                    {activeAnalysisResult.interpretation || activeAnalysisResult.summary}
                  </p>
                </div>
              </div>

              {/* Important Metrics (Deterministic Facts) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase text-neutral-400 tracking-wider font-semibold">
                    Current Business Facts (Deterministic Calculations)
                  </h3>
                  <span className="nothing-tag">FACTS</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {activeAnalysisResult.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-white/5 bg-neutral-900/50 space-y-1"
                    >
                      <span className="text-[10px] text-neutral-400 block truncate">
                        {m.label}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-white block">
                        {m.value}
                      </span>
                      {m.change && (
                        <span className="text-[10px] text-neutral-300 block truncate">
                          {m.change}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Supporting Trajectory Chart */}
              {activeAnalysisResult.supportingVisualization && (
                <div className="p-4 rounded-2xl border border-white/5 bg-neutral-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      {activeAnalysisResult.supportingVisualization.title}
                    </span>
                    <span className="nothing-tag">MOM TELEMETRY</span>
                  </div>

                  <div className="h-56 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activeAnalysisResult.supportingVisualization.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                        <XAxis
                          dataKey={activeAnalysisResult.supportingVisualization.xAxisKey}
                          stroke="#737373"
                          fontSize={10}
                          fontFamily="Space Mono"
                        />
                        <YAxis stroke="#737373" fontSize={10} fontFamily="Space Mono" tickFormatter={(v) => `₹${v / 1000}k`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#000000', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '16px', fontFamily: 'Space Mono', fontSize: '11px', color: '#fff' }}
                          formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="#ffffff" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Key Findings */}
              <div className="space-y-2.5">
                <h3 className="text-xs uppercase text-neutral-400 tracking-wider font-semibold">
                  Diagnostic Findings
                </h3>
                <div className="space-y-2">
                  {activeAnalysisResult.keyFindings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl border border-white/5 bg-neutral-900/30 flex items-start space-x-2.5 text-xs text-neutral-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-sans">{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {activeAnalysisResult.nextSteps && (
                <div className="space-y-2.5">
                  <h3 className="text-xs uppercase text-neutral-400 tracking-wider font-semibold">
                    Actionable Next Steps
                  </h3>
                  <div className="space-y-2">
                    {activeAnalysisResult.nextSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl border border-white/5 bg-neutral-900/40 flex items-start space-x-2.5 text-xs text-neutral-300"
                      >
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-sans">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historical Context / Retrievable Memory */}
              {activeAnalysisResult.historicalContext && activeAnalysisResult.historicalContext.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase text-neutral-400 font-semibold tracking-wider flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-neutral-400" />
                      Applied Institutional Memories ({activeAnalysisResult.historicalContext.length})
                    </span>
                    <button
                      onClick={() =>
                        onViewEvidence(
                          activeAnalysisResult.historicalContext.map((c) => ({
                            id: c.memoryId || 'mem-1',
                            text: c.action,
                            relevanceReason: c.lesson,
                          })),
                          activeQuestion
                        )
                      }
                      className="btn-nothing-outline text-xs py-1 px-3 uppercase"
                    >
                      Why did AI recommend this?
                    </button>
                  </div>
                  <div className="p-4 rounded-2xl border border-white/10 bg-neutral-900/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white font-sans">
                        {activeAnalysisResult.historicalContext[0].previousDecision}
                      </span>
                      <span className="nothing-tag">HINDSIGHT PRECEDENT</span>
                    </div>
                    <p className="text-xs text-neutral-300 font-sans">
                      <span className="text-white font-semibold">Institutional Lesson: </span>
                      {activeAnalysisResult.historicalContext[0].lesson}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Toolbar on Diagnosis */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
                <button
                  onClick={onOpenCompetitiveModal}
                  className="btn-nothing-outline text-xs py-2 px-4 uppercase tracking-wider flex items-center space-x-1.5"
                >
                  <Globe className="w-3.5 h-3.5 mr-1" />
                  <span>Model Competitive Scenarios</span>
                </button>

                <button
                  onClick={onOpenDecisionModal}
                  className="btn-nothing-primary text-xs py-2 px-4 uppercase tracking-wider flex items-center space-x-1.5 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  <span>Record Decision in Hindsight</span>
                </button>
              </div>
            </div>
          ) : !loading ? (
            /* Empty State */
            <div className="rounded-3xl border border-dashed border-white/15 bg-neutral-950/40 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-neutral-400 flex items-center justify-center mx-auto">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white uppercase tracking-wider">
                  Ready for Business Inquiry
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto font-sans">
                  Select a business question on the left or type a custom prompt to diagnose GOAT pricing, market elasticity, and competitor dynamics.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AnalystView;
