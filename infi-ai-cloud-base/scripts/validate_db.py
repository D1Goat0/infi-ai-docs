#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
import sqlite3
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from infi_ai_cloud_base.db import DEFAULT_DB_PATH, connect

REQUIRED_TABLES = {
    "devices",
    "firmware_releases",
    "firmware_device_compatibility",
}


def _validate_schema(conn: sqlite3.Connection) -> list[str]:
    errors: list[str] = []
    rows = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
    tables = {r[0] for r in rows}
    missing = REQUIRED_TABLES - tables
    if missing:
        errors.append(f"Missing tables: {sorted(missing)}")
    return errors


def _validate_duplicates(conn: sqlite3.Connection) -> list[str]:
    errors: list[str] = []

    dup_devices = conn.execute(
        """
        SELECT slug, COUNT(*) AS c
        FROM devices
        GROUP BY slug
        HAVING c > 1
        """
    ).fetchall()
    if dup_devices:
        errors.append(f"Duplicate device slugs found: {[r['slug'] for r in dup_devices]}")

    dup_fw = conn.execute(
        """
        SELECT firmware_name, version, channel, COUNT(*) AS c
        FROM firmware_releases
        GROUP BY firmware_name, version, channel
        HAVING c > 1
        """
    ).fetchall()
    if dup_fw:
        errors.append("Duplicate firmware release tuples found")

    dup_links = conn.execute(
        """
        SELECT firmware_id, device_id, COUNT(*) AS c
        FROM firmware_device_compatibility
        GROUP BY firmware_id, device_id
        HAVING c > 1
        """
    ).fetchall()
    if dup_links:
        errors.append("Duplicate compatibility mappings found")

    return errors


def _validate_integrity(conn: sqlite3.Connection) -> list[str]:
    errors: list[str] = []

    dangling = conn.execute(
        """
        SELECT c.id
        FROM firmware_device_compatibility c
        LEFT JOIN devices d ON d.id = c.device_id
        LEFT JOIN firmware_releases f ON f.id = c.firmware_id
        WHERE d.id IS NULL OR f.id IS NULL
        """
    ).fetchall()
    if dangling:
        errors.append(f"Dangling compatibility rows: {[r['id'] for r in dangling]}")

    no_compat_devices = conn.execute(
        """
        SELECT d.slug
        FROM devices d
        LEFT JOIN firmware_device_compatibility c ON c.device_id = d.id
        GROUP BY d.id
        HAVING COUNT(c.id) = 0
        """
    ).fetchall()
    if no_compat_devices:
        errors.append(
            "Devices with no firmware compatibility rows: "
            f"{[r['slug'] for r in no_compat_devices]}"
        )

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate INFI AI DB quality checks")
    parser.add_argument("--db", type=Path, default=DEFAULT_DB_PATH)
    args = parser.parse_args()

    conn = connect(args.db)
    try:
        errors = []
        errors.extend(_validate_schema(conn))
        errors.extend(_validate_duplicates(conn))
        errors.extend(_validate_integrity(conn))
    finally:
        conn.close()

    if errors:
        print("VALIDATION FAILED")
        for e in errors:
            print(f"- {e}")
        return 1

    print("VALIDATION OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
