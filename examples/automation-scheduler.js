class AutomationScheduler {
  constructor() {
    this.jobs = new Map();
  }

  register({ id, intervalMs, run }) {
    if (!id || !Number.isInteger(intervalMs) || intervalMs <= 0 || typeof run !== 'function') {
      throw new Error('Um trabalho precisa de id, intervalo positivo e função de execução.');
    }

    if (this.jobs.has(id)) {
      throw new Error('Já existe um trabalho com este id.');
    }

    this.jobs.set(id, { id, intervalMs, run, nextRunAt: 0, enabled: true });
  }

  async runDue(now = Date.now()) {
    const results = [];

    for (const job of this.jobs.values()) {
      if (!job.enabled || now < job.nextRunAt) continue;

      try {
        await job.run();
        job.nextRunAt = now + job.intervalMs;
        results.push({ id: job.id, status: 'completed' });
      } catch (error) {
        job.nextRunAt = now + job.intervalMs;
        results.push({ id: job.id, status: 'failed', error: error.message });
      }
    }

    return results;
  }

  setEnabled(id, enabled) {
    const job = this.getJob(id);
    job.enabled = Boolean(enabled);
  }

  getJob(id) {
    const job = this.jobs.get(id);
    if (!job) throw new Error('Trabalho não encontrado.');
    return job;
  }
}

module.exports = { AutomationScheduler };
