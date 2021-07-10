import {
  Message,
  MessageEmbed,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} from 'discord.js'
import { isMessage, isCommandMessage } from '@siberianmh/lunawork'
import { redis, selfDestructMessage } from './redis'
import { style } from './config'

export const createSelfDestructMessage = async (
  msg: Message | CommandInteraction,
  messageContent: MessageEmbed | string,
) => {
  let createdMessage: Message | null = null
  const flipper = Math.random()

  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('trashIcon')
      .setLabel('🗑')
      .setStyle('DANGER'),
  )

  if (isMessage(msg)) {
    if (typeof messageContent === 'string') {
      createdMessage = await msg.channel.send({
        content: messageContent,
        components: flipper > 0.5 ? [row] : undefined,
      })
    } else {
      createdMessage = await msg.channel.send({
        embeds: [messageContent],
        components: flipper > 0.5 ? [row] : undefined,
      })
    }
  } else if (isCommandMessage(msg)) {
    if (typeof messageContent === 'string') {
      await msg.reply({
        content: messageContent,
        components: flipper > 0.5 ? [row] : undefined,
      })
      // @ts-expect-error
      createdMessage = await msg.fetchReply()
    } else {
      await msg.reply({
        embeds: [messageContent],
        components: flipper > 0.5 ? [row] : undefined,
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

  if (flipper < 0.5) {
    return await createdMessage?.react(style.emojis.deleteBucket)
  }

  return
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
