const test = require('node:test');
const assert = require('node:assert/strict');
const { PremiumShopService } = require('../examples/premium-shop-service');

test('cobra e entrega um cargo premium', async () => {
  const shop = new PremiumShopService();
  shop.setCatalog([{ id: 'gold', name: 'Gold', roleKey: 'gold-role', price: 200, benefits: ['XP extra'] }]);
  shop.credit('ana', 300);

  const granted = [];
  const result = await shop.purchaseRole({
    userId: 'ana',
    itemId: 'gold',
    grantRole: async (roleKey) => granted.push(roleKey),
    revokeRole: async () => {},
  });

  assert.deepEqual(granted, ['gold-role']);
  assert.equal(result.balance, 100);
});

test('estorna a compra quando a entrega do cargo falha', async () => {
  const shop = new PremiumShopService();
  shop.setCatalog([{ id: 'gold', name: 'Gold', roleKey: 'gold-role', price: 200 }]);
  shop.credit('ana', 300);

  await assert.rejects(
    shop.purchaseRole({
      userId: 'ana',
      itemId: 'gold',
      grantRole: async () => { throw new Error('Sem permissão'); },
      revokeRole: async () => {},
    }),
    /Não foi possível concluir/
  );

  assert.equal(shop.getBalance('ana'), 300);
});

test('recupera compras pendentes usando a chave do cargo', async () => {
  const shop = new PremiumShopService();
  shop.setCatalog([{ id: 'gold', name: 'Gold', roleKey: 'gold-role', price: 200 }]);
  shop.credit('ana', 300);
  shop.charge('ana', 200);
  const transaction = shop.createTransaction({ userId: 'ana', type: 'role', itemId: 'gold', amount: 200 });
  const revoked = [];

  const recovered = await shop.recoverPending({
    revokeRole: async (roleKey) => revoked.push(roleKey),
  });

  assert.deepEqual(recovered, [transaction.id]);
  assert.deepEqual(revoked, ['gold-role']);
  assert.equal(shop.getBalance('ana'), 300);
});
