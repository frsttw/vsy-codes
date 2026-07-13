const test = require('node:test');
const assert = require('node:assert/strict');
const { CrashGame, getCrashDuration, parseBet } = require('../examples/crash-game');

test('calcula a duração e valida apostas do crash', () => {
  assert.equal(getCrashDuration(1), 0);
  assert.ok(getCrashDuration(2) > 0);
  assert.equal(parseBet('250'), 250);
  assert.equal(parseBet('2.5'), null);
});

test('impede saque depois do ponto de explosão', () => {
  const game = new CrashGame({ bet: 100, crashPoint: 2, startedAt: 1_000 });
  assert.throws(() => game.cashout(game.crashAt), /explodiu/);
  assert.equal(game.status, 'crashed');
});

test('calcula o saque antes da explosão', () => {
  const game = new CrashGame({ bet: 100, crashPoint: 5, startedAt: 1_000 });
  const result = game.cashout(1_000 + getCrashDuration(2));
  assert.equal(result.payout, 200);
  assert.equal(game.status, 'cashed-out');
});
