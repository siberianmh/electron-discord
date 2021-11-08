// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { LunaworkClient, listener } from '@siberianmh/lunawork'
import { TextChannel, Message } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { guild } from '../../lib/config'
import { deepEqual } from '../../lib/deep-equal'
import { rulesText } from './rules-text'
import { voiceRulesText } from './voice-rules'

export class RulesModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  @listener({ event: 'ready' })
  public async syncRules(): Promise<Message | undefined> {
    const rulesChannel = (await this.client.channels.fetch(
      guild.channels.rules,
    )) as TextChannel
    const lastMessage = (await rulesChannel.messages.fetch()).last()

    if (lastMessage && !lastMessage.author.bot) {
      await lastMessage.delete()
      return await rulesChannel.send({ embeds: [rulesText()] })
    }

    if (!lastMessage) {
      return await rulesChannel.send({ embeds: [rulesText()] })
    }

    if (!deepEqual(lastMessage.embeds[0].fields, rulesText().fields)) {
      await lastMessage.delete()
      return await rulesChannel.send({ embeds: [rulesText()] })
    }

    return
  }

  @listener({ event: 'ready' })
  public async syncVoiceRules(): Promise<Message | undefined> {
    if (process.env.NODE_ENV === 'development') {
      return
    }

    const rulesChannel = (await this.client.channels.fetch(
      guild.channels.voiceRules,
    )) as TextChannel
    const lastMessage = (await rulesChannel.messages.fetch()).last()

    if (lastMessage && !lastMessage.author.bot) {
      await lastMessage.delete()
      return await rulesChannel.send({ embeds: [voiceRulesText()] })
    }

    if (!lastMessage) {
      return await rulesChannel.send({ embeds: [voiceRulesText()] })
    }

    if (!deepEqual(lastMessage.embeds[0].fields, voiceRulesText().fields)) {
      await lastMessage.delete()
      return await rulesChannel.send({ embeds: [voiceRulesText()] })
    }

    return
  }
}
