import * as express from 'express'

export const requiresBotAuth = (
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
  // Ensure prefix is Bot
  if (prefix !== 'Bot') {
    return res.status(401).json({
      message: 'Bad credentials',
      status: 401,
    })
  }

  if (process.env.SERVER_TOKEN !== token) {
    return res.status(401).json({
      message: 'Bad credentials',
      status: 401,
    })
  }

  return next()
}
