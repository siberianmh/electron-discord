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

// Infractions
import { createInfraction } from './infractions'
//#endregion

//#region Usage

// Meta
router.get('/', hello)

// Infractions
router.post('/infractions', requiresBotAuth, createInfraction)

//#endregion

export const apiRoutes = router as express.Router
