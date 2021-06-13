import { LunaworkClient, listener } from 'lunawork'
import {
  Message,
  MessageEmbed,
  MessageReaction,
  User,
  Permissions,
} from 'discord.js'
import * as humanizeDuration from 'humanize-duration'
import { ExtendedModule } from '../../lib/extended-module'
import { extendedCommand } from '../../lib/extended-command'
import { guild } from '../../lib/config'
import { redis, selfDestructMessage } from '../../lib/redis'

export class EtcModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  //#region Commands
  @extendedCommand()
  async ping(msg: Message): Promise<Message> {
    const bot_ping = +new Date() - +msg.createdAt
    const dsAPILatency = this.client.ws.ping
    const uptime = this.client.uptime
      ? humanizeDuration(this.client.uptime)
      : 'He dead'

    const embed = new MessageEmbed()
      .setTitle('Satellite Found')
      .addField('Command Processing Time', `${bot_ping}ms`)
      .addField('Uptime', uptime)
      .addField('Discord API Latency', `${dsAPILatency}ms`)
      .setTimestamp()

    return await msg.channel.send({ embeds: [embed] })
  }
  //#endregion

  //#region Listeners
  @listener({ event: 'message' })
  public async onNewRelease(msg: Message): Promise<Message | undefined> {
    if (msg.channel.id !== guild.channels.releases) {
      return
    }

    return await msg.crosspost()
  }

  @listener({ event: 'message' })
  public async createPoll(msg: Message): Promise<void> {
    if (msg.author.bot || !msg.content.toLowerCase().startsWith('poll:')) {
      return
    }
    await msg.react('✅')
    await msg.react('❌')
    await msg.react('🤷')

    return
  }

  @listener({ event: 'messageReactionAdd' })
  public async bucketEmojiClicked(
    reaction: MessageReaction,
    user: User,
  ): Promise<Message | undefined> {
    if (user.id === this.client.user?.id) {
      return
    }

    if (reaction.partial) {
      await reaction.fetch()
    }

    if (reaction.message.channel.id === guild.channels.roles) {
      // Don't handle the roles channel
      return
    }

    const key = await redis.get(selfDestructMessage(reaction.message.id))

    if (!key) {
      return
    }

    const member = await reaction.message.guild?.members.fetch({
      user,
    })

    if (
      user.id === key ||
      member?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) ||
      member?.roles.cache.has(guild.roles.maintainer)
    ) {
      return await reaction.message.delete()
    }

    return
  }
  //#endregion
}
