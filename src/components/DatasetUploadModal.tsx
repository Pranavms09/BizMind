'use client';

import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, Check, Sparkles } from 'lucide-react';

interface DatasetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetUploaded: (dataset: any) => void;
}

export function DatasetUploadModal({
  isOpen,
  onClose,
  onDatasetUploaded,
}: DatasetUploadModalProps) {
  const [label, setLabel] = useState('Custom Dataset');
  const [csvContent, setCsvContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLabel(file.name.replace(/\.csv$/i, ''));
    const text = await file.text();
    setCsvContent(text);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!csvContent.trim()) {
      setError('Please provide CSV content or select a file.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
          csvContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process dataset');

      onDatasetUploaded(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error processing CSV dataset');
    } finally {
      setLoading(false);
    }
  }

  function handlePresetSelect(presetName: string, presetLabel: string) {
    setLoading(true);
    setError(null);
    fetch('/api/datasets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preset: presetName,
        label: presetLabel,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        onDatasetUploaded(data);
        onClose();
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Upload Business Dataset</h3>
              <p className="text-[11px] text-slate-400">
                Parses CSV deterministically & extracts business KPIs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Quick presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Quick Load Demo Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handlePresetSelect('december', 'December 2025')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left text-xs transition-colors"
              >
                <p className="font-bold text-slate-200">Dec 2025</p>
                <p className="text-[10px] text-slate-400">Baseline audio operations</p>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handlePresetSelect('january', 'January 2026')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left text-xs transition-colors"
              >
                <p className="font-bold text-rose-400">Jan 2026 (Crisis)</p>
                <p className="text-[10px] text-slate-400">GOAT Rockerz 550 decline</p>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handlePresetSelect('february', 'February 2026')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left text-xs transition-colors"
              >
                <p className="font-bold text-emerald-400">Feb 2026 (Recovery)</p>
                <p className="text-[10px] text-slate-400">+37.5% revenue recovery</p>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handlePresetSelect('march', 'March 2026')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left text-xs transition-colors"
              >
                <p className="font-bold text-cyan-400">Mar 2026 (Airdopes)</p>
                <p className="text-[10px] text-slate-400">GOAT Airdopes 141 query</p>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-slate-500">
              Or Upload Custom File
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Dataset Label (e.g. &apos;Q1 2026 Sales&apos;)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              CSV File (.csv)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Or Paste CSV Raw Text
            </label>
            <textarea
              rows={4}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="date,product,quantity,revenue,region,channel&#10;2026-01-02,Product A,45,45000,South,Online"
              className="w-full font-mono text-[11px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !csvContent.trim()}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Ingest & Compute KPIs'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
