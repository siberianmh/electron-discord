// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { LunaworkClient, listener } from '@siberianmh/lunawork'
import { Message, MessageEmbed, TextChannel } from 'discord.js'
import { style } from '../../lib/config'
import { ExtendedModule } from '../../lib/extended-module'
import { selfDestructLegacy } from '../../lib/self-destruct-messages'
import { toBigIntLiteral } from '../../lib/to-bigint-literal'

const DSRegex =
  /https:\/\/discord(app)?.com\/channels\/([\d]{18})\/([\d]{18})\/([\d]{18})/gm

export class UnfurlModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  private UNFURL_EMBED = (msg: Message, origMessage: Message) =>
    new MessageEmbed()
      .setDescription(`${msg.content}\n**[[original message](${msg.url})]**`)
      .setAuthor(
        `${msg.author.username} in #${(msg.channel as TextChannel).name}`,
        msg.author.displayAvatarURL({ dynamic: true }) || undefined,
      )
      .setColor(style.colors.electronBlue)
      .setFooter(
        `quoted by ${origMessage.author.tag}`,
        origMessage.author.displayAvatarURL({ dynamic: true }) || undefined,
      )

  //#region Listeners
  @listener({ event: 'messageCreate' })
  public async maybeNeedUnfuring(msg: Message) {
    let parsed: Array<string> | null = null

    while ((parsed = DSRegex.exec(msg.content))) {
      const server = toBigIntLiteral(parsed[2])
      const channel = toBigIntLiteral(parsed[3])
      const message = toBigIntLiteral(parsed[4])

      if (msg.guild!.id === server) {
        const fetchGuildChannels = (await this.client.guilds.fetch(server))
          .channels

        const findChannel = fetchGuildChannels.valueOf().find(
          (c) =>
            c.id === channel &&
            // NOTE: To follow privacy, we don't unfurl private threads.
            (c.type === 'GUILD_TEXT' || c.type === 'GUILD_PUBLIC_THREAD'),
        ) as TextChannel

        if (!findChannel) {
          return
        }

        const fetchedMessage = (
          await findChannel.messages.fetch({
            around: message,
            limit: 1,
          })
        ).first()

        if (!fetchedMessage || fetchedMessage.content.length >= 4096) {
          return
        }

        await new Promise((resolve) => setTimeout(resolve, 2000))

        return selfDestructLegacy(msg, {
          embeds: [this.UNFURL_EMBED(fetchedMessage, msg)],
        })
      }
    }

    return
  }
  //#endregion
}
