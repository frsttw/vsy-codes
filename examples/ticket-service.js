class TicketService {
  constructor() {
    this.tickets = new Map();
    this.openTicketByRequester = new Map();
    this.nextId = 1;
  }

  open({ requesterId, subject, category }) {
    if (!requesterId || !subject?.trim() || !category?.trim()) {
      throw new Error('Solicitante, assunto e categoria são obrigatórios.');
    }

    const currentTicketId = this.openTicketByRequester.get(requesterId);
    if (currentTicketId) {
      throw new Error('Já existe um ticket aberto para este solicitante.');
    }

    const ticket = {
      id: `T-${String(this.nextId++).padStart(4, '0')}`,
      requesterId,
      subject: subject.trim(),
      category: category.trim(),
      status: 'open',
      assignedTo: null,
      openedAt: new Date().toISOString(),
      closedAt: null,
      closureReason: null,
    };

    this.tickets.set(ticket.id, ticket);
    this.openTicketByRequester.set(requesterId, ticket.id);
    return { ...ticket };
  }

  assign(ticketId, agentId) {
    const ticket = this.getOpenTicket(ticketId);

    if (!agentId) {
      throw new Error('O responsável pelo ticket é obrigatório.');
    }

    ticket.assignedTo = agentId;
    return { ...ticket };
  }

  close(ticketId, { closedBy, reason }) {
    const ticket = this.getOpenTicket(ticketId);

    if (!closedBy || !reason?.trim()) {
      throw new Error('Responsável pelo encerramento e motivo são obrigatórios.');
    }

    ticket.status = 'closed';
    ticket.closedAt = new Date().toISOString();
    ticket.closedBy = closedBy;
    ticket.closureReason = reason.trim();
    this.openTicketByRequester.delete(ticket.requesterId);
    return { ...ticket };
  }

  list({ status } = {}) {
    return [...this.tickets.values()]
      .filter((ticket) => !status || ticket.status === status)
      .map((ticket) => ({ ...ticket }));
  }

  getOpenTicket(ticketId) {
    const ticket = this.tickets.get(ticketId);

    if (!ticket) {
      throw new Error('Ticket não encontrado.');
    }

    if (ticket.status !== 'open') {
      throw new Error('Este ticket já está encerrado.');
    }

    return ticket;
  }
}

module.exports = { TicketService };
