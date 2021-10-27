if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

import { Stage } from '@siberianmh/lunawork'
import * as Sentry from '@sentry/node'
import {
  DownloadModule,
  DocsModule,
  CleanModule,
  EtcModule,
  ThreadHelpStage,
  HacktoberfestStage,
  HelpChanModule,
  HelpChannelStaff,
  InfractionsModule,
  ModLogModule,
  RobloxGamePresenceModule,
  RolesModule,
  RulesModule,
  TagsModule,
  UnfurlModule,
} from './modules'
import { client } from './lib/discord'
import { enableThreadHelp } from './lib/runtime'

import {
  AntimalwareStage,
  RaportStage,
  ModerationStuffStage,
} from './private/modules'

Sentry.init({
  dsn: 'https://a22da8923d5f4ea7875fa8518335410b@o102026.ingest.sentry.io/5474186',
  enabled: process.env.NODE_ENV !== 'development',
  tracesSampleRate: 1.0,
})

const stages: Array<typeof Stage | Stage> = [
  DownloadModule,
  DocsModule,
  CleanModule,
  EtcModule,
  HacktoberfestStage,
  HelpChanModule,
  HelpChannelStaff,
  InfractionsModule,
  ModLogModule,
  RobloxGamePresenceModule,
  RolesModule,
  RulesModule,
  TagsModule,
  UnfurlModule,
]

if (enableThreadHelp) {
  stages.push(ThreadHelpStage)
}

// Currently internal stages
stages.push(AntimalwareStage, RaportStage, ModerationStuffStage)

client.registerStages(stages)

client.login(process.env.DISCORD_TOKEN)
client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`)
})
