#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from infi_ai_cloud_base.db import (
    DEFAULT_DB_PATH,
    connect,
    init_db,
    upsert_compatibility,
    upsert_device,
    upsert_firmware,
)


def _load_json(path: Path):
    return json.loads(path.read_text())


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed INFI AI database")
    parser.add_argument("--db", type=Path, default=DEFAULT_DB_PATH)
    parser.add_argument("--devices", type=Path, default=ROOT / "data" / "devices.json")
    parser.add_argument("--firmware", type=Path, default=ROOT / "data" / "firmware_releases.json")
    parser.add_argument("--compat", type=Path, default=ROOT / "data" / "firmware_compatibility.json")
    args = parser.parse_args()

    conn = connect(args.db)
    try:
        init_db(conn)
        for device in _load_json(args.devices):
            upsert_device(conn, device)
        for fw in _load_json(args.firmware):
            upsert_firmware(conn, fw)
        upsert_compatibility(conn, _load_json(args.compat))
        conn.commit()
    finally:
        conn.close()

    print(f"Seeded database: {args.db}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
