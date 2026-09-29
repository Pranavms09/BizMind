'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { BusinessDecision } from '@/types/business';

interface OutcomeCandidate {
  decision: BusinessDecision;
  currentPeriod: string;
  product: string;
  metric: string;
  previousValue: number;
  actualValue: number;
  actualChangePercent: number;
  expectedChangePercent: number;
}

interface OutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate?: OutcomeCandidate | null;
  onOutcomeRecorded: (outcome: any) => void;
}

export function OutcomeModal({
  isOpen,
  onClose,
  candidate,
  onOutcomeRecorded,
}: OutcomeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actualChange = candidate?.actualChangePercent ?? 21.4;
  const expectedChange = candidate?.expectedChangePercent ?? 15;
  const isBetter = actualChange >= expectedChange;

  const defaultLesson = isBetter
    ? `The ${candidate?.decision.action || 'pricing strategy'} was highly effective for ${
        candidate?.product || 'Product A'
      }. Recovered sales by ${actualChange > 0 ? '+' : ''}${actualChange}% without damaging gross margins.`
    : `The ${candidate?.decision.action || 'strategy'} did not reach the expected target of ${expectedChange}%. Re-evaluate customer willingness to pay and market elasticity.`;

  const [lesson, setLesson] = useState(defaultLesson);

  React.useEffect(() => {
    if (candidate) {
      setLesson(
        isBetter
          ? `The ${candidate.decision.action} was highly effective for ${
              candidate.product
            }. Recovered performance by ${actualChange > 0 ? '+' : ''}${actualChange}%.`
          : `The ${candidate.decision.action} did not reach the expected target of ${expectedChange}%.`
      );
    }
  }, [candidate, isBetter, actualChange, expectedChange]);

  if (!isOpen || !candidate) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionId: candidate!.decision.id,
          periodLabel: candidate!.currentPeriod,
          actualValue: candidate!.actualValue,
          previousValue: candidate!.previousValue,
          actualChangePercent: actualChange,
          lesson,
          result: isBetter ? 'better_than_expected' : 'worse_than_expected',
          date: new Date().toISOString().split('T')[0],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record outcome');

      onOutcomeRecorded(data.outcome);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error recording outcome');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Evaluate Business Outcome</h3>
              <p className="text-[11px] text-slate-400">Calculates deterministic delta & retains experience in Hindsight</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Comparison summary card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Intervention:</span>
              <span className="font-semibold text-slate-200">{candidate.decision.action}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Product:</span>
              <span className="font-semibold text-cyan-400">{candidate.product}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Expected Growth:</span>
              <span className="font-semibold text-slate-300">+{expectedChange}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Actual Result:</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  isBetter ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isBetter ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                )}
                {actualChange > 0 ? '+' : ''}
                {actualChange}% ({isBetter ? 'Better than expected' : 'Below target'})
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Institutional Lesson (Retained for future decisions)
            </label>
            <textarea
              rows={3}
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Saves experience to Hindsight Bank</span>
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
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Retaining Lesson...' : 'Record Outcome & Lesson'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
