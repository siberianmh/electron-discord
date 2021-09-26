if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({
    path: `${process.env.BUILD_WORKSPACE_DIRECTORY}/.env` ?? undefined,
  })
}
import { Client, Intents } from 'discord.js'

const guildId =
  process.env.NODE_ENV === 'development'
    ? '715327188307804341'
    : '745037351163527189'

const unverefRole =
  process.env.NODE_ENV === 'development'
    ? '767473838090878976'
    : '781303266562015242'

const kickedMessage =
  'Hello! You have been kicked from Electron Discord as you have failed to accept our rules. If this was an accident, please feel free to join us again!\n\nhttps://discord.gg/electron'

const client = new Client({
  intents:
    Intents.FLAGS.GUILDS |
    Intents.FLAGS.GUILD_PRESENCES |
    Intents.FLAGS.GUILD_MESSAGES |
    Intents.FLAGS.GUILD_BANS |
    Intents.FLAGS.GUILD_MEMBERS,
  partials: ['REACTION', 'MESSAGE', 'USER', 'CHANNEL'],
})

client.login(process.env.DISCORD_TOKEN)

client.on('ready', async () => {
  console.log(`Logged in as ${client.user!.tag}`)

  const unverefMembers = [
    ...(await client.guilds.fetch(guildId)).roles.cache
      .get(unverefRole)
      ?.members!.values()!,
  ]

  for (let i = 0; i < 25; i++) {
    const member = unverefMembers[i]

    if (!member) {
      continue
    }

    console.log(`[${member.user.tag}] Started kicking of ${member.user.tag}`)
    // We may fail this because user can have closed DMs
    try {
      console.log(`[${member.user.tag}] Sending DM about kicking`)
      if (process.env.NODE_ENV !== 'development') {
        await member.user.send(kickedMessage)
      }
    } catch (e) {
      // Ignore, it isn't make sense to do something here.
      console.log(`[${member.user.tag}] Unable to send DM 😐`)
    } finally {
      // But we anyway should kick them
      console.log(`[${member.user.tag}] Kicking`)
      if (process.env.NODE_ENV !== 'development') {
        await member.kick('Failing accepting our rules.')
      }
    }
  }

  return process.exit(0)
})
