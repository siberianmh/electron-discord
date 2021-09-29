import * as express from 'express'
import { HelpChannel } from '../../entities/help-channel'
import { ExpressError } from '../error'

export class HelpChannelStore {
  public async listHelpChannels(_req: express.Request) {
    const channels = await HelpChannel.find()
    return channels
  }

  public async getHelpChannelByUserId(req: express.Request) {
    const { user_id } = req.params

    const channel = await HelpChannel.findOne({ where: { user_id: user_id } })

    if (!channel) {
      return {
        message: 'User not found',
        status: 404,
      }
    }

    return channel
  }

  public async getHelpChannelByChannelId(req: express.Request) {
    const { channel_id } = req.params

    const channel = await HelpChannel.findOne({
      where: { channel_id: channel_id },
    })

    if (!channel) {
      return {
        message: 'Channel not found',
        status: 404,
      }
    }

    return channel
  }

  public async createHelpChannel(req: express.Request) {
    const { user_id, channel_id, message_id } = req.body

    if (!user_id || !channel_id || !message_id) {
      return {
        status: 400,
        message: 'Invalid data',
      }
    }

    const helpChannel = HelpChannel.create({
      user_id: user_id,
      channel_id: channel_id,
      message_id: message_id,
    })

    await helpChannel.save()

    return helpChannel
  }

  public async deleteHelpChannel(req: express.Request) {
    const { channel_id } = req.params

    if (!channel_id) {
      return new ExpressError({
        status: 400,
        message: 'Invalid data',
      })
    }

    await HelpChannel.delete({ channel_id: channel_id })
    return {
      status: 204,
    }
  }
}
