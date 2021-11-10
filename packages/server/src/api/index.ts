// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import * as express from 'express'
import { requiresBotAuth } from '../lib/requires-auth'

const router = express.Router()

//#region Imports

// Meta
import { hello } from './meta'

// Help Channels
import {
  listHelpChannels,
  createHelpChannel,
  getHelpChannelByUserId,
  getHelpChannelByChannelId,
  deleteHelpChannel,
} from './help-chan'

// Infractions
import { createInfraction } from './infractions'

// Message Roles
import {
  getMessageRole,
  createMessageRole,
  getMessageRolesActions,
  createMessageRolesAction,
} from './message-roles'
//#endregion

//#region Usage

// Meta
router.get('/', hello)

// Help Channels
router.get('/helpchan', requiresBotAuth, listHelpChannels)
router.get('/helpchan/user/:user_id', requiresBotAuth, getHelpChannelByUserId)
router.get('/helpchan/:channel_id', requiresBotAuth, getHelpChannelByChannelId)
router.post('/helpchan', requiresBotAuth, createHelpChannel)
router.delete('/helpchan/:channel_id', requiresBotAuth, deleteHelpChannel)

// Infractions
router.post('/infractions', requiresBotAuth, createInfraction)

// Message Roles
router.get('/message-roles/:id', requiresBotAuth, getMessageRole)
router.post('/message-roles', requiresBotAuth, createMessageRole)
router.get('/message-roles/actions', requiresBotAuth, getMessageRolesActions)
router.post('/message-roles/actions', requiresBotAuth, createMessageRolesAction)

//#endregion

export const apiRoutes = router as express.Router
