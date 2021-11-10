// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { LunaworkClient } from '@siberianmh/lunawork'
import {
  Collection,
  MessageEmbed,
  GuildChannel,
  CommandInteraction,
  ThreadChannel,
} from 'discord.js'
import { HelpChannel } from '../../../entities/help-channel'

/**
 *
 * @param client            The Lunawork client, used for the embed, to fetch Bot user.
 *
 * @param msg               The message from what happended intercation, used to
 *                          take the guild.
 *
 * @param availableChannels List of available help channels which are available to be taken.
 *
 * @param ongoingChannels   List of active (ongoing) channels, they returns
 *                          from the database, and not by Discord API. Contains the channel
 *                          id and the user id.
 *
 * @param dormantChannels   List of dormant channels.
 */
export const helpChannelStatusEmbed = (
  client: LunaworkClient,
  msg: CommandInteraction,
  availableChannels:
    | Collection<string, GuildChannel | ThreadChannel>
    | undefined,
  ongoingChannels: Array<HelpChannel>,
  dormantChannels: Collection<string, GuildChannel | ThreadChannel> | undefined,
) => {
  return new MessageEmbed()
    .setAuthor(
      msg.guild!.name,
      msg.guild?.iconURL({ dynamic: true }) || undefined,
    )
    .setTitle('Help Channels Status')
    .addField(
      'Available',
      availableChannels && availableChannels.size >= 1
        ? availableChannels.map((channel) => `<#${channel.id}>`).join('\n')
        : '**All channels is on Ongoing/Dormant state**',
    )
    .addField(
      'Ongoing',
      ongoingChannels.length >= 1
        ? ongoingChannels
            .map(
              (channel) =>
                `<#${channel.channel_id}> - Owner <@${channel.user_id}>`,
            )
            .join('\n')
        : '**No Channels in Ongoing Category**',
    )
    .addField(
      'Dormant',
      dormantChannels && dormantChannels.size >= 1
        ? dormantChannels.map((channel) => `<#${channel.id}>`).join('\n')
        : '**All channels in on Available/Ongoing state**',
    )
    .setFooter(client.user!.username, client.user?.displayAvatarURL())
    .setTimestamp()
}
