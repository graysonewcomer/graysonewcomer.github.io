# Ideas

Things worth building, with the thinking already done so picking one up doesn't
start from scratch. Not a roadmap and not a promise — anything here can be cut.

The counterpart to `DECISIONS.md`: that file is what's **settled**, this is what's
**open**.

---

## The rule all of these have to pass

The scroll page is one composition — five sections, five shapes, one visual
register. A toy wedged into it fights the layout, and a toy that looks like a UI
widget fights the scene. That's how the physics toy died (see `DECISIONS.md`).

So anything playable either **is made of the scene's own material** (particles,
wireframe, bloom) or **lives behind the console**, which exists to be that door.
The console makes a new toy a command instead of a layout problem.

---

## Conway's Life — **built**

Shipped. `life` in the console for a random seed, `life <shape>` to seed from any
shape in the library. Escape closes the panel and it keeps running. The rule search,
the fixed-tick interpolation, and the traps are all written up in `DECISIONS.md`.

What was *not* built, and is still open:

- **Click to seed.** Picking a 3D cell from a 2D click, when the canvas is
  deliberately `pointer-events: none` so the page still scrolls. This is a bigger
  job than the rest of the feature was — the shape seeds cover most of the fun for
  none of the cost.
- **Life on the geodesic's faces** instead of a lattice, reusing the strut graph.
  Sidesteps 3D rule tuning by staying 2D-on-a-surface. The 12 pentagons mean 5
  neighbours where everything else has 6, so gliders break — fine for ambient,
  fatal for anything with a goal. Would pair well with snake below.

## Spell anything — **built**

Already shipped. `spell <text>` in the console, capped at 14 characters because
past that the glyphs are too thin to survive bloom. Nothing to fry: it's one
`textPoints()` call, the same one the hero already makes on every page load, and
the cloud's particle count never changes.

Left open deliberately: it uppercases. Lowercase samples fine but reads worse as
particles, and mixed case looked accidental rather than chosen.

## Snake on the geodesic struts

The most novel and the most likely to feel bad. `geodesicPoints` already dedupes
the icosahedron's 120 edges into a graph, so the board exists — snake traverses
edges between the 42 vertices.

**The whole risk is one question: what does "left" mean on a sphere?** There's no
global up, so turning has to be relative to the direction of travel. At a vertex
with 5 or 6 edges leaving it, "left" is a choice among several, and the honest
control is probably not a direction at all — it's *pick the next edge*, offered as
"the 2nd option clockwise from straight ahead." That may be genuinely fun or
genuinely unplayable, and no amount of design settles which.

**So prototype the control first, on the bare graph, before drawing anything
pretty.** If steering doesn't feel good after an hour, drop it — the geodesic
still earns its place as a shape.

Two things already known from `DECISIONS.md` that apply: keep `detail: 1` (120
edges, not 480 — `detail: 2` struts are too thin to read), and the shape is
radially symmetric all the way through its morph, so a snake on it never resolves
into an unfortunate silhouette mid-transition.

## Also open

- **`/log` route** — render `docs/DECISIONS.md` as a public build log. Written
  already, invisible to visitors, and the best hiring signal in the repo. Its own
  quiet frame, no particles; the place real photos of you could live too.
- **The portrait, if it ever comes back.** Cut from the about section on taste, not
  because it didn't work. `imagePoints` is still in `shapes.js` and still wired to
  the console's `morph portrait`; `public/portrait.svg` is a lighting study, not a
  face. Everything that was hard about it is already solved and written up in
  `DECISIONS.md` — don't rediscover it.
- **Mobile barely shows the cloud.** There's no left gutter to slide into, so the
  scrim goes flat across the full width at 0.84 and every shape reads as a faint
  glow. Fine for ambient shapes, a waste for an icon like the smiley. Fixing it
  means rethinking the mobile layout, not tweaking a number.
