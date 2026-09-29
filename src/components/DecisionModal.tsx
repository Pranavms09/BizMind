'use client';

import React, { useState } from 'react';
import { X, GitBranch, Sparkles } from 'lucide-react';
import { BusinessSituation } from '@/types/business';
import { GOAT_COMPANY } from '@/config/company';

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
  const [product, setProduct] = useState(situation?.product || 'GOAT Rockerz 550');
  const [action, setAction] = useState('Reduce price by 10%');
  const [reason, setReason] = useState('Competitor pricing pressure and declining January sales');
  const [expectedOutcome, setExpectedOutcome] = useState('Increase unit sales volume by 15%');
  const [expectedGrowthPercent, setExpectedGrowthPercent] = useState('15');
  const [affectedMetric, setAffectedMetric] = useState('quantity');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#121214] border border-white/20 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden font-mono">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/10 text-white border border-white/20">
              <GitBranch className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Record Business Decision</h3>
              <p className="text-[11px] text-neutral-400">Stores in DB & retains into Hindsight Institutional Memory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
              Affected Product ({GOAT_COMPANY.name})
            </label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
              Action Taken / Policy
            </label>
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. Reduce GOAT Rockerz 550 price by 10%"
              required
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
              Strategic Reason (Why?)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. boAt competitor aggressive price cutting in Indian market"
              required
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 resize-none font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                Expected Outcome
              </label>
              <input
                type="text"
                value={expectedOutcome}
                onChange={(e) => setExpectedOutcome(e.target.value)}
                placeholder="e.g. +15% volume recovery"
                required
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 font-sans"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                Target Growth (%)
              </label>
              <input
                type="number"
                value={expectedGrowthPercent}
                onChange={(e) => setExpectedGrowthPercent(e.target.value)}
                placeholder="15"
                required
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-pink-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Retained in Hindsight Bank</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-nothing-outline text-xs py-1.5 px-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-nothing-primary text-xs py-1.5 px-4 uppercase tracking-wider"
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

export default DecisionModal;
