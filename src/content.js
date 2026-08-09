/**
 * All copy lives here — nothing user-facing is hardcoded in a component.
 *
 * Everything in this file is verified against the résumé. The old site it was
 * ported from contained generated filler, so it is not a source for anything
 * factual; check new claims against the PDF in public/.
 */

export const HERO = {
  name: 'Grayson Newcomer',
  role: 'Software Engineer',
  at: 'Amazon',
};

export const ABOUT = {
  lead: 'I build backend services that have to stay up, and interfaces that have to feel good. Currently SDE I at Amazon.',
  body: [
    'I came to software through the problem-solving side of it in college, and stayed for the part where you get to build the thing you just imagined. Most of my day job is full-stack work on cloud infrastructure — Java and AWS on one side, React on the other.',
    'Away from the keyboard: lifting, guitar, and an ongoing campaign to cook something that does not taste like chicken and rice.',
  ],
};

export const STACK = [
  { group: 'Languages', items: ['JavaScript', 'TypeScript', 'Java', 'Python'] },
  { group: 'Frontend', items: ['React', 'three.js', 'HTML / CSS'] },
  { group: 'Backend', items: ['Node.js', 'REST APIs', 'PostgreSQL', 'MongoDB'] },
  { group: 'Infra', items: ['AWS', 'Docker', 'Microservices', 'Git'] },
];

export const WORK = [
  {
    when: 'Aug 2024 — Present',
    what: 'Software Development Engineer I',
    where: 'Amazon',
    note: 'Building and maintaining cloud services. Java, AWS, microservices, and the operational discipline that comes with running things at scale.',
    tags: ['Java', 'AWS', 'React', 'Microservices'],
  },
  {
    when: 'May 2023 — Aug 2023',
    what: 'Software Development Engineer Intern',
    where: 'Amazon — Direct Fulfillment, Inventory',
    note: 'Designed and shipped an ASIN deletion feature spanning DynamoDB and Elasticsearch — React/TypeScript UI plus the backend workflows behind it — resolving data consistency issues that were affecting vendor operations.',
    tags: ['React', 'TypeScript', 'DynamoDB', 'Elasticsearch'],
  },
];

export const PROJECTS = [
  {
    name: 'SyntaxWordle',
    note: 'Wordle, but for programming languages. You get a code snippet; you name the language. Harder than it sounds once the syntax starts rhyming.',
    tags: ['React', 'Game logic'],
  },
  {
    name: 'This site',
    note: '25,000 GPU-drawn particles that reassemble into a different shape for each section. No shader code — the morph is plain JS running once a frame.',
    tags: ['three.js', 'React Three Fiber'],
  },
];

export const CONTACT = {
  email: 'grayson.newcomer@gmail.com',
  links: [
    { label: 'GitHub', href: 'https://github.com/graysonewcomer' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/grayson-newcomer' },
    { label: 'Résumé', href: '/Grayson_Newcomer_Resume2026.pdf' },
  ],
};
