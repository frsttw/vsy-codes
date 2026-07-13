class PremiumShopService {
  constructor() {
    this.balances = new Map();
    this.catalog = new Map();
    this.transactions = new Map();
    this.nextTransactionId = 1;
  }

  setCatalog(items) {
    const nextCatalog = new Map();

    for (const item of items) {
      if (!item?.id || !item?.name || !Number.isInteger(item.price) || item.price <= 0) {
        throw new Error('Cada item precisa de id, nome e preço inteiro positivo.');
      }

      if (nextCatalog.has(item.id)) {
        throw new Error('O catálogo não pode conter ids duplicados.');
      }

      nextCatalog.set(item.id, { ...item, benefits: [...(item.benefits ?? [])] });
    }

    this.catalog = nextCatalog;
  }

  credit(userId, amount) {
    this.assertPositiveAmount(amount);
    this.balances.set(userId, this.getBalance(userId) + amount);
  }

  getBalance(userId) {
    return this.balances.get(userId) ?? 0;
  }

  async purchaseRole({ userId, itemId, grantRole, revokeRole }) {
    const item = this.catalog.get(itemId);
    if (!item) throw new Error('Item não encontrado no catálogo.');
    if (typeof grantRole !== 'function' || typeof revokeRole !== 'function') {
      throw new Error('Os adaptadores de cargo são obrigatórios.');
    }

    this.charge(userId, item.price);
    const transaction = this.createTransaction({ userId, type: 'role', itemId, amount: item.price });
    let granted = false;

    try {
      await grantRole(item.roleKey);
      granted = true;
      transaction.status = 'completed';
      return { transactionId: transaction.id, item: { ...item }, balance: this.getBalance(userId) };
    } catch (error) {
      await this.rollback(transaction, { revoke: granted ? () => revokeRole(item.roleKey) : null });
      throw new Error(`Não foi possível concluir a compra: ${error.message}`);
    }
  }

  async purchaseCustomRole({ userId, name, color, price, createRole, deleteRole }) {
    this.assertPositiveAmount(price);
    if (!name?.trim() || !/^#[0-9a-f]{6}$/i.test(color ?? '')) {
      throw new Error('Nome e cor hexadecimal válida são obrigatórios.');
    }
    if (typeof createRole !== 'function' || typeof deleteRole !== 'function') {
      throw new Error('Os adaptadores de cargo personalizado são obrigatórios.');
    }

    this.charge(userId, price);
    const transaction = this.createTransaction({ userId, type: 'custom-role', amount: price });
    let role = null;

    try {
      role = await createRole({ name: name.trim(), color: color.toUpperCase() });
      if (!role?.id) throw new Error('O cargo criado não possui identificador.');

      transaction.roleId = role.id;
      transaction.status = 'completed';
      return { transactionId: transaction.id, roleId: role.id, balance: this.getBalance(userId) };
    } catch (error) {
      await this.rollback(transaction, { revoke: role ? () => deleteRole(role.id) : null });
      throw new Error(`Não foi possível concluir o cargo personalizado: ${error.message}`);
    }
  }

  async recoverPending({ revokeRole, deleteRole }) {
    const recoveries = [];

    for (const transaction of this.transactions.values()) {
      if (transaction.status !== 'processing') continue;

      const revoke = transaction.type === 'role'
        ? () => revokeRole?.(transaction.itemId)
        : () => deleteRole?.(transaction.roleId);

      await this.rollback(transaction, { revoke: transaction.roleId || transaction.type === 'role' ? revoke : null });
      recoveries.push(transaction.id);
    }

    return recoveries;
  }

  createTransaction({ userId, type, itemId = null, amount }) {
    const transaction = {
      id: `shop-${this.nextTransactionId++}`,
      userId,
      type,
      itemId,
      amount,
      roleId: null,
      status: 'processing',
    };
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  async rollback(transaction, { revoke }) {
    if (revoke) await revoke();
    this.credit(transaction.userId, transaction.amount);
    transaction.status = 'rolled-back';
  }

  charge(userId, amount) {
    if (this.getBalance(userId) < amount) throw new Error('Saldo insuficiente.');
    this.balances.set(userId, this.getBalance(userId) - amount);
  }

  assertPositiveAmount(amount) {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error('O preço deve ser um inteiro positivo.');
    }
  }
}

module.exports = { PremiumShopService };
