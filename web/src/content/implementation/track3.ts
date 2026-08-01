import type { Module } from '../types'
import { DIAGRAM_EXTENSIBILITY, DIAGRAM_CONNECTOR_LIFECYCLE } from '../diagrams'
import { moduleListenScripts } from '../listenScripts'

export const modules: Module[] = [
  {
    id: 'm12',
    number: 12,
    title: 'Transforms — attribute mapping without code',
    shortTitle: 'Transforms',
    estTime: '3–4 hr',
    goal: 'Prefer transforms for deterministic attribute calculate/map on aggregate/provision',
    trackId: 'track-3',
    fluencyPhaseId: 'phase-6',
    listenScript: moduleListenScripts.m12,
    labs: ['lab-capstone-e', 'lab-decision-extension'],
    outcomes: [
      'Author/read transform JSON (type, attributes, input) for common patterns.',
      'Decide transform vs rule with a clear complexity boundary.',
      'Reference transforms from identity profiles without hardcoding opaque IDs in docs only — resolve in APIs.',
    ],
    whenToUse: [
      'Concat, lower/upper, substring, date format, conditional firstValid/lookup',
      'Standardizing email, UPN, displayName across sources',
    ],
    whenNot: [
      'Multi-source orchestration with approvals (workflow)',
      'Logic that needs complex loops / external calls beyond transform vocabulary (rule or external)',
    ],
    sections: [
      {
        id: 'json',
        title: 'Transform JSON shape',
        blocks: [
          {
            type: 'paragraph',
            text: 'Why this matters: jumping to BeanShell for lowercase email creates review/install debt transforms avoid. Start at the lightest extension point — the decision tree below is the map for M12–M16.',
          },
          {
            type: 'diagram',
            title: 'Extensibility decision tree',
            mermaid: DIAGRAM_EXTENSIBILITY,
            caption:
              'Transforms → workflows → SaaS connectors → customizers → rules → external API. Prefer the lightest fit.',
          },
          {
            type: 'code',
            language: 'json',
            code: `{
  "name": "NormalizeEmail",
  "type": "lower",
  "attributes": {
    "input": {
      "type": "accountAttribute",
      "attributes": { "sourceName": "HR [source]", "attributeName": "email" }
    }
  }
}`,
          },
          {
            type: 'code',
            language: 'json',
            code: `{
  "name": "DisplayNamePreferred",
  "type": "firstValid",
  "attributes": {
    "values": [
      { "type": "accountAttribute", "attributes": { "sourceName": "HR [source]", "attributeName": "preferredName" } },
      { "type": "accountAttribute", "attributes": { "sourceName": "HR [source]", "attributeName": "legalName" } }
    ]
  }
}`,
          },
          {
            type: 'links',
            items: [
              {
                label: 'Transforms docs',
                href: 'https://developer.sailpoint.com/docs/extensibility/transforms',
              },
            ],
          },
          {
            type: 'quiz',
            id: 'm12:json:1',
            prompt: 'Need to lowercase HR email on aggregate — which extension point?',
            choices: [
              { id: 'a', label: 'BeanShell rule' },
              { id: 'b', label: 'Transform (type lower / accountAttribute)' },
              { id: 'c', label: 'Full SaaS Connectivity connector' },
              { id: 'd', label: 'Workflow HTTP action on every identity event' },
            ],
            correctId: 'b',
            explanation:
              'Deterministic attribute map/calculate belongs in transforms. Rules, connectors, and workflows are heavier tools for other jobs.',
          },
        ],
      },
      {
        id: 'api',
        title: 'Managing transforms via API/SDK',
        blocks: [
          {
            type: 'code',
            language: 'typescript',
            code: `import { TransformsApi, Configuration } from 'sailpoint-api-client';
const transforms = new TransformsApi(new Configuration());
const list = await transforms.listTransformsV1({ limit: 50 });`,
          },
          {
            type: 'callout',
            tone: 'tip',
            title: 'Say this',
            text: 'If a firstValid + lookup + lower can express it, use a transform. Rules are the exception path.',
          },
        ],
      },
    ],
    failureModes: [
      'Jumping to BeanShell for string normalize.',
      'Transforms that assume source names differing across tenants without docs.',
      'Editing transforms in prod without promotion path from sandbox.',
    ],
    enterpriseChecklist: [
      'Naming convention for transforms',
      'Sandbox → prod promotion process',
      'Identity profile mapping review',
      'Test identities for before/after attributes',
    ],
    checkpoints: [
      {
        id: 'm12-d1',
        prompt: 'Transform or rule for lowercasing HR email?',
        answer: 'Transform (type lower / accountAttribute input). Rule is unnecessary.',
      },
      {
        id: 'm12-d2',
        prompt: 'What SDK 2.x method lists transforms?',
        answer: 'TransformsApi.listTransformsV1 (sailpoint-api-client 2.x).',
      },
    ],
  },
  {
    id: 'm13',
    number: 13,
    title: 'Rules — BeanShell when transforms are not enough',
    shortTitle: 'Rules',
    estTime: '2–3 hr',
    goal: 'Use rules sparingly with review, install, and ops constraints understood',
    trackId: 'track-3',
    fluencyPhaseId: 'phase-6',
    listenScript: moduleListenScripts.m13,
    labs: ['lab-decision-extension'],
    outcomes: [
      'List rule types/use cases that transforms cannot cover.',
      'Explain SailPoint review/install constraints at a conversational level.',
      'Prefer connector customizers for SaaS source I/O mutation when applicable (M16).',
    ],
    whenToUse: [
      'Complex correlation or attribute logic beyond transform vocabulary',
      'Legacy patterns already standardized on reviewed rules',
    ],
    whenNot: [
      'Anything expressible as transform JSON',
      'Event-driven multi-step process (workflow)',
      'Calling arbitrary external APIs on every aggregate without capacity planning',
    ],
    sections: [
      {
        id: 'boundary',
        title: 'Transform vs rule boundary',
        blocks: [
          {
            type: 'table',
            headers: ['Need', 'Prefer'],
            rows: [
              ['String/date/lookup mapping', 'Transform'],
              ['Complex branching + state', 'Rule (or external + API)'],
              ['Before/after SaaS connector ops', 'Customizer (TS)'],
              ['Approvals + HTTP side effects', 'Workflow'],
            ],
          },
          {
            type: 'paragraph',
            text: 'Rules are BeanShell, reviewed, and operationally heavier. Treat them as privileged platform code — version, peer review, and document blast radius.',
          },
        ],
      },
      {
        id: 'ops',
        title: 'Enterprise ops notes',
        blocks: [
          {
            type: 'list',
            items: [
              'Track which identity profiles / sources depend on each rule.',
              'Avoid silent dual-maintenance of transform and rule for the same attribute.',
              'For new SaaS sources, evaluate customizers before new classic rules.',
            ],
          },
        ],
      },
    ],
    failureModes: [
      'Rule sprawl for trivial string ops.',
      'Undocumented rule dependencies → broken aggregates after cleanup.',
      'Assuming rules deploy like a normal git push without SailPoint process.',
    ],
    enterpriseChecklist: [
      'Inventory of rules with owners',
      'Justification recorded when transform was insufficient',
      'Test plan on sandbox identities',
      'Rollback / previous version retained',
    ],
    checkpoints: [
      {
        id: 'm13-d1',
        prompt: 'Transform or rule?',
        answer:
          'Default transform. Rule only when transform vocabulary cannot express the logic or platform constraints require it.',
      },
      {
        id: 'm13-d2',
        prompt: 'For mutating SaaS connector payloads, what should you consider before a classic rule?',
        answer: 'TypeScript connector customizers — often more flexible for SaaS source I/O.',
      },
    ],
  },
  {
    id: 'm14',
    number: 14,
    title: 'Workflows — event-driven automation and HTTP actions',
    shortTitle: 'Workflows',
    estTime: '3–4 hr',
    goal: 'Design workflows that stay on current API versions and clear ownership',
    trackId: 'track-3',
    fluencyPhaseId: 'phase-6',
    listenScript: moduleListenScripts.m14,
    labs: ['lab-capstone-f', 'lab-decision-extension'],
    outcomes: [
      'Place workflows vs external SDK jobs vs transforms correctly.',
      'Scan workflow HTTP actions for legacy /v2025|/v2026|/latest paths.',
      'Define error handling, secrets, and idempotency for HTTP actions.',
    ],
    whenToUse: [
      'Identity events triggering tickets, Slack, or follow-on ISC calls',
      'Low-code orchestration with approvals baked in',
    ],
    whenNot: [
      'Heavy bulk reconciliation (external job + SDK)',
      'Attribute normalize on aggregate (transform)',
    ],
    sections: [
      {
        id: 'placement',
        title: 'When workflows win',
        blocks: [
          {
            type: 'paragraph',
            text: 'Workflows shine for event-driven process automation inside ISC. External scripts still win for complex data joins, large batch, and sophisticated testing harnesses.',
          },
          {
            type: 'callout',
            tone: 'warn',
            title: 'Version debt hides here',
            text: 'HTTP actions often still call /v2025/... or /latest. Use Workflow Analyzer and migrate to /service/vN before Q1 2029.',
          },
        ],
      },
      {
        id: 'http-action',
        title: 'HTTP action checklist',
        blocks: [
          {
            type: 'code',
            language: 'http',
            code: `POST https://{tenant}.api.identitynow.com/identities/v1/{id}/set-lifecycle-state
Authorization: Bearer {{token}}
Content-Type: application/json

{"lifecycleStateId":"{{resolvedTerminatedId}}"}`,
          },
          {
            type: 'list',
            items: [
              'Pin per-service paths — no /latest.',
              'Resolve object IDs in earlier steps by name.',
              'Handle non-2xx with explicit branches; don’t swallow failures.',
              'Secrets via workflow secret store — not hardcoded.',
            ],
          },
        ],
      },
    ],
    failureModes: [
      'Workflow HTTP still on yearly paths after app code migrated.',
      'Infinite loops (workflow mutates identity → retriggers same workflow).',
      'No owner for failed executions.',
    ],
    enterpriseChecklist: [
      'Workflow Analyzer in migration pipeline',
      'Execution monitoring + alerting',
      'Idempotency keys / guards against re-entry',
      'Documented trigger events and side effects',
    ],
    checkpoints: [
      {
        id: 'm14-d1',
        prompt: 'Workflow HTTP action still on /v2025/... — what’s the risk?',
        answer:
          'Legacy yearly APIs lose support Q2 2028 and stop Q1 2029; action fails in prod if not migrated to /service/vN.',
      },
      {
        id: 'm14-d2',
        prompt: 'Bulk CSV compliance — workflow or SDK job?',
        answer:
          'Usually SDK/external job with dry-run. Workflows fit event-sized units of work, not large file crunching.',
      },
    ],
  },
  {
    id: 'm15',
    number: 15,
    title: 'SaaS Connectivity — custom TypeScript connectors',
    shortTitle: 'SaaS Connectivity',
    estTime: '4–5 hr',
    goal: 'Build or evaluate custom cloud connectors with connector-sdk + spcx',
    trackId: 'track-3',
    fluencyPhaseId: 'phase-6',
    listenScript: moduleListenScripts.m15,
    labs: ['lab-capstone-g', 'lab-decision-extension'],
    outcomes: [
      'Explain when OOTB is insufficient and SaaS Connectivity is justified.',
      'Sketch connector command handlers (test connection, account list/read, entitlement, provision).',
      'Use spcx for local debug; know loopback connector pattern.',
    ],
    whenToUse: [
      'SaaS app with no OOTB connector, reachable from SailPoint cloud',
      'Loopback: ISC managing ISC via API for specialized scenarios',
    ],
    whenNot: [
      'On-prem only systems needing VA/classic connectivity patterns',
      'Simple nightly API job that does not need source aggregation semantics',
    ],
    sections: [
      {
        id: 'when',
        title: 'Connector vs external integration',
        blocks: [
          {
            type: 'paragraph',
            text: 'If ISC must aggregate accounts/entitlements and provision as a Source, you need a connector. If you only need to call ISC when ITDR fires, you need an external integration (M4/M8/M9), not a connector.',
          },
          {
            type: 'links',
            items: [
              {
                label: 'sp-connector-sdk-js',
                href: 'https://github.com/sailpoint-oss/sp-connector-sdk-js',
              },
            ],
          },
        ],
      },
      {
        id: 'pattern',
        title: 'Connector pattern (illustrative)',
        blocks: [
          {
            type: 'paragraph',
            text: 'Why this matters: implementing provision before you can list/read accounts leaves you unable to aggregate or reconcile — the command lifecycle below is the order of proof for a Source.',
          },
          {
            type: 'diagram',
            title: 'Connector command lifecycle',
            mermaid: DIAGRAM_CONNECTOR_LIFECYCLE,
            caption:
              'testConnection → account list → read / entitlement ops → create/update/disable. Prove aggregation before provisioning.',
          },
          {
            type: 'code',
            language: 'typescript',
            code: `import { createConnector, StandardCommand } from '@sailpoint/connector-sdk';

export const connector = createConnector()
  .command(StandardCommand.StdAccountList, async (context, input, res) => {
    // Page remote HR/SaaS users → res.send({ key, attributes })
  })
  .command(StandardCommand.StdAccountCreate, async (context, input, res) => {
    // Provision remote account from ISC plan
  });
// Local debug with spcx; deploy via SailPoint connector packaging flow`,
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Loopback',
            text: 'A loopback connector drives ISC via its own API — powerful and easy to get wrong. Require ADR + rate-limit design.',
          },
          {
            type: 'quiz',
            id: 'm15:pattern:1',
            prompt: 'Which command should you harden before StdAccountCreate?',
            choices: [
              { id: 'a', label: 'Only Slack notification hooks' },
              { id: 'b', label: 'testConnection and StdAccountList (then read/entitlements)' },
              { id: 'c', label: 'Certification campaign APIs' },
              { id: 'd', label: 'Identity Search with searchAfter' },
            ],
            correctId: 'b',
            explanation:
              'Aggregation (test + list/read/entitlements) is the Source contract. Provisioning on a connector that cannot list is not enterprise-ready.',
          },
        ],
      },
    ],
    failureModes: [
      'Building a connector for a one-way ticket create that should be a workflow HTTP action.',
      'Blocking aggregation on chatty unpaginated remote APIs.',
      'Storing long-lived SaaS secrets in source config without rotation plan.',
    ],
    enterpriseChecklist: [
      'Target reachable from SailPoint cloud',
      'Account/entitlement schema designed before code',
      'spcx test evidence attached to PR',
      'Provisioning operations mapped to ISC plan ops',
      'Owner team for connector version upgrades',
    ],
    checkpoints: [
      {
        id: 'm15-d1',
        prompt: 'When is a loopback connector appropriate?',
        answer:
          'When ISC must manage ISC-shaped resources through source aggregation/provisioning semantics — not as a substitute for ordinary API scripts. Requires careful rate limits and ADR.',
      },
      {
        id: 'm15-d2',
        prompt: 'API SDK or Connector SDK for a new SaaS HR app with no OOTB connector?',
        answer: 'Connector SDK / SaaS Connectivity if it should be an ISC Source.',
      },
    ],
  },
  {
    id: 'm16',
    number: 16,
    title: 'Connector customizers — before/after hooks in TypeScript',
    shortTitle: 'Customizers',
    estTime: '2–3 hr',
    goal: 'Mutate SaaS connector I/O without forking the whole connector',
    trackId: 'track-3',
    fluencyPhaseId: 'phase-6',
    listenScript: moduleListenScripts.m16,
    labs: ['lab-decision-extension'],
    outcomes: [
      'Explain customizer vs full custom connector vs classic rule.',
      'Identify before/after operation hooks as the extension point.',
      'Plan testing so customizer bugs do not corrupt provisioning quietly.',
    ],
    whenToUse: [
      'OOTB or SaaS connector is almost right — need payload tweaks',
      'Attribute reshaping / filtering on connector read/write',
    ],
    whenNot: [
      'Net-new protocol implementation (build connector)',
      'Identity-profile-only attribute mapping (transform)',
    ],
    sections: [
      {
        id: 'role',
        title: 'Where customizers sit',
        blocks: [
          {
            type: 'paragraph',
            text: 'Customizers intercept SaaS connector operations in TypeScript — more flexible than classic rules for many SaaS sources, lighter than rewriting a connector.',
          },
          {
            type: 'table',
            headers: ['Approach', 'Weight'],
            rows: [
              ['Transform', 'Lowest — identity attribute mapping'],
              ['Customizer', 'Medium — connector I/O mutation'],
              ['Full connector', 'Highest — protocol + schema ownership'],
              ['Rule', 'Heavy process — use when required'],
            ],
          },
        ],
      },
      {
        id: 'practice',
        title: 'Delivery practice',
        blocks: [
          {
            type: 'list',
            items: [
              'Keep customizer pure and well-logged — provisioning failures are costly.',
              'Version with the source; do not “hot fix only in prod.”',
              'Add contract tests: sample input plan → expected mutated output.',
            ],
          },
          {
            type: 'code',
            language: 'typescript',
            code: `// Illustrative hook shape — follow current customizer framework docs
// beforeStdAccountCreate(input) { sanitize attributes; return input }
// afterStdAccountList(output) { drop service accounts; return output }`,
          },
        ],
      },
    ],
    failureModes: [
      'Customizer silently dropping entitlements.',
      'Logic that belongs in transforms living in customizers “because TS.”',
      'No sandbox proof before prod attach.',
    ],
    enterpriseChecklist: [
      'Customizer repo + CI',
      'Fixture-based tests for before/after',
      'Source attachment documented',
      'Rollback: detach customizer procedure',
    ],
    checkpoints: [
      {
        id: 'm16-d1',
        prompt: 'Customizer or full connector?',
        answer:
          'Customizer when an existing SaaS/OOTB connector is nearly correct. Full connector when you own the protocol/schema end-to-end.',
      },
      {
        id: 'm16-d2',
        prompt: 'Why might customizers beat classic rules for SaaS sources?',
        answer:
          'TypeScript before/after hooks on connector I/O are often more flexible and maintainable than BeanShell rules for SaaS connectivity paths.',
      },
    ],
  },
]
