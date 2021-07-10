import { LunaworkClient, Stage } from '@siberianmh/lunawork'
import { guild } from '../../lib/config'

export class MailBase extends Stage {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  public CHANNEL_PREFIX: string = guild.modMailChannelPrefix
}
