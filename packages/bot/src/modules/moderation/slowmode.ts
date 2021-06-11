import { LunaworkClient } from 'lunawork'
import { Message, TextChannel } from 'discord.js'
import * as humanizeDuration from 'humanize-duration'
import parse from 'parse-duration'
import { ExtendedModule } from '../../lib/extended-module'
import { extendedCommand } from '../../lib/extended-command'
import { isTrustedMember } from '../../lib/inhibitors'
import { splittyArgs } from '../../lib/split-args'

export class SlowmodeModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  @extendedCommand({
    aliases: ['sm'],
    inhibitors: [isTrustedMember],
    single: true,
  })
  public async slowmode(msg: Message, args: string) {
    const splitArgs = splittyArgs(args)
    if (splitArgs.length === 0) {
      return await msg.channel.send({ content: ':warning: invalid syntax' })
    }

    switch (splitArgs[0]) {
      case 'get':
        return this.getSlowmode(msg)
      case 'set':
        return this.setSlowmode(msg, splitArgs[1])
      case 'reset':
        return this.setSlowmode(msg, '0s')
    }

    return
  }

  private async getSlowmode(msg: Message) {
    const humanized = humanizeDuration(
      (msg.channel as TextChannel).rateLimitPerUser * 1000,
    )

    return await msg.channel.send({
      content: `The slowmode delay for <#${msg.channel.id}> is ${humanized}`,
    })
  }

  private async setSlowmode(msg: Message, seconds: string) {
    const maxDur = parse('6h')
    const dur = parse(seconds)

    if (!maxDur || dur! > maxDur) {
      return await msg.channel.send({
        content: 'The slowmode delay must be between 0 and 6 hours.',
      })
    }

    await (msg.channel as TextChannel).edit({
      rateLimitPerUser: dur! / 1000,
    })

    return msg.channel.send({
      content: `The slowmode for <#${msg.channel.id}> is now ${seconds}.`,
    })
  }
}
