class MediaLibrary {
  constructor() {
    this.itemsByCollection = new Map();
    this.lastItemByScope = new Map();
  }

  add(collection, item) {
    if (!collection?.trim() || !item?.id || !item?.url) {
      throw new Error('Coleção, id e URL do item são obrigatórios.');
    }

    const items = this.itemsByCollection.get(collection) ?? [];
    if (items.some((current) => current.id === item.id)) {
      throw new Error('Já existe um item com este id na coleção.');
    }

    items.push({ id: item.id, url: item.url, label: item.label ?? null });
    this.itemsByCollection.set(collection, items);
  }

  next(collection, scopeId) {
    const items = this.itemsByCollection.get(collection) ?? [];
    if (!items.length) throw new Error('A coleção não possui itens.');

    const key = `${collection}:${scopeId}`;
    const previousId = this.lastItemByScope.get(key);
    const candidates = items.length === 1 ? items : items.filter((item) => item.id !== previousId);
    const item = candidates[Math.floor(Math.random() * candidates.length)];
    this.lastItemByScope.set(key, item.id);
    return { ...item };
  }

  sanitizeFileName(fileName) {
    return fileName
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }
}

module.exports = { MediaLibrary };
