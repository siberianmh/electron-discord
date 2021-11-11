// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { LunaworkClient, listener } from '@siberianmh/lunawork'
import {
  Message,
  GuildMember,
  Collection,
  Snowflake,
  ThreadChannel,
  ThreadMember,
} from 'discord.js'
import { ExtendedModule } from '../../../lib/extended-module'
import { guild } from '../../../lib/config'
import { HelpChannel } from '../../../entities/help-channel'

export class ThreadHelpStage extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  @listener({ event: 'messageCreate' })
  public async onNewQuestion(msg: Message) {
    if (
      msg.author.bot ||
      !msg.guild ||
      !msg.member ||
      msg.channel.type !== 'GUILD_TEXT' ||
      msg.channel.id !== guild.channels.threadHelpChannel
    ) {
      return
    }

    const createdThread = await msg.channel.threads.create({
      autoArchiveDuration: 1440,
      name: `Help Channel for ${msg.author.username} (${msg.id})`,
      reason: 'Someone want something new',
      startMessage: msg.id,
      type: 'GUILD_PUBLIC_THREAD',
    })

    await createdThread.setLocked(true, 'Should be closed by system')

    await this.addCooldown(msg.member)

    return await HelpChannel.create({
      user_id: msg.member.user.id,
      channel_id: createdThread.id,
      message_id: msg.id,
    }).save()
  }

  @listener({ event: 'threadUpdate' })
  public async onThreadUpdate(oldThread: ThreadChannel, thread: ThreadChannel) {
    // Some other thread do this.
    if (thread.parentId !== guild.channels.threadHelpChannel) {
      return
    }

    if (oldThread.archived === false && thread.archived === true) {
      const channel = await HelpChannel.findOne({
        where: { channel_id: thread.id },
      })

      if (!channel) {
        return
      }

      const roleManger = (
        await (
          await this.client.guilds.fetch(guild.id)
        ).members.fetch(channel.user_id)
      ).roles

      await roleManger.remove(guild.roles.helpCooldown)
      await channel.remove()
    }
  }

  @listener({ event: 'threadMembersUpdate' })
  public async onThreadMembersUpdate(
    _oldMembers: Collection<Snowflake, ThreadMember>,
    newMembers: Collection<Snowflake, ThreadMember>,
  ) {
    // Some other thread do this.
    const newMembersMap = [...newMembers.values()]
    if (newMembersMap[0].thread.parentId !== guild.channels.threadHelpChannel) {
      return
    }

    const channel = await HelpChannel.findOne({
      where: { channel_id: newMembersMap[0].thread.id },
    })

    const member = newMembersMap.find(
      (x) => x.guildMember!.id === channel!.user_id,
    )

    if (!member) {
      const roleManger = (
        await (
          await this.client.guilds.fetch(guild.id)
        ).members.fetch(channel!.user_id)
      ).roles

      await roleManger.remove(guild.roles.helpCooldown)
      await channel!.remove()
      await newMembersMap[0].thread.setArchived(true, 'User left the thread')
    }
  }

  private async addCooldown(member: GuildMember) {
    return await member.roles.add(guild.roles.helpCooldown)
  }
}
