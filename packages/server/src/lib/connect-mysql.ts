import { createConnection, Connection } from 'typeorm'
import * as path from 'path'
import { HelpChannel } from '../entities/help-channel'
import { Infractions } from '../entities/infractions'
import { MessageRoles, MessageRolesActions } from '../entities/roles'
import { AccessToken } from '../entities/access-token'
import { Report as ReportModel } from '../entities/report'

export const connectMySQL = (): Promise<Connection> => {
  return process.env.NODE_ENV === 'development'
    ? createConnection({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: process.env.MYSQL_USERNAME || 'root',
        password: process.env.MYSQL_PASSWORD || 'root',
        database: 'edis_dev',
        synchronize: true,
        logging: true,
        entities: ['src/entities/**/*.ts'],
        migrations: ['src/migration/**/*.ts'],
        subscribers: ['src/subscriber/**/*.ts'],
        charset: 'utf8mb4_unicode_ci',
        cli: {
          entitiesDir: 'src/entites',
          migrationsDir: 'src/migration',
          subscribersDir: 'src/subscriber',
        },
      })
    : createConnection({
        type: 'mysql',
        host: process.env.MYSQL_HOST,
        port: 3306,
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: 'edis',
        // It's bad but we don't have here any strong data in db
        synchronize: true,
        logging: true,
        entities: [
          AccessToken,
          Infractions,
          HelpChannel,
          MessageRoles,
          ReportModel,
          MessageRolesActions,
        ],
        charset: 'utf8mb4_unicode_ci',
        cache: {
          type: 'ioredis',
          options: {
            host: process.env.REDIS_URL,
            port: 6379,
          },
        },
      })
}
