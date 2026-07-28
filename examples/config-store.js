const MAX_SCOPE_ID_LENGTH = 128;

function normalizeScopeId(scopeId) {
  const normalized = String(scopeId ?? '').trim();
  if (!normalized || normalized.length > MAX_SCOPE_ID_LENGTH) {
    throw new Error('O identificador do escopo é obrigatório e deve ter até 128 caracteres.');
  }
  return normalized;
}

class ConfigStore {
  constructor(defaultValue = {}) {
    this.defaultValue = structuredClone(defaultValue);
    this.values = new Map();
  }

  get(scopeId) {
    const key = normalizeScopeId(scopeId);
    if (!this.values.has(key)) {
      this.values.set(key, structuredClone(this.defaultValue));
    }

    return structuredClone(this.values.get(key));
  }

  update(scopeId, patch) {
    if (!patch || Array.isArray(patch) || typeof patch !== 'object') {
      throw new Error('A atualização deve ser um objeto.');
    }

    const key = normalizeScopeId(scopeId);
    const current = this.get(key);
    const next = { ...current, ...structuredClone(patch) };
    this.values.set(key, next);
    return structuredClone(next);
  }

  remove(scopeId) {
    return this.values.delete(normalizeScopeId(scopeId));
  }
}

module.exports = { ConfigStore, normalizeScopeId };
