/**
 * The scroll signal.
 *
 * This is deliberately NOT React state. If scroll position lived in useState,
 * every frame of scrolling would re-render the component tree. Instead this is a
 * plain mutable object that the render loop reads directly — React never knows
 * it changed, and the 3D scene reads it 60+ times a second for free.
 *
 * `target`  = where the page actually is right now (0 at top, 1 at bottom)
 * `current` = a damped follower that lags slightly behind `target`
 *
 * Everything visual should read `current`, never `target`. The lag is what makes
 * motion feel weighted instead of glued to the scrollbar.
 */
export const scroll = {
  target: 0,
  current: 0,
  velocity: 0,
};

/** How fast `current` chases `target`. Higher = snappier, lower = floatier. */
const DAMPING = 6;

function measure() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scroll.target = max > 0 ? window.scrollY / max : 0;
}

/** Wire up listeners. Returns a cleanup function. */
export function initScroll() {
  window.addEventListener('scroll', measure, { passive: true });
  window.addEventListener('resize', measure);
  measure();
  // Jump the follower to the real position on load so a refresh mid-page
  // doesn't animate in from the top.
  scroll.current = scroll.target;

  return () => {
    window.removeEventListener('scroll', measure);
    window.removeEventListener('resize', measure);
  };
}

/**
 * Advance the damped follower. Call once per frame, before anything reads it.
 *
 * The `1 - exp(-k * dt)` form (instead of a flat `lerp(a, b, 0.1)`) makes the
 * damping frame-rate independent — it settles at the same speed on a 60Hz laptop
 * and a 144Hz monitor. A flat lerp moves twice as fast at double the frame rate.
 */
export function updateScroll(delta) {
  // A backgrounded tab can hand back a huge delta on return. Clamp it or the
  // follower teleports.
  const dt = Math.min(delta, 0.1);
  const prev = scroll.current;

  scroll.current += (scroll.target - scroll.current) * (1 - Math.exp(-DAMPING * dt));
  scroll.velocity = (scroll.current - prev) / Math.max(dt, 1e-4);

  return scroll.current;
}

/**
 * Split the global 0..1 into per-section progress.
 *
 * With 4 sections you get index 0..3 plus `local`, a 0..1 ramp within the
 * current section. Phase 2 uses exactly this to decide which two shapes the
 * particles are morphing between and how far along that morph is.
 */
export function sectionProgress(count) {
  const scaled = scroll.current * (count - 1);
  const index = Math.min(Math.floor(scaled), count - 2);
  return {
    index: Math.max(index, 0),
    local: count > 1 ? Math.min(Math.max(scaled - index, 0), 1) : 0,
  };
}

/** Does this visitor want us to sit still? */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
