// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { LunaworkClient, listener } from '@siberianmh/lunawork'
import { Presence } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { style } from '../../lib/config'
import { redis } from '../../lib/redis'
import { ModLogModule } from '../moderation/modlog'
import { InfractionsModule } from '../moderation/infractions'
import { InfractionType } from '../../lib/types'

export class RobloxGamePresenceModule extends ExtendedModule {
  private modLog: ModLogModule
  private infractions: InfractionsModule

  public constructor(client: LunaworkClient) {
    super(client)

    this.infractions = new InfractionsModule(client)
    this.modLog = new ModLogModule(client)
  }

  @listener({ event: 'presenceUpdate' })
  public async onPresenceUpdate(_old_presence: Presence, presence: Presence) {
    let triggered = false

    presence.activities.forEach((activity) => {
      if (activity.name.toLowerCase().includes('spotify')) {
        triggered = false
      }

      if (activity.name === 'Electron') {
        triggered = true
      }
    })

    if (!triggered) {
      return
    }

    const reason = `We have detected that you are running the Roblox Electron exploit.

Using and sharing exploits is against the Discord terms of service https://discord.com/terms
and may result in a Discord-wide ban.`

    await this.infractions.performInfraction({
      user: presence.member!.user,
      type: InfractionType.Kick,
      reason: reason,
    })

    return await this.modLog.sendLogMessage({
      colour: style.colors.red,
      title: `${presence.user?.tag} is kicked automatically by the system`,
      text: 'This is an automatic kick due to the member using the Roblox Electron exploit.',
      iconURL: presence.user?.displayAvatarURL({ dynamic: false }) || undefined,
    })
  }
}
