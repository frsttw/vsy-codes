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
