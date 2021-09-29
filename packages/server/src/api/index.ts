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

// Webhooks
import { handleEpuppyHook } from './webhooks'

// Report
import {
  getReportForUser,
  getReportByMessage,
  createReport,
  deleteReport,
} from './report'
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

// Discord Webhooks
router.post('/epuppy-hook', requiresBotAuth, handleEpuppyHook)

// Report
router.get('/report/:user_id', requiresBotAuth, getReportForUser)
router.get('/report/message/:msg_id', requiresBotAuth, getReportByMessage)
router.post('/report', requiresBotAuth, createReport)
router.delete('/report/:user_id', requiresBotAuth, deleteReport)

//#endregion

export const apiRoutes = router as express.Router
