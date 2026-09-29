'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Search,
  Sparkles,
  Layers,
  Calendar,
  Clock,
  ShieldAlert,
  GitBranch,
  BookOpen,
  ArrowRight,
  X,
  Tag,
  Network,
  Trash2,
} from 'lucide-react';
import { memoriesApi } from '@/lib/api-client';
import { ThreeMemoryNetwork } from '@/components/ThreeMemoryNetwork';
import { useToast } from '@/contexts/ToastContext';

export const MemoryView: React.FC = () => {
  const { showToast } = useToast();

  const [memories, setMemories] = useState<any[]>([]);
  const [networkData, setNetworkData] = useState<any>(null);
  const [category, setCategory] = useState<
    'All' | 'Business Context' | 'Previous Findings' | 'Important Patterns' | 'Known Risks' | 'Historical Decisions'
  >('All');
  const [search, setSearch] = useState<string>('');
  const [selectedMemory, setSelectedMemory] = useState<any | null>(null);
  const [view3D, setView3D] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const sections = [
    'All',
    'Business Context',
    'Previous Findings',
    'Important Patterns',
    'Known Risks',
    'Historical Decisions',
  ] as const;

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const data = await memoriesApi.getMemories(category, search);
      setMemories(data?.memories || []);
      setNetworkData(data?.network || null);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch memory records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [category, search]);

  const handleLoadDemoMemories = async () => {
    try {
      await memoriesApi.loadDemoMemories();
      showToast('GOAT institutional memories loaded.', 'success');
      fetchMemories();
    } catch {
      showToast('Failed to load sample memories', 'error');
    }
  };

  const handleClearAllMemories = async () => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to clear all institutional memory nodes?')) {
      await memoriesApi.clearMemories();
      showToast('Memory repository cleared.', 'success');
      fetchMemories();
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Business Context':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'Previous Findings':
        return <Sparkles className="w-4 h-4 text-pink-400" />;
      case 'Important Patterns':
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'Known Risks':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'Historical Decisions':
        return <GitBranch className="w-4 h-4 text-purple-400" />;
      default:
        return <Brain className="w-4 h-4 text-white" />;
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Business Context':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Previous Findings':
        return 'text-pink-400 bg-pink-500/10 border-pink-500/30';
      case 'Important Patterns':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Known Risks':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'Historical Decisions':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default:
        return 'text-neutral-300 bg-white/5 border-white/10';
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
              Memory System
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Hindsight Cloud institutional repository: empirical findings, pricing elasticity, and competitor reactions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleLoadDemoMemories}
            className="px-3.5 py-1.5 rounded-lg border border-pink-500/30 bg-pink-500/10 text-pink-300 font-semibold text-xs hover:bg-pink-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Memories</span>
          </button>

          {memories.length > 0 && (
            <button
              onClick={handleClearAllMemories}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900 text-neutral-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all flex items-center space-x-1.5 text-xs font-mono cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          {/* Toggle 3D Neural View */}
          <button
            onClick={() => setView3D(!view3D)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center space-x-1.5 cursor-pointer ${
              view3D
                ? 'bg-white text-black font-semibold border-white'
                : 'border-white/10 bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>{view3D ? 'Hide 3D Neural View' : 'Show 3D Neural View'}</span>
          </button>
        </div>
      </div>

      {/* 3D Visualizer Canvas (shown when view3D is true) */}
      {view3D && (
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Network className="w-4 h-4 text-pink-400" />
              Hindsight Cognitive Neural Graph (Interactive 3D)
            </span>
            <span className="text-[10px] font-mono text-neutral-500">Drag to rotate • Scroll to zoom</span>
          </div>
          <div className="h-96 w-full rounded-xl overflow-hidden bg-black/60 border border-white/5 relative">
            <ThreeMemoryNetwork
              nodes={networkData?.nodes || []}
              links={networkData?.links || []}
              onNodeClick={(node) => {
                const found = memories.find((m) => m.id === node.id);
                if (found) setSelectedMemory(found);
              }}
            />
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search memories by keyword, product, or finding..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {sections.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
                category === cat
                  ? 'bg-white text-black font-semibold'
                  : 'text-neutral-400 bg-neutral-900 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-neutral-900/40 border border-white/5 animate-pulse" />
          ))
        ) : memories.length === 0 ? (
          <div className="col-span-full p-12 rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 text-center space-y-3">
            <Brain className="w-8 h-8 text-neutral-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">No memory nodes matched</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                No memories found in the {category} category. Try switching categories or clearing search.
              </p>
            </div>
            <button
              onClick={handleLoadDemoMemories}
              className="px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all inline-flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Memories</span>
            </button>
          </div>
        ) : (
          memories.map((mem) => (
            <div
              key={mem.id}
              onClick={() => setSelectedMemory(mem)}
              className="p-5 rounded-2xl border border-white/10 bg-[#121214] hover:border-white/30 hover:bg-[#161619] transition-all cursor-pointer space-y-4 group flex flex-col justify-between shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-semibold flex items-center space-x-1 ${getCategoryBadge(
                      mem.category
                    )}`}
                  >
                    {getCategoryIcon(mem.category)}
                    <span>{mem.category}</span>
                  </span>

                  <span className="text-[10px] font-mono text-neutral-500">
                    {mem.createdDate}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-2">
                  {mem.title}
                </h3>

                <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                  {mem.content}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-white/5">
                {mem.tags && mem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {mem.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-900 border border-white/5"
                      >
                        #{tag}
                      </span>
                    ))}
                    {mem.tags.length > 3 && (
                      <span className="text-[9px] font-mono text-neutral-500">
                        +{mem.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                  <span className="truncate max-w-[180px]">{mem.source}</span>
                  <span className="text-pink-400 group-hover:translate-x-0.5 transition-transform flex items-center space-x-0.5">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MEMORY DETAIL MODAL */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-semibold flex items-center space-x-1 ${getCategoryBadge(
                    selectedMemory.category
                  )}`}
                >
                  {getCategoryIcon(selectedMemory.category)}
                  <span>{selectedMemory.category}</span>
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {selectedMemory.createdDate}
                </span>
              </div>
              <button
                onClick={() => setSelectedMemory(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {selectedMemory.title}
              </h2>

              <div className="p-4 rounded-xl border border-white/5 bg-neutral-900/60 space-y-2">
                <span className="text-[10px] font-mono text-pink-400 uppercase font-semibold block">
                  Institutional Memory Finding & Experience
                </span>
                <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-line font-sans">
                  {selectedMemory.content}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-white/5 bg-neutral-900/40 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Source Knowledge</span>
                  <span className="text-white font-mono text-xs">{selectedMemory.source || 'Hindsight Bank'}</span>
                </div>
                <div className="p-3 rounded-xl border border-white/5 bg-neutral-900/40 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Last Synchronized</span>
                  <span className="text-white font-mono text-xs">{selectedMemory.lastUpdated || selectedMemory.createdDate}</span>
                </div>
              </div>

              {selectedMemory.tags && selectedMemory.tags.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Associated Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMemory.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-neutral-300 px-2 py-0.5 rounded bg-neutral-900 border border-white/10"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-neutral-950/60">
              <span className="text-[10px] font-mono text-neutral-500">
                Bank: business-analyst • Cloud Persistent
              </span>
              <button
                onClick={() => setSelectedMemory(null)}
                className="btn-nothing-outline px-4 py-2 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryView;
