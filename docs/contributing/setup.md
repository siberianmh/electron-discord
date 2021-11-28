# Development Environment Setup

## Requirements

You will need to have installed these tools:

- Node.js v16 or later
- Yarn v1 (legacy, or classic)
- Redis
- MySQL v8

## Verifying

Verify that you install everything run, the output should look similar to below:

```sh
$ node -v
v16.13.0

$ yarn -v
1.22.5
```

## Setup a Test Server

Before you can start with doing magic, you need to prepare the server on which
you will do magic. To make this process faster we had prepared a minimized
version of the Electron Discord server in your pocket:
https://discord.new/C8krpeq39M24.

This template contains a small number of required channels that are used in the
configuration.

## Setup a Bot Account

You need to create the Bot account, you can do this following these steps:

1. Go to the
   [Discord Developer Portal](https://discord.com/developers/applications).
1. Click on the `New Application`, button, enter the bot name, and click
   `Create`.
1. On the application page, go to the `Bot` section, and click `Add bot`,, and
   confirm `Yes, do it!`.
1. Change the setting of `Public Bot` to off, and copy the `Bot Token`, and save
   them in the `.env` file in the root project directory. Under
   `Privileged Gateway Intents` enable all\*
1. In the `General Information` section, take the **Client ID**, and invite the
   bot using the following URL:

```http
https://discordapp.com/api/oauth2/authorize?client_id=<CLIENT_ID>&permissions=8&scope=bot
```

\* - Either way, we don't require them all, but for stable bot work, it's
preferred to enable them all.

## Configuring the Bot

To make the bot accept your values instead of defaulting ones you need to create
a config file with the name `config-that-just-used-for.dev.ts` near the base
[`config.ts`](https://github.com/siberianmh/electron-discord/tree/main/packages/bot/src/lib/config)
file.

## And, it's time to run

Before you run you need to have MySQL with an already created `edis_dev`
database, default connect credentials are `root`, `root`, and enabled Redis. And
after that can run the bot using the `yarn dev` command in the root directory.

And 🎉, you can now do the magic.
