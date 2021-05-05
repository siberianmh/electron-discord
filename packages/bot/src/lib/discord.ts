import CookiecordClient from 'cookiecord'
import { Intents } from 'discord.js'

export const client = new CookiecordClient(
  {
    prefix: ['!', 'e!', '.'],
  },
  {
    ws: { intents: Intents.ALL },
    partials: ['REACTION', 'MESSAGE', 'USER', 'CHANNEL'],
    retryLimit: 3,
    presence: {
      activity: {
        type: 'PLAYING',
        name: 'ver.1.22474487139...',
      },
    },
  },
)
