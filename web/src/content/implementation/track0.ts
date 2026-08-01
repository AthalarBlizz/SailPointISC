import type { Module } from '../types'
import {
  DIAGRAM_OBJECT_GRAPH,
  DIAGRAM_AUTH_FLOW,
  DIAGRAM_VERSIONING,
} from '../diagrams'

export const modules: Module[] = [
  {
    id: 'm0',
    number: 0,
    title: 'Platform model — identities, accounts, access, sources',
    shortTitle: 'Platform model',
    estTime: '2–3 hr',
    goal: 'Design integrations against the correct ISC objects and ownership boundaries',
    trackId: 'track-0',
    fluencyPhaseId: 'phase-0',
    outcomes: [
      'Draw the identity → account → entitlement → access profile → role chain from memory.',
      'Explain where lifecycle state sits relative to provisioning and sources.',
      'Decide UI config vs API/SDK vs connector for a given change request.',
    ],
    whenToUse: [
      'Kickoff / discovery for any ISC integration',
      'Architecture reviews where stakeholders confuse accounts with identities',
      'Choosing between access request, direct entitlement grant, and lifecycle change',
    ],
    whenNot: [
      'Deep connector protocol work (see M15–M16)',
      'Auth token troubleshooting (see M1)',
      'Version migration planning (see M2 / M19)',
    ],
    sections: [
      {
        id: 'object-graph',
        title: 'Object graph that drives every call',
        blocks: [
          {
            type: 'paragraph',
            text: 'ISC governs Identities. Accounts are records on Sources. Entitlements hang off accounts/sources. Access profiles bundle entitlements; roles compose business access (often via profiles). Lifecycle states on an identity profile drive joiner/mover/leaver provisioning.',
          },
          {
            type: 'diagram',
            title: 'Platform object graph',
            mermaid: DIAGRAM_OBJECT_GRAPH,
            caption: 'Resolve every object by name at runtime — GUIDs are tenant-specific.',
          },
          {
            type: 'table',
            headers: ['Object', 'Resolved by', 'Typical API surface'],
            rows: [
              ['Identity', 'alias / name / email filter', '/identities/v1'],
              ['Account', 'nativeIdentity + source, or identityId', '/accounts/v1'],
              ['Source', 'name → id', '/sources/v1'],
              ['Lifecycle state', 'name on identity profile', 'identity-profiles …/lifecycle-states'],
              ['Role / AP / entitlement', 'name → id', '/roles/v1, /access-profiles/v1, /entitlements/v2'],
            ],
          },
          {
            type: 'callout',
            tone: 'warn',
            title: 'GUID portability',
            text: 'Never hardcode tenant object IDs. Resolve by name at runtime — IDs differ across sandboxes and prod.',
          },
          {
            type: 'quiz',
            id: 'm0:object-graph:1',
            prompt: 'Emergency offboard should primarily mutate which object?',
            choices: [
              { id: 'a', label: 'A single AD account only' },
              { id: 'b', label: 'Identity lifecycle state (name-resolved)' },
              { id: 'c', label: 'Access request to revoke one entitlement' },
              { id: 'd', label: 'Certification campaign' },
            ],
            correctId: 'b',
            explanation:
              'Lifecycle on the identity drives cascading provisioning. Per-account disable is an edge case for unmanaged sources.',
          },
        ],
      },
      {
        id: 'ownership',
        title: 'Who owns the change?',
        blocks: [
          {
            type: 'list',
            items: [
              'HR / authoritative source → aggregation + identity profile transforms (batch truth).',
              'Security / ITDR → API lifecycle or account disable (seconds).',
              'Business access → access request + approvals (governance).',
              'Net-new SaaS app → OOTB connector, SaaS Connectivity, or customizer — not a nightly script inventing accounts.',
            ],
          },
          {
            type: 'callout',
            tone: 'tip',
            title: 'Say this in design review',
            text: 'Emergency disable sets Terminated (name-resolved) so ISC cascades provisioning. Peer clone submits access requests — it does not bypass approvals.',
          },
        ],
      },
    ],
    failureModes: [
      'Treating account disable on one source as “identity offboarded” without lifecycle.',
      'Hardcoding lifecycle state or role GUIDs from a sandbox into prod scripts.',
      'Building per-app disable loops for managed sources that already provision from lifecycle.',
      'Confusing Search index lag with list-filter freshness for real-time ITDR.',
    ],
    enterpriseChecklist: [
      'Document authoritative source(s) and lag expectations',
      'Name every object type your integration mutates',
      'Confirm governance path (request vs lifecycle vs admin API)',
      'List tenant-specific names to resolve (states, profiles, sources)',
      'Define before/after verification GETs',
    ],
    checkpoints: [
      {
        id: 'm0-d1',
        prompt: 'Identity vs account — one sentence each, plus how they relate.',
        answer:
          'Identity is the person/machine ISC governs. Account is that identity’s record on a specific source. One identity typically has many accounts.',
      },
      {
        id: 'm0-d2',
        prompt: 'When is access request the wrong tool for removing access?',
        answer:
          'Leaver / emergency disable should drive lifecycle (or account disable for unmanaged edge cases), not ask the user to request removal. Access request is for governed grant/change with approvals.',
      },
      {
        id: 'm0-d3',
        prompt: 'Name three extension points that are not “call the public API from a script.”',
        answer:
          'Transforms, rules, workflows, SaaS Connectivity connectors, connector customizers (any three).',
      },
    ],
  },
  {
    id: 'm1',
    number: 1,
    title: 'Authentication, scopes, and least privilege',
    shortTitle: 'Auth & scopes',
    estTime: '2–3 hr',
    goal: 'Ship PAT-based integrations that fail closed and are diagnosable',
    trackId: 'track-0',
    fluencyPhaseId: 'phase-1',
    labs: ['lab-impl-rest-client'],
    outcomes: [
      'Implement client-credentials token acquisition and reuse (~12 min TTL).',
      'Separate PAT owner user level from OAuth scopes when debugging 403.',
      'Specify least-privilege scopes per integration, not sp:scopes:all by default.',
    ],
    whenToUse: [
      'Any greenfield script, service, or integration-spec for another platform',
      'Incident response on 401/403/429',
      'PAT rotation / offboarding of integration identities',
    ],
    whenNot: [
      'End-user interactive OAuth for UI apps (different product surface)',
      'Connector-internal auth to the target SaaS (connector SDK concern)',
    ],
    sections: [
      {
        id: 'pat-flow',
        title: 'PAT + client credentials',
        blocks: [
          {
            type: 'paragraph',
            text: 'Prefer PAT for scripts and automations. Token endpoint is tenant OAuth; modern client IDs are UUID-with-dashes. Rate limit order of magnitude: ~100 requests per access_token per 10 seconds.',
          },
          {
            type: 'diagram',
            title: 'Auth and error classes',
            mermaid: DIAGRAM_AUTH_FLOW,
          },
          {
            type: 'code',
            language: 'bash',
            code: `curl -s -X POST "https://{tenant}.api.identitynow.com/oauth/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials&client_id=$SAIL_CLIENT_ID&client_secret=$SAIL_CLIENT_SECRET"`,
          },
          {
            type: 'code',
            language: 'python',
            code: `from isc_credentials import load_credentials_into_env
from sailpoint.configuration import Configuration

load_credentials_into_env()  # keyring → SAIL_* env
configuration = Configuration()  # SDK refreshes tokens`,
          },
          {
            type: 'callout',
            tone: 'warn',
            title: 'Secrets',
            text: 'OS keychain / vault only. Never commit .env, never paste Client Secret into chat or tickets.',
          },
          {
            type: 'quiz',
            id: 'm1:pat-flow:1',
            prompt: 'Minting a new OAuth token on every API call mainly causes…',
            choices: [
              { id: 'a', label: 'Faster throughput' },
              { id: 'b', label: '429 rate limits and wasted latency' },
              { id: 'c', label: 'Automatic scope elevation' },
              { id: 'd', label: 'Longer token TTL' },
            ],
            correctId: 'b',
            explanation:
              'Reuse one token per run (~12 min TTL). Token spam hits rate limits (~100 req / token / 10s).',
          },
        ],
      },
      {
        id: 'scopes-403',
        title: 'Scopes vs user level',
        blocks: [
          {
            type: 'list',
            items: [
              '401 → missing/expired/invalid token (or wrong base URL).',
              '403 → token OK but authorization failed: missing scope, insufficient user level, or endpoint needs user context client-credentials cannot supply.',
              '429 → back off; reuse one token per run; batch and paginate thoughtfully.',
            ],
          },
          {
            type: 'table',
            headers: ['Integration', 'Scope posture'],
            rows: [
              ['Read-only reporting', 'Specific :read scopes'],
              ['ITDR disable', 'Identity lifecycle + read; document blast radius'],
              ['Access request bot', 'Request create + status; not admin bypass'],
              ['Migration scanner', 'Read-heavy; no mutate in dry-run'],
            ],
          },
        ],
      },
    ],
    failureModes: [
      'New token on every request → 429 and latency.',
      'Legacy undashed client IDs that silently fail auth.',
      'Assuming 403 means “bad secret” and rotating the wrong credential.',
      'Shared PAT across unrelated apps — audit and blast-radius nightmare.',
    ],
    enterpriseChecklist: [
      'Named PAT per integration with owner + rotation date',
      'Scopes listed in the runbook / ADR',
      'Keyring locally; vault/KMS in prod',
      'Revoke on service account offboarding',
      'Log correlation / request IDs without logging secrets',
    ],
    checkpoints: [
      {
        id: 'm1-d1',
        prompt: 'Walk through obtaining and using a bearer token.',
        answer:
          'POST /oauth/token with grant_type=client_credentials and PAT client_id/secret. Use access_token as Authorization: Bearer until ~12 min expiry; reuse within a run; SDKs refresh automatically.',
      },
      {
        id: 'm1-d2',
        prompt: 'Valid token, 403 on access-request create — what do you check first?',
        answer:
          'Scopes on the PAT, user level of the PAT owner, and whether the endpoint requires a user context that client-credentials cannot provide.',
      },
    ],
  },
  {
    id: 'm2',
    number: 2,
    title: 'API versioning — per-service vN vs legacy yearly',
    shortTitle: 'Versioning',
    estTime: '3–4 hr',
    goal: 'Advise greenfield pins and brownfield migration with July 2026 facts',
    trackId: 'track-0',
    fluencyPhaseId: 'phase-2',
    labs: ['lab-versioning', 'lab-capstone-d'],
    outcomes: [
      'Map /v2026/{resource} → /{resource}/vN using the official migration table.',
      'Explain why /latest is unsafe for production under the new strategy.',
      'State support (through Q2 2028) and hard EOL (Q1 2029) for legacy yearly/v3/beta.',
    ],
    whenToUse: [
      'Any new integration design review',
      'Inventory of existing scripts, workflows, and ServiceNow integrations',
      'SDK major-version upgrades',
    ],
    whenNot: [
      'Choosing transform vs rule (extensibility track)',
      'Debugging filter syntax (M5)',
    ],
    sections: [
      {
        id: 'dual-world',
        title: 'Dual-world paths (July 2026)',
        blocks: [
          {
            type: 'paragraph',
            text: 'Greenfield pins to per-service /resource/vN. Brownfield inventories scripts and workflow HTTP actions, then migrates before Q1 2029 EOL. /latest is an unsafe production alias under the July 2026 strategy.',
          },
          {
            type: 'diagram',
            title: 'Dual-world migration',
            mermaid: DIAGRAM_VERSIONING,
          },
          {
            type: 'code',
            language: 'text',
            code: `# PREFER (per-service semantic version)
https://{tenant}.api.identitynow.com/accounts/v1
https://{tenant}.api.identitynow.com/identities/v1
https://{tenant}.api.identitynow.com/entitlements/v2   # outlier — check table

# LEGACY yearly / aliases (works until Q1 2029)
https://{tenant}.api.identitynow.com/v2026/accounts
https://{tenant}.api.identitynow.com/v3/...
https://{tenant}.api.identitynow.com/latest/...        # avoid in production`,
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Why per-service',
            text: 'Yearly collections forced churn without contract breaks. Majors bump only on breaking changes; services version independently.',
          },
          {
            type: 'quiz',
            id: 'm2:dual-world:1',
            prompt: 'Why is /latest unsafe for production integrations?',
            choices: [
              { id: 'a', label: 'It requires experimental headers' },
              { id: 'b', label: 'It can silently retarget when routing changes' },
              { id: 'c', label: 'It only works with Python SDK 1.x' },
              { id: 'd', label: 'It disables rate limits' },
            ],
            correctId: 'b',
            explanation:
              '/latest auto-routes and can break silently. Pin explicit /service/vN for production.',
          },
        ],
      },
      {
        id: 'sdk-suffix',
        title: 'SDK 2.x method suffixes',
        blocks: [
          {
            type: 'code',
            language: 'typescript',
            code: `import { Configuration, AccountsApi } from 'sailpoint-api-client';
const api = new AccountsApi(new Configuration());
const page = await api.listAccountsV1({ limit: 250, filters: 'identityId eq "…"' });
// Legacy 1.x: AccountsV2025Api.listAccounts(…) — migrate with official scripts`,
          },
          {
            type: 'list',
            items: [
              'Greenfield: pin /service/vN in REST; use SDK 2.x *V1/*V2 methods.',
              'Brownfield: run TS/Python/Go/PS migration scripts; review V2 outliers manually.',
              'Workflows: scan HTTP actions with Workflow Analyzer — legacy paths hide in low-code.',
            ],
          },
        ],
      },
    ],
    failureModes: [
      'Shipping /latest because “it always follows current” — silent break on flip.',
      'Assuming every legacy path maps to v1 (entitlements and some config → v2).',
      'Migrating SDK classes but leaving workflow HTTP actions on /v2025.',
      'Treating EOL as “2029 problem” with no inventory before support ends Q2 2028.',
    ],
    enterpriseChecklist: [
      'Path inventory: scripts, SDKs, workflows, ITSM, RPA',
      'Official migration table applied; V2 outliers flagged',
      'No new /latest or yearly paths in CI templates',
      'Experimental endpoints gated and non-prod by default',
      'Watch X-Deprecated: true in observability',
    ],
    checkpoints: [
      {
        id: 'm2-d1',
        prompt: 'Map /v2026/accounts and /latest/identities to current paths.',
        answer: '/accounts/v1 and /identities/v1. Prefer explicit service versions; do not keep /latest.',
      },
      {
        id: 'm2-d2',
        prompt: 'What are the legacy support and EOL dates you quote to leadership?',
        answer:
          'Support tickets for Beta/V3/yearly through Q2 2028; endpoints stop functioning Q1 2029.',
      },
      {
        id: 'm2-d3',
        prompt: 'Show the TypeScript 2.x naming pattern for listing accounts.',
        answer: 'AccountsApi + listAccountsV1(…) from sailpoint-api-client 2.x (resource API + version suffix).',
      },
    ],
  },
  {
    id: 'm3',
    number: 3,
    title: 'Spec-driven development — OpenAPI as ground truth',
    shortTitle: 'Spec-driven',
    estTime: '2–3 hr',
    goal: 'Never invent endpoints — read local specs and generate typed clients from truth',
    trackId: 'track-0',
    fluencyPhaseId: 'phase-2',
    outcomes: [
      'Locate an operation in api-specs/idn (current sailpoint-api.yaml vs legacy yearly folders).',
      'Extract method, path, scopes, and required headers before writing code.',
      'Explain how agentic coding rules (CLAUDE.md) must prefer specs over model memory during the dual-world period.',
    ],
    whenToUse: [
      'Every new endpoint integration',
      'Code review when a PR “guesses” a path',
      'Updating workshop/legacy samples to per-service paths',
    ],
    whenNot: [
      'Pure process design with no HTTP yet (still sketch objects first in M0)',
    ],
    sections: [
      {
        id: 'where-truth',
        title: 'Where truth lives',
        blocks: [
          {
            type: 'table',
            headers: ['Asset', 'Use for'],
            rows: [
              ['api-specs/idn/sailpoint-api.yaml', 'Current per-service v1 collection'],
              ['api-specs/idn/v2025|v2026/', 'Reading legacy code / workshop samples'],
              ['developer.sailpoint.com docs/api', 'Human navigation + migration table'],
              ['SDK stubs 2.x', 'Method names after you confirm the operation exists'],
            ],
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Find the operation in the highest-relevance current spec.',
              'Note path `/service/vN`, required scopes, experimental flag.',
              'Only then choose SDK method or write REST call sheet.',
              'After mutate: plan the verifying GET from the same spec.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Why this matters: during the dual-world period, model memory and old blog posts still invent /v2025 paths. Specs are the only ground truth that survive the July 2026 migration.',
          },
          {
            type: 'quiz',
            id: 'm3:where-truth:1',
            prompt: 'Before writing list-accounts code, what do you open first?',
            choices: [
              { id: 'a', label: 'An LLM chat and accept the first path it suggests' },
              { id: 'b', label: 'Current OpenAPI (sailpoint-api.yaml / /accounts/v1 docs) for path, params, scopes' },
              { id: 'c', label: 'Only a 2024 blog post with /v3/accounts examples' },
              { id: 'd', label: 'The connector SDK README' },
            ],
            correctId: 'b',
            explanation:
              'Locate the operation in current specs first — then pick SDK method or REST. Never invent endpoints from training data during the dual-world transition.',
          },
        ],
      },
      {
        id: 'agentic',
        title: 'Agentic + CI discipline',
        blocks: [
          {
            type: 'paragraph',
            text: 'Keep api-specs git-pulled. Point agents at CLAUDE.md + YAML. Reject PRs that introduce yearly paths or /latest without an explicit waiver. Prefer generated/typed clients over hand-rolled URLs.',
          },
          {
            type: 'code',
            language: 'text',
            code: `# Offline check habit
# 1) rg "operationId| /accounts" api-specs/idn/sailpoint-api.yaml
# 2) Confirm version: v1 (or v2 outlier)
# 3) Write call sheet: METHOD path headers body → expected status + verify GET`,
          },
        ],
      },
    ],
    failureModes: [
      'Copying v2025 paths from blog posts dated before July 2026 migration push.',
      'Trusting LLM endpoint memory during the dual-world transition.',
      'Generating SDK calls for operations that only exist under experimental headers.',
    ],
    enterpriseChecklist: [
      'api-specs clone in repo or submodule; pull cadence defined',
      'PR template asks for spec path / operationId',
      'Experimental ops require ADR + non-prod flag',
      'Contract tests or recorded fixtures for critical paths',
    ],
    checkpoints: [
      {
        id: 'm3-d1',
        prompt: 'Before writing list-accounts code, what do you open first?',
        answer:
          'Current OpenAPI (sailpoint-api.yaml or docs for /accounts/v1) — confirm path, params, scopes — then SDK/REST.',
      },
      {
        id: 'm3-d2',
        prompt: 'Why keep legacy yearly YAML around after migrating?',
        answer:
          'To read and migrate existing code and workshop samples accurately until Q1 2029, not as a greenfield target.',
      },
    ],
  },
]
