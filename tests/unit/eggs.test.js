import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../../src/app/intro/rng.js';
import { EGGS, pickEggs, pickCopineVariant } from '../../src/app/intro/eggs.js';

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

test('copine : deux versions, a ou b, à peu près une chance sur deux', () => {
  const rng = createRng(5);
  const n = { a: 0, b: 0 };
  for (let i = 0; i < 10000; i++) n[pickCopineVariant(rng)]++;
  assert.equal(n.a + n.b, 10000);
  assert.ok(Math.abs(n.a / 10000 - 0.5) < 0.02, `a ${n.a / 10000}`);
});

test('copine : version forcée par copine-a ou copine-b (tests)', () => {
  assert.equal(pickCopineVariant(createRng(1), 'copine-a'), 'a');
  assert.equal(pickCopineVariant(createRng(1), 'theme,copine-b'), 'b');
  assert.ok(['a', 'b'].includes(pickCopineVariant(createRng(1), 'copine')));
});

test('copine-a et copine-b forcent l’easter egg copine', () => {
  assert.deepEqual(pickEggs(createRng(1), 'copine-a'), ['copine']);
  assert.deepEqual(pickEggs(createRng(1), 'copine-b,theme'), ['copine', 'theme']);
});
