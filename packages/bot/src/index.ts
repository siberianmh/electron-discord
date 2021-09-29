if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({
    path: `${process.env.BUILD_WORKSPACE_DIRECTORY}/.env` ?? undefined,
  })
}

import { Stage } from '@siberianmh/lunawork'
import * as Sentry from '@sentry/node'
import {
  DownloadModule,
  DocsModule,
  CleanModule,
  EtcModule,
  ThreadHelpStage,
  HelpChanModule,
  HelpChannelStaff,
  InfractionsModule,
  ModLogModule,
  RblxGamePresenceModule,
  RolesModule,
  RulesModule,
  SlowmodeModule,
  SourceModule,
  StatsModule,
  TagsModule,
  UnfurlModule,
} from './modules'
import { client } from './lib/discord'
import { enableThreadHelp } from './lib/runtime'

import { AntimalwareStage, RaportStage } from './private/modules'

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
  HelpChanModule,
  HelpChannelStaff,
  InfractionsModule,
  ModLogModule,
  RblxGamePresenceModule,
  RolesModule,
  RulesModule,
  SlowmodeModule,
  SourceModule,
  StatsModule,
  TagsModule,
  UnfurlModule,
]

if (enableThreadHelp) {
  stages.push(ThreadHelpStage)
}

// Currently internal stages
stages.push(AntimalwareStage, RaportStage)

client.registerStages(stages)

client.login(process.env.DISCORD_TOKEN)
client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`)
})
