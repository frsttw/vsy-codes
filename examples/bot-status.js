function createBotStatus(activity = '/help') {
  const normalized = String(activity ?? '').trim();
  if (!normalized || normalized.length > 128) {
    throw new Error('A atividade do bot deve ter entre 1 e 128 caracteres.');
  }
  return { type: 'custom', activity: normalized };
}

module.exports = { createBotStatus };
