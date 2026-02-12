# INFI AI Hardware Compatibility Deep Dive

_Last updated: 2026-02-12_

Purpose: convert board/MCU selection into practical engineering decisions for INFI AI tiers.

## 1) Decision Summary

For v1, optimize for delivery speed and firmware consistency:
- **Primary architecture:** ESP32-S3 family
- **Beta/legacy:** ESP32 classic and selected variants
- **Strategic expansion:** STM32 pilot after v1 stabilization

---

## 2) ESP32 Family Research and Constraints

> Values below are practical planning values. Validate exact SKU/module memory in BOM and board manifests before release.

| Family | Core | Typical Internal RAM | External RAM Support | Flash Reality (common modules) | Peripheral Notes | Tier Fit |
|---|---|---:|---|---|---|---|
| ESP32 (classic) | Xtensa dual-core up to 240 MHz | ~520 KB SRAM | WROVER variants with PSRAM | 4-16 MB common | mature Wi-Fi/BLE, broad board variance | Tiny/Medium |
| ESP32-S2 | Xtensa single-core | few hundred KB class | some module variants | 4-16 MB common | Wi-Fi only, no BLE | Tiny/Medium (niche) |
| ESP32-S3 | Xtensa dual-core up to 240 MHz | 512 KB SRAM (plus ROM/cache) | strong support, up to large PSRAM mapping in IDF | 8-16 MB common | vector instructions, rich IO, Wi-Fi + BLE5 LE | Medium/Heavy (best) |
| ESP32-C3 | RISC-V single-core up to 160 MHz | ~400 KB RAM class | usually none in common modules | 4-16 MB common | lower GPIO count class, low-cost, Wi-Fi + BLE5 LE | Tiny (best) |
| ESP32-C6 | RISC-V single-core | constrained class | limited module ecosystem currently | 4-16 MB common | Wi-Fi 6 + 802.15.4 opportunity; ecosystem maturity gap | Tiny (future) |
| ESP32-H2 | RISC-V low-power class | constrained class | limited | smaller/varied | 802.15.4/BLE focus, no Wi-Fi | not a current INFI fit |

## Key ESP32 Constraints That Matter for INFI AI
1. **Board variance dominates risk** on generic ESP32 devkits.
2. **PSRAM presence/quality** directly impacts Heavy-tier reliability.
3. **Display/input/RF peripherals** reduce practical memory headroom.
4. **Power rails and flash/PSRAM voltage pairing** matter for stability (especially custom boards).

---

## 3) STM32 Major Lines and Practical Tier Fit

| STM32 Line | Typical Positioning | Practical Memory/Performance Class | Security Posture | INFI Tier Fit | Recommendation |
|---|---|---|---|---|---|
| F1 | legacy mainstream | low/legacy | limited modern hardening | Tiny theoretical only | Not recommended |
| F4 | mature performance | moderate flash/RAM, strong ecosystem | good baseline, no modern TrustZone on line | Tiny/Medium | Beta pilot worthy |
| F7 | high-performance older gen | higher performance class | baseline advanced | Medium | Beta (selective) |
| L4/L4+ | low power | moderate | low-power focused | Tiny/Medium | Beta (battery-focused products) |
| L5 | low power + security | moderate | TrustZone-capable class | Tiny/Medium | Beta/strategic |
| G4 | mixed-signal | moderate | application-dependent | Tiny/Medium | Not v1 priority |
| H5 | high-perf + security | strong | stronger modern security options | Medium/Heavy | Strategic premium line |
| H7 | high-performance | high memory/perf class | strong baseline, complex boards | Medium/Heavy | Beta (high-end experiments) |
| U5 | low-power secure | moderate/strong low-power | TrustZone + security focus | Tiny/Medium | Strategic (future product lines) |

### Why STM32 is not first-wave v1
- Porting cost from ESP32-centric code paths is real.
- Tooling/peripheral differences increase QA burden.
- Small-team risk is schedule slip without immediate revenue upside.

---

## 4) Board-Level Recommendations

## 4.1 Recommended (ship confidence)

| Board | MCU | Tier | Why Recommended | Caveats |
|---|---|---|---|---|
| M5StickC Plus 2 | ESP32-S3 | Medium | existing ecosystem fit, display/input practical, good S3 baseline | keep response budgets bounded |
| M5Cardputer | ESP32-S3 | Medium/Heavy | keyboard/display boosts UX, strong for advanced local flows | heavy features need memory profiling |
| LilyGO T-Embed | ESP32-S3 | Medium/Heavy | good for portable advanced workflows | board variant differences must be tracked |

## 4.2 Beta (controlled expansion)

| Board | MCU | Tier | Beta Rationale | Promotion Gate |
|---|---|---|---|---|
| M5StickC Plus 1.1 | ESP32 classic | Tiny/Medium | large install base but less headroom | pass 50-intent latency and safety tests |
| LilyGO T-Embed CC1101 variant | ESP32-S3 + RF path | Medium/Heavy | RF complexity and potential interference paths | pass RF/UI regression suite |
| NUCLEO-F446RE | STM32F4 | Tiny/Medium | best pilot for STM portability effort | pass full parser/router parity tests |

## 4.3 Not recommended (for now)

| Board Class | Why Not Recommended |
|---|---|
| Generic ESP32-WROOM devkits | hardware/peripheral variance creates support burden |
| Random discovery/eval boards for production | non-standardized BOM and unstable support claims |
| Legacy low-memory STM32F1 boards | insufficient headroom for practical INFI UX |

---

## 5) Tier Assignment Rules (Deterministic)

1. **Tiny** if:
   - constrained RAM, no PSRAM, minimal UI
   - must run exact keyword mapping only
2. **Medium** if:
   - stable S3-class headroom and UI stack
   - alias parser + expanded local KB feasible
3. **Heavy** if:
   - proven memory headroom (typically S3 + PSRAM or high-end STM)
   - troubleshooting cards + optional voice keyword path stay within latency goals

---

## 6) Firmware/Board Risk Controls

| Risk | Typical Board Trigger | Control |
|---|---|---|
| Heap fragmentation | display + RF + rich responses | capped response length, static buffers for hot paths |
| Action misrouting | inconsistent board capability definitions | central board capability registry |
| Latency spikes | heavy lookups on constrained chips | tier-pruned index + O(1)/bounded lookup paths |
| Feature drift | board JSON mismatch to firmware flags | CI check against board manifest |
| RF/UI conflict | CC1101 or complex peripheral combinations | dedicated beta test lane before promotion |

---

## 7) Board Promotion Checklist (Beta -> Recommended)

A board can be promoted only when all pass:
1. Reproducible clean builds in CI.
2. >=98% intent routing accuracy on board-specific prompt set.
3. Zero unmapped action execution in regression.
4. 30-minute stress test (UI + input + AI path) without lockups.
5. No critical thermal/power anomalies.
6. Support docs complete (known limits + user guidance).

---

## 8) Tomorrow-Morning Hardware Actions

1. Lock the 3-board recommended set in release docs.
2. Create board capability registry file with tier and feature flags.
3. Define per-board memory budgets and target max KB package.
4. Stand up beta gate test templates for CC1101 and STM32 pilot.
5. Stop adding new board SKUs until P2 completion.

---

## 9) References used in this deep dive

- Espressif product/technical pages for ESP32-S3 and ESP32-C3 classes (resource and feature baseline)
- ESP-IDF external PSRAM guide for ESP32-S3 (address space and integration constraints)
- STM32 family landscape synthesis (line positioning and practical fit)

For execution linkage, see:
- `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md`
- `INFI_AI_DEVICE_TIER_MATRIX.md`
