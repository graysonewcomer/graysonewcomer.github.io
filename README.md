# portfolio

## What this is

[graysonewcomer.github.io](https://graysonewcomer.github.io) — Grayson Newcomer's
portfolio, and an excuse to build something in three.js.

Five sections of copy scroll over a fixed 25,000-particle cloud that reassembles
into a different shape for each one: `GRAYSON` → smiley puck → clusters → geodesic
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

All copy lives in `src/content/*.json`, one file per section — nothing
user-facing is hardcoded in a component. You can edit those straight from
github.com and a push to `main` publishes on its own; see [Deploy](#deploy).
`src/content.js` just re-exports them under the names components import.

`src/lib/theme.js` mirrors the CSS custom properties in `src/index.css`; change
a colour in one and change it in the other.

### Turning any image into a shape

`imagePoints()` in `src/scene/shapes.js` samples an image file into a point cloud —
the same canvas trick as the text, with luminance standing in for alpha. No shape
on the scroll page uses it right now (the about section is a procedural smiley),
but it's live behind the console's `morph portrait`, pointed at the placeholder
`public/portrait.svg`.

To use a real image, drop it in `public/` and point `PORTRAIT_SRC` in
`src/lib/cloud.js` at it. What the sampler wants: **one clear light source, a dark
background, subject filling most of the frame.** Luminance decides which pixels
become particles, so a bright background competes with the subject and wins. Strong
side lighting beats a flat front flash — the light direction ends up encoded in the
particle density, and brighter pixels sit slightly forward, so the form has real
relief when the cloud yaws.

Any aspect ratio works (the sample normalises on height) and exposure doesn't
matter (the tone curve spans whatever range the image actually occupies).

The one thing that genuinely doesn't work is a sparse image — thin line art, or
text on a black field. An image whose total ink is smaller than the particle count
can't supply 25,000 distinct positions, so particles double up. Photographs are
nowhere near that limit; `public/og.png` is, and fills 14,075 of 25,000.

### Console

Backtick opens a console, or click `❯_` in the corner. `help` lists the commands.
It's the door for anything playable — the scroll page is a fixed composition of
five sections and five shapes, so a toy wedged into it fights the layout. A new
one is a command in `src/ui/Console.jsx` instead.

`spell <text>`, `morph <shape>` and `life` take the cloud away from the scroll
through `src/lib/cloud.js`; `release` gives it back. Anything building a buffer for
that channel has to emit exactly `PARTICLE_COUNT * 3` floats.

`life` runs Conway's Life on a 24³ lattice and displays it with the cloud — `life`
for a random seed, `life smiley` (or any shape name) to seed from a shape. Escape
closes the panel without stopping it, which is the way to watch. The rule is
`S4-12/B10-13`, arrived at by simulating 1,296 candidates; `probeRule()` in
`src/scene/life.js` is the tool that found it, and the reasoning is in
[docs/DECISIONS.md](docs/DECISIONS.md). Changing the lattice size means re-testing
the rule.

Before changing anything in `src/scene/`, read
[docs/DECISIONS.md](docs/DECISIONS.md). It's the list of things that were tried
and didn't work, and roughly half of them fail in ways that are invisible until
you've scrolled for 90 seconds or opened the page on a phone.

[docs/IDEAS.md](docs/IDEAS.md) is the other half of that: what's still open, with
the thinking and the known traps written down. `DECISIONS.md` is settled,
`IDEAS.md` is not.

## Architecture

**`src/lib/scroll.js` is the spine.** One damped 0..1 value that every visual
reads. It is a mutable module object rather than React state, and `Rig` is the
only thing that advances it — see the decision log for why both of those matter.

`sectionProgress(n)` splits that value into `{ index, local }`: which two shapes
are currently morphing, and how far along.

```
App.jsx            content column (left), sections drive page height
├─ Scene.jsx       <Canvas>, visibility + reduced-motion handling
│  ├─ Rig.jsx      advances scroll, moves the camera, fits + offsets the scene
│  │  ├─ ParticleCloud.jsx   the 25k points and the morph loop
│  │  └─ WireCore.jsx        counter-rotating wireframe cages
│  └─ Effects.jsx  bloom → tone mapping
└─ ui/SignalSpine.jsx   left-gutter rail that lights up per section (DOM, not canvas)

src/scene/shapes.js   shape generators; each returns exactly count * 3 floats
src/lib/theme.js      palette, mirrored by index.css
src/lib/device.js     isMobile, read once at load
src/content/*.json    all copy, one file per section
src/content.js        re-exports the JSON under the names components import
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

**Pushing to `main` deploys.** `.github/workflows/deploy.yml` lints, builds and
publishes `dist/` to the `gh-pages` branch, which is what GitHub Pages serves.
That includes edits made in the github.com file editor — change a word in
`src/content/about.json`, commit, and it's live in about a minute. If the build
fails (malformed JSON being the likely cause) nothing publishes and the site
keeps serving the last good version.

Never commit to `gh-pages` by hand; it's generated and gets overwritten.

To publish from your machine without pushing:

```bash
npm run deploy
```

Same destination, same result. `main` holds the source. `base` stays `/` — this
is a user page, not a project page.

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
