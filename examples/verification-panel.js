function buildVerificationMessage(panel, bannerPath) {
  if (!panel || typeof panel !== 'object' || Array.isArray(panel)) {
    throw new Error('O painel de verificação precisa ser um objeto.');
  }
  const description = String(panel?.description ?? '').trim();
  if (description.length > 4_096) {
    throw new Error('A descrição do painel deve ter até 4.096 caracteres.');
  }
  const normalizedBannerPath = String(bannerPath ?? '').trim();
  if (!normalizedBannerPath) throw new Error('O caminho do banner não pode ser vazio.');
  return {
    embeds: [{ title: 'Verificação', description: description || 'Escolha uma opção.' }],
    attachments: [{ path: normalizedBannerPath, name: 'verify-banner.png' }],
  };
}

module.exports = { buildVerificationMessage };
