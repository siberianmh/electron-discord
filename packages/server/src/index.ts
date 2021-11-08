// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import 'reflect-metadata'
import * as express from 'express'
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'

import { connectMySQL } from './lib/connect-mysql'
import { apiRoutes } from './api'

const app = express()
const port = process.env.PORT || 5000

Sentry.init({
  dsn: 'https://a22da8923d5f4ea7875fa8518335410b@o102026.ingest.sentry.io/5474186',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
})

app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.tracingHandler())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', apiRoutes)

app.use(Sentry.Handlers.errorHandler())

connectMySQL().then(() => {
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
  })
})
