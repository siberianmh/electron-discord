import { LunaworkClient } from '@sib3/lunawork'
import { Message } from 'discord.js'
import { extendedCommand } from '../../lib/extended-command'
import { ExtendedModule } from '../../lib/extended-module'
import { isTrustedMember } from '../../lib/inhibitors'

export class CleanModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  @extendedCommand({ aliases: ['clear'], inhibitors: [isTrustedMember] })
  public async clean(msg: Message) {
    return msg.channel.send('😮')
  }
}
