const test = require('node:test');
const assert = require('node:assert/strict');
const { createBotStatus } = require('../examples/bot-status');

test('cria status público com atividade normalizada', () => {
  assert.deepEqual(createBotStatus('  /help  '), { type: 'custom', activity: '/help' });
});

test('rejeita atividade vazia ou longa demais', () => {
  assert.throws(() => createBotStatus('   '), /entre 1 e 128/i);
  assert.throws(() => createBotStatus('x'.repeat(129)), /entre 1 e 128/i);
});
