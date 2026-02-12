# INFI AI Checklists (Fast, Repeatable)

_Last updated: 2026-02-12_

This file turns the canonical docs into checkbox-ready runbooks so overnight blocks can ship concrete progress without drifting.

## 1) Board promotion gate checklist (Beta -> Recommended)
- [ ] 10 consecutive clean CI builds for board environment
- [ ] Routing score meets tier threshold on board benchmark prompt set
- [ ] 0 unmapped actions in regression
- [ ] Soak test passes (duration per tier)
- [ ] OTA firmware update verified
- [ ] OTA KB update verified
- [ ] Rollback rehearsal verified (firmware + KB)
- [ ] Support runbook complete (known issues + recovery + limits)
- [ ] Board revision/BOM drift policy documented for this board

## 2) Dataset release checklist (KB manifest)
- [ ] JSON lint + schema validate passes
- [ ] Semantic validate passes (capability/action/intent integrity)
- [ ] Tier budgets pass (size hard-fail thresholds)
- [ ] Manifest generated + checksums present
- [ ] Manifest signature generated
- [ ] Firmware runtime integration test verifies signature + tuple
- [ ] HIL smoke on all recommended boards using new KB artifacts
- [ ] Safety report confirms 0 orphan intents + 0 unmapped actions
- [ ] Release notes: what changed + rollback trigger conditions

## 3) RF expansion checklist (enable or promote RF lane)
- [ ] RF lane identified (RF-L1/RF-L2/RF-L3)
- [ ] Legal/compliance checklist signed off for any transmit-adjacent capabilities
- [ ] RF regression suite green (scan stability + parse integrity + UI latency)
- [ ] Concurrency limits documented per board (throttle policy)
- [ ] Safety confirmations enforced (no default transmit)
- [ ] Telemetry counters in place (RF failures, resets, latency spikes)

## 4) Cloud model routing quality checklist
- [ ] Task classes mapped: strategy / triage / digest / device-runtime
- [ ] Output schemas defined and validated (JSON contracts where used)
- [ ] One retry policy for schema failures
- [ ] Prompt/version hashes persisted
- [ ] Weekly eval set run shows >=95% schema conformance
- [ ] Drift flags reviewed; severe drift blocks promotion
