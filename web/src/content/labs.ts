import type { Lab } from './types'
import { implLabs } from './implementation/implLabs'

export const fluencyLabs: Lab[] = [
  {
    id: 'lab-versioning',
    kind: 'versioning',
    title: 'Versioning dual-world mapper',
    description:
      'Map legacy yearly paths to current per-service paths. Tap Reveal when stuck, then mark Correct when you know it cold.',
    path: 'both',
    items: [
      {
        id: 'v-accounts',
        legacy: '/v2026/accounts',
        modern: '/accounts/v1',
        hint: 'Service name first, then version.',
      },
      {
        id: 'v-identities',
        legacy: '/v2025/identities',
        modern: '/identities/v1',
        hint: 'Same pattern as accounts.',
      },
      {
        id: 'v-access-requests',
        legacy: '/v2026/access-requests',
        modern: '/access-requests/v1',
        hint: 'Most services land on v1.',
      },
      {
        id: 'v-access-profiles',
        legacy: '/v3/access-profiles',
        modern: '/access-profiles/v1',
        hint: 'v3 is legacy too — still maps to per-service v1.',
      },
      {
        id: 'v-entitlements',
        legacy: '/v2026/entitlements',
        modern: '/entitlements/v2',
        hint: 'Outlier: v2026 entitlements map to v2 in the migration table.',
      },
      {
        id: 'v-latest',
        legacy: '/latest/accounts',
        modern: '/accounts/v1',
        hint: 'Avoid /latest in production; pin the service version.',
      },
    ],
  },
  {
    id: 'lab-filters',
    kind: 'filters',
    title: 'Filter drill',
    description:
      'Practice standard collection filter syntax. Type your answer, then compare to the model string.',
    path: 'both',
    items: [
      {
        id: 'f-alias',
        prompt: 'Find identity whose alias equals Jennifer.Thomas',
        answer: 'alias eq "Jennifer.Thomas"',
      },
      {
        id: 'f-name-sw',
        prompt: 'Identities whose name starts with John',
        answer: 'name sw "John"',
      },
      {
        id: 'f-and',
        prompt: 'firstname starts with john AND status equals ACTIVE',
        answer: 'firstname sw "john" and status eq "ACTIVE"',
      },
      {
        id: 'f-created',
        prompt: 'created after 2025-01-01T00:00:00Z',
        answer: 'created gt 2025-01-01T00:00:00Z',
      },
      {
        id: 'f-in',
        prompt: 'name is either Alice or Bob (use in)',
        answer: 'name in ("Alice","Bob")',
        note: 'Spacing inside the list can vary; operators and quotes matter.',
      },
      {
        id: 'f-identity-id',
        prompt: 'Accounts for identityId abc-123',
        answer: 'identityId eq "abc-123"',
      },
    ],
  },
  {
    id: 'lab-capstone-a',
    kind: 'capstone',
    letter: 'A',
    title: 'Emergency disable (integration spec)',
    brief:
      'Deliver a language-agnostic REST call sheet + TypeScript sketch using current /…/v1 paths. Compare to scenario1_itdr_disable.py. Resolve lifecycle state by name — never hardcode GUIDs.',
    path: 'both',
    checklist: [
      'Token via PAT client credentials',
      'Lookup identity by alias (filters)',
      'Resolve Terminated lifecycle state ID by name',
      'Set lifecycle state',
      'Verify with GET (before/after)',
      'Document as integration spec for ITDR/SIEM',
    ],
  },
  {
    id: 'lab-capstone-b',
    kind: 'capstone',
    letter: 'B',
    title: 'Compliance bridge (SDK automation)',
    brief:
      'Design nightly automation: external CSV → department rules → lifecycle / access request. Python or TypeScript. Dry-run mode required.',
    path: 'both',
    checklist: [
      'Define CSV schema and department rules',
      'Choose SDK (standalone script)',
      'EXPIRING → access request enrollment',
      'LAPSED → LeaveOfAbsence (resolve by name)',
      'COMPLETED → restore Active',
      'Dry-run flag before live mutations',
    ],
  },
  {
    id: 'lab-capstone-c',
    kind: 'capstone',
    letter: 'C',
    title: 'Peer access provisioner',
    brief:
      "Port scenario3's design to SDK 2.x method names (even if you cannot execute). Preserve approval workflows — dry-run then submit.",
    path: 'both',
    checklist: [
      'Resolve peer and new-hire by alias',
      'Collect peer roles + entitlements',
      'Dry-run output for manager review',
      'Submit access requests (not direct grants)',
      'Use listX V1 / createX V1 naming',
    ],
  },
  {
    id: 'lab-capstone-d',
    kind: 'capstone',
    letter: 'D',
    title: 'Migration advisory',
    brief:
      'Given a fictional inventory (v2024 scripts, v2025 workflows, one /latest job), produce a migration plan citing Q2 2028 / Q1 2029 and SDK migration scripts.',
    path: 'both',
    checklist: [
      'Inventory legacy yearly + /latest usage',
      'Map paths via official migration table',
      'Run SDK migration scripts (TS/Python/Go/PS)',
      'Scan workflows (Workflow Analyzer)',
      'Call out V2 outliers for manual review',
      'Timeline: support Q2 2028, EOL Q1 2029',
    ],
  },
]

export const labs: Lab[] = [...fluencyLabs, ...implLabs]

export function getLab(id: string): Lab | undefined {
  return labs.find((l) => l.id === id)
}
