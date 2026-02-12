# INFI AI Executable Roadmap Quality Standard

_Last updated: 2026-02-12 00:54 EST_

Goal: convert strategy docs into execution artifacts that can be run hourly with clear owner/output/risk visibility.

---

## 1) Roadmap Quality Rubric (Scored 0-5)

1. **Clarity:** each work item has concrete output and acceptance criteria.
2. **Dependency mapping:** blockers and upstream repos explicitly named.
3. **Measurability:** KPI and gate impact tied to item.
4. **Safety/compliance:** policy check embedded, not bolted on.
5. **Executability:** can be started within 15 minutes with existing context.

Minimum ship-quality average: **>=4.0/5**.

---

## 2) Execution Unit Template (EU)

Each roadmap item must follow:
- **EU-ID**
- **Repo**
- **Owner**
- **Duration target** (1h / 2h / 4h)
- **Definition of done**
- **Evidence artifact** (doc/commit/test report)
- **Risk tag** (tech/compliance/schedule)

---

## 3) Current High-Priority Execution Units

### EU-01: Cloud model-router contract
- Repo: platform/integration docs (this workspace)
- DoD: request schema + route/fallback reason codes defined
- Evidence: `docs/INFI-AI-CLOUD-MODEL-BASE-PLAN.md`
- Risk: architecture drift if implemented differently across services

### EU-02: Device descriptor + coverage tiers
- Repo: `pamir-infiltra` (spec-first)
- DoD: required board registry fields and promotion gate defined
- Evidence: `docs/INFI-AI-FIRMWARE-RF-EXPANSION-PLAN.md`
- Risk: premature Tier 1 expansion

### EU-03: RF profile compliance gate
- Repo: `pamir-infiltra`, `neon-flash-esp`
- DoD: preflash and runtime checks defined with reason codes
- Evidence: same as EU-02 + roadmap docs
- Risk: unsigned/unreviewed profile usage

### EU-04: D1HackGear repo disposition
- Repo: `D1HackGear`
- DoD: explicit decision (tooling harness vs deprecate)
- Evidence: tracked decision note in next milestone doc
- Risk: schedule thrash from ambiguous ownership

---

## 4) Next-Hour Operating Loop

At the top of each hour:
1. Pick max 2 EUs.
2. Define expected artifact before coding/editing.
3. Execute in 40-minute focus block.
4. Spend 10 minutes validating against DoD.
5. Spend 10 minutes recording milestone + risks + next block.

If blocked >20 minutes, create unblock task and switch to next EU.

---

## 5) Artifact Quality Gate (Before Commit)

- Does this change reduce ambiguity?
- Can another engineer execute from it without live explanation?
- Are risks/assumptions explicit?
- Is success objectively testable?
- Is there an identified next action owner?

If any answer is "no", quality is insufficient for roadmap execution.

---

## 6) Reporting Format for Luke (Concise)

- **Changes:** what was produced this block
- **Risks:** top 3 with mitigation owner
- **Next hour plan:** 2 executable units with expected artifacts

This keeps all-night runs action-oriented and decision-ready.
