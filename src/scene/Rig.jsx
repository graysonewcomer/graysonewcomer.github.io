import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { updateScroll } from '../lib/scroll';
import { ParticleCloud } from './ParticleCloud';
import { WireCore } from './WireCore';
import { isMobile } from '../lib/device';

/** How far right the cloud slides once you leave the hero, in world units. */
const OFFSET_X = 2.0;
/** Scroll range over which it slides. */
const SLIDE_END = 0.14;
/** World-unit width of the widest shape we need to keep on screen. */
const WIDEST_SHAPE = 7.2;

/**
 * Drives the scene from the scroll signal.
 *
 * This is the only component that calls updateScroll(), and it must run before
 * anything reads it. Child useFrame callbacks fire after their parent's, so
 * everything downstream sees a freshly advanced value.
 */
export function Rig({ reducedMotion }) {
  const group = useRef();

  useFrame((state, delta) => {
    const t = updateScroll(delta);

    // Gentle push-in and drift. The cloud does the work; the camera just keeps
    // it framed and adds a little parallax against the scrolling text.
    state.camera.position.z = 7.6 - t * 0.8;
    state.camera.position.y = t * -0.9;
    state.camera.position.x = Math.sin(t * Math.PI) * 0.4;
    state.camera.lookAt(0, 0, 0);

    // At the top the cloud spells the name and owns the centre of the screen.
    // Past the hero the body copy takes over the left column, so slide the
    // whole scene right and let the two occupy different halves instead of
    // overlapping. On a phone there is no left column to make room for.
    if (group.current) {
      const slide = Math.min(t / SLIDE_END, 1);
      const eased = slide * slide * (3 - 2 * slide);
      group.current.position.x = isMobile ? 0 : eased * OFFSET_X;

      // Fit to the viewport. The shapes are authored in world units — the name
      // is 6.5 wide — but a portrait phone only shows about 3.3 units across, so
      // at native scale GRAYSON was cropped to "RAYSO". state.viewport gives the
      // visible extent in world units at the focal plane, which is exactly the
      // number needed to solve for a scale that always fits.
      const fit = Math.min(1, (state.viewport.width * 0.9) / WIDEST_SHAPE);
      group.current.scale.setScalar(fit);
    }
  });

  // No lights: PointsMaterial is unlit and WireCore uses MeshBasicMaterial.
  return (
    <group ref={group}>
      <ParticleCloud reducedMotion={reducedMotion} />
      <WireCore reducedMotion={reducedMotion} />
    </group>
  );
}
