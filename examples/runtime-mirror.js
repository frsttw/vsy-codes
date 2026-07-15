function assertDocumentKey(documentKey) {
  if (!/^[a-z0-9][a-z0-9._-]*\.json$/i.test(documentKey)) {
    throw new Error('Nome de documento inválido.');
  }
}

class RuntimeMirror {
  constructor(storage) {
    if (!storage?.ensureDirectory || !storage?.writeFile) {
      throw new Error('O armazenamento precisa expor ensureDirectory e writeFile.');
    }

    this.storage = storage;
  }

  async save(documentKey, data) {
    assertDocumentKey(documentKey);
    await this.storage.ensureDirectory();
    await this.storage.writeFile(documentKey, JSON.stringify(data, null, 2));
  }

  hydrate({ documents, objectKeys = [], arrayKeys = [] }) {
    const result = {};

    for (const key of objectKeys) {
      const value = documents[key];
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`Documento inválido: ${key}`);
      }
      result[key] = structuredClone(value);
    }

    for (const key of arrayKeys) {
      if (!Array.isArray(documents[key])) {
        throw new Error(`Documento inválido: ${key}`);
      }
      result[key] = structuredClone(documents[key]);
    }

    return result;
  }
}

module.exports = { RuntimeMirror, assertDocumentKey };
