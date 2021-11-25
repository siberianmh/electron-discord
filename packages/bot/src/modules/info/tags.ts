// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import {
  LunaworkClient,
  applicationCommand,
  ApplicationCommandOptionType,
} from '@siberianmh/lunawork'
import * as fs from 'fs-extra'
import * as path from 'path'
import grayMatter = require('gray-matter')
import { CommandInteraction, MessageEmbed } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { createSelfDestructMessage } from '../../lib/self-destruct-messages'

export class TagsModule extends ExtendedModule {
  private tagsFolder = path.join(__dirname, '../../../resources/tags')
  private faqFolder = path.join(__dirname, '../../../resources/faq')

  public constructor(client: LunaworkClient) {
    super(client)
  }

  @applicationCommand({
    description: 'Get some useful information',
    options: [
      {
        name: 'resource',
        description: 'A world which you want to see',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: 'Electron',
            value: 'electron',
          },
          {
            name: 'Fiddle',
            value: 'fiddle',
          },
        ],
      },
    ],
  })
  public async tags(
    msg: CommandInteraction,
    { resource }: { resource: string },
  ) {
    const tagData = await this.findItem(this.tagsFolder, resource)

    if (!tagData) {
      return await msg.reply({ content: 'Wrong way Mario' })
    }

    const parsed = grayMatter(tagData)

    const embed = new MessageEmbed()

    if (parsed.data.title) {
      embed.setTitle(parsed.data.title)
    }

    if (parsed.data.thumbnail) {
      embed.setThumbnail(parsed.data.thumbnail)
    }

    embed.setDescription(parsed.content.trim())

    return createSelfDestructMessage(msg, { embeds: [embed] })
  }

  @applicationCommand({
    description: 'Get an answer for frequet question',
    options: [
      {
        name: 'entry',
        description: 'A FAQ entry to see',
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: '`Uncaught ReferenceE rror: require is not defined` even if `nodeIntegration` is set to `true`',
            value: 'require-in-renderer',
          },
          {
            name: "Why can't I log into Google in my Electron app?",
            value: 'google-login',
          },
          {
            name: "Why isn't the relative path in my app code working?",
            value: 'relative-path',
          },
          {
            name: 'How do I use Express with Electron?',
            value: 'express-und-electron',
          },
        ],
      },
    ],
  })
  public async faq(
    msg: CommandInteraction,
    { entry }: { entry: string },
  ): Promise<void> {
    const itemData = await this.findItem(this.faqFolder, entry)

    if (!itemData) {
      // It's probably not possible?
      return
    }

    const parsed = grayMatter(itemData)
    const embed = new MessageEmbed()

    if (parsed.data.title) {
      embed.setTitle(parsed.data.title)
    }

    if (parsed.data.thumbnail) {
      embed.setThumbnail(parsed.data.thumbnail)
    }

    const cleanContent = parsed.content
      .replace('<!-- prettier-ignore-start -->', '')
      .replace('<!-- prettier-ignore-end -->', '')
      .trim()

    embed.setDescription(cleanContent)

    return createSelfDestructMessage(msg, { embeds: [embed] })
  }

  private async findItem(basePath: string, item: string) {
    const items = await this.listItems(basePath)

    if (items.includes(`${item}.md`)) {
      const content = await fs.readFile(path.join(basePath, `${item}.md`), {
        encoding: 'utf-8',
      })

      return content
    }

    return false
  }

  private async listItems(basePath: string) {
    const items = await fs.readdir(basePath)
    return items
  }
}
