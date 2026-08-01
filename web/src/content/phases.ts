import type { Phase } from './types'

export const phases: Phase[] = [
  {
    id: 'phase-0',
    number: 0,
    title: 'ISC mental model (conversation baseline)',
    shortTitle: 'Mental model',
    estTime: '0.5 day',
    goal: 'Speak the product nouns',
    outcomes: [
      'Explain what ISC is for in one sentence.',
      'Name the core objects and how they relate.',
      'Distinguish UI configuration from API/SDK extensibility.',
    ],
    sections: [
      {
        id: 'vocab',
        title: 'Core vocabulary',
        blocks: [
          {
            type: 'table',
            headers: ['Term', 'Plain language'],
            rows: [
              ['Identity', 'The person/machine identity ISC governs'],
              ['Account', "A user's record on a source (AD, SaaS app, etc.)"],
              ['Source', 'Connected system ISC aggregates/provisions'],
              ['Entitlement', 'Permission/group on a source'],
              ['Access profile', 'Bundle of entitlements'],
              ['Role', 'Higher-level access assignment (often multiple profiles)'],
              [
                'Lifecycle state',
                'Joiner/mover/leaver status driving provisioning (Active, Terminated, …)',
              ],
              [
                'Identity profile',
                'Mapping + transforms + lifecycle config for a population',
              ],
              ['Access request', 'Governed ask for access (with approvals)'],
              ['Certification', 'Periodic review/revoke campaign'],
              ['Aggregation', 'Pulling accounts/entitlements into ISC'],
              ['Provisioning', 'Pushing create/update/disable/delete to sources'],
            ],
          },
        ],
      },
      {
        id: 'study',
        title: 'Study',
        blocks: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Skim developer.sailpoint.com docs landing and API overview.',
              'Read this repo’s README and the three scenario docstrings in src/scenario*.py — they are “why the API exists” stories.',
              'Read docs/isc-development-guide.md sections on base URL and auth (Phase 2 corrects yearly-version advice).',
            ],
          },
        ],
      },
    ],
    checkpoints: [
      {
        id: 'p0-d1',
        prompt: "What's the difference between an entitlement, access profile, and role?",
        answer:
          'Entitlement = permission on a source. Access profile = bundle of entitlements. Role = higher-level assignment that often groups access profiles for business roles.',
      },
      {
        id: 'p0-d2',
        prompt:
          'If ITDR needs someone disabled now, why isn’t waiting for the next HR file enough?',
        answer:
          'Aggregation/HR sync is batch and slow. Compromised accounts need immediate API-driven lifecycle/disable action — seconds, not the next file cycle.',
      },
      {
        id: 'p0-d3',
        prompt: 'UI vs API — when do you reach for code?',
        answer:
          'When there is no UI button: external system triggers (ITDR, SIEM), cross-system automation, peer-based provisioning, custom connectors, or bulk/governance workflows the UI cannot express.',
      },
    ],
  },
  {
    id: 'phase-1',
    number: 1,
    title: 'Authentication, authorization, and HTTP craft',
    shortTitle: 'Auth & HTTP',
    estTime: '1–2 days',
    goal: 'Explain a failing call',
    outcomes: [
      'Describe PAT + client-credentials flow end to end.',
      'Separate user level vs scopes.',
      'Diagnose 401 / 403 / 429 correctly.',
      'Store secrets with python-keyring — never in source or chat.',
    ],
    sections: [
      {
        id: 'facts',
        title: 'Key facts',
        blocks: [
          {
            type: 'list',
            items: [
              'Token ~12 minutes; SDKs refresh automatically; raw REST must reuse one token per run.',
              'Modern PAT client IDs are UUID-with-dashes; legacy undashed IDs fail.',
              'Rate limit order of magnitude: 100 requests per access_token per 10 seconds.',
              '403 often means: wrong user level, missing scope, or endpoint needs user context that client-credentials cannot provide.',
            ],
          },
          {
            type: 'callout',
            tone: 'tip',
            title: 'Secrets',
            text: 'This repo uses python-keyring (macOS Keychain). Never paste Client Secret into chat or commit .env files.',
          },
        ],
      },
      {
        id: 'study',
        title: 'Study',
        blocks: [
          {
            type: 'links',
            items: [
              {
                label: 'Authentication docs',
                href: 'https://developer.sailpoint.com/docs/api/authentication',
              },
            ],
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Repo: src/isc_credentials.py, setup_keyring.py, auth_starter.py',
              'docs/isc-development-guide.md — Auth + Scopes + Common errors',
            ],
          },
        ],
      },
      {
        id: 'practice',
        title: 'Practice (offline)',
        blocks: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Trace auth_starter.py and explain SDK vs REST paths aloud.',
              'In Agent mode: list scopes required for access-request create from api-specs.',
              'Write a one-pager: how you would store PATs in prod (Keychain locally; vault in prod).',
            ],
          },
        ],
      },
    ],
    checkpoints: [
      {
        id: 'p1-d1',
        prompt: 'Walk me through getting a bearer token.',
        answer:
          'PAT has client_id + client_secret. POST /oauth/token with grant_type=client_credentials. Use access_token as Authorization: Bearer on API calls until expiry (~12 min).',
      },
      {
        id: 'p1-d2',
        prompt: 'Why did my call return 403 with a valid token?',
        answer:
          'Token is valid but authorization failed: missing scope, insufficient user level on the PAT owner, or the endpoint requires user context that CLIENT_CREDENTIALS cannot provide.',
      },
      {
        id: 'p1-d3',
        prompt: "What's least-privilege scoping for a read-only reporting job?",
        answer:
          'Prefer specific :read scopes for the resources you need, not sp:scopes:all. Pair with a user level that can read but not mutate.',
      },
    ],
  },
  {
    id: 'phase-2',
    number: 2,
    title: 'Versioning dual-world (most important fluency upgrade)',
    shortTitle: 'Versioning',
    estTime: '1–2 days',
    goal: 'Advise migrate vs maintain',
    outcomes: [
      'Contrast yearly vs per-service models as of July 2026.',
      'Map a legacy path to a new path using the migration table.',
      'Recommend greenfield → per-service vN; brownfield → migrate before Q1 2029.',
      'Explain public vs experimental and X-SailPoint-Experimental: true.',
    ],
    labs: ['lab-versioning'],
    sections: [
      {
        id: 'paths',
        title: 'Path shapes to recognize',
        blocks: [
          {
            type: 'code',
            language: 'text',
            code: `# CURRENT (prefer for new work)
https://{tenant}.api.identitynow.com/accounts/v1
https://{tenant}.api.identitynow.com/identities/v1

# LEGACY yearly (works until Q1 2029)
https://{tenant}.api.identitynow.com/v2026/accounts

# LEGACY aliases
https://{tenant}.api.identitynow.com/v3/...
https://{tenant}.api.identitynow.com/beta/...
https://{tenant}.api.identitynow.com/latest/...   # avoid for production`,
          },
          {
            type: 'callout',
            tone: 'warn',
            title: 'Production tip',
            text: '/latest can break silently when yearly routing flips. Prefer explicit /service/vN.',
          },
        ],
      },
      {
        id: 'sdk',
        title: 'SDK shape change (TypeScript)',
        blocks: [
          {
            type: 'code',
            language: 'typescript',
            code: `// CURRENT (sailpoint-api-client 2.x)
import { Configuration, AccountsApi } from 'sailpoint-api-client';
const api = new AccountsApi(new Configuration());
const accounts = await api.listAccountsV1({ limit: 10 });

// LEGACY (1.x) — year namespaces on the class
// import { AccountsV2025Api } from 'sailpoint-api-client';
// await api.listAccounts(...);`,
          },
        ],
      },
      {
        id: 'study',
        title: 'Required reading',
        blocks: [
          {
            type: 'links',
            items: [
              {
                label: 'API Versioning Strategy',
                href: 'https://developer.sailpoint.com/docs/api/api-versioning-strategy',
              },
              {
                label: 'Migration guide + path table',
                href: 'https://developer.sailpoint.com/docs/api/api-versioning-migration/',
              },
              {
                label: "What's changed (2026-07-14)",
                href: 'https://developer.sailpoint.com/discuss/t/api-versioning-strategy-update-whats-changed-and-how-to-migrate/216376',
              },
            ],
          },
        ],
      },
    ],
    checkpoints: [
      {
        id: 'p2-d1',
        prompt: 'Why did SailPoint abandon yearly API versions?',
        answer:
          'Yearly bumps forced updates even when a service had no breaking changes, delayed shipping, made /latest a risky workaround, and duplicated docs. Per-service semver only bumps on real contract breaks.',
      },
      {
        id: 'p2-d2',
        prompt: 'Is /latest OK in production in mid-2026?',
        answer:
          'No. SailPoint treats /latest as unsafe for production under the new strategy — it can break without a deliberate version change in your code.',
      },
      {
        id: 'p2-d3',
        prompt: 'My Python job still imports sailpoint.v2025 — is that broken?',
        answer:
          'Not broken yet — legacy yearly APIs work until Q1 2029 (support through Q2 2028). Plan migration to SDK 2.x / per-service paths.',
      },
      {
        id: 'p2-d4',
        prompt: 'How do experimental endpoints work under the new model?',
        answer:
          'Still require X-SailPoint-Experimental: true. May break with little notice. Public APIs avoid breaking changes within a major version.',
      },
    ],
  },
  {
    id: 'phase-3',
    number: 3,
    title: 'Domain API fluency (what to call for what)',
    shortTitle: 'Domain APIs',
    estTime: '3–5 days',
    goal: 'Design an integration verbally',
    outcomes: [
      'Design joiner/mover/leaver, emergency disable, access request, peer clone, and search verbally.',
    ],
    labs: ['lab-filters', 'lab-capstone-a', 'lab-capstone-b', 'lab-capstone-c'],
    sections: [
      {
        id: '3a',
        title: '3A — Identities, accounts, lifecycle',
        blocks: [
          {
            type: 'paragraph',
            text: 'Resolve identity by alias/name; never hardcode lifecycle state GUIDs; set lifecycle state to drive cascading disable/provisioning.',
          },
          {
            type: 'callout',
            tone: 'tip',
            title: 'Say this',
            text: 'For emergency disable I set lifecycle to Terminated (resolved by name) so ISC provisions disables downstream — I don’t invent per-app disable loops unless the source is unmanaged.',
          },
        ],
      },
      {
        id: '3b',
        title: '3B — Access requests & approvals',
        blocks: [
          {
            type: 'paragraph',
            text: 'Request roles/access profiles/entitlements; approvals still apply. Peer clone should submit access requests — dry-run first — not bypass governance.',
          },
        ],
      },
      {
        id: '3e',
        title: '3E — Filters & PATCH',
        blocks: [
          {
            type: 'paragraph',
            text: 'Memorize operators: eq, ne, co, sw, gt/lt/ge/le, pr, in, and/or. PATCH uses JSON Patch (application/json-patch+json).',
          },
        ],
      },
    ],
    checkpoints: [
      {
        id: 'p3-d1',
        prompt: 'How do you find an identity without knowing the GUID?',
        answer:
          'List/filter identities, e.g. filters=alias eq "Jennifer.Thomas", then take the id from the result.',
      },
      {
        id: 'p3-d2',
        prompt: "What's wrong with hardcoding LeaveOfAbsence's ID?",
        answer:
          'Lifecycle state IDs are tenant-specific. Hardcoded GUIDs break across environments. Always resolve by name at runtime.',
      },
      {
        id: 'p3-d3',
        prompt: 'When do you use Search vs list_identities filters?',
        answer:
          'Collection filters for straightforward list queries. Search API for richer index queries and paging past 10k with searchAfter.',
      },
    ],
  },
  {
    id: 'phase-4',
    number: 4,
    title: 'TypeScript as a first-class ISC language',
    shortTitle: 'TypeScript',
    estTime: '2–3 days',
    goal: 'Sketch TS code in a review',
    outcomes: [
      'Scaffold a TS API project with SailPoint CLI.',
      'Call a V1 method with filters.',
      'Explain when you’d write a connector instead of an external script.',
    ],
    sections: [
      {
        id: 'surfaces',
        title: 'Three TypeScript surfaces — do not conflate',
        blocks: [
          {
            type: 'table',
            headers: ['Surface', 'Package / tool', 'Used for'],
            rows: [
              [
                'ISC API SDK',
                'sailpoint-api-client (npm)',
                'Calling ISC REST from Node/TS apps',
              ],
              [
                'SaaS Connectivity',
                '@sailpoint/connector-sdk + spcx',
                'Custom cloud connectors (and loopbacks)',
              ],
              [
                'Connector customizers',
                'Customizer framework (TS)',
                'Mutate before/after connector operations',
              ],
            ],
          },
        ],
      },
      {
        id: 'study',
        title: 'Study',
        blocks: [
          {
            type: 'links',
            items: [
              {
                label: 'TypeScript SDK',
                href: 'https://developer.sailpoint.com/docs/tools/sdk/typescript/',
              },
              {
                label: 'TS getting started',
                href: 'https://developer.sailpoint.com/docs/tools/sdk/typescript/getting-started',
              },
            ],
          },
          {
            type: 'paragraph',
            text: 'CLI: sail sdk init typescript my-project. Migration: migrationScript.js for 1.x → 2.0 (AccountsV2025Api → AccountsApi, methods gain V1).',
          },
        ],
      },
    ],
    checkpoints: [
      {
        id: 'p4-d1',
        prompt: 'Show me how method versioning works in the TS SDK 2.x.',
        answer:
          'Import resource APIs without year namespaces. Method names include the version suffix, e.g. listTransformsV1() / listAccountsV1().',
      },
      {
        id: 'p4-d2',
        prompt:
          'API SDK vs Connector SDK — which for a nightly compliance job? Which for a new SaaS HR app with no OOTB connector?',
        answer:
          'Nightly compliance job → API SDK (or Python SDK). New SaaS HR app with no OOTB connector → Connector SDK (SaaS Connectivity).',
      },
    ],
  },
  {
    id: 'phase-5',
    number: 5,
    title: 'Other official SDKs and direct REST',
    shortTitle: 'SDK choices',
    estTime: '1–2 days',
    goal: 'Pick the right language/tool',
    outcomes: [
      'Choose among TypeScript, Python, Go, PowerShell, and raw REST — and know the CLI’s role.',
    ],
    sections: [
      {
        id: 'when',
        title: 'When to use what',
        blocks: [
          {
            type: 'table',
            headers: ['Approach', 'When'],
            rows: [
              ['TypeScript SDK', 'Node services, SaaS connectors, modern web tooling'],
              ['Python SDK', 'Automation scripts, data/ops, this workshop’s home turf'],
              ['Go / PowerShell', 'Platform preference, Windows ops, compiled services'],
              [
                'Direct REST',
                'ITDR/SIEM/ServiceNow/webhooks — integration spec, not a long-running SDK app',
              ],
              ['SailPoint CLI', 'Project init, config, connector workflows'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Decision rule',
            text: 'Script that runs on its own → SDK. Another system calling ISC → direct REST.',
          },
        ],
      },
    ],
    checkpoints: [
      {
        id: 'p5-d1',
        prompt: 'Should our ServiceNow team import the Python SDK?',
        answer:
          'Usually no — give them a REST call sheet + PAT guidance. The SDK belongs in a process you own and run.',
      },
      {
        id: 'p5-d2',
        prompt: "What's the migration story for each SDK?",
        answer:
          'Official migration scripts for TypeScript, Go, Python, and PowerShell rewrite namespaces to resource APIs and add V1 method suffixes. Review V2 outliers manually.',
      },
    ],
  },
  {
    id: 'phase-6',
    number: 6,
    title: 'Extensibility map (beyond calling APIs)',
    shortTitle: 'Extensibility',
    estTime: '2–3 days',
    goal: 'Transforms vs rules vs workflows vs connectors',
    outcomes: [
      'Name the extension-point menu and pick the right one for a use case.',
    ],
    sections: [
      {
        id: 'menu',
        title: 'Extension points',
        blocks: [
          {
            type: 'table',
            headers: ['Mechanism', 'Code?', 'Typical use', 'Notes'],
            rows: [
              [
                'Transforms',
                'JSON config',
                'Attribute calculate/map',
                'Prefer over rules when possible',
              ],
              [
                'Rules',
                'BeanShell',
                'Logic transforms cannot express',
                'SailPoint review/install constraints',
              ],
              [
                'Workflows',
                'Low-code + HTTP',
                'Event-driven automation',
                'Scan HTTP actions for legacy API versions',
              ],
              [
                'SaaS Connectivity',
                'TypeScript',
                'Custom cloud connectors',
                'spcx local debug',
              ],
              [
                'Connector customizers',
                'TypeScript',
                'Intercept SaaS connector I/O',
                'Flexible for SaaS sources',
              ],
              [
                'External integrations',
                'Any via API',
                'ITDR, HR, SIEM, ticketing',
                'This curriculum’s core',
              ],
            ],
          },
        ],
      },
    ],
    checkpoints: [
      {
        id: 'p6-d1',
        prompt: 'Transform or rule?',
        answer:
          'Prefer transforms (JSON, admin-editable via API). Use a rule only when transforms cannot express the logic — and expect review/install constraints.',
      },
      {
        id: 'p6-d2',
        prompt: 'Workflow HTTP action still on /v2025/... — what’s the risk?',
        answer:
          'Legacy yearly paths are on a clock (EOL Q1 2029). Migrate workflow HTTP actions to per-service paths; use Workflow Analyzer to find them.',
      },
      {
        id: 'p6-d3',
        prompt: 'When is a loopback connector appropriate?',
        answer:
          'When you want ISC to manage ISC objects as if they were a target system — using SaaS Connectivity + the API SDK inside the connector.',
      },
    ],
  },
  {
    id: 'phase-7',
    number: 7,
    title: 'Production craft',
    shortTitle: 'Production',
    estTime: '1–2 days',
    goal: 'Security, rate limits, ops',
    outcomes: ['Talk like someone who has shipped integrations.'],
    sections: [
      {
        id: 'topics',
        title: 'Topics',
        blocks: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Secrets: PAT per integration; expiration; revoke on offboarding; keyring locally; vault in prod.',
              'Idempotency & verify: after mutations, GET and show before/after.',
              'Pagination & bulk: limit/offset/count; Search searchAfter; respect 429.',
              'Object ID discipline: resolve by name — tenant GUIDs are not portable.',
              'Change management: prefer /service/v1; experimental is non-prod; watch X-Deprecated.',
              'Observability: correlation IDs; named PATs; deprecation headers.',
              'Agentic development: CLAUDE.md + local OpenAPI beats model memory during the 2026 transition.',
            ],
          },
          {
            type: 'callout',
            tone: 'tip',
            title: 'Practice',
            text: 'Write a one-page ADR: Greenfield ISC integration standards for our team — July 2026 (auth, SDK, versioning, secrets, dry-run, migration deadline).',
          },
        ],
      },
    ],
    checkpoints: [
      {
        id: 'p7-d1',
        prompt: 'Name three production must-haves for any ISC integration.',
        answer:
          'Examples: secrets not in source; resolve object IDs by name; verify after mutations; pin per-service versions; least-privilege scopes; handle 429; named PATs with expiry.',
      },
    ],
  },
  {
    id: 'phase-8',
    number: 8,
    title: 'Capstones & fluency drills',
    shortTitle: 'Capstones',
    estTime: 'ongoing',
    goal: 'Sound senior in conversation',
    outcomes: [
      'Complete capstones A–D and run weekly 15-minute fluency drills.',
    ],
    labs: [
      'lab-capstone-a',
      'lab-capstone-b',
      'lab-capstone-c',
      'lab-capstone-d',
      'lab-versioning',
      'lab-filters',
    ],
    sections: [
      {
        id: 'weekly',
        title: 'Weekly fluency drill (15 minutes)',
        blocks: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Explain yearly vs per-service to a manager.',
              'Debug a fictional 403.',
              'Name five filter operators with examples.',
              'Sketch TS listX V1 call from memory.',
              'Argue transform vs rule vs workflow for a use case.',
              'Map one legacy path → new path from memory or table.',
            ],
          },
        ],
      },
    ],
    checkpoints: [
      {
        id: 'p8-d1',
        prompt: 'Explain yearly vs per-service to a manager in two sentences.',
        answer:
          'We used to bump every API every year even when nothing changed. Now each service stays on /service/v1 until that service actually breaks its contract — migrate before Q1 2029.',
      },
    ],
  },
]

export function getPhase(id: string): Phase | undefined {
  return phases.find((p) => p.id === id)
}

export function allDrills() {
  return phases.flatMap((p) =>
    p.checkpoints.map((d) => ({ ...d, phaseId: p.id, phaseTitle: p.shortTitle })),
  )
}
