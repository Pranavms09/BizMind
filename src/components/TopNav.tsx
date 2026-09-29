'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  PlusCircle,
  BrainCircuit,
  Database,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { datasetsApi } from '@/lib/api-client';
import { Dataset } from '@/types';
import { GOAT_COMPANY } from '@/config/company';

interface TopNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCommandCenter: () => void;
  onOpenMobileMenu: () => void;
  onOpenDecisionModal?: () => void;
  onResetDemo?: () => void;
  onOpenCompetitiveModal?: () => void;
  onOpenLanding?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenCommandCenter,
  onOpenMobileMenu,
  onOpenDecisionModal,
  onResetDemo,
  onOpenCompetitiveModal,
  onOpenLanding,
}) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    datasetsApi
      .getDatasets()
      .then((items) => {
        setDatasets(items);
        const active = items.find((d) => d.isActive) || items[0] || null;
        setActiveDataset(active);
      })
      .catch(() => {});
  }, [activeTab]);

  const handleReset = async () => {
    setSeeding(true);
    try {
      if (onResetDemo) onResetDemo();
    } finally {
      setTimeout(() => setSeeding(false), 800);
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Executive Overview';
      case 'analyst':
        return 'AI Business Analyst';
      case 'competitive':
        return 'Competitive Impact';
      case 'datasets':
        return 'Dataset Management';
      case 'decisions':
        return 'Decision Center';
      case 'insights':
        return 'Strategic Insights';
      case 'memory':
        return 'Institutional Memory';
      case 'learning':
        return 'Closed-Loop Learning';
      case 'timeline':
        return 'Audit Timeline';
      default:
        return 'AI Business Analyst';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-black/90 backdrop-blur-md border-b border-white/10 shrink-0 w-full">
      {/* Left: Mobile trigger & Page title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <span className="glyph-dot-white" />
          <h1 className="text-sm md:text-base font-bold text-white tracking-wider font-sans uppercase">
            {getPageTitle()}
          </h1>
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-neutral-300 border border-white/10">
            BizMind &bull; Operating: {GOAT_COMPANY.name} Audio
          </span>
        </div>
      </div>

      {/* Center/Right: Actions & Search */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Active Dataset Indicator */}
        {activeDataset && (
          <button
            onClick={() => onSelectTab('datasets')}
            className="hidden md:flex items-center space-x-2 bg-neutral-900/80 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-all text-xs font-mono text-neutral-300"
            title="Active business dataset"
          >
            <Database className="w-3.5 h-3.5 text-neutral-400" />
            <span className="truncate max-w-[130px]">{activeDataset.name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>
        )}

        {/* Command Center Trigger Button */}
        <button
          onClick={onOpenCommandCenter}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-neutral-400 hover:text-white transition-colors text-xs font-mono"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-white/10 rounded-full border border-white/20 text-[9px] font-mono text-white">
            ⌘K
          </kbd>
        </button>

        {/* Hero / Landing Page Quick Action */}
        {onOpenLanding && (
          <button
            onClick={onOpenLanding}
            className="hidden sm:inline-flex btn-nothing-outline text-xs py-1.5 px-3 font-mono uppercase tracking-wider items-center group"
            title="Return to Hero Landing Showcase"
            id="topnav-hero-page-btn"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-pink-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden xl:inline">Hero Page</span>
          </button>
        )}

        {/* Competitive Impact Quick Action */}
        {onOpenCompetitiveModal && (
          <button
            onClick={onOpenCompetitiveModal}
            className="hidden sm:inline-flex btn-nothing-outline text-xs py-1.5 px-3 font-mono uppercase tracking-wider"
            title="Run competitive impact analysis with web research"
          >
            <Sparkles className="w-3 h-3 mr-1 text-white" />
            <span>Competitive</span>
          </button>
        )}

        {/* Ask AI Quick Action */}
        <button
          onClick={() => onSelectTab('analyst')}
          className="hidden sm:inline-flex btn-nothing-outline text-xs py-1.5 px-3 font-mono uppercase tracking-wider"
        >
          <BrainCircuit className="w-3.5 h-3.5 mr-1.5" />
          <span>Ask AI</span>
        </button>

        {/* New Decision Action */}
        {onOpenDecisionModal && (
          <button
            onClick={onOpenDecisionModal}
            className="btn-nothing-primary text-xs py-1.5 px-3.5 font-mono font-bold uppercase tracking-wider shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1" />
            <span>Decision</span>
          </button>
        )}

        {/* Reset / Demo Re-seed Button */}
        <button
          onClick={handleReset}
          disabled={seeding}
          className="btn-nothing-outline text-xs py-1.5 px-3 font-mono"
          title="Reset environment and seed GOAT demo story"
        >
          <RefreshCw className={`w-3 h-3 mr-1 text-white ${seeding ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">{seeding ? 'Seeding...' : 'Demo'}</span>
        </button>
      </div>
    </header>
  );
};

export default TopNav;
