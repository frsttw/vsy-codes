const { randomBytes } = require('node:crypto');

function normalizeUserId(userId) {
  const value = String(userId ?? '').trim();
  if (!value) throw new Error('O usuário é obrigatório.');
  return value;
}

class VerificationService {
  constructor({ challengeFactory = () => randomBytes(4).toString('hex').toUpperCase() } = {}) {
    if (typeof challengeFactory !== 'function') throw new Error('A fábrica de desafios é obrigatória.');
    this.pending = new Map();
    this.verified = new Set();
    this.challengeFactory = challengeFactory;
  }

  begin(userId, now = Date.now()) {
    const id = normalizeUserId(userId);
    if (this.verified.has(id)) return { status: 'already-verified' };

    const challenge = String(this.challengeFactory()).trim().toUpperCase();
    if (!challenge) throw new Error('O desafio gerado é inválido.');
    this.pending.set(id, { challenge, createdAt: now });
    return { status: 'pending', challenge };
  }

  confirm(userId, answer, now = Date.now(), expiresInMs = 300_000) {
    const id = normalizeUserId(userId);
    if (!Number.isFinite(expiresInMs) || expiresInMs <= 0) {
      throw new Error('O prazo de confirmação deve ser positivo.');
    }

    const pending = this.pending.get(id);
    if (!pending || now - pending.createdAt > expiresInMs) {
      this.pending.delete(id);
      return { verified: false, reason: 'expired' };
    }

    if (pending.challenge !== String(answer ?? '').trim().toUpperCase()) {
      return { verified: false, reason: 'invalid-challenge' };
    }

    this.pending.delete(id);
    this.verified.add(id);
    return { verified: true };
  }
}

module.exports = { VerificationService, normalizeUserId };
