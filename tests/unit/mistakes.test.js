import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../../src/app/intro/rng.js';
import { MISTAKES, pickMistakes } from '../../src/app/intro/mistakes.js';
import { LINES, line } from '../../src/app/intro/dialogue.js';

test('deux erreurs distinctes et valides', () => {
  const rng = createRng(5);
  for (let i = 0; i < 200; i++) {
    const m = pickMistakes(rng);
    assert.equal(m.length, 2);
    assert.notEqual(m[0], m[1]);
    m.forEach((x) => assert.ok(MISTAKES.includes(x)));
  }
});

test('forçage filtré', () => assert.deepEqual(pickMistakes(createRng(1), ['caps', 'inconnu']), ['caps']));

test('pools de répliques : 3 variantes minimum, sans ski', () => {
  for (const [k, v] of Object.entries(LINES)) {
    assert.ok(v.length >= 3, k);
    v.forEach((s) => assert.ok(!/ski|piste|neige|remont/i.test(s), s));
  }
  assert.ok(LINES.open.includes(line(createRng(1), 'open')));
});
