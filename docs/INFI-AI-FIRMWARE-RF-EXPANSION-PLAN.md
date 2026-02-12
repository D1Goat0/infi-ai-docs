# INFI AI Firmware + RF Expansion Plan (Repo-Linked)

_Last updated: 2026-02-12 00:52 EST_

Scope: expansion plan anchored to current repos:
- `repos/pamir-infiltra`
- `repos/neon-flash-esp`
- `repos/D1HackGear`
- `repos/D1HackGear0`

This plan is compliance-forward and focused on defensive validation, compatibility, and release quality.

---

## 1) Current Repo Reality Snapshot

## pamir-infiltra
- PlatformIO environments exist for:
  - `m5stick-c-plus-2`
  - `m5stick-c-plus-1-1`
  - `cardputer`
  - `lilygo-t-embed`
  - `lilygo-cc1101`
- Firmware already includes display/power bootstrapping and modular structure under `src/Modules/*`.
- Best candidate for: capability registry integration, manifest checks, and RF policy enforcement gates.

## neon-flash-esp
- React/Vite app, currently positioned as flashing/operator UX surface.
- Best candidate for: preflash compatibility checks + signed manifest verification UX + device coverage dashboard.

## D1HackGear
- Repo currently near-empty (metadata-only state).
- Risk: unclear ownership/scope can block roadmap assumptions.
- Action: define as tooling harness repo or archive if redundant.

## D1HackGear0
- `cfwFiles/SubGHz` contains extensive signal/sample corpus.
- Useful as data source for RF profile normalization + metadata indexing.
- Risk: mixed quality/provenance; requires strict allowlist and legal/compliance filtering before operational use.

---

## 2) RF Expansion Architecture

### A) Profile catalog pipeline
- Ingest sample files into normalized metadata index:
  - band/frequency
  - modulation/protocol
  - source/provenance
  - region constraints
  - validation status
- Output signed profile packs with explicit compatibility constraints.

### B) Firmware enforcement layer (pamir-infiltra)
- Enforce region-policy bundle before profile activation.
- Reject unknown board revisions and unsupported RF front-end combinations.
- Add reason-coded failures (`ERR_REGION_POLICY`, `ERR_BOARD_REV`, `ERR_PROFILE_SIG`).

### C) Operator gate layer (neon-flash-esp)
- Preflash validator panel:
  - device detected
  - board revision recognized
  - profile pack signature valid
  - region policy status
- Block flashing when gate fails; show remediation checklist.

---

## 3) Large Device Coverage Strategy (Execution)

### Coverage tiers
- **Tier 0:** current in-tree boards (M5StickC+/Cardputer/T-Embed variants)
- **Tier 1:** high-volume adjacent variants with similar MCU/radio topology
- **Tier 2:** new families after conformance harness maturity

### Descriptor-first contract
Every board entry requires:
- `board_id`, `mcu_family`, `rf_frontend`, `tier_default`, `tier_max`
- `flash_interface`, `recovery_mode`, `feature_flags[]`
- `memory_budget{}` and `policy_bundle_id`

### Promotion gate
No device moves tiers unless it passes:
1. clean builds x10
2. preflash validator green
3. firmware/profile signature checks green
4. recovery success >=95%
5. soak and regression tests pass

---

## 4) Concrete Repo Work Packages

## WP-1 (pamir-infiltra): capability + policy integration
- Add `board_registry` compatibility parser.
- Add profile manifest verifier.
- Add policy gate before RF profile load.
- Emit structured telemetry reasons for any blocked action.

## WP-2 (neon-flash-esp): operator safety UX
- Build compatibility checker UI.
- Add signed manifest upload/validation flow.
- Add release channel selector (`alpha/field/stable`) with warnings.

## WP-3 (D1HackGear0): corpus normalization
- Build metadata extraction script for `.sub` corpus.
- Mark unknown/unsafe provenance as non-deployable.
- Generate candidate profile manifest entries for reviewed samples.

## WP-4 (D1HackGear): repo decision
- Either initialize tooling harness (test fixture scripts + schema validators)
- or formally deprecate and move planned artifacts elsewhere.

---

## 5) Executable 6-Week RF/Device Plan

### Week 1-2
- Lock descriptor schema + policy bundle format.
- Implement preflash validator MVP in `neon-flash-esp`.
- Add manifest verification stubs in `pamir-infiltra`.

### Week 3-4
- Run Tier 0 conformance suite and baseline metrics.
- Ingest and classify D1HackGear0 corpus (metadata only, no blind promotion).
- Wire structured failure reasons end-to-end.

### Week 5-6
- Enable signed profile packs in controlled release channel.
- Validate rollback + recovery on all Tier 0 boards.
- Decide Tier 1 candidates using measured evidence.

---

## 6) Primary Risks

1. **Compliance/provenance risk** from mixed RF sample corpus.
2. **Repo ambiguity risk** for D1HackGear ownership/scope.
3. **Support burden risk** if device expansion outruns conformance automation.

Mitigation: descriptor-first gating, signed manifests, strict promotion criteria.
