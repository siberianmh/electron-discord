// Copyright (c) 2021 Siberian, Inc. All rights reserved.

import { Message, GuildMember, MessageEmbed } from 'discord.js'

export const reportedMsgEmbed = (message?: Message, member?: GuildMember) => {
  if (!message || !member) {
    return undefined
  }

  return new MessageEmbed()
    .setAuthor(
      member.user.username,
      member.user.avatarURL({ dynamic: false }) || undefined,
    )
    .setDescription(message.cleanContent)
    .setTimestamp()
}
