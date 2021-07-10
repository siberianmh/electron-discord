import { LunaworkClient, Stage, command } from '@siberianmh/lunawork'
import { Message, MessageEmbed } from 'discord.js'
import * as humanizeDuration from 'humanize-duration'

export class EtcModule extends Stage {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  //#region Commands
  @command()
  async ping(msg: Message): Promise<Message> {
    const bot_ping = +new Date() - +msg.createdAt
    const dsAPILatency = this.client.ws.ping
    const uptime = this.client.uptime
      ? humanizeDuration(this.client.uptime)
      : 'He dead'

    const embed = new MessageEmbed()
      .setTitle('Really, why?')
      .addField('Command Processing Time', `${bot_ping}ms`)
      .addField('Uptime', uptime)
      .addField('Discord API Latency', `${dsAPILatency}ms`)
      .setTimestamp()

    return await msg.channel.send({ embeds: [embed] })
  }
  //#endregion
}
