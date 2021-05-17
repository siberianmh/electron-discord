import { LunaworkClient, listener, command } from 'lunawork'
import { Message } from 'discord.js'
import { MailBase } from './base'
import { guild } from '../../lib/config'

export class MailStaff extends MailBase {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  @listener({ event: 'message' })
  public async onNewResponse(msg: Message) {
    if (
      msg.author.bot ||
      !msg.guild ||
      !msg.member ||
      msg.channel.type !== 'text' ||
      !msg.channel.parentID ||
      msg.channel.parentID !== guild.categories.modMail ||
      !msg.channel.name.startsWith(this.CHANNEL_PREFIX)
    ) {
      return
    }

    const prefixes = await this.client.fetchPrefix(msg)
    const parsed = this.getPrefix(msg.content, prefixes)

    if (parsed) {
      return
    }

    return
  }

  @command({ aliases: ['mm-close'] })
  public async mmclose(msg: Message) {
    console.log(msg)
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
