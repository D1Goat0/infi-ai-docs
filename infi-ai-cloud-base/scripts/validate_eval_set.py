#!/usr/bin/env python3
"""Validate that the eval set JSONL is well-formed and references known schema files."""

import argparse
import json
import os
import sys


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--eval", required=True, help="Path to eval JSONL")
    ap.add_argument("--schema-dir", default=None, help="Optional schema dir to verify existence")
    args = ap.parse_args()

    ok = True
    seen_ids = set()
    with open(args.eval, "r", encoding="utf-8") as f:
        for i, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except Exception as e:
                print(f"ERROR {args.eval}:{i}: invalid JSON: {e}")
                ok = False
                continue

            for k in ("id", "task_class", "prompt", "schema"):
                if k not in obj:
                    print(f"ERROR {args.eval}:{i}: missing '{k}'")
                    ok = False

            _id = obj.get("id")
            if _id in seen_ids:
                print(f"ERROR {args.eval}:{i}: duplicate id '{_id}'")
                ok = False
            seen_ids.add(_id)

            if args.schema_dir:
                schema_path = os.path.join(args.schema_dir, obj.get("schema", ""))
                if not os.path.exists(schema_path):
                    print(f"ERROR {args.eval}:{i}: schema not found: {schema_path}")
                    ok = False

    if not ok:
        sys.exit(1)

    print(f"OK: {args.eval} ({len(seen_ids)} cases)")


if __name__ == "__main__":
    main()
