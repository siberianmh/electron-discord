import { MessageEmbed, TextChannel } from 'discord.js'
import { style } from '../../lib/config'
import { ICreateMessageRoleResponse, IRoleMessage } from '../../lib/types'
import { pronousRoles } from './reaction-messages/pronouns'
import { operationSystemRoles } from './reaction-messages/operation-system'
import { api } from '../../lib/api'

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
  const dsCreatedMessage = await channel.send({ embed })

  const { data: roleEntry } = await api.post<ICreateMessageRoleResponse>(
    '/message-roles',
    {
      name: entry.name,
      message_id: dsCreatedMessage.id,
    },
  )

  entry.reactions.forEach(async (reaction) => {
    await api.post('/message-roles/actions', {
      role_id: reaction.roleId,
      emoji_id: reaction.emojiId,
      auto_remove: reaction.autoRemove,
      message_role: roleEntry,
    })
    return await dsCreatedMessage.react(reaction.rawEmojiId)
  })
}

export async function initiateMessages(channel: TextChannel) {
  await Promise.all([
    // Pronous entry
    createMessageEntry(pronousRoles, channel),
    // OS entry
    createMessageEntry(operationSystemRoles, channel),
  ])
}
