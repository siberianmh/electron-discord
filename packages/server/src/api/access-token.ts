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
