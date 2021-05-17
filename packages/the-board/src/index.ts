if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({
    path: `${process.env.SIBERIAN_HOME}/.env` ?? undefined,
  })
}

import { client } from './lib/discord'
import { EtcModule } from './modules'

for (const stage of [EtcModule]) {
  client.registerStage(stage)
}

client.login(process.env.DISCORD_TOKEN)
client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`)
})
