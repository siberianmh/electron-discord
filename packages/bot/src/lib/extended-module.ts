import { AxiosInstance } from 'axios'
import * as StatsDClient from 'statsd-client'
import { Stage } from 'lunawork'
import { api } from './api'
import { statsd } from './statsd'

export class ExtendedModule extends Stage {
  protected api: AxiosInstance = api
  protected stats: StatsDClient = statsd
}
