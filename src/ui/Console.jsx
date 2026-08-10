import { useCallback, useEffect, useRef, useState } from 'react';
import { PARTICLE_COUNT, PORTRAIT_SRC, seize, release } from '../lib/cloud';
import {
  textPoints,
  imagePoints,
  smileyPoints,
  spherePoints,
  stackPoints,
  geodesicPoints,
  shellPoints,
} from '../scene/shapes';
import { createLife } from '../scene/life';
import { SECTIONS, HERO, ABOUT, STACK, CONTACT } from '../content';

/**
 * A console, opened with backtick.
 *
 * It exists because the scroll page is a fixed composition — five sections, five
 * shapes — and anything playable needs somewhere to live that isn't wedged into
 * that. One door, and every future toy is a command rather than a new layout
 * problem.
 *
 * React state throughout, unlike the rest of the scene: this re-renders per
 * keystroke, not per frame. Commands reach the cloud through `lib/cloud.js`,
 * which is the part that must not go through React.
 */

/**
 * Longest string worth spelling. textPoints normalises the ink to a fixed world
 * width, so every extra character makes every glyph thinner — and a stroke thinner
 * than the bloom radius stops reading as a letter. The hero gets 7 characters
 * across that width; 10 is about where they stop being legible.
 */
const MAX_SPELL = 10;

/** Named shapes for `morph`. Some are async; callers await either way. */
const SHAPES = {
  name: () => textPoints('GRAYSON', PARTICLE_COUNT),
  smiley: () => smileyPoints(PARTICLE_COUNT),
  // The image sampler has no other caller now that the about section is the
  // smiley. Kept reachable from here rather than deleted, so pointing
  // PORTRAIT_SRC at a real photo is still a one-line experiment.
  portrait: () => imagePoints(PORTRAIT_SRC, PARTICLE_COUNT),
  sphere: () => spherePoints(PARTICLE_COUNT),
  stack: () => stackPoints(PARTICLE_COUNT),
  geodesic: () => geodesicPoints(PARTICLE_COUNT),
  shell: () => shellPoints(PARTICLE_COUNT),
};

const HELP = [
  ['help', 'this'],
  ['whoami', 'the short version'],
  ['ls', 'sections on this page'],
  ['open <section>', 'scroll to one'],
  ['stack', 'what I work in'],
  ['contact', 'how to reach me'],
  ['resume', 'open the PDF'],
  ['spell <text>', 'the cloud spells it'],
  ['morph <shape>', `one of: ${Object.keys(SHAPES).join(', ')}`],
  ['life [shape]', "Conway's Life, in 3D, in the cloud"],
  ['release', 'give the cloud back to the scroll'],
  ['clear', 'wipe the log'],
];

export function Console() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [log, setLog] = useState([
    { kind: 'out', text: "type `help`. `esc` closes. nothing here is load-bearing." },
  ]);

  const inputRef = useRef(null);
  const logRef = useRef(null);
  const openerRef = useRef(null);
  // Shell-style recall on the up/down arrows.
  const historyRef = useRef([]);
  const cursorRef = useRef(-1);
  const nextId = useRef(1);

  const say = useCallback((entries) => {
    setLog((prev) => [
      ...prev,
      ...entries.map((e) => ({ ...e, id: nextId.current++ })),
    ]);
  }, []);

  const run = useCallback(
    async (raw) => {
      const line = raw.trim();
      if (!line) return;

      historyRef.current.push(line);
      cursorRef.current = -1;
      say([{ kind: 'in', text: line }]);

      const [cmd, ...rest] = line.split(/\s+/);
      const arg = rest.join(' ');

      switch (cmd.toLowerCase()) {
        case 'help':
          say(HELP.map(([c, d]) => ({ kind: 'out', text: `${c.padEnd(16)} ${d}` })));
          break;

        case 'whoami':
          say([
            { kind: 'out', text: `${HERO.name} — ${HERO.role} at ${HERO.at}.` },
            { kind: 'out', text: ABOUT.lead },
          ]);
          break;

        case 'ls':
          say(SECTIONS.map((s) => ({ kind: 'out', text: `${s.label}   (open ${s.id})` })));
          break;

        case 'open': {
          const target = document.getElementById(arg.toLowerCase());
          if (!target) {
            say([{ kind: 'err', text: `no section "${arg}". try \`ls\`.` }]);
            break;
          }
          target.scrollIntoView({ behavior: 'smooth' });
          say([{ kind: 'out', text: `→ ${arg}` }]);
          break;
        }

        case 'stack':
          say(STACK.map((g) => ({ kind: 'out', text: `${g.group.padEnd(12)} ${g.items.join(' · ')}` })));
          break;

        case 'contact':
          say([
            { kind: 'out', text: CONTACT.email },
            ...CONTACT.links.map((l) => ({ kind: 'out', text: `${l.label.padEnd(12)} ${l.href}` })),
          ]);
          break;

        case 'resume':
          window.open('/Grayson_Newcomer_Resume2026.pdf', '_blank', 'noopener');
          say([{ kind: 'out', text: 'opened in a new tab.' }]);
          break;

        case 'spell': {
          if (!arg) {
            say([{ kind: 'err', text: 'spell what? e.g. `spell hello`' }]);
            break;
          }
          const text = arg.slice(0, MAX_SPELL).toUpperCase();
          seize(textPoints(text, PARTICLE_COUNT));
          say([
            { kind: 'out', text: `spelling "${text}". \`release\` gives the cloud back.` },
            ...(arg.length > MAX_SPELL
              ? [{ kind: 'err', text: `trimmed to ${MAX_SPELL} — longer than that and the glyphs vanish.` }]
              : []),
          ]);
          break;
        }

        case 'morph': {
          const make = SHAPES[arg.toLowerCase()];
          if (!make) {
            say([{ kind: 'err', text: `no shape "${arg}". one of: ${Object.keys(SHAPES).join(', ')}` }]);
            break;
          }
          try {
            // Some generators are async (the portrait loads an image); awaiting a
            // plain array is harmless, so both go through the same path.
            seize(await make());
            say([{ kind: 'out', text: `morphing to ${arg}. \`release\` gives the cloud back.` }]);
          } catch (err) {
            say([{ kind: 'err', text: `could not build ${arg}: ${err.message}` }]);
          }
          break;
        }

        case 'life': {
          // Seeded from a shape if asked, otherwise a random ball. Either way the
          // rule takes over within a few generations — it barely remembers what it
          // started from, which is the fun of it.
          let seedPoints = null;
          if (arg) {
            const make = SHAPES[arg.toLowerCase()];
            if (!make) {
              say([{ kind: 'err', text: `no shape "${arg}" to seed from. one of: ${Object.keys(SHAPES).join(', ')}` }]);
              break;
            }
            try {
              seedPoints = await make();
            } catch (err) {
              say([{ kind: 'err', text: `could not build ${arg}: ${err.message}` }]);
              break;
            }
          }

          const sim = createLife({
            count: PARTICLE_COUNT,
            seedPoints,
            onEnd: (gen) => say([{ kind: 'err', text: `the population died out at generation ${gen}.` }]),
          });

          if (sim.seeded === 0) {
            say([{ kind: 'err', text: 'nothing to seed from — that shape voxelised to nothing.' }]);
            break;
          }

          seize(sim.held, sim.tick);
          say([
            { kind: 'out', text: `${sim.seeded} cells alive${arg ? `, seeded from ${arg}` : ''}. survive 4-12, born 10-13.` },
            { kind: 'out', text: '`release` gives the cloud back.' },
          ]);
          break;
        }

        case 'release':
          release();
          say([{ kind: 'out', text: 'the scroll has it back.' }]);
          break;

        case 'clear':
          setLog([]);
          break;

        default:
          say([{ kind: 'err', text: `${cmd}: not a command. try \`help\`.` }]);
      }
    },
    [say]
  );

  // Backtick toggles. Tilde too — it's the same physical key, and expecting
  // people to notice whether shift is down is a bad bet.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Focus follows the panel, and goes back where it came from on close, or
  // keyboard users get dropped at the top of the document.
  //
  // Reclaiming focus is gated on the open→closed *transition*, not on "has this
  // effect run before". This also fires on mount with the panel shut, and
  // StrictMode runs mount effects twice — so a first-run flag is already spent by
  // the second pass, and the page loads with the console button focused, dropping
  // keyboard visitors two thirds down the tab order before they've done anything.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (wasOpen.current) openerRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  // Pin the log to the newest line.
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log, open]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      run(value);
      setValue('');
      return;
    }
    // Walk back through history; ArrowDown walks toward the empty prompt.
    const h = historyRef.current;
    if (e.key === 'ArrowUp' && h.length) {
      e.preventDefault();
      cursorRef.current = cursorRef.current < 0 ? h.length - 1 : Math.max(0, cursorRef.current - 1);
      setValue(h[cursorRef.current]);
    } else if (e.key === 'ArrowDown' && cursorRef.current >= 0) {
      e.preventDefault();
      cursorRef.current += 1;
      if (cursorRef.current >= h.length) {
        cursorRef.current = -1;
        setValue('');
      } else {
        setValue(h[cursorRef.current]);
      }
    }
  };

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        className="console-open"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">❯_</span>
        <span className="sr-only">Open console</span>
      </button>

      {open && (
        <div className="console" role="dialog" aria-label="Console">
          <div className="console-log" ref={logRef} aria-live="polite">
            {log.map((e) => (
              <div key={e.id ?? 'seed'} className={`console-line is-${e.kind}`}>
                {e.kind === 'in' && <span className="console-caret">❯ </span>}
                {e.text}
              </div>
            ))}
          </div>

          <div className="console-prompt">
            <span className="console-caret" aria-hidden="true">❯</span>
            <input
              ref={inputRef}
              className="console-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Command"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </div>
      )}
    </>
  );
}
