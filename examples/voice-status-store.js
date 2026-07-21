const MAX_STATUS_LENGTH = 500;

function normalizeStatus(value) {
  const status = String(value ?? '').trim();
  if (!status || status.length > MAX_STATUS_LENGTH) return null;
  return status;
}

class VoiceStatusStore {
  constructor() {
    this.statuses = new Map();
  }

  set(scope, channel, status) {
    if (!scope?.trim() || !channel?.trim()) {
      throw new Error('O escopo e o canal são obrigatórios.');
    }

    const normalized = normalizeStatus(status);
    if (!normalized) throw new Error('O status precisa ter entre 1 e 500 caracteres.');

    const key = `${scope.trim()}:${channel.trim()}`;
    this.statuses.set(key, { scope: scope.trim(), channel: channel.trim(), status: normalized });
    return this.get(scope, channel);
  }

  get(scope, channel) {
    const entry = this.statuses.get(`${scope}:${channel}`);
    return entry ? { ...entry } : null;
  }

  remove(scope, channel) {
    return this.statuses.delete(`${scope}:${channel}`);
  }

  list() {
    return [...this.statuses.values()].map(entry => ({ ...entry }));
  }
}

module.exports = { MAX_STATUS_LENGTH, VoiceStatusStore, normalizeStatus };
