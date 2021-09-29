import * as express from 'express'
import { InfractionsStore } from '../lib/stores'
import { ExpressError } from '../lib/error'

const store = new InfractionsStore()

export const createInfraction = async (
  req: express.Request,
  res: express.Response,
) => {
  const resp = await store.createInfraction(req)

  if (resp instanceof ExpressError) {
    return res.status(resp.status).json({
      message: resp.message,
      status: resp.status,
    })
  }

  return res.json(resp)
}
