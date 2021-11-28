# Creating a new Stage

Stage (or Module) is a class with a set of functions. For example, if we want to
add a new
[application command](https://discord.com/developers/docs/interactions/application-commands),
e.g. `/party `username`:<username> `type`:<type>`, we need to use
[`@applicationCommand`](https://docs.siberianmh.com/lunawork/decorators/application-command)
decorator inside the Stage.

```typescript
import { LunaworkClient, applicationCommand } from '@siberianmh/lunawork'
import { CommandInteraction } from 'discord.js'
// In Electron Discord these special `ExtendedModule` class which
// extend default `Stage` class from `@siberianmh/lunawork` with
// some additional properties.
import { ExtendedModule } from '../../lib/extended-module'
export class GreeaterModule extends LunaworkClient {
  public constructor(client: LunaworkClient) {
    super(client)
  }
  // See https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure
  // for more info how to provide values to this decorator. You can use any helper that produces object that Discord API is can process.
  // This command is also be automatically register as part of Lunawork lifecycle to the guild if it is development environment
  // or globally if this is production.
  @applicationCommand({
    name: 'party',
    description: 'Starts the party',
    options: [
      {
        type: 3,
        name: 'username',
        description: 'The username which should get the party',
        required: true,
      },
      {
        type: 3,
        name: 'type',
        description: 'The type of party',
        required: true,
      },
    ],
  })
  public async party(
    msg: CommandInteraction,
    username: string,
    type: string,
  ): Promise<void> {
    const response = `Hello ${username}, we will provide a ${type} party very soon`
    return msg.reply({
      content: response,
      // Should the message only be sent to the user, and not to the everyone
      // in the channel.
      ephemeral: true,
    })
  }
}
```

In the above example, we create the `/party <args>` command which accepts a
`username` and `type` as strings. To make this module available in the Discord
interface we will need to import and register this stage in the
[index.ts](https://github.com/siberianmh/electron-discord/blob/1ea83771c18c44218a0a5b374feab0933550d5cb/packages/bot/src/index.ts)
at the
[stages](https://github.com/siberianmh/electron-discord/blob/main/packages/bot/src/index.ts#L40)
constant. After, this command is will be registered automatically, and be
available in the Discord interface after a short amount of time.

A `Stage` can have an unlimited number of functions, for all available lunawork
decorators see the
[related docs](https://docs.siberianmh.com/lunawork/decorators/application-command),
any of the provided decorators will be automatically registered and be
available.

For example, if we want to listen when some
[role is created](https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-roleCreate)
we need to use
[`@listener`](https://docs.siberianmh.com/lunawork/decorators/listener)
decorator, where the parameters are provided by WebSocket. Let's take the above
code and modify it to include the `@listener`:

```typescript
// ...imports
import { /* ... */, listener } from '@siberianmh/lunawork'
import { Role } from 'discord.js'
export class GreeaterModule extends LunaworkClient {
  public constructor(client: LunaworkClient) {
    super(client)
  }
  // ...party cmd
  // Listen when a new role is created and notify this squad
  public async onRoleCreate(role: Role): Promise<void> {
    const generalChannel = await this.client.channels.fetch('<id>')
    await generalChannel.send({
      content: `:wave: <@&${role.id}>, we hope you enjoy the ride.`
    })
    return
  }
}
```
