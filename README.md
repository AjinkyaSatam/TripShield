# 🛡️ TripShield AI

> **Autonomous Travel Disruption Recovery Platform**  
> *Modeling itineraries as connected dependency graphs to automatically heal cascading flight, hotel, and transit disruptions with hybrid AI reasoning.*

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![MakeMyTrip Theme](https://img.shields.io/badge/Theme-MakeMyTrip%20Red-e41d2d?style=flat-square)](https://makemytrip.com)
[![Currency](https://img.shields.io/badge/Currency-INR%20(₹)-green?style=flat-square)](#-pricing-in-indian-rupees-)

---

## 📌 The Problem

Travel is deeply interconnected, but current booking apps treat trips as disconnected lists:
- A **120-minute flight delay** doesn't just push back your arrival time.
- It causes a **missed transatlantic connection**, which closes your **airport chauffeur pickup window**, voids your **guaranteed executive hotel check-in**, and creates a scheduling conflict with your **morning board meeting**.
- Travelers are forced to spend hours waiting in airport customer service lines, juggling airline hotlines, and paying out-of-pocket rebooking fees.

---

## 💡 The TripShield Solution

**TripShield AI** transforms static itineraries into a **Directed Acyclic Graph (DAG)**:
1. **Edge Slack Inference**: Automatically infers dependencies (`connects_to`, `transfer_needed`, `requires_checkin_before`, `same_day`) and tracks buffer slack minutes between nodes.
2. **BFS Cascade Engine**: When a disruption occurs, a Breadth-First Search algorithm computes every downstream consequence in milliseconds.
3. **Hybrid AI Recovery**: Evaluates real-time inventory and generates 3 ranked multi-objective recovery plans (balancing schedule drift, cost deltas, and downstream protection) using a fast rule engine paired with Claude 3.5 Sonnet.
4. **1-Click Graph Healing**: Applying an option atomically updates all affected bookings, recomputes graph topology, and logs a compliance audit report.

---

## 🌟 Key Features

### 🕸️ 1. Connected Itinerary Dependency Graph (DAG)
- Renders the entire journey as an interactive SVG node-link topology.
- Visualizes buffer slack (e.g., `105m slack`), tight headroom warnings, and animated disruption pulse waves.
- Validates cycle freedom so itineraries remain strictly forward-moving in time.

### ⚡ 2. BFS Cascade Ripple Propagation
- Accurate minute-by-minute propagation:
  $$\text{Effective Arrival} = \text{Scheduled Arrival} + \text{Delay Minutes}$$
  $$\text{Slack Deficit} = \text{Available Buffer} - \text{Min Required Buffer}$$
- If slack deficit $< 0$, downstream node is automatically flagged as `disrupted` or `at_risk`.

### 🤖 3. Hybrid AI Recovery Engine (Stage A + Stage B)
- **Stage A (Deterministic Rule Engine)**: Filters candidate inventory, computes cost deltas and arrival drift, and scores convenience ($0–100$ scale).
- **Stage B (Claude 3.5 Sonnet)**: Generates human-friendly rationale with trade-offs. Includes a **strict 3-second timeout** with guaranteed deterministic fallback.

### 🛡️ 4. Proactive Risk Headroom Scanner
- Scans layover buffers before any flight is delayed.
- Flags tight connections with $<20$ minutes of headroom so travelers can prepare in advance.

### 🎨 5. MakeMyTrip (MMT) Red & White Design System
- Built with a clean, energetic travel portal palette: signature Crimson Red (`#e41d2d`), crisp white flight/hotel ticket cards, and light gray backdrops (`#f4f6fa`).
- Eliminates gloomy dark interfaces in favor of a trustworthy consumer & enterprise travel aesthetic.

### 🇮🇳 6. Pricing in Indian Rupees (₹)
- All domestic and international flight segments, executive hotels, and express transfers are calibrated to realistic Indian Rupee rates (e.g. `₹35,500`, `₹72,000`, `₹1,45,000`).
- Formatted according to the Indian numbering system (`en-IN`) with clear cost deltas (`+₹3,500`, `-₹2,500`, `₹0`).

### 🔐 7. Self-Contained Enterprise Authentication
- Cryptographic JWT session tokens stored in secure HTTP-only cookies (`lib/auth.ts`).
- Salted PBKDF2 password hashing with database session tracking.
- Dedicated `/login` and `/signup` pages with instant **1-Click Demo Accounts**.

### 📋 8. Compliance Disruption Audit Report
- Generates a formatted corporate incident audit log showing root cause, BFS cascade history, and zero-deductible insurance protection for instant expense reimbursement.

---

## 👥 Demo Traveler Accounts

Use these pre-configured accounts on the [`/login`](http://localhost:3000/login) page:

| Traveler Name | Role | Email | Password | Loyalty Tier |
|---|---|---|---|---|
| **Alex Mercer** | Solo Executive Traveler | `alex.mercer@stratos-ai.com` | `Password123!` | Diamond Shield VIP |
| **Elena Rostova** | Family Leisure Traveler | `elena.rostova@familytravel.io` | `Password123!` | Platinum Family Shield |
| **Marcus Vance** | Group / Event Coordinator | `marcus.vance@techsummit.org` | `Password123!` | Gold Shield Priority |

*(You can also use the 1-click quick-sign-in buttons on the login page for instant access without typing credentials)*.

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/AjinkyaSatam/TripShield.git
cd TripShield
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize Database & Seed Itineraries
TripShield uses SQLite by default (`file:./dev.db`) for zero-friction local setup without requiring a PostgreSQL container:
```bash
npx prisma db push
npx prisma db seed
```
*(Or use `npm run seed`)*

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Environment Configuration (`.env`)

Create a `.env` file in the project root:

```env
# Database connection string (SQLite for local dev, Postgres-compatible for production)
DATABASE_URL="file:./dev.db"

# JWT Secret Key for Session Authentication
JWT_SECRET="tripshield_super_secret_jwt_key_enterprise_2026"

# Optional: Anthropic API Key for Claude 3.5 Sonnet natural-language explanations
# If left empty, TripShield automatically uses deterministic rule-engine ranking (100% demo-safe).
ANTHROPIC_API_KEY=""
```

---

## 🎬 Product Walkthrough & Recovery Workflow

1. **Sign In (15s)**:
   - Go to `http://localhost:3000/login` and click **"Alex Mercer (Primary Itinerary)"** for instant 1-click sign in.
2. **Topology Inspection (30s)**:
   - On the dashboard, switch between **Timeline** and **Graph (DAG)** view.
   - Point out the auto-inferred dependency edges, buffer slack badges (e.g. `105m slack`), and node status rings.
3. **Proactive Risk Warnings (20s)**:
   - Expand the **Proactive Risk Warning** bar at the top:
   - *"Notice it warns us about tight layovers (<20 min headroom) before any flight is even delayed."*
4. **Trigger Disruption (20s)**:
   - Click the red **"Simulate Disruption"** button in the navbar.
   - Select **"120m Flight Delay Scenario"** (DL 412 delayed by 120m) and click **"Simulate & Trigger Ripple Analysis"**.
5. **BFS Impact Cascade (30s)**:
   - The **Active Travel Disruption** banner highlights the root cause (+120m delay) and the **4 downstream ripple effects**:
     - ✈️ **Missed connection**: Flight JFK → LHR (VS 004) departs 15m before delayed arrival.
     - 🚗 **Missed transfer**: LHR → Central London pickup window closed.
     - 🏨 **Hotel check-in delayed**: The Savoy London arrival pushed back.
     - 📅 **Meeting at risk**: Strategic Board Meeting transit buffer squeezed.
6. **AI Recovery Plans (45s)**:
   - Click **"See AI Recovery Options"**.
   - Review 3 ranked multi-dimensional recovery plans with **radial score gauges**, cost deltas in ₹, and AI trade-off explanations:
     - **Option 1 (Fastest Connection / BA 178)**: Minimizes schedule drift, auto-reschedules Savoy check-in and transfer.
     - **Option 2 (Direct Re-route / UA 901)**: Nonstop flight bypassing JFK layover bottleneck completely.
     - **Option 3 (Budget Shield / AA 100)**: Cost-neutral recovery with ₹2,500 fare savings credit.
7. **Apply & Confirmation Diff (20s)**:
   - Click **"Apply This Recovery Plan"** on Option 1.
   - Observe the **Confirmation Diff Modal** showing the 3 reconciled bookings and cost adjustment.
   - Click **"Return to Live Dashboard"** to see all nodes updated with blue **"Rebooked"** badges and healthy edges.
8. **Compliance Audit Report (10s)**:
   - Click **"Audit Log"** in the top navbar to view the corporate travel insurance compliance summary.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate with email & password, sets HTTP-only JWT cookie |
| `POST` | `/api/auth/signup` | Register new enterprise traveler |
| `GET` | `/api/auth/me` | Fetch currently authenticated user session |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `POST` | `/api/auth/demo-switch` | 1-click persona switch for demo presentation |
| `GET` | `/api/trips` | List all monitored trips |
| `GET` | `/api/trips/[id]` | Fetch trip with full dependency graph nodes & edges |
| `POST` | `/api/disruptions/simulate` | Inject flight delay/cancellation & execute BFS cascade |
| `GET` | `/api/disruptions/[id]/impact` | Retrieve computed ripple impact analysis |
| `GET` | `/api/disruptions/[id]/recovery-plans` | Generate Stage A + Stage B ranked recovery options |
| `POST` | `/api/recovery-plans/[id]/apply` | Atomically apply selected plan & heal itinerary |
| `GET` | `/api/trips/[id]/risk-warnings` | Proactively scan buffer headroom (<20m) |
| `POST` | `/api/seed/reset` | Reset demo database to pristine state |

---

## 🏗️ Project Structure

```
TripShield/
├── app/
│   ├── api/                   # 14 REST API Route Handlers
│   ├── login/page.tsx         # Enterprise Sign In Page
│   ├── signup/page.tsx        # Traveler Onboarding Page
│   ├── layout.tsx             # Root layout with Plus Jakarta Sans & JetBrains Mono
│   ├── page.tsx               # Main Dashboard (Timeline & Graph views)
│   └── globals.css            # MakeMyTrip Red & White styling system
├── components/
│   ├── BookingNodeCard.tsx    # Airline ticket / hotel booking card
│   ├── ItineraryGraph.tsx     # SVG node-link dependency DAG visualizer
│   ├── ImpactBanner.tsx       # Disruption command center banner
│   ├── RecoveryPlanCard.tsx   # AI recovery comparison card with radial gauge
│   ├── ProactiveRiskPanel.tsx # Layover headroom warning drawer
│   ├── DisruptionModal.tsx    # Incident simulation modal
│   ├── ConfirmationDiffModal.tsx # Post-recovery reconcile diff
│   ├── StatusBadge.tsx        # Confirmed / At Risk / Disrupted / Rebooked badges
│   └── TravelerAuthModal.tsx  # Traveler persona switcher modal
├── lib/
│   ├── auth.ts                # JWT signing & PBKDF2 password hashing
│   ├── format.ts              # Indian Rupee (₹) currency formatter
│   ├── prisma.ts              # PrismaClient singleton
│   ├── seedData.ts            # Multi-trip seed data in Indian Rupees
│   ├── graph/
│   │   ├── builder.ts         # DAG construction, edge inference, cycle detection
│   │   ├── impact.ts          # BFS cascade delay propagation algorithm
│   │   ├── riskScan.ts        # Proactive layover buffer scanner
│   │   └── types.ts           # Graph data structures
│   └── recovery/
│       ├── ruleEngine.ts      # Stage A multi-objective candidate scoring
│       ├── types.ts           # Recovery options and actions schema
│       └── ../ai/claude.ts    # Stage B Claude 3.5 Sonnet wrapper with 3s fallback
├── prisma/
│   └── schema.prisma          # Database schema (User, Session, Trip, Booking, Links)
└── scripts/
    ├── test-core-engine.ts    # Core graph & recovery automated test suite
    ├── test-api-routes.ts     # REST API automated test suite
    └── test-auth-flow.ts      # Authentication test suite
```

---

## 📜 License

MIT © 2026 TripShield AI Team. Built for travel resilience.
