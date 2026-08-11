import { isMobile } from './device';

/**
 * Shared cloud configuration, plus the channel the console uses to take the
 * cloud away from the scroll.
 */

/**
 * Particle budget. Lives here rather than in ParticleCloud because anything
 * building a buffer for `takeover` has to produce exactly this many points — a
 * mismatched length would read past the end of the array during the blend.
 */
export const PARTICLE_COUNT = isMobile ? 10000 : 25000;

/** Swap in a real photo here. See public/portrait.svg for what it wants. */
export const PORTRAIT_SRC = '/portrait.svg';

/**
 * Console → cloud channel.
 *
 * A mutable module object for the same reason as `scroll.js`: the render loop
 * reads it directly every frame and React never learns it changed. A setState
 * here would re-render the page on every frame of the blend.
 *
 * `shape` is a full PARTICLE_COUNT * 3 buffer to pull the cloud toward. `want`
 * is where the hold is headed, `mix` is where it actually is — ParticleCloud
 * eases one toward the other so the cloud arrives and leaves under its own
 * weight instead of snapping.
 */
export const takeover = {
  shape: null,
  mix: 0,
  want: 0,
  /**
   * Optional per-frame driver, for a hold whose buffer changes over time rather
   * than standing still — the Life simulation rewrites `shape` in place through
   * this. Called once a frame, before the blend reads the buffer.
   */
  tick: null,
  /**
   * Optional orientation the scene should turn toward, as a THREE.Quaternion.
   *
   * A hold that has a *front* sets this and Rig eases the group onto it. Snake
   * needs it: on a sphere the interesting part is wherever the head is, and half
   * the board is always facing away. Nothing else sets it, and null means the
   * group returns to its resting orientation.
   */
  orient: null,
};

/**
 * R3F's `invalidate`, registered by ParticleCloud.
 *
 * Under reduced motion the scene runs an on-demand frameloop, so nothing is
 * rendering between scrolls. A command that changes the cloud has to ask for the
 * frame that shows it or it silently does nothing — the takeover would sit at
 * `want: 1` forever with no loop to ease it in.
 */
let requestFrame = null;

export function setFrameRequest(fn) {
  requestFrame = fn;
}

/**
 * Flag the document while the cloud is held, so CSS can pull the per-section
 * scrims out of the way. A held shape is centred rather than offset right, which
 * puts half of it behind the scrim that exists to keep body copy readable — and a
 * word with its first half washed out looks like a bug rather than a choice.
 *
 * Set here rather than in the console so a command added later can't forget it.
 */
function markHeld(held) {
  document.documentElement.toggleAttribute('data-cloud-held', held);
}

/**
 * Pull the cloud onto an arbitrary buffer, away from the scroll.
 *
 * `tick` is for a hold that animates: pass a per-frame driver that rewrites the
 * buffer, as `createLife` does. Omit it for a static shape.
 */
export function seize(shape, tick = null) {
  takeover.shape = shape;
  takeover.tick = tick;
  // Cleared rather than carried: a new hold inherits no facing, and a driver
  // that wants one sets it on its first tick.
  takeover.orient = null;
  takeover.want = 1;
  markHeld(true);
  requestFrame?.();
}

/** Hand it back to the scroll. */
export function release() {
  takeover.want = 0;
  // Stop driving immediately rather than on the frame the blend finishes — a
  // simulation left running through the hand-back keeps burning CPU behind a
  // cloud that is no longer showing it.
  takeover.tick = null;
  takeover.orient = null;
  markHeld(false);
  requestFrame?.();
}
