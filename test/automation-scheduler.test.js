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

test('rejeita referências de tempo inválidas', async () => {
  const scheduler = new AutomationScheduler();

  await assert.rejects(() => scheduler.runDue(Number.NaN), /tempo precisa ser um número finito/i);
  await assert.rejects(() => scheduler.runDue(Number.POSITIVE_INFINITY), /tempo precisa ser um número finito/i);
});

test('registra uma mensagem quando o trabalho falha com um valor simples', async () => {
  const scheduler = new AutomationScheduler();
  scheduler.register({ id: 'cleanup', intervalMs: 1_000, run: async () => { throw 'indisponível'; } });

  assert.deepEqual(await scheduler.runDue(10_000), [
    { id: 'cleanup', status: 'failed', error: 'indisponível' },
  ]);
});

test('remove trabalhos sem manter execuções pendentes', async () => {
  const scheduler = new AutomationScheduler();
  let executions = 0;

  scheduler.register({ id: 'cleanup', intervalMs: 1_000, run: async () => { executions += 1; } });

  assert.equal(scheduler.unregister('cleanup'), true);
  assert.equal(scheduler.unregister('cleanup'), false);
  assert.deepEqual(await scheduler.runDue(10_000), []);
  assert.equal(executions, 0);
});

test('exige um estado booleano ao ativar ou pausar trabalhos', () => {
  const scheduler = new AutomationScheduler();
  scheduler.register({ id: 'cleanup', intervalMs: 1_000, run: async () => {} });

  scheduler.setEnabled('cleanup', false);
  assert.equal(scheduler.getJob('cleanup').enabled, false);
  assert.throws(() => scheduler.setEnabled('cleanup', 'false'), /estado do trabalho/);
});

test('rejeita identificadores vazios ou fora do formato esperado', () => {
  const scheduler = new AutomationScheduler();

  assert.throws(
    () => scheduler.register({ id: '   ', intervalMs: 1_000, run: async () => {} }),
    /trabalho precisa/i,
  );
  assert.throws(
    () => scheduler.register({ id: 42, intervalMs: 1_000, run: async () => {} }),
    /trabalho precisa/i,
  );
});

test('normaliza identificadores antes de armazenar trabalhos', () => {
  const scheduler = new AutomationScheduler();

  scheduler.register({ id: '  cleanup  ', intervalMs: 1_000, run: async () => {} });

  assert.equal(scheduler.getJob('cleanup').id, 'cleanup');
  assert.throws(
    () => scheduler.register({ id: 'cleanup', intervalMs: 1_000, run: async () => {} }),
    /já existe/i,
  );
});

test('normaliza identificadores ao consultar e remover trabalhos', () => {
  const scheduler = new AutomationScheduler();

  scheduler.register({ id: 'cleanup', intervalMs: 1_000, run: async () => {} });

  assert.equal(scheduler.getJob('  cleanup  ').id, 'cleanup');
  assert.equal(scheduler.unregister('  cleanup  '), true);
  assert.throws(() => scheduler.getJob('cleanup'), /não encontrado/i);
});
