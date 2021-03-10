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
  return res.json(resp)
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
