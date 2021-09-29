// Copyright (c) 2021 Siberian, Inc. All rights reserved.

import { MessageEmbed, GuildMember } from 'discord.js'
import { formatTimestamp } from '../../../../lib/format'
import { style } from '../../../../lib/config'

export const userInfoEmbed = (member: GuildMember): MessageEmbed => {
  const roles = [...member.roles.cache.values()]

  return new MessageEmbed()
    .setAuthor(
      member.user.tag,
      member.user.displayAvatarURL({ dynamic: false }) || undefined,
    )
    .setColor(style.colors.softRed)
    .setDescription(
      `<@${member.user.id}> was created ${formatTimestamp(
        member.user.createdAt,
      )}, joined ${formatTimestamp(member.joinedAt)}`,
    )
    .addField('Roles', `${roles.map((role) => `<@&${role.id}>`)}`)
}
