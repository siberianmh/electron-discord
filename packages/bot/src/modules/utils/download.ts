import { default as CookiecordClient } from 'cookiecord'
import { Message } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
// TODO: add auto kicking of 2 times
// import { redis, rblxDownloadCounter } from '../../lib/redis'
import { extendedCommand } from '../../lib/extended-command'
import { createSelfDestructMessage } from '../../lib/self-destruct-messages'

export class DownloadModule extends ExtendedModule {
  public constructor(client: CookiecordClient) {
    super(client)
  }

  private DOWNLOAD_MESSAGE = `⚠⚠⚠ PLEASE READ THIS BEFORE WRITING ANYTHING ⚠⚠⚠

So you write this command in waiting to get a download link to Roblox Electron Exploit. However, this is a server for the Electron JavaScript framework (<https://electronjs.org>).

You didn't find any links or resources on how to download or use this software on this server, we expect you just leave.

⚠⚠⚠ USING AND SHARING EXPLOITS VIOLATES THE TOS OF DISCORD, YOU HAS A RISK OF BAN ⚠⚠⚠`

  @extendedCommand({
    aliases: [
      'dwnload',
      'dowload',
      'dowland',
      'downlaod',
      'downlpad',
      'downlad',
    ],
  })
  public async download(msg: Message) {
    try {
      await msg.author.send(this.DOWNLOAD_MESSAGE)
    } catch (e) {
      await createSelfDestructMessage(msg, this.DOWNLOAD_MESSAGE)
    }

    return await msg.delete({ reason: 'Nothing to search here' })
  }
}
