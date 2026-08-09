import * as THREE from 'three';

/**
 * Point-cloud shape generators.
 *
 * Every generator returns exactly `count * 3` floats — particle `i` must exist
 * in every shape, because the morph is `lerp(shapeA[i], shapeB[i])`.
 */

/** Force any list of Vector3-ish triples to exactly `count` points. */
function resample(src, count) {
  const out = new Float32Array(count * 3);
  const n = src.length / 3;
  if (n === 0) return out;
  for (let i = 0; i < count; i++) {
    // Deterministic stride, wrapping when we need more points than we sampled.
    const j = (i % n) * 3;
    out[i * 3] = src[j];
    out[i * 3 + 1] = src[j + 1];
    out[i * 3 + 2] = src[j + 2];
  }
  return out;
}

/**
 * Text → points, via a 2D canvas: draw the string, read the pixels back, keep
 * the opaque ones. No font geometry, no typeface.json.
 */
export function textPoints(text, count, { width = 6.5, fontSize = 240 } = {}) {
  const cv = document.createElement('canvas');
  cv.width = 1600;
  cv.height = 440;
  const ctx = cv.getContext('2d', { willReadFrequently: true });

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${fontSize}px "Roboto Mono", ui-monospace, Consolas, monospace`;
  ctx.fillText(text, cv.width / 2, cv.height / 2);

  const { data } = ctx.getImageData(0, 0, cv.width, cv.height);
  // Every pixel: ~10ms once at startup for ~70k candidates, comfortably more
  // than the particle count, so no two particles land on the same position.
  const step = 1;

  // Collect hit pixels and their bounding box. Normalising to the ink bounds
  // rather than the canvas is what makes `width` mean the same thing for any
  // string — see docs/DECISIONS.md.
  const px = [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let y = 0; y < cv.height; y += step) {
    for (let x = 0; x < cv.width; x += step) {
      if (data[(y * cv.width + x) * 4 + 3] > 128) {
        px.push(x, y);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (px.length === 0) return new Float32Array(count * 3);

  const scale = width / Math.max(maxX - minX, 1);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const hits = [];
  for (let i = 0; i < px.length; i += 2) {
    // Sub-pixel jitter, or the glyphs read as a screen-door lattice.
    hits.push(
      (px[i] - cx + Math.random() - 0.5) * scale,
      -(px[i + 1] - cy + Math.random() - 0.5) * scale,
      (Math.random() - 0.5) * 0.25 // a little depth so it isn't a flat decal
    );
  }

  // Shuffle, or resample()'s stride carves scanlines out of the glyphs.
  const tri = hits.length / 3;
  for (let i = tri - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    for (let k = 0; k < 3; k++) {
      const tmp = hits[i * 3 + k];
      hits[i * 3 + k] = hits[j * 3 + k];
      hits[j * 3 + k] = tmp;
    }
  }

  return resample(Float32Array.from(hits), count);
}

/** Even sphere via the golden angle — no clumping at the poles. */
export function spherePoints(count, radius = 2.3) {
  const out = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * golden;
    out[i * 3] = Math.cos(theta) * r * radius;
    out[i * 3 + 1] = y * radius;
    out[i * 3 + 2] = Math.sin(theta) * r * radius;
  }
  return out;
}

/** Gaussian blobs on a ring — reads as a constellation / node graph. */
export function clusterPoints(count, clusters = 9, spread = 3.4) {
  const out = new Float32Array(count * 3);
  const centers = [];
  for (let c = 0; c < clusters; c++) {
    const a = (c / clusters) * Math.PI * 2;
    centers.push([
      Math.cos(a) * spread * (0.55 + Math.random() * 0.45),
      (Math.random() - 0.5) * 2.6,
      Math.sin(a) * spread * (0.55 + Math.random() * 0.45),
    ]);
  }
  for (let i = 0; i < count; i++) {
    const [cx, cy, cz] = centers[i % clusters];
    // Summed uniforms approximate a gaussian: dense cores, sparse edges.
    const g = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.5;
    out[i * 3] = cx + g();
    out[i * 3 + 1] = cy + g();
    out[i * 3 + 2] = cz + g();
  }
  return out;
}

/**
 * Geodesic dome — points along the strut *edges* of a subdivided icosahedron,
 * not its surface. `detail: 1` is 80 faces / 120 edges; raising it thins each
 * strut until the whole thing reads as a fuzzy ball.
 */
export function geodesicPoints(count, radius = 2.4, detail = 1) {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  // PolyhedronGeometry emits non-indexed triangles, so every 9 floats is a face
  // and a shared edge appears once per adjoining face. Dedupe or half the struts
  // come out twice as dense as the other half.
  const pos = geo.attributes.position.array;
  const edges = [];
  const seen = new Set();
  const key = (a, b) => `${a.toFixed(3)},${b.toFixed(3)}`;

  for (let f = 0; f < pos.length; f += 9) {
    for (let e = 0; e < 3; e++) {
      const i = f + e * 3;
      const j = f + ((e + 1) % 3) * 3;
      const ka = key(pos[i], pos[i + 1]) + key(pos[i + 1], pos[i + 2]);
      const kb = key(pos[j], pos[j + 1]) + key(pos[j + 1], pos[j + 2]);
      // Sort the endpoints so an edge keys the same from either triangle.
      const k = ka < kb ? ka + '|' + kb : kb + '|' + ka;
      if (seen.has(k)) continue;
      seen.add(k);
      edges.push([pos[i], pos[i + 1], pos[i + 2], pos[j], pos[j + 1], pos[j + 2]]);
    }
  }

  const out = new Float32Array(count * 3);
  // A slice of the budget piles onto the vertices so they read as joints rather
  // than as places where struts happen to cross.
  const nodeShare = 0.16;

  for (let i = 0; i < count; i++) {
    const [ax, ay, az, bx, by, bz] = edges[i % edges.length];
    let t;
    if (Math.random() < nodeShare) {
      // Bunch near whichever end this particle is closer to.
      t = Math.random() < 0.5 ? Math.random() * 0.06 : 1 - Math.random() * 0.06;
    } else {
      t = Math.random();
    }
    // Thin gaussian cross-section: a strut should be a filament, not a wire.
    const j = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.03;
    out[i * 3] = ax + (bx - ax) * t + j();
    out[i * 3 + 1] = ay + (by - ay) * t + j();
    out[i * 3 + 2] = az + (bz - az) * t + j();
  }

  geo.dispose();
  return out;
}

/** Thin hollow shell — the dispersal shape. */
export function shellPoints(count, radius = 4.2, thickness = 0.5) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1;
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.max(0, 1 - u * u));
    const d = radius + (Math.random() - 0.5) * thickness;
    out[i * 3] = Math.cos(a) * r * d;
    out[i * 3 + 1] = u * d;
    out[i * 3 + 2] = Math.sin(a) * r * d;
  }
  return out;
}
