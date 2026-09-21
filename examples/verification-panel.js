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
  if (normalizedBannerPath.length > 260) {
    throw new Error('O caminho do banner deve ter até 260 caracteres.');
  }
  if (/[\u0000-\u001f\u007f]/.test(normalizedBannerPath)) {
    throw new Error('O caminho do banner contém caracteres inválidos.');
  }
  const hasUriScheme = /^[a-z][a-z\d+.-]*:/i.test(normalizedBannerPath);
  const isWindowsPath = /^[a-z]:[\\/]/i.test(normalizedBannerPath);
  if (hasUriScheme && !isWindowsPath) {
    throw new Error('O banner precisa usar um caminho local.');
  }
  if (/^(?:\\\\|\/)/.test(normalizedBannerPath)) {
    throw new Error('O banner não pode usar um caminho de rede.');
  }
  const bannerSegments = normalizedBannerPath.split(/[\\/]+/);
  if (bannerSegments.includes('..')) {
    throw new Error('O caminho do banner não pode sair do diretório permitido.');
  }
  if (bannerSegments.some((segment) => /[. ]$/.test(segment))) {
    throw new Error('Os segmentos do caminho não podem terminar com ponto ou espaço.');
  }
  if (/[*?]/.test(normalizedBannerPath)) {
    throw new Error('O caminho do banner não pode usar curingas.');
  }
  const fileSegments = isWindowsPath ? bannerSegments.slice(1) : bannerSegments;
  if (fileSegments.some((segment) => /[<>:"|]/.test(segment))) {
    throw new Error('O caminho do banner contém caracteres inválidos.');
  }
  if (!/\.png$/i.test(normalizedBannerPath)) {
    throw new Error('O banner precisa ser um arquivo PNG.');
  }
  return {
    embeds: [{ title: 'Verificação', description: description || 'Escolha uma opção.' }],
    attachments: [{ path: normalizedBannerPath, name: 'verify-banner.png' }],
  };
}

module.exports = { buildVerificationMessage };
