class ModerationService {
  constructor({ blockedTerms = [], maxActionsPerWindow = 5, windowMs = 60_000 } = {}) {
    this.blockedTerms = blockedTerms.map((term) => term.toLocaleLowerCase());
    this.maxActionsPerWindow = maxActionsPerWindow;
    this.windowMs = windowMs;
    this.actions = new Map();
  }

  inspectMessage(content) {
    const normalizedContent = content.normalize('NFKC').toLocaleLowerCase();
    const blockedTerm = this.blockedTerms.find((term) => normalizedContent.includes(term));

    return blockedTerm
      ? { allowed: false, reason: 'blocked-term', term: blockedTerm }
      : { allowed: true };
  }

  registerSensitiveAction(actorId, now = Date.now()) {
    const recentActions = (this.actions.get(actorId) ?? []).filter((timestamp) => now - timestamp < this.windowMs);
    recentActions.push(now);
    this.actions.set(actorId, recentActions);

    return {
      allowed: recentActions.length <= this.maxActionsPerWindow,
      actionsInWindow: recentActions.length,
    };
  }
}

module.exports = { ModerationService };
