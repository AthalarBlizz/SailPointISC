import type { GlossaryEntry, TrackerItem } from './types'

export const glossary: GlossaryEntry[] = [
  { term: 'PAT', meaning: 'Personal Access Token (OAuth client for scripts)' },
  {
    term: 'VA',
    meaning: 'Virtual Appliance (on-prem connectivity); contrast SaaS connectors',
  },
  { term: 'OOTB connector', meaning: 'Out-of-the-box source connector' },
  { term: 'JML', meaning: 'Joiner / Mover / Leaver' },
  { term: 'SoD', meaning: 'Segregation of Duties' },
  {
    term: 'Experimental header',
    meaning: 'X-SailPoint-Experimental: true',
  },
  {
    term: 'Deprecation header',
    meaning: 'X-Deprecated: true on responses',
  },
  {
    term: 'Per-service v1',
    meaning: 'Current URL style /accounts/v1',
  },
  {
    term: 'Yearly v2026',
    meaning: 'Legacy collection style /v2026/accounts',
  },
  {
    term: 'SDK 2.0 / V1 suffix',
    meaning: 'New client method naming (listAccountsV1)',
  },
  {
    term: 'Integration spec',
    meaning: 'Raw HTTP contract for another platform to call',
  },
  {
    term: 'Loopback connector',
    meaning: 'SaaS connector that drives ISC via its own API',
  },
  {
    term: 'searchAfter',
    meaning: 'Search API pagination token past the 10k offset limit',
  },
  {
    term: 'spcx',
    meaning: 'Local SaaS Connectivity debug server for TypeScript connectors',
  },
  {
    term: 'Connector customizer',
    meaning: 'TypeScript hooks that mutate SaaS connector request/response I/O',
  },
  {
    term: 'Transform',
    meaning: 'JSON attribute mapping/calculation config (prefer over rules when possible)',
  },
  {
    term: 'Rule',
    meaning: 'BeanShell logic requiring SailPoint review/install when transforms are insufficient',
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
