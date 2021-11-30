// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import {
  applicationCommand,
  LunaworkClient,
  ApplicationCommandOptionType,
  listener,
  button,
} from '@siberianmh/lunawork'
import {
  Message,
  MessageEmbed,
  MessageReaction,
  User,
  CommandInteraction,
  Permissions,
  ButtonInteraction,
  GuildMemberRoleManager,
} from 'discord.js'
import * as humanizeDuration from 'humanize-duration'
import { ExtendedModule } from '../../lib/extended-module'
import { guild } from '../../lib/config'
import { isTrustedMember } from '../../lib/inhibitors'
import { redis, selfDestructMessage } from '../../lib/redis'
import { toBigIntLiteral } from '../../lib/to-bigint-literal'

export class EtcModule extends ExtendedModule {
  public constructor(client: LunaworkClient) {
    super(client)
  }

  //#region Commands
  @applicationCommand({ description: 'Check if we still alive' })
  async ping(msg: CommandInteraction): Promise<void> {
    const bot_ping = +new Date() - +msg.createdAt
    const dsAPILatency = this.client.ws.ping
    const uptime = this.client.uptime
      ? humanizeDuration(this.client.uptime)
      : 'He dead'

    const embed = new MessageEmbed()
      .setTitle('Satellite Found')
      .addField('Command Processing Time', `${bot_ping}ms`)
      .addField('Uptime', uptime)
      .addField('Discord API Latency', `${dsAPILatency}ms`)
      .setTimestamp()

    return await msg.reply({ embeds: [embed] })
  }

  @applicationCommand({
    name: 'fiddle',
    description: 'Create a user friendly Fiddle link',
    options: [
      {
        name: 'gist_id',
        description: 'The id of the gist',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
    // Because it's test and i don't want to peoples to use this
    inhibitors: [isTrustedMember],
  })
  public async fiddle(
    msg: CommandInteraction,
    { gist_id }: { gist_id: string },
  ): Promise<void> {
    if (gist_id.startsWith('https://' || 'http://')) {
      return msg.reply({
        content: 'The id should be in format number',
        ephemeral: true,
      })
    }

    // Possible be to `gist/username/hash` and `gist/hash`
    // Documented on https://github.com/electron/fiddle/blob/master/src/main/protocol.ts#L29
    const fiddleURL = `<electron-fiddle://gist/${gist_id}>`

    const message = `Electron Fiddle lets you create and play with small Electron experiments.
You can launch Electron Fiddle with the provided Gist using this URL: ${fiddleURL}

[Learn More about Fiddle](https://electronjs.org/fiddle)`

    const embed = new MessageEmbed()
      .setTitle('Launch in Fiddle')
      .setDescription(message)
      .setThumbnail(
        'https://raw.githubusercontent.com/electron/fiddle/master/assets/icons/fiddle.png',
      )

    return msg.reply({ embeds: [embed] })
  }
  //#endregion

  //#region Listeners
  @listener({ event: 'messageCreate' })
  public async onNewRelease(msg: Message): Promise<Message | undefined> {
    if (msg.channel.id !== guild.channels.releases) {
      return
    }

    return await msg.crosspost()
  }

  @button({ customID: 'trashIcon' })
  public async bucketButtonClicked(msg: ButtonInteraction) {
    const key = await redis.get(selfDestructMessage(msg.message.id))

    if (!key) {
      return
    }

    const typedMemberRole = msg.member?.roles as GuildMemberRoleManager
    if (
      msg.user.id === key ||
      typedMemberRole.cache.has(
        toBigIntLiteral(Permissions.FLAGS.MANAGE_MESSAGES),
      ) ||
      typedMemberRole.cache.has(guild.roles.maintainer)
    ) {
      // @ts-expect-error
      return await msg.message.delete()
    }

    return
  }

  @listener({ event: 'messageReactionAdd' })
  public async bucketEmojiClicked(
    reaction: MessageReaction,
    user: User,
  ): Promise<Message | undefined> {
    if (user.id === this.client.user?.id) {
      return
    }

    if (reaction.partial) {
      await reaction.fetch()
    }

    if (reaction.message.channel.id === guild.channels.roles) {
      // Don't handle the roles channel
      return
    }

    const key = await redis.get(selfDestructMessage(reaction.message.id))

    if (!key) {
      return
    }

    const member = await reaction.message.guild?.members.fetch({
      user,
    })

    if (
      user.id === key ||
      member?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) ||
      member?.roles.cache.has(guild.roles.maintainer)
    ) {
      return await reaction.message.delete()
    }

    return
  }
  //#endregion
}
