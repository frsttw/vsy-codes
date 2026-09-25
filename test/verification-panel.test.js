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
  assert.throws(
    () => buildVerificationMessage({}, 'data:image/png;base64,AAAA'),
    /caminho local/i,
  );
});

test('aceita caminho absoluto do Windows', () => {
  assert.equal(buildVerificationMessage({}, 'C:\\assets\\banner.png').attachments[0].path, 'C:\\assets\\banner.png');
});

test('rejeita caracteres de controle no caminho', () => {
  assert.throws(
    () => buildVerificationMessage({}, 'assets/banner\u0000.png'),
    /caracteres inválidos/i,
  );
});

test('aceita somente arquivo PNG como banner', () => {
  assert.equal(buildVerificationMessage({}, 'assets/BANNER.PNG').attachments[0].path, 'assets/BANNER.PNG');
  assert.throws(() => buildVerificationMessage({}, 'assets/banner.jpg'), /arquivo PNG/i);
});

test('rejeita travessia de diretórios no caminho', () => {
  assert.throws(
    () => buildVerificationMessage({}, 'assets/../private/banner.png'),
    /diretório permitido/i,
  );
});

test('rejeita curingas no caminho do banner', () => {
  assert.throws(
    () => buildVerificationMessage({}, 'assets/*.png'),
    /usar curingas/i,
  );
});

test('rejeita caracteres reservados no nome do banner', () => {
  assert.throws(
    () => buildVerificationMessage({}, 'assets/banner|extra.png'),
    /caracteres inválidos/i,
  );
  assert.throws(
    () => buildVerificationMessage({}, 'C:\\assets\\banner<extra>.png'),
    /caracteres inválidos/i,
  );
});

test('rejeita segmento terminado com ponto ou espaço', () => {
  assert.throws(
    () => buildVerificationMessage({}, 'assets/pasta./banner.png'),
    /terminar com ponto ou espaço/i,
  );
  assert.throws(
    () => buildVerificationMessage({}, 'assets/pasta /banner.png'),
    /terminar com ponto ou espaço/i,
  );
});

test('rejeita dois-pontos em caminho relativo', () => {
  assert.throws(
    () => buildVerificationMessage({}, 'assets/banner:extra.png'),
    /caracteres inválidos/i,
  );
});

test('rejeita caminho relativo de unidade do Windows', () => {
  assert.throws(
    () => buildVerificationMessage({}, 'C:banner.png'),
    /caminho local/i,
  );
});

test('rejeita caminho de rede para o banner', () => {
  assert.throws(
    () => buildVerificationMessage({}, '\\\\servidor\\compartilhamento\\banner.png'),
    /caminho de rede/i,
  );
});

test('rejeita caminho de rede com barras normais', () => {
  assert.throws(
    () => buildVerificationMessage({}, '/servidor/banner.png'),
    /caminho de rede/i,
  );
});

test('rejeita caminho de banner acima do limite', () => {
  assert.throws(
    () => buildVerificationMessage({}, `${'a'.repeat(257)}.png`),
    /até 260 caracteres/i,
  );
});
