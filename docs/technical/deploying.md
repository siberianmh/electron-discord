# Deploying the Bot

## Heroku

### Heroku Configuration

You still can use the [Heroku]() to deploy the bot, for them use the
`heroku.yml` file which builds the Docker image and runs them on the Heroku.

The following environment variables should be set:

- `DISCORD_TOKEN`: Discord bot token (see bot configuration to get him)
- `MYSQL_USERNAME`: Username used for connecting to database.
- `MYSQL_PASSWORD`: Password used for connecting to database.
- `MYSQL_HOST`: Host used for connecting to database
- `MYSQL_DATABASE`: Database used for storing the data (optional, by default use
  `edis`)
- `REDIS_URL`: The connection string URL for Redis.
