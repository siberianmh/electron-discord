import { LunaworkClient /* slashCommand */ } from '@siberianmh/lunawork'
// import { Message } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
// import { isTrustedMember } from '../../lib/inhibitors'

// TODO: Create in some moment of time
export class CleanModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  /*
  @slashCommand({
    description: 'Clean the stress from the channel',
    inhibitors: [isTrustedMember],
  })
  public async clean(msg: Message) {
    return msg.channel.send({ content: '😮' })
  }
  */
}
