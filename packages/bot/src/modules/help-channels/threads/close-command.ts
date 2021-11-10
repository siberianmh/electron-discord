// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import {
  CommandInteraction,
  GuildMemberRoleManager,
  Permissions,
  ThreadChannel,
} from 'discord.js'
import { guild } from '../../../lib/config'
import { HelpChannel } from '../../../entities/help-channel'

export async function threadCloseCommand(msg: CommandInteraction) {
  const channel = await HelpChannel.findOne({
    where: { channel_id: msg.channel!.id },
  })

  if (
    (channel && channel.user_id === msg.member?.user.id) ||
    (typeof msg.member?.permissions !== 'string' &&
      msg.member?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) ||
    (!Array.isArray(msg.member?.roles) &&
      msg.member?.roles.cache.has(guild.roles.maintainer))
  ) {
    await msg.reply({
      content: 'Channel is starting closing 🙇‍♂️',
      ephemeral: true,
    })

    const roleManger = msg.member?.roles as GuildMemberRoleManager
    await roleManger.remove(guild.roles.helpCooldown)

    await channel!.remove()

    return await (msg.channel as ThreadChannel).setArchived(
      true,
      'Closed by user',
    )
  } else {
    return msg.reply({
      content: ':warning: you have to be the asker to close the channel.',
      ephemeral: true,
    })
  }
}
