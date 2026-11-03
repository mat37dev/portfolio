import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../../src/app/intro/rng.js';
import { bendFor, settleOffset, preClickPause, dragSpeed, approachEase, IDLE } from '../../src/app/intro/motion.js';

test('courbure 2–7 % plafonnée à 600 px', () => {
  const rng = createRng(1);
  for (let i = 0; i < 500; i++) {
    const b = Math.abs(bendFor(1000, rng));
    assert.ok(b >= 12 && b <= 42, b);
  }
});

test('micro-correction 2–3 px', () => {
  const rng = createRng(2);
  for (let i = 0; i < 200; i++) {
    const { dx, dy } = settleOffset(rng);
    const n = Math.hypot(dx, dy);
    assert.ok(n >= 2 && n <= 3, n);
  }
});

test('pause avant clic et vitesse de drag', () => {
  const rng = createRng(3);
  for (let i = 0; i < 200; i++) {
    const p = preClickPause(rng);
    assert.ok(p >= 0.08 && p <= 0.15);
    const s = dragSpeed(rng);
    assert.ok(s >= 0.55 && s <= 0.7);
  }
});

test('easing : arrivée freinée', () => {
  assert.equal(approachEase(0), 0);
  assert.equal(approachEase(1), 1);
  assert.ok(approachEase(1) - approachEase(0.95) < 0.02);
  assert.ok(approachEase(0.5) > 0.5);
});

test('orbite réduite', () => {
  assert.equal(IDLE.radius, 36);
  assert.equal(IDLE.tangent, 80);
});
