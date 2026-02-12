> Canonical status (2026-02-12): This execution plan is retained as a concise baseline. Current operating authority is:
> - `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md`
> - `docs/INFI-AI-ROADMAP-AND-OPERATING-RHYTHM.md`

# INFI AI Execution Plan (Cloud + Embedded)

> Alignment note (2026-02-12): This plan is now synchronized with `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md` and `docs/INFI-AI-ROADMAP-AND-OPERATING-RHYTHM.md`.

_Last updated: 2026-02-11 (overnight block)_

## 1) Executive Intent
Build INFI AI as a two-layer system:
- **Embedded runtime** on supported Infiltra devices for deterministic local intent routing, local lookup, and safe action execution.
- **Cloud runtime** for heavier reasoning, repo intelligence, release planning, and product-level insights.

This plan is optimized for a **small startup team** (fast iteration, low ops overhead, high leverage from existing repo workflows).

---

## 2) Architecture Baseline

## Embedded Tier (on-device)
**Core pipeline:** input -> intent -> local retrieval -> action router -> response

- Input modes: button, short text, optional keyword voice trigger on capable boards
- Intent modes by tier:
  - Tiny: strict keyword map
  - Medium: keyword + alias expansion + confidence threshold
  - Heavy: larger alias/intent map + troubleshooting hints + cloud handoff stubs
- Retrieval: compact packaged KB (`.binpack`) generated from canonical JSON datasets
- Router: firmware-safe mapping only (no unmapped execution)

## Cloud Tier
**Core pipeline:** ingest -> normalize -> index -> assist -> publish recommendations

- Ingest sources: firmware repos, board definition files, issue/suggestion inputs, release notes
- Storage:
  - Git-backed canonical datasets (JSON/Markdown)
  - Operational DB for query/reporting
  - Optional vector index for semantic retrieval
- Outputs:
  - engineering assistant responses
  - roadmap suggestions
  - release-quality readiness scorecards

---

## 3) 90-Day Phased Plan

## Phase 0 (Week 0-1): Scope Lock + Interfaces
**Goal:** freeze interfaces before scaling implementation.

### Deliverables
- Tier budgets (flash/RAM targets) for tiny/medium/heavy
- Intent taxonomy v1 (`intent_id`, required capability, safety class)
- Action contract v1 (`intent -> firmware command/method`)
- Dataset schema freeze (devices, pinouts, capabilities, intents, cards)

### Milestones
- M0.1: architecture signoff with Luke
- M0.2: board-support gate criteria defined (recommended vs beta)
- M0.3: “no silent execution” policy codified

### Dependencies
- Confirm priority board list from Infiltra usage
- Confirm first supported firmware command groups

### Risks
- Early drift in command naming across boards
- Scope bloat from trying to support too many board families at once

---

## Phase 1 (Week 1-3): Tiny Tier Production Path
**Goal:** shippable tiny tier for current ESP32 products in the repo.

### Deliverables
- Tiny intent engine with deterministic keyword matching
- Tiny KB package generator (`infi_kb_tiny.binpack`)
- Minimal local Q/A cards (device, pinout, capability, command constraints)
- Test harness for action mapping correctness

### Milestones
- M1.1: tiny data pack under flash budget on baseline board
- M1.2: action map coverage for top 20 commands
- M1.3: false-positive intent rate < 2% in test prompts

### Dependencies
- Board config files in `repos/pamir-infiltra/Boards/*.json`
- Existing command surfaces in `src/Modules/...`

### Risks
- Fragmented board-specific macros causing inconsistent behavior
- Memory spikes from unbounded text responses

### Mitigations
- Hard response token/character limits by tier
- Feature flags per board profile

---

## Phase 2 (Week 3-6): Medium + Heavy Expansion
**Goal:** increase utility without sacrificing deterministic behavior.

### Deliverables
- Alias/fuzzy intent matching (bounded confidence thresholds)
- Expanded troubleshooting knowledge cards
- Optional voice keyword path (heavy-capable devices only)
- Tiered package outputs: medium + heavy

### Milestones
- M2.1: medium parser with confidence gating landed
- M2.2: heavy KB supports troubleshooting workflow cards
- M2.3: cloud handoff trigger path (for unsupported local queries)

### Dependencies
- Stable telemetry events from embedded runtime (intent hit/miss, fallback reason)
- Board-level audio capability definitions

### Risks
- Overfitting alias map, causing accidental high-impact commands
- Voice feature latency/quality issues on constrained boards

### Mitigations
- Safety class tagging for intents (low/medium/high impact)
- High-impact actions require explicit confirmation where UX allows

---

## Phase 3 (Week 6-10): Cloud Intelligence + Ops Loop
**Goal:** make cloud layer operationally valuable each day.

### Deliverables
- Ingestion jobs for firmware metadata + board support + suggestion threads
- Daily digest generator (engineering changes, incompatibilities, priority asks)
- Roadmap scoring model (impact x effort x hardware reach)
- Dashboard endpoints for release readiness and board coverage

### Milestones
- M3.1: daily automated ingest + normalization
- M3.2: “what changed today” report live
- M3.3: weekly roadmap recommendation report used by team

### Dependencies
- Access to source repos and structured suggestions stream
- Agreed tagging format for incoming feature requests

### Risks
- Noisy community input swamping roadmap quality
- Operational burden from too many manual triage steps

### Mitigations
- Relevance scoring and confidence thresholds
- “human-review required” lane before backlog promotion

---

## Phase 4 (Week 10-12): Hardening + v1 Launch
**Goal:** stable and measurable production v1.

### Deliverables
- Stability tests across recommended boards
- Release checklist + rollback plan
- Versioned KB manifest with checksums
- Support playbook for beta devices

### Milestones
- M4.1: release candidate passes regression suite
- M4.2: zero critical safety defects in pre-release window
- M4.3: v1 launch with support matrix and upgrade docs

---

## 4) Engineering Workstreams

## A) Embedded Runtime Workstream
1. Add `infi_intent` module (tier-aware parser)
2. Add `infi_router` module (strict map to firmware actions)
3. Add `infi_kb_reader` for compressed local cards
4. Add per-board feature gates via board JSON + compile flags
5. Add instrumentation counters (intent hit/miss/fallback)

## B) Data/Knowledge Workstream
1. Build canonical JSON datasets in dedicated knowledge folder
2. Add normalization scripts and validators
3. Generate tier-pruned `.binpack` artifacts + manifest
4. Add provenance fields (source repo, timestamp, confidence)

## C) Cloud/Ops Workstream
1. Ingest repo metadata + issue/suggestion inputs
2. Run daily diff and changelog synthesis
3. Publish roadmap recommendations with confidence + rationale
4. Expose compact dashboard metrics (coverage, failures, adoption)

---

## 5) Dependencies & Critical Path

## Critical path (must happen first)
1. Schema freeze
2. Intent/action contract freeze
3. Tiny tier ship path
4. Medium/heavy parser expansion
5. Cloud ingest + reporting loop

Any delay in 1-2 creates downstream churn for every layer.

---

## 6) KPI/Success Metrics (v1)
- **Embedded reliability:** > 98% correct intent-to-action routing on validated prompts
- **Latency:** local intent response < 250ms (tiny/medium), < 400ms (heavy)
- **Fallback quality:** > 95% unsupported queries return useful next-step guidance
- **Board coverage:** all “recommended” boards pass smoke + regression
- **Cloud usefulness:** daily digest reviewed and used in at least 4/5 working days
- **Roadmap quality:** at least 70% of accepted roadmap suggestions come from scored pipeline

---

## 7) Risk Register (Startup-Realistic)

1. **Resource constraints on older boards**
   - Plan: tiny tier stays strict/non-generative; cap card counts and response lengths.

2. **Maintaining multi-board parity**
   - Plan: recommended board set kept small; beta devices get best-effort support and explicit labeling.

3. **Integration drag with existing firmware codebase**
   - Plan: introduce INFI AI as isolated modules behind compile flags; avoid broad refactors initially.

4. **Overbuilding cloud before proving embedded utility**
   - Plan: cloud delivers lightweight daily digest first, advanced features later.

5. **Roadmap noise from social channels**
   - Plan: confidence and impact gates before promotion to engineering backlog.

---

## 8) Team Plan (Lean Staffing)
- **1 firmware lead:** embedded intent/router + board compatibility
- **1 full-stack/data engineer:** cloud ingest, dataset pipeline, dashboard/reporting
- **1 product/ops owner (Luke):** prioritization, release gates, monetization sequencing

If only 1 engineer available, prioritize:
1) tiny tier + board matrix stability
2) ingestion automation
3) medium/heavy expansion

---

## 9) Tomorrow-Morning Action Pack
1. Confirm v1 recommended boards and freeze them.
2. Finalize intent taxonomy for top 20 user tasks.
3. Create initial dataset folder structure and schema validators.
4. Open implementation tickets by phase/milestone.
5. Pick one KPI dashboard view for daily standup use.
