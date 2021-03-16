if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({
    path: `${process.env.SIBERIAN_HOME}/.env` ?? undefined,
  })
}

import * as Sentry from '@sentry/node'
import {
  DownloadModule,
  DocsModule,
  CleanModule,
  EtcModule,
  HelpChanModule,
  HelpMessageModule,
  InformationModule,
  InfractionsModule,
  ModLogModule,
  RblxGamePresenceModule,
  RolesModule,
  RulesModule,
  SlowmodeModule,
  SourceModule,
  TagsModule,
  UnfurlModule,
} from './modules'
import { client } from './lib/discord'

if (process.env.NODE_ENV !== 'development') {
  Sentry.init({
    dsn:
      'https://a22da8923d5f4ea7875fa8518335410b@o102026.ingest.sentry.io/5474186',
    tracesSampleRate: 1.0,
  })
}

for (const mod of [
  DownloadModule,
  DocsModule,
  CleanModule,
  EtcModule,
  HelpChanModule,
  HelpMessageModule,
  InformationModule,
  InfractionsModule,
  ModLogModule,
  RblxGamePresenceModule,
  RolesModule,
  RulesModule,
  SlowmodeModule,
  SourceModule,
  TagsModule,
  UnfurlModule,
]) {
  client.registerModule(mod)
}

client.login(process.env.DISCORD_TOKEN)
client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`)
})