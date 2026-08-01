import type { Module } from '../types'
import { DIAGRAM_SEARCH_VS_LIST, DIAGRAM_LEAVER } from '../diagrams'

export const modules: Module[] = [
  {
    id: 'm4',
    number: 4,
    title: 'REST in any language — integration specs',
    shortTitle: 'REST any-language',
    estTime: '3–4 hr',
    goal: 'Produce a complete HTTP call sheet another system can implement without an SDK',
    trackId: 'track-1',
    fluencyPhaseId: 'phase-5',
    labs: ['lab-impl-rest-client'],
    outcomes: [
      'Write method, URL, headers, body, expected status, and verify GET for a multi-step flow.',
      'Choose REST integration-spec when the caller is ITDR/SIEM/ServiceNow/webhook — not a long-running SDK app.',
      'Handle token reuse, pagination, and 429 in language-agnostic terms.',
    ],
    whenToUse: [
      'External platforms that already speak HTTP',
      'Vendor handoff where you cannot ship Python/TS runtime',
      'Contract-first reviews with security/architecture',
    ],
    whenNot: [
      'Standalone scheduled automation you own end-to-end (prefer SDK)',
      'SaaS connector implementation (M15)',
    ],
    sections: [
      {
        id: 'decision',
        title: 'SDK vs REST decision',
        blocks: [
          {
            type: 'table',
            headers: ['Caller', 'Deliverable'],
            rows: [
              ['Your Python/TS job', 'Official SDK 2.x'],
              ['ServiceNow / SOAR / custom Java', 'REST call sheet + PAT guidance'],
              ['One-shot Postman collection', 'REST; graduate to SDK if it becomes a product'],
            ],
          },
          {
            type: 'callout',
            tone: 'tip',
            title: 'Rule of thumb',
            text: 'Script-on-its-own → SDK. Other-system-calls-ISC → REST integration spec.',
          },
          {
            type: 'paragraph',
            text: 'Why this matters: the wrong deliverable wastes weeks — handing ServiceNow a Python SDK forces their team to host a runtime they do not own, while giving yourself only a Postman collection skips retries, pagination, and typed clients you will need in production.',
          },
          {
            type: 'quiz',
            id: 'm4:decision:1',
            prompt: 'ITDR runs in ServiceNow and must call ISC — what do you hand them?',
            choices: [
              { id: 'a', label: 'The sailpoint Python package and a venv guide' },
              { id: 'b', label: 'A REST call sheet: method, path, headers, body, status, verify GET' },
              { id: 'c', label: 'Only a Personal Access Token with no paths' },
              { id: 'd', label: 'A SaaS Connectivity connector project' },
            ],
            correctId: 'b',
            explanation:
              'External platforms that already speak HTTP need a language-agnostic REST contract. SDKs belong in runtimes you own.',
          },
        ],
      },
      {
        id: 'call-sheet',
        title: 'Call sheet pattern (emergency disable sketch)',
        blocks: [
          {
            type: 'code',
            language: 'http',
            code: `POST /oauth/token
Content-Type: application/x-www-form-urlencoded
grant_type=client_credentials&client_id=…&client_secret=…

GET /identities/v1?filters=alias eq "{alias}"
Authorization: Bearer {token}

GET /identity-profiles/v1/{profileId}/lifecycle-states
→ pick id where name == "Terminated"

POST /identities/v1/{identityId}/set-lifecycle-state
{"lifecycleStateId":"{terminatedId}"}

GET /identities/v1/{identityId}
→ verify attributes.cloudLifecycleState / lifecycle fields`,
          },
          {
            type: 'paragraph',
            text: 'Pin /service/vN. Document idempotency expectations and what “success” means if ISC accepted the call but provisioning is async.',
          },
        ],
      },
    ],
    failureModes: [
      'Giving ServiceNow the Python SDK as the integration contract.',
      'Omitting verify GET — mutation assumed done.',
      'Hardcoding lifecycle state UUID in the call sheet.',
      'Using /v2026 or /latest in a “current” handoff doc.',
    ],
    enterpriseChecklist: [
      'Base URL + auth + scope list',
      'Every step: method, path, sample body, status codes',
      'Name-resolution steps explicit',
      'Error matrix: 401/403/404/429/4xx business',
      'Owner team + PAT naming convention',
    ],
    checkpoints: [
      {
        id: 'm4-d1',
        prompt: 'Should our ServiceNow team import the Python SDK?',
        answer:
          'Usually no — give REST + PAT + per-service paths. SDKs are for runtimes you own.',
      },
      {
        id: 'm4-d2',
        prompt: 'What four things must every mutation step include in a call sheet?',
        answer:
          'Request (method/path/headers/body), expected success status, name→id resolution if needed, and a verify GET (before/after).',
      },
    ],
  },
  {
    id: 'm5',
    number: 5,
    title: 'Filters, Search, PATCH, and bulk patterns',
    shortTitle: 'Filters & bulk',
    estTime: '3–4 hr',
    goal: 'Query and update at enterprise scale without foot-guns',
    trackId: 'track-1',
    fluencyPhaseId: 'phase-3',
    labs: ['lab-filters'],
    outcomes: [
      'Write standard collection filters with eq/sw/co/in/and and correct quoting.',
      'Choose list filters vs Search (searchAfter) for the right workload.',
      'Apply JSON Patch (application/json-patch+json) and respectful bulk/pagination.',
    ],
    whenToUse: [
      'Lookups by alias, status, source, created date',
      'Reporting and reconciliation jobs',
      'Partial updates where PUT would clobber fields',
    ],
    whenNot: [
      'Real-time disable when you already have the identity id (skip search theater)',
      'Replacing governed access changes with blind PATCH of assignments',
    ],
    sections: [
      {
        id: 'filters',
        title: 'Collection filters',
        blocks: [
          {
            type: 'code',
            language: 'text',
            code: `alias eq "Jennifer.Thomas"
name sw "John"
firstname sw "john" and status eq "ACTIVE"
created gt 2025-01-01T00:00:00Z
name in ("Alice","Bob")
identityId eq "abc-123"`,
          },
          {
            type: 'links',
            items: [
              {
                label: 'Standard collection parameters',
                href: 'https://developer.sailpoint.com/docs/api/standard-collection-parameters',
              },
            ],
          },
        ],
      },
      {
        id: 'search-patch',
        title: 'Search vs list; PATCH vs bulk',
        blocks: [
          {
            type: 'paragraph',
            text: 'Why this matters: picking Search for an ITDR disable can hit index lag and miss the identity you must act on now; picking list+offset for a million-row analytics dump burns rate budget and time.',
          },
          {
            type: 'diagram',
            title: 'Search vs list — choose by workload',
            mermaid: DIAGRAM_SEARCH_VS_LIST,
            caption:
              'ITDR and simple alias lookups prefer list filters (near real-time). Wide analytics prefer Search + searchAfter (accept index lag).',
          },
          {
            type: 'list',
            items: [
              'List + filters: resource collections, simpler predicates, pagination via limit/offset.',
              'Search: index query language; limit up to 10k then searchAfter — great for wide reporting, not a substitute for knowing index lag.',
              'PATCH: JSON Patch ops (add/replace/remove) with Content-Type application/json-patch+json.',
              'Bulk: batch within rate limits; prefer server bulk endpoints when documented; verify samples after.',
            ],
          },
          {
            type: 'code',
            language: 'json',
            code: `[
  { "op": "replace", "path": "/description", "value": "Updated by automation" }
]`,
          },
          {
            type: 'code',
            language: 'typescript',
            code: `await identitiesApi.listIdentitiesV1({
  filters: 'alias eq "Jennifer.Thomas"',
  limit: 1,
});`,
          },
          {
            type: 'quiz',
            id: 'm5:search-patch:1',
            prompt: 'Emergency disable must resolve Jennifer.Thomas by alias — which query path?',
            choices: [
              { id: 'a', label: 'Search DSL with searchAfter pagination' },
              { id: 'b', label: 'List identities with filters=alias eq "Jennifer.Thomas"' },
              { id: 'c', label: 'Bulk PATCH every identity matching a name prefix' },
              { id: 'd', label: 'Certification campaign search export' },
            ],
            correctId: 'b',
            explanation:
              'Simple authoritative lookups belong on list + filters (near real-time). Save Search for wide reporting where index lag is acceptable.',
          },
        ],
      },
    ],
    failureModes: [
      'Unquoted strings in filters → 400.',
      'Using Search for ITDR path that needs authoritative identity GET.',
      'PUT entire objects from stale GETs → lost updates.',
      'offset deep pagination on huge sets without measuring cost.',
    ],
    enterpriseChecklist: [
      'Filter library reviewed against spec for each resource',
      'Pagination strategy documented (limit/offset vs searchAfter)',
      '429 retry with jitter; token reuse',
      'PATCH content-type enforced in client',
      'Bulk job has dry-run + progress metrics',
    ],
    checkpoints: [
      {
        id: 'm5-d1',
        prompt: 'Filter: identity alias equals Jennifer.Thomas',
        answer: 'alias eq "Jennifer.Thomas"',
      },
      {
        id: 'm5-d2',
        prompt: 'When do you use Search instead of list_identities filters?',
        answer:
          'Broad/index-oriented queries and large result sets needing searchAfter. Prefer list filters for simple identity lookups by alias/id when the collection API supports them.',
      },
      {
        id: 'm5-d3',
        prompt: 'What Content-Type does ISC PATCH require?',
        answer: 'application/json-patch+json with a JSON Patch document body.',
      },
    ],
  },
  {
    id: 'm6',
    number: 6,
    title: 'Identities, accounts, lifecycle, and sources',
    shortTitle: 'Identities & lifecycle',
    estTime: '4–5 hr',
    goal: 'Implement JML and emergency disable against the right APIs',
    trackId: 'track-1',
    fluencyPhaseId: 'phase-3',
    labs: ['lab-capstone-a', 'lab-capstone-b'],
    outcomes: [
      'Resolve identity by alias; resolve lifecycle state by name on the profile.',
      'Explain account vs identity disable and when each is appropriate.',
      'Account for aggregation latency vs API-driven action.',
    ],
    whenToUse: [
      'Joiner/mover/leaver automations',
      'ITDR emergency disable',
      'Source/account reconciliation jobs',
    ],
    whenNot: [
      'Granting business roles (use access requests — M7)',
      'Building a custom HR connector (M15) when you only needed a lifecycle API',
    ],
    sections: [
      {
        id: 'resolve',
        title: 'Resolve then mutate',
        blocks: [
          {
            type: 'paragraph',
            text: 'Why this matters: hardcoding a Terminated GUID works once in sandbox and fails silently in prod; skipping the verify GET closes the ticket while provisioning may still be in flight.',
          },
          {
            type: 'diagram',
            title: 'Emergency disable / leaver sequence',
            mermaid: DIAGRAM_LEAVER,
            caption:
              'Resolve identity → resolve lifecycle state by name → set state → GET before/after. Never hardcode tenant GUIDs.',
          },
          {
            type: 'code',
            language: 'python',
            code: `# Shape for SDK 2.x — method suffixes mirror /identities/v1
# identities_api.list_identities_v1(filters='alias eq "j.doe"')
# states = identity_profiles_api.get_lifecycle_states_v1(profile_id)
# terminated = next(s for s in states if s.name == "Terminated")
# identities_api.set_identity_lifecycle_state_v1(id, {"lifecycleStateId": terminated.id})
# identities_api.get_identity_v1(id)  # verify`,
          },
          {
            type: 'callout',
            tone: 'tip',
            title: 'Say this',
            text: 'For emergency disable I set lifecycle to Terminated (resolved by name) so ISC provisions disables downstream.',
          },
          {
            type: 'quiz',
            id: 'm6:resolve:1',
            prompt: 'Correct order for an emergency leaver by lifecycle?',
            choices: [
              { id: 'a', label: 'POST set-lifecycle-state with a hardcoded Terminated GUID, skip GET' },
              { id: 'b', label: 'GET identity by alias → resolve Terminated by name → set state → GET verify' },
              { id: 'c', label: 'Disable one AD account, then submit an access request revoke' },
              { id: 'd', label: 'Wait for the next HR aggregation file' },
            ],
            correctId: 'b',
            explanation:
              'Name-resolve identity and lifecycle state, mutate, then verify with GET. GUIDs are tenant-specific; aggregation is too slow for ITDR.',
          },
        ],
      },
      {
        id: 'accounts-sources',
        title: 'Accounts & sources',
        blocks: [
          {
            type: 'list',
            items: [
              'Accounts live on sources; filter by identityId or native identity + source.',
              'Aggregation pulls truth on a schedule — do not wait for HR file when security needs now.',
              'Unmanaged / break-glass sources may need direct account disable in addition to lifecycle.',
              'Prefer /accounts/v1 and /sources/v1 pins in new work.',
            ],
          },
          {
            type: 'code',
            language: 'typescript',
            code: `const accounts = await accountsApi.listAccountsV1({
  filters: \`identityId eq "\${identityId}"\`,
  limit: 250,
});`,
          },
        ],
      },
    ],
    failureModes: [
      'Hardcoding LeaveOfAbsence / Terminated GUIDs.',
      'Disabling one AD account and declaring the identity offboarded.',
      'No verify GET — ticket closed on HTTP 202 alone.',
      'Race with aggregation overwriting an attribute you PATCHed on the account.',
    ],
    enterpriseChecklist: [
      'Identity correlation attributes documented',
      'Lifecycle state name map per identity profile',
      'Before/after evidence in run logs',
      'Source owners notified for unmanaged exceptions',
      'Dry-run mode for bulk JML jobs',
    ],
    checkpoints: [
      {
        id: 'm6-d1',
        prompt: "What's wrong with hardcoding LeaveOfAbsence's ID?",
        answer:
          'IDs are tenant-specific and differ by environment. Resolve by name from the identity profile’s lifecycle states each run.',
      },
      {
        id: 'm6-d2',
        prompt: 'ITDR needs disable now — why isn’t waiting for the next HR file enough?',
        answer:
          'HR aggregation is batch/slow. Compromised accounts need immediate API-driven lifecycle or disable — seconds, not the next file cycle.',
      },
    ],
  },
  {
    id: 'm7',
    number: 7,
    title: 'Access requests, roles, and certifications',
    shortTitle: 'Access & governance',
    estTime: '3–4 hr',
    goal: 'Automate access without bypassing governance',
    trackId: 'track-1',
    fluencyPhaseId: 'phase-3',
    labs: ['lab-capstone-c'],
    outcomes: [
      'Submit access requests for roles/access profiles/entitlements with approvals intact.',
      'Design peer-clone as dry-run → request, not direct grant.',
      'Know where certification and request-config APIs sit (including v2 outliers).',
    ],
    whenToUse: [
      'Joiner role packages, peer clone, training enrollment',
      'Status/cancel/close automations around request lifecycle',
      'Certification campaign integrations / reporting',
    ],
    whenNot: [
      'Emergency revoke for compromised user (lifecycle/disable — M6)',
      'SoD policy authoring in BeanShell (different admin surface)',
    ],
    sections: [
      {
        id: 'requests',
        title: 'Access requests',
        blocks: [
          {
            type: 'paragraph',
            text: 'Prefer /access-requests/v1 for create/status patterns. Some configuration endpoints migrate to v2 — check the migration table. Approvals still apply; automation is a requester, not a backdoor.',
          },
          {
            type: 'code',
            language: 'typescript',
            code: `// Pseudocode — resolve role IDs by name first
await accessRequestsApi.createAccessRequestV1({
  requestType: 'GRANT_ACCESS',
  requestedFor: [newHireId],
  requestedItems: roleIds.map((id) => ({ type: 'ROLE', id, comment: 'Peer clone' })),
});`,
          },
          {
            type: 'callout',
            tone: 'tip',
            title: 'Peer clone',
            text: 'Collect peer roles/entitlements → dry-run for manager → submit access requests. Never copy accounts by raw entitlement assignment APIs unless policy explicitly allows.',
          },
        ],
      },
      {
        id: 'certs',
        title: 'Certifications (integration literacy)',
        blocks: [
          {
            type: 'list',
            items: [
              'Campaigns review and revoke access on a schedule — integrations usually report, kick off, or sync decisions.',
              'Do not confuse certification revoke with ITDR emergency disable.',
              'Read scopes carefully; campaign APIs are easy to over-privilege.',
            ],
          },
        ],
      },
    ],
    failureModes: [
      'Direct entitlement assignment to skip approvals.',
      'Submitting requests with sandbox role GUIDs in prod.',
      'Ignoring pending approval SLAs in “automation success” metrics.',
      'Leaving access-request-config calls on legacy yearly paths.',
    ],
    enterpriseChecklist: [
      'Request types and item types documented',
      'Dry-run artifact for manager/audit',
      'Status polling / webhook strategy',
      'Cancel/close error handling',
      'Certification vs request vs lifecycle decision tree',
    ],
    checkpoints: [
      {
        id: 'm7-d1',
        prompt: 'Why must peer clone submit access requests?',
        answer:
          'To preserve approvals, SoD, and audit. Direct grants bypass governance the business relies on.',
      },
      {
        id: 'm7-d2',
        prompt: 'Name one migration foot-gun specific to access APIs.',
        answer:
          'Some access-request-config / entitlements paths map to v2, not v1 — verify in the official migration table.',
      },
    ],
  },
]
