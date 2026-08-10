import * as THREE from 'three';

/**
 * Point-cloud shape generators.
 *
 * Every generator returns exactly `count * 3` floats — particle `i` must exist
 * in every shape, because the morph is `lerp(shapeA[i], shapeB[i])`.
 */

/**
 * Fisher-Yates over triples, in place.
 *
 * Anything sampled off a canvas comes out in scanline order, and resample()'s
 * fixed stride would carve that order straight back into visible scanlines.
 * Shuffling first is what makes the stride safe.
 */
function shuffleTriples(a) {
  for (let i = a.length / 3 - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    for (let k = 0; k < 3; k++) {
      const tmp = a[i * 3 + k];
      a[i * 3 + k] = a[j * 3 + k];
      a[j * 3 + k] = tmp;
    }
  }
  return a;
}

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

  return resample(shuffleTriples(hits), count);
}

/**
 * Longest edge we sample an image at.
 *
 * Sized so the candidate pool survives being thinned: only a fraction of a
 * frame is subject, and only a fraction of that survives the brightness
 * rejection below, so filling 25k particles needs a few hundred thousand pixels
 * to start from. At 520 the cloud came up short and resample() wrapped.
 */
const SAMPLE_MAX = 900;
/**
 * Candidate pool, as a multiple of `count`. This is the cutoff's only job: keep
 * roughly this many of the brightest pixels and call the rest background.
 */
const POOL_RATIO = 4.5;
/** Hits to aim for, as a multiple of `count`. Above 1 so resample() never wraps. */
const HIT_RATIO = 1.25;
/**
 * Curve on the brightness→density mapping. 1 is linear; above that, dim pixels
 * get thinned harder, which is what keeps a photo's background from arriving as
 * a haze around the subject.
 */
const TONE_GAMMA = 1.4;

/**
 * Image → points. The same trick as textPoints — draw to a canvas, read the
 * pixels back, keep the ones that pass — with luminance standing in for alpha,
 * because bright is where an additively-blended cloud wants its density.
 *
 * Async, where every other generator in this file is synchronous: an <img> has
 * to load first. Callers get a promise and are expected to copy the result into
 * a shape slot in place; see ParticleCloud.
 */
export function imagePoints(src, count, opts = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        resolve(sampleImage(img, count, opts));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

function sampleImage(img, count, { height = 4.6, relief = 0.4 } = {}) {
  // Downscale to a fixed budget first. A phone photo is 12M pixels to walk and
  // the cloud can only spend `count` of them.
  const fit = Math.min(1, SAMPLE_MAX / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * fit));
  const h = Math.max(1, Math.round(img.height * fit));

  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  // Rec. 709 luma, quantised to the 256 buckets the histogram needs anyway.
  const lum = new Uint8Array(w * h);
  const hist = new Uint32Array(256);
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    // Premultiply by alpha: a cutout PNG's transparent surround is background,
    // and left alone it would threshold as the brightest thing in the frame or
    // the darkest depending on what happens to sit in its colour channels.
    const a = data[o + 3] / 255;
    const v = (0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]) * a;
    const q = v > 255 ? 255 : v | 0;
    lum[i] = q;
    hist[q]++;
  }

  // A pixel is kept with a probability that rises with its brightness, so
  // highlights come out dense and shadows thin into nothing. Keeping everything
  // above a flat threshold instead gives uniform density, and the photo lands as
  // a glowing cutout with a hard edge — tone survives only as the outline of the
  // kept region. This is the difference between a plate and a lit form.
  //
  // Two separate jobs, and conflating them is a trap. Solving the cutoff for the
  // yield directly means a subject that fills more of the frame pushes the cutoff
  // higher, so only its highlights survive and the form falls apart — while a
  // dark image can't reach the target at any cutoff and comes up short. Measured
  // on a real file: og.png yielded 17,732 of 25,000 that way, so resample()
  // wrapped and 29% of the positions were duplicates.
  //
  // So the cutoff only decides what counts as background — the brightest
  // POOL_RATIO * count pixels — and a scale factor solved off the histogram makes
  // the probabilities integrate to the target. Any exposure and any framing then
  // fills the cloud, and the whole tonal range of the subject participates rather
  // than just its top end.
  const target = count * HIT_RATIO;
  let cut = 254;
  for (let pool = 0; cut > 1; cut--) {
    pool += hist[cut];
    if (pool >= count * POOL_RATIO) break;
  }
  cut = Math.max(cut, 1);

  // Span the curve across the pool's own dynamic range rather than 0..255. A dim
  // image's pool sits just above the cutoff, and measured against pure white
  // every pixel in it draws a near-zero probability — og.png filled 12,827 of
  // 25,000 that way. Measured against its own brightest pixel it fills the cloud.
  // The +1 keeps the darkest bucket's weight off zero, so a flat image is a
  // uniform keep rather than a divide by nothing.
  let hi = cut;
  for (let q = 255; q > cut; q--) {
    if (hist[q]) {
      hi = q;
      break;
    }
  }
  const span = hi - cut + 1;
  const weight = (q) => Math.min(1, Math.pow((q - cut + 1) / span, TONE_GAMMA));

  let sum = 0;
  for (let q = cut; q <= 255; q++) sum += hist[q] * weight(q);
  if (sum === 0) throw new Error('no pixels above the luminance cutoff');
  // Clamped: an image too dark to reach the target even at full probability
  // yields fewer hits and resample() wraps, which costs duplicate positions but
  // still draws.
  const gain = Math.min(1, target / sum);

  // Bake the curve into a table — this is a per-pixel test over a few hundred
  // thousand pixels, and pow() in that loop is the whole cost of the function.
  const keepChance = new Float32Array(256);
  for (let q = cut; q <= 255; q++) keepChance[q] = Math.min(1, gain * weight(q));

  const px = [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const q = lum[i];
      // The cut test is redundant against the table but skips the RNG for the
      // background, which is most of the frame.
      if (q < cut || Math.random() >= keepChance[q]) continue;
      px.push(x, y, q);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  // Nothing bright enough to be a subject. Throwing lets the caller keep
  // whatever placeholder it already had, rather than collapsing every particle
  // onto the origin.
  if (px.length === 0) throw new Error('no pixels above the luminance cutoff');

  // Normalise on height, not width — a portrait is the tall one, and this is
  // what makes `height` mean the same thing for any crop.
  const scale = height / Math.max(maxY - minY, 1);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const hits = [];
  for (let i = 0; i < px.length; i += 3) {
    const l = px[i + 2] / 255;
    hits.push(
      // Sub-pixel jitter, same as the glyphs: on the raw integer grid the
      // sample reads as a screen door rather than a surface.
      (px[i] - cx + Math.random() - 0.5) * scale,
      -(px[i + 1] - cy + Math.random() - 0.5) * scale,
      // Brighter sits forward. Lighting already encodes which parts of a face
      // are near, so borrowing it gives real relief for free — the point being
      // that the cloud yaws with scroll, and a flat decal would give itself
      // away the moment it turned.
      (l - 0.5) * relief + (Math.random() - 0.5) * 0.06
    );
  }

  return resample(shuffleTriples(hits), count);
}

/** The sticker's features, in unit-disc coordinates. True means "leave empty". */
function onSmileyInk(u, v) {
  // Eyes, mirrored about the centre line by folding on |u|.
  const ex = (Math.abs(u) - 0.33) / 0.115;
  const ey = (v - 0.3) / 0.17;
  if (ex * ex + ey * ey < 1) return true;

  // Mouth: a band of a circle centred *above* the face, clipped to the lower
  // half. Curving it from above is what turns the ends up; an arc struck from
  // the centre of the disc would frown.
  if (v < -0.02) {
    const d = Math.hypot(u, v - 0.18);
    if (Math.abs(d - 0.62) < 0.095) return true;
  }
  return false;
}

/**
 * Smiley on a petri-dish puck.
 *
 * The eyes and mouth are *voids*, not ink. Additive particles make the disc glow,
 * so the features have to be absences for it to read the way the sticker does —
 * bright plate, dark face. Drawing them as extra particles would give a dark
 * plate with a glowing grin, which is a different and much creepier object.
 *
 * A cylinder wall extends back from the rim so this is a disc with a side rather
 * than a decal, and both boundary circles get their own slice of the budget: the
 * silhouette carries the whole read, and a uniformly sampled wall leaves it soft.
 */
// Slightly smaller than the sphere it replaced (2.3). A filled, hard-edged plate
// carries far more visual weight than a soft ball of the same radius, and at 2.3
// it crowded the body copy on a narrow viewport once the slide was capped.
export function smileyPoints(count, { radius = 2.1, depth = 0.55 } = {}) {
  const out = new Float32Array(count * 3);
  const front = depth / 2;
  const back = -depth / 2;

  const rimShare = 0.3;
  const frontRingShare = 0.07;
  const backRingShare = 0.04;
  const jitter = () => (Math.random() - 0.5) * 0.035;

  for (let i = 0; i < count; i++) {
    const pick = Math.random();
    let x, y, z;

    if (pick < rimShare) {
      // The extended side.
      const a = Math.random() * Math.PI * 2;
      x = Math.cos(a) * radius;
      y = Math.sin(a) * radius;
      z = back + Math.random() * depth;
    } else if (pick < rimShare + frontRingShare) {
      const a = Math.random() * Math.PI * 2;
      x = Math.cos(a) * radius;
      y = Math.sin(a) * radius;
      z = front;
    } else if (pick < rimShare + frontRingShare + backRingShare) {
      const a = Math.random() * Math.PI * 2;
      x = Math.cos(a) * radius;
      y = Math.sin(a) * radius;
      z = back;
    } else {
      // Face plate: uniform over the disc (sqrt, or it clumps at the centre),
      // resampled if it landed on a feature. The features cover ~12% of the
      // area, so the retry cap exists only to make the loop provably terminate.
      let u = 0;
      let v = 0;
      for (let t = 0; t < 16; t++) {
        const a = Math.random() * Math.PI * 2;
        const rr = Math.sqrt(Math.random());
        u = Math.cos(a) * rr;
        v = Math.sin(a) * rr;
        if (!onSmileyInk(u, v)) break;
      }
      x = u * radius;
      y = v * radius;
      z = front;
    }

    out[i * 3] = x + jitter();
    out[i * 3 + 1] = y + jitter();
    out[i * 3 + 2] = z + jitter();
  }

  return out;
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

/**
 * Stacked cylinders — the database-icon silhouette, for the stack section.
 *
 * Each tier is a wall plus a top cap, with a gap between tiers so the caps stay
 * visible. Those cap ellipses are the whole read: without them you get one tall
 * can, and the "layers" only exist because you can see the seams between them.
 */
export function stackPoints(count, { tiers = 4, radius = 2.0, tierH = 0.6, gap = 0.18 } = {}) {
  const out = new Float32Array(count * 3);
  const total = tiers * tierH + (tiers - 1) * gap;
  const base = -total / 2;
  // Enough of the budget on the caps to draw them, not so much that the walls
  // thin out — the walls are what carry the volume.
  const capShare = 0.34;

  for (let i = 0; i < count; i++) {
    const tier = i % tiers;
    const bottom = base + tier * (tierH + gap);
    const a = Math.random() * Math.PI * 2;
    const jitter = () => (Math.random() - 0.5) * 0.05;
    let r, y;

    if (Math.random() < capShare) {
      // Cap: biased outward so the rim stays crisp instead of the disc filling
      // in solid, which would hide the tier below it.
      r = radius * (0.5 + 0.5 * Math.sqrt(Math.random()));
      y = bottom + tierH;
    } else {
      r = radius;
      y = bottom + Math.random() * tierH;
    }

    out[i * 3] = Math.cos(a) * r + jitter();
    out[i * 3 + 1] = y + jitter();
    out[i * 3 + 2] = Math.sin(a) * r + jitter();
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
