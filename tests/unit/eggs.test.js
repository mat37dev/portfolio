import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../../src/app/intro/rng.js';
import { pickEgg } from '../../src/app/intro/eggs.js';

test('distribution des easter eggs', () => {
  const rng = createRng(9);
  const n = {};
  const N = 20000;
  for (let i = 0; i < N; i++) {
    const id = pickEgg(rng);
    n[id] = (n[id] || 0) + 1;
  }
  const exp = { copine: 0.2, prod: 0.1, console: 0.1, theme: 0.1, recruiter: 0.1, none: 0.4 };
  for (const [id, p] of Object.entries(exp)) assert.ok(Math.abs(n[id] / N - p) < 0.015, id);
});

test('forçage', () => assert.equal(pickEgg(createRng(1), 'copine'), 'copine'));
test('forçage inconnu : tirage normal', () => assert.ok(['copine', 'prod', 'console', 'theme', 'recruiter', 'none'].includes(pickEgg(createRng(1), 'bidule'))));
