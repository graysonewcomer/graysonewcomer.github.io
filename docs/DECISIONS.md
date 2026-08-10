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

### Section 1 is a smiley puck, and it was a sphere, and briefly a portrait

The sphere was the weakest shape on the page — generic, and the reason the geodesic
entry below had to be written around it ("section 2 is already a sphere").

A **portrait sampled from a photo** went in first and was cut on taste. The
sampler that did it (`imagePoints`, below) is good and still in the tree, reachable
from the console as `morph portrait`; the about section just isn't the place. Worth
keeping in mind if it ever comes back: everything in the entries below was measured
the hard way and doesn't need rediscovering.

What's there now is the acid-house / greeter-sticker smiley as a shallow puck —
filled face, eyes and mouth as voids, a cylinder wall extending back so it has a
side rather than being a decal. It earns the slot on three counts the portrait
didn't: it's iconic at a glance, it's radially symmetric so it never resolves into
an unfortunate silhouette mid-morph (see the torus knot), and it's procedural, so
there's no async load and no image file to get wrong.

Whatever ends up here, the constraint that killed the physics toy still applies:
correct content, wrong material is still wrong. A smiley *sticker* pasted on the
page would fail exactly the way a JPEG of a face would. It works because it's built
out of the same 25,000 particles as everything else.

### The smiley's features are voids, not ink

Additive particles make the disc glow, so the eyes and mouth have to be *absences*
to read the way the sticker does: bright plate, dark face. Drawing them as extra
particles instead gives a dark plate with a glowing grin, which is a different and
considerably creepier object.

Both boundary circles get their own slice of the budget on top of the wall. The
silhouette carries the whole read, and a uniformly sampled cylinder leaves its
edges soft — which is the one thing a disc cannot afford.

### A hard-edged shape exposed a latent framing bug

The cloud slides `OFFSET_X` (2.0 world units) to the right past the hero so it
stops fighting the copy, and `WIDEST_SHAPE` separately solves a scale that fits the
viewport. Neither knows about the other, so the offset eats into the room the fit
thought it had, and on a narrow, tall viewport the right side of the shape leaves
the frame.

This was always true. The sphere and the shell hid it because a soft, fuzzy edge
has no visible boundary to clip — the disc's rim made it obvious in one screenshot.
The slide is now capped at `OFFSET_MAX_FRACTION` of the visible width.

**A shape with a hard edge is the test case for framing.** Nothing with a soft
boundary will ever tell you the truth about this.

### Brightness sets particle *density*, not just inclusion

Keeping every pixel above a threshold gives uniform density, and tone survives
only as the outline of the kept region — a glowing flat plate with a hard edge.
Verified by rasterising the sampled points to a coarse grid: every cell came back
at the same occupancy.

Each pixel is instead kept with a probability that rises with its brightness
(`((q - cut) / (255 - cut)) ** 1.4`). Highlights come out dense, shadows thin
away, and the silhouette dissolves into the dark instead of being cut out of it.
The light direction is legible in the density alone.

### Choosing the cutoff and hitting the particle count are separate jobs

Conflating them is the trap, and it cost three passes to see.

Solving the cutoff *for the yield* — walk it down until the expected number of
survivors clears the target — sounds self-tuning and isn't. A subject that fills
more of the frame pushes the cutoff higher, so only its highlights survive and the
form comes apart; a dark image can't reach the target at any cutoff and comes up
short. Measured on a real file: `og.png` filled 17,732 of 25,000 that way,
`resample()` wrapped, and 29% of the positions were duplicates.

So the cutoff now decides one thing only — what counts as background, taken as the
brightest `POOL_RATIO * count` pixels — and a **gain solved off the histogram**
(`target / Σ hist[q] * weight(q)`, clamped to 1) makes the probabilities integrate
to the particle count. Framing and exposure stop mattering, and the subject's whole
tonal range participates instead of just its top end.

### The tone curve spans the image's own range, not 0..255

A dim image's pool sits just above the cutoff. Measured against pure white, every
pixel in it draws a near-zero probability, and the gain clamps at 1 before it can
compensate — `og.png` fell to 12,827 with the gain in place but the curve still
anchored to 255.

Anchoring the curve to the brightest occupied bucket instead fixes it. A
deliberately underexposed test image — everything inside the bottom 12% of the
range — samples as 25,000 unique positions in **one** connected component. The
darkest bucket's weight is kept off zero (`(q - cut + 1) / span`) so a perfectly
flat image is a uniform keep rather than a divide by nothing.

### `SAMPLE_MAX` is 900, not 520

Only part of a frame is subject and only part of that survives the thinning, so the
candidate pool has to be much larger than the particle count. At 520 the yield came
in at 23,192 for a 25,000 particle cloud and `resample()` wrapped. Cost is ~30 ms
once, including image decode.

**Known limit:** an image whose total ink is smaller than the particle count can't
supply enough distinct positions at any setting, and `resample()` wraps into
duplicates. `og.png` — thin text on black — fills 14,075 of 25,000. Portrait crops
are nowhere near this; sparse line art is.

### Connectivity is the test that catches a bad sample, not eyeballing it

The first placeholder lit the head, neck and shoulders with three separate
`objectBoundingBox` gradients. Each shape restarted its own falloff, both joins
fell dark enough to be thinned away, and it rendered as three disconnected blobs
with the head floating above the body.

A density map printed as ASCII *showed* this and it still got read as "silhouette
reads correctly" — the gaps were blank rows and blank rows look like margin.
Counting 8-connected components over the occupied cells is unambiguous: three
blobs scored 0.94 in the largest component, one lit figure scores 0.999.

Two things it caught that eyes did not: a radial gradient **pads** beyond its
radius, so a short radius or a non-black final stop leaves the far end of the
subject a flat dim wash that samples as isolated speckle rather than a falloff;
and one light has to cross the whole figure in `userSpaceOnUse` coordinates, which
is the same rule the README asks of a real photo.

### An async shape must be copied *into* its slot, never swapped in

No live code does this — every generator is synchronous again now that the about
section is procedural. Recorded because the constraint isn't obvious and the next
async shape will walk straight into it.

`colors` is memoised on `shapes`. Handing that memo a new array rebuilds the colour
buffer and reshuffles every particle's colour, which is glaring if it lands
mid-scroll. So a late-arriving shape gets `.set()` into the existing Float32Array,
keeping the array identity stable — no re-render at all, which is the same reason
`scroll.js` exists.

The write needs no synchronisation. The morph reads whatever is in the slot on the
frame it runs, so a late arrival costs at most one frame of particles taking a
different route. Failure has to leave the previous contents alone rather than
zeroing the slot, or every particle collapses onto the origin.

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

## Console

### The fun stuff gets a door, not a slot in the scroll

The scroll page is one continuous composition: five sections, five shapes, one
visual register. Things that are *played with* want dwell time; the scroll wants
momentum. Wedging a toy into a section fights the layout every time — that's what
the cut physics toy was, and the chips read as widgets pasted onto a pixel scene.

So there's a console instead. One door, and the next toy is a command rather than
a new layout problem. It's styled off the same tokens as the rest of the page for
the same reason the toy failed: a panel that looked like a dev tool would be the
pasted-on thing all over again.

### The console→cloud channel is a mutable module object

Same shape as `scroll.js`, same reason: `lib/cloud.js` exports a plain object that
the render loop reads directly every frame, and React never learns it changed. A
`setState` there would re-render the page on every frame of the blend.

The console's own UI *is* React state, and that's not a contradiction — it
re-renders per keystroke, not per frame.

`PARTICLE_COUNT` moved into that module because of this: anything building a
buffer to hand to the cloud has to emit exactly `count * 3` floats, and a
mismatched length reads past the end of the array mid-blend. One definition, so
the console and the cloud cannot disagree.

### The takeover blend goes after the arc and before the drift

After the arc, so a full hold lands exactly on the held shape instead of somewhere
near it. Before the idle drift, so a held shape still breathes rather than freezing
into a dead decal.

### Focus return is gated on the transition, not on "has this run before"

The console hands focus back to its opener when it closes. That effect also fires
on mount with the panel shut, so unguarded it focused the button on page load —
keyboard visitors started two thirds of the way down the tab order having done
nothing.

The obvious guard is a "first run" flag, and it doesn't work: **StrictMode invokes
mount effects twice**, so the flag is already spent by the second pass and the
focus steal comes back. Measured — `document.activeElement` was still
`.console-open` on load with the flag in place.

Tracking the previous value of `open` and acting only on the open→closed edge is
correct under single and double invocation both. Any effect here that should run
on a change and not on mount wants the same shape.

### Reduced motion needs an explicit frame request

Under `prefers-reduced-motion` the scene switches to an on-demand frameloop, so
nothing renders between scrolls. `seize()` would set its flag and then wait for a
loop that isn't running — `spell` would silently do nothing.

Two halves to the fix: `seize`/`release` call R3F's `invalidate` (registered by
ParticleCloud) to pull a frame, and the blend *snaps* rather than easing under
that preference, because one frame is all it gets and an instant change is the
right answer for the preference anyway.

Worth knowing for anything else added to the console: **changing cloud state is
not enough on its own, it has to ask for a frame too.**

---

## Life

### The rule was found by search, not by reputation

This is where the time went, exactly as expected, and it is worth knowing why so
nobody "simplifies" the rule back to something familiar.

2D's B3/S23 does not survive the move to 26 neighbours. Neither does **Bays' 5766
(S5-7/B6-6), the canonical 3D Life rule everyone cites** — from a random seed it
collapses to a *seven-cell still life* with zero churn. It was the module's first
default, on reputation alone, and it was wrong.

So 1,296 candidate rules were simulated and scored. The first scoring pass rewarded
churn and produced a shortlist of rules flipping 25-35% of all cells per generation
— that isn't life, it's television static. Structure needs **clustering**, so the
score gained a clump/fill ratio: mean neighbour count among live cells against the
overall fill. Sprinkled noise scores ~1, clustered blobs score 7 and up.

`S4-12/B10-13` won: holds 620-870 live cells indefinitely, turns over ~65% of its
population per generation so it reads as alive, clump/fill of 7.3, and behaves
near-identically from any seed — which matters because it's seeded from shapes as
well as randomly. Verified at the real 24³ lattice across three seeds for 150
generations each, then again from a text seed of only 246 cells, which also lives.

`probeRule()` stays exported from `life.js` so this is re-checkable. **Change the
lattice size and the rule needs re-testing** — behaviour at 16³ was not the same.

### Generations run on a fixed tick, interpolated between

One generation every 0.5s, with particle positions smoothstepped from the previous
generation's targets to the next. Stepping the simulation per frame would be both
wrong-looking — cells blinking instead of travelling — and about thirty times the
cost for no gain.

Interpolation is the entire reason this belongs in the scene rather than on its own
page. Cells that *travel* are the same effect as the section morph; cells that
blink are a Life implementation like any other.

Measured: 960 frames across 8 generations, median 4.2 ms, max 5.6 ms, **zero frames
over 16 ms.** The 359k-operation generation step disappears into the tick.

### Particles are dealt across live cells in lattice order

The cell list is built by walking the lattice and particles are spread across it
proportionally. That ordering is load-bearing: consecutive generations produce
similar lists, so particle `p` lands near where it was and the interpolation reads
as movement.

Shuffle the list — or assign particles to cells any other way — and every
generation becomes an unrelated teleport, which looks like a glitch rather than an
organism.

### The takeover channel grew a per-frame driver

`takeover.tick` is called from `ParticleCloud`'s `useFrame`, before the blend reads
the buffer, so the simulation and the blend can never disagree about which
generation a frame is showing. Giving Life its own loop or its own component would
put that ordering at the mercy of mount order.

`release()` clears `tick` immediately rather than when the blend finishes fading —
otherwise the simulation keeps burning CPU behind a cloud that has stopped showing
it.

### A dead population freezes; it does not collapse

If the rule kills everything, the buffer keeps its last positions and the console
says which generation it died at. Zeroing the buffer would drag all 25,000
particles onto the origin, which reads as a crash rather than an ending.

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
