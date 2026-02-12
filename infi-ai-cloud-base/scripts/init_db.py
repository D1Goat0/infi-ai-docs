#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from infi_ai_cloud_base.db import DEFAULT_DB_PATH, connect, init_db


def main() -> int:
    parser = argparse.ArgumentParser(description="Initialize INFI AI SQLite database")
    parser.add_argument("--db", type=Path, default=DEFAULT_DB_PATH)
    args = parser.parse_args()

    args.db.parent.mkdir(parents=True, exist_ok=True)
    conn = connect(args.db)
    try:
        init_db(conn)
    finally:
        conn.close()

    print(f"Initialized database: {args.db}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
