import { createConnection, Connection } from 'typeorm'
import * as path from 'path'
import { Mail } from '../entities/mail'

export const connectMySQL = (): Promise<Connection> => {
  const entitiesDir = path.resolve(__dirname, '../entities/**/*.js')

  return process.env.NODE_ENV === 'development'
    ? createConnection({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: process.env.MYSQL_USERNAME || 'root',
        password: process.env.MYSQL_PASSWORD || 'root',
        database: 'the_board_dev',
        logging: true,
        entities: [entitiesDir],
        charset: 'utf8mb4_unicode_ci',
      })
    : createConnection({
        type: 'mysql',
        host: process.env.MYSQL_HOST,
        port: 3306,
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: 'the_board',
        logging: true,
        entities: [Mail],
        charset: 'utf8mb4_unicode_ci',
        synchronize: true,
        cache: {
          type: 'ioredis',
          options: {
            type: process.env.REDIS_URL,
            port: 6379,
          },
        },
      })
}
