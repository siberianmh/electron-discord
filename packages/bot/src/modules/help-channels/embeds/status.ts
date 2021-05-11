import { LunaworkClient } from '@sib3/lunawork'
import { Message, Collection, MessageEmbed, GuildChannel } from 'discord.js'
import { IListHelpChannelsRespone } from '../../../lib/types'

export const helpChannelStatusEmbed = (
  client: LunaworkClient,
  msg: Message,
  availableChannels: Collection<string, GuildChannel> | undefined,
  ongoingChannels: IListHelpChannelsRespone,
  dormantChannels: Collection<string, GuildChannel> | undefined,
) => {
  return new MessageEmbed()
    .setAuthor(
      msg.guild?.name,
      msg.guild?.iconURL({ dynamic: true }) || undefined,
    )
    .setTitle('Help Channels Status')
    .addField(
      'Available',
      availableChannels && availableChannels.size >= 1
        ? availableChannels.map((channel) => `<#${channel.id}>`)
        : '**All channels is on Ongoing/Dormant state**',
    )
    .addField(
      'Ongoing',
      ongoingChannels.length >= 1
        ? ongoingChannels.map(
            (channel) =>
              `<#${channel.channel_id}> - Owner <@${channel.user_id}>`,
          )
        : '**No Channels in Ongoing Category**',
    )
    .addField(
      'Dormant',
      dormantChannels && dormantChannels.size >= 1
        ? dormantChannels.map((channel) => `<#${channel.id}>`)
        : '**All channels in on Available/Ongoing state**',
    )
    .setFooter(client.user?.username, client.user?.displayAvatarURL())
    .setTimestamp()
}
