// Copyright (c) 2021 Siberian, Inc. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import { MessageEmbed } from 'discord.js'
import { style, helpChannels } from '../../../lib/config'

/**
 * The message that will be posted when the user is claim the chnanel.
 *
 * @param claimedBy The userID that claimed this channel.
 */
export const claimedEmbed = (claimedBy: string): MessageEmbed =>
  new MessageEmbed()
    .setColor(style.colors.yellow)
    .setTitle('🔐 Claimed help channel')
    .setDescription(
      `This help channels is claimed by <@${claimedBy}>. You can claim own channel under the \`Help: Open\` category.`,
    )
    .setFooter(
      `Closes when you send /close or after ${helpChannels.dormantChannelTimeout} hours of inactivity`,
    )
