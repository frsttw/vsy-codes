const test = require('node:test');
const assert = require('node:assert/strict');
const { PanelState } = require('../examples/panel-state');

test('calcula páginas e limita o acesso à última página', () => {
  const panel = new PanelState(['a', 'b', 'c']);

  assert.deepEqual(panel.page(1, 2), {
    currentPage: 1,
    totalPages: 2,
    items: ['a', 'b'],
    hasPrevious: false,
    hasNext: true
  });
  assert.deepEqual(panel.page(9, 2).items, ['c']);
});

test('isola os itens recebidos e devolvidos pelo painel', () => {
  const source = [{ name: 'Original' }];
  const panel = new PanelState(source);
  source[0].name = 'Alterado fora';

  const page = panel.page();
  page.items[0].name = 'Alterado na página';
  assert.equal(panel.page().items[0].name, 'Original');
  assert.throws(() => new PanelState({}), /lista/);
});
