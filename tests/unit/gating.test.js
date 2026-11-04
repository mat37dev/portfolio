import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldAutoplay, introLayout } from '../../src/app/intro/gating.js';

const ok = { reducedMotion: false, width: 1280, webdriver: false, search: '', sessionSeen: false };

test('autoplay par défaut', () => assert.equal(shouldAutoplay(ok), true));

test('chaque garde-fou coupe', () => {
  assert.equal(shouldAutoplay({ ...ok, reducedMotion: true }), false);
  assert.equal(shouldAutoplay({ ...ok, width: 390 }), true, 'mobile : mini-intro');
  assert.equal(shouldAutoplay({ ...ok, width: 300 }), false, 'écran trop étroit');
  assert.equal(shouldAutoplay({ ...ok, webdriver: true }), false);
  assert.equal(shouldAutoplay({ ...ok, search: '?intro=0' }), false);
  assert.equal(shouldAutoplay({ ...ok, sessionSeen: true }), false);
  assert.equal(shouldAutoplay({ ...ok, webdriver: true, search: '?intro=fast' }), true, 'fast force même sous webdriver');
  assert.equal(shouldAutoplay({ ...ok, reducedMotion: true, search: '?intro=debug' }), false, 'ni avec le mouvement réduit');
});

test('mise en page de l’intro selon la largeur', () => {
  assert.equal(introLayout(1280), 'desktop');
  assert.equal(introLayout(860), 'desktop');
  assert.equal(introLayout(859), 'mobile');
  assert.equal(introLayout(390), 'mobile');
});
