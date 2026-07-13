function normalizeAccount(account = {}) {
  const wallet = Number(account.wallet ?? 0);
  const bank = Number(account.bank ?? 0);

  if (!Number.isFinite(wallet) || !Number.isFinite(bank)) {
    throw new Error('Os saldos precisam ser valores numéricos.');
  }

  return {
    username: String(account.username ?? ''),
    wallet: wallet.toFixed(2),
    bank: bank.toFixed(2),
    lastDaily: Number.isSafeInteger(account.lastDaily) ? account.lastDaily : 0,
    lastCrash: Number.isSafeInteger(account.lastCrash) ? account.lastCrash : 0,
    cooldowns: { ...(account.cooldowns ?? {}) },
  };
}

function createEconomyRepository(client) {
  if (!client?.query || !client?.transaction) {
    throw new Error('O cliente de banco precisa expor query e transaction.');
  }

  let writeQueue = Promise.resolve();
  const enqueue = (operation) => {
    const queued = writeQueue.catch(() => {}).then(operation);
    writeQueue = queued;
    return queued;
  };

  const saveAccount = (userId, account) => {
    const value = normalizeAccount(account);
    return enqueue(() => client.query(
      'upsert-economy-account',
      [String(userId), value.username, value.wallet, value.bank, value.lastDaily, value.lastCrash, value.cooldowns]
    ));
  };

  const saveMany = (entries) => enqueue(() => client.transaction(async (transaction) => {
    for (const [userId, account] of entries) {
      const value = normalizeAccount(account);
      await transaction.query(
        'upsert-economy-account',
        [String(userId), value.username, value.wallet, value.bank, value.lastDaily, value.lastCrash, value.cooldowns]
      );
    }
  }));

  const importIfEmpty = (entries) => enqueue(() => client.transaction(async (transaction) => {
    const { count } = await transaction.query('count-economy-accounts');
    if (count > 0) return { imported: false, count };

    for (const [userId, account] of entries) {
      const value = normalizeAccount(account);
      await transaction.query('upsert-economy-account', [String(userId), value.username, value.wallet, value.bank, value.lastDaily, value.lastCrash, value.cooldowns]);
    }

    return { imported: true, count: entries.length };
  }));

  return {
    saveAccount,
    saveMany,
    importIfEmpty,
    drain: () => writeQueue.catch(() => {}),
  };
}

module.exports = { createEconomyRepository, normalizeAccount };
