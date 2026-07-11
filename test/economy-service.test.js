const test = require('node:test');
const assert = require('node:assert/strict');
const { EconomyService } = require('../examples/economy-service');

test('movimenta saldo e impede transferências acima do disponível', () => {
  const economy = new EconomyService();
  economy.credit('ana', 500);

  economy.deposit('ana', 200);
  assert.deepEqual(economy.snapshot('ana').wallet, 300);
  assert.deepEqual(economy.snapshot('ana').bank, 200);

  economy.transfer('ana', 'bia', 100);
  assert.equal(economy.snapshot('bia').wallet, 100);
  assert.throws(() => economy.transfer('ana', 'bia', 500), /Saldo insuficiente/);
});

test('entrega a recompensa diária uma vez por período', () => {
  const economy = new EconomyService({ dailyReward: 50, dailyCooldownMs: 1_000 });

  assert.equal(economy.claimDaily('ana', 10_000).claimed, true);
  assert.equal(economy.claimDaily('ana', 10_500).claimed, false);
  assert.equal(economy.snapshot('ana').wallet, 50);
});
