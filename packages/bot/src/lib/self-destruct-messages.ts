import { Message, MessageEmbed, CommandInteraction } from 'discord.js'
import { isMessage, isCommandMessage } from 'lunawork'
import { redis, selfDestructMessage } from './redis'
import { style } from './config'

export const createSelfDestructMessage = async (
  msg: Message | CommandInteraction,
  messageContent: MessageEmbed | string,
) => {
  let createdMessage: Message | null = null

  if (isMessage(msg)) {
    if (typeof messageContent === 'string') {
      createdMessage = await msg.channel.send(messageContent)
    } else {
      createdMessage = await msg.channel.send({ embeds: [messageContent] })
    }
  } else if (isCommandMessage(msg)) {
    if (typeof messageContent === 'string') {
      await msg.reply({
        content: messageContent,
      })
      // @ts-expect-error
      createdMessage = await msg.fetchReply()
    } else {
      await msg.reply({
        embeds: [messageContent],
      })
      // @ts-expect-error
      createdMessage = await msg.fetchReply()
    }
  }

  await redis.set(
    selfDestructMessage(createdMessage!.id),
    msg.member!.user.id,
    'ex',
    60 * 60 * 24,
  )

  return await createdMessage?.react(style.emojis.deleteBucket)
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
