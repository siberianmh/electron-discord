import * as express from 'express'
import axios from 'axios'

export class WebhookStore {
  public async handleEpuppyHook(req: express.Request) {
    const { body } = req

    const valid = this.validateToken(req)

    if (!valid) {
      return {
        status: 403,
        message: 'Bad credentials',
      }
    }

    const message = `There a new release available: **Electron v${body.version}**\n\nhttps://github.com/electron/electron/releases/tag/v${body.version}`

    await axios.post(process.env.EPUPPY_HOOK as string, {
      content: message,
    })

    return {
      status: 200,
      message: 'Success',
    }
  }

  private validateToken(req: express.Request) {
    if (!req.headers['authorization']) {
      return false
    }

    const [prefix, token] = req.headers['authorization'].split(' ')

    if (prefix !== 'Bearer') {
      return false
    }

    if (token !== process.env.SERVER_TOKEN) {
      return false
    }

    return true
  }
}
