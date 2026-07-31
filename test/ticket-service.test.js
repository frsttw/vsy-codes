const test = require('node:test');
const assert = require('node:assert/strict');
const { TicketService } = require('../examples/ticket-service');

test('mantém apenas um ticket aberto por solicitante', () => {
  const tickets = new TicketService();
  const ticket = tickets.open({ requesterId: 'ana', subject: 'Dúvida', category: 'Suporte' });

  tickets.assign(ticket.id, 'agent-1');
  assert.throws(
    () => tickets.open({ requesterId: 'ana', subject: 'Outra dúvida', category: 'Suporte' }),
    /Já existe um ticket aberto/
  );

  tickets.close(ticket.id, { closedBy: 'agent-1', reason: 'Resolvido' });
  assert.equal(tickets.list({ status: 'closed' }).length, 1);
});

test('registra datas de abertura e encerramento pelo relógio configurado', () => {
  const timestamps = ['2026-01-01T10:00:00.000Z', '2026-01-01T10:10:00.000Z'];
  const tickets = new TicketService({ now: () => timestamps.shift() });
  const ticket = tickets.open({ requesterId: 'ana', subject: 'Dúvida', category: 'Suporte' });
  const closed = tickets.close(ticket.id, { closedBy: 'agent-1', reason: 'Resolvido' });

  assert.equal(ticket.openedAt, '2026-01-01T10:00:00.000Z');
  assert.equal(closed.closedAt, '2026-01-01T10:10:00.000Z');
  assert.throws(() => new TicketService({ now: 'invalid' }), /relógio/);
});
