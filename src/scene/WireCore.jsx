import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { scroll } from '../lib/scroll';
import { palette } from '../lib/theme';

/**
 * A wireframe core that grows in over the back half of the page.
 *
 * This replaced a refractive glass crystal, twice over:
 *
 * 1. MeshTransmissionMaterial renders the scene into its own buffer each frame.
 *    Under an EffectComposer that buffer catches the already-bloomed output, so
 *    every frame refracts the last one's glow — a white orb that got worse the
 *    further you scrolled. Compounding, not merely bright.
 * 2. Swapping to polished metal fixed the blow-out but read as a dark blob
 *    punched out of the particle field. Solid geometry occludes; the whole
 *    appeal of this scene is that you can see through it.
 *
 * Wireframe + additive blending solves both. It adds light instead of blocking
 * it, so the cloud reads straight through the edges, and it's made of the same
 * glowing lines as everything else on the page.
 */

/** Page scroll range over which the core scales in. */
const APPEAR_START = 0.5;
const APPEAR_END = 0.82;

export function WireCore({ reducedMotion }) {
  const outer = useRef();
  const inner = useRef();

  useFrame((state) => {
    const raw = (scroll.current - APPEAR_START) / (APPEAR_END - APPEAR_START);
    const a = raw <= 0 ? 0 : raw >= 1 ? 1 : raw * raw * (3 - 2 * raw);
    const t = reducedMotion ? 0 : state.clock.elapsedTime;

    if (outer.current) {
      outer.current.visible = a > 0.01;
      outer.current.scale.setScalar(a * 2.4);
      outer.current.rotation.y = t * 0.1;
      outer.current.rotation.x = Math.sin(t * 0.17) * 0.3;
    }
    if (inner.current) {
      inner.current.visible = a > 0.01;
      // Counter-rotating and offset in scale so the two cages beat against each
      // other instead of reading as one rigid object.
      inner.current.scale.setScalar(a * 1.35);
      inner.current.rotation.y = -t * 0.16;
      inner.current.rotation.z = t * 0.08;
    }
  });

  return (
    <>
      <mesh ref={outer} visible={false}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={palette.green}
          wireframe
          transparent
          // Kept low: additive blending means every edge crossing another sums,
          // and the vertices of an icosahedron are exactly where many edges
          // meet. High opacity here is how you get white-hot knots.
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={inner} visible={false}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          color={palette.pink}
          wireframe
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
