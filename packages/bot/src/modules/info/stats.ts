import { default as CookiecordClient, listener, Context } from 'cookiecord'
import { GuildMember, Message, TextChannel } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import * as config from '../../lib/config'

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

    const format = (msg.channel as TextChannel).name.replace(/-/g, '_')
    this.stats.increment(`channels.${format}`)
    return this.stats.increment('messages')
  }

  @listener({ event: 'guildMemberAdd' })
  public async onMemberJoin(member: GuildMember) {
    if (member.guild.id !== config.guild.id) {
      return
    }

    return this.stats.gauge('guild.total_members', member.guild.memberCount)
  }

  @listener({ event: 'guildMemberRemove' })
  public async onMemberLeave(member: GuildMember) {
    if (member.guild.id !== config.guild.id) {
      return
    }

    return this.stats.gauge('guild.total_members', member.guild.memberCount)
  }

  @listener({ event: 'commandExecution' })
  public onCommandComplete(ctx: Context) {
    const commandName = ctx.trigger
    return this.stats.increment(`commands.${commandName}`)
  }
}
