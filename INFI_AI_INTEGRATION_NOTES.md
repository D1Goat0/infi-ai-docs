> Canonical status (2026-02-12): Integration notes remain valid and are now synchronized to:
> - `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md`
> - `docs/INFI-AI-DATASET-BUILD-SPEC.md`
> - `docs/INFI-AI-HARDWARE-COMPATIBILITY-DEEP-DIVE.md`

# INFI AI Integration Notes (Firmware + Repo Workflow)

> Alignment note (2026-02-12): Dataset and packaging details are now standardized in `docs/INFI-AI-DATASET-BUILD-SPEC.md`; master implementation flow is in `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md`.

_Last updated: 2026-02-11_

## Scope
These notes describe a concrete, low-risk integration path for INFI AI into the existing Infiltra firmware workflow, based on observed repo structure in:
- `repos/pamir-infiltra/platformio.ini`
- `repos/pamir-infiltra/src/main.cpp`
- `repos/pamir-infiltra/Boards/*.json`

No external repo code changes were made during this planning pass.

---

## 1) Current State Snapshot (What We Can Leverage)

## Existing strengths
- Multi-environment PlatformIO setup already exists (`m5stick-c-plus-2`, `m5stick-c-plus-1-1`, `cardputer`, `lilygo-t-embed`, `lilygo-cc1101`).
- Board abstraction already handled through board JSON and compile-time defines.
- UI/input loop appears centralized (`handleAllButtonLogic`, menu modules), good insertion point for intent dispatch.
- Hardware-specific setup branches already present (M5, LilyGO power/display paths), so feature gating is natural.

## Integration implication
INFI AI should be added as **modular feature slices** rather than broad refactors:
- `intent parser` module
- `knowledge lookup` module
- `action routing` module

---

## 2) Recommended Repository Layout Additions

Inside firmware repo (proposal):

- `src/Modules/AI/Intent/`
  - `IntentEngine.h/.cpp`
  - `IntentTypes.h`
- `src/Modules/AI/Knowledge/`
  - `KnowledgeReader.h/.cpp`
  - `CardModels.h`
- `src/Modules/AI/Router/`
  - `ActionRouter.h/.cpp`
  - `ActionSafety.h`
- `src/Modules/AI/Config/`
  - `AiTierConfig.h`
  - `AiFeatureFlags.h`
- `data/infi/` (or equivalent generated-assets location)
  - `infi_kb_tiny.binpack`
  - `infi_kb_medium.binpack`
  - `infi_kb_heavy.binpack`
  - `manifest.json`

Keep modules isolated to limit regression risk.

---

## 3) Firmware Integration Steps (Concrete)

## Step A — Add tier and capability detection
- Derive tier from board env + compile flags.
- Example strategy:
  - `M5STICK_C_PLUS_1_1` -> Tiny/Medium profile
  - `M5STICK_C_PLUS_2` -> Medium
  - `M5CARDPUTER`, `LILYGO_T_EMBED` -> Medium/Heavy capable
- Add compile-time macros such as:
  - `INFI_AI_ENABLED`
  - `INFI_AI_TIER_TINY|MEDIUM|HEAVY`
  - `INFI_AI_VOICE_KEYWORD_ENABLED` (heavy only)

## Step B — Insert parser into input loop
- Hook into existing user input flow prior to command execution.
- Convert raw input/button patterns into `IntentRequest`.
- Perform confidence gating:
  - Tiny: exact-match only
  - Medium/Heavy: alias/fuzzy with threshold

## Step C — Add local knowledge retrieval
- Read compact cards by topic (`device`, `pinout`, `capability`, `troubleshoot`).
- Return deterministic templated responses.
- Enforce per-tier response-size caps to avoid RAM spikes.

## Step D — Route validated intents to existing actions
- Build explicit `intent_id -> firmware_action` table.
- Never execute when mapping missing/low confidence.
- Return clear fallback: unsupported + closest valid actions.

## Step E — Add safety + telemetry hooks
- Safety classes for intents (low/medium/high impact).
- Counters:
  - intent hits/misses
  - confidence failures
  - unsupported action requests
  - cloud handoff events

---

## 4) Data/Knowledge Pipeline Integration

## Canonical source (outside firmware binaries)
Maintain versioned datasets in a dedicated knowledge repo/folder:
- `devices.json`
- `pinouts.json`
- `firmware_capabilities.json`
- `intent_map.json`
- `knowledge_cards.json`

## Build pipeline
1. Validate schemas
2. Normalize and deduplicate
3. Prune by tier budgets
4. Compile `.binpack`
5. Emit `manifest.json` with version/checksum/build date

## Release behavior
- Firmware release points to a specific KB manifest version.
- Allow independent KB refreshes where safe (if existing update mechanism supports it).

---

## 5) PlatformIO Workflow Recommendations

## Environments
- Keep current envs unchanged for baseline stability.
- Add optional AI variants only if needed, e.g.:
  - `m5stick-c-plus-2-ai`
  - `cardputer-ai-heavy`

## Build flags
- Use compile flags instead of branch-heavy code where possible.
- Keep one source tree; avoid board-specific forks.

## CI gates (minimum)
- Build all recommended board envs
- Run intent-map static validation
- Ensure no missing action mappings for “supported” intents
- Check generated KB package sizes vs tier budgets

---

## 6) Cloud Integration Approach (Practical)

## Ingestion sources
- Firmware repo metadata (boards, modules, commits)
- Issue/suggestion feeds
- Release artifacts + changelogs

## Outputs useful to firmware team
- Daily diff summary: changed modules and potential command impacts
- Board compatibility alerts when capabilities drift
- Ranked suggestion queue (impact x effort x hardware coverage)

This gives immediate value without forcing deep infrastructure early.

---

## 7) Versioning + Compatibility Contract

Define a clear compatibility tuple:
- `firmware_version`
- `kb_manifest_version`
- `intent_schema_version`

Runtime should refuse incompatible bundles and show a concise error.

---

## 8) Suggested Implementation Sequence (2-Week Sprint)

## Week 1
1. Lock intent/action schema and tier budgets.
2. Implement tiny-tier parser + router stubs.
3. Seed minimal knowledge cards.
4. Add build-time validator for mappings.

## Week 2
1. Integrate medium alias handling.
2. Connect knowledge lookup templates.
3. Add telemetry counters.
4. Run board regression on recommended devices.

Outcome: first useful embedded INFI AI loop without destabilizing core firmware.

---

## 9) Known Integration Risks + Mitigations

1. **Board-specific macro complexity**
   - Mitigation: board capability registry and feature flags.

2. **UI loop latency from AI path**
   - Mitigation: strict local processing budget and bounded card sizes.

3. **Action-map drift as firmware evolves**
   - Mitigation: automated map validation in CI and release checklist.

4. **Too many beta devices too early**
   - Mitigation: keep recommended set intentionally small for v1.

---

## 10) Decision Recommendations
1. Adopt ESP32-S3-first as official v1 assistant platform.
2. Treat STM32 as planned expansion lane (pilot only in near term).
3. Ship deterministic local assistant first; delay advanced voice/NLP until stability metrics hold.
4. Keep integration modular and reversible (feature-flagged) to protect firmware velocity.
