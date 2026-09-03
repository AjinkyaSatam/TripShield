# TripShield AI — Enterprise Production Platform Guide

TripShield AI is an enterprise-grade travel disruption recovery platform that models itineraries as connected dependency graphs and autonomously heals cascading disruptions via hybrid rule + AI reasoning.

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Multi-Trip Inventory
```bash
npx prisma db push
npx prisma db seed
```

### 3. Start Production Dev Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Production Authentication & User Accounts

TripShield uses a **cryptographic JWT + HTTP-only secure cookie** session architecture with salted PBKDF2 password hashing and database-backed session tracking.

### Demo Enterprise Accounts:
| User Name | Role | Email | Password | Tier |
|---|---|---|---|---|
| **Alex Mercer** | Solo Executive Traveler | `alex.mercer@stratos-ai.com` | `Password123!` | Diamond Shield VIP |
| **Elena Rostova** | Family Leisure Traveler | `elena.rostova@familytravel.io` | `Password123!` | Platinum Family Shield |
| **Marcus Vance** | Group / Event Coordinator | `marcus.vance@techsummit.org` | `Password123!` | Gold Shield Priority |

### Auth Pages:
- **Sign In**: `http://localhost:3000/login` (Supports credentials & 1-click quick-fill demo buttons)
- **Sign Up**: `http://localhost:3000/signup` (Enterprise traveler onboarding)

---

## 🗺️ Multi-Trip Switching

The platform supports multiple itineraries out-of-the-box:
1. **European AI Summit & London Client Tour** (11 legs, Transatlantic SFO → JFK → LHR → Paris)
2. **Tokyo Global Tech Expo & Kyoto Retreat** (3 legs, Pacific SFO → Tokyo Haneda)
3. **Alps Ski & Zurich Executive Forum** (2 legs, Transatlantic JFK → Zurich)

Switch between them in real-time via the **Itinerary selector** in the top navbar!

---

## 🎬 Live Product Demo Script (3 Minutes)

1. **Sign In & Identity (20s)**:
   - Navigate to `http://localhost:3000/login`.
   - Click **"Alex Mercer (Primary Pitch Itinerary)"** for instant 1-click enterprise sign in.
2. **Topology Inspection (30s)**:
   - On the dashboard, switch between **Timeline** and **Graph (DAG)** view.
   - Show the auto-inferred dependency edges, buffer slack badges (e.g. `105m slack`), and airport nodes.
3. **Proactive Risk Warnings (20s)**:
   - Expand the **Proactive Risk Warning** bar at the top:
   - *"Even with zero flights delayed, the platform warns us about 5 tight connection buffers."*
4. **Trigger Disruption (20s)**:
   - Click the red **"Simulate Disruption"** button in the navbar.
   - Choose **"Primary Pitch: 120m Flight Delay"** and click **"Simulate & Trigger Ripple Analysis"**.
5. **BFS Impact Cascade (30s)**:
   - Show the **Active Travel Disruption** banner and the **4 downstream ripple effects**:
     - ✈️ **Missed connection**: Flight JFK → LHR departs 15m before delayed arrival
     - 🚗 **Missed transfer**: LHR → Central London pickup window closed
     - 🏨 **Hotel check-in delayed**: The Savoy arrival pushed back
     - 📅 **Meeting at risk**: Strategic Board Review transit buffer squeezed
6. **AI Recovery Plans (45s)**:
   - Click **"See AI Recovery Options"**.
   - Review 3 ranked multi-dimensional recovery plans with **radial score gauges**, cost deltas, and AI trade-off explanations.
7. **Apply & Live Healing Diff (20s)**:
   - Click **"Apply This Recovery Plan"** on Option 1.
   - Observe the **Confirmation Diff Modal** showing 3 updated bookings and cost adjustment.
   - Click **"Return to Live Dashboard"** to see the nodes updated to blue **"Rebooked"** badges and healthy green/blue edges.
8. **Compliance Audit Report (15s)**:
   - Click the **"Audit Report"** button in the top navbar to view the formatted Disruption Recovery Audit log for expense filing and insurance claims.
