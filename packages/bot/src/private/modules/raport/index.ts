// Copyright (c) 2021 Siberian, Inc. All rights reserved.

import {
  LunaworkClient,
  applicationCommand,
  ApplicationCommandTypes,
  button,
} from '@siberianmh/lunawork'
import {
  ContextMenuInteraction,
  Message,
  GuildMember,
  TextChannel,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  ButtonInteraction,
  ThreadChannel,
} from 'discord.js'
import { ExtendedModule } from '../../../lib/extended-module'
import * as config from '../../../lib/config'
import { userInfoEmbed } from './embeds/user-info'
import { reportedMsgEmbed } from './embeds/reported-msg'
import { IReport } from '../../../lib/types/report'
import { randomUUID } from 'crypto'
import { InfractionsModule } from '../../../modules'
import { InfractionType, IRaport } from '../../../lib/types'

interface IMaintainReportProps {
  readonly member: GuildMember
  readonly reportedMessage?: Message
  readonly msg: ContextMenuInteraction
}

export class RaportStage extends ExtendedModule {
  private infractions: InfractionsModule

  public constructor(client: LunaworkClient) {
    super(client)

    this.infractions = new InfractionsModule(client)
  }

  //#region Interactions
  @applicationCommand({
    name: 'Report message',
    type: ApplicationCommandTypes.MESSAGE,
  })
  public async reportMessage(msg: ContextMenuInteraction) {
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    const targetMessage = msg.options.getMessage('message')

    if (!targetMessage) {
      return msg.reply({
        content: 'Seems something goes wrong.',
        ephemeral: true,
      })
    }

    if (
      !(targetMessage instanceof Message) ||
      !(targetMessage.member instanceof GuildMember)
    ) {
      return msg.reply({
        content: 'Seems something goes wrong',
        ephemeral: true,
      })
    }

    // Eventually, I think we don't need to take this very serious
    // if we result earlier but give more space after
    await msg.reply({
      content:
        'The process is started, thanks for helping making Electron Discord better.',
      ephemeral: true,
    })

    return this.maintainReport({
      member: targetMessage.member,
      reportedMessage: targetMessage,
      msg: msg,
    })
  }

  @applicationCommand({
    name: 'Report user',
    type: ApplicationCommandTypes.USER,
  })
  public async reportUser(msg: ContextMenuInteraction) {
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    const targetUser = msg.options.getUser('user')

    if (!targetUser) {
      return msg.reply({
        content: 'Seems something goes wrong.',
      })
    }

    const member = await (
      await this.client.guilds.fetch(config.guild.id)
    ).members.fetch(targetUser.id)

    // Eventually, I think we don't need to take this very serious
    // if we result earlier but give more space after
    await msg.reply({
      content:
        'The process is started, thanks for helping making Electron Discord better.',
      ephemeral: true,
    })

    return this.maintainReport({
      msg,
      member,
    })
  }

  @button({ customID: 'rp-ban' })
  public async banPerson(msg: ButtonInteraction) {
    const { data: report } = await this.api.get<IReport>(
      `/report/message/${msg.message.id}`,
    )

    const thread = (await this.client.channels.fetch(
      report.thread_id,
    )) as ThreadChannel

    await thread.send({
      content: 'Closing as per request',
    })

    await thread.setLocked()
    await thread.setArchived()

    await (msg.message as Message).edit({
      components: [],
    })

    const user = await this.client.users.fetch(report.user_id)

    await this.infractions.performInfraction({
      user: user,
      type: InfractionType.Ban,
      reason: 'You are banned due to big amount of reports.',
    })

    await this.api.delete(`/report/${report.user_id}`)

    return await msg.reply({
      content: 'And this is end.',
      ephemeral: true,
    })
  }

  @button({ customID: 'rp-kick' })
  public async kickPerson(msg: ButtonInteraction) {
    const { data: report } = await this.api.get<IReport>(
      `/report/message/${msg.message.id}`,
    )

    const thread = (await this.client.channels.fetch(
      report.thread_id,
    )) as ThreadChannel

    await thread.send({
      content: 'Closing as per request',
    })

    await thread.setLocked()
    await thread.setArchived()

    await (msg.message as Message).edit({
      components: [],
    })

    const user = await this.client.users.fetch(report.user_id)

    await this.infractions.performInfraction({
      user: user,
      type: InfractionType.Kick,
      reason: 'You are kicked due to big amount of reports.',
    })

    await this.api.delete(`/report/${report.user_id}`)

    return await msg.reply({
      content: 'And this is end.',
      ephemeral: true,
    })
  }

  @button({ customID: 'rp-close' })
  public async closeRaport(msg: ButtonInteraction) {
    const { data: report } = await this.api.get<IReport>(
      `/report/message/${msg.message.id}`,
    )

    const thread = (await this.client.channels.fetch(
      report.thread_id,
    )) as ThreadChannel

    await thread.send({
      content: 'Closing as per request',
    })

    await thread.setLocked()
    await thread.setArchived()

    await (msg.message as Message).edit({
      components: [],
    })

    await this.api.delete(`/report/${report.user_id}`)

    return await msg.reply({
      content: 'And this is end.',
      ephemeral: true,
    })
  }
  //#endregion

  private async maintainReport({
    msg,
    member,
    reportedMessage,
  }: IMaintainReportProps) {
    if (
      member.user.bot ||
      (!Array.isArray(member.roles) &&
        member.roles.cache.has(config.guild.roles.maintainer))
    ) {
      return msg.reply({
        content: "You can't report the bot or moderators",
        ephemeral: true,
      })
    }

    let createdRaport: IReport

    try {
      const { data } = await this.api.get<IRaport>(`/report/${member.user.id}`)
      createdRaport = data
    } catch {
      return this.createNewReport({ member, reportedMessage })
    }

    const thread = (await this.client.channels.fetch(
      createdRaport.thread_id,
    )) as ThreadChannel

    const embeds: Array<MessageEmbed> = []
    const reportedMessageInfo = reportedMsgEmbed(reportedMessage, member)

    if (reportedMessageInfo) {
      embeds.push(reportedMessageInfo)
    }

    return await thread.send({
      content: 'User is receive another report (from user ?)',
      embeds: embeds,
    })
  }

  private async createNewReport({
    member,
    reportedMessage = undefined,
  }: {
    member: GuildMember
    reportedMessage: Message | undefined
  }) {
    const memberLog = (await this.client.channels.fetch(
      config.guild.channels.memberLog,
    )) as TextChannel

    if (!memberLog) {
      console.error('Unable to find the member log channel')
      return
    }

    const userInfo = userInfoEmbed(member)
    const reportedMessageInfo = reportedMsgEmbed(reportedMessage, member)

    const embeds: Array<MessageEmbed> = [userInfo]

    if (reportedMessageInfo) {
      embeds.push(reportedMessageInfo)
    }

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('rp-ban')
        .setLabel('Ban')
        .setStyle('DANGER'),
      new MessageButton()
        .setCustomId('rp-kick')
        .setStyle('SECONDARY')
        .setLabel('Kick'),
      new MessageButton()
        .setCustomId('rp-close')
        .setStyle('SUCCESS')
        .setLabel('Close'),
    )

    const createdMessage = await memberLog.send({
      embeds,
      components: [row],
    })

    const thread = await createdMessage.startThread({
      autoArchiveDuration: 1440,
      name: `Report for ${member.user.username} (${randomUUID()})`,
      reason: 'Something goes out of standard',
    })

    await thread.send({
      content:
        'This thread is can be used for disscussion, also here will be appear another reports for the specific user.',
    })

    await this.api.post('/report', {
      user_id: member.user.id,
      message_id: createdMessage.id,
      thread_id: thread.id,
    })

    return
  }
}
