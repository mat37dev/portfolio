import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../../src/app/intro/rng.js';
import { EGGS, pickEggs } from '../../src/app/intro/eggs.js';

test('chaque easter egg a sa propre chance à chaque lancement', () => {
  const rng = createRng(9);
  const N = 20000;
  const n = {};
  let none = 0;
  for (let i = 0; i < N; i++) {
    const ids = pickEggs(rng);
    if (!ids.length) none++;
    for (const id of ids) n[id] = (n[id] || 0) + 1;
  }
  for (const { id, chance } of EGGS) assert.ok(Math.abs(n[id] / N - chance) < 0.015, `${id} ${n[id] / N}`);
  // La plupart des lancements montrent au moins un easter egg.
  assert.ok(none / N < 0.3, `aucun : ${none / N}`);
});

test('tirages indépendants : deux easter eggs peuvent tomber ensemble', () => {
  const rng = createRng(3);
  let both = 0;
  for (let i = 0; i < 5000; i++) if (pickEggs(rng).length >= 2) both++;
  assert.ok(both > 0);
});

test('forçage (tests) : un id, une liste, ou none', () => {
  assert.deepEqual(pickEggs(createRng(1), 'copine'), ['copine']);
  assert.deepEqual(pickEggs(createRng(1), 'copine,theme'), ['copine', 'theme']);
  assert.deepEqual(pickEggs(createRng(1), 'none'), []);
  assert.deepEqual(pickEggs(createRng(1), 'bidule'), []);
});
