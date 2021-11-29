// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

import { Stage } from '@siberianmh/lunawork'
import * as Sentry from '@sentry/node'
import {
  AntimalwareStage,
  FiltersStage,
  DownloadModule,
  DocsModule,
  EtcModule,
  ThreadHelpStage,
  HacktoberfestStage,
  HelpChanModule,
  HelpChannelStaff,
  InfractionsModule,
  ModLogModule,
  MiscStuffStage,
  RobloxGamePresenceModule,
  RolesModule,
  RulesModule,
  TagsModule,
  UnfurlModule,
} from './modules'
import { client } from './lib/discord'
import { connectMySQL } from './lib/connect-mysql'
import { enableRolesModule, enableThreadHelp } from './lib/runtime'

Sentry.init({
  dsn: 'https://a22da8923d5f4ea7875fa8518335410b@o102026.ingest.sentry.io/5474186',
  enabled: process.env.NODE_ENV !== 'development',
  tracesSampleRate: 1.0,
})

const stages: Array<typeof Stage | Stage> = [
  AntimalwareStage,
  FiltersStage,
  MiscStuffStage,
  DownloadModule,
  DocsModule,
  EtcModule,
  HacktoberfestStage,
  HelpChanModule,
  HelpChannelStaff,
  InfractionsModule,
  ModLogModule,
  RobloxGamePresenceModule,
  RulesModule,
  TagsModule,
  UnfurlModule,
]

if (enableThreadHelp) {
  stages.push(ThreadHelpStage)
}

if (enableRolesModule) {
  stages.push(RolesModule)
}

client.registerStages(stages)

connectMySQL().then(() => {
  client.login(process.env.DISCORD_TOKEN)
  client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}`)
  })
})
