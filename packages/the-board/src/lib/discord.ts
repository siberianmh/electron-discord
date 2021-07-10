import { LunaworkClient } from '@siberianmh/lunawork'
import { Intents } from 'discord.js'

export const client = new LunaworkClient({
  defaultPrefix: ['tb!', '-'],
  intents: Intents.FLAGS.GUILDS,
  partials: ['CHANNEL', 'MESSAGE', 'REACTION'],
  retryLimit: 3,
  presence: {
    activities: [
      {
        type: 'LISTENING',
        name: 'DM reports!',
      },
    ],
  },
})
