import * as THREE from 'three';
import { buildGeodesicGraph, turnsFrom } from './geodesic';

/**
 * Snake, played on the geodesic's struts.
 *
 * The board is the shape the scroll already shows: 42 joints, 120 edges. The
 * snake walks vertex to vertex and the player only ever answers one question —
 * which edge next.
 *
 * The steering was prototyped on the bare graph before any of this was drawn,
 * because "what does left mean on a sphere?" was the whole risk. The answer, and
 * the reason this is playable at all:
 *
 *   - At the 30 hexagonal joints there is an *exact* straight ahead (0.0°), with
 *     options at ±60° and ±120° either side. Holding nothing goes straight, and
 *     straight closes into a loop of 11-16 steps rather than wandering.
 *   - At the 12 pentagonal joints there is no straight — only ±36° and ±108°.
 *     Arriving at one forces a jink. That's the mechanic, not a defect: twelve
 *     fixed places on the board where the snake cannot hold its line.
 *
 * So input is a *pending turn*, not a direction: one notch left or right through
 * the fan of options, applied at the next joint. There is no global up to steer
 * against, and binding arrows to world axes would mean the same key doing
 * different things depending on where the camera happened to be.
 */

/** Seconds per step. Slow enough to read a 63° turn coming; snake is not twitchy. */
const STEP = 0.28;

/** Vertices added per pickup. The board is 42 joints — growth has to be gentle. */
const GROWTH = 2;

/** Starting body length, in vertices. */
const START_LEN = 4;

/**
 * Particle budget split. The cage has to stay visible or the snake is a worm in
 * the void with nothing to plan against, but it's scenery — the body takes the
 * bulk so it reads as the bright thing. Density is the only channel available:
 * the cloud bakes per-particle colour at mount and rewrites positions only.
 */
const BOARD_SHARE = 0.3;
const FOOD_SHARE = 0.08;

/**
 * At a pentagon with no input, the snake carries the direction of its last turn.
 *
 * Something has to break the ±36° tie, and this is the one that doesn't feel
 * random: a snake mid-curve keeps curving, and a snake that arrived straight
 * gets a consistent bias it can be steered out of. Picking the side nearer the
 * food would play itself; picking randomly would make the same approach behave
 * differently twice.
 */
const DEFAULT_BIAS = 1;

export function createSnake({ count, onEat = null, onEnd = null }) {
  const graph = buildGeodesicGraph();
  const n = graph.positions.length;

  // Undirected edge list, for scattering the board particles.
  const edges = [];
  graph.neighbors.forEach((nb, i) => nb.forEach((j) => i < j && edges.push([i, j])));

  // Start anywhere with a real straight ahead, so the first few steps read as a
  // line before the board starts making demands.
  let at = graph.neighbors.findIndex((nb) => nb.length === 6);
  let from = graph.neighbors[at][0];
  // Body, head first. The head is `body[0]`, and the snake dies on re-entering
  // any of it.
  let body = [at];
  let target = START_LEN;

  let next = null;      // vertex being walked toward
  let t = 0;            // 0..1 along the current edge
  let pending = 0;      // -1 left, +1 right, queued for the next joint
  let bias = DEFAULT_BIAS;
  let food = -1;
  let score = 0;
  let dead = false;

  /** Choose the edge to leave `at` by, given the pending nudge. */
  function choose() {
    const opts = turnsFrom(graph, from, at);
    // Index of the straightest option. At a hexagon this is a true 0°; at a
    // pentagon the fan straddles zero and the bias decides which side counts as
    // "carrying on".
    let s = 0;
    for (let i = 1; i < opts.length; i++)
      if (Math.abs(opts[i].angle) < Math.abs(opts[s].angle)) s = i;

    const straddles = Math.abs(opts[s].angle) > 1e-3;
    if (straddles && pending === 0) {
      // No straight to hold: take the nearer option on the side the snake was
      // already turning toward.
      const side = opts.filter((o) => Math.sign(o.angle) === bias);
      if (side.length) return side.reduce((a, b) => (Math.abs(a.angle) < Math.abs(b.angle) ? a : b)).to;
      return opts[s].to;
    }

    const i = Math.min(opts.length - 1, Math.max(0, s + pending));
    if (pending !== 0) bias = pending;
    return opts[i].to;
  }

  function placeFood() {
    // Anywhere off the body. 42 joints means the free set is small late in a
    // run, so pick from the actual free list rather than rejection-sampling.
    const free = [];
    for (let i = 0; i < n; i++) if (!body.includes(i)) free.push(i);
    food = free.length ? free[Math.floor(Math.random() * free.length)] : -1;
  }

  function step() {
    from = at;
    at = next;
    next = null;

    if (body.includes(at)) {
      dead = true;
      onEnd?.(score);
      return;
    }

    body.unshift(at);
    if (at === food) {
      score += 1;
      target += GROWTH;
      placeFood();
      onEat?.(score);
    }
    while (body.length > target) body.pop();
  }

  placeFood();
  next = choose();

  // --- Rendering -----------------------------------------------------------
  //
  // Per-particle parameters are drawn once and reused every frame. Re-rolling
  // them per frame would boil the whole cloud into noise — the particles have to
  // stay put relative to the thing they're drawing while the thing itself moves.
  const boardCount = Math.floor(count * BOARD_SHARE);
  const foodCount = Math.floor(count * FOOD_SHARE);
  const bodyCount = count - boardCount - foodCount;

  const rand = (k) => Float32Array.from({ length: k }, Math.random);
  const jitter = (k, s) =>
    Float32Array.from({ length: k * 3 }, () => (Math.random() + Math.random() + Math.random() - 1.5) * s);

  const boardT = rand(boardCount);
  const boardJ = jitter(boardCount, 0.03);
  // Body particles are spread along the snake by arc fraction, sorted so that
  // consecutive particle indices run head-to-tail. The cloud's baked colours are
  // index-ordered, so an unsorted deal would dither the body's tint into mush.
  const bodyU = rand(bodyCount).sort();
  const bodyJ = jitter(bodyCount, 0.045);
  const foodJ = jitter(foodCount, 0.09);

  const held = new Float32Array(count * 3);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();

  /** World-space polyline of the body, head end first, including the part-walked edge. */
  const line = [];
  function buildLine() {
    line.length = 0;
    // The head leads the first body vertex by however far it is along the edge.
    if (next !== null && !dead) {
      a.copy(graph.positions[at]).lerp(graph.positions[next], t);
      line.push(a.clone());
    }
    for (const v of body) line.push(graph.positions[v]);
  }

  function draw() {
    buildLine();

    // Cumulative arc length, so particles spread evenly along the body rather
    // than bunching wherever the vertices happen to be close together.
    const seg = [];
    let total = 0;
    for (let i = 0; i < line.length - 1; i++) {
      const d = line[i].distanceTo(line[i + 1]);
      seg.push(d);
      total += d;
    }

    let o = 0;
    for (let i = 0; i < bodyCount; i++, o += 3) {
      let want = bodyU[i] * total;
      let k = 0;
      while (k < seg.length - 1 && want > seg[k]) want -= seg[k++];
      const u = seg[k] > 0 ? want / seg[k] : 0;
      a.copy(line[k]).lerp(line[k + 1] ?? line[k], u);
      held[o] = a.x + bodyJ[o];
      held[o + 1] = a.y + bodyJ[o + 1];
      held[o + 2] = a.z + bodyJ[o + 2];
    }

    for (let i = 0; i < boardCount; i++, o += 3) {
      const [p, q] = edges[i % edges.length];
      a.copy(graph.positions[p]).lerp(graph.positions[q], boardT[i]);
      held[o] = a.x + boardJ[i * 3];
      held[o + 1] = a.y + boardJ[i * 3 + 1];
      held[o + 2] = a.z + boardJ[i * 3 + 2];
    }

    // The pickup is a knot at a joint, dense enough to find at a glance.
    b.copy(food >= 0 ? graph.positions[food] : graph.positions[0]);
    for (let i = 0; i < foodCount; i++, o += 3) {
      held[o] = b.x + foodJ[i * 3];
      held[o + 1] = b.y + foodJ[i * 3 + 1];
      held[o + 2] = b.z + foodJ[i * 3 + 2];
    }
  }

  /**
   * Steering listens on the window, because the way this is meant to be played
   * is with the console shut — same as Life. It ignores keys typed into a field
   * so the console's own history recall on the arrows still works.
   */
  function onKey(e) {
    const el = e.target;
    if (el instanceof HTMLElement && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') pending = -1;
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') pending = 1;
    else return;
    e.preventDefault();
    // Deliberately does *not* re-resolve `next` here. `t` is the fraction along
    // the edge already being walked, so swapping the destination mid-slide
    // teleports the head onto a different strut at the same fraction. The nudge
    // waits for the joint, which is also what makes it readable.
  }
  window.addEventListener('keydown', onKey);

  draw();

  return {
    held,
    /** Fixed-step advance, interpolated between joints so motion is a slide, not a snap. */
    tick(delta) {
      if (dead) return;
      t += delta / STEP;
      while (t >= 1) {
        t -= 1;
        step();
        if (dead) {
          draw();
          return;
        }
        // Consumed here, not in step(): the nudge has to survive until the joint
        // it applies at, and zeroing it any earlier throws the input away.
        next = choose();
        pending = 0;
      }
      draw();
    },
    dispose() {
      window.removeEventListener('keydown', onKey);
    },
    get score() {
      return score;
    },
    /** The occupied vertex chain, head first. The board state, minus the jitter. */
    get body() {
      return [...body];
    },
    get dead() {
      return dead;
    },
  };
}
