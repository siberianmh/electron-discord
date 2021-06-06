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
        name: 'ver.1.22474487139...',
      },
    ],
  },
})
