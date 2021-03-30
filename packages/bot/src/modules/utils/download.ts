import { default as CookiecordClient } from 'cookiecord'
import { Message } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { extendedCommand } from '../../lib/extended-command'
import { createSelfDestructMessage } from '../../lib/self-destruct-messages'

export class DownloadModule extends ExtendedModule {
  public constructor(client: CookiecordClient) {
    super(client)
  }

  private DOWNLOAD_MESSAGE = `⚠⚠⚠ PLEASE READ THIS BEFORE CONTINUING IN THE ELECTRON DISCORD SERVER ⚠⚠⚠

We have detected that you have tried to execute a command related to getting a download link to the Roblox Electron Exploit. However, this is a server for the Electron JavaScript framework (<https://electronjs.org/>).

The members of this server will not help you download the exploit or get information about the exploit, even if you ask.

⚠⚠⚠ USING AND SHARING EXPLOITS VIOLATES THE DISCORD TERMS OF SERVICE AND MAY RESULT IN A DISCORD-WIDE BAN. ⚠⚠⚠`

  @extendedCommand({
    aliases: [
      'dwnload',
      'dowload',
      'dowland',
      'downlaod',
      'downlpad',
      'downlad',
      'downloads',
      'downlands',
      'dowlaud',
      'dowlaid',
    ],
  })
  public async download(msg: Message) {
    try {
      await msg.author.send(this.DOWNLOAD_MESSAGE)
    } catch {
      await createSelfDestructMessage(msg, this.DOWNLOAD_MESSAGE)
    }

    return await msg.delete({ reason: 'Nothing to search here' })
  }
}
