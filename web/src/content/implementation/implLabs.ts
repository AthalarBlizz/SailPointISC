import type { Lab } from '../types'

/** Path B (implementation) labs — merge into content labs catalog. */
export const implLabs: Lab[] = [
  {
    id: 'lab-impl-rest-client',
    kind: 'implementation',
    title: 'REST client call sheet (emergency disable)',
    description:
      'Produce a language-agnostic REST integration spec using /identities/v1 and lifecycle APIs. No SDK required.',
    path: 'implementation',
    steps: [
      'Document PAT client-credentials token step (reuse one token per run).',
      'GET /identities/v1 with filters=alias eq "{alias}" — capture id.',
      'List lifecycle states for the identity profile; resolve Terminated by name.',
      'POST set-lifecycle-state with resolved lifecycleStateId.',
      'GET identity again; record before/after evidence fields.',
      'Add error matrix: 401 / 403 / 404 / 429.',
    ],
    acceptance: [
      'All paths are /service/vN (no /v2026, /latest).',
      'Lifecycle state resolved by name — no hardcoded GUID.',
      'Verify GET documented with expected fields.',
      'Scopes listed for the PAT.',
    ],
  },
  {
    id: 'lab-impl-sdk-ts',
    kind: 'implementation',
    title: 'TypeScript SDK 2.x disable sketch',
    description:
      'Implement or stub disableIdentityByAlias with sailpoint-api-client 2.x method suffixes (listIdentitiesV1, etc.).',
    path: 'implementation',
    steps: [
      'sail sdk init typescript (or equivalent folder) + Configuration from env.',
      'listIdentitiesV1 with alias filter; handle empty result.',
      'Resolve Terminated lifecycle state ID by name (profile states API).',
      'Call set lifecycle method (*V1); then getIdentityV1 to verify.',
      'Wrap 429 with backoff; never log client_secret.',
    ],
    acceptance: [
      'Uses AccountsApi/IdentitiesApi-style resource APIs — not AccountsV2025Api.',
      'Methods end with V1 (or correct V2 where applicable).',
      'Dry-run flag skips mutation but prints intended state id.',
      'README notes vault/keyring for secrets.',
    ],
  },
  {
    id: 'lab-decision-extension',
    kind: 'decision',
    title: 'Extension point decision drill',
    description:
      'Pick transform, rule, workflow, SaaS connector, customizer, or external API — with rationale.',
    path: 'implementation',
    scenarios: [
      {
        id: 'dec-email',
        prompt:
          'HR email must be lowercased into the identity attribute on aggregation. No external calls.',
        answer: 'Transform',
        rationale:
          'Deterministic string normalize is core transform vocabulary (lower + accountAttribute). Rule/customizer would be overkill.',
      },
      {
        id: 'dec-slack',
        prompt:
          'When lifecycle becomes Terminated, post to Slack and open a ServiceNow ticket with identity details.',
        answer: 'Workflow',
        rationale:
          'Event-driven side effects with HTTP actions fit workflows. Keep HTTP paths on /service/vN if calling ISC again.',
      },
      {
        id: 'dec-hr-saas',
        prompt:
          'New SaaS HR system must aggregate accounts/entitlements into ISC as a Source; no OOTB connector exists; API is internet-reachable.',
        answer: 'SaaS Connectivity connector',
        rationale:
          'Need source semantics (aggregate/provision). Use @sailpoint/connector-sdk + spcx — not a nightly script pretending to be a source.',
      },
      {
        id: 'dec-payload',
        prompt:
          'OOTB SaaS connector works, but create-account payloads need one field renamed and service accounts stripped from list.',
        answer: 'Connector customizer',
        rationale:
          'Before/after TypeScript hooks mutate connector I/O without rewriting the whole connector or dropping to BeanShell.',
      },
    ],
  },
  {
    id: 'lab-capstone-e',
    kind: 'capstone',
    letter: 'E',
    title: 'Transform design pack',
    brief:
      'Deliver transform JSON for preferred-name displayName and normalized email, plus identity-profile mapping notes. Prefer transforms over rules.',
    path: 'implementation',
    checklist: [
      'firstValid preferredName → legalName transform JSON',
      'lower(email) transform JSON',
      'Document sourceName/attributeName assumptions',
      'Test identity before/after attribute table',
      'Explicit note: why not a rule',
    ],
  },
  {
    id: 'lab-capstone-f',
    kind: 'capstone',
    letter: 'F',
    title: 'Workflow HTTP migration',
    brief:
      'Design (or refactor) a workflow that reacts to Terminated: notify + optional ISC follow-up call. All HTTP actions use /service/vN — run Analyzer mindset even offline.',
    path: 'implementation',
    checklist: [
      'Trigger event documented',
      'HTTP action URLs pinned to /service/vN',
      'Secrets not hardcoded',
      'Failure branch / retry behavior',
      'Loop-prevention note if mutating identity again',
    ],
  },
  {
    id: 'lab-capstone-g',
    kind: 'capstone',
    letter: 'G',
    title: 'SaaS connector sketch',
    brief:
      'Outline a TypeScript SaaS Connectivity connector for a fictional HR SaaS: schema, StdAccountList/Create, spcx test plan, and why this is not an external cron.',
    path: 'implementation',
    checklist: [
      'Account schema (id, email, department, active)',
      'StdAccountList pagination approach',
      'StdAccountCreate mapping from ISC plan',
      'spcx local debug steps',
      'ADR blurb: connector vs API job',
    ],
  },
  {
    id: 'lab-capstone-h',
    kind: 'capstone',
    letter: 'H',
    title: 'Greenfield standards ADR',
    brief:
      'One-page ADR: ISC integration standards for July 2026 — auth, SDK vs REST, /service/vN pins, secrets, dry-run, verify GET, migration dates (Q2 2028 / Q1 2029).',
    path: 'both',
    checklist: [
      'PAT + vault/keyring policy',
      'SDK 2.x / REST decision table',
      'Ban /latest and yearly paths for new work',
      'Dry-run + verify GET standard',
      'Migration timeline to leadership',
      'Observability (request IDs, deprecation headers)',
    ],
  },
]
