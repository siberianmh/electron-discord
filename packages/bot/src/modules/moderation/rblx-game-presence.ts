import { LunaworkClient, listener } from '@sib3/lunawork'
import { Presence } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { style } from '../../lib/config'
import { rblxAutoKicker, redis } from '../../lib/redis'
import { ModLogModule } from './modlog'
import { InfractionType } from '../../lib/types'

export class RblxGamePresenceModule extends ExtendedModule {
  private modLog: ModLogModule

  public constructor(client: LunaworkClient) {
    super(client)

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
      await presence.member?.kick('You are using the bad Electron 😥')

      await this.api.post('/infractions', {
        user_id: presence.member?.id,
        actor_id: '762678768032546819',
        reason: reason,
        type: InfractionType.Kick,
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
