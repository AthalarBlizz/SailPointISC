import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local default '/'. GitHub Pages workflow sets VITE_BASE for the repo path.
// Override for custom domain or parent-site embed (e.g. '/' or '/learn/')
const base = process.env.VITE_BASE ?? '/'
const webRoot = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(webRoot, '..')

export default defineConfig({
  plugins: [react()],
  base,
  // Listen scripts live in docs/listen-scripts/ (outside web/)
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
})
