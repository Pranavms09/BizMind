export * from './business';
export * from './competitive';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Business {
  id: string;
  name: string;
  industry: string;
}

export interface DatasetColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sampleValues: any[];
  nonNullCount: number;
  uniqueCount: number;
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  filename: string;
  rowCount: number;
  columnCount: number;
  columns: DatasetColumn[];
  summary?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rows?: any[];
  pagination?: {
    page: number;
    pageSize: number;
    totalRows: number;
    totalPages: number;
  };
}

export interface Decision {
  id: string;
  title: string;
  description?: string;
  context?: string;
  optionsConsidered?: string | string[];
  chosenAction?: string;
  strategy?: string;
  reason?: string;
  expectedOutcome: string;
  targetMetric?: string;
  targetValue?: number;
  startDate?: string;
  date?: string;
  expectedEvaluationDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'active' | 'evaluated' | 'archived';
  action?: string;
  affectedProduct?: string;
  affectedMetric?: string;
  expectedGrowthPercent?: number;
  outcome?: Outcome;
  memories?: MemoryRecord[];
  createdAt: string;
}

export interface Outcome {
  id: string;
  decisionId: string;
  actualOutcome: string;
  metric: string;
  value: number;
  expectedValue: number;
  difference: number;
  percentageDifference: number;
  date: string;
  notes?: string;
  expectationMet: boolean;
  lesson?: string;
  createdAt: string;
}

export interface MemoryRecord {
  id: string;
  businessId?: string;
  type: 'decision' | 'outcome' | 'lesson' | 'historical_event' | 'insight' | 'business_context' | 'strategy';
  title: string;
  situation?: string;
  decision?: string;
  reason?: string;
  action?: string;
  result?: string;
  lesson?: string;
  relevance: number;
  category: string;
  source: string;
  date: string;
  decisionId?: string;
  outcomeId?: string;
  analysisId?: string;
  tags?: string[];
  decisionRef?: any;
}

export interface MemoryNetworkNode {
  id: string;
  title: string;
  type: string;
  category: string;
  date: string;
  situation?: string;
  decision?: string;
  action?: string;
  result?: string;
  lesson?: string;
  relevance: number;
  position: [number, number, number];
  decisionId?: string;
  outcomeId?: string;
}

export interface MemoryNetworkLink {
  source: string;
  target: string;
  type: string;
}

export interface MemoryNetworkData {
  nodes: MemoryNetworkNode[];
  links: MemoryNetworkLink[];
}

export interface KPIItem {
  id: string;
  label: string;
  value: string | number;
  numericValue: number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  period: string;
}

export interface DashboardData {
  dataset: {
    id: string;
    name: string;
    filename: string;
    rowCount: number;
  } | null;
  kpis: KPIItem[];
  charts: {
    revenueTrend: Array<{ period: string; revenue: number; units: number }>;
    salesTrend: Array<{ period: string; units: number; growth: number }>;
    productPerformance: Array<{ product: string; revenue: number; units: number; margin: number; share: number }>;
    customerSegments: Array<{ name: string; value: number; customers: number; share: number }>;
    marketingPerformance: Array<{ channel: string; revenue: number; units: number; share: number }>;
  };
  recentDecisions: Decision[];
  recentInsights: Insight[];
  recentMemories: MemoryRecord[];
  learningProgress: {
    totalMemories: number;
    decisionsEvaluated: number;
    accuracyRate: number;
    experienceScore: number;
  };
}

export interface AIAnalysisResponse {
  summary: string;
  keyFindings: string[];
  metrics: Array<{
    label: string;
    value: string | number;
    change?: string;
    isDeterministic: boolean;
  }>;
  historicalContext: Array<{
    memoryId?: string;
    previousDecision: string;
    date: string;
    action: string;
    result: string;
    lesson: string;
    relevance: number;
  }>;
  interpretation: string;
  nextSteps: string[];
  supportingVisualization?: {
    type: 'line' | 'bar' | 'area' | 'pie';
    title: string;
    xAxisKey: string;
    dataKeys: string[];
    data: any[];
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages?: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  structuredOutput?: AIAnalysisResponse;
  analysisId?: string;
  createdAt: string;
}

export interface Insight {
  id: string;
  title: string;
  explanation: string;
  supportingMetric?: string;
  chartType?: string;
  chartData?: any;
  category: string;
  relatedDecisionId?: string;
  relatedDecision?: Decision;
  createdAt: string;
}

export interface LearningData {
  stats: {
    totalAnalyses: number;
    totalDecisions: number;
    totalOutcomes: number;
    totalMemories: number;
    contextAwarenessRate: number;
    reusableLessonsCount: number;
  };
  learningStages: Array<{
    step: number;
    title: string;
    status: 'completed' | 'pending';
    date: string | null;
    description: string;
    contextAwarenessScore: number;
    memoriesActive: number;
  }>;
  evolution: Array<{
    milestone: string;
    memories: number;
    accuracy: number;
    contextualRecall: number;
  }>;
}

export interface SearchResults {
  datasets: Array<{ id: string; title: string; type: string; path: string }>;
  decisions: Array<{ id: string; title: string; type: string; path: string }>;
  memories: Array<{ id: string; title: string; type: string; path: string }>;
  insights: Array<{ id: string; title: string; type: string; path: string }>;
  pages: Array<{ id: string; title: string; type: string; path: string }>;
}
