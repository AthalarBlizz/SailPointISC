import type { Module } from '../types'
import { moduleListenScripts } from '../listenScripts'

export const modules: Module[] = [
  {
    id: 'm8',
    number: 8,
    title: 'TypeScript SDK — sailpoint-api-client 2.x',
    shortTitle: 'TypeScript SDK',
    estTime: '4–5 hr',
    goal: 'Ship typed Node/TS clients using resource APIs and V1 method suffixes',
    trackId: 'track-2',
    fluencyPhaseId: 'phase-4',
    listenScript: moduleListenScripts.m8,
    labs: ['lab-impl-sdk-ts'],
    outcomes: [
      'Scaffold Configuration + AccountsApi/IdentitiesApi and call list*V1 methods.',
      'Distinguish API SDK vs Connector SDK vs customizers (all TypeScript, different jobs).',
      'Run/describe the 1.x → 2.0 migration script (AccountsV2025Api → AccountsApi).',
    ],
    whenToUse: [
      'Node services, modern backends, shared TS monorepos',
      'Teams already on sailpoint-api-client',
      'Companion sketches next to REST call sheets',
    ],
    whenNot: [
      'Custom SaaS connector (use @sailpoint/connector-sdk — M15)',
      'ServiceNow Mid Server Java caller (REST spec — M4)',
    ],
    sections: [
      {
        id: 'surfaces',
        title: 'Three TypeScript surfaces',
        blocks: [
          {
            type: 'table',
            headers: ['Surface', 'Package', 'Job'],
            rows: [
              ['ISC API SDK', 'sailpoint-api-client', 'Call ISC REST from Node/TS'],
              ['SaaS Connectivity', '@sailpoint/connector-sdk + spcx', 'Custom cloud connectors'],
              ['Customizers', 'Customizer framework', 'Mutate before/after connector ops'],
            ],
          },
        ],
      },
      {
        id: 'sdk2',
        title: '2.x client pattern',
        blocks: [
          {
            type: 'code',
            language: 'typescript',
            code: `import {
  Configuration,
  AccountsApi,
  IdentitiesApi,
} from 'sailpoint-api-client';

const config = new Configuration(); // SAIL_BASE_URL, SAIL_CLIENT_ID, SAIL_CLIENT_SECRET
const identities = new IdentitiesApi(config);
const accounts = new AccountsApi(config);

const found = await identities.listIdentitiesV1({
  filters: 'alias eq "Jennifer.Thomas"',
  limit: 1,
});
const id = found.data?.[0]?.id;
const accts = await accounts.listAccountsV1({
  filters: \`identityId eq "\${id}"\`,
});`,
          },
          {
            type: 'list',
            items: [
              'CLI: sail sdk init typescript my-project; sail sdk init config',
              'Migration: migrationScript.js rewrites year APIs to resource + V1/V2 suffixes',
              'Pin dependency major 2.x; review changelogs when SailPoint ships new service majors',
            ],
          },
          {
            type: 'links',
            items: [
              {
                label: 'TypeScript SDK docs',
                href: 'https://developer.sailpoint.com/docs/tools/sdk/typescript/',
              },
            ],
          },
        ],
      },
    ],
    failureModes: [
      'Importing AccountsV2025Api in new code after 2.x upgrade.',
      'Using API SDK inside a connector where connector SDK is required.',
      'Committing SAIL_CLIENT_SECRET in .env to “make CI work.”',
    ],
    enterpriseChecklist: [
      'sailpoint-api-client ^2 locked in package.json',
      'Config from env/vault — no secrets in repo',
      'Shared client wrapper: retries, 429, request IDs',
      'Migration script runbook for legacy packages',
    ],
    checkpoints: [
      {
        id: 'm8-d1',
        prompt: 'Show how method versioning works in TS SDK 2.x.',
        answer:
          'Resource class (AccountsApi) + version suffix on methods (listAccountsV1). Legacy used year-named classes like AccountsV2025Api.',
      },
      {
        id: 'm8-d2',
        prompt: 'API SDK vs Connector SDK — nightly compliance job vs new SaaS HR app?',
        answer:
          'Nightly compliance → API SDK (or Python). New SaaS HR with no OOTB connector → Connector SDK / SaaS Connectivity.',
      },
    ],
  },
  {
    id: 'm9',
    number: 9,
    title: 'Python SDK — sailpoint 2.x',
    shortTitle: 'Python SDK',
    estTime: '3–4 hr',
    goal: 'Write automation with SDK 2.x resource APIs while literate in 1.4.x workshop code',
    trackId: 'track-2',
    fluencyPhaseId: 'phase-5',
    listenScript: moduleListenScripts.m9,
    labs: ['lab-capstone-b'],
    outcomes: [
      'Configure via env/keyring and call version-suffixed methods.',
      'Explain this repo’s 1.4.x pin vs greenfield 2.x target.',
      'Describe migrate_sdk.py / namespace → resource API changes.',
    ],
    whenToUse: [
      'Ops automation, data jobs, notebook-adjacent tooling',
      'Porting DevDays scenarios to production standards',
    ],
    whenNot: [
      'Browser/Node-only shops with no Python runtime',
      'External ITSM teams who should get REST sheets',
    ],
    sections: [
      {
        id: 'dual-sdk',
        title: 'Workshop 1.4.x vs production 2.x',
        blocks: [
          {
            type: 'callout',
            tone: 'info',
            title: 'Repo bias check',
            text: 'DevDays samples may import sailpoint.v2025 and yearly paths — great patterns for dry-run/governance, not the greenfield versioning target. New work → 2.x + /service/vN.',
          },
          {
            type: 'code',
            language: 'python',
            code: `# Greenfield shape (SDK 2.x) — names illustrative
from sailpoint.configuration import Configuration
# from sailpoint.api.accounts_api import AccountsApi
# api = AccountsApi(Configuration())
# api.list_accounts_v1(limit=10, filters='identityId eq "…"')

# Legacy literacy (1.4.x workshop):
# from sailpoint.v2025.api.accounts_api import AccountsApi
# api.list_accounts(...)`,
          },
          {
            type: 'code',
            language: 'python',
            code: `from isc_credentials import load_credentials_into_env
from sailpoint.configuration import Configuration

load_credentials_into_env()
configuration = Configuration()`,
          },
        ],
      },
      {
        id: 'migration',
        title: 'Migration',
        blocks: [
          {
            type: 'list',
            items: [
              'Use official migrate_sdk.py / SailPoint migration docs for Python 2.x.',
              'Year modules collapse to resource APIs; methods gain _v1/_v2 suffixes.',
              'Re-test filters, pagination, and experimental headers after upgrade.',
            ],
          },
          {
            type: 'links',
            items: [
              {
                label: 'Python SDK docs',
                href: 'https://developer.sailpoint.com/docs/tools/sdk/python/',
              },
            ],
          },
        ],
      },
    ],
    failureModes: [
      'Shipping new prod jobs on v2025 imports “because the workshop did.”',
      'Mixing 1.x and 2.x packages in one venv.',
      'Skipping verify GET after lifecycle mutations.',
    ],
    enterpriseChecklist: [
      'Separate venv/lockfile for 2.x services',
      'keyring locally; vault in prod',
      'Dry-run flag on every mutator script',
      'Migration ticket tied to Q2 2028 / Q1 2029 dates',
    ],
    checkpoints: [
      {
        id: 'm9-d1',
        prompt: 'Is sailpoint.v2025 broken in mid-2026?',
        answer:
          'Not broken yet — legacy yearly APIs work until Q1 2029. Plan migration to SDK 2.x / per-service paths.',
      },
      {
        id: 'm9-d2',
        prompt: 'What does the Python migration generally change?',
        answer:
          'Year/beta namespaces → resource APIs; methods gain version suffixes (_v1/_v2); align with per-service paths.',
      },
    ],
  },
  {
    id: 'm10',
    number: 10,
    title: 'Go and PowerShell SDKs',
    shortTitle: 'Go & PowerShell',
    estTime: '2–3 hr',
    goal: 'Select and migrate Go/PS clients with the same per-service mental model',
    trackId: 'track-2',
    fluencyPhaseId: 'phase-5',
    listenScript: moduleListenScripts.m10,
    outcomes: [
      'Know when Go or PowerShell is the right official SDK vs REST.',
      'Expect resource APIs + versioned methods after SDK 2.x-style migrations.',
      'Point teams at SailPoint migration scripts for Go and PowerShell.',
    ],
    whenToUse: [
      'Windows ops / Exchange-adjacent automation (PowerShell)',
      'Compiled microservices / platform preference (Go)',
    ],
    whenNot: [
      'Forcing Go when the org’s ISC skill is Python/TS',
      'Embedding SDK into a system that only allows outbound HTTP policies via a gateway (REST may be clearer)',
    ],
    sections: [
      {
        id: 'fit',
        title: 'Fit and parity',
        blocks: [
          {
            type: 'paragraph',
            text: 'SailPoint maintains official Go and PowerShell SDKs alongside TS/Python. Post-migration, expect the same story: stop year collections; call versioned service operations. Use CLI to init projects where supported.',
          },
          {
            type: 'table',
            headers: ['SDK', 'Typical home'],
            rows: [
              ['PowerShell', 'Windows admin runbooks, Entra/AD ops bridges'],
              ['Go', 'Platform services, CLIs, high-concurrency workers'],
              ['TypeScript', 'Node APIs, connectors, customizers'],
              ['Python', 'Data/ops automation'],
            ],
          },
          {
            type: 'list',
            items: [
              'Auth still PAT client-credentials → SAIL_* style config.',
              'Prefer /service/vN semantics even when the client hides URLs.',
              'Run language-specific migration scripts; review V2 outliers.',
            ],
          },
        ],
      },
      {
        id: 'ps-sketch',
        title: 'PowerShell literacy sketch',
        blocks: [
          {
            type: 'code',
            language: 'powershell',
            code: `# Conceptual — follow current SailPoint PS SDK docs for exact cmdlets
# Connect with client id/secret/base URL from vault
# Get-Identity / Search with filters equivalent to: alias eq "j.doe"
# Always resolve lifecycle state by name before Set-LifecycleState`,
          },
        ],
      },
    ],
    failureModes: [
      'Assuming cmdlet names from 2024 blog posts still match post-2.x migration.',
      'Different languages in one flow without a shared ADR on versioning.',
      'PowerShell secrets in plaintext scripts on jump hosts.',
    ],
    enterpriseChecklist: [
      'Language choice recorded in ADR with owner skill coverage',
      'Migration script executed per SDK',
      'Secret store integration (not script parameters in clear text)',
      'Parity tests against a golden REST call sheet',
    ],
    checkpoints: [
      {
        id: 'm10-d1',
        prompt: 'What stays constant across TS/Python/Go/PS after the 2026 versioning change?',
        answer:
          'Per-service API versions, PAT auth, name→id resolution, and method/operation version suffixes — not yearly collections.',
      },
      {
        id: 'm10-d2',
        prompt: 'When is PowerShell the better default than Python for ISC automation?',
        answer:
          'When the operating model is Windows-centric runbooks and existing PS skill/tooling outweighs Python packaging.',
      },
    ],
  },
  {
    id: 'm11',
    number: 11,
    title: 'SailPoint CLI — scaffold, config, connectors',
    shortTitle: 'CLI',
    estTime: '2 hr',
    goal: 'Use the CLI as the standard bootstrap path for SDK and connector projects',
    trackId: 'track-2',
    fluencyPhaseId: 'phase-5',
    listenScript: moduleListenScripts.m11,
    labs: ['lab-impl-sdk-ts'],
    outcomes: [
      'Init TypeScript (or other) SDK projects and config via CLI.',
      'Explain CLI’s role in connector local debug workflows (with spcx).',
      'Keep CLI config free of committed secrets.',
    ],
    whenToUse: [
      'Greenfield project bootstrap',
      'Onboarding developers to a standard layout',
      'Connector build/test loops',
    ],
    whenNot: [
      'As a substitute for production secret management',
      'As the runtime for high-volume integrations (use services + SDKs)',
    ],
    sections: [
      {
        id: 'commands',
        title: 'Core commands',
        blocks: [
          {
            type: 'code',
            language: 'bash',
            code: `sail sdk init typescript my-project
sail sdk init config
# Connector workflows use CLI + spcx for local debug — see M15`,
          },
          {
            type: 'links',
            items: [
              {
                label: 'SailPoint CLI docs',
                href: 'https://developer.sailpoint.com/docs/tools/cli',
              },
            ],
          },
          {
            type: 'callout',
            tone: 'warn',
            title: 'Config hygiene',
            text: 'Treat CLI config like .env — local only, gitignored, vault in CI. Prefer keyring/env injection over long-lived plaintext files.',
          },
        ],
      },
      {
        id: 'team',
        title: 'Team standards',
        blocks: [
          {
            type: 'list',
            items: [
              'Document required CLI version in README.',
              'Commit templates from sail sdk init, not one-off folder layouts.',
              'Separate “API project” vs “connector project” scaffolds — do not mix packages casually.',
            ],
          },
        ],
      },
    ],
    failureModes: [
      'Committing sail config with client secrets.',
      'Every engineer hand-rolling different TS layouts.',
      'Using CLI interactive login patterns in headless prod runners.',
    ],
    enterpriseChecklist: [
      'CLI version pinned in onboarding doc',
      'gitignore for local config/secrets',
      'CI uses vault-injected env, not developer CLI profiles',
      'Connector vs API project templates distinguished',
    ],
    checkpoints: [
      {
        id: 'm11-d1',
        prompt: 'What CLI commands start a TypeScript API project and config?',
        answer: 'sail sdk init typescript <name> and sail sdk init config.',
      },
      {
        id: 'm11-d2',
        prompt: 'Why isn’t the CLI enough for production auth?',
        answer:
          'Production needs vault-managed secrets, non-interactive injection, rotation, and audit — not developer workstation CLI profiles.',
      },
    ],
  },
]
