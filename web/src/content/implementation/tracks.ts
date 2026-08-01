import type { Track } from '../types'

export const tracks: Track[] = [
  {
    id: 'track-0',
    number: 0,
    title: 'Foundations',
    shortTitle: 'Foundations',
    description:
      'Platform nouns, auth/scopes, July 2026 versioning, and OpenAPI-first delivery discipline.',
    moduleIds: ['m0', 'm1', 'm2', 'm3'],
  },
  {
    id: 'track-1',
    number: 1,
    title: 'API craft',
    shortTitle: 'API craft',
    description:
      'Language-agnostic REST, filters/Search/PATCH/bulk, identity lifecycle, and access governance APIs.',
    moduleIds: ['m4', 'm5', 'm6', 'm7'],
  },
  {
    id: 'track-2',
    number: 2,
    title: 'SDKs & CLI',
    shortTitle: 'SDKs & CLI',
    description:
      'TypeScript 2.x, Python 2.x, Go/PowerShell, and SailPoint CLI for scaffold and migration.',
    moduleIds: ['m8', 'm9', 'm10', 'm11'],
  },
  {
    id: 'track-3',
    number: 3,
    title: 'Extensibility',
    shortTitle: 'Extensibility',
    description:
      'Transforms, rules, workflows, SaaS Connectivity connectors, and connector customizers.',
    moduleIds: ['m12', 'm13', 'm14', 'm15', 'm16'],
  },
  {
    id: 'track-4',
    number: 4,
    title: 'Senior delivery',
    shortTitle: 'Senior delivery',
    description:
      'Architecture patterns, production ops, migration programs, and portfolio capstones.',
    moduleIds: ['m17', 'm18', 'm19', 'm20'],
  },
]
