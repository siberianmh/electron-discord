// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import {
  LunaworkClient,
  applicationCommand,
  ApplicationCommandOptionType,
  ApplicationCommandTypes,
} from '@siberianmh/lunawork'
import {
  Guild,
  Message,
  CommandInteraction,
  GuildMember,
  TextChannel,
  MessageEmbed,
  ContextMenuInteraction,
  GuildMemberRoleManager,
} from 'discord.js'
import { isTrustedMember, noAuthorizedClaim, noDM } from '../../lib/inhibitors'
import { guild } from '../../lib/config'
import * as config from '../../lib/config'
import { HelpChanBase } from './base'
import { availableEmbed } from './embeds/available'
import { helpChannelStatusEmbed } from './embeds/status'
import { Subcommands } from './subcommands'
import { HelpChannel } from '../../entities/help-channel'

/**
 * That class contains the interactions (commands, etc) that can be only
 * used by the admin team. There shouldn't be stored commands that can
 * be executed by standard members, except `/helpchan cooldown`
 */
export class HelpChannelStaff extends HelpChanBase {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  //#region Commands
  @applicationCommand({
    name: 'Claim Message',
    type: ApplicationCommandTypes.MESSAGE,
    inhibitors: [noAuthorizedClaim],
  })
  public async claimContextMenu(msg: ContextMenuInteraction) {
    const targetMessage = msg.options.getMessage('message')

    if (!targetMessage) {
      return msg.reply({
        content: 'Something goes wrong',
        ephemeral: true,
      })
    }

    if (
      !(targetMessage instanceof Message) ||
      !(targetMessage.member instanceof GuildMember)
    ) {
      return msg.reply({ content: 'Something goes wrong', ephemeral: true })
    }

    return this.claimBase({
      member: targetMessage.member!,
      replyMsg: targetMessage,
      msg: msg,
    })
  }

  @applicationCommand({
    description: 'Claim a someone message into the help channel',
    options: [
      {
        name: 'user',
        description: 'The user itself',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'limit',
        type: ApplicationCommandOptionType.Number,
        description:
          'The limit of messages which needed to be claimed (default to 10)',
      },
    ],
    inhibitors: [noAuthorizedClaim, noDM],
  })
  public async claim(
    msg: CommandInteraction,
    { user: member, limit }: { user: GuildMember; limit?: number },
  ) {
    return await this.claimBase({ msg: msg, member: member, limit })
  }

  @applicationCommand({
    name: 'helpchan',
    description: 'The single command to maintain help channels',
    options: [
      {
        type: 1,
        name: 'status',
        description: 'Get the status of the help channels',
      },
      {
        type: 1,
        name: 'cooldown',
        description: 'Check if you are has an cooldown',
      },
      {
        type: 1,
        name: 'create',
        description: 'Create the help channel',
        options: [
          {
            type: 3,
            name: 'name',
            description: 'The name of the channel, without `help-` prefix',
            required: true,
          },
        ],
      },
      {
        type: 1,
        name: 'update',
        description: 'Update the help channels',
      },
      {
        type: 1,
        name: 'sync',
        description: 'Synchronize the help channels to the current status',
      },
    ],
  })
  public async helpchan(
    msg: CommandInteraction,
    { subCommand, ...props }: { subCommand: Subcommands },
  ) {
    const value = Object.values(props)[0]
    if (subCommand === 'cooldown') {
      return await this.fixOrTrustCooldown(msg)
    }

    const forbidden = await isTrustedMember(msg, this.client)
    if (forbidden) {
      return msg.reply({
        // @ts-expect-error
        content: forbidden,
        ephemeral: true,
      })
    }

    switch (subCommand) {
      case 'status':
        return await this.showStatus(msg)
      case 'create':
        return await this.createChannel(msg, value)
      case 'update':
        return await this.updateHelpChannels(msg)
      case 'sync':
        return await this.syncChannels(msg)
      default:
        return msg.reply({ content: 'Uh okay.', ephemeral: true })
    }
  }
  //#endregion

  // List the status of help channels
  private async showStatus(msg: CommandInteraction) {
    const available = msg
      .guild!.channels.cache.filter(
        (channel) => channel.parentId === guild.categories.helpAvailable,
      )
      .filter((channel) => channel.name.startsWith(this.CHANNEL_PREFIX))

    const ongoing = await HelpChannel.find()

    const dormant = msg
      .guild!.channels.cache.filter(
        (channel) => channel.parentId === guild.categories.helpDormant,
      )
      .filter((channel) => channel.name.startsWith(this.CHANNEL_PREFIX))

    return msg.reply({
      embeds: [
        helpChannelStatusEmbed(this.client, msg, available, ongoing, dormant),
      ],
    })
  }

  // Create help channel
  private async createChannel(msg: CommandInteraction, channelName: string) {
    const created = await this.createHelpChannel(msg.guild!, channelName)

    return msg.reply({
      content: `Successfully created <#${created.id}> channel`,
    })
  }

  private async createHelpChannel(guild: Guild, channelName: string) {
    const channel = await guild.channels.create(`help-${channelName}`, {
      type: 'GUILD_TEXT',
      topic:
        'This is a help channel. You can claim own your own help channel in the Help: Open category.',
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
    limit = 10,
    replyMsg,
  }: {
    msg: CommandInteraction | ContextMenuInteraction
    member: GuildMember
    limit?: number
    replyMsg?: Message
  }): Promise<void> {
    if (member?.user.bot) {
      return msg.reply({
        content: `:warning: I cannot open a help channel for ${member.displayName} because he is a turtle.`,
        ephemeral: true,
      })
    }

    const helpChannel = await HelpChannel.findOne({
      where: { user_id: member.id },
    })

    if (helpChannel) {
      return msg.reply({
        content: `${member.displayName} already has <#${helpChannel.channel_id}>`,
        ephemeral: true,
      })
    }

    const claimedChannel = msg.guild?.channels.cache.find(
      (channel) =>
        channel.type === 'GUILD_TEXT' &&
        channel.parentId === guild.categories.helpAvailable &&
        channel.name.startsWith(this.CHANNEL_PREFIX),
    ) as TextChannel | undefined

    if (!claimedChannel) {
      return msg.reply({
        content:
          ':warning: failed to claim a help channel, no available channels is found.',
        ephemeral: true,
      })
    }

    let msgContent = ''
    if (replyMsg) {
      msgContent = replyMsg.cleanContent
    } else {
      const channelMessage = await (msg.channel as TextChannel).messages.fetch({
        limit: 50,
      })
      const questionMessages = channelMessage.filter(
        (questionMsg) =>
          questionMsg.author.id === member.id && questionMsg.id !== msg.id,
      )

      msgContent = [...questionMessages.values()]
        .slice(0, limit)
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

    await msg.reply({
      content: `🙇‍♂️ Successfully claimed ${claimedChannel}`,
      ephemeral: true,
    })

    await this.ensureAskChannels(msg.guild!)
    await this.syncHowToGetHelp(msg.guild!)

    return
  }

  private async updateHelpChannels(msg: CommandInteraction) {
    const helpChannels = [
      ...msg
        .guild!.channels.cache.filter((channel) =>
          channel.name.startsWith(this.CHANNEL_PREFIX),
        )
        .values(),
    ]

    for (const channel of helpChannels) {
      await channel.edit(
        {
          topic:
            'This is a help channel. You can claim your own help channel in the Help: Open category.',
        },
        'Maintain help channel goal',
      )
    }

    const embed = new MessageEmbed()
      .setTitle('✅ Successfully updated')
      .setDescription('Help Channels topic successfully updated')

    return await msg.reply({ embeds: [embed] })
  }

  private async syncChannels(msg: CommandInteraction) {
    await this.ensureAskChannels(msg.guild!)
    await this.syncHowToGetHelp(msg.guild!)

    const content = 'Help Channel system successfully synced'
    return msg.reply({
      content,
    })
  }

  private async fixOrTrustCooldown(msg: CommandInteraction) {
    const memberRoleManagger = msg.member?.roles as GuildMemberRoleManager

    if (!memberRoleManagger.cache.has(config.guild.roles.helpCooldown)) {
      return msg.reply({
        content: `<@${msg.member?.user.id}> doesn't have a cooldown`,
      })
    }

    const channel = await HelpChannel.findOne({
      where: { user_id: msg.member.user.id },
    })

    if (channel) {
      return msg.reply({
        content: `<@${msg.member?.user.id}> has an active help channel: <#${channel.channel_id}>`,
      })
    }

    await memberRoleManagger.remove(config.guild.roles.helpCooldown)
    return msg.reply({
      content: 'Cooldown successfully removed',
    })
  }
}
