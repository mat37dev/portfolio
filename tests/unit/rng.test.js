import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng, weighted } from '../../src/app/intro/rng.js';

test('même seed, même suite', () => {
  const a = createRng(42);
  const b = createRng(42);
  for (let i = 0; i < 5; i++) assert.equal(a(), b());
});

test('weighted respecte les poids', () => {
  const rng = createRng(7);
  const n = { a: 0, b: 0 };
  for (let i = 0; i < 20000; i++) n[weighted(rng, [{ id: 'a', weight: 0.3 }, { id: 'b', weight: 0.7 }])]++;
  assert.ok(Math.abs(n.a / 20000 - 0.3) < 0.015);
});
