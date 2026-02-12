from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = ROOT / "data" / "infi_ai.db"
MIGRATIONS_DIR = ROOT / "migrations"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def connect(db_path: Path | str = DEFAULT_DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    migration = MIGRATIONS_DIR / "001_init.sql"
    conn.executescript(migration.read_text())
    conn.commit()


def _to_json(value: Any) -> str:
    if isinstance(value, str):
        return value
    return json.dumps(value or {}, sort_keys=True)


def upsert_device(conn: sqlite3.Connection, device: dict[str, Any]) -> None:
    now = utc_now_iso()
    conn.execute(
        """
        INSERT INTO devices (
            slug, name, manufacturer, mcu_family, board, tier, classification,
            status_notes, metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(slug) DO UPDATE SET
            name=excluded.name,
            manufacturer=excluded.manufacturer,
            mcu_family=excluded.mcu_family,
            board=excluded.board,
            tier=excluded.tier,
            classification=excluded.classification,
            status_notes=excluded.status_notes,
            metadata_json=excluded.metadata_json,
            updated_at=excluded.updated_at
        """,
        (
            device["slug"],
            device["name"],
            device["manufacturer"],
            device["mcu_family"],
            device["board"],
            device["tier"],
            device["classification"],
            device.get("status_notes"),
            _to_json(device.get("metadata_json")),
            now,
            now,
        ),
    )


def upsert_firmware(conn: sqlite3.Connection, fw: dict[str, Any]) -> None:
    now = utc_now_iso()
    conn.execute(
        """
        INSERT INTO firmware_releases (
            firmware_name, version, channel, intent_schema_version,
            kb_manifest_version, release_notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(firmware_name, version, channel) DO UPDATE SET
            intent_schema_version=excluded.intent_schema_version,
            kb_manifest_version=excluded.kb_manifest_version,
            release_notes=excluded.release_notes,
            updated_at=excluded.updated_at
        """,
        (
            fw["firmware_name"],
            fw["version"],
            fw["channel"],
            fw["intent_schema_version"],
            fw["kb_manifest_version"],
            fw.get("release_notes"),
            now,
            now,
        ),
    )


def upsert_compatibility(conn: sqlite3.Connection, rows: Iterable[dict[str, Any]]) -> None:
    now = utc_now_iso()
    for row in rows:
        firmware = conn.execute(
            """
            SELECT id FROM firmware_releases
            WHERE firmware_name = ? AND version = ? AND channel = ?
            """,
            (row["firmware_name"], row["firmware_version"], row["channel"]),
        ).fetchone()
        if not firmware:
            raise ValueError(f"Unknown firmware mapping: {row}")

        device = conn.execute(
            "SELECT id FROM devices WHERE slug = ?",
            (row["device_slug"],),
        ).fetchone()
        if not device:
            raise ValueError(f"Unknown device mapping: {row}")

        conn.execute(
            """
            INSERT INTO firmware_device_compatibility (
                firmware_id, device_id, support_level, min_bootloader_version,
                max_bootloader_version, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(firmware_id, device_id) DO UPDATE SET
                support_level=excluded.support_level,
                min_bootloader_version=excluded.min_bootloader_version,
                max_bootloader_version=excluded.max_bootloader_version,
                notes=excluded.notes,
                updated_at=excluded.updated_at
            """,
            (
                firmware["id"],
                device["id"],
                row["support_level"],
                row.get("min_bootloader_version"),
                row.get("max_bootloader_version"),
                row.get("notes"),
                now,
                now,
            ),
        )
