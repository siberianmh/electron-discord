import { LunaworkClient } from '@siberianmh/lunawork'
import {
  Message,
  Collection,
  MessageEmbed,
  GuildChannel,
  CommandInteraction,
  ThreadChannel,
} from 'discord.js'
import { IListHelpChannelsRespone } from '../../../lib/types'

export const helpChannelStatusEmbed = (
  client: LunaworkClient,
  msg: Message | CommandInteraction,
  availableChannels:
    | Collection<string, GuildChannel | ThreadChannel>
    | undefined,
  ongoingChannels: IListHelpChannelsRespone,
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
