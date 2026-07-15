const test = require('node:test');
const assert = require('node:assert/strict');
const { UpdateLogBuffer } = require('../examples/update-log-buffer');

test('mantém o buffer até uma publicação bem-sucedida', async () => {
  const buffer = new UpdateLogBuffer();
  buffer.append({ title: 'Loja', description: 'Fluxo de compra atualizado.' });

  await assert.rejects(buffer.flush(async () => { throw new Error('Indisponível'); }));
  assert.equal(buffer.snapshot().length, 1);

  const result = await buffer.flush(async (entries) => assert.equal(entries.length, 1));
  assert.deepEqual(result, { published: true, count: 1 });
  assert.equal(buffer.snapshot().length, 0);
});
