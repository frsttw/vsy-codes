class EconomyService {
  constructor({ dailyReward = 250, dailyCooldownMs = 86_400_000 } = {}) {
    this.dailyReward = dailyReward;
    this.dailyCooldownMs = dailyCooldownMs;
    this.accounts = new Map();
  }

  getAccount(userId) {
    if (!this.accounts.has(userId)) {
      this.accounts.set(userId, {
        wallet: 0,
        bank: 0,
        inventory: [],
        lastDailyAt: null,
      });
    }

    return this.accounts.get(userId);
  }

  deposit(userId, amount) {
    const account = this.getAccount(userId);
    this.assertPositiveAmount(amount);

    if (account.wallet < amount) {
      throw new Error('Saldo insuficiente na carteira.');
    }

    account.wallet -= amount;
    account.bank += amount;
    return this.snapshot(userId);
  }

  withdraw(userId, amount) {
    const account = this.getAccount(userId);
    this.assertPositiveAmount(amount);

    if (account.bank < amount) {
      throw new Error('Saldo insuficiente no banco.');
    }

    account.bank -= amount;
    account.wallet += amount;
    return this.snapshot(userId);
  }

  transfer(fromUserId, toUserId, amount) {
    if (fromUserId === toUserId) {
      throw new Error('Não é possível transferir para a mesma conta.');
    }

    const sender = this.getAccount(fromUserId);
    const recipient = this.getAccount(toUserId);
    this.assertPositiveAmount(amount);

    if (sender.wallet < amount) {
      throw new Error('Saldo insuficiente para a transferência.');
    }

    sender.wallet -= amount;
    recipient.wallet += amount;

    return {
      from: this.snapshot(fromUserId),
      to: this.snapshot(toUserId),
    };
  }

  claimDaily(userId, now = Date.now()) {
    const account = this.getAccount(userId);
    const availableAt = (account.lastDailyAt ?? 0) + this.dailyCooldownMs;

    if (now < availableAt) {
      return { claimed: false, availableAt };
    }

    account.wallet += this.dailyReward;
    account.lastDailyAt = now;
    return { claimed: true, reward: this.dailyReward, account: this.snapshot(userId) };
  }

  buyItem(userId, item) {
    const account = this.getAccount(userId);

    if (!item?.id || !item?.name) {
      throw new Error('O item precisa de id e nome.');
    }

    this.assertPositiveAmount(item.price);

    if (account.wallet < item.price) {
      throw new Error('Saldo insuficiente para comprar este item.');
    }

    if (account.inventory.some((ownedItem) => ownedItem.id === item.id)) {
      throw new Error('Este item já pertence ao usuário.');
    }

    account.wallet -= item.price;
    account.inventory.push({ id: item.id, name: item.name });
    return this.snapshot(userId);
  }

  credit(userId, amount) {
    this.assertPositiveAmount(amount);
    const account = this.getAccount(userId);
    account.wallet += amount;
    return this.snapshot(userId);
  }

  snapshot(userId) {
    const account = this.getAccount(userId);
    return {
      wallet: account.wallet,
      bank: account.bank,
      inventory: [...account.inventory],
      lastDailyAt: account.lastDailyAt,
    };
  }

  assertPositiveAmount(amount) {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error('O valor deve ser um inteiro positivo.');
    }
  }
}

module.exports = { EconomyService };
