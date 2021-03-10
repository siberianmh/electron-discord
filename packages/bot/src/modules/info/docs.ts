import { default as CookiecordClient } from 'cookiecord'
import { Message, MessageEmbed } from 'discord.js'
import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch'
import { ExtendedModule } from '../../lib/extended-module'
import { createSelfDestructMessage } from '../../lib/self-destruct-messages'
import { extendedCommand } from '../../lib/extended-command'
import { $TSFixMe } from '../../lib/types'

export class DocsModule extends ExtendedModule {
  private searchClient: SearchClient
  private apiIndex: SearchIndex
  private guidesIndex: SearchIndex

  public constructor(client: CookiecordClient) {
    super(client)

    // I stole this from https://github.com/electron/algolia-indices/blob/master/demo.js#L31
    this.searchClient = algoliasearch(
      'L9LD9GHGQJ',
      '24e7e99910a15eb5d9d93531e5682370',
    )

    this.apiIndex = this.searchClient.initIndex('apis')
    this.guidesIndex = this.searchClient.initIndex('tutorials')
  }

  private NOT_FOUND_EMBED = (searchIndex: string) =>
    new MessageEmbed()
      .setTitle(`\`${searchIndex}\``)
      .setDescription('Unable to find result for searching string.')

  @extendedCommand({ aliases: ['d', 'doc'], single: true })
  public async docs(msg: Message, searchIndex: string) {
    const { hits } = await this.apiIndex.search(searchIndex)

    if (!hits.length) {
      return msg.channel.send({ embed: this.NOT_FOUND_EMBED(searchIndex) })
    }

    // Let's take the first result for now
    // TODO: Add Types maybe 😒
    const result: $TSFixMe = hits[0]
    const embed = this.createEmbed(result)

    return createSelfDestructMessage(msg, embed)
  }

  @extendedCommand({
    aliases: ['tutorials', 'tutorial', 'guide'],
    single: true,
  })
  public async guides(msg: Message, searchIndex: string) {
    const { hits } = await this.guidesIndex.search(searchIndex)

    if (!hits.length) {
      return msg.channel.send({ embed: this.NOT_FOUND_EMBED(searchIndex) })
    }

    const result: $TSFixMe = hits[0]
    const embed = this.createEmbed(result)

    return createSelfDestructMessage(msg, embed)
  }

  private createEmbed(result: $TSFixMe) {
    const title = result.fullSignature ?? result.title
    let description = result.description ?? result.body

    if (description.length >= 2048) {
      description =
        result.tldr ?? 'Unable to show preview because the body is too long.'
    }

    const embed = new MessageEmbed()
      .setTitle(title)
      .setURL(result.url)
      .setDescription(description)

    return embed
  }
}
