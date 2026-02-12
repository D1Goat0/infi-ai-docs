# INFI AI Hardware Compatibility Deep Dive

_Last updated: 2026-02-12 (deep research pass)_

This document is the detailed hardware decision layer for INFI AI. It defines family-level fit, board-level fit, and objective promotion gates for moving devices from experimental to production support.

---

## 1) Executive Hardware Position

- **v1 delivery core:** ESP32-S3 ecosystem (best balance of tooling maturity, board availability, and performance headroom).
- **Controlled low-cost lane:** ESP32 classic + C3 for strict Tiny workloads.
- **Strategic future lane:** STM32 high-confidence pilots after ESP32-S3 baseline stabilizes.
- **Do not overpromise:** wide matrix support is a roadmap outcome, not a launch input.

---

## 2) ESP32 Family Analysis (S2/S3/C3/C6/H2/P4 + classic)

> Notes: practical planning ranges are used; exact SKU values must be pinned in board manifests and BOM snapshots.

| Family | Core/Arch | Wireless | Typical Resource Envelope | Practical Strength | Major Constraints | INFI Fit |
|---|---|---|---|---|---|---|
| ESP32 (classic) | Xtensa dual-core up to 240 MHz | Wi‑Fi + BLE | ~520KB SRAM class; flash varies by module | huge ecosystem, cheap boards | high board variance, legacy quirks, memory pressure under UI+RF | Tiny/Medium (beta) |
| ESP32-S2 | Xtensa single-core | Wi‑Fi only | constrained/moderate SRAM class | USB-centric designs, solid for deterministic tasks | no BLE; single-core limits concurrent UI/network paths | Tiny/Medium niche |
| ESP32-S3 | Xtensa dual-core + vector assist | Wi‑Fi + BLE 5 LE | 512KB SRAM class + strong PSRAM ecosystem | best all-around for INFI v1, excellent board diversity | still needs strict memory discipline with display stacks | Medium/Heavy recommended |
| ESP32-C3 | RISC‑V single-core up to 160 MHz | Wi‑Fi + BLE 5 LE | lower RAM headroom class | low cost, low power, stable Tiny target | fewer high-quality rich-UI boards, no PSRAM in many modules | Tiny recommended (focused) |
| ESP32-C6 | RISC‑V single-core | Wi‑Fi 6 + BLE + 802.15.4 | constrained/moderate class | future-proof networking and Thread/Zigbee potential | ecosystem/tooling less mature for current INFI firmware assumptions | Tiny future-beta |
| ESP32-H2 | RISC‑V low-power | BLE + 802.15.4 (no Wi‑Fi) | constrained low-power class | good coprocessor role for mesh features | no Wi‑Fi makes standalone INFI workflow weak | Not recommended standalone |
| ESP32-P4 | high-performance app processor class | no integrated Wi‑Fi/BLE (pair with radio) | materially stronger compute/memory interface | enables advanced local UX and heavier workflow orchestration | needs companion radio and more complex board integration | Heavy strategic (future) |

### 2.1 Family-specific engineering implications

#### ESP32-S3 (primary)
- Best candidate for Medium baseline and Heavy pilots.
- PSRAM-backed modules materially reduce troubleshooting-card pressure.
- Recommended for first-party support docs, HIL automation, and OTA confidence testing.

#### ESP32-C3 (cost lane)
- Strong Tiny target when intent dictionary is tightly bounded.
- Keep response templates short; avoid deep alias trees.
- Use as constrained baseline benchmark for parser efficiency.

#### ESP32-C6 / H2
- Important for future mesh-enabled products and 802.15.4 ecosystem alignment.
- Keep behind “experimental” until test harness includes Thread/Zigbee integration scenarios.

#### ESP32-P4
- Treat as premium architecture: UI-heavy workflows, advanced local diagnostics, richer context windows.
- Requires explicit companion-radio design and tighter power/thermal engineering.

---

## 3) ESP32 Module and Board-Class Constraints

| Constraint Area | Typical Failure Mode | Detection | Mitigation |
|---|---|---|---|
| PSRAM presence/quality | heavy tier instability, random resets | soak tests + heap fragmentation counters | require PSRAM capability flag + heavy only on validated modules |
| Flash size mismatch | KB artifact fails to load | manifest vs runtime checks | enforce per-board package cap + fallback to lower tier package |
| Peripheral bus contention | UI lag / scan instability | HIL mixed workload tests | reserve bus ownership policy, static scheduling for scan operations |
| Power rail/PMIC behavior | brownout under RF/display load | power draw profiling + brownout logs | per-board power profile + throttle high-load operations |
| Board BOM drift | “same name, different behavior” defects | board manifest hash + vendor revision metadata | board-revision pinning in support matrix |

---

## 4) STM32 Families: Board-Fit and Strategic Mapping

| STM32 Family | Positioning | Typical Fit for INFI | Recommendation | Why |
|---|---|---|---|---|
| F1 | legacy baseline | Tiny theoretical only | Not recommended | limited headroom, weak long-term ROI |
| F4 | mainstream high-volume | Tiny/Medium | Beta pilot preferred | mature ecosystem, strong portability proving ground |
| F7 | higher legacy performance | Medium | Beta selective | capable but less strategic than H5/H7 for new work |
| L4/L4+ | low power | Tiny/Medium | Beta for battery SKUs | useful where power dominates feature depth |
| L5 | low power + security | Tiny/Medium | Strategic beta | TrustZone-class posture for secure variants |
| G4 | mixed-signal | Tiny/Medium niche | Deferred | value mostly in specialty mixed-signal use-cases |
| H5 | modern secure performance | Medium/Heavy | Strategic recommended (post-v1) | security/perf balance fits premium lane |
| H7 | high performance | Medium/Heavy | Beta high-end | great capability, higher board complexity/cost |
| U5 | secure low power | Tiny/Medium | Strategic future | security + efficiency for portable products |

### 4.1 STM32 board fit guidance
- **Pilot now:** NUCLEO-F446RE for parser/router portability harness.
- **High-end experiments:** NUCLEO-H743 class for heavy workflow latency benchmarking.
- **Do not commit publicly yet:** broad STM32 production support until capability parity + OTA + telemetry stack are proven.

---

## 5) Board-Level Mapping (Tiny / Medium / Heavy)

| Board | MCU | Tier Target | Classification | Rationale |
|---|---|---|---|---|
| M5StickC Plus 2 | ESP32-S3 | Medium | Recommended | strong S3 baseline, existing repo env, manageable complexity |
| M5Cardputer | ESP32-S3 | Medium/Heavy | Recommended | keyboard + display improves deterministic assistant UX |
| LilyGO T-Embed | ESP32-S3 | Medium/Heavy | Recommended | practical for rich local workflows |
| LilyGO T-Embed CC1101 | ESP32-S3 | Medium/Heavy | Beta | RF path adds contention and validation overhead |
| M5StickC Plus 1.1 | classic ESP32 | Tiny/Medium | Beta | install base value, lower headroom |
| Generic ESP32 devkit class | mixed | Tiny | Not recommended | support burden due to uncontrolled variance |
| NUCLEO-F446RE | STM32F4 | Tiny/Medium | Beta pilot | best first portability target |

---

## 6) Classification Policy: Recommended / Beta / Not-Recommended

### Recommended
- Meets routing threshold, thermal/power envelope, OTA stability, and documentation completeness.

### Beta
- Functionally promising but missing one or more promotion gates.
- Explicitly labeled with caveats; no hard support SLA claims.

### Not-recommended
- Fails critical resource/safety constraints or introduces disproportionate support burden.

---

## 7) Objective Promotion Gates

### Beta -> Recommended (all required)
1. 10 consecutive clean CI builds for board env.
2. Routing score meets tier threshold across board-specific benchmark prompts.
3. 0 unmapped action execution.
4. 30-minute stress loop (UI+input+scan pathways) without lockup/reset.
5. OTA firmware + KB update pass with rollback tested.
6. Support runbook complete (known limits, troubleshooting, recovery).

### Recommended -> Tier upgrade (e.g., Medium -> Heavy)
- Memory/PSRAM headroom proven under realistic workload.
- P95 latency remains within heavy budget.
- Alias false-positive rate under defined threshold.
- No elevated safety regressions in 2 consecutive RC cycles.

---

## 8) Practical Integration With Existing Firmware Workflow

### Existing repo alignment points (`repos/pamir-infiltra`)
- `platformio.ini` already defines key environments.
- `Boards/*.json` should be source of truth for capability flags and tier defaults.
- `src/Modules/*` structure supports additive module strategy without broad refactors.

### Required board capability registry fields
- `board_id`
- `mcu_family`
- `tier_default`
- `tier_max`
- `features[]` (wifi_scan, ble_scan, ir_send, rf_scan, nfc, etc.)
- `memory_budget` (flash/rx/heap guardrails)
- `ota_channel`

---

## 9) Hardware Validation Matrix

| Validation Type | Tiny | Medium | Heavy |
|---|---:|---:|---:|
| Cold boot reliability (100 cycles) | required | required | required |
| Intent routing benchmark | required | required | required |
| Soak test duration | 30 min | 45 min | 60 min |
| OTA firmware update | required | required | required |
| OTA KB update | required | required | required |
| RF/UI concurrency test | optional | required | required |
| Thermal drift profile | basic | standard | extended |

---

## 10) Security and Reliability Controls at Hardware Layer

- Lock JTAG/debug settings per release policy for production SKUs.
- Enforce signed firmware and manifest verification before KB mount.
- Record board revision and module variant telemetry to identify drift-driven defects.
- Run anti-rollback policy for firmware when security critical patches are introduced.

---

## 11) Monetization Tie-In by Hardware Class

| Hardware Class | Product Positioning | Monetization Angle |
|---|---|---|
| Recommended S3 boards | mainstream reliable experience | conversion engine for Pro subscriptions |
| Beta boards | enthusiast/early access | paid beta cohorts (Team/Pro+) |
| Premium heavy boards (S3+PSRAM, future STM/H5/H7/P4) | advanced troubleshooting + workflow automation | premium add-ons and higher ARPU |

---

## 12) Immediate Hardware Decisions (next sprint)

- [ ] Freeze recommended set to 3 S3 boards for v1 launch.
- [ ] Publish board capability registry contract and fill current envs.
- [ ] Add automated promotion-gate checklist to release template.
- [ ] Start STM32 portability pilot only on NUCLEO-F446RE.
- [ ] Defer broad C6/H2/P4 commitments to post-v1 roadmap.
- [ ] Stand up RF-L1 regression harness on all recommended S3 boards.
- [ ] Define RF-L2 legal/compliance enablement checklist before broader rollout.

---


## 13) Firmware RF Expansion Strategy (phased, testable)

### 13.1 RF capability lanes
| Lane | Capabilities | Initial Board Focus | Risk Level |
|---|---|---|---|
| RF-L1 baseline | BLE scan + Wi-Fi recon metadata + safe summaries | M5StickC Plus 2 / Cardputer | Low |
| RF-L2 extended | sub-GHz profile abstraction + controlled transmit guards | LilyGO T-Embed CC1101 (beta) | Medium |
| RF-L3 advanced | concurrent RF + UI workflow orchestration + recovery flows | S3+PSRAM and future H5/H7 class | High |

### 13.2 Guardrails for RF expansion
- No default transmit action; explicit safety confirmation remains mandatory for S2/S3 operations.
- Enforce per-board RF concurrency limits to prevent watchdog instability.
- Add RF regression suite: scan stability, packet parse integrity, and UI latency under load.
- Require legal/compliance review checklist before public enabling of new RF actions.

### 13.3 Promotion criteria for new RF boards
1. 10 clean RF regression runs with no crash/reset.
2. <=10% P95 latency regression versus non-RF baseline.
3. 0 unmapped RF actions and 0 unsafe auto-execution incidents.
4. Field telemetry confirms stable operation across at least two board revisions.

## 14) Cross-links

- Master implementation: `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md`
- Dataset pipeline: `docs/INFI-AI-DATASET-BUILD-SPEC.md`
- Cadence and gates: `docs/INFI-AI-ROADMAP-AND-OPERATING-RHYTHM.md`
- Legacy tier matrix: `INFI_AI_DEVICE_TIER_MATRIX.md`
