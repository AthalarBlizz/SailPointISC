import type { GlossaryEntry, TrackerItem } from './types'

/** Stable id for deep links (`#/glossary?term=…`) and element anchors. */
export function glossarySlug(term: string): string {
  return term
    .toLowerCase()
    .replace(/[`"'“”]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const glossary: GlossaryEntry[] = [
  {
    term: 'ISC',
    meaning: 'Identity Security Cloud — SailPoint’s SaaS identity governance platform',
    aliases: ['ISC', 'Identity Security Cloud'],
  },
  {
    term: 'PAT',
    meaning: 'Personal Access Token (OAuth client credentials for scripts)',
    aliases: ['PAT', 'PATs', 'Personal Access Token', 'Personal Access Tokens'],
  },
  {
    term: 'VA',
    meaning: 'Virtual Appliance — on-prem connectivity; contrast SaaS connectors',
    aliases: ['VA', 'Virtual Appliance'],
  },
  {
    term: 'OOTB connector',
    meaning: 'Out-of-the-box source connector shipped by SailPoint',
    aliases: ['OOTB connector', 'OOTB', 'out-of-the-box connector'],
  },
  {
    term: 'JML',
    meaning: 'Joiner / Mover / Leaver — identity lifecycle stages',
    aliases: ['JML', 'joiner/mover/leaver', 'joiner-mover-leaver'],
  },
  {
    term: 'SoD',
    meaning: 'Segregation of Duties — conflicting access controls',
    aliases: ['SoD', 'SOD', 'Segregation of Duties'],
  },
  {
    term: 'ITDR',
    meaning: 'Identity Threat Detection and Response — security-driven emergency disable paths',
    aliases: ['ITDR'],
  },
  {
    term: 'SIEM',
    meaning: 'Security Information and Event Management',
    aliases: ['SIEM'],
  },
  {
    term: 'SOAR',
    meaning: 'Security Orchestration, Automation, and Response',
    aliases: ['SOAR'],
  },
  {
    term: 'ITSM',
    meaning: 'IT Service Management (e.g. ServiceNow ticketing)',
    aliases: ['ITSM'],
  },
  {
    term: 'ADR',
    meaning: 'Architecture Decision Record — short written standards for an integration',
    aliases: ['ADR', 'ADRs', 'architecture decision record', 'Architecture Decision Record'],
  },
  {
    term: 'EOL',
    meaning: 'End of life — legacy yearly/v3/beta APIs stop functioning Q1 2029',
    aliases: ['EOL', 'end of life', 'end-of-life'],
  },
  {
    term: 'GUID',
    meaning: 'Globally unique identifier — tenant-specific object IDs; resolve by name at runtime',
    aliases: ['GUID', 'GUIDs'],
  },
  {
    term: 'Workflow Analyzer',
    meaning: 'SailPoint utility that finds legacy yearly or /latest paths in workflow HTTP actions',
    aliases: ['Workflow Analyzer'],
  },
  {
    term: '/latest',
    meaning: 'Yearly-alias URL shortcut — unsafe for production under the July 2026 strategy; pin /service/vN',
    aliases: ['/latest'],
  },
  {
    term: 'BeanShell',
    meaning: 'Scripting language used for ISC cloud Rules when transforms are not enough',
    aliases: ['BeanShell'],
  },
  {
    term: 'user level',
    meaning: 'Broad permission on the PAT owner (e.g. ORG_ADMIN) — separate from OAuth scopes',
    aliases: ['user level', 'user levels'],
  },
  {
    term: 'greenfield',
    meaning: 'New work — prefer per-service /service/vN paths and SDK 2.x',
    aliases: ['greenfield'],
  },
  {
    term: 'brownfield',
    meaning: 'Existing code still on yearly/v3/beta//latest — inventory and migrate before Q1 2029',
    aliases: ['brownfield'],
  },
  {
    term: 'JSON Patch',
    meaning: 'RFC 6902 partial update document; content-type application/json-patch+json',
    aliases: ['JSON Patch', 'json-patch'],
  },
  {
    term: 'Experimental header',
    meaning: 'X-SailPoint-Experimental: true — required for experimental API operations',
    aliases: ['Experimental header', 'X-SailPoint-Experimental'],
  },
  {
    term: 'Deprecation header',
    meaning: 'X-Deprecated: true on responses — endpoint is deprecated; plan migration',
    aliases: ['Deprecation header', 'X-Deprecated'],
  },
  {
    term: 'Per-service v1',
    meaning: 'Current URL style such as /accounts/v1 or /identities/v1',
    aliases: ['Per-service v1', 'per-service', '/service/vN'],
  },
  {
    term: 'Yearly v2026',
    meaning: 'Legacy collection style /v2026/accounts — maintain/migrate, not greenfield default',
    aliases: ['Yearly v2026', 'yearly APIs', 'yearly paths'],
  },
  {
    term: 'SDK 2.0 / V1 suffix',
    meaning: 'New client method naming (e.g. listAccountsV1) aligned with per-service APIs',
    aliases: ['SDK 2.0', 'SDK 2.x', 'V1 suffix'],
  },
  {
    term: 'Integration spec',
    meaning: 'Raw HTTP contract (method, path, headers, body) for another platform to call',
    aliases: ['Integration spec', 'integration-spec', 'integration spec'],
  },
  {
    term: 'Loopback connector',
    meaning: 'SaaS Connectivity connector that drives ISC via its own API as if it were a target system',
    aliases: ['Loopback connector', 'loopback connector'],
  },
  {
    term: 'searchAfter',
    meaning: 'Search API pagination token used after the 10k offset limit',
    aliases: ['searchAfter', 'search-after', 'search after'],
  },
  {
    term: 'spcx',
    meaning: 'Local SaaS Connectivity debug server for TypeScript connectors',
    aliases: ['spcx'],
  },
  {
    term: 'Connector customizer',
    meaning: 'TypeScript before/after hooks that mutate SaaS connector request/response I/O',
    aliases: ['Connector customizer', 'connector customizer', 'connector customizers'],
  },
  {
    term: 'Transform',
    meaning: 'JSON attribute mapping/calculation config — prefer over Rules when possible',
    aliases: ['Transforms', 'transforms', 'Transform'],
  },
  {
    term: 'Rule',
    meaning: 'BeanShell logic requiring SailPoint review/install when transforms are insufficient',
    aliases: ['cloud rules', 'cloud rule', 'Cloud Rules', 'Cloud Rule'],
  },
  {
    term: 'SaaS Connectivity',
    meaning: 'TypeScript custom connectors that run in SailPoint cloud for aggregate/provision Sources',
    aliases: ['SaaS Connectivity'],
  },
  {
    term: 'Aggregation',
    meaning: 'Pulling accounts and entitlements from a source into ISC',
    aliases: ['Aggregation'],
  },
  {
    term: 'Provisioning',
    meaning: 'Pushing create/update/disable/delete account changes out to sources',
    aliases: ['Provisioning'],
  },
  {
    term: 'Identity profile',
    meaning: 'Mapping, transforms, and lifecycle config for a population of identities',
    aliases: ['Identity profile', 'identity profiles', 'Identity Profile'],
  },
  {
    term: 'Lifecycle state',
    meaning: 'Named joiner/mover/leaver status (e.g. Active, Terminated) that drives provisioning',
    aliases: ['Lifecycle state', 'lifecycle states', 'Lifecycle State'],
  },
  {
    term: 'Access profile',
    meaning: 'Bundle of entitlements used in roles, requests, and certifications',
    aliases: ['Access profile', 'access profiles', 'Access Profile'],
  },
  {
    term: 'client credentials',
    meaning: 'OAuth grant type used with a PAT client id/secret to mint a short-lived bearer token',
    aliases: ['client credentials', 'client_credentials'],
  },
  {
    term: 'dry-run',
    meaning: 'Preview mutations without committing them — required for bulk/peer-clone style jobs',
    aliases: ['dry-run', 'dry run'],
  },
  {
    term: 'V2 outlier',
    meaning: 'Service that maps to /v2 (e.g. access-request-config) — verify OpenAPI + migration table',
    aliases: ['V2 outlier', 'V2 outliers', 'v2 outliers'],
  },
  {
    term: 'sp:scopes:all',
    meaning: 'PAT scope granting everything the user level permits — avoid as a default; prefer specific :read/:manage scopes',
    aliases: ['sp:scopes:all', 'scopes all', 'scopes:all'],
  },
  {
    term: 'sp:scopes:default',
    meaning: 'Minimal PAT scope — public endpoints only when no broader scopes are granted',
    aliases: ['sp:scopes:default'],
  },
]

export const trackerItems: TrackerItem[] = [
  { id: 't-phase-0', path: 'fluency', label: 'Phase 0 — vocabulary & product story' },
  { id: 't-phase-1', path: 'fluency', label: 'Phase 1 — auth/scopes/errors/keyring' },
  { id: 't-phase-2', path: 'fluency', label: 'Phase 2 — versioning dual-world (July 2026)' },
  { id: 't-phase-3', path: 'fluency', label: 'Phase 3 — domain API design fluency' },
  { id: 't-phase-4', path: 'fluency', label: 'Phase 4 — TypeScript API SDK literacy' },
  { id: 't-phase-5', path: 'fluency', label: 'Phase 5 — Python/Go/PS/REST/CLI choice' },
  { id: 't-phase-6', path: 'fluency', label: 'Phase 6 — transforms/rules/workflows/connectors' },
  { id: 't-phase-7', path: 'fluency', label: 'Phase 7 — production craft ADR' },
  { id: 't-cap-a', path: 'fluency', label: 'Capstone A — emergency disable (current paths)' },
  { id: 't-cap-b', path: 'fluency', label: 'Capstone B — compliance bridge design' },
  { id: 't-cap-c', path: 'fluency', label: 'Capstone C — peer provisioner (2.x naming)' },
  { id: 't-cap-d', path: 'fluency', label: 'Capstone D — migration advisory' },
  {
    id: 't-eol',
    path: 'fluency',
    label: 'Can explain Q2 2028 / Q1 2029 legacy timeline without notes',
  },
  { id: 't-m0', path: 'implementation', label: 'M0 — Platform model' },
  { id: 't-m1', path: 'implementation', label: 'M1 — Auth and scopes' },
  { id: 't-m2', path: 'implementation', label: 'M2 — Versioning and migration' },
  { id: 't-m3', path: 'implementation', label: 'M3 — Spec-driven development' },
  { id: 't-m4', path: 'implementation', label: 'M4 — REST any-language client' },
  { id: 't-m5', path: 'implementation', label: 'M5 — Filters, Search, PATCH, bulk' },
  { id: 't-m6', path: 'implementation', label: 'M6 — Identities, accounts, lifecycle, sources' },
  { id: 't-m7', path: 'implementation', label: 'M7 — Access, requests, certifications' },
  { id: 't-m8', path: 'implementation', label: 'M8 — TypeScript SDK 2.x' },
  { id: 't-m9', path: 'implementation', label: 'M9 — Python SDK' },
  { id: 't-m10', path: 'implementation', label: 'M10 — Go and PowerShell SDKs' },
  { id: 't-m11', path: 'implementation', label: 'M11 — SailPoint CLI' },
  { id: 't-m12', path: 'implementation', label: 'M12 — Transforms' },
  { id: 't-m13', path: 'implementation', label: 'M13 — Rules' },
  { id: 't-m14', path: 'implementation', label: 'M14 — Workflows' },
  { id: 't-m15', path: 'implementation', label: 'M15 — SaaS Connectivity' },
  { id: 't-m16', path: 'implementation', label: 'M16 — Connector customizers' },
  { id: 't-m17', path: 'implementation', label: 'M17 — Architecture patterns' },
  { id: 't-m18', path: 'implementation', label: 'M18 — Production ops' },
  { id: 't-m19', path: 'implementation', label: 'M19 — Migration programs' },
  { id: 't-m20', path: 'implementation', label: 'M20 — Capstone portfolio A–H' },
  { id: 't-ib-eol', path: 'implementation', label: 'Can run a Q1 2029 migration program without notes' },
]
