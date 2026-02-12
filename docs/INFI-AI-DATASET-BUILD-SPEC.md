# INFI AI Dataset Build Specification

_Last updated: 2026-02-12_

Purpose: define exactly how INFI AI datasets are authored, validated, transformed, and packaged for embedded tiers and cloud services.

## 1) Directory Layout (canonical)

```text
infi-ai-data/
  schemas/
    devices.schema.json
    pinouts.schema.json
    firmware_capabilities.schema.json
    intent_map.schema.json
    knowledge_cards.schema.json
    ir_catalog.schema.json
  src/
    devices.json
    pinouts.json
    firmware_capabilities.json
    intent_map.json
    knowledge_cards.json
    ir_catalog.json
  build/
    normalized/
    tiered/
    packages/
      infi_kb_tiny.binpack
      infi_kb_medium.binpack
      infi_kb_heavy.binpack
      manifest.json
  reports/
    validation-report.json
    dedupe-report.json
    size-report.json
```

---

## 2) Dataset Schemas (minimum required fields)

## 2.1 `devices.json`
```json
{
  "id": "m5stickc_plus2",
  "name": "M5StickC Plus 2",
  "vendor": "M5Stack",
  "family": "M5Stick",
  "mcu": "ESP32-S3",
  "flash_mb": 8,
  "ram_kb": 512,
  "psram_mb": 0,
  "wireless": ["wifi_2_4", "ble"],
  "tier_support": ["medium"],
  "status": "recommended",
  "source": {"type": "vendor_doc", "ref": "...", "updated_at": "2026-02-12"}
}
```

## 2.2 `pinouts.json`
```json
{
  "device_id": "m5stickc_plus2",
  "pin": "GPIO18",
  "functions": ["SPI_SCK", "Display"],
  "voltage": "3v3",
  "reserved": true,
  "conflicts": ["shared_with_sd"],
  "notes": "Do not remap in default firmware profile"
}
```

## 2.3 `firmware_capabilities.json`
```json
{
  "firmware": "infiltra",
  "version": "0.0.0",
  "board_id": "m5stickc_plus2",
  "features": ["wifi_scan", "ble_scan", "ir_send"],
  "constraints": ["cc1101_not_present"],
  "source_commit": "<git-sha>"
}
```

## 2.4 `intent_map.json`
```json
{
  "intent_id": "wifi.scan.start",
  "aliases": ["scan wifi", "start wifi scan"],
  "safety_class": "S1",
  "required_capability": "wifi_scan",
  "action": {"type": "firmware_command", "value": "WIFI_SCAN_START"},
  "tier_support": ["tiny", "medium", "heavy"],
  "confidence_threshold": {"tiny": 1.0, "medium": 0.9, "heavy": 0.85}
}
```

## 2.5 `knowledge_cards.json`
```json
{
  "card_id": "card.m5stickc2.wifi.scan",
  "topic": "workflow",
  "question": "How do I run a Wi-Fi scan?",
  "answer": "Open scan menu, select Wi-Fi scan, wait for list...",
  "device_scope": ["m5stickc_plus2", "m5cardputer"],
  "tier_support": ["tiny", "medium", "heavy"],
  "confidence": 0.95,
  "source": {"type": "internal_doc", "ref": "runbook-v1"}
}
```

## 2.6 `ir_catalog.json`
```json
{
  "category": "tv",
  "vendor": "example",
  "model": "x100",
  "protocol": "NEC",
  "code_ref": "irdb://...",
  "source": {"type": "ir_dataset", "ref": "..."}
}
```

---

## 3) Ingestion Specification

## 3.1 Allowed source classes
- vendor datasheets/docs
- firmware repo metadata
- board definitions
- curated internal runbooks
- vetted community submissions (reviewed)

## 3.2 Ingestion stages
1. **Collect:** fetch candidate records into raw staging.
2. **Parse:** convert to canonical JSON shape.
3. **Validate:** schema + semantic constraints.
4. **Normalize:** names, units, identifiers, enums.
5. **Deduplicate:** merge same-entity records by confidence/provenance policy.
6. **Publish:** write normalized outputs and build artifacts.

---

## 4) Validation Rules (hard fail vs soft fail)

## 4.1 Hard fail (must block build)
- schema violation in any required dataset
- missing `intent_id` or duplicate `intent_id`
- intent mapped to unknown capability
- action map references unsupported command
- required provenance missing

## 4.2 Soft fail (warn + report)
- stale source timestamps
- low-confidence cards (< configured threshold)
- optional metadata missing

---

## 5) Deduplication and Confidence Policy

## 5.1 Entity keys
- device key: `vendor + family + name + mcu`
- pin key: `device_id + pin`
- intent key: `intent_id`
- card key: `card_id` (or normalized question hash fallback)

## 5.2 Conflict resolution
1. Internal validated source beats external unverified source.
2. Newer timestamp beats older if confidence equal.
3. If conflicting high-confidence records remain, mark `needs_review=true` and block publication for affected entity.

---

## 6) Tier Packaging Rules

## 6.1 Pruning strategy
- Tiny: highest-frequency intents/cards only, strict whitelist.
- Medium: add aliases and expanded cards.
- Heavy: include troubleshooting and deeper references.

## 6.2 Packaging contract
Each package must include:
- header/version block
- record index
- compressed payload segments
- checksum
- compatibility tuple

## 6.3 Manifest example
```json
{
  "build_id": "2026-02-12T00:00:00Z",
  "schema_version": "1.0.0",
  "intent_schema_version": "1.0.0",
  "firmware_compat": ["0.9.x", "0.10.x"],
  "artifacts": [
    {"name": "infi_kb_tiny.binpack", "sha256": "...", "size": 184320},
    {"name": "infi_kb_medium.binpack", "sha256": "...", "size": 512000},
    {"name": "infi_kb_heavy.binpack", "sha256": "...", "size": 1310720}
  ]
}
```

---

## 7) CI/CD Build Pipeline (required jobs)

1. `lint-json`
2. `schema-validate`
3. `semantic-validate`
4. `normalize-dedupe`
5. `tier-prune`
6. `package-binpack`
7. `manifest-sign`
8. `publish-artifacts`

Build fails if any hard-fail rule trips.

---

## 8) Security and Data Hygiene

- Never store API keys or secrets in dataset repo.
- Strip PII from community-derived records.
- Keep source provenance but redact private links if required.
- Sign released manifest and verify on device prior to load.

---

## 9) Acceptance Criteria

A dataset release is valid when:
1. All schemas pass.
2. Semantic checks pass with zero hard failures.
3. Package sizes are within tier budgets.
4. Manifest verifies and compatibility tuple matches target firmware.
5. Smoke tests on recommended boards pass with published artifacts.

---

## 10) Tomorrow-Morning Data Actions

1. Create schema files with required fields from this spec.
2. Seed first normalized datasets for top 3 recommended boards.
3. Implement duplicate detection and hard-fail validator logic.
4. Generate first tiny package and test on M5StickC Plus 2.
5. Add CI job sequence and publish validation report artifacts.

---

## 11) Cross-links

- Master guide: `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md`
- Hardware strategy: `docs/INFI-AI-HARDWARE-COMPATIBILITY-DEEP-DIVE.md`
- Operating rhythm: `docs/INFI-AI-ROADMAP-AND-OPERATING-RHYTHM.md`
