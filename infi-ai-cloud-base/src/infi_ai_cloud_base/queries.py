from __future__ import annotations

import sqlite3
from typing import Any


def fetch_devices(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT slug, name, manufacturer, mcu_family, tier, classification, updated_at
        FROM devices
        ORDER BY classification, name
        """
    ).fetchall()
    return [dict(r) for r in rows]


def fetch_firmware(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT firmware_name, version, channel, intent_schema_version,
               kb_manifest_version, updated_at
        FROM firmware_releases
        ORDER BY firmware_name, channel, version
        """
    ).fetchall()
    return [dict(r) for r in rows]


def fetch_firmware_for_device(conn: sqlite3.Connection, device_slug: str) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT d.slug AS device_slug, d.name AS device_name,
               f.firmware_name, f.version, f.channel,
               c.support_level, c.min_bootloader_version,
               c.max_bootloader_version, c.notes
        FROM firmware_device_compatibility c
        JOIN devices d ON d.id = c.device_id
        JOIN firmware_releases f ON f.id = c.firmware_id
        WHERE d.slug = ?
        ORDER BY f.firmware_name, f.version
        """,
        (device_slug,),
    ).fetchall()
    return [dict(r) for r in rows]
