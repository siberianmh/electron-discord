// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { LunaworkClient, listener } from '@siberianmh/lunawork'
import { MessageReaction, TextChannel, User } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { guild } from '../../lib/config'
import { initiateMessages } from './message-manager'
import { MessageRoles, MessageRolesActions } from '../../entities/roles'
import { toBigIntLiteral } from '../../lib/to-bigint-literal'

export class RolesModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  // TODO: Clarify and modify the workflow
  @listener({ event: 'ready' })
  public async handleRolesChannel() {
    const channel = (await this.client.channels.fetch(
      guild.channels.roles,
    )) as TextChannel

    let allMessages = [...(await channel.messages.fetch()).values()]

    if (!allMessages.length) {
      return await initiateMessages(channel)
    }

    // TODO: Handle case if we don't have one of part messages
    allMessages.forEach(async (message) => {
      const messageDB = await MessageRoles.findOne({
        where: { message_id: message.id },
      })

      if (!messageDB) {
        return await message.delete()
      }

      return
    })

    allMessages = [...(await channel.messages.fetch()).values()]

    if (!allMessages.length) {
      return await initiateMessages(channel)
    }

    return
  }

  @listener({ event: 'messageReactionAdd' })
  public async onReactionAdd(reaction: MessageReaction, user: User) {
    if (user.id === this.client.user?.id) {
      return
    }

    if (reaction.partial) {
      await reaction.fetch()
    }

    if (reaction.message.channel.id !== guild.channels.roles) {
      return
    }

    const rolesActions = await MessageRolesActions.find({
      relations: ['message_role'],
    })

    for (const role of rolesActions) {
      const msg = reaction.message
      if (
        role.emoji_id !== reaction.emoji.toString() ||
        role.message_role.message_id !== msg.id ||
        !msg.guild
      ) {
        continue
      }

      if (role.auto_remove) {
        await reaction.users.remove(user)
      }

      const member = await msg.guild.members.fetch({
        user,
      })

      await member.roles.add(toBigIntLiteral(role.role_id))
      if (!reaction.users.cache.has(this.client.user!.id)) {
        await msg.react(reaction.emoji)
      }
    }
  }

  @listener({ event: 'messageReactionRemove' })
  public async onReactionRemove(reaction: MessageReaction, user: User) {
    if (user.id === this.client.user?.id) {
      return
    }

    if (reaction.partial) {
      await reaction.fetch()
    }

    if (reaction.message.channel.id !== guild.channels.roles) {
      return
    }

    const rolesActions = await MessageRolesActions.find({
      relations: ['message_role'],
    })

    for (const role of rolesActions) {
      const msg = reaction.message
      if (
        role.emoji_id !== reaction.emoji.toString() ||
        role.message_role.message_id !== msg.id ||
        role.auto_remove ||
        !msg.guild
      ) {
        continue
      }

      try {
        const member = await msg.guild.members.fetch({
          user,
        })
        await member.roles.remove(toBigIntLiteral(role.role_id))
      } catch {}
    }
  }
}
