import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Vite doesn't read $PORT on its own. Honouring it lets a second dev server
  // start alongside one already holding 5173.
  server: { port: Number(process.env.PORT) || 5173 },

  resolve: {
    // drei depends on stats-gl, which pins three@0.170 — npm installs it nested,
    // so the dev graph ends up with two copies of three and the console warns
    // "Multiple instances of Three.js being imported". Two copies means two sets
    // of classes, so `instanceof THREE.Material` can be false for an object that
    // very much is one, and the failures are subtle and awful to chase.
    // Deduping forces every importer onto the root three@0.185.
    dedupe: ['three'],
  },

  // `base` stays '/' — correct for a username.github.io *user* page.
  // A project page (github.com/user/repo -> /repo/) would need base: '/repo/'.
})
