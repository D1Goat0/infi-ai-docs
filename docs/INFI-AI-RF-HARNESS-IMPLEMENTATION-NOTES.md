# INFI AI RF Harness – Implementation Notes (pamir-infiltra)

_Last updated: 2026-02-12_

Purpose: turn the RF lane policy (RF‑L1/L2/L3) into **concrete, testable firmware artifacts** inside `repos/pamir-infiltra`.

Canon reference: `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md` §16.

---

## 1) Current repo reality (as of this note)

`repos/pamir-infiltra` RF code currently includes:
- `src/Modules/Functions/Rf/FindFq.cpp` + `FindFq.h`

This is not yet a harness; it’s a functional module.

---

## 2) Minimum viable RF harness (what to build)

### H1 — Concurrency test loop (required)
Goal: prove UI navigation + RF scanning + input bursts do not lock up / fragment heap.

**Behavior:**
1. Enter a test screen / mode.
2. Start RF scan loop (or mock if RF hardware absent).
3. Simulate user input bursts (button presses / text input events).
4. Navigate UI between 3 screens repeatedly.
5. Record:
   - watchdog resets
   - heap min/free drift
   - loop timing stats

### H2 — Latency capture (required)
Goal: quantify P95 latency regression vs baseline non‑RF.

**Metrics to log:**
- per-iteration processing time (ms)
- max observed time
- rolling P95 approximation (or bucket histogram)

### H3 — Crash/reset detection (required)
Goal: make “10 clean RF regression runs” objective.

**Signals:**
- explicit boot counter stored in RTC memory or NVS
- watchdog reset reason
- brownout reason

### H4 — Action mapping audit (required)
Goal: enforce “0 unmapped RF actions”.

This is primarily a **CI semantic validation** in the INFI AI dataset pipeline, but firmware should also expose a debug list of known RF intents/actions for spot checks.

---

## 3) Where this should live in pamir-infiltra

### Option A (preferred): `test/` + PlatformIO native tests
- `test/rf_harness/` (unit/integration style)
- Pros: CI friendly.
- Cons: hardware RF features may require HIL, not just native.

### Option B: `src/Modules/Diagnostics/` runtime harness
Add an on-device harness mode gated behind compile flag:
- `INFI_RF_HARNESS_ENABLED`

Suggested layout:
```
src/Modules/Diagnostics/RfHarness/
  RfHarness.cpp
  RfHarness.h
  RfMetrics.h
```

UI entrypoint can be a hidden diagnostic menu item or long-press gesture on supported devices.

---

## 4) RF lane mapping to harness requirements

- **RF‑L1 baseline** (scan + safe summaries): requires H1/H2/H3
- **RF‑L2 extended** (sub‑GHz abstraction + controlled transmit guards): requires H1/H2/H3 + explicit TX guard tests
- **RF‑L3 advanced** (concurrent RF + UI workflow orchestration): requires H1/H2/H3 plus multi-task scheduling stress (FreeRTOS) and recovery flows

---

## 5) Immediate next steps (actionable)

1. Add a diagnostic harness skeleton (Option B) with metrics struct + loop.
2. Implement heap/latency logging for ESP32 first (S3 recommended boards).
3. Wire a "10-run" script/procedure: flash → run harness → capture serial log → assert no resets.
4. Backfill CI semantic checks in the dataset layer once intent/action mapping exists.

---

## 6) Known blockers

- HIL automation depends on having physical boards connected (or at least a reproducible manual runbook).
- Some RF functionality will require board-specific wiring/pins (must be sourced from `Boards/*.json`).
