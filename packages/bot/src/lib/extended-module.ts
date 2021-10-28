import { AxiosInstance, AxiosResponse } from 'axios'
import { Stage } from '@siberianmh/lunawork'
import { api } from './api'
import { IInfraction } from './types'

export class ExtendedModule extends Stage {
  protected api: AxiosInstance = api

  protected async addInfraction(
    opts: IInfraction,
  ): Promise<AxiosResponse<IInfraction>> {
    let resp: AxiosResponse<IInfraction>

    try {
      resp = await this.api.post('/infractions', {
        ...opts,
      })
    } catch (err: any) {
      throw new Error(err)
    }

    return resp
  }
}
