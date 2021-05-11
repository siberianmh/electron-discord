import { LunaworkClient } from 'lunawork'
import {
  Message,
  GuildMember,
  TextChannel,
  ChannelData,
  Guild,
} from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { helpChannels, guild } from '../../lib/config'
import * as config from '../../lib/config'
import { availableEmbed } from './embeds/available'
import { helpMessage } from './help-message'
import { IGetHelpChanByUserIdResponse } from '../../lib/types'

export class HelpChanBase extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  protected CHANNEL_PREFIX = helpChannels.namePrefix

  protected async moveChannel(channel: TextChannel, category: string) {
    const parent = channel.guild.channels.resolve(category)
    if (parent === null) {
      return
    }

    this.client.logger.info(
      `Moving #${channel.name} (${channel.id}) to the ${parent.name} category`,
    )
    const data: ChannelData = {
      parentID: parent.id,
      permissionOverwrites: parent.permissionOverwrites,
    }
    return await channel.edit(data)
  }

  protected async addCooldown(member: GuildMember) {
    return await member.roles.add(guild.roles.helpCooldown)
  }

  protected async populateHelpChannel(
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

  protected async ensureAskChannels(guild: Guild): Promise<void | Message> {
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
      (channel) => channel.parentID === config.guild.categories.helpDormant,
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

  protected async syncHowToGetHelp(msgGuild?: Guild) {
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

  protected async fixCooldowns(msgGuild: Guild) {
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
}
