# INFI AI Roadmap and Operating Rhythm

_Last updated: 2026-02-12_

Purpose: make execution predictable for a small startup team shipping INFI AI.

## 1) Delivery Cadence at a Glance

- **Daily:** focused build, validation, and risk triage
- **Weekly:** plan, commit, review, and release readiness
- **Phase gates (bi-weekly/monthly):** promotion from build -> beta -> production

---

## 2) 12-Week Roadmap with Gate Criteria

| Phase | Weeks | Focus | Required Outputs | Gate to Exit |
|---|---|---|---|---|
| P0 Scope Lock | 0-1 | freeze contracts | board set, budgets, schema, intent taxonomy | signoff doc + backlog |
| P1 Tiny Path | 1-3 | first shippable runtime | tiny parser/router, tiny package build, top-20 intents | >=95% top-20 intent reliability |
| P2 Medium/Heavy | 3-6 | richer local value | alias engine, troubleshooting cards, heavy profile | latency + memory targets met |
| P3 Cloud Ops | 6-10 | operational leverage | daily digest, scoring model, board drift alerts | team uses digest daily |
| P4 Hardening + Launch | 10-12 | production confidence | release checklist, rollback drills, support docs | RC pass + launch approval |

---

## 3) Daily Operating Rhythm (Mon-Fri)

## 3.1 Morning (15-25 min)
1. Review yesterday’s CI and board test failures.
2. Review cloud digest (changes, compatibility drift, priority suggestions).
3. Confirm top 1-2 engineering priorities for today.

## 3.2 Build Block (2-4 hours)
- Firmware lead: parser/router/board tests.
- Data engineer: ingestion/validation/package pipeline.
- Product/ops: triage, docs alignment, release/risk tracking.

## 3.3 End-of-day close (10-15 min)
- Log completed tasks and blockers.
- Update risk register and acceptance trend.
- Prepare next-day priority with clear owner.

---

## 4) Weekly Rhythm

## Monday - Planning and scope lock
- Select 1 weekly theme (e.g., Tiny stability, Medium parser quality)
- Commit to achievable scope (avoid adding boards mid-week)

## Tuesday-Wednesday - Build and validate
- Deliver code/data outputs
- Run board smoke tests and fix highest-risk regressions

## Thursday - Integration and release prep
- Validate compatibility tuple
- Run full regression on recommended board set
- Draft changelog and support notes

## Friday - Review and decision
- Demo against acceptance criteria
- Decide: promote / hold / rollback
- Publish weekly summary and next-week plan

---

## 5) Roles and Ownership Matrix

| Function | Firmware Lead | Data/Full-stack | Product/Ops (Luke) |
|---|---|---|---|
| Intent/action architecture | A/R | C | C |
| Dataset schema + package pipeline | C | A/R | C |
| Cloud digest + scoring | C | A/R | C |
| Board support policy | R | C | A |
| Monetization experiments | C | C | A/R |
| Release go/no-go | R | R | A |

(A=Accountable, R=Responsible, C=Consulted)

---

## 6) KPI Review Rhythm

## Daily KPIs
- build pass rate on recommended boards
- intent success rate (top validated prompts)
- fallback quality score

## Weekly KPIs
- free -> pro conversion trend
- churn trend (if live)
- support hours per board class (recommended vs beta)
- digest usage in planning decisions

## Phase KPIs
- release cycle time
- escaped defect count
- board promotion rate (beta -> recommended)

---

## 7) Risk Review Rhythm

Maintain a lightweight risk board with weekly updates:
- risk statement
- owner
- current score (L/M/H)
- mitigation status
- decision due date

Critical risks trigger same-day triage if:
- safety behavior regression
- repeated CI gate failures (>2 days)
- unresolved compatibility mismatch before release window

---

## 8) Decision Framework (when there is conflict)

Prioritize in this order:
1. Safety and deterministic behavior
2. Recommended-board stability
3. Core user workflows (top-20 intents)
4. Cloud/analytics enhancements
5. Net-new board expansion

If a proposed task does not improve one of 1-3, defer it.

---

## 9) Release Rhythm

## Pre-release checklist (every candidate)
- all CI gates green
- package manifests signed and verified
- regression run on recommended boards
- release notes include known limitations

## Rollout strategy
- `dev` internal channel
- `beta` cohort rollout
- `prod` after health checks and rollback window pass

---

## 10) What to do tomorrow morning (explicit)

1. Hold a 30-minute scope-lock standup and freeze this week’s theme.
2. Assign owners for parser stability, schema validation, and digest delivery.
3. Build and publish a one-page KPI dashboard for daily check-ins.
4. Start weekly risk board with 5 top risks and mitigations.
5. Define Friday demo criteria now (what must be shown to count as done).

---

## 11) Cross-links

- Master guide: `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md`
- Data build spec: `docs/INFI-AI-DATASET-BUILD-SPEC.md`
- Hardware deep dive: `docs/INFI-AI-HARDWARE-COMPATIBILITY-DEEP-DIVE.md`
- Execution baseline: `INFI_AI_EXECUTION_PLAN.md`
