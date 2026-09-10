import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'production' && !process.env.VITE_API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL must be set for a production build.')
  }
  return { plugins: [react()] }
})
