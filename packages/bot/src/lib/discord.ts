import { LunaworkClient } from '@siberianmh/lunawork'
import { Intents } from 'discord.js'

export const client = new LunaworkClient({
  defaultPrefix: ['!', 'e!', '.'],
  intents:
    // Used mostly in the moderation log's
    Intents.FLAGS.GUILDS |
    // Used mostly in the moderation log's
    Intents.FLAGS.GUILD_MEMBERS |
    // Used for moderation log's
    Intents.FLAGS.GUILD_BANS |
    // Used for Roblox Electron detection
    Intents.FLAGS.GUILD_PRESENCES |
    // The base required intent to make bot works
    Intents.FLAGS.GUILD_MESSAGES |
    // Used for self-destruct messages and #roles channel
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  partials: ['REACTION', 'MESSAGE', 'USER', 'CHANNEL'],
  retryLimit: 3,
  manageApplicationCommands: true,
  presence: {
    activities: [
      {
        type: 'WATCHING',
        name: 'Of Course I Still Love You',
      },
    ],
  },
})
