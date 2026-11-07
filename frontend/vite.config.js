import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Gracefully fallback to demo/sample mode if VITE_API_BASE_URL is not set at build time
  if (mode === 'production' && !process.env.VITE_API_BASE_URL) {
    console.warn('[Vite Build] VITE_API_BASE_URL is not set. Frontend will default to offline demo baseline dataset.')
  }
  return { plugins: [react()] }
})
