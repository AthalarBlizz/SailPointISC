import type { Drill, Module, Track } from '../types'
import { tracks } from './tracks'
import { modules as track0 } from './track0'
import { modules as track1 } from './track1'
import { modules as track2 } from './track2'
import { modules as track3 } from './track3'
import { modules as track4 } from './track4'

export { tracks } from './tracks'
export { implLabs } from './implLabs'

export const implementationModules: Module[] = [
  ...track0,
  ...track1,
  ...track2,
  ...track3,
  ...track4,
]

export function getModule(id: string): Module | undefined {
  return implementationModules.find((m) => m.id === id)
}

export function getTrack(id: string): Track | undefined {
  return tracks.find((t) => t.id === id)
}

export function allImplementationDrills(): (Drill & { moduleId: string })[] {
  return implementationModules.flatMap((m) =>
    m.checkpoints.map((d) => ({ ...d, moduleId: m.id })),
  )
}
