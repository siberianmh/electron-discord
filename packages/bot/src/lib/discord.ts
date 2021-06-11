import { LunaworkClient } from 'lunawork'
import { Intents } from 'discord.js'

export const client = new LunaworkClient({
  defaultPrefix: ['!', 'e!', '.'],
  intents: Intents.ALL,
  partials: ['REACTION', 'MESSAGE', 'USER', 'CHANNEL'],
  retryLimit: 3,
  experimental: {
    autoRegisterSlash: true,
  },
  presence: {
    activities: [
      {
        type: 'PLAYING',
        name: 'дальше только космос',
      },
    ],
  },
})
