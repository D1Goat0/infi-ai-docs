# INFI AI Cloud Base (v1)

Runnable v1 cloud-base package for INFI AI with:

- existing schema/eval utilities for cloud outputs
- SQLite database for device + firmware records
- migration/init + seed scripts
- validation checks for schema/duplicates/integrity
- basic query utilities via app entrypoint

## Layout

- `src/infi_ai_cloud_base/` — DB layer + query utilities
- `src/app.py` — app entrypoint for basic queries
- `migrations/001_init.sql` — SQLite schema init migration
- `data/` — seed datasets (devices, firmware releases, compatibility)
- `scripts/init_db.py` — initialize DB schema
- `scripts/seed_db.py` — seed/import initial dataset
- `scripts/validate_db.py` — quality checks for DB
- `schemas/`, `eval/`, `scripts/validate_outputs.py`, `scripts/validate_eval_set.py` — existing cloud output contracts + eval harness

## v1 data model

Tables:

1. `devices`
   - board metadata, tier, classification, notes
2. `firmware_releases`
   - firmware name/version/channel + intent + KB manifest versions
3. `firmware_device_compatibility`
   - mapping between devices and firmware, support level, bootloader bounds

All tables include timestamps (`created_at`, `updated_at`) and uniqueness constraints.

## Quick start

From `infi-ai-cloud-base/`:

```bash
# 1) initialize schema
python3 scripts/init_db.py

# 2) seed initial records
python3 scripts/seed_db.py

# 3) run DB validation checks
python3 scripts/validate_db.py

# 4) query devices
PYTHONPATH=src python3 src/app.py list-devices

# 5) query firmware for one board
PYTHONPATH=src python3 src/app.py firmware-for-device m5stickc-plus2
```

## Validate existing cloud output contracts

```bash
python3 scripts/validate_outputs.py --schema-dir schemas --inputs eval/sample_outputs.jsonl
python3 scripts/validate_eval_set.py --eval eval/weekly_eval_set.jsonl
```

## Notes

- Seed records are sourced from the INFI hardware compatibility/matrix docs in this repo and converted into structured starter data for v1.
- This v1 implementation is SQLite-first and dependency-light (stdlib only).
