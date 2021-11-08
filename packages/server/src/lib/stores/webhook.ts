// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import * as express from 'express'
import axios from 'axios'

export class WebhookStore {
  public async handleEpuppyHook(req: express.Request) {
    const { body } = req

    const message = `There a new release available: **Electron v${body.version}**\n\nhttps://github.com/electron/electron/releases/tag/v${body.version}`

    await axios.post(process.env.EPUPPY_HOOK as string, {
      content: message,
    })

    return {
      status: 200,
      message: 'Success',
    }
  }
}
