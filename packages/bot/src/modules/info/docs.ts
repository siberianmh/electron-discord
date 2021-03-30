import { default as CookiecordClient } from 'cookiecord'
import { Message, MessageEmbed } from 'discord.js'
import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch'
import { ExtendedModule } from '../../lib/extended-module'
import { createSelfDestructMessage } from '../../lib/self-destruct-messages'
import { extendedCommand } from '../../lib/extended-command'
import { $TSFixMe } from '../../lib/types'

export class DocsModule extends ExtendedModule {
  private searchClient: SearchClient

  private newSearchClient: SearchClient

  private apiIndex: SearchIndex
  private guidesIndex: SearchIndex

  private newIndex: SearchIndex

  public constructor(client: CookiecordClient) {
    super(client)

    // I stole this from https://github.com/electron/algolia-indices/blob/master/demo.js#L31
    this.searchClient = algoliasearch(
      'L9LD9GHGQJ',
      '24e7e99910a15eb5d9d93531e5682370',
    )

    // I stole this from https://github.com/electron/electronjs.org/pull/5233
    this.newSearchClient = algoliasearch(
      'BH4D9OD16A',
      'c9e8f898b3b32afe40f0a96637e7ea85',
    )

    this.apiIndex = this.searchClient.initIndex('apis')
    this.guidesIndex = this.searchClient.initIndex('tutorials')

    this.newIndex = this.newSearchClient.initIndex('electronjs')
  }

  private NOT_FOUND_EMBED = (searchIndex: string) =>
    new MessageEmbed()
      .setTitle(`\`${searchIndex}\``)
      .setDescription('Unable to find result for searching string.')

  @extendedCommand({ aliases: ['d', 'doc'], single: true })
  public async docs(msg: Message, searchIndex: string) {
    const { hits } = await this.apiIndex.search(searchIndex)

    if (!hits.length) {
      return await createSelfDestructMessage(
        msg,
        this.NOT_FOUND_EMBED(searchIndex),
      )
    }

    // Let's take the first result for now
    // TODO: Add Types maybe 😒
    const result: $TSFixMe = hits[0]
    const embed = this.createEmbed(result)

    return await createSelfDestructMessage(msg, embed)
  }

  @extendedCommand({
    aliases: ['tutorials', 'tutorial', 'guide'],
    single: true,
  })
  public async guides(msg: Message, searchIndex: string) {
    const { hits } = await this.guidesIndex.search(searchIndex)

    if (!hits.length) {
      return await createSelfDestructMessage(
        msg,
        this.NOT_FOUND_EMBED(searchIndex),
      )
    }

    const result: $TSFixMe = hits[0]
    const embed = this.createEmbed(result)

    return await createSelfDestructMessage(msg, embed)
  }

  @extendedCommand({
    aliases: ['docs-new', 'dd', 'dn'],
    single: true,
  })
  public async docsd(msg: Message, searchIndex: string) {
    const { hits } = await this.newIndex.search(searchIndex)

    if (!hits.length) {
      return await createSelfDestructMessage(
        msg,
        this.NOT_FOUND_EMBED(searchIndex),
      )
    }

    const result: $TSFixMe = hits[0]

    console.log(result)
    const embed = this.createNewEmbed(result)

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

  private createNewEmbed(result: $TSFixMe) {
    // NOTE: This probably should be the latest level in hierarchy
    const title = result.anchor
    const description = result.content ?? 'Unable to find description'

    const embed = new MessageEmbed()
      .setTitle(title)
      .setURL(result.url)
      .setDescription(description)

    return embed
  }
}
