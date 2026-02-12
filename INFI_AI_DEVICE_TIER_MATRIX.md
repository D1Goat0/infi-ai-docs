# INFI AI Device Tier Matrix (ESP32 + STM)

> Alignment note (2026-02-12): Expanded technical rationale is documented in `docs/INFI-AI-HARDWARE-COMPATIBILITY-DEEP-DIVE.md`.

_Last updated: 2026-02-11_

## Classification Legend
- **Recommended:** target for reliable production support in v1
- **Beta-capable:** viable with caveats; test coverage needed before production claim
- **Unsupported (for now):** not aligned with v1 constraints, missing needed resources/peripherals, or too costly to support now

## Tier Definition (for planning)
- **Tiny:** deterministic keyword intents, compact local KB, strict memory budgeting
- **Medium:** alias/fuzzy matching, larger KB, expanded troubleshooting cards
- **Heavy:** richest embedded feature set, broadest KB, optional voice keyword path + cloud handoff support

> Note: “heavy” is still edge runtime logic + retrieval, not a full on-device LLM.

---

## ESP32 Family Matrix

| MCU / Board Family | Typical Memory Profile | Suggested Tier | Classification | Why |
|---|---:|---|---|---|
| ESP32 (classic WROOM/WROVER) dev boards | ~520KB SRAM; flash varies | Tiny / Medium | **Beta-capable** | Large install base, but board variance and older silicon behavior can increase QA burden. |
| ESP32-S2 boards | SRAM in similar class, single core | Tiny / Medium | **Unsupported (v1 default)** | Wi-Fi-only + single-core constraints; acceptable later for specific SKUs, not priority now. |
| ESP32-C3 boards | lower memory and RISC-V single core | Tiny | **Beta-capable** | Great low-cost targets for strict command runtime, but tighter RAM budget and fewer UI-friendly boards. |
| ESP32-C6 boards | constrained, newer ecosystem | Tiny | **Unsupported (v1 default)** | Good long-term (Wi-Fi 6/802.15.4), but ecosystem maturity for current firmware stack is lower. |
| ESP32-S3 modules (no PSRAM) | strong baseline SRAM, dual core | Medium | **Recommended** | Best practical baseline for deterministic + richer parser while keeping power/cost reasonable. |
| ESP32-S3 + PSRAM boards | strong embedded headroom | Medium / Heavy | **Recommended** | Best fit for heavy tier cards, troubleshooting index, and optional voice keyword features. |

---

## Infiltra-Adjacent ESP32 Boards (Current Repo + Common Targets)

| Board | MCU | Tier Fit | Classification | Notes |
|---|---|---|---|---|
| M5StickC Plus 2 | ESP32-S3 | Medium | **Recommended** | Already in `platformio.ini`; strong near-term production candidate. |
| M5Cardputer | ESP32-S3 | Medium / Heavy | **Recommended** | Keyboard/display UX aligns with richer local assistant prompts. |
| LilyGO T-Embed | ESP32-S3 | Medium / Heavy | **Recommended** | Already integrated; display + input + battery management suitable for advanced local flows. |
| LilyGO T-Embed CC1101 variants | ESP32-S3 | Medium / Heavy | **Beta-capable** | RF path adds complexity; keep beta until RF + UI regressions stabilize. |
| M5StickC Plus 1.1 | ESP32 (older) | Tiny / Medium | **Beta-capable** | Works, but less headroom and more board-specific handling. |
| Generic ESP32-WROOM devkits | ESP32 | Tiny | **Unsupported (v1 distribution)** | Too many hardware permutations for small-team support. |

---

## STM32 Family Matrix (Strategic Expansion)

| STM32 Family | Typical Resource Range | Suggested Tier | Classification | Why |
|---|---|---|---|---|
| STM32F1 (e.g., F103) | low flash/RAM legacy class | Tiny (theoretical) | **Unsupported (v1)** | Insufficient headroom for practical INFI runtime + modern UX. |
| STM32F4 (e.g., F405/F411/F429) | moderate flash/RAM, mature ecosystem | Tiny / Medium | **Beta-capable** | Good performance/cost, but porting effort from ESP32-first codebase is non-trivial. |
| STM32L4/L4+ | low-power with moderate memory | Tiny / Medium | **Beta-capable** | Power-efficient and capable, but less aligned with current display/input assumptions. |
| STM32G4 | mid-performance mixed-signal class | Tiny / Medium | **Unsupported (v1 default)** | Valuable for specialty builds, not first-wave assistant targets. |
| STM32H7 | high-performance, large memory options | Medium / Heavy | **Beta-capable (high-end)** | Strong technical fit; BOM cost and board complexity make this a selective premium path. |
| STM32U5 | efficient modern low-power class | Tiny / Medium | **Unsupported (v1 default)** | Promising but not worth immediate divergence from ESP32-centric roadmap. |

---

## Notable STM Boards for Feasibility Planning

| Board | MCU | Tier Fit | Classification | Notes |
|---|---|---|---|---|
| NUCLEO-F446RE | STM32F446 | Tiny / Medium | **Beta-capable** | Good dev/test board for porting exercises. |
| Black Pill F411CE | STM32F411 | Tiny | **Beta-capable** | Cheap and common; good for deterministic command runtime prototypes. |
| NUCLEO-H743ZI2 | STM32H743 | Medium / Heavy | **Beta-capable** | Strong for high-end experiments; not cost-optimized for broad rollout. |
| Discovery kits (H7/F4 mixed) | Various | Tiny–Heavy | **Unsupported (v1 distribution)** | Great internal R&D tools; not standardizable product devices. |

---

## Recommended v1 Support Set (Small-Team Realism)

## Primary (ship with confidence)
1. **M5StickC Plus 2 (ESP32-S3)** -> Medium
2. **M5Cardputer (ESP32-S3)** -> Medium/Heavy
3. **LilyGO T-Embed (ESP32-S3)** -> Medium/Heavy

## Secondary (beta lane)
1. M5StickC Plus 1.1 -> Tiny/Medium
2. LilyGO T-Embed CC1101 variants -> Medium/Heavy (RF caveats)
3. One STM32 pilot board (recommended: NUCLEO-F446RE) for future portability assessment

## Deferred/unsupported for v1
- Broad generic ESP32 devkits
- ESP32-C6/S2 broad support
- Legacy STM32F1 and wide STM board matrix

---

## Device-Gating Criteria (Use This for Promotion from Beta -> Recommended)
A board can be promoted only if it passes:
1. **Build reproducibility** across clean environments
2. **Intent routing accuracy** (>=98% on board-specific prompt set)
3. **Action safety tests** (no unmapped/unsafe execution)
4. **UI stability tests** (display/input consistency, no lockups)
5. **Power/thermal sanity** for 30-minute stress loop

---

## Practical BOM/Product Notes
- Keep v1 centered on ESP32-S3 ecosystem to minimize firmware fragmentation.
- Treat STM32 as strategic expansion only after v1 shows adoption/revenue pull.
- Heavy tier should map to premium SKUs (bigger memory/display/input), not baseline units.
