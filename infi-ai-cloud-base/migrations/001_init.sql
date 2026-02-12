PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    mcu_family TEXT NOT NULL,
    board TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('Tiny', 'Medium', 'Heavy', 'Medium/Heavy', 'Tiny/Medium')),
    classification TEXT NOT NULL CHECK (classification IN ('Recommended', 'Beta', 'Not Recommended', 'Beta pilot')),
    status_notes TEXT,
    metadata_json TEXT DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS firmware_releases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firmware_name TEXT NOT NULL,
    version TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('stable', 'beta', 'pilot', 'research')),
    intent_schema_version TEXT NOT NULL,
    kb_manifest_version TEXT NOT NULL,
    release_notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (firmware_name, version, channel)
);

CREATE TABLE IF NOT EXISTS firmware_device_compatibility (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firmware_id INTEGER NOT NULL,
    device_id INTEGER NOT NULL,
    support_level TEXT NOT NULL CHECK (support_level IN ('recommended', 'beta', 'experimental', 'blocked')),
    min_bootloader_version TEXT,
    max_bootloader_version TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (firmware_id) REFERENCES firmware_releases(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    UNIQUE (firmware_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_devices_slug ON devices(slug);
CREATE INDEX IF NOT EXISTS idx_firmware_name_version ON firmware_releases(firmware_name, version);
CREATE INDEX IF NOT EXISTS idx_compat_firmware_id ON firmware_device_compatibility(firmware_id);
CREATE INDEX IF NOT EXISTS idx_compat_device_id ON firmware_device_compatibility(device_id);
