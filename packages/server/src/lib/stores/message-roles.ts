// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import * as express from 'express'
import { MessageRoles, MessageRolesActions } from '../../entities/roles'

export class MessageRolesStore {
  public async getMessageRole(req: express.Request) {
    const { id } = req.params

    if (!id) {
      return {
        status: 400,
        message: 'Invalid data',
      }
    }

    const entry = await MessageRoles.findOne({
      where: { message_id: id },
    })

    if (!entry) {
      return {
        status: 404,
        message: 'Not Found',
      }
    }

    return entry
  }

  public async createMessageRole(req: express.Request) {
    const { name, message_id } = req.body

    if (!name || !message_id) {
      return {
        status: 400,
        message: 'Invalid data',
      }
    }

    const dbEntry = MessageRoles.create({
      name: name,
      message_id: message_id,
    })

    await dbEntry.save()

    return dbEntry
  }

  public async getMessageRolesActions(_req: express.Request) {
    const actions = await MessageRolesActions.find({
      relations: ['message_role'],
    })
    return actions
  }

  public async createMessageRolesAction(req: express.Request) {
    const { role_id, emoji_id, auto_remove, message_role } = req.body

    // if (!role_id || !emoji_id || !auto_remove || !message_role) {
    //   return {
    //     status: 400,
    //     message: 'Invalid data',
    //   }
    // }

    const entry = MessageRolesActions.create({
      role_id: role_id,
      emoji_id: emoji_id,
      auto_remove: auto_remove,
      message_role: message_role,
    })

    await entry.save()

    return entry
  }
}
