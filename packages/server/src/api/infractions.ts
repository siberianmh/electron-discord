import * as express from 'express'
import { InfractionsStore } from '../lib/stores'

const store = new InfractionsStore()

export const createInfraction = async (
  req: express.Request,
  res: express.Response,
) => {
  const resp = await store.createInfraction(req)
  return res.json(resp)
}
