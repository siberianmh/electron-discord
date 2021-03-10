import * as express from 'express'
import { Infractions } from '../../entities/infractions'
import { InfractionType } from '../types'

export class InfractionsStore {
  public async createInfraction(req: express.Request) {
    const {
      user_id,
      actor_id,
      reason,
      type,
    }: {
      user_id: string
      actor_id: string
      reason: string
      type: InfractionType
    } = req.body

    if (!user_id || !actor_id || !reason) {
      return {
        status: 400,
        message: 'Invalid data',
      }
    }

    const infraction = Infractions.create({
      user_id: user_id,
      actor_id: actor_id,
      reason: reason,
      type: type,
    })

    await infraction.save()

    return infraction
  }
}
