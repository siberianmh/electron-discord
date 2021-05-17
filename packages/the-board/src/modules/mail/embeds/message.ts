import { MessageEmbed, Message } from 'discord.js'

export const userMessageEmbed = (msg: Message) =>
  new MessageEmbed()
    .setAuthor(
      msg.author.username,
      msg.author.avatarURL({ dynamic: true }) || undefined,
    )
    .setDescription(msg.cleanContent)
    .setTimestamp()
