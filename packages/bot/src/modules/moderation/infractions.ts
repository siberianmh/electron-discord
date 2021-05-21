import { LunaworkClient, Context, isCommandMessage } from 'lunawork'
import { Message, MessageEmbed, User, Snowflake, GuildMember } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { isTrustedMember } from '../../lib/inhibitors'
import { guild } from '../../lib/config'
import { splittyArgs } from '../../lib/split-args'
import { extendedCommand } from '../../lib/extended-command'
import { InfractionType } from '../../lib/types'

interface IPerformInfractionProps {
  readonly user: User
  readonly type: InfractionType
  readonly reason: string
  readonly purge?: boolean
  readonly ctx?: Message
}

// TODO:
//  - notify user
export class InfractionsModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  private USER_PATTERN = /(?:<@!?)?(\d+)>?/

  /**
   * Kick a user for the given reason.
   */
  @extendedCommand({
    single: true,
    inhibitors: [isTrustedMember],
    description: 'Kick a user for the given reason.',
  })
  public async kick(msg: Message, args: string) {
    const splitArgs = splittyArgs(args)
    if (splitArgs.length === 0) {
      return await msg.channel.send(
        ':warning: syntax !kick <@userID> [?reason]',
      )
    }

    const user_id = splitArgs.shift()

    if (!user_id) {
      return await msg.channel.send(':warning: invalid syntax')
    }

    const res = this.USER_PATTERN.exec(user_id)
    let user: User | undefined

    if (res && res[1]) {
      user = msg.client.users.cache.get(res[1])
    } else {
      user = msg.client.users.cache.get(user_id)
    }

    const reason = splitArgs.join(' ')

    return await this.performInfraction({
      user: user!,
      reason: reason,
      type: InfractionType.Kick,
      ctx: msg,
    })
  }

  @extendedCommand({
    single: true,
    inhibitors: [isTrustedMember],
    description: 'syntax !ban snowflake [?reason]',
    usesContextAPI: true,
    aliases: ['purgeban', 'pban'],
  })
  public async ban({ msg, trigger }: Context, args: string) {
    if (isCommandMessage(msg)) {
      return
    }

    const splitArgs = splittyArgs(args)
    if (splitArgs.length === 0) {
      return await msg.channel.send(
        ':warning: syntax !kick <@userID> [?reason]',
      )
    }

    const user_id = splitArgs.shift()

    if (!user_id) {
      return await msg.channel.send(':warning: invalid syntax')
    }

    const res = this.USER_PATTERN.exec(user_id)
    let user: User | undefined

    if (res && res[1]) {
      user = msg.client.users.cache.get(res[1])
    } else {
      user = msg.client.users.cache.get(user_id)
    }

    const reason = splitArgs.join(' ')
    const purge = trigger === 'pban' || trigger === 'purgeban'

    return await this.performInfraction({
      ctx: msg,
      user: user!,
      reason,
      type: InfractionType.Ban,
      purge,
    })
  }

  @extendedCommand({
    inhibitors: [isTrustedMember],
    description: 'syntax !unban <snowflake>',
    aliases: ['pardon'],
  })
  public async unban(msg: Message, snowflake: Snowflake) {
    try {
      await msg.guild?.members.unban(snowflake)

      return msg.channel.send('🤗 pardonned')
    } catch (e) {
      const errEmbed = new MessageEmbed().setDescription('Unable to unban')
      return msg.channel.send({ embed: errEmbed })
    }
  }

  /**
   * Warn a user for the given reason.
   */
  @extendedCommand({
    single: true,
    inhibitors: [isTrustedMember],
    description: 'Warn a user for the given reason.',
    aliases: ['warning'],
  })
  public async warn(msg: Message, args: string) {
    const splitArgs = splittyArgs(args)
    if (splitArgs.length === 0) {
      return msg.channel.send('We all need some beer.')
    }

    const userSnowflake = splitArgs.shift()

    if (!userSnowflake) {
      return await msg.channel.send(':warning: invalid syntax')
    }

    const reason = splitArgs.join(' ')
    if (!reason) {
      return msg.channel.send(
        'Unable to give warning to the person without reason',
      )
    }

    return msg.channel.send('not today')
  }

  @extendedCommand({
    inhibitors: [isTrustedMember],
    description: 'Pardon the warning to the person',
    aliases: ['unwarn'],
  })
  public async unwarning(_msg: Message, _snowflake: Snowflake) {
    // TODO: Implement this command
  }
  //#endregion

  public async performInfraction(props: IPerformInfractionProps) {
    if (!props.reason && props.ctx) {
      return props.ctx.channel.send('Unable to apply infraction without reason')
    }

    let member: GuildMember | undefined
    if (props.ctx) {
      member = await props.ctx.guild?.members.fetch(props.user.id)
    } else {
      member = await (
        await this.client.guilds.fetch(guild.id)
      ).members.fetch(props.user.id)
    }

    if (!member && props.ctx) {
      return props.ctx.channel.send('Unable to find specified user.')
    }

    if (!member) {
      return
    }

    if (
      member.permissions.has('MANAGE_MESSAGES') ||
      member.roles.cache.has(guild.roles.maintainer)
    ) {
      if (props.ctx) {
        return props.ctx.channel.send(
          'You can apply infraction to the mod user.',
        )
      } else {
        return
      }
    }

    if (process.env.NODE_ENV !== 'development') {
      switch (props.type) {
        case InfractionType.Kick:
          await member.kick(props.reason)
        case InfractionType.Ban:
          await member.ban({
            reason: props.reason,
            days: props.purge ? 7 : 0,
          })
        default:
          return
      }
    }

    const message = `Applied **kick** to <@${member.id}>, reason: ${props.reason}`
    if (props.ctx) {
      await props.ctx.channel.send(message)
    }

    return await this.addInfraction({
      user_id: member.user.id,
      actor_id: props.ctx?.author.id ?? '762678768032546819',
      reason: props.reason,
      type: props.type,
      active: true,
    })
  }
}
