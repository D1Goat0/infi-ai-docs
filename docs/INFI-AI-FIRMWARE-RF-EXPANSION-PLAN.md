# INFI AI Firmware + RF Expansion Plan (Repo-Linked)

_Last updated: 2026-02-12 02:35 EST_

Scope: expansion plan anchored to current repos:
- `repos/pamir-infiltra`
- `repos/neon-flash-esp`
- `repos/D1HackGear`
- `repos/D1HackGear0`

This plan is **compliance-forward** and focused on defensive validation, compatibility, and release quality.

---

## 1) Current Repo Reality Snapshot

### pamir-infiltra
- PlatformIO environments exist for:
  - `m5stick-c-plus-2`
  - `m5stick-c-plus-1-1`
  - `cardputer`
  - `lilygo-t-embed`
  - `lilygo-cc1101`
- Firmware already includes display/power bootstrapping and modular structure under `src/Modules/*`.
- Best candidate for: capability registry integration, manifest checks, and RF policy enforcement gates.

### neon-flash-esp
- React/Vite app, positioned as flashing/operator UX surface.
- Best candidate for: preflash compatibility checks + signed manifest verification UX + device coverage dashboard.

### D1HackGear
- Repo near-empty (metadata-only state).
- Risk: unclear ownership/scope can block roadmap assumptions.
- Action: decide: tooling harness repo vs archive.

### D1HackGear0
- `cfwFiles/SubGHz` contains extensive signal/sample corpus.
- Useful as data source for RF profile normalization + metadata indexing.
- Risk: mixed quality/provenance; requires strict allowlist + legal/compliance filtering before any deployable use.

---

## 2) RF Expansion Architecture (Safety-First)

### A) Profile catalog pipeline (metadata-first)
- Ingest sample files into a **normalized metadata index**:
  - band/frequency
  - modulation/protocol (when known)
  - region constraints
  - source/provenance
  - validation status
- Output **signed profile packs** with explicit compatibility constraints.

### B) Firmware enforcement layer (pamir-infiltra)
- Enforce region-policy bundle before profile activation.
- Reject unknown board revisions and unsupported RF front-end combinations.
- Enforce manifest signature check before mounting any profile pack.

Required reason-coded failures:
- `ERR_REGION_POLICY`
- `ERR_BOARD_REV`
- `ERR_PROFILE_SIG`
- `ERR_PROFILE_SCHEMA`
- `ERR_RF_FRONTEND`

### C) Operator gate layer (neon-flash-esp)
- Preflash validator panel:
  - device detected
  - board revision recognized
  - profile pack signature valid
  - region policy status
- Block flashing when gate fails; show remediation checklist.

### D) Reason-code matrix (UI ↔ firmware)

Goal: identical failure semantics across `neon-flash-esp` and `pamir-infiltra` so support and telemetry are consistent.

| Gate | UI (preflash) behavior | Firmware runtime behavior | Reason code |
|---|---|---|---|
| Unknown device / VID/PID mismatch | Block; show supported list | Refuse to start flashing | `ERR_DEVICE_UNKNOWN` |
| Unsupported board revision | Block; prompt to select correct profile | Boot into safe-mode; refuse RF/profile mount | `ERR_BOARD_REV` |
| Missing policy bundle | Block; require policy download/select | Refuse RF activation; run non-RF lane only | `ERR_REGION_POLICY` |
| Profile pack signature invalid | Block; require signed pack | Reject mount; emit telemetry | `ERR_PROFILE_SIG` |
| Profile schema version unknown | Block; require updated tool | Reject parse; emit telemetry | `ERR_PROFILE_SCHEMA` |
| RF frontend mismatch (e.g., CC1101 not present) | Warn+block (alpha override only) | Hard block profile load | `ERR_RF_FRONTEND` |

Support note: UI should display the exact reason code + short remediation hint; firmware should log the same code in structured telemetry.

---

## 3) Descriptor-First Device Coverage Strategy (Execution)

### Coverage tiers
- **Tier 0:** current in-tree boards (M5StickC+/Cardputer/T-Embed variants)
- **Tier 1:** high-volume adjacent variants with similar MCU/radio topology
- **Tier 2:** new families after conformance harness maturity

### Descriptor contract (required fields)
Every board entry requires:
- `board_id`, `mcu_family`, `rf_frontend`, `tier_default`, `tier_max`
- `flash_interface`, `recovery_mode`, `feature_flags[]`
- `memory_budget{}` and `policy_bundle_id`
- `board_revision` (or revision range) + vendor identity fields

Example `board_descriptor.json` (v0 skeleton):

```json
{
  "board_id": "m5stick-c-plus-2",
  "vendor": "M5Stack",
  "mcu_family": "ESP32-S3",
  "rf_frontend": {
    "wifi": true,
    "ble": true,
    "subghz": false,
    "chip": "esp32-s3-integrated"
  },
  "tier_default": "Medium",
  "tier_max": "Heavy",
  "flash_interface": ["usb-cdc", "uart"],
  "recovery_mode": ["uart-boot", "safe-mode"],
  "feature_flags": ["display", "battery", "buttons"],
  "memory_budget": {
    "flash_mb_min": 8,
    "psram": "optional"
  },
  "policy_bundle_id": "US-DEFAULT",
  "board_revision": {
    "kind": "range",
    "min": "1.0",
    "max": "2.x"
  }
}
```

### Promotion gate (no exceptions)
No device moves tiers unless it passes:
1. clean builds x10
2. preflash validator green
3. firmware/profile signature checks green
4. recovery success >=95%
5. soak and regression tests pass

---

## 4) Profile Pack + Manifest (Spec v0)

### 4.1 Pack format
- `*.infi-rfpack` (zip/tar container)
  - `/manifest.json`
  - `/profiles/<id>/*` (metadata + optional raw samples)
  - `/SIGNATURE.ed25519` (signature over canonical `manifest.json` bytes)

### 4.2 `manifest.json` example (minimal)

```json
{
  "pack_id": "rfpack-2026-02-12-a",
  "created_at": "2026-02-12T07:35:00Z",
  "policy_bundle_id": "US-DEFAULT",
  "profiles": [
    {
      "id": "subghz_sample_001",
      "band_hz": 315000000,
      "region": ["US"],
      "provenance": {
        "source_repo": "D1HackGear0",
        "path": "cfwFiles/SubGHz/...",
        "review": "metadata-only",
        "reviewed_by": "<name>",
        "reviewed_at": "<iso>"
      },
      "status": "non_deployable"
    }
  ]
}
```

### 4.3 Policy behavior
- **Default stance:** non-deployable unless explicitly reviewed + signed for a specific release channel.
- Firmware must reject:
  - missing signature
  - unknown schema version
  - policy bundle mismatch

---

## 5) Concrete Repo Work Packages

### WP-1 (pamir-infiltra): capability + policy integration
- Add `board_registry` compatibility parser.
- Add profile manifest verifier (schema + signature stubs).
- Add policy gate before RF profile load.
- Emit structured telemetry reasons for any blocked action.

### WP-2 (neon-flash-esp): operator safety UX
- Build compatibility checker UI.
- Add signed manifest upload/validation flow.
- Add release channel selector (`alpha/field/stable`) with warnings.

### WP-3 (D1HackGear0): corpus normalization
- Build metadata extraction script for `.sub` corpus.
- Mark unknown/unsafe provenance as non-deployable.
- Generate candidate manifest entries for reviewed samples.

### WP-4 (D1HackGear): repo decision
- Either initialize tooling harness (test fixture scripts + schema validators)
- or formally deprecate and move planned artifacts elsewhere.

---

## 6) Executable 6-Week RF/Device Plan

### Week 1-2
- Lock descriptor schema + policy bundle format.
- Implement preflash validator MVP in `neon-flash-esp`.
- Add manifest verification stubs in `pamir-infiltra`.

### Week 3-4
- Run Tier 0 conformance suite and baseline metrics.
- Ingest and classify D1HackGear0 corpus (metadata only; no blind promotion).
- Wire structured failure reasons end-to-end.

### Week 5-6
- Enable signed profile packs in controlled release channel.
- Validate rollback + recovery on all Tier 0 boards.
- Decide Tier 1 candidates using measured evidence.

---

## 7) Primary Risks

1. **Compliance/provenance risk** from mixed RF sample corpus.
2. **Repo ambiguity risk** for D1HackGear ownership/scope.
3. **Support burden risk** if device expansion outruns conformance automation.

Mitigation: descriptor-first gating, signed manifests, strict promotion criteria, metadata-first ingestion.

---

## 8) Canonical Repo Paths + Ownership (Proposal)

The goal is to prevent “spec drift” by pinning one canonical path per artifact.

### 8.1 `pamir-infiltra` (firmware)

**Board descriptors (source of truth):**
- `repos/pamir-infiltra/Boards/descriptors/*.board.json`

**Validation + schema:**
- `repos/pamir-infiltra/Tools/schemas/board_descriptor.schema.json`
- `repos/pamir-infiltra/Tools/validate_board_descriptors.py` (or TS/Node equivalent)

**RF profile pack handling:**
- `repos/pamir-infiltra/src/Modules/RF/ProfilePacks/` (parser + verifier)
- `repos/pamir-infiltra/src/Modules/RF/Policy/` (region-policy enforcement)

**Reason codes list (single canonical header):**
- `repos/pamir-infiltra/src/Modules/Core/ReasonCodes.h`

### 8.2 `neon-flash-esp` (operator UI)

**Reason codes mirror:**
- `repos/neon-flash-esp/src/reasonCodes.ts` (generated from canonical list)

**Preflash validator:**
- `repos/neon-flash-esp/src/features/preflight/` (gating UI)

### 8.3 Key management decision (must be explicit)

Before any signed pack ships, decide one of:
- **Single signing key** (fast, higher blast radius)
- **Per-channel keys** (`alpha/field/stable`) (slower, safer)

Minimum requirement: document signing authority + rotation policy + revocation workflow.
