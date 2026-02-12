# INFI AI Cloud Model Base Plan

_Last updated: 2026-02-12 00:50 EST_

Purpose: define the production-ready cloud model base for INFI with deterministic routing, cost guardrails, and auditable safety behavior.

---

## 1) Target Cloud Model Topology

### Router tiers
1. **Tier-R (Reasoning):** premium model for difficult planning/debug tasks.
2. **Tier-F (Fast):** low-latency model for intent triage, extraction, and short transformations.
3. **Tier-S (Safety/Policy):** constrained classifier for risk labeling and outbound policy checks.
4. **Tier-O (Offline fallback):** local deterministic parser + rules (no cloud dependency).

### Control-plane services
- `model-router` service (single entrypoint)
- `policy-engine` (task risk + data class + provider allowlist)
- `cost-governor` (daily/weekly hard caps)
- `trace-ledger` (request/response hash + decision path)

---

## 2) Request Classification Contract

Each request must be tagged before provider call:
- `task_type`: classify|summarize|plan|code|firmware|rf|ops
- `risk_class`: safe|sensitive|restricted-rf
- `data_class`: public|internal|confidential
- `latency_slo_ms`: 300|1000|3000
- `budget_class`: low|med|high

Routing policy:
- `restricted-rf` -> block direct execution suggestions; planning-only output with compliance note.
- `confidential` -> providers on explicit allowlist only.
- If budget depleted -> degrade to Tier-F or Tier-O (never silently exceed cap).

---

## 3) Provider Abstraction (Implementation Shape)

```ts
interface ModelRouter {
  route(req: RoutedRequest): Promise<RoutedResponse>
}

interface RoutedRequest {
  taskType: string
  riskClass: 'safe'|'sensitive'|'restricted-rf'
  dataClass: 'public'|'internal'|'confidential'
  latencySloMs: number
  maxCostUsd: number
  preferredQuality: 'high'|'balanced'|'fast'
  prompt: string
}
```

Required response envelope:
- chosen provider/model
- estimated + actual token/cost
- policy checks run + result
- fallback chain used
- trace_id

---

## 4) Spend and Reliability Controls

### Spend controls
- Hard daily budget (global + per-workstream)
- Per-request max cost
- Burst limiter (N high-tier calls per 10 minutes)
- Automatic downgrade path with explicit reason code (`BUDGET_CAP`, `LATENCY_BREACH`, `PROVIDER_DOWN`)

### Reliability controls
- Provider health cache (p50/p95 latency, 5xx rate, timeout rate)
- circuit-breaker per provider/model
- retry policy: 1 fast retry for transient errors, then failover
- deterministic fail-closed behavior for policy uncertainty

---

## 5) Security and Audit Minimums

- Redact secrets before outbound call (token/credential pattern scrub)
- Encrypted logs at rest for traces
- Immutable audit record for model decisions
- 30-day searchable trace index + export endpoint
- No prompt payload logging for confidential class unless explicit debug mode is enabled

---

## 6) First Execution Backlog (48h)

1. Define `model-router` API + policy YAML schema.
2. Add provider adapter stubs (R/F/S lanes).
3. Implement risk/data preflight classifier.
4. Add cost ledger + hard cap enforcement.
5. Emit trace record per call with reason codes.
6. Add synthetic tests: budget cap, failover, restricted-rf blocking.

---

## 7) Metrics (Ship Gates)

- Route decision trace coverage: **100%**
- Budget cap violation: **0**
- p95 latency by class within SLO: **>=95% days**
- Fallback success rate on provider outage drills: **>=99%**
- Restricted-rf policy bypasses: **0**

---

## 8) Risks

- Over-fragmented model stack increases maintenance overhead.
- Cost spikes from unbounded reasoning calls if tags are missing.
- Hidden confidential leakage risk without robust preflight redaction.

Mitigation: strict request schema validation + fail-closed defaults.
