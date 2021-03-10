import {
  default as CookiecordClient,
  CommonInhibitors,
  optional,
} from 'cookiecord'
import { Message, MessageEmbed } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { extendedCommand } from '../../lib/extended-command'

export class HelpMessageModule extends ExtendedModule {
  public constructor(client: CookiecordClient) {
    super(client)
  }

  @extendedCommand({
    aliases: ['help', 'commands', 'h'],
    inhibitors: [CommonInhibitors.guildsOnly],
    description: 'Sends what you&quotre looking right now',
  })
  async help(msg: Message, @optional cmdTrigger?: string) {
    if (!msg.guild) {
      return
    }

    if (!cmdTrigger) {
      const embed = new MessageEmbed()
        .setAuthor(
          msg.guild.name,
          msg.guild.iconURL({ dynamic: true }) || undefined,
        )
        .setTitle('Bot Usage')
        .setDescription(
          `Hello <@${msg.author.id}>! Here is a list of all commands in me. To get detailed description on any specific command, do \`help <command>\``,
        )
        .addField(
          '**Misc Commands**',
          '`ping` ► View the latency of the bot\n`source` ► Drop links to source codes of our bots.\n`server-info` ► Give you some information about Electron server',
        )
        .addField(
          '**Documentation** (Experimental)',
          '`docs` ► Show the API documentation entry for specific search result.\n`guide` ► Show the Guide documentation entry for specific saerch result.',
        )
        .addField(
          '**Experimental Commands**',
          '`tags` ► Get a list of useful tags and resources to start with Electron',
        )
        .addField(
          '**Help Channels Commands:**',
          '`close` ► Close a __ongoing__ help channel opened by you!',
        )
        .setFooter(
          this.client.user?.username,
          this.client.user?.displayAvatarURL(),
        )
        .setTimestamp()

      return await msg.channel.send({ embed })
    } else {
      const cmd = this.client.commandManager.getByTrigger(cmdTrigger)

      if (!cmd) {
        return msg.channel.send(`:warning: Command \`${cmdTrigger}\` not found`)
      }

      return await msg.channel.send(
        `Usage: \`${cmd.triggers.join('|')}${
          cmd.args.length ? ' ' : ''
        }${cmd.args.map((arg) =>
          arg.optional ? `[${arg.type.name}]` : `<${arg.type.name}>`,
        )}\`${cmd.description ? `\nDescription: *${cmd.description}*` : ''}`,
      )
    }
  }
}
