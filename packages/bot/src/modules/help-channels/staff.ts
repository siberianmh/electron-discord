import { LunaworkClient } from '@siberianmh/lunawork'
import { isMessage, optional, slashCommand } from '@siberianmh/lunawork'
import {
  Message,
  Guild,
  CommandInteraction,
  GuildMember,
  TextChannel,
  MessageEmbed,
} from 'discord.js'
import { extendedCommand } from '../../lib/extended-command'
import { isTrustedMember, noAuthorizedClaim, noDM } from '../../lib/inhibitors'
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
  @extendedCommand({
    inhibitors: [noAuthorizedClaim, noDM],
    aliases: ['take'],
  })
  @slashCommand({
    description: 'Claim a someone message into the help channel',
    options: [
      {
        name: 'user',
        description: 'The user itself',
        type: 'USER',
        required: true,
      },
    ],
  })
  public async claim(
    msg: Message | CommandInteraction,
    @optional member: GuildMember,
  ) {
    // Currently it's not possible due to discord limitation
    // ref: https://github.com/discord/discord-api-docs/issues/2714
    if (isMessage(msg)) {
      if (msg.reference && msg.reference.messageId) {
        const refMessage = await msg.channel.messages.fetch(
          msg.reference.messageId,
        )
        return this.claimBase({
          msg: refMessage,
          member: refMessage.member!,
          replyClaim: true,
        })
      }
    }

    if (!member) {
      return this.sendToChannel(
        msg,
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
        (channel) => channel.parentId === guild.categories.helpAvailable,
      )
      .filter((channel) => channel.name.startsWith(this.CHANNEL_PREFIX))

    const { data: ongoing } = await this.api.get<IListHelpChannelsRespone>(
      '/helpchan',
    )

    const dormant = msg
      .guild!.channels.cache.filter(
        (channel) => channel.parentId === guild.categories.helpDormant,
      )
      .filter((channel) => channel.name.startsWith(this.CHANNEL_PREFIX))

    return msg.channel.send({
      embeds: [
        helpChannelStatusEmbed(this.client, msg, available, ongoing, dormant),
      ],
    })
  }

  // Create help channel
  private async createChannel(msg: Message, args: Array<string>) {
    const channelName = args[1]

    if (!channelName) {
      return msg.channel.send({
        content: `⚠ Expected 1 argument, but got ${args.length}`,
      })
    }

    const created = await this.createHelpChannel(msg.guild!, channelName)
    return msg.channel.send({
      content: `Successfully created <#${created.id}> channel`,
    })
  }

  // Show help
  private async showHelp(msg: Message) {
    const embed = new MessageEmbed()
      .setAuthor(
        msg.guild!.name,
        msg.guild?.iconURL({ dynamic: false }) || undefined,
      )
      .setTitle('📝 Help Channels Management')
      .addField(
        '**Commands**',
        '`create <channelName>` ► Create the new help channel with the specific name\n`status` ► Show the current status of help channels\n`update` ► Update the topic of help channels\n`sync` ► Fix possible errors during downtimes.',
      )
      .setFooter(
        this.client.user!.username,
        this.client.user?.displayAvatarURL(),
      )
      .setTimestamp()

    return msg.channel.send({ embeds: [embed] })
  }

  private async createHelpChannel(guild: Guild, channelName: string) {
    const channel = await guild.channels.create(`help-${channelName}`, {
      type: 'GUILD_TEXT',
      topic:
        'This is a help channel. You can claim own your own help channel in the Help: Available category.',
      reason: 'Maintain help channel goal',
      parent: config.guild.categories.helpAvailable,
    })

    // Channel should already be in ask, but sync permissions
    await this.moveChannel(channel, config.guild.categories.helpAvailable)
    await channel.send({ embeds: [availableEmbed] })

    return channel
  }

  private async claimBase({
    msg,
    member,
    replyClaim = false,
  }: {
    msg: Message | CommandInteraction
    member: GuildMember
    replyClaim?: boolean
  }) {
    if (member?.user.bot) {
      return this.sendToChannel(
        msg,
        `:warning: I cannot open a help channel for ${member.displayName} because he is a turtle.`,
        { slashOptions: { ephemeral: true } },
      )
    }

    try {
      const { data: helpChannel } =
        await this.api.get<IGetHelpChanByUserIdResponse>(
          `/helpchan/user/${member.id}`,
        )

      if (helpChannel) {
        return this.sendToChannel(
          msg,
          `${member.displayName} already has <#${helpChannel.channel_id}>`,
          { slashOptions: { ephemeral: true } },
        )
      }
    } catch {
      // It's fine because it's that what's we search
    }

    const claimedChannel = msg.guild?.channels.cache.find(
      (channel) =>
        channel.type === 'GUILD_TEXT' &&
        channel.parentId === guild.categories.helpAvailable &&
        channel.name.startsWith(this.CHANNEL_PREFIX),
    ) as TextChannel | undefined

    if (!claimedChannel) {
      return this.sendToChannel(
        msg,
        ':warning: failed to claim a help channel, no available channels is found.',
        { slashOptions: { ephemeral: true } },
      )
    }

    let msgContent = ''
    if (replyClaim && isMessage(msg)) {
      msgContent = msg.cleanContent
      await reactAsSelfDesturct(msg)
    } else {
      const channelMessage = await (msg.channel as TextChannel).messages.fetch({
        limit: 50,
      })
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
      embeds: [
        new MessageEmbed()
          .setAuthor(
            member.displayName,
            member.user.displayAvatarURL({ dynamic: false }),
          )
          .setDescription(msgContent),
      ],
    })

    await toPin.pin()
    await this.addCooldown(member)
    await this.moveChannel(claimedChannel, guild.categories.helpOngoing)
    await this.populateHelpChannel(member, claimedChannel, toPin)
    await claimedChannel.send({
      content: `${member.user} this channel has been claimed for your question. Please review <#${guild.channels.askHelpChannel}> for how to get help`,
    })

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

    return await msg.channel.send({ embeds: [embed] })
  }

  private async syncChannels(msg: Message) {
    await this.ensureAskChannels(msg.guild!)
    await this.syncHowToGetHelp(msg.guild!)
    return msg.channel.send({
      content: 'Help Channel System successfully synced',
    })
  }
}
