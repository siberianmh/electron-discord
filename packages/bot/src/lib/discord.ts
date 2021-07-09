import { LunaworkClient } from 'lunawork'
import { Intents } from 'discord.js'

export const client = new LunaworkClient({
  defaultPrefix: ['!', 'e!', '.'],
  intents:
    Intents.FLAGS.GUILDS |
    Intents.FLAGS.GUILD_PRESENCES |
    Intents.FLAGS.GUILD_MESSAGES |
    Intents.FLAGS.GUILD_BANS |
    Intents.FLAGS.GUILD_MEMBERS,
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
