# INFI AI Cloud Model Base Plan

_Last updated: 2026-02-12 02:35 EST_

Purpose: define the production-ready cloud model base for INFI with deterministic routing, cost guardrails, and auditable safety behavior.

---

## 1) Target Cloud Model Topology

### Router tiers
1. **Tier-R (Reasoning):** premium model for difficult planning/debug tasks.
2. **Tier-F (Fast):** low-latency model for intent triage, extraction, and short transformations.
3. **Tier-S (Safety/Policy):** constrained classifier for risk labeling + outbound policy checks.
4. **Tier-O (Offline fallback):** local deterministic parser + rules (no cloud dependency).

### Control-plane services
- `model-router` service (single entrypoint)
- `policy-engine` (task risk + data class + provider allowlist)
- `cost-governor` (daily/weekly hard caps)
- `trace-ledger` (request/response hash + decision path)

---

## 2) Request Classification Contract (Fail-Closed)

Each request must be tagged **before** any provider call:
- `task_type`: classify|summarize|plan|code|firmware|rf|ops
- `risk_class`: safe|sensitive|restricted-rf
- `data_class`: public|internal|confidential
- `latency_slo_ms`: 300|1000|3000
- `budget_class`: low|med|high

Fail-closed defaults:
- Missing tag(s) => treat as `risk_class=sensitive` + `data_class=internal` + route to Tier-F with strict caps.
- `restricted-rf` => **planning-only** output; no step-by-step enablement guidance; include compliance note.
- `confidential` => providers on explicit allowlist only; prefer Tier-O if the request can be satisfied via local corpora.

---

## 3) Routing Policy (Deterministic)

Routing is a pure function of tags + health + budget.

### Preferred route table (initial)
| Condition | Default route | Notes |
|---|---|---|
| `task_type=plan` and `budget_class=high` | Tier-R | Use for architecture, integration plans, hard debugging |
| `task_type=code` and `latency_slo_ms<=1000` | Tier-F | Use for diffs, refactors, quick fixes |
| `task_type=classify` or `summarize` | Tier-F | Keep prompts short + structured output |
| `risk_class=sensitive` | Tier-S then Tier-F/R | Tier-S provides allow/deny + redaction guidance |
| `risk_class=restricted-rf` | Tier-S then Tier-R (plan-only) | Explicitly blocks certain outputs |
| Budget depleted | Tier-F then Tier-O | Never silently exceed cap |
| Provider degraded | Failover chain | Reason-coded and logged |

### Required reason codes
Every decision emits a reason code list (ordered):
- `ROUTE_BY_TAGS`
- `BUDGET_CAP`
- `LATENCY_SLO`
- `PROVIDER_DOWN`
- `POLICY_BLOCK`
- `DATA_CLASS_RESTRICT`
- `FALLBACK_OFFLINE`

---

## 4) Provider Abstraction (Implementation Shape)

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

interface RoutedResponse {
  traceId: string
  provider: string
  model: string
  tokensEstimated?: number
  tokensUsed?: number
  costUsdEstimated?: number
  costUsdActual?: number
  decisionReasons: string[]
  policy: {
    preflight: 'pass'|'block'|'needs_redaction'
    notes?: string
  }
  content: string
}
```

---

## 5) Spend + Reliability Controls

### Spend controls
- Hard daily budget (global + per-workstream)
- Per-request max cost (derived from `budget_class`)
- Burst limiter (N high-tier calls per 10 minutes)
- Automatic downgrade path with explicit reason code

### Reliability controls
- Provider health cache (p50/p95 latency, 5xx rate, timeout rate)
- circuit-breaker per provider/model
- retry policy: 1 fast retry for transient errors, then failover
- deterministic fail-closed behavior for policy uncertainty

---

## 6) Security and Audit Minimums

- Redact secrets before outbound call (token/credential pattern scrub)
- Encrypted logs at rest for traces
- Immutable audit record for model decisions
- 30-day searchable trace index + export endpoint
- No prompt payload logging for `confidential` unless explicit debug mode is enabled

**Trace minimum fields:**
- `trace_id`, timestamp, request tags
- route decision + reason codes
- provider/model selected
- cost + latency
- hash of prompt + hash of response (store hashes even when payload suppressed)

---

## 7) Policy YAML (v0) — single source of truth

Goal: make routing/policy changes auditable and deployable without code edits.

Example `policy.yml` (shape, not final):

```yaml
version: 0
providers:
  - id: openai
    allowedModels:
      reasoning: ["gpt-5-reasoning", "gpt-5.3-codex"]
      fast: ["gpt-5-mini", "gpt-4.1-mini"]
  - id: anthropic
    allowedModels:
      reasoning: ["claude-opus-4"]
      fast: ["claude-sonnet-4"]

budgets:
  dailyUsd:
    global: 25
    byWorkstream:
      firmware: 8
      cloud: 10
      ops: 7

routing:
  defaults:
    failClosed:
      riskClass: sensitive
      dataClass: internal
      lane: fast
  rules:
    - when:
        taskType: plan
        budgetClass: high
      then:
        lane: reasoning
        requireTierSPreflight: true
    - when:
        riskClass: restricted-rf
      then:
        lane: reasoning
        planOnly: true
        requireTierSPreflight: true

redaction:
  enabled: true
  patterns:
    - kind: "api_key"
    - kind: "jwt"
    - kind: "ssh_private_key"

trace:
  logPayloadForConfidential: false
  requiredFields: ["trace_id","tags","decisionReasons","provider","model","cost","latency"]
```

Notes:
- `planOnly:true` is a hard constraint for `restricted-rf` (no procedural enablement).
- All policy evaluation outcomes must emit reason codes; policy changes must be versioned.

---

## 8) First Execution Backlog (48h)

1. Define `model-router` API + **policy YAML schema** (tags + allowlist + caps).
2. Add provider adapter stubs (R/F/S lanes).
3. Implement risk/data preflight classifier (Tier-S).
4. Add cost ledger + hard cap enforcement.
5. Emit trace record per call with reason codes.
6. Add synthetic tests: budget cap, failover, restricted-rf blocking.
7. Add "confidential => payload suppression" tests.

---

## 9) Metrics (Ship Gates)

- Route decision trace coverage: **100%**
- Budget cap violation: **0**
- p95 latency by class within SLO: **>=95% days**
- Fallback success rate on provider outage drills: **>=99%**
- Restricted-rf policy bypasses: **0**

---

## 10) Known Risks

- Over-fragmented model stack increases maintenance overhead.
- Cost spikes from unbounded reasoning calls if tags are missing.
- Confidential leakage risk without robust preflight redaction.

Mitigation: strict request schema validation + fail-closed defaults + trace-ledger always-on.

---

## 11) Canonical Repo Locations (Proposal)

Until the dedicated backend repo is finalized, treat these as **binding conventions** so work doesn’t drift.

- **Policy source of truth:** `infi-ai-cloud-base/policy/policy.yml`
  - versioned + code-reviewed
  - changes require a reason + approval (CODEOWNERS)
- **Policy schema:** `infi-ai-cloud-base/policy/policy.schema.json`
- **Eval harness:** `infi-ai-cloud-base/evals/`
  - `weekly_eval_set.jsonl` (frozen prompts)
  - `eval_runner.ts` (routes through model-router)
  - `goldens/` (expected JSON schema + grading rubric)
- **Trace ledger:** `infi-ai-cloud-base/trace/`
  - `trace.schema.json`
  - `reason_codes.md` (single list; referenced by firmware + UI)

### 11.1 Model base selection procedure (measurable)

A cloud model is eligible for a lane only if it passes:
1. **Schema adherence:** <=5% invalid JSON on `weekly_eval_set.jsonl`.
2. **Actionability:** >=90% reviewer score (could execute without follow-up).
3. **Cost fit:** projected weekly spend within `budgets.dailyUsd`.
4. **Stability:** no more than 1 provider incident/week causing failover for that lane.

Ship rule: any model change must run the eval harness twice (two separate days) and attach diffs to the change request.
