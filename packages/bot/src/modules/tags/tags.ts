import { LunaworkClient, applicationCommand } from '@siberianmh/lunawork'
import * as fs from 'fs-extra'
import * as path from 'path'
import grayMatter = require('gray-matter')
import { Message, CommandInteraction, MessageEmbed } from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { createSelfDestructMessage } from '../../lib/self-destruct-messages'

export class TagsModule extends ExtendedModule {
  // N.B.: Yep here maybe is prefer to use `process.env.RUNFILES`, but since
  // this path is different from the internal path, we choose to use
  // this strange magic path.
  private tagsFolder = path.join(__dirname, '../../resources/tags')
  private faqFolder = path.join(__dirname, '../../resources/faq')

  public constructor(client: LunaworkClient) {
    super(client)
  }

  @applicationCommand({
    description: 'Get some useful information',
    options: [
      {
        name: 'resource',
        description: 'A world which you want to see',
        type: 'STRING',
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
  public async tags(msg: Message | CommandInteraction, tag: string) {
    if (!tag) {
      return await this.notFoundEmbed(msg, tag)
    }

    const tagData = await this.findItem(this.tagsFolder, tag)

    if (!tagData) {
      return await this.notFoundEmbed(msg, tag)
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

    return createSelfDestructMessage(msg, embed)
  }

  @applicationCommand({
    description: 'Get an answer for frequet question',
    options: [
      {
        name: 'entry',
        description: 'A FAQ entry to see',
        type: 'STRING',
        required: true,
        choices: [
          {
            name: '`Uncaught ReferenceError: require is not defined` even if `nodeIntegration` is set to `true`',
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
  public async faq(msg: CommandInteraction, entry: 'google-login') {
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

    return createSelfDestructMessage(msg, embed)
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

  private async notFoundEmbed(msg: Message | CommandInteraction, tag?: string) {
    const possibleTags = await this.listItems(this.tagsFolder)

    const embed = new MessageEmbed()
      .setTitle(`Unable to find tag ${tag ?? ''}. List of all available tags:`)
      .setDescription(
        possibleTags
          .map((tag) => tag.split('.').slice(0, -1).join('.'))
          .join(', '),
      )

    return createSelfDestructMessage(msg, embed)
  }
}
