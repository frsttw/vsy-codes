class AutomationScheduler {
  constructor() {
    this.jobs = new Map();
  }

  register({ id, intervalMs, run }) {
    if (typeof id !== 'string' || !id.trim() || !Number.isInteger(intervalMs) || intervalMs <= 0 || typeof run !== 'function') {
      throw new Error('Um trabalho precisa de id, intervalo positivo e função de execução.');
    }

    const normalizedId = id.trim();

    if (this.jobs.has(normalizedId)) {
      throw new Error('Já existe um trabalho com este id.');
    }

    this.jobs.set(normalizedId, { id: normalizedId, intervalMs, run, nextRunAt: 0, enabled: true });
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
    if (typeof enabled !== 'boolean') {
      throw new Error('O estado do trabalho deve ser booleano.');
    }

    const job = this.getJob(id);
    job.enabled = enabled;
  }

  unregister(id) {
    return this.jobs.delete(id);
  }

  getJob(id) {
    const job = this.jobs.get(id);
    if (!job) throw new Error('Trabalho não encontrado.');
    return job;
  }
}

module.exports = { AutomationScheduler };
