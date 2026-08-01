import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local default '/'. GitHub Pages workflow sets VITE_BASE for the repo path.
// Override for custom domain or parent-site embed (e.g. '/' or '/learn/')
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  plugins: [react()],
  base,
})
