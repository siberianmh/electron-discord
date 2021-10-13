const __dev__ = process.env.NODE_ENV === 'development'

export const enableThreadHelp =
  __dev__ || process.env.ENABLE_THREAD_CHANNELS === 'true'

/**
 * Does this should use Electron values. Use if some value in process of
 * migration is different from ours.
 */
export const IS_ELECTRON_BUILD = process.env.IS_ELECTRON_BUILD === 'true'
