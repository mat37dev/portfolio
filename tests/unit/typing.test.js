import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../../src/app/intro/rng.js';
import { charDelay, burstSize, typingPlan } from '../../src/app/intro/typing.js';

test('délais dans la fourchette', () => {
  const rng = createRng(1);
  for (let i = 0; i < 2000; i++) {
    const d = charDelay('a', rng);
    assert.ok(d >= 8 && d <= 160, d);
  }
});

test('rafales seulement au-delà de 80 caractères', () => {
  const rng = createRng(2);
  for (let i = 0; i < 100; i++) {
    assert.equal(burstSize(80, rng), 1);
    const b = burstSize(81, rng);
    assert.ok(b >= 2 && b <= 4);
  }
});

test('un paragraphe de 300 caractères se tape à 60–90 c/s', () => {
  const rng = createRng(3);
  const text = 'x'.repeat(300);
  const plan = typingPlan(text, rng);
  const total = plan.reduce((a, s) => a + s.delay, 0) / 1000;
  assert.equal(plan.at(-1).upTo, 300);
  const cps = 300 / total;
  assert.ok(cps >= 60 && cps <= 90, cps);
});

test('un titre court se tape caractère par caractère', () => {
  const plan = typingPlan('Projets', createRng(4));
  assert.equal(plan.length, 7);
});
