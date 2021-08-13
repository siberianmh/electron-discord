import { LunaworkClient } from '@siberianmh/lunawork'
import { listener, applicationCommand } from '@siberianmh/lunawork'
import { Message, CommandInteraction } from 'discord.js'
import { MailBase } from './base'
import { Mail as MailEntity } from '../../entities/mail'
import { guild } from '../../lib/config'
import { toBigIntLiteral } from '../../lib/to-bigint-literal'

export class MailStaff extends MailBase {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  @listener({ event: 'messageCreate' })
  public async onNewResponse(msg: Message) {
    if (
      msg.author.bot ||
      !msg.guild ||
      !msg.member ||
      msg.channel.type !== 'GUILD_TEXT' ||
      !msg.channel.parentId ||
      msg.channel.parentId !== guild.categories.modMail ||
      !msg.channel.name.startsWith(this.CHANNEL_PREFIX)
    ) {
      return
    }

    const parsed = this.getPrefix(msg.content, ['-', '!', '.'])

    if (parsed) {
      return
    }

    const mailChannel = await MailEntity.findOne({
      where: { channel_id: msg.channel.id },
    })

    if (!mailChannel) {
      return msg.channel.send({
        content: 'Unable to find the channel in the database',
      })
    }

    const recipient = await msg.guild?.members.fetch(
      toBigIntLiteral(mailChannel.user_id),
    )

    try {
      recipient!.send(`**${msg.author.tag}:** ${msg.cleanContent}`)
      return msg.react('✅')
    } catch (err) {
      // TODO: close the channel and send a message
      console.log(err)
      return msg.react('❌')
    }
  }

  @applicationCommand({ description: 'Close the ModMail thread' })
  public async mmclose(msg: CommandInteraction): Promise<Message | void> {
    const mailChannel = await MailEntity.findOne({
      where: { channel_id: msg.channel?.id },
    })

    if (!mailChannel) {
      return msg.reply({
        content: 'Unable to find the channel in the database',
        ephemeral: true,
      })
    }

    const recipient = await msg.guild?.members.fetch(
      toBigIntLiteral(mailChannel.user_id),
    )

    await recipient!.send({
      content:
        'This thread is closed. If your problem is not resolved please try to open a new thread simply by sending a new message.',
    })

    await mailChannel.remove()
    await msg.channel?.delete()
    return
  }

  private getPrefix(content: string, prefixes: Array<string> | string | null) {
    if (prefixes === null) {
      return null
    }

    if (typeof prefixes === 'string') {
      return content.startsWith(prefixes.toLowerCase())
    }

    return (
      prefixes.find((prefix) => content.startsWith(prefix.toLowerCase())) ??
      null
    )
  }
}
