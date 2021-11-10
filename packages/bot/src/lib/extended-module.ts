// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { Stage } from '@siberianmh/lunawork'
import { IInfraction } from './types'
import { Infractions } from '../entities/infractions'

export class ExtendedModule extends Stage {
  protected async addInfraction(opts: IInfraction) {
    const infraction = await Infractions.create({
      ...opts,
    }).save()

    return infraction
  }
}
