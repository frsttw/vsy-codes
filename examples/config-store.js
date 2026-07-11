class ConfigStore {
  constructor(defaultValue = {}) {
    this.defaultValue = structuredClone(defaultValue);
    this.values = new Map();
  }

  get(scopeId) {
    if (!this.values.has(scopeId)) {
      this.values.set(scopeId, structuredClone(this.defaultValue));
    }

    return structuredClone(this.values.get(scopeId));
  }

  update(scopeId, patch) {
    if (!patch || Array.isArray(patch) || typeof patch !== 'object') {
      throw new Error('A atualização deve ser um objeto.');
    }

    const current = this.get(scopeId);
    const next = { ...current, ...structuredClone(patch) };
    this.values.set(scopeId, next);
    return structuredClone(next);
  }

  remove(scopeId) {
    return this.values.delete(scopeId);
  }
}

module.exports = { ConfigStore };
