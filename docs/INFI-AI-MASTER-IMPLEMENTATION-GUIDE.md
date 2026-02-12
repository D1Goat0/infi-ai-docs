# INFI AI Master Implementation Guide (Execution Canon)

_Last updated: 2026-02-12 (milestone: cloud base plan + device coverage + RF lanes tightened)_

**Purpose:** single execution document to ship INFI AI across constrained embedded targets and cloud operations without fragmentation.

**Canonical companion docs:**
- Hardware: `docs/INFI-AI-HARDWARE-COMPATIBILITY-DEEP-DIVE.md`
- Dataset system: `docs/INFI-AI-DATASET-BUILD-SPEC.md`
- Roadmap + cadence: `docs/INFI-AI-ROADMAP-AND-OPERATING-RHYTHM.md`

---

## 1) Product Definition and Boundaries

INFI AI is a deterministic assistant architecture, not a freeform on-device LLM. It has two tightly coupled planes:

1. **Embedded plane (real-time):** intent parsing, local retrieval, action routing, safety confirmation.
2. **Cloud plane (ops intelligence):** ingest repos/community/telemetry, rank opportunities, produce roadmap + release intelligence.

### Non-negotiables
- No unmapped action execution under any confidence condition.
- No background “auto execute” path for S2/S3 actions.
- Firmware↔dataset compatibility tuple enforced before KB load.
- Recommended-board scope remains intentionally small during v1.

---

## 2) Tier Model (Tiny / Medium / Heavy)

| Tier | Typical Compute Class | Parser Mode | Local KB Design | Latency Budget (P95) | Classification Gate |
|---|---|---|---|---:|---|
| Tiny | ESP32-C3 / classic ESP32 / low-headroom STM32 | strict keyword exact-match | compact procedural cards | <=250 ms | 7-day soak + 98% safe routing |
| Medium | ESP32-S3 (no/low PSRAM), STM32F4/L4/H5 subsets | keyword + curated aliases | deeper cards + board deltas | <=320 ms | 14-day soak + 98.5% routing |
| Heavy | ESP32-S3+PSRAM / STM32H7/H5 premium targets / ESP32-P4+coprocessor | alias+context slots+workflow sequencing | troubleshooting graph + recovery recipes | <=450 ms | 21-day soak + 99% routing |

**Promotion rule:** no tier promotion without passing the objective promotion gates in §11.

---

## 3) Current v1 Board Policy

### Recommended (ship-confidence)
1. M5StickC Plus 2 (ESP32-S3)
2. M5Cardputer (ESP32-S3)
3. LilyGO T-Embed (ESP32-S3)

### Beta lane (controlled)
- M5StickC Plus 1.1 (classic ESP32)
- LilyGO T-Embed CC1101 variants
- NUCLEO-F446RE (STM32F4 portability pilot)

### Not-recommended (v1 distribution)
- Generic ESP32 devkits (high BOM variance)
- Broad ESP32-S2/C6/H2 rollouts
- Broad STM32 family promises before parity harness matures

---

## 4) Integration Strategy with Existing Infiltra Repos

This plan is tailored to existing structure in `repos/pamir-infiltra`:
- `platformio.ini` envs: `m5stick-c-plus-2`, `m5stick-c-plus-1-1`, `cardputer`, `lilygo-t-embed`, `lilygo-cc1101`
- board manifests: `Boards/*.json`
- firmware modules: `src/Modules/Functions/*`, `src/Modules/Core/*`, `src/UserInterface/*`

### 4.1 New module layout (minimal refactor)

```text
src/Modules/AI/
  Intent/
  Knowledge/
  Router/
  Safety/
  Telemetry/
  Config/
```

### 4.2 Runtime hook points
1. Input capture in existing button/text flow (`Modules/Core/User Input/*`)
2. Intent request normalization
3. Tiered parser dispatch
4. Capability gate check against board profile
5. Safety gate (S0/S1/S2/S3)
6. Action routing to existing firmware command handlers
7. Deterministic response + optional telemetry event

### 4.3 Compile-time controls
- `INFI_AI_ENABLED`
- `INFI_AI_TIER={tiny|medium|heavy}`
- `INFI_AI_VOICE_KEYWORD_ENABLED` (heavy only)
- `INFI_AI_CLOUD_HANDOFF_ENABLED` (optional)

---

## 5) Safety Model (Execution and Product)

### Safety classes
- **S0 Informational:** read-only lookup
- **S1 Low impact:** reversible low-risk actions
- **S2 Medium impact:** persistent state changes
- **S3 High impact:** disruptive actions (must require confirmation UX where available)

### Runtime hard-stops
- Unknown intent ID -> reject + suggest nearest known safe intent.
- Known intent but missing capability -> block + explain unsupported board capability.
- Confidence below threshold -> no action execution.
- Schema mismatch -> refuse KB load and display remediation tuple.

### Abuse resistance
- Community requests classified: `valid`, `unclear`, `irrelevant`, `troll`.
- `troll` and low-confidence `unclear` never auto-promote to roadmap.
- Preserve moderation provenance for audit.

---

## 6) OTA and Release Strategy

### 6.1 Dual-track updates
1. **Firmware OTA:** signed image, staged rollout channels (dev -> beta -> prod).
2. **KB OTA:** signed manifest + checksum-verified `.binpack` artifacts.

### 6.2 Compatibility tuple
`firmware_semver + kb_manifest_semver + intent_schema_semver`

### 6.3 Rollback rules
- Firmware rollback if P95 latency regresses >25% for 2 consecutive release candidates.
- KB rollback if action-map mismatch >0 or parsing fallback spike >2x baseline.
- OTA abort if signature, checksum, or compatibility tuple fails.

---

## 7) Security Controls (Device + Pipeline + Cloud)

### Device/runtime
- Enforce signed firmware in release channels.
- Manifest signature and SHA256 verification before loading KB.
- Secrets redaction in serial logs and telemetry exports.

### CI/CD pipeline
- Schema validation hard-fail.
- Semantic validation hard-fail (unknown capability, duplicate intent, orphan action).
- Size budget hard-fail by tier.
- SBOM + dependency scan on release branch.

### Cloud controls
- Principle-of-least-privilege keys for ingest bots.
- API token rotation policy (30-90 days depending on risk class).
- Structured audit logs: who changed what, when, and why.

---

## 8) Dataset/Knowledge Contract (Operational Summary)

Canonical data objects:
- `devices.json`
- `pinouts.json`
- `firmware_capabilities.json`
- `intent_map.json`
- `knowledge_cards.json`
- `ir_catalog.json`

Generated artifacts:
- `infi_kb_tiny.binpack`
- `infi_kb_medium.binpack`
- `infi_kb_heavy.binpack`
- `manifest.json` + signature

See full implementation detail in `docs/INFI-AI-DATASET-BUILD-SPEC.md`.

---

## 9) Testing and Validation Framework

### 9.1 Required test layers
1. **Unit:** parser tokens, alias resolution, safety-state transitions.
2. **Integration:** board capability map + action routing + KB load.
3. **HIL smoke:** all recommended boards per RC.
4. **Stress:** 30-minute mixed UI/input/AI loops.
5. **Security:** signature verification and tamper tests.

### 9.2 Golden acceptance thresholds
- Routing correctness: >=98% Tiny, >=98.5% Medium, >=99% Heavy pilot.
- Unsafe execution incidents: 0 tolerated.
- P95 response latency within budget table in §2.
- Build reproducibility: clean CI builds across all recommended targets.

---

## 10) Monetization Tie-In (Build What Pays)

| Capability | User Outcome | Plan Tier | Instrumentation Needed |
|---|---|---|---|
| Tiny deterministic assistant | reliable baseline usage | Free funnel | DAU, intent success rate |
| Medium richer local troubleshooting | faster issue resolution | Pro anchor | time-to-resolution, feature adoption |
| Team reports + board drift intelligence | operational confidence at scale | Team | active seats, report opens, retention |
| Heavy workflow automation (gated) | premium productivity | Pro+/Team add-on | activation rate, upgrade conversion |

**Business policy:** never paywall safety-critical fixes or compatibility remediations.

---

## 11) Objective Promotion Gates (Board + Tier)

### Board promotion: Beta -> Recommended
Must pass all:
1. 100% reproducible clean builds for 10 consecutive CI runs.
2. Routing score meets tier threshold for board-specific benchmark set.
3. 0 unmapped action executions in regression.
4. 30-minute soak with no lockup / watchdog reset.
5. Thermal/power profile within board envelope.
6. Support docs complete: known constraints, troubleshooting, rollback guide.

### Tier promotion: Feature set upgrade
- Tiny -> Medium requires memory headroom proof and alias false-positive rate <=1.5%.
- Medium -> Heavy requires PSRAM/performance evidence and P95 latency within Heavy target.

---

## 12) 12-Week Implementation Sequence (Practical)

| Phase | Weeks | Primary Output | Exit Criteria |
|---|---|---|---|
| P0 Scope lock | 0-1 | board freeze, schema freeze, safety contracts | signed design baseline |
| P1 Tiny ship path | 1-3 | deterministic parser/router + tiny package | top-20 intents stable |
| P2 Medium/Heavy pilot | 3-6 | alias engine + troubleshooting graph + heavy pilot | metrics pass in bench+HIL |
| P3 Cloud ops loop | 6-10 | ingest + digest + scoring + compatibility alerts | weekly roadmap decisions use outputs |
| P4 Hardening+launch | 10-12 | release checklist, OTA drills, support playbooks | RC approved and rollback tested |

---

## 13) Immediate Action Checklist (Next 48h)

- [ ] Freeze v1 recommended board list and publish in all INFI docs.
- [ ] Finalize tier budgets and parser thresholds in config headers.
- [ ] Add AI module scaffolding in firmware repo (no broad refactor).
- [ ] Implement semantic validation for intent↔capability↔action map.
- [ ] Add CI gates for size budgets, signature checks, and regression tests.
- [ ] Stand up dev/beta/prod OTA channels with rollback rehearsal.
- [ ] Instrument metrics needed for Pro/Team monetization decisions.

---

## 14) Cloud Model Base Plan (Ops + Serving)

### 14.1 Base model policy by function (abstract)
| Function | Primary Model Class | Fallback | Why |
|---|---|---|---|
| roadmap synthesis + risk framing | high-reasoning cloud LLM | medium-reasoning cloud LLM | strategic quality over latency |
| compatibility triage + summarization | medium-reasoning cloud LLM | deterministic rules + templates | cost/stability balance |
| daily digest rendering | low/medium cloud LLM | template-only formatter | predictable recurring output |
| device-side execution | deterministic parser/router (no generative execution) | strict keyword parser | safety + reproducibility |

### 14.2 “Model base” selection criteria (concrete, testable)
Choose the cloud base model(s) using an eval harness, not vibes:
- **Schema adherence:** <=5% JSON/schema rejection across the weekly eval set.
- **Actionability:** >=90% reviewer score (“could execute without follow-up”).
- **Cost cap:** define a per-day and per-week ceiling for: (a) digest, (b) triage, (c) planning.
- **Latency targets:** digest <=15s end-to-end; triage <=30s; planning can be slower.
- **Stability:** no provider/model changes without a 2-run canary + regression diff.

### 14.3 Routing policy
1. Route by task class (`strategy`, `triage`, `digest`, `device-runtime`).
2. Enforce response schema for all cloud outputs consumed by planning tools.
3. Reject non-conforming JSON and retry once with corrective prompt.
4. Persist prompt/version hashes for reproducibility and regression testing.

### 14.4 Output schemas (minimum fields)
- **Strategy output:** `assumptions[]`, `risks[]`, `decision_points[]`, `next_actions[]`.
- **Triage output:** `severity`, `confidence`, `affected_boards[]`, `owner`, `recommended_fix`.
- **Digest output:** `sources_count`, `highlights[]`, `stale_source_warning`, `next_actions[]`.

### 14.5 Model quality gates
- Strategic plan outputs require explicit assumptions, risk table, and measurable next actions.
- Triage outputs require severity, confidence, affected board family, and owner suggestion.
- Digest outputs require source count + stale-source warning when applicable.
- Weekly eval set should maintain <=5% schema rejection and >=90% reviewer actionability score.

---

## 15) Device Coverage Strategy (v1 -> v2 expansion)

### 15.1 Device coverage scoring (0–100)
To avoid “support sprawl”, every candidate board gets a numeric score and must meet a minimum before entering Beta.

**Scoring dimensions (suggested weights):**
- **Demand / install-base signal (0–20):** sales/usage/community demand evidence.
- **Capability fit (0–25):** UI+RF+memory headroom vs target tier.
- **Variance risk (0–15):** BOM drift, vendor revisions, clone risk.
- **Validation cost (0–15):** HIL availability, regression time, RF harness effort.
- **Support burden forecast (0–15):** docs load + likely failure modes.
- **Monetization leverage (0–10):** does this board unlock Pro/Team value?

**Minimum entry thresholds:**
- **Beta entry:** >=70 and no single dimension <5.
- **Recommended promotion eligibility:** >=80 and all objective promotion gates (§11) complete.

### 15.2 v1 / v1.5 / v2 policy
**v1 (ship now)**
- lock to three ESP32-S3 recommended boards
- maintain one constrained beta lane (classic ESP32 + F446 pilot)
- require objective gate pass before any public support claim changes

**v1.5 (post-launch stabilization)**
- graduate one additional RF-capable S3 board if concurrency tests pass
- add one low-cost Tiny profile (C3) with strict feature subset
- begin STM32 security-focused lane (H5 or U5) only after parity harness maturity

**v2 (scale carefully)**
- broaden board matrix only where support cost per board remains within target
- separate “community supported” from “commercially supported” labels
- couple expansion decisions to telemetry-backed demand and margin impact

---

## 16) Firmware RF Expansion (lane model + harness)

Canonical deep details live in `docs/INFI-AI-HARDWARE-COMPATIBILITY-DEEP-DIVE.md#13-firmware-rf-expansion-strategy-phased-testable`.

### 16.1 RF lanes (what “expanded RF” means)
- **RF-L1 baseline:** BLE scan + Wi‑Fi recon metadata + safe summaries (low risk).
- **RF-L2 extended:** sub‑GHz profile abstraction + controlled transmit guards (medium risk).
- **RF-L3 advanced:** concurrent RF + UI workflow orchestration + recovery flows (high risk).

### 16.2 Required RF harness (minimum viable)
- **Concurrency test:** UI navigation + RF scan loop + user input bursts.
- **Latency capture:** P95 latency regression vs non‑RF baseline per board.
- **Crash/reset detection:** watchdog resets, brownout logs, heap fragmentation.
- **Action mapping audit:** “0 unmapped RF actions” enforced in CI semantic checks.

### 16.3 RF promotion gates (board-level)
1. 10 clean RF regression runs with no crash/reset.
2. <=10% P95 latency regression versus non‑RF baseline.
3. 0 unmapped RF actions and 0 unsafe auto-execution incidents.
4. Field telemetry stable across at least two board revisions.

---

## 17) Document Cross-Link Map

- Architecture baseline: `INFI_AI_ARCHITECTURE.md`
- Device tier matrix: `INFI_AI_DEVICE_TIER_MATRIX.md`
- Integration notes: `INFI_AI_INTEGRATION_NOTES.md`
- Execution baseline: `INFI_AI_EXECUTION_PLAN.md`
- Revenue model: `INFI_AI_REVENUE_PATHS.md`
