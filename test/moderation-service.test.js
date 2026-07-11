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
