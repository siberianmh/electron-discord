// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import axios, { AxiosRequestHeaders } from 'axios'

const baseURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : process.env.SERVER_URL_OVERRIDE ??
      'http://edis-server.default.svc.cluster.local:8080'

const headers: AxiosRequestHeaders =
  process.env.NODE_ENV === 'development'
    ? {}
    : { Authorization: `Bot ${process.env.SERVER_TOKEN}` }

export const api = axios.create({
  withCredentials: true,
  baseURL,
  headers,
})
