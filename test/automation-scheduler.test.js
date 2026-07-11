const test = require('node:test');
const assert = require('node:assert/strict');
const { AutomationScheduler } = require('../examples/automation-scheduler');

test('executa apenas trabalhos vencidos', async () => {
  const scheduler = new AutomationScheduler();
  let executions = 0;
  scheduler.register({ id: 'announcement', intervalMs: 1_000, run: async () => { executions += 1; } });

  assert.equal((await scheduler.runDue(10_000))[0].status, 'completed');
  assert.equal((await scheduler.runDue(10_500)).length, 0);
  assert.equal(executions, 1);
});
