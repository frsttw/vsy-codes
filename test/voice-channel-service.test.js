const test = require('node:test');
const assert = require('node:assert/strict');
const { VoiceChannelService } = require('../examples/voice-channel-service');

test('remove canal temporário quando ele fica vazio', () => {
  const voice = new VoiceChannelService();
  const channel = voice.create('owner', { userLimit: 2 });
  voice.join(channel.id, 'member');
  voice.leave(channel.id, 'member');
  assert.equal(voice.leave(channel.id, 'owner').deleted, true);
});
