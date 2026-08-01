import type { SnapshotRow } from './types'

export const currencyDate = '2026-07-31'

export const curriculumMeta = {
  title: 'SailPoint ISC Developer Curriculum',
  subtitle: 'Conversational fluency for API, TypeScript, and other code integrations',
  currencyDate,
  audience:
    'Developers learning to speak and build confidently around SailPoint Identity Security Cloud (ISC) APIs and SDKs — without requiring a live tenant for most modules.',
  outcome:
    'Hold a technical conversation with ISC developers, choose the right integration approach, read specs accurately, and write TypeScript / Python / REST integrations that match current SailPoint guidance.',
}

export const snapshotRows: SnapshotRow[] = [
  {
    topic: 'Primary API model',
    current:
      'Per-service semantic versioning is live. Paths look like /accounts/v1, /identities/v1, /access-requests/v1.',
    sayThis:
      'We version each service independently; major bumps only on breaking contract changes.',
  },
  {
    topic: 'Legacy yearly APIs',
    current: 'v2024 / v2025 / v2026, plus v3 and beta, still work.',
    sayThis: 'Legacy yearly collections are deprecated for new work but remain available.',
  },
  {
    topic: 'Legacy support / EOL',
    current:
      'Support tickets for Beta, V3, and yearly APIs through Q2 2028; endpoints stop functioning Q1 2029.',
    sayThis: 'Migration is urgent strategically but not overnight — deadline is Q1 2029.',
  },
  {
    topic: '/latest',
    current:
      'Introduced early 2026 as a yearly-alias shortcut; SailPoint now treats it as unsafe for production under the new strategy.',
    sayThis: '/latest auto-routes and can break silently; prefer explicit /service/vN.',
  },
  {
    topic: 'SDK major bump',
    current:
      'TypeScript sailpoint-api-client 2.0, Python sailpoint 2.x, plus Go and PowerShell — resource-based APIs with method suffixes (listAccountsV1).',
    sayThis: 'Old SDKs used year namespaces; new SDKs use AccountsApi.listAccountsV1().',
  },
  {
    topic: 'Migration tooling',
    current:
      'Official migration scripts + path mapping tables; Workflow Analyzer utility for scanning workflow HTTP actions.',
    sayThis: "Don't hand-rewrite — run the SDK migration script, then review V2 outliers.",
  },
  {
    topic: 'Docs layout',
    current:
      'Primary API docs are flattened (no year dropdown). Legacy specs remain under Legacy API Specifications.',
    sayThis: 'Look at current service docs first; use Legacy only when maintaining old code.',
  },
  {
    topic: 'This workshop repo',
    current:
      'DevDays 2026 scenarios still demonstrate yearly paths (/v2026/..., sailpoint.v2025) and Python SDK 1.4.x.',
    sayThis: 'Great for patterns; new greenfield work should target per-service v1 / SDK 2.x.',
  },
]

export const authoritativeLinks = [
  {
    label: 'API Versioning Strategy',
    href: 'https://developer.sailpoint.com/docs/api/api-versioning-strategy',
  },
  {
    label: 'API Versioning Migration Guide',
    href: 'https://developer.sailpoint.com/docs/api/api-versioning-migration/',
  },
  {
    label: 'Migration announcement (2026-07-14)',
    href: 'https://developer.sailpoint.com/discuss/t/api-versioning-strategy-update-whats-changed-and-how-to-migrate/216376',
  },
  {
    label: 'ISC API reference',
    href: 'https://developer.sailpoint.com/docs/api/',
  },
]
