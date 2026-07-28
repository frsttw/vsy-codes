const test = require('node:test');
const assert = require('node:assert/strict');
const { ConfigStore, normalizeScopeId } = require('../examples/config-store');

test('mantém cópias isoladas para cada escopo', () => {
  const store = new ConfigStore({ enabled: true, nested: { level: 1 } });
  const initial = store.get(' community-a ');
  initial.nested.level = 9;

  assert.equal(store.get('community-a').nested.level, 1);
  assert.deepEqual(store.update('community-a', { enabled: false }), {
    enabled: false,
    nested: { level: 1 }
  });
  assert.equal(store.get('community-b').enabled, true);
});

test('normaliza e valida identificadores de escopo', () => {
  const store = new ConfigStore();
  assert.equal(normalizeScopeId('  community-a  '), 'community-a');
  assert.throws(() => store.get(''), /identificador do escopo/);
  assert.throws(() => store.remove('x'.repeat(129)), /identificador do escopo/);
});
