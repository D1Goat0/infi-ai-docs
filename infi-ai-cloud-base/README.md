# INFI AI Cloud Base (v0)

This folder is the **seed** for INFI AI cloud-plane discipline:

- **Task routing** by class (strategy / triage / digest)
- **Schemas** for all machine-consumed outputs
- **Eval harness** so model changes are measurable (not vibes)

This is intentionally minimal and dependency-light so it can run on the Pi and in CI.

## Layout

- `schemas/` — JSON Schemas for cloud outputs
- `eval/` — eval set (JSONL) + example golden outputs
- `scripts/` — validation + scoring utilities

## Run

Validate a JSONL file of model outputs:

```bash
python3 scripts/validate_outputs.py --schema-dir schemas --inputs eval/sample_outputs.jsonl
```

Validate the eval set shape:

```bash
python3 scripts/validate_eval_set.py --eval eval/weekly_eval_set.jsonl
```

## Output contracts (minimum)

- **Strategy**: `assumptions[]`, `risks[]`, `decision_points[]`, `next_actions[]`
- **Triage**: `severity`, `confidence`, `affected_boards[]`, `owner`, `recommended_fix`
- **Digest**: `sources_count`, `highlights[]`, `stale_source_warning`, `next_actions[]`

These mirror the canon in `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md`.
