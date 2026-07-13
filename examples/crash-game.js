const GROWTH_TIME_MS = 9_000;

function getCrashDuration(crashPoint) {
  const point = Number(crashPoint);
  if (!Number.isFinite(point) || point < 1) throw new Error('Ponto de explosão inválido.');
  return Math.max(0, Math.log(point) * GROWTH_TIME_MS);
}

function getMultiplierAt({ startedAt, timestamp, crashPoint }) {
  const elapsed = Math.max(0, Number(timestamp) - Number(startedAt));
  const multiplier = Math.exp(elapsed / GROWTH_TIME_MS);
  return Math.max(1, Math.min(Number(crashPoint), multiplier));
}

function parseBet(value) {
  const normalized = String(value ?? '').trim();
  if (!/^\d+$/.test(normalized)) return null;

  const amount = Number(normalized);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

class CrashGame {
  constructor({ bet, crashPoint, startedAt = Date.now() }) {
    if (!Number.isInteger(bet) || bet <= 0) throw new Error('Aposta inválida.');
    if (!Number.isFinite(crashPoint) || crashPoint < 1) throw new Error('Ponto de explosão inválido.');

    this.bet = bet;
    this.crashPoint = crashPoint;
    this.startedAt = startedAt;
    this.crashAt = startedAt + getCrashDuration(crashPoint);
    this.status = 'running';
    this.cashoutResult = null;
  }

  getSnapshot(timestamp = Date.now()) {
    const crashed = timestamp >= this.crashAt;
    const multiplier = getMultiplierAt({ startedAt: this.startedAt, timestamp, crashPoint: this.crashPoint });

    return {
      status: crashed && this.status === 'running' ? 'crashed' : this.status,
      multiplier,
      crashAt: this.crashAt,
      canCashout: this.status === 'running' && !crashed,
    };
  }

  cashout(timestamp = Date.now()) {
    if (this.status !== 'running') throw new Error('A rodada já foi encerrada.');
    if (timestamp >= this.crashAt) {
      this.status = 'crashed';
      throw new Error('A rodada explodiu antes do saque.');
    }

    const multiplier = getMultiplierAt({ startedAt: this.startedAt, timestamp, crashPoint: this.crashPoint });
    const payout = Math.floor(this.bet * multiplier);

    this.status = 'cashed-out';
    this.cashoutResult = { timestamp, multiplier, payout };
    return { ...this.cashoutResult };
  }
}

module.exports = { CrashGame, getCrashDuration, getMultiplierAt, parseBet };
