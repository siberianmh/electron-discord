// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { LunaworkClient, applicationCommand } from '@siberianmh/lunawork'
import {
  CommandInteraction,
  GuildMemberRoleManager,
  MessageEmbed,
} from 'discord.js'
import { ExtendedModule } from '../../lib/extended-module'
import { github } from '../../lib/github'
import { $TSFixMe } from '../../lib/types'
import { guild } from '../../lib/config'

export class HacktoberfestStage extends ExtendedModule {
  private currentYear = new Date().getFullYear().toString()
  private reviewDays = 14
  private treeTShirdPRs = 4

  public constructor(client: LunaworkClient) {
    super(client)
  }

  @applicationCommand({
    name: 'hacktoberfest',
    description: 'Take the information related to Hacktoberfest',
    options: [
      {
        type: 1,
        name: 'subscribe',
        description: 'Subscribe/unsubscribe yourself to Hactoberfest updates',
      },
      {
        type: 1,
        name: 'stats',
        description: 'Get the stats for specific GitHub account',
        options: [
          {
            type: 3,
            name: 'username',
            description: 'The GitHub username',
            required: true,
          },
        ],
      },
      {
        type: 1,
        name: 'issue',
        description: 'Get the random Hacktoberfest issue',
      },
    ],
    disabled: true,
  })
  public async hacktoberfest(
    msg: CommandInteraction,
    subCommand: string,
    value: string,
  ) {
    switch (subCommand) {
      case 'subscribe':
        return this.subscribeToUpdates(msg)
      case 'stats':
        return this.getStats(msg, value)
      case 'issue':
        return this.getIssue(msg)
    }

    return msg.reply({
      content:
        "Well something is really doesn't work as you want, and this is normal, would to fix this, you can join to our team at https://siberianmh.com/readme",
    })
  }

  private async subscribeToUpdates(msg: CommandInteraction) {
    const memberRoleManager = msg.member!.roles as GuildMemberRoleManager
    const hasRole = memberRoleManager.cache.has(guild.roles.hacktoberfest)

    if (hasRole) {
      await memberRoleManager.remove(guild.roles.hacktoberfest)

      return msg.reply({
        content: 'Successfully unsubscribed from Hacktoberfest 2021 updates',
      })
    } else {
      await memberRoleManager.add(guild.roles.hacktoberfest)

      return msg.reply({
        content: 'Successfully subscribed for Hacktoberfest 2021 updates',
      })
    }
  }

  private async getStats(msg: CommandInteraction, githubUsername: string) {
    await msg.deferReply()
    const prs = await this.getHacktoberfestPRs(githubUsername)

    if (!prs.length) {
      return msg.editReply({
        content: `No valid Hacktoberfest PRs fround for '${githubUsername}'`,
      })
    }

    const embed = await this.buildStatsEmbed(prs, githubUsername)

    return msg.editReply({
      embeds: [embed],
    })
  }

  private async getIssue(msg: CommandInteraction) {
    await msg.deferReply()

    const queryParams =
      '+is:issue+label:hacktoberfest+language:javascript+language:typescript+state:open'

    const { data: issues } = await github.search.issuesAndPullRequests({
      per_page: 100,
      q: queryParams,
    })

    if (!issues.items.length) {
      return msg.editReply({
        content: '🤷‍♂️ Probably something goes wrong',
      })
    }

    const issue = issues.items[Math.floor(Math.random() * issues.items.length)]

    if (!issue) {
      return msg.editReply({
        content: '🤷‍♂️ Probably something goes wrong',
      })
    }

    const body = issue.body
      ? issue.body.length >= 500
        ? issue.body.substring(-500)
        : issue.body
      : 'No description provided'

    const embed = new MessageEmbed()
      .setTitle(issue.title)
      .setDescription(body)
      .setURL(issue.html_url)
      .setFooter(issue.html_url)

    return msg.editReply({
      embeds: [embed],
    })
  }

  private async getHacktoberfestPRs(
    githubUsername: string,
  ): Promise<Array<$TSFixMe>> {
    const queryParams = `+type:pr+is:public+author:${githubUsername}+-is:draft+created:${this.currentYear}-09-30T10:00Z..${this.currentYear}-11-01T12:00Z`

    const { data } = await github.search.issuesAndPullRequests({
      per_page: 300,
      q: queryParams,
    })

    if (data.total_count === 0) {
      return []
    }

    const output: Array<$TSFixMe> = []
    for (const item of data.items) {
      const repoName = item.repository_url.split('/').slice(-2).join('/')
      const [owner, repo] = repoName.split('/')
      const entry = {
        repo_url: `https://github.com/${repoName}`,
        repo_shortname: repoName,
        created_at: item.created_at,
        number: item.number,
      }

      item.labels.map((label) => {
        if (label.name === 'invalid' || label.name === 'spam') {
          return
        }

        if (label.name === 'hacktoberfest-accepted') {
          output.push(entry)
        }
      })

      const { data } = await github.repos.getAllTopics({
        owner,
        repo,
        mediaType: {
          previews: ['mercy'],
        },
      })

      if (!data.names.length) {
        continue
      }

      if (data.names.includes('hacktoberfest')) {
        output.push(entry)
      }
    }

    return output
  }

  private async buildStatsEmbed(prs: Array<$TSFixMe>, githubUsername: string) {
    const { inReview, accepted } = this.categorizePulls(prs)

    const total = inReview.length + accepted.length
    let treeTShirt = ''
    if (total >= this.treeTShirdPRs) {
      treeTShirt = `**${githubUsername}** is eligible for a tree or a T-Shirt`
    } else if (total === this.treeTShirdPRs - 1) {
      treeTShirt = `**${githubUsername}** is 1 PR away from a tree or a T-Shirt`
    } else {
      treeTShirt = `**${githubUsername}** is ${
        this.treeTShirdPRs - total
      } PR away from a tree or a T-Shirt`
    }

    const embed = new MessageEmbed()
      .setTitle(`${githubUsername}'s Hacktoberfest`)
      .setDescription(
        `${githubUsername} has made ${total} valid contribution${
          total > 1 ? 's' : ''
        } in October\n${treeTShirt}`,
      )

    const acceptedString = this.buildPRsEmbed(accepted)
    const inReviewString = this.buildPRsEmbed(inReview)

    embed.addField('🕝 In Review', inReviewString)
    embed.addField('💖 Accepted', acceptedString)

    embed.setThumbnail(`https://github.com/${githubUsername}.png`)
    embed.setAuthor(
      'Hacktoberfest',
      'https://avatars1.githubusercontent.com/u/35706162?s=200&v=4',
      'https://hacktoberfest.digitalocean.com',
    )

    return embed
  }

  private buildPRsEmbed(prs: Array<$TSFixMe>) {
    const stringList = []

    for (const pr of prs) {
      stringList.push(
        `[${pr.repo_shortname}#${pr.number}](${pr.repo_url}/pull/${pr.number})`,
      )
    }

    return stringList.length >= 1 ? stringList.join('\n') : 'None'
  }

  private categorizePulls(prs: Array<$TSFixMe>) {
    const now = new Date()
    const inReview = []
    const accepted = []
    for (const pr of prs) {
      const prCreate = new Date(pr.created_at)
      const diffDays = Math.ceil(
        Math.abs(now.getTime() - prCreate.getTime()) / (1000 * 60 * 60 * 24),
      )
      if (diffDays <= this.reviewDays) {
        inReview.push(pr)
      } else {
        // TODO: add validation
        accepted.push(pr)
      }
    }

    return { inReview, accepted }
  }
}
