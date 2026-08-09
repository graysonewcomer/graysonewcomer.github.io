# Decision log

Why this site is built the way it is. Every entry here is **settled** — it's
recorded so nobody re-litigates it or reintroduces the bug that caused it, not
because the code still needs explaining. The code should read as if these were
always the answer.

If you change something on this list, edit the entry. Don't add a comment in the
source arguing with it.

---

## Scene

### The scroll signal is a mutable module object, not React state

`src/lib/scroll.js` exports a plain object. A per-frame value in `useState`
re-renders the whole tree 60+ times a second; the render loop reads this one
directly and React never learns it changed.

`Rig` is the only caller of `updateScroll()`. Child `useFrame` callbacks fire
after their parent's, so everything downstream reads a value that was advanced
this frame.

### The morph runs on the CPU, not in a vertex shader

~1.8 ms/frame for 25k particles — about 11% of a 60fps budget. That's the real
price, and it buys code that can be read and stepped through. If it ever needs to
be free, the `useFrame` loop in `ParticleCloud` is what moves into a shader; the
shape generators and the stagger logic carry over unchanged.

Constraint that falls out of this: every generator must return exactly
`count * 3` floats, because the morph is `lerp(shapeA[i], shapeB[i])`. Mismatched
counts would make points pop in and out instead of travelling.

### Nothing readable sits on a monotonic rotation

The cloud used `rotation.y += time * 0.04`. After ~78 seconds it had turned a
half-turn and the hero name rendered mirrored. Rotation that has to stay legible
oscillates (`sin(time * k)`) instead of accumulating.

### Text→points normalises to the glyph bounding box

Not the canvas. Scaling against canvas size makes the result depend on font
metrics and string length — "GRAYSON" came out half the intended size that way.
Measuring the real ink bounds makes the `width` argument mean what it says for
any string.

Two supporting details: sub-pixel jitter on each sampled pixel, or the glyphs
read as a screen-door lattice; and a shuffle before resampling, or the stride
carves visible scanlines out of the letters.

### Section 4 is a geodesic lattice, and it was a torus knot

Fully formed, the torus knot was fine. Halfway through the morph it resolved into
a silhouette that two people flagged unprompted. **Check the shape mid-transition,
not just where it settles.** The geodesic is radially symmetric the whole way in.

Points ride the *struts*, not the surface — sampling the surface of a subdivided
icosahedron just gives you a second sphere, and section 2 is already a sphere.

### The geodesic uses `detail: 1`, not `2`

`detail: 2` is 480 edges. Spread 25k particles over four times the strut length
and each strut is too thin to survive bloom, so the whole thing reads as a fuzzy
ball. `detail: 1` (120 edges) is the version you can actually see. A point
lattice wants few dense struts, not many sparse ones.

### The core is a wireframe cage, after two failures

1. `MeshTransmissionMaterial` renders the scene into its own buffer each frame.
   Under an `EffectComposer` that buffer catches the already-bloomed output, so
   every frame refracts the previous frame's glow. Compounding, not merely
   bright — a white orb that got worse the further you scrolled.
2. Polished metal fixed the blow-out but read as a dark blob punched out of the
   particle field. Solid geometry occludes, and seeing through the scene is the
   whole appeal.

Wireframe + additive blending adds light instead of blocking it. Opacity stays
low (0.22) because additive means every edge crossing sums, and an icosahedron's
vertices are exactly where many edges meet — high opacity gives white-hot knots.

### The physics toy was built and cut

Implemented with rapier, then removed: 892 kB gzipped, and the interactive chips
read as UI widgets pasted onto a pixel scene rather than part of it.

### The signal spine runs its own rAF, outside Rig's clock

Everything in the scene reads the scroll value from `Rig`'s `useFrame`. The spine
is DOM, not canvas, so it can't — `useFrame` only exists inside `<Canvas>`. It
runs a second requestAnimationFrame loop that writes styles onto refs directly.
Still no React state per frame; a `setState` there would re-render the page on
every scroll frame, which is the thing `scroll.js` exists to avoid.

It reads `scroll.target` rather than `scroll.current` under reduced motion,
because the scene switches to an on-demand frameloop then and `current` stops
advancing.

### Node placement and node activation are separate numbers

A node sits at the scroll fraction where its section is centred. It goes *live*
when the section's top rises through the upper third of the viewport.

Using one number for both breaks the last section: its midpoint lies past the end
of the scrollable range, clamps to 1, and `04 / contact` only lit in the final 2%
of the page. Measured, not guessed — placement fractions came out 0 / 22.8 / 45.7
/ 72.8 / 100%, and contact never went live until scroll hit exactly 1.

---

## Rendering

### Accent colours carry a 1.5x brightness boost

Bloom selects on **luminance**, and hues are nowhere near equal. In linear space
green reads 0.553 but pink only 0.346 — under the 0.35-ish threshold at any
brightness. Left alone, the rarest accent would be the one thing that never
glowed. The boost puts pink and blue above the threshold so they behave like
sparks.

### Use `levels` to tune bloom cost, not `resolutionScale`

`resolutionScale` is deprecated and silently ignored when `mipmapBlur` is on.
Setting it looks like an optimisation and does nothing. Under mipmapBlur each
level is another downsample/upsample pair, so `levels` is the actual cost knob —
mobile drops 8 → 5, which removes the widest and least noticeable part of the halo.

### Khronos PBR Neutral tone mapping, applied after bloom

Nothing was compressing values above 1.0, so the bottom of the page clipped to
white. (Measured, not assumed — additive particle stacking was the obvious
suspect and turned out innocent; the shell is the *sparsest* shape on the page.)

PBR Neutral rolls highlights off toward white while preserving hue and
saturation. ACES — R3F's default, which `flat` on the `<Canvas>` disables —
desaturates as it brightens and would quietly grey out the neon.

It runs last on purpose: bloom should see the real HDR values, and only the final
image gets compressed.

---

## Layout and content

### The hero `<h1>` is `.sr-only`

The particles spell GRAYSON across the middle of the screen. Printing the name
again in the DOM put two visible copies on top of each other — the first thing
that looked wrong. The heading stays in the document, visually hidden, so screen
readers and search engines still get a real `<h1>`.

### The scrim is per-section, and skips the hero

A single fixed overlay washed the hero to grey, worst on mobile where the
gradient covers the full width. Each content section paints its own scrim;
`.intro` doesn't get one.

### The scene scales to fit the viewport

Shapes are authored in world units — the name is 6.5 wide — but a portrait phone
shows about 3.3 units across, so at native scale GRAYSON cropped to "RAYSO".
`WIDEST_SHAPE` in `Rig` solves for a scale that always fits.

### Proficiency percentages were dropped from the stack list

The old site rated skills numerically (React 95, TypeScript 90, Redux 20, Docker
20). Those were invented and several contradicted each other. A bare list claims
less and survives scrutiny better.

### The 2023 internship employer was filler

The old AI-built site listed "Digital Solutions Co." It was Amazon — Direct
Fulfillment, Inventory Team. Verified against the résumé. Worth knowing that the
old site's copy is not a trustworthy source for anything factual.

---

## Build and deploy

### `resolve.dedupe: ['three']`

drei depends on stats-gl, which pins three@0.170, so npm installs it nested and
the graph ends up with two copies of three. Two copies means two sets of classes,
so `instanceof THREE.Material` can be false for an object that very much is one.
Deduping forces every importer onto the root version. Verified: the production
bundle contains exactly one copy.

### `base` stays `/`

This is a **user** page (`username.github.io`), served from the repo root. A
project page (`github.com/user/repo` → `/repo/`) would need `base: '/repo/'`.
Changing this breaks every asset path.

### Vite honours `$PORT`

Vite doesn't read it on its own. Honouring it lets a second dev server start
alongside one already holding 5173, which matters when two tools want their own
preview of the same project.

### The old create-react-app site is preserved, not deleted

The rebuild replaced an unrelated history, so `main` was force-pushed. Before
that, the old site was pushed to `legacy-cra-site` (source) and
`legacy-cra-pages` (its built output), and tagged `v1-cra`.

### The bundle is 322 kB gzipped and that's accepted

Nearly all of it is three.js. Lazy-loading `<Scene>` behind a `<Suspense>`
boundary is the fix if it ever matters; it doesn't yet.
