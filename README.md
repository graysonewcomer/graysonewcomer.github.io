# portfolio

## What this is

[graysonewcomer.github.io](https://graysonewcomer.github.io) — Grayson Newcomer's
portfolio, and an excuse to build something in three.js.

Five sections of copy scroll over a fixed 25,000-particle cloud that reassembles
into a different shape for each one: `GRAYSON` → sphere → clusters → geodesic
dome → shell. Bloom, Khronos PBR Neutral tone mapping, and a wireframe core that
grows in over the back half. No shader code — the morph is plain JS running once
a frame.

Vite + React 19 + react-three-fiber + @react-three/postprocessing, three 0.185.

It replaced a create-react-app site that lived at the same URL. That version is
still on the remote (see [Deploy](#deploy)).

## Develop

```bash
npm install
npm run dev
```

```bash
npm run lint
```

`vite.config.js` honours `$PORT`, so a second dev server can start alongside one
already holding 5173.

All copy lives in `src/content.js` — nothing user-facing is hardcoded in a
component. `src/lib/theme.js` mirrors the CSS custom properties in
`src/index.css`; change a colour in one and change it in the other.

Before changing anything in `src/scene/`, read
[docs/DECISIONS.md](docs/DECISIONS.md). It's the list of things that were tried
and didn't work, and roughly half of them fail in ways that are invisible until
you've scrolled for 90 seconds or opened the page on a phone.

## Architecture

**`src/lib/scroll.js` is the spine.** One damped 0..1 value that every visual
reads. It is a mutable module object rather than React state, and `Rig` is the
only thing that advances it — see the decision log for why both of those matter.

`sectionProgress(n)` splits that value into `{ index, local }`: which two shapes
are currently morphing, and how far along.

```
App.jsx            content column (left), sections drive page height
└─ Scene.jsx       <Canvas>, visibility + reduced-motion handling
   ├─ Rig.jsx      advances scroll, moves the camera, fits + offsets the scene
   │  ├─ ParticleCloud.jsx   the 25k points and the morph loop
   │  └─ WireCore.jsx        counter-rotating wireframe cages
   └─ Effects.jsx  bloom → tone mapping

src/scene/shapes.js   shape generators; each returns exactly count * 3 floats
src/lib/theme.js      palette, mirrored by index.css
src/lib/device.js     isMobile, read once at load
src/content.js        all copy
```

**Layout rule:** content column left, cloud offset right (`OFFSET_X` in `Rig`).
The hero is the exception — the particles spell the name there, so the DOM `<h1>`
is `.sr-only` and the copy sits below it.

**Already handled**, so don't re-solve them: DPR capped at 2; rendering stops
when the tab is hidden; `prefers-reduced-motion` renders one static frame; frame
delta clamped to 100 ms so a backgrounded tab doesn't teleport on return; the
canvas is `pointer-events: none` and can never eat a scroll; the scene scales to
fit the viewport so the name isn't cropped on a portrait phone.

## Deploy

```bash
npm run deploy
```

Builds to `dist/` and pushes it to the `gh-pages` branch of
`graysonewcomer/graysonewcomer.github.io`, which is what GitHub Pages serves.
`main` holds the source. `base` stays `/` — this is a user page, not a project
page.

Verify a deploy actually landed rather than trusting the "Published" line:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://graysonewcomer.github.io/og.png
```

### Recovering the old site

The create-react-app version is on the remote as branch `legacy-cra-site`
(source), branch `legacy-cra-pages` (its built output), and tag `v1-cra`.

### Regenerating the OG image

`public/og.png` is a 1200x630 capture of the hero. Redo it if the hero changes.
The WebGL canvas isn't in a DOM screenshot and its drawing buffer isn't readable
by default, so this is a temporary patch rather than a script:

1. Add `preserveDrawingBuffer: true` to the `gl` prop in `src/scene/Scene.jsx`.
2. Add a dev-only Vite plugin whose `configureServer` writes a POSTed body to
   `public/og.png`.
3. Size the browser to 1200x630, then from the console: draw the canvas into a 2D
   canvas, `fillText` the `.intro .label` and `.intro .role` copy over it (that
   text is DOM, not canvas, so it isn't in the capture), and POST the blob.
4. Revert steps 1 and 2.

`og:image` in `index.html` must stay an absolute URL — scrapers don't resolve
relative paths.

### Updating the résumé

Drop the PDF in `public/` and point the `Résumé` entry in `src/content.js` at it.
The old filename stops resolving, so don't rename in place if the link is already
out in the world.
