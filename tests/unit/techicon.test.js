import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iconFor } from '../../src/app/components/icons/techIconData.js';

test('iconFor résout les slugs utilisés et Salesforce', () => {
  const slugs = ['react', 'nextdotjs', 'javascript', 'tailwindcss', 'html5', 'bootstrap', 'php', 'symfony', 'nodedotjs', 'python', 'openjdk', 'dotnet', 'expo', 'postgresql', 'mysql', 'mongodb', 'git', 'docker', 'ansible', 'grafana', 'salesforce'];
  for (const s of slugs) {
    const i = iconFor(s);
    assert.ok(i && i.path.length > 20 && /^[0-9A-F]{6}$/i.test(i.hex), s);
  }
  assert.equal(iconFor('inconnu'), null);
});
