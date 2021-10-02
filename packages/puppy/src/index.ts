if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}
import { connectMongoDB } from './lib/connect'
import { collect } from './collect'
import { twitter } from './twitter'

async function main() {
  await connectMongoDB({ database: 'electron-releases' })
  await collect()
  await twitter()

  return process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
