import { optional, default as CookiecordClient } from 'cookiecord'
import { Message, MessageEmbed } from 'discord.js'
// import { assertNever } from '../../lib/fatal-error'
import { createSelfDestructMessage } from '../../lib/self-destruct-messages'
import { extendedCommand } from '../../lib/extended-command'
import { ExtendedModule } from '../../lib/extended-module'

type ElectronList = 'electron' | 'e'
type ResourcesList = 'fiddle' | 'forge' | ElectronList

export class ResourcesModule extends ExtendedModule {
  public constructor(client: CookiecordClient) {
    super(client)
  }

  @extendedCommand({ aliases: ['r'] })
  public async resources(msg: Message, @optional arg: ResourcesList) {
    switch (arg) {
      case 'fiddle':
        return this.getFiddleInfo(msg)
      case 'forge':
        return this.getForgeInfo(msg)
      default:
        // assertNever(arg, `${arg} is not implemented`)
        return await this.listOfResources(msg)
    }
  }

  private async getFiddleInfo(msg: Message) {
    const embed = this.createEmbed({
      title: 'Electron Fiddle',
      thumbnail:
        'https://raw.githubusercontent.com/electron/fiddle/master/assets/icons/fiddle.png',
      description:
        'Electron Fiddle lets you create and play with small Electron experiments. It greets you with a quick-start template after opening – change a few things, choose the version of Electron you want to run it with, and play around. Then, save your Fiddle either as a GitHub Gist or to a local folder. Once pushed to GitHub, anyone can quickly try your Fiddle out by just entering it in the address bar.\n\n[Learn more](https://electronjs.org/fiddle)',
    })

    return createSelfDestructMessage(msg, embed)
  }

  private async getForgeInfo(msg: Message) {
    const embed = this.createEmbed({
      title: 'Electron Forge',
      description:
        'Electron Forge is a complete tool for creating, publishing, and installing modern Electron applications.\n\n[Learn More](https://electronforge.io)',
    })

    return createSelfDestructMessage(msg, embed)
  }

  private createEmbed({
    title,
    description,
    thumbnail,
  }: {
    title: string
    thumbnail?: string
    description: string
  }) {
    const embed = new MessageEmbed().setTitle(title).setDescription(description)

    if (thumbnail) {
      embed.setThumbnail(thumbnail)
    }

    return embed
  }

  private async listOfResources(msg: Message) {
    const embed = new MessageEmbed()
      .setTitle('Resources [Experimental]')
      .addField('`fiddle`', 'Return the information about Electron Fiddle')
      .addField('`forge`', 'Return the infromation about Electron Forge')
      .addField(
        '`electron` (`e`)',
        'Return the information about Electron itself',
      )

    return msg.channel.send({ embed })
  }
}
