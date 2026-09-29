'use client';

import React, { useEffect, useState } from 'react';
import { Brain, Database, Sparkles, UploadCloud, RotateCcw } from 'lucide-react';

import { DEMO_COMPANY } from '@/config/company';

interface HeaderProps {
  onOpenUpload: () => void;
  onResetDemo: () => void;
}

export function Header({ onOpenUpload, onResetDemo }: HeaderProps) {
  const [hindsightStatus, setHindsightStatus] = useState<{
    connected: boolean;
    bankId?: string;
    version?: string;
    memoryCount?: number;
  }>({ connected: false });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hindsight/test')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'connected') {
          setHindsightStatus({
            connected: true,
            bankId: data.bankId,
            version: data.version,
            memoryCount: data.memoryCount,
          });
        }
      })
      .catch((err) => {
        console.warn('Status check failed:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>BizMind</span>
                <span className="text-slate-400 font-normal text-base">| AI Decision Intelligence</span>
              </h1>
              <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Hindsight Powered
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Operating on {DEMO_COMPANY.fullName} &bull; {DEMO_COMPANY.primaryCategory} ({DEMO_COMPANY.market}) &bull; Institutional Memory Engine
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Hindsight connection pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                loading
                  ? 'bg-amber-400 animate-ping'
                  : hindsightStatus.connected
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                  : 'bg-rose-400'
              }`}
            />
            <span className="text-slate-300 font-medium">
              {hindsightStatus.connected ? (
                <>
                  Hindsight Bank:{' '}
                  <span className="text-cyan-400 font-mono">
                    {hindsightStatus.bankId || 'business-analyst'}
                  </span>
                </>
              ) : loading ? (
                'Connecting to Hindsight...'
              ) : (
                'Hindsight Offline'
              )}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload Data
            </button>
            <button
              onClick={onResetDemo}
              title="Reset Demo State"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
