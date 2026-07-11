class RankingService {
  constructor({ thresholds = [100, 300, 600, 1_000], cooldownMs = 60_000 } = {}) {
    this.thresholds = [...thresholds].sort((first, second) => first - second);
    this.cooldownMs = cooldownMs;
    this.entries = new Map();
  }

  awardExperience(userId, amount, now = Date.now()) {
    this.assertPositiveInteger(amount, 'A quantidade de XP');
    const entry = this.getEntry(userId);

    if (now - entry.lastAwardAt < this.cooldownMs) {
      return { awarded: false, retryAt: entry.lastAwardAt + this.cooldownMs };
    }

    const previousLevel = this.getLevel(entry.xp);
    entry.xp += amount;
    entry.lastAwardAt = now;

    return {
      awarded: true,
      xp: entry.xp,
      level: this.getLevel(entry.xp),
      leveledUp: this.getLevel(entry.xp) > previousLevel,
    };
  }

  getLeaderboard({ page = 1, perPage = 10 } = {}) {
    this.assertPositiveInteger(page, 'A página');
    this.assertPositiveInteger(perPage, 'O tamanho da página');

    const ranking = [...this.entries.entries()]
      .map(([userId, entry]) => ({ userId, xp: entry.xp, level: this.getLevel(entry.xp) }))
      .sort((first, second) => second.xp - first.xp || first.userId.localeCompare(second.userId));

    const start = (page - 1) * perPage;
    return {
      page,
      total: ranking.length,
      totalPages: Math.max(1, Math.ceil(ranking.length / perPage)),
      entries: ranking.slice(start, start + perPage).map((entry, index) => ({
        position: start + index + 1,
        ...entry,
      })),
    };
  }

  getPodium() {
    return this.getLeaderboard({ perPage: 3 }).entries;
  }

  getLevel(xp) {
    return this.thresholds.filter((threshold) => xp >= threshold).length;
  }

  getEntry(userId) {
    if (!this.entries.has(userId)) {
      this.entries.set(userId, { xp: 0, lastAwardAt: Number.NEGATIVE_INFINITY });
    }

    return this.entries.get(userId);
  }

  assertPositiveInteger(value, label) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`${label} deve ser um inteiro positivo.`);
    }
  }
}

module.exports = { RankingService };
