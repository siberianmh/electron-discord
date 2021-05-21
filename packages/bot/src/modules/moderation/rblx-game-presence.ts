import { LunaworkClient, listener } from 'lunawork'
import { Presence } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { style } from '../../lib/config'
import { rblxAutoKicker, redis } from '../../lib/redis'
import { ModLogModule } from './modlog'
import { InfractionsModule } from './infractions'
import { InfractionType } from '../../lib/types'

export class RblxGamePresenceModule extends ExtendedModule {
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

    let triggeredTimes: string | number | null = await redis.get(
      rblxAutoKicker(presence.user!.id),
    )

    if (!triggeredTimes) {
      triggeredTimes = 1
    }

    if (typeof triggeredTimes !== 'number') {
      triggeredTimes = parseInt(triggeredTimes, 10)
    }

    if (triggeredTimes >= 1) {
      const reason = 'You are using the bad Electron'

      await this.infractions.performInfraction({
        user: presence.member!.user,
        type: InfractionType.Kick,
        reason: reason,
      })
      return await this.modLog.sendLogMessage({
        colour: style.colors.red,
        title: `${presence.user?.tag} is kicked automatically by system`,
        text: 'This is automatic kick due to the member is playing in Electron.',
        iconURL:
          presence.user?.displayAvatarURL({ dynamic: false }) || undefined,
      })
    }

    triggeredTimes++
    await redis.set(
      rblxAutoKicker(presence.user!.id),
      triggeredTimes.toString(),
      'ex',
      60 * 60,
    )

    const message = `Games:
      ${presence.activities
        .map(
          (activity) =>
            `${activity.name} (${activity.details}) (${activity.type})`,
        )
        .join('\n')}`

    return await this.modLog.sendLogMessage({
      colour: style.colors.yellow,
      title: `${presence.user?.tag} (${presence.user?.id} is playing in bad games)`,
      iconURL: presence.user?.displayAvatarURL({ dynamic: false }) || undefined,
      text: message,
    })
  }
}
