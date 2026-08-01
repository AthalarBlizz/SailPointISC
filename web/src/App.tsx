import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ProgressProvider } from './hooks/useProgress'
import { HomePage } from './pages/HomePage'
import { PhasePage } from './pages/PhasePage'
import { SnapshotPage } from './pages/SnapshotPage'
import { GlossaryPage } from './pages/GlossaryPage'
import { TrackerPage } from './pages/TrackerPage'
import { DrillsPage } from './pages/DrillsPage'
import { LabsIndexPage } from './pages/LabsIndexPage'
import { LabPage } from './pages/LabPage'
import { ModulePage } from './pages/ModulePage'

export default function App() {
  return (
    <ProgressProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="snapshot" element={<SnapshotPage />} />
            <Route path="glossary" element={<GlossaryPage />} />
            <Route path="tracker" element={<TrackerPage />} />
            <Route path="drills" element={<DrillsPage />} />
            <Route path="labs" element={<LabsIndexPage />} />
            <Route path="labs/:labId" element={<LabPage />} />
            <Route path="phase/:phaseId" element={<PhasePage />} />
            <Route path="module/:moduleId" element={<ModulePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ProgressProvider>
  )
}
