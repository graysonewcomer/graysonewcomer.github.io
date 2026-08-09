import { useEffect, useRef } from 'react';
import { scroll, prefersReducedMotion } from '../lib/scroll';
import { SECTIONS } from '../content';

/**
 * A rail down the left gutter with a node per section. The rail fills with
 * light as you scroll, the node for the section you're in goes white, and a
 * trace branches from it toward the copy.
 *
 * Nodes sit at the scroll fraction where their section is centred, measured
 * from the real layout rather than spaced evenly — the sections aren't equal
 * heights, and evenly spaced nodes drift out of step with the page.
 *
 * Where a node *sits* and when it goes *live* are two different numbers. The
 * last section's midpoint is past the end of the scrollable range, so it clamps
 * to 1 and would only light up in the final 2% of the page. Activation instead
 * fires once a section's top has risen through the upper third of the viewport,
 * which is reachable for every section including the last.
 *
 * This is DOM, not canvas, so it can't use useFrame and runs its own rAF. It
 * only writes styles on refs, never React state; a per-frame setState here
 * would re-render the whole page.
 */
export function SignalSpine() {
  const lit = useRef(null);
  const nodes = useRef([]);
  const acts = useRef([]);

  useEffect(() => {
    const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

    const measure = () => {
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;

      SECTIONS.forEach(({ id }, i) => {
        const el = document.getElementById(id);
        const n = nodes.current[i];
        if (!el || !n || max <= 0) return;
        const place = clamp01((el.offsetTop + el.offsetHeight / 2 - vh / 2) / max);
        acts.current[i] = clamp01((el.offsetTop - vh * 0.35) / max);
        n.style.top = `${place * 100}%`;
      });
    };

    measure();
    window.addEventListener('resize', measure);

    // Under reduced motion the scene runs on demand, so `current` never
    // advances — read the raw target instead of freezing at the top of the page.
    const reduced = prefersReducedMotion();
    let raf = 0;

    const tick = () => {
      const p = reduced ? scroll.target : scroll.current;
      if (lit.current) lit.current.style.transform = `scaleY(${p})`;

      let active = 0;
      for (let i = 0; i < acts.current.length; i++) {
        if (p >= acts.current[i]) active = i;
      }
      nodes.current.forEach((n, i) => {
        if (!n) return;
        const state = i === active ? 'live' : p >= acts.current[i] ? 'on' : 'off';
        if (n.dataset.state !== state) n.dataset.state = state;
      });

      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div className="spine" aria-hidden="true">
      <span className="spine-rail" />
      <span className="spine-lit" ref={lit} />
      {SECTIONS.map((s, i) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="spine-node"
          data-state="off"
          // Duplicates navigation the page already has, and the container is
          // aria-hidden, so keep it out of the tab order rather than offering
          // focus to something screen readers can't see.
          tabIndex={-1}
          ref={(el) => {
            nodes.current[i] = el;
          }}
        >
          <span className="spine-trace" />
          <span className="spine-label">{s.label}</span>
        </a>
      ))}
    </div>
  );
}
