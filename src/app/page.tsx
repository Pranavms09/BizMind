'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider, useToast } from '@/contexts/ToastContext';
import { TopNav } from '@/components/TopNav';
import { Sidebar } from '@/components/Sidebar';
import { DemoWalkthroughBanner } from '@/components/DemoWalkthroughBanner';
import { CommandCenter } from '@/components/CommandCenter';
import { SettingsModal } from '@/components/SettingsModal';
import { HelpModal } from '@/components/HelpModal';
import { DecisionModal } from '@/components/DecisionModal';
import { OutcomeModal } from '@/components/OutcomeModal';
import { CompetitiveAnalysisModal } from '@/components/CompetitiveAnalysisModal';
import { MemoryEvidenceModal } from '@/components/MemoryEvidenceModal';

// Views
import { LandingView } from '@/components/views/LandingView';
import { DashboardView } from '@/components/views/DashboardView';
import { AnalystView } from '@/components/views/AnalystView';
import { CompetitiveView } from '@/components/views/CompetitiveView';
import { DatasetsView } from '@/components/views/DatasetsView';
import { DecisionsView } from '@/components/views/DecisionsView';
import { MemoryView } from '@/components/views/MemoryView';
import { LearningView } from '@/components/views/LearningView';
import { TimelineView } from '@/components/views/TimelineView';

// Types & API
import { BusinessSituation, MemoryEvidenceItem, BusinessDecision } from '@/types/business';
import { CompetitiveImpactAnalysis } from '@/types/competitive';
import { datasetsApi, decisionsApi } from '@/lib/api-client';

function AppContent() {
  const { showToast } = useToast();

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        setActiveTab(tabParam);
      }
      if (params.get('landing') === 'true') {
        setShowLanding(true);
      }
    }
  }, []);

  // Modals state
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionSituation, setDecisionSituation] = useState<BusinessSituation | null>(null);

  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [outcomeCandidate, setOutcomeCandidate] = useState<any>(null);

  const [isCompetitiveModalOpen, setIsCompetitiveModalOpen] = useState(false);
  const [competitiveData, setCompetitiveData] = useState<CompetitiveImpactAnalysis | null>(null);
  const [competitiveLoading, setCompetitiveLoading] = useState(false);

  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceItems, setEvidenceItems] = useState<MemoryEvidenceItem[]>([]);
  const [evidenceQueryTitle, setEvidenceQueryTitle] = useState<string>('');

  // Demo Walkthrough Stepper State
  const [demoStep, setDemoStep] = useState<number>(1);
  const [demoLoading, setDemoLoading] = useState<boolean>(false);

  // Keybindings (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandCenterOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Demo Step Execution for Hackathon Walkthrough
  const executeDemoStep = useCallback(
    async (stepNum: number) => {
      setDemoLoading(true);
      setDemoStep(stepNum);

      try {
        if (stepNum === 1) {
          showToast('Step 1: Ingesting December baseline and January sales drop...', 'info');
          await datasetsApi.loadDemoDataset('december');
          await datasetsApi.loadDemoDataset('january');
          setActiveTab('dashboard');
          showToast('Step 1 complete: January deficit detected in GOAT Rockerz 550.', 'success');
        } else if (stepNum === 2) {
          showToast('Step 2: Switching to AI Business Analyst for diagnostic query...', 'info');
          setActiveTab('analyst');
          showToast('Step 2 ready: Ask "Why did GOAT Rockerz 550 sales drop in January?"', 'success');
        } else if (stepNum === 3) {
          showToast('Step 3: Running live competitive impact analysis...', 'info');
          setActiveTab('competitive');
          setCompetitiveLoading(true);
          try {
            const res = await fetch('/api/competitive-analysis', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                product: 'GOAT Rockerz 550',
                currentPrice: 1499,
                proposedPrice: 1349,
              }),
            });
            const data = await res.json();
            if (data.analysis) {
              setCompetitiveData(data.analysis);
              setIsCompetitiveModalOpen(true);
            }
          } finally {
            setCompetitiveLoading(false);
          }
          showToast('Step 3 complete: Modeled 3 competitor response scenarios (boAt, Noise).', 'success');
        } else if (stepNum === 4) {
          showToast('Step 4: Opening Decision Center to formulate hypothesis...', 'info');
          setDecisionSituation({
            id: 'sit-step-4',
            detectedIssue: 'GOAT Rockerz 550 sales velocity deficit in January',
            product: 'GOAT Rockerz 550',
            metric: 'quantity',
            currentValue: 280,
            previousValue: 370,
            changePercent: -24.3,
            severity: 'high',
            date: '2026-01-20',
            suggestedAction: 'Reduce price by 10% (₹1,499 to ₹1,349)',
            affectedMetrics: { revenueGrowth: -24.3, volumeGrowth: -22.1 },
          });
          setIsDecisionModalOpen(true);
        } else if (stepNum === 5) {
          showToast('Step 5: Ingesting February recovery telemetry...', 'info');
          await datasetsApi.loadDemoDataset('february');
          setActiveTab('dashboard');
          showToast('Step 5 complete: February data shows +37.6% unit volume surge!', 'success');
        } else if (stepNum === 6) {
          showToast('Step 6: Recording empirical outcome and syncing to Hindsight...', 'info');
          const decisions = await decisionsApi.getDecisions();
          const targetDec = decisions[0] || {
            id: 'dec-1',
            action: 'Reduce GOAT Rockerz 550 price by 10%',
            reason: 'Counter boAt discounting',
            expectedGrowthPercent: 15,
            expectedOutcome: '+15% unit sales growth',
            affectedProduct: 'GOAT Rockerz 550',
            affectedMetric: 'quantity',
            status: 'pending',
            date: '2026-01-20',
            createdAt: '2026-01-20T10:00:00Z',
          };

          setOutcomeCandidate({
            decision: targetDec,
            currentPeriod: 'February 2026',
            product: 'GOAT Rockerz 550',
            metric: 'Revenue',
            previousValue: 419720,
            actualValue: 577372,
            actualChangePercent: 37.6,
            expectedChangePercent: 15,
          });
          setIsOutcomeModalOpen(true);
        } else if (stepNum === 7) {
          showToast('Step 7: Ingesting March telemetry and analyzing with retained Hindsight memory...', 'info');
          await datasetsApi.loadDemoDataset('march');
          setActiveTab('analyst');
          showToast('Step 7 complete: Hindsight institutional recall active for March planning!', 'success');
        }
      } catch (err: any) {
        showToast(err.message || 'Error executing demo step', 'error');
      } finally {
        setDemoLoading(false);
      }
    },
    [showToast]
  );

  const handleResetDemo = useCallback(async () => {
    try {
      showToast('Resetting demo environment to clean baseline...', 'info');
      await datasetsApi.clearAllDatasets();
      await datasetsApi.loadDemoDataset('december');
      await datasetsApi.loadDemoDataset('january');
      setDemoStep(1);
      setActiveTab('dashboard');
      showToast('BizMind demo environment reset to GOAT Step 1 baseline.', 'success');
    } catch {
      showToast('Failed to reset demo', 'error');
    }
  }, [showToast]);

  const handleOpenDecisionModal = useCallback(() => {
    setDecisionSituation(null);
    setIsDecisionModalOpen(true);
  }, []);

  const handleOpenOutcomeModal = useCallback(async (decisionId?: string) => {
    try {
      const decisions = await decisionsApi.getDecisions();
      const match = decisionId ? decisions.find((d) => d.id === decisionId) : decisions[0];
      if (match) {
        setOutcomeCandidate({
          decision: match,
          currentPeriod: 'February 2026',
          product: match.affectedProduct || 'GOAT Rockerz 550',
          metric: 'Revenue',
          previousValue: 419720,
          actualValue: 577372,
          actualChangePercent: 37.6,
          expectedChangePercent: match.expectedGrowthPercent || 15,
        });
        setIsOutcomeModalOpen(true);
      } else {
        showToast('No active decisions to evaluate. Create a decision first.', 'info');
      }
    } catch {
      showToast('Failed to prepare outcome evaluation', 'error');
    }
  }, [showToast]);

  const handleOpenCompetitiveModal = useCallback(() => {
    setCompetitiveData(null);
    setIsCompetitiveModalOpen(true);
  }, []);

  const handleViewEvidence = useCallback((evidence: any[], title: string) => {
    setEvidenceItems(evidence);
    setEvidenceQueryTitle(title);
    setIsEvidenceModalOpen(true);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#000000] text-white overflow-hidden font-sans selection:bg-pink-500 selection:text-white">
      {/* Nothing OS Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setShowLanding(false);
          setActiveTab(tab);
        }}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onToggleLanding={() => setShowLanding((prev) => !prev)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Top Navbar */}
        <TopNav
          activeTab={showLanding ? 'landing' : activeTab}
          onSelectTab={(tab) => {
            setShowLanding(false);
            setActiveTab(tab);
          }}
          onOpenCommandCenter={() => setIsCommandCenterOpen(true)}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onOpenDecisionModal={handleOpenDecisionModal}
          onResetDemo={handleResetDemo}
          onOpenCompetitiveModal={handleOpenCompetitiveModal}
        />

        {/* Scrollable View Area */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden nothing-dots relative z-10 ${showLanding ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
          {showLanding ? (
            <LandingView
              onEnterDashboard={(targetTab = 'dashboard') => {
                setShowLanding(false);
                setActiveTab(targetTab);
              }}
            />
          ) : (
            <div className="max-w-7xl mx-auto space-y-6 w-full min-w-0">
              {/* Demo Stepper for Hackathon Evaluation */}
              <DemoWalkthroughBanner
                currentStep={demoStep}
                onExecuteStep={executeDemoStep}
                loading={demoLoading}
              />

              {/* View Router */}
              {activeTab === 'dashboard' && (
                <DashboardView
                  onSelectTab={(tab) => setActiveTab(tab)}
                  onOpenDecisionModal={handleOpenDecisionModal}
                  onOpenCompetitiveModal={handleOpenCompetitiveModal}
                />
              )}

              {activeTab === 'analyst' && (
                <AnalystView
                  onOpenDecisionModal={handleOpenDecisionModal}
                  onOpenCompetitiveModal={handleOpenCompetitiveModal}
                  onViewEvidence={handleViewEvidence}
                />
              )}

              {activeTab === 'competitive' && (
                <CompetitiveView onOpenDecisionModal={handleOpenDecisionModal} />
              )}

              {activeTab === 'datasets' && <DatasetsView />}

              {activeTab === 'decisions' && (
                <DecisionsView
                  onOpenCreateModal={handleOpenDecisionModal}
                  onOpenOutcomeModal={(id) => handleOpenOutcomeModal(id)}
                />
              )}

              {activeTab === 'memory' && <MemoryView />}

              {activeTab === 'learning' && <LearningView />}

              {activeTab === 'timeline' && <TimelineView />}
            </div>
          )}
        </main>
      </div>

      {/* GLOBAL MODALS */}
      <CommandCenter
        isOpen={isCommandCenterOpen}
        onClose={() => setIsCommandCenterOpen(false)}
        onSelectTab={(tab) => {
          setShowLanding(false);
          setActiveTab(tab);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetDemo={handleResetDemo}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onSelectTab={(tab) => {
          setShowLanding(false);
          setActiveTab(tab);
        }}
      />

      <DecisionModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        situation={decisionSituation}
        onDecisionCreated={() => {
          setIsDecisionModalOpen(false);
          showToast('Decision recorded and synced with Hindsight Memory.', 'success');
        }}
      />

      <OutcomeModal
        isOpen={isOutcomeModalOpen}
        onClose={() => setIsOutcomeModalOpen(false)}
        candidate={outcomeCandidate}
        onOutcomeRecorded={() => {
          setIsOutcomeModalOpen(false);
          showToast('Outcome measured and institutional lesson synthesized in Hindsight.', 'success');
        }}
      />

      <CompetitiveAnalysisModal
        isOpen={isCompetitiveModalOpen}
        onClose={() => setIsCompetitiveModalOpen(false)}
        analysis={competitiveData}
        loading={competitiveLoading}
      />

      <MemoryEvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        evidence={evidenceItems}
        queryTitle={evidenceQueryTitle}
      />
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
