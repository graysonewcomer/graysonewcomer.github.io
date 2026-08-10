import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { scroll, sectionProgress } from '../lib/scroll';
import { palette } from '../lib/theme';
import { PARTICLE_COUNT, takeover, setFrameRequest } from '../lib/cloud';
import {
  textPoints,
  smileyPoints,
  stackPoints,
  geodesicPoints,
  shellPoints,
} from './shapes';

/**
 * The cloud. One THREE.Points object — a single draw call however many
 * particles. Each frame, every particle lerps between the two shapes flanking
 * the current section and writes into the position buffer.
 *
 * ~1.8ms/frame for 25k on desktop. The CPU-vs-shader tradeoff is in
 * docs/DECISIONS.md.
 */

/** How much of the transition each particle gets, once its delay has elapsed. */
const TRAVEL = 0.65;
/** Max fraction of the transition spent waiting. This is the whole effect. */
const MAX_DELAY = 0.35;

/** How fast the console's hold on the cloud comes and goes. */
const TAKEOVER_DAMPING = 3.5;

export function ParticleCloud({ reducedMotion }) {
  const points = useRef();
  const invalidate = useThree((s) => s.invalidate);

  const count = PARTICLE_COUNT;

  // Let console commands pull frames out of an on-demand frameloop.
  useEffect(() => {
    setFrameRequest(invalidate);
    return () => setFrameRequest(null);
  }, [invalidate]);

  // Built once. Order matches the sections in App.jsx.
  const shapes = useMemo(
    () => [
      textPoints('GRAYSON', count),
      smileyPoints(count),
      stackPoints(count),
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

      // 60/30/10: green carries it, purple gives the mass something to sit in,
      // blue and pink are punctuation. The accent `boost` is required, not
      // decorative — bloom selects on luminance and pink sits under the
      // threshold at any brightness without it. See docs/DECISIONS.md.
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

  useFrame((state, delta) => {
    const geo = points.current?.geometry;
    if (!geo) return;

    const { index, local } = sectionProgress(shapes.length);
    const from = shapes[index];
    const to = shapes[index + 1];
    const arr = geo.attributes.position.array;
    const time = reducedMotion ? 0 : state.clock.elapsedTime;

    // Ease the console's hold on the cloud. Same frame-rate independent form as
    // the scroll damping in scroll.js. Reduced motion snaps instead: there's no
    // loop running to ease across, and an instant change is the right answer for
    // that preference anyway.
    if (reducedMotion) {
      takeover.mix = takeover.want;
    } else {
      const dt = Math.min(delta, 0.1);
      takeover.mix += (takeover.want - takeover.mix) * (1 - Math.exp(-TAKEOVER_DAMPING * dt));
    }
    // Fully handed back: drop the buffer so a one-off `spell` isn't held alive.
    if (takeover.want === 0 && takeover.mix < 0.001) {
      takeover.mix = 0;
      takeover.shape = null;
    }
    const held = takeover.shape;
    const hold = held ? takeover.mix : 0;

    for (let i = 0; i < count; i++) {
      const s = seeds[i];

      // Per-particle stagger. In lockstep it reads as one rigid object being
      // tweened; staggered, the cloud appears to *decide* to become the next shape.
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

      // The console's shape, pulling against wherever the scroll put this
      // particle. Applied after the arc so a full hold lands exactly on the
      // held shape, and before the drift so it still breathes.
      if (hold > 0) {
        x += (held[i3] - x) * hold;
        y += (held[i3 + 1] - y) * hold;
        z += (held[i3 + 2] - z) * hold;
      }

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

    // Yaw driven by scroll, plus a slow oscillation. Deliberately not a
    // continuous spin — an accumulating rotation eventually renders the hero
    // name mirrored. Nothing readable sits on a monotonic rotation.
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
        // Additive makes dense regions glow; depthWrite off stops z-fighting.
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
