const test = require('node:test');
const assert = require('node:assert/strict');
const { VerificationService } = require('../examples/verification-service');

test('confirma desafios sem depender de diferenças de caixa ou espaços', () => {
  const verification = new VerificationService({ challengeFactory: () => 'a1b2c3' });
  assert.deepEqual(verification.begin(' member-a ', 100), { status: 'pending', challenge: 'A1B2C3' });
  assert.deepEqual(verification.confirm('member-a', ' a1b2c3 ', 200), { verified: true });
  assert.deepEqual(verification.begin('member-a', 300), { status: 'already-verified' });
});

test('expira desafios e valida o prazo configurado', () => {
  const verification = new VerificationService({ challengeFactory: () => 'CODE' });
  verification.begin('member-a', 100);

  assert.deepEqual(verification.confirm('member-a', 'CODE', 201, 100), {
    verified: false,
    reason: 'expired'
  });
  assert.throws(() => verification.confirm('member-b', 'CODE', 200, 0), /prazo/);
});
