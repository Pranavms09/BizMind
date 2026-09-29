'use client';

import React from 'react';
import {
  BrainCircuit,
  Database,
  GitBranch,
  Lightbulb,
  Sparkles,
  History,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Globe,
  Settings as SettingsIcon,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
} from 'lucide-react';
import { GOAT_COMPANY } from '@/config/company';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  onToggleLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenSettings,
  onOpenHelp,
  onToggleLanding,
}) => {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyst', name: 'AI Analyst', icon: BrainCircuit, badge: 'Groq' },
    { id: 'competitive', name: 'Competitive', icon: Globe, badge: 'Live Web' },
    { id: 'datasets', name: 'Datasets', icon: Database },
    { id: 'decisions', name: 'Decisions', icon: GitBranch },
    { id: 'memory', name: 'Memory', icon: Sparkles, badge: 'Hindsight' },
    { id: 'learning', name: 'Learning', icon: GraduationCap },
    { id: 'timeline', name: 'Timeline', icon: History },
  ];

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto flex flex-col shrink-0 h-full bg-[#09090b] border-r border-white/10 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center space-x-3 overflow-hidden group focus:outline-none text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/15 flex items-center justify-center shrink-0 overflow-hidden shadow-sm group-hover:scale-105 transition-transform p-1">
              <img src="/logo.png" alt="BizMind" className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5 font-mono">
                  BizMind
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-normal">
                    AI
                  </span>
                </span>
                <span className="text-[10px] text-neutral-400 font-mono tracking-wider truncate" title={`Operating: ${GOAT_COMPANY.name} Audio`}>
                  Operating: {GOAT_COMPANY.name}
                </span>
              </div>
            )}
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/15"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2">
            {!collapsed ? (
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-medium">
                Pillars
              </span>
            ) : (
              <div className="w-4 h-0.5 bg-white/10 mx-auto rounded-full" />
            )}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full group flex items-center px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-black' : 'text-neutral-400 group-hover:text-white'
                  } ${!collapsed ? 'mr-3' : 'mx-auto'}`}
                />
                {!collapsed && (
                  <span className="truncate flex-1 flex items-center justify-between text-left">
                    <span>{item.name}</span>
                    {item.badge && !isActive && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Navigation: Landing Page toggle, Settings, Help */}
        <div className="p-3 border-t border-white/10 space-y-1 bg-[#09090b]">
          {onToggleLanding && (
            <button
              onClick={onToggleLanding}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-mono text-neutral-400 hover:text-white hover:bg-white/5 transition-colors ${
                collapsed ? 'justify-center' : 'justify-between'
              }`}
              title="View Hero & LaserFlow Landing Page"
              id="sidebar-hero-showcase-btn"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                {!collapsed && <span>Hero Showcase</span>}
              </div>
              {!collapsed && <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />}
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-mono text-neutral-400 hover:text-white hover:bg-white/5 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title="System Settings & Hindsight Cloud status"
          >
            <SettingsIcon className={`w-4 h-4 ${!collapsed ? 'mr-3' : ''}`} />
            {!collapsed && <span>Settings</span>}
          </button>

          <button
            onClick={onOpenHelp}
            className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-mono text-neutral-400 hover:text-white hover:bg-white/5 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Help & Architecture Documentation"
          >
            <HelpCircle className={`w-4 h-4 ${!collapsed ? 'mr-3' : ''}`} />
            {!collapsed && <span>Help</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
