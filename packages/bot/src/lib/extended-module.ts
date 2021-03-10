import { AxiosInstance } from 'axios'
import { Module } from 'cookiecord'
import { api } from './api'

export class ExtendedModule extends Module {
  protected api: AxiosInstance = api
}
