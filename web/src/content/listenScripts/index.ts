import { phaseListenScripts } from './phases'
import { moduleListenScriptsTrack0 } from './track0'
import { moduleListenScriptsTrack1 } from './track1'
import { moduleListenScriptsTrack2 } from './track2'
import { moduleListenScriptsTrack3 } from './track3'
import { moduleListenScriptsTrack4 } from './track4'

export { phaseListenScripts }

/** All Path B module Listen scripts (m0–m20). */
export const moduleListenScripts: Record<string, string[]> = {
  ...moduleListenScriptsTrack0,
  ...moduleListenScriptsTrack1,
  ...moduleListenScriptsTrack2,
  ...moduleListenScriptsTrack3,
  ...moduleListenScriptsTrack4,
}
