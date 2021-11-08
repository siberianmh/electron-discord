// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import * as express from 'express'

export const hello = (_req: express.Request, res: express.Response) => {
  return res.status(200).json({
    message: 'You found a our secret place',
    status: 200,
  })
}
