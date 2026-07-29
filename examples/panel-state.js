class PanelState {
  constructor(items = []) {
    if (!Array.isArray(items)) throw new Error('Os itens do painel devem ser uma lista.');
    this.items = structuredClone(items);
  }

  page(page = 1, perPage = 8) {
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(perPage) || perPage < 1) {
      throw new Error('Página e tamanho devem ser inteiros positivos.');
    }

    const totalPages = Math.max(1, Math.ceil(this.items.length / perPage));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * perPage;

    return {
      currentPage,
      totalPages,
      items: structuredClone(this.items.slice(start, start + perPage)),
      hasPrevious: currentPage > 1,
      hasNext: currentPage < totalPages,
    };
  }
}

module.exports = { PanelState };
