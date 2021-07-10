import { LunaworkClient, slashCommand } from '@siberianmh/lunawork'
import { CommandInteraction, Message, MessageEmbed } from 'discord.js'
import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch'
import type { Hit } from '@algolia/client-search'
import { ExtendedModule } from '../../lib/extended-module'
import { createSelfDestructMessage } from '../../lib/self-destruct-messages'
import { extendedCommand } from '../../lib/extended-command'

interface IHitHierarchy {
  readonly lvl0: string | null
  readonly lvl1: string | null
  readonly lvl2: string | null
  readonly lvl3: string | null
  readonly lvl4: string | null
  readonly lvl5: string | null
  readonly lvl6: string | null
}

interface IHitResult {
  readonly anchor: string
  readonly content: string | null
  readonly hierarchy: IHitHierarchy
  readonly url: string
  readonly objectID: string
}

/**
 * This module is basically based on `algolia/docsearch` implementation,
 * the main difference it's that we don't have visual (user input)
 * implementation and always return the first hit.
 */
export class DocsModule extends ExtendedModule {
  private newSearchClient: SearchClient

  private newIndex: SearchIndex

  public constructor(client: LunaworkClient) {
    super(client)

    // I stole this from https://github.com/electron/electronjs.org/blob/master/views/layouts/main.hbs#L27
    this.newSearchClient = algoliasearch(
      'BH4D9OD16A',
      'c9e8f898b3b32afe40f0a96637e7ea85',
    )

    this.newIndex = this.newSearchClient.initIndex('electronjs')
  }

  private NOT_FOUND_EMBED = (searchIndex: string) =>
    new MessageEmbed()
      .setTitle(`\`${searchIndex}\``)
      .setDescription('Unable to find result for searching string.')

  @extendedCommand({
    aliases: ['d', 'doc', 'tutorials', 'tutorial', 'guide', 'guides'],
    single: true,
  })
  @slashCommand({
    description: 'Search in the docs',
    options: [
      {
        name: 'entry',
        description: 'Search entry',
        type: 'STRING',
        required: true,
      },
    ],
  })
  public async docs(msg: Message | CommandInteraction, searchIndex: string) {
    const { hits } = await this.newIndex.search<IHitResult>(searchIndex, {
      hitsPerPage: 5,
    })

    if (!hits.length) {
      return await createSelfDestructMessage(
        msg,
        this.NOT_FOUND_EMBED(searchIndex),
      )
    }

    const result = hits[0]

    const url = this.formatURL(result)
    const category = this.getHighlightedValue(result, 'lvl0')
    const subcategory = this.getHighlightedValue(result, 'lvl1') || category
    const displayTitle = this.compact([
      this.getHighlightedValue(result, 'lvl2') || subcategory,
      this.getHighlightedValue(result, 'lvl3'),
      this.getHighlightedValue(result, 'lvl4'),
      this.getHighlightedValue(result, 'lvl5'),
      this.getHighlightedValue(result, 'lvl6'),
    ]).join(' › ')
    const text = this.getSnippedValue(result, 'content')!

    const embed = this.createEmbed(displayTitle, url, text)

    return await createSelfDestructMessage(msg, embed)
  }

  private createEmbed(title: string, url: string, content?: string) {
    // NOTE: This probably should be the latest level in hierarchy
    const description = content ?? 'Unable to find description'

    const embed = new MessageEmbed()
      .setTitle(title)
      .setURL(url)
      .setDescription(description)

    return embed
  }

  private formatURL(hit: Hit<IHitResult>) {
    const { url, anchor } = hit
    if (url) {
      const containsAnchor = url.includes('#')
      if (containsAnchor) {
        return url
      } else if (anchor) {
        return `${hit.url}#${hit.anchor}`
      }
      return url
    } else if (anchor) {
      return `#${hit.anchor}`
    }

    return ''
  }

  private getHighlightedValue(
    object: Hit<IHitResult>,
    property: 'lvl0' | 'lvl1' | 'lvl2' | 'lvl3' | 'lvl4' | 'lvl5' | 'lvl6',
  ) {
    return object.hierarchy[property]
  }

  private getSnippedValue(object: Hit<IHitResult>, property: 'content') {
    return object[property]
  }

  private compact(array: Array<unknown>) {
    const results: Array<unknown> = []
    array.forEach((value) => {
      if (!value) {
        return
      }
      results.push(value)
    })
    return results
  }
}
