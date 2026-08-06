import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const GAME_SERVER = process.env.VITE_GAME_SERVER ?? 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Lobby REST — optional; clients usually hit VITE_GAME_SERVER directly.
      '/games': GAME_SERVER,
    },
  },
})
