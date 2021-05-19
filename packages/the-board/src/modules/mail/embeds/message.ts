import { MessageEmbed, Message } from 'discord.js'
import { style } from '../../../lib/config'

export const userMessageEmbed = (msg: Message) =>
  new MessageEmbed()
    .setAuthor(
      msg.author.username,
      msg.author.avatarURL({ dynamic: true }) || undefined,
    )
    .setColor(style.colors.softGreen)
    .setDescription(msg.cleanContent)
    .setTimestamp()
