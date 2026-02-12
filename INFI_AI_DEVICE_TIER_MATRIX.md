> Canonical status (2026-02-12): This matrix remains a quick-reference summary. Deep rationale, family-level constraints (ESP32 S2/S3/C3/C6/H2/P4 + STM32 families), and objective promotion gates are defined in:
> - `docs/INFI-AI-HARDWARE-COMPATIBILITY-DEEP-DIVE.md`
> - `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md`

# INFI AI Device Tier Matrix (ESP32 + STM32)

_Last updated: 2026-02-12 (deep research alignment)_

This matrix is the policy reference for classifying MCU/board support as **Recommended**, **Beta**, or **Not Recommended** for INFI AI.

Canonical deep detail: `docs/INFI-AI-HARDWARE-COMPATIBILITY-DEEP-DIVE.md`.

---

## 1) Classification legend

- **Recommended:** approved for production support in current release lane.
- **Beta:** supported in controlled testing with explicit caveats and promotion gates.
- **Not Recommended:** outside current support scope due to risk, cost, or capability mismatch.

---

## 2) Tier definitions

- **Tiny:** strict deterministic keyword intents + compact KB.
- **Medium:** deterministic keyword + bounded alias expansion + expanded troubleshooting cards.
- **Heavy:** richest embedded deterministic workflows, larger local KB, optional keyword voice path where hardware allows.

---

## 3) ESP32 family tier fit

| Family | Typical fit | Status | Rationale |
|---|---|---|---|
| ESP32 classic | Tiny/Medium | Beta | broad install base but high board variance and tighter memory partitions on many SKUs |
| ESP32-S2 | Tiny/Medium niche | Not Recommended (v1 default) | Wi-Fi-only and single-core limit current assumptions |
| ESP32-S3 | Medium/Heavy | Recommended | best practical balance for UI + deterministic AI runtime + peripherals |
| ESP32-C3 | Tiny | Beta | cost-efficient deterministic lane; lower headroom than S3 |
| ESP32-C6 | Tiny future | Not Recommended (v1 default) | promising radios, but current stack maturity not yet primary |
| ESP32-H2 | specialized tiny wireless node | Not Recommended | no Wi-Fi, mismatched with current INFI baseline workflows |
| ESP32-P4 | Heavy R&D | Beta (research only) | high compute potential but no integrated radio; requires companion architecture |

---

## 4) STM32 family practical fit

| STM32 line | Typical fit | Status | Rationale |
|---|---|---|---|
| F4 | Tiny/Medium | Beta pilot | best first portability target from ESP32-first codebase |
| F7 | Medium | Beta selective | stronger performance, moderate porting overhead |
| G4 | Tiny/Medium specialty | Not Recommended (v1 default) | mixed-signal strengths not core to first-wave INFI goals |
| L5 | Tiny/Medium secure low-power | Beta strategic | secure low-power lane, but not immediate mainstream target |
| U5 | Tiny/Medium secure low-power | Beta strategic | strong long-life secure profile; staged expansion |
| H5 | Medium/Heavy secure | Beta strategic | premium secure line for future high-assurance SKUs |
| H7 | Medium/Heavy high-performance | Beta selective | strong technical fit but higher complexity/cost |
| WB | Tiny/Medium wireless niche | Not Recommended (v1 default) | product-specific wireless role, not baseline assistant target |

---

## 5) Board-level matrix (current + near-term)

| Board | MCU | Tier fit | Classification | Notes |
|---|---|---|---|---|
| M5StickC Plus 2 | ESP32-S3 | Medium | Recommended | balanced baseline for production assistant features |
| M5Cardputer | ESP32-S3 | Medium/Heavy | Recommended | keyboard/display makes advanced local workflows practical |
| LilyGO T-Embed | ESP32-S3 | Medium/Heavy | Recommended | 16 MB class and richer hardware support heavy experimentation |
| M5StickC Plus 1.1 | ESP32 classic | Tiny/Medium | Beta | 4 MB class constraints require tighter package limits |
| LilyGO T-Embed CC1101 | ESP32-S3 | Medium/Heavy | Beta | RF/audio/peripheral complexity requires dedicated regression lane |
| NUCLEO-F446RE | STM32F4 | Tiny/Medium | Beta pilot | first STM32 portability target |
| Generic ESP32 devkits | varies | Tiny | Not Recommended | hardware variance too high for startup support envelope |

---

## 6) Objective promotion gates

### Beta -> Recommended requires all of:
1. 10 consecutive reproducible CI builds.
2. >=98% board-specific routing accuracy on validated prompts.
3. Zero unmapped action execution in regression.
4. 30-minute mixed-load stress run with no lockups.
5. Complete board profile docs and known-issues guide.

### Recommended -> Demotion triggers
- safety regression or unmapped action incident
- repeated CI instability (>2 release cycles)
- unresolved critical support burden increase

---

## 7) Tomorrow-morning matrix actions

1. Freeze the 3-board Recommended set.
2. Publish explicit Beta caveats for CC1101 and STM32 pilot lanes.
3. Add board-scoring sheet (0-100) and baseline each candidate.
4. Enforce promotion gates in release checklist before any status change.
