const test = require('node:test');
const assert = require('node:assert/strict');
const { ModerationService } = require('../examples/moderation-service');

test('identifica termo bloqueado e excesso de ações', () => {
  const moderation = new ModerationService({ blockedTerms: ['spam'], maxActionsPerWindow: 2 });
  assert.equal(moderation.inspectMessage('Sem spam aqui').allowed, false);
  moderation.registerSensitiveAction('user', 1);
  moderation.registerSensitiveAction('user', 2);
  assert.equal(moderation.registerSensitiveAction('user', 3).allowed, false);
});

test('ignora termos vazios e normaliza a lista de bloqueio', () => {
  const moderation = new ModerationService({ blockedTerms: ['', '  SPAM  ', 'spam', null] });

  assert.deepEqual(moderation.blockedTerms, ['spam']);
  assert.equal(moderation.inspectMessage('Mensagem normal').allowed, true);
  assert.equal(moderation.inspectMessage('Contém spam').allowed, false);
});
