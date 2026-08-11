import * as THREE from 'three';

/**
 * The geodesic as a *graph*, not as particles.
 *
 * `geodesicPoints` in shapes.js already dedupes the icosahedron's struts, but it
 * throws the topology away and returns a point buffer. Snake needs the thing
 * that got thrown away: 42 vertices, 120 edges, and — the part that actually
 * matters — the neighbours of each vertex in angular order around it, so
 * "turn left" can mean something on a surface with no global up.
 *
 * Kept separate from shapes.js because that file's job is buffers for the cloud
 * and this one's is topology. Both build the same IcosahedronGeometry and dedupe
 * on the same rounded-position key, so the graph's vertices land exactly on the
 * joints the struts already draw.
 */

/**
 * detail: 1 is not a tuning knob. detail: 2 struts are too thin to read (see
 * DECISIONS), and the graph has to match what's on screen or the snake runs
 * along edges the viewer can't see.
 */
export const GEODESIC_DETAIL = 1;

/** Same rounding as the strut dedupe, so a joint keys identically in both. */
const key = (x, y, z) => `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;

/**
 * Build the vertex/edge graph of the geodesic.
 *
 * Returns positions as THREE.Vector3 (the steering math is all cross products,
 * and hand-rolling them over a flat array reads worse than it runs), plus for
 * each vertex its neighbours sorted counter-clockwise as seen from outside the
 * sphere. The sort is what makes `turnsFrom` cheap and consistent.
 */
export function buildGeodesicGraph(radius = 2.4, detail = GEODESIC_DETAIL) {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const pos = geo.attributes.position.array;

  const index = new Map();
  const positions = [];

  const idOf = (i) => {
    const k = key(pos[i], pos[i + 1], pos[i + 2]);
    let id = index.get(k);
    if (id === undefined) {
      id = positions.length;
      index.set(k, id);
      positions.push(new THREE.Vector3(pos[i], pos[i + 1], pos[i + 2]));
    }
    return id;
  };

  // Non-indexed triangles: every 9 floats is a face, and a shared edge shows up
  // once per adjoining face, so the neighbour sets need to be sets.
  const nbr = [];
  const addEdge = (a, b) => {
    (nbr[a] ??= new Set()).add(b);
    (nbr[b] ??= new Set()).add(a);
  };

  for (let f = 0; f < pos.length; f += 9) {
    const a = idOf(f);
    const b = idOf(f + 3);
    const c = idOf(f + 6);
    addEdge(a, b);
    addEdge(b, c);
    addEdge(c, a);
  }

  geo.dispose();

  // Sort each vertex's neighbours counter-clockwise in its own tangent plane.
  // The sphere makes the normal free: a vertex's position *is* its outward
  // normal, so there's a well-defined "seen from outside" at every joint even
  // though the sphere as a whole has no up.
  const neighbors = positions.map((v, i) => {
    const n = v.clone().normalize();
    // Any tangent vector works as the zero of the angular sweep — the ordering
    // is what's used, never the absolute angle.
    const ref = tangent(positions[[...nbr[i]][0]], v, n);
    const bi = new THREE.Vector3().crossVectors(n, ref);

    return [...nbr[i]]
      .map((j) => {
        const t = tangent(positions[j], v, n);
        return { j, a: Math.atan2(t.dot(bi), t.dot(ref)) };
      })
      .sort((p, q) => p.a - q.a)
      .map((p) => p.j);
  });

  return { positions, neighbors };
}

/** Direction from `from` to `to`, flattened into the tangent plane at `from`. */
function tangent(to, from, n) {
  const d = new THREE.Vector3().subVectors(to, from);
  return d.addScaledVector(n, -d.dot(n)).normalize();
}

/**
 * The options available on arriving at `at` having come from `from`, ordered by
 * signed angle off straight-ahead: negative is left, positive is right, and the
 * entry nearest zero is as straight as the lattice allows.
 *
 * The edge back to `from` is never offered. Snake can't reverse into itself, and
 * including it would put a 180° option in the middle of the fan where a stray
 * keypress could find it.
 */
export function turnsFrom(graph, from, at) {
  const v = graph.positions[at];
  const n = v.clone().normalize();
  // Heading is the incoming direction carried through the joint, flattened —
  // "straight on" is where the snake was already going, not any fixed axis.
  const heading = tangent(v, graph.positions[from], n);
  // `heading × n`, not `n × heading`. Seen from outside the sphere the normal
  // points at the viewer, so rotating the heading by +90° *about* it sweeps
  // counter-clockwise — to the left. Crossing the other way is what actually
  // lands on screen-right, and getting it backwards inverts every control.
  const right = new THREE.Vector3().crossVectors(heading, n);

  return graph.neighbors[at]
    .filter((j) => j !== from)
    .map((j) => {
      const t = tangent(graph.positions[j], v, n);
      return { to: j, angle: Math.atan2(t.dot(right), t.dot(heading)) };
    })
    .sort((p, q) => p.angle - q.angle);
}
