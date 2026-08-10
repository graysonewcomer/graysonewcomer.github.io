/**
 * Conway's Life on a 3D lattice, displayed by the particle cloud.
 *
 * The cloud *is* the display — live cells become clusters of particles, and the
 * step between generations is interpolated so cells appear to travel rather than
 * blink. That interpolation is the whole reason this belongs in the scene instead
 * of on its own page: it's the same 25,000 particles that spelled the name, and
 * watching them rearrange is the effect.
 *
 * Nothing here touches React. `createLife` returns a buffer and a per-frame
 * driver, and `lib/cloud.js` hands both to the render loop.
 */

/**
 * 26-neighbour rule: survive on 4..12 neighbours, born on 10..13.
 *
 * Found by searching 1,296 candidate rules and scoring the survivors, not by
 * taste — see docs/DECISIONS.md. Two things that search settled:
 *
 * 2D's B3/S23 does not survive the move to three dimensions, and neither does the
 * canonical 3D rule everyone quotes (Bays' 5766, S5-7/B6-6) — from a random seed
 * it collapses to a seven-cell still life with zero churn.
 *
 * This one holds 620-870 live cells indefinitely, turns over about 65% of its
 * population per generation so it reads as alive, and stays clustered rather than
 * sprinkling into noise. It behaves near-identically from any seed, which matters
 * because it gets seeded from shapes as well as randomly.
 */
const SURVIVE_MIN = 4;
const SURVIVE_MAX = 12;
const BORN_MIN = 10;
const BORN_MAX = 13;

/** Cells per axis. 24³ is 13,824 cells against 25,000 particles. */
const SIZE = 24;
/** World extent of the lattice, in the same units as the other shapes. */
const EXTENT = 4.6;
/** Seconds per generation. Slow enough to read, fast enough to feel alive. */
const PERIOD = 0.5;
/** Fraction of a cell a particle may wander, so a cell reads as a cluster. */
const SPREAD = 0.34;

/** Neighbour count over the 26 surrounding cells. Outside the lattice is dead. */
function neighbours(cells, n, x, y, z) {
  let total = 0;
  for (let dz = -1; dz <= 1; dz++) {
    const zz = z + dz;
    if (zz < 0 || zz >= n) continue;
    for (let dy = -1; dy <= 1; dy++) {
      const yy = y + dy;
      if (yy < 0 || yy >= n) continue;
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0 && dz === 0) continue;
        const xx = x + dx;
        if (xx < 0 || xx >= n) continue;
        total += cells[(zz * n + yy) * n + xx];
      }
    }
  }
  return total;
}

/** One generation, into `next`. Returns the new population. */
function advance(cells, next, n) {
  let live = 0;
  for (let z = 0; z < n; z++) {
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const i = (z * n + y) * n + x;
        const count = neighbours(cells, n, x, y, z);
        const alive = cells[i] === 1
          ? count >= SURVIVE_MIN && count <= SURVIVE_MAX
          : count >= BORN_MIN && count <= BORN_MAX;
        next[i] = alive ? 1 : 0;
        if (alive) live++;
      }
    }
  }
  return live;
}

/**
 * Spread `count` particles over the live cells and write their positions.
 *
 * The cell list is built in lattice order and particles are dealt across it
 * proportionally. That ordering is load-bearing: consecutive generations produce
 * similar lists, so particle `p` lands near where it was last generation and the
 * interpolation reads as movement. Shuffling the list, or re-deriving assignments
 * some other way, turns every generation into an unrelated teleport.
 */
function writePositions(cells, n, out, count) {
  const cellSize = EXTENT / n;
  const origin = -EXTENT / 2 + cellSize / 2;

  const live = [];
  for (let i = 0; i < cells.length; i++) {
    if (!cells[i]) continue;
    const x = i % n;
    const rest = (i - x) / n;
    const y = rest % n;
    const z = (rest - y) / n;
    live.push(origin + x * cellSize, origin + y * cellSize, origin + z * cellSize);
  }

  const cellCount = live.length / 3;
  if (cellCount === 0) return 0;

  const wander = cellSize * SPREAD;
  for (let p = 0; p < count; p++) {
    const c = Math.min(cellCount - 1, Math.floor((p * cellCount) / count)) * 3;
    const o = p * 3;
    out[o] = live[c] + (Math.random() - 0.5) * wander;
    out[o + 1] = live[c + 1] + (Math.random() - 0.5) * wander;
    out[o + 2] = live[c + 2] + (Math.random() - 0.5) * wander;
  }
  return cellCount;
}

/** Random fill inside a centred ball, which gives the rule room to work outward. */
function seedRandom(cells, n, density) {
  const mid = (n - 1) / 2;
  const radius = n * 0.3;
  let live = 0;
  for (let z = 0; z < n; z++) {
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const dx = x - mid;
        const dy = y - mid;
        const dz = z - mid;
        if (dx * dx + dy * dy + dz * dz > radius * radius) continue;
        if (Math.random() >= density) continue;
        cells[(z * n + y) * n + x] = 1;
        live++;
      }
    }
  }
  return live;
}

/**
 * Voxelise an existing shape's points into the lattice, normalised to fit —
 * shapes are authored at different scales (the name is 6.5 wide, the smiley 4.2)
 * and an un-normalised seed would clip the wide ones.
 */
function seedFromPoints(cells, n, pts) {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < pts.length; i++) {
    if (pts[i] < min) min = pts[i];
    if (pts[i] > max) max = pts[i];
  }
  const span = Math.max(max - min, 1e-6);

  let live = 0;
  for (let i = 0; i < pts.length; i += 3) {
    const x = Math.min(n - 1, Math.max(0, Math.floor(((pts[i] - min) / span) * n)));
    const y = Math.min(n - 1, Math.max(0, Math.floor(((pts[i + 1] - min) / span) * n)));
    const z = Math.min(n - 1, Math.max(0, Math.floor(((pts[i + 2] - min) / span) * n)));
    const idx = (z * n + y) * n + x;
    if (cells[idx]) continue;
    cells[idx] = 1;
    live++;
  }
  return live;
}

/**
 * Build a running simulation.
 *
 * `held` is the buffer the cloud reads; `tick` advances it and must be called
 * once per frame. `onEnd` fires if the population dies out, which it can.
 */
export function createLife({ count, seedPoints = null, density = 0.32, onEnd = null }) {
  const n = SIZE;
  let cells = new Uint8Array(n * n * n);
  let next = new Uint8Array(n * n * n);

  const seeded = seedPoints ? seedFromPoints(cells, n, seedPoints) : seedRandom(cells, n, density);

  // Two generations of targets plus the interpolated buffer the cloud reads.
  const from = new Float32Array(count * 3);
  const to = new Float32Array(count * 3);
  const held = new Float32Array(count * 3);

  writePositions(cells, n, to, count);
  from.set(to);
  held.set(to);

  let t = 0;
  let generation = 0;
  let population = seeded;
  let dead = seeded === 0;

  function tick(delta) {
    if (dead) return;

    // A backgrounded tab hands back a huge delta. Clamp, or it burns through
    // dozens of generations in one frame.
    t += Math.min(delta, 0.1) / PERIOD;

    while (t >= 1) {
      t -= 1;
      from.set(to);
      population = advance(cells, next, n);
      const swap = cells;
      cells = next;
      next = swap;
      generation++;

      if (population === 0) {
        dead = true;
        t = 0;
        onEnd?.(generation);
        return;
      }
      writePositions(cells, n, to, count);
    }

    const e = t * t * (3 - 2 * t);
    for (let i = 0; i < held.length; i++) {
      held[i] = from[i] + (to[i] - from[i]) * e;
    }
  }

  return {
    held,
    tick,
    seeded,
    get generation() {
      return generation;
    },
    get population() {
      return population;
    },
  };
}

/**
 * Run the rule headlessly for `steps` generations and report the population each
 * time. Exists so the rule can be checked by measurement rather than by staring
 * at it — a 3D rule that looks plausible on paper usually dies by generation 3.
 */
export function probeRule(steps = 80, density = 0.32) {
  const n = SIZE;
  let cells = new Uint8Array(n * n * n);
  let next = new Uint8Array(n * n * n);
  const history = [seedRandom(cells, n, density)];

  for (let s = 0; s < steps; s++) {
    const live = advance(cells, next, n);
    const swap = cells;
    cells = next;
    next = swap;
    history.push(live);
    if (live === 0) break;
  }
  return history;
}
