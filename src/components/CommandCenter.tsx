'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Database, Brain, Sparkles, Compass, Lightbulb, ArrowRight, X } from 'lucide-react';
import { searchApi } from '@/lib/api-client';
import { SearchResults } from '@/types';

interface CommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ isOpen, onClose, onSelectTab }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    datasets: [],
    decisions: [],
    memories: [],
    insights: [],
    pages: [],
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ datasets: [], decisions: [], memories: [], insights: [], pages: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ datasets: [], decisions: [], memories: [], insights: [], pages: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchApi.search(query);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    const tabName = path.replace('/', '');
    onSelectTab(tabName || 'dashboard');
    onClose();
  };

  const hasAnyResults =
    results.pages.length > 0 ||
    results.datasets.length > 0 ||
    results.decisions.length > 0 ||
    results.memories.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl nothing-card border border-white/20 rounded-3xl shadow-2xl overflow-hidden text-white bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-white/10 bg-black/40">
          <Search className="w-5 h-5 text-white mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search BizMind (GOAT products, decisions, memories, telemetry)..."
            className="w-full bg-transparent text-sm md:text-base outline-none text-white placeholder:text-neutral-500 font-mono"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-neutral-400 hover:text-white mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] text-white bg-white/10 border border-white/20 rounded-full font-mono">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 font-mono">
          {loading && (
            <div className="py-8 text-center text-xs text-white animate-pulse">
              Searching Hindsight memory index...
            </div>
          )}

          {!loading && !query && (
            <div className="py-8 px-4 text-center">
              <p className="text-xs text-neutral-400 mb-4 uppercase tracking-widest">Suggested Queries</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'GOAT Rockerz 550',
                  '10% price markdown',
                  'boAt competitor research',
                  'Elasticity outcome',
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="btn-nothing-outline text-xs py-1.5 px-3.5"
                  >
                    "{s}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && query && !hasAnyResults && (
            <div className="py-10 text-center text-xs text-neutral-500">
              No matching records found for "{query}".
            </div>
          )}

          {!loading && hasAnyResults && (
            <>
              {/* Pages */}
              {results.pages.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center">
                    <Compass className="w-3.5 h-3.5 mr-1.5 text-white" /> Views
                  </div>
                  <div className="mt-1 space-y-1">
                    {results.pages.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelect(p.path)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/10 text-left transition-colors group"
                      >
                        <span className="text-xs font-medium text-white">{p.title}</span>
                        <ArrowRight className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Decisions */}
              {results.decisions.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center">
                    <Brain className="w-3.5 h-3.5 mr-1.5 text-white" /> Decisions
                  </div>
                  <div className="mt-1 space-y-1">
                    {results.decisions.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleSelect(d.path)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/10 text-left transition-colors group"
                      >
                        <span className="text-xs text-white font-medium truncate">{d.title}</span>
                        <span className="nothing-tag">{d.type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Memories */}
              {results.memories.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-white" /> Institutional Memories
                  </div>
                  <div className="mt-1 space-y-1">
                    {results.memories.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleSelect(m.path)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/10 text-left transition-colors group"
                      >
                        <span className="text-xs text-white font-medium truncate">{m.title}</span>
                        <span className="nothing-tag">{m.type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Datasets */}
              {results.datasets.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center">
                    <Database className="w-3.5 h-3.5 mr-1.5 text-white" /> Datasets
                  </div>
                  <div className="mt-1 space-y-1">
                    {results.datasets.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleSelect(d.path)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/10 text-left transition-colors group"
                      >
                        <span className="text-xs text-white font-medium truncate">{d.title}</span>
                        <span className="nothing-tag">{d.type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-neutral-900/60 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>Navigation: <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↓</kbd></span>
          <span>BizMind Intelligence &bull; Operating on GOAT Audio</span>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
