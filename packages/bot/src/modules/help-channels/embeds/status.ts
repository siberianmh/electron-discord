import { LunaworkClient } from 'lunawork'
import {
  Message,
  Collection,
  MessageEmbed,
  GuildChannel,
  ThreadChannel,
} from 'discord.js'
import { IListHelpChannelsRespone } from '../../../lib/types'

export const helpChannelStatusEmbed = (
  client: LunaworkClient,
  msg: Message,
  availableChannels:
    | Collection<`${bigint}`, GuildChannel | ThreadChannel>
    | undefined,
  ongoingChannels: IListHelpChannelsRespone,
  dormantChannels:
    | Collection<`${bigint}`, GuildChannel | ThreadChannel>
    | undefined,
) => {
  return new MessageEmbed()
    .setAuthor(
      msg.guild!.name,
      msg.guild?.iconURL({ dynamic: true }) || undefined,
    )
    .setTitle('Help Channels Status')
    .addField(
      'Available',
      // @ts-expect-error
      availableChannels && availableChannels.size >= 1
        ? availableChannels.map((channel) => `<#${channel.id}>`)
        : '**All channels is on Ongoing/Dormant state**',
    )
    .addField(
      'Ongoing',
      // @ts-expect-error
      ongoingChannels.length >= 1
        ? ongoingChannels.map(
            (channel) =>
              `<#${channel.channel_id}> - Owner <@${channel.user_id}>`,
          )
        : '**No Channels in Ongoing Category**',
    )
    .addField(
      'Dormant',
      // @ts-expect-error
      dormantChannels && dormantChannels.size >= 1
        ? dormantChannels.map((channel) => `<#${channel.id}>`)
        : '**All channels in on Available/Ongoing state**',
    )
    .setFooter(client.user!.username, client.user?.displayAvatarURL())
    .setTimestamp()
}
