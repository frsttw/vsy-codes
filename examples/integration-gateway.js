class IntegrationGateway {
  constructor({ aiClient, musicClient, logger = console }) {
    this.aiClient = aiClient;
    this.musicClient = musicClient;
    this.logger = logger;
  }

  async answerQuestion(question) {
    if (!question?.trim()) throw new Error('A pergunta é obrigatória.');
    return this.aiClient.complete({ prompt: question.trim() });
  }

  async searchTrack(query) {
    if (!query?.trim()) throw new Error('A busca é obrigatória.');
    const tracks = await this.musicClient.search(query.trim());
    return tracks.map(({ title, author, duration }) => ({ title, author, duration }));
  }
}

module.exports = { IntegrationGateway };
