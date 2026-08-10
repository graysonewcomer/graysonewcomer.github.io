import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { updateScroll } from '../lib/scroll';
import { ParticleCloud } from './ParticleCloud';
import { WireCore } from './WireCore';
import { isMobile } from '../lib/device';
import { takeover } from '../lib/cloud';

/** How far right the cloud slides once you leave the hero, in world units. */
const OFFSET_X = 2.0;
/**
 * Ceiling on that slide as a fraction of the visible width.
 *
 * The offset is a world distance and the fit below solves for a *centred* shape,
 * so the two don't know about each other: on a narrow, tall viewport 2.0 units is
 * a quarter of the frame and the right side of the shape leaves it. Invisible on
 * the sphere and the shell, which have soft edges — obvious the moment a shape has
 * a hard rim.
 */
const OFFSET_MAX_FRACTION = 0.16;
/** Scroll range over which it slides. */
const SLIDE_END = 0.14;
/** World-unit width of the widest shape we need to keep on screen. */
const WIDEST_SHAPE = 7.2;

/**
 * Drives the scene from the scroll signal.
 *
 * The only component that calls updateScroll(), and it has to stay that way:
 * child useFrame callbacks fire after their parent's, so everything downstream
 * reads a value advanced this frame.
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

    // At the top the cloud owns the centre. Past the hero the copy takes the
    // left column, so slide the scene right and let them occupy different
    // halves. On a phone there is no left column to make room for.
    if (group.current) {
      const slide = Math.min(t / SLIDE_END, 1);
      const eased = slide * slide * (3 - 2 * slide);
      // A shape the console is holding slides back to centre. The fit below
      // solves for a *centred* shape, so an offset cloud has that much less room
      // on the right and a full-width shape crops — `spell` lost its last letter
      // off the edge of a narrow viewport. Centring while held also reads well:
      // the cloud comes back to the middle to be looked at.
      const slideTo = Math.min(OFFSET_X, state.viewport.width * OFFSET_MAX_FRACTION);
      const offset = isMobile ? 0 : eased * slideTo * (1 - takeover.mix);
      group.current.position.x = offset;

      // Fit to the viewport. Shapes are authored in world units but a portrait
      // phone shows ~3.3 across, so at native scale GRAYSON crops. viewport
      // gives the visible extent at the focal plane — solve for a scale that fits.
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
