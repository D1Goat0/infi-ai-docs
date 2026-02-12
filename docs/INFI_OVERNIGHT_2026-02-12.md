# INFI AI Overnight Execution Block
**Window:** 2026-02-12 00:35 → 07:30 (America/New_York)
**Mode:** Continuous execution (research + refinement + planning artifacts)
**Owner:** Luke / Infiltra

## 1) Cloud Model Base Planning (Actionable)

### Target operating model
- **Primary online stack:**
  - Tier A reasoning: OpenAI Codex/GPT-5.x or Anthropic Opus via gateway abstraction.
  - Tier B cost/perf: smaller fast models for triage + classification + routing.
- **Edge/offline fallback stack:**
  - Local quantized models on CM5/edge box for no-internet workflows.
  - Rule-first + model-assist where RF/legal risk is high.
- **Control plane:**
  - Policy engine (task risk level, data class, latency SLO, spend caps).
  - Dynamic provider routing by cost/latency/availability.

### Must-have controls
- Prompt/data classification before outbound calls.
- Secrets guardrail and redaction pipeline.
- Per-task model policy (allowed providers/models).
- Cost budget with hard failsafe and downgrade path.
- Full traceability for every autonomous action.

### Build order
1. Implement `model-router` abstraction in control backend.
2. Add task classes: `safe`, `sensitive`, `restricted-rf`.
3. Add provider health + pricing cache.
4. Add hard budget enforcement and auto-fallback.
5. Add audit export and replay support.

## 2) Large Device Coverage Strategy

### Device coverage architecture
- **Tier 0 (Core):** Flipper-class + ESP32-class + SDR baseline support.
- **Tier 1 (Priority expansion):** nRF52, STM32, RP2040 families.
- **Tier 2 (Specialized):** LoRa modules, BLE long-range variants, sub-GHz custom boards.

### Compatibility model
- Capability matrix dimensions:
  - MCU family
  - RF front-end bands
  - Flashing interface (USB CDC, DFU, UART, JTAG/SWD)
  - Power profile
  - Recovery mode support
- Define a **unified device descriptor schema** and adapter contracts.

### Execution approach
- Start with descriptor-driven integration to avoid per-device hardcoding.
- Build one conformance suite; every adapter must pass before release.
- Ship staged “coverage packs” instead of monolithic support drops.

## 3) Firmware + RF Expansion Plan (Repo-linked)

### Repo tie-ins
- `repos/pamir-infiltra`:
  - Firmware protocol abstraction layer.
  - RF profile modularization (separate profile packs by region/rule set).
- `repos/neon-flash-esp`:
  - Operator UI for multi-device flashing and profile assignment.
  - Add compatibility checks pre-flash (band + region + hardware rev).
- `repos/D1HackGear` + `repos/D1HackGear0`:
  - Tooling, scripts, and hardware test fixtures.
  - Standardize RF test harness scripts + result schema.

### RF expansion tracks
- Track A: Band/profile library expansion (documented, versioned).
- Track B: Firmware safety gates (region locks, tx power constraints, rollback).
- Track C: Validation pipeline (bench simulation + hardware-in-loop).

### Safety and governance
- Region-aware policy bundle required before RF profile activation.
- Hard block on unknown board revisions.
- Signed profile packs and firmware manifests.

## 4) Executable Roadmap Quality (90-day)

### Phase 1 (Weeks 1-3): Foundation
- Model router + policy enforcement + spend controls.
- Device descriptor schema v1.
- RF profile manifest spec v1.
- CI checks for descriptor + manifest validation.

### Phase 2 (Weeks 4-7): Coverage acceleration
- Integrate top 8 target device families.
- Build compatibility conformance test suite.
- Introduce staged release channels (`alpha`, `field`, `stable`).

### Phase 3 (Weeks 8-10): RF scale-up
- Expand profile packs with signed distribution.
- Add hardware-in-loop regression path.
- Add automated rollback triggers from telemetry anomalies.

### Phase 4 (Weeks 11-13): Operational hardening
- SLA dashboards: flash success rate, recovery rate, incident MTTR.
- Cost and latency dashboards by model/provider.
- Launch readiness review with go/no-go gates.

## 5) KPI and Gate Set
- Flash success rate ≥ 98% on supported Tier 0/1 hardware.
- Recovery success ≥ 95% after interrupted flash.
- Autonomous action trace coverage = 100%.
- Per-task model spend within budget envelope (daily + weekly).
- RF profile compliance violations = 0 in stable channel.

## 6) Immediate Next Actions (queued)
1. Draft `model-router` interface and policy YAML schema.
2. Generate initial device descriptor examples for ESP32, nRF52, STM32.
3. Define RF profile manifest fields + signing workflow.
4. Build roadmap board with milestone owners and exit criteria.

## 7) 00:35-00:55 Milestone Output

### New docs created
- `docs/INFI-AI-CLOUD-MODEL-BASE-PLAN.md`
- `docs/INFI-AI-FIRMWARE-RF-EXPANSION-PLAN.md`
- `docs/INFI-AI-EXECUTABLE-ROADMAP-QUALITY.md`

### Key net-new decisions
- Cloud model base now defined as tiered router (`R/F/S/O`) with fail-closed policy and hard cost governance.
- RF expansion is now repo-linked with explicit work packages for `pamir-infiltra`, `neon-flash-esp`, and corpus normalization in `D1HackGear0`.
- Device expansion locked behind descriptor-first promotion gates to prevent support matrix sprawl.
- Roadmap quality now scored with a rubric and execution-unit format for hourly delivery discipline.

### Newly surfaced risks
1. D1HackGear repo ambiguity (near-empty) may cause planning drift.
2. Mixed provenance in D1HackGear0 RF corpus requires strict compliance filtering.
3. Cloud cost spikes remain likely until request tagging is enforced everywhere.

### Next-hour execution plan
1. Draft board descriptor JSON examples + policy bundle skeleton in docs.
2. Create a reason-code matrix bridging preflash UI and firmware runtime checks.
3. Produce a first-pass issue breakdown (EU-IDs) by repo and sequencing.

---

## 8) 04:35 Milestone Output

### Net-new refinements shipped
- Added a **`policy.yml` v0** shape (providers, budgets, routing rules, redaction, trace requirements) to the cloud model base spec.
- Added a **UI↔firmware reason-code matrix** so `neon-flash-esp` and `pamir-infiltra` share identical gate semantics.
- Added a **board descriptor JSON v0 skeleton** example to keep device coverage expansion descriptor-first.
- Extended the Executable Roadmap Quality doc with **EU-05/EU-06** to make the next 1-2 hours unambiguous.

### Files changed (docs)
- `docs/INFI-AI-CLOUD-MODEL-BASE-PLAN.md`
- `docs/INFI-AI-FIRMWARE-RF-EXPANSION-PLAN.md`
- `docs/INFI-AI-EXECUTABLE-ROADMAP-QUALITY.md`

### Current blockers / decisions needed
1. **Signing authority + key management** for `*.infi-rfpack` signatures (single key vs per-channel keys).
2. **Descriptor location** in `pamir-infiltra` (where canonical JSON lives + validation path).
3. **Policy ownership**: who can change `policy.yml` and how it’s reviewed/versioned.

### Next 60-minute target
- Convert the new doc artifacts into a **minimal issue checklist** (EU-05 sub-tasks) and identify the single canonical repo location for `policy.yml` + device descriptors.

---
This document is intentionally execution-focused and structured for direct conversion into issues/epics in Infiltra repos.

## 9) 08:22 Milestone Output (Morning Handoff)

### Net-new refinements shipped
- Pinned **canonical repo paths (proposal)** for:
  - cloud policy + eval harness (`infi-ai-cloud-base/...`)
  - firmware board descriptors + schema validation (`pamir-infiltra/...`)
  - UI reason-code mirroring + preflash gates (`neon-flash-esp/...`)
- Added a **measurable model-base selection procedure** (eval harness gates) to prevent “model vibes” decisions.
- Made **key management** a first-class decision item (single key vs per-channel keys) to avoid shipping unsigned/ambiguous RF packs.

### Files changed (docs)
- `docs/INFI-AI-CLOUD-MODEL-BASE-PLAN.md`
- `docs/INFI-AI-FIRMWARE-RF-EXPANSION-PLAN.md`
- `docs/INFI_OVERNIGHT_2026-02-12.md`

### Current blockers / decisions needed
1. **Which repo becomes canonical for cloud runtime**: keep `infi-ai-cloud-base` as the home for `policy.yml` + eval harness, or move into a backend repo once named.
2. **Exact descriptor path in `pamir-infiltra`**: confirm `Boards/descriptors/*.board.json` is acceptable vs folding into existing `Boards/*.json`.
3. **Signing authority + rotation**: confirm key custody and whether per-channel keys are required.

### Next 60-minute targets
1. Create a minimal `ReasonCodes` single source list (doc/spec) that both firmware + UI can generate from.
2. Draft `board_descriptor.schema.json` v0 outline (fields + required/optional) to unblock validation tooling.
3. Draft `weekly_eval_set.jsonl` format + rubric checklist (what gets scored) so the harness is implementable.
