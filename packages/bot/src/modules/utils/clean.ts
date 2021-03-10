import { default as CookiecordClient } from 'cookiecord'
import { Message } from 'discord.js'
import { extendedCommand } from '../../lib/extended-command'
import { ExtendedModule } from '../../lib/extended-module'
import { isTrustedMember } from '../../lib/inhibitors'

export class CleanModule extends ExtendedModule {
  public constructor(client: CookiecordClient) {
    super(client)
  }

  @extendedCommand({ aliases: ['clear'], inhibitors: [isTrustedMember] })
  public async clean(msg: Message) {
    return msg.channel.send('😮')
  }
}
