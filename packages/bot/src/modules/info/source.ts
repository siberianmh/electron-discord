import { LunaworkClient } from '@siberianmh/lunawork'
import { Message, MessageEmbed } from 'discord.js'
import { urls } from '../../lib/config'
import { ExtendedModule } from '../../lib/extended-module'
import { extendedCommand } from '../../lib/extended-command'

export class SourceModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  //#region Commands
  /**
   * Display information and a GitHub link to the source code.
   */
  @extendedCommand({ aliases: ['src'] })
  public async source(msg: Message) {
    const embed = new MessageEmbed()
      .setTitle('Bot GitHub Repository')
      .addField(
        'Electron Discord Repository',
        `[Go to GitHub](${urls.githubBotURL})`,
      )
      .setThumbnail('https://avatars0.githubusercontent.com/u/30377152')

    return msg.channel.send({ embeds: [embed] })
  }
  //#endregion
}
