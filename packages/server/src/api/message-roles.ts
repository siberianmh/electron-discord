import * as express from 'express'
import { MessageRolesStore } from '../lib/stores'

const store = new MessageRolesStore()

export const getMessageRole = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (req.params.id === 'actions') {
    return next()
  }

  const resp = await store.getMessageRole(req)
  return res.json(resp)
}

export const createMessageRole = async (
  req: express.Request,
  res: express.Response,
) => {
  const resp = await store.createMessageRole(req)
  return res.json(resp)
}

export const getMessageRolesActions = async (
  req: express.Request,
  res: express.Response,
) => {
  const resp = await store.getMessageRolesActions(req)
  return res.json(resp)
}

export const createMessageRolesAction = async (
  req: express.Request,
  res: express.Response,
) => {
  const resp = await store.createMessageRolesAction(req)
  return res.json(resp)
}
