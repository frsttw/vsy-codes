const test = require('node:test');
const assert = require('node:assert/strict');
const {
  extractCandidates,
  isSupportedImage,
  normalizePrefix,
  planEmojiImport
} = require('../examples/emoji-import-planner');

test('reconhece apenas imagens suportadas e remove fontes duplicadas', () => {
  const messages = [{
    content: '<:rose:source-a> <:rose:source-a> <a:spin:source-b>',
    attachments: [
      { id: 'file-a', name: 'Black Rose.png', contentType: 'image/png' },
      { id: 'file-b', name: 'notes.txt', contentType: 'text/plain' }
    ]
  }];

  assert.equal(isSupportedImage(messages[0].attachments[0]), true);
  assert.equal(isSupportedImage(messages[0].attachments[1]), false);
  assert.deepEqual(extractCandidates(messages).map(item => item.suggestedName), ['rose', 'spin', 'Black Rose']);
});

test('gera nomes organizados sem colisões', () => {
  assert.equal(normalizePrefix(' Black Emojis! '), 'black_emojis');
  assert.equal(normalizePrefix('x'), null);

  const plan = planEmojiImport({
    messages: [{
      content: '<:rose:source-a>',
      attachments: [{ id: 'file-a', name: 'Black Rose.png', contentType: 'image/png' }]
    }],
    existingNames: ['black_1'],
    prefix: 'Black'
  });

  assert.deepEqual(plan.map(item => item.name), ['black_2', 'black_3']);
});
