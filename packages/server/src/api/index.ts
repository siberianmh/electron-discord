import * as express from 'express'
import { verifyKeyMiddleware } from 'discord-interactions'
import { requiresBotAuth } from '../lib/requires-auth'
import { discordPublicKey } from '../lib/config'

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

// Interactions
import { handleDiscordInteraction } from './interactions'

// Webhooks
import { handleEpuppyHook } from './webhooks'
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

// Discord Iteractions
router.post(
  '/iteractions',
  verifyKeyMiddleware(discordPublicKey),
  handleDiscordInteraction,
)

// Discord Webhooks
router.post('/epuppy-hook', requiresBotAuth, handleEpuppyHook)
//#endregion

export const apiRoutes = router as express.Router
