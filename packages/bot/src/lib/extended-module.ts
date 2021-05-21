import { AxiosInstance, AxiosResponse } from 'axios'
import * as StatsDClient from 'statsd-client'
import { Stage } from 'lunawork'
import { api } from './api'
import { statsd } from './statsd'
import { IInfraction } from './types'

export class ExtendedModule extends Stage {
  protected api: AxiosInstance = api
  protected stats: StatsDClient = statsd

  protected async addInfraction(
    opts: IInfraction,
  ): Promise<AxiosResponse<IInfraction>> {
    let resp: AxiosResponse<IInfraction>

    try {
      resp = await this.api.post('/infractions', {
        ...opts,
      })
    } catch (err) {
      throw new Error(err)
    }

    return resp
  }
}
