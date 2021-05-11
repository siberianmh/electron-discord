import { LunaworkClient, optional } from '@sib3/lunawork'
import {
  Message,
  Guild,
  GuildMember,
  TextChannel,
  MessageEmbed,
} from 'discord.js'
import { extendedCommand } from '../../lib/extended-command'
import { isTrustedMember, noDM } from '../../lib/inhibitors'
import { splittyArgs } from '../../lib/split-args'
import { guild } from '../../lib/config'
import * as config from '../../lib/config'
import { HelpChanBase } from './base'
import {
  IGetHelpChanByUserIdResponse,
  IListHelpChannelsRespone,
} from '../../lib/types'
import { availableEmbed } from './embeds/available'
import { helpChannelStatusEmbed } from './embeds/status'
import {
  createSelfDestructMessage,
  reactAsSelfDesturct,
} from '../../lib/self-destruct-messages'
import { Subcommands } from './subcommands'

export class HelpChannelStaff extends HelpChanBase {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  //#region Commands
  @extendedCommand({ inhibitors: [noDM], aliases: ['take'] })
  public async claim(msg: Message, @optional member: GuildMember) {
    // Inhibitor
    if (
      !msg.member?.permissions.has('MANAGE_MESSAGES') &&
      !msg.member?.roles.cache.has(guild.roles.maintainer)
    ) {
      return msg.channel.send(
        `Hello <@${msg.author.id}>, however, this command is can be only used by the moderation team, if you are searching for help you can read the guide at <#${guild.channels.askHelpChannel}> channel, and claim a channel from the \`Help: Available\` category.`,
      )
    }

    if (msg.reference && msg.reference.messageID) {
      const refMessage = await msg.channel.messages.fetch(
        msg.reference.messageID,
      )
      return this.claimBase({
        msg: refMessage,
        member: refMessage.member!,
        replyClaim: true,
      })
    }

    if (!member) {
      return msg.channel.send(
        ':warning: Member in this case is required parameter.',
      )
    }

    return await this.claimBase({ msg: msg, member: member })
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

    const cmd = args[0] as Subcommands

    switch (cmd) {
      // List the status of help channels
      case 'status':
        return await this.showStatus(msg)
      case 'create':
        return await this.createChannel(msg, args)
      case 'update':
        return await this.updateHelpChannels(msg)
      case 'sync':
        return await this.syncChannels(msg)
      case 'help':
      default:
        return await this.showHelp(msg)
    }
  }
  //#endregion

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
    const embed = new MessageEmbed()
      .setAuthor(
        msg.guild?.name,
        msg.guild?.iconURL({ dynamic: false }) || undefined,
      )
      .setTitle('📝 Help Channels Management')
      .addField(
        '**Commands**',
        '`create <channelName>` ► Create the new help channel with the specific name\n`status` ► Show the current status of help channels\n`update` ► Update the topic of help channels\n`sync` ► Fix possible errors during downtimes.',
      )
      .setFooter(
        this.client.user?.username,
        this.client.user?.displayAvatarURL(),
      )
      .setTimestamp()

    return msg.channel.send({ embed })
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

  private async claimBase({
    msg,
    member,
    replyClaim = false,
  }: {
    msg: Message
    member: GuildMember
    replyClaim?: boolean
  }) {
    if (msg.author.bot) {
      return await msg.channel.send(
        `:warning:: I cannot open a help channel for ${member.displayName} because he is a turtle.`,
      )
    }

    try {
      const { data: helpChannel } =
        await this.api.get<IGetHelpChanByUserIdResponse>(
          `/helpchan/user/${member.id}`,
        )

      if (helpChannel) {
        return await msg.channel.send(
          `${member.displayName} already has <#${helpChannel.channel_id}>`,
        )
      }
    } catch {
      // It's fine because it's that what's we search
    }

    const claimedChannel = msg.guild?.channels.cache.find(
      (channel) =>
        channel.type === 'text' &&
        channel.parentID === guild.categories.helpAvailable &&
        channel.name.startsWith(this.CHANNEL_PREFIX),
    ) as TextChannel | undefined

    if (!claimedChannel) {
      return await msg.channel.send(
        ':warning: failed to claim a help channel, no available channels found.',
      )
    }

    let msgContent = ''
    if (replyClaim) {
      msgContent = msg.cleanContent
      await reactAsSelfDesturct(msg)
    } else {
      const channelMessage = await msg.channel.messages.fetch({ limit: 50 })
      const questionMessages = channelMessage.filter(
        (questionMsg) =>
          questionMsg.author.id === member.id && questionMsg.id !== msg.id,
      )

      msgContent = questionMessages
        .array()
        .slice(0, 10) // TODO: return the limit
        .map((msg) => msg.cleanContent)
        .reverse()
        .join('\n')
        .slice(0, 2000)
    }

    const toPin = await claimedChannel.send({
      embed: new MessageEmbed()
        .setAuthor(member.displayName, member.user.displayAvatarURL())
        .setDescription(msgContent),
    })

    await toPin.pin()
    await this.addCooldown(member)
    await this.moveChannel(claimedChannel, guild.categories.helpOngoing)
    await this.populateHelpChannel(member, claimedChannel, toPin)
    await claimedChannel.send(
      `${member.user} this channel has been claimed for your question. Please review <#${guild.channels.askHelpChannel}> for how to get help`,
    )

    await createSelfDestructMessage(
      msg,
      `🙇‍♂️ Successfully claimed ${claimedChannel}`,
    )
    await this.ensureAskChannels(msg.guild!)
    return await this.syncHowToGetHelp(msg.guild!)
  }

  private async updateHelpChannels(msg: Message) {
    const helpChannels = msg
      .guild!.channels.cache.filter((channel) =>
        channel.name.startsWith(this.CHANNEL_PREFIX),
      )
      .array()

    for (const channel of helpChannels) {
      await channel.edit(
        {
          topic:
            'This is a help channel. You can claim your own help channel in the Help: Available category.',
        },
        'Maintain help channel goal',
      )
    }

    const embed = new MessageEmbed()
      .setTitle('✅ Successfully updated')
      .setDescription('Help Channels topic successfully updated')

    return await msg.channel.send({ embed })
  }

  private async syncChannels(msg: Message) {
    await this.fixCooldowns(msg.guild!)
    await this.ensureAskChannels(msg.guild!)
    await this.syncHowToGetHelp(msg.guild!)
    return msg.channel.send('Help Channel System successfully synced')
  }
}
