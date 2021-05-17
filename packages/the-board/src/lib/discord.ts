import { LunaworkClient } from 'lunawork'
import { Intents } from 'discord.js'

export const client = new LunaworkClient({
  defaultPrefix: ['tb!', '-'],
  intents: Intents.NON_PRIVILEGED,
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
