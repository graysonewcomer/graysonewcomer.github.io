import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { scroll, sectionProgress } from '../lib/scroll';
import { palette } from '../lib/theme';
import { isMobile } from '../lib/device';
import { textPoints, spherePoints, clusterPoints, geodesicPoints, shellPoints } from './shapes';

/**
 * The cloud.
 *
 * One THREE.Points object — a single draw call no matter how many particles.
 * The morph runs in plain JS in useFrame: for each particle, lerp between the
 * two shapes flanking the current section and write into the position buffer.
 *
 * Measured at ~1.8ms/frame for 25k particles on desktop — about 11% of a 60fps
 * budget. That's the real cost of doing this on the CPU, and it buys you code
 * you can read and debug. If it ever needs to be free, this exact loop is what
 * moves into a vertex shader; the shapes and stagger logic carry over unchanged.
 */

const COUNT_DESKTOP = 25000;
const COUNT_MOBILE = 10000;

/** How much of the transition each particle gets, once its delay has elapsed. */
const TRAVEL = 0.65;
/** Max fraction of the transition spent waiting. This is the whole effect. */
const MAX_DELAY = 0.35;

export function ParticleCloud({ reducedMotion }) {
  const points = useRef();

  const count = isMobile ? COUNT_MOBILE : COUNT_DESKTOP;

  // Built once. Order matches the sections in App.jsx.
  const shapes = useMemo(
    () => [
      textPoints('GRAYSON', count),
      spherePoints(count),
      clusterPoints(count),
      geodesicPoints(count),
      shellPoints(count),
    ],
    [count]
  );

  const { positions, colors, seeds } = useMemo(() => {
    const positions = new Float32Array(shapes[0]);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);

    const green = new THREE.Color(palette.green);
    const blue = new THREE.Color(palette.blue);
    const pink = new THREE.Color(palette.pink);
    const purple = new THREE.Color(palette.purple);
    const c = new THREE.Color();

    for (let i = 0; i < count; i++) {
      seeds[i] = Math.random();

      // 60/30/10 applied to particles: green carries it, purple gives the mass
      // something to sit in, blue and pink are punctuation you notice only when
      // you look for them.
      //
      // The `boost` is not decoration. Bloom selects by *luminance*, and these
      // hues are nowhere near equal: in linear space green reads 0.553 but pink
      // only 0.346 — below the bloom threshold at any brightness. Left alone,
      // the rarest accent would be the one thing that never glows. Boosting the
      // accents puts them above the threshold so they behave like sparks.
      const r = Math.random();
      let boost = 1;
      if (r < 0.06) { c.copy(pink); boost = 1.5; }
      else if (r < 0.13) { c.copy(blue); boost = 1.5; }
      else if (r < 0.38) c.copy(purple).lerp(green, Math.random() * 0.4);
      else c.copy(green);

      // Vary brightness per particle so the cloud has internal depth instead of
      // reading as one flat sheet of colour.
      const b = (0.45 + Math.random() * 0.55) * boost;
      colors[i * 3] = c.r * b;
      colors[i * 3 + 1] = c.g * b;
      colors[i * 3 + 2] = c.b * b;
    }

    return { positions, colors, seeds };
  }, [shapes, count]);

  useFrame((state) => {
    const geo = points.current?.geometry;
    if (!geo) return;

    const { index, local } = sectionProgress(shapes.length);
    const from = shapes[index];
    const to = shapes[index + 1];
    const arr = geo.attributes.position.array;
    const time = reducedMotion ? 0 : state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const s = seeds[i];

      // Per-particle stagger. Without this every point moves in lockstep and the
      // whole thing looks like one rigid object being tweened. With it, the
      // cloud appears to *decide* to become the next shape.
      const t0 = (local - s * MAX_DELAY) / TRAVEL;
      const t = t0 <= 0 ? 0 : t0 >= 1 ? 1 : t0 * t0 * (3 - 2 * t0); // clamp + smoothstep

      const i3 = i * 3;
      let x = from[i3] + (to[i3] - from[i3]) * t;
      let y = from[i3 + 1] + (to[i3 + 1] - from[i3 + 1]) * t;
      let z = from[i3 + 2] + (to[i3 + 2] - from[i3 + 2]) * t;

      // Bulge outward at the midpoint of the journey, so particles arc rather
      // than sliding along straight lines. Peaks at t=0.5, zero at both ends.
      const arc = Math.sin(t * Math.PI) * 0.55;
      x += arc * Math.sin(s * 41.0);
      y += arc * Math.cos(s * 73.0);
      z += arc * Math.sin(s * 17.0);

      // Idle drift so a settled cloud is never truly static.
      if (!reducedMotion) {
        const p = time * 0.4 + s * 6.283;
        x += Math.sin(p) * 0.035;
        y += Math.cos(p * 1.3) * 0.035;
      }

      arr[i3] = x;
      arr[i3 + 1] = y;
      arr[i3 + 2] = z;
    }

    geo.attributes.position.needsUpdate = true;

    // Yaw driven by scroll, plus a slow *oscillation* — deliberately not a
    // continuous spin. `time * 0.04` accumulates without bound, so after about
    // 78 seconds the cloud had turned a full half-turn and the hero name was
    // rendering mirrored. Anything that must stay readable can't sit on a
    // monotonic rotation.
    points.current.rotation.y =
      scroll.current * 0.9 + (reducedMotion ? 0 : Math.sin(time * 0.12) * 0.09);
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.95}
        // Additive blending is what makes overlapping particles glow where the
        // cloud is dense. depthWrite off stops them z-fighting each other.
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
