#!/usr/bin/env python3
"""Validate model outputs (JSONL) against INFI AI JSON Schemas.

Dependency-light implementation:
- Uses the optional `jsonschema` package if installed.
- Otherwise falls back to minimal required-field checks based on schema JSON.

JSONL format:
  {"id": "<eval-id>", "output": { ... }}
"""

import argparse
import json
import os
import sys


def _load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _minimal_validate(schema_obj, output_obj):
    # Minimal: required keys exist + additionalProperties false enforcement (shallow)
    required = schema_obj.get("required", [])
    props = schema_obj.get("properties", {})
    additional = schema_obj.get("additionalProperties", True)

    errors = []
    for k in required:
        if k not in output_obj:
            errors.append(f"missing required field '{k}'")

    if additional is False:
        for k in output_obj.keys():
            if k not in props:
                errors.append(f"unexpected field '{k}'")

    return errors


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--schema-dir", required=True)
    ap.add_argument("--inputs", required=True, help="JSONL outputs")
    ap.add_argument("--map", default=None, help="Optional eval JSONL mapping id->schema")
    args = ap.parse_args()

    id_to_schema = {}
    if args.map:
        with open(args.map, "r", encoding="utf-8") as f:
            for i, line in enumerate(f, start=1):
                line = line.strip()
                if not line:
                    continue
                obj = json.loads(line)
                id_to_schema[obj["id"]] = obj["schema"]

    try:
        import jsonschema  # type: ignore
        have_jsonschema = True
    except Exception:
        have_jsonschema = False

    ok = True
    with open(args.inputs, "r", encoding="utf-8") as f:
        for i, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except Exception as e:
                print(f"ERROR {args.inputs}:{i}: invalid JSON: {e}")
                ok = False
                continue

            _id = row.get("id")
            out = row.get("output")
            if not _id or out is None:
                print(f"ERROR {args.inputs}:{i}: expected keys: id, output")
                ok = False
                continue

            schema_file = row.get("schema") or id_to_schema.get(_id)
            if not schema_file:
                print(f"ERROR {args.inputs}:{i}: no schema specified for id={_id}")
                ok = False
                continue

            schema_path = os.path.join(args.schema_dir, schema_file)
            if not os.path.exists(schema_path):
                print(f"ERROR {args.inputs}:{i}: schema not found: {schema_path}")
                ok = False
                continue

            schema_obj = _load_json(schema_path)

            if have_jsonschema:
                try:
                    jsonschema.validate(instance=out, schema=schema_obj)
                except Exception as e:
                    print(f"ERROR id={_id}: schema validation failed: {e}")
                    ok = False
            else:
                errs = _minimal_validate(schema_obj, out)
                if errs:
                    print(f"ERROR id={_id}: " + "; ".join(errs))
                    ok = False

    if not ok:
        sys.exit(1)

    print(f"OK: {args.inputs}")


if __name__ == "__main__":
    main()
