import { LunaworkClient, optional } from 'lunawork'
import { DateTime } from 'luxon'
import { Message, MessageEmbed, User, Permissions } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { extendedCommand } from '../../lib/extended-command'
import * as constants from '../../lib/config'

export class InformationModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  /**
   * Returns an embed full of server information.
   */
  @extendedCommand({
    aliases: ['server_info', 'server-info', 'guild', 'guild_info'],
  })
  public async serverInfo(msg: Message) {
    const created = DateTime.fromJSDate(msg.guild!.createdAt).toRelative()
    const features = msg.guild?.features.join(', ') ?? 'No features'

    const roles = msg.guild?.roles.valueOf().size
    const member_count = msg.guild?.memberCount

    const eInvite = await this.client.fetchInvite(constants.guild.invite)
    const onlinePresence = eInvite.presenceCount
    const offlinePresence = eInvite.memberCount - onlinePresence

    const embed = new MessageEmbed()
      .setDescription(
        `
**Server information**
Created: ${created}
Features: ${features}

**Member counts**
Members: ${member_count}
Roles: ${roles}

**Member statuses**
${constants.style.emojis.statusOnline} ${onlinePresence}
${constants.style.emojis.statusOffline} ${offlinePresence}
`,
      )
      .setThumbnail(msg.guild?.iconURL({ dynamic: false }) || '')

    return msg.channel.send({ embeds: [embed] })
  }

  /**
   * Creates an embed containing information on the `user`.
   */
  @extendedCommand({ aliases: ['user-info'] })
  public async user(msg: Message, @optional user: User) {
    if (!user) {
      user = msg.author
    } else if (
      user !== msg.author &&
      !msg.member!.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)
    ) {
      return await msg.channel.send({
        content: 'You may not use this command on users other than yourself.',
      })
    }

    const created = DateTime.fromJSDate(user.createdAt).toRelative()

    const userInformation = {
      name: 'User Information',
      value: `Created: ${created}\nProfile: <@${user.id}>\nID: ${user.id}`,
    }

    const embed = new MessageEmbed()
      .setTitle(user.tag)
      .addField(userInformation.name, userInformation.value)
      .setThumbnail(user.displayAvatarURL({ dynamic: false }) || '')

    return msg.channel.send({ embeds: [embed] })
  }
}
