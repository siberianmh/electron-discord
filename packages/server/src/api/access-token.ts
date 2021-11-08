// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import * as express from 'express'
import { AccessTokenStore } from '../lib/stores'

const store = new AccessTokenStore()

export const createAccessToken = async (
  req: express.Request,
  res: express.Response,
) => {
  const resp = await store.createAccessToken(req)
  return res.json(resp)
}
