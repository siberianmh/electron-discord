import { LunaworkClient, listener } from 'lunawork'
import { Message } from 'discord.js'
import * as fuzz from 'fuzzball'
import { ExtendedModule } from '../../lib/extended-module'
import { createSelfDestructMessage } from '../../lib/self-destruct-messages'

export class DownloadModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  private choices = [
    'download',
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
    'dowloand',
    'verify',
  ]

  private DOWNLOAD_MESSAGE = `⚠⚠⚠ PLEASE READ THIS BEFORE CONTINUING IN THE ELECTRON DISCORD SERVER ⚠⚠⚠

We have detected that you have tried to execute a command related to getting a download link to the Roblox Electron Exploit. However, this is a server for the Electron JavaScript framework (<https://electronjs.org/>).

The members of this server will not help you download the exploit or get information about the exploit, even if you ask.

⚠⚠⚠ USING AND SHARING EXPLOITS VIOLATES THE DISCORD TERMS OF SERVICE AND MAY RESULT IN A DISCORD-WIDE BAN. ⚠⚠⚠`

  @listener({ event: 'message' })
  public async download(msg: Message) {
    if (msg.author && msg.author.bot) {
      return
    }
    const prefix = await this.client.fetchPrefix(msg)
    if (Array.isArray(prefix) && prefix.length === 0) {
      return
    }
    const matchingPrefix = Array.isArray(prefix)
      ? prefix.filter((x) => msg.content.startsWith(x))[0]
      : msg.content.startsWith(prefix!)
      ? prefix
      : undefined

    if (!matchingPrefix) {
      return
    }

    const cmd = msg.content
      .replace(matchingPrefix, '')
      .split(' ')[0]
      .toLowerCase()

    const result = await fuzz.extractAsPromised(cmd, this.choices, {
      scorer: fuzz.token_set_ratio,
    })

    for (const meta of result) {
      if (meta[1] >= 85) {
        try {
          await msg.member?.send(this.DOWNLOAD_MESSAGE)
        } catch {
          await createSelfDestructMessage(msg, this.DOWNLOAD_MESSAGE)
        }

        try {
          return await msg.delete()
        } catch {}
      }
    }

    return
  }
}
