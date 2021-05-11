import { LunaworkClient, listener } from '@sib3/lunawork'
import { ApplicationCommandData } from 'discord.js'
import { guild } from '../../lib/config'
import { ExtendedModule } from '../../lib/extended-module'

export class SlashModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  private DOCS_COMMAND: ApplicationCommandData = {
    name: 'docs',
    description: 'Get the entry for searched docs',
    options: [
      {
        name: 'entry',
        description: 'Search entry',
        type: 'STRING',
      },
    ],
  }

  @listener({ event: 'ready' })
  public async registerSlashCommands() {
    return await this.client.guilds.cache
      .get(guild.id)
      ?.commands.create(this.DOCS_COMMAND)
  }
}
