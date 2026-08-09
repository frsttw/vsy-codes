const test = require('node:test');
const assert = require('node:assert/strict');
const { MediaLibrary, createRotationKey } = require('../examples/media-library');

test('mantém rotações separadas quando as chaves possuem separadores', () => {
  const library = new MediaLibrary();
  library.add('collection:a', { id: 'one', url: 'https://example.test/one.png' });
  library.add('collection:a', { id: 'two', url: 'https://example.test/two.png' });
  library.add('collection', { id: 'one', url: 'https://example.test/three.png' });

  assert.notEqual(createRotationKey('collection:a', 'scope'), createRotationKey('collection', 'a:scope'));
  const first = library.next(' collection:a ', ' scope ');
  const second = library.next('collection:a', 'scope');
  assert.notEqual(first.id, second.id);
});

test('valida coleção, escopo e identificador de mídia', () => {
  const library = new MediaLibrary();
  assert.throws(() => library.add('', { id: 'one', url: 'https://example.test/one.png' }), /coleção/);
  assert.throws(() => library.add('gallery', { id: '', url: 'https://example.test/one.png' }), /id do item/);
  assert.throws(() => library.next('gallery', ''), /escopo/);
});

test('gera um nome seguro quando o título não possui caracteres aproveitáveis', () => {
  const library = new MediaLibrary();

  assert.equal(library.sanitizeFileName('***'), 'arquivo');
  assert.equal(library.sanitizeFileName('..'), 'arquivo');
  assert.equal(library.sanitizeFileName('Café pronto.png'), 'cafe-pronto.png');
});
