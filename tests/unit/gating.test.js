import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldAutoplay } from '../../src/app/intro/gating.js';

const ok = { reducedMotion: false, width: 1280, webdriver: false, search: '', sessionSeen: false };

test('autoplay par défaut', () => assert.equal(shouldAutoplay(ok), true));

test('chaque garde-fou coupe', () => {
  assert.equal(shouldAutoplay({ ...ok, reducedMotion: true }), false);
  assert.equal(shouldAutoplay({ ...ok, width: 859 }), false);
  assert.equal(shouldAutoplay({ ...ok, webdriver: true }), false);
  assert.equal(shouldAutoplay({ ...ok, search: '?intro=0' }), false);
  assert.equal(shouldAutoplay({ ...ok, sessionSeen: true }), false);
  assert.equal(shouldAutoplay({ ...ok, webdriver: true, search: '?intro=fast' }), true, 'fast force même sous webdriver');
  assert.equal(shouldAutoplay({ ...ok, width: 859, search: '?intro=fast' }), false, 'fast ne force jamais sous 860 px');
  assert.equal(shouldAutoplay({ ...ok, reducedMotion: true, search: '?intro=debug' }), false, 'ni avec le mouvement réduit');
});
