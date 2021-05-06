import * as express from 'express'

export const hello = (_req: express.Request, res: express.Response) => {
  return res.status(200).json({
    message: 'You found a our secret place',
    status: 200,
  })
}
