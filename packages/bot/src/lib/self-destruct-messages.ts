import { Message, MessageEmbed } from 'discord.js'
import { redis, selfDestructMessage } from './redis'
import { style } from './config'

export const createSelfDestructMessage = async (
  msg: Message,
  messageContent: MessageEmbed,
) => {
  const createdMessage = await msg.channel.send({ embed: messageContent })

  await redis.set(
    selfDestructMessage(createdMessage.id),
    msg.author.id,
    'ex',
    60 * 60 * 6,
  )

  return await createdMessage.react(style.emojis.deleteBucket)
}
