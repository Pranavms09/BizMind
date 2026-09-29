'use client';

import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  PlusCircle,
  Search,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Target,
  Trash2,
  X,
  FileText,
} from 'lucide-react';
import { decisionsApi } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';
import { Decision } from '@/types';

interface DecisionsViewProps {
  onOpenCreateModal?: () => void;
  onOpenOutcomeModal?: (decisionId: string) => void;
}

export const DecisionsView: React.FC<DecisionsViewProps> = ({
  onOpenCreateModal,
  onOpenOutcomeModal,
}) => {
  const { showToast } = useToast();

  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Local modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);

  // New Decision Form Fields
  const [formData, setFormData] = useState({
    title: '',
    context: '',
    optionsConsidered: '',
    chosenAction: '',
    expectedOutcome: '',
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
  });

  // Record Outcome Form Fields
  const [outcomeData, setOutcomeData] = useState({
    actualOutcome: '',
    value: 577372,
    metric: 'Outcome Delta',
    notes: '',
    expectationMet: true,
  });

  const fetchDecisions = async () => {
    setLoading(true);
    try {
      const items = await decisionsApi.getDecisions();
      setDecisions(Array.isArray(items) ? items : []);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch decisions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, []);

  const handleDeleteDecision = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await decisionsApi.deleteDecision(id);
      showToast('Decision removed from registry.', 'success');
      fetchDecisions();
    } catch {
      showToast('Failed to delete decision', 'error');
    }
  };

  const handleLoadDemoDecisions = async () => {
    try {
      await decisionsApi.loadDemoDecisions();
      showToast('GOAT sample business decisions loaded.', 'success');
      fetchDecisions();
    } catch {
      showToast('Failed to load sample decisions', 'error');
    }
  };

  const handleClearAllDecisions = async () => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to clear all decisions?')) {
      await decisionsApi.clearAllDecisions();
      showToast('All decisions removed. Clean registry active.', 'success');
      fetchDecisions();
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !(formData.chosenAction || formData.title).trim()) {
      showToast('Please fill out the decision title and chosen action.', 'error');
      return;
    }

    try {
      await decisionsApi.createDecision({
        title: formData.title,
        context: formData.context,
        optionsConsidered: formData.optionsConsidered,
        chosenAction: formData.chosenAction,
        expectedOutcome: formData.expectedOutcome || '+15% unit sales growth',
        date: formData.date,
        status: formData.status,
      });
      showToast('Business decision logged successfully.', 'success');
      setCreateModalOpen(false);
      setFormData({
        title: '',
        context: '',
        optionsConsidered: '',
        chosenAction: '',
        expectedOutcome: '',
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
      });
      fetchDecisions();
    } catch (err: any) {
      showToast(err.message || 'Failed to log decision', 'error');
    }
  };

  const handleRecordOutcomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDecision) return;

    try {
      await decisionsApi.recordOutcome(selectedDecision.id, outcomeData);
      showToast('Outcome recorded and synchronized to Hindsight memory.', 'success');
      setOutcomeModalOpen(false);
      setSelectedDecision(null);
      fetchDecisions();
    } catch (err: any) {
      showToast(err.message || 'Failed to record outcome', 'error');
    }
  };

  // Normalize statuses for filtering
  const getNormalizedStatus = (d: any): 'Pending' | 'In Progress' | 'Completed' => {
    const s = String(d.status || '').toLowerCase();
    if (s.includes('eval') || s.includes('complete')) return 'Completed';
    if (s.includes('prog') || s.includes('active')) return 'In Progress';
    return 'Pending';
  };

  const filteredDecisions = decisions.filter((d: any) => {
    const norm = getNormalizedStatus(d);
    const matchesFilter = filter === 'All' || norm === filter;
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.context && d.context.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.chosenAction && d.chosenAction.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: 'Pending' | 'In Progress' | 'Completed') => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
              Decisions
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Formulate strategic hypotheses, log choices, and track outcomes over time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLoadDemoDecisions}
            className="px-3.5 py-2 rounded-lg border border-pink-500/30 bg-pink-500/10 text-pink-300 font-semibold text-xs hover:bg-pink-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Decisions</span>
          </button>

          {decisions.length > 0 && (
            <button
              onClick={handleClearAllDecisions}
              className="px-3 py-2 rounded-lg border border-white/10 bg-neutral-900 text-neutral-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all flex items-center space-x-1.5 text-xs font-mono cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          <button
            onClick={() => (onOpenCreateModal ? onOpenCreateModal() : setCreateModalOpen(true))}
            className="btn-nothing-primary px-4 py-2 flex items-center space-x-2 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Decision</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search decisions by title, context, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white/30"
          />
        </div>

        <div className="flex rounded-xl border border-white/10 bg-neutral-900 p-0.5 self-start sm:self-auto">
          {(['All', 'Pending', 'In Progress', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                filter === tab
                  ? 'bg-white text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Decisions List Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-neutral-900/40 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredDecisions.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 text-center space-y-4">
            <GitBranch className="w-8 h-8 text-neutral-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">No decisions found</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                {decisions.length === 0
                  ? 'Create your first business decision to begin tracking expectations against real-world outcomes, or load sample decisions.'
                  : 'No decisions matched your search and filter criteria.'}
              </p>
            </div>
            {decisions.length === 0 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create Decision</span>
                </button>
                <button
                  onClick={handleLoadDemoDecisions}
                  className="px-4 py-2 rounded-lg border border-white/10 bg-neutral-900 text-white font-mono text-xs hover:bg-white/10 transition-all"
                >
                  Load Sample Decisions
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredDecisions.map((dec: any) => {
            const status = getNormalizedStatus(dec);
            return (
              <div
                key={dec.id}
                onClick={() => setSelectedDecision(dec)}
                className="p-5 rounded-2xl border border-white/10 bg-[#121214] hover:border-white/30 hover:bg-[#161619] transition-all cursor-pointer space-y-4 group shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-semibold ${getStatusBadge(status)}`}>
                      {status}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                      {dec.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-mono text-neutral-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{dec.date || dec.startDate || (dec.createdAt ? new Date(dec.createdAt).toLocaleDateString() : '2026-01-20')}</span>
                    </span>
                    <button
                      onClick={(e) => handleDeleteDecision(e, dec.id)}
                      className="p-1.5 rounded-md text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete decision"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                {/* Context and Chosen Action Snippet */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl border border-white/5 bg-neutral-900/40 space-y-1">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block">Context</span>
                    <p className="text-neutral-300 line-clamp-2">{dec.context || dec.description || dec.reason}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-white/5 bg-neutral-900/40 space-y-1">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block">Chosen Action</span>
                    <p className="text-white font-medium line-clamp-2">{dec.chosenAction || dec.strategy}</p>
                  </div>
                </div>

                {/* Expected Outcome */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-neutral-400">
                    <Target className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Target Outcome:</span>
                    <span className="text-neutral-200">{dec.expectedOutcome}</span>
                  </div>

                  {dec.outcome && (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Outcome Evaluated</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* LOCAL CREATE DECISION MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-pink-400" />
                <h3 className="text-base font-semibold text-white">Create Business Decision</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-neutral-400">Decision Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Reduce GOAT Rockerz 550 price by 10%"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-neutral-400">Context / Rationale</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe the operational circumstances triggering this decision..."
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs focus:outline-none focus:border-white/40 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-neutral-400">Options Considered</label>
                <textarea
                  rows={2}
                  placeholder="Option 1: Hold price; Option 2: 10% markdown; Option 3: Accessory bundle..."
                  value={formData.optionsConsidered}
                  onChange={(e) => setFormData({ ...formData, optionsConsidered: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs focus:outline-none focus:border-white/40 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-neutral-400">Chosen Action</label>
                <input
                  type="text"
                  required
                  placeholder="The concrete policy or action selected for implementation..."
                  value={formData.chosenAction}
                  onChange={(e) => setFormData({ ...formData, chosenAction: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-neutral-400">Expected Outcome</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., +15% unit sales recovery within 30 days with >65% gross margin"
                  value={formData.expectedOutcome}
                  onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-neutral-400">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs focus:outline-none focus:border-white/40"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-neutral-400">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-nothing-primary px-4 py-2 text-xs"
                >
                  Save Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DECISION DETAILS MODAL */}
      {selectedDecision && !outcomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-semibold ${getStatusBadge(getNormalizedStatus(selectedDecision))}`}>
                  {getNormalizedStatus(selectedDecision)}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {selectedDecision.date || selectedDecision.startDate || (selectedDecision.createdAt ? new Date(selectedDecision.createdAt).toLocaleDateString() : '')}
                </span>
              </div>
              <button
                onClick={() => setSelectedDecision(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {selectedDecision.title}
              </h2>

              <div className="space-y-4 text-xs">
                {/* Context */}
                <div className="p-4 rounded-xl border border-white/5 bg-neutral-900/50 space-y-1.5">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Business Context</span>
                  <p className="text-neutral-200 leading-relaxed">
                    {selectedDecision.context || selectedDecision.description || selectedDecision.reason}
                  </p>
                </div>

                {/* Options Considered */}
                <div className="p-4 rounded-xl border border-white/5 bg-neutral-900/50 space-y-1.5">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Options Considered</span>
                  <p className="text-neutral-300 leading-relaxed whitespace-pre-line">
                    {selectedDecision.optionsConsidered || '1. Maintain current pricing schedule;\n2. Deploy targeted markdown with volume threshold;\n3. Introduce bundle with accessories.'}
                  </p>
                </div>

                {/* Chosen Action */}
                <div className="p-4 rounded-xl border border-white/5 bg-neutral-900/50 space-y-1.5">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Chosen Action</span>
                  <p className="text-white font-medium leading-relaxed">
                    {selectedDecision.chosenAction || selectedDecision.strategy}
                  </p>
                </div>

                {/* Expected Outcome */}
                <div className="p-4 rounded-xl border border-white/5 bg-neutral-900/50 space-y-1.5">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Expected Outcome</span>
                  <p className="text-pink-300 font-mono leading-relaxed">
                    {selectedDecision.expectedOutcome}
                  </p>
                </div>

                {/* Evaluated Outcome (if any) */}
                {selectedDecision.outcome && (
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Actual Outcome Evaluated</span>
                      <span className="text-xs font-mono text-neutral-400">{selectedDecision.outcome.date}</span>
                    </div>
                    <p className="text-white font-medium">{selectedDecision.outcome.actualOutcome}</p>
                    {selectedDecision.outcome.lesson && (
                      <p className="text-xs text-neutral-300">
                        <span className="text-emerald-400 font-semibold">Lesson Learned: </span>
                        {selectedDecision.outcome.lesson}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-neutral-950/60">
              <div>
                {!selectedDecision.outcome && (
                  <button
                    onClick={() => {
                      if (onOpenOutcomeModal) {
                        onOpenOutcomeModal(selectedDecision.id);
                        setSelectedDecision(null);
                      } else {
                        setOutcomeModalOpen(true);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 text-xs font-mono transition-colors flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Evaluate & Record Outcome</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedDecision(null)}
                className="btn-nothing-outline px-4 py-2 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOCAL RECORD OUTCOME MODAL */}
      {outcomeModalOpen && selectedDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Record Measured Outcome</h3>
              </div>
              <button
                onClick={() => setOutcomeModalOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordOutcomeSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-neutral-400">Actual Outcome Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g., February revenue reached ₹5,77,372 with +18.4% unit recovery."
                  value={outcomeData.actualOutcome}
                  onChange={(e) => setOutcomeData({ ...outcomeData, actualOutcome: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs focus:outline-none focus:border-white/40 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-neutral-400">Actual Metric Value (₹ / Units)</label>
                <input
                  type="number"
                  required
                  value={outcomeData.value}
                  onChange={(e) => setOutcomeData({ ...outcomeData, value: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-neutral-400">Synthesized Business Lesson</label>
                <textarea
                  rows={2}
                  placeholder="e.g., Rockerz 550 elasticity was -1.35; discount drove high conversion without brand erosion."
                  value={outcomeData.notes}
                  onChange={(e) => setOutcomeData({ ...outcomeData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs focus:outline-none focus:border-white/40 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setOutcomeModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-nothing-primary px-4 py-2 text-xs"
                >
                  Record & Learn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionsView;
