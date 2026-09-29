'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { DemoWalkthroughBanner } from '@/components/DemoWalkthroughBanner';
import { BusinessOverview } from '@/components/BusinessOverview';
import { SituationsList } from '@/components/SituationsList';
import { DecisionTimeline } from '@/components/DecisionTimeline';
import { AIAnalystChat } from '@/components/AIAnalystChat';
import { DecisionModal } from '@/components/DecisionModal';
import { OutcomeModal } from '@/components/OutcomeModal';
import { MemoryEvidenceModal } from '@/components/MemoryEvidenceModal';
import { DatasetUploadModal } from '@/components/DatasetUploadModal';
import { CompetitiveAnalysisModal } from '@/components/CompetitiveAnalysisModal';
import {
  DatasetKPIs,
  BusinessSituation,
  MemoryEvidenceItem,
  BusinessDecision,
  CompetitiveImpactAnalysis,
} from '@/types/business';
import { Sparkles, Brain, CheckCircle2, AlertTriangle, Globe } from 'lucide-react';

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DatasetKPIs | null>(null);
  const [datasetLabel, setDatasetLabel] = useState<string>('');
  const [situations, setSituations] = useState<BusinessSituation[]>([]);
  const [activeProduct, setActiveProduct] = useState<string>('Product A');

  // Modals state
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [selectedSituation, setSelectedSituation] = useState<BusinessSituation | null>(null);

  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [outcomeCandidate, setOutcomeCandidate] = useState<any>(null);

  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceItems, setEvidenceItems] = useState<MemoryEvidenceItem[]>([]);
  const [evidenceQueryTitle, setEvidenceQueryTitle] = useState<string>('');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Competitive Analysis modal state
  const [isCompetitiveModalOpen, setIsCompetitiveModalOpen] = useState(false);
  const [competitiveData, setCompetitiveData] = useState<CompetitiveImpactAnalysis | null>(null);
  const [competitiveLoading, setCompetitiveLoading] = useState(false);

  // Demo walkthrough stepper state
  const [demoStep, setDemoStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshTimeline, setRefreshTimeline] = useState(0);

  // Chat external prompt prefill
  const [chatPrompt, setChatPrompt] = useState<{ prompt: string; product: string } | null>(null);

  // Initial load
  useEffect(() => {
    fetch('/api/datasets')
      .then((res) => res.json())
      .then((data) => {
        const datasets = data.datasets || {};
        const labels = Object.keys(datasets);
        if (labels.length > 0) {
          const latest = datasets[labels[labels.length - 1]];
          setKpis(latest.kpis);
          setDatasetLabel(latest.label);
          setSituations(latest.situations || []);
        } else {
          // If empty, auto-bootstrap Step 1 (December baseline + January data)
          executeDemoStep(1);
        }
      })
      .catch((err) => console.warn('Dataset load error:', err));
  }, []);

  async function executeDemoStep(stepNum: number) {
    setLoading(true);
    try {
      if (stepNum === 1) {
        // Step 1: Upload December baseline then January data to detect crisis
        await fetch('/api/datasets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preset: 'december', label: 'December 2025' }),
        });

        const janRes = await fetch('/api/datasets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preset: 'january',
            label: 'January 2026',
            previousLabel: 'December 2025',
          }),
        });
        const janData = await janRes.json();
        setKpis(janData.kpis);
        setDatasetLabel(janData.label);
        setSituations(janData.situations || []);
        setActiveProduct('GOAT Rockerz 550');
        setDemoStep(1);
      } else if (stepNum === 2) {
        // Step 2: Trigger AI analysis on GOAT Rockerz 550 decline
        setDemoStep(2);
        setChatPrompt({
          prompt:
            'GOAT Rockerz 550 sales dropped in January due to aggressive competitor discounts. What is happening, and what strategy should we consider?',
          product: 'GOAT Rockerz 550',
        });
      } else if (stepNum === 3) {
        // Step 3: Open Decision Modal to record 10% price reduction
        setDemoStep(3);
        setSelectedSituation(
          situations.find((s) => s.product === 'GOAT Rockerz 550') || {
            id: 'sit-goat-rockerz-jan',
            date: '2026-01-15',
            metric: 'revenue',
            currentValue: 419720,
            previousValue: 554630,
            changePercent: -24.3,
            product: 'GOAT Rockerz 550',
            detectedIssue: 'GOAT Rockerz 550 revenue declined 24.3% in January 2026.',
            severity: 'high',
          }
        );
        setIsDecisionModalOpen(true);
      } else if (stepNum === 4) {
        // Step 4: Upload February data and calculate actual revenue surge
        const febRes = await fetch('/api/datasets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preset: 'february',
            label: 'February 2026',
            previousLabel: 'January 2026',
          }),
        });
        const febData = await febRes.json();
        setKpis(febData.kpis);
        setDatasetLabel(febData.label);
        setSituations(febData.situations || []);
        setDemoStep(4);

        if (febData.outcomeCandidates && febData.outcomeCandidates.length > 0) {
          setOutcomeCandidate(febData.outcomeCandidates[0]);
        }
      } else if (stepNum === 5) {
        // Step 5: Open Outcome Modal to retain lesson in Hindsight
        setDemoStep(5);
        if (!outcomeCandidate) {
          // Fallback candidate if not populated from step 4
          setOutcomeCandidate({
            decision: {
              id: 'dec-step-3',
              action: 'Reduce GOAT Rockerz 550 price by 10% (from ₹1,499 to ₹1,349)',
              reason: 'Counter competitor discounting by boAt and Noise',
              expectedOutcome: '+15% unit sales growth',
              expectedGrowthPercent: 15,
            },
            currentPeriod: 'February 2026',
            product: 'GOAT Rockerz 550',
            metric: 'revenue',
            previousValue: 419720,
            actualValue: 577372,
            actualChangePercent: 37.6,
            expectedChangePercent: 15,
          });
        }
        setIsOutcomeModalOpen(true);
      } else if (stepNum === 6) {
        // Step 6: Ingest March data (GOAT Airdopes 141) and ask: "Should GOAT reduce price?"
        const marRes = await fetch('/api/datasets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preset: 'march',
            label: 'March 2026',
            previousLabel: 'February 2026',
          }),
        });
        const marData = await marRes.json();
        setKpis(marData.kpis);
        setDatasetLabel(marData.label);
        setSituations(marData.situations || []);
        setActiveProduct('GOAT Airdopes 141');
        setDemoStep(6);

        setChatPrompt({
          prompt:
            "Should GOAT reduce the price of GOAT Airdopes 141? What did we learn from our previous pricing experiments on GOAT Rockerz 550?",
          product: 'GOAT Airdopes 141',
        });
      } else if (stepNum === 7) {
        // Step 7: Competitive Impact Analysis on GOAT Rockerz 550 (from ₹1,499 to ₹1,349, -10%)
        setDemoStep(7);
        setActiveProduct('GOAT Rockerz 550');
        setIsCompetitiveModalOpen(true);
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
          }
        } catch (compErr) {
          console.error('Step 7 competitive analysis error:', compErr);
        } finally {
          setCompetitiveLoading(false);
        }
      }
    } catch (err) {
      console.error('Demo step failed:', err);
    } finally {
      setLoading(false);
      setRefreshTimeline((prev) => prev + 1);
    }
  }

  function handleResetDemo() {
    setLoading(true);
    fetch('/api/timeline', { method: 'POST' }).catch(() => {});
    executeDemoStep(1);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Header */}
      <Header
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onResetDemo={handleResetDemo}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hackathon Stepper Banner */}
        <DemoWalkthroughBanner
          currentStep={demoStep}
          onExecuteStep={executeDemoStep}
          loading={loading}
        />

        {/* Detected Situations Banner (if any) */}
        {situations.length > 0 && (
          <SituationsList
            situations={situations}
            onOpenDecisionModal={(sit) => {
              setSelectedSituation(sit);
              setIsDecisionModalOpen(true);
            }}
            onAskAI={(prompt, prod) => {
              setChatPrompt({ prompt, product: prod });
            }}
          />
        )}

        {/* Main 2-Column Split: Analytics Dashboard vs AI Analyst */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Deterministic Business Overview & Memory Timeline (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <BusinessOverview kpis={kpis} datasetLabel={datasetLabel} />
            <DecisionTimeline refreshTrigger={refreshTimeline} />
          </div>

          {/* Right Column: AI Decision Analyst Chat with Recall & Reflect (5 Cols) */}
          <div className="lg:col-span-5 sticky top-24">
            <AIAnalystChat
              activeProduct={activeProduct}
              externalPrompt={chatPrompt}
              onViewEvidence={(evidence, title) => {
                setEvidenceItems(evidence);
                setEvidenceQueryTitle(title);
                setIsEvidenceModalOpen(true);
              }}
              onOpenCompetitiveAnalysis={(analysis) => {
                setCompetitiveData(analysis);
                setIsCompetitiveModalOpen(true);
              }}
            />
          </div>
        </div>
      </main>

      {/* Decision Modal */}
      <DecisionModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        situation={selectedSituation}
        onDecisionCreated={() => {
          setRefreshTimeline((prev) => prev + 1);
          setDemoStep(4);
        }}
      />

      {/* Outcome Modal */}
      <OutcomeModal
        isOpen={isOutcomeModalOpen}
        onClose={() => setIsOutcomeModalOpen(false)}
        candidate={outcomeCandidate}
        onOutcomeRecorded={() => {
          setRefreshTimeline((prev) => prev + 1);
          setDemoStep(6);
        }}
      />

      {/* Memory Evidence Modal ("Why did the AI say this?") */}
      <MemoryEvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        evidence={evidenceItems}
        queryTitle={evidenceQueryTitle}
      />

      {/* Dataset Upload Modal */}
      <DatasetUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDatasetUploaded={(data) => {
          setKpis(data.kpis);
          setDatasetLabel(data.label);
          setSituations(data.situations || []);
          if (data.outcomeCandidates && data.outcomeCandidates.length > 0) {
            setOutcomeCandidate(data.outcomeCandidates[0]);
          }
          setRefreshTimeline((prev) => prev + 1);
        }}
      />

      {/* Competitive Impact Analysis Modal */}
      <CompetitiveAnalysisModal
        isOpen={isCompetitiveModalOpen}
        onClose={() => setIsCompetitiveModalOpen(false)}
        analysis={competitiveData}
        loading={competitiveLoading}
      />
    </div>
  );
}
