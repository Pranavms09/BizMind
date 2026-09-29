# 🧠 BizMind — Hindsight-Powered AI Decision Intelligence Platform

> **"An institutional memory decision intelligence platform that remembers what the company tried, why it tried it, what happened afterward, and uses those experiences when analyzing future business decisions."**

Built for the **HackWithHyderabad** Hackathon. Powered by **Hindsight Cloud** persistent memory and **Groq** high-speed LLM & live browser search.

---

## 🌟 Executive Overview

In most modern enterprises, business intelligence tools describe *what is happening*, but they have total amnesia about *what was already tried and what happened afterward*. When team members change or quarters pass, companies repeat identical strategic mistakes because their institutional memory is lost in disconnected slide decks or Slack threads.

**BizMind** solves this by establishing a permanent, self-improving **Institutional Decision Intelligence Loop**:

```
Business Data ──► Deterministic Analysis ──► Strategic Decision ──► Observed Outcome
      ▲                                                                     │
      │                                                                     ▼
Future Decision ◄── Experience Retrieval & Reflection ◄── Hindsight Memory Bank
```

---

## 🏢 Demo Workspace: GOAT Consumer Electronics

To demonstrate BizMind in a realistic enterprise setting, the platform is pre-configured to operate on a fictional Indian consumer-electronics company: **GOAT** (`GOAT Consumer Electronics India`).
- **Operating Brand**: GOAT
- **Industry**: Consumer Electronics
- **Primary Category**: Headphones & Audio
- **Market**: India (Currency: INR / `₹`)
- **Fictional Catalog Products**:
  - `GOAT Rockerz 550` (Wireless Over-Ear Headphones, Baseline: ₹1,499)
  - `GOAT Airdopes 141` (True Wireless Stereo Earbuds, Baseline: ₹1,299)
  - `GOAT Nirvana 751` (Premium Active Noise-Cancelling Headphones, Baseline: ₹3,499)
  - `GOAT Stone 350` (Portable Bluetooth Speaker, Baseline: ₹1,499)

> **Important Architecture Distinction**:
> - **BizMind** is the application platform and AI decision intelligence system.
> - **GOAT** is the enterprise company operated and analyzed inside BizMind.
> - Real Indian market competitors (**boAt**, **Noise**, **Boult**, **JBL**, **Sony**) are researched dynamically from live public web sources for competitive intelligence.

---

## 🔄 Core Decision & Memory Pipeline

The application enforces strict **epistemic boundaries** and separation of concerns:

```mermaid
flowchart TD
    A[User Query or Anomaly] --> B[Next.js Server API Routes]
    B --> C[Deterministic Analytics Engine]
    C -->|Calculated Facts: Rev, Units, MoM%| D[Structured Business Context]
    B --> E[Hindsight Memory Bank 'business-analyst']
    E -->|recall & reflect| F[Retrieved Corporate Precedents]
    B --> G[Groq Live Browser Search]
    G -->|Observed Prices & URLs: boAt, Noise, Boult| H[Live Web Evidence]
    D & F & H --> I[Competitive Simulation Engine]
    I -->|3 Response Scenarios| J[Deterministic Scenario Math]
    D & F & H & J --> K[Groq LLM Synthesis: openai/gpt-oss-120b]
    K --> L[Executive Decision Intelligence]
    L --> M[Auditable Evidence UI Modal]
    L --> N[Hindsight Memory Retain Loop]
```

### 4-Layer Separation of Evidence

To guarantee mathematical truth and prevent hallucinations, evidence types are strictly isolated:
1. **CURRENT BUSINESS FACTS**: Derived purely via TypeScript math from company transaction records (Revenue, Units, ASP, MoM Growth). Zero LLM arithmetic.
2. **HISTORICAL INSTITUTIONAL MEMORY**: Retrieved from Hindsight Cloud bank (`business-analyst`). Details prior company actions, rationales, and evaluated outcomes.
3. **LIVE WEB EVIDENCE**: Public competitor prices and active offers captured via Groq's `openai/gpt-oss-120b` browser search with clickable source URLs.
4. **DERIVED SCENARIOS & ASSUMPTIONS**: Purely mathematical models (No Response, Partial Response 50%, Full Response 100%) with explicit behavioral assumptions.

---

## 🚀 Key Features

### 1. 🧠 Hindsight Institutional Memory Engine
- **Memory Retention (`retain`)**: Records business decisions with structured metadata (action, reason, target metric, expected growth) and pairs them with evaluated outcomes and strategic lessons.
- **Contextual Retrieval (`recall`)**: Dynamically retrieves relevant historical precedents when analyzing new questions or product challenges.
- **Cognitive Reflection (`reflect`)**: Synthesizes accumulated memories across product categories, identifying whether price elasticity in one tier applies to another.
- **"Why did the AI say this?" Audit Trail**: Clickable evidence modal displaying the exact memories and facts cited by the agent.

### 2. ⚡ Deterministic Business Analytics
- Ingests raw CSV sales logs (Date, Product, Quantity, Revenue, Region, Channel).
- Calculates exact KPIs: Total Revenue, Units Sold, Average Order Value (AOV), Average Selling Price (ASP), and Revenue Share %.
- Computes Period-over-Period (MoM) growth and flags anomalies (drops >15% categorized as High/Medium severity situations).

### 3. 🎯 Competitive Impact Analysis
Allows users to ask complex strategic questions like:
> *"What happens if GOAT reduces the Rockerz 550 price by 10%?"*  
> *"Should GOAT reduce the price of the Rockerz 550 from ₹1,499 to ₹1,349?"*  
> *"How would a 10% price reduction affect GOAT's competitive position?"*

- **Mathematical Price Metrics**:
  - Absolute Change: `₹1,499 ➔ ₹1,349 (-₹150)`
  - Percentage Move: `-10.0%`
  - Competitor Price Gaps & Relative Price Indices (`(Company Price / Competitor Price) * 100`).
  - Observed Position Shift: E.g., *"Moves from Above 2 and below 1 ➔ Below 2 of 3 observed competitors"*.
- **3 Deterministic Simulation Scenarios**:
  - **Scenario 1: No Response** (Competitors maintain current offers; GOAT secures immediate pricing edge).
  - **Scenario 2: Partial Response** (Competitors match 50% of the discount; price gap narrows).
  - **Scenario 3: Full Response** (Competitors match 100% of the price cut; initiates margin compression risk).
- **Verifiable Source Attribution**: Every competitor claim includes an exact source URL, domain, and timestamp.
- **Financial Impact Policy**: Declares that while competitive price position can be evaluated, revenue cannot be guaranteed without explicit demand elasticity assumptions.

### 4. 📜 Strategic Decision & Outcome Timeline
- An interactive chronological ledger tracking:
  - Anomalies detected
  - Decisions logged
  - Outcomes evaluated vs targets
  - Lessons retained into Hindsight

### 5. 💎 Nothing OS-Inspired Monochrome Executive Suite
- **Aesthetic & Design System**: High-contrast monochrome palette, dot-matrix styling, glowing translucent glass panels, glyph status badges, and micro-interactions.
- **8 Dedicated Business Modules**:
  - **Executive Dashboard (`DashboardView`)**: Real-time KPI summaries (Revenue, Units, ASP, MoM Growth), revenue share breakdowns, high-severity anomaly alerts, and scenario quick-launchers.
  - **AI Strategic Analyst (`AnalystView`)**: Conversational strategic intelligence powered by Groq and Hindsight Cloud, featuring clickable memory citation pills, quick strategy prompts, and full evidence audit modals.
  - **Competitive Impact Center (`CompetitiveView`)**: Market intelligence workspace conducting real-time Groq browser search against live Indian audio competitors (**boAt**, **Noise**, **Boult**), deterministic price gap indexes, and 3-scenario simulations.
  - **Dataset Ingestion & Management (`DatasetsView`)**: Multi-quarter CSV ingestion hub with pre-loaded demo sets (Dec 2025, Jan 2026, Feb 2026, Mar 2026) and custom CSV upload support with schema verification and anomaly detection.
  - **Strategic Decisions Ledger (`DecisionsView`)**: Complete governance ledger tracking proposed actions, expected KPI growth targets, evaluated post-implementation results, and retained lessons.
  - **Hindsight Memory Explorer (`MemoryView`)**: Direct bank inspector for the Hindsight Cloud memory bank (`business-analyst`), memory recall simulation, and precedent search.
  - **Cognitive Learning & Rules Engine (`LearningView`)**: Synthesizes historical lessons into reusable company guidelines, cross-category elasticity principles, and strategic operational rules.
  - **Interactive Business Timeline (`TimelineView`)**: Chronological unified feed of detected anomalies, leadership decisions, outcome reviews, and institutional memory retention events.

### 6. 🌐 Interactive 3D WebGPU AeroShards & Three.js Memory Network
- **AeroShards 3D WebGPU Engine (`vgpu`)**:
  - WebGPU-powered visual compute shader simulation with procedural shard dynamics.
  - Real-time cursor interaction modes (`repel`, `attract`, `ripple`, `hold-to-gather`).
  - Physically based shading with pearl/chrome materials, bloom, procedural film grain, and chromatic aberration.
  - **Graceful Canvas Fallback**: Automatically falls back to high-performance canvas-based `LaserFlow` beam animations on non-WebGPU devices.
- **3D Memory Neural Network (`ThreeMemoryNetwork`)**:
  - Interactive WebGL Three.js (`@react-three/fiber` & `@react-three/drei`) neural node graph.
  - Visualizes semantic clusters of corporate memories, strategic precedents, and institutional knowledge nodes in real-time 3D space.

### 7. ⚡ Global Command Center (`Cmd+K` / `Ctrl+K`) & Quick Navigation
- **Spotlight Search & Launcher (`CommandCenter`)**: Instant keyboard-driven navigation across all views, preset actions, demo triggers, and settings modals.
- **Global Toast Notification System (`ToastContext`)**: Instant non-blocking alerts for actions, data uploads, and decision logging.
- **Settings & Help Modals**: Manage active configurations, view hotkeys cheatsheet, and trigger full system state resets.

### 8. 🚀 Full-Screen Immersive Landing Experience with Dynamic State
- **Full-Screen Hero Showcase (`LandingView`)**:
  - Immersive hero section featuring the live AeroShards background, benchmark metrics (100% Deterministic Math, <2s Groq Response, Live Competitor Search, +37.6% Validated Lift), and direct CTA launchers (*"Start • Launch Executive Dashboard"* and *"Ask AI Analyst"*).
  - Synchronized browser URL routing (`?landing=true` / `?landing=false` and `?tab=...`) with browser history navigation support (`popstate`).

---

## 🎭 The 7-Step Hackathon Demo Story

BizMind includes an **Interactive Hackathon Demo Journey** banner allowing judges to step through the entire institutional loop in one click:

| Step | Action | Business Narrative & Technical Mechanism |
|---|---|---|
| **Step 1** | **Upload Jan Data** | Ingests January 2026 data. Deterministic engine detects **GOAT Rockerz 550 revenue dropped -24.3%** under aggressive competitor price discounting. |
| **Step 2** | **Analyze & Advise** | AI Analyst analyzes the decline and recommends testing a targeted 10% price reduction to restore volume. |
| **Step 3** | **Record Decision** | Manager approves reducing price from ₹1,499 to ₹1,349 (-10%). **Retained into Hindsight bank** with expected target of +15% volume. |
| **Step 4** | **Upload Feb Data** | Ingests February 2026 data. System computes actual performance: **Units surge +52.9%** (280 ➔ 428) and **Revenue recovers +37.6%** (₹4,19,720 ➔ ₹5,77,372). |
| **Step 5** | **Record Outcome** | Evaluates outcome as `BETTER_THAN_EXPECTED`. **Retains institutional lesson into Hindsight**: *"GOAT Rockerz 550 exhibits high price elasticity. A 10% discount quickly won back price-sensitive customers in wireless headphones without destroying gross margins."* |
| **Step 6** | **Airdopes Query** | Ingests March data where `GOAT Airdopes 141` sales soften. User asks: *"Should GOAT reduce the price of GOAT Airdopes 141 based on past Rockerz lessons?"* Hindsight **recalls and reflects** on Rockerz 550 lessons, warning that TWS earbuds have different buyer demographics. |
| **Step 7** | **Competitive Impact** | User runs Competitive Impact Analysis on `GOAT Rockerz 550` (₹1,499 ➔ ₹1,349). System searches live prices for **boAt, Noise, Boult**, models 3 response scenarios, and presents an auditable strategy breakdown. |

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework**: Next.js 15.5 (App Router, Server & Client Components)
- **Language**: TypeScript 5.7 (Strict type-checking)
- **Styling & Design System**: Tailwind CSS, Nothing OS Monochrome Aesthetic, Lucide Icons, Glassmorphic Panels
- **3D & Visual Compute Graphics**:
  - **AeroShards**: WebGPU compute & fragment shaders (`vgpu`)
  - **Memory Network**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
  - **Motion & Canvas**: GSAP, Custom HTML5 Canvas (`LaserFlow`)
- **Data Visualization**: Recharts (Revenue share, KPI distribution charts)
- **Memory Provider**: **Hindsight Cloud** (`@vectorize-io/hindsight-client`)
- **LLM & Search Provider**: **Groq SDK** (`groq-sdk`)
  - Primary Model: `openai/gpt-oss-120b` (with browser search tool enabled)
  - Fallback Model: `qwen/qwen3.8-27b` (automatic failover on rate limits)
- **Data Persistence**: Server-side local JSON store (`.data/business_state.json`) protected by `.gitignore`
- **Client Architecture**: Strongly typed API Client (`src/lib/api-client.ts`) with global Toast notification context

---

## 📁 Project Structure

```text
├── public/
│   ├── favicon.ico                         # App favicon
│   ├── icon.png                            # High-res app icon
│   └── logo.png                            # Official BizMind brand logo
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts               # Chat endpoint with Hindsight recall/reflect & auto competitive routing
│   │   │   ├── competitive-analysis/route.ts # Direct Competitive Impact Analysis API
│   │   │   ├── datasets/route.ts           # CSV upload, KPI engine & preset loaders
│   │   │   ├── decisions/route.ts          # Decision logging & Hindsight memory retention
│   │   │   ├── outcomes/route.ts           # Outcome evaluation & institutional lesson retention
│   │   │   ├── timeline/route.ts           # Chronological business timeline events
│   │   │   └── hindsight/test/route.ts     # Health and bank connectivity check
│   │   ├── globals.css                     # Nothing OS monochrome theme & Tailwind styling
│   │   ├── layout.tsx                      # Root layout with brand metadata & ToastProvider
│   │   └── page.tsx                        # Main application controller, view routing & modal manager
│   ├── components/
│   │   ├── views/                          # 8 Dedicated Nothing OS Business Modules
│   │   │   ├── AnalystView.tsx             # Strategic AI conversational analyst
│   │   │   ├── CompetitiveView.tsx         # Live competitor intelligence & scenario matrix
│   │   │   ├── DashboardView.tsx           # Executive metrics, charts & active anomalies
│   │   │   ├── DatasetsView.tsx            # Multi-quarter CSV ingestion & data preview
│   │   │   ├── DecisionsView.tsx           # Decision governance ledger & outcome validator
│   │   │   ├── LandingView.tsx             # Immersive full-screen showcase & hero CTA
│   │   │   ├── LearningView.tsx            # Cross-product elasticity reflection & rules
│   │   │   ├── MemoryView.tsx              # Hindsight Cloud bank browser & recall tester
│   │   │   └── TimelineView.tsx            # Chronological business stream
│   │   ├── AeroShards.tsx                  # WebGPU 3D interactive procedural shards background
│   │   ├── AeroShards.css                  # AeroShards viewport styling
│   │   ├── AIAnalystChat.tsx               # Chat component with memory citation pills
│   │   ├── BusinessOverview.tsx            # KPI metric cards & product performance table
│   │   ├── CommandCenter.tsx               # Cmd+K / Ctrl+K spotlight launcher
│   │   ├── CompetitiveAnalysisModal.tsx    # 3 Scenarios, observed competitors & evidence audit modal
│   │   ├── DatasetUploadModal.tsx          # CSV uploader & one-click demo presets
│   │   ├── DecisionModal.tsx               # Decision form with target metric & expected growth
│   │   ├── DecisionTimeline.tsx            # Decision event timeline renderer
│   │   ├── DemoWalkthroughBanner.tsx       # 7-step interactive hackathon journey banner
│   │   ├── Header.tsx                      # Brand header with Hindsight bank connectivity badge
│   │   ├── HelpModal.tsx                   # Keyboard shortcuts & feature guide
│   │   ├── LaserFlow.tsx                   # Canvas-based laser beam fallback background
│   │   ├── MemoryEvidenceModal.tsx         # "Why did the AI say this?" Hindsight evidence viewer
│   │   ├── OutcomeModal.tsx                # Outcome evaluator & lesson capture
│   │   ├── SettingsModal.tsx               # Active configuration & state reset modal
│   │   ├── Sidebar.tsx                     # Collapsible Nothing OS navigation sidebar
│   │   ├── SituationsList.tsx              # Detected business anomalies & crisis cards
│   │   ├── ThreeMemoryNetwork.tsx          # Three.js / WebGL 3D neural memory graph
│   │   └── TopNav.tsx                      # Header navigation, live indicators & action buttons
│   ├── config/
│   │   └── company.ts                      # Centralized GOAT company configuration & product catalog
│   ├── contexts/
│   │   └── ToastContext.tsx                # Global toast notifications context
│   ├── data/
│   │   └── sample-datasets.ts              # Synthetic CSV datasets (Dec, Jan, Feb, Mar)
│   ├── lib/
│   │   ├── analytics.ts                    # Pure deterministic CSV parser & KPI engine
│   │   ├── api-client.ts                   # Strongly-typed client abstraction for all endpoints
│   │   ├── competitive-engine.ts           # Deterministic price gaps, rankings & 3 scenario models
│   │   ├── competitive-research.ts         # Groq browser search agent & citation parser
│   │   ├── competitive-service.ts          # Orchestration layer uniting internal data, Hindsight, and web
│   │   ├── db.ts                           # Server-side business state storage
│   │   ├── groq.ts                         # Groq client with epistemic prompts & model failover
│   │   └── hindsight.ts                    # Hindsight service (retain, recall, reflect)
│   └── types/
│       ├── business.ts                     # Business decisions, outcomes, KPIs, and situations
│       ├── competitive.ts                  # Scenarios, web evidence, and calculations
│       └── index.ts                        # Unified types export
├── scripts/
│   ├── test-backend-flow.ts                # E2E decision loop & Hindsight integration test
│   ├── test-competitive-flow.ts            # Competitive analysis pipeline test
│   ├── test-groq.ts                        # Direct Groq connectivity & model test
│   ├── test-hindsight.ts                   # Direct Hindsight API retain/recall/reflect test
│   └── verify-layout.mjs                   # Headless CDP layout verification across viewports
├── tests/
│   ├── business-analyst.test.ts            # Unit tests for CSV parsing, KPIs, and anomaly math
│   └── competitive-calculations.test.ts    # Unit tests for price deltas, gaps, rankings, and scenarios
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Groq LLM Configuration
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# Hindsight Cloud Configuration
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=business-analyst
```

> **Security Note**: All API keys are strictly accessed on the Next.js server side. Neither key is ever exposed to client bundles or browser code. `.env` and `.data/` are protected in `.gitignore`.

---

## 🚦 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

- **Full-Screen Showcase**: Explore the interactive AeroShards WebGPU hero background and feature walkthrough.
- **Executive Dashboard**: Click *"Start • Launch Executive Dashboard"* or navigate to `?landing=false`.
- **Command Center**: Press `Cmd + K` or `Ctrl + K` anytime to open the spotlight action launcher.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🧪 Verification & Test Suite

The project includes 100% automated test coverage across deterministic logic, Hindsight cloud memory, competitive analysis pipelines, and UI layouts:

```bash
# 1. Run all deterministic unit tests (KPIs, anomalies, competitive math, and scenarios)
npm run test:unit

# 2. Run Hindsight integration test (retain -> recall -> reflect against Cloud bank)
npm run test:hindsight

# 3. Run complete End-to-End backend decision cycle (Dec -> Jan -> Feb -> Mar)
npm run test:e2e

# 4. Run Competitive Impact Analysis flow (Recall + Web Search + 3 Scenarios + Groq)
npm run test:competitive

# 5. Run headless layout verification across multiple screen resolutions (FHD, HD+, MacBook, Laptop, Tablet)
node scripts/verify-layout.mjs

# 6. Verify TypeScript type safety
npx tsc --noEmit
```

---

## 🏆 Hackathon Highlights

- **Mandatory Hindsight Integration**: Hindsight is the central backbone of the product, providing real institutional learning across quarters rather than stateless chat.
- **Zero Numerical Hallucinations**: Exact company figures and scenario rankings are computed deterministically in code before the LLM ever sees them.
- **Epistemic Boundaries**: The AI never hallucinates competitor future actions or guarantees financial outcomes; it presents clearly labeled simulation scenarios with explicit assumptions.
- **Clickable Web Citations**: Real-time competitor pricing gathered via Groq browser search includes live source links for full auditability.
- **AeroShards WebGPU 3D Engine**: Interactive visual compute background simulation with real-time cursor physics and automatic graceful canvas fallback.
- **Nothing OS Monochrome Design System**: Purpose-built, distraction-free executive interface engineered for rapid decision-making, deep auditability, and keyboard-first productivity.
