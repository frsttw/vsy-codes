class IntegrationGateway {
  constructor({ textClient, musicClient, logger = console }) {
    this.textClient = textClient;
    this.musicClient = musicClient;
    this.logger = logger;
  }

  async processText(input) {
    if (!input?.trim()) throw new Error('O texto é obrigatório.');
    return this.textClient.complete({ content: input.trim() });
  }

  async searchTrack(query) {
    if (!query?.trim()) throw new Error('A busca é obrigatória.');
    const tracks = await this.musicClient.search(query.trim());
    return tracks.map(({ title, author, duration }) => ({ title, author, duration }));
  }
}

module.exports = { IntegrationGateway };
