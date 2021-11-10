// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { LunaworkClient } from '@siberianmh/lunawork'
import {
  Message,
  GuildMember,
  GuildChannelResolvable,
  TextChannel,
  Guild,
  ThreadChannel,
} from 'discord.js'
import { HelpChannel } from '../../entities/help-channel'
import { ExtendedModule } from '../../lib/extended-module'
import { helpChannels, guild } from '../../lib/config'
import * as config from '../../lib/config'
import { availableEmbed } from './embeds/available'
import { helpMessage } from './help-message'

/**
 * An base help channel class that share code between public and
 * internal commands.
 */
export class HelpChanBase extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  protected CHANNEL_PREFIX = helpChannels.namePrefix

  /**
   * Moves the channel from the some place, to the specific category,
   * with syncing the permissions.
   *
   * @param channel The channel that should be moved
   * @param category The id of the category to which channel should be moved.
   */
  protected async moveChannel(
    channel: TextChannel,
    category: GuildChannelResolvable,
  ): Promise<TextChannel | void> {
    const parent = channel.guild.channels.resolve(category)
    if (parent === null || parent instanceof ThreadChannel) {
      return
    }

    console.log(
      `Moving #${channel.name} (${channel.id}) to the ${parent.name} category`,
    )

    return await channel.edit({
      parent: parent.id,
      permissionOverwrites: parent.permissionOverwrites.cache,
    })
  }

  /**
   * Add the cooldown to the specific member.
   *
   * @param member The member to which cooldown should be added.
   */
  protected async addCooldown(
    member: GuildMember,
  ): Promise<GuildMember | void> {
    try {
      return await member.roles.add(guild.roles.helpCooldown)
    } catch (err) {
      console.error(
        `An error expected when trying to add cooldown for ${member.displayName} (${member.id})`,
        err,
      )
      return
    }
  }

  /**
   * Create the representation of the help channel in the database.
   *
   * @param member The member who open help channel
   * @param channel The channel that member take to the getting help
   * @param msg The first message that send member to the help channel
   * @returns
   */
  protected async populateHelpChannel(
    member: GuildMember,
    channel: TextChannel,
    msg: Message,
  ) {
    return await HelpChannel.create({
      user_id: member.user.id,
      channel_id: channel.id,
      message_id: msg.id,
    }).save()
  }

  protected async ensureAskChannels(guild: Guild): Promise<void | Message> {
    const askChannels = guild.channels.cache
      .filter(
        (channel) => channel.parentId === config.guild.categories.helpAvailable,
      )
      .filter((channel) => channel.name.startsWith(this.CHANNEL_PREFIX))

    if (askChannels.size >= helpChannels.maxAvailableHelpChannels) {
      return
    }

    const dormantChannels = guild.channels.cache.filter(
      (channel) => channel.parentId === config.guild.categories.helpDormant,
    )

    if (dormantChannels.size < 1) {
      // Just ignore the case where we don't have dormant
      return
    }

    const dormant = guild.channels.cache.find(
      (channel) => channel.parentId === config.guild.categories.helpDormant,
    ) as TextChannel

    if (dormant) {
      await this.moveChannel(dormant, config.guild.categories.helpAvailable)

      let lastMessage = [...dormant.messages.cache.values()]
        .reverse()
        .find((m) => m.author.id === this.client.user?.id)

      if (!lastMessage) {
        lastMessage = [
          ...(await dormant.messages.fetch({ limit: 3 })).values(),
        ].find((m) => m.author.id === this.client.user?.id)
      }

      if (lastMessage) {
        // If there is a last message (the dormant message) by the bot, just edit it
        return await lastMessage.edit({ embeds: [availableEmbed] })
      } else {
        // Otherwise, just send a new message
        return await dormant.send({ embeds: [availableEmbed] })
      }
    }

    await this.ensureAskChannels(guild)
    return await this.syncHowToGetHelp(guild)
  }

  protected async syncHowToGetHelp(msgGuild?: Guild) {
    let availHelpChannels = null

    if (msgGuild) {
      availHelpChannels = msgGuild.channels.cache
        .filter(
          (channel) =>
            channel.parentId === config.guild.categories.helpAvailable,
        )
        .filter((channel) => channel.name.startsWith(this.CHANNEL_PREFIX))
    } else {
      availHelpChannels = await this.client.guilds
        .fetch(guild.id)
        .then((guild) =>
          guild.channels.cache
            .filter(
              (channel) =>
                channel.parentId === config.guild.categories.helpAvailable,
            )
            .filter((channel) => channel.name.startsWith(this.CHANNEL_PREFIX)),
        )
    }

    const helpChannel = (await this.client.channels.fetch(
      guild.channels.askHelpChannel,
    )) as TextChannel
    const lastMessage = (await helpChannel.messages.fetch()).last()

    if (!lastMessage) {
      await helpChannel.send(helpMessage(availHelpChannels))
    } else {
      await lastMessage.edit(helpMessage(availHelpChannels))
    }
  }
}
