// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import {
  Message,
  MessageEmbed,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageActionRowComponentResolvable,
} from 'discord.js'
import { redis, selfDestructMessage } from './redis'
import { style } from './config'

/**
 * Self destruct message, but which only support prefixed
 * commands, Message class.
 *
 * @see {createSelfDestructMessage} for usage with applicaticon command
 */
export const selfDestructLegacy = async (
  msg: Message,
  {
    content,
    embeds,
    components,
  }: {
    content?: string
    embeds?: Array<MessageEmbed>
    components?: Array<MessageActionRowComponentResolvable>
  },
) => {
  const toUsageComponents = new MessageActionRow()

  if (components?.length) {
    toUsageComponents.spliceComponents(0, 0, ...components)
  }

  toUsageComponents.addComponents(
    new MessageButton()
      .setCustomId('trashIcon')
      .setEmoji('🗑️')
      .setStyle('DANGER'),
  )

  const message = await msg.channel.send({
    content: content,
    embeds: embeds,
    components: [toUsageComponents],
  })

  await redis.set(
    selfDestructMessage(message.id),
    msg.author.id,
    'ex',
    60 * 60 * 24,
  )
}

export const createSelfDestructMessage = async (
  msg: CommandInteraction,
  {
    content,
    embeds,
    components,
  }: {
    content?: string
    embeds?: Array<MessageEmbed>
    components?: Array<MessageActionRowComponentResolvable>
  },
) => {
  const toUsageComponents = new MessageActionRow()

  if (components?.length) {
    toUsageComponents.spliceComponents(0, 0, ...components)
  }

  toUsageComponents.addComponents(
    new MessageButton()
      .setCustomId('trashIcon')
      .setEmoji('🗑️')
      .setStyle('DANGER'),
  )

  await msg.reply({
    content: content,
    embeds: embeds,
    components: [toUsageComponents],
  })

  const message = await msg.fetchReply()

  await redis.set(
    selfDestructMessage(message.id),
    msg.user.id,
    'ex',
    60 * 60 * 24,
  )

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
