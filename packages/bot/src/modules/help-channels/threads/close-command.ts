import {
  CommandInteraction,
  GuildMemberRoleManager,
  Permissions,
  ThreadChannel,
} from 'discord.js'
import { guild } from '../../../lib/config'
import { api } from '../../../lib/api'
import { IGetHelpChanByChannelIdResponse } from '../../../lib/types'

export async function threadCloseCommand(msg: CommandInteraction) {
  const { data: owner } = await api.get<IGetHelpChanByChannelIdResponse>(
    `/helpchan/${msg.channel!.id}`,
  )

  if (
    (owner && owner.user_id === msg.member!.user.id) ||
    // @ts-expect-error
    msg.member?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) ||
    // @ts-expect-error
    msg.member?.roles.cache.has(guild.roles.maintainer)
  ) {
    await msg.reply({
      content: 'Channel is starting closing 🙇‍♂️',
      ephemeral: true,
    })

    const roleManger = msg.member?.roles as GuildMemberRoleManager
    await roleManger.remove(guild.roles.helpCooldown)

    await api.delete(`/helpchan/${msg.channel!.id}`)

    return await (msg.channel as ThreadChannel).setArchived(
      true,
      'Closed by user',
    )
  } else {
    return msg.reply({
      content: ':warning: you have to be the asker to close the channel.',
      ephemeral: true,
    })
  }
}
