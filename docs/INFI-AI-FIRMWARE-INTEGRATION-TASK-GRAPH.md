# INFI AI Firmware Integration Task Graph (Module-by-Module)

_Last updated: 2026-02-13_

Purpose: turn the integration plan into a dependency-aware task graph that can be executed in 60-minute blocks without thrash.

Primary references:
- `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md` (§4 Integration Strategy)
- `INFI_AI_INTEGRATION_NOTES.md`
- Device support discipline:
  - `docs/INFI-AI-DEVICE-COVERAGE-SCORING-WORKSHEET.md` (thresholds)
  - `INFI_AI_DEVICE_TIER_MATRIX.md` (labels)
  - `docs/INFI-AI-DECISION-LOG.md` (mandatory for threshold overrides)
  - Exception policy (§5 in the worksheet) must be followed before adding any new board/env.

Target repo: `repos/pamir-infiltra`

---

## 0) Assumptions (explicit)

- INFI AI on-device is **deterministic** (no generative execution).
- All action execution routes through an explicit `intent_id -> action_id` map.
- Board profiles already exist in `Boards/*.json` and can be extended safely.
- We introduce new code under `src/Modules/AI/*` to avoid broad refactors.

---

## 1) Milestone M0: Scaffold (no behavior change)

### M0.1 Create module skeleton
**Depends on:** none
**Output:** folder + headers compile under feature flag

- Add directories:
  - `src/Modules/AI/Intent/`
  - `src/Modules/AI/Knowledge/`
  - `src/Modules/AI/Router/`
  - `src/Modules/AI/Safety/`
  - `src/Modules/AI/Telemetry/`
  - `src/Modules/AI/Config/`

### M0.2 Add compile flags
**Depends on:** M0.1
**Output:** build compiles with flags on/off

- `INFI_AI_ENABLED`
- `INFI_AI_TIER={tiny|medium|heavy}` (or tier macros)
- `INFI_AI_CLOUD_HANDOFF_ENABLED` (optional stub)

### M0.3 Add board registry extension fields
**Depends on:** none (but should align with dataset spec)
**Output:** updated JSON schema expectations (even if no validator yet)

Required fields (min):
- `board_id`, `mcu_family`, `tier_default`, `tier_max`
- `features[]`
- `memory_budget` (flash cap, heap guard)
- `ota_channel`

---

## 2) Milestone M1: Tiny tier intent + safety + router (read-only + safe actions)

### M1.1 Intent types + request normalization
**Depends on:** M0.2
**Output:** `IntentRequest` struct produced from existing input surfaces

- Inputs:
  - short text
  - button pattern events

### M1.2 Tiny parser: exact keyword match
**Depends on:** M1.1
**Output:** deterministic `IntentResult { intent_id, confidence=1.0 }` or reject

### M1.3 Safety classifier (S0/S1/S2/S3)
**Depends on:** M1.2
**Output:** all intents have safety class; default fail-closed

Rules:
- Unknown intent => reject
- Below threshold => reject
- Capability missing => reject

### M1.4 Router: intent_id -> action handler
**Depends on:** M1.3
**Output:** calls into existing firmware command handlers

Hard requirement:
- No mapping => no execute

### M1.5 KB load stub (no binpack yet)
**Depends on:** M0.2
**Output:** compile-time stub returning canned “not installed” responses

---

## 3) Milestone M2: Dataset + packaging + semantic validation gates

### M2.1 Choose canonical dataset location
**Depends on:** product decision
**Output:** a single path used everywhere

Option A (recommended): separate knowledge repo/folder tracked alongside firmware
Option B: `repos/pamir-infiltra/knowledge/` (tight coupling)

### M2.2 Add schema validator (CI hard-fail)
**Depends on:** M2.1
**Output:** CI job validates JSON schemas

### M2.3 Add semantic validator (CI hard-fail)
**Depends on:** M2.2
**Output:** rejects:
- duplicate intent IDs
- orphan actions
- unknown capabilities
- unmapped “supported” intents

### M2.4 Package generator emits `.binpack` + manifest
**Depends on:** M2.2
**Output:** tiered artifacts + `manifest.json` with SHA256

---

## 4) Milestone M3: Medium tier alias expansion + richer cards

### M3.1 Alias dictionary (bounded)
**Depends on:** M1.2, M2.3
**Output:** curated alias mapping with false-positive metrics target

### M3.2 Confidence gating for aliases
**Depends on:** M3.1
**Output:** below threshold => no execute

### M3.3 Knowledge cards (expanded)
**Depends on:** M2.4
**Output:** device/pinout/capability/troubleshooting cards load and render

---

## 5) Milestone M4: Heavy tier pilot (workflow sequencing + recovery)

### M4.1 Workflow graph
**Depends on:** M3.3
**Output:** deterministic multi-step workflow templates (not freeform)

### M4.2 Optional voice keyword stub (S3-only boards)
**Depends on:** board capability flag + audio pipeline readiness
**Output:** keyword detection triggers IntentRequest; no always-on mic promise

---

## 6) Test harness mapping (where it should live)

**Unit tests:** parser + alias + safety transitions
- location: `test/` (PlatformIO) or `src/Modules/AI/*` paired test code

**Integration tests:**
- capability map + intent_map semantic checks (host-side scripts)

**HIL smoke:**
- recommended boards in a repeatable flash+run loop

**RF harness:**
- see `docs/INFI-AI-HARDWARE-COMPATIBILITY-DEEP-DIVE.md#13-firmware-rf-expansion-strategy-phased-testable`

---

## 7) 60-minute execution units (copy into sprint)

- **EU-FW-01 (60m):** add `src/Modules/AI/*` skeleton + compile flag wiring (M0.1–M0.2)
- **EU-FW-02 (60m):** implement `IntentRequest` normalization from one input surface (M1.1)
- **EU-FW-03 (60m):** Tiny parser exact-match for 5 intents + fail-closed defaults (M1.2)
- **EU-FW-04 (60m):** Router stubs mapping 5 intents to existing handlers (M1.4)
- **EU-FW-05 (60m):** write CI semantic validator spec + reason codes (M2.3)
