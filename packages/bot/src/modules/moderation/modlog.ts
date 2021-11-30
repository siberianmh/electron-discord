// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { LunaworkClient, listener } from '@siberianmh/lunawork'
import {
  CategoryChannel,
  ColorResolvable,
  DMChannel,
  Guild,
  ThreadChannel,
  GuildChannel,
  GuildMember,
  Message,
  StageChannel,
  MessageEmbed,
  Role,
  Snowflake,
  TextChannel,
  VoiceChannel,
} from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { formatTimestamp, formatUser } from '../../lib/format'
import * as constants from '../../lib/config'

interface ISendLogMessageProps {
  readonly iconURL?: string
  readonly colour: ColorResolvable
  readonly title?: string
  readonly text?: string
  readonly thumbnail?: string | null
  readonly channelId?: Snowflake
  readonly content?: string
  readonly footer?: string
}

/**
 * Logging for server events and staff actions
 */
export class ModLogModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  /**
   * Generate log embed and send to logging channel
   */
  public async sendLogMessage({
    iconURL,
    colour,
    title,
    text,
    thumbnail,
    channelId = constants.guild.channels.modLog,
    content,
    footer,
  }: ISendLogMessageProps) {
    const embed = new MessageEmbed()

    if (text) {
      embed.setDescription(text)
    }

    if (title && iconURL) {
      embed.setAuthor(title, iconURL)
    }

    embed.setColor(colour)

    if (footer) {
      embed.setFooter(footer)
    }

    if (thumbnail) {
      embed.setThumbnail(thumbnail)
    }

    const channel = (await this.client.channels.fetch(channelId)) as TextChannel

    return await channel.send({
      content: content ?? undefined,
      embeds: [embed],
    })
  }

  /**
   * Log channel create event to moderation log.
   */
  @listener({ event: 'channelCreate' })
  public async onGuildChannelCreate(channel: GuildChannel) {
    if (channel instanceof DMChannel) {
      return
    }

    if (!channel.guild) {
      return
    }

    // TODO(vhashimotoo): This check be enabled
    // if (channel.guild.id !== constants.guild.id) {
    //   return
    // }

    let title = ''
    let message = ''

    if (channel instanceof CategoryChannel) {
      title = 'Category created'
      message = `${channel.name} (\`${channel.id}\`)`
    } else if (channel instanceof VoiceChannel) {
      title = 'Voice channel created'
      message = `${channel.name} (\`${channel.id}\`)`
    } else if (channel instanceof StageChannel) {
      title = 'Stage channel created'
      message = `${channel.name} (\`${channel.id}\`)`
    } else {
      title = 'Text channel created'
      message = `${channel.name} (\`${channel.id}\`)`
    }

    return await this.sendLogMessage({
      iconURL: constants.style.icons.hashGreen,
      colour: constants.style.colors.softGreen,
      title: title,
      text: message,
    })
  }

  /**
   * Log channel delete event to mod log.
   */
  @listener({ event: 'channelDelete' })
  public async onGuildChannelDelete(channel: GuildChannel) {
    if (channel.guild.id !== constants.guild.id) {
      return
    }

    let title = ''
    let message = ''

    if (channel instanceof CategoryChannel) {
      title = 'Category deleted'
    } else if (channel instanceof VoiceChannel) {
      title = 'Voice channel deleted'
    } else {
      title = 'Text channel deleted'
    }

    message = `${channel.name} (\`${channel.id}\`)`

    return await this.sendLogMessage({
      iconURL: constants.style.icons.hashRed,
      colour: constants.style.colors.softRed,
      title: title,
      text: message,
    })
  }

  /**
   * Log channel update event to mod log.
   *
   *  TODO: Finish this listener
   */
  @listener({ event: 'channelUpdate' })
  public async onGuildChannelUpdate(before: GuildChannel, after: GuildChannel) {
    if (before.guild.id !== constants.guild.id) {
      return
    }

    const helpCategories = [
      constants.guild.categories.helpAvailable,
      constants.guild.categories.helpDormant,
      constants.guild.categories.helpOngoing,
    ]

    if (helpCategories.includes(after.parentId!)) {
      return
    }
  }

  /**
   * Log thread create event to mod log.
   */
  @listener({ event: 'threadCreate' })
  public async onThreadCreate(thread: ThreadChannel) {
    if (thread.guild.id !== constants.guild.id) {
      return
    }

    const message = `${thread.name} (\`${thread.id}\`)

Owner: <@${thread.ownerId}> (\`${thread.ownerId}\`)`

    return this.sendLogMessage({
      iconURL: constants.style.icons.hashGreen,
      colour: constants.style.colors.softGreen,
      title: 'Thread created',
      text: message,
    })
  }

  /**
   * Log thread delete event to mod log.
   * This is not archiving, this is deleting.
   */
  @listener({ event: 'threadDelete' })
  public async onThreadDelete(thread: ThreadChannel) {
    if (thread.guild.id !== constants.guild.id) {
      return
    }

    const title = 'Thread deleted (not archived)'
    const message = `${thread.name} (\`${thread.id}\`)`

    return await this.sendLogMessage({
      iconURL: constants.style.icons.hashRed,
      colour: constants.style.colors.softRed,
      title: title,
      text: message,
    })
  }

  /**
   * Log role create event to mod log.
   */
  @listener({ event: 'roleCreate' })
  public async onGuildRoleCreated(role: Role) {
    if (role.guild.id !== constants.guild.id) {
      return
    }

    return await this.sendLogMessage({
      iconURL: constants.style.icons.crownGreen,
      colour: constants.style.colors.softGreen,
      title: 'Role created',
      text: `${role.id}`,
    })
  }

  /**
   * Log role delete event to mod log.
   */
  @listener({ event: 'roleDelete' })
  public async onGuildRoleDelete(role: Role) {
    if (role.guild.id !== constants.guild.id) {
      return
    }

    return await this.sendLogMessage({
      iconURL: constants.style.icons.crownRed,
      colour: constants.style.colors.softRed,
      title: 'Role removed',
      text: `${role.name} (\`${role.id}\`)`,
    })
  }

  /**
   * Log role update event to mod log.
   *
   * TODO: Finish this listener.
   */
  @listener({ event: 'roleUpdate' })
  public async onGuildRoleUpdate(before: Role, _after: Role) {
    if (before.guild.id !== constants.guild.id) {
      return
    }
  }

  /**
   * Log guild update event to mod log.
   *
   * TODO: Finish this listener.
   */
  @listener({ event: 'guildUpdate' })
  public async onGuildUpdate(before: Guild, _after: Guild) {
    if (before.id !== constants.guild.id) {
      return
    }
  }

  /**
   * Log message delete event to message chnage log.
   */
  @listener({ event: 'messageDelete' })
  public async onMessageDelete(message: Message) {
    const channel = message.channel as TextChannel
    const author = message.author

    // Ignore DMs.
    if (!message.guild) {
      return
    }

    if (message.guild.id !== constants.guild.id) {
      return
    }

    if (!author) {
      return
    }

    if (author && author.bot) {
      return
    }

    let response: string = ''

    if (channel.parentId) {
      response = `
**Author:** ${formatUser(author)}\n
**Channel:** <#${channel.parentId}>/<#${channel.id}> (\`${channel.id}\`)\n
**Message ID:** \`${message.id}\`\n`
    } else {
      response = `
**Author:** ${formatUser(author)}\n
**Channel:** <#${channel.id}> (\`${channel.id}\`)\n
**Message ID:** \`${message.id}\`\n
`
    }

    if (message.attachments) {
      // Prepend the message the metadata with the number of attachments
      response = `**Attachements:** ${message.attachments.size}\n` + response
    }

    // Shorten the message content if necessary.
    const content = message.cleanContent
    // const remainedChars = 2040 - response.length

    response += `${content}`

    return await this.sendLogMessage({
      iconURL: constants.style.icons.messageDelete,
      colour: constants.style.colors.softRed,
      title: 'Message deleted',
      text: response,
    })
  }

  @listener({ event: 'guildBanAdd' })
  public async onMemberBan(guild: Guild, member: GuildMember) {
    if (guild.id !== constants.guild.id) {
      return
    }

    if (member.partial) {
      await member.fetch(true)
    }

    await this.sendLogMessage({
      iconURL: constants.style.icons.userBan,
      colour: constants.style.colors.softRed,
      title: 'User Banned',
      text: formatUser(member),
      channelId: constants.guild.channels.memberLog,
      // thumbnail: member.user.avatar || undefined,
    })
  }

  @listener({ event: 'guildMemberAdd' })
  public async onMemberAdd(member: GuildMember) {
    if (member.guild.id !== constants.guild.id) {
      return
    }

    const message = `${formatUser(member)}

Created: ${formatTimestamp(member.user.createdAt)}`

    return await this.sendLogMessage({
      iconURL: constants.style.icons.userJoin,
      colour: constants.style.colors.softGreen,
      title: 'User Joined',
      text: message,
      thumbnail: member.user.displayAvatarURL({ dynamic: false }),
      channelId: constants.guild.channels.memberLog,
    })
  }

  @listener({ event: 'guildMemberRemove' })
  public async onMemberRemove(member: GuildMember) {
    if (member.guild.id !== constants.guild.id) {
      return
    }

    const message = `${formatUser(member)}

Be a member: ${formatTimestamp(member.joinedAt)}`

    return await this.sendLogMessage({
      iconURL: constants.style.icons.userRemove,
      colour: constants.style.colors.softRed,
      title: 'User Left',
      text: message,
      thumbnail: member.user.displayAvatarURL({ dynamic: false }),
      channelId: constants.guild.channels.memberLog,
    })
  }
}
