// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import * as express from 'express'

const router = express.Router()

//#region Imports

// Meta
import { hello } from './meta'
//#endregion

//#region Usage

// Meta
router.get('/', hello)
//#endregion

export const apiRoutes = router as express.Router
