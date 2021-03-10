import * as express from 'express'

const router = express.Router()

import { requiresBotAuth } from '../lib/requires-auth'

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

// Webhooks
import { handleEpuppyHook } from './webhooks'
//#endregion

//#region Usage

// Meta
router.get('/', hello)

// Help Channels
router.get('/helpchan', requiresBotAuth, listHelpChannels)
// TODO: In some period of life this should be changed to /helpchan/user/:user_id
//       and /helpchan/:channel_id
router.get('/helpchan/:user_id', requiresBotAuth, getHelpChannelByUserId)
router.get(
  '/helpchan/custom/:channel_id',
  requiresBotAuth,
  getHelpChannelByChannelId,
)
router.post('/helpchan', requiresBotAuth, createHelpChannel)
router.delete('/helpchan/:channel_id', requiresBotAuth, deleteHelpChannel)

// Infractions
router.post('/infractions', requiresBotAuth, createInfraction)

// Message Roles
router.get('/message-roles/:id', requiresBotAuth, getMessageRole)
router.post('/message-roles', requiresBotAuth, createMessageRole)
router.get('/message-roles/actions', requiresBotAuth, getMessageRolesActions)
router.post('/message-roles/actions', requiresBotAuth, createMessageRolesAction)

// Discord Webhooks
router.post('/epuppy-hook', handleEpuppyHook)
//#endregion

export const apiRoutes = router as express.Router
