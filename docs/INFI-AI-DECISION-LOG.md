# INFI AI Decision Log

_Last updated: 2026-02-14_

Purpose: keep exceptions, tradeoffs, and “why” decisions explicit so the device matrix, firmware scope, and commercial promises don’t drift over time.

This log is intentionally lightweight and copy/paste friendly.

## How to use
- Any time we **override a threshold** (device scoring, release gates, safety policy) or accept a **support/compliance risk**, write an entry.
- Every entry must include:
  - the *trigger* (what forced the decision)
  - the *exception class* (if any)
  - the *opportunity cost* (what we are not doing)
  - the *cancellation gates* (clear “stop” conditions)
  - the *where this must be reflected* (files/docs)

## Entry template (copy/paste)

### DL-YYYY-MM-DD-XX — <short title>
- **Date:** YYYY-MM-DD
- **Status:** proposed | accepted | superseded
- **Owners:** <name(s)>
- **Decision type:** scope | hardware-support | safety-policy | commercial | infra
- **Exception class:** none | portability-pilot | strategic-monetization | other:<name>

**Context / trigger**
- 

**Decision**
- 

**Why this is worth it**
- 

**Opportunity cost (what we defer/replace)**
- 

**Cancellation gates (must stop if any are true)**
- 

**Implementation requirements (must be true before we claim support)**
- 

**Docs / artifacts to update**
- 

---

## Decisions

### DL-2026-02-13-01 — CC1101 RF board as Strategic Monetization Exception (Beta)
- **Date:** 2026-02-13
- **Status:** accepted
- **Owners:** Luke
- **Decision type:** hardware-support, commercial
- **Exception class:** strategic-monetization

**Context / trigger**
- `LilyGO T-Embed CC1101 (ESP32-S3)` scores **69/100** in `docs/INFI-AI-DEVICE-COVERAGE-SCORING-WORKSHEET.md` (below the **Beta entry >=70** rule).
- However, it has unusually high monetization leverage (RF capabilities) and is a likely driver for paid adoption.

**Decision**
- Allow this board to appear as **Beta** only under a **funded validation lane**.
- Without funded validation, it is **Not Recommended** for v1.

**Why this is worth it**
- Enables an RF-focused paid cohort to fund the added validation + compliance workload.
- Preserves device-matrix discipline while still permitting a targeted revenue experiment.

**Opportunity cost (what we defer/replace)**
- Any time spent on CC1101 validation must come from (a) funded scope or (b) explicit deferral of a recommended-board improvement.

**Cancellation gates (must stop if any are true)**
- RF-L2 gates fail repeatedly in harness (or cannot be made deterministic).
- Support burden exceeds what the funded lane covers (time/cost).
- Region/compliance policy cannot be made fail-closed.

**Implementation requirements (must be true before we claim support)**
- Validation is explicitly funded (Team/OEM cohort, or equivalent paid program).
- RF-L2 gating spec exists and is green in CI/HIL.
- Documentation clearly labels the board as “Beta (funded validation only)”.

**Docs / artifacts to update**
- `docs/INFI-AI-DEVICE-COVERAGE-SCORING-WORKSHEET.md` (already updated to reference this)
- `INFI_AI_REVENUE_PATHS.md` (funded validation lane + exception language)
- Device tier matrix (`INFI_AI_DEVICE_TIER_MATRIX.md`) wherever CC1101 appears

---

### DL-2026-02-13-02 — NUCLEO reference boards as Portability Pilot (Beta)
- **Date:** 2026-02-13
- **Status:** accepted
- **Owners:** Luke
- **Decision type:** hardware-support, engineering-leverage
- **Exception class:** portability-pilot

**Context / trigger**
- Some STM32 NUCLEO boards score low on demand, but offer low variance + high portability leverage.

**Decision**
- Permit select NUCLEO boards as **Beta pilot** targets strictly to harden portability and descriptor/schema discipline.

**Cancellation gates (must stop if any are true)**
- Pilot causes scope creep (new families) without descriptor-first promotion gates.
- Pilot displaces recommended-board stability work without explicit replacement decision.

**Docs / artifacts to update**
- `docs/INFI-AI-DEVICE-COVERAGE-SCORING-WORKSHEET.md` (exception class exists)
- `docs/INFI-AI-FIRMWARE-INTEGRATION-TASK-GRAPH.md` (explicitly references exception policy + decision log)
