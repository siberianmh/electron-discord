import { MessageEmbed, User } from 'discord.js'

export const userInfoEmbed = (user: User): MessageEmbed => {
  return new MessageEmbed()
    .setAuthor(
      user.username,
      user.displayAvatarURL({ dynamic: false }) || undefined,
    )
    .setTimestamp()
}
