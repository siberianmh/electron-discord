// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import * as express from 'express'
import { WebhookStore } from '../lib/stores'

const store = new WebhookStore()

export const handleEpuppyHook = async (
  req: express.Request,
  res: express.Response,
) => {
  res.status(201).json({
    status: 201,
    message: 'Accepted',
  })

  return await store.handleEpuppyHook(req)
}
