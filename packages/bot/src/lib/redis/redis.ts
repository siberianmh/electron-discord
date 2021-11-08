// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import * as Redis from 'ioredis'

export const redis =
  process.env.NODE_ENV === 'development'
    ? new Redis()
    : new Redis(process.env.REDIS_URL)
