// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

let config: typeof import('./config.default')

try {
  config = require('./config-that-just-used-for.dev')
} catch (err: any) {
  if (!err || err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }

  console.log('WARNING: Unable to find custom config, using default')
  config = require('./config.default')
}

export = config
