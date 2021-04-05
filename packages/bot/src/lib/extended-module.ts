import { AxiosInstance } from 'axios'
import * as StatsDClient from 'statsd-client'
import { Module } from 'cookiecord'
import { api } from './api'
import { statsd } from './statsd'

export class ExtendedModule extends Module {
  protected api: AxiosInstance = api
  protected stats: StatsDClient = statsd
}
