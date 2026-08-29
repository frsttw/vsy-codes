function createBotStatus(activity = '/help') {
  const normalized = String(activity ?? '').trim();
  if (!normalized) throw new Error('A atividade do bot não pode ser vazia.');
  return { type: 'custom', activity: normalized };
}

module.exports = { createBotStatus };
