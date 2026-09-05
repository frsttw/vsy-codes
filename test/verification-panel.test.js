const test = require('node:test');
const assert = require('node:assert/strict');
const { buildVerificationMessage } = require('../examples/verification-panel');

test('anexa um único banner local ao painel', () => {
  const message = buildVerificationMessage({ description: 'Escolha seu cargo.' }, 'assets/verify-banner.png');
  assert.equal(message.attachments.length, 1);
  assert.deepEqual(message.attachments[0], { path: 'assets/verify-banner.png', name: 'verify-banner.png' });
});

test('usa descrição padrão quando o painel está vazio', () => {
  assert.equal(buildVerificationMessage({}, 'banner.png').embeds[0].description, 'Escolha uma opção.');
});

test('rejeita caminho de banner vazio', () => {
  assert.throws(() => buildVerificationMessage({}, '  '), /caminho do banner/i);
});

test('normaliza espaços no caminho do banner', () => {
  assert.equal(buildVerificationMessage({}, '  assets/banner.png  ').attachments[0].path, 'assets/banner.png');
});

test('rejeita painel que não seja objeto', () => {
  assert.throws(() => buildVerificationMessage([], 'banner.png'), /painel de verificação/i);
});

test('rejeita descrição acima do limite', () => {
  assert.throws(
    () => buildVerificationMessage({ description: 'x'.repeat(4_097) }, 'banner.png'),
    /4\.096 caracteres/i,
  );
});

test('rejeita endereço remoto como banner', () => {
  assert.throws(
    () => buildVerificationMessage({}, 'https://example.test/banner.png'),
    /caminho local/i,
  );
});
