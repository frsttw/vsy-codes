const test = require('node:test');
const assert = require('node:assert/strict');
const { IntegrationGateway } = require('../examples/integration-gateway');

test('valida os adaptadores obrigatórios', () => {
  assert.throws(() => new IntegrationGateway({}), /cliente de texto/);
  assert.throws(() => new IntegrationGateway({ textClient: { complete() {} } }), /cliente de música/);
});

test('normaliza entradas e retorna apenas campos públicos das faixas', async () => {
  const calls = [];
  const gateway = new IntegrationGateway({
    textClient: { complete: async payload => payload.content },
    musicClient: {
      search: async query => {
        calls.push(query);
        return [{ title: 'Track', author: 'Artist', duration: 180, internalUrl: 'hidden' }];
      }
    }
  });

  assert.equal(await gateway.processText('  Olá  '), 'Olá');
  assert.deepEqual(await gateway.searchTrack('  ambient  '), [{ title: 'Track', author: 'Artist', duration: 180 }]);
  assert.deepEqual(calls, ['ambient']);
  await assert.rejects(() => gateway.searchTrack(''), /busca/);
});
