import { default as CookiecordClient, listener, optional } from 'cookiecord'
import {
  ChannelData,
  Collection,
  Guild,
  GuildChannel,
  GuildMember,
  Message,
  MessageEmbed,
  TextChannel,
} from 'discord.js'
import {
  IGetHelpChanByUserIdResponse,
  IGetHelpChanByChannelIdResponse,
  IListHelpChannelsRespone,
} from '../../lib/types'
import { helpChannels, guild } from '../../lib/config'
import * as config from '../../lib/config'
import { isTrustedMember, noDM } from '../../lib/inhibitors'
import { ExtendedModule } from '../../lib/extended-module'
import {
  createSelfDestructMessage,
  reactAsSelfDesturct,
} from '../../lib/self-destruct-messages'
import { Subcommands } from './subcommands'
import { helpMessage } from './help-message'
import { extendedCommand } from '../../lib/extended-command'
import { availableEmbed } from './embeds/available'
import { claimedEmbed } from './embeds/claimed'
import { dormantEmbed } from './embeds/dormant'
import { CloseReason } from '../../lib/types/help-chan'

/**
 * Manage the help channel system of the guild.
 *
 * The system is based on a 3 category system:
 *
 * **Available Category:**
 *
 *  - Contains channels which are ready to be taken by someone who needs help.
 *
 * **In Use Category:**
 *
 *  - Contains all channels which are taken by someone who needing help
 *  - When a channel becomes dormant, and embed with `DORMANT_EMBED` will be sent.
 *
 * **Dormant Category:**
 *
 *  - Contains channels which aren't in use
 *  - Channels are used to refill the Available category.
 *
 * Help channels are should be named after the chemical elements.
 */
export class HelpChanModule extends ExtendedModule {
  public constructor(client: CookiecordClient) {
    super(client)
  }

  private CHANNEL_PREFIX = config.helpChannels.namePrefix

  private HELP_CHANNEL_STATUS_EMBED = (
    msg: Message,
    availableChannels: Collection<string, GuildChannel> | undefined,
    ongoingChannels: IListHelpChannelsRespone,
    dormantChannels: Collection<string, GuildChannel> | undefined,
  ) =>
    new MessageEmbed()
      .setAuthor(
        msg.guild?.name,
        msg.guild?.iconURL({ dynamic: true }) || undefined,
      )
      .setTitle('Help Channels Status')
      .addField(
        'Available',
        availableChannels && availableChannels.size >= 1
          ? availableChannels.map((channel) => `<#${channel.id}>`)
          : '**All channels is on Ongoing state**',
      )
      .addField(
        'Ongoing',
        ongoingChannels.length >= 1
          ? ongoingChannels.map(
              (channel) =>
                `<#${channel.channel_id}> - Owner <@${channel.user_id}>`,
            )
          : '**No Channels in Ongoing Category**',
      )
      .addField(
        'Dormant',
        dormantChannels && dormantChannels.size >= 1
          ? dormantChannels.map((channel) => `<#${channel.id}>`)
          : '**All channels is on Available state**',
      )

      .setFooter(
        this.client.user?.username,
        this.client.user?.displayAvatarURL(),
      )
      .setTimestamp()

  //#region Listeners
  @listener({ event: 'ready' })
  async onReady() {
    setInterval(() => {
      this.checkDormantPossibilities()
    }, helpChannels.dormantChannelLoop)

    const guild = await this.client.guilds.fetch(config.guild.id)
    await this.ensureAskChannels(guild)
    await this.syncHowToGetHelp()
    await this.verifyNumberOfChannels()
    await this.fixCooldowns(guild)
  }

  @listener({ event: 'message' })
  async onNewQuestion(msg: Message) {
    if (
      msg.author.bot ||
      !msg.guild ||
      !msg.member ||
      msg.channel.type !== 'text' ||
      !msg.channel.parentID ||
      msg.channel.parentID !== guild.categories.helpAvailable ||
      !msg.channel.name.startsWith(this.CHANNEL_PREFIX)
    ) {
      return
    }

    await this.claimChannel(msg)
  }

  @listener({ event: 'messageDelete' })
  async onQuestionRemoved(msg: Message) {
    if (
      !msg.guild ||
      !msg.member ||
      msg.channel.type !== 'text' ||
      !msg.channel.parentID ||
      msg.channel.parentID !== guild.categories.helpOngoing ||
      !msg.channel.name.startsWith(this.CHANNEL_PREFIX)
    ) {
      return
    }

    const {
      data: channel,
    } = await this.api.get<IGetHelpChanByChannelIdResponse>(
      `/helpchan/${msg.channel.id}`,
    )

    if (msg.id === channel.message_id) {
      return this.markChannelAsDormant(msg.channel, CloseReason.Deleted)
    }

    return
  }

  @listener({ event: 'message' })
  async onNewSystemPinMessage(msg: Message) {
    if (
      msg.type !== 'PINS_ADD' ||
      msg.channel.type !== 'text' ||
      !(
        msg.channel.parentID === guild.categories.helpAvailable ||
        msg.channel.parentID === guild.categories.helpOngoing
      )
    ) {
      return
    }

    return await msg.delete({ reason: 'Pin system message' })
  }
  //#endregion

  //#region Commands
  @extendedCommand({
    aliases: ['resolve', 'done', 'close', 'dormant'],
    description: 'Marks __ongoing__ help channel as resolved',
  })
  async resolved(msg: Message) {
    if (!msg.guild) {
      return
    }

    if (
      (msg.channel as TextChannel).parentID !== guild.categories.helpOngoing
    ) {
      return await msg.channel.send(
        ':warning: you can only run this in ongoing help channels.',
      )
    }

    const { data: owner } = await this.api.get<IGetHelpChanByChannelIdResponse>(
      `/helpchan/${msg.channel.id}`,
    )

    if (
      (owner && owner.user_id === msg.author.id) ||
      msg.member?.hasPermission('MANAGE_MESSAGES') ||
      msg.member?.roles.cache.has(guild.roles.maintainer)
    ) {
      return await this.markChannelAsDormant(
        msg.channel as TextChannel,
        CloseReason.Command,
      )
    } else {
      return await msg.channel.send(
        ':warning: you have to be the asker to close the channel.',
      )
    }
  }

  // #region Admin/Mod team commands
  @extendedCommand({
    inhibitors: [isTrustedMember],
  })
  public async helpchan(
    msg: Message,
    subcommand: Subcommands,
    @optional ...args: Array<string>
  ) {
    const helpString: string =
      'Available commands: `status`, `create`, `update`, `sync`, `lock`, `unlock`, `help`.'

    switch (subcommand) {
      // List the status of help channels
      case 'status': {
        const available = msg.guild?.channels.cache
          .filter(
            (channel) => channel.parentID === guild.categories.helpAvailable,
          )
          .filter((channel) => channel.name.startsWith(this.CHANNEL_PREFIX))

        const { data: ongoing } = await this.api.get<IListHelpChannelsRespone>(
          '/helpchan',
        )

        const dormant = msg.guild?.channels.cache
          .filter(
            (channel) => channel.parentID === guild.categories.helpDormant,
          )
          .filter((channel) => channel.name.startsWith(this.CHANNEL_PREFIX))

        return msg.channel.send({
          embed: this.HELP_CHANNEL_STATUS_EMBED(
            msg,
            available,
            ongoing,
            dormant,
          ),
        })
      }

      // Create help channel
      case 'create': {
        const [channelName] = args

        if (args.length > 1) {
          return msg.channel.send(
            `⚠ Expected 1 argument, but got ${args.length}\nDEBUG DATA: ${args}`,
          )
        }

        const created = await this.createHelpChannel(msg.guild!, channelName)
        return msg.channel.send(`Successfully created <#${created.id}> channel`)
      }

      case 'update': {
        await this.updateHelpChannels(msg.guild!)
        return msg.channel.send('Successfully updated all help channels')
      }

      case 'sync': {
        await this.fixCooldowns(msg.guild!)
        await this.ensureAskChannels(msg.guild!)
        await this.syncHowToGetHelp(msg.guild!)
        return msg.channel.send('Help Channel System successfully synced')
      }

      case 'lock': {
        return await this.lockHelpChannels(msg)
      }

      case 'unlock':
        return await this.lockHelpChannels(msg, true)

      // Get the help
      case 'help': {
        return msg.channel.send(helpString)
      }

      // Default response
      default:
        return msg.channel.send(helpString)
    }
  }

  @extendedCommand({ inhibitors: [noDM], aliases: ['take'] })
  public async claim(msg: Message, @optional member: GuildMember) {
    // Inhibitor
    if (
      !msg.member?.hasPermission('MANAGE_MESSAGES') &&
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
  //#endregion

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
        `:warning:: I cannot open help channel for ${member.displayName} because he is a turtle.`,
      )
    }

    try {
      const {
        data: helpChannel,
      } = await this.api.get<IGetHelpChanByUserIdResponse>(
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
        ':warning: failed to claim a help channel, no available channel found.',
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
      `😳 Successfully claimed ${claimedChannel}`,
    )
    await this.ensureAskChannels(msg.guild!)
    await this.syncHowToGetHelp(msg.guild!)
    return
  }

  private async addCooldown(member: GuildMember) {
    return await member.roles.add(guild.roles.helpCooldown)
  }

  private async markChannelAsDormant(
    channel: TextChannel,
    closeReason: CloseReason,
  ) {
    const pinned = await channel.messages.fetchPinned()
    await Promise.all(pinned.map((msg) => msg.unpin()))

    const {
      data: helpChannel,
    } = await this.api.get<IGetHelpChanByChannelIdResponse>(
      `/helpchan/${channel.id}`,
    )

    try {
      const member = await channel.guild.members.fetch({
        user: helpChannel.user_id,
      })

      await member.roles.remove(guild.roles.helpCooldown)
    } catch {}

    this.statsReportComplete(channel, helpChannel, closeReason)
    await this.api.delete(`/helpchan/${channel.id}`)
    await this.moveChannel(channel, guild.categories.helpDormant)

    await channel.send({ embed: dormantEmbed })

    await this.ensureAskChannels(channel.guild)
    await this.syncHowToGetHelp(channel.guild)
  }

  private async createHelpChannel(guild: Guild, channelName: string) {
    const chan = await guild.channels.create(`help-${channelName}`, {
      type: 'text',
      topic:
        'This is Electron help channel. You can claim your own help channel in the Help: Available category.',
      reason: 'Maintain help channel goal',
      parent: config.guild.categories.helpAvailable,
    })

    // Channel should already be in ask, but sync the permissions.
    await this.moveChannel(chan, config.guild.categories.helpAvailable)
    await chan.send({ embed: availableEmbed })

    return chan
  }

  private async updateHelpChannels(guild: Guild) {
    const helpChannels = guild.channels.cache
      .filter((channel) => channel.name.startsWith(this.CHANNEL_PREFIX))
      .array()

    for (const channel of helpChannels) {
      await channel.edit(
        {
          topic:
            'This is Electron help channel. You can claim your own help channel in the Help: Available category.',
        },
        'Maintain help channel goal',
      )
    }
  }

  private async moveChannel(channel: TextChannel, category: string) {
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

  private async claimChannel(msg: Message) {
    this.logger.info(
      `Channel #${msg.channel.id} was cliamed by '${msg.author.id}'`,
    )
    await msg.pin()
    await this.addCooldown(msg.member!)
    await this.moveChannel(
      msg.channel as TextChannel,
      guild.categories.helpOngoing,
    )
    await this.updateEmbedToClaimed(msg.channel as TextChannel, msg.author.id)

    this.stats.increment('help.claimed')

    await this.populateHelpChannel(msg.member!, msg.channel as TextChannel, msg)
    await this.ensureAskChannels(msg.guild!)
    await this.syncHowToGetHelp(msg.guild!)
  }

  private async updateEmbedToClaimed(channel: TextChannel, claimer: string) {
    const embedMessage = (await channel.messages.fetch({ limit: 3 }))
      .array()
      .find((m) => m.author.id === this.client.user?.id)

    if (!embedMessage) {
      // Maybe just post message, but I'm don't want spam
      return
    }

    return await embedMessage.edit({ embed: claimedEmbed(claimer) })
  }

  private async ensureAskChannels(guild: Guild): Promise<void | Message> {
    const askChannels = guild.channels.cache
      .filter(
        (channel) => channel.parentID === config.guild.categories.helpAvailable,
      )
      .filter((channel) => channel.name.startsWith(this.CHANNEL_PREFIX))

    if (askChannels.size >= helpChannels.maxAvailableHelpChannels) {
      return
    }

    const dormantChannels = guild.channels.cache.filter(
      (channel) => channel.parentID === config.guild.categories.helpDormant,
    )

    if (dormantChannels.size < 1) {
      // Just ignore the case where we don't have dormant
      return
    }

    const dormant = guild.channels.cache.find(
      (x) => x.parentID === config.guild.categories.helpDormant,
    ) as TextChannel

    if (dormant) {
      await this.moveChannel(dormant, config.guild.categories.helpAvailable)

      let lastMessage = dormant.messages.cache
        .array()
        .reverse()
        .find((m) => m.author.id === this.client.user?.id)

      if (!lastMessage) {
        lastMessage = (await dormant.messages.fetch({ limit: 3 }))
          .array()
          .find((m) => m.author.id === this.client.user?.id)
      }

      if (lastMessage) {
        // If there is a last message (the dormant message) by the bot, just edit it
        return await lastMessage.edit({ embed: availableEmbed })
      } else {
        // Otherwise, just send a new message
        return await dormant.send({ embed: availableEmbed })
      }
    }

    await this.ensureAskChannels(guild)
    return await this.syncHowToGetHelp(guild)
  }

  private async checkDormantPossibilities() {
    const ongoingChannels = this.client.channels.cache
      .filter(
        (channel) =>
          (channel as TextChannel).parentID ===
          config.guild.categories.helpOngoing,
      )
      .array() as Array<TextChannel>

    for (const channel of ongoingChannels) {
      const messages = (await channel.messages.fetch()).array()

      const diff = (Date.now() - messages[0].createdAt.getTime()) / 1000

      if (diff > helpChannels.dormantChannelTimeout * 60 * 60) {
        await this.markChannelAsDormant(
          channel as TextChannel,
          CloseReason.Timeout,
        )
      }
    }
  }

  private async fixCooldowns(msgGuild: Guild) {
    const cooldownedByRole = (
      await msgGuild.roles.fetch(guild.roles.helpCooldown)
    )?.members.array()

    if (!cooldownedByRole || !cooldownedByRole.length) {
      return
    }

    cooldownedByRole.forEach(async (member) => {
      await this.api
        .get<IGetHelpChanByUserIdResponse>(`/helpchan/user/${member.id}`)
        .catch(async () => {
          await member.roles.remove(guild.roles.helpCooldown)
        })
    })
  }

  private async syncHowToGetHelp(msgGuild?: Guild) {
    let availHelpChannels = null

    if (msgGuild) {
      availHelpChannels = msgGuild.channels.cache
        .filter(
          (channel) =>
            channel.parentID === config.guild.categories.helpAvailable,
        )
        .filter((channel) => channel.name.startsWith(this.CHANNEL_PREFIX))
    } else {
      availHelpChannels = await this.client.guilds
        .fetch(guild.id)
        .then((guild) =>
          guild.channels.cache
            .filter(
              (channel) =>
                channel.parentID === config.guild.categories.helpAvailable,
            )
            .filter((channel) => channel.name.startsWith(this.CHANNEL_PREFIX)),
        )
    }

    const helpChannel = (await this.client.channels.fetch(
      guild.channels.askHelpChannel,
    )) as TextChannel
    const lastMessage = (await helpChannel.messages.fetch()).last()

    if (!lastMessage) {
      await helpChannel.send(helpMessage(availHelpChannels))
    } else {
      await lastMessage.edit(helpMessage(availHelpChannels))
    }
  }

  private async verifyNumberOfChannels() {
    const channels = (await this.client.guilds.fetch(guild.id)).channels.cache

    const helpChannels = channels.filter((channel) =>
      channel.name.startsWith(this.CHANNEL_PREFIX),
    )

    if (helpChannels.size < config.helpChannels.maxTotalChannels) {
      return
    }

    const channel = (await this.client.channels.fetch(
      guild.channels.adminBotInteractions,
    )) as TextChannel

    const embed = new MessageEmbed()
      .setTitle('🛑 FATAL ERROR: MAXIUM NUMBER OF CHANNELS IS ALREADY CREATED')
      .setDescription(
        `You can't create a more than ${config.helpChannels.maxTotalChannels}.`,
      )

    return channel.send({ embed })
  }

  private async lockHelpChannels(msg: Message, unlock: boolean = false) {
    const availableHelpChannels = msg
      .guild!.channels.cache.filter(
        (channel) => channel.parentID === config.guild.categories.helpAvailable,
      )
      .filter((channel) => channel.name.startsWith(this.CHANNEL_PREFIX))
      .array()

    if (!availableHelpChannels.length) {
      return msg.channel.send('Unable to available help channels.')
    }

    availableHelpChannels.forEach(async (channel) => {
      if (unlock) {
        return await channel.edit({
          permissionOverwrites: [
            {
              id: config.guild.roles.everyone,
              allow: 'SEND_MESSAGES',
            },
          ],
        })

        // return msg.channel.send('Help Channels successfully unlocked.')
      }

      return await channel.edit({
        permissionOverwrites: [
          {
            id: config.guild.roles.everyone,
            deny: 'SEND_MESSAGES',
          },
        ],
      })

      // return msg.channel.send('Help Channels successfully loacked.')
    })

    return msg.react('🤷‍♀️')
  }

  private async populateHelpChannel(
    member: GuildMember,
    channel: TextChannel,
    msg: Message,
  ) {
    return await this.api.post('/helpchan', {
      user_id: member.user.id,
      channel_id: channel.id,
      message_id: msg.id,
    })
  }

  private statsReportComplete(
    channel: TextChannel,
    helpChanData: IGetHelpChanByChannelIdResponse,
    closeReason: CloseReason,
  ) {
    this.stats.increment(`help.dormant_calls.${closeReason}`)

    const inUseTime = this.getInUseTime(helpChanData)
    if (inUseTime) {
      this.stats.timing('help.in_use_time', inUseTime)
    }

    if (channel.lastMessage?.author.id !== helpChanData.user_id) {
      return this.stats.increment('help.sessions.unanswered')
    } else {
      return this.stats.increment('help.sessions.answered')
    }
  }

  private getInUseTime(helpChanData: IGetHelpChanByChannelIdResponse) {
    const createdAt = helpChanData.created_at

    if (createdAt) {
      const claimDate = new Date(createdAt)
      return +new Date() - +claimDate
    }

    return null
  }
}
