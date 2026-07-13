const test = require('node:test');
const assert = require('node:assert/strict');
const { createEconomyRepository } = require('../examples/economy-repository');

test('serializa gravações e importa somente uma base vazia', async () => {
  const calls = [];
  const client = {
    query: async (...args) => { calls.push(args); },
    transaction: async (operation) => operation({
      query: async (name, values) => {
        calls.push([name, values]);
        return name === 'count-economy-accounts' ? { count: 0 } : undefined;
      },
    }),
  };
  const repository = createEconomyRepository(client);

  await repository.saveAccount('ana', { username: 'Ana', wallet: 10, bank: 20 });
  const result = await repository.importIfEmpty([['bia', { username: 'Bia', wallet: 5, bank: 0 }]]);

  assert.equal(result.imported, true);
  assert.equal(calls.filter(([name]) => name === 'upsert-economy-account').length, 2);
});
