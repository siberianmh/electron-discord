import * as StatsDClient from 'statsd-client'

const host =
  process.env.NODE_ENV === 'development' ? 'localhost' : process.env.STATSD_HOST

export const statsd = new StatsDClient({
  prefix: 'edis_bot',
  host,
})
