> Canonical status (2026-02-12): Commercial model remains active and is now linked to execution gates and hardware tiers in:
> - `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md`
> - `docs/INFI-AI-ROADMAP-AND-OPERATING-RHYTHM.md`

# INFI AI Revenue Paths (Roadmap-Aligned)

> Alignment note (2026-02-12): Commercial sequencing is cross-linked with the unified execution plan in `docs/INFI-AI-MASTER-IMPLEMENTATION-GUIDE.md`.

_Last updated: 2026-02-14_

## Goal
Monetize INFI AI in ways that directly reinforce:
1. Embedded tier rollout (tiny/medium/heavy)
2. Device support matrix discipline
3. Cloud operational intelligence value

Approach is intentionally startup-realistic: low operational overhead, clear upsell path, and pricing tied to concrete user value.

---

## 1) Product Packaging Strategy

## Free / Community
- Basic firmware utilities + limited assistant commands
- Tiny-tier behavior only on selected devices
- Community docs and basic support

Purpose: acquisition funnel and adoption growth.

## Pro (Individual Power User)
- Full medium-tier assistant features on supported devices
- Expanded local KB packs and troubleshooting cards
- Cloud companion access (history, deeper Q/A, weekly digest)

Purpose: convert serious users without requiring enterprise sales motion.

## Team / Lab (Small Org)
- Multi-device management
- Shared cloud workspace + report exports
- Priority compatibility updates for recommended boards
- Early beta access to heavy-tier features
- **Funded validation lane:** access to selected high-support Beta boards (e.g., RF variants) only when the plan price covers the added regression + compliance workload (see `docs/INFI-AI-DECISION-LOG.md`, e.g. DL-2026-02-13-01)

Purpose: higher ARPU from teams using multiple devices/workflows (and a mechanism to *pay for* support-expensive expansion).

## OEM / Partner (Selective)
- Custom board profile support
- private-branded KB packs and action maps
- integration support and release validation windows

Purpose: high-margin B2B lane without broad custom-services burden.

---

## 2) Tier-to-Revenue Mapping

| Technical Tier | User Value | Monetization Fit |
|---|---|---|
| Tiny | Reliable core actions on constrained hardware | included in free/community, helps adoption |
| Medium | Better assistant UX, richer local support | main Pro plan differentiator |
| Heavy | Advanced troubleshooting, richer context, optional voice keyword paths | premium Pro+ or Team feature |
| Cloud layer | daily insights, roadmap guidance, multi-device intelligence | recurring subscription anchor |

Key principle: **do not gate safety-critical behavior**, gate convenience/intelligence depth.

---

## 3) 3-Stage Monetization Rollout

## Stage 1 (0-2 months): Validate willingness to pay
- Offer Pro early-access plan around medium-tier + cloud weekly digest.
- Keep pricing simple (single monthly tier).
- Include a clear value metric: faster troubleshooting + better board support confidence.

## Stage 2 (2-4 months): Increase retention
- Add cloud daily digest, assistant history, and device-level health snapshots.
- Introduce Team plan with shared workspace and priority support SLA targets.
- Launch premium KB packs (advanced troubleshooting domains).

## Stage 3 (4-6 months): Expand high-margin lanes
- Add OEM/partner path for custom board bundles.
- Bundle “certified recommended board kits” with subscription discounts.
- Consider annual prepay option to improve cash flow.

---

## 4) Pricing Structure (Practical Starting Point)

Suggested initial ranges (to test, not final):
- **Pro:** $12-$24 / month
- **Team:** $49-$149 / month depending on seats/devices
- **OEM/Partner:** custom (setup fee + recurring support)

Startup guidance:
- Start narrow with one Pro price point.
- Avoid too many SKUs in first 60 days.
- Use promotion only for launch cohorts, not permanent discounts.

---

## 5) Revenue Levers Connected to Deliverables

## From execution plan
- Daily cloud digest and roadmap scoring become recurring value -> subscription retention.

## From device matrix
- “Recommended” devices become support-guaranteed lane -> lower support cost + stronger conversion.
- “Beta-capable” lane can be gated to Pro/Team testers -> monetized early-access community.

## From integration plan
- Versioned KB packs and compatibility manifests -> paid premium packs and enterprise confidence.

---

## 6) Fastest Near-Term Revenue Bets
1. **Pro subscription for medium-tier + cloud digest** (fastest, least complexity)
2. **Recommended device bundles** (hardware margin + subscription attach rate)
3. **Team plan with shared analytics/reporting** (higher ARPU from existing power users)

Defer for later:
- Full marketplace/plugin economy
- Broad per-feature microtransactions
- Heavy custom enterprise commitments without standardized onboarding

---

## 7) Metrics to Track Weekly
- Free -> Pro conversion rate
- Pro monthly churn
- Attach rate: subscription per recommended-board sale
- Average support time per device classification (recommended vs beta)
- Cloud digest engagement (open/use in decisions)
- Revenue share by lane (individual vs team vs OEM)

If support cost per beta device is too high, tighten beta access and focus on recommended devices.

---

## 8) Risk Controls

1. **Overpromising hardware support**
   - Publish strict recommended/beta/unsupported matrix and keep it current.
   - Any **exception** board (below scoring threshold) must be explicitly labeled “funded validation only” and tied to a Decision Log entry with cancellation gates.

2. **Underpricing high-touch support**
   - Gate priority support to Team/OEM tiers.

3. **Feature bloat before PMF**
   - Tie roadmap to conversion/retention metrics, not just feature requests.

4. **Cloud cost drift**
   - Keep ingest/reporting efficient first; add expensive intelligence features only when paid usage supports it.

---

## 9) Tomorrow-Morning Commercial Actions
1. Pick one launch Pro price and one Team starter price.
2. Define the exact Pro feature checklist (medium tier + cloud digest + update cadence).
3. Publish initial support matrix badges: Recommended / Beta / Unsupported.
4. Add a simple upgrade CTA in existing control UI.
5. Start weekly KPI tracking sheet with conversion/churn/support-cost columns.
