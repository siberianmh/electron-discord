import { LunaworkClient, listener } from 'lunawork'
import { Message } from 'discord.js'
import { MailBase } from './base'

export class MailUser extends MailBase {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  @listener({ event: 'message' })
  public async onNewMail(msg: Message) {
    if (msg.author.bot || !msg.member || msg.channel.type !== 'dm') {
      return
    }
  }
}
