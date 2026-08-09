const MAX_KEY_LENGTH = 128;

function normalizeKey(value, label) {
  const key = String(value ?? '').trim();
  if (!key || key.length > MAX_KEY_LENGTH) {
    throw new Error(`${label} é obrigatório e deve ter até ${MAX_KEY_LENGTH} caracteres.`);
  }
  return key;
}

function createRotationKey(collection, scopeId) {
  return `${collection.length}:${collection}${scopeId.length}:${scopeId}`;
}

class MediaLibrary {
  constructor() {
    this.itemsByCollection = new Map();
    this.lastItemByScope = new Map();
  }

  add(collection, item) {
    const normalizedCollection = normalizeKey(collection, 'A coleção');
    const id = normalizeKey(item?.id, 'O id do item');
    const url = String(item?.url ?? '').trim();
    if (!url) throw new Error('A URL do item é obrigatória.');

    const items = this.itemsByCollection.get(normalizedCollection) ?? [];
    if (items.some((current) => current.id === id)) {
      throw new Error('Já existe um item com este id na coleção.');
    }

    items.push({ id, url, label: item.label?.trim() || null });
    this.itemsByCollection.set(normalizedCollection, items);
  }

  next(collection, scopeId) {
    const normalizedCollection = normalizeKey(collection, 'A coleção');
    const normalizedScope = normalizeKey(scopeId, 'O escopo');
    const items = this.itemsByCollection.get(normalizedCollection) ?? [];
    if (!items.length) throw new Error('A coleção não possui itens.');

    const key = createRotationKey(normalizedCollection, normalizedScope);
    const previousId = this.lastItemByScope.get(key);
    const candidates = items.length === 1 ? items : items.filter((item) => item.id !== previousId);
    const item = candidates[Math.floor(Math.random() * candidates.length)];
    this.lastItemByScope.set(key, item.id);
    return { ...item };
  }

  sanitizeFileName(fileName) {
    const sanitized = fileName
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();

    return sanitized === '.' || sanitized === '..' || !sanitized ? 'arquivo' : sanitized;
  }
}

module.exports = { MediaLibrary, createRotationKey, normalizeKey };
