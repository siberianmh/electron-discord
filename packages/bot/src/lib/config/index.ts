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
