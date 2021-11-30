// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import {
  LunaworkClient,
  applicationCommand,
  ApplicationCommandOptionType,
} from '@siberianmh/lunawork'
import {
  Message,
  MessageEmbed,
  User,
  Permissions,
  GuildMember,
  CommandInteraction,
} from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { isTrustedMember } from '../../lib/inhibitors'
import { guild } from '../../lib/config'
import { IInfraction, InfractionType, infractionType } from '../../lib/types'
import { Infractions } from '../../entities/infractions'

interface IPerformInfractionProps {
  readonly user: User | GuildMember
  readonly type: InfractionType
  readonly reason: string
  readonly purge?: boolean
  readonly msg?: Message | CommandInteraction
  readonly silence?: boolean
}

interface INotifyInfractionProps {
  readonly reason: string
  readonly type: InfractionType
  readonly user: User
}

export class InfractionsModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  private USER_PATTERN = /(?:<@!?)?(\d+)>?/

  /**
   * Kick a user for the given reason.
   */
  @applicationCommand({
    description: 'Kick the bad person',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'user',
        description:
          'The user id which needed to be kicked (the id, not user nickname)',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'reason',
        description: 'Reason to kick',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.Boolean,
        name: 'silence',
        description: 'Kick the person in the silent mode',
      },
    ],
    inhibitors: [isTrustedMember],
  })
  public async kick(
    msg: CommandInteraction,
    {
      user,
      reason,
      silence,
    }: { user: string; reason: string; silence?: boolean },
  ) {
    let member: GuildMember | undefined
    const res = this.USER_PATTERN.exec(user)

    if (res && res[1]) {
      member = await msg.guild?.members.fetch(res[1])
    } else {
      member = await msg.guild?.members.fetch(user)
    }

    return await this.performInfraction({
      msg: msg,
      reason: reason,
      type: InfractionType.Kick,
      silence: silence,
      user: member!,
    })
  }

  @applicationCommand({
    description: 'Ban the bad person',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'user',
        description: 'The user which needed to be banned',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'reason',
        description: 'Reason to ban',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.Boolean,
        name: 'purge',
        description: 'Cleans the messages',
      },
      {
        type: ApplicationCommandOptionType.Boolean,
        name: 'silence',
        description: 'Ban the person in the silent mode',
      },
    ],
    inhibitors: [isTrustedMember],
  })
  public async ban(
    msg: CommandInteraction,
    {
      user,
      reason,
      purge,
      silence,
    }: { user: string; reason: string; purge: boolean; silence: boolean },
  ) {
    let member: GuildMember | undefined
    const res = this.USER_PATTERN.exec(user)

    if (res && res[1]) {
      member = await msg.guild?.members.fetch(res[1])
    } else {
      member = await msg.guild?.members.fetch(user)
    }

    return this.performInfraction({
      reason,
      msg,
      purge,
      silence,
      type: InfractionType.Ban,
      user: member!,
    })
  }

  // @extendedCommand({
  //   inhibitors: [isTrustedMember],
  //   description: 'syntax !unban <snowflake>',
  //   aliases: ['pardon'],
  // })
  // public async unban(msg: Message, snowflake: Snowflake) {
  //   try {
  //     await msg.guild?.members.unban(snowflake)

  //     return msg.channel.send({ content: '🤗 pardonned' })
  //   } catch (e) {
  //     const errEmbed = new MessageEmbed().setDescription('Unable to unban')
  //     return msg.channel.send({ embeds: [errEmbed] })
  //   }
  // }

  /**
   * Warn a user for the given reason.
   */
  @applicationCommand({
    name: 'warn',
    description: 'Warn the bad person',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'user',
        description: 'The user which needed to be warned',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'reason',
        description: 'Reason to warn',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.Boolean,
        name: 'silence',
        description: 'Warn the person in the silent mode',
      },
    ],
    inhibitors: [isTrustedMember],
  })
  public async warn(
    msg: CommandInteraction,
    {
      user,
      reason,
      silence,
    }: { user: string; reason: string; silence?: boolean },
  ) {
    let member: GuildMember | undefined
    const res = this.USER_PATTERN.exec(user)

    if (res && res[1]) {
      member = await msg.guild?.members.fetch(res[1])
    } else {
      member = await msg.guild?.members.fetch(user)
    }

    return this.performInfraction({
      msg,
      user: member!,
      reason,
      silence,
      type: InfractionType.Warn,
    })
  }

  // @extendedCommand({
  //   inhibitors: [isTrustedMember],
  //   description: 'Pardon the warning to the person',
  //   aliases: ['unwarn'],
  // })
  // public async unwarning(_msg: Message, _snowflake: Snowflake) {
  //   // TODO: Implement this command
  // }

  public async performInfraction(props: IPerformInfractionProps) {
    let member: GuildMember | undefined

    if (props.msg) {
      member = await props.msg.guild?.members.fetch(props.user.id)
    } else {
      member = await (
        await this.client.guilds.fetch(guild.id)
      ).members.fetch(props.user.id)
    }

    if (!member && props.msg) {
      return props.msg.reply({
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
      if (props.msg) {
        return props.msg.reply({
          content: "You can't apply infraction to the mod user.",
        })
      } else {
        return
      }
    }

    let mailSended: boolean = false
    if (!props.silence) {
      mailSended = await this.notifyInfraction({
        reason: props.reason,
        type: props.type,
        user: member.user,
      })
    }
    let message = `${mailSended ? '📨' : props.silence ? '🔇' : '📪'} `

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
        case InfractionType.Mute:
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
      case InfractionType.Mute:
        message += `Applied **mute** to <@${member.id}>, reason: ${props.reason}`
        break
      case InfractionType.Warn:
        message += `Applied **warning** to <@${member.id}>, reason: ${props.reason}`
        break
    }

    if (props.msg) {
      await props.msg.reply(message)
    }

    return await this.addInfraction({
      user_id: member.user.id,
      actor_id: props.msg?.member!.user.id ?? '762678768032546819',
      reason: props.reason,
      type: props.type,
      active: true,
    })
  }

  private async addInfraction(opts: IInfraction) {
    const infraction = await Infractions.create({
      ...opts,
    }).save()

    return infraction
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
