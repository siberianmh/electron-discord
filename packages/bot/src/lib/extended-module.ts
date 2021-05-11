import { AxiosInstance } from 'axios'
import * as StatsDClient from 'statsd-client'
import { Stage } from '@sib3/lunawork'
import { api } from './api'
import { statsd } from './statsd'
import { Logger, logger } from './logger'

export class ExtendedModule extends Stage {
  protected api: AxiosInstance = api
  protected stats: StatsDClient = statsd
  protected logger: Logger = logger
}
