import * as express from 'express'
import { InteractionsStore } from '../lib/stores'

const store = new InteractionsStore()

export const handleDiscordInteraction = async (
  req: express.Request,
  res: express.Response,
) => {
  const resp = await store.handleDiscordInteraction(req)
  return res.json(resp)
}
