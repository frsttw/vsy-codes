const test = require('node:test');
const assert = require('node:assert/strict');
const { RuntimeMirror } = require('../examples/runtime-mirror');

test('espelha documentos JSON e valida a hidratação', async () => {
  const writes = [];
  const mirror = new RuntimeMirror({
    ensureDirectory: async () => {},
    writeFile: async (key, content) => writes.push({ key, content }),
  });

  await mirror.save('shop-config.json', { enabled: true });
  const state = mirror.hydrate({
    documents: { 'shop-config.json': { enabled: true }, 'updates.json': [] },
    objectKeys: ['shop-config.json'],
    arrayKeys: ['updates.json'],
  });

  assert.equal(writes[0].key, 'shop-config.json');
  assert.equal(state['shop-config.json'].enabled, true);
  assert.deepEqual(state['updates.json'], []);
});
