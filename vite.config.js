import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Vite doesn't read $PORT on its own. Honouring it lets a second dev server
  // start alongside one already holding 5173.
  server: { port: Number(process.env.PORT) || 5173 },

  resolve: {
    // Required: drei pulls stats-gl, which pins an older three and gets
    // installed nested. Two copies of three means two sets of classes and
    // `instanceof` checks that fail on objects that very much do match.
    dedupe: ['three'],
  },

  // `base` stays '/' — this is a username.github.io *user* page.
})
