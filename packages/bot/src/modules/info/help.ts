import { LunaworkClient, guildsOnly, optional } from 'lunawork'
import { Message, MessageEmbed } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { extendedCommand } from '../../lib/extended-command'

export class HelpMessageModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  @extendedCommand({
    aliases: ['help', 'commands', 'h'],
    inhibitors: [guildsOnly],
    description: "Sends what you're looking right now",
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
          '`docs` ► Show the documentation entry for specific search result.\n`resources` ► Get a list of useful resources to start with Electron',
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
