'use client';

import React, { useState } from 'react';
import { X, Sliders, Save, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDemo?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onResetDemo }) => {
  const [engineMode, setEngineMode] = useState<'deterministic' | 'hybrid' | 'high-speed'>('deterministic');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(85);
  const [autoLearn, setAutoLearn] = useState<boolean>(true);
  const [resetting, setResetting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    setResetting(true);
    try {
      if (onResetDemo) onResetDemo();
      onClose();
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-md bg-white/10 text-white">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white font-mono uppercase">System Settings</h3>
              <p className="text-xs text-neutral-400 font-mono">Hindsight Cloud & Groq LLM parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto font-mono">
          {/* Analysis Engine Mode */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider block">
              Reasoning Engine Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'deterministic', label: 'Deterministic', desc: '100% verified math' },
                { id: 'hybrid', label: 'Hybrid AI', desc: 'Groq + Hindsight' },
                { id: 'high-speed', label: 'High Speed', desc: 'Direct inference' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setEngineMode(opt.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    engineMode === opt.id
                      ? 'border-white bg-white text-black font-semibold'
                      : 'border-white/10 bg-neutral-900/60 text-neutral-300 hover:border-white/20'
                  }`}
                >
                  <p className="text-xs font-semibold">{opt.label}</p>
                  <p className={`text-[10px] mt-0.5 ${engineMode === opt.id ? 'text-neutral-700' : 'text-neutral-500'}`}>
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Confidence Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-neutral-300 uppercase tracking-wider">
                Insight Confidence Threshold
              </span>
              <span className="font-semibold text-white">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="99"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-white bg-white/10 rounded-lg cursor-pointer h-1.5"
            />
            <p className="text-[11px] text-neutral-500">
              Only insights with statistical confidence exceeding this score trigger anomaly alerts.
            </p>
          </div>

          {/* Automatic Memory Feedback */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-neutral-900/40">
            <div>
              <p className="text-xs font-bold text-white uppercase">Closed-Loop Learning</p>
              <p className="text-[11px] text-neutral-400">Retain lessons into Hindsight Cloud bank when outcomes are evaluated</p>
            </div>
            <button
              onClick={() => setAutoLearn(!autoLearn)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                autoLearn ? 'bg-white' : 'bg-neutral-800 border border-white/20'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                  autoLearn ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Reset Environment */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white uppercase">Reset Demo Environment</p>
                <p className="text-[11px] text-neutral-400">Re-seed GOAT baseline data and clear session logs</p>
              </div>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-mono font-medium transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                <span>{resetting ? 'Resetting...' : 'Reset'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-white/10 bg-neutral-950/60 font-mono">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
