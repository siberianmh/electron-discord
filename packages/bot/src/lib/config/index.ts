let config: typeof import('./config.default')

try {
  config = require('./config')
} catch (err) {
  if (!err || err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }

  console.log('WARNING: Unable to find custom config, using default')
  config = require('./config.default')
}

export = config
