# INFI AI Executable Roadmap Quality Standard

_Last updated: 2026-02-12 02:35 EST_

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
- **Definition of done** (observable)
- **Evidence artifact** (doc/commit/test report)
- **Risk tag** (tech/compliance/schedule)
- **Unblock note** (what stops this from starting right now?)

---

## 3) Reason Codes and Evidence Rules

### 3.1 Evidence artifacts should be one of:
- a PR/commit SHA
- a spec section with a stable anchor heading
- a test report log (saved in repo)
- a screenshot for UI gate (saved in docs + linked)

### 3.2 If an EU touches policy/safety
It must include:
- explicit reason codes (block/allow/fallback)
- default stance (fail-open vs fail-closed)

Default stance for INFI: **fail-closed** when uncertain.

---

## 4) Current High-Priority Execution Units (seed set)

### EU-01: Cloud model-router contract
- Repo: integration layer (workspace docs first)
- Owner: Cloud/Data
- Duration: 2h
- DoD: request schema + route/fallback reason codes + trace minimum fields defined
- Evidence: `docs/INFI-AI-CLOUD-MODEL-BASE-PLAN.md`
- Risk: tech (architecture drift)
- Unblock note: none (spec work)

### EU-02: Device descriptor + coverage tiers
- Repo: `pamir-infiltra` (spec-first)
- Owner: Firmware
- Duration: 2h
- DoD: required board registry fields + promotion gate written + example board entry produced
- Evidence: `docs/INFI-AI-FIRMWARE-RF-EXPANSION-PLAN.md`
- Risk: schedule (premature Tier 1 expansion)
- Unblock note: need to pick canonical JSON location in repo

### EU-03: RF profile compliance gate
- Repo: `pamir-infiltra`, `neon-flash-esp`
- Owner: Firmware + Frontend
- Duration: 4h
- DoD: manifest schema + signature check contract + operator UI gating rules
- Evidence: `docs/INFI-AI-FIRMWARE-RF-EXPANSION-PLAN.md` (manifest section)
- Risk: compliance
- Unblock note: need decision on key management + signing authority

### EU-04: D1HackGear repo disposition
- Repo: `D1HackGear`
- Owner: Luke
- Duration: 1h
- DoD: explicit decision (tooling harness vs deprecate) + next actions
- Evidence: add a decision entry to `docs/INFI-AI-ROADMAP-AND-OPERATING-RHYTHM.md` or next milestone log
- Risk: schedule (thrash)
- Unblock note: confirm ownership and desired repo role

---

## 5) Next-Hour Operating Loop

At the top of each hour:
1. Pick max **2** EUs.
2. Write the expected artifact **before** doing the work.
3. Execute in a 40-minute focus block.
4. Spend 10 minutes validating against DoD.
5. Spend 10 minutes recording milestone + risks + next block.

If blocked >20 minutes: write an unblock note + switch to the other EU.

---

## 6) Artifact Quality Gate (Before Commit)

- Does this change reduce ambiguity?
- Can another engineer execute from it without live explanation?
- Are risks/assumptions explicit?
- Is success objectively testable?
- Is there an identified next action owner?

If any answer is "no", quality is insufficient for roadmap execution.

---

## 7) Reporting Format for Luke (Concise)

- **Changes:** what was produced this block
- **Risks:** top 3 with mitigation owner
- **Next hour plan:** 2 execution units + expected artifacts

This keeps all-night runs action-oriented and decision-ready.
