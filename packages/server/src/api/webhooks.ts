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
