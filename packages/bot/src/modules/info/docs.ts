// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import {
  LunaworkClient,
  applicationCommand,
  ApplicationCommandOptionType,
} from '@siberianmh/lunawork'
import {
  AutocompleteInteraction,
  CommandInteraction,
  MessageButton,
  MessageEmbed,
} from 'discord.js'
import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch'
import type { Hit } from '@algolia/client-search'
import { ExtendedModule } from '../../lib/extended-module'
import { createSelfDestructMessage } from '../../lib/self-destruct-messages'

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

  @applicationCommand({
    name: 'docs',
    description: 'Search in the docs',
    options: [
      {
        name: 'entry',
        description: 'Search entry',
        type: ApplicationCommandOptionType.String,
        required: true,
        autocomplete: true,
      },
    ],
  })
  public async docs(msg: CommandInteraction, { entry }: { entry: string }) {
    let result: IHitResult | null = null
    // Probably there is a more perfect solution to this, but since I'm lazy let's leave this for now.
    // In the perfect world, we should check if the provided string is `ObjectId`
    // but I'm not found the specification about these magic id.
    try {
      result = await this.newIndex.getObject<IHitResult>(entry)
    } catch {
      const { hits } = await this.newIndex.search<IHitResult>(entry, {
        hitsPerPage: 5,
        facetFilters: ['language:en'],
      })

      if (!hits.length) {
        return await createSelfDestructMessage(msg, {
          embeds: [this.NOT_FOUND_EMBED(entry)],
        })
      }

      result = hits[0]
    }

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

    const linkButton = new MessageButton()
      .setStyle('LINK')
      .setURL(url)
      .setLabel('Open in a browser')

    return await createSelfDestructMessage(msg, {
      embeds: [embed],
      components: [linkButton],
    })
  }

  private createEmbed(title: string, url: string, _content?: string) {
    // NOTE: This probably should be the latest level in hierarchy
    const embed = new MessageEmbed().setTitle(title).setURL(url)

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

  public async ondocsAutocomplete(
    msg: AutocompleteInteraction,
    { entry }: { entry: string },
  ): Promise<void> {
    const { hits } = await this.newIndex.search<IHitResult>(entry, {
      hitsPerPage: 25,
      facetFilters: ['language:en'],
    })

    if (!hits.length) {
      return msg.respond([])
    }

    const result: Array<{ name: string; value: string }> = []

    for (const hit of hits) {
      const category = this.getHighlightedValue(hit, 'lvl0')
      const subcategory = this.getHighlightedValue(hit, 'lvl1') || category
      const displayTitle = this.compact([
        this.getHighlightedValue(hit, 'lvl2') || subcategory,
        this.getHighlightedValue(hit, 'lvl3'),
        this.getHighlightedValue(hit, 'lvl4'),
        this.getHighlightedValue(hit, 'lvl5'),
        this.getHighlightedValue(hit, 'lvl6'),
      ]).join(' › ')

      result.push({ name: displayTitle, value: hit.objectID })
    }

    return msg.respond(result)
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
