import { default as CookiecordClient } from 'cookiecord'
import { Message } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
// TODO: add auto kicking of 2 times
// import { redis, rblxDownloadCounter } from '../../lib/redis'
import { extendedCommand } from '../../lib/extended-command'
import { ModLogModule } from '../moderation/modlog'
import { createSelfDestructMessage } from '../../lib/self-destruct-messages'

export class DownloadModule extends ExtendedModule {
  private modlog: ModLogModule

  public constructor(client: CookiecordClient) {
    super(client)

    this.modlog = new ModLogModule(client)
  }

  private DOWNLOAD_MESSAGE =
    'So you have been write this command in waiting to get the download link to Roblox Electron Exploit. However this is server for Electron JavaScript framework (<https://electronjs.org>), we awaiting that you just leave and start more deeper searching.'

  @extendedCommand({ aliases: ['dwnload', 'dowload'] })
  public async download(msg: Message) {
    try {
      await msg.author.send(this.DOWNLOAD_MESSAGE)
    } catch (e) {
      await createSelfDestructMessage(msg, this.DOWNLOAD_MESSAGE)
    }

    return
  }
}
