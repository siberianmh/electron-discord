const __dev__ = process.env.NODE_ENV === 'development'

export const enableThreadHelp =
  __dev__ || process.env.ENABLE_THREAD_CHANNELS === 'true'
