const test = require('node:test');
const assert = require('node:assert/strict');
const { createBotStatus } = require('../examples/bot-status');

test('cria status público com atividade normalizada', () => {
  assert.deepEqual(createBotStatus('  /help  '), { type: 'custom', activity: '/help' });
});

test('rejeita atividade vazia', () => {
  assert.throws(() => createBotStatus('   '), /não pode ser vazia/i);
});
