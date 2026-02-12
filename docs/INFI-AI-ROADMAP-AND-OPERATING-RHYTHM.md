# INFI AI Roadmap and Operating Rhythm

_Last updated: 2026-02-12 (milestone: executable roadmap + overnight loop)_

This document defines execution rhythm, milestone gates, and decision discipline for shipping INFI AI with a small team while preserving safety and hardware matrix integrity.

---

## 1) Planning Horizon and Control Philosophy

- **Horizon:** 12-week ship plan with weekly operating loops.
- **Principle:** optimize for reliable shipped value, not broad speculative support.
- **Control:** every phase has objective exit gates; no gate = no promotion.

---

## 2) 12-Week Roadmap (with explicit exit gates)

| Phase | Weeks | Focus | Key Outputs | Exit Gate |
|---|---|---|---|---|
| P0 Scope Lock | 0-1 | contracts + board freeze | tier budgets, schema freeze, safety contract, board policy | signed baseline docs |
| P1 Tiny Path | 1-3 | deterministic core | tiny parser/router, tiny package, top-20 intents | >=98% Tiny routing on test prompts |
| P2 Medium/Heavy Pilot | 3-6 | richer local value | alias parser, troubleshooting cards, heavy pilot on selected boards | latency+accuracy+soak gates pass |
| P3 Cloud Ops Loop | 6-10 | operational leverage | daily digest, compatibility alerts, roadmap scoring | outputs used in weekly planning decisions |
| P4 Hardening + Launch | 10-12 | release reliability | OTA drills, rollback runbook, release QA | RC checklist fully green |

---

## 3) Weekly Operating Cadence

### Monday (Scope + commit)
- Choose one dominant weekly theme.
- Lock “must ship” list and define explicit “won’t do” list.
- Confirm board matrix for this sprint (avoid mid-week expansion).

### Tuesday-Wednesday (Build + validate)
- Implement prioritized firmware/data tasks.
- Run CI + HIL smoke daily.
- Triage only high-severity regressions in sprint lane.

### Thursday (Integration + release prep)
- Execute compatibility tuple checks.
- Run regression on recommended boards.
- Draft release notes + known limitations.

### Friday (Demo + decision)
- Demo against objective gate checklist.
- Decide promote/hold/rollback.
- Publish weekly summary and next-week plan.

---

## 4) Daily Rhythm (Mon-Fri)

1. **Morning 20 min:** CI failures, digest review, risk triage.
2. **Primary build block (2-4h):** one owner, one deliverable, one measurable output.
3. **Validation block (45-90m):** unit/integration/HIL focus.
4. **Closeout 15 min:** blockers, decisions, next-day owner assignment.

---

## 5) Objective Promotion Gates

### 5.1 Board promotion gate (Beta -> Recommended)
- 10 consecutive clean CI builds.
- Tier routing threshold met on board benchmark prompts.
- 0 unmapped actions.
- Soak test passes (duration by tier).
- OTA firmware+KB update and rollback verified.
- Support docs complete.

### 5.2 Tier promotion gate
- Tiny -> Medium: alias false-positive <=1.5%, memory headroom proven.
- Medium -> Heavy: P95 latency within target, troubleshooting graph stability proven, no safety regression in two RC cycles.

### 5.3 Release candidate gate
- All CI gates green.
- Security/signature checks green.
- Compatibility tuple validation green.
- Risk board has no unresolved High items.

---

## 6) KPI Framework

### Daily KPIs
- build pass rate by recommended board
- intent routing success trend
- fallback reason distribution

### Weekly KPIs
- board promotion readiness score
- escaped defect count
- support hours per board classification
- digest consumption by planning team

### Commercial KPIs
- Free -> Pro conversion trend
- Pro/Team retention
- feature adoption (medium/heavy)
- support cost per active device

---

## 7) Risk Management Rhythm

Maintain a live risk register with:
- risk statement
- owner
- likelihood x impact score
- mitigation status
- decision deadline

**Immediate triage triggers**
- safety behavior regression
- 2+ days repeated CI gate failures
- compatibility mismatch near release window

---

## 8) Team Operating Model (Lean)

| Workstream | Firmware Lead | Data/Full-stack | Product/Ops (Luke) |
|---|---|---|---|
| Parser/router/safety | A/R | C | C |
| Dataset pipeline + packaging | C | A/R | C |
| Cloud ingest + digest + scoring | C | A/R | C |
| Board policy + support matrix | R | C | A |
| Monetization experiments | C | C | A/R |
| Release go/no-go | R | R | A |

---

## 9) Decision Framework (Conflict Resolver)

Prioritize in this strict order:
1. Safety and deterministic behavior
2. Stability on recommended boards
3. Core user workflows (top intents)
4. Cloud leverage features
5. Net-new board expansion

If a task does not clearly improve 1-3, defer it.

---

## 10) OTA and Release Rhythm

### Release channels
- `dev`: fast internal feedback
- `beta`: controlled external cohort
- `prod`: only after gate completion + rollback rehearsal

### Release checklist essentials
- Signed firmware and signed KB manifest
- compatibility tuple validation
- regression on recommended boards
- known-limits update in support docs

---

## 11) Monetization Tie-In to Roadmap

| Roadmap Item | User Value | Revenue Effect |
|---|---|---|
| Tiny reliability | trust + adoption | better top-of-funnel conversion |
| Medium troubleshooting depth | faster time-to-fix | higher Pro conversion/retention |
| Team digest/reporting | shared operational clarity | Team plan adoption |
| Heavy premium workflows | advanced productivity | Pro+ / Team ARPU expansion |

---

## 12) Meeting and Reporting Templates

### 12.1 Executable roadmap item template (RFC-lite)
Every roadmap item must be executable (assignable + testable) and tied to an objective gate.

- **ID / name:**
- **User outcome:** (what changes for the user)
- **Scope:** (explicitly in-scope)
- **Not in scope:** (explicit exclusions)
- **Boards impacted:** (recommended/beta list)
- **Tier impacted:** (Tiny/Medium/Heavy)
- **Safety class:** (S0/S1/S2/S3)
- **Acceptance criteria:** (measurable; include routing/latency/soak targets)
- **Dependencies:** (repos, modules, datasets, hardware)
- **Risk notes:** (top 1–3)
- **Owner / reviewer:**
- **Exit gate:** (which gate section; what “green” means)

### 12.2 Roadmap scoring rubric (Impact x Effort x Reach)
Use a consistent scoring rubric to keep planning decisions comparable week-to-week.

- **Impact (1–5):** user value and defect reduction.
- **Effort (1–5):** engineering + validation + docs.
- **Reach (1–5):** coverage across recommended boards.
- **Risk penalty (0–3):** subtract for RF/UI concurrency, BOM variance, safety surface.

**Suggested priority score:** `(Impact * Reach) - (Effort + RiskPenalty)`.

### Weekly summary (Friday)
- shipped this week (link to PR/commit IDs)
- failed/held items (why)
- key metric trends (routing, latency, CI stability)
- top 3 risks and mitigations
- next week locked priorities (exactly 3)

### Milestone review (Phase gate)
- gate checklist status
- unresolved blockers
- rollback readiness
- recommendation (promote/hold)

---

## 13) Executable Next-72h Backlog (convert “ideas” into shippable tickets)

These are written to be copy/pasted into a sprint board with minimal translation.

### INFI-ROADMAP-001 — Cloud model routing policy + eval harness (v0)
- **Outcome:** Cloud outputs are routable by task class and validated by schema; model changes become measurable.
- **Scope:** task classifier labels; schema contracts; weekly eval set definition; quality gates in docs.
- **Acceptance:** schemas defined; routing rules documented; eval checklist exists; <=5% schema rejection target set.
- **Exit gate:** P3 readiness foundations.

### INFI-ROADMAP-002 — Device coverage scoring worksheet + thresholds (v0)
- **Outcome:** Board expansion decisions are numeric and auditable.
- **Scope:** scoring dimensions; entry thresholds; labels (“recommended/beta/not-recommended”).
- **Acceptance:** rubric published; at least 6 candidate boards scored once; decisions recorded.
- **Exit gate:** P0/P1 scope lock discipline.

### INFI-ROADMAP-003 — RF lane definition + regression harness requirements (v0)
- **Outcome:** RF expansion stops being ad-hoc; promotion gates become objective.
- **Scope:** RF-L1/L2/L3; concurrency test definition; latency regression capture; crash/reset checks.
- **Acceptance:** lanes + gates documented; harness checklist written; owners/dependencies listed.
- **Exit gate:** Hardware gate readiness for RF boards.

### INFI-ROADMAP-004 — “Executable roadmap item” checklist enforced
- **Outcome:** No roadmap item enters sprint without owner + acceptance + exit gate.
- **Scope:** template adoption; review step added to weekly planning.
- **Acceptance:** sprint template updated; first 10 roadmap items rewritten in this format.
- **Exit gate:** Weekly planning maturity.

---

## 14) Overnight Execution Pattern (for all-night build blocks)

When running overnight milestone blocks, enforce this loop every 45-60 minutes:
1. ship one concrete doc/code artifact update
2. record risks discovered + mitigation candidate
3. lock next 60-minute target trio before continuing

### Milestone update format (Telegram-first)
- **changed:** docs/code sections advanced in this block
- **risks:** highest-confidence blockers or unknowns
- **next 60:** exactly three targets, scoped to finish within one block

This keeps long runs from drifting into low-yield research and ensures morning handoff quality.

---

## 15) Next 6-Hour Target Stack (current overnight cycle)

### Block A (completed in this milestone window)
- cloud model-base routing policy + quality gates added to master implementation guide
- device coverage strategy formalized (scoring + thresholds)
- RF expansion lanes/harness formalized and cross-linked

### Block B (next -> +60m)
- convert cloud/device/RF gates into checklist-friendly sprint items with owners/dependencies
- map “minimum RF harness” to concrete firmware test modules (where they live)
- write a 1-page decision log for morning review (what is frozen vs open)

### Block C (+60m -> +120m)
- draft firmware integration task graph (module-by-module) for AI module scaffolding
- identify highest-risk unknowns requiring hardware validation (power/bus contention)
- tighten RC checklist language for OTA rollback rehearsal

---

## 16) Cross-links

- Master execution: `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md`
- Hardware deep dive: `docs/INFI-AI-HARDWARE-COMPATIBILITY-DEEP-DIVE.md`
- Dataset build spec: `docs/INFI-AI-DATASET-BUILD-SPEC.md`
- Execution baseline: `INFI_AI_EXECUTION_PLAN.md`
