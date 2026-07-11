class VerificationService {
  constructor() {
    this.pending = new Map();
    this.verified = new Set();
  }

  begin(userId, now = Date.now()) {
    if (!userId) throw new Error('O usuário é obrigatório.');
    if (this.verified.has(userId)) return { status: 'already-verified' };

    const challenge = Math.random().toString(36).slice(2, 8).toUpperCase();
    this.pending.set(userId, { challenge, createdAt: now });
    return { status: 'pending', challenge };
  }

  confirm(userId, answer, now = Date.now(), expiresInMs = 300_000) {
    const pending = this.pending.get(userId);
    if (!pending || now - pending.createdAt > expiresInMs) {
      this.pending.delete(userId);
      return { verified: false, reason: 'expired' };
    }

    if (pending.challenge !== answer?.trim().toUpperCase()) {
      return { verified: false, reason: 'invalid-challenge' };
    }

    this.pending.delete(userId);
    this.verified.add(userId);
    return { verified: true };
  }
}

module.exports = { VerificationService };
