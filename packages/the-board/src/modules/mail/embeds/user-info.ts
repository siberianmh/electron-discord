import { MessageEmbed, GuildMember } from 'discord.js'
import * as humanizeDuration from 'humanize-duration'
import { style } from '../../../lib/config'

export const userInfoEmbed = (member: GuildMember): MessageEmbed => {
  const created = humanizeDuration(member.user.createdTimestamp)
  const joined = humanizeDuration(member.joinedTimestamp!)

  return new MessageEmbed()
    .setAuthor(
      member.user.tag,
      member.user.displayAvatarURL({ dynamic: false }) || undefined,
    )
    .setColor(style.colors.softRed)
    .setDescription(
      `<@${member.user.id}> was created ${created}, joined ${joined}`,
    )
    .addField(
      'Roles',
      `${[...member.roles.cache.values()].map((role) => `<@&${role.id}>`)}`,
    )
    .setTimestamp()
}
