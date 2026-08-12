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

test('preserva registros incluídos durante a publicação', async () => {
  const buffer = new UpdateLogBuffer();
  buffer.append({ title: 'Catálogo', description: 'Nova categoria disponível.' });

  await buffer.flush(async () => {
    buffer.append({ title: 'Ranking', description: 'Critério de desempate revisado.' });
  });

  const [entry] = buffer.snapshot();

  assert.deepEqual({
    title: entry.title,
    description: entry.description,
  }, {
    title: 'Ranking',
    description: 'Critério de desempate revisado.',
  });
  assert.ok(Number.isFinite(Date.parse(entry.createdAt)));
});

test('normaliza a data e recusa registros com data inválida', () => {
  const buffer = new UpdateLogBuffer();

  buffer.append({
    title: 'Catálogo',
    description: 'Nova categoria disponível.',
    createdAt: '2026-01-01T10:00:00-03:00',
  });

  assert.equal(buffer.snapshot()[0].createdAt, '2026-01-01T13:00:00.000Z');
  assert.throws(
    () => buffer.append({ title: 'Catálogo', description: 'Nova categoria disponível.', createdAt: 'inválida' }),
    /data do registro/
  );
});
