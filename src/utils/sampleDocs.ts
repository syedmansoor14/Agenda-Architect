export interface SampleDoc {
  id: string;
  title: string;
  category: string;
  description: string;
  meetingSuggestion: {
    duration: number;
    type: 'Decision-Making' | 'Strategic Planning' | 'Project Sync & Status' | 'Brainstorming' | 'Review & Retro';
  };
  content: string;
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'product-rfc',
    title: 'RFC-204: Next-Gen AI Workspace & Realtime Collaboration',
    category: 'Product & Tech RFC',
    description: 'Technical spec proposing new collaborative canvas, AI suggestions, and architecture migration.',
    meetingSuggestion: {
      duration: 45,
      type: 'Decision-Making',
    },
    content: `# RFC-204: Next-Gen AI Workspace & Realtime Collaboration

**Authors:** Elena Rostova (Staff Product Architect), Marcus Vance (Lead Tech Lead)
**Stakeholders:** Engineering (Backend & Frontend), Product Management, Security & Compliance, DevOps
**Status:** In Review — Target Decision by end of week

## 1. Executive Summary & Problem Statement
Our enterprise customers report a 42% drop in workflow efficiency when context-switching between separate document editors, whiteboard tools, and AI copilot scratchpads. RFC-204 proposes merging these modalities into a unified, canvas-first workspace powered by real-time CRDT synchronization and server-side generative AI orchestration.

## 2. Proposed Architecture & Core Innovations
- **Realtime Sync Layer:** Migrate from polling WebSocket state to Yjs-based CRDTs hosted on distributed Cloud Run containers with Cloud Pub/Sub backplane.
- **Latency Target:** Sub-50ms peer-to-peer visual delta propagation across geo-distributed teams.
- **AI Assist Engine:** Inline context injection querying internal document graph with Gemini 3.7 Flash models.
- **Offline Resiliency:** IndexedDB persistent snapshot caching with conflict-free deterministic merge upon reconnection.

## 3. Key Trade-offs & Open Debates
1. **Database Persistence:** Should we store document snapshots in PostgreSQL JSONB with WAL streaming, or use Cloud Firestore with native sub-document listeners?
   - *Backend Team preference:* PostgreSQL for audit trail compliance.
   - *Frontend/Mobile preference:* Firestore for instant offline listener sync.
2. **AI Rate Limiting & Token Costs:** Enterprise tier needs predictable budget guardrails ($1.20 per active monthly seat limit).
3. **Migration Window:** Legacy document converter needs a 3-week dual-write bridge to prevent data loss for 180,000 existing enterprise dossiers.

## 4. Resource & Timeline Estimates
- **Phase 1 (Sprint 1-3):** Core CRDT engine & canvas prototype (Lead: Marcus Vance, 3 senior engineers).
- **Phase 2 (Sprint 4-5):** AI Copilot tool integration & permission boundaries (Lead: Dr. Chen, AI Research).
- **Phase 3 (Sprint 6):** Enterprise Security Audit & SOC2 certification sign-off (Lead: Sarah Jenkins, Infosec).
- **Public Beta:** Target Q3 launch date.

## 5. Required Decisions for This Meeting
1. Approval of CRDT stack (Yjs vs Automerge).
2. Resolution on PostgreSQL vs Firestore persistence architecture.
3. Budget authorization for $45,000 preliminary cloud infrastructure load testing.
4. Finalize lead assignees for Phase 1 deliverables.`,
  },
  {
    id: 'qbr-growth',
    title: 'Q2 Executive Business Review & H2 Growth Strategy',
    category: 'Executive Strategy',
    description: 'Strategic review of Q2 revenue metrics, customer acquisition costs, and proposed expansion plan.',
    meetingSuggestion: {
      duration: 60,
      type: 'Strategic Planning',
    },
    content: `# Q2 Executive Business Review & H2 Strategic Growth Plan

**Presented by:** VP of Growth & Finance Leadership
**Audience:** Executive Team (CEO, CRO, CTO, VP Product, VP Customer Success)

## 1. Q2 Financial & Operational Highlights
- **Annual Recurring Revenue (ARR):** $18.4M (+28% YoY, beating target of $17.8M).
- **Net Revenue Retention (NRR):** 116%, bolstered by mid-market expansion.
- **Customer Acquisition Cost (CAC):** Decreased by 14% to $4,200 per enterprise logo due to inbound content flywheels.
- **Gross Margin:** 78.5% (down 1.2% due to increased cloud infrastructure usage).

## 2. Key Challenges & Bottlenecks
- **Enterprise Sales Cycle:** Lengthened from 64 days to 89 days, primarily driven by strict corporate security reviews and vendor onboarding friction.
- **Customer Support SLA Breaches:** Tier-2 technical support backlog increased 35% following the May major platform update.
- **Tier 1 Churn:** 3 large accounts ($240k combined ARR) churned due to missing advanced role-based access control (RBAC) and SAML SSO self-serve configuration.

## 3. Proposed Strategic Pillars for H2
### Pillar 1: Enterprise Trust & Velocity Initiative
- Standardize ISO-27001 self-serve trust portal to cut sales review cycles by 20 days.
- Prioritize custom RBAC, audit logging, and automated user provisioning (SCIM).
- Budget: $220,000 development allocation.

### Pillar 2: AI-Powered Customer Success & Triage
- Deploy automated tier-1 triage assistant to reduce ticket resolution time from 14 hours to 45 minutes.
- Expand proactive health score monitoring for accounts with declining weekly active users.

### Pillar 3: International Expansion (EMEA)
- Set up London satellite entity and local compliance data residency in Frankfurt.
- Initial hiring quota: 2 Enterprise Account Executives, 1 Solutions Architect.

## 4. Key Questions & Approvals Needed
- Do we allocate $600,000 discretionary reserve to accelerate EMEA hiring in August?
- Product roadmap trade-off: Should we delay consumer-facing features by 4 weeks to complete Enterprise RBAC/SCIM?
- Align on revenue target for H2: Base Plan ($22M ARR) vs Stretch Plan ($24.5M ARR).`,
  },
  {
    id: 'incident-postmortem',
    title: 'Post-Mortem & Remediation: June 12 API Gateway Outage',
    category: 'Engineering & Operations',
    description: 'Blameless post-mortem of a 47-minute production degraded state with preventative action items.',
    meetingSuggestion: {
      duration: 30,
      type: 'Review & Retro',
    },
    content: `# Blameless Post-Mortem: Incident #4089 - Production API Gateway Latency Spike

**Date of Incident:** June 12, 2026 (14:22 UTC - 15:09 UTC)
**Impact:** 47 minutes total duration, 14.8% error rate on public API requests, 38 customer-reported incidents.
**Facilitator:** Site Reliability Engineering (SRE) & Core Platform Team

## 1. Timeline of Events
- **14:20 UTC:** Routine configuration deployment v4.19.2 pushed to API Gateway Envoy instances.
- **14:22 UTC:** Health check flap triggered circuit-breaker cascading restarts across 4 availability zones.
- **14:29 UTC:** Automated PagerDuty escalation paged Primary On-Call Engineer.
- **14:38 UTC:** Incident Commander declared SEV-1 and initiated war room bridge.
- **14:52 UTC:** Root cause identified: regex backtracking in authentication token validator header parser causing CPU starvation.
- **15:04 UTC:** Rollback to v4.19.1 completed; traffic re-routed through stable clusters.
- **15:09 UTC:** Error rate returned to baseline (0.01%); all downstream services nominal.

## 2. Root Cause Analysis (5 Whys)
1. *Why did the gateway fail?* Envoy worker threads hit 100% CPU saturation and missed health heartbeats.
2. *Why did CPU saturate?* A newly deployed JWT header sanitizer regex had exponential time complexity on nested bracketed scopes.
3. *Why wasn't this caught in staging?* Synthetic test suites tested valid token payloads, but did not test malformed multi-scoped tokens.
4. *Why did the rollback take 26 minutes?* Rollback script had hardcoded canary stabilization wait timers that could not be manually bypassed during emergency incidents.

## 3. Proposed Remediation Items & Owners
- **Action 1:** Replace regex parser with linear-time string scanner (Owner: David K., PR by Thursday).
- **Action 2:** Introduce fuzz-testing suite for all Envoy filters (Owner: QA Automation, Due: July 1).
- **Action 3:** Implement instant one-click break-glass rollback pipeline for emergency SEV-1s (Owner: DevOps/Infra).
- **Action 4:** Update On-Call runbooks and conduct team chaos engineering drill (Owner: SRE Lead).

## 4. Agenda Objectives for This Meeting
- Confirm technical consensus on linear scanner rewrite.
- Establish priority and sprint resource allocations for the 4 remediation items.
- Review communication template for affected enterprise customers.`,
  },
];
