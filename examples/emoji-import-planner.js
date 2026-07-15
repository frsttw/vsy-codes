const path = require('node:path');

const SUPPORTED_IMAGE_TYPES = new Set([
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp'
]);

const SUPPORTED_EXTENSIONS = new Set(['.gif', '.jpeg', '.jpg', '.png', '.webp']);

function normalizeName(value, fallback = 'emoji', maxLength = 32) {
  const normalized = String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  const name = (normalized.length >= 2 ? normalized : fallback).slice(0, maxLength);
  return name.length >= 2 ? name : 'emoji';
}

function normalizePrefix(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  const prefix = String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 24);
  return prefix.length >= 2 ? prefix : null;
}

function isSupportedImage({ name = '', contentType = '' }) {
  const mimeType = contentType.split(';')[0].toLowerCase();
  return SUPPORTED_IMAGE_TYPES.has(mimeType)
    || SUPPORTED_EXTENSIONS.has(path.extname(name).toLowerCase());
}

function reserveName(baseName, usedNames) {
  const base = normalizeName(baseName);
  if (!usedNames.has(base)) {
    usedNames.add(base);
    return base;
  }

  for (let suffix = 2; suffix <= 999999; suffix += 1) {
    const ending = `_${suffix}`;
    const candidate = `${base.slice(0, 32 - ending.length)}${ending}`;
    if (!usedNames.has(candidate)) {
      usedNames.add(candidate);
      return candidate;
    }
  }

  throw new Error('Não foi possível reservar outro nome de emoji.');
}

function reserveSequentialName(prefix, startAt, usedNames) {
  let sequence = Math.max(1, Number(startAt) || 1);
  while (sequence <= 999999) {
    const ending = `_${sequence}`;
    const candidate = `${prefix.slice(0, 32 - ending.length)}${ending}`;
    if (!usedNames.has(candidate)) {
      usedNames.add(candidate);
      return { name: candidate, nextSequence: sequence + 1 };
    }
    sequence += 1;
  }

  throw new Error('Não foi possível reservar outro nome sequencial.');
}

function extractCandidates(messages) {
  const candidates = [];
  const sourceKeys = new Set();

  const add = candidate => {
    if (!candidate.sourceKey || sourceKeys.has(candidate.sourceKey)) return;
    sourceKeys.add(candidate.sourceKey);
    candidates.push(candidate);
  };

  for (const message of messages) {
    const markup = String(message.content ?? '');
    const customEmoji = /<(a?):([a-zA-Z0-9_]{2,32}):([^>\s]+)>/g;
    let match;
    while ((match = customEmoji.exec(markup)) !== null) {
      add({
        kind: 'custom',
        sourceKey: `custom:${match[3]}`,
        suggestedName: match[2],
        animated: match[1] === 'a'
      });
    }

    for (const attachment of message.attachments ?? []) {
      if (!isSupportedImage(attachment)) continue;
      add({
        kind: 'image',
        sourceKey: `image:${attachment.id ?? attachment.name}`,
        suggestedName: path.basename(attachment.name ?? 'imagem', path.extname(attachment.name ?? '')),
        animated: attachment.contentType?.startsWith('image/gif') || /\.gif$/i.test(attachment.name ?? '')
      });
    }
  }

  return candidates;
}

function planEmojiImport({ messages, existingNames = [], prefix = null }) {
  const usedNames = new Set(existingNames.map(name => String(name).toLowerCase()));
  const normalizedPrefix = normalizePrefix(prefix);
  let nextSequence = 1;

  return extractCandidates(messages).map(candidate => {
    const reservation = normalizedPrefix
      ? reserveSequentialName(normalizedPrefix, nextSequence, usedNames)
      : { name: reserveName(candidate.suggestedName, usedNames), nextSequence };

    nextSequence = reservation.nextSequence;
    return { ...candidate, name: reservation.name };
  });
}

module.exports = {
  extractCandidates,
  isSupportedImage,
  normalizePrefix,
  planEmojiImport
};
