import { LunaworkClient, optional } from 'lunawork'
import * as fs from 'fs-extra'
import * as path from 'path'
import grayMatter = require('gray-matter')
import { Message, CommandInteraction, MessageEmbed } from 'discord.js'
import { extendedCommand } from '../../lib/extended-command'
import { ExtendedModule } from '../../lib/extended-module'
import { createSelfDestructMessage } from '../../lib/self-destruct-messages'

export class TagsModule extends ExtendedModule {
  // N.B.: Yep here maybe is prefer to use `process.env.RUNFILES`, but since
  // this path is different from the internal path, we choose to use
  // this strange magic path.
  private tagsFolder = path.join(__dirname, '../../resources/tags')

  public constructor(client: LunaworkClient) {
    super(client)
  }

  @extendedCommand({
    aliases: ['t', 'topic', 'r', 'resources'],
    slashCommand: 'both',
  })
  public async tags(msg: Message | CommandInteraction, @optional tag?: string) {
    if (!tag) {
      return await this.notFoundEmbed(msg, tag)
    }

    const tagData = await this.findTheTag(tag)

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

    embed.setDescription(parsed.content.split('\n').join(' '))

    return createSelfDestructMessage(msg, embed)
  }

  private async findTheTag(tag: string) {
    const tags = await this.listTheTags()

    if (tags.includes(`${tag}.md`)) {
      const content = await fs.readFile(
        path.join(this.tagsFolder, `${tag}.md`),
        { encoding: 'utf-8' },
      )

      return content
    }

    return false
  }

  private async listTheTags() {
    const tags = await fs.readdir(this.tagsFolder)
    return tags
  }

  private async notFoundEmbed(msg: Message | CommandInteraction, tag?: string) {
    const possibleTags = await this.listTheTags()

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
