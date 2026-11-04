import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readParams } from '../../src/app/intro/params.js';

test('scope=hero lu, autre valeur ignorée', () => {
  assert.equal(readParams('?scope=hero').scope, 'hero');
  assert.equal(readParams('?scope=tout').scope, null);
  assert.equal(readParams('').scope, null);
});
