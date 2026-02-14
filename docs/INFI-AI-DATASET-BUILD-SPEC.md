# INFI AI Dataset Build Specification

_Last updated: 2026-02-12 (deep research pass)_

This specification defines how INFI AI datasets are authored, validated, normalized, packaged, signed, released, and rolled back for Tiny/Medium/Heavy embedded tiers and cloud analytics.

---

## 1) Scope and Design Principles

1. **Determinism first:** dataset transforms must be reproducible.
2. **Provenance always:** every actionable datum has source metadata.
3. **Safety-linked:** intent/action records must enforce capability and safety contracts.
4. **Tier-aware outputs:** tiny/medium/heavy packages are generated from one canonical source.
5. **No secrets:** dataset repos contain zero tokens, credentials, or private keys.

---

## 2) Target Repository Layout (v1 baseline)

This is the **intended** canonical layout. If your current dataset repo is missing any of these files, treat that as a build-blocking gap for the first public dataset release.

```text
infi-ai-data/
  schemas/
    devices.schema.json
    pinouts.schema.json
    firmware_capabilities.schema.json
    intent_map.schema.json
    knowledge_cards.schema.json
    ir_catalog.schema.json
    board_registry.schema.json
    release_manifest.schema.json
  src/
    devices.json
    pinouts.json
    firmware_capabilities.json
    intent_map.json
    knowledge_cards.json
    ir_catalog.json
    board_registry.json
  pipeline/
    normalize/
    validate/
    package/
    sign/
  build/
    normalized/
    tiered/
    packages/
      infi_kb_tiny.binpack
      infi_kb_medium.binpack
      infi_kb_heavy.binpack
      manifest.json
      manifest.sig
  reports/
    validation-report.json
    semantic-report.json
    dedupe-report.json
    size-report.json
    safety-report.json
```

---

## 3) Required Data Objects and Core Fields

### 3.1 `devices.json`
Required: `id`, `name`, `vendor`, `family`, `mcu`, `flash_mb`, `ram_kb`, `psram_mb`, `wireless[]`, `tier_support[]`, `status`, `source{}`.

### 3.2 `pinouts.json`
Required: `device_id`, `pin`, `functions[]`, `voltage`, `reserved`, `conflicts[]`, `notes`.

### 3.3 `firmware_capabilities.json`
Required: `firmware`, `version`, `board_id`, `features[]`, `constraints[]`, `source_commit`, `generated_at`.

### 3.4 `intent_map.json`
Required: `intent_id`, `aliases[]`, `safety_class`, `required_capability`, `action{}`, `tier_support[]`, `confidence_threshold{}`.

### 3.5 `knowledge_cards.json`
Required: `card_id`, `topic`, `question`, `answer`, `device_scope[]`, `tier_support[]`, `confidence`, `source{}`.

### 3.6 `ir_catalog.json`
Required: `category`, `vendor`, `model`, `protocol`, `code_ref`, `source{}`.

### 3.7 `board_registry.json` (new mandatory object)
Required: `board_id`, `mcu_family`, `tier_default`, `tier_max`, `feature_flags[]`, `memory_budget{}`, `ota_channel`, `status`.

---

## 4) Validation Taxonomy (Hard-Fail vs Soft-Fail)

### 4.1 Hard-fail checks (build blocking)
- JSON schema violation in any required source.
- Duplicate `intent_id` or missing `intent_id`.
- `intent_map.required_capability` not present in board capability definitions.
- Action references unknown firmware command surface.
- Missing provenance in records used by routing/knowledge outputs.
- Package size exceeds tier budget.
- Signature/manifest generation failure.

### 4.2 Soft-fail checks (warn + report)
- Source staleness threshold exceeded.
- Confidence below configurable threshold on non-critical cards.
- Missing optional UX metadata.

---

## 5) Semantic Integrity Rules

1. Every `intent_id` must map to one action contract and one safety class.
2. Every action contract must map to known command groups in target firmware version.
3. Every board in recommended set must have complete `board_registry` entry.
4. Every recommended board must have package compatibility tuple coverage.
5. `tier_support` must be monotonic by capability (Tiny subset of Medium subset of Heavy unless explicitly exempted).

---

## 6) Deduplication and Confidence Arbitration

### 6.1 Entity keys
- Device key: `vendor + family + name + mcu`
- Pin key: `device_id + pin`
- Intent key: `intent_id`
- Card key: `card_id` (or normalized `question_hash` fallback)

### 6.2 Conflict resolver order
1. Internal validated sources > external unverified sources.
2. Higher confidence > lower confidence.
3. Newer timestamp > older timestamp when confidence ties.
4. If unresolved high-confidence conflict remains -> `needs_review=true` and block publication for affected record.

---

## 7) Tier Packaging Rules

| Rule Area | Tiny | Medium | Heavy |
|---|---:|---:|---:|
| Intent alias count | minimal | moderate | expanded |
| Card depth | procedural only | + troubleshooting | + deep troubleshooting graph |
| Max package target | strict | moderate | larger (bounded) |
| Response templates | short | medium | extended (still deterministic) |

### 7.1 Packaging contract
Each package must include:
- header/version block
- sorted record index
- compressed payload sections
- SHA256 checksum
- compatibility tuple (`firmware`, `schema`, `intent_schema`)

### 7.2 Manifest minimum
- `build_id`
- `schema_version`
- `intent_schema_version`
- `firmware_compat[]`
- artifacts list with `sha256`, `size`, `tier`
- `signature_algo`

---

## 8) CI/CD Pipeline (Required Jobs)

1. `lint-json`
2. `schema-validate`
3. `semantic-validate`
4. `normalize-dedupe`
5. `tier-prune`
6. `package-binpack`
7. `manifest-sign`
8. `compatibility-check`
9. `publish-artifacts`

**Branch policy:** release tags only from fully green pipeline with signed manifest.

---

## 9) Firmware Integration Contract (Infiltra Workflow)

For `repos/pamir-infiltra` integration:
- board env names and `Boards/*.json` remain the capability anchor.
- generated packages are consumed by firmware build/release process.
- runtime must validate compatibility tuple before mounting package.
- if mismatch occurs, fail closed and present concise remediation.

### 9.1 Required runtime behaviors
- verify `manifest.sig` and SHA256 before load.
- reject unsupported tier package for board tier max.
- log machine-readable reason codes (`ERR_SIG`, `ERR_COMPAT`, `ERR_SIZE`, `ERR_SCHEMA`).

---

## 10) Security and Privacy Controls

- Never commit secrets to dataset sources.
- Strip/avoid PII from community submissions.
- Keep provenance references but redact private URLs when needed.
- Sign release manifests with offline-managed keys.
- Maintain immutable release logs for audit.

---

## 11) Quality Gates and Release Acceptance

A dataset release is valid only if all are true:
1. Schemas pass with zero hard-fail.
2. Semantic integrity checks pass.
3. Tier package size budgets are respected.
4. Manifest signature and checksums verify.
5. HIL smoke tests pass on all recommended boards using newly generated artifacts.
6. Safety report confirms no orphan intents or unmapped actions.

---

## 12) Dataset Build Metrics to Track

- validation pass rate
- semantic conflict count
- dedupe merge ratio
- package size trend by tier
- stale-source ratio
- rollback frequency by artifact version

---

## 13) Monetization Linkage

| Data Capability | Product Outcome | Commercial Effect |
|---|---|---|
| Cleaner intent map | fewer failures | higher Pro retention |
| Better board registry | clearer compatibility promises | lower support cost |
| Faster packaging cadence | quicker fixes/new workflows | stronger upgrade conversion |
| Signed reproducible releases | trust for teams/OEM | premium plan credibility |

---

## 14) Immediate Implementation Checklist

- [ ] If not already present, add `board_registry` schema and canonical source file (required before first public dataset release).
- [ ] Implement semantic validator for capability/action contracts.
- [ ] Add signature verification integration test.
- [ ] Define package budget thresholds per tier and enforce in CI.
- [ ] Publish machine-readable reason codes for runtime load failures.
- [ ] Create release report template including safety, size, and compatibility status.

---

## 15) Cloud Model-Base Evaluation Dataset Extensions

To reduce planning-quality drift, maintain a cloud evaluation pack alongside embedded artifacts.

### 15.1 Optional cloud evaluation objects
- `cloud_prompt_registry.json` (prompt_id, task_class, schema_contract, version_hash)
- `cloud_eval_set.json` (scenario_id, inputs, expected_schema, scoring_rubric)
- `cloud_eval_runs.json` (run_id, model_class, pass_fail, drift_flags, timestamp)

### 15.2 Publication checks for cloud pack
- prompt registry references only approved task classes (`strategy`, `triage`, `digest`)
- eval set covers at least one scenario per board family and risk tier
- schema conformance rate meets release threshold (default >=95%)
- severe drift flags block promotion until reviewed

### 15.3 Value
This keeps cloud recommendations auditable and prevents silent degradation in roadmap and triage output quality.

---

## 16) Cross-links

- Master guide: `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md`
- Hardware fit: `docs/INFI-AI-HARDWARE-COMPATIBILITY-DEEP-DIVE.md`
- Operating rhythm: `docs/INFI-AI-ROADMAP-AND-OPERATING-RHYTHM.md`
- Integration baseline: `INFI_AI_INTEGRATION_NOTES.md`
