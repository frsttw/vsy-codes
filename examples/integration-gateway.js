class IntegrationGateway {
  constructor({ textClient, musicClient }) {
    if (typeof textClient?.complete !== 'function') {
      throw new Error('O cliente de texto precisa expor complete.');
    }
    if (typeof musicClient?.search !== 'function') {
      throw new Error('O cliente de música precisa expor search.');
    }

    this.textClient = textClient;
    this.musicClient = musicClient;
  }

  async processText(input) {
    const content = String(input ?? '').trim();
    if (!content) throw new Error('O texto é obrigatório.');
    return this.textClient.complete({ content });
  }

  async searchTrack(query) {
    const search = String(query ?? '').trim();
    if (!search) throw new Error('A busca é obrigatória.');

    const tracks = await this.musicClient.search(search);
    if (!Array.isArray(tracks)) throw new Error('A busca retornou um formato inválido.');
    return tracks.map(({ title, author, duration }) => ({ title, author, duration }));
  }
}

module.exports = { IntegrationGateway };
