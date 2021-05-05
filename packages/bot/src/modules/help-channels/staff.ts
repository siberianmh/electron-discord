import { default as CookiecordClient } from 'cookiecord'
import { Message, Guild } from 'discord.js'
import { extendedCommand } from '../../lib/extended-command'
import { isTrustedMember } from '../../lib/inhibitors'
import { splittyArgs } from '../../lib/split-args'
import { guild } from '../../lib/config'
import * as config from '../../lib/config'
import { HelpChanBase } from './base'
import { IListHelpChannelsRespone } from '../../lib/types'
import { availableEmbed } from './embeds/available'
import { helpChannelStatusEmbed } from './embeds/status'

export class HelpChannelStaff extends HelpChanBase {
  public constructor(client: CookiecordClient) {
    super(client)
  }

  @extendedCommand({
    inhibitors: [isTrustedMember],
    single: true,
  })
  public async helpchan(msg: Message, rawArgs: string) {
    const args = splittyArgs(rawArgs)

    if (args.length <= 0) {
      return this.showHelp(msg)
    }

    const cmd = args[0]

    switch (cmd) {
      // List the status of help channels
      case 'status':
        return await this.showStatus(msg)
      case 'create':
        return await this.createChannel(msg, args)
      case 'help':
      default:
        return this.showHelp(msg)
    }
  }

  // List the status of help channels
  private async showStatus(msg: Message) {
    const available = msg
      .guild!.channels.cache.filter(
        (channel) => channel.parentID === guild.categories.helpAvailable,
      )
      .filter((channel) => channel.name.startsWith(this.CHANNEL_PREFIX))

    const { data: ongoing } = await this.api.get<IListHelpChannelsRespone>(
      '/helpchan',
    )

    const dormant = msg
      .guild!.channels.cache.filter(
        (channel) => channel.parentID === guild.categories.helpDormant,
      )
      .filter((channel) => channel.name.startsWith(this.CHANNEL_PREFIX))

    return msg.channel.send({
      embed: helpChannelStatusEmbed(
        this.client,
        msg,
        available,
        ongoing,
        dormant,
      ),
    })
  }

  // Create help channel
  private async createChannel(msg: Message, args: Array<string>) {
    const channelName = args[1]

    if (!channelName) {
      return msg.channel.send(`⚠ Expected 1 argument, but got ${args.length}`)
    }

    const created = await this.createHelpChannel(msg.guild!, channelName)
    return msg.channel.send(`Successfully created <#${created.id}> channel`)
  }

  // Show help
  private async showHelp(msg: Message) {
    return msg.channel.send('Soon 😐')
  }

  private async createHelpChannel(guild: Guild, channelName: string) {
    const channel = await guild.channels.create(`help-${channelName}`, {
      type: 'text',
      topic:
        'This is a help channel. You can claim own your own help channel in the Help: Available category.',
      reason: 'Maintain help channel goal',
      parent: config.guild.categories.helpAvailable,
    })

    // Channel should already be in ask, but sync permissions
    await this.moveChannel(channel, config.guild.categories.helpAvailable)
    await channel.send({ embed: availableEmbed })

    return channel
  }
}
