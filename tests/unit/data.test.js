import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROJECTS, FILTERS, featuredProject, otherProjects } from '../../src/app/data/projects.js';
import { EXPERIENCES, EDUCATION } from '../../src/app/data/experience.js';
import { SKILL_GROUPS } from '../../src/app/data/skills.js';
import { PROFILE } from '../../src/app/data/profile.js';

test('sept projets, un seul phare, SkiMate', () => {
  assert.equal(PROJECTS.length, 7);
  assert.equal(featuredProject().title, 'SkiMate');
  assert.equal(otherProjects().length, 6);
});

test('les liens projets sont ceux du site', () => {
  const by = (t) => PROJECTS.find((p) => p.title === t);
  assert.equal(by('Resilience Alpha').href, 'https://github.com/mat37dev/resilience-alpha');
  assert.equal(by('Find And Build').href, 'https://iphinis.itch.io/find-build');
  assert.equal(by('Site de covoiturage').href, undefined);
  assert.deepEqual(FILTERS, ['Tous', 'Web', 'Mobile', 'Jeux vidéo', 'DevOps']);
  for (const p of PROJECTS) assert.ok(FILTERS.includes(p.category), p.title);
});

test('parcours : 4 expériences, 3 formations, sans le Bac', () => {
  assert.equal(EXPERIENCES.length, 4);
  assert.equal(EXPERIENCES[0].current, true);
  assert.equal(EDUCATION.length, 3);
  assert.ok(!EDUCATION.some((e) => /bac/i.test(e.title)));
});

test('compétences : 5 groupes, 6 outils du quotidien', () => {
  assert.equal(SKILL_GROUPS.length, 5);
  const daily = SKILL_GROUPS.flatMap((g) => g.skills).filter((s) => s.level === 'quotidien').map((s) => s.name);
  assert.deepEqual(daily.sort(), ['Apex', 'Flow', 'Git', 'Next.js', 'PHP', 'React']);
});

test('profil : copies et liens fixés', () => {
  assert.equal(PROFILE.badge, 'Freelance disponible · Nantes');
  assert.deepEqual(PROFILE.h1, ['Développeur fullstack,', 'de Salesforce au mobile.']);
  assert.equal(PROFILE.links.malt, 'https://www.malt.fr/profile/mathieucrosnier');
  assert.equal(PROFILE.cv, '/cv.pdf');
});
