class VoiceChannelService {
  constructor() {
    this.channels = new Map();
    this.nextId = 1;
  }

  create(ownerId, { name = 'Sala temporária', userLimit = 0 } = {}) {
    if (!ownerId) throw new Error('O proprietário do canal é obrigatório.');
    if (!Number.isInteger(userLimit) || userLimit < 0) throw new Error('O limite de usuários é inválido.');

    const channel = {
      id: `VC-${this.nextId++}`,
      ownerId,
      name,
      userLimit,
      members: new Set([ownerId]),
    };
    this.channels.set(channel.id, channel);
    return this.serialize(channel);
  }

  join(channelId, memberId) {
    const channel = this.getChannel(channelId);
    if (channel.userLimit && channel.members.size >= channel.userLimit) {
      throw new Error('O canal atingiu o limite de usuários.');
    }

    channel.members.add(memberId);
    return this.serialize(channel);
  }

  rename(channelId, requesterId, name) {
    const channel = this.getChannel(channelId);
    if (channel.ownerId !== requesterId) throw new Error('Apenas o proprietário pode renomear o canal.');
    if (!name?.trim()) throw new Error('O nome do canal é obrigatório.');

    channel.name = name.trim();
    return this.serialize(channel);
  }

  leave(channelId, memberId) {
    const channel = this.getChannel(channelId);
    channel.members.delete(memberId);

    if (channel.members.size === 0) {
      this.channels.delete(channelId);
      return { deleted: true };
    }

    return this.serialize(channel);
  }

  getChannel(channelId) {
    const channel = this.channels.get(channelId);
    if (!channel) throw new Error('Canal não encontrado.');
    return channel;
  }

  serialize(channel) {
    return { ...channel, members: [...channel.members] };
  }
}

module.exports = { VoiceChannelService };
