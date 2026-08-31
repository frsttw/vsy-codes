function buildVerificationMessage(panel, bannerPath) {
  const description = String(panel?.description ?? '').trim();
  return {
    embeds: [{ title: 'Verificação', description: description || 'Escolha uma opção.' }],
    attachments: [{ path: bannerPath, name: 'verify-banner.png' }],
  };
}

module.exports = { buildVerificationMessage };
