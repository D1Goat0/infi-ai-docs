# INFI AI Architecture Spec (Cloud + Embedded)

> Alignment note (2026-02-12): Canonical cross-functional execution now lives in `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md`. Use this file as architecture baseline and read alongside the master guide.

## 1) Purpose
INFI AI is a dual-system assistant for Infiltra Network:

1. **INFI AI Cloud** (full capability)
   - Coding assistant
   - Knowledge assistant for firmware, signal testing, PCB/device design
   - Research and synthesis across Infiltra + related firmware ecosystems

2. **INFI AI Embedded** (firmware-integrated, ultra-light)
   - Runs on ESP32-class and similar microcontrollers
   - Fast local intent detection + action routing
   - Local device/pinout/capability lookup
   - Optional voice keyword triggering on supported hardware

---

## 2) Product Goals

### Cloud goals
- Be the primary engineering assistant for Infiltra projects.
- Understand firmware architecture, feature requests, and hardware constraints.
- Support coding tasks with safe workflows (backup branch before changes).
- Provide daily operational updates, suggestions triage, and technical reports.

### Embedded goals
- Keep footprint tiny and deterministic.
- Prioritize reliability over “chatty” AI behavior.
- Allow users to trigger actions via compact commands/keywords.
- Answer practical device/firmware questions from a local compressed knowledge base.

---

## 3) System Tiers (Embedded)

The embedded side uses three build targets (“tiers”) based on hardware resources.

## Tier 1 — Tiny (lowest RAM/flash)
- **Target:** constrained ESP32 variants and low-memory builds
- **Behavior:**
  - strict command keywords
  - deterministic intent mapping
  - minimal curated knowledge (core devices + core commands)
- **No freeform local generation**

## Tier 2 — Medium
- **Target:** newer ESP32s with better RAM/flash
- **Behavior:**
  - keyword + fuzzy intent matching
  - expanded local hardware and firmware knowledge
  - broader command aliases and help responses

## Tier 3 — Heavy (still embedded-safe)
- **Target:** stronger ESP32-class MCUs / compatible microcontrollers
- **Behavior:**
  - richer parser and expanded local KB
  - optional voice keyword activation path (if audio hardware exists)
  - advanced troubleshooting lookup and contextual command hints

> Note: “heavy” here is still an embedded lookup/action engine, not a full LLM running on device.

---

## 4) Data Domains INFI AI Must Know

## A) Infiltra firmware domain
- Features, command sets, workflows, supported modules
- Build/flash basics and troubleshooting
- Hardware support matrix

## B) Related firmware ecosystems
- Marauder firmware
- Bruce firmware
- Flipper Zero ecosystem (feature/capability mapping, not direct code reuse assumptions)
- Comparable tooling ecosystems where relevant

## C) Hardware/device intelligence
- M5Stack family pinouts + constraints
- LilyGO family pinouts + constraints
- Other supported boards with MCU, display, RF, power details
- GPIO mapping, peripheral conflicts, known gotchas

## D) Signal-testing operational knowledge
- Wi-Fi recon/scan flows
- RF/IR workflow references
- Practical command mappings from user intent to firmware action

## E) IR databases (metadata + references)
- Device categories
- Protocol families (where available)
- Manufacturer/model linkage and source provenance

---

## 5) Embedded Runtime Design

INFI AI Embedded is built as a compact “intent + retrieval + action router”:

1. **Input Layer**
   - button/button-pattern triggers
   - text input parser
   - optional speech keyword parser (medium/heavy targets)

2. **Intent Engine**
   - keyword dictionary (tiny)
   - fuzzy alias expansion (medium/heavy)
   - intent confidence scoring

3. **Knowledge Retrieval**
   - local compressed index (device/pinout/feature/action docs)
   - deterministic answer templates
   - tier-aware response size controls

4. **Action Router**
   - maps intents to firmware actions
   - safety checks (availability, mode, permission state)
   - returns clear execution feedback

5. **Fallback Strategy**
   - if unsupported locally: return concise “not available” + nearest valid action
   - optional cloud handoff hook for advanced queries

---

## 6) Cloud Runtime Design

INFI AI Cloud provides:
- deep reasoning and coding support
- large-scale searchable knowledge corpus
- continuous ingestion from source repositories and docs
- synthesis reports for firmware improvements and roadmap decisions

## Storage strategy (recommended)

## Source of truth
- **GitHub repositories** for all canonical docs/datasets/specs (versioned and reviewable)

## Cloud knowledge store
- **Local DB on host** (SQLite/Postgres) for normalized metadata and fast queries
- optional vector index for semantic retrieval in cloud mode

## UI host
- **Netlify** for dashboard/frontend only (not primary data store)

## Optional removable storage
- SD card acceptable for backup/offline export bundles, not primary source of truth

---

## 7) Data Model (Initial)

Create structured datasets in versioned files:

## `devices.json`
- id, name, vendor, family, mcu, flash, ram
- wireless capabilities (wifi/bluetooth/etc)
- io summary (gpio count, buses, special pins)
- notes/constraints

## `pinouts.json`
- device_id
- pin number/name
- function(s)
- voltage/level constraints
- reserved/conflict notes

## `firmware_capabilities.json`
- firmware name/version
- supported boards
- feature flags
- command groups and constraints

## `intent_map.json`
- intent id
- trigger keywords/aliases
- required capability
- mapped firmware command/action
- tier support (tiny/medium/heavy)

## `ir_catalog.json`
- category
- vendor/device model
- protocol family
- reference source

## `knowledge_cards.json`
- concise Q/A style cards for fast local lookup
- each card includes source, scope, confidence, and tier availability

---

## 8) Build/Packaging for Embedded

Each tier gets a generated package:

- `infi_kb_tiny.binpack`
- `infi_kb_medium.binpack`
- `infi_kb_heavy.binpack`

Generation pipeline:
1. ingest/update sources from GitHub datasets
2. normalize + deduplicate
3. prune by tier budgets
4. compile to compressed runtime format
5. emit checksum/version manifest

---

## 9) Safety + Abuse Resistance

- Never execute unsupported actions silently.
- Require explicit mapping for high-impact operations.
- Ignore irrelevant/troll input in community-driven suggestion ingestion.
- Keep provenance metadata for generated recommendations.
- No token/secret exposure in logs, exports, or UI responses.

---

## 10) Community Feedback Ingestion Policy

Discord/TikTok/community signals are inputs, not automatic truth.

Pipeline:
1. collect suggestions/tickets/posts
2. classify: valid / unclear / irrelevant / troll
3. convert valid items into structured firmware change candidates
4. rank by impact, feasibility, and hardware constraints
5. produce daily/weekly action recommendations

---

## 11) UX Requirements

## Embedded
- quick activation by button pattern and/or keyword
- concise responses
- deterministic command confirmation (“Executing Wi-Fi scan… done.”)

## Cloud
- full dashboard controls
- analytics (repos, socials, suggestions)
- operational reporting and scheduled updates
- role-aware announcements (non-spam, high-signal)

---

## 12) Phase Plan

## Phase 1 — Foundation
- finalize schema and dataset structure
- seed core devices, pinouts, firmware capabilities
- implement tiny-tier intent engine

## Phase 2 — Medium/Heavy expansion
- fuzzy parser + richer knowledge cards
- optional voice keyword handling path
- broader board support and troubleshooting coverage

## Phase 3 — Cloud intelligence coupling
- bidirectional cloud/embedded handoff
- auto-generated firmware insight reports
- tighter roadmap loop from community suggestions

---

## 13) Open Questions (to finalize with Luke)

1. Exact memory/flash budgets per tier target (hard limits)
2. First board families to prioritize for v1
3. Preferred command taxonomy and aliases
4. Voice hardware targets for speech keyword mode
5. Canonical repo list for source ingestion
6. Release cadence for KB updates (daily/weekly/manual)

---

## 14) Definition of Done (v1)

INFI AI v1 is ready when:
- Tiny/Medium/Heavy datasets build successfully from versioned sources
- Embedded runtime answers core device/pinout/capability queries offline
- Embedded runtime executes mapped actions from validated intents
- Cloud assistant can ingest, summarize, and propose firmware improvements
- All outputs include clear status + no secret leakage
