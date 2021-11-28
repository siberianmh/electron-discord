# Deploying the Bot

You need to have a MySQL server version of at least 8, and Redis. Ways of using
these wants can be different, from bare-metal, cloud providers to some SaaS.

## Heroku

> NOTE: We haven't tested this, we simply read the docs and expect this should
> work.

### Heroku Configuration

You still can use the [Heroku](https://www.heroku.com/) to deploy the bot, for
him use the `heroku.yml` file which builds the Docker image and runs them on the
Heroku.

The following environment variables should be set:

- `DISCORD_TOKEN`: Discord bot token (see bot configuration to get him)
- `MYSQL_USERNAME`: Username used for connecting to database.
- `MYSQL_PASSWORD`: Password used for connecting to database.
- `MYSQL_HOST`: Host used for connecting to database
- `MYSQL_DATABASE`: Database used for storing the data (optional, by default use
  `edis`)
- `REDIS_URL`: The connection string URL for Redis.

## Kubernetes

To deploy the bot into the Kubernetes (or different possible orchestration
systems) or using Docker, you need to create the secrets described in the
[related section](../../kubernetes/secrets/README.md), and deploy the manifest
to the cluster using:

```sh
kubectl apply -f https://raw.githubusercontent.com/siberianmh/electron-discord/main/kubernetes/bot/deployment.yaml
```
