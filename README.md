# portfolio

Rebuild of graysonewcomer.github.io. Vite + React 19 + react-three-fiber.

- [x] **Phase 1 — Foundation.** Fixed full-viewport canvas behind the content,
      normalized+damped scroll signal, palette, perf/a11y guards.
- [x] **Phase 2 — Particle cloud.** 25k points (10k mobile) reassembling per
      section: `GRAYSON` → sphere → clusters → geodesic dome → shell. Morph runs
      in JS, not a shader. ~1.8ms/frame.
- [x] **Phase 3 — Bloom + tone mapping.** Mipmap bloom, then Khronos PBR Neutral.
- [x] **Phase 4 — Wire core.** Counter-rotating wireframe cages, additive, fading
      in over the back half of the page.
- [x] ~~**Phase 5 — Physics toy.**~~ Built with rapier, then cut: 892 kB gzipped
      and the chips read as UI widgets pasted onto a pixel scene.
- [x] **Phase 6 — Content + layout.** Real copy ported from the old React site,
      two-column composition, viewport fitting, page metadata.
- [x] **Deploy.** `npm run deploy` → `gh-pages` branch of
      `graysonewcomer/graysonewcomer.github.io`.

## Architecture

**`src/lib/scroll.js` is the spine.** One damped 0..1 value every visual reads.

1. **Not React state.** A per-frame value in `useState` re-renders the tree 60x a
   second. It's a plain mutable object read directly from `useFrame`.
2. **`Rig` owns the clock.** Only caller of `updateScroll()`. Everything else
   reads `scroll.current` in its own `useFrame`.

`sectionProgress(n)` splits that into `{ index, local }` — which two shapes are
morphing and how far along.

`src/content.js` holds all copy. `src/lib/theme.js` mirrors the CSS custom
properties in `index.css`; keep them in sync.

**Layout rule:** content column left, cloud offset right (`OFFSET_X` in Rig).
The hero is the exception — the particles spell the name there, so the DOM `<h1>`
is `.sr-only` and the copy sits below. Two visible copies of the name overlapping
was the first thing that looked wrong.

## Scars worth keeping

Things that broke, so they don't get reintroduced:

- **No `MeshTransmissionMaterial` under an `EffectComposer`.** Transmission
  renders the scene into its own buffer each frame; under a composer that buffer
  catches the already-bloomed output and compounds. It read as a white orb that
  got worse the further you scrolled.
- **Nothing on a monotonic rotation that has to stay readable.** The cloud used
  `rotation.y += time * 0.04`; after ~78 seconds the hero name rendered mirrored.
  It oscillates now.
- **Bloom selects on luminance, and hues aren't equal.** Pink's linear luminance
  is 0.346 — under the 0.35 threshold at any brightness, so the rarest accent
  never glowed. Accents carry a 1.5x boost for this reason.
- **Text→points must normalise to the glyph bounding box,** not the canvas, or
  the size depends on string length and font metrics.
- **`resolutionScale` on `<Bloom>` is ignored when `mipmapBlur` is on.** Use
  `levels`.
- **`resolve.dedupe: ['three']`** in `vite.config.js` — drei pulls stats-gl,
  which pins three@0.170 and installs it nested. Verified: production bundle has
  exactly one copy.
- **Scrim is per-section, not a fixed overlay,** and skips `.intro`. A page-wide
  scrim washed the hero to grey, worst on mobile.
- **Look at the silhouette mid-morph, not just when it settles.** Section 4 was a
  torus knot. Fully formed it was fine; halfway through the transition it
  resolved into something two separate people flagged unprompted. It's a geodesic
  lattice now, which is radially symmetric the whole way in.
- **A point lattice needs few struts, not many.** `IcosahedronGeometry` at
  `detail: 2` is 480 edges — spread 25k particles over that much strut length and
  each one is too thin to survive bloom, so it reads as a fuzzy ball. `detail: 1`
  (120 edges) is the version you can see.

## Already handled

- DPR capped at 2, rendering stops when the tab is hidden
- `prefers-reduced-motion` renders one static frame
- Delta clamped to 100ms so a backgrounded tab doesn't teleport on return
- Canvas is `pointer-events: none` — can never eat a scroll
- Scene scales to fit the viewport (`WIDEST_SHAPE`), so the name isn't cropped
  on a portrait phone

## TODO

- Bundle is 322 kB gzipped, nearly all three.js. Fine; lazy-load `<Scene>` behind
  a `<Suspense>` boundary if it ever matters.
- `public/og.png` is a capture of the hero. Regenerate it if the hero changes —
  see "Regenerating the OG image" below.

## Dev

```bash
npm run dev
```

`vite.config.js` honours `$PORT` so a second dev server can run alongside one
already holding 5173.

## Deploy

```bash
npm run deploy
```

Builds to `dist/` and pushes it to the `gh-pages` branch, which is what GitHub
Pages serves for this repo. `base` stays `/` — this is a *user* page
(`username.github.io`), not a project page.

The create-react-app site that lived here before the rebuild is preserved on the
remote: branches `legacy-cra-site` (source) and `legacy-cra-pages` (its built
output), plus tag `v1-cra`.

### Regenerating the OG image

The WebGL canvas isn't in a DOM screenshot and its drawing buffer isn't readable
by default, so this is a two-line temporary patch rather than a script:

1. Add `preserveDrawingBuffer: true` to the `gl` prop in `src/scene/Scene.jsx`.
2. Add a dev-only Vite plugin whose `configureServer` writes a POSTed body to
   `public/og.png`.
3. Size the browser to 1200x630, then from the console draw the canvas into a 2D
   canvas, `fillText` the `.intro .label` / `.intro .role` copy over it (the DOM
   text is not on the canvas), and POST the blob.
4. Revert 1 and 2.
