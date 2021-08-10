import { LunaworkClient } from '@siberianmh/lunawork'
import { Intents } from 'discord.js'

export const client = new LunaworkClient({
  intents: Intents.FLAGS.GUILDS | Intents.FLAGS.DIRECT_MESSAGES,
  partials: ['CHANNEL', 'MESSAGE', 'REACTION'],
  retryLimit: 3,
  // @ts-ignore | Update on the next lunawork update
  experimental: {
    autoRegisterSlash: true,
  },
  presence: {
    activities: [
      {
        type: 'LISTENING',
        name: 'DM reports!',
      },
    ],
  },
})
