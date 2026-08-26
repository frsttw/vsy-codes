const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CLEAR_SELECTION,
  GROUP_MODE,
  createRoleGroup,
  planRoleSelection,
} = require('../examples/role-selection-service');

const roles = [
  { id: 'adult', name: 'Adulto' },
  { id: 'minor', name: 'Menor de idade' },
];

test('cria grupos normalizados sem cargos duplicados', () => {
  const group = createRoleGroup({
    id: ' age ',
    name: ' Faixa   etária ',
    mode: GROUP_MODE.EXCLUSIVE,
    roles: [...roles, roles[0]],
  });

  assert.equal(group.id, 'age');
  assert.equal(group.name, 'Faixa etária');
  assert.deepEqual(group.roles, roles);
});

test('grupo exclusivo troca apenas cargos do próprio grupo', () => {
  const group = createRoleGroup({ id: 'age', name: 'Faixa etária', mode: GROUP_MODE.EXCLUSIVE, roles });

  assert.deepEqual(planRoleSelection(['minor', 'subscriber'], group, ['adult']), {
    add: ['adult'],
    remove: ['minor'],
    alreadyOwned: [],
  });
});

test('grupo exclusivo preserva o cargo selecionado e remove conflitos', () => {
  const group = createRoleGroup({ id: 'age', name: 'Faixa etária', mode: GROUP_MODE.EXCLUSIVE, roles });

  assert.deepEqual(planRoleSelection(['adult'], group, ['adult']), {
    add: [],
    remove: [],
    alreadyOwned: ['adult'],
  });
  assert.deepEqual(planRoleSelection(['adult', 'minor'], group, ['adult']), {
    add: [],
    remove: ['minor'],
    alreadyOwned: ['adult'],
  });
});

test('grupo múltiplo alterna escolhas e permite limpar o grupo', () => {
  const group = createRoleGroup({ id: 'topics', name: 'Interesses', mode: GROUP_MODE.MULTIPLE, roles });

  assert.deepEqual(planRoleSelection(['adult'], group, ['adult', 'minor']), {
    add: ['minor'],
    remove: ['adult'],
    alreadyOwned: [],
  });
  assert.deepEqual(planRoleSelection(['adult', 'minor'], group, [CLEAR_SELECTION]), {
    add: [],
    remove: ['adult', 'minor'],
    alreadyOwned: [],
  });
});

test('rejeita grupos incompletos ou com modo desconhecido', () => {
  assert.throws(
    () => createRoleGroup({ id: 'age', name: 'A', mode: GROUP_MODE.EXCLUSIVE, roles }),
    /grupo precisa/i,
  );
  assert.throws(
    () => createRoleGroup({ id: 'age', name: 'Faixa etária', mode: 'other', roles }),
    /modo do grupo/i,
  );
});

test('rejeita dados malformados ao planejar uma seleção', () => {
  const group = createRoleGroup({ id: 'age', name: 'Faixa etária', mode: GROUP_MODE.EXCLUSIVE, roles });

  assert.throws(
    () => planRoleSelection([], { ...group, mode: 'other' }, []),
    /grupo informado/i,
  );
  assert.throws(() => planRoleSelection('adult', group, ['adult']), /precisam ser listas/i);
  assert.throws(() => planRoleSelection([], group, 'adult'), /precisam ser listas/i);
});

test('normaliza identificadores ao planejar alterações', () => {
  const numericRoles = [
    { id: 10, name: 'Fotografia' },
    { id: 20, name: 'Música' },
  ];
  const group = createRoleGroup({ id: 'topics', name: 'Interesses', mode: GROUP_MODE.MULTIPLE, roles: numericRoles });

  assert.deepEqual(planRoleSelection([10], group, [' 10 ', 20, 20]), {
    add: ['20'],
    remove: ['10'],
    alreadyOwned: [],
  });
});
