import 'reflect-metadata'
import * as express from 'express'
import * as bodyParser from 'body-parser'

import { connectMySQL } from './lib/connect-mysql'
import { apiRoutes } from './api'

const app = express()
const port = process.env.PORT || 5000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', apiRoutes)

connectMySQL().then(() => {
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
  })
})
