import { Message, MessageEmbed, CommandInteraction } from 'discord.js'
import { isMessage } from 'lunawork'
import { redis, selfDestructMessage } from './redis'
import { style } from './config'

export const createSelfDestructMessage = async (
  msg: Message | CommandInteraction,
  messageContent: MessageEmbed | string,
) => {
  let createdMessage: Message

  if (isMessage(msg)) {
    if (typeof messageContent === 'string') {
      createdMessage = await msg.channel.send(messageContent)
    } else {
      createdMessage = await msg.channel.send({ embed: messageContent })
    }
  } else {
    await msg.reply(messageContent)
    // @ts-ignore The types for d.js v8 is not great 🤷‍♂️
    createdMessage = await msg.fetchReply()
  }

  await redis.set(
    selfDestructMessage(createdMessage.id),
    msg.member!.user.id,
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
