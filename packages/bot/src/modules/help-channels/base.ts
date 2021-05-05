import { default as CookiecordClient } from 'cookiecord'
import { TextChannel, ChannelData } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { helpChannels } from '../../lib/config'

export class HelpChanBase extends ExtendedModule {
  public constructor(client: CookiecordClient) {
    super(client)
  }

  protected CHANNEL_PREFIX = helpChannels.namePrefix

  protected async moveChannel(channel: TextChannel, category: string) {
    const parent = channel.guild.channels.resolve(category)
    if (parent === null) {
      return
    }

    this.logger.info(
      `Moving #${channel.name} (${channel.id}) to the ${parent.name} category`,
    )
    const data: ChannelData = {
      parentID: parent.id,
      permissionOverwrites: parent.permissionOverwrites,
    }
    return await channel.edit(data)
  }
}
