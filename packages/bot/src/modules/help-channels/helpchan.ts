import {
  LunaworkClient,
  listener,
  isCommandMessage,
  slashCommand,
} from 'lunawork'
import {
  CommandInteraction,
  Message,
  MessageEmbed,
  TextChannel,
  Permissions,
} from 'discord.js'
import { IGetHelpChanByChannelIdResponse } from '../../lib/types'
import { helpChannels, guild } from '../../lib/config'
import * as config from '../../lib/config'
import { HelpChanBase } from './base'
import { extendedCommand } from '../../lib/extended-command'
import { CloseReason } from '../../lib/types/help-chan'
import { claimedEmbed } from './embeds/claimed'
import { dormantEmbed } from './embeds/dormant'

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
export class HelpChanModule extends HelpChanBase {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  //#region Listeners
  @listener({ event: 'ready' })
  async onReady(): Promise<void> {
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

    const { data: channel } =
      await this.api.get<IGetHelpChanByChannelIdResponse>(
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

    return await msg.delete()
  }
  //#endregion

  //#region Commands
  @extendedCommand({
    aliases: ['resolved', 'done', 'resolve', 'dormant'],
    description: 'Marks __ongoing__ help channel as resolved',
  })
  @slashCommand({ description: 'Marks __ongoing__ help channel as resolved' })
  async close(msg: Message | CommandInteraction) {
    if (!msg.guild) {
      return
    }

    if (
      (msg.channel as TextChannel).parentID !== guild.categories.helpOngoing
    ) {
      return this.sendToChannel(
        msg,
        ':warning: you can only run this in ongoing help channel',
        { slashOptions: { ephemeral: true } },
      )
    }

    const { data: owner } = await this.api.get<IGetHelpChanByChannelIdResponse>(
      `/helpchan/${msg.channel!.id}`,
    )

    if (
      // @ts-ignore
      (owner && owner.user_id === msg.member.id) ||
      // @ts-ignore
      msg.member?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) ||
      // @ts-ignore
      msg.member?.roles.cache.has(guild.roles.maintainer)
    ) {
      if (isCommandMessage(msg)) {
        await msg.reply('Channel is starting closing 🎈', { ephemeral: true })
      }
      return await this.markChannelAsDormant(
        msg.channel as TextChannel,
        CloseReason.Command,
      )
    } else {
      this.sendToChannel(
        msg,
        ':warning: you have to be the asker to close the channel.',
        { slashOptions: { ephemeral: true } },
      )
    }
  }

  private async markChannelAsDormant(
    channel: TextChannel,
    closeReason: CloseReason,
  ) {
    const pinned = await channel.messages.fetchPinned()
    await Promise.all(pinned.map((msg) => msg.unpin()))

    const { data: helpChannel } =
      await this.api.get<IGetHelpChanByChannelIdResponse>(
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

  private async claimChannel(msg: Message) {
    this.client.logger.info(
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

      const message = messages[0]
      const diff = (Date.now() - message.createdAt.getTime()) / 1000

      if (diff > helpChannels.dormantChannelTimeout * 60 * 60) {
        await this.markChannelAsDormant(
          channel as TextChannel,
          CloseReason.Timeout,
        )
      }
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
