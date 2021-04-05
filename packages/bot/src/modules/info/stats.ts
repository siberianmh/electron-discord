import { default as CookiecordClient, listener } from 'cookiecord'
import { GuildMember, Message, TextChannel } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import * as config from '../../lib/config'
import { statsd } from '../../lib/statsd'

export class StatsModule extends ExtendedModule {
  public constructor(client: CookiecordClient) {
    super(client)
  }

  @listener({ event: 'message' })
  public async onMessage(msg: Message) {
    if (!msg.guild) {
      return
    }

    if (msg.guild.id !== config.guild.id) {
      return
    }

    // @ts-expect-error
    console.log(msg.channel.name.replace(/-/g, '_'))
    const format = (msg.channel as TextChannel).name.replace(/-/g, '_')
    statsd.increment(`channels.${format}`)
    return statsd.increment('messages')
  }

  @listener({ event: 'guildMemberAdd' })
  public async onMemberJoin(member: GuildMember) {
    if (member.guild.id !== config.guild.id) {
      return
    }

    return statsd.gauge('guild.total_members', member.guild.memberCount)
  }

  @listener({ event: 'guildMemberRemove' })
  public async onMemberLeave(member: GuildMember) {
    if (member.guild.id !== config.guild.id) {
      return
    }

    return statsd.gauge('guild.total_members', member.guild.memberCount)
  }
}
