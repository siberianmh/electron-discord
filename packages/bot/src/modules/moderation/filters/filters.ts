// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { LunaworkClient, listener } from '@siberianmh/lunawork'
import { Message, Permissions, User } from 'discord.js'
import { ExtendedModule } from '../../../lib/extended-module'
import { ModLogModule } from '../../../modules/moderation'
import { guild, style } from '../../../lib/config'
import { Awaited } from '../../../lib/types'
import { formatUser } from '../../../lib/format'

interface IFilter {
  /**
   * The name for the filter
   */
  readonly name: string
  /**
   * Does this filter is enabled?
   */
  readonly enabled: boolean
  /**
   * The function what's run to check if the filter is applied to
   * the provided message.
   *
   * @param {Message} msg The base message
   * @returns {Awaited<boolean>} Does this filter is appliaed to provided message
   */
  readonly fn: (msg: Message) => Awaited<boolean>
  /**
   * The reason that will be send to the user, or not.
   */
  readonly notifyMessage: string
}

const EVERYONE_PING: RegExp = new RegExp(`@everyone|<@&${guild.id}|@here`)

export class FiltersStage extends ExtendedModule {
  private modLog: ModLogModule

  public constructor(client: LunaworkClient) {
    super(client)

    this.modLog = new ModLogModule(client)
  }

  private filters: Array<IFilter> = [
    {
      name: 'Forbid Everyone ping',
      enabled: true,
      fn: this.hasEveryonePing,
      notifyMessage:
        "Plese don't try to ping `@everyone` or `@here`. Your messages has been removed.",
    },
  ]

  /**
   * Runs the filters, if the message is follow the one of the filters,
   * deletes the message, tries to notify the user (if not possible,
   * we don't send the message in channel to not continue spam).
   */
  @listener({ event: 'messageCreate' })
  public async onMessage(msg: Message): Promise<void> {
    if (
      msg.author.bot ||
      msg.webhookId ||
      (typeof msg.member?.presence !== 'string' &&
        msg.member?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) ||
      (Array.isArray(msg.member?.roles) &&
        msg.member?.roles.cache.has(guild.roles.maintainer))
    ) {
      return
    }

    for (const filter of this.filters) {
      if (!filter.enabled) {
        continue
      }

      const result = filter.fn(msg)

      if (result instanceof Promise) {
        await result
      }

      if (!result) {
        continue
      }

      // Notify the user
      await this.notifyTheUser(msg.author, filter.notifyMessage)
      // And then delete the message
      await msg.delete()

      await this.modLog.sendLogMessage({
        colour: style.colors.softRed,
        title: `${filter.name} is triggered`,
        text: formatUser(msg.member!),
      })

      // Does not make sense to run more filters since the message is deleted.
      break
    }
  }

  /**
   * Checks if the message is contains the `@everyone` or `@@everyone`,
   * or `@here` in the message.
   */
  private hasEveryonePing(msg: Message): boolean {
    const hasEveryonePing = EVERYONE_PING.test(msg.cleanContent)

    if (hasEveryonePing) {
      return true
    }

    return false
  }

  private async notifyTheUser(user: User, message: string) {
    try {
      await user.send(message)
    } catch {
      // skip, user has lock the dm 🥏
    }
  }
}
