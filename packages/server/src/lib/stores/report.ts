// Copyright (c) 2021 Siberian, Inc. All rights reserved.

import * as express from 'express'
import { Report } from '../../entities/report'
import { ExpressError } from '../error'

export class ReportStore {
  public async getReportForUser(req: express.Request) {
    const { user_id } = req.params

    if (!user_id) {
      return new ExpressError({
        status: 400,
        message: 'Invalid data',
      })
    }

    const report = await Report.findOne({ where: { user_id: user_id } })

    if (!report) {
      return new ExpressError({
        status: 404,
        message: 'Entity not found',
      })
    }

    return report
  }

  public async getReportByMessage(req: express.Request) {
    const { msg_id } = req.params

    if (!msg_id) {
      return new ExpressError({
        status: 400,
        message: 'Invalid data',
      })
    }

    const report = await Report.findOne({ where: { message_id: msg_id } })

    if (!report) {
      return new ExpressError({
        status: 404,
        message: 'Entity not found',
      })
    }

    return report
  }

  public async createReport(req: express.Request) {
    const { user_id, message_id, thread_id } = req.body

    if (!user_id || !message_id || !thread_id) {
      return new ExpressError({
        status: 400,
        message: 'Missing data',
      })
    }

    const reportEntry = Report.create({
      user_id: user_id,
      message_id: message_id,
      thread_id: thread_id,
      count: 1,
    })

    await reportEntry.save()

    return reportEntry
  }

  public async deleteReport(req: express.Request) {
    const { user_id } = req.params

    if (!user_id) {
      return new ExpressError({
        status: 400,
        message: 'Missing data',
      })
    }

    await Report.delete({ user_id: user_id })

    return {
      status: 204,
    }
  }
}
