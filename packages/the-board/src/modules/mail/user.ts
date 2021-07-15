import { LunaworkClient, listener } from '@siberianmh/lunawork'
import { Message, TextChannel } from 'discord.js'
import { MailBase } from './base'
import { Mail as MailEntity } from '../../entities/mail'
import { guild as guildConfig } from '../../lib/config'
import { userInfoEmbed } from './embeds/user-info'
import { userMessageEmbed } from './embeds/message'
import { toBigIntLiteral } from '../../lib/to-bigint-literal'

export class MailUser extends MailBase {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  @listener({ event: 'message' })
  public async onNewMail(msg: Message) {
    if (msg.author.bot || msg.channel.type !== 'DM') {
      return
    }

    const mail = await MailEntity.findOne({ where: { user_id: msg.author.id } })

    if (mail) {
      return this.continueTheChannel(msg, mail)
    } else {
      return this.createTheChannel(msg)
    }
  }

  private async continueTheChannel(msg: Message, mail: MailEntity) {
    const channel = (
      await this.client.guilds.fetch(guildConfig.id)
    ).channels.cache.get(toBigIntLiteral(mail.channel_id)) as TextChannel

    if (!channel) {
      return
    }

    return channel.send({ embeds: [userMessageEmbed(msg)] })
  }

  private async createTheChannel(msg: Message) {
    const guild = this.client.guilds.cache.get(guildConfig.id)
    if (!guild) {
      // TODO: Do something
      return
    }

    const channelName = `${this.CHANNEL_PREFIX}-${msg.author.username}-${msg.author.discriminator}`
    const channel = await guild.channels.create(channelName, {
      parent: guildConfig.categories.modMail,
      reason: 'Someone search for help',
      topic:
        "This is a Mod Mail Channel. This channel doesn't be closed automatically, and should be closed by `/mmclose` command",
    })

    const entity = MailEntity.create({
      channel_id: channel.id,
      channel_name: channelName,
      user_id: msg.author.id,
    })

    await entity.save()

    const member = await guild.members.fetch(msg.author.id)

    await channel.send({
      content:
        '👋 here Someone is requesting help from the Moderation team. Please notice that these channels will not be closed automatically, and have a specific amount of active channels. For closing the channel you can use the `/mm-close` command. All messages that start with `-` will be skipped and can be used for internal discussion. For now, all messages are not saved, in the future, all messages will be saved for future investigation. Thanks for reading and good luck 🙏',
    })
    await channel.send({ embeds: [userInfoEmbed(member)] })
    return await channel.send({ embeds: [userMessageEmbed(msg)] })
  }
}
