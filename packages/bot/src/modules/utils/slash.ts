import { LunaworkClient, listener } from 'lunawork'
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
        required: true,
      },
    ],
  }

  private CLOSE_COMMAND: ApplicationCommandData = {
    name: 'close',
    description: 'Close the active help channel',
  }

  private async registerSlash(command: ApplicationCommandData) {
    if (process.env.NODE_ENV === 'development') {
      return await this.client.guilds.cache
        .get(guild.id)
        ?.commands.create(command)
    } else {
      return await this.client.application?.commands.create(command)
    }
  }

  @listener({ event: 'ready' })
  public async registerSlashCommands() {
    await this.registerSlash(this.DOCS_COMMAND)
    await this.registerSlash(this.CLOSE_COMMAND)
  }
}
