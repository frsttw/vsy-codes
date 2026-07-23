const test = require('node:test');
const assert = require('node:assert/strict');
const { VoiceStatusStore, normalizeStatus } = require('../examples/voice-status-store');

test('valida e normaliza o texto do status', () => {
  assert.equal(normalizeStatus('  Música ao vivo  '), 'Música ao vivo');
  assert.equal(normalizeStatus(' '), null);
  assert.equal(normalizeStatus('x'.repeat(501)), null);
});

test('mantém chaves distintas quando identificadores contêm separadores', () => {
  const store = new VoiceStatusStore();
  store.set('community:main', 'room', 'Principal');
  store.set('community', 'main:room', 'Alternativo');

  assert.equal(store.get('community:main', 'room').status, 'Principal');
  assert.equal(store.get('community', 'main:room').status, 'Alternativo');
  assert.equal(store.list().length, 2);
});

test('mantém status separados por escopo e canal', () => {
  const store = new VoiceStatusStore();
  store.set('community-a', 'room-1', 'Online');
  store.set('community-b', 'room-1', 'Ao vivo');

  assert.equal(store.get('community-a', 'room-1').status, 'Online');
  assert.equal(store.list().length, 2);
  assert.equal(store.remove('community-a', 'room-1'), true);
  assert.equal(store.get('community-a', 'room-1'), null);
});

test('normaliza identificadores em todas as operações', () => {
  const store = new VoiceStatusStore();
  store.set('  community-a  ', '  room-1  ', 'Online');

  assert.equal(store.get('community-a', 'room-1').status, 'Online');
  assert.equal(store.remove(' community-a ', ' room-1 '), true);
  assert.equal(store.get('community-a', 'room-1'), null);
  assert.equal(store.remove(' ', 'room-1'), false);
});
