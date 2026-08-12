class UpdateLogBuffer {
  constructor() {
    this.entries = [];
  }

  append({ title, description, createdAt = new Date().toISOString() }) {
    if (!title?.trim() || !description?.trim()) {
      throw new Error('Título e descrição são obrigatórios.');
    }

    const timestamp = new Date(createdAt);
    if (Number.isNaN(timestamp.getTime())) {
      throw new Error('A data do registro é inválida.');
    }

    this.entries.push({
      title: title.trim(),
      description: description.trim(),
      createdAt: timestamp.toISOString(),
    });
  }

  snapshot() {
    return this.entries.map((entry) => ({ ...entry }));
  }

  async flush(publish) {
    if (typeof publish !== 'function') throw new Error('A função de publicação é obrigatória.');
    if (!this.entries.length) return { published: false, count: 0 };

    const batch = this.snapshot();
    await publish(batch);
    this.entries.splice(0, batch.length);
    return { published: true, count: batch.length };
  }
}

module.exports = { UpdateLogBuffer };
