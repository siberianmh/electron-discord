import { default as CookiecordClient, listener } from 'cookiecord'
import {
  CategoryChannel,
  ColorResolvable,
  DMChannel,
  Guild,
  GuildChannel,
  GuildMember,
  Message,
  MessageEmbed,
  Role,
  TextChannel,
  VoiceChannel,
} from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { formatUser } from '../../lib/format-user'
import * as constants from '../../lib/config'

interface ISendLogMessageProps {
  readonly iconURL?: string
  readonly colour: ColorResolvable
  readonly title?: string
  readonly text?: string
  readonly thumbnail?: string | null
  readonly channelId?: string
  readonly content?: string
  readonly footer?: string
}

/**
 * Logging for server events and staff actions
 */
export class ModLogModule extends ExtendedModule {
  public constructor(client: CookiecordClient) {
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
    const embed = new MessageEmbed({
      description: text,
    })

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

    await channel.send(content, { embed: embed })
  }

  /**
   * Log channel create event to mode log.
   */
  @listener({ event: 'channelCreate' })
  public async onGuildChannelCreate(channel: GuildChannel) {
    if (channel instanceof DMChannel) {
      return
    }

    if (channel.guild.id !== constants.guild.id) {
      return
    }

    let title = ''
    let message = ''

    if (channel instanceof CategoryChannel) {
      title = 'Category created'
      message = `${channel.name} (\`${channel.id}\`)`
    } else if (channel instanceof VoiceChannel) {
      title = 'Voice channel created'
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

    if (helpCategories.includes(after.parentID!)) {
      return
    }
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
  public async onGuildRoleUpdate(before: Role, after: Role) {
    if (before.guild.id !== constants.guild.id) {
      return
    }

    console.log(before)
    console.log(after)
  }

  /**
   * Log guild update event to mod log.
   *
   * TODO: Finish this listener.
   */
  @listener({ event: 'guildUpdate' })
  public async onGuildUpdate(before: Guild, after: Guild) {
    if (before.id !== constants.guild.id) {
      return
    }

    console.log(before)
    console.log(after)
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

    if (channel.parentID) {
      response = `
**Author:** ${formatUser(author)}\n
**Channel:** #${channel.parentID}/#${channel.name} (\`${channel.id}\`)\n
**Message ID:** \`${message.id}\`\n`
    } else {
      response = `
**Author:** ${formatUser(author)}\n
**Channel:** #${channel.name} (\`${channel.id}\`)\n
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
      thumbnail: member.user.displayAvatarURL({ format: 'png' }) || undefined,
    })
  }
}
