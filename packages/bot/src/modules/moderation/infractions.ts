import {
  LunaworkClient,
  Context,
  isCommandMessage,
  isSelectMenuMessage,
  isButtonMessage,
} from 'lunawork'
import {
  Message,
  TextChannel,
  MessageEmbed,
  User,
  Snowflake,
  Permissions,
  GuildMember,
} from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { isTrustedMember } from '../../lib/inhibitors'
import { toBigIntLiteral as b } from '../../lib/to-bigint-literal'
import { guild } from '../../lib/config'
import { splittyArgs } from '../../lib/split-args'
import { extendedCommand } from '../../lib/extended-command'
import { InfractionType, infractionType } from '../../lib/types'

interface IPerformInfractionProps {
  readonly user: User
  readonly type: InfractionType
  readonly reason: string
  readonly purge?: boolean
  readonly ctx?: Message
}

interface INotifyInfractionProps {
  readonly reason: string
  readonly type: InfractionType
  readonly user: User
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
      return await msg.channel.send({
        content: ':warning: syntax !kick <@userID> [?reason]',
      })
    }

    const user_id = splitArgs.shift()

    if (!user_id) {
      return await msg.channel.send({ content: ':warning: invalid syntax' })
    }

    const res = this.USER_PATTERN.exec(user_id)
    let user: User | undefined

    if (res && res[1]) {
      user = msg.client.users.cache.get(b(res[1]))
    } else {
      user = msg.client.users.cache.get(b(user_id))
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
    if (
      isCommandMessage(msg) ||
      isButtonMessage(msg) ||
      isSelectMenuMessage(msg)
    ) {
      return
    }

    const splitArgs = splittyArgs(args)
    if (splitArgs.length === 0) {
      return await (msg.channel as TextChannel)!.send({
        content: ':warning: syntax !kick <@userID> [?reason]',
      })
    }

    const [user_id, ...reason] = splitArgs

    if (!user_id) {
      return await (msg.channel as TextChannel)!.send({
        content: ':warning: invalid syntax',
      })
    }

    const res = this.USER_PATTERN.exec(user_id)
    let user: User | undefined

    if (res && res[1]) {
      user = msg.client.users.cache.get(b(res[1]))
    } else {
      user = msg.client.users.cache.get(b(user_id))
    }

    const purge = trigger === 'pban' || trigger === 'purgeban'

    return await this.performInfraction({
      ctx: msg,
      user: user!,
      reason: reason.join(' '),
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

      return msg.channel.send({ content: '🤗 pardonned' })
    } catch (e) {
      const errEmbed = new MessageEmbed().setDescription('Unable to unban')
      return msg.channel.send({ embeds: [errEmbed] })
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
      return await msg.channel.send({
        content: ':warning: syntax !warn <@userID> [?reason]',
      })
    }

    const [user_id, ...reason] = splitArgs

    if (!user_id) {
      return await msg.channel.send({ content: ':warning: invalid syntax' })
    }

    const res = this.USER_PATTERN.exec(user_id)
    let user: User | undefined

    if (res && res[1]) {
      user = msg.client.users.cache.get(b(res[1]))
    } else {
      user = msg.client.users.cache.get(b(user_id))
    }

    return await this.performInfraction({
      user: user!,
      ctx: msg,
      reason: reason.join(' '),
      type: InfractionType.Warn,
    })
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
      return props.ctx.channel.send({
        content: 'Unable to apply infraction without reason',
      })
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
      return props.ctx.channel.send({
        content: 'Unable to find specified user.',
      })
    }

    if (!member) {
      return
    }

    if (
      member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) ||
      member.roles.cache.has(guild.roles.maintainer)
    ) {
      if (props.ctx) {
        return props.ctx.channel.send({
          content: 'You can apply infraction to the mod user.',
        })
      } else {
        return
      }
    }

    const mailSended = await this.notifyInfraction({
      reason: props.reason,
      type: props.type,
      user: member.user,
    })
    let message = `${mailSended ? '📨' : '📪'} `

    if (process.env.NODE_ENV !== 'development') {
      switch (props.type) {
        case InfractionType.Kick:
          await member.kick(props.reason)
          break
        case InfractionType.Ban:
          await member.ban({
            reason: props.reason,
            days: props.purge ? 7 : 0,
          })
          break
        case InfractionType.Warn:
          break
      }
    }

    switch (props.type) {
      case InfractionType.Kick:
        message += `Applied **kick** to <@${member.id}>, reason: ${props.reason}`
        break
      case InfractionType.Ban:
        message += `Applied **${props.purge ? 'purgeban' : 'ban'}** to <@${
          member.id
        }>, reason: ${props.reason}`
        break
      case InfractionType.Warn:
        message += `Applied **warning** to <@${member.id}>, reason: ${props.reason}`
        break
    }

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

  private async notifyInfraction(props: INotifyInfractionProps) {
    const description = `**Type:** ${infractionType[props.type]}
**Reason:** ${props.reason}`

    const embed = new MessageEmbed().setDescription(description)

    embed.setAuthor('Information about infraction')
    embed.setTitle('Plese review the future actions')

    embed.setFooter(
      'If you would like to discuss or appeal this infraction, please send a message to the `Hashimoto#2752`, please include all information that you can',
    )

    try {
      await props.user.send({ embeds: [embed] })
      return true
    } catch (err) {
      return false
    }
  }
}
