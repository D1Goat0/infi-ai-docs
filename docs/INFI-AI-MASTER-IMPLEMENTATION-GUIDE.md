# INFI AI Master Implementation Guide (Single Source of Truth)

_Last updated: 2026-02-12_

This is the execution-grade master guide for building and launching INFI AI with a small startup team.

## 0) Scope and Outcomes

INFI AI is delivered as two tightly-coupled products:
- **Embedded runtime** on supported boards (deterministic intent -> action + local knowledge retrieval)
- **Cloud runtime** for ingestion, analytics, roadmap scoring, and support/monetization workflows

### v1 outcomes (12 weeks)
1. Production-grade embedded runtime for a constrained recommended board set.
2. Versioned dataset pipeline generating tiered KB packages.
3. Daily cloud digest + board compatibility/risk reporting.
4. Commercially usable plan packaging (Free/Pro/Team) with telemetry-backed metrics.

---

## 1) North-Star Architecture

## 1.1 Layered System

1. **Input + Intent Layer (device)**
   - Button events, short text, optional voice keyword triggers
   - Tiered intent engine (Tiny/Medium/Heavy)
2. **Local Knowledge Layer (device)**
   - Tier-pruned compact KB (`.binpack`) with deterministic card templates
3. **Action Router + Safety Layer (device)**
   - Explicit map only (`intent_id -> command/action`) + safety class checks
4. **Cloud Intelligence Layer**
   - Ingest repos/docs/issues/community signals
   - Generate daily engineering digest + roadmap recommendations
5. **Ops + Commercial Layer**
   - Release channels, telemetry, plan gates, support workflows

## 1.2 Non-Negotiables
- No silent execution for unmapped/low-confidence actions.
- Firmware/KB/schema compatibility contract enforced at runtime.
- Secrets excluded from logs/docs/manifests.
- Recommended boards are tightly scoped; broad matrix deferred.

---

## 2) Tier Model and Budgets

Use conservative guardrails in firmware; tune after profiling.

| Tier | Primary Hardware Fit | Intent Model | KB Size Target (compressed) | Response Budget | Typical Latency Target |
|---|---|---|---:|---:|---:|
| Tiny | ESP32-C3 / older ESP32 | exact keyword map | 128-256 KB | <= 160 chars | <250 ms |
| Medium | ESP32-S3 (no/low PSRAM) | keyword + alias | 256-768 KB | <= 280 chars | <300 ms |
| Heavy | ESP32-S3 + PSRAM / high-end STM pilot | alias + troubleshooting context + optional keyword voice trigger | 0.8-2.0 MB | <= 420 chars | <400 ms |

> Heavy is still deterministic retrieval/routing, not on-device full LLM inference.

---

## 3) Hardware Strategy (Execution Decision)

### 3.1 v1 Recommended
1. **M5StickC Plus 2 (ESP32-S3)** - Medium default
2. **M5Cardputer (ESP32-S3)** - Medium/Heavy
3. **LilyGO T-Embed (ESP32-S3)** - Medium/Heavy

### 3.2 Beta Lane
- M5StickC Plus 1.1 (ESP32 classic)
- LilyGO T-Embed CC1101 variants (RF complexity)
- STM32 pilot board (NUCLEO-F446RE preferred)

### 3.3 Not Recommended for v1 Distribution
- Generic ESP32 devkits (high variance/support drag)
- Broad ESP32-S2/C6 fleet support in first release
- Legacy STM32F1 broad support

See deep technical rationale in: `docs/INFI-AI-HARDWARE-COMPATIBILITY-DEEP-DIVE.md`.

---

## 4) Data System and Dataset Contracts

Canonical datasets:
- `devices.json`
- `pinouts.json`
- `firmware_capabilities.json`
- `intent_map.json`
- `knowledge_cards.json`
- `ir_catalog.json`

## 4.1 Required Data Properties
- Versioned and schema-validated.
- Every card/action has provenance + confidence metadata.
- Tier availability flags included (`tiny|medium|heavy`).

## 4.2 Build Artifacts
- `infi_kb_tiny.binpack`
- `infi_kb_medium.binpack`
- `infi_kb_heavy.binpack`
- `manifest.json` with checksums and compatibility tuple

Detailed spec: `docs/INFI-AI-DATASET-BUILD-SPEC.md`.

---

## 5) Firmware Integration Blueprint

## 5.1 Module boundaries
- `Modules/AI/Intent/*`
- `Modules/AI/Knowledge/*`
- `Modules/AI/Router/*`
- `Modules/AI/Config/*`

## 5.2 Runtime flow
`input -> IntentRequest -> confidence gate -> KB lookup (if needed) -> action route -> response`

## 5.3 Safety classes
- **S0 Info:** read/lookup only
- **S1 Low:** reversible low-risk operations
- **S2 Medium:** state-changing operations
- **S3 High:** potentially disruptive actions; require explicit confirm when UX allows

## 5.4 Compatibility tuple
`firmware_version + kb_manifest_version + intent_schema_version`

On mismatch: refuse load, show concise remediation guidance.

---

## 6) Cloud Platform Implementation (Lean)

## 6.1 Minimal useful cloud on day 1
- Repo metadata ingest
- Board/capability drift detection
- Daily "what changed" digest
- Suggestion triage board with impact/effort scoring

## 6.2 Data stores
- Git-backed canonical datasets/docs
- Ops DB (SQLite -> Postgres as needed)
- Optional vector index only after retrieval quality proof

## 6.3 Daily outputs
1. Build health + board compatibility report
2. Changed command surfaces and action-map risk alerts
3. Top ranked feature candidates with rationale

---

## 7) Security, Abuse Resistance, and Release Control

## 7.1 Device/runtime security controls
- Signed firmware only in release channels
- Signed KB manifest and checksum verification
- No plaintext secrets in firmware logs

## 7.2 Pipeline controls
- Schema validation hard-fail in CI
- Intent/action map completeness checks
- Tier size budget checks hard-fail build

## 7.3 Abuse controls for community ingestion
- Classify as `valid|unclear|irrelevant|troll`
- Only `valid` and high-confidence `unclear` items reach product triage
- Keep moderation provenance (who/when/why)

---

## 8) Testing and Acceptance

## 8.1 Test layers
- Unit: parser, ranking, map resolution
- Integration: board profile + routing + KB loading
- HIL smoke: recommended boards each release
- Regression: top 50 intents per tier

## 8.2 Acceptance criteria (v1)
- >=98% correct intent-to-action on validated prompts
- 0 unmapped action execution in test suite
- 100% recommended boards pass build + smoke + safety tests
- Daily digest delivered 5/5 business days

---

## 9) Rollout Plan (12-week, startup realistic)

| Phase | Weeks | Primary Output | Exit Gate |
|---|---|---|---|
| P0 Scope Lock | 0-1 | tier budgets, schema freeze, intent taxonomy v1 | signoff + backlog created |
| P1 Tiny Ship Path | 1-3 | tiny parser/router + tiny KB pipeline | top-20 intents stable |
| P2 Medium/Heavy | 3-6 | alias parser, troubleshooting cards, heavy profile | stability + latency within guardrails |
| P3 Cloud Ops | 6-10 | daily digest + scoring pipeline | team uses outputs in planning |
| P4 Hardening Launch | 10-12 | release checklist + rollback + support docs | RC passes and launch approved |

Roadmap cadence and rituals: `docs/INFI-AI-ROADMAP-AND-OPERATING-RHYTHM.md`.

---

## 10) Monetization Linkage (Build what sells)

| Capability | User Value | Plan Fit | Required Telemetry |
|---|---|---|---|
| Tiny deterministic assistant | reliable baseline utility | Free funnel | DAU per board, intent success |
| Medium KB + troubleshooting | less friction, faster fixes | Pro core | feature usage, resolution time |
| Team reporting/workspace | multi-device operations | Team | active seats, report exports |
| Premium heavy workflows | high-end assistive workflows | Pro+/Team add-on | tier activation, retention delta |

Commercial details and pricing hypotheses: `INFI_AI_REVENUE_PATHS.md`.

---

## 11) Risk Register and Controls

| Risk | Impact | Early Signal | Control |
|---|---|---|---|
| Board sprawl | missed deadlines | backlog full of board-specific defects | freeze recommended set |
| Intent drift | unsafe/wrong actions | rising fallback + misroute rate | schema and map validation gates |
| KB bloat | runtime instability | memory pressure regressions | hard size budgets per tier |
| Noisy community input | roadmap churn | low accept rate from suggestions | triage classification + confidence gates |
| Overbuilt cloud too early | burn without PMF | low usage of outputs | keep MVP digest first |

---

## 12) Team Operating Model (3-person startup)

- **Firmware lead:** parser/router/board compatibility and release safety
- **Data/full-stack:** dataset pipeline + cloud ingest/reporting
- **Product/ops (Luke):** prioritization, release gates, commercial experiments

Decision SLA:
- architecture/safety decisions <=24h
- backlog priority conflicts resolved in weekly planning

---

## 13) What to do tomorrow morning (explicit)

1. Freeze v1 recommended board list (3 boards only).
2. Approve tier budgets and response caps in this guide.
3. Approve intent taxonomy for top 20 user tasks.
4. Stand up dataset repo/folder structure using dataset build spec.
5. Open tickets for P0/P1 milestones with owners and due dates.
6. Add CI gates: schema validation, action-map completeness, KB size checks.
7. Start daily 15-minute digest review ritual.

---

## 14) Document map (single source index)

- Master execution guide (this doc): `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md`
- Hardware deep dive: `docs/INFI-AI-HARDWARE-COMPATIBILITY-DEEP-DIVE.md`
- Dataset build spec: `docs/INFI-AI-DATASET-BUILD-SPEC.md`
- Roadmap + operating rhythm: `docs/INFI-AI-ROADMAP-AND-OPERATING-RHYTHM.md`
- Legacy architecture baseline: `INFI_AI_ARCHITECTURE.md`
- Integration details: `INFI_AI_INTEGRATION_NOTES.md`
- Revenue model: `INFI_AI_REVENUE_PATHS.md`
