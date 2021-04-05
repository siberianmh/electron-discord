import { default as CookiecordClient } from 'cookiecord'
import { Message, MessageEmbed, Snowflake } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { isTrustedMember } from '../../lib/inhibitors'
import { guild } from '../../lib/config'
import { splittyArgs } from '../../lib/split-args'
import { extendedCommand } from '../../lib/extended-command'
import { InfractionType } from '../../lib/types'

export class InfractionsModule extends ExtendedModule {
  public constructor(client: CookiecordClient) {
    super(client)
  }

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

    const reason = splitArgs.join(' ')

    return await this.performKick(msg, user_id, reason)
  }

  @extendedCommand({
    single: true,
    inhibitors: [isTrustedMember],
    description: 'syntax !ban snowflake [?reason]',
  })
  public async ban(msg: Message, args: string) {
    const splitArgs = splittyArgs(args)
    if (splitArgs.length === 0) {
      return await msg.channel.send(':warning: syntax !ban <@userID> [?reason]')
    }

    const userId = splitArgs.shift()

    if (!userId) {
      return await msg.channel.send(':warning: invalid syntax')
    }

    const reason = splitArgs.join(' ')

    return await this.performBan(msg, userId, reason, false)
  }

  @extendedCommand({
    single: true,
    inhibitors: [isTrustedMember],
    description: 'syntax !pban snowflake [?reason]',
    aliases: ['purgeban'],
  })
  public async pban(msg: Message, args: string) {
    const splitArgs = splittyArgs(args)
    if (splitArgs.length === 0) {
      return await msg.channel.send(
        ':warning: syntax !pban <snowflake> [?reason]',
      )
    }

    const userId = splitArgs.shift()
    if (!userId) {
      return await msg.channel.send(':warning: invalid syntax')
    }

    const reason = splitArgs.join(' ')

    return await this.performBan(msg, userId, reason, true)
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

  private async performBan(
    ctx: Message,
    userId: Snowflake,
    reason: string,
    purge: boolean,
  ) {
    if (!reason) {
      return ctx.channel.send('Unable to ban user without reason')
    }

    const member = await ctx.guild?.members.fetch(userId)

    if (!member) {
      return ctx.channel.send('Unable to find specified user.')
    }

    if (
      member.hasPermission('MANAGE_MESSAGES') ||
      member.roles.cache.has(guild.roles.maintainer)
    ) {
      return ctx.channel.send("Well you can't ban Admins 🌚")
    }

    if (process.env.NODE_ENV !== 'development') {
      await member.ban({
        reason: reason,
        days: purge ? 7 : 0,
      })
    }

    const embed = new MessageEmbed()
      .setAuthor(
        `${member.user.tag} has been banned`,
        member.user.displayAvatarURL({ dynamic: false }) || undefined,
      )
      .setDescription(`**Reason**: ${reason}`)

    return ctx.channel.send({ embed })
  }

  protected async performKick(
    ctx: Message,
    user_id: Snowflake,
    reason: string,
  ) {
    if (!reason) {
      return ctx.channel.send('Unable to kick without reason')
    }

    const member = await ctx.guild?.members.fetch(user_id)

    if (!member) {
      return ctx.channel.send('Unable to find specified user.')
    }

    if (
      member.hasPermission('MANAGE_MESSAGES') ||
      member.roles.cache.has(guild.roles.maintainer)
    ) {
      return ctx.channel.send(
        "Well you can't kick Admins, but it is be a good option",
      )
    }

    if (process.env.NODE_ENV !== 'development') {
      await member.kick(reason)
    }

    const message = `Applied **kick** to <@${member.id}>, reason: ${reason}`
    await ctx.channel.send(message)

    await this.api.post('/infractions', {
      user_id: member?.user.id,
      actor_id: ctx?.author.id ?? '762678768032546819',
      reason: reason,
      type: InfractionType.Kick,
    })

    return
  }
}
