import type { Module } from '../types'
import { DIAGRAM_REF_ARCH } from '../diagrams'

export const modules: Module[] = [
  {
    id: 'm17',
    number: 17,
    title: 'Architecture patterns for ISC integrations',
    shortTitle: 'Architecture',
    estTime: '3–4 hr',
    goal: 'Pick durable patterns: sync vs async, ownership, and anti-corruption boundaries',
    trackId: 'track-4',
    fluencyPhaseId: 'phase-7',
    labs: ['lab-capstone-h', 'lab-decision-extension'],
    outcomes: [
      'Draw reference architectures for ITDR, JML bridge, and peer provisioner.',
      'Separate ISC domain language from upstream HR/ITSM models (anti-corruption).',
      'Choose sync request/response vs queue/workflow handoff deliberately.',
    ],
    whenToUse: [
      'Solution architecture / ADR kickoff',
      'Multi-system programs (HR + ITSM + ISC + SOAR)',
    ],
    whenNot: [
      'Single filter syntax questions (M5)',
      'One-off Postman exploration',
    ],
    sections: [
      {
        id: 'patterns',
        title: 'Reference patterns',
        blocks: [
          {
            type: 'paragraph',
            text: 'Why this matters: without a shared picture, teams reinvent point-to-point scripts — ITDR calling Search, HR PATCHing the same attributes a connector owns, and peer clone bypassing approvals.',
          },
          {
            type: 'diagram',
            title: 'Reference architecture sketch',
            mermaid: DIAGRAM_REF_ARCH,
            caption:
              'ITDR/SIEM → lifecycle API; HR → aggregation; ISC → target apps; peer provisioner → access requests; compliance → certifications/search.',
          },
          {
            type: 'table',
            headers: ['Pattern', 'Skeleton'],
            rows: [
              ['ITDR disable', 'SOAR → REST/SDK → resolve identity → set Terminated → verify'],
              ['Compliance bridge', 'Scheduler → CSV/API → rules engine → lifecycle/requests → dry-run'],
              ['Peer provisioner', 'HR event → compare peer access → access requests → approvals'],
              ['Source of truth', 'Connector aggregate → transforms → identity → provision out'],
            ],
          },
          {
            type: 'list',
            items: [
              'Anti-corruption: map external employeeStatus → ISC lifecycle names explicitly.',
              'Idempotency: key on identity id + desired state; safe retries.',
              'Async provisioning: HTTP success ≠ all accounts disabled yet — design verification windows.',
            ],
          },
          {
            type: 'quiz',
            id: 'm17:patterns:1',
            prompt: 'Peer provisioner should grant a peer’s roles by…',
            choices: [
              { id: 'a', label: 'Direct entitlement assignment APIs to skip approvals' },
              { id: 'b', label: 'Submitting access requests so governance still applies' },
              { id: 'c', label: 'Only aggregating HR and hoping transforms copy access' },
              { id: 'd', label: 'Hardcoding role GUIDs from sandbox into prod' },
            ],
            correctId: 'b',
            explanation:
              'Peer clone is an access-request pattern — preserve approvals, SoD, and audit. Do not bypass governance with raw grants.',
          },
        ],
      },
      {
        id: 'adr',
        title: 'ADR minimum contents (July 2026)',
        blocks: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Auth: PAT per integration; vault; scopes',
              'Versioning: /service/vN only; SDK 2.x',
              'Runtime: language + SDK vs REST caller',
              'Dry-run, verify GET, observability',
              'Migration deadline awareness (Q2 2028 / Q1 2029)',
            ],
          },
        ],
      },
    ],
    failureModes: [
      'Point-to-point scripts with no owner or SLO.',
      'Leaking HR enums straight into lifecycle APIs.',
      'Dual writers (HR aggregate + API PATCH) fighting on same attributes.',
    ],
    enterpriseChecklist: [
      'Architecture diagram in repo',
      'ADR accepted by security + IAM',
      'Failure/retry matrix',
      'Data retention / PII logging policy',
      'Environment promotion path',
    ],
    checkpoints: [
      {
        id: 'm17-d1',
        prompt: 'What belongs in a July 2026 ISC integration ADR?',
        answer:
          'Auth/secrets, SDK vs REST, per-service version pins, dry-run/verify, observability, and migration deadline posture.',
      },
      {
        id: 'm17-d2',
        prompt: 'Why use an anti-corruption layer for HR status?',
        answer:
          'HR enums ≠ ISC lifecycle names; explicit mapping prevents silent wrong state transitions across tenants.',
      },
    ],
  },
  {
    id: 'm18',
    number: 18,
    title: 'Production operations — reliability, security, observability',
    shortTitle: 'Production ops',
    estTime: '3–4 hr',
    goal: 'Operate integrations like production software, not desk scripts',
    trackId: 'track-4',
    fluencyPhaseId: 'phase-7',
    labs: ['lab-capstone-h'],
    outcomes: [
      'Implement token reuse, 429 backoff, and pagination budgets.',
      'Log request/correlation IDs without secrets or unnecessary PII.',
      'Define SLOs for disable and access-request automations.',
    ],
    whenToUse: [
      'Production readiness review',
      'Incident retrospectives on failed JML/ITDR runs',
    ],
    whenNot: [
      'Learning filters for the first time (M5)',
    ],
    sections: [
      {
        id: 'ops-topics',
        title: 'Ops topics that matter',
        blocks: [
          {
            type: 'list',
            items: [
              'Secrets: PAT per integration; rotate; revoke on offboarding; keyring local / vault prod.',
              'Idempotency & verify: GET before/after mutations (project standard).',
              'Rate limits: ~100 req / access_token / 10s order of magnitude — batch and backoff.',
              'Object ID discipline: resolve by name every run.',
              'Change management: pin /service/vN; experimental non-prod; watch X-Deprecated.',
              'Observability: request IDs, named PATs, dashboards on error rates and lag.',
            ],
          },
          {
            type: 'code',
            language: 'typescript',
            code: `async function withRetry<T>(fn: () => Promise<T>, attempt = 1): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    if (e?.status === 429 && attempt < 5) {
      await new Promise((r) => setTimeout(r, 250 * 2 ** attempt));
      return withRetry(fn, attempt + 1);
    }
    throw e;
  }
}`,
          },
        ],
      },
      {
        id: 'slo',
        title: 'Example SLO framing',
        blocks: [
          {
            type: 'table',
            headers: ['Flow', 'SLO sketch'],
            rows: [
              ['ITDR disable accept', 'API accept < 30s; verify lifecycle visible < 2m'],
              ['Access request submit', 'Submit success < 1m; track approval separately'],
              ['Nightly compliance', 'Finish dry-run report before change window'],
            ],
          },
        ],
      },
    ],
    failureModes: [
      'Logging bearer tokens or full identity payloads.',
      'No alarms on 401 spikes after PAT expiry.',
      'Fire-and-forget mutations with no verify.',
    ],
    enterpriseChecklist: [
      'Runbook with PAT rotation',
      'Dashboards + on-call owner',
      'Dry-run in lower env required before prod mutate',
      'PII redaction in logs',
      'Deprecation header alerts',
    ],
    checkpoints: [
      {
        id: 'm18-d1',
        prompt: 'Name three production craft requirements after a lifecycle mutation.',
        answer:
          'Verify with GET (before/after), structured logs with request IDs (no secrets), and clear owner/SLO for async provisioning lag.',
      },
      {
        id: 'm18-d2',
        prompt: 'How do you respond to 429s correctly?',
        answer:
          'Reuse one token, reduce concurrency, exponential backoff with jitter, and respect bulk/pagination design — do not stampede new tokens.',
      },
    ],
  },
  {
    id: 'm19',
    number: 19,
    title: 'Migration programs — yearly to per-service at scale',
    shortTitle: 'Migration programs',
    estTime: '3–4 hr',
    goal: 'Run an org-wide migration with inventory, scripts, and executive dates',
    trackId: 'track-4',
    fluencyPhaseId: 'phase-2',
    labs: ['lab-capstone-d', 'lab-capstone-h'],
    outcomes: [
      'Build an inventory across scripts, SDKs, workflows, and ITSM.',
      'Apply official migration scripts + path tables; quarantine V2 outliers.',
      'Communicate Q2 2028 support end and Q1 2029 hard EOL.',
    ],
    whenToUse: [
      'Enterprise IAM platform programs',
      'Post–July 2026 versioning strategy updates',
    ],
    whenNot: [
      'Single-file rewrite with no dependents (still use the table, but skip PMO theater)',
    ],
    sections: [
      {
        id: 'program',
        title: 'Program shape',
        blocks: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Inventory: repos, workflow HTTP actions, ServiceNow, RPA, notebooks.',
              'Classify: already /service/vN, yearly, /latest, experimental.',
              'Automate: SDK migration scripts (TS/Python/Go/PS) + Workflow Analyzer.',
              'Manual: V2 outliers (e.g. some entitlements / access-request-config).',
              'Prove: contract tests; dual-run if needed; cut /latest.',
              'Govern: CI deny-lists for /v2024|/v2025|/v2026|/latest in new code.',
            ],
          },
          {
            type: 'links',
            items: [
              {
                label: 'API versioning migration guide',
                href: 'https://developer.sailpoint.com/docs/api/api-versioning-migration/',
              },
              {
                label: 'Strategy update (2026-07-14)',
                href: 'https://developer.sailpoint.com/discuss/t/api-versioning-strategy-update-whats-changed-and-how-to-migrate/216376',
              },
            ],
          },
        ],
      },
      {
        id: 'comms',
        title: 'Leadership one-liner',
        blocks: [
          {
            type: 'callout',
            tone: 'info',
            title: 'Say this',
            text: 'Per-service versioning is current. Legacy yearly/v3/beta remain until Q1 2029; support tickets through Q2 2028. We pin /service/vN and SDK 2.x — /latest is not a production strategy.',
          },
        ],
      },
    ],
    failureModes: [
      'Migrating app code but not workflows.',
      'Big-bang without inventory — surprise ITSM breakages.',
      'Declaring done when SDKs upgraded but /latest cron remains.',
    ],
    enterpriseChecklist: [
      'Inventory spreadsheet / SCORE ticket set',
      'Workflow Analyzer evidence',
      'V2 outlier register',
      'CI lint for banned path prefixes',
      'Executive timeline published',
    ],
    checkpoints: [
      {
        id: 'm19-d1',
        prompt: 'Outline a migration plan for v2024 scripts, v2025 workflows, and one /latest job.',
        answer:
          'Inventory → map via official table → SDK migration scripts for code → Workflow Analyzer for HTTP actions → replace /latest with pinned /service/vN → test → track to Q2 2028/Q1 2029.',
      },
      {
        id: 'm19-d2',
        prompt: 'Why call out V2 outliers explicitly?',
        answer:
          'Not every legacy path maps to v1; blind search-replace to /v1 breaks entitlements/config endpoints that moved to v2.',
      },
    ],
  },
  {
    id: 'm20',
    number: 20,
    title: 'Capstone portfolio overview',
    shortTitle: 'Capstone portfolio',
    estTime: 'ongoing',
    goal: 'Prove senior delivery via labs A–H spanning REST, SDK, extensibility, and ADR',
    trackId: 'track-4',
    fluencyPhaseId: 'phase-8',
    labs: [
      'lab-capstone-a',
      'lab-capstone-b',
      'lab-capstone-c',
      'lab-capstone-d',
      'lab-capstone-e',
      'lab-capstone-f',
      'lab-capstone-g',
      'lab-capstone-h',
      'lab-impl-rest-client',
      'lab-impl-sdk-ts',
      'lab-decision-extension',
    ],
    outcomes: [
      'Complete or design Path A capstones A–D on current /service/vN paths.',
      'Deliver Path B capstones E–H: transform, workflow, connector, ADR.',
      'Pass decision drills that force extension-point selection under constraints.',
    ],
    whenToUse: [
      'End of Path B / interview prep / team enablement demos',
    ],
    whenNot: [
      'Skipping foundations — do not start here cold',
    ],
    sections: [
      {
        id: 'portfolio',
        title: 'Portfolio map',
        blocks: [
          {
            type: 'table',
            headers: ['Lab', 'Proves'],
            rows: [
              ['A Emergency disable', 'REST integration spec + lifecycle by name'],
              ['B Compliance bridge', 'SDK automation + dry-run'],
              ['C Peer provisioner', 'Access requests + SDK 2.x naming'],
              ['D Migration advisory', 'Program timeline + tooling'],
              ['E Transforms', 'JSON transform design'],
              ['F Workflow', 'HTTP actions on /service/vN'],
              ['G Connector', 'SaaS Connectivity sketch'],
              ['H ADR', 'Senior standards doc'],
            ],
          },
          {
            type: 'callout',
            tone: 'tip',
            title: 'How to use',
            text: 'Treat labs as evidence pack for promotion/interview. Link modules M4–M19 as citations inside each deliverable.',
          },
        ],
      },
      {
        id: 'bar',
        title: 'Definition of done (senior)',
        blocks: [
          {
            type: 'list',
            items: [
              'Current paths only (/accounts/v1 style); SDK methods *V1/*V2.',
              'Name→id resolution; verify GETs; dry-run where mutating bulk.',
              'Explicit whenNot: transform vs rule vs workflow vs connector justified.',
              'Secrets story; no credentials in artifacts.',
            ],
          },
        ],
      },
    ],
    failureModes: [
      'Capstone still demos /v2026 as “the” standard.',
      'Beautiful ADR with no inventory or lab evidence.',
      'Connector capstone that is actually a cron script.',
    ],
    enterpriseChecklist: [
      'All A–H briefs read',
      'At least one REST + one SDK + one extensibility artifact complete',
      'Decision lab scenarios answered with rationale',
      'Personal glossary of tenant-specific names to resolve',
    ],
    checkpoints: [
      {
        id: 'm20-d1',
        prompt: 'Which labs prove extensibility vs API craft?',
        answer:
          'Extensibility: E transforms, F workflow, G connector, decision lab. API craft: A–C, REST/SDK implementation labs.',
      },
      {
        id: 'm20-d2',
        prompt: 'What must every mutator capstone show?',
        answer:
          'Resolve by name, pin /service/vN or SDK V1 methods, and verify with GET (plus dry-run for bulk).',
      },
      {
        id: 'm20-d3',
        prompt: 'Point to the lab for an architecture decision record.',
        answer: 'lab-capstone-h (ADR) — also supported by M17–M19 content.',
      },
    ],
  },
]
