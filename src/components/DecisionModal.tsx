'use client';

import React, { useState } from 'react';
import { X, Brain, Check, Sparkles } from 'lucide-react';
import { BusinessSituation } from '@/types/business';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  situation?: BusinessSituation | null;
  onDecisionCreated: (decision: any) => void;
}

export function DecisionModal({
  isOpen,
  onClose,
  situation,
  onDecisionCreated,
}: DecisionModalProps) {
  const [product, setProduct] = useState(situation?.product || 'Product A');
  const [action, setAction] = useState('Reduce price by 10%');
  const [reason, setReason] = useState('Competitor pricing pressure and declining January sales');
  const [expectedOutcome, setExpectedOutcome] = useState('Increase unit sales volume by 15%');
  const [expectedGrowthPercent, setExpectedGrowthPercent] = useState('15');
  const [affectedMetric, setAffectedMetric] = useState('revenue');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if situation prop changes
  React.useEffect(() => {
    if (situation) {
      setProduct(situation.product);
      setAction(`Reduce ${situation.product} price by 10%`);
      setReason(`Counter sales drop: ${situation.detectedIssue}`);
    }
  }, [situation]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reason,
          expectedOutcome,
          expectedGrowthPercent: parseFloat(expectedGrowthPercent) || 15,
          affectedProduct: product,
          affectedMetric,
          situationSummary: situation?.detectedIssue || `Strategic decision for ${product}`,
          situationId: situation?.id,
          date: new Date().toISOString().split('T')[0],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save decision');

      onDecisionCreated(data.decision);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error recording decision');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Record Business Decision</h3>
              <p className="text-[11px] text-slate-400">Stores in DB & retains into Hindsight Institutional Memory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Affected Product
            </label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Action Taken / Intervention
            </label>
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. Reduce price by 10%"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Strategic Reason (Why?)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Competitor offering lower prices, sales declined 18%"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Expected Outcome
              </label>
              <input
                type="text"
                value={expectedOutcome}
                onChange={(e) => setExpectedOutcome(e.target.value)}
                placeholder="e.g. +15% unit sales"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Growth (%)
              </label>
              <input
                type="number"
                value={expectedGrowthPercent}
                onChange={(e) => setExpectedGrowthPercent(e.target.value)}
                placeholder="15"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Will be retained in Hindsight Bank</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? 'Retaining...' : 'Record Decision'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
