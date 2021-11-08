// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import * as express from 'express'
import { HelpChannelStore } from '../lib/stores'

const store = new HelpChannelStore()

export const listHelpChannels = async (
  req: express.Request,
  res: express.Response,
) => {
  const resp = await store.listHelpChannels(req)
  return res.json(resp)
}

export const getHelpChannelByUserId = async (
  req: express.Request,
  res: express.Response,
) => {
  const resp = await store.getHelpChannelByUserId(req)

  if ('id' in resp) {
    return res.json(resp)
  }

  return res.status(resp.status).json(resp)
}

export const getHelpChannelByChannelId = async (
  req: express.Request,
  res: express.Response,
) => {
  const resp = await store.getHelpChannelByChannelId(req)
  return res.json(resp)
}

export const createHelpChannel = async (
  req: express.Request,
  res: express.Response,
) => {
  const resp = await store.createHelpChannel(req)
  return res.json(resp)
}

export const deleteHelpChannel = async (
  req: express.Request,
  res: express.Response,
) => {
  const resp = await store.deleteHelpChannel(req)
  return res.json(resp)
}
