# INFI AI Device Coverage Scoring Worksheet (0–100)

_Last updated: 2026-02-13_

Purpose: make board support decisions numeric, auditable, and tied to support cost + monetization leverage.

This is the practical worksheet that implements the scoring policy defined in:
- `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md` (§15.1)
- `INFI_AI_DEVICE_TIER_MATRIX.md`

---

## 1) Scoring dimensions (weights)

Score each dimension **0–max**. Total = 100.

1. **Demand / install-base signal (0–20)**
   - Evidence: sales volume, community volume, internal usage, repeat questions.
2. **Capability fit (0–25)**
   - UI/inputs, RF peripherals, memory headroom vs target tier, stability envelope.
3. **Variance risk (0–15)**
   - BOM drift, clones, vendor revisions, “same name different board” risk.
4. **Validation cost (0–15)**
   - HIL availability, regression time, RF harness effort, number of envs.
5. **Support burden forecast (0–15)**
   - Docs load, known failure modes, expected troubleshooting intensity.
6. **Monetization leverage (0–10)**
   - Does it unlock Pro/Team value, reduce churn, improve attach rate to hardware?

---

## 2) Thresholds and decisions

**Beta entry:**
- Total score **>= 70**
- AND no single dimension < **5**
- AND board has a defined `board_id` + capability manifest draft (even if incomplete)

**Recommended eligibility (not automatic):**
- Total score **>= 80**
- AND objective promotion gates passed (CI streak, routing score, 0 unmapped actions, soak, OTA+rollback, docs)

**Not recommended (v1 default):**
- Total score < 70 OR variance/support cost too high for current team capacity.

---

## 3) Worksheet template

Copy/paste per board:

- **Board:**
- **MCU:**
- **Target tier:** (Tiny / Medium / Heavy)
- **Proposed classification:** (Recommended / Beta / Not Recommended)

Scores:
- Demand (0–20):
- Capability fit (0–25):
- Variance risk (0–15):
- Validation cost (0–15):
- Support burden (0–15):
- Monetization leverage (0–10):

**Total (0–100):**

Notes:
- Evidence links:
- Known constraints:
- Required harness/tests:
- Promotion gate blockers:

---

## 4) Seed scores (v1 baseline candidates)

These are **first-pass** numbers to force explicit discussion; adjust once actual telemetry/sales evidence is available.

### 4.1 M5StickC Plus 2 (ESP32-S3)
- Demand: 17/20
- Capability fit: 21/25
- Variance risk: 10/15
- Validation cost: 11/15
- Support burden: 12/15
- Monetization leverage: 8/10
**Total:** 79/100
Notes: close to 80; in practice treated as Recommended due to being one of the frozen v1 boards.

### 4.2 M5Cardputer (ESP32-S3)
- Demand: 16/20
- Capability fit: 23/25
- Variance risk: 10/15
- Validation cost: 11/15
- Support burden: 12/15
- Monetization leverage: 9/10
**Total:** 81/100
Notes: keyboard/display drives real “assistant” UX; strong Pro conversion lever.

### 4.3 LilyGO T-Embed (ESP32-S3)
- Demand: 15/20
- Capability fit: 22/25
- Variance risk: 9/15
- Validation cost: 10/15
- Support burden: 11/15
- Monetization leverage: 8/10
**Total:** 75/100
Notes: keep Recommended due to v1 policy, but watch variance + support burden; require strict manifest pinning.

### 4.4 LilyGO T-Embed CC1101 (ESP32-S3)
- Demand: 13/20
- Capability fit: 22/25
- Variance risk: 8/15
- Validation cost: 8/15
- Support burden: 9/15
- Monetization leverage: 9/10
**Total:** 69/100
Notes: monetization leverage is high, but RF harness + compliance gating increase validation cost.
Decision: treat as a **Strategic monetization exception** (see §5) and keep in **Beta** only if (a) validation is funded (Pro+/Team/OEM cohort) and (b) RF-L2 gates are green. Otherwise demote to Not Recommended for v1.

### 4.5 M5StickC Plus 1.1 (ESP32 classic)
- Demand: 14/20
- Capability fit: 14/25
- Variance risk: 7/15
- Validation cost: 10/15
- Support burden: 9/15
- Monetization leverage: 6/10
**Total:** 60/100
Notes: only worth it if install-base is real and Tiny pack is extremely tight; otherwise support drag.

### 4.6 NUCLEO-F446RE (STM32F4)
- Demand: 6/20
- Capability fit: 15/25
- Variance risk: 14/15
- Validation cost: 8/15
- Support burden: 9/15
- Monetization leverage: 4/10
**Total:** 56/100
Notes: low demand but very low variance and high strategic value as a portability pilot; treat as “Beta pilot” even if score is low (explicit exception). Document this exception whenever used.

---

## 5) Exception policy (allowed, but must be explicit)

Sometimes a board is worth pursuing even if the score is low.

Allowed exception classes:
1. **Portability pilot** (e.g., NUCLEO reference boards) where variance is low and purpose is engineering leverage.
2. **Strategic monetization** where a board unlocks a paid tier, but only if validation cost is funded (Team/OEM) and gates are tightened.

Exception requires a written Decision Log entry in `docs/INFI-AI-DECISION-LOG.md`:
- why this exception is worth it
- what it will replace/defer (opportunity cost)
- what gate would cause cancellation
