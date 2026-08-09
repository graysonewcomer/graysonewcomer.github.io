/**
 * Re-exports the copy in src/content/*.json under the names the components use.
 *
 * The JSON files are the things you edit — one per section, editable straight
 * from github.com, and a push to main rebuilds and deploys on its own. This file
 * exists only so components keep importing a name rather than a file path.
 *
 * JSON is strict: no trailing commas, double quotes only. A malformed file fails
 * the build, which means the deploy stops and the live site keeps serving the
 * last good version rather than going blank.
 *
 * Everything here is verified against the résumé in public/. The old site this
 * was ported from contained generated filler, so it is not a source for
 * anything factual.
 */
import hero from './content/hero.json';
import about from './content/about.json';
import stack from './content/stack.json';
import work from './content/work.json';
import projects from './content/projects.json';
import contact from './content/contact.json';

export const HERO = hero;
export const ABOUT = about;
export const STACK = stack;
export const WORK = work;
export const PROJECTS = projects;
export const CONTACT = contact;
