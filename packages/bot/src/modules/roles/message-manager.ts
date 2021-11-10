// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { MessageEmbed, TextChannel } from 'discord.js'
import { style } from '../../lib/config'
import { IRoleMessage } from '../../lib/types'
import { pronousRoles } from './reaction-messages/pronouns'
import { operationSystemRoles } from './reaction-messages/operation-system'
import { MessageRoles, MessageRolesActions } from '../../entities/roles'

const createMessageEntry = async (
  entry: IRoleMessage,
  channel: TextChannel,
) => {
  let message = `${entry.description}\n`

  entry.reactions.forEach((reaction) => {
    message += `${reaction.emojiId} ${reaction.name}\n`
  })

  const embed = new MessageEmbed()
    .setDescription(message)
    .setColor(style.colors.electronBlue)
  const dsCreatedMessage = await channel.send({ embeds: [embed] })

  const roleEntry = await MessageRoles.create({
    name: entry.name,
    message_id: dsCreatedMessage.id,
  }).save()

  entry.reactions.forEach(async (reaction) => {
    await MessageRolesActions.create({
      role_id: reaction.roleId,
      emoji_id: reaction.emojiId,
      auto_remove: reaction.autoRemove,
      message_role: roleEntry,
    }).save()
  })

  return entry.reactions.map(async (reaction) => {
    return await dsCreatedMessage.react(reaction.rawEmojiId)
  })
}

export async function initiateMessages(channel: TextChannel) {
  // Pronous entry
  await createMessageEntry(pronousRoles, channel)
  // OS entry
  return await createMessageEntry(operationSystemRoles, channel)
}
