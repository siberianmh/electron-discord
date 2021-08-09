import { LunaworkClient /* slashCommand */ } from '@siberianmh/lunawork'
// import { Message, MessageEmbed } from 'discord.js'
// import { urls } from '../../lib/config'
import { ExtendedModule } from '../../lib/extended-module'

// TODO: not really want to take a slot for this 🥲
export class SourceModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  /**
   * Display information and a GitHub link to the source code.
   */
  // @slashCommand({
  //   description: 'Display information and a GitHub link to the source code',
  // })
  // public async source(msg: Message) {
  //   const embed = new MessageEmbed()
  //     .setTitle('Bot GitHub Repository')
  //     .addField(
  //       'Electron Discord Repository',
  //       `[Go to GitHub](${urls.githubBotURL})`,
  //     )
  //     .setThumbnail('https://avatars0.githubusercontent.com/u/30377152')

  //   return msg.channel.send({ embeds: [embed] })
  // }
}
