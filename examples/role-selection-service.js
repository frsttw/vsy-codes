const GROUP_MODE = Object.freeze({
  EXCLUSIVE: 'exclusive',
  MULTIPLE: 'multiple',
});

const CLEAR_SELECTION = '__clear__';
const MAX_ROLES_PER_GROUP = 24;

function normalizeIds(values) {
  return values.map((value) => String(value ?? '').trim()).filter(Boolean);
}

function createRoleGroup({ id, name, mode, roles }) {
  const normalizedId = String(id ?? '').trim();
  const normalizedName = String(name ?? '').trim().replace(/\s+/g, ' ');

  if (!normalizedId || normalizedName.length < 2 || normalizedName.length > 50) {
    throw new Error('O grupo precisa de identificador e nome entre 2 e 50 caracteres.');
  }
  if (!Object.values(GROUP_MODE).includes(mode)) {
    throw new Error('O modo do grupo é inválido.');
  }

  const uniqueRoles = new Map();
  for (const role of roles ?? []) {
    const roleId = String(role?.id ?? '').trim();
    const roleName = String(role?.name ?? '').trim();
    if (roleId && roleName) uniqueRoles.set(roleId, { id: roleId, name: roleName });
  }

  if (uniqueRoles.size < 2 || uniqueRoles.size > MAX_ROLES_PER_GROUP) {
    throw new Error(`O grupo precisa ter entre 2 e ${MAX_ROLES_PER_GROUP} cargos válidos.`);
  }

  return { id: normalizedId, name: normalizedName, mode, roles: [...uniqueRoles.values()] };
}

function planRoleSelection(currentRoleIds, group, selectedValues) {
  if (!group || !Object.values(GROUP_MODE).includes(group.mode) || !Array.isArray(group.roles)) {
    throw new Error('O grupo informado é inválido.');
  }
  if (!Array.isArray(currentRoleIds) || !Array.isArray(selectedValues)) {
    throw new Error('Os cargos atuais e selecionados precisam ser listas.');
  }

  const current = new Set(normalizeIds(currentRoleIds));
  const groupRoleIds = [...new Set(normalizeIds(group.roles.map((role) => role?.id)))];
  const normalizedSelection = normalizeIds(selectedValues);
  const selected = [...new Set(normalizedSelection)].filter((value) => groupRoleIds.includes(value));

  if (group.mode === GROUP_MODE.EXCLUSIVE) {
    const roleId = selected[0];
    if (!roleId) return { add: [], remove: [], alreadyOwned: [] };

    const conflictingRoleIds = groupRoleIds.filter((id) => id !== roleId && current.has(id));
    if (current.has(roleId)) {
      return { add: [], remove: conflictingRoleIds, alreadyOwned: [roleId] };
    }

    return {
      add: [roleId],
      remove: conflictingRoleIds,
      alreadyOwned: [],
    };
  }

  if (normalizedSelection.includes(CLEAR_SELECTION)) {
    return { add: [], remove: groupRoleIds.filter((id) => current.has(id)), alreadyOwned: [] };
  }

  return {
    add: selected.filter((id) => !current.has(id)),
    remove: selected.filter((id) => current.has(id)),
    alreadyOwned: [],
  };
}

module.exports = {
  CLEAR_SELECTION,
  GROUP_MODE,
  MAX_ROLES_PER_GROUP,
  createRoleGroup,
  planRoleSelection,
};
