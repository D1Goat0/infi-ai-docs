from __future__ import annotations

import argparse
import json
from pathlib import Path

from infi_ai_cloud_base.db import DEFAULT_DB_PATH, connect
from infi_ai_cloud_base.queries import (
    fetch_devices,
    fetch_firmware,
    fetch_firmware_for_device,
)


def main() -> int:
    parser = argparse.ArgumentParser(description="INFI AI cloud-base query utility")
    parser.add_argument("--db", type=Path, default=DEFAULT_DB_PATH, help="SQLite DB path")

    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("list-devices")
    sub.add_parser("list-firmware")
    for_device = sub.add_parser("firmware-for-device")
    for_device.add_argument("device_slug")

    args = parser.parse_args()
    conn = connect(args.db)
    try:
        if args.cmd == "list-devices":
            print(json.dumps(fetch_devices(conn), indent=2))
        elif args.cmd == "list-firmware":
            print(json.dumps(fetch_firmware(conn), indent=2))
        elif args.cmd == "firmware-for-device":
            print(json.dumps(fetch_firmware_for_device(conn, args.device_slug), indent=2))
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
