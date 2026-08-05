const test = require('node:test');
const assert = require('node:assert/strict');
const { RankingService } = require('../examples/ranking-service');

test('calcula nível e ordena o ranking por XP', () => {
  const ranking = new RankingService({ thresholds: [10, 30], cooldownMs: 0 });
  ranking.awardExperience('ana', 35, 1);
  ranking.awardExperience('bia', 20, 1);

  const leaderboard = ranking.getLeaderboard({ perPage: 10 });
  assert.deepEqual(leaderboard.entries.map((entry) => entry.userId), ['ana', 'bia']);
  assert.equal(leaderboard.entries[0].level, 2);
});

test('respeita o cooldown de XP', () => {
  const ranking = new RankingService({ cooldownMs: 1_000 });
  assert.equal(ranking.awardExperience('ana', 10, 10_000).awarded, true);
  assert.equal(ranking.awardExperience('ana', 10, 10_500).awarded, false);
});

test('normaliza faixas de XP sem duplicar níveis', () => {
  const ranking = new RankingService({ thresholds: [30, 10, 30], cooldownMs: 0 });

  assert.deepEqual(ranking.thresholds, [10, 30]);
  assert.equal(ranking.awardExperience('ana', 35, 1).level, 2);
  assert.throws(() => new RankingService({ thresholds: [0] }), /faixa de XP/);
});
