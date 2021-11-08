// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import * as express from 'express'
import { Infractions } from '../../entities/infractions'
import { InfractionType } from '../types'
import { ExpressError } from '../error'

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
      return new ExpressError({
        status: 400,
        message: 'Invalid data',
      })
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
