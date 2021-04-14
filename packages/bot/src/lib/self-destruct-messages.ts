import { Message, MessageEmbed } from 'discord.js'
import { redis, selfDestructMessage } from './redis'
import { style } from './config'

export const createSelfDestructMessage = async (
  msg: Message,
  messageContent: MessageEmbed | string,
) => {
  let createdMessage: Message

  if (typeof messageContent === 'string') {
    createdMessage = await msg.channel.send(messageContent)
  } else {
    createdMessage = await msg.channel.send({ embed: messageContent })
  }

  await redis.set(
    selfDestructMessage(createdMessage.id),
    msg.author.id,
    'ex',
    60 * 60 * 24,
  )

  return await createdMessage.react(style.emojis.deleteBucket)
}

export const reactAsSelfDesturct = async (msg: Message) => {
  await redis.set(
    selfDestructMessage(msg.id),
    msg.author.id,
    'ex',
    60 * 60 * 24,
  )

  return await msg.react(style.emojis.deleteBucket)
}
