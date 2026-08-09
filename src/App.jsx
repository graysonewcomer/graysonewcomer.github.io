import { Scene } from './scene/Scene';
import { SignalSpine } from './ui/SignalSpine';
import { SECTIONS, HERO, ABOUT, STACK, WORK, PROJECTS, CONTACT } from './content';

/**
 * Content column sits left; the cloud is offset right (see Rig.jsx) so the two
 * never fight for the same pixels. The hero is the exception — there the cloud
 * spells the name and the DOM stays out of its way.
 */
export default function App() {
  return (
    <>
      <Scene />
      <SignalSpine />

      <main>
        <section id="intro" className="intro">
          <div className="col">
            {/*
              Hidden, not absent: the particles already spell the name on screen,
              but the page still needs a real <h1> for screen readers and search.
            */}
            <h1 className="sr-only">{HERO.name}</h1>
            <span className="label">{SECTIONS[0].label}</span>
            <p className="role" aria-hidden="true">
              {HERO.role}
              <span className="dim"> · {HERO.at}</span>
            </p>
          </div>
          <div className="scroll-hint" aria-hidden="true">scroll ↓</div>
        </section>

        <section id="about">
          <div className="col">
            <span className="label">{SECTIONS[1].label}</span>
            <h2>About</h2>
            <p className="lead">{ABOUT.lead}</p>
            {ABOUT.body.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </section>

        <section id="stack">
          <div className="col">
            <span className="label">{SECTIONS[2].label}</span>
            <h2>Stack</h2>
            <dl className="stack">
              {STACK.map(({ group, items }) => (
                <div className="stack-row" key={group}>
                  <dt>{group}</dt>
                  <dd>
                    {items.map((i) => (
                      <span className="chip" key={i}>{i}</span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="work">
          <div className="col">
            <span className="label">{SECTIONS[3].label}</span>
            <h2>Work</h2>
            {WORK.map((job) => (
              <article className="entry" key={job.what + job.where}>
                <span className="when">{job.when}</span>
                <h3>{job.what}</h3>
                <p className="where">{job.where}</p>
                <p>{job.note}</p>
                <p className="tags">{job.tags.join(' · ')}</p>
              </article>
            ))}

            <h3 className="subhead">Projects</h3>
            {PROJECTS.map((p) => (
              <article className="entry" key={p.name}>
                <h3>{p.name}</h3>
                <p>{p.note}</p>
                <p className="tags">{p.tags.join(' · ')}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact">
          <div className="col">
            <span className="label">{SECTIONS[4].label}</span>
            <h2>Contact</h2>
            <p className="lead">
              Always up for hearing about new projects — or just to say hi.
            </p>
            <p>
              <a className="mail" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </p>
            <nav className="links">
              {CONTACT.links.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        </section>
      </main>
    </>
  );
}
