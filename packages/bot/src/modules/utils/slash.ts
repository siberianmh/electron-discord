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

  private TAGS_COMMAND: ApplicationCommandData = {
    name: 'tags',
    description: 'Get the useful information about Electron world',
    options: [
      {
        name: 'resource',
        description: 'A world which you want to see',
        type: 'STRING',
        required: true,
        choices: [
          {
            name: 'Electron',
            value: 'electron',
          },
          {
            name: 'Fiddle',
            value: 'fiddle',
          },
        ],
      },
    ],
  }

  private CLOSE_COMMAND: ApplicationCommandData = {
    name: 'close',
    description: 'Close the active help channel',
  }

  private CLAIM_COMMAND: ApplicationCommandData = {
    name: 'claim',
    description: 'Take some user message to the help channel',
    options: [
      {
        name: 'user',
        description: 'The user itself',
        type: 'USER',
        required: true,
      },
    ],
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
    await this.registerSlash(this.TAGS_COMMAND)
    await this.registerSlash(this.CLAIM_COMMAND)
  }
}
