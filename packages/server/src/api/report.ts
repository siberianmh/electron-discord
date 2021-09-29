// Copyright (c) 2021 Siberian, Inc. All rights reserved.

import * as express from 'express'
import { ReportStore } from '../lib/stores'
import { ExpressError } from '../lib/error'

const store = new ReportStore()

export const getReportForUser = async (
  req: express.Request,
  res: express.Response,
) => {
  const resp = await store.getReportForUser(req)

  if (resp instanceof ExpressError) {
    return res.status(resp.status).json({
      message: resp.message,
      status: resp.status,
    })
  }

  return res.json(resp)
}

export const getReportByMessage = async (
  req: express.Request,
  res: express.Response,
) => {
  const resp = await store.getReportByMessage(req)

  if (resp instanceof ExpressError) {
    return res.status(resp.status).json({
      message: resp.message,
      status: resp.status,
    })
  }

  return res.json(resp)
}

export const createReport = async (
  req: express.Request,
  res: express.Response,
) => {
  const resp = await store.createReport(req)

  if (resp instanceof ExpressError) {
    return res.status(resp.status).json({
      message: resp.message,
      status: resp.status,
    })
  }

  return res.json(resp)
}

export const deleteReport = async (
  req: express.Request,
  res: express.Response,
) => {
  const resp = await store.deleteReport(req)

  if (resp instanceof ExpressError) {
    return res.status(resp.status).json({
      message: resp.message,
      status: resp.status,
    })
  }

  return res.status(resp.status)
}
