import { LunaworkClient, Stage } from 'lunawork'

export class MailBase extends Stage {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  public CHANNEL_PREFIX: string = 'mm-'
}
