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
]

export const trackerItems: TrackerItem[] = [
  { id: 't-phase-0', label: 'Phase 0 — vocabulary & product story' },
  { id: 't-phase-1', label: 'Phase 1 — auth/scopes/errors/keyring' },
  { id: 't-phase-2', label: 'Phase 2 — versioning dual-world (July 2026)' },
  { id: 't-phase-3', label: 'Phase 3 — domain API design fluency' },
  { id: 't-phase-4', label: 'Phase 4 — TypeScript API SDK literacy' },
  { id: 't-phase-5', label: 'Phase 5 — Python/Go/PS/REST/CLI choice' },
  { id: 't-phase-6', label: 'Phase 6 — transforms/rules/workflows/connectors' },
  { id: 't-phase-7', label: 'Phase 7 — production craft ADR' },
  { id: 't-cap-a', label: 'Capstone A — emergency disable (current paths)' },
  { id: 't-cap-b', label: 'Capstone B — compliance bridge design' },
  { id: 't-cap-c', label: 'Capstone C — peer provisioner (2.x naming)' },
  { id: 't-cap-d', label: 'Capstone D — migration advisory' },
  {
    id: 't-eol',
    label: 'Can explain Q2 2028 / Q1 2029 legacy timeline without notes',
  },
]
