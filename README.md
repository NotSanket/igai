# IGAI
### Impact-Driven, Geographical Equity, Allocation and Intelligence

> **Every rupee. The right projects. Greater impact.**

IGAI is a decision-grade CSR allocation platform for companies evaluating competing NGO proposals under a fixed budget. It scores projects across measurable delivery factors, then identifies the **strongest combination of projects** based on impact, reach, cost, risk, evidence, and geographic equity.

The current prototype is deterministic and explainable: identical proposals, budget, strategy, and equity settings produce identical results.

## PREVIEW
<img width="1899" height="864" alt="image" src="https://github.com/user-attachments/assets/a1599496-c169-4eac-8965-edd2a4dc3ce5" />

<img width="1898" height="861" alt="image" src="https://github.com/user-attachments/assets/3c72bfa7-d2bd-46ca-8c09-f2b52ca6bc28" />

## Why IGAI?

CSR allocation is a portfolio problem—not simply a ranking problem.

| Project | Funding request | Individual score |
|---|---:|---:|
| A | ₹50L | 95 |
| B | ₹25L | 88 |
| C | ₹25L | 87 |

A ranking-only system selects A first. IGAI also evaluates whether **B + C** produces a stronger combined outcome within the same ₹50L constraint.

That distinction matters when limited capital must serve proposals with different reach, geographies, costs, evidence quality, and delivery risk.

## The IGAI approach

```text
NGO Proposals → Proposal Evaluation → Portfolio Optimization → Equity + Risk + Reach Analysis → Explainable CSR Allocation
```

IGAI turns a live proposal pipeline into a transparent portfolio recommendation without delegating the funding decision to a black-box model.

## Feature highlights

| Experience | Value |
|---|---|
| **CSR Command Dashboard** | Summarizes budget pressure, proposal demand, potential reach, sectors, and districts. |
| **Corporate Proposal Pipeline** | Offers read-only browsing, search, filters, scores, evidence, and project details. |
| **Portfolio Optimizer** | Finds the strongest eligible project combination under a configurable budget. |
| **₹1 Crore Challenge** | Compares a human-built allocation with exhaustive portfolio search. |
| **Scenario Lab** | Simulates alternative budgets, strategies, and equity settings before spending. |
| **Impact Map** | Maps proposal coordinates with filters, popups, KPIs, and district analytics. |
| **NGO Proposal Workspace** | Supports authenticated submission, ownership-scoped viewing, and editing. |
| **Explainable Allocation** | Provides deterministic reasons for selected and deferred projects. |
| **Geographic Equity** | Measures coverage, need, diversity, and concentration. |
| **Strategy Presets** | Supports seven distinct CSR decision postures. |
| **Role-Based Access** | Separates corporate decision tools from NGO-owned workflows. |

## The optimizer

The server-side optimization engine receives a fixed CSR budget, submitted proposal pipeline, strategy preset, and Equity Guardrail setting.

Project-level evaluation considers:

- Expected impact and beneficiary reach
- Cost efficiency and geographic need
- Corporate alignment and feasibility
- Evidence confidence and calculated risk

Portfolio-level evaluation considers overall quality, aggregate impact, reach, district coverage, sector coverage, safety, and—when enabled—equity.

### Exhaustive subset evaluation

IGAI evaluates every possible project subset, rejecting combinations that exceed the budget or contain ineligible projects.

```text
n proposals → 2ⁿ candidate portfolios
18 proposals → 2¹⁸ = 262,144 candidate portfolios
```

The winner is selected by portfolio score, with deterministic tie-breaking for greater beneficiary reach and lower spend. Results include selected/deferred projects, allocated and remaining budget, beneficiaries, coverage, equity, risk, explanations, and the actual candidate count.

The exhaustive engine is intentionally bounded to 24 proposals for this demo-scale prototype.

## Decision intelligence

IGAI does more than return “fund” or “do not fund.” Deterministic explanations connect decisions to observable characteristics such as:

- Strong impact or beneficiary reach
- Better cost per beneficiary
- Underserved geographic need
- Strong feasibility, evidence, or lower risk
- Improved portfolio diversity and budget use

Deferred projects remain visible with reasons tied to eligibility, remaining budget, or the stronger portfolio combination found during exhaustive evaluation.

## Product interfaces

### Corporate workspace

| Route | Purpose |
|---|---|
| `/dashboard` | CSR overview and live pipeline analytics |
| `/proposals` | Read-only proposal directory with search and filters |
| `/optimizer` | Configurable deterministic portfolio optimization |
| `/challenge` | Interactive ₹1 Crore allocation challenge |
| `/scenario-lab` | Baseline-versus-scenario pre-spend simulation |
| `/impact-map` | Geographic proposal and allocation intelligence |

### NGO workspace

| Route | Purpose |
|---|---|
| `/ngo/dashboard` | NGO proposal activity overview |
| `/ngo/proposals` | Ownership-scoped proposal management |
| `/ngo/proposals/new` | New proposal submission |
| `/ngo/proposals/[id]` | Proposal details and owner-only editing |

Authentication is available at `/login` and `/signup`.

## Technology stack

| Layer | Technology |
|---|---|
| Application | Next.js 16, React 19, TypeScript |
| Interface | Tailwind CSS 4, local shadcn/ui-style primitives, Lucide icons |
| Forms | React Hook Form, Zod |
| Authentication | Supabase Auth with server-managed sessions |
| Data and authorization | Supabase PostgreSQL, Row Level Security |
| Analytics | Recharts |
| Mapping | Leaflet, React Leaflet, OpenStreetMap |
| Optimization | Server-side deterministic TypeScript engine |
| Deployment target | Vercel |

## Architecture

```text
Next.js + TypeScript → role-based interfaces, protected pages, server actions, charts, and maps
Supabase → authentication, PostgreSQL persistence, and Row Level Security
Decision Engine → deterministic scoring, exhaustive evaluation, equity, and explanations
```

The optimizer reads the same Supabase proposal pipeline used by the dashboard, Challenge, Scenario Lab, proposal browser, and Impact Map.

## Security

- Supabase Auth establishes the user session.
- Middleware protects corporate and NGO route groups.
- Server pages and actions enforce explicit roles.
- Row Level Security is enabled across application tables.
- NGOs can read and update only proposals they own.
- Corporate users receive read-only access to reviewable proposals.
- Local environment files are ignored; no credentials are stored here.

## Demo data

The repository includes an idempotent seed with **18 realistic Tamil Nadu NGO proposals** across education, healthcare, livelihood, environment, water and sanitation, digital inclusion, women empowerment, and rural development.

Proposals include funding requirements, beneficiaries, coordinates, duration, status, and impact, geographic-need, feasibility, risk, and evidence values. Fixed IDs make the seed safe to rerun after an authenticated NGO profile exists.

## Why it matters

Instead of asking:

> **Which project has the highest score?**

IGAI asks:

> **Which combination of projects creates the strongest measurable and equitable impact with the budget we actually have?**

That shift—from isolated ranking to explainable portfolio allocation—is the core of IGAI.

## Run locally

### Prerequisites

- Node.js and npm
- A Supabase project
- At least one NGO account before loading the demo seed

### Setup

```bash
npm install
cp .env.example .env.local
```

Add your Supabase project values to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Run `supabase/schema.sql` in the Supabase SQL Editor, then start IGAI:

```bash
npm run dev
```

Create an NGO account before running `supabase/seed.sql`; seeded proposals attach to a real authenticated NGO profile. Existing installations upgrading from an earlier schema can apply `supabase/migrations/phase3_proposal_details.sql`.

Quality checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Project status

IGAI is a complete, hackathon-ready working prototype with authenticated role-based workflows, Supabase persistence, proposal management, deterministic portfolio optimization, explainable recommendations, scenario simulation, an allocation challenge, and geographic visualization.

The engine targets the repository's demo-scale dataset. It does not replace organizational due diligence, legal review, or final human funding approval.

## Team

- **Sanket Shukla**
- **Sanidhya Sharma**
- **Pranav Kumar Indraganti**

**Project:** IGAI — Impact-Driven, Geographical Equity, Allocation and Intelligence

---

> **Better allocation is not about spending more. It is about making every rupee count.**
