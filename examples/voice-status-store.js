const MAX_STATUS_LENGTH = 500;
const MAX_KEY_LENGTH = 128;

function normalizeStatus(value) {
  const status = String(value ?? '').trim();
  if (!status || status.length > MAX_STATUS_LENGTH) return null;
  return status;
}

function createStatusKey(scope, channel) {
  const normalizedScope = String(scope ?? '').trim();
  const normalizedChannel = String(channel ?? '').trim();
  if (
    !normalizedScope
    || !normalizedChannel
    || normalizedScope.length > MAX_KEY_LENGTH
    || normalizedChannel.length > MAX_KEY_LENGTH
  ) return null;

  return `${normalizedScope.length}:${normalizedScope}${normalizedChannel.length}:${normalizedChannel}`;
}

class VoiceStatusStore {
  constructor() {
    this.statuses = new Map();
  }

  set(scope, channel, status) {
    const normalizedScope = String(scope ?? '').trim();
    const normalizedChannel = String(channel ?? '').trim();
    const key = createStatusKey(normalizedScope, normalizedChannel);
    if (!key) {
      throw new Error('O escopo e o canal são obrigatórios.');
    }

    const normalized = normalizeStatus(status);
    if (!normalized) throw new Error('O status precisa ter entre 1 e 500 caracteres.');

    this.statuses.set(key, { scope: normalizedScope, channel: normalizedChannel, status: normalized });
    return this.get(scope, channel);
  }

  get(scope, channel) {
    const key = createStatusKey(scope, channel);
    if (!key) return null;

    const entry = this.statuses.get(key);
    return entry ? { ...entry } : null;
  }

  remove(scope, channel) {
    const key = createStatusKey(scope, channel);
    return key ? this.statuses.delete(key) : false;
  }

  list() {
    return [...this.statuses.values()].map(entry => ({ ...entry }));
  }
}

module.exports = {
  MAX_KEY_LENGTH,
  MAX_STATUS_LENGTH,
  VoiceStatusStore,
  createStatusKey,
  normalizeStatus
};
