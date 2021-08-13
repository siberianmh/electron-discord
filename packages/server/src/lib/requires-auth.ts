import * as express from 'express'
import { validateUUID } from './uuid'
import { AccessTokenStore } from './stores'

const store = new AccessTokenStore()

export const requiresBotAuth = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (process.env.NODE_ENV === 'development') {
    return next()
  }

  if (!req.headers['authorization']) {
    return res.status(401).json({
      message: 'Bad credentials',
      status: 401,
    })
  }

  if (req.headers.authorization.includes('Basic')) {
    return res.status(401).json({
      message: 'Authorization using Basic is not supported.',
      status: 401,
    })
  }

  const [prefix, token] = req.headers['authorization'].split(' ')
  // Ensure prefix is Bot or Bearer
  if (prefix !== 'Bot' && prefix !== 'Bearer') {
    return res.status(401).json({
      message: 'Bad credentials',
      status: 401,
    })
  }

  const validUUID = validateUUID(token)

  if (!validUUID) {
    return res.status(401).json({
      message: 'Bad credentials',
      status: 401,
    })
  }

  const valid = await store.validateToken(token)

  if (!valid) {
    return res.status(401).json({
      message: 'Bad credentials',
      status: 401,
    })
  }

  return next()
}
